import { getAllExercises, getExerciseById, estimateWorkoutStats } from './data.js';
import { getCustomWorkouts, saveCustomWorkout, deleteCustomWorkout } from './storage.js';
import { computeMuscleScores, renderBodyMapSVG } from './bodymap.js';

export class WorkoutBuilder {
  constructor(container, { onSave, onStart, onToast, onOpenCreateExercise } = {}) {
    this.container = container;
    this.onSave = onSave;
    this.onStart = onStart;
    this.onToast = onToast;
    this.onOpenCreateExercise = onOpenCreateExercise;
    this.pickerQuery = '';
    this.pickerMuscle = 'all';
    this.resetDraft();
  }

  resetDraft() {
    this.draft = {
      id: '',
      name: '',
      description: '',
      category: 'custom',
      categoryLabel: 'Моя программа',
      difficulty: 'Средний',
      rounds: 1,
      prepSec: 5,
      roundRestSec: 45,
      items: [
        { exerciseId: 'barbell-bench-press', mode: 'reps', sets: 4, reps: 8, weightKg: 60, restSec: 90, durationSec: 40 },
        { exerciseId: 'lat-pulldown', mode: 'reps', sets: 4, reps: 12, weightKg: 45, restSec: 75, durationSec: 40 },
        { exerciseId: 'barbell-squat', mode: 'reps', sets: 4, reps: 8, weightKg: 70, restSec: 120, durationSec: 40 }
      ]
    };
  }

