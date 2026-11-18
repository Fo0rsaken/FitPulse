// Anatomical Front & Back Body Muscle Heatmap (SVG) — Red/Orange anatomical highlight + Corner Mini-Badge

export const MUSCLE_LABELS = {
  chest: 'Грудь',
  shoulders: 'Плечи (перед/сред)',
  rear_delts: 'Задние дельты',
  biceps: 'Бицепс',
  triceps: 'Трицепс',
  forearms: 'Предплечья',
  abs: 'Пресс',
  obliques: 'Косые пресса',
  upper_back: 'Трапеция / Верх спины',
  lats: 'Широчайшие спины',
  lower_back: 'Поясница',
  glutes: 'Ягодицы',
  quads: 'Квадрицепсы',
  hamstrings: 'Бицепс бедра',
  calves: 'Икры'
};

export const MUSCLE_KEYS = Object.keys(MUSCLE_LABELS);

const IDLE_MUSCLE = '#2D374B';
const RED_PRIMARY = '#EF4444';
const ORANGE_SECONDARY = '#F97316';
const AMBER_LIGHT = '#FACC15';

export function computeMuscleScores(items, getExerciseFn) {
  const scores = {};
  const counts = {};

  (items || []).forEach((entry) => {
    const ex =
      typeof entry === 'string'
        ? getExerciseFn(entry)
        : entry.exerciseId
        ? getExerciseFn(entry.exerciseId)
        : entry;
    if (!ex) return;

    const weightFactor = entry && entry.sets ? Math.max(1, Number(entry.sets)) : 1;
    const primary = ex.primaryMuscles || [];
    const secondary = ex.secondaryMuscles || [];

    primary.forEach((m) => {
      scores[m] = (scores[m] || 0) + 2 * weightFactor;
      counts[m] = (counts[m] || 0) + weightFactor;
    });
    secondary.forEach((m) => {
      scores[m] = (scores[m] || 0) + 1 * weightFactor;
      counts[m] = (counts[m] || 0) + Math.max(1, Math.round(weightFactor * 0.5));
    });
  });

  return { scores, counts };
}

function getMuscleFill(muscleId, scores, maxScore) {
  const val = scores[muscleId] || 0;
  if (val <= 0) return IDLE_MUSCLE;
  const ratio = val / Math.max(2, maxScore);
  if (ratio >= 0.65) return RED_PRIMARY; // Основная / пиковая нагрузка — ярко-красный
  if (ratio >= 0.35) return ORANGE_SECONDARY; // Вспомогательная — оранжево-красный
  return AMBER_LIGHT; // Лёгкая — янтарный
}

function buildFrontBodySvg(fillFn, height) {
  const f = fillFn;
  return `<svg viewBox="0 0 220 420" height="${height}" aria-label="Мышцы тела спереди">
    <g fill="#192131" stroke="#3B475E" stroke-width="2">
      <circle cx="110" cy="34" r="21"/>
      <rect x="100" y="54" width="20" height="16" rx="6"/>
      <path d="M68 74 Q110 64 152 74 L144 192 Q110 202 76 192 Z"/>
      <path d="M76 192 L68 298 L78 392 L95 392 L104 282 L110 218 L116 282 L125 392 L142 392 L152 298 L144 192 Z"/>
      <path d="M68 78 L42 152 L28 214 L42 218 L58 158 L76 112 Z"/>
      <path d="M152 78 L178 152 L192 214 L178 218 L162 158 L144 112 Z"/>
    </g>
    <g fill="${f('shoulders')}"><path d="M66 76 C52 80, 48 98, 56 112 C64 110, 72 100, 76 86 Z"/><path d="M154 76 C168 80, 172 98, 164 112 C156 110, 148 100, 144 86 Z"/></g>
    <g fill="${f('chest')}"><path d="M78 82 Q94 76 108 86 L108 118 Q88 124 76 110 Z"/><path d="M142 82 Q126 76 112 86 L112 118 Q132 124 144 110 Z"/></g>
    <g fill="${f('biceps')}"><ellipse cx="55" cy="134" rx="9.5" ry="22" transform="rotate(14 55 134)"/><ellipse cx="165" cy="134" rx="9.5" ry="22" transform="rotate(-14 165 134)"/></g>
    <g fill="${f('forearms')}"><ellipse cx="42" cy="182" rx="7.5" ry="24" transform="rotate(16 42 182)"/><ellipse cx="178" cy="182" rx="7.5" ry="24" transform="rotate(-16 178 182)"/></g>
    <g fill="${f('abs')}"><rect x="96" y="124" width="12" height="16" rx="4"/><rect x="112" y="124" width="12" height="16" rx="4"/><rect x="96" y="144" width="12" height="16" rx="4"/><rect x="112" y="144" width="12" height="16" rx="4"/><rect x="97" y="164" width="11" height="20" rx="4"/><rect x="112" y="164" width="11" height="20" rx="4"/></g>
    <g fill="${f('obliques')}"><path d="M80 124 L92 128 L92 180 L80 172 Z"/><path d="M140 124 L128 128 L128 180 L140 172 Z"/></g>
    <g fill="${f('quads')}"><path d="M78 202 Q94 198 105 212 L102 288 Q86 294 74 282 Z"/><path d="M142 202 Q126 198 115 212 L118 288 Q134 294 146 282 Z"/></g>
    <g fill="${f('calves')}"><ellipse cx="83" cy="342" rx="9" ry="30"/><ellipse cx="137" cy="342" rx="9" ry="30"/></g>
  </svg>`;
}

