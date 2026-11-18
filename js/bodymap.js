// Sculpted Anatomical Front & Back Muscle Body Map (SVG)
// High-detail anatomical segments with 3D muscle gradients & subtle fiber shading

export const MUSCLE_LABELS = {
  chest: 'Грудные (Pectoralis)',
  shoulders: 'Дельты (Перед/Сред)',
  rear_delts: 'Задние дельты',
  biceps: 'Бицепс',
  triceps: 'Трицепс',
  forearms: 'Предплечья',
  abs: 'Пресс (Прямая)',
  obliques: 'Косые пресса',
  upper_back: 'Трапеция / Верх спины',
  lats: 'Широчайшие спины',
  lower_back: 'Поясница',
  glutes: 'Ягодицы',
  quads: 'Квадрицепсы',
  hamstrings: 'Бицепс бедра',
  calves: 'Икры / Голень'
};

export const MUSCLE_KEYS = Object.keys(MUSCLE_LABELS);

let uidCounter = 0;

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

function getLevel(muscleId, scores, maxScore) {
  const val = scores[muscleId] || 0;
  if (val <= 0) return 'idle';
  const ratio = val / Math.max(2, maxScore);
  if (ratio >= 0.65) return 'red';
  if (ratio >= 0.35) return 'orange';
  return 'amber';
}

function getLevelHex(level) {
  if (level === 'red') return '#EF4444';
  if (level === 'orange') return '#F97316';
  if (level === 'amber') return '#FACC15';
  return '#475569';
}

function svgDefs(p) {
  return `<defs>
    <linearGradient id="${p}_body" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#222B3B"/>
      <stop offset="50%" stop-color="#303C52"/>
      <stop offset="100%" stop-color="#1E2636"/>
    </linearGradient>
    <linearGradient id="${p}_head" x1="25%" y1="15%" x2="75%" y2="85%">
      <stop offset="0%" stop-color="#4A5770"/>
      <stop offset="55%" stop-color="#323D52"/>
      <stop offset="100%" stop-color="#1F2736"/>
    </linearGradient>
    <linearGradient id="${p}_idle" x1="15%" y1="0%" x2="85%" y2="100%">
      <stop offset="0%" stop-color="#55627A"/>
      <stop offset="55%" stop-color="#3E495F"/>
      <stop offset="100%" stop-color="#2C3547"/>
    </linearGradient>
    <linearGradient id="${p}_red" x1="15%" y1="0%" x2="85%" y2="100%">
      <stop offset="0%" stop-color="#FF6B6B"/>
      <stop offset="48%" stop-color="#EF4444"/>
      <stop offset="100%" stop-color="#B91C1C"/>
    </linearGradient>
    <linearGradient id="${p}_orange" x1="15%" y1="0%" x2="85%" y2="100%">
      <stop offset="0%" stop-color="#FDBA74"/>
      <stop offset="50%" stop-color="#F97316"/>
      <stop offset="100%" stop-color="#C2410C"/>
    </linearGradient>
    <linearGradient id="${p}_amber" x1="15%" y1="0%" x2="85%" y2="100%">
      <stop offset="0%" stop-color="#FEF08A"/>
      <stop offset="55%" stop-color="#EAB308"/>
      <stop offset="100%" stop-color="#A16207"/>
    </linearGradient>
    <linearGradient id="${p}_shorts" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#3A455C"/>
      <stop offset="100%" stop-color="#242C3D"/>
    </linearGradient>
  </defs>`;
}

function fillRef(p, level) {
  return `url(#${p}_${level})`;
}

function strokeRef(level) {
  if (level === 'red') return '#FCA5A5';
  if (level === 'orange') return '#FED7AA';
  if (level === 'amber') return '#FEF08A';
  return '#1A2232';
}

