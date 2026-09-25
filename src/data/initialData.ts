import { Subject, Lecture, Summary, ExamQuestionPaper, ScheduleItem } from '../types';
import { BAATH_CURRICULUM_CHAPTERS, BAATH_CURRICULUM_FULL_TEXT_STRING } from './baathCurriculumFullText';

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
    nameAr: 'جرائم نظام البعث في العراق',
    nameEn: 'Crimes of the Baath Regime in Iraq',
    stage: 2,
    semester: 2,
    iconName: 'ShieldAlert',
    descriptionAr: 'المقرر الجامعي التوثيقي الوطني الصادر عن وزارة التعليم العالي والبحث العلمي لكافة الجامعات العراقية.',
    descriptionEn: 'Official national ministerial curriculum documenting historical, political, environmental crimes, and mass graves.',
    totalLectures: 1,
  },
  {
    id: 'measurements',
    code: 'CAE204',
    nameAr: 'القياسات وأجهزة القياس',
    nameEn: 'Measurements & Instrumentation',
    stage: 2,
    semester: 1,
    iconName: 'Activity',
    descriptionAr: 'منظومات القياس وأجهزة الاستشعار، محولات الطاقة، معايير الدقة والخطأ، وأجهزة القياس التناظرية والرقمية المستخدمة في السيطرة.',
    descriptionEn: 'Measurement systems, sensors and transducers, error analysis and precision, analog and digital instrumentation in automation.',
    totalLectures: 0,
  },
];

