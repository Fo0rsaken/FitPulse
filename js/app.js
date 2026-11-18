import {
  getAllExercises,
  getExerciseById,
  generateCustomExerciseSvg,
  BUILTIN_WORKOUTS,
  estimateWorkoutStats
} from './data.js';
import {
  getTheme,
  setTheme,
  getHistory,
  deleteHistoryEntry,
  getCustomWorkouts,
  getCustomExercises,
  saveCustomExercise,
  deleteCustomExercise,
  getAggregateStats,
  toDateKey,
  exportAllData,
  importAllData,
  getGitHubSyncConfig,
  saveGitHubSyncConfig,
  clearGitHubSyncConfig,
  syncPushToGist,
  syncPullFromGist
} from './storage.js';
import {
  MUSCLE_LABELS,
  MUSCLE_KEYS,
  computeMuscleScores,
  renderBodyMapSVG
} from './bodymap.js';
import { WorkoutPlayer } from './player.js';
import { StandaloneTimer } from './timer.js';
import { WorkoutBuilder } from './builder.js';

const state = {
  currentView: 'workouts',
  workoutCategory: 'all',
  muscleFilter: 'all',
  equipmentFilter: 'all',
  exerciseQuery: '',
  calendarDate: new Date(),
  selectedDateKey: toDateKey(new Date())
};

const detailModal = document.getElementById('detailModal');
const detailModalContent = document.getElementById('detailModalContent');

const player = new WorkoutPlayer(
  document.getElementById('workoutPlayer'),
  document.getElementById('workoutPlayerContent'),
  {
    onFinish: () => {
      refreshAll();
      showToast('Тренировка и карта мышц сохранены в прогресс!');
    }
  }
);

const standaloneTimer = new StandaloneTimer(
  document.getElementById('standaloneTimerContainer'),
  {
    onLog: () => {
      refreshAll();
      showToast('Таймер-сессия записана в прогресс!');
    }
  }
);

const builder = new WorkoutBuilder(
  document.getElementById('builderContainer'),
  {
    onSave: () => renderWorkoutsView(),
    onStart: (w) => player.start(w),
    onToast: (msg) => showToast(msg),
    onOpenCreateExercise: () => openCreateExerciseModal()
  }
);

/* ---------- Navigation & Theme ---------- */

function switchView(viewName) {
  state.currentView = viewName;
  document.querySelectorAll('.view').forEach((v) => {
    v.classList.toggle('active', v.id === `view-${viewName}`);
  });
  document.querySelectorAll('[data-view]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.view === viewName);
  });

  if (viewName === 'workouts') renderWorkoutsView();
  if (viewName === 'exercises') renderExercisesView();
  if (viewName === 'timer') standaloneTimer.render();
  if (viewName === 'builder') builder.render();
  if (viewName === 'progress') renderProgressView();

  window.scrollTo({ top: 0, behavior: 'instant' });
}

function toggleTheme() {
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
}

function updateStreakBadges() {
  const stats = getAggregateStats();
  const sVal = document.getElementById('sidebarStreakVal');
  const mVal = document.getElementById('mobileStreakVal');
  if (sVal) sVal.textContent = `${stats.streak} ${pluralDays(stats.streak)}`;
  if (mVal) mVal.textContent = String(stats.streak);
}

function refreshAll() {
  updateStreakBadges();
  renderWorkoutsView();
  if (state.currentView === 'exercises') renderExercisesView();
  if (state.currentView === 'builder') builder.render();
  if (state.currentView === 'progress') renderProgressView();
}

/* ---------- View 1: Workouts ---------- */

function getAllWorkouts() {
  return [...getCustomWorkouts(), ...BUILTIN_WORKOUTS];
}

