import { getCustomExercises } from './storage.js';

const IMG_VER = 'v5';
const imgUrl = (path) => `${path}?${IMG_VER}`;

const EQ_LABELS = {
  barbell: 'Штанга',
  dumbbells: 'Гантели',
  machine: 'Тренажёры',
  cable: 'Блоки',
  none: 'Свой вес'
};

const MUSCLE_GROUP_LABELS = {
  chest: 'Грудь',
  back: 'Спина',
  legs: 'Ноги и ягодицы',
  shoulders: 'Плечи',
  biceps: 'Бицепс',
  triceps: 'Трицепс',
  core: 'Пресс и кор',
  full: 'Всё тело / Кардио',
  stretch: 'Растяжка'
};

function gymEx({
  id,
  name,
  muscle,
  equipment,
  difficulty = 'Средний',
  kcalPerMin = 7.5,
  primaryMuscles,
  secondaryMuscles = [],
  defaultSets = 4,
  defaultReps = 10,
  defaultWeightKg = 20,
  defaultRestSec = 75,
  shortTip,
  steps,
  mistakes,
  breathing
}) {
  return {
    id,
    name,
    muscle,
    muscleLabel: MUSCLE_GROUP_LABELS[muscle] || muscle,
    equipment,
    equipmentLabel: EQ_LABELS[equipment] || equipment,
    difficulty,
    kcalPerMin,
    image: imgUrl(`assets/exercises/${id}.jpg`),
    isGymTop40: true,
    primaryMuscles,
    secondaryMuscles,
    defaultSets,
    defaultReps,
    defaultWeightKg,
    defaultRestSec,
    shortTip,
    steps,
    mistakes,
    breathing
  };
}

