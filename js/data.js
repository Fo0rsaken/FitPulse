export const EXERCISES = [
  {
    id: 'pushups',
    name: 'Классические отжимания',
    muscle: 'chest',
    muscleLabel: 'Грудь и руки',
    equipment: 'none',
    equipmentLabel: 'Без инвентаря',
    difficulty: 'Средний',
    kcalPerMin: 8.5,
    image: 'assets/exercises/pushups.jpg',
    shortTip: 'Держи корпус прямой линией, локти уводи под углом 45° к телу.',
    steps: [
      'Прими упор лёжа: ладони чуть шире плеч, пальцы направлены вперёд.',
      'Напряги пресс и ягодицы, чтобы поясница не прогибалась.',
      'На вдохе плавно опусти грудь к полу, сгибая локти под углом около 45°.',
      'На выдохе мощно выжми себя обратно в исходное положение.'
    ],
    mistakes: 'Не разводи локти строго в стороны под 90° и не опускай голову ниже линии спины.',
    breathing: 'Вдох при опускании, выдох на усилии при подъёме.'
  },
  {
    id: 'squats',
    name: 'Приседания с собственным весом',
    muscle: 'legs',
    muscleLabel: 'Ноги и ягодицы',
    equipment: 'none',
    equipmentLabel: 'Без инвентаря',
    difficulty: 'Лёгкий',
    kcalPerMin: 8.0,
    image: 'assets/exercises/squats.jpg',
    shortTip: 'Отводи таз назад, держи пятки прижатыми к полу, спина ровная.',
    steps: [
      'Поставь стопы чуть шире плеч, носки слегка разверни наружу.',
      'На вдохе отводи таз назад и вниз, словно садишься на невидимый стул.',
      'Опускайся до параллели бёдер с полом, колени направляй по линии носков.',
      'На выдохе оттолкнись полной стопой и вернись в стойку.'
    ],
    mistakes: 'Не заваливай колени внутрь и не отрывай пятки от пола.',
    breathing: 'Глубокий вдох вниз, энергичный выдох на подъёме.'
  },
  {
    id: 'plank',
    name: 'Планка на предплечьях',
    muscle: 'core',
    muscleLabel: 'Кор и пресс',
    equipment: 'none',
    equipmentLabel: 'Без инвентаря',
    difficulty: 'Лёгкий',
    kcalPerMin: 5.5,
    image: 'assets/exercises/plank.jpg',
    shortTip: 'Локти строго под плечами, живот подтянут, взгляд направлен в пол.',
    steps: [
      'Опустись на предплечья так, чтобы локти находились точно под плечевыми суставами.',
      'Вытяни ноги назад и упрись носками в пол.',
      'Подкрути таз слегка вперёд, напряги пресс, ягодицы и переднюю поверхность бёдер.',
      'Удерживай прямую линию от макушки до пяток всё время таймера.'
    ],
    mistakes: 'Не задирай таз слишком высоко и не проваливай поясницу.',
    breathing: 'Дыши ровно и ритмично, не задерживай дыхание.'
  },
  {
    id: 'lunges',
    name: 'Попеременные выпады',
    muscle: 'legs',
    muscleLabel: 'Ноги и ягодицы',
    equipment: 'none',
    equipmentLabel: 'Без инвентаря',
    difficulty: 'Средний',
    kcalPerMin: 8.5,
    image: 'assets/exercises/lunges.jpg',
    shortTip: 'Держи корпус вертикально, оба колена образуют угол 90° в нижней точке.',
    steps: [
      'Встань прямо, ноги на ширине таза, руки на поясе или перед грудью.',
      'Сделай уверенный шаг вперёд и опустись, пока оба колена не согнутся под 90°.',
      'Заднее колено останавливается в нескольких сантиметрах от пола.',
      'Оттолкнись передней пяткой, вернись в стойку и поменяй ногу.'
    ],
    mistakes: 'Не заваливай корпус вперёд и не ставь стопы на одну узкую линию (потеряешь баланс).',
    breathing: 'Вдох при шаге и опускании, выдох при возврате в стойку.'
  },
  {
    id: 'burpees',
    name: 'Бёрпи',
    muscle: 'full',
    muscleLabel: 'Всё тело / Кардио',
    equipment: 'none',
    equipmentLabel: 'Без инвентаря',
    difficulty: 'Высокий',
    kcalPerMin: 13.0,
    image: 'assets/exercises/burpees.jpg',
    shortTip: 'Держи ритм, мягко приземляйся на переднюю часть стопы.',
    steps: [
      'Из положения стоя опустись в присед и поставь ладони на пол.',
      'Прыжком отбрось ноги назад в высокую планку (по желанию добавь отжимание).',
      'Прыжком подтяни стопы обратно к ладоням.',
      'Выпрыгни вверх, поднимая руки над головой, и мягко приземлись.'
    ],
    mistakes: 'Не проваливай поясницу в планке и не приземляйся на прямые жёсткие колени.',
    breathing: 'Ритмично: выдох на выпрыгивании, короткий вдох при переходе в планку.'
  },
  {
    id: 'jumping-jacks',
    name: 'Прыжки «Джампинг Джек»',
    muscle: 'full',
    muscleLabel: 'Всё тело / Кардио',
    equipment: 'none',
    equipmentLabel: 'Без инвентаря',
    difficulty: 'Лёгкий',
    kcalPerMin: 10.0,
    image: 'assets/exercises/jumping-jacks.jpg',
    shortTip: 'Прыгай легко на носках, руки описывают полную дугу над головой.',
    steps: [
      'Встань прямо, ноги вместе, руки свободно вдоль корпуса.',
      'В прыжке разведи ноги шире плеч и одновременно подними руки вверх через стороны.',
      'Следующим лёгким прыжком вернись в исходное положение.',
      'Поддерживай ровный, энергичный темп.'
    ],
    mistakes: 'Не приземляйся тяжело на пятки и не сгибай руки слишком сильно.',
    breathing: 'Свободное ритмичное дыхание без задержек.'
  },
  {
    id: 'mountain-climbers',
    name: 'Скалолаз (Mountain Climbers)',
    muscle: 'core',
    muscleLabel: 'Кор и кардио',
    equipment: 'none',
    equipmentLabel: 'Без инвентаря',
    difficulty: 'Средний',
    kcalPerMin: 11.0,
    image: 'assets/exercises/mountain-climbers.jpg',
    shortTip: 'Плечи над кистями, таз стабилен — не подпрыгивай вверх.',
    steps: [
      'Прими высокую планку на прямых руках, ладони строго под плечами.',
      'Быстро подтяни правое колено к груди, удерживая пресс напряжённым.',
      'В динамике поменяй ногу, подтягивая левое колено к груди.',
      'Сохраняй ровную спину и стабильное положение плеч.'
    ],
    mistakes: 'Не уводи плечи назад от кистей и не поднимай таз «домиком».',
    breathing: 'Частые короткие выдохи на каждое подтягивание колена.'
  },
  {
    id: 'crunches',
    name: 'Скручивания «Велосипед»',
    muscle: 'core',
    muscleLabel: 'Кор и пресс',
    equipment: 'none',
    equipmentLabel: 'Без инвентаря',
    difficulty: 'Средний',
    kcalPerMin: 7.5,
    image: 'assets/exercises/crunches.jpg',
    shortTip: 'Тянись плечом к противоположному колену, поясница прижата к коврику.',
    steps: [
      'Ляг на спину, прижми поясницу к полу, кончики пальцев легко касаются висков.',
      'Подними лопатки и вытяни ноги под углом около 45°.',
      'Скручивай корпус, направляя правое плечо к левому колену, пока правая нога выпрямлена.',
      'Плавно и подконтрольно смени сторону.'
    ],
    mistakes: 'Не тяни руками за шею и не торопись — контроль важнее скорости.',
    breathing: 'Выдох на каждом скручивании, вдох в центре.'
  },
  {
    id: 'glute-bridge',
    name: 'Ягодичный мостик',
    muscle: 'legs',
    muscleLabel: 'Ноги и ягодицы',
    equipment: 'none',
    equipmentLabel: 'Без инвентаря',
    difficulty: 'Лёгкий',
    kcalPerMin: 6.0,
    image: 'assets/exercises/glute-bridge.jpg',
    shortTip: 'В верхней точке задержись на секунду и максимально сожми ягодицы.',
    steps: [
      'Ляг на спину, согни колени, поставь стопы на ширине таза ближе к ягодицам.',
      'Руки лежат вдоль корпуса ладонями вниз.',
      'На выдохе подними таз вверх, выстраивая прямую линию от плеч до коленей.',
      'Задержись на 1 секунду в пиковой точке и плавно опусти таз.'
    ],
    mistakes: 'Не переразгибай поясницу вверху — движение идёт за счёт ягодиц, а не спины.',
    breathing: 'Выдох на подъёме таза, вдох при опускании.'
  },
  {
    id: 'dumbbell-press',
    name: 'Жим гантелей стоя вверх',
    muscle: 'chest',
    muscleLabel: 'Плечи и руки',
    equipment: 'dumbbells',
    equipmentLabel: 'Гантели',
    difficulty: 'Средний',
    kcalPerMin: 7.5,
    image: 'assets/exercises/dumbbell-press.jpg',
    shortTip: 'Пресс и ягодицы в тонусе — не прогибай поясницу, выжимая гантели вверх.',
    steps: [
      'Встань прямо, стопы на ширине плеч, подними гантели на уровень плеч ладонями вперёд.',
      'Напряги кор, чтобы зафиксировать корпус.',
      'На выдохе выжми гантели строго вверх до почти полного выпрямления рук.',
      'На вдохе плавно и подконтрольно верни гантели к плечам.'
    ],
    mistakes: 'Не раскачивай корпус и не ударяй гантели друг о друга в верхней точке.',
    breathing: 'Выдох на жиме вверх, вдох при опускании.'
  },
  {
    id: 'dumbbell-row',
    name: 'Тяга гантелей в наклоне',
    muscle: 'back',
    muscleLabel: 'Спина и бицепс',
    equipment: 'dumbbells',
    equipmentLabel: 'Гантели',
    difficulty: 'Средний',
    kcalPerMin: 8.0,
    image: 'assets/exercises/dumbbell-row.jpg',
    shortTip: 'Своди лопатки вместе, тяни гантели к поясу, сохраняя нейтральную спину.',
    steps: [
      'Слегка согни колени и наклони прямой корпус вперёд под углом ~45°.',
      'Опусти руки с гантелями вниз, плечи отведены от ушей.',
      'На выдохе подтяни гантели к нижней части живота, ведя локти вдоль корпуса и сводя лопатки.',
      'На вдохе плавно опусти вес, растягивая мышцы спины.'
    ],
    mistakes: 'Не округляй поясницу и не задирай голову вверх — шея продолжает линию спины.',
    breathing: 'Выдох при тяге к поясу, вдох при опускании.'
  },
  {
    id: 'cobra-stretch',
    name: 'Растяжка «Кобра» и раскрытие груди',
    muscle: 'stretch',
    muscleLabel: 'Растяжка и спина',
    equipment: 'none',
    equipmentLabel: 'Без инвентаря',
    difficulty: 'Лёгкий',
    kcalPerMin: 3.0,
    image: 'assets/exercises/cobra-stretch.svg',
    shortTip: 'Мягко раскрывай грудную клетку, плечи опущены вниз от ушей.',
    steps: [
      'Ляг на живот, вытяни ноги назад, ладони расположи под плечами.',
      'На вдохе мягко оттолкнись руками и подними грудную клетку вверх.',
      'Бёдра и таз остаются расслабленными на коврике, плечи тянутся вниз.',
      'Удерживай комфортное растяжение, глубоко и спокойно дыша.'
    ],
    mistakes: 'Не запрокидывай голову и не доводи прогиб в пояснице до дискомфорта.',
    breathing: 'Медленные глубокие вдохи и длинные расслабляющие выдохи.'
  }
];

