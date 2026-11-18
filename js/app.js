import { EXERCISES, EXERCISES_MAP, BUILTIN_WORKOUTS, estimateWorkoutStats } from './data.js';
import {
  getTheme,
  setTheme,
  getHistory,
  deleteHistoryEntry,
  getCustomWorkouts,
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
      showToast('Тренировка добавлена в календарь прогресса!');
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
    onToast: (msg) => showToast(msg)
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

  // Hero card
  const heroEl = document.getElementById('heroCard');
  heroEl.innerHTML = `
    <div>
      <span class="hero-badge">⚡ Тренировка дня</span>
      <h2 class="hero-title">${escapeHtml(featured.name)}</h2>
      <p class="hero-desc">${escapeHtml(featured.description)}</p>
      <div class="hero-actions">
        <button class="btn btn-primary btn-lg" id="heroStartBtn" type="button">▶ Начать сейчас</button>
        <button class="btn btn-secondary btn-lg" id="heroTimerBtn" type="button">⏱ Быстрый Табата</button>
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
        <div class="hero-stat-num">${stats.totalMinutes}</div>
        <div class="hero-stat-label">Минут всего</div>
      </div>
      <div class="hero-stat-box">
        <div class="hero-stat-num">${stats.totalKcal}</div>
        <div class="hero-stat-label">ккал сожжено</div>
      </div>
    </div>
  `;

  heroEl.querySelector('#heroStartBtn').addEventListener('click', () => player.start(featured));
  heroEl.querySelector('#heroTimerBtn').addEventListener('click', () => switchView('timer'));

  // Category filters
  const cats = [
    { id: 'all', label: 'Все программы' },
    { id: 'bodyweight', label: 'Без инвентаря' },
    { id: 'hiit', label: 'HIIT / Табата' },
    { id: 'dumbbells', label: 'С гантелями' },
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

  // Grid
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
              <span>🔁 ${w.rounds} ${w.rounds === 1 ? 'круг' : w.rounds < 5 ? 'круга' : 'кругов'}</span>
            </div>
          </div>
          <div class="workout-card-body">
            <h3 class="workout-card-title">${escapeHtml(w.name)}</h3>
            <p class="workout-card-desc">${escapeHtml(w.description)}</p>
            <div class="workout-thumbs">
              ${thumbs
                .map((it) => {
                  const ex = EXERCISES_MAP[it.exerciseId];
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
        <span class="badge badge-soft">🔁 Кругов: ${workout.rounds}</span>
      </div>
      <p style="margin:0 0 16px;color:var(--text-secondary);line-height:1.5;">${escapeHtml(workout.description)}</p>
      <div class="detail-list">
        ${workout.items
          .map((item, idx) => {
            const ex = EXERCISES_MAP[item.exerciseId];
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

/* ---------- View 2: Exercises ---------- */

function renderExercisesView() {
  const muscles = [
    { id: 'all', label: 'Все мышцы' },
    { id: 'full', label: 'Всё тело' },
    { id: 'legs', label: 'Ноги и ягодицы' },
    { id: 'chest', label: 'Грудь и плечи' },
    { id: 'back', label: 'Спина' },
    { id: 'core', label: 'Кор и пресс' },
    { id: 'stretch', label: 'Растяжка' }
  ];

  const equip = [
    { id: 'all', label: 'Любой инвентарь' },
    { id: 'none', label: 'Без инвентаря' },
    { id: 'dumbbells', label: 'Гантели' }
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
  const list = EXERCISES.filter((ex) => {
    if (state.muscleFilter !== 'all' && ex.muscle !== state.muscleFilter) return false;
    if (state.equipmentFilter !== 'all' && ex.equipment !== state.equipmentFilter) return false;
    if (q && !ex.name.toLowerCase().includes(q) && !ex.muscleLabel.toLowerCase().includes(q)) return false;
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
          </div>
          <div class="exercise-card-body">
            <h3 class="exercise-card-title">${escapeHtml(ex.name)}</h3>
            <div class="exercise-tags">
              <span class="badge badge-soft">${escapeHtml(ex.muscleLabel)}</span>
              <span class="badge ${ex.equipment === 'dumbbells' ? 'badge-amber' : 'badge-cyan'}">${escapeHtml(ex.equipmentLabel)}</span>
            </div>
          </div>
        </article>
      `
    )
    .join('');

  grid.querySelectorAll('[data-open-ex]').forEach((card) => {
    const open = () => {
      const ex = EXERCISES_MAP[card.dataset.openEx];
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
  detailModalContent.innerHTML = `
    <div class="modal-header">
      <h2>${escapeHtml(ex.name)}</h2>
      <button class="icon-btn" id="closeModalBtn" type="button" aria-label="Закрыть">✕</button>
    </div>
    <div class="modal-body">
      <img class="modal-hero-img" src="${ex.image}" alt="${escapeAttr(ex.name)}">
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;">
        <span class="badge badge-accent">${escapeHtml(ex.muscleLabel)}</span>
        <span class="badge badge-soft">${escapeHtml(ex.equipmentLabel)}</span>
        <span class="badge badge-soft">Сложность: ${escapeHtml(ex.difficulty)}</span>
        <span class="badge badge-soft">~${ex.kcalPerMin} ккал/мин</span>
      </div>

      <h3 style="margin:0 0 8px;font-size:1rem;">Техника выполнения</h3>
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
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px;">
        <div class="panel-card" style="padding:14px;border-radius:14px;">
          <div style="font-weight:700;font-size:0.84rem;color:var(--coral);margin-bottom:4px;">⚠️ Частые ошибки</div>
          <div style="font-size:0.84rem;color:var(--text-secondary);line-height:1.45;">${escapeHtml(ex.mistakes)}</div>
        </div>
        <div class="panel-card" style="padding:14px;border-radius:14px;">
          <div style="font-weight:700;font-size:0.84rem;color:var(--cyan);margin-bottom:4px;">💨 Дыхание</div>
          <div style="font-size:0.84rem;color:var(--text-secondary);line-height:1.45;">${escapeHtml(ex.breathing)}</div>
        </div>
      </div>

      <button class="btn btn-primary btn-lg" id="quickPracticeBtn" type="button" style="width:100%;">
        ▶ Быстрый подход с таймером (45 сек)
      </button>
    </div>
  `;

  openModal();
  detailModalContent.querySelector('#closeModalBtn').addEventListener('click', closeModal);
  detailModalContent.querySelector('#quickPracticeBtn').addEventListener('click', () => {
    closeModal();
    player.start({
      id: 'quick_' + ex.id,
      name: `Быстрый подход: ${ex.name}`,
      categoryLabel: 'Одиночное упражнение',
      rounds: 1,
      prepSec: 5,
      roundRestSec: 0,
      items: [{ exerciseId: ex.id, mode: 'time', durationSec: 45, restSec: 0 }]
    });
  });
}

/* ---------- View 5: Progress, Calendar & Cloud Backup ---------- */

function renderProgressView() {
  const container = document.getElementById('progressContainer');
  const stats = getAggregateStats();
  const history = getHistory();
  const ghCfg = getGitHubSyncConfig();

  // Build map dateKey -> entries
  const byDay = new Map();
  history.forEach((h) => {
    const arr = byDay.get(h.dateKey) || [];
    arr.push(h);
    byDay.set(h.dateKey, arr);
  });

  // Calendar math
  const calYear = state.calendarDate.getFullYear();
  const calMonth = state.calendarDate.getMonth();
  const firstDay = new Date(calYear, calMonth, 1);
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday = 0
  const todayKey = toDateKey(new Date());

  const monthTitle = firstDay.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  const selectedLogs = byDay.get(state.selectedDateKey) || [];

  // Last 7 days bar chart
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
        <div class="kpi-icon">⏱</div>
        <div class="kpi-val">${stats.totalMinutes}</div>
        <div class="kpi-label">Минут активности</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">⚡</div>
        <div class="kpi-val">${stats.totalKcal}</div>
        <div class="kpi-label">ккал ориентировочно</div>
      </div>
    </div>

    <div class="progress-grid">
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
                      `<div style="color:var(--text-secondary);padding:3px 0;">✓ <strong>${escapeHtml(l.workoutName)}</strong> · ${l.durationMin} мин · ~${l.kcal} ккал</div>`
                  )
                  .join('')
              : `<div style="color:var(--text-muted);">В этот день тренировок не записано.</div>`
          }
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:20px;">
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
            По умолчанию записи хранятся в браузере устройства. Чтобы переносить прогресс между ПК и телефоном, сохраняй JSON-бэкап в Google Drive или подключи приватный <strong>GitHub Gist</strong>:
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
    </div>

    <div class="panel-card">
      <h3 style="margin:0 0 14px;font-size:1.08rem;">История тренировок (${history.length})</h3>
      ${
        history.length
          ? `<div class="history-list">
              ${history
                .slice(0, 30)
                .map(
                  (h) => `
                    <div class="history-item">
                      <div>
                        <div style="font-weight:700;font-size:0.95rem;">${escapeHtml(h.workoutName)}</div>
                        <div style="font-size:0.8rem;color:var(--text-secondary);">
                          ${new Date(h.dateISO).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          · ${escapeHtml(h.categoryLabel || 'Тренировка')}
                        </div>
                      </div>
                      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                        <span class="badge badge-soft">⏱ ${h.durationMin} мин</span>
                        <span class="badge badge-accent">🔥 ~${h.kcal} ккал</span>
                        <button class="btn btn-ghost btn-sm" data-del-log="${h.id}" type="button" title="Удалить запись">✕</button>
                      </div>
                    </div>
                  `
                )
                .join('')}
            </div>`
          : `<div class="empty-state">Заверши первую тренировку — и здесь появится полная история твоих достижений.</div>`
      }
    </div>
  `;

  // Calendar events
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

  // History delete
  container.querySelectorAll('[data-del-log]').forEach((btn) => {
    btn.addEventListener('click', () => {
      deleteHistoryEntry(btn.dataset.delLog);
      refreshAll();
      showToast('Запись удалена');
    });
  });

  // Share / Drive backup button
  container.querySelector('#shareBackupBtn').addEventListener('click', shareOrDownloadBackup);

  // GitHub Gist sync buttons
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