export const BUILTIN_EXERCISES = [
  /* ===================== TOP-40 GYM EXERCISES ===================== */

  // --- ГРУДЬ (6) ---
  gymEx({
    id: 'barbell-bench-press',
    name: 'Жим штанги лёжа',
    muscle: 'chest',
    equipment: 'barbell',
    difficulty: 'Средний',
    kcalPerMin: 8.0,
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'shoulders'],
    defaultSets: 4,
    defaultReps: 8,
    defaultWeightKg: 60,
    defaultRestSec: 90,
    shortTip: 'Сведи лопатки, упри стопы в пол, опускай гриф к нижней трети груди.',
    steps: [
      'Ляг на скамью так, чтобы глаза находились прямо под грифом, плотно поставь стопы на пол.',
      'Сведи лопатки вместе и создай лёгкий естественный прогиб в грудном отделе.',
      'Сними штангу хватом чуть шире плеч и на вдохе плавно опусти к линии сосков.',
      'На выдохе мощно выжми штангу вверх, не разводя локти в стороны под 90°.'
    ],
    mistakes: 'Не отрывай таз от скамьи и не отбивай штангу от груди.',
    breathing: 'Вдох при опускании грифа, выдох на усилии вверх.'
  }),
  gymEx({
    id: 'incline-dumbbell-press',
    name: 'Жим гантелей на наклонной скамье',
    muscle: 'chest',
    equipment: 'dumbbells',
    difficulty: 'Средний',
    kcalPerMin: 7.5,
    primaryMuscles: ['chest', 'shoulders'],
    secondaryMuscles: ['triceps'],
    defaultSets: 4,
    defaultReps: 10,
    defaultWeightKg: 20,
    defaultRestSec: 75,
    shortTip: 'Угол скамьи 30–35°, локти направлены слегка вперёд для акцента на верх груди.',
    steps: [
      'Установи спинку скамьи под углом 30–35° и закинь гантели на уровень плеч.',
      'Сведи лопатки и прижми плечи к скамье.',
      'На выдохе выжми гантели вверх по лёгкой дуге, не ударяя их друг о друга.',
      'На вдохе подконтрольно опусти гантели до комфортного растяжения грудных.'
    ],
    mistakes: 'Не ставь наклон выше 45° — нагрузка уйдёт в плечи.',
    breathing: 'Выдох на жиме вверх, вдох при опускании.'
  }),
  gymEx({
    id: 'incline-barbell-press',
    name: 'Жим штанги на наклонной скамье',
    muscle: 'chest',
    equipment: 'barbell',
    difficulty: 'Средний',
    kcalPerMin: 8.0,
    primaryMuscles: ['chest', 'shoulders'],
    secondaryMuscles: ['triceps'],
    defaultSets: 4,
    defaultReps: 8,
    defaultWeightKg: 50,
    defaultRestSec: 90,
    shortTip: 'Опускай гриф к верхней части груди, сохраняя жёсткий упор ногами.',
    steps: [
      'Настрой скамью под 30° и возьмись за гриф чуть шире плеч.',
      'Сними штангу со стоек и зафиксируй над ключицами.',
      'На вдохе опусти гриф к верхней части груди под контролем.',
      'На выдохе выжми вверх до почти полного выпрямления рук.'
    ],
    mistakes: 'Не заламывай кисти назад — гриф должен лежать на основании ладони.',
    breathing: 'Вдох вниз, выдох при жиме.'
  }),
  gymEx({
    id: 'pec-deck-fly',
    name: 'Сведение рук в тренажёре «Бабочка»',
    muscle: 'chest',
    equipment: 'machine',
    difficulty: 'Лёгкий',
    kcalPerMin: 6.0,
    primaryMuscles: ['chest'],
    secondaryMuscles: ['shoulders'],
    defaultSets: 3,
    defaultReps: 15,
    defaultWeightKg: 35,
    defaultRestSec: 60,
    shortTip: 'Локти чуть согнуты и на уровне груди — своди руки за счёт сжатия грудных.',
    steps: [
      'Отрегулируй высоту сиденья так, чтобы рукоятки находились на уровне середины груди.',
      'Прижми спину к подушке и возьмись за рукоятки со слегка согнутыми локтями.',
      'На выдохе сведи руки перед собой и сделай паузу на 1 секунду в пике.',
      'На вдохе плавно верни руки назад, растягивая грудь без боли в плечах.'
    ],
    mistakes: 'Не сутуль плечи вперёд и не отрывай спину от спинки тренажёра.',
    breathing: 'Выдох на сведении, вдох на разведении.'
  }),
  gymEx({
    id: 'cable-crossover',
    name: 'Сведения рук в кроссовере',
    muscle: 'chest',
    equipment: 'cable',
    difficulty: 'Средний',
    kcalPerMin: 6.5,
    primaryMuscles: ['chest'],
    secondaryMuscles: ['shoulders', 'abs'],
    defaultSets: 3,
    defaultReps: 15,
    defaultWeightKg: 15,
    defaultRestSec: 60,
    shortTip: 'Шаг вперёд для устойчивости, фиксируй лёгкий изгиб в локтях всю амплитуду.',
    steps: [
      'Возьми верхние рукоятки кроссовера, сделай шаг вперёд и слегка наклони корпус.',
      'Напряги пресс и расправь грудь.',
      'На выдохе сведи руки по широкой дуге перед нижней частью груди или животом.',
      'Медленно верни руки в исходное положение, удерживая постоянное натяжение.'
    ],
    mistakes: 'Не превращай сведения в жим — угол в локтях должен оставаться постоянным.',
    breathing: 'Выдох при сведении, вдох при растяжении.'
  }),
  gymEx({
    id: 'chest-dips',
    name: 'Отжимания на брусьях',
    muscle: 'chest',
    equipment: 'none',
    difficulty: 'Средний',
    kcalPerMin: 9.0,
    primaryMuscles: ['chest', 'triceps'],
    secondaryMuscles: ['shoulders'],
    defaultSets: 3,
    defaultReps: 10,
    defaultWeightKg: 0,
    defaultRestSec: 75,
    shortTip: 'Наклони корпус слегка вперёд для груди или держи вертикально для трицепса.',
    steps: [
      'Запрыгни на брусья, выпрями руки и слегка наклони корпус вперёд.',
      'На вдохе плавно опустись вниз, пока плечи не окажутся примерно на уровне локтей.',
      'Локти уводи слегка в стороны-назад под контролем.',
      'На выдохе выжми себя вверх, сжимая грудь и трицепсы.'
    ],
    mistakes: 'Не опускайся слишком глубоко с «проваленными» плечами и не раскачивай ноги.',
    breathing: 'Вдох при опускании, выдох при подъёме.'
  }),

  // --- СПИНА (7) ---
  gymEx({
    id: 'deadlift',
    name: 'Становая тяга со штангой',
    muscle: 'back',
    equipment: 'barbell',
    difficulty: 'Высокий',
    kcalPerMin: 10.5,
    primaryMuscles: ['lower_back', 'glutes', 'hamstrings'],
    secondaryMuscles: ['upper_back', 'lats', 'quads', 'forearms'],
    defaultSets: 4,
    defaultReps: 6,
    defaultWeightKg: 80,
    defaultRestSec: 120,
    shortTip: 'Гриф скользит вплотную по голеням, спина строго ровная, подъём за счёт ног и таза.',
    steps: [
      'Поставь стопы на ширине таза так, чтобы гриф находился над серединой стопы.',
      'Возьмись за штангу снаружи коленей, расправь грудь, натяни спину и убери люфт грифа.',
      'На выдохе оттолкнись ногами от пола и выпрямись, ведя штангу строго вдоль ног.',
      'В верхней точке выпрями таз без чрезмерного отклонения назад и опусти штангу по той же траектории.'
    ],
    mistakes: 'Никогда не округляй поясницу и не дёргай штангу рывком с расслабленными руками.',
    breathing: 'Глубокий вдох в живот (брейсинг) перед подъёмом, выдох в верхней точке.'
  }),
  gymEx({
    id: 'pullups',
    name: 'Подтягивания на перекладине',
    muscle: 'back',
    equipment: 'none',
    difficulty: 'Высокий',
    kcalPerMin: 9.5,
    primaryMuscles: ['lats', 'upper_back'],
    secondaryMuscles: ['biceps', 'forearms', 'abs'],
    defaultSets: 4,
    defaultReps: 8,
    defaultWeightKg: 0,
    defaultRestSec: 90,
    shortTip: 'Тянись грудью к перекладине, сначала опуская плечи вниз и сводя лопатки.',
    steps: [
      'Возьмись за перекладину прямым хватом чуть шире плеч.',
      'Включи лопатки — опусти плечи вниз от ушей, слегка прогни грудь.',
      'На выдохе подтянись вверх, направляя локти вниз к корпусу, пока подбородок не окажется выше перекладины.',
      'На вдохе плавно опустись до полного выпрямления рук.'
    ],
    mistakes: 'Не раскачивайся рывками и не тяни только руками без включения спины.',
    breathing: 'Выдох на подъёме, вдох при опускании.'
  }),
  gymEx({
    id: 'lat-pulldown',
    name: 'Тяга верхнего блока к груди',
    muscle: 'back',
    equipment: 'cable',
    difficulty: 'Лёгкий',
    kcalPerMin: 7.0,
    primaryMuscles: ['lats'],
    secondaryMuscles: ['upper_back', 'biceps', 'forearms'],
    defaultSets: 4,
    defaultReps: 12,
    defaultWeightKg: 45,
    defaultRestSec: 75,
    shortTip: 'Тяни рукоять к верху груди, направляя локти вниз и немного вперёд.',
    steps: [
      'Зафиксируй бёдра под валиками и возьмись за широкую рукоять чуть шире плеч.',
      'Слегка отклони корпус назад (на 10–15°) и расправь грудную клетку.',
      'На выдохе плавно протяни гриф к верху груди, сводя лопатки вниз.',
      'На вдохе подконтрольно отпусти рукоять вверх, полностью растягивая широчайшие.'
    ],
    mistakes: 'Не тяни за голову и не раскачивайся всем корпусом назад.',
    breathing: 'Выдох при тяге вниз, вдох при возврате вверх.'
  }),
  gymEx({
    id: 'seated-cable-row',
    name: 'Тяга горизонтального блока к поясу',
    muscle: 'back',
    equipment: 'cable',
    difficulty: 'Лёгкий',
    kcalPerMin: 7.0,
    primaryMuscles: ['upper_back', 'lats'],
    secondaryMuscles: ['biceps', 'rear_delts', 'lower_back'],
    defaultSets: 4,
    defaultReps: 12,
    defaultWeightKg: 45,
    defaultRestSec: 75,
    shortTip: 'Держи спину ровно, веди локти вдоль тела и своди лопатки на 1 секунду.',
    steps: [
      'Упрись стопами в платформу, слегка согни колени и выпрями спину.',
      'Возьмись за V-образную рукоять и отведи плечи назад.',
      'На выдохе притяни рукоять к нижней части живота, максимально сводя лопатки.',
      'На вдохе плавно верни руки вперёд, не округляя поясницу.'
    ],
    mistakes: 'Не раскачивайся взад-вперёд как маятник и не поднимай плечи к ушам.',
    breathing: 'Выдох на тяге к поясу, вдох на растяжении.'
  }),
  gymEx({
    id: 'barbell-row',
    name: 'Тяга штанги в наклоне',
    muscle: 'back',
    equipment: 'barbell',
    difficulty: 'Средний',
    kcalPerMin: 8.5,
    primaryMuscles: ['lats', 'upper_back'],
    secondaryMuscles: ['lower_back', 'biceps', 'rear_delts'],
    defaultSets: 4,
    defaultReps: 10,
    defaultWeightKg: 50,
    defaultRestSec: 90,
    shortTip: 'Наклон корпуса ~45°, спина нейтральная, тяни гриф к нижней части живота.',
    steps: [
      'Возьми штангу на ширине плеч, чуть согни колени и наклони прямой корпус на 45°.',
      'Зафиксируй поясницу и напряги пресс.',
      'На выдохе потяни штангу к поясу, ведя локти назад вдоль туловища.',
      'На вдохе подконтрольно опусти штангу вниз, сохраняя наклон корпуса.'
    ],
    mistakes: 'Не округляй спину и не дёргай вес за счёт разгибания корпуса.',
    breathing: 'Выдох при тяге вверх, вдох при опускании.'
  }),
  gymEx({
    id: 'one-arm-dumbbell-row',
    name: 'Тяга гантели одной рукой в упоре',
    muscle: 'back',
    equipment: 'dumbbells',
    difficulty: 'Лёгкий',
    kcalPerMin: 7.5,
    primaryMuscles: ['lats'],
    secondaryMuscles: ['upper_back', 'biceps', 'rear_delts'],
    defaultSets: 3,
    defaultReps: 12,
    defaultWeightKg: 18,
    defaultRestSec: 60,
    shortTip: 'Веди гантель по дуге к карману бедра, не скручивая корпус.',
    steps: [
      'Упрись одноимённым коленом и ладонью в горизонтальную скамью, спина параллельна полу.',
      'Свободной рукой возьми гантель и слегка опусти плечо для растяжения.',
      'На выдохе потяни гантель вверх и чуть назад к тазобедренному суставу.',
      'Плавно опусти вниз и выполни одинаковое число повторений на обе стороны.'
    ],
    mistakes: 'Не разворачивай плечи в потолок и не тяни гантель прямо к подмышке.',
    breathing: 'Выдох на тяге, вдох на опускании.'
  }),
  gymEx({
    id: 'hyperextension',
    name: 'Гиперэкстензия',
    muscle: 'back',
    equipment: 'machine',
    difficulty: 'Лёгкий',
    kcalPerMin: 6.0,
    primaryMuscles: ['lower_back', 'glutes'],
    secondaryMuscles: ['hamstrings'],
    defaultSets: 3,
    defaultReps: 15,
    defaultWeightKg: 0,
    defaultRestSec: 60,
    shortTip: 'Поднимайся до ровной линии тела — без переразгибания в пояснице.',
    steps: [
      'Настрой подушку тренажёра чуть ниже тазовых костей, зафиксируй щиколотки.',
      'Скрести руки на груди (или держи блин) и на вдохе плавно опустись вниз с прямой спиной.',
      'На выдохе разогнись за счёт ягодиц и мышц-разгибателей спины до прямой линии.',
      'Задержись на секунду вверху и повтори плавно без рывков.'
    ],
    mistakes: 'Не запрокидывай голову и не прогибайся слишком высоко назад.',
    breathing: 'Вдох при наклоне, выдох на подъёме.'
  }),

  // --- НОГИ И ЯГОДИЦЫ (9) ---
  gymEx({
    id: 'barbell-squat',
    name: 'Приседания со штангой на плечах',
    muscle: 'legs',
    equipment: 'barbell',
    difficulty: 'Высокий',
    kcalPerMin: 10.0,
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'lower_back', 'abs'],
    defaultSets: 4,
    defaultReps: 8,
    defaultWeightKg: 70,
    defaultRestSec: 120,
    shortTip: 'Устойчивый упор всей стопой, колени идут по носкам, грудь раскрыта.',
    steps: [
      'Размести гриф на верхней части трапеций (не на шее), сведи лопатки и сними штангу со стоек.',
      'Сделай шаг назад, поставь стопы чуть шире плеч, носки слегка разверни.',
      'На вдохе напряги кор и опустись до параллели бёдер с полом или чуть ниже.',
      'На выдохе мощно вытолкни себя вверх полной стопой.'
    ],
    mistakes: 'Не своди колени внутрь и не отрывай пятки от пола.',
    breathing: 'Вдох и задержка (напряжение кора) на спуске, выдох в верхней половине подъёма.'
  }),
  gymEx({
    id: 'leg-press',
    name: 'Жим ногами в тренажёре',
    muscle: 'legs',
    equipment: 'machine',
    difficulty: 'Средний',
    kcalPerMin: 8.5,
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'calves'],
    defaultSets: 4,
    defaultReps: 12,
    defaultWeightKg: 120,
    defaultRestSec: 90,
    shortTip: 'Поясница плотно прижата к спинке, колени вверху не «вставляй» до щелчка.',
    steps: [
      'Сядь в тренажёр, плотно прижми таз и поясницу к подушке, поставь стопы на ширине плеч.',
      'Сними стопоры и на вдохе плавно опусти платформу, пока угол в коленях не станет ~90°.',
      'На выдохе выжми платформу вверх, оставляя колени слегка мягкими в верхней точке.',
      'Держись за боковые рукоятки, чтобы не отрывать таз от сиденья.'
    ],
    mistakes: 'Никогда не выпрямляй колени до полного замка и не подкручивай таз в нижней точке.',
    breathing: 'Вдох при сгибании ног, выдох на жиме.'
  }),
  gymEx({
    id: 'romanian-deadlift',
    name: 'Румынская тяга со штангой',
    muscle: 'legs',
    equipment: 'barbell',
    difficulty: 'Средний',
    kcalPerMin: 8.5,
    primaryMuscles: ['hamstrings', 'glutes'],
    secondaryMuscles: ['lower_back', 'forearms'],
    defaultSets: 4,
    defaultReps: 10,
    defaultWeightKg: 50,
    defaultRestSec: 90,
    shortTip: 'Слегка согни колени и отводи таз максимально назад, ведя гриф вплотную к ногам.',
    steps: [
      'Возьми штангу, встань ровно, колени слегка согнуты и зафиксированы в этом угле.',
      'На вдохе медленно отводи таз назад, опуская гриф вдоль бёдер до середины голени.',
      'Почувствуй сильное натяжение задней поверхности бедра при идеально ровной спине.',
      'На выдохе подай таз вперёд и сожми ягодицы, возвращаясь в стойку.'
    ],
    mistakes: 'Не округляй спину ради большей глубины — опускайся только пока таз идёт назад.',
    breathing: 'Вдох при наклоне, выдох при подъёме.'
  }),
  gymEx({
    id: 'bulgarian-split-squat',
    name: 'Болгарские выпады с гантелями',
    muscle: 'legs',
    equipment: 'dumbbells',
    difficulty: 'Высокий',
    kcalPerMin: 9.0,
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'abs'],
    defaultSets: 3,
    defaultReps: 10,
    defaultWeightKg: 14,
    defaultRestSec: 75,
    shortTip: 'Вес тела на передней ноге, лёгкий наклон корпуса вперёд сильнее нагрузит ягодицу.',
    steps: [
      'Встань спиной к скамье на расстоянии шага и положи подъём задней стопы на скамью.',
      'Возьми гантели в опущенные руки и выровняй таз.',
      'На вдохе плавно опустись вниз до угла ~90° в переднем колене.',
      'На выдохе оттолкнись передней стопой вверх, не перенося вес на заднюю ногу.'
    ],
    mistakes: 'Не ставь переднюю ногу слишком близко к скамье и не заваливай колено внутрь.',
    breathing: 'Вдох вниз, выдох вверх.'
  }),
  gymEx({
    id: 'leg-extension',
    name: 'Разгибание ног сидя в тренажёре',
    muscle: 'legs',
    equipment: 'machine',
    difficulty: 'Лёгкий',
    kcalPerMin: 6.0,
    primaryMuscles: ['quads'],
    secondaryMuscles: [],
    defaultSets: 3,
    defaultReps: 15,
    defaultWeightKg: 40,
    defaultRestSec: 60,
    shortTip: 'Совмести ось вращения тренажёра с коленным суставом, делай паузу вверху.',
    steps: [
      'Настрой спинку так, чтобы колени совпадали с осью рычага, а валик лежал над стопой.',
      'Возьмись за боковые ручки и плотно прижми таз.',
      'На выдохе плавно выпрями ноги до полного сокращения квадрицепсов и задержи на 1 секунду.',
      'На вдохе медленно опусти вес без удара плитками.'
    ],
    mistakes: 'Не делай резких махов с отрывом таза от сиденья.',
    breathing: 'Выдох на разгибании, вдох на опускании.'
  }),
  gymEx({
    id: 'leg-curl',
    name: 'Сгибание ног лёжа в тренажёре',
    muscle: 'legs',
    equipment: 'machine',
    difficulty: 'Лёгкий',
    kcalPerMin: 6.0,
    primaryMuscles: ['hamstrings'],
    secondaryMuscles: ['calves', 'glutes'],
    defaultSets: 3,
    defaultReps: 15,
    defaultWeightKg: 35,
    defaultRestSec: 60,
    shortTip: 'Плотно прижимай таз к скамье — не поднимай бёдра при сгибании.',
    steps: [
      'Ляг на живот, совмести колени с краем скамьи, валик расположен на задней части лодыжек.',
      'Напряги ягодицы и прижми таз к скамье.',
      'На выдохе плавно согни ноги, подтягивая валик к ягодицам.',
      'На вдохе подконтрольно выпрями ноги обратно.'
    ],
    mistakes: 'Не отрывай таз вверх и не бросай вес резко вниз.',
    breathing: 'Выдох на сгибании, вдох на возврате.'
  }),
  gymEx({
    id: 'hip-thrust',
    name: 'Ягодичный мост со штангой (Hip Thrust)',
    muscle: 'legs',
    equipment: 'barbell',
    difficulty: 'Средний',
    kcalPerMin: 8.0,
    primaryMuscles: ['glutes'],
    secondaryMuscles: ['hamstrings', 'quads', 'abs'],
    defaultSets: 4,
    defaultReps: 12,
    defaultWeightKg: 60,
    defaultRestSec: 75,
    shortTip: 'В верхней точке голени вертикальны, подбородок слегка прижат к груди, взгляд вперёд.',
    steps: [
      'Обопрись нижним краем лопаток о скамью, положи штангу с мягким валиком на сгиб бёдер.',
      'Поставь стопы так, чтобы при подъёме таза угол в коленях составлял 90°.',
      'На выдохе подними таз до прямой линии корпуса и сожми ягодицы на 1–2 секунды.',
      'На вдохе плавно опусти таз, удерживая контроль над поясницей.'
    ],
    mistakes: 'Не запрокидывай голову на скамью и не прогибай поясницу вверху.',
    breathing: 'Выдох на подъёме таза, вдох при опускании.'
  }),
  gymEx({
    id: 'hack-squat',
    name: 'Гакк-приседания в тренажёре',
    muscle: 'legs',
    equipment: 'machine',
    difficulty: 'Средний',
    kcalPerMin: 8.5,
    primaryMuscles: ['quads'],
    secondaryMuscles: ['glutes', 'calves'],
    defaultSets: 4,
    defaultReps: 10,
    defaultWeightKg: 60,
    defaultRestSec: 90,
    shortTip: 'Плотно прижми спину и плечи, опускайся глубоко и контролируй фазу спуска.',
    steps: [
      'Встань в тренажёр, упрись плечами в подушки, спина полностью прижата к платформе.',
      'Поставь стопы на ширине плеч в средней или нижней части площадки и сними фиксаторы.',
      'На вдохе медленно опустись максимально глубоко без отрыва пяток.',
      'На выдохе выжми себя вверх, оставляя колени слегка мягкими.'
    ],
    mistakes: 'Не отрывай пятки и не своди колени внутрь на подъёме.',
    breathing: 'Вдох при спуске, выдох на подъёме.'
  }),
  gymEx({
    id: 'standing-calf-raise',
    name: 'Подъём на носки стоя (икры)',
    muscle: 'legs',
    equipment: 'machine',
    difficulty: 'Лёгкий',
    kcalPerMin: 5.0,
    primaryMuscles: ['calves'],
    secondaryMuscles: [],
    defaultSets: 4,
    defaultReps: 15,
    defaultWeightKg: 40,
    defaultRestSec: 45,
    shortTip: 'Полная амплитуда: глубокое растяжение пятки вниз и 1-секундная пауза на самом верху.',
    steps: [
      'Поставь подушечки стоп на край платформы, плечи под подушками тренажёра.',
      'На вдохе плавно опусти пятки максимально вниз до хорошего растяжения икр.',
      'На выдохе поднимись как можно выше на носки и зафиксируй на 1 секунду.',
      'Не пружинь резко — работай плавно и подконтрольно.'
    ],
    mistakes: 'Не отскакивай в нижней точке за счёт инерции ахиллова сухожилия.',
    breathing: 'Выдох на подъёме, вдох при опускании.'
  }),

  // --- ПЛЕЧИ (6) ---
  gymEx({
    id: 'overhead-barbell-press',
    name: 'Армейский жим штанги стоя',
    muscle: 'shoulders',
    equipment: 'barbell',
    difficulty: 'Высокий',
    kcalPerMin: 8.5,
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['triceps', 'upper_back', 'abs'],
    defaultSets: 4,
    defaultReps: 8,
    defaultWeightKg: 40,
    defaultRestSec: 90,
    shortTip: 'Сожми ягодицы и пресс — корпус как монолит, штанга идёт строго вверх.',
    steps: [
      'Сними штангу со стоек на уровень ключиц хватом чуть шире плеч, локти слегка впереди грифа.',
      'Напряги ягодицы и пресс, чтобы исключить прогиб в пояснице.',
      'На выдохе выжми штангу строго вверх, слегка отводя голову назад, а затем возвращая под гриф.',
      'На вдохе плавно опусти штангу обратно к ключицам.'
    ],
    mistakes: 'Не отклоняйся сильно назад и не подталкивай вес ногами (это уже швунг).',
    breathing: 'Выдох на жиме вверх, вдох при опускании.'
  }),
  gymEx({
    id: 'seated-dumbbell-press',
    name: 'Жим гантелей сидя на плечи',
    muscle: 'shoulders',
    equipment: 'dumbbells',
    difficulty: 'Средний',
    kcalPerMin: 7.5,
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['triceps', 'upper_back'],
    defaultSets: 4,
    defaultReps: 10,
    defaultWeightKg: 16,
    defaultRestSec: 75,
    shortTip: 'Угол спинки 80–85°, локти направлены чуть вперёд на 20–30° от плоскости тела.',
    steps: [
      'Сядь на вертикальную скамью с плотным упором спины и подними гантели на уровень ушей.',
      'Удерживай локти немного впереди линии плеч для безопасности суставов.',
      'На выдохе выжми гантели вверх, не соударяя их вверху.',
      'На вдохе плавно опусти до уровня ушей или чуть ниже.'
    ],
    mistakes: 'Не отрывай поясницу от спинки и не разводи локти строго назад.',
    breathing: 'Выдох вверх, вдох вниз.'
  }),
  gymEx({
    id: 'lateral-raises',
    name: 'Махи гантелями в стороны',
    muscle: 'shoulders',
    equipment: 'dumbbells',
    difficulty: 'Лёгкий',
    kcalPerMin: 6.0,
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['upper_back'],
    defaultSets: 4,
    defaultReps: 15,
    defaultWeightKg: 8,
    defaultRestSec: 60,
    shortTip: 'Поднимай руки через стороны до уровня плеч, ведя движение локтями, а не кистями.',
    steps: [
      'Встань ровно, гантели у бёдер, локти слегка согнуты.',
      'На выдохе подними руки в стороны (чуть вперёд на 15°) до параллели с полом.',
      'Представь, что тянешься гантелями к боковым стенам, не задирая трапецию к ушам.',
      'На вдохе медленно опусти руки вниз, сохраняя напряжение.'
    ],
    mistakes: 'Не бери слишком тяжёлый вес и не раскачивай корпус.',
    breathing: 'Выдох на подъёме, вдох при опускании.'
  }),
  gymEx({
    id: 'front-raises',
    name: 'Подъёмы гантелей перед собой',
    muscle: 'shoulders',
    equipment: 'dumbbells',
    difficulty: 'Лёгкий',
    kcalPerMin: 5.5,
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['chest'],
    defaultSets: 3,
    defaultReps: 12,
    defaultWeightKg: 8,
    defaultRestSec: 60,
    shortTip: 'Поднимай гантель до уровня глаз без раскачки, опускай медленно.',
    steps: [
      'Встань прямо, держи гантели перед бёдрами с чуть согнутыми локтями.',
      'На выдохе плавно подними одну или обе гантели вперёд до высоты плеч.',
      'Задержи на долю секунды в верхней точке.',
      'На вдохе медленно опусти обратно к бёдрам.'
    ],
    mistakes: 'Не отклоняйся назад, помогая себе поясницей.',
    breathing: 'Выдох на подъёме, вдох при опускании.'
  }),
  gymEx({
    id: 'face-pull',
    name: 'Тяга каната к лицу (Face Pull)',
    muscle: 'shoulders',
    equipment: 'cable',
    difficulty: 'Лёгкий',
    kcalPerMin: 5.5,
    primaryMuscles: ['rear_delts', 'upper_back'],
    secondaryMuscles: ['shoulders', 'biceps'],
    defaultSets: 3,
    defaultReps: 15,
    defaultWeightKg: 20,
    defaultRestSec: 60,
    shortTip: 'Тяни канат ко лбу, разводя концы в стороны и разворачивая кулаки вверх.',
    steps: [
      'Установи блок на уровне глаз или чуть выше, прикрепи канатную рукоять.',
      'Отойди на шаг, возьми канат нейтральным хватом (большие пальцы к себе).',
      'На выдохе тяни рукоять к лицу, разводя локти высоко в стороны и сводя лопатки.',
      'Задержись на секунду в пике и плавно верни руки вперёд.'
    ],
    mistakes: 'Не опускай локти ниже кистей и не бери чрезмерный вес.',
    breathing: 'Выдох на тяге, вдох на возврате.'
  }),
  gymEx({
    id: 'reverse-pec-deck',
    name: 'Отведения в тренажёре на заднюю дельту',
    muscle: 'shoulders',
    equipment: 'machine',
    difficulty: 'Лёгкий',
    kcalPerMin: 5.5,
    primaryMuscles: ['rear_delts'],
    secondaryMuscles: ['upper_back'],
    defaultSets: 3,
    defaultReps: 15,
    defaultWeightKg: 25,
    defaultRestSec: 60,
    shortTip: 'Грудь плотно прижата к подушке, отводи руки назад без резкого сведения лопаток.',
    steps: [
      'Переведи рычаги тренажёра «Бабочка» в заднее положение и сядь лицом к спинке.',
      'Возьмись за горизонтальные или нейтральные рукоятки почти прямыми руками.',
      'На выдохе разведи руки в стороны и назад до линии корпуса.',
      'На вдохе медленно верни руки вперёд.'
    ],
    mistakes: 'Не поднимай плечи вверх и не отрывай грудь от упора.',
    breathing: 'Выдох при разведении, вдох при возврате.'
  }),

  // --- БИЦЕПС (4) ---
  gymEx({
    id: 'barbell-curl',
    name: 'Подъём штанги на бицепс стоя',
    muscle: 'biceps',
    equipment: 'barbell',
    difficulty: 'Лёгкий',
    kcalPerMin: 6.0,
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    defaultSets: 3,
    defaultReps: 10,
    defaultWeightKg: 25,
    defaultRestSec: 60,
    shortTip: 'Локти прижаты к бокам и неподвижны — поднимай гриф чисто силой бицепса.',
    steps: [
      'Встань ровно, возьми прямую или EZ-штангу нижним хватом на ширине плеч.',
      'Зафиксируй локти по бокам корпуса и напряги пресс.',
      'На выдохе плавно подними штангу к груди, максимально сжимая бицепсы.',
      'На вдохе медленно опусти гриф до почти полного выпрямления рук.'
    ],
    mistakes: 'Не помогай себе раскачкой спины и не выводи локти далеко вперёд.',
    breathing: 'Выдох на подъёме, вдох при опускании.'
  }),
  gymEx({
    id: 'dumbbell-curl',
    name: 'Подъём гантелей на бицепс с супинацией',
    muscle: 'biceps',
    equipment: 'dumbbells',
    difficulty: 'Лёгкий',
    kcalPerMin: 6.0,
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    defaultSets: 3,
    defaultReps: 12,
    defaultWeightKg: 12,
    defaultRestSec: 60,
    shortTip: 'Разворачивай ладонь мизинцем вверх в верхней половине подъёма для пика бицепса.',
    steps: [
      'Встань прямо, гантели в опущенных руках ладонями внутрь к бёдрам.',
      'На выдохе согни руку, одновременно разворачивая кисть ладонью вверх (супинация).',
      'Задержи на секунду в верхней точке, прожимая бицепс.',
      'Плавно опусти руку, возвращая кисть в нейтральное положение.'
    ],
    mistakes: 'Не размахивай корпусом и не бросай гантель вниз.',
    breathing: 'Выдох на сгибании, вдох на опускании.'
  }),
  gymEx({
    id: 'hammer-curl',
    name: 'Сгибания «Молотки» с гантелями',
    muscle: 'biceps',
    equipment: 'dumbbells',
    difficulty: 'Лёгкий',
    kcalPerMin: 6.0,
    primaryMuscles: ['biceps', 'forearms'],
    secondaryMuscles: [],
    defaultSets: 3,
    defaultReps: 12,
    defaultWeightKg: 14,
    defaultRestSec: 60,
    shortTip: 'Нейтральный хват (большие пальцы вверх) всю амплитуду — отлично качает брахиалис и предплечья.',
    steps: [
      'Держи гантели вдоль бёдер нейтральным хватом (ладони смотрят друг на друга).',
      'Зафиксируй локти у корпуса.',
      'На выдохе подними гантели к плечам, не разворачивая кисти.',
      'На вдохе медленно опусти в исходное положение.'
    ],
    mistakes: 'Не раскачивай плечами и не сгибай запястья.',
    breathing: 'Выдох вверх, вдох вниз.'
  }),
  gymEx({
    id: 'preacher-curl',
    name: 'Подъём EZ-штанги на скамье Скотта',
    muscle: 'biceps',
    equipment: 'barbell',
    difficulty: 'Лёгкий',
    kcalPerMin: 5.5,
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    defaultSets: 3,
    defaultReps: 12,
    defaultWeightKg: 22.5,
    defaultRestSec: 60,
    shortTip: 'Идеальная изоляция бицепса без читинга — не бросай штангу в нижней точке.',
    steps: [
      'Сядь за скамью Скотта, плотно упри заднюю часть плеч и подмышки в наклонную подушку.',
      'Возьми EZ-гриф нижним хватом.',
      'На выдохе подними гриф к плечам, полностью сокращая бицепс.',
      'На вдохе медленно опусти почти до полного выпрямления, не отрывая локтей.'
    ],
    mistakes: 'Не выпрямляй локти резко до щелчка под тяжёлым весом.',
    breathing: 'Выдох на сгибании, вдох на опускании.'
  }),

  // --- ТРИЦЕПС (4) ---
  gymEx({
    id: 'cable-tricep-pushdown',
    name: 'Разгибание рук на верхнем блоке',
    muscle: 'triceps',
    equipment: 'cable',
    difficulty: 'Лёгкий',
    kcalPerMin: 5.5,
    primaryMuscles: ['triceps'],
    secondaryMuscles: ['forearms'],
    defaultSets: 3,
    defaultReps: 15,
    defaultWeightKg: 25,
    defaultRestSec: 60,
    shortTip: 'Локти прижаты к рёбрам и неподвижны, разгибай руки полностью до сжатия трицепса.',
    steps: [
      'Встань лицом к верхнему блоку, возьми канат или прямую рукоять и слегка наклони корпус.',
      'Прижми локти к бокам — двигаются только предплечья.',
      'На выдохе разогни руки вниз (с канатом разведи концы внизу в стороны).',
      'На вдохе плавно подними предплечья чуть выше параллели с полом.'
    ],
    mistakes: 'Не наваливайся всем весом тела на рукоять и не уводи локти назад.',
    breathing: 'Выдох при разгибании вниз, вдох при подъёме.'
  }),
  gymEx({
    id: 'skull-crushers',
    name: 'Французский жим лёжа с EZ-штангой',
    muscle: 'triceps',
    equipment: 'barbell',
    difficulty: 'Средний',
    kcalPerMin: 6.5,
    primaryMuscles: ['triceps'],
    secondaryMuscles: ['forearms'],
    defaultSets: 3,
    defaultReps: 12,
    defaultWeightKg: 22.5,
    defaultRestSec: 75,
    shortTip: 'Уводи плечи слегка назад за вертикаль для лучшего растяжения длинной головки трицепса.',
    steps: [
      'Ляг на скамью и подними EZ-штангу вверх над лицом узким хватом.',
      'Чуть наклони плечи назад и зафиксируй локти в одном положении.',
      'На вдохе медленно опусти гриф к макушке или чуть за голову.',
      'На выдохе разогни руки обратно вверх силой трицепсов.'
    ],
    mistakes: 'Не разводи локти широко в стороны и не опускай штангу резко.',
    breathing: 'Вдох при сгибании, выдох на разгибании.'
  }),
  gymEx({
    id: 'overhead-tricep-extension',
    name: 'Разгибание рук из-за головы на блоке',
    muscle: 'triceps',
    equipment: 'cable',
    difficulty: 'Средний',
    kcalPerMin: 6.0,
    primaryMuscles: ['triceps'],
    secondaryMuscles: ['abs'],
    defaultSets: 3,
    defaultReps: 12,
    defaultWeightKg: 20,
    defaultRestSec: 60,
    shortTip: 'Растянутая позиция над головой даёт максимальный стимул длинной головке трицепса.',
    steps: [
      'Встань спиной к блоку, возьми канатную рукоять за головой, сделай шаг вперёд.',
      'Направь локти вперёд и вверх, напряги кор.',
      'На выдохе мощно разогни руки вперёд-вверх до полного выпрямления.',
      'На вдохе плавно согни руки за голову, чувствуя глубокое растяжение.'
    ],
    mistakes: 'Не прогибай поясницу и не позволяй локтям разъезжаться в стороны.',
    breathing: 'Выдох на разгибании, вдох на сгибании.'
  }),
  gymEx({
    id: 'close-grip-bench',
    name: 'Жим штанги узким хватом',
    muscle: 'triceps',
    equipment: 'barbell',
    difficulty: 'Средний',
    kcalPerMin: 7.5,
    primaryMuscles: ['triceps'],
    secondaryMuscles: ['chest', 'shoulders'],
    defaultSets: 4,
    defaultReps: 8,
    defaultWeightKg: 50,
    defaultRestSec: 90,
    shortTip: 'Хват строго на ширине плеч (не вплотную!), локти скользят близко к корпусу.',
    steps: [
      'Ляг на горизонтальную скамью и возьми гриф на ширине плеч.',
      'Сними штангу и на вдохе опусти к нижней части груди, держа локти близко к рёбрам.',
      'На выдохе выжми штангу вверх, акцентируя работу трицепсов.',
      'Сохраняй стабильный упор стопами и сведённые лопатки.'
    ],
    mistakes: 'Не бери слишком узкий хват (уже 25–30 см) — это перегружает запястья.',
    breathing: 'Вдох при опускании, выдох на жиме.'
  }),

  // --- ПРЕСС И КОР В ЗАЛЕ (4) ---
  gymEx({
    id: 'hanging-leg-raise',
    name: 'Подъём ног в висе на турнике',
    muscle: 'core',
    equipment: 'none',
    difficulty: 'Высокий',
    kcalPerMin: 8.0,
    primaryMuscles: ['abs'],
    secondaryMuscles: ['obliques', 'forearms'],
    defaultSets: 3,
    defaultReps: 12,
    defaultWeightKg: 0,
    defaultRestSec: 60,
    shortTip: 'Вверху слегка подкручивай таз вверх — именно это включает прямую мышцу живота.',
    steps: [
      'Повисни на турнике или в упоре на локтях, останови раскачку.',
      'На выдохе подними прямые или чуть согнутые ноги до горизонтали или выше, подкручивая таз.',
      'Задержись на долю секунды вверху.',
      'На вдохе медленно опусти ноги без раскачивания корпуса.'
    ],
    mistakes: 'Не бросай ноги вниз и не раскачивайся по инерции.',
    breathing: 'Выдох на подъёме ног, вдох при опускании.'
  }),
  gymEx({
    id: 'cable-crunch',
    name: 'Скручивания на верхнем блоке («Молитва»)',
    muscle: 'core',
    equipment: 'cable',
    difficulty: 'Средний',
    kcalPerMin: 6.5,
    primaryMuscles: ['abs'],
    secondaryMuscles: ['obliques'],
    defaultSets: 3,
    defaultReps: 15,
    defaultWeightKg: 30,
    defaultRestSec: 60,
    shortTip: 'Таз остаётся неподвижным — скручивай именно грудной отдел к коленям, сгибая позвоночник.',
    steps: [
      'Встань на колени перед верхним блоком и возьми концы каната у висков.',
      'Зафиксируй бёдра вертикально и не садись на пятки.',
      'На выдохе скрути корпус вниз, приближая рёбра к тазу и округляя спину.',
      'На вдохе плавно вернись вверх, контролируя натяжение блока.'
    ],
    mistakes: 'Не просто кланяйся с прямой спиной — нужно именно скручивание прессом.',
    breathing: 'Полный выдох при скручивании вниз, вдох при подъёме.'
  }),
  gymEx({
    id: 'ab-wheel-rollout',
    name: 'Ролик для пресса (Ab Wheel)',
    muscle: 'core',
    equipment: 'machine',
    difficulty: 'Высокий',
    kcalPerMin: 8.0,
    primaryMuscles: ['abs'],
    secondaryMuscles: ['obliques', 'lats', 'shoulders'],
    defaultSets: 3,
    defaultReps: 10,
    defaultWeightKg: 0,
    defaultRestSec: 60,
    shortTip: 'Подкрути таз и держи спину чуть округлённой — не проваливай поясницу!',
    steps: [
      'Встань на колени на мягкий коврик, возьмись за рукоятки ролика под плечами.',
      'Напряги пресс и ягодицы, слегка подкрутив таз внутрь.',
      'На вдохе медленно выкати ролик вперёд настолько далеко, насколько удерживаешь ровную поясницу.',
      'На выдохе мощно подтяни ролик обратно за счёт мышц живота.'
    ],
    mistakes: 'Не прогибайся в пояснице — при потере контроля сократи амплитуду.',
    breathing: 'Вдох при выкате, выдох при возврате.'
  }),
  gymEx({
    id: 'russian-twist',
    name: 'Русские скручивания с блином',
    muscle: 'core',
    equipment: 'dumbbells',
    difficulty: 'Средний',
    kcalPerMin: 7.0,
    primaryMuscles: ['obliques', 'abs'],
    secondaryMuscles: [],
    defaultSets: 3,
    defaultReps: 20,
    defaultWeightKg: 10,
    defaultRestSec: 45,
    shortTip: 'Поворачивай всю грудную клетку вместе с весом, а не просто перекладывай руки.',
    steps: [
      'Сядь на коврик, отклони прямую спину на 45°, при желании приподними стопы над полом.',
      'Возьми блин или гантель перед грудью.',
      'На выдохе поверни корпус вправо, касаясь весом почти до пола.',
      'Плавно разверни корпус влево, сохраняя напряжение в прессе.'
    ],
    mistakes: 'Не сутуль поясницу и не дёргай вес шеей.',
    breathing: 'Выдох на каждом повороте в сторону.'
  }),

  /* ===================== 12 HOME / BODYWEIGHT EXERCISES ===================== */
  {
    id: 'pushups',
    name: 'Классические отжимания',
    muscle: 'chest',
    muscleLabel: 'Грудь',
    equipment: 'none',
    equipmentLabel: 'Свой вес',
    difficulty: 'Средний',
    kcalPerMin: 8.5,
    image: 'assets/exercises/pushups.jpg',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'shoulders', 'abs'],
    defaultSets: 3,
    defaultReps: 15,
    defaultWeightKg: 0,
    defaultRestSec: 45,
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
    equipmentLabel: 'Свой вес',
    difficulty: 'Лёгкий',
    kcalPerMin: 8.0,
    image: 'assets/exercises/squats.jpg',
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'calves'],
    defaultSets: 3,
    defaultReps: 20,
    defaultWeightKg: 0,
    defaultRestSec: 45,
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
    muscleLabel: 'Пресс и кор',
    equipment: 'none',
    equipmentLabel: 'Свой вес',
    difficulty: 'Лёгкий',
    kcalPerMin: 5.5,
    image: 'assets/exercises/plank.jpg',
    primaryMuscles: ['abs', 'obliques'],
    secondaryMuscles: ['shoulders', 'lower_back', 'glutes'],
    defaultSets: 3,
    defaultReps: 1,
    defaultWeightKg: 0,
    defaultRestSec: 45,
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
    equipmentLabel: 'Свой вес',
    difficulty: 'Средний',
    kcalPerMin: 8.5,
    image: 'assets/exercises/lunges.jpg',
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'calves'],
    defaultSets: 3,
    defaultReps: 16,
    defaultWeightKg: 0,
    defaultRestSec: 45,
    shortTip: 'Держи корпус вертикально, оба колена образуют угол 90° в нижней точке.',
    steps: [
      'Встань прямо, ноги на ширине таза, руки на поясе или перед грудью.',
      'Сделай уверенный шаг вперёд и опустись, пока оба колена не согнутся под 90°.',
      'Заднее колено останавливается в нескольких сантиметрах от пола.',
      'Оттолкнись передней пяткой, вернись в стойку и поменяй ногу.'
    ],
    mistakes: 'Не заваливай корпус вперёд и не ставь стопы на одну узкую линию.',
    breathing: 'Вдох при шаге и опускании, выдох при возврате в стойку.'
  },
  {
    id: 'burpees',
    name: 'Бёрпи',
    muscle: 'full',
    muscleLabel: 'Всё тело / Кардио',
    equipment: 'none',
    equipmentLabel: 'Свой вес',
    difficulty: 'Высокий',
    kcalPerMin: 13.0,
    image: 'assets/exercises/burpees.jpg',
    primaryMuscles: ['quads', 'chest', 'abs'],
    secondaryMuscles: ['shoulders', 'triceps', 'glutes', 'calves'],
    defaultSets: 3,
    defaultReps: 12,
    defaultWeightKg: 0,
    defaultRestSec: 60,
    shortTip: 'Держи ритм, мягко приземляйся на переднюю часть стопы.',
    steps: [
      'Из положения стоя опустись в присед и поставь ладони на пол.',
      'Прыжком отбрось ноги назад в высокую планку (по желанию добавь отжимание).',
      'Прыжком подтяни стопы обратно к ладоням.',
      'Выпрыгни вверх, поднимая руки над головой, и мягко приземлись.'
    ],
    mistakes: 'Не проваливай поясницу в планке и не приземляйся на прямые жёсткие колени.',
    breathing: 'Выдох на выпрыгивании, короткий вдох при переходе в планку.'
  },
  {
    id: 'jumping-jacks',
    name: 'Прыжки «Джампинг Джек»',
    muscle: 'full',
    muscleLabel: 'Всё тело / Кардио',
    equipment: 'none',
    equipmentLabel: 'Свой вес',
    difficulty: 'Лёгкий',
    kcalPerMin: 10.0,
    image: 'assets/exercises/jumping-jacks.jpg',
    primaryMuscles: ['calves', 'shoulders'],
    secondaryMuscles: ['quads', 'glutes', 'abs'],
    defaultSets: 3,
    defaultReps: 30,
    defaultWeightKg: 0,
    defaultRestSec: 30,
    shortTip: 'Прыгай легко на носках, руки описывают полную дугу над головой.',
    steps: [
      'Встань прямо, ноги вместе, руки свободно вдоль корпуса.',
      'В прыжке разведи ноги шире плеч и одновременно подними руки вверх через стороны.',
      'Следующим лёгким прыжком вернись в исходное положение.',
      'Поддерживай ровный, энергичный темп.'
    ],
    mistakes: 'Не приземляйся тяжело на пятки.',
    breathing: 'Свободное ритмичное дыхание без задержек.'
  },
  {
    id: 'mountain-climbers',
    name: 'Скалолаз (Mountain Climbers)',
    muscle: 'core',
    muscleLabel: 'Пресс и кор',
    equipment: 'none',
    equipmentLabel: 'Свой вес',
    difficulty: 'Средний',
    kcalPerMin: 11.0,
    image: 'assets/exercises/mountain-climbers.jpg',
    primaryMuscles: ['abs', 'quads'],
    secondaryMuscles: ['shoulders', 'obliques'],
    defaultSets: 3,
    defaultReps: 24,
    defaultWeightKg: 0,
    defaultRestSec: 45,
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
    muscleLabel: 'Пресс и кор',
    equipment: 'none',
    equipmentLabel: 'Свой вес',
    difficulty: 'Средний',
    kcalPerMin: 7.5,
    image: 'assets/exercises/crunches.jpg',
    primaryMuscles: ['abs', 'obliques'],
    secondaryMuscles: ['quads'],
    defaultSets: 3,
    defaultReps: 20,
    defaultWeightKg: 0,
    defaultRestSec: 45,
    shortTip: 'Тянись плечом к противоположному колену, поясница прижата к коврику.',
    steps: [
      'Ляг на спину, прижми поясницу к полу, кончики пальцев легко касаются висков.',
      'Подними лопатки и вытяни ноги под углом около 45°.',
      'Скручивай корпус, направляя правое плечо к левому колену.',
      'Плавно и подконтрольно смени сторону.'
    ],
    mistakes: 'Не тяни руками за шею и не торопись.',
    breathing: 'Выдох на каждом скручивании, вдох в центре.'
  },
  {
    id: 'glute-bridge',
    name: 'Ягодичный мостик на полу',
    muscle: 'legs',
    muscleLabel: 'Ноги и ягодицы',
    equipment: 'none',
    equipmentLabel: 'Свой вес',
    difficulty: 'Лёгкий',
    kcalPerMin: 6.0,
    image: 'assets/exercises/glute-bridge.jpg',
    primaryMuscles: ['glutes'],
    secondaryMuscles: ['hamstrings', 'lower_back'],
    defaultSets: 3,
    defaultReps: 15,
    defaultWeightKg: 0,
    defaultRestSec: 45,
    shortTip: 'В верхней точке задержись на секунду и максимально сожми ягодицы.',
    steps: [
      'Ляг на спину, согни колени, поставь стопы ближе к ягодицам.',
      'Руки лежат вдоль корпуса ладонями вниз.',
      'На выдохе подними таз вверх до прямой линии от плеч до коленей.',
      'Задержись на 1 секунду и плавно опусти таз.'
    ],
    mistakes: 'Не переразгибай поясницу вверху.',
    breathing: 'Выдох на подъёме таза, вдох при опускании.'
  },
  {
    id: 'dumbbell-press',
    name: 'Жим гантелей стоя вверх',
    muscle: 'shoulders',
    muscleLabel: 'Плечи',
    equipment: 'dumbbells',
    equipmentLabel: 'Гантели',
    difficulty: 'Средний',
    kcalPerMin: 7.5,
    image: 'assets/exercises/dumbbell-press.jpg',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['triceps', 'abs'],
    defaultSets: 3,
    defaultReps: 12,
    defaultWeightKg: 12,
    defaultRestSec: 60,
    shortTip: 'Пресс и ягодицы в тонусе — не прогибай поясницу, выжимая гантели вверх.',
    steps: [
      'Встань прямо, подними гантели на уровень плеч ладонями вперёд.',
      'Напряги кор, чтобы зафиксировать корпус.',
      'На выдохе выжми гантели строго вверх.',
      'На вдохе плавно верни гантели к плечам.'
    ],
    mistakes: 'Не раскачивай корпус и не ударяй гантели вверху.',
    breathing: 'Выдох на жиме вверх, вдох при опускании.'
  },
  {
    id: 'dumbbell-row',
    name: 'Тяга гантелей в наклоне',
    muscle: 'back',
    muscleLabel: 'Спина',
    equipment: 'dumbbells',
    equipmentLabel: 'Гантели',
    difficulty: 'Средний',
    kcalPerMin: 8.0,
    image: 'assets/exercises/dumbbell-row.jpg',
    primaryMuscles: ['lats', 'upper_back'],
    secondaryMuscles: ['biceps', 'lower_back', 'rear_delts'],
    defaultSets: 3,
    defaultReps: 12,
    defaultWeightKg: 14,
    defaultRestSec: 60,
    shortTip: 'Своди лопатки вместе, тяни гантели к поясу, сохраняя нейтральную спину.',
    steps: [
      'Слегка согни колени и наклони прямой корпус вперёд под углом ~45°.',
      'Опусти руки с гантелями вниз, плечи отведены от ушей.',
      'На выдохе подтяни гантели к нижней части живота, сводя лопатки.',
      'На вдохе плавно опусти вес.'
    ],
    mistakes: 'Не округляй поясницу и не задирай голову вверх.',
    breathing: 'Выдох при тяге к поясу, вдох при опускании.'
  },
  {
    id: 'cobra-stretch',
    name: 'Растяжка «Кобра» и раскрытие груди',
    muscle: 'stretch',
    muscleLabel: 'Растяжка',
    equipment: 'none',
    equipmentLabel: 'Свой вес',
    difficulty: 'Лёгкий',
    kcalPerMin: 3.0,
    image: 'assets/exercises/cobra-stretch.jpg',
    primaryMuscles: ['lower_back', 'abs'],
    secondaryMuscles: ['chest'],
    defaultSets: 2,
    defaultReps: 1,
    defaultWeightKg: 0,
    defaultRestSec: 20,
    shortTip: 'Мягко раскрывай грудную клетку, плечи опущены вниз от ушей.',
    steps: [
      'Ляг на живот, вытяни ноги назад, ладони под плечами.',
      'На вдохе мягко оттолкнись руками и подними грудную клетку вверх.',
      'Бёдра и таз остаются расслабленными на коврике.',
      'Удерживай комфортное растяжение, глубоко дыша.'
    ],
    mistakes: 'Не запрокидывай голову и не доводи прогиб до дискомфорта.',
    breathing: 'Медленные глубокие вдохи и длинные выдохи.'
  }
];