export const EXERCISES_MAP = Object.fromEntries(EXERCISES.map((ex) => [ex.id, ex]));

export const BUILTIN_WORKOUTS = [
  {
    id: 'fullbody-home',
    name: 'Всё тело дома за 15 минут',
    description: 'Сбалансированная круговая тренировка без инвентаря: прорабатывает ноги, грудь, кор и заряжает энергией.',
    category: 'bodyweight',
    categoryLabel: 'Без инвентаря',
    difficulty: 'Средний',
    rounds: 2,
    prepSec: 8,
    roundRestSec: 45,
    coverImage: 'assets/exercises/squats.jpg',
    items: [
      { exerciseId: 'jumping-jacks', mode: 'time', durationSec: 40, restSec: 15 },
      { exerciseId: 'squats', mode: 'time', durationSec: 45, restSec: 15 },
      { exerciseId: 'pushups', mode: 'time', durationSec: 40, restSec: 15 },
      { exerciseId: 'lunges', mode: 'time', durationSec: 45, restSec: 15 },
      { exerciseId: 'plank', mode: 'time', durationSec: 40, restSec: 15 },
      { exerciseId: 'glute-bridge', mode: 'time', durationSec: 45, restSec: 15 }
    ]
  },
  {
    id: 'hiit-tabata',
    name: 'HIIT Жиросжигание (Табата)',
    description: 'Высокоинтенсивные интервалы 30/15 для максимального расхода калорий и выносливости.',
    category: 'hiit',
    categoryLabel: 'HIIT / Кардио',
    difficulty: 'Высокий',
    rounds: 3,
    prepSec: 8,
    roundRestSec: 40,
    coverImage: 'assets/exercises/burpees.jpg',
    items: [
      { exerciseId: 'jumping-jacks', mode: 'time', durationSec: 30, restSec: 15 },
      { exerciseId: 'burpees', mode: 'time', durationSec: 30, restSec: 15 },
      { exerciseId: 'mountain-climbers', mode: 'time', durationSec: 30, restSec: 15 },
      { exerciseId: 'squats', mode: 'time', durationSec: 30, restSec: 15 }
    ]
  },
  {
    id: 'dumbbell-strength',
    name: 'Силовая с гантелями (Подходы)',
    description: 'Классическая силовая сессия с учётом подходов, повторений, рабочего веса и таймером отдыха.',
    category: 'dumbbells',
    categoryLabel: 'Гантели / Силовая',
    difficulty: 'Средний',
    rounds: 1,
    prepSec: 5,
    roundRestSec: 60,
    coverImage: 'assets/exercises/dumbbell-press.jpg',
    items: [
      { exerciseId: 'dumbbell-press', mode: 'reps', sets: 3, reps: 12, weightKg: 8, restSec: 60 },
      { exerciseId: 'dumbbell-row', mode: 'reps', sets: 3, reps: 12, weightKg: 10, restSec: 60 },
      { exerciseId: 'squats', mode: 'reps', sets: 3, reps: 15, weightKg: 10, restSec: 60 },
      { exerciseId: 'pushups', mode: 'reps', sets: 3, reps: 12, weightKg: 0, restSec: 45 },
      { exerciseId: 'plank', mode: 'time', durationSec: 45, restSec: 30 }
    ]
  },
  {
    id: 'core-sculpt',
    name: 'Стальной пресс и кор',
    description: 'Точечная работа на глубокие мышцы живота, стабилизацию спины и осанку.',
    category: 'bodyweight',
    categoryLabel: 'Без инвентаря',
    difficulty: 'Средний',
    rounds: 2,
    prepSec: 8,
    roundRestSec: 35,
    coverImage: 'assets/exercises/crunches.jpg',
    items: [
      { exerciseId: 'plank', mode: 'time', durationSec: 45, restSec: 15 },
      { exerciseId: 'crunches', mode: 'time', durationSec: 40, restSec: 15 },
      { exerciseId: 'mountain-climbers', mode: 'time', durationSec: 35, restSec: 15 },
      { exerciseId: 'glute-bridge', mode: 'time', durationSec: 45, restSec: 15 },
      { exerciseId: 'cobra-stretch', mode: 'time', durationSec: 35, restSec: 10 }
    ]
  },
  {
    id: 'express-7min',
    name: 'Экспресс-зарядка 7 минут',
    description: 'Идеально с утра или в перерыве между задачами: быстро разгоняет кровь и бодрит.',
    category: 'hiit',
    categoryLabel: 'HIIT / Кардио',
    difficulty: 'Лёгкий',
    rounds: 1,
    prepSec: 5,
    roundRestSec: 0,
    coverImage: 'assets/exercises/jumping-jacks.jpg',
    items: [
      { exerciseId: 'jumping-jacks', mode: 'time', durationSec: 45, restSec: 15 },
      { exerciseId: 'squats', mode: 'time', durationSec: 45, restSec: 15 },
      { exerciseId: 'pushups', mode: 'time', durationSec: 40, restSec: 15 },
      { exerciseId: 'lunges', mode: 'time', durationSec: 45, restSec: 15 },
      { exerciseId: 'plank', mode: 'time', durationSec: 40, restSec: 15 },
      { exerciseId: 'crunches', mode: 'time', durationSec: 40, restSec: 15 },
      { exerciseId: 'cobra-stretch', mode: 'time', durationSec: 45, restSec: 0 }
    ]
  },
  {
    id: 'mobility-stretch',
    name: 'Растяжка и восстановление спины',
    description: 'Спокойная восстановительная программа после рабочего дня или тяжёлой тренировки.',
    category: 'stretch',
    categoryLabel: 'Растяжка',
    difficulty: 'Лёгкий',
    rounds: 2,
    prepSec: 5,
    roundRestSec: 20,
    coverImage: 'assets/exercises/cobra-stretch.svg',
    items: [
      { exerciseId: 'cobra-stretch', mode: 'time', durationSec: 45, restSec: 10 },
      { exerciseId: 'glute-bridge', mode: 'time', durationSec: 40, restSec: 10 },
      { exerciseId: 'lunges', mode: 'time', durationSec: 40, restSec: 10 },
      { exerciseId: 'plank', mode: 'time', durationSec: 30, restSec: 10 }
    ]
  }
];

