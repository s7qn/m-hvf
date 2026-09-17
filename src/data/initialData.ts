import { Subject, Lecture, Summary, ExamQuestionPaper, ScheduleItem } from '../types';

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'control-theory',
    code: 'CAE201',
    nameAr: 'نظرية السيطرة',
    nameEn: 'Control Theory',
    stage: 2,
    semester: 1,
    iconName: 'Gauge',
    descriptionAr: 'دوال التحويل، المخططات الصندوقية، استقرارية روث هورويتز، مخططات بود ومحل الجذور وتصميم المتحكمات الصناعية.',
    descriptionEn: 'Transfer functions, block diagrams, Routh-Hurwitz stability, Bode plots, root locus, and industrial controllers.',
    totalLectures: 0,
  },
  {
    id: 'engineering-math',
    code: 'MATH201',
    nameAr: 'الرياضيات الهندسية',
    nameEn: 'Engineering Mathematics',
    stage: 2,
    semester: 1,
    iconName: 'Calculator',
    descriptionAr: 'تحويلات لابلاس وفوريير، المعادلات التفاضلية الجزئية، الجبر الخطي والمصفوفات والمتجهات الهندسية.',
    descriptionEn: 'Laplace and Fourier transforms, partial differential equations, linear algebra, matrices, and engineering vectors.',
    totalLectures: 0,
  },
  {
    id: 'digital-logic',
    code: 'CAE202',
    nameAr: 'المنطق الرقمي',
    nameEn: 'Digital Logic',
    stage: 2,
    semester: 2,
    iconName: 'Binary',
    descriptionAr: 'البوابات المنطقية، الجبر البولياني، خرائط كارنوف، الدوائر التوافقية والتتابعية، والقلابات والعدادات الرقمية.',
    descriptionEn: 'Logic gates, Boolean algebra, Karnaugh maps, combinational & sequential logic circuits, flip-flops, and counters.',
    totalLectures: 0,
  },
  {
    id: 'programming-fundamentals',
    code: 'CAE203',
    nameAr: 'اساسيات البرمجة',
    nameEn: 'Programming Fundamentals',
    stage: 2,
    semester: 1,
    iconName: 'Code',
    descriptionAr: 'مبادئ البرمجة للمهندسين، الخوارزميات، هياكل التحكم، المصفوفات، الدوال والبرمجة الكائنية C++ للأتمتة.',
    descriptionEn: 'Engineering programming principles, algorithms, control structures, arrays, functions, and structured C++ for automation.',
    totalLectures: 0,
  },
  {
    id: 'baath-crimes',
    code: 'UNI201',
    nameAr: 'جرائم حزب البعث',
    nameEn: 'Crimes of the Baath Party',
    stage: 2,
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