function renderWorkoutsView() {
  const stats = getAggregateStats();
  const allWorkouts = getAllWorkouts();
  const featured = BUILTIN_WORKOUTS[0];

  const heroEl = document.getElementById('heroCard');
  heroEl.innerHTML = `
    <div>
      <span class="hero-badge">🏋️ Топ-40 зала + карта мышц</span>
      <h2 class="hero-title">${escapeHtml(featured.name)}</h2>
      <p class="hero-desc">${escapeHtml(featured.description)}</p>
      <div class="hero-actions">
        <button class="btn btn-primary btn-lg" id="heroStartBtn" type="button">▶ Начать тренировку</button>
        <button class="btn btn-secondary btn-lg" id="heroCatalogBtn" type="button">📚 Каталог (${getAllExercises().length})</button>
      </div>
    </div>
    <div class="hero-stats">
      <div class="hero-stat-box">
        <div class="hero-stat-num">🔥 ${stats.streak}</div>
        <div class="hero-stat-label">Серия дней</div>
      </div>
      <div class="hero-stat-box">
        <div class="hero-stat-num">${stats.totalSessions}</div>
        <div class="hero-stat-label">Тренировок</div>
      </div>
      <div class="hero-stat-box">
        <div class="hero-stat-num">${stats.totalVolumeKg > 0 ? `${Math.round(stats.totalVolumeKg / 100) / 10} т` : `${stats.totalMinutes} м`}</div>
        <div class="hero-stat-label">${stats.totalVolumeKg > 0 ? 'Поднято всего' : 'Минут всего'}</div>
      </div>
      <div class="hero-stat-box">
        <div class="hero-stat-num">${stats.totalKcal}</div>
        <div class="hero-stat-label">ккал сожжено</div>
      </div>
    </div>
  `;

  heroEl.querySelector('#heroStartBtn').addEventListener('click', () => player.start(featured));
  heroEl.querySelector('#heroCatalogBtn').addEventListener('click', () => switchView('exercises'));

  const cats = [
    { id: 'all', label: 'Все программы' },
    { id: 'gym', label: 'В зале' },
    { id: 'bodyweight', label: 'Дома / Свой вес' },
    { id: 'dumbbells', label: 'Гантели' },
    { id: 'hiit', label: 'HIIT / Табата' },
    { id: 'stretch', label: 'Растяжка' },
    { id: 'custom', label: `Мои (${getCustomWorkouts().length})` }
  ];

  const filtersEl = document.getElementById('workoutFilters');
  filtersEl.innerHTML = cats
    .map(
      (c) =>
        `<button class="filter-pill ${state.workoutCategory === c.id ? 'active' : ''}" data-wcat="${c.id}" type="button">${c.label}</button>`
    )
    .join('');

  filtersEl.querySelectorAll('[data-wcat]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.workoutCategory = btn.dataset.wcat;
      renderWorkoutsView();
    });
  });

  const filtered =
    state.workoutCategory === 'all'
      ? allWorkouts
      : allWorkouts.filter((w) => w.category === state.workoutCategory);

  const gridEl = document.getElementById('workoutsGrid');
  if (!filtered.length) {
    gridEl.innerHTML = `
      <div class="empty-state" style="grid-column:1 / -1;">
        <p style="margin:0 0 12px;font-weight:700;">В этой категории пока нет программ</p>
        <button class="btn btn-primary btn-sm" id="emptyCreateBtn" type="button">+ Создать свою программу</button>
      </div>
    `;
    gridEl.querySelector('#emptyCreateBtn')?.addEventListener('click', () => switchView('builder'));
    return;
  }

  gridEl.innerHTML = filtered
    .map((w) => {
      const est = estimateWorkoutStats(w);
      const thumbs = w.items.slice(0, 4);
      const extra = w.items.length - thumbs.length;
      return `
        <article class="workout-card">
          <div class="workout-card-media">
            <img src="${w.coverImage}" alt="${escapeAttr(w.name)}" loading="lazy">
            <div class="workout-badges">
              <span class="badge ${w.isCustom ? 'badge-accent' : 'badge-dark'}">${escapeHtml(w.categoryLabel)}</span>
              <span class="badge badge-dark">${escapeHtml(w.difficulty)}</span>
            </div>
            <div class="workout-card-overlay-meta">
              <span>⏱ ~${est.minutes} мин</span>
              <span>🔥 ~${est.kcal} ккал</span>
              <span>📋 ${w.items.length} упр.</span>
            </div>
          </div>
          <div class="workout-card-body">
            <h3 class="workout-card-title">${escapeHtml(w.name)}</h3>
            <p class="workout-card-desc">${escapeHtml(w.description)}</p>
            <div class="workout-thumbs">
              ${thumbs
                .map((it) => {
                  const ex = getExerciseById(it.exerciseId);
                  return ex
                    ? `<img class="workout-thumb" src="${ex.image}" alt="${escapeAttr(ex.name)}" title="${escapeAttr(ex.name)}">`
                    : '';
                })
                .join('')}
              ${extra > 0 ? `<span class="workout-thumb-more">+${extra}</span>` : ''}
            </div>
            <div class="workout-card-actions">
              <button class="btn btn-primary" data-start-workout="${w.id}" type="button">▶ Старт</button>
              <button class="btn btn-secondary" data-preview-workout="${w.id}" type="button">Состав</button>
            </div>
          </div>
        </article>
      `;
    })
    .join('');

  gridEl.querySelectorAll('[data-start-workout]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const w = allWorkouts.find((x) => x.id === btn.dataset.startWorkout);
      if (w) player.start(w);
    });
  });

  gridEl.querySelectorAll('[data-preview-workout]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const w = allWorkouts.find((x) => x.id === btn.dataset.previewWorkout);
      if (w) openWorkoutPreviewModal(w);
    });
  });
}

function openWorkoutPreviewModal(workout) {
  const est = estimateWorkoutStats(workout);
  const { scores } = computeMuscleScores(workout.items, getExerciseById);

  detailModalContent.innerHTML = `
    <div class="modal-header">
      <h2>${escapeHtml(workout.name)}</h2>
      <button class="icon-btn" id="closeModalBtn" type="button" aria-label="Закрыть">✕</button>
    </div>
    <div class="modal-body">
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">
        <span class="badge badge-accent">${escapeHtml(workout.categoryLabel)}</span>
        <span class="badge badge-soft">⏱ ~${est.minutes} мин</span>
        <span class="badge badge-soft">🔥 ~${est.kcal} ккал</span>
        <span class="badge badge-soft">📋 ${workout.items.length} упр.</span>
      </div>
      <p style="margin:0 0 14px;color:var(--text-secondary);line-height:1.5;">${escapeHtml(workout.description)}</p>

      <div class="panel-card" style="padding:14px;margin-bottom:16px;border-radius:16px;">
        <div style="font-weight:700;font-size:0.86rem;margin-bottom:8px;">Карта задействованных мышц</div>
        ${renderBodyMapSVG(scores, { compact: true })}
      </div>

      <div class="detail-list">
        ${workout.items
          .map((item, idx) => {
            const ex = getExerciseById(item.exerciseId);
            if (!ex) return '';
            const detail =
              item.mode === 'reps'
                ? `${item.sets} подх. × ${item.reps} повт.${item.weightKg ? ` (${item.weightKg} кг)` : ''} · отдых ${item.restSec}с`
                : `${item.durationSec} сек работа · ${item.restSec} сек отдых`;
            return `
              <div class="workout-preview-item">
                <img src="${ex.image}" alt="${escapeAttr(ex.name)}">
                <div class="workout-preview-meta">
                  <div class="workout-preview-name">${idx + 1}. ${escapeHtml(ex.name)}</div>
                  <div class="workout-preview-sub">${detail}</div>
                </div>
              </div>
            `;
          })
          .join('')}
      </div>
      <button class="btn btn-primary btn-lg" id="modalStartWorkoutBtn" type="button" style="width:100%;">
        ▶ Запустить тренировку
      </button>
    </div>
  `;

  openModal();
  detailModalContent.querySelector('#closeModalBtn').addEventListener('click', closeModal);
  detailModalContent.querySelector('#modalStartWorkoutBtn').addEventListener('click', () => {
    closeModal();
    player.start(workout);
  });
}