export const BAATH_CRIMES_LECTURE: Lecture = {
  id: 'lec-baath-curriculum-101',
  subjectId: 'baath-crimes',
  lectureNumber: 1,
  stage: 2,
  titleAr: 'جرائم نظام البعث في العراق (المقرر الدراسي الوزاري الموحد)',
  titleEn: 'Crimes of the Baath Regime in Iraq (Official Ministerial Curriculum)',
  descriptionAr: 'توثيق أكاديمي شامل صادر عن وزارة التعليم العالي والبحث العلمي لكافة الجامعات: المحكمة الجنائية العليا، الجرائم النفسية والاجتماعية وعسكرة المجتمع، الجرائم البيئية، وجرائم المقابر الجماعية والإبادة.',
  descriptionEn: 'Comprehensive official ministerial curriculum by the Ministry of Higher Education documenting legal, psychological, social, environmental crimes, and mass graves.',
  instructorAr: 'وزارة التعليم العالي والبحث العلمي - جمهورية العراق',
  instructorEn: 'Ministry of Higher Education and Scientific Research - Iraq',
  fileUrl: '',
  fileType: 'pdf',
  fileSize: '14.8 MB',
  uploadDate: '2026-09-22',
  summaryPointsAr: [
    'الفصل الأول: إطار المحكمة الجنائية العراقية العليا (قانون رقم 10 لسنة 2005) وتوثيق الجرائم الدولية (الإبادة الجماعية، الجرائم ضد الإنسانية، وجرائم الحرب وفق اتفاقيات جنيف).',
    'أبرز القضايا الموثقة قضائياً: مجزرة الدجيل 1982م وتجريف 250 ألف دونم، قصف حلبجة بالسلاح الكيماوي 1988م (الخردل والسارين وسقوط أكثر من 5000 شهيد)، وعمليات الأنفال في 8 مراحل عسكرية (182,000 ضحية)، وإعدام التجار عام 1992م.',
    'قمع الانتفاضة الشعبانية 1991م التي حررت 14 محافظة عراقية، واستخدام الصواريخ والطائرات والدبابات وتدمير المدن وإعدام المنتفضين، وأحداث صلاة الجمعة 1999م عقب اغتيال المرجع السيد محمد محمد صادق الصدر (قدس).',
    'جريمة تهجير الكرد الفيليين ومصادرة أموالهم المنقولة وغير المنقولة وإسقاط الجنسية بالقرار الجائر 666 المؤرخ 7/5/1980 الصادر عن مجلس قيادة الثورة المنحل.',
    'الفصل الثاني: الجرائم النفسية والاجتماعية عبر احتكار المواد الغذائية، بث الرعب بالتقارير الكيدية والإعدامات العلنية، الإفقار والتجويع وخفض الرواتب، وعسكرة المجتمع بتشكيل الجيوش الرديفة (الجيش الشعبي، فدائيو صدام، وأشبال صدام).',
    'محاربة الدين والحوزة العلمية وعلماء السنة، وإعدام السيد محمد باقر الصدر وأخته بنت الهدى، والشيخ عبد العزيز البدري، وتدمير المساجد والحسينيات والكنائس الأثرية، ومنع الشعائر وزيارة الأربعين مشياً.',
    'أساليب التعذيب الممنهجة في السجون: الصعق الكهربائي، الإذابة بالتيزاب، قطع الأطراف واللسان وكوي الشفاه، استخدام الدريل، وتفخيخ المتهمين.',
    'الفصل الثالث: الجرائم البيئية واستخدام الأسلحة المحرمة، وتلوث البصرة باليورانيوم المنضب وأكثر من 55 مليون قنبلة عنقودية وملايين الألغام على الشريط الحدودي.',
    'جريمة تجفيف الأهوار: تدمير نظام بيئي استمر أكثر من 5000 سنة، وتدمير الأهوار المركزية بنسبة 97% وتهجير سكانها، وتجريف بساتين النخيل من 35 مليون نخلة إلى أقل من الثلث وحرق غابات شط العرب.',
    'الفصل الرابع: جرائم المقابر الجماعية المكتشفة وتصنيفاتها: مقابر 1963، مقابر حرب 1980-1988، مقابر إبادة الكرد البارزانيين 1983 في صحراء المثنى، مقابر الأنفال، ومقابر الانتفاضة الشعبانية 1991 الموزعة في محافظات العراق، واعتماد ترميز الرفات (B) لجسم كامل و(BP) لأجزاء الجسم.'
  ],
  summaryPointsEn: [
    'Chapter 1: The Iraqi High Tribunal legal framework (Law No. 10 of 2005) prosecuting genocide, crimes against humanity, and war crimes.',
    'Key Judicial Cases: Dujail massacre (1982) and destruction of 250,000 dunams, Halabja chemical attack (1988), 8-phase Anfal genocide (182,000 victims), and execution of merchants in 1992.',
    'Suppression of the 1991 Shaaban Uprising across 14 governorates, Friday prayer incidents in 1999 following the assassination of Grand Ayatollah Sayyid Mohammad Mohammad Sadiq al-Sadr.',
    'Expropriation and mass deportation of Feyli Kurds and revocation of citizenship under RCC Decree 666 of 1980.',
    'Chapter 2: Psychological and social violations via food monopolization, state terror, forced impoverishment, and pervasive militarization (Popular Army, Fedayeen Saddam).',
    'War on religious scholars, clerics, and scholars of all sects; martyrdom of Sayyid Muhammad Baqir al-Sadr, Bint al-Huda, Sheikh Abdul Aziz al-Badri; destruction of shrines and churches.',
    'Systematic interrogation torture methods including electrocution, acid immersion, mutilation, drills, and rigged explosives.',
    'Chapter 3: Severe environmental destruction: depleted uranium contamination in Basra, unexploded cluster munitions, and millions of border landmines.',
    'The Marshlands drainage cataclysm: destroying a 5,000-year-old wetland civilization, wiping out 97% of central marshes, and decimating Iraqi date palms from 35M to under a third.',
    'Chapter 4: Documented mass graves across historical epochs and forensic classification standards: (B) for complete body and (BP) for recovered body parts.'
  ],
  keyFormulas: [
    'قانون المحكمة الجنائية العراقية العليا رقم 10 لسنة 2005 (المواد 11 و 12 و 13 الخاصة بجرائم الإبادة وضد الإنسانية وجرائم الحرب).',
    'قرار مجلس قيادة الثورة المنحل رقم 666 لسنة 1980 (إسقاط الجنسية عن مئات الآلاف من العراقيين الكرد الفيليين ومصادرة ممتلكاتهم).',
    'بروتوكول جنيف لعام 1925 واتفاقيات جنيف لعام 1949 بشأن حظر الأسلحة الكيماوية وحماية المدنيين وأسرى الحرب.',
    'قرار مجلس الأمن الدولي رقم 688 لسنة 1991 الذي أدان قمع النظام البعثي للشعب العراقي وعده تهديداً للأمن والسلم الدوليين.',
    'التصنيف الجنائي المعتمد للرفات المستخرجة من المقابر الجماعية: الرمز (B = Body) للجسم الكامل، والرمز (BP = Body Part) لأجزاء الجسم.'
  ],
  chapters: BAATH_CURRICULUM_CHAPTERS,
  fullCurriculumTextAr: BAATH_CURRICULUM_FULL_TEXT_STRING,
  quiz: {
    id: 'quiz-baath-101',
    lectureId: 'lec-baath-curriculum-101',
    subjectId: 'baath-crimes',
    titleAr: 'اختبار المقرر التوثيقي لجرائم نظام البعث في العراق (10 أسئلة فكرية وتاريخية)',
    titleEn: 'Documentary Assessment: Crimes of the Baath Regime in Iraq (10 Questions)',
    durationMinutes: 15,
    passingScore: 70,
    questions: [
      {
        id: 'q-bc-1',
        questionAr: 'متى صدر قانون المحكمة الجنائية العراقية العليا (رقم 10 لسنة 2005) لمحاكمة أزلام وقيادات نظام البعث؟',
        questionEn: 'When was the Iraqi High Tribunal Law (No. 10 of 2005) issued to prosecute the regime leaders?',
        optionsAr: [
          '17 تموز 1968م',
          '9 تشرين الأول 2005م',
          '8 شباط 1963م',
          '22 شباط 1988م'
        ],
        optionsEn: [
          '17 July 1968',
          '9 October 2005',
          '8 February 1963',
          '22 February 1988'
        ],
        correctIndex: 1,
        explanationAr: 'صدر قانون المحكمة الجنائية العراقية العليا بقرار مجلس الرئاسة بتاريخ 9/10/2005م برمز النص (33 E رقم 10 لسنة 2005).',
        explanationEn: 'The Iraqi High Tribunal Law was officially enacted by Presidential Council decision on 9 October 2005.'
      },
      {
        id: 'q-bc-2',
        questionAr: 'ما هي الفصول الأربعة الأساسية المعتمدة في المقرر الدراسي الوزاري لتوثيق جرائم نظام البعث؟',
        questionEn: 'What are the four main chapters established in the ministerial curriculum?',
        optionsAr: [
          'قانون المحكمة الجنائية العليا، الجرائم النفسية والاجتماعية، الجرائم البيئية، وجرائم المقابر الجماعية',
          'الحرب العالمية الأولى، تأسيس الدولة العراقية، العهد الملكي، وثورة تموز',
          'الاقتصاد النفطي، السياسة النقدية، الحصار الاقتصادي، وإعادة الإعمار',
          'المعاهدات الدولية، ترسيم الحدود، العلاقات الدبلوماسية، والمنظمات الإقليمية'
        ],
        optionsEn: [
          'High Tribunal Law, Psychological & Social Crimes, Environmental Crimes, and Mass Graves',
          'World War I, Foundation of Iraq, Monarchy Era, and July Revolution',
          'Oil Economy, Monetary Policy, Economic Sanctions, and Reconstruction',
          'International Treaties, Demarcation, Diplomacy, and Regional Bodies'
        ],
        correctIndex: 0,
        explanationAr: 'قُسم المقرر إلى 4 فصول رئيسية: أحكام المحكمة الجنائية الدولية، الجرائم النفسية والاجتماعية وعسكرة المجتمع، الجرائم البيئية، وجرائم المقابر الجماعية.',
        explanationEn: 'The curriculum is categorized into High Tribunal documented crimes, psychological/social violations, environmental crimes, and mass graves.'
      },
      {
        id: 'q-bc-3',
        questionAr: 'ما مساحة الأراضي والبساتين الزراعية التي تم تجريفها ومصادرتها من قبل النظام البعثي في مجزرة الدجيل عام 1982م؟',
        questionEn: 'What was the area of agricultural orchards bulldozed and confiscated in the Dujail massacre (1982)?',
        optionsAr: [
          'أكثر من 250,000 دونم',
          '10,000 دونم فقط',
          '5,000 دونم',
          '50,000 دونم'
        ],
        optionsEn: [
          'More than 250,000 Dunams',
          '10,000 Dunams only',
          '5,000 Dunams',
          '50,000 Dunams'
        ],
        correctIndex: 0,
        explanationAr: 'قام النظام بتجريف أكثر من 250 ألف دونم كانت بساتين وأراضي زراعية بين قضاء بلد وقضاء الدجيل ومصادرتها، مع إعدام أكثر من 148 مواطناً.',
        explanationEn: 'Over 250,000 dunams of fertile orchards were bulldozed and confiscated, alongside the execution of more than 148 civilians.'
      },
      {
        id: 'q-bc-4',
        questionAr: 'ما الغازات السامة المحرمة دولياً التي استخدمها النظام البعثي في قصف مدينة حلبجة عام 1988م وخلفت أكثر من 5000 شهيد؟',
        questionEn: 'Which prohibited chemical agents were deployed in the chemical bombardment of Halabja in 1988?',
        optionsAr: [
          'غاز النيتروجين وثاني أكسيد الكربون',
          'غاز الخردل وغاز السارين والغازات المؤثرة في الأعصاب (والسيانيد)',
          'غاز الميثان الطبيعي وغاز الهيليوم',
          'غاز الأكسجين المسال وغاز الفريون'
        ],
        optionsEn: [
          'Nitrogen and Carbon Dioxide',
          'Mustard gas, Sarin gas, nerve agents (and Cyanide)',
          'Natural Methane and Helium gas',
          'Liquified Oxygen and Freon gas'
        ],
        correctIndex: 1,
        explanationAr: 'أثبتت التحاليل المختبرية الدولية استخدام غاز الخردل وغاز السارين وغازات الأعصاب والسيانيد ضد المدنيين العزل في حلبجة مما خلف آلاف الشهداء والمصابين.',
        explanationEn: 'Toxicological analyses confirmed the lethal deployment of mustard gas, sarin, and nerve agents against innocent civilians in Halabja.'
      },
      {
        id: 'q-bc-5',
        questionAr: 'كم بلغ عدد المراحل العسكرية لحملات الأنفال الإجرامية عام 1988م وما هو عدد الضحايا التقديري من الأبرياء؟',
        questionEn: 'How many military stages comprised the Anfal campaign in 1988 and what was the estimated death toll?',
        optionsAr: [
          'مرحلتان و 5,000 ضحية',
          '4 مراحل و 25,000 ضحية',
          '8 مراحل عسكرية وبلغ عدد الضحايا نحو 182,000 ضحية',
          '10 مراحل و 50,000 ضحية'
        ],
        optionsEn: [
          '2 stages and 5,000 victims',
          '4 stages and 25,000 victims',
          '8 military stages resulting in approximately 182,000 victims',
          '10 stages and 50,000 victims'
        ],
        correctIndex: 2,
        explanationAr: 'امتدت عمليات الأنفال على 8 مراحل عسكرية شاركت فيها ألوية الفيلقين الأول والخامس والقوات الخاصة، وأسفرت عن استشهاد وتغييب نحو 182 ألف مواطن وتدمير آلاف القرى.',
        explanationEn: 'The Anfal operations were executed across eight brutal military phases resulting in approximately 182,000 civilian victims and widespread village destruction.'
      },
      {
        id: 'q-bc-6',
        questionAr: 'في أي عام اندلعت الانتفاضة الشعبانية المباركة التي حررت 14 محافظة عراقية في الوسط والجنوب والشمال؟',
        questionEn: 'In which year did the historic Shaaban Uprising erupt, liberating 14 Iraqi governorates?',
        optionsAr: [
          'عام 1991م (في شهر شعبان المبارك)',
          'عام 1980م',
          'عام 1977م',
          'عام 2003م'
        ],
        optionsEn: [
          'Year 1991 (in the holy month of Shaaban)',
          'Year 1980',
          'Year 1977',
          'Year 2003'
        ],
        correctIndex: 0,
        explanationAr: 'اندلعت الانتفاضة الشعبانية في آذار/شعبان عام 1991م عقب حرب الخليج الثانية، وحررت 14 محافظة قبل أن تواجه بالقصف والأسلحة الثقيلة والمقابر الجماعية.',
        explanationEn: 'The Shaaban Uprising broke out in March 1991 following the Second Gulf War, freeing 14 governorates across southern, central, and northern Iraq.'
      },
      {
        id: 'q-bc-7',
        questionAr: 'ما هو القرار الجائر رقم (666) الصادر عن مجلس قيادة الثورة المنحل بتاريخ 7/5/1980؟',
        questionEn: 'What was decree No. (666) issued on 7/5/1980 by the dissolved Revolutionary Command Council?',
        optionsAr: [
          'قرار دعم الفلاحين بالقروض الزراعية',
          'إسقاط الجنسية العراقية عن مئات الآلاف من الكرد الفيليين ومصادرة أموالهم وتهجيرهم قسراً',
          'قانون تطوير الجامعات ومراكز البحث العلمي',
          'قرار بناء السدود والمشاريع الإروائية'
        ],
        optionsEn: [
          'Agricultural support loan decree',
          'Revocation of Iraqi citizenship for hundreds of thousands of Feyli Kurds, property confiscation, and forced deportation',
          'University modernization decree',
          'Dam construction and irrigation act'
        ],
        correctIndex: 1,
        explanationAr: 'نص القرار 666 لسنة 1980 على إسقاط الجنسية العراقية عن مئات الآلاف من الكرد الفيليين ومصادرة أموالهم المنقولة وغير المنقولة وتهجيرهم قسراً عبر حقول الألغام.',
        explanationEn: 'Decree 666 stripped hundreds of thousands of Feyli Kurds of their Iraqi citizenship, expropriating their properties and deporting them across minefields.'
      },
      {
        id: 'q-bc-8',
        questionAr: 'ما هي الجريمة البيئية الكبرى التي ارتكبها النظام في جنوب العراق وأدت إلى تدمير نظام بيئي استمر أكثر من 5000 سنة ونزوح سكانه؟',
        questionEn: 'What major environmental crime in southern Iraq destroyed an ecosystem that endured for over 5000 years?',
        optionsAr: [
          'بناء شبكات الصرف الصحي',
          'تجفيف الأهوار بنسبة تدمير بلغت 97% للأهوار المركزية وإحراق القصب وتصحير المنطقة',
          'حفر الآبار الارتوازية الزراعية',
          'توسيع زراعة النخيل في البصرة'
        ],
        optionsEn: [
          'Building modern sewer networks',
          'Draining the Iraqi marshes, destroying 97% of the Central Marshes and burning reed habitats',
          'Digging agricultural artesian wells',
          'Expanding date palm cultivation'
        ],
        correctIndex: 1,
        explanationAr: 'أقدم النظام في مطلع التسعينيات على بناء السدود والقنوات التحويلية لتجفيف الأهوار، مما دمر 97% من الأهوار المركزية وشرد أكثر من 300 ألف مواطن وأحدث كارثة بيئية عالمية.',
        explanationEn: 'Draining the Mesopotamian Marshes destroyed 97% of the central wetlands, collapsed an ancient ecosystem, and displaced over 300,000 residents.'
      },
      {
        id: 'q-bc-9',
        questionAr: 'تراجع عدد أشجار النخيل في العراق نتيجة الحروب العبثية والتجريف العسكري في عهد النظام البائد من أكثر من 35 مليون نخلة إلى:',
        questionEn: 'Date palm tree counts in Iraq declined under regime wars and military bulldozing from 35 million to:',
        optionsAr: [
          'أكثر من 45 مليون نخلة',
          'أدنى من ثلث العدد (أقل من الثلث) بعد تجريف بساتين البصرة وكربلاء وبابل وذي قار وشط العرب',
          'لم يتأثر العدد وبقي ثابتاً تماماً',
          'زيادة مضاعفة في أعداد النخيل'
        ],
        optionsEn: [
          'Over 45 million date palms',
          'Less than one-third of the total, following vast destruction across Basra, Karbala, and Shatt al-Arab',
          'Count remained completely stable',
          'Numbers doubled nationwide'
        ],
        correctIndex: 1,
        explanationAr: 'كان العراق يحظى بأكثر من 35 مليون نخلة نهاية السبعينيات، وأدت الحروب والتجريف العسكري وردم المبازل إلى تراجع العدد لأدنى من الثلث وتحويل الغابات إلى جذوع محترقة.',
        explanationEn: 'From over 35 million palms in the late 1970s, military bulldozing, warfare, and salinization reduced numbers to less than one third.'
      },
      {
        id: 'q-bc-10',
        questionAr: 'ما دلالة الرمزين (B) و (BP) المعتمدين لدى دائرة شؤون وحماية المقابر الجماعية ومؤسسة الشهداء عند تصنيف الرفات المستخرجة؟',
        questionEn: 'What do forensic symbols (B) and (BP) denote during mass grave excavations by the Martyrs Foundation?',
        optionsAr: [
          'رمز B يعني جسماً كاملاً (Body) و BP تعني أجزاءً من جسم (Body Part)',
          'رمز B يعني عظاماً قديمة و BP يعني عظاماً حديثة',
          'رمز B يعني ضحايا عسكريين و BP يعني ضحايا مدنيين',
          'رمز B يعني مقابر المحافظات الشمالية و BP الجنوبية'
        ],
        optionsEn: [
          'Symbol B denotes a full Body, and BP denotes a Body Part',
          'Symbol B denotes old skeletal remains and BP denotes recent remains',
          'Symbol B denotes military casualties and BP denotes civilians',
          'Symbol B denotes northern graves and BP denotes southern graves'
        ],
        correctIndex: 0,
        explanationAr: 'وفق وثائق وتقارير دائرة حماية المقابر الجماعية، يشير الرمز (B) إلى Body أي رفات جسم كامل، بينما يشير (BP) إلى Body Part أي أجزاء وأطراف متفرقة من الجسد.',
        explanationEn: 'Forensic excavation standards use (B) for a complete body and (BP) for recovered body parts.'
      }
    ]
  }
};