export function estimateWorkoutStats(workout) {
  const rounds = Math.max(1, Number(workout.rounds) || 1);
  let totalSec = Number(workout.prepSec) || 5;
  let totalKcal = 0;

  for (let r = 0; r < rounds; r++) {
    for (let i = 0; i < workout.items.length; i++) {
      const item = workout.items[i];
      const ex = EXERCISES_MAP[item.exerciseId];
      const kcalMin = ex ? ex.kcalPerMin : 7;

      if (item.mode === 'reps') {
        const sets = Math.max(1, Number(item.sets) || 3);
        const workPerSet = Math.max(20, (Number(item.reps) || 10) * 3);
        const rest = Number(item.restSec) || 45;
        totalSec += sets * workPerSet + (sets - 1) * rest + rest;
        totalKcal += ((sets * workPerSet) / 60) * kcalMin;
      } else {
        const dur = Math.max(5, Number(item.durationSec) || 30);
        const rest = Number(item.restSec) || 0;
        totalSec += dur + rest;
        totalKcal += (dur / 60) * kcalMin;
      }
    }
    if (r < rounds - 1) {
      totalSec += Number(workout.roundRestSec) || 0;
    }
  }

  return {
    minutes: Math.max(1, Math.round(totalSec / 60)),
    seconds: totalSec,
    kcal: Math.max(15, Math.round(totalKcal))
  };
}