/* ---------- View 2: Exercises + Custom Exercise Creation ---------- */

function renderExercisesView() {
  const allExercises = getAllExercises();
  const countEl = document.getElementById('exerciseCountBadge');
  if (countEl) countEl.textContent = `${allExercises.length} упр.`;

  const muscles = [
    { id: 'all', label: `Все (${allExercises.length})` },
    { id: 'chest', label: 'Грудь' },
    { id: 'back', label: 'Спина' },
    { id: 'legs', label: 'Ноги и ягодицы' },
    { id: 'shoulders', label: 'Плечи' },
    { id: 'biceps', label: 'Бицепс' },
    { id: 'triceps', label: 'Трицепс' },
    { id: 'core', label: 'Пресс и кор' },
    { id: 'full', label: 'Кардио' },
    { id: 'stretch', label: 'Растяжка' }
  ];

  const equip = [
    { id: 'all', label: 'Любой инвентарь' },
    { id: 'barbell', label: 'Штанга' },
    { id: 'dumbbells', label: 'Гантели' },
    { id: 'machine', label: 'Тренажёры' },
    { id: 'cable', label: 'Блоки' },
    { id: 'none', label: 'Свой вес / Турник' },
    { id: 'custom_only', label: `Мои (${getCustomExercises().length})` }
  ];

  const mEl = document.getElementById('muscleFilters');
  mEl.innerHTML = muscles
    .map(
      (m) =>
        `<button class="filter-pill ${state.muscleFilter === m.id ? 'active' : ''}" data-muscle="${m.id}" type="button">${m.label}</button>`
    )
    .join('');

  mEl.querySelectorAll('[data-muscle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.muscleFilter = btn.dataset.muscle;
      renderExercisesView();
    });
  });

  const eEl = document.getElementById('equipmentFilters');
  eEl.innerHTML = equip
    .map(
      (eq) =>
        `<button class="filter-pill ${state.equipmentFilter === eq.id ? 'active' : ''}" data-equip="${eq.id}" type="button">${eq.label}</button>`
    )
    .join('');

  eEl.querySelectorAll('[data-equip]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.equipmentFilter = btn.dataset.equip;
      renderExercisesView();
    });
  });

  const q = state.exerciseQuery.trim().toLowerCase();
  const list = allExercises.filter((ex) => {
    if (state.muscleFilter !== 'all' && ex.muscle !== state.muscleFilter) return false;
    if (state.equipmentFilter === 'custom_only') {
      if (!ex.isCustom) return false;
    } else if (state.equipmentFilter !== 'all' && ex.equipment !== state.equipmentFilter) {
      return false;
    }
    if (
      q &&
      !ex.name.toLowerCase().includes(q) &&
      !ex.muscleLabel.toLowerCase().includes(q) &&
      !ex.equipmentLabel.toLowerCase().includes(q)
    ) {
      return false;
    }
    return true;
  });

  const grid = document.getElementById('exercisesGrid');
  if (!list.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1 / -1;">По выбранным фильтрам упражнения не найдены</div>`;
    return;
  }

  grid.innerHTML = list
    .map(
      (ex) => `
        <article class="exercise-card" data-open-ex="${ex.id}" tabindex="0" role="button">
          <div class="exercise-card-img">
            <img src="${ex.image}" alt="${escapeAttr(ex.name)}" loading="lazy">
            ${ex.isCustom ? `<span class="badge badge-accent" style="position:absolute;top:10px;left:10px;">Моё</span>` : ''}
            ${ex.isGymTop40 ? `<span class="badge badge-dark" style="position:absolute;top:10px;right:10px;">Зал</span>` : ''}
          </div>
          <div class="exercise-card-body">
            <h3 class="exercise-card-title">${escapeHtml(ex.name)}</h3>
            <div class="exercise-tags">
              <span class="badge badge-soft">${escapeHtml(ex.muscleLabel)}</span>
              <span class="badge ${ex.equipment === 'barbell' ? 'badge-violet' : ex.equipment === 'dumbbells' ? 'badge-amber' : 'badge-cyan'}">${escapeHtml(ex.equipmentLabel)}</span>
            </div>
            <div style="font-size:0.78rem;color:var(--text-muted);margin-top:2px;">
              ${ex.defaultSets || 3}×${ex.defaultReps || 10}${ex.defaultWeightKg ? ` · ~${ex.defaultWeightKg} кг` : ''}
            </div>
          </div>
        </article>
      `
    )
    .join('');

  grid.querySelectorAll('[data-open-ex]').forEach((card) => {
    const open = () => {
      const ex = getExerciseById(card.dataset.openEx);
      if (ex) openExerciseDetailModal(ex);
    };
    card.addEventListener('click', open);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  });
}