function buildFrontBodySvg(levelFn, height) {
  const p = 'bf' + ++uidCounter;
  const f = (m) => fillRef(p, levelFn(m));
  const st = (m) => strokeRef(levelFn(m));
  const sw = (m) => (levelFn(m) === 'idle' ? '1' : '1.35');

  return `<svg viewBox="0 0 260 520" height="${height}" aria-label="Анатомия мышц спереди">
    ${svgDefs(p)}

    <!-- Head & sculpted neck -->
    <path d="M112 72 L106 94 L154 94 L148 72 Z" fill="url(#${p}_body)" stroke="#161D2B" stroke-width="1.2"/>
    <path d="M114 75 L121 95 M146 75 L139 95" stroke="#4B5872" stroke-width="2" opacity="0.65"/>
    <path d="M130 14 C112 14 104 28 106 47 C108 63 117 75 130 76 C143 75 152 63 154 47 C156 28 148 14 130 14 Z" fill="url(#${p}_head)" stroke="#556580" stroke-width="1.4"/>

    <!-- Base Torso, Arms, Hands, Legs, Feet Silhouette -->
    <g fill="url(#${p}_body)" stroke="#475569" stroke-width="1.3" stroke-linejoin="round">
      <!-- Torso & Traps collar -->
      <path d="M106 90 L76 102 C62 108 56 122 54 140 L42 192 L28 242 L20 268 C18 274 23 276 26 271 L32 258 L30 278 C30 282 35 282 36 277 L39 260 L41 278 C42 282 46 281 46 275 L46 254 L53 240 L68 195 L79 156 L84 218 L81 248 L75 316 L80 370 L84 446 L80 486 L74 498 C72 503 78 506 86 505 L96 503 C101 501 102 495 102 486 L108 432 L114 374 L125 304 L130 282 L135 304 L146 374 L152 432 L158 486 C158 495 159 501 164 503 L174 505 C182 506 188 503 186 498 L180 486 L176 446 L180 370 L185 316 L179 248 L176 218 L181 156 L192 195 L207 240 L214 254 L214 275 C214 281 218 282 219 278 L221 260 L224 277 C225 282 230 282 230 278 L228 258 L234 271 C237 276 242 274 240 268 L232 242 L218 192 L206 140 C204 122 198 108 184 102 L154 90 Z"/>
    </g>

    <!-- Upper Traps visible from front -->
    <g fill="${f('upper_back')}" stroke="${st('upper_back')}" stroke-width="${sw('upper_back')}">
      <path d="M111 85 L84 100 L108 104 Z"/>
      <path d="M149 85 L176 100 L152 104 Z"/>
    </g>

    <!-- 1. Deltoids (Shoulders) -->
    <g fill="${f('shoulders')}" stroke="${st('shoulders')}" stroke-width="${sw('shoulders')}">
      <path d="M84 100 C66 104 54 118 53 139 C58 148 67 148 75 138 C82 128 84 113 88 104 Z"/>
      <path d="M176 100 C194 104 206 118 207 139 C202 148 193 148 185 138 C178 128 176 113 172 104 Z"/>
    </g>

    <!-- 2. Pectoralis Major (Chest) -->
    <g fill="${f('chest')}" stroke="${st('chest')}" stroke-width="${sw('chest')}">
      <path d="M88 104 C102 99 118 102 128 111 L128 148 C114 156 91 154 81 140 C78 128 81 114 88 104 Z"/>
      <path d="M172 104 C158 99 142 102 132 111 L132 148 C146 156 169 154 179 140 C182 128 179 114 172 104 Z"/>
      <path d="M89 124 Q109 130 126 124 M171 124 Q151 130 134 124" fill="none" stroke="#0B0F17" stroke-width="1" opacity="0.28"/>
    </g>

    <!-- 3. Biceps Brachii -->
    <g fill="${f('biceps')}" stroke="${st('biceps')}" stroke-width="${sw('biceps')}">
      <path d="M55 142 C48 158 46 177 52 192 C60 194 67 183 71 167 C74 155 72 145 66 140 Z"/>
      <path d="M205 142 C212 158 214 177 208 192 C200 194 193 183 189 167 C186 155 188 145 194 140 Z"/>
    </g>

    <!-- Forearms -->
    <g fill="${f('forearms')}" stroke="${st('forearms')}" stroke-width="${sw('forearms')}">
      <path d="M47 195 C38 210 34 228 36 244 L45 245 C52 230 58 212 60 196 Z"/>
      <path d="M213 195 C222 210 226 228 224 244 L215 245 C208 230 202 212 200 196 Z"/>
    </g>

    <!-- 5. External Obliques -->
    <g fill="${f('obliques')}" stroke="${st('obliques')}" stroke-width="${sw('obliques')}">
      <path d="M82 150 L103 158 L103 230 L85 218 C82 195 80 172 82 150 Z"/>
      <path d="M178 150 L157 158 L157 230 L175 218 C178 195 180 172 178 150 Z"/>
    </g>

    <!-- 4. Rectus Abdominis (6-pack) -->
    <g fill="${f('abs')}" stroke="${st('abs')}" stroke-width="${sw('abs')}">
      <rect x="108" y="155" width="19" height="22" rx="6"/>
      <rect x="133" y="155" width="19" height="22" rx="6"/>
      <rect x="108" y="180" width="19" height="22" rx="6"/>
      <rect x="133" y="180" width="19" height="22" rx="6"/>
      <path d="M109 205 L127 205 L127 242 C118 242 111 236 109 224 Z"/>
      <path d="M151 205 L133 205 L133 242 C142 242 149 236 151 224 Z"/>
    </g>

    <!-- Athletic Briefs / Pelvis -->
    <path d="M83 234 Q130 250 177 234 L180 264 Q152 270 130 284 Q108 270 80 264 Z" fill="url(#${p}_shorts)" stroke="#475569" stroke-width="1.2"/>

    <!-- 6. Quadriceps (Outer Sweep + Center + Teardrop) -->
    <g fill="${f('quads')}" stroke="${st('quads')}" stroke-width="${sw('quads')}">
      <!-- Left Leg Quads -->
      <path d="M81 268 C73 298 73 336 82 365 C88 370 95 362 97 346 L98 282 Z"/>
      <path d="M98 274 C109 278 119 286 121 306 C120 334 114 358 102 366 C94 362 93 340 96 296 Z"/>
      <!-- Right Leg Quads -->
      <path d="M179 268 C187 298 187 336 178 365 C172 370 165 362 163 346 L162 282 Z"/>
      <path d="M162 274 C151 278 141 286 139 306 C140 334 146 358 158 366 C166 362 167 340 164 296 Z"/>
    </g>

    <!-- Kneecaps -->
    <ellipse cx="96" cy="378" rx="10" ry="11" fill="#2A3448" stroke="#475569" stroke-width="1"/>
    <ellipse cx="164" cy="378" rx="10" ry="11" fill="#2A3448" stroke="#475569" stroke-width="1"/>

    <!-- 7. Tibialis Anterior / Front Calves -->
    <g fill="${f('calves')}" stroke="${st('calves')}" stroke-width="${sw('calves')}">
      <path d="M83 396 C77 420 79 448 86 474 C93 472 101 446 103 418 C103 403 95 394 83 396 Z"/>
      <path d="M177 396 C183 420 181 448 174 474 C167 472 159 446 157 418 C157 403 165 394 177 396 Z"/>
    </g>
  </svg>`;
}

