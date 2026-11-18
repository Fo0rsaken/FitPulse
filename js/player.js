import { getExerciseById, estimateWorkoutStats } from './data.js';
import { soundEngine } from './audio.js';
import {
  addHistoryEntry,
  calculateStreak,
  getLastPerformance,
  getSettings,
  saveSettings
} from './storage.js';
import { computeMuscleScores, renderBodyMapSVG, renderCornerBodyBadge } from './bodymap.js';

const RING_RADIUS = 96;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function buildTimeline(workout) {
  const steps = [];
  const rounds = Math.max(1, Number(workout.rounds) || 1);
  const prepSec = Number(workout.prepSec) ?? 5;

  if (prepSec > 0 && workout.items.length > 0 && workout.items[0].mode !== 'reps') {
    steps.push({
      phase: 'prep',
      phaseLabel: 'Подготовка',
      exerciseId: workout.items[0].exerciseId,
      mode: 'time',
      durationSec: prepSec,
      round: 1,
      totalRounds: rounds
    });
  }

  for (let r = 1; r <= rounds; r++) {
    workout.items.forEach((item, idx) => {
      if (item.mode === 'reps') {
        const sets = Math.max(1, Number(item.sets) || 3);
        const reps = Math.max(1, Number(item.reps) || 10);
        const weightKg = Number(item.weightKg) || 0;
        const restSec = Number(item.restSec) ?? 60;

        for (let s = 1; s <= sets; s++) {
          steps.push({
            phase: 'work',
            phaseLabel: `Подход ${s} из ${sets}`,
            exerciseId: item.exerciseId,
            mode: 'reps',
            setNumber: s,
            totalSets: sets,
            reps,
            weightKg,
            round: r,
            totalRounds: rounds
          });
          const isLastItemLastSet = r === rounds && idx === workout.items.length - 1 && s === sets;
          if (!isLastItemLastSet && restSec > 0) {
            const nextExId =
              s < sets
                ? item.exerciseId
                : workout.items[idx + 1]?.exerciseId || workout.items[0].exerciseId;
            steps.push({
              phase: 'rest',
              phaseLabel: 'Отдых между подходами',
              exerciseId: nextExId,
              mode: 'time',
              durationSec: restSec,
              round: r,
              totalRounds: rounds
            });
          }
        }
      } else {
        const durationSec = Math.max(5, Number(item.durationSec) || 30);
        const restSec = Number(item.restSec) || 0;
        steps.push({
          phase: 'work',
          phaseLabel: 'Работа',
          exerciseId: item.exerciseId,
          mode: 'time',
          durationSec,
          round: r,
          totalRounds: rounds
        });

        const isLastItemOfRound = idx === workout.items.length - 1;
        const isLastRound = r === rounds;

        if (!isLastItemOfRound && restSec > 0) {
          steps.push({
            phase: 'rest',
            phaseLabel: 'Отдых',
            exerciseId: workout.items[idx + 1].exerciseId,
            mode: 'time',
            durationSec: restSec,
            round: r,
            totalRounds: rounds
          });
        } else if (isLastItemOfRound && !isLastRound) {
          const roundRest = Number(workout.roundRestSec) || restSec;
          if (roundRest > 0) {
            steps.push({
              phase: 'round-rest',
              phaseLabel: `Отдых перед кругом ${r + 1}`,
              exerciseId: workout.items[0].exerciseId,
              mode: 'time',
              durationSec: roundRest,
              round: r,
              totalRounds: rounds
            });
          }
        }
      }
    });
  }

  return steps;
}

