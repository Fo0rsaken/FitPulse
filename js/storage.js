// LocalStorage persistence + custom exercises + weight memory + optional GitHub Gist sync

const KEYS = {
  THEME: 'fitpulse_theme',
  HISTORY: 'fitpulse_history_v1',
  CUSTOM_WORKOUTS: 'fitpulse_custom_workouts_v1',
  CUSTOM_EXERCISES: 'fitpulse_custom_exercises_v1',
  SETTINGS: 'fitpulse_settings_v1',
  GH_SYNC: 'fitpulse_gh_sync_v1'
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Storage write failed:', err);
  }
}

export function getTheme() {
  return localStorage.getItem(KEYS.THEME) || 'dark';
}

export function setTheme(theme) {
  localStorage.setItem(KEYS.THEME, theme);
  document.documentElement.setAttribute('data-theme', theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#0B0F17' : '#F3F6FB');
}

export function getSettings() {
  return readJSON(KEYS.SETTINGS, { soundEnabled: true, voiceEnabled: false });
}

export function saveSettings(patch) {
  const next = { ...getSettings(), ...patch };
  writeJSON(KEYS.SETTINGS, next);
  return next;
}

export function getHistory() {
  return readJSON(KEYS.HISTORY, []);
}

export function addHistoryEntry(entry) {
  const list = getHistory();
  const full = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    dateISO: new Date().toISOString(),
    dateKey: toDateKey(new Date()),
    ...entry
  };
  list.unshift(full);
  writeJSON(KEYS.HISTORY, list);
  autoPushGistIfConfigured().catch(() => {});
  return full;
}

export function deleteHistoryEntry(id) {
  const next = getHistory().filter((item) => item.id !== id);
  writeJSON(KEYS.HISTORY, next);
  autoPushGistIfConfigured().catch(() => {});
}

export function getLastPerformance(exerciseId) {
  const history = getHistory();
  for (const h of history) {
    if (!Array.isArray(h.setsLog)) continue;
    for (let i = h.setsLog.length - 1; i >= 0; i--) {
      const s = h.setsLog[i];
      if (s.exerciseId === exerciseId) {
        return { weightKg: Number(s.weightKg) || 0, reps: Number(s.reps) || 0 };
      }
    }
  }
  return null;
}

export function getCustomWorkouts() {
  return readJSON(KEYS.CUSTOM_WORKOUTS, []);
}

export function saveCustomWorkout(workout) {
  const list = getCustomWorkouts();
  const idx = list.findIndex((w) => w.id === workout.id);
  const record = {
    ...workout,
    isCustom: true,
    updatedAt: new Date().toISOString()
  };
  if (idx >= 0) {
    list[idx] = record;
  } else {
    list.unshift(record);
  }
  writeJSON(KEYS.CUSTOM_WORKOUTS, list);
  autoPushGistIfConfigured().catch(() => {});
  return record;
}

export function deleteCustomWorkout(id) {
  const next = getCustomWorkouts().filter((w) => w.id !== id);
  writeJSON(KEYS.CUSTOM_WORKOUTS, next);
  autoPushGistIfConfigured().catch(() => {});
}

/* ---------- Custom Exercises ---------- */

export function getCustomExercises() {
  return readJSON(KEYS.CUSTOM_EXERCISES, []);
}

export function saveCustomExercise(exercise) {
  const list = getCustomExercises();
  const idx = list.findIndex((e) => e.id === exercise.id);
  const record = {
    ...exercise,
    isCustom: true,
    updatedAt: new Date().toISOString()
  };
  if (idx >= 0) {
    list[idx] = record;
  } else {
    list.unshift(record);
  }
  writeJSON(KEYS.CUSTOM_EXERCISES, list);
  autoPushGistIfConfigured().catch(() => {});
  return record;
}

export function deleteCustomExercise(id) {
  const next = getCustomExercises().filter((e) => e.id !== id);
  writeJSON(KEYS.CUSTOM_EXERCISES, next);
  autoPushGistIfConfigured().catch(() => {});
}