function buildBackBodySvg(levelFn, height) {
  const p = 'bb' + ++uidCounter;
  const f = (m) => fillRef(p, levelFn(m));
  const st = (m) => strokeRef(levelFn(m));
  const sw = (m) => (levelFn(m) === 'idle' ? '1' : '1.35');

  return `<svg viewBox="0 0 260 520" height="${height}" aria-label="Анатомия мышц сзади">
    ${svgDefs(p)}

    <!-- Back of Head & Neck -->
    <path d="M112 72 L106 94 L154 94 L148 72 Z" fill="url(#${p}_body)" stroke="#161D2B" stroke-width="1.2"/>
    <path d="M130 14 C112 14 104 28 106 47 C108 63 117 75 130 76 C143 75 152 63 154 47 C156 28 148 14 130 14 Z" fill="url(#${p}_head)" stroke="#556580" stroke-width="1.4"/>

    <!-- Base Silhouette -->
    <g fill="url(#${p}_body)" stroke="#475569" stroke-width="1.3" stroke-linejoin="round">
      <path d="M106 90 L76 102 C62 108 56 122 54 140 L42 192 L28 242 L20 268 C18 274 23 276 26 271 L32 258 L30 278 C30 282 35 282 36 277 L39 260 L41 278 C42 282 46 281 46 275 L46 254 L53 240 L68 195 L79 156 L84 218 L81 248 L75 316 L80 370 L84 446 L80 486 L74 498 C72 503 78 506 86 505 L96 503 C101 501 102 495 102 486 L108 432 L114 374 L125 304 L130 282 L135 304 L146 374 L152 432 L158 486 C158 495 159 501 164 503 L174 505 C182 506 188 503 186 498 L180 486 L176 446 L180 370 L185 316 L179 248 L176 218 L181 156 L192 195 L207 240 L214 254 L214 275 C214 281 218 282 219 278 L221 260 L224 277 C225 282 230 282 230 278 L228 258 L234 271 C237 276 242 274 240 268 L232 242 L218 192 L206 140 C204 122 198 108 184 102 L154 90 Z"/>
    </g>

    <!-- 8. Trapezius (Diamond Upper Back) -->
    <g fill="${f('upper_back')}" stroke="${st('upper_back')}" stroke-width="${sw('upper_back')}">
      <path d="M122 76 L138 76 L154 95 L178 106 L156 138 L130 184 L104 138 L82 106 L106 95 Z"/>
      <line x1="130" y1="80" x2="130" y2="180" stroke="#0B0F17" stroke-width="1.2" opacity="0.35"/>
    </g>

    <!-- Rear Deltoids -->
    <g fill="${f('rear_delts')}" stroke="${st('rear_delts')}" stroke-width="${sw('rear_delts')}">
      <path d="M84 104 C65 107 54 120 54 140 C62 146 74 143 82 132 C87 124 88 113 84 104 Z"/>
      <path d="M176 104 C195 107 206 120 206 140 C198 146 186 143 178 132 C173 124 172 113 176 104 Z"/>
    </g>

    <!-- 10. Latissimus Dorsi (V-Taper Lats) -->
    <g fill="${f('lats')}" stroke="${st('lats')}" stroke-width="${sw('lats')}">
      <path d="M78 140 L102 142 L124 184 L118 220 L86 206 C79 184 76 160 78 140 Z"/>
      <path d="M182 140 L158 142 L136 184 L142 220 L174 206 C181 184 184 160 182 140 Z"/>
    </g>

    <!-- Lower Back (Erector Spinae) -->
    <g fill="${f('lower_back')}" stroke="${st('lower_back')}" stroke-width="${sw('lower_back')}">
      <path d="M114 190 L129 190 L128 232 L106 230 Z"/>
      <path d="M146 190 L131 190 L132 232 L154 230 Z"/>
    </g>

    <!-- 9. Triceps Brachii -->
    <g fill="${f('triceps')}" stroke="${st('triceps')}" stroke-width="${sw('triceps')}">
      <path d="M55 142 C48 158 46 178 52 194 C60 194 69 182 72 166 C74 153 71 144 64 140 Z"/>
      <path d="M205 142 C212 158 214 178 208 194 C200 194 191 182 188 166 C186 153 189 144 196 140 Z"/>
    </g>

    <!-- Posterior Forearms -->
    <g fill="${f('forearms')}" stroke="${st('forearms')}" stroke-width="${sw('forearms')}">
      <path d="M47 196 C38 211 34 228 36 244 L45 245 C52 230 58 212 60 196 Z"/>
      <path d="M213 196 C222 211 226 228 224 244 L215 245 C208 230 202 212 200 196 Z"/>
    </g>

    <!-- 11. Gluteus Maximus -->
    <g fill="${f('glutes')}" stroke="${st('glutes')}" stroke-width="${sw('glutes')}">
      <path d="M84 234 C96 228 118 232 128 246 L128 282 C112 294 87 288 80 268 C77 254 79 242 84 234 Z"/>
      <path d="M176 234 C164 228 142 232 132 246 L132 282 C148 294 173 288 180 268 C183 254 181 242 176 234 Z"/>
    </g>

    <!-- 12. Hamstrings -->
    <g fill="${f('hamstrings')}" stroke="${st('hamstrings')}" stroke-width="${sw('hamstrings')}">
      <path d="M82 286 C75 316 78 348 86 368 C94 370 100 356 101 330 L101 292 Z"/>
      <path d="M103 292 L103 356 C108 366 116 364 119 346 C122 324 122 302 118 290 Z"/>
      <path d="M178 286 C185 316 182 348 174 368 C166 370 160 356 159 330 L159 292 Z"/>
      <path d="M157 292 L157 356 C152 366 144 364 141 346 C138 324 138 302 142 290 Z"/>
    </g>

    <!-- 13 & 14. Gastrocnemius + Soleus (Calves) -->
    <g fill="${f('calves')}" stroke="${st('calves')}" stroke-width="${sw('calves')}">
      <!-- Left Calf (two heads + tapered Achilles/soleus) -->
      <path d="M82 388 C75 408 77 434 86 446 C94 446 104 436 107 416 C108 398 102 386 94 386 Z"/>
      <path d="M86 446 L101 444 L97 480 L88 480 Z" opacity="0.82"/>
      <!-- Right Calf -->
      <path d="M178 388 C185 408 183 434 174 446 C166 446 156 436 153 416 C152 398 158 386 166 386 Z"/>
      <path d="M174 446 L159 444 L163 480 L172 480 Z" opacity="0.82"/>
    </g>
  </svg>`;
}