export function getAllExercises() {
  return [...getCustomExercises(), ...BUILTIN_EXERCISES];
}

export function getExerciseById(id) {
  return getAllExercises().find((e) => e.id === id) || null;
}

export function generateCustomExerciseSvg(equipment = 'dumbbells') {
  const iconMap = {
    barbell: `<line x1="170" y1="400" x2="630" y2="400" stroke="#94A3B8" stroke-width="18" stroke-linecap="round"/>
      <rect x="215" y="275" width="44" height="250" rx="10" fill="#1B2230" stroke="#B8F228" stroke-width="6"/>
      <rect x="175" y="310" width="32" height="180" rx="8" fill="#1B2230" stroke="#64748B" stroke-width="5"/>
      <rect x="541" y="275" width="44" height="250" rx="10" fill="#1B2230" stroke="#B8F228" stroke-width="6"/>
      <rect x="593" y="310" width="32" height="180" rx="8" fill="#1B2230" stroke="#64748B" stroke-width="5"/>`,
    dumbbells: `<g transform="rotate(-18 400 400)">
      <rect x="290" y="384" width="220" height="32" rx="12" fill="#94A3B8"/>
      <rect x="220" y="300" width="76" height="200" rx="16" fill="#1B2230" stroke="#B8F228" stroke-width="7"/>
      <rect x="504" y="300" width="76" height="200" rx="16" fill="#1B2230" stroke="#B8F228" stroke-width="7"/>
    </g>`,
    machine: `<rect x="255" y="225" width="290" height="350" rx="28" fill="#1B2230" stroke="#475569" stroke-width="10"/>
      <rect x="305" y="285" width="190" height="34" rx="8" fill="#2A3448"/>
      <rect x="305" y="340" width="190" height="34" rx="8" fill="#2A3448"/>
      <rect x="305" y="395" width="190" height="34" rx="8" fill="#B8F228"/>
      <rect x="305" y="450" width="190" height="34" rx="8" fill="#2A3448"/>`,
    cable: `<circle cx="400" cy="255" r="56" fill="#1B2230" stroke="#B8F228" stroke-width="10"/>
      <line x1="400" y1="311" x2="400" y2="515" stroke="#94A3B8" stroke-width="10" stroke-dasharray="14 10"/>
      <path d="M295 515 Q400 565 505 515" fill="none" stroke="#B8F228" stroke-width="16" stroke-linecap="round"/>`,
    none: `<circle cx="400" cy="275" r="54" fill="#B8F228"/>
      <path d="M265 420 Q400 345 535 420" fill="none" stroke="#B8F228" stroke-width="26" stroke-linecap="round"/>
      <line x1="400" y1="365" x2="400" y2="545" stroke="#E2E8F0" stroke-width="28" stroke-linecap="round"/>`
  };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">
    <rect width="800" height="800" fill="#161B26"/>
    <circle cx="400" cy="400" r="260" fill="#232D42" opacity="0.55"/>
    ${iconMap[equipment] || iconMap.dumbbells}
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

export const BUILTIN_WORKOUTS = [
  /* ---------- GYM PROGRAMS (TOP-40 BASED) ---------- */
  {
    id: 'gym-push',
    name: 'Зал: Push (Грудь, Плечи, Трицепс)',
    description: 'Классическая силовая тренировка жимовых мышц в зале с учётом весов, подходов и таймером отдыха.',
    category: 'gym',
    categoryLabel: 'В зале · Push',
    difficulty: 'Средний',
    rounds: 1,
    prepSec: 5,
    roundRestSec: 0,
    coverImage: imgUrl('assets/exercises/barbell-bench-press.jpg'),
    items: [
      { exerciseId: 'barbell-bench-press', mode: 'reps', sets: 4, reps: 8, weightKg: 60, restSec: 90 },
      { exerciseId: 'incline-dumbbell-press', mode: 'reps', sets: 3, reps: 10, weightKg: 20, restSec: 75 },
      { exerciseId: 'pec-deck-fly', mode: 'reps', sets: 3, reps: 15, weightKg: 35, restSec: 60 },
      { exerciseId: 'seated-dumbbell-press', mode: 'reps', sets: 4, reps: 10, weightKg: 16, restSec: 75 },
      { exerciseId: 'lateral-raises', mode: 'reps', sets: 3, reps: 15, weightKg: 8, restSec: 60 },
      { exerciseId: 'cable-tricep-pushdown', mode: 'reps', sets: 3, reps: 15, weightKg: 25, restSec: 60 }
    ]
  },
  {
    id: 'gym-pull',
    name: 'Зал: Pull (Спина, Задняя дельта, Бицепс)',
    description: 'Мощная тяговая сессия для ширины и толщины спины, осанки и объёмных рук.',
    category: 'gym',
    categoryLabel: 'В зале · Pull',
    difficulty: 'Средний',
    rounds: 1,
    prepSec: 5,
    roundRestSec: 0,
    coverImage: imgUrl('assets/exercises/lat-pulldown.jpg'),
    items: [
      { exerciseId: 'deadlift', mode: 'reps', sets: 3, reps: 6, weightKg: 80, restSec: 120 },
      { exerciseId: 'lat-pulldown', mode: 'reps', sets: 4, reps: 12, weightKg: 45, restSec: 75 },
      { exerciseId: 'seated-cable-row', mode: 'reps', sets: 4, reps: 12, weightKg: 45, restSec: 75 },
      { exerciseId: 'face-pull', mode: 'reps', sets: 3, reps: 15, weightKg: 20, restSec: 60 },
      { exerciseId: 'barbell-curl', mode: 'reps', sets: 3, reps: 10, weightKg: 25, restSec: 60 },
      { exerciseId: 'hammer-curl', mode: 'reps', sets: 3, reps: 12, weightKg: 14, restSec: 60 }
    ]
  },
  {
    id: 'gym-legs',
    name: 'Зал: День ног и ягодиц (Legs)',
    description: 'Полная проработка квадрицепсов, бицепса бедра, ягодиц и икр с рабочими весами.',
    category: 'gym',
    categoryLabel: 'В зале · Legs',
    difficulty: 'Высокий',
    rounds: 1,
    prepSec: 5,
    roundRestSec: 0,
    coverImage: 'assets/exercises/barbell-squat.jpg',
    items: [
      { exerciseId: 'barbell-squat', mode: 'reps', sets: 4, reps: 8, weightKg: 70, restSec: 120 },
      { exerciseId: 'romanian-deadlift', mode: 'reps', sets: 4, reps: 10, weightKg: 50, restSec: 90 },
      { exerciseId: 'leg-press', mode: 'reps', sets: 3, reps: 12, weightKg: 120, restSec: 90 },
      { exerciseId: 'leg-extension', mode: 'reps', sets: 3, reps: 15, weightKg: 40, restSec: 60 },
      { exerciseId: 'leg-curl', mode: 'reps', sets: 3, reps: 15, weightKg: 35, restSec: 60 },
      { exerciseId: 'standing-calf-raise', mode: 'reps', sets: 4, reps: 15, weightKg: 40, restSec: 45 }
    ]
  },
  {
    id: 'gym-fullbody',
    name: 'Зал: Базовый Full Body',
    description: 'Универсальная тренировка всех основных мышечных групп за одно занятие в зале.',
    category: 'gym',
    categoryLabel: 'В зале · База',
    difficulty: 'Средний',
    rounds: 1,
    prepSec: 5,
    roundRestSec: 0,
    coverImage: imgUrl('assets/exercises/deadlift.jpg'),
    items: [
      { exerciseId: 'barbell-squat', mode: 'reps', sets: 3, reps: 8, weightKg: 60, restSec: 90 },
      { exerciseId: 'barbell-bench-press', mode: 'reps', sets: 3, reps: 8, weightKg: 55, restSec: 90 },
      { exerciseId: 'barbell-row', mode: 'reps', sets: 3, reps: 10, weightKg: 50, restSec: 75 },
      { exerciseId: 'overhead-barbell-press', mode: 'reps', sets: 3, reps: 10, weightKg: 35, restSec: 75 },
      { exerciseId: 'dumbbell-curl', mode: 'reps', sets: 3, reps: 12, weightKg: 12, restSec: 60 },
      { exerciseId: 'hanging-leg-raise', mode: 'reps', sets: 3, reps: 12, weightKg: 0, restSec: 60 }
    ]
  },

  /* ---------- HOME / HIIT / STRETCH PROGRAMS ---------- */
  {
    id: 'fullbody-home',
    name: 'Всё тело дома (круговая)',
    description: 'Сбалансированная круговая тренировка без инвентаря: прорабатывает ноги, грудь, кор и заряжает энергией.',
    category: 'bodyweight',
    categoryLabel: 'Дома · Свой вес',
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
    name: 'Домашняя силовая с гантелями',
    description: 'Силовая тренировка дома с парой гантелей, фиксацией рабочих весов и отдыхом между подходами.',
    category: 'dumbbells',
    categoryLabel: 'Гантели',
    difficulty: 'Средний',
    rounds: 1,
    prepSec: 5,
    roundRestSec: 60,
    coverImage: 'assets/exercises/dumbbell-press.jpg',
    items: [
      { exerciseId: 'dumbbell-press', mode: 'reps', sets: 3, reps: 12, weightKg: 10, restSec: 60 },
      { exerciseId: 'dumbbell-row', mode: 'reps', sets: 3, reps: 12, weightKg: 12, restSec: 60 },
      { exerciseId: 'bulgarian-split-squat', mode: 'reps', sets: 3, reps: 10, weightKg: 10, restSec: 60 },
      { exerciseId: 'pushups', mode: 'reps', sets: 3, reps: 12, weightKg: 0, restSec: 45 },
      { exerciseId: 'plank', mode: 'time', durationSec: 45, restSec: 30 }
    ]
  },
  {
    id: 'core-sculpt',
    name: 'Стальной пресс и кор',
    description: 'Точечная работа на глубокие мышцы живота, стабилизацию спины и осанку.',
    category: 'bodyweight',
    categoryLabel: 'Пресс и кор',
    difficulty: 'Средний',
    rounds: 2,
    prepSec: 8,
    roundRestSec: 35,
    coverImage: 'assets/exercises/crunches.jpg',
    items: [
      { exerciseId: 'plank', mode: 'time', durationSec: 45, restSec: 15 },
      { exerciseId: 'crunches', mode: 'time', durationSec: 40, restSec: 15 },
      { exerciseId: 'mountain-climbers', mode: 'time', durationSec: 35, restSec: 15 },
      { exerciseId: 'russian-twist', mode: 'time', durationSec: 40, restSec: 15 },
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
    coverImage: 'assets/exercises/cobra-stretch.jpg',
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
      const ex = getExerciseById(item.exerciseId);
      const kcalMin = ex ? ex.kcalPerMin : 7;

      if (item.mode === 'reps') {
        const sets = Math.max(1, Number(item.sets) || 3);
        const workPerSet = Math.max(25, (Number(item.reps) || 10) * 3.5);
        const rest = Number(item.restSec) || 60;
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
