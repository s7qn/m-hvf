import React, { useState } from 'react';
import { 
  Lock, 
  Unlock, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  BookOpen, 
  HelpCircle, 
  X, 
  FileUp, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Calculator, 
  FileText, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  FileCheck, 
  Tag, 
  RefreshCw,
  Zap,
  Code
} from 'lucide-react';
import { Subject, Lecture, Quiz, QuizQuestion, Stage, Language, Summary, ExamQuestionPaper, ScheduleItem } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface AdminAddModalProps {
  subjects: Subject[];
  language: Language;
  isAdminUnlocked: boolean;
  onUnlockAdmin: () => void;
  onClose: () => void;
  onAddLecture: (newLecture: Lecture) => void;
  onAddSummary?: (newSummary: Summary) => void;
  onAddScheduleItem?: (newItem: ScheduleItem) => void;
  onAddExam?: (newExam: ExamQuestionPaper) => void;
  initialSubjectId?: string;
  initialTab?: 'lectures' | 'summaries' | 'schedule' | 'exams';
}

const WEEK_DAYS = [
  { index: 0, nameAr: 'الأحد', nameEn: 'Sunday' },
  { index: 1, nameAr: 'الاثنين', nameEn: 'Monday' },
  { index: 2, nameAr: 'الثلاثاء', nameEn: 'Tuesday' },
  { index: 3, nameAr: 'الأربعاء', nameEn: 'Wednesday' },
  { index: 4, nameAr: 'الخميس', nameEn: 'Thursday' },
];

