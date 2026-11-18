import { soundEngine } from './audio.js';
import { addHistoryEntry, getSettings, saveSettings } from './storage.js';
import { formatSec } from './player.js';

const PRESETS = [
  { id: 'tabata', name: 'Табата 20/10', desc: '8 раундов · классика', prep: 5, work: 20, rest: 10, rounds: 8 },
  { id: 'hiit', name: 'HIIT 40/20', desc: '10 раундов · жиросжигание', prep: 8, work: 40, rest: 20, rounds: 10 },
  { id: 'emom', name: 'EMOM 60/0', desc: '10 минут · каждую минуту', prep: 5, work: 60, rest: 0, rounds: 10 },
  { id: 'rest90', name: 'Силовой отдых', desc: '1 раунд · 90 сек отдыха', prep: 0, work: 90, rest: 0, rounds: 1 }
];

const RING_R = 96;
const RING_C = 2 * Math.PI * RING_R;

export class StandaloneTimer {
  constructor(container, { onLog } = {}) {
    this.container = container;
    this.onLog = onLog;
    this.activePreset = 'tabata';
    this.config = { prep: 5, work: 20, rest: 10, rounds: 8 };
    this.state = {
      running: false,
      paused: false,
      phase: 'idle', // idle | prep | work | rest | done
      round: 1,
      remaining: 20,
      phaseTotal: 20
    };
    this.timerId = null;
    this.startedAt = null;
  }

  getTotalDurationSec() {
    const { prep, work, rest, rounds } = this.config;
    return prep + rounds * work + Math.max(0, rounds - 1) * rest;
  }

  applyPreset(presetId) {
    const p = PRESETS.find((item) => item.id === presetId);
    if (!p) return;
    this.stop(false);
    this.activePreset = p.id;
    this.config = { prep: p.prep, work: p.work, rest: p.rest, rounds: p.rounds };
    this.state.remaining = p.work;
    this.state.phaseTotal = p.work;
    this.render();
  }

  adjustConfig(key, delta) {
    if (this.state.running) return;
    this.activePreset = 'custom';
    const limits = {
      prep: [0, 30],
      work: [5, 600],
      rest: [0, 300],
      rounds: [1, 50]
    };
    const [min, max] = limits[key];
    this.config[key] = Math.max(min, Math.min(max, this.config[key] + delta));
    this.state.remaining = this.config.work;
    this.state.phaseTotal = this.config.work;
    this.render();
  }

  startOrToggle() {
    const settings = getSettings();
    soundEngine.configure(settings);
    soundEngine.ensureContext();

    if (!this.state.running) {
      this.startedAt = Date.now();
      this.state.running = true;
      this.state.paused = false;
      this.state.round = 1;
      if (this.config.prep > 0) {
        this.setPhase('prep', this.config.prep);
      } else {
        this.setPhase('work', this.config.work);
      }
      this.startLoop();
      this.render();
      return;
    }

    this.state.paused = !this.state.paused;
    if (this.state.paused) {
      clearInterval(this.timerId);
      this.timerId = null;
    } else {
      this.startLoop();
    }
    this.render();
  }

  setPhase(phase, sec) {
    this.state.phase = phase;
    this.state.remaining = sec;
    this.state.phaseTotal = Math.max(1, sec);
    if (phase === 'work') {
      soundEngine.playGo();
      soundEngine.speak(`Раунд ${this.state.round}. Работа!`);
    } else if (phase === 'rest') {
      soundEngine.playRest();
      soundEngine.speak('Отдых');
    } else if (phase === 'prep') {
      soundEngine.speak('Приготовься');
    }
  }

  startLoop() {
    clearInterval(this.timerId);
    this.timerId = setInterval(() => {
      if (this.state.paused) return;
      this.state.remaining -= 1;
      if (this.state.remaining > 0 && this.state.remaining <= 3) {
        soundEngine.playTick();
      }
      if (this.state.remaining <= 0) {
        this.advancePhase();
      } else {
        this.updateRingOnly();
      }
    }, 1000);
  }