function openExerciseDetailModal(ex) {
  const { scores } = computeMuscleScores([ex], getExerciseById);

  detailModalContent.innerHTML = `
    <div class="modal-header">
      <h2>${escapeHtml(ex.name)}</h2>
      <button class="icon-btn" id="closeModalBtn" type="button" aria-label="Закрыть">✕</button>
    </div>
    <div class="modal-body">
      <div class="ex-detail-top-grid">
        <img class="modal-hero-img" src="${ex.image}" alt="${escapeAttr(ex.name)}" style="margin-bottom:0;">
        <div class="panel-card" style="padding:12px;border-radius:16px;">
          <div style="font-weight:700;font-size:0.82rem;margin-bottom:6px;text-align:center;">Задействованные мышцы</div>
          ${renderBodyMapSVG(scores, { compact: true })}
        </div>
      </div>

      <div style="display:flex;gap:8px;flex-wrap:wrap;margin:14px 0;">
        <span class="badge badge-accent">${escapeHtml(ex.muscleLabel)}</span>
        <span class="badge badge-soft">${escapeHtml(ex.equipmentLabel)}</span>
        <span class="badge badge-soft">${ex.defaultSets || 3} подх. × ${ex.defaultReps || 10} повт.</span>
        ${ex.defaultWeightKg ? `<span class="badge badge-soft">Базовый вес: ${ex.defaultWeightKg} кг</span>` : ''}
      </div>

      ${
        ex.steps && ex.steps.length
          ? `<h3 style="margin:0 0 8px;font-size:1rem;">Техника выполнения</h3>
            <div class="detail-list">
              ${ex.steps
                .map(
                  (s, i) => `
                    <div class="detail-step">
                      <span class="detail-step-num">${i + 1}</span>
                      <span>${escapeHtml(s)}</span>
                    </div>
                  `
                )
                .join('')}
            </div>`
          : `<p style="color:var(--text-secondary);">${escapeHtml(ex.shortTip)}</p>`
      }

      ${
        ex.mistakes || ex.breathing
          ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px;">
              <div class="panel-card" style="padding:14px;border-radius:14px;">
                <div style="font-weight:700;font-size:0.84rem;color:var(--coral);margin-bottom:4px;">⚠️ Частые ошибки</div>
                <div style="font-size:0.84rem;color:var(--text-secondary);line-height:1.45;">${escapeHtml(ex.mistakes || 'Следи за ровной спиной и контролем веса.')}</div>
              </div>
              <div class="panel-card" style="padding:14px;border-radius:14px;">
                <div style="font-weight:700;font-size:0.84rem;color:var(--cyan);margin-bottom:4px;">💨 Дыхание</div>
                <div style="font-size:0.84rem;color:var(--text-secondary);line-height:1.45;">${escapeHtml(ex.breathing || 'Выдох на усилии, вдох при возврате.')}</div>
              </div>
            </div>`
          : ''
      }

      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <button class="btn btn-primary btn-lg" id="quickRepsBtn" type="button" style="flex:1;">
          ▶ Начать подходы (${ex.defaultSets || 3}×${ex.defaultReps || 10})
        </button>
        ${
          ex.isCustom
            ? `<button class="btn btn-danger btn-lg" id="deleteCustomExBtn" type="button">Удалить</button>`
            : ''
        }
      </div>
    </div>
  `;

  openModal();
  detailModalContent.querySelector('#closeModalBtn').addEventListener('click', closeModal);
  detailModalContent.querySelector('#quickRepsBtn').addEventListener('click', () => {
    closeModal();
    player.start({
      id: 'quick_' + ex.id,
      name: ex.name,
      categoryLabel: 'Одиночное упражнение',
      rounds: 1,
      prepSec: 0,
      roundRestSec: 0,
      items: [
        {
          exerciseId: ex.id,
          mode: 'reps',
          sets: ex.defaultSets || 3,
          reps: ex.defaultReps || 10,
          weightKg: ex.defaultWeightKg || 0,
          restSec: ex.defaultRestSec || 60
        }
      ]
    });
  });

  const delBtn = detailModalContent.querySelector('#deleteCustomExBtn');
  if (delBtn) {
    delBtn.addEventListener('click', () => {
      if (confirm(`Удалить своё упражнение «${ex.name}»?`)) {
        deleteCustomExercise(ex.id);
        closeModal();
        refreshAll();
        showToast('Упражнение удалено');
      }
    });
  }
}

function openCreateExerciseModal() {
  let uploadedImageDataUrl = '';

  const muscleCategoryMap = {
    chest: 'Грудь',
    back: 'Спина',
    legs: 'Ноги и ягодицы',
    shoulders: 'Плечи',
    biceps: 'Бицепс',
    triceps: 'Трицепс',
    core: 'Пресс и кор'
  };

  const eqLabelMap = {
    barbell: 'Штанга',
    dumbbells: 'Гантели',
    machine: 'Тренажёры',
    cable: 'Блоки',
    none: 'Свой вес'
  };

  detailModalContent.innerHTML = `
    <div class="modal-header">
      <h2>+ Создать своё упражнение</h2>
      <button class="icon-btn" id="closeModalBtn" type="button" aria-label="Закрыть">✕</button>
    </div>
    <div class="modal-body">
      <div class="builder-form-grid">
        <div class="field-group" style="grid-column:1 / -1;">
          <label for="ceName">Название упражнения</label>
          <input id="ceName" class="input-control" type="text" placeholder="Например: Жим в Хаммере или Тяга Т-грифа">
        </div>

        <div class="field-group">
          <label for="ceMuscleGroup">Категория мышц</label>
          <select id="ceMuscleGroup" class="input-control">
            ${Object.entries(muscleCategoryMap)
              .map(([k, v]) => `<option value="${k}">${v}</option>`)
              .join('')}
          </select>
        </div>

        <div class="field-group">
          <label for="ceEquip">Инвентарь</label>
          <select id="ceEquip" class="input-control">
            ${Object.entries(eqLabelMap)
              .map(([k, v]) => `<option value="${k}">${v}</option>`)
              .join('')}
          </select>
        </div>

        <div class="field-group">
          <label for="ceSets">Подходы по умолчанию</label>
          <input id="ceSets" class="input-control" type="number" min="1" max="10" value="4">
        </div>

        <div class="field-group">
          <label for="ceReps">Повторения по умолчанию</label>
          <input id="ceReps" class="input-control" type="number" min="1" max="100" value="10">
        </div>

        <div class="field-group">
          <label for="ceWeight">Рабочий вес (кг)</label>
          <input id="ceWeight" class="input-control" type="number" min="0" max="500" step="2.5" value="20">
        </div>

        <div class="field-group">
          <label for="ceRest">Отдых между подходами (сек)</label>
          <input id="ceRest" class="input-control" type="number" min="10" max="300" step="5" value="75">
        </div>
      </div>

      <div class="field-group" style="margin-bottom:14px;">
        <label>Какие мышцы работают (отметятся на карте тела после занятия)</label>
        <div class="muscle-checkbox-grid" id="ceMusclesGrid">
          ${MUSCLE_KEYS.map(
            (mKey) => `
              <label class="muscle-check-pill">
                <input type="checkbox" value="${mKey}" ${mKey === 'chest' ? 'checked' : ''}>
                <span>${MUSCLE_LABELS[mKey]}</span>
              </label>
            `
          ).join('')}
        </div>
      </div>

      <div class="field-group" style="margin-bottom:14px;">
        <label for="ceTip">Техника / заметка</label>
        <input id="ceTip" class="input-control" type="text" placeholder="Краткая подсказка по технике выполнения">
      </div>

      <div class="field-group" style="margin-bottom:18px;">
        <label>Картинка упражнения (необязательно — иначе создастся стильная иконка)</label>
        <div style="display:flex;align-items:center;gap:12px;">
          <label class="btn btn-secondary btn-sm file-label">
            📷 Загрузить фото
            <input id="cePhotoInput" type="file" accept="image/*" hidden>
          </label>
          <span id="cePhotoStatus" style="font-size:0.8rem;color:var(--text-secondary);">Будет использована векторная иконка</span>
        </div>
      </div>

      <button class="btn btn-primary btn-lg" id="ceSaveBtn" type="button" style="width:100%;">
        ✓ Сохранить упражнение в каталог
      </button>
    </div>
  `;

  openModal();
  detailModalContent.querySelector('#closeModalBtn').addEventListener('click', closeModal);

  // Sync default checked muscle when category changes
  const groupSelect = detailModalContent.querySelector('#ceMuscleGroup');
  const defaultMuscleByGroup = {
    chest: ['chest', 'triceps'],
    back: ['lats', 'upper_back'],
    legs: ['quads', 'glutes'],
    shoulders: ['shoulders'],
    biceps: ['biceps'],
    triceps: ['triceps'],
    core: ['abs']
  };
  groupSelect.addEventListener('change', () => {
    const defaults = new Set(defaultMuscleByGroup[groupSelect.value] || []);
    detailModalContent.querySelectorAll('#ceMusclesGrid input[type="checkbox"]').forEach((cb) => {
      cb.checked = defaults.has(cb.value);
    });
  });

  // Optional photo resize to keep localStorage lightweight
  detailModalContent.querySelector('#cePhotoInput').addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 400;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
        uploadedImageDataUrl = canvas.toDataURL('image/jpeg', 0.78);
        detailModalContent.querySelector('#cePhotoStatus').textContent = '✓ Фото загружено';
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });

  detailModalContent.querySelector('#ceSaveBtn').addEventListener('click', () => {
    const name = detailModalContent.querySelector('#ceName').value.trim();
    if (!name) {
      showToast('Введи название упражнения');
      return;
    }
    const muscle = groupSelect.value;
    const equipment = detailModalContent.querySelector('#ceEquip').value;
    const checkedMuscles = Array.from(
      detailModalContent.querySelectorAll('#ceMusclesGrid input[type="checkbox"]:checked')
    ).map((cb) => cb.value);

    const primaryMuscles = checkedMuscles.length ? checkedMuscles.slice(0, 2) : [muscle === 'back' ? 'lats' : muscle === 'legs' ? 'quads' : muscle === 'core' ? 'abs' : muscle];
    const secondaryMuscles = checkedMuscles.slice(2);
    const tip = detailModalContent.querySelector('#ceTip').value.trim() || 'Выполняй подконтрольно в полной амплитуде.';

    saveCustomExercise({
      id: 'cex_' + Date.now(),
      name,
      muscle,
      muscleLabel: muscleCategoryMap[muscle] || muscle,
      equipment,
      equipmentLabel: eqLabelMap[equipment] || equipment,
      difficulty: 'Средний',
      kcalPerMin: 7.5,
      image: uploadedImageDataUrl || generateCustomExerciseSvg(equipment),
      primaryMuscles,
      secondaryMuscles,
      defaultSets: Math.max(1, Number(detailModalContent.querySelector('#ceSets').value) || 3),
      defaultReps: Math.max(1, Number(detailModalContent.querySelector('#ceReps').value) || 10),
      defaultWeightKg: Math.max(0, Number(detailModalContent.querySelector('#ceWeight').value) || 0),
      defaultRestSec: Math.max(10, Number(detailModalContent.querySelector('#ceRest').value) || 60),
      shortTip: tip,
      steps: [tip],
      mistakes: 'Не жертвуй техникой ради лишнего веса.',
      breathing: 'Выдох на усилии, вдох при возврате в исходное положение.'
    });

    closeModal();
    refreshAll();
    showToast(`✓ Упражнение «${name}» добавлено в каталог и конструктор!`);
  });
}

/* ---------- View 5: Progress, Weekly Body Map, Calendar & Cloud Backup ---------- */

function renderProgressView() {
  const container = document.getElementById('progressContainer');
  const stats = getAggregateStats();
  const history = getHistory();
  const ghCfg = getGitHubSyncConfig();

  const byDay = new Map();
  history.forEach((h) => {
    const arr = byDay.get(h.dateKey) || [];
    arr.push(h);
    byDay.set(h.dateKey, arr);
  });

  // Aggregate weekly muscle map (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const cutoffKey = toDateKey(sevenDaysAgo);
  const weeklyMuscleScores = {};
  history.forEach((h) => {
    if (h.dateKey >= cutoffKey && h.muscleScores) {
      Object.entries(h.muscleScores).forEach(([m, v]) => {
        weeklyMuscleScores[m] = (weeklyMuscleScores[m] || 0) + v;
      });
    }
  });

  const calYear = state.calendarDate.getFullYear();
  const calMonth = state.calendarDate.getMonth();
  const firstDay = new Date(calYear, calMonth, 1);
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;
  const todayKey = toDateKey(new Date());

  const monthTitle = firstDay.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  const selectedLogs = byDay.get(state.selectedDateKey) || [];

  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = toDateKey(d);
    const mins = (byDay.get(key) || []).reduce((s, x) => s + (Number(x.durationMin) || 0), 0);
    last7.push({
      label: d.toLocaleDateString('ru-RU', { weekday: 'short' }),
      mins
    });
  }
  const maxMin = Math.max(20, ...last7.map((d) => d.mins));

  container.innerHTML = `
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-icon">🔥</div>
        <div class="kpi-val">${stats.streak}</div>
        <div class="kpi-label">Серия дней подряд</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">🏅</div>
        <div class="kpi-val">${stats.totalSessions}</div>
        <div class="kpi-label">Всего тренировок</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">🏋️</div>
        <div class="kpi-val">${stats.totalVolumeKg > 0 ? `${stats.totalVolumeKg.toLocaleString('ru-RU')} кг` : `${stats.totalMinutes} мин`}</div>
        <div class="kpi-label">${stats.totalVolumeKg > 0 ? 'Суммарный тоннаж' : 'Минут активности'}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">⚡</div>
        <div class="kpi-val">${stats.totalKcal}</div>
        <div class="kpi-label">ккал ориентировочно</div>
      </div>
    </div>

    <div class="progress-grid">
      <div class="panel-card">
        <h3 style="margin:0 0 6px;font-size:1.05rem;">🧍 Карта мышц за последние 7 дней</h3>
        <p style="margin:0 0 12px;color:var(--text-secondary);font-size:0.82rem;">Показывает, какие мышечные группы получили нагрузку на этой неделе</p>
        ${renderBodyMapSVG(weeklyMuscleScores, { compact: false })}
      </div>

      <div class="panel-card">
        <div class="calendar-header">
          <button class="icon-btn" id="calPrevBtn" type="button" aria-label="Предыдущий месяц">‹</button>
          <strong style="text-transform:capitalize;">${monthTitle}</strong>
          <button class="icon-btn" id="calNextBtn" type="button" aria-label="Следующий месяц">›</button>
        </div>

        <div class="calendar-weekdays">
          <span>Пн</span><span>Вт</span><span>Ср</span><span>Чт</span><span>Пт</span><span>Сб</span><span>Вс</span>
        </div>
        <div class="calendar-days">
          ${Array.from({ length: startOffset })
            .map(() => `<span class="cal-day empty"></span>`)
            .join('')}
          ${Array.from({ length: daysInMonth })
            .map((_, idx) => {
              const dayNum = idx + 1;
              const key = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const trained = byDay.has(key);
              const isToday = key === todayKey;
              const isSelected = key === state.selectedDateKey;
              return `<button class="cal-day ${trained ? 'trained' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}" data-cal-day="${key}" type="button">${dayNum}</button>`;
            })
            .join('')}
        </div>

        <div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border);font-size:0.86rem;">
          <div style="font-weight:700;margin-bottom:6px;">Записи за ${formatDateKeyRu(state.selectedDateKey)}:</div>
          ${
            selectedLogs.length
              ? selectedLogs
                  .map(
                    (l) =>
                      `<div style="color:var(--text-secondary);padding:3px 0;">✓ <strong>${escapeHtml(l.workoutName)}</strong> · ${l.durationMin} мин${l.totalVolumeKg ? ` · ${l.totalVolumeKg} кг` : ''}</div>`
                  )
                  .join('')
              : `<div style="color:var(--text-muted);">В этот день тренировок не записано.</div>`
          }
        </div>
      </div>
    </div>

    <div class="progress-grid">
      <div class="panel-card">
        <h3 style="margin:0 0 6px;font-size:1.05rem;">Активность за последние 7 дней</h3>
        <p style="margin:0;color:var(--text-secondary);font-size:0.82rem;">Минуты тренировок по дням</p>
        <div class="week-chart">
          ${last7
            .map((d) => {
              const hPct = d.mins > 0 ? Math.max(8, Math.round((d.mins / maxMin) * 100)) : 4;
              return `
                <div class="week-bar-col">
                  <span class="week-bar-min">${d.mins > 0 ? d.mins : ''}</span>
                  <div class="week-bar-track">
                    <div class="week-bar-fill" style="height:${hPct}%;opacity:${d.mins > 0 ? 1 : 0.2}"></div>
                  </div>
                  <span class="week-bar-day">${d.label}</span>
                </div>
              `;
            })
            .join('')}
        </div>
      </div>

      <div class="panel-card">
        <h3 style="margin:0 0 6px;font-size:1.05rem;">☁️ Облачный бэкап и синхронизация</h3>
        <p style="margin:0 0 12px;color:var(--text-secondary);font-size:0.83rem;line-height:1.45;">
          Сохраняй резервную копию (история, веса, свои упражнения и программы) в Google Drive или подключи приватный <strong>GitHub Gist</strong>:
        </p>

        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;">
          <button class="btn btn-secondary btn-sm" id="shareBackupBtn" type="button">📤 Сохранить / Отправить в Google Drive</button>
        </div>

        <div class="field-group" style="margin-bottom:10px;">
          <label for="ghTokenInput">GitHub Personal Access Token (только право <code>gist</code>)</label>
          <input id="ghTokenInput" class="input-control" type="password" placeholder="ghp_..." value="${escapeAttr(ghCfg.token)}">
        </div>

        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn btn-primary btn-sm" id="ghPushBtn" type="button">↑ Сохранить в GitHub Gist</button>
          <button class="btn btn-secondary btn-sm" id="ghPullBtn" type="button">↓ Загрузить с GitHub</button>
          ${
            ghCfg.token
              ? `<button class="btn btn-ghost btn-sm" id="ghDisconnectBtn" type="button">Отключить</button>`
              : ''
          }
        </div>

        ${
          ghCfg.lastSyncAt
            ? `<div style="margin-top:8px;font-size:0.78rem;color:var(--accent);">✓ Последняя синхронизация: ${new Date(ghCfg.lastSyncAt).toLocaleString('ru-RU')}</div>`
            : ''
        }
      </div>
    </div>

    <div class="panel-card">
      <h3 style="margin:0 0 14px;font-size:1.08rem;">История тренировок (${history.length}) — нажми для просмотра карты мышц и весов</h3>
      ${
        history.length
          ? `<div class="history-list">
              ${history
                .slice(0, 30)
                .map(
                  (h) => `
                    <div class="history-item clickable" data-open-log="${h.id}">
                      <div>
                        <div style="font-weight:700;font-size:0.95rem;">${escapeHtml(h.workoutName)}</div>
                        <div style="font-size:0.8rem;color:var(--text-secondary);">
                          ${new Date(h.dateISO).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          · ${escapeHtml(h.categoryLabel || 'Тренировка')}
                        </div>
                      </div>
                      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                        <span class="badge badge-soft">⏱ ${h.durationMin} мин</span>
                        ${h.totalVolumeKg ? `<span class="badge badge-cyan">🏋️ ${h.totalVolumeKg.toLocaleString('ru-RU')} кг</span>` : ''}
                        <span class="badge badge-accent">🔥 ~${h.kcal} ккал</span>
                        <button class="btn btn-ghost btn-sm" data-del-log="${h.id}" type="button" title="Удалить запись">✕</button>
                      </div>
                    </div>
                  `
                )
                .join('')}
            </div>`
          : `<div class="empty-state">Заверши первую тренировку — здесь появится история весов, подходов и карта мышц.</div>`
      }
    </div>
  `;

  container.querySelector('#calPrevBtn').addEventListener('click', () => {
    state.calendarDate = new Date(calYear, calMonth - 1, 1);
    renderProgressView();
  });
  container.querySelector('#calNextBtn').addEventListener('click', () => {
    state.calendarDate = new Date(calYear, calMonth + 1, 1);
    renderProgressView();
  });
  container.querySelectorAll('[data-cal-day]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.selectedDateKey = btn.dataset.calDay;
      renderProgressView();
    });
  });

  container.querySelectorAll('[data-open-log]').forEach((row) => {
    row.addEventListener('click', (e) => {
      if (e.target.closest('[data-del-log]')) return;
      const item = history.find((x) => x.id === row.dataset.openLog);
      if (item) openHistoryDetailModal(item);
    });
  });

  container.querySelectorAll('[data-del-log]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteHistoryEntry(btn.dataset.delLog);
      refreshAll();
      showToast('Запись удалена');
    });
  });

  container.querySelector('#shareBackupBtn').addEventListener('click', shareOrDownloadBackup);

  const tokenInput = container.querySelector('#ghTokenInput');
  container.querySelector('#ghPushBtn').addEventListener('click', async () => {
    const token = tokenInput.value.trim();
    if (!token) {
      showToast('Сначала вставь GitHub токен с правом gist');
      return;
    }
    saveGitHubSyncConfig({ token });
    try {
      showToast('Отправка в GitHub Gist...');
      await syncPushToGist();
      showToast('✓ Прогресс сохранён в приватный GitHub Gist!');
      renderProgressView();
    } catch (err) {
      showToast('Ошибка GitHub: ' + err.message);
    }
  });

  container.querySelector('#ghPullBtn').addEventListener('click', async () => {
    const token = tokenInput.value.trim();
    if (!token) {
      showToast('Сначала вставь GitHub токен с правом gist');
      return;
    }
    saveGitHubSyncConfig({ token });
    try {
      showToast('Загрузка из GitHub Gist...');
      await syncPullFromGist();
      refreshAll();
      showToast('✓ Прогресс загружен и объединён!');
    } catch (err) {
      showToast('Ошибка GitHub: ' + err.message);
    }
  });

  const disconnectBtn = container.querySelector('#ghDisconnectBtn');
  if (disconnectBtn) {
    disconnectBtn.addEventListener('click', () => {
      clearGitHubSyncConfig();
      renderProgressView();
      showToast('Синхронизация GitHub отключена');
    });
  }
}

function openHistoryDetailModal(entry) {
  detailModalContent.innerHTML = `
    <div class="modal-header">
      <h2>${escapeHtml(entry.workoutName)}</h2>
      <button class="icon-btn" id="closeModalBtn" type="button" aria-label="Закрыть">✕</button>
    </div>
    <div class="modal-body">
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;">
        <span class="badge badge-soft">📅 ${new Date(entry.dateISO).toLocaleString('ru-RU')}</span>
        <span class="badge badge-soft">⏱ ${entry.durationMin} мин</span>
        ${entry.totalVolumeKg ? `<span class="badge badge-cyan">🏋️ ${entry.totalVolumeKg.toLocaleString('ru-RU')} кг</span>` : ''}
        <span class="badge badge-accent">🔥 ~${entry.kcal} ккал</span>
      </div>

      ${
        entry.muscleScores && Object.keys(entry.muscleScores).length
          ? `<div class="panel-card" style="padding:14px;margin-bottom:16px;border-radius:16px;">
              <div style="font-weight:700;font-size:0.88rem;margin-bottom:8px;">Задействованные мышцы</div>
              ${renderBodyMapSVG(entry.muscleScores, { compact: false })}
            </div>`
          : ''
      }

      ${
        entry.setsLog && entry.setsLog.length
          ? `<h3 style="margin:0 0 8px;font-size:0.98rem;">Записанные подходы и веса (${entry.setsLog.length})</h3>
            <div class="detail-list">
              ${entry.setsLog
                .map(
                  (s) => `
                    <div class="detail-step" style="justify-content:space-between;align-items:center;">
                      <span><strong>${escapeHtml(s.exerciseName)}</strong> · подход ${s.set}</span>
                      <span class="badge badge-accent">${s.weightKg ? `${s.weightKg} кг × ` : ''}${s.reps} повт.</span>
                    </div>
                  `
                )
                .join('')}
            </div>`
          : `<p style="color:var(--text-secondary);font-size:0.88rem;">Тренировка выполнялась в интервальном режиме по времени.</p>`
      }
    </div>
  `;
  openModal();
  detailModalContent.querySelector('#closeModalBtn').addEventListener('click', closeModal);
}

async function shareOrDownloadBackup() {
  const json = JSON.stringify(exportAllData(), null, 2);
  const filename = `fitpulse-backup-${toDateKey(new Date())}.json`;
  const file = new File([json], filename, { type: 'application/json' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: 'Бэкап FitPulse',
        text: 'Резервная копия тренировок и прогресса FitPulse',
        files: [file]
      });
      showToast('Файл передан (можно выбрать Google Drive)');
      return;
    } catch (err) {
      if (err && err.name === 'AbortError') return;
    }
  }
  downloadBackupFile(json, filename);
}

function downloadBackupFile(jsonStr, filename) {
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast('JSON-бэкап скачан (его можно загрузить в Google Drive)');
}

/* ---------- Modal & Toast Helpers ---------- */

function openModal() {
  detailModal.classList.add('open');
  detailModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  detailModal.classList.remove('open');
  detailModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function showToast(message) {
  const container = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

function pluralDays(n) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'день';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'дня';
  return 'дней';
}

function formatDateKeyRu(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttr(str) {
  return escapeHtml(str).replace(/"/g, '&quot;');
}

/* ---------- Boot ---------- */

function init() {
  setTheme(getTheme());

  document.querySelectorAll('[data-view]').forEach((btn) => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  document.getElementById('themeToggleDesktop').addEventListener('click', toggleTheme);
  document.getElementById('themeToggleMobile').addEventListener('click', toggleTheme);
  document.getElementById('quickCreateWorkoutBtn').addEventListener('click', () => switchView('builder'));

  const createExBtn = document.getElementById('createCustomExerciseBtn');
  if (createExBtn) {
    createExBtn.addEventListener('click', openCreateExerciseModal);
  }

  document.getElementById('exerciseSearch').addEventListener('input', (e) => {
    state.exerciseQuery = e.target.value;
    renderExercisesView();
  });

  document.getElementById('exportDataBtn').addEventListener('click', () => {
    const json = JSON.stringify(exportAllData(), null, 2);
    downloadBackupFile(json, `fitpulse-backup-${toDateKey(new Date())}.json`);
  });

  document.getElementById('importDataInput').addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importAllData(JSON.parse(String(reader.result)));
        refreshAll();
        showToast('✓ Резервная копия успешно восстановлена!');
      } catch (err) {
        showToast('Не удалось прочитать файл: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  detailModal.addEventListener('click', (e) => {
    if (e.target === detailModal) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && detailModal.classList.contains('open')) {
      closeModal();
    }
  });

  updateStreakBadges();
  renderWorkoutsView();
}

init();