export class WorkoutPlayer {
  constructor(overlayEl, contentEl, { onFinish } = {}) {
    this.overlay = overlayEl;
    this.content = contentEl;
    this.onFinish = onFinish;
    this.workout = null;
    this.steps = [];
    this.stepIndex = 0;
    this.remainingSec = 0;
    this.totalStepSec = 1;
    this.paused = false;
    this.intervalId = null;
    this.startedAt = null;
    this.loggedSets = [];
    this.sessionWeightMemory = {};
    this.completedExercises = new Set();
    this.completed = false;

    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  start(workout) {
    this.workout = workout;
    this.steps = buildTimeline(workout);
    if (!this.steps.length) return;
    this.stepIndex = 0;
    this.paused = false;
    this.completed = false;
    this.startedAt = Date.now();
    this.loggedSets = [];
    this.sessionWeightMemory = {};
    this.completedExercises = new Set();

    const settings = getSettings();
    soundEngine.configure(settings);
    soundEngine.ensureContext();

    this.overlay.classList.add('open');
    this.overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', this.handleKeyDown);

    this.enterStep(0, true);
  }

  close() {
    this.stopTimer();
    this.overlay.classList.remove('open');
    this.overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  stopTimer() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  enterStep(index, announce = true) {
    this.stopTimer();
    if (index >= this.steps.length) {
      this.completeWorkout();
      return;
    }
    this.stepIndex = Math.max(0, index);
    const step = this.steps[this.stepIndex];
    const ex = getExerciseById(step.exerciseId) || { name: 'Упражнение', shortTip: '', image: '' };

    if (step.phase === 'work') {
      this.completedExercises.add(step.exerciseId);
    }

    if (step.mode === 'time') {
      this.totalStepSec = step.durationSec;
      this.remainingSec = step.durationSec;
      if (!this.paused) {
        this.startInterval();
      }
    } else {
      this.totalStepSec = 1;
      this.remainingSec = 0;
    }

    if (announce) {
      if (step.phase === 'work') {
        soundEngine.playGo();
        soundEngine.speak(`${ex.name}. ${step.mode === 'reps' ? step.phaseLabel : 'Поехали!'}`);
      } else if (step.phase === 'rest' || step.phase === 'round-rest') {
        soundEngine.playRest();
        soundEngine.speak(`Отдых. Далее: ${ex.name}`);
      } else if (step.phase === 'prep') {
        soundEngine.speak(`Приготовься: ${ex.name}`);
      }
    }

    this.render();
  }

  startInterval() {
    this.stopTimer();
    this.intervalId = setInterval(() => {
      if (this.paused) return;
      this.remainingSec -= 1;
      if (this.remainingSec > 0 && this.remainingSec <= 3) {
        soundEngine.playTick();
      }
      if (this.remainingSec <= 0) {
        this.enterStep(this.stepIndex + 1, true);
      } else {
        this.updateTimerVisualOnly();
      }
    }, 1000);
  }

  togglePause() {
    const step = this.steps[this.stepIndex];
    if (!step || step.mode !== 'time') return;
    this.paused = !this.paused;
    if (!this.paused) {
      soundEngine.ensureContext();
      this.startInterval();
    } else {
      this.stopTimer();
    }
    this.render();
  }

  adjustTime(delta) {
    const step = this.steps[this.stepIndex];
    if (!step || step.mode !== 'time') return;
    this.remainingSec = Math.max(3, this.remainingSec + delta);
    this.totalStepSec = Math.max(this.totalStepSec, this.remainingSec);
    this.updateTimerVisualOnly();
  }

  completeRepSet() {
    const step = this.steps[this.stepIndex];
    const ex = getExerciseById(step.exerciseId);
    const repsInput = this.content.querySelector('#playerRepsInput');
    const weightInput = this.content.querySelector('#playerWeightInput');
    const reps = Math.max(1, Number(repsInput?.value) || step.reps);
    const weightKg = Math.max(0, Number(weightInput?.value) || 0);

    this.sessionWeightMemory[step.exerciseId] = { reps, weightKg };
    this.loggedSets.push({
      exerciseId: step.exerciseId,
      exerciseName: ex ? ex.name : step.exerciseId,
      set: step.setNumber,
      reps,
      weightKg
    });
    this.completedExercises.add(step.exerciseId);
    this.enterStep(this.stepIndex + 1, true);
  }

  completeWorkout() {
    this.stopTimer();
    this.completed = true;
    soundEngine.playFinish();
    soundEngine.speak('Тренировка завершена! Отличная работа!');

    const elapsedMin = Math.max(1, Math.round((Date.now() - this.startedAt) / 60000));
    const est = estimateWorkoutStats(this.workout);
    const ratio = Math.min(1.4, Math.max(0.4, elapsedMin / Math.max(1, est.minutes)));
    const kcal = Math.max(15, Math.round(est.kcal * ratio));

    const totalVolumeKg = Math.round(
      this.loggedSets.reduce((sum, s) => sum + (Number(s.weightKg) || 0) * (Number(s.reps) || 0), 0)
    );

    // Compute exact worked muscles from logged sets + timed items
    const muscleItems = this.loggedSets.length
      ? this.loggedSets.map((s) => ({ exerciseId: s.exerciseId, sets: 1 }))
      : this.workout.items.map((it) => ({
          exerciseId: it.exerciseId,
          sets: it.mode === 'reps' ? it.sets || 3 : Math.max(1, this.workout.rounds || 1)
        }));
    const { scores: muscleScores } = computeMuscleScores(muscleItems, getExerciseById);

    const entry = addHistoryEntry({
      workoutId: this.workout.id,
      workoutName: this.workout.name,
      categoryLabel: this.workout.categoryLabel || 'Тренировка',
      durationMin: elapsedMin,
      kcal,
      totalVolumeKg,
      exercisesCount: this.workout.items.length,
      setsLog: this.loggedSets,
      muscleScores
    });

    const streak = calculateStreak();

    this.content.innerHTML = `
      <div class="complete-card complete-card-wide">
        <div class="complete-trophy">🏆</div>
        <h2 style="margin:0;font-size:1.65rem;font-weight:800;">Тренировка завершена!</h2>
        <p style="margin:0;color:var(--text-secondary);">
          «${escapeHtml(this.workout.name)}» сохранена в календарь и карту мышц.
        </p>

        <div class="complete-stats ${totalVolumeKg > 0 ? 'complete-stats-4' : ''}">
          <div class="hero-stat-box">
            <div class="hero-stat-num">${elapsedMin} мин</div>
            <div class="hero-stat-label">Время</div>
          </div>
          ${
            totalVolumeKg > 0
              ? `<div class="hero-stat-box">
                  <div class="hero-stat-num">${totalVolumeKg.toLocaleString('ru-RU')} кг</div>
                  <div class="hero-stat-label">Тоннаж</div>
                </div>`
              : ''
          }
          <div class="hero-stat-box">
            <div class="hero-stat-num">~${kcal}</div>
            <div class="hero-stat-label">ккал</div>
          </div>
          <div class="hero-stat-box">
            <div class="hero-stat-num">🔥 ${streak}</div>
            <div class="hero-stat-label">Серия дней</div>
          </div>
        </div>

        <div class="complete-bodymap-box">
          <div style="font-weight:800;font-size:0.95rem;margin-bottom:8px;">Задействованные мышцы за тренировку</div>
          ${renderBodyMapSVG(muscleScores, { compact: false })}
        </div>

        ${
          this.loggedSets.length
            ? `<div style="width:100%;text-align:left;background:var(--bg);border:1px solid var(--border);border-radius:14px;padding:12px 14px;max-height:190px;overflow-y:auto;">
                <div style="font-weight:700;font-size:0.86rem;margin-bottom:8px;">Записанные подходы (${this.loggedSets.length}):</div>
                ${this.loggedSets
                  .map(
                    (s) =>
                      `<div style="font-size:0.83rem;color:var(--text-secondary);padding:3px 0;display:flex;justify-content:space-between;gap:8px;">
                        <span>• ${escapeHtml(s.exerciseName)} (подх. ${s.set})</span>
                        <strong style="color:var(--text);white-space:nowrap;">${s.weightKg ? `${s.weightKg} кг × ` : ''}${s.reps} повт.</strong>
                      </div>`
                  )
                  .join('')}
              </div>`
            : ''
        }

        <button class="btn btn-primary btn-lg" id="playerDoneBtn" type="button" style="width:100%;margin-top:4px;">
          Готово — вернуться к тренировкам
        </button>
      </div>
    `;

    this.content.querySelector('#playerDoneBtn').addEventListener('click', () => {
      this.close();
      if (this.onFinish) this.onFinish(entry);
    });
  }

  updateTimerVisualOnly() {
    const timeEl = this.content.querySelector('#ringTimeText');
    const progEl = this.content.querySelector('#ringProgressCircle');
    if (timeEl) timeEl.textContent = formatSec(this.remainingSec);
    if (progEl) {
      const frac = Math.max(0, Math.min(1, this.remainingSec / Math.max(1, this.totalStepSec)));
      progEl.style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - frac));
    }
  }