  loadForEdit(workout) {
    this.draft = JSON.parse(JSON.stringify(workout));
    this.render();
    this.container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  addExercise(exerciseId) {
    const ex = getExerciseById(exerciseId);
    const isRepsDefault = !ex || ex.isGymTop40 || ex.isCustom || ex.equipment !== 'none';
    this.draft.items.push({
      exerciseId,
      mode: isRepsDefault ? 'reps' : 'time',
      durationSec: 40,
      restSec: ex?.defaultRestSec ?? (isRepsDefault ? 75 : 15),
      sets: ex?.defaultSets ?? 3,
      reps: ex?.defaultReps ?? 10,
      weightKg: ex?.defaultWeightKg ?? 0
    });
    this.render();
  }

  removeItem(index) {
    this.draft.items.splice(index, 1);
    this.render();
  }

  moveItem(index, dir) {
    const target = index + dir;
    if (target < 0 || target >= this.draft.items.length) return;
    const arr = this.draft.items;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    this.render();
  }

  saveDraft(andStart = false) {
    const name = this.draft.name.trim();
    if (!name) {
      if (this.onToast) this.onToast('Укажи название тренировки');
      return;
    }
    if (!this.draft.items.length) {
      if (this.onToast) this.onToast('Добавь хотя бы одно упражнение');
      return;
    }

    const firstEx = getExerciseById(this.draft.items[0].exerciseId);
    const workout = {
      id: this.draft.id || 'custom_' + Date.now(),
      name,
      description:
        this.draft.description.trim() ||
        `Персональная программа: ${this.draft.items.length} упр., ${this.draft.rounds} кр.`,
      category: 'custom',
      categoryLabel: 'Моя программа',
      difficulty: this.draft.difficulty || 'Средний',
      rounds: Math.max(1, Number(this.draft.rounds) || 1),
      prepSec: Math.max(0, Number(this.draft.prepSec) || 5),
      roundRestSec: Math.max(0, Number(this.draft.roundRestSec) || 30),
      coverImage: firstEx ? firstEx.image : 'assets/exercises/barbell-bench-press.svg',
      items: this.draft.items.map((it) =>
        it.mode === 'reps'
          ? {
              exerciseId: it.exerciseId,
              mode: 'reps',
              sets: Math.max(1, Number(it.sets) || 3),
              reps: Math.max(1, Number(it.reps) || 10),
              weightKg: Math.max(0, Number(it.weightKg) || 0),
              restSec: Math.max(0, Number(it.restSec) || 60)
            }
          : {
              exerciseId: it.exerciseId,
              mode: 'time',
              durationSec: Math.max(5, Number(it.durationSec) || 30),
              restSec: Math.max(0, Number(it.restSec) || 15)
            }
      )
    };

    const saved = saveCustomWorkout(workout);
    if (this.onToast) this.onToast(`Программа «${saved.name}» сохранена`);
    this.resetDraft();
    this.render();
    if (this.onSave) this.onSave(saved);
    if (andStart && this.onStart) this.onStart(saved);
  }

  render() {
    const customList = getCustomWorkouts();
    const allEx = getAllExercises();
    const q = this.pickerQuery.trim().toLowerCase();
    const filteredEx = allEx.filter((ex) => {
      if (this.pickerMuscle !== 'all' && ex.muscle !== this.pickerMuscle) return false;
      if (q && !ex.name.toLowerCase().includes(q) && !ex.muscleLabel.toLowerCase().includes(q)) return false;
      return true;
    });

    const stats = this.draft.items.length
      ? estimateWorkoutStats(this.draft)
      : { minutes: 0, kcal: 0 };

    const { scores: draftScores } = computeMuscleScores(this.draft.items, getExerciseById);

    this.container.innerHTML = `
      <div class="builder-layout">
        <div class="panel-card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;gap:10px;flex-wrap:wrap;">
            <h3 style="margin:0;font-size:1.1rem;">${this.draft.id ? 'Редактирование программы' : 'Новая тренировка'}</h3>
            <span class="badge badge-soft">~${stats.minutes} мин · ~${stats.kcal} ккал</span>
          </div>

          <div class="builder-form-grid">
            <div class="field-group" style="grid-column:1 / -1;">
              <label for="bName">Название программы</label>
              <input id="bName" class="input-control" type="text" placeholder="Например: Грудь + Трицепс в зале" value="${escapeAttr(this.draft.name)}">
            </div>

            <div class="field-group" style="grid-column:1 / -1;">
              <label for="bDesc">Краткое описание (необязательно)</label>
              <input id="bDesc" class="input-control" type="text" placeholder="Цель тренировки или заметки" value="${escapeAttr(this.draft.description)}">
            </div>

            <div class="field-group">
              <label for="bRounds">Количество кругов</label>
              <input id="bRounds" class="input-control" type="number" min="1" max="10" value="${this.draft.rounds}">
            </div>

            <div class="field-group">
              <label for="bDifficulty">Сложность</label>
              <select id="bDifficulty" class="input-control">
                ${['Лёгкий', 'Средний', 'Высокий']
                  .map((lvl) => `<option value="${lvl}" ${this.draft.difficulty === lvl ? 'selected' : ''}>${lvl}</option>`)
                  .join('')}
              </select>
            </div>
          </div>

          <div style="display:flex;align-items:center;justify-content:space-between;margin:16px 0 10px;">
            <strong style="font-size:0.95rem;">Упражнения в программе (${this.draft.items.length})</strong>
            ${
              this.draft.id
                ? `<button class="btn btn-ghost btn-sm" id="bCancelEditBtn" type="button">Отменить правку</button>`
                : ''
            }
          </div>

          <div style="display:flex;flex-direction:column;gap:10px;" id="builderItemsList">
            ${
              this.draft.items.length
                ? this.draft.items
                    .map((item, idx) => {
                      const ex = getExerciseById(item.exerciseId);
                      if (!ex) return '';
                      return `
                        <div class="builder-item" data-idx="${idx}">
                          <div class="builder-item-top">
                            <img src="${ex.image}" alt="${escapeAttr(ex.name)}">
                            <div style="flex:1;min-width:0;">
                              <div style="font-weight:700;font-size:0.92rem;">${idx + 1}. ${escapeHtml(ex.name)}</div>
                              <div style="font-size:0.76rem;color:var(--text-secondary);">${escapeHtml(ex.muscleLabel)} · ${escapeHtml(ex.equipmentLabel)}</div>
                            </div>
                            <button class="icon-btn" data-move-up="${idx}" type="button" title="Выше" ${idx === 0 ? 'disabled' : ''}>↑</button>
                            <button class="icon-btn" data-move-down="${idx}" type="button" title="Ниже" ${idx === this.draft.items.length - 1 ? 'disabled' : ''}>↓</button>
                            <button class="icon-btn" data-remove="${idx}" type="button" title="Удалить" style="color:var(--coral);">✕</button>
                          </div>

                          <div class="builder-item-fields ${item.mode === 'reps' ? 'builder-item-fields-4' : ''}">
                            <div class="field-group">
                              <label>Режим</label>
                              <select class="input-control" data-field="mode" data-idx="${idx}">
                                <option value="reps" ${item.mode === 'reps' ? 'selected' : ''}>Вес × повт.</option>
                                <option value="time" ${item.mode === 'time' ? 'selected' : ''}>По времени</option>
                              </select>
                            </div>
                            ${
                              item.mode === 'reps'
                                ? `
                                  <div class="field-group">
                                    <label>Подх. / Повт.</label>
                                    <div style="display:flex;gap:5px;">
                                      <input class="input-control" type="number" min="1" max="12" value="${item.sets || 3}" data-field="sets" data-idx="${idx}" title="Подходы">
                                      <input class="input-control" type="number" min="1" max="100" value="${item.reps || 10}" data-field="reps" data-idx="${idx}" title="Повторения">
                                    </div>
                                  </div>
                                  <div class="field-group">
                                    <label>Вес (кг)</label>
                                    <input class="input-control" type="number" min="0" max="500" step="2.5" value="${item.weightKg ?? 0}" data-field="weightKg" data-idx="${idx}">
                                  </div>
                                `
                                : `
                                  <div class="field-group">
                                    <label>Работа (сек)</label>
                                    <input class="input-control" type="number" min="5" max="300" step="5" value="${item.durationSec || 40}" data-field="durationSec" data-idx="${idx}">
                                  </div>
                                `
                            }
                            <div class="field-group">
                              <label>Отдых (сек)</label>
                              <input class="input-control" type="number" min="0" max="300" step="5" value="${item.restSec ?? 60}" data-field="restSec" data-idx="${idx}">
                            </div>
                          </div>
                        </div>
                      `;
                    })
                    .join('')
                : `<div class="empty-state">Выбери упражнения из списка справа →</div>`
            }
          </div>

          ${
            this.draft.items.length
              ? `<div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--border);">
                  <div style="font-weight:700;font-size:0.86rem;margin-bottom:8px;color:var(--text-secondary);">Какие мышцы покроет эта программа:</div>
                  ${renderBodyMapSVG(draftScores, { compact: true })}
                </div>`
              : ''
          }

          <div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap;">
            <button class="btn btn-primary" id="bSaveBtn" type="button" style="flex:1;">Сохранить программу</button>
            <button class="btn btn-secondary" id="bSaveStartBtn" type="button">Сохранить и запустить ▶</button>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:20px;">
          <div class="panel-card">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px;flex-wrap:wrap;">
              <h3 style="margin:0;font-size:1.05rem;">База упражнений (${allEx.length})</h3>
              <button class="btn btn-secondary btn-sm" id="bCreateCustomExBtn" type="button">+ Своё упражнение</button>
            </div>

            <div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap;">
              <input id="bPickerSearch" class="input-control" type="search" placeholder="Поиск (жим, тяга, присед...)" value="${escapeAttr(this.pickerQuery)}" style="flex:1;min-width:150px;">
              <select id="bPickerMuscle" class="input-control" style="width:auto;">
                <option value="all" ${this.pickerMuscle === 'all' ? 'selected' : ''}>Все мышцы</option>
                <option value="chest" ${this.pickerMuscle === 'chest' ? 'selected' : ''}>Грудь</option>
                <option value="back" ${this.pickerMuscle === 'back' ? 'selected' : ''}>Спина</option>
                <option value="legs" ${this.pickerMuscle === 'legs' ? 'selected' : ''}>Ноги</option>
                <option value="shoulders" ${this.pickerMuscle === 'shoulders' ? 'selected' : ''}>Плечи</option>
                <option value="biceps" ${this.pickerMuscle === 'biceps' ? 'selected' : ''}>Бицепс</option>
                <option value="triceps" ${this.pickerMuscle === 'triceps' ? 'selected' : ''}>Трицепс</option>
                <option value="core" ${this.pickerMuscle === 'core' ? 'selected' : ''}>Пресс</option>
              </select>
            </div>

            <div class="picker-list">
              ${
                filteredEx.length
                  ? filteredEx
                      .map(
                        (ex) => `
                          <div class="picker-row">
                            <img src="${ex.image}" alt="${escapeAttr(ex.name)}">
                            <div style="flex:1;min-width:0;">
                              <div style="font-weight:700;font-size:0.86rem;">${escapeHtml(ex.name)}</div>
                              <div style="font-size:0.74rem;color:var(--text-secondary);">${escapeHtml(ex.muscleLabel)} · ${escapeHtml(ex.equipmentLabel)}</div>
                            </div>
                            <button class="btn btn-secondary btn-sm" data-add-ex="${ex.id}" type="button">+</button>
                          </div>
                        `
                      )
                      .join('')
                  : `<div style="padding:18px;text-align:center;color:var(--text-muted);font-size:0.86rem;">Ничего не найдено</div>`
              }
            </div>
          </div>

          <div class="panel-card">
            <h3 style="margin:0 0 8px;font-size:1.05rem;">Мои сохранённые программы (${customList.length})</h3>
            ${
              customList.length
                ? `<div class="custom-saved-list">
                    ${customList
                      .map((w) => {
                        const st = estimateWorkoutStats(w);
                        return `
                          <div class="picker-row">
                            <img src="${w.coverImage}" alt="${escapeAttr(w.name)}">
                            <div style="flex:1;min-width:0;">
                              <div style="font-weight:700;font-size:0.9rem;">${escapeHtml(w.name)}</div>
                              <div style="font-size:0.76rem;color:var(--text-secondary);">${w.items.length} упр. · ~${st.minutes} мин</div>
                            </div>
                            <button class="btn btn-primary btn-sm" data-run-custom="${w.id}" type="button">▶</button>
                            <button class="btn btn-secondary btn-sm" data-edit-custom="${w.id}" type="button">✎</button>
                            <button class="btn btn-danger btn-sm" data-del-custom="${w.id}" type="button">✕</button>
                          </div>
                        `;
                      })
                      .join('')}
                  </div>`
                : `<p style="margin:8px 0 0;color:var(--text-secondary);font-size:0.86rem;">Здесь появятся созданные тобой тренировки.</p>`
            }
          </div>
        </div>
      </div>
    `;

    // Form bindings
    this.container.querySelector('#bName').addEventListener('input', (e) => (this.draft.name = e.target.value));
    this.container.querySelector('#bDesc').addEventListener('input', (e) => (this.draft.description = e.target.value));
    this.container.querySelector('#bRounds').addEventListener('change', (e) => {
      this.draft.rounds = Math.max(1, Number(e.target.value) || 1);
      this.render();
    });
    this.container.querySelector('#bDifficulty').addEventListener('change', (e) => {
      this.draft.difficulty = e.target.value;
    });

    const pickerSearch = this.container.querySelector('#bPickerSearch');
    pickerSearch.addEventListener('input', (e) => {
      this.pickerQuery = e.target.value;
      const pos = e.target.selectionStart;
      this.render();
      const nextInput = this.container.querySelector('#bPickerSearch');
      if (nextInput) {
        nextInput.focus();
        if (pos !== null) nextInput.setSelectionRange(pos, pos);
      }
    });

    this.container.querySelector('#bPickerMuscle').addEventListener('change', (e) => {
      this.pickerMuscle = e.target.value;
      this.render();
    });

    this.container.querySelector('#bCreateCustomExBtn').addEventListener('click', () => {
      if (this.onOpenCreateExercise) this.onOpenCreateExercise();
    });

    const cancelBtn = this.container.querySelector('#bCancelEditBtn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.resetDraft();
        this.render();
      });
    }

    this.container.querySelector('#bSaveBtn').addEventListener('click', () => this.saveDraft(false));
    this.container.querySelector('#bSaveStartBtn').addEventListener('click', () => this.saveDraft(true));

    this.container.querySelectorAll('[data-add-ex]').forEach((btn) => {
      btn.addEventListener('click', () => this.addExercise(btn.dataset.addEx));
    });
    this.container.querySelectorAll('[data-move-up]').forEach((btn) => {
      btn.addEventListener('click', () => this.moveItem(Number(btn.dataset.moveUp), -1));
    });
    this.container.querySelectorAll('[data-move-down]').forEach((btn) => {
      btn.addEventListener('click', () => this.moveItem(Number(btn.dataset.moveDown), 1));
    });
    this.container.querySelectorAll('[data-remove]').forEach((btn) => {
      btn.addEventListener('click', () => this.removeItem(Number(btn.dataset.remove)));
    });

    this.container.querySelectorAll('[data-field]').forEach((el) => {
      el.addEventListener('change', (e) => {
        const idx = Number(el.dataset.idx);
        const field = el.dataset.field;
        const val = field === 'mode' ? e.target.value : Number(e.target.value);
        this.draft.items[idx][field] = val;
        this.render();
      });
    });

    this.container.querySelectorAll('[data-run-custom]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const w = getCustomWorkouts().find((x) => x.id === btn.dataset.runCustom);
        if (w && this.onStart) this.onStart(w);
      });
    });
    this.container.querySelectorAll('[data-edit-custom]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const w = getCustomWorkouts().find((x) => x.id === btn.dataset.editCustom);
        if (w) this.loadForEdit(w);
      });
    });
    this.container.querySelectorAll('[data-del-custom]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (confirm('Удалить эту пользовательскую тренировку?')) {
          deleteCustomWorkout(btn.dataset.delCustom);
          this.render();
          if (this.onSave) this.onSave();
          if (this.onToast) this.onToast('Тренировка удалена');
        }
      });
    });
  }
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