  advancePhase() {
    if (this.state.phase === 'prep') {
      this.setPhase('work', this.config.work);
    } else if (this.state.phase === 'work') {
      if (this.state.round >= this.config.rounds) {
        this.finish();
        return;
      }
      if (this.config.rest > 0) {
        this.setPhase('rest', this.config.rest);
      } else {
        this.state.round += 1;
        this.setPhase('work', this.config.work);
      }
    } else if (this.state.phase === 'rest') {
      this.state.round += 1;
      this.setPhase('work', this.config.work);
    }
    this.render();
  }

  finish() {
    clearInterval(this.timerId);
    this.timerId = null;
    this.state.running = false;
    this.state.paused = false;
    this.state.phase = 'done';
    this.state.remaining = 0;
    soundEngine.playFinish();
    soundEngine.speak('Таймер завершён! Отличная работа!');
    this.render();
  }

  stop(shouldRender = true) {
    clearInterval(this.timerId);
    this.timerId = null;
    this.state = {
      running: false,
      paused: false,
      phase: 'idle',
      round: 1,
      remaining: this.config.work,
      phaseTotal: this.config.work
    };
    if (shouldRender) this.render();
  }

  logSession() {
    const mins = Math.max(1, Math.round(this.getTotalDurationSec() / 60));
    const kcal = Math.max(15, Math.round(mins * 9));
    addHistoryEntry({
      workoutId: 'standalone-timer',
      workoutName: `Интервальный таймер (${this.config.work}/${this.config.rest} × ${this.config.rounds})`,
      categoryLabel: 'Свободный таймер',
      durationMin: mins,
      kcal,
      exercisesCount: this.config.rounds
    });
    if (this.onLog) this.onLog();
  }

  updateRingOnly() {
    const timeEl = this.container.querySelector('#stTimeVal');
    const circleEl = this.container.querySelector('#stRingCircle');
    if (timeEl) timeEl.textContent = formatSec(this.state.remaining);
    if (circleEl) {
      const frac = Math.max(0, Math.min(1, this.state.remaining / Math.max(1, this.state.phaseTotal)));
      circleEl.style.strokeDashoffset = String(RING_C * (1 - frac));
    }
  }