export const INITIAL_LECTURES: Lecture[] = [
  BAATH_CRIMES_LECTURE,
];

export const INITIAL_SUMMARIES: Summary[] = [];

export const INITIAL_EXAMS: ExamQuestionPaper[] = [];

export const INITIAL_SCHEDULE: ScheduleItem[] = [
  // ==========================================
  // الأحد (Sunday)
  // ==========================================
  {
    id: 'sch-sun-1',
    stage: 2,
    group: 'الكل',
    dayIndex: 0,
    dayNameAr: 'الأحد',
    dayNameEn: 'Sunday',
    startTime: '08:30',
    endTime: '10:30',
    subjectId: 'digital-logic',
    subjectNameAr: 'المنطق الرقمي',
    subjectNameEn: 'Digital Logic',
    type: 'theoretical',
    roomAr: 'قاعة 9 (ق 9)',
    roomEn: 'Hall 9',
    instructorAr: 'م.م. مرتضى محمد حسن',
    instructorEn: 'Asst. Lect. Murtadha Mohammed Hasan',
  },
  {
    id: 'sch-sun-2',
    stage: 2,
    group: 'الكل',
    dayIndex: 0,
    dayNameAr: 'الأحد',
    dayNameEn: 'Sunday',
    startTime: '10:30',
    endTime: '12:30',
    subjectId: 'baath-crimes',
    subjectNameAr: 'جرائم حزب البعث',
    subjectNameEn: 'Crimes of the Baath Party',
    type: 'theoretical',
    roomAr: 'قاعة 9 (ق 9)',
    roomEn: 'Hall 9',
    instructorAr: 'م.م. مرتضى عدنان كاظم',
    instructorEn: 'Asst. Lect. Murtadha Adnan Kadhim',
  },

  // ==========================================
  // الاثنين (Monday)
  // ==========================================
  {
    id: 'sch-mon-1',
    stage: 2,
    group: 'A',
    dayIndex: 1,
    dayNameAr: 'الاثنين',
    dayNameEn: 'Monday',
    startTime: '08:30',
    endTime: '11:30',
    subjectId: 'programming-fundamentals',
    subjectNameAr: 'م. أساسيات البرمجة (شعبة A)',
    subjectNameEn: 'Programming Fundamentals Lab (Group A)',
    type: 'practical',
    roomAr: 'مختبر المحاكاة والحاسبات',
    roomEn: 'Simulation & Computer Lab',
    instructorAr: 'كادر مختبر البرمجة',
    instructorEn: 'Programming Lab Staff',
  },
  {
    id: 'sch-mon-2',
    stage: 2,
    group: 'B',
    dayIndex: 1,
    dayNameAr: 'الاثنين',
    dayNameEn: 'Monday',
    startTime: '11:30',
    endTime: '14:30',
    subjectId: 'programming-fundamentals',
    subjectNameAr: 'م. أساسيات البرمجة (شعبة B)',
    subjectNameEn: 'Programming Fundamentals Lab (Group B)',
    type: 'practical',
    roomAr: 'مختبر المحاكاة والحاسبات',
    roomEn: 'Simulation & Computer Lab',
    instructorAr: 'كادر مختبر البرمجة',
    instructorEn: 'Programming Lab Staff',
  },

  // ==========================================
  // الثلاثاء (Tuesday)
  // ==========================================
  {
    id: 'sch-tue-1',
    stage: 2,
    group: 'A',
    dayIndex: 2,
    dayNameAr: 'الثلاثاء',
    dayNameEn: 'Tuesday',
    startTime: '08:30',
    endTime: '10:30',
    subjectId: 'measurements',
    subjectNameAr: 'م. قياسات (شعبة A)',
    subjectNameEn: 'Measurements Lab (Group A)',
    type: 'practical',
    roomAr: 'مختبر التحكم والروبوتات الذكية',
    roomEn: 'Control & Smart Robotics Lab',
    instructorAr: 'كادر مختبر القياسات',
    instructorEn: 'Measurements Lab Staff',
  },
  {
    id: 'sch-tue-2',
    stage: 2,
    group: 'B',
    dayIndex: 2,
    dayNameAr: 'الثلاثاء',
    dayNameEn: 'Tuesday',
    startTime: '08:30',
    endTime: '10:30',
    subjectId: 'digital-logic',
    subjectNameAr: 'م. المنطق الرقمي (شعبة B)',
    subjectNameEn: 'Digital Logic Lab (Group B)',
    type: 'practical',
    roomAr: 'مختبر الأجهزة والقياسات',
    roomEn: 'Instrumentation & Measurements Lab',
    instructorAr: 'كادر مختبر المنطق',
    instructorEn: 'Digital Logic Lab Staff',
  },
  {
    id: 'sch-tue-3',
    stage: 2,
    group: 'الكل',
    dayIndex: 2,
    dayNameAr: 'الثلاثاء',
    dayNameEn: 'Tuesday',
    startTime: '10:30',
    endTime: '12:30',
    subjectId: 'measurements',
    subjectNameAr: 'قياسات',
    subjectNameEn: 'Measurements & Instrumentation',
    type: 'theoretical',
    roomAr: 'قاعة 9 (ق 9)',
    roomEn: 'Hall 9',
    instructorAr: 'م.م. مي محمد علي',
    instructorEn: 'Asst. Lect. Mai Mohammed Ali',
  },
  {
    id: 'sch-tue-4',
    stage: 2,
    group: 'A',
    dayIndex: 2,
    dayNameAr: 'الثلاثاء',
    dayNameEn: 'Tuesday',
    startTime: '12:30',
    endTime: '14:30',
    subjectId: 'digital-logic',
    subjectNameAr: 'م. المنطق الرقمي (شعبة A)',
    subjectNameEn: 'Digital Logic Lab (Group A)',
    type: 'practical',
    roomAr: 'مختبر الأجهزة والقياسات',
    roomEn: 'Instrumentation & Measurements Lab',
    instructorAr: 'كادر مختبر المنطق',
    instructorEn: 'Digital Logic Lab Staff',
  },
  {
    id: 'sch-tue-5',
    stage: 2,
    group: 'B',
    dayIndex: 2,
    dayNameAr: 'الثلاثاء',
    dayNameEn: 'Tuesday',
    startTime: '12:30',
    endTime: '14:30',
    subjectId: 'measurements',
    subjectNameAr: 'م. قياسات (شعبة B)',
    subjectNameEn: 'Measurements Lab (Group B)',
    type: 'practical',
    roomAr: 'مختبر التحكم والروبوتات الذكية',
    roomEn: 'Control & Smart Robotics Lab',
    instructorAr: 'كادر مختبر القياسات',
    instructorEn: 'Measurements Lab Staff',
  },

  // ==========================================
  // الأربعاء (Wednesday)
  // ==========================================
  {
    id: 'sch-wed-1',
    stage: 2,
    group: 'الكل',
    dayIndex: 3,
    dayNameAr: 'الأربعاء',
    dayNameEn: 'Wednesday',
    startTime: '08:30',
    endTime: '10:30',
    subjectId: 'engineering-math',
    subjectNameAr: 'رياضيات هندسية',
    subjectNameEn: 'Engineering Mathematics',
    type: 'theoretical',
    roomAr: 'قاعة 9 (ق 9)',
    roomEn: 'Hall 9',
    instructorAr: 'م.م. وسن اسعد جواد',
    instructorEn: 'Asst. Lect. Wasan Asaad Jawad',
  },
  {
    id: 'sch-wed-2',
    stage: 2,
    group: 'الكل',
    dayIndex: 3,
    dayNameAr: 'الأربعاء',
    dayNameEn: 'Wednesday',
    startTime: '10:30',
    endTime: '12:30',
    subjectId: 'engineering-math',
    subjectNameAr: 'رياضيات هندسية (تطبيقات وتمارين)',
    subjectNameEn: 'Engineering Mathematics (Tutorial)',
    type: 'tutorial',
    roomAr: 'قاعة 9 (ق 9)',
    roomEn: 'Hall 9',
    instructorAr: 'م.م. وسن اسعد جواد',
    instructorEn: 'Asst. Lect. Wasan Asaad Jawad',
  },
  {
    id: 'sch-wed-3',
    stage: 2,
    group: 'الكل',
    dayIndex: 3,
    dayNameAr: 'الأربعاء',
    dayNameEn: 'Wednesday',
    startTime: '12:30',
    endTime: '14:30',
    subjectId: 'programming-fundamentals',
    subjectNameAr: 'أساسيات البرمجة',
    subjectNameEn: 'Programming Fundamentals',
    type: 'theoretical',
    roomAr: 'قاعة 9 (ق 9)',
    roomEn: 'Hall 9',
    instructorAr: 'م.م. مهند عبد الباقر علي',
    instructorEn: 'Asst. Lect. Mohanad Abdul-Baqer Ali',
  },

  // ==========================================
  // الخميس (Thursday)
  // ==========================================
  {
    id: 'sch-thu-1',
    stage: 2,
    group: 'الكل',
    dayIndex: 4,
    dayNameAr: 'الخميس',
    dayNameEn: 'Thursday',
    startTime: '08:30',
    endTime: '10:30',
    subjectId: 'control-theory',
    subjectNameAr: 'نظرية السيطرة',
    subjectNameEn: 'Control Theory',
    type: 'theoretical',
    roomAr: 'قاعة 9 (ق 9)',
    roomEn: 'Hall 9',
    instructorAr: 'م.م. علياء ابراهيم داود',
    instructorEn: 'Asst. Lect. Alya Ibrahim Dawood',
  },
  {
    id: 'sch-thu-2',
    stage: 2,
    group: 'B',
    dayIndex: 4,
    dayNameAr: 'الخميس',
    dayNameEn: 'Thursday',
    startTime: '10:30',
    endTime: '12:30',
    subjectId: 'control-theory',
    subjectNameAr: 'م. نظرية السيطرة (شعبة B)',
    subjectNameEn: 'Control Theory Lab (Group B)',
    type: 'practical',
    roomAr: 'مختبر شبكات الحاسوب',
    roomEn: 'Computer Networks Lab',
    instructorAr: 'كادر مختبر السيطرة',
    instructorEn: 'Control Lab Staff',
  },
  {
    id: 'sch-thu-3',
    stage: 2,
    group: 'A',
    dayIndex: 4,
    dayNameAr: 'الخميس',
    dayNameEn: 'Thursday',
    startTime: '12:30',
    endTime: '14:30',
    subjectId: 'control-theory',
    subjectNameAr: 'م. نظرية السيطرة (شعبة A)',
    subjectNameEn: 'Control Theory Lab (Group A)',
    type: 'practical',
    roomAr: 'مختبر شبكات الحاسوب',
    roomEn: 'Computer Networks Lab',
    instructorAr: 'كادر مختبر السيطرة',
    instructorEn: 'Control Lab Staff',
  },
];