export function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function calculateStreak(history = getHistory()) {
  if (!history.length) return 0;
  const days = new Set(history.map((h) => h.dateKey));
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0);

  if (!days.has(toDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (days.has(toDateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function getAggregateStats() {
  const history = getHistory();
  const totalSessions = history.length;
  const totalMinutes = history.reduce((sum, h) => sum + (Number(h.durationMin) || 0), 0);
  const totalKcal = history.reduce((sum, h) => sum + (Number(h.kcal) || 0), 0);
  const totalVolumeKg = history.reduce((sum, h) => sum + (Number(h.totalVolumeKg) || 0), 0);
  const streak = calculateStreak(history);
  return { totalSessions, totalMinutes, totalKcal, totalVolumeKg, streak };
}

export function exportAllData() {
  return {
    app: 'FitPulse',
    version: 2,
    exportedAt: new Date().toISOString(),
    history: getHistory(),
    customWorkouts: getCustomWorkouts(),
    customExercises: getCustomExercises(),
    settings: getSettings()
  };
}

export function importAllData(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Некорректный формат файла');
  }
  if (Array.isArray(payload.history)) {
    const existing = getHistory();
    const map = new Map(existing.map((e) => [e.id, e]));
    payload.history.forEach((e) => {
      if (e && e.id) map.set(e.id, e);
    });
    const merged = Array.from(map.values()).sort((a, b) =>
      String(b.dateISO || '').localeCompare(String(a.dateISO || ''))
    );
    writeJSON(KEYS.HISTORY, merged);
  }
  if (Array.isArray(payload.customWorkouts)) {
    const existing = getCustomWorkouts();
    const map = new Map(existing.map((w) => [w.id, w]));
    payload.customWorkouts.forEach((w) => {
      if (w && w.id) map.set(w.id, w);
    });
    writeJSON(KEYS.CUSTOM_WORKOUTS, Array.from(map.values()));
  }
  if (Array.isArray(payload.customExercises)) {
    const existing = getCustomExercises();
    const map = new Map(existing.map((e) => [e.id, e]));
    payload.customExercises.forEach((e) => {
      if (e && e.id) map.set(e.id, e);
    });
    writeJSON(KEYS.CUSTOM_EXERCISES, Array.from(map.values()));
  }
  if (payload.settings && typeof payload.settings === 'object') {
    saveSettings(payload.settings);
  }
}

/* ---------- GitHub Gist Cloud Sync (PC <-> Phone) ---------- */

export function getGitHubSyncConfig() {
  return readJSON(KEYS.GH_SYNC, { token: '', gistId: '', lastSyncAt: '' });
}

export function saveGitHubSyncConfig(patch) {
  const next = { ...getGitHubSyncConfig(), ...patch };
  writeJSON(KEYS.GH_SYNC, next);
  return next;
}

export function clearGitHubSyncConfig() {
  localStorage.removeItem(KEYS.GH_SYNC);
}

async function ghFetch(url, token, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new Error(`GitHub API ${res.status}: ${errBody.slice(0, 120)}`);
  }
  return res.json();
}

export async function syncPushToGist() {
  const cfg = getGitHubSyncConfig();
  if (!cfg.token) throw new Error('Укажи GitHub токен (scope: gist)');
  const content = JSON.stringify(exportAllData(), null, 2);
  let gistId = cfg.gistId;

  if (gistId) {
    await ghFetch(`https://api.github.com/gists/${gistId}`, cfg.token, {
      method: 'PATCH',
      body: JSON.stringify({
        files: { 'fitpulse-data.json': { content } }
      })
    });
  } else {
    const gists = await ghFetch('https://api.github.com/gists?per_page=30', cfg.token);
    const existing = gists.find((g) => g.files && g.files['fitpulse-data.json']);
    if (existing) {
      gistId = existing.id;
      await ghFetch(`https://api.github.com/gists/${gistId}`, cfg.token, {
        method: 'PATCH',
        body: JSON.stringify({
          files: { 'fitpulse-data.json': { content } }
        })
      });
    } else {
      const created = await ghFetch('https://api.github.com/gists', cfg.token, {
        method: 'POST',
        body: JSON.stringify({
          description: 'FitPulse — облачное сохранение тренировок и прогресса',
          public: false,
          files: { 'fitpulse-data.json': { content } }
        })
      });
      gistId = created.id;
    }
  }

  return saveGitHubSyncConfig({ gistId, lastSyncAt: new Date().toISOString() });
}

export async function syncPullFromGist() {
  const cfg = getGitHubSyncConfig();
  if (!cfg.token) throw new Error('Укажи GitHub токен (scope: gist)');
  let gistId = cfg.gistId;
  let gistData = null;

  if (gistId) {
    gistData = await ghFetch(`https://api.github.com/gists/${gistId}`, cfg.token);
  } else {
    const gists = await ghFetch('https://api.github.com/gists?per_page=30', cfg.token);
    const found = gists.find((g) => g.files && g.files['fitpulse-data.json']);
    if (!found) {
      return syncPushToGist();
    }
    gistId = found.id;
    gistData = await ghFetch(`https://api.github.com/gists/${gistId}`, cfg.token);
  }

  const file = gistData?.files?.['fitpulse-data.json'];
  if (file && file.content) {
    importAllData(JSON.parse(file.content));
  }
  return saveGitHubSyncConfig({ gistId, lastSyncAt: new Date().toISOString() });
}

async function autoPushGistIfConfigured() {
  const cfg = getGitHubSyncConfig();
  if (cfg.token) {
    await syncPushGistSafe();
  }
}

async function syncPushGistSafe() {
  try {
    await syncPushToGist();
  } catch {
    // Silent fail on background auto-sync
  }
}