/**
 * Compact corner overlay badge placed directly on top of exercise images.
 * Primary muscles = vivid anatomical red, Secondary muscles = warm orange.
 */
export function renderCornerBodyBadge(primaryMuscles = [], secondaryMuscles = [], { size = 'sm' } = {}) {
  const primSet = new Set(primaryMuscles || []);
  const secSet = new Set(secondaryMuscles || []);
  const levelFn = (m) => {
    if (primSet.has(m)) return 'red';
    if (secSet.has(m)) return 'orange';
    return 'idle';
  };
  const h = size === 'lg' ? 94 : 68;
  const titleText = [...primSet, ...secSet].map((m) => MUSCLE_LABELS[m] || m).join(', ');
  return `
    <div class="corner-bodymap-badge corner-bodymap-${size}" title="Работают мышцы: ${titleText}">
      ${buildFrontBodySvg(levelFn, h)}
      ${buildBackBodySvg(levelFn, h)}
    </div>
  `;
}

export function renderBodyMapSVG(scores = {}, { compact = false } = {}) {
  const vals = Object.values(scores).filter((v) => v > 0);
  const maxScore = vals.length ? Math.max(...vals) : 2;
  const levelFn = (m) => getLevel(m, scores, maxScore);

  const workedList = Object.entries(scores)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);

  const svgHeight = compact ? 210 : 280;

  return `
    <div class="bodymap-wrap ${compact ? 'bodymap-compact' : ''}">
      <div class="bodymap-figures">
        <div class="bodymap-figure">
          <div class="bodymap-caption">Спереди</div>
          ${buildFrontBodySvg(levelFn, svgHeight)}
        </div>
        <div class="bodymap-figure">
          <div class="bodymap-caption">Сзади</div>
          ${buildBackBodySvg(levelFn, svgHeight)}
        </div>
      </div>

      <div class="bodymap-legend">
        <span><i style="background:#EF4444"></i>Основная / пиковая</span>
        <span><i style="background:#F97316"></i>Вспомогательная</span>
        <span><i style="background:#FACC15"></i>Стабилизаторы</span>
      </div>

      ${
        workedList.length
          ? `<div class="bodymap-chips">
              ${workedList
                .map(([mId]) => {
                  const color = getLevelHex(levelFn(mId));
                  return `<span class="muscle-chip"><i style="background:${color}"></i>${MUSCLE_LABELS[mId] || mId}</span>`;
                })
                .join('')}
            </div>`
          : `<div style="font-size:0.8rem;color:var(--text-muted);text-align:center;">Заверши тренировку, чтобы увидеть задействованные мышцы</div>`
      }
    </div>
  `;
}
