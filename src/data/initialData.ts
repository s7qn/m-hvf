import { Subject, Lecture, Summary, ExamQuestionPaper, ScheduleItem } from '../types';

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'engineering-math',
    code: 'MATH101',
    nameAr: 'رياضيات هندسية',
    nameEn: 'Engineering Mathematics',
    stage: 1,
    semester: 1,
    iconName: 'Calculator',
    descriptionAr: 'التفاضل والتكامل المتقدم، المعادلات التفاضلية، الجبر الخطي والمصفوفات والمتجهات الهندسية.',
    descriptionEn: 'Advanced calculus, ordinary differential equations, linear algebra, matrices, and engineering vectors.',
    totalLectures: 0,
  },
  {
    id: 'control-theory',
    code: 'CAE301',
    nameAr: 'نظرية السيطرة',
    nameEn: 'Control Theory',
    stage: 3,
    semester: 1,
    iconName: 'Gauge',
    descriptionAr: 'دوال التحويل، المخططات الصندوقية، استقرارية روث هورويتز، مخططات بود ومحل الجذور وPID Controllers.',
    descriptionEn: 'Transfer functions, block diagram reduction, Routh-Hurwitz stability, Bode plots, Root Locus, and PID tuning.',
    totalLectures: 0,
  },
  {
    id: 'digital-logic',
    code: 'CAE102',
    nameAr: 'المنطق الرقمي',
    nameEn: 'Digital Logic',
    stage: 1,
    semester: 2,
    iconName: 'Binary',
    descriptionAr: 'البوابات المنطقية، الجبر البولياني، خرائط كارنوف، الدوائر التوافقية والتتابعية، القلابات والعدادات الرقمية.',
    descriptionEn: 'Logic gates, Boolean algebra, Karnaugh maps, combinational and sequential logic, flip-flops, and counters.',
    totalLectures: 0,
  },
  {
    id: 'measurements',
    code: 'CAE202',
    nameAr: 'قياسات',
    nameEn: 'Measurements',
    stage: 2,
    semester: 1,
    iconName: 'Activity',
    descriptionAr: 'أجهزة القياس الكهربائية والصناعية، محولات الإشارة، جسور القياس، وحساب نسب الخطأ والمعايرة.',
    descriptionEn: 'Electrical & industrial measuring instruments, transducers, bridge circuits, calibration, and signal conditioning.',
    totalLectures: 0,
  },
  {
    id: 'programming-fundamentals',
    code: 'CAE103',
    nameAr: 'اساسيات البرمجة',
    nameEn: 'Programming Fundamentals',
    stage: 1,
    semester: 1,
    iconName: 'Code',
    descriptionAr: 'مبادئ البرمجة للمهندسين، الخوارزميات، هياكل التحكم، المصفوفات، الدوال والبرمجة الكائنية C++.',
    descriptionEn: 'Engineering programming principles, algorithms, control structures, arrays, functions, and structured C++.',
    totalLectures: 0,
  },
  {
    id: 'baath-crimes',
    code: 'UNI101',
    nameAr: 'جرائم حزب البعث',
    nameEn: 'Crimes of the Baath Party',
    stage: 1,
    semester: 2,
    iconName: 'ShieldAlert',
    descriptionAr: 'المقرر الجامعي التوثيقي الوطني حول الانتهاكات والجرائم التاريخية، حقوق الإنسان، وترسيخ الوعي والعدالة الانتقالية.',
    descriptionEn: 'National academic curriculum documenting historical violations, human rights principles, and transitional justice.',
    totalLectures: 0,
  },
];

export const INITIAL_LECTURES: Lecture[] = [];

export const INITIAL_SUMMARIES: Summary[] = [];

export const INITIAL_EXAMS: ExamQuestionPaper[] = [];

export const INITIAL_SCHEDULE: ScheduleItem[] = [];