export const AdminAddModal: React.FC<AdminAddModalProps> = ({
  subjects,
  language,
  isAdminUnlocked,
  onUnlockAdmin,
  onClose,
  onAddLecture,
  onAddSummary,
  onAddScheduleItem,
  onAddExam,
  initialSubjectId,
  initialTab = 'lectures',
}) => {
  const t = TRANSLATIONS[language];

  // Current active modal tab
  const [activeSubTab, setActiveSubTab] = useState<'lectures' | 'summaries' | 'schedule' | 'exams'>(initialTab);

  // Auth state
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passcodeError, setPasscodeError] = useState(false);

  // Status message
  const [formError, setFormError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // ----------------------------------------------------
  // 1. LECTURE FORM STATE
  // ----------------------------------------------------
  const defaultSubId = initialSubjectId && subjects.some(s => s.id === initialSubjectId)
    ? initialSubjectId
    : (subjects[0]?.id || '');

  const [lecSubjectId, setLecSubjectId] = useState(defaultSubId);
  const initialSubject = subjects.find(s => s.id === defaultSubId);
  const [lecStage, setLecStage] = useState<Stage>(initialSubject?.stage || 1);
  const [lecNumber, setLecNumber] = useState<number>(1);
  const [lecTitleAr, setLecTitleAr] = useState('');
  const [lecTitleEn, setLecTitleEn] = useState('');
  const [lecDescAr, setLecDescAr] = useState('');
  const [lecDescEn, setLecDescEn] = useState('');
  const [lecInstructorAr, setLecInstructorAr] = useState('أستاذ المادة');
  const [lecInstructorEn, setLecInstructorEn] = useState('Course Lecturer');
  const [lecFileUrl, setLecFileUrl] = useState('');
  const [lecUploadedFileName, setLecUploadedFileName] = useState('');
  const [lecUploadedFileSize, setLecUploadedFileSize] = useState('2.5 MB');
  const [lecSummaryPointsText, setLecSummaryPointsText] = useState('');
  const [lecKeyFormulasText, setLecKeyFormulasText] = useState('');
  
  // AI Quiz Generation State
  const [hasMathProblems, setHasMathProblems] = useState<boolean>(true);
  const [isGeneratingAiQuiz, setIsGeneratingAiQuiz] = useState<boolean>(false);
  const [aiQuizSource, setAiQuizSource] = useState<string | null>(null);

  // Attached Quiz State
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([
    {
      id: 'q-init-1',
      questionAr: 'في منظومة سيطرة من الرتبة الثانية G(s) = 25 / (s² + 6s + 25)، ما هي قيمة التردد الطبيعي (ωn) ونسبة التخميد (ζ)؟',
      questionEn: 'For a 2nd-order system G(s) = 25 / (s² + 6s + 25), what are the natural frequency (ωn) and damping ratio (ζ)?',
      optionsAr: [
        'ωn = 5 rad/s و ζ = 0.6 (تحت التخميد)',
        'ωn = 25 rad/s و ζ = 3.0 (فوق التخميد)',
        'ωn = 5 rad/s و ζ = 1.0 (تخميد حرج)',
        'ωn = 6 rad/s و ζ = 0.5 (غير مستقر)'
      ],
      optionsEn: [
        'ωn = 5 rad/s and ζ = 0.6 (Underdamped)',
        'ωn = 25 rad/s and ζ = 3.0 (Overdamped)',
        'ωn = 5 rad/s and ζ = 1.0 (Critically Damped)',
        'ωn = 6 rad/s and ζ = 0.5 (Unstable)'
      ],
      correctIndex: 0,
      codeOrFormula: 's² + 2ζωn s + ωn² = s² + 6s + 25 => ωn = 5 rad/s, 2ζ(5) = 6 => ζ = 0.6',
      explanationAr: 'بمقارنة المعادلة المميزة بالصيغة القياسية: s² + 2ζωn s + ωn² = 0، نجد أن ωn² = 25 أي ωn = 5 rad/s. ومعامل s هو 2ζωn = 6، إذن ζ = 0.6.',
      explanationEn: 'Comparing with s² + 2ζωn s + ωn² = 0: ωn = 5 rad/s, 2ζ(5) = 6 => ζ = 0.6.'
    }
  ]);

  // Handle subject change for Lecture
  const handleLecSubjectChange = (newSubjectId: string) => {
    setLecSubjectId(newSubjectId);
    const sub = subjects.find(s => s.id === newSubjectId);
    if (sub) {
      setLecStage(sub.stage);
    }
  };

  // ----------------------------------------------------
  // 2. SUMMARY FORM STATE
  // ----------------------------------------------------
  const [sumSubjectId, setSumSubjectId] = useState(defaultSubId);
  const [sumStage, setSumStage] = useState<Stage>(initialSubject?.stage || 1);
  const [sumTitleAr, setSumTitleAr] = useState('');
  const [sumTitleEn, setSumTitleEn] = useState('');
  const [sumDescAr, setSumDescAr] = useState('');
  const [sumPagesCount, setSumPagesCount] = useState<number>(4);
  const [sumAuthorAr, setSumAuthorAr] = useState('م. أحمد العبيدي');
  const [sumAuthorEn, setSumAuthorEn] = useState('Eng. Ahmed');
  const [sumTagsText, setSumTagsText] = useState('قوانين السيطرة، دوال التحويل، مخططات بود');
  const [sumUploadedFileName, setSumUploadedFileName] = useState('');
  const [sumFileSize, setSumFileSize] = useState('1.8 MB');

  // ----------------------------------------------------
  // 3. SCHEDULE FORM STATE
  // ----------------------------------------------------
  const [schStage, setSchStage] = useState<Stage>(1);
  const [schGroup, setSchGroup] = useState<'A' | 'B' | 'الكل'>('A');
  const [schDayIndex, setSchDayIndex] = useState<number>(0);
  const [schStartTime, setSchStartTime] = useState('08:30');
  const [schEndTime, setSchEndTime] = useState('10:30');
  const [schSubjectNameAr, setSchSubjectNameAr] = useState('رياضيات هندسية');
  const [schSubjectNameEn, setSchSubjectNameEn] = useState('Engineering Mathematics');
  const [schType, setSchType] = useState<'theoretical' | 'practical' | 'tutorial'>('theoretical');
  const [schRoomAr, setSchRoomAr] = useState('القاعة 302 (الهندسة)');
  const [schRoomEn, setSchRoomEn] = useState('Hall 302');
  const [schInstructorAr, setSchInstructorAr] = useState('د. محمد الكناني');
  const [schInstructorEn, setSchInstructorEn] = useState('Dr. Mohammed');

  // ----------------------------------------------------
  // 4. EXAM FORM STATE
  // ----------------------------------------------------
  const [examSubjectId, setExamSubjectId] = useState(defaultSubId);
  const [examStage, setExamStage] = useState<Stage>(initialSubject?.stage || 1);
  const [examTitleAr, setExamTitleAr] = useState('');
  const [examTitleEn, setExamTitleEn] = useState('');
  const [examAcademicYear, setExamAcademicYear] = useState('2024 - 2025');
  const [examType, setExamType] = useState<'midterm' | 'final' | 'practical' | 'quiz'>('final');
  const [examSolved, setExamSolved] = useState<boolean>(true);
  const [examSolvedByAr, setExamSolvedByAr] = useState('أستاذ المادة واللجنة الامتحانية');
  const [examSolvedByEn, setExamSolvedByEn] = useState('Examination Board');
  const [examUploadedFileName, setExamUploadedFileName] = useState('');
  const [examFileSize, setExamFileSize] = useState('3.2 MB');

  // ----------------------------------------------------
  // PASSCODE VERIFICATION
  // ----------------------------------------------------
  const handleVerifyPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = passcode.trim();
    if (cleaned === '1107') {
      onUnlockAdmin();
      setPasscodeError(false);
    } else {
      setPasscodeError(true);
    }
  };

  // ----------------------------------------------------
  // AI QUIZ GENERATION FUNCTION (Synchronized with lecture & Math)
  // ----------------------------------------------------
  const handleGenerateAiQuiz = async () => {
    if (!lecTitleAr.trim()) {
      setFormError(language === 'ar' ? 'يرجى كتابة عنوان المحاضرة أولاً لتوليد أسئلة متزامنة معها' : 'Please enter lecture title first');
      return;
    }

    setIsGeneratingAiQuiz(true);
    setFormError('');
    setAiQuizSource(null);

    const sub = subjects.find(s => s.id === lecSubjectId);
    const subjectName = language === 'ar' ? (sub?.nameAr || 'السيطرة والأتمتة') : (sub?.nameEn || 'Control & Automation');

    const formulasList = lecKeyFormulasText.split('\n').map(s => s.trim()).filter(Boolean);
    const summaryList = lecSummaryPointsText.split('\n').map(s => s.trim()).filter(Boolean);

    try {
      const response = await fetch('/api/gemini/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectName,
          stage: lecStage,
          lectureTitle: lecTitleAr,
          description: lecDescAr || lecTitleAr,
          summaryPoints: summaryList,
          keyFormulas: formulasList,
          hasMathProblems,
          count: 5,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
        const formatted: QuizQuestion[] = data.questions.map((q: any, idx: number) => ({
          id: `ai-q-${Date.now()}-${idx}`,
          questionAr: q.questionAr || `سؤال ${idx + 1}`,
          questionEn: q.questionEn || `Question ${idx + 1}`,
          optionsAr: Array.isArray(q.optionsAr) ? q.optionsAr : ['خيار أ', 'خيار ب', 'خيار ج', 'خيار د'],
          optionsEn: Array.isArray(q.optionsEn) ? q.optionsEn : ['Option A', 'Option B', 'Option C', 'Option D'],
          correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
          explanationAr: q.explanationAr || 'خطوات حل وتحليل هندسي معتمد.',
          explanationEn: q.explanationEn || 'Engineering analysis and derivation.',
          codeOrFormula: q.codeOrFormula,
        }));

        setQuizQuestions(formatted);
        setAiQuizSource(data.source === 'gemini' ? 'Gemini 3.8 Flash' : 'Smart Engineering Generator');
      } else {
        throw new Error('No questions returned');
      }
    } catch (err) {
      console.warn('AI Quiz request failed, applying local engineering math quiz fallback:', err);
      // Fallback generator locally
      const fallbackQuestions: QuizQuestion[] = [
        {
          id: `fb-1-${Date.now()}`,
          questionAr: `مسألة رياضية متزامنة مع (${lecTitleAr}): إذا كانت دالة التحويل G(s) = 20 / (s + 4)، فما هي القيمة النهائية للاستجابة y(∞) عند إشارة دخل وحدة خطوة R(s) = 1/s؟`,
          questionEn: `Math Problem for (${lecTitleEn || lecTitleAr}): For transfer function G(s) = 20 / (s + 4), what is the final value y(∞) for a unit step input R(s) = 1/s?`,
          optionsAr: [
            'y(∞) = 5.0 (باستخدام نظرية القيمة النهائية Final Value Theorem)',
            'y(∞) = 20.0',
            'y(∞) = 0.2',
            'y(∞) = 4.0'
          ],
          optionsEn: [
            'y(∞) = 5.0 (Using Final Value Theorem)',
            'y(∞) = 20.0',
            'y(∞) = 0.2',
            'y(∞) = 4.0'
          ],
          correctIndex: 0,
          codeOrFormula: 'y(∞) = lim(s->0) s * Y(s) = lim(s->0) s * (20 / (s + 4)) * (1/s) = 20 / 4 = 5.0',
          explanationAr: 'باستخدام نظرية القيمة النهائية: y(∞) = lim(s->0) [s · Y(s)] = lim(s->0) [s · (20/(s+4)) · (1/s)] = 20/4 = 5.0.',
          explanationEn: 'By Final Value Theorem: y(∞) = lim(s->0) s * Y(s) = 20/4 = 5.0.'
        },
        {
          id: `fb-2-${Date.now()}`,
          questionAr: `حسابات هندسية: ما هو ثابت الزمن (Time Constant τ) وزمن الاستقرار (Settling Time ts بنسبة 2%) للمنظومة السابقة G(s) = 20 / (s + 4)؟`,
          questionEn: `Engineering Calculation: What is the time constant (τ) and 2% settling time (ts) for G(s) = 20 / (s + 4)?`,
          optionsAr: [
            'τ = 0.25 s و ts = 4τ = 1.0 s',
            'τ = 4.0 s و ts = 16.0 s',
            'τ = 0.5 s و ts = 2.0 s',
            'τ = 0.2 s و ts = 0.8 s'
          ],
          optionsEn: [
            'τ = 0.25 s and ts = 4τ = 1.0 s',
            'τ = 4.0 s and ts = 16.0 s',
            'τ = 0.5 s and ts = 2.0 s',
            'τ = 0.2 s and ts = 0.8 s'
          ],
          correctIndex: 0,
          codeOrFormula: 'Pole at s = -4 => τ = 1/a = 1/4 = 0.25 s => ts (2%) = 4τ = 1.0 s',
          explanationAr: 'في الأنظمة من الدرجة الأولى بالصيغة K / (s + a)، فإن ثابت الزمن τ = 1/a = 1/4 = 0.25 ثانية. زمن الاستقرار لمعيار 2% هو 4τ = 4 × 0.25 = 1.0 ثانية.',
          explanationEn: 'For 1st order system with pole at -4: τ = 1/4 = 0.25 s. Settling time ts (2%) = 4τ = 1.0 s.'
        },
        {
          id: `fb-3-${Date.now()}`,
          questionAr: `ما هو المبدأ الأساسي المتحكم في استقرارية المنظومة الموضحة في "${lecTitleAr}"؟`,
          questionEn: `What is the core principle governing system stability in "${lecTitleEn || lecTitleAr}"?`,
          optionsAr: [
            'وقوع جميع أقطاب الدائرة المغلقة (Closed-Loop Poles) في النصف الأيسر من مستوى s (LHP)',
            'وجود قطب واحد على الأقل في النصف الأيمن من مستوى s',
            'إلغاء التغذية العكسية السالبة واستبدالها بحلقة مفتوحة',
            'جعل كسب النظام لا نهائياً بدون حدود'
          ],
          optionsEn: [
            'All closed-loop poles must lie strictly in the Left-Half of the s-plane (LHP)',
            'Having at least one pole in the Right-Half s-plane',
            'Eliminating negative feedback completely',
            'Making loop gain unbounded'
          ],
          correctIndex: 0,
          explanationAr: 'شرط الاستقرار الحاسم لأي منظومة خطية في هندسة السيطرة هو أن تقع كافة جذور المعادلة المميزة (الأقطاب) في النصف الأيسر من المستوى المركب s-plane (حيث الجزء الحقيقي سالب).',
          explanationEn: 'The fundamental condition for stability is that all closed-loop poles have negative real parts (located in the LHP).'
        }
      ];
      setQuizQuestions(fallbackQuestions);
      setAiQuizSource('Smart Control Fallback Engine');
    } finally {
      setIsGeneratingAiQuiz(false);
    }
  };

  // Add Question manually
  const handleAddQuestion = () => {
    setQuizQuestions(prev => [
      ...prev,
      {
        id: `q-custom-${Date.now()}`,
        questionAr: '',
        questionEn: '',
        optionsAr: ['', '', '', ''],
        optionsEn: ['', '', '', ''],
        correctIndex: 0,
        explanationAr: '',
        explanationEn: '',
      }
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuizQuestions(prev => prev.filter((_, i) => i !== index));
  };

  // ----------------------------------------------------
  // SUBMIT HANDLERS
  // ----------------------------------------------------

  // 1. Submit Lecture
  const handleSubmitLecture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lecTitleAr.trim()) {
      setFormError(language === 'ar' ? 'يرجى إدخال عنوان المحاضرة بالعربية' : 'Please enter Arabic title');
      return;
    }
    if (!lecSubjectId) {
      setFormError(language === 'ar' ? 'يرجى تحديد المادة الدراسية' : 'Please select subject');
      return;
    }

    const lectureId = 'lec-' + Date.now();
    const quizId = 'quiz-' + Date.now();

    const formattedQuestions: QuizQuestion[] = quizQuestions.map((q, idx) => ({
      id: q.id || `q-${quizId}-${idx}`,
      questionAr: q.questionAr || (language === 'ar' ? `سؤال اختبار المحاضرة ${idx + 1}` : `Quiz Question ${idx + 1}`),
      questionEn: q.questionEn || `Quiz Question ${idx + 1}`,
      optionsAr: q.optionsAr.map(opt => opt.trim() || 'خيار هندسي'),
      optionsEn: q.optionsEn.map(opt => opt.trim() || 'Engineering Option'),
      correctIndex: q.correctIndex,
      explanationAr: q.explanationAr || 'تفسير هندسي للإجابة النموذجية بناءً على مادة المحاضرة.',
      explanationEn: q.explanationEn || 'Engineering derivation based on lecture material.',
      codeOrFormula: q.codeOrFormula,
    }));

    const newQuiz: Quiz = {
      id: quizId,
      lectureId: lectureId,
      subjectId: lecSubjectId,
      titleAr: `اختبار: ${lecTitleAr}`,
      titleEn: `Quiz: ${lecTitleEn || lecTitleAr}`,
      durationMinutes: 10,
      passingScore: 60,
      questions: formattedQuestions,
    };

    const summaryListAr = lecSummaryPointsText.split('\n').map(s => s.trim()).filter(Boolean);
    const formulasList = lecKeyFormulasText.split('\n').map(s => s.trim()).filter(Boolean);

    const newLecture: Lecture = {
      id: lectureId,
      subjectId: lecSubjectId,
      stage: lecStage,
      lectureNumber: Number(lecNumber) || 1,
      titleAr: lecTitleAr,
      titleEn: lecTitleEn || lecTitleAr,
      descriptionAr: lecDescAr || lecTitleAr,
      descriptionEn: lecDescEn || lecTitleEn || lecTitleAr,
      fileType: 'pdf',
      fileSize: lecUploadedFileSize || '2.5 MB',
      uploadDate: new Date().toISOString().split('T')[0],
      instructorAr: lecInstructorAr || 'أستاذ المادة',
      instructorEn: lecInstructorEn || 'Course Lecturer',
      summaryPointsAr: summaryListAr.length > 0 ? summaryListAr : ['مفاهيم ومسائل هندسية في السيطرة والأتمتة'],
      summaryPointsEn: ['Practical control engineering principles and mathematical derivations'],
      keyFormulas: formulasList,
      fileUrl: lecFileUrl || undefined,
      quiz: newQuiz,
      isCustom: true,
    };

    onAddLecture(newLecture);
    triggerSuccess(language === 'ar' ? 'تمت إضافة الملزمة وتوليد الاختبار المتزامن بنجاح!' : 'Lecture & AI Quiz added successfully!');
  };

  // 2. Submit Summary
  const handleSubmitSummary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sumTitleAr.trim()) {
      setFormError(language === 'ar' ? 'يرجى إدخال عنوان الملخص' : 'Please enter summary title');
      return;
    }

    const tagsAr = sumTagsText.split(/[,،\n]/).map(t => t.trim()).filter(Boolean);

    const newSummary: Summary = {
      id: 'sum-' + Date.now(),
      subjectId: sumSubjectId,
      stage: sumStage,
      titleAr: sumTitleAr,
      titleEn: sumTitleEn || sumTitleAr,
      descriptionAr: sumDescAr || sumTitleAr,
      descriptionEn: sumTitleEn || sumTitleAr,
      pagesCount: Number(sumPagesCount) || 4,
      fileSize: sumFileSize || '1.8 MB',
      authorAr: sumAuthorAr || 'مُعِدّ الملخص',
      authorEn: sumAuthorEn || 'Author',
      tagsAr: tagsAr.length > 0 ? tagsAr : ['ملخص قوانين', 'مسائل هندسية'],
      tagsEn: ['Formula Sheet', 'Engineering Problems'],
      date: new Date().toISOString().split('T')[0],
    };

    if (onAddSummary) {
      onAddSummary(newSummary);
    }
    triggerSuccess(language === 'ar' ? 'تمت إضافة الملخص وبطاقة القوانين بنجاح!' : 'Summary added successfully!');
  };

  // 3. Submit Schedule Item
  const handleSubmitSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schSubjectNameAr.trim()) {
      setFormError(language === 'ar' ? 'يرجى إدخال اسم المادة الدراسية' : 'Please enter subject name');
      return;
    }

    const dayObj = WEEK_DAYS.find(d => d.index === Number(schDayIndex)) || WEEK_DAYS[0];

    const newItem: ScheduleItem = {
      id: 'sch-' + Date.now(),
      stage: schStage,
      group: schGroup,
      dayIndex: Number(schDayIndex),
      dayNameAr: dayObj.nameAr,
      dayNameEn: dayObj.nameEn,
      startTime: schStartTime || '08:30',
      endTime: schEndTime || '10:30',
      subjectId: 'custom-sub-' + Date.now(),
      subjectNameAr: schSubjectNameAr,
      subjectNameEn: schSubjectNameEn || schSubjectNameAr,
      type: schType,
      roomAr: schRoomAr || 'القاعة الدراسية',
      roomEn: schRoomEn || 'Hall',
      instructorAr: schInstructorAr || 'أستاذ المادة',
      instructorEn: schInstructorEn || 'Lecturer',
    };

    if (onAddScheduleItem) {
      onAddScheduleItem(newItem);
    }
    triggerSuccess(language === 'ar' ? 'تمت إضافة المادة إلى جدول المحاضرات الأسبوعي بنجاح!' : 'Schedule item added successfully!');
  };

  // 4. Submit Exam Paper
  const handleSubmitExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitleAr.trim()) {
      setFormError(language === 'ar' ? 'يرجى إدخال عنوان النموذج الامتحاني' : 'Please enter exam title');
      return;
    }

    const newExam: ExamQuestionPaper = {
      id: 'exam-' + Date.now(),
      subjectId: examSubjectId,
      stage: examStage,
      titleAr: examTitleAr,
      titleEn: examTitleEn || examTitleAr,
      academicYear: examAcademicYear || '2024 - 2025',
      type: examType,
      fileSize: examFileSize || '3.2 MB',
      solved: examSolved,
      solvedByAr: examSolved ? examSolvedByAr : undefined,
      solvedByEn: examSolved ? examSolvedByEn : undefined,
      date: new Date().toISOString().split('T')[0],
    };

    if (onAddExam) {
      onAddExam(newExam);
    }
    triggerSuccess(language === 'ar' ? 'تمت إضافة النموذج الامتحاني إلى الأرشيف بنجاح!' : 'Exam paper added successfully!');
  };

  const triggerSuccess = (msg: string) => {
    setIsSuccess(true);
    setSuccessMsg(msg);
    setFormError('');
    setTimeout(() => {
      onClose();
    }, 1400);
  };

  return (
    <div 
      id="admin-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div 
        id="admin-modal-card"
        className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-blue-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto max-h-[92vh] transition-colors"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              {isAdminUnlocked ? <Unlock className="w-5 h-5 text-emerald-300" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  {language === 'ar' ? 'لوحة إدارة المحتوى وإضافة المواد (للمشرف فقط)' : 'Admin Content Management'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-700 text-blue-100 text-[10px] font-bold">
                  {language === 'ar' ? 'الرمز السري: 1107' : 'Passcode: 1107'}
                </span>
              </div>
              <p className="text-xs text-blue-200 font-medium">
                {language === 'ar' 
                  ? 'إضافة الملازم، الملخصات، الجداول الأسبوعية، والأسئلة الامتحانية مع توليد اختبارات الذكاء الاصطناعي' 
                  : 'Add lectures, summaries, schedules, and exams with synchronized AI quiz generation'}
              </p>
            </div>
          </div>

          <button
            id="btn-close-admin-modal"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: Passcode Verification Screen if Locked */}
          {!isAdminUnlocked ? (
            <div className="py-6 max-w-md mx-auto text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-sm">
                <Lock className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {language === 'ar' ? 'هذا الخيار محمي ومخصص لك فقط' : 'Protected Admin Access'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {language === 'ar' 
                    ? 'يرجى إدخال الرمز السري المخصص للمشرف لفتح صلاحية إضافة الملازم، الملخصات، الجداول، والنماذج الامتحانية.' 
                    : 'Please enter the admin secret passcode to unlock management features.'}
                </p>
              </div>

              <form onSubmit={handleVerifyPasscode} className="space-y-4">
                <div className="relative max-w-xs mx-auto">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passcode}
                    onChange={(e) => {
                      setPasscode(e.target.value);
                      setPasscodeError(false);
                    }}
                    placeholder={language === 'ar' ? 'أدخل الرمز السري هنا...' : 'Enter passcode...'}
                    className={`w-full px-4 py-3 rounded-xl border text-center font-mono text-lg font-black tracking-widest focus:outline-none focus:ring-2 ${
                      passcodeError 
                        ? 'border-red-500 ring-red-200 bg-red-50/50 dark:bg-red-950/30 text-red-700 dark:text-red-300' 
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:border-blue-600 focus:ring-blue-100'
                    }`}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {passcodeError && (
                  <div className="flex items-center justify-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-bold animate-shake">
                    <AlertCircle className="w-4 h-4" />
                    <span>{language === 'ar' ? 'الرمز السري غير صحيح. يرجى إدخال الرمز الصحيح (1107)' : 'Incorrect passcode. Please try again.'}</span>
                  </div>
                )}

                <div className="flex justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>{language === 'ar' ? 'تأكيد الرمز وفتح اللوحة' : 'Verify & Unlock'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* STEP 2: Multi-Tab Admin Interface (Unlocked) */
            <div className="space-y-6">
              {/* Tabs Navigation for adding different sections */}
              <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => { setActiveSubTab('lectures'); setFormError(''); }}
                  className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeSubTab === 'lectures'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <BookOpen className="w-4 h-4 shrink-0" />
                  <span>{language === 'ar' ? 'ملازم ومحاضرات' : 'Lectures'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveSubTab('summaries'); setFormError(''); }}
                  className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeSubTab === 'summaries'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>{language === 'ar' ? 'ملخصات وقوانين' : 'Summaries'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveSubTab('schedule'); setFormError(''); }}
                  className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeSubTab === 'schedule'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>{language === 'ar' ? 'الجدول الأسبوعي' : 'Schedule'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveSubTab('exams'); setFormError(''); }}
                  className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeSubTab === 'exams'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <FileCheck className="w-4 h-4 shrink-0" />
                  <span>{language === 'ar' ? 'نماذج امتحانية' : 'Exams'}</span>
                </button>
              </div>

              {/* Success Notification Banner */}
              {isSuccess && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center gap-3 animate-fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <p className="text-xs sm:text-sm font-bold">{successMsg}</p>
                </div>
              )}

              {/* Error Message */}
              {formError && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/70 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 flex items-center gap-2 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 1: ADD LECTURE + AI QUIZ WITH MATH                   */}
              {/* ======================================================== */}
              {activeSubTab === 'lectures' && (
                <form onSubmit={handleSubmitLecture} className="space-y-6">
                  <div className="bg-blue-50/50 dark:bg-blue-950/30 p-4 rounded-2xl border border-blue-100 dark:border-blue-900 space-y-4">
                    <h3 className="text-sm font-black text-blue-950 dark:text-white flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>{language === 'ar' ? '1. البيانات الأكاديمية للملزمة' : '1. Lecture Information'}</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {language === 'ar' ? 'المادة الدراسية' : 'Subject'} *
                        </label>
                        <select
                          value={lecSubjectId}
                          onChange={(e) => handleLecSubjectChange(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                        >
                          {subjects.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.code} - {language === 'ar' ? s.nameAr : s.nameEn} (المرحلة {s.stage})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {language === 'ar' ? 'المرحلة' : 'Stage'}
                          </label>
                          <select
                            value={lecStage}
                            onChange={(e) => setLecStage(Number(e.target.value) as Stage)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white"
                          >
                            <option value={1}>{language === 'ar' ? 'المرحلة الأولى' : 'Stage 1'}</option>
                            <option value={2}>{language === 'ar' ? 'المرحلة الثانية' : 'Stage 2'}</option>
                            <option value={3}>{language === 'ar' ? 'المرحلة الثالثة' : 'Stage 3'}</option>
                            <option value={4}>{language === 'ar' ? 'المرحلة الرابعة' : 'Stage 4'}</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {language === 'ar' ? 'رقم المحاضرة' : 'Lec #'}
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={50}
                            value={lecNumber}
                            onChange={(e) => setLecNumber(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white text-center"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {language === 'ar' ? 'عنوان الملزمة / المحاضرة (بالعربية)' : 'Arabic Title'} *
                        </label>
                        <input
                          type="text"
                          value={lecTitleAr}
                          onChange={(e) => setLecTitleAr(e.target.value)}
                          placeholder={language === 'ar' ? 'مثال: دوال التحويل والاستجابة الزمنية للأنظمة' : 'Lecture Title'}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {language === 'ar' ? 'العنوان بالإنجليزية (اختياري)' : 'English Title'}
                        </label>
                        <input
                          type="text"
                          value={lecTitleEn}
                          onChange={(e) => setLecTitleEn(e.target.value)}
                          placeholder="e.g. Transfer Functions & Time Response"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {language === 'ar' ? 'أستاذ المادة المحاضر' : 'Instructor'}
                        </label>
                        <input
                          type="text"
                          value={lecInstructorAr}
                          onChange={(e) => setLecInstructorAr(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {language === 'ar' ? 'ملف المحاضرة (PDF / Notes)' : 'File Attachment'}
                        </label>
                        <div className="flex items-center gap-2">
                          <label className="px-3 py-2 rounded-xl border border-dashed border-blue-400 dark:border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-blue-100/50 transition-colors shrink-0">
                            <FileUp className="w-4 h-4" />
                            <span>{lecUploadedFileName ? 'تغيير الملف' : 'اختيار ملف'}</span>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setLecUploadedFileName(file.name);
                                  setLecUploadedFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
                                  const url = URL.createObjectURL(file);
                                  setLecFileUrl(url);
                                }
                              }}
                            />
                          </label>
                          <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {lecUploadedFileName || 'ملزمة بصيغة PDF (تلقائي 2.5 MB)'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {language === 'ar' ? 'القوانين والمعادلات الرياضية الواردة بالملزمة (قانون لكل سطر)' : 'Key Formulas & Equations'}
                      </label>
                      <textarea
                        rows={2}
                        value={lecKeyFormulasText}
                        onChange={(e) => setLecKeyFormulasText(e.target.value)}
                        placeholder="G(s) = Y(s) / U(s)&#10;s² + 2ζωn s + ωn² = 0&#10;ess = 1 / (1 + Kp)"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-slate-800 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* AI QUIZ GENERATION SECTION */}
                  <div className="bg-gradient-to-br from-indigo-50/80 via-blue-50/60 to-purple-50/50 dark:from-slate-800/90 dark:via-blue-950/40 dark:to-indigo-950/30 p-5 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
                            <Sparkles className="w-4 h-4" />
                          </span>
                          <h3 className="text-sm font-black text-indigo-950 dark:text-white">
                            {language === 'ar' ? '2. إنشاء الاختبار الذكي المتزامن بالذكاء الاصطناعي (AI Quiz)' : '2. Synchronized AI Quiz Generator'}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                          {language === 'ar'
                            ? 'توليد أسئلة اختبار دقيقة متوافقة 100% مع مادة هذه الملزمة تلقائياً.'
                            : 'Generate exam-grade questions strictly aligned with this lecture material.'}
                        </p>
                      </div>

                      {/* Math problems requirement toggle */}
                      <label className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-700 cursor-pointer shadow-xs">
                        <input
                          type="checkbox"
                          checked={hasMathProblems}
                          onChange={(e) => setHasMathProblems(e.target.checked)}
                          className="w-4 h-4 text-indigo-600 rounded-md focus:ring-indigo-500 cursor-pointer"
                        />
                        <div className="flex items-center gap-1.5 text-xs font-black text-indigo-900 dark:text-indigo-300">
                          <Calculator className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span>{language === 'ar' ? 'تضمين مسائل رياضية وحسابات هندسية 🧮' : 'Include Mathematical Problems'}</span>
                        </div>
                      </label>
                    </div>

                    {/* AI Generation Action Button */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={handleGenerateAiQuiz}
                        disabled={isGeneratingAiQuiz}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-500/25 transition-all cursor-pointer disabled:opacity-60"
                      >
                        {isGeneratingAiQuiz ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-white" />
                            <span>{language === 'ar' ? 'جارٍ تحليل الملزمة وتوليد المسائل الهندسية...' : 'Analyzing & Generating Quiz...'}</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 text-amber-300" />
                            <span>{language === 'ar' ? 'توليد وتحديث الاختبار بالذكاء الاصطناعي ✨' : 'Generate Synchronized Quiz with AI'}</span>
                          </>
                        )}
                      </button>

                      {aiQuizSource && (
                        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? `تم التوليد بنجاح بواسطة: ${aiQuizSource}` : `Generated via: ${aiQuizSource}`}</span>
                        </span>
                      )}
                    </div>

                    {/* Generated Quiz Questions Preview & Management */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                        <span>{language === 'ar' ? `أسئلة الاختبار المرفق (${quizQuestions.length} أسئلة):` : `Attached Questions (${quizQuestions.length}):`}</span>
                        <button
                          type="button"
                          onClick={handleAddQuestion}
                          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? 'إضافة سؤال يدوي' : 'Add manual question'}</span>
                        </button>
                      </div>

                      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                        {quizQuestions.map((q, qIndex) => (
                          <div 
                            key={q.id || qIndex}
                            className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5 shadow-xs"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2 flex-1">
                                <span className="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[11px] font-black flex items-center justify-center shrink-0">
                                  {qIndex + 1}
                                </span>
                                <input
                                  type="text"
                                  value={q.questionAr}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setQuizQuestions(prev => prev.map((item, idx) => idx === qIndex ? { ...item, questionAr: val } : item));
                                  }}
                                  placeholder={language === 'ar' ? 'نص السؤال بالعربية' : 'Question text'}
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                                />
                              </div>

                              {quizQuestions.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveQuestion(qIndex)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>

                            {q.codeOrFormula && (
                              <div className="bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-[11px] font-mono text-indigo-700 dark:text-indigo-300">
                                <Code className="w-3.5 h-3.5 shrink-0" />
                                <span>{q.codeOrFormula}</span>
                              </div>
                            )}

                            {/* Options List */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              {q.optionsAr.map((opt, optIdx) => (
                                <div 
                                  key={optIdx}
                                  className={`flex items-center gap-2 p-1.5 rounded-lg border transition-colors ${
                                    q.correctIndex === optIdx
                                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={`correct-${qIndex}`}
                                    checked={q.correctIndex === optIdx}
                                    onChange={() => {
                                      setQuizQuestions(prev => prev.map((item, idx) => idx === qIndex ? { ...item, correctIndex: optIdx } : item));
                                    }}
                                    className="text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                  />
                                  <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setQuizQuestions(prev => prev.map((item, idx) => {
                                        if (idx !== qIndex) return item;
                                        const newOpts = [...item.optionsAr];
                                        newOpts[optIdx] = val;
                                        return { ...item, optionsAr: newOpts };
                                      }));
                                    }}
                                    placeholder={`خيار ${optIdx + 1}`}
                                    className="w-full bg-transparent text-[11px] font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Submit Lecture Button */}
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      {t.cancel}
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{language === 'ar' ? 'حفظ ونشر الملزمة مع الاختبار الذكي' : 'Save Lecture & Quiz'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* ======================================================== */}
              {/* TAB 2: ADD SUMMARY & FORMULA SHEET                       */}
              {/* ======================================================== */}
              {activeSubTab === 'summaries' && (
                <form onSubmit={handleSubmitSummary} className="space-y-5">
                  <div className="bg-blue-50/40 dark:bg-blue-950/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900 space-y-4">
                    <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-sm font-black">
                        {language === 'ar' ? 'إضافة ملخص وبطاقة قوانين هندسية جديدة' : 'Add New Summary Sheet'}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {language === 'ar' ? 'المادة الدراسية' : 'Subject'} *
                        </label>
                        <select
                          value={sumSubjectId}
                          onChange={(e) => {
                            setSumSubjectId(e.target.value);
                            const sub = subjects.find(s => s.id === e.target.value);
                            if (sub) setSumStage(sub.stage);
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white"
                        >
                          {subjects.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.code} - {language === 'ar' ? s.nameAr : s.nameEn}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {language === 'ar' ? 'المرحلة' : 'Stage'}
                          </label>
                          <select
                            value={sumStage}
                            onChange={(e) => setSumStage(Number(e.target.value) as Stage)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white"
                          >
                            <option value={1}>المرحلة 1</option>
                            <option value={2}>المرحلة 2</option>
                            <option value={3}>المرحلة 3</option>
                            <option value={4}>المرحلة 4</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {language === 'ar' ? 'عدد الصفحات' : 'Pages'}
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={sumPagesCount}
                            onChange={(e) => setSumPagesCount(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white text-center"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {language === 'ar' ? 'عنوان الملخص بالعربية' : 'Arabic Title'} *
                        </label>
                        <input
                          type="text"
                          value={sumTitleAr}
                          onChange={(e) => setSumTitleAr(e.target.value)}
                          placeholder="مثال: ملخص شامل لقوانين الاستقرارية ومخططات بود"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {language === 'ar' ? 'العنوان بالإنجليزية (اختياري)' : 'English Title'}
                        </label>
                        <input
                          type="text"
                          value={sumTitleEn}
                          onChange={(e) => setSumTitleEn(e.target.value)}
                          placeholder="e.g. Stability Criteria & Bode Summary"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {language === 'ar' ? 'اسم المُعِدّ / المهندس' : 'Author'}
                        </label>
                        <input
                          type="text"
                          value={sumAuthorAr}
                          onChange={(e) => setSumAuthorAr(e.target.value)}
                          placeholder="م. أحمد العبيدي"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {language === 'ar' ? 'الوسوم والكلمات الدلالية' : 'Tags'}
                        </label>
                        <input
                          type="text"
                          value={sumTagsText}
                          onChange={(e) => setSumTagsText(e.target.value)}
                          placeholder="قوانين، مسائل محلولة، تحكم"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {language === 'ar' ? 'ملف الملخص (PDF)' : 'PDF File'}
                      </label>
                      <div className="flex items-center gap-2">
                        <label className="px-3 py-2 rounded-xl border border-dashed border-blue-400 dark:border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-blue-100/50 transition-colors shrink-0">
                          <FileUp className="w-4 h-4" />
                          <span>{sumUploadedFileName ? 'تغيير الملف' : 'اختيار ملف PDF'}</span>
                          <input
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setSumUploadedFileName(file.name);
                                setSumFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
                              }
                            }}
                          />
                        </label>
                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {sumUploadedFileName || 'ملف PDF جاهز للتنزيل المباشر'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      {t.cancel}
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{language === 'ar' ? 'حفظ ونشر الملخص' : 'Save Summary'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* ======================================================== */}
              {/* TAB 3: ADD SCHEDULE ITEM                                 */}
              {/* ======================================================== */}
              {activeSubTab === 'schedule' && (
                <form onSubmit={handleSubmitSchedule} className="space-y-5">
                  <div className="bg-blue-50/40 dark:bg-blue-950/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900 space-y-4">
                    <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300">
                      <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-sm font-black">
                        {language === 'ar' ? 'إضافة محاضرة جديدة للجدول الأسبوعي' : 'Add Weekly Schedule Lecture'}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {language === 'ar' ? 'اليوم' : 'Day'} *
                        </label>
                        <select
                          value={schDayIndex}
                          onChange={(e) => setSchDayIndex(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white"
                        >
                          {WEEK_DAYS.map(d => (
                            <option key={d.index} value={d.index}>
                              {language === 'ar' ? d.nameAr : d.nameEn}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {language === 'ar' ? 'المرحلة الدراسية' : 'Stage'}
                        </label>
                        <select
                          value={schStage}
                          onChange={(e) => setSchStage(Number(e.target.value) as Stage)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white"
                        >
                          <option value={1}>المرحلة 1</option>
                          <option value={2}>المرحلة 2</option>
                          <option value={3}>المرحلة 3</option>
                          <option value={4}>المرحلة 4</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {language === 'ar' ? 'الشعبة' : 'Group'}
                        </label>
                        <select
                          value={schGroup}
                          onChange={(e) => setSchGroup(e.target.value as 'A' | 'B' | 'الكل')}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white"
                        >
                          <option value="A">{language === 'ar' ? 'الشعبة A' : 'Group A'}</option>
                          <option value="B">{language === 'ar' ? 'الشعبة B' : 'Group B'}</option>
                          <option value="الكل">{language === 'ar' ? 'الكل (مشترك)' : 'All'}</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {language === 'ar' ? 'اسم المادة' : 'Subject Name'} *
                        </label>
                        <input
                          type="text"
                          value={schSubjectNameAr}
                          onChange={(e) => setSchSubjectNameAr(e.target.value)}
                          placeholder="مثال: نظرية السيطرة"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {language === 'ar' ? 'نوع المحاضرة' : 'Lecture Type'}
                        </label>
                        <select
                          value={schType}
                          onChange={(e) => setSchType(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white"
                        >
                          <option value="theoretical">{language === 'ar' ? 'نظري' : 'Theoretical'}</option>
                          <option value="practical">{language === 'ar' ? 'عملي ومختبر' : 'Practical & Lab'}</option>
                          <option value="tutorial">{language === 'ar' ? 'مناقشة تمارين (Tutorial)' : 'Tutorial'}</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {language === 'ar' ? 'وقت البدء' : 'Start Time'}
                          </label>
                          <input
                            type="text"
                            value={schStartTime}
                            onChange={(e) => setSchStartTime(e.target.value)}
                            placeholder="08:30"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white text-center"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {language === 'ar' ? 'وقت الانتهاء' : 'End Time'}
                          </label>
                          <input
                            type="text"
                            value={schEndTime}
                            onChange={(e) => setSchEndTime(e.target.value)}
                            placeholder="10:30"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white text-center"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {language === 'ar' ? 'القاعة أو المختبر' : 'Room / Hall'}
                          </label>
                          <input
                            type="text"
                            value={schRoomAr}
                            onChange={(e) => setSchRoomAr(e.target.value)}
                            placeholder="القاعة 302"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {language === 'ar' ? 'أستاذ المادة' : 'Lecturer'}
                          </label>
                          <input
                            type="text"
                            value={schInstructorAr}
                            onChange={(e) => setSchInstructorAr(e.target.value)}
                            placeholder="د. أحمد"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      {t.cancel}
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{language === 'ar' ? 'تثبيت بالجدول الأسبوعي' : 'Add to Schedule'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* ======================================================== */}
              {/* TAB 4: ADD EXAM QUESTION PAPER                           */}
              {/* ======================================================== */}
              {activeSubTab === 'exams' && (
                <form onSubmit={handleSubmitExam} className="space-y-5">
                  <div className="bg-blue-50/40 dark:bg-blue-950/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900 space-y-4">
                    <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300">
                      <FileCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-sm font-black">
                        {language === 'ar' ? 'إضافة أسئلة ونماذج امتحانية جديدة للأرشيف' : 'Add Exam Papers Archive'}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {language === 'ar' ? 'المادة الدراسية' : 'Subject'} *
                        </label>
                        <select
                          value={examSubjectId}
                          onChange={(e) => {
                            setExamSubjectId(e.target.value);
                            const sub = subjects.find(s => s.id === e.target.value);
                            if (sub) setExamStage(sub.stage);
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white"
                        >
                          {subjects.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.code} - {language === 'ar' ? s.nameAr : s.nameEn}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {language === 'ar' ? 'نوع الامتحان' : 'Exam Type'}
                          </label>
                          <select
                            value={examType}
                            onChange={(e) => setExamType(e.target.value as any)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white"
                          >
                            <option value="final">{language === 'ar' ? 'نهائي (Final)' : 'Final'}</option>
                            <option value="midterm">{language === 'ar' ? 'نصف الفصل (Midterm)' : 'Midterm'}</option>
                            <option value="practical">{language === 'ar' ? 'مختبر وعملي' : 'Practical'}</option>
                            <option value="quiz">{language === 'ar' ? 'اختبار شهري' : 'Quiz'}</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {language === 'ar' ? 'العام الدراسي' : 'Academic Year'}
                          </label>
                          <input
                            type="text"
                            value={examAcademicYear}
                            onChange={(e) => setExamAcademicYear(e.target.value)}
                            placeholder="2024 - 2025"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white text-center"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {language === 'ar' ? 'عنوان النموذج الامتحاني بالعربية' : 'Exam Title'} *
                        </label>
                        <input
                          type="text"
                          value={examTitleAr}
                          onChange={(e) => setExamTitleAr(e.target.value)}
                          placeholder="مثال: أسئلة الامتحان النهائي الدور الأول 2024 مع الحل النموذجي"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {language === 'ar' ? 'العنوان بالإنجليزية (اختياري)' : 'English Title'}
                        </label>
                        <input
                          type="text"
                          value={examTitleEn}
                          onChange={(e) => setExamTitleEn(e.target.value)}
                          placeholder="e.g. Final Examination 2024 (Solved)"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-2 mb-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={examSolved}
                            onChange={(e) => setExamSolved(e.target.checked)}
                            className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500 cursor-pointer"
                          />
                          <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                            {language === 'ar' ? 'يتضمن الحل النموذجي والتدقيق الهندسي' : 'Includes Solved Key'}
                          </span>
                        </label>

                        {examSolved && (
                          <input
                            type="text"
                            value={examSolvedByAr}
                            onChange={(e) => setExamSolvedByAr(e.target.value)}
                            placeholder="حل وتدقيق: أستاذ المادة"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white"
                          />
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {language === 'ar' ? 'ملف الأسئلة والحل (PDF)' : 'PDF Attachment'}
                        </label>
                        <div className="flex items-center gap-2">
                          <label className="px-3 py-2 rounded-xl border border-dashed border-blue-400 dark:border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-blue-100/50 transition-colors shrink-0">
                            <FileUp className="w-4 h-4" />
                            <span>{examUploadedFileName ? 'تغيير الملف' : 'اختيار ملف PDF'}</span>
                            <input
                              type="file"
                              accept=".pdf"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setExamUploadedFileName(file.name);
                                  setExamFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
                                }
                              }}
                            />
                          </label>
                          <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {examUploadedFileName || 'نموذج PDF جاهز للأرشفة والتنزيل'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      {t.cancel}
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{language === 'ar' ? 'أرشفة ونشر النموذج الامتحاني' : 'Archive Exam Paper'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