  render() {
    const settings = getSettings();
    const totalSec = this.getTotalDurationSec();
    const phaseMeta = {
      idle: { label: 'Готов к старту', color: 'var(--accent)' },
      prep: { label: 'Подготовка', color: 'var(--amber)' },
      work: { label: 'Работа', color: 'var(--accent)' },
      rest: { label: 'Отдых', color: 'var(--cyan)' },
      done: { label: 'Готово!', color: 'var(--accent)' }
    }[this.state.phase];

    const frac =
      this.state.phase === 'idle'
        ? 1
        : Math.max(0, Math.min(1, this.state.remaining / Math.max(1, this.state.phaseTotal)));

    this.container.innerHTML = `
      <div class="timer-layout">
        <div class="panel-card standalone-display">
          <div style="width:100%;display:flex;justify-content:space-between;align-items:center;">
            <span class="badge badge-soft">Раунд ${this.state.round} / ${this.config.rounds}</span>
            <div style="display:flex;gap:8px;">
              <button class="icon-btn" id="stSoundToggle" type="button" title="Звук">${settings.soundEnabled ? '🔊' : '🔇'}</button>
              <button class="icon-btn" id="stVoiceToggle" type="button" title="Голосовые подсказки">${settings.voiceEnabled ? '🗣️' : '💬'}</button>
            </div>
          </div>

          <div class="ring-wrapper" style="width:248px;height:248px;">
            <svg class="ring-svg" viewBox="0 0 220 220">
              <circle class="ring-track" cx="110" cy="110" r="${RING_R}"></circle>
              <circle
                id="stRingCircle"
                class="ring-progress"
                cx="110"
                cy="110"
                r="${RING_R}"
                stroke="${phaseMeta.color}"
                stroke-dasharray="${RING_C}"
                stroke-dashoffset="${RING_C * (1 - frac)}"
              ></circle>
            </svg>
            <div class="ring-center">
              <div class="ring-time" id="stTimeVal">${formatSec(this.state.remaining)}</div>
              <div class="ring-sub" style="color:${phaseMeta.color}">${this.state.paused ? 'Пауза' : phaseMeta.label}</div>
            </div>
          </div>

          <div style="color:var(--text-secondary);font-size:0.86rem;">
            Общая длительность: <strong>${formatSec(totalSec)}</strong>
          </div>

          <div class="player-controls">
            <button class="btn btn-primary btn-lg" id="stPlayBtn" type="button" style="min-width:168px;">
              ${!this.state.running ? '▶ Старт' : this.state.paused ? '▶ Продолжить' : '❚❚ Пауза'}
            </button>
            <button class="btn btn-secondary btn-lg" id="stResetBtn" type="button">Сброс</button>
          </div>

          ${
            this.state.phase === 'done'
              ? `<button class="btn btn-secondary btn-sm" id="stLogBtn" type="button">✓ Записать сессию в прогресс</button>`
              : ''
          }
        </div>

        <div class="panel-card">
          <h3 style="margin:0 0 12px;font-size:1.05rem;">Быстрые пресеты</h3>
          <div class="presets-grid">
            ${PRESETS.map(
              (p) => `
                <button class="preset-btn ${this.activePreset === p.id ? 'active' : ''}" data-preset="${p.id}" type="button">
                  <span class="preset-name">${p.name}</span>
                  <span class="preset-desc">${p.desc}</span>
                </button>
              `
            ).join('')}
          </div>

          <h3 style="margin:18px 0 12px;font-size:1.05rem;">Точная настройка</h3>
          <div class="stepper-list">
            ${this.renderStepper('Подготовка', 'prep', `${this.config.prep} с`, 5)}
            ${this.renderStepper('Работа', 'work', `${this.config.work} с`, 5)}
            ${this.renderStepper('Отдых', 'rest', `${this.config.rest} с`, 5)}
            ${this.renderStepper('Раундов', 'rounds', `${this.config.rounds}`, 1)}
          </div>
        </div>
      </div>
    `;

    this.container.querySelector('#stPlayBtn').addEventListener('click', () => this.startOrToggle());
    this.container.querySelector('#stResetBtn').addEventListener('click', () => this.stop(true));
    this.container.querySelector('#stSoundToggle').addEventListener('click', () => {
      const next = saveSettings({ soundEnabled: !getSettings().soundEnabled });
      soundEngine.configure(next);
      this.render();
    });
    this.container.querySelector('#stVoiceToggle').addEventListener('click', () => {
      const next = saveSettings({ voiceEnabled: !getSettings().voiceEnabled });
      soundEngine.configure(next);
      this.render();
    });

    const logBtn = this.container.querySelector('#stLogBtn');
    if (logBtn) {
      logBtn.addEventListener('click', () => {
        this.logSession();
        logBtn.disabled = true;
        logBtn.textContent = '✓ Сохранено в дневник';
      });
    }

    this.container.querySelectorAll('[data-preset]').forEach((btn) => {
      btn.addEventListener('click', () => this.applyPreset(btn.dataset.preset));
    });

    this.container.querySelectorAll('[data-step-key]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.adjustConfig(btn.dataset.stepKey, Number(btn.dataset.stepDelta));
      });
    });
  }

  renderStepper(label, key, valueText, step) {
    return `
      <div class="stepper-row">
        <span class="stepper-label">${label}</span>
        <div class="stepper-controls">
          <button class="stepper-btn" data-step-key="${key}" data-step-delta="${-step}" type="button" ${this.state.running ? 'disabled' : ''}>−</button>
          <span class="stepper-val">${valueText}</span>
          <button class="stepper-btn" data-step-key="${key}" data-step-delta="${step}" type="button" ${this.state.running ? 'disabled' : ''}>+</button>
        </div>
      </div>
    `;
  }
}