  handleKeyDown(e) {
    if (this.completed) return;
    if (e.target && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
    if (e.code === 'Space') {
      e.preventDefault();
      this.togglePause();
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      this.enterStep(this.stepIndex + 1, true);
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      this.enterStep(Math.max(0, this.stepIndex - 1), false);
    } else if (e.code === 'Escape') {
      this.requestExit();
    }
  }

  requestExit() {
    if (this.loggedSets.length > 0) {
      if (confirm('Завершить тренировку сейчас и сохранить уже выполненные подходы на карте мышц?')) {
        this.completeWorkout();
      }
      return;
    }
    if (confirm('Выйти из тренировки? Текущая сессия не будет сохранена.')) {
      this.close();
    }
  }

  render() {
    const step = this.steps[this.stepIndex];
    const ex = getExerciseById(step.exerciseId) || {
      name: 'Упражнение',
      shortTip: '',
      image: 'assets/exercises/squats.jpg'
    };
    const nextWorkStep = this.steps.slice(this.stepIndex + 1).find((s) => s.phase === 'work');
    const nextEx = nextWorkStep ? getExerciseById(nextWorkStep.exerciseId) : null;
    const pct = Math.round(((this.stepIndex + 1) / this.steps.length) * 100);
    const settings = getSettings();

    const phaseClass =
      step.phase === 'prep'
        ? 'phase-prep'
        : step.phase === 'rest'
        ? 'phase-rest'
        : step.phase === 'round-rest'
        ? 'phase-round-rest'
        : 'phase-work';

    const ringStroke =
      step.phase === 'prep'
        ? 'var(--amber)'
        : step.phase === 'rest'
        ? 'var(--cyan)'
        : step.phase === 'round-rest'
        ? 'var(--violet)'
        : 'var(--accent)';

    const frac = step.mode === 'time' ? this.remainingSec / Math.max(1, this.totalStepSec) : 1;
    const dashOffset = RING_CIRCUMFERENCE * (1 - Math.max(0, Math.min(1, frac)));

    // Recall weight/reps from current session or previous history
    const sessionPrev = this.sessionWeightMemory[step.exerciseId];
    const historyPrev = getLastPerformance(step.exerciseId);
    const defaultReps = sessionPrev?.reps ?? step.reps;
    const defaultWeight =
      sessionPrev?.weightKg ?? (historyPrev ? historyPrev.weightKg : step.weightKg || 0);

    this.content.innerHTML = `
      <div class="player-top">
        <div class="player-title-wrap">
          <div class="player-program-name">${escapeHtml(this.workout.name)}</div>
          <div class="player-progress-text">
            Этап ${this.stepIndex + 1} из ${this.steps.length}${step.totalRounds > 1 ? ` · Круг ${step.round}/${step.totalRounds}` : ''}
          </div>
        </div>
        <div class="player-top-actions">
          <button class="icon-btn" id="playerSoundBtn" type="button" title="Звуковые сигналы">
            ${settings.soundEnabled ? '🔊' : '🔇'}
          </button>
          <button class="icon-btn" id="playerVoiceBtn" type="button" title="Голосовая озвучка">
            ${settings.voiceEnabled ? '🗣️' : '💬'}
          </button>
          <button class="btn btn-secondary btn-sm" id="playerExitBtn" type="button">
            ${this.loggedSets.length ? 'Завершить' : 'Выйти'}
          </button>
        </div>
      </div>

      <div class="player-progress-bar">
        <div class="player-progress-fill" style="width:${pct}%"></div>
      </div>

      <div class="player-stage">
        <div class="player-visual-card">
          <img src="${ex.image}" alt="${escapeHtml(ex.name)}">
          <div class="player-phase-pill ${phaseClass}">${escapeHtml(step.phaseLabel)}</div>
          ${renderCornerBodyBadge(ex.primaryMuscles, ex.secondaryMuscles, { size: 'lg' })}
        </div>

        <div class="player-timer-panel">
          <h2 class="player-exercise-name">
            ${step.phase === 'rest' || step.phase === 'round-rest' ? `Отдых · далее ${escapeHtml(ex.name)}` : escapeHtml(ex.name)}
          </h2>
          <p class="player-exercise-tip">${escapeHtml(ex.shortTip)}</p>

          ${
            step.mode === 'time'
              ? `
                <div class="ring-wrapper">
                  <svg class="ring-svg" viewBox="0 0 220 220">
                    <circle class="ring-track" cx="110" cy="110" r="${RING_RADIUS}"></circle>
                    <circle
                      id="ringProgressCircle"
                      class="ring-progress"
                      cx="110"
                      cy="110"
                      r="${RING_RADIUS}"
                      stroke="${ringStroke}"
                      stroke-dasharray="${RING_CIRCUMFERENCE}"
                      stroke-dashoffset="${dashOffset}"
                    ></circle>
                  </svg>
                  <div class="ring-center">
                    <div class="ring-time" id="ringTimeText">${formatSec(this.remainingSec)}</div>
                    <div class="ring-sub">${this.paused ? 'Пауза' : escapeHtml(step.phaseLabel)}</div>
                  </div>
                </div>

                <div class="player-controls">
                  <button class="player-ctrl-btn" id="playerPrevBtn" type="button" title="Назад">⏮</button>
                  <button class="player-ctrl-btn" id="playerMinusBtn" type="button" title="-10 сек">-10с</button>
                  <button class="player-play-btn" id="playerPauseBtn" type="button" title="Старт/Пауза">
                    ${this.paused ? '▶' : '❚❚'}
                  </button>
                  <button class="player-ctrl-btn" id="playerPlusBtn" type="button" title="+10 сек">+10с</button>
                  <button class="player-ctrl-btn" id="playerNextBtn" type="button" title="Пропустить">⏭</button>
                </div>
              `
              : `
                <div class="rep-box">
                  <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;">
                    <span style="font-size:0.8rem;color:var(--text-secondary);font-weight:700;text-transform:uppercase;">${escapeHtml(step.phaseLabel)}</span>
                    ${
                      historyPrev
                        ? `<span style="font-size:0.76rem;color:var(--cyan);font-weight:600;">Прошлый: ${historyPrev.weightKg} кг × ${historyPrev.reps}</span>`
                        : ''
                    }
                  </div>

                  <div class="rep-inputs">
                    <div class="field-group">
                      <label for="playerWeightInput">Вес (кг)</label>
                      <div class="stepper-inline">
                        <button type="button" class="mini-step-btn" data-bump="#playerWeightInput" data-delta="-2.5">−</button>
                        <input id="playerWeightInput" class="input-control" type="number" min="0" max="500" step="0.5" value="${defaultWeight}">
                        <button type="button" class="mini-step-btn" data-bump="#playerWeightInput" data-delta="2.5">+</button>
                      </div>
                    </div>
                    <div class="field-group">
                      <label for="playerRepsInput">Повторения</label>
                      <div class="stepper-inline">
                        <button type="button" class="mini-step-btn" data-bump="#playerRepsInput" data-delta="-1">−</button>
                        <input id="playerRepsInput" class="input-control" type="number" min="1" max="200" value="${defaultReps}">
                        <button type="button" class="mini-step-btn" data-bump="#playerRepsInput" data-delta="1">+</button>
                      </div>
                    </div>
                  </div>

                  <button class="btn btn-primary btn-lg" id="playerDoneSetBtn" type="button">
                    ✓ Подход выполнен → отдых
                  </button>
                  <div class="player-controls">
                    <button class="btn btn-ghost btn-sm" id="playerPrevBtn" type="button">⏮ Назад</button>
                    <button class="btn btn-ghost btn-sm" id="playerNextBtn" type="button">Пропустить ⏭</button>
                  </div>
                </div>
              `
          }
        </div>
      </div>

      ${
        nextEx
          ? `
            <div class="player-next-bar">
              <img src="${nextEx.image}" alt="${escapeHtml(nextEx.name)}">
              <div style="flex:1;min-width:0;">
                <div style="font-size:0.74rem;color:var(--text-muted);font-weight:700;text-transform:uppercase;">Следующее упражнение</div>
                <div style="font-weight:700;font-size:0.94rem;">${escapeHtml(nextEx.name)}</div>
              </div>
              <span class="badge badge-soft">${nextWorkStep.mode === 'reps' ? `${nextWorkStep.weightKg ? `${nextWorkStep.weightKg} кг × ` : ''}${nextWorkStep.reps} повт.` : `${nextWorkStep.durationSec} сек`}</span>
            </div>
          `
          : ''
      }
    `;

    this.content.querySelector('#playerExitBtn').addEventListener('click', () => this.requestExit());
    this.content.querySelector('#playerSoundBtn').addEventListener('click', () => {
      const next = saveSettings({ soundEnabled: !getSettings().soundEnabled });
      soundEngine.configure(next);
      this.render();
    });
    this.content.querySelector('#playerVoiceBtn').addEventListener('click', () => {
      const next = saveSettings({ voiceEnabled: !getSettings().voiceEnabled });
      soundEngine.configure(next);
      if (next.voiceEnabled) soundEngine.speak('Голосовой тренер включён');
      this.render();
    });

    const prevBtn = this.content.querySelector('#playerPrevBtn');
    const nextBtn = this.content.querySelector('#playerNextBtn');
    if (prevBtn) prevBtn.addEventListener('click', () => this.enterStep(Math.max(0, this.stepIndex - 1), false));
    if (nextBtn) nextBtn.addEventListener('click', () => this.enterStep(this.stepIndex + 1, true));

    const pauseBtn = this.content.querySelector('#playerPauseBtn');
    if (pauseBtn) pauseBtn.addEventListener('click', () => this.togglePause());

    const minusBtn = this.content.querySelector('#playerMinusBtn');
    if (minusBtn) minusBtn.addEventListener('click', () => this.adjustTime(-10));

    const plusBtn = this.content.querySelector('#playerPlusBtn');
    if (plusBtn) plusBtn.addEventListener('click', () => this.adjustTime(10));

    this.content.querySelectorAll('[data-bump]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const input = this.content.querySelector(btn.dataset.bump);
        if (!input) return;
        const delta = Number(btn.dataset.delta);
        const min = Number(input.min || 0);
        const cur = Number(input.value) || 0;
        input.value = String(Math.max(min, Math.round((cur + delta) * 10) / 10));
      });
    });

    const doneSetBtn = this.content.querySelector('#playerDoneSetBtn');
    if (doneSetBtn) doneSetBtn.addEventListener('click', () => this.completeRepSet());
  }
}

export function formatSec(sec) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