function buildBackBodySvg(fillFn, height) {
  const f = fillFn;
  return `<svg viewBox="0 0 220 420" height="${height}" aria-label="Мышцы тела сзади">
    <g fill="#192131" stroke="#3B475E" stroke-width="2">
      <circle cx="110" cy="34" r="21"/>
      <rect x="100" y="54" width="20" height="16" rx="6"/>
      <path d="M68 74 Q110 64 152 74 L144 192 Q110 202 76 192 Z"/>
      <path d="M76 192 L68 298 L78 392 L95 392 L104 282 L110 218 L116 282 L125 392 L142 392 L152 298 L144 192 Z"/>
      <path d="M68 78 L42 152 L28 214 L42 218 L58 158 L76 112 Z"/>
      <path d="M152 78 L178 152 L192 214 L178 218 L162 158 L144 112 Z"/>
    </g>
    <g fill="${f('upper_back')}"><path d="M98 62 L122 62 L142 84 L110 124 L78 84 Z"/></g>
    <g fill="${f('rear_delts')}"><path d="M66 78 C52 84, 50 100, 58 112 C66 108, 74 98, 76 86 Z"/><path d="M154 78 C168 84, 170 100, 162 112 C154 108, 146 98, 144 86 Z"/></g>
    <g fill="${f('lats')}"><path d="M76 100 L106 126 L104 164 L80 154 Z"/><path d="M144 100 L114 126 L116 164 L140 154 Z"/></g>
    <g fill="${f('lower_back')}"><path d="M94 156 L126 156 L124 188 L96 188 Z"/></g>
    <g fill="${f('triceps')}"><ellipse cx="55" cy="134" rx="9.5" ry="23" transform="rotate(14 55 134)"/><ellipse cx="165" cy="134" rx="9.5" ry="23" transform="rotate(-14 165 134)"/></g>
    <g fill="${f('forearms')}"><ellipse cx="42" cy="182" rx="7.5" ry="24" transform="rotate(16 42 182)"/><ellipse cx="178" cy="182" rx="7.5" ry="24" transform="rotate(-16 178 182)"/></g>
    <g fill="${f('glutes')}"><ellipse cx="93" cy="206" rx="16" ry="20"/><ellipse cx="127" cy="206" rx="16" ry="20"/></g>
    <g fill="${f('hamstrings')}"><path d="M78 228 Q92 224 104 234 L101 292 Q86 296 76 286 Z"/><path d="M142 228 Q128 224 116 234 L119 292 Q134 296 144 286 Z"/></g>
    <g fill="${f('calves')}"><ellipse cx="83" cy="338" rx="11" ry="30"/><ellipse cx="137" cy="338" rx="11" ry="30"/></g>
  </svg>`;
}

/**
 * Compact corner overlay badge placed directly on top of exercise images.
 * Primary muscles = vivid red (#EF4444), Secondary muscles = orange (#F97316).
 */
export function renderCornerBodyBadge(primaryMuscles = [], secondaryMuscles = [], { size = 'sm' } = {}) {
  const primSet = new Set(primaryMuscles || []);
  const secSet = new Set(secondaryMuscles || []);
  const fillFn = (m) => {
    if (primSet.has(m)) return RED_PRIMARY;
    if (secSet.has(m)) return ORANGE_SECONDARY;
    return IDLE_MUSCLE;
  };
  const h = size === 'lg' ? 84 : 62;
  const titleText = [...primSet, ...secSet].map((m) => MUSCLE_LABELS[m] || m).join(', ');
  return `
    <div class="corner-bodymap-badge corner-bodymap-${size}" title="Работают мышцы: ${titleText}">
      ${buildFrontBodySvg(fillFn, h)}
      ${buildBackBodySvg(fillFn, h)}
    </div>
  `;
}

export function renderBodyMapSVG(scores = {}, { compact = false } = {}) {
  const vals = Object.values(scores).filter((v) => v > 0);
  const maxScore = vals.length ? Math.max(...vals) : 2;
  const f = (m) => getMuscleFill(m, scores, maxScore);

  const workedList = Object.entries(scores)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);

  const svgHeight = compact ? 196 : 250;

  return `
    <div class="bodymap-wrap ${compact ? 'bodymap-compact' : ''}">
      <div class="bodymap-figures">
        <div class="bodymap-figure">
          <div class="bodymap-caption">Спереди</div>
          ${buildFrontBodySvg(f, svgHeight)}
        </div>
        <div class="bodymap-figure">
          <div class="bodymap-caption">Сзади</div>
          ${buildBackBodySvg(f, svgHeight)}
        </div>
      </div>

      <div class="bodymap-legend">
        <span><i style="background:${RED_PRIMARY}"></i>Основная / пиковая</span>
        <span><i style="background:${ORANGE_SECONDARY}"></i>Вспомогательная</span>
        <span><i style="background:${AMBER_LIGHT}"></i>Стабилизаторы</span>
      </div>

      ${
        workedList.length
          ? `<div class="bodymap-chips">
              ${workedList
                .map(([mId]) => {
                  const color = getMuscleFill(mId, scores, maxScore);
                  return `<span class="muscle-chip"><i style="background:${color}"></i>${MUSCLE_LABELS[mId] || mId}</span>`;
                })
                .join('')}
            </div>`
          : `<div style="font-size:0.8rem;color:var(--text-muted);text-align:center;">Заверши тренировку, чтобы увидеть задействованные мышцы</div>`
      }
    </div>
  `;
}
