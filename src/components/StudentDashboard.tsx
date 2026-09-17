import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Award,
  CheckCircle2,
  XCircle,
  TrendingUp,
  GraduationCap,
  Calendar,
  Layers,
  ArrowRight,
  RotateCcw,
  Sparkles,
  BarChart3,
  CheckSquare,
  Square,
  Clock,
  ExternalLink,
  Shield,
  Lock,
  Flame,
  User,
  Edit3,
  Download,
  Upload,
  Printer,
  Check,
  Zap,
  Target,
  FileText
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ReferenceLine
} from 'recharts';
import { Lecture, Subject, QuizAttempt, Language, StudentProfile, Stage } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface StudentDashboardProps {
  lectures: Lecture[];
  subjects: Subject[];
  readLectureIds: string[];
  onToggleReadLecture: (lectureId: string) => void;
  quizAttempts: Record<string, QuizAttempt>;
  language: Language;
  onNavigateToLectures: () => void;
  onNavigateToQuizzes: () => void;
  onStartQuiz?: (lecture: Lecture) => void;
  profile: StudentProfile;
  onUpdateProfile: (newProfile: Partial<StudentProfile>) => void;
  streakCount: number;
  studyMinutes: number;
  onExportBackup: () => void;
  onImportBackup: (json: string) => boolean;
  onResetProgress: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  lectures,
  subjects,
  readLectureIds,
  onToggleReadLecture,
  quizAttempts,
  language,
  onNavigateToLectures,
  onNavigateToQuizzes,
  onStartQuiz,
  profile,
  onUpdateProfile,
  streakCount,
  studyMinutes,
  onExportBackup,
  onImportBackup,
  onResetProgress,
}) => {
  const t = TRANSLATIONS[language];

  // Profile Edit Modal State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editStage, setEditStage] = useState<Stage>(profile.stage);
  const [editGroup, setEditGroup] = useState<'A' | 'B'>(profile.group);
  const [editUniId, setEditUniId] = useState(profile.universityId || '');
  const [editGoal, setEditGoal] = useState<number>(profile.dailyGoalMinutes || 45);

  // Import Status
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Filter & calculation logic
  const attemptsList: QuizAttempt[] = useMemo(() => {
    return Object.values(quizAttempts);
  }, [quizAttempts]);

  // Read lectures calculation
  const totalLecturesCount = lectures.length;
  const readLecturesCount = useMemo(() => {
    return lectures.filter(l => readLectureIds.includes(l.id)).length;
  }, [lectures, readLectureIds]);

  const readPercentage = totalLecturesCount > 0
    ? Math.min(100, Math.round((readLecturesCount / totalLecturesCount) * 100))
    : 0;

  // Quiz statistics calculation
  const totalQuizzesTaken = attemptsList.length;
  const passedQuizzesCount = attemptsList.filter(a => a.passed).length;
  const failedQuizzesCount = totalQuizzesTaken - passedQuizzesCount;

  const quizSuccessRate = totalQuizzesTaken > 0
    ? Math.round((passedQuizzesCount / totalQuizzesTaken) * 100)
    : 0;

  const averageScore = totalQuizzesTaken > 0
    ? Math.round(attemptsList.reduce((acc, a) => acc + a.percentage, 0) / totalQuizzesTaken)
    : 0;

  // Study hours and minutes
  const studyHours = Math.floor(studyMinutes / 60);
  const remainingStudyMins = studyMinutes % 60;

  // Academic Rank calculation based on performance
  const academicRank = useMemo(() => {
    const points = (readLecturesCount * 10) + (passedQuizzesCount * 25) + (averageScore >= 80 ? 50 : 0);
    if (points >= 150) return { titleAr: 'مهندس تحكم متميز 🥇', titleEn: 'Distinguished Engineer 🥇', color: 'text-amber-500' };
    if (points >= 75) return { titleAr: 'مهندس تحكم متقدم 🥈', titleEn: 'Advanced Engineer 🥈', color: 'text-blue-600' };
    if (points >= 25) return { titleAr: 'طالب سيطرة واعد 🥉', titleEn: 'Promising Student 🥉', color: 'text-indigo-600' };
    return { titleAr: 'طالب في بداية المشوار 🚀', titleEn: 'Aspiring Student 🚀', color: 'text-slate-600' };
  }, [readLecturesCount, passedQuizzesCount, averageScore]);

  // Achievements List
  const achievements = useMemo(() => {
    return [
      {
        id: 'first_step',
        titleAr: 'الخطوة الأولى',
        titleEn: 'First Step',
        descAr: 'قراءة أول ملزمة في التخصص',
        descEn: 'Read your first lecture',
        unlocked: readLecturesCount >= 1,
        icon: '🎓',
      },
      {
        id: 'perfect_score',
        titleAr: 'عبقري السيطرة',
        titleEn: 'Control Master',
        descAr: 'الحصول على درجة 100% كاملة في اختبار',
        descEn: 'Score 100% on any quiz',
        unlocked: attemptsList.some(a => a.percentage === 100),
        icon: '⚡',
      },
      {
        id: 'streak_flame',
        titleAr: 'مواظبة حديدية',
        titleEn: 'Study Streak',
        descAr: 'المواظبة على الدراسة لأكثر من يومين متتاليين',
        descEn: 'Study for 2+ consecutive days',
        unlocked: streakCount >= 2,
        icon: '🔥',
      },
      {
        id: 'knowledge_seeker',
        titleAr: 'مهندس مثابر',
        titleEn: 'Diligent Engineer',
        descAr: 'إكمال قراءة 3 ملازم أو أكثر',
        descEn: 'Complete 3+ lectures',
        unlocked: readLecturesCount >= 3,
        icon: '📚',
      },
      {
        id: 'quiz_crusher',
        titleAr: 'قاهر الاختبارات',
        titleEn: 'Quiz Crusher',
        descAr: 'اجتياز 3 اختبارات بنجاح',
        descEn: 'Pass 3+ quizzes',
        unlocked: passedQuizzesCount >= 3,
        icon: '🏆',
      },
    ];
  }, [readLecturesCount, attemptsList, streakCount, passedQuizzesCount]);

  // Chart Data: Quiz history
  const quizScoresChartData = useMemo(() => {
    return attemptsList.map((att, idx) => ({
      name: language === 'ar' ? (att.quizTitleAr.length > 15 ? att.quizTitleAr.slice(0, 15) + '...' : att.quizTitleAr) : (att.quizTitleEn.length > 15 ? att.quizTitleEn.slice(0, 15) + '...' : att.quizTitleEn),
      fullName: language === 'ar' ? att.quizTitleAr : att.quizTitleEn,
      subject: language === 'ar' ? att.subjectNameAr : att.subjectNameEn,
      score: att.percentage,
      passed: att.passed,
      date: att.date,
      index: idx + 1,
    }));
  }, [attemptsList, language]);

  // Chart Data: Reading Pie
  const readingPieData = useMemo(() => {
    const unreadCount = Math.max(0, totalLecturesCount - readLecturesCount);
    return [
      {
        name: language === 'ar' ? 'محاضرات مقروءة' : 'Read Lectures',
        value: readLecturesCount,
        color: '#2563eb',
      },
      {
        name: language === 'ar' ? 'محاضرات متبقية' : 'Remaining Lectures',
        value: unreadCount,
        color: '#e2e8f0',
      },
    ];
  }, [readLecturesCount, totalLecturesCount, language]);

  // Subject breakdown
  const subjectProgressData = useMemo(() => {
    return subjects.map(sub => {
      const subLectures = lectures.filter(l => l.subjectId === sub.id);
      const subRead = subLectures.filter(l => readLectureIds.includes(l.id)).length;
      const subAttempts = attemptsList.filter(a => {
        const matchingLec = lectures.find(l => l.quiz.id === a.quizId || l.id === a.quizId);
        return matchingLec?.subjectId === sub.id;
      });
      const subAvg = subAttempts.length > 0
        ? Math.round(subAttempts.reduce((s, a) => s + a.percentage, 0) / subAttempts.length)
        : null;

      return {
        id: sub.id,
        code: sub.code,
        name: language === 'ar' ? sub.nameAr : sub.nameEn,
        stage: sub.stage,
        total: subLectures.length,
        read: subRead,
        percentage: subLectures.length > 0 ? Math.round((subRead / subLectures.length) * 100) : 0,
        quizAvg: subAvg,
      };
    });
  }, [subjects, lectures, readLectureIds, attemptsList, language]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: editName.trim() || profile.name,
      stage: editStage,
      group: editGroup,
      universityId: editUniId.trim(),
      dailyGoalMinutes: editGoal,
    });
    setIsEditingProfile(false);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div id="student-dashboard-view" className="space-y-6">
      {/* 1. Private Student Banner with Local Storage Guarantee */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Top Privacy Tag */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold shadow-xs">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'ar' ? 'لوحة إحصائياتي الأكاديمية الخاصة (محفوظة على جهازي فقط)' : 'Private Student Dashboard (Saved Locally on Your Device)'}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditName(profile.name);
                  setEditStage(profile.stage);
                  setEditGroup(profile.group);
                  setEditUniId(profile.universityId || '');
                  setEditGoal(profile.dailyGoalMinutes || 45);
                  setIsEditingProfile(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-white/20 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-300" />
                <span>{language === 'ar' ? 'تعديل بياناتي' : 'Edit Profile'}</span>
              </button>

              <button
                onClick={handlePrintReport}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-white/20 cursor-pointer hidden sm:flex"
              >
                <Printer className="w-3.5 h-3.5 text-blue-300" />
                <span>{language === 'ar' ? 'طباعة التقرير' : 'Print Card'}</span>
              </button>
            </div>
          </div>

          {/* Student Profile Card Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-2">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center font-black text-2xl shadow-lg border-2 border-white/30 shrink-0">
                {profile.name ? profile.name.slice(0, 1) : 'ط'}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    {profile.name}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/40 text-xs font-bold">
                    {language === 'ar' ? `المرحلة ${profile.stage} (شعبة ${profile.group})` : `Stage ${profile.stage} (Group ${profile.group})`}
                  </span>
                </div>
                <p className="text-xs text-slate-300 flex items-center gap-2">
                  <span>الرقم الجامعي: <strong className="text-white font-mono">{profile.universityId || 'غير محدد'}</strong></span>
                  <span>•</span>
                  <span>الرتبة: <strong className={academicRank.color}>{language === 'ar' ? academicRank.titleAr : academicRank.titleEn}</strong></span>
                </p>
                <p className="text-[11px] text-blue-200/80 flex items-center gap-1 pt-0.5">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>{language === 'ar' ? 'جميع إحصائياتك وتقدمك في الملازم والاختبارات مخزنة داخل هذا الجهاز ولن تُفقد عند مغادرتك للمنصة.' : 'Progress securely stored on your local browser and never lost upon leaving.'}</span>
                </p>
              </div>
            </div>

            {/* Streak and Study Time Badges */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Flame className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-300 block font-bold">
                    {language === 'ar' ? 'أيام المواظبة المستمرة' : 'Active Streak'}
                  </span>
                  <span className="text-lg font-black text-white">
                    {streakCount} {language === 'ar' ? 'أيام 🔥' : 'Days 🔥'}
                  </span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-cyan-300 flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-300 block font-bold">
                    {language === 'ar' ? 'الوقت المستثمر بالدراسة' : 'Study Time'}
                  </span>
                  <span className="text-lg font-black text-white">
                    {studyHours > 0 ? `${studyHours}h ` : ''}{remainingStudyMins}m
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Performance Indicators (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Lectures Completed */}
        <div id="kpi-lectures-read" className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-600 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t.lecturesReadCard}
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">{readLecturesCount}</span>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500">/ {totalLecturesCount} {t.lectureCount}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${readPercentage}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            <span>{language === 'ar' ? 'نسبة الإنجاز:' : 'Completion:'}</span>
            <span className="font-bold text-blue-700 dark:text-blue-400">%{readPercentage}</span>
          </div>
        </div>

        {/* KPI 2: Quiz Success Rate */}
        <div id="kpi-success-rate" className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-600 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t.quizSuccessRateCard}
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">%{quizSuccessRate}</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {quizSuccessRate >= 70 ? (language === 'ar' ? 'ممتاز' : 'Great') : (quizSuccessRate >= 50 ? (language === 'ar' ? 'جيد' : 'Good') : (language === 'ar' ? 'بداية طيبة' : 'Getting started'))}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  quizSuccessRate >= 60 ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${quizSuccessRate}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            <span>{language === 'ar' ? 'الناجحة:' : 'Passed:'} <strong className="text-emerald-700 dark:text-emerald-400">{passedQuizzesCount}</strong></span>
            <span>{language === 'ar' ? 'الراسبة:' : 'Failed:'} <strong className="text-rose-600 dark:text-rose-400">{failedQuizzesCount}</strong></span>
          </div>
        </div>

        {/* KPI 3: Average Quiz Score */}
        <div id="kpi-average-score" className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-600 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {language === 'ar' ? 'المعدل التراكمي للاختبارات' : 'Average Quiz Score'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">%{averageScore}</span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {averageScore >= 80 ? (language === 'ar' ? 'امتياز' : 'Excellent') : (averageScore >= 60 ? (language === 'ar' ? 'مقبول' : 'Pass') : (language === 'ar' ? 'قيد التطوير' : 'In Progress'))}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${averageScore}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            <span>{language === 'ar' ? 'إجمالي المحاولات:' : 'Total Attempts:'}</span>
            <strong className="text-indigo-700 dark:text-indigo-300">{totalQuizzesTaken}</strong>
          </div>
        </div>

        {/* KPI 4: Daily Target / Goal */}
        <div id="kpi-daily-target" className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-cyan-300 dark:hover:border-cyan-600 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {language === 'ar' ? 'الهدف الدراسي اليومي' : 'Daily Goal'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/70 text-cyan-600 dark:text-cyan-300 flex items-center justify-center font-bold">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">{remainingStudyMins}</span>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500">/ {profile.dailyGoalMinutes || 45} {language === 'ar' ? 'دقيقة' : 'mins'}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-cyan-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((remainingStudyMins / (profile.dailyGoalMinutes || 45)) * 100))}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            <span>{language === 'ar' ? 'المواظبة اليومية:' : 'Daily status:'}</span>
            <span className="font-bold text-cyan-700 dark:text-cyan-400">
              {remainingStudyMins >= (profile.dailyGoalMinutes || 45) ? (language === 'ar' ? 'مكتمل اليوم 🎉' : 'Achieved!') : (language === 'ar' ? 'مستمر بالمذاكرة' : 'On track')}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Achievements & Badges System */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {language === 'ar' ? 'أوسمة وإنجازات الطالب الأكاديمية' : 'Student Academic Badges'}
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {achievements.filter(a => a.unlocked).length} / {achievements.length} {language === 'ar' ? 'مكتملة' : 'Unlocked'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-3.5 rounded-2xl border text-center space-y-2 transition-all ${
                ach.unlocked
                  ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-50 grayscale'
              }`}
            >
              <div className="text-3xl mx-auto">{ach.icon}</div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white">
                  {language === 'ar' ? ach.titleAr : ach.titleEn}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                  {language === 'ar' ? ach.descAr : ach.descEn}
                </p>
              </div>
              <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${
                ach.unlocked ? 'bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200' : 'bg-slate-200 dark:bg-slate-700 text-slate-600'
              }`}>
                {ach.unlocked ? (language === 'ar' ? 'مكتسب ✓' : 'Unlocked') : (language === 'ar' ? 'قيد الإنجاز' : 'Locked')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Subject-by-Subject Academic Mastery */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {language === 'ar' ? 'مستوى التمكن والإنجاز حسب المواد الدراسية' : 'Course-by-Course Mastery'}
            </h3>
          </div>
          <button
            onClick={onNavigateToLectures}
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{language === 'ar' ? 'تصفح الملازم' : 'Browse Lectures'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {subjectProgressData.map(sub => (
            <div
              key={sub.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-mono">
                    {sub.code}
                  </span>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white mt-1">
                    {sub.name}
                  </h4>
                </div>
                <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                  %{sub.percentage}
                </span>
              </div>

              <div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${sub.percentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                  <span>{sub.read} / {sub.total} {language === 'ar' ? 'ملازم مقروءة' : 'read'}</span>
                  <span>
                    {sub.quizAvg !== null 
                      ? (language === 'ar' ? `معدل الاختبار: %${sub.quizAvg}` : `Quiz Avg: %${sub.quizAvg}`) 
                      : (language === 'ar' ? 'لم يختبر بعد' : 'No quiz yet')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Quiz History Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {t.chartScoreTrends}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'ar' ? 'سجل درجاتك في الاختبارات المتزامنة ونسبة النجاح (الحد الأدنى 60%)' : 'Chronological scores and passing threshold'}
              </p>
            </div>
            <button
              onClick={onNavigateToQuizzes}
              className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold hover:bg-blue-100 transition-colors"
            >
              {t.tabQuizzes}
            </button>
          </div>

          {quizScoresChartData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <GraduationCap className="w-10 h-10 text-slate-300 dark:text-slate-600" />
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {language === 'ar' ? 'لم تجتز أي اختبارات بعد. ابدأ أول اختبار الآن!' : 'No quiz attempts recorded yet.'}
              </p>
              <button
                onClick={onNavigateToQuizzes}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700"
              >
                {language === 'ar' ? 'خوض أول اختبار' : 'Start First Quiz'}
              </button>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quizScoresChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `${val}%`} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-700">
                            <p className="font-bold text-blue-300">{data.fullName}</p>
                            <p className="text-slate-300">{data.subject}</p>
                            <p className="font-black text-sm">
                              {language === 'ar' ? 'الدرجة:' : 'Score:'} <span className={data.passed ? 'text-emerald-400' : 'text-rose-400'}>%{data.score}</span>
                            </p>
                            <p className="text-[10px] text-slate-400">{data.date}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine y={60} stroke="#ef4444" strokeDasharray="4 4" label={{ value: '60% النجاح', fill: '#ef4444', fontSize: 10, position: 'insideTopLeft' }} />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {quizScoresChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.passed ? '#2563eb' : '#f43f5e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Chart 2: Reading Donut Progress */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {t.chartReadingProgress}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'ar' ? 'نسبة ما أنجزته مقارنة بجميع ملازم المنهج' : 'Ratio of completed curriculum notes'}
            </p>
          </div>

          <div className="h-48 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={readingPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {readingPieData.map((entry, index) => (
                    <Cell key={`pie-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400">%{readPercentage}</span>
              <span className="text-[10px] text-slate-400 font-bold">{language === 'ar' ? 'مكتمل' : 'Done'}</span>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span>{language === 'ar' ? 'الملازم المقروءة' : 'Read'}</span>
              </span>
              <strong className="text-blue-600 dark:text-blue-400 font-bold">{readLecturesCount}</strong>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span>{language === 'ar' ? 'الملازم المتبقية' : 'Remaining'}</span>
              </span>
              <strong className="text-slate-500 font-bold">{Math.max(0, totalLecturesCount - readLecturesCount)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Device Data Management & Backup Tools (Save on Student Device) */}
      <div className="bg-slate-50 dark:bg-slate-900/80 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{language === 'ar' ? 'إدارة وحفظ بيانات التقدم على جهازك (Local Storage)' : 'Local Device Data & Backup'}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'ar'
                ? 'تقدمك محفوظ تلقائياً على هذا المتصفح. يمكنك أيضاً تنزيل نسخة احتياطية من تقدمك كملف ونقلها لأي جهاز آخر.'
                : 'Progress is automatically saved on this browser. You can export/import backup files anytime.'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onExportBackup}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>{language === 'ar' ? 'تصدير نسخة احتياطية (JSON)' : 'Export Backup'}</span>
            </button>

            <label className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'ar' ? 'استيراد من الجهاز' : 'Import Backup'}</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const text = event.target?.result as string;
                      if (text && onImportBackup(text)) {
                        setImportStatus(language === 'ar' ? 'تم استرجاع بيانات التقدم بنجاح!' : 'Data restored successfully!');
                        setTimeout(() => setImportStatus(null), 3000);
                      } else {
                        setImportStatus(language === 'ar' ? 'الملف غير صالح' : 'Invalid file format');
                        setTimeout(() => setImportStatus(null), 3000);
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
              />
            </label>

            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'تصفير السجل' : 'Reset'}</span>
            </button>
          </div>
        </div>

        {importStatus && (
          <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{importStatus}</span>
          </div>
        )}

        {showResetConfirm && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 space-y-3">
            <p className="text-xs font-bold text-rose-800 dark:text-rose-200">
              {language === 'ar' ? 'هل أنت متأكد من تصفير سجل القراءة ومحاولات الاختبارات على هذا الجهاز؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to reset your local progress?'}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onResetProgress();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
              >
                {language === 'ar' ? 'نعم، تصفير الآن' : 'Yes, Reset'}
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Profile Edit Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span>{language === 'ar' ? 'تعديل الملف الشخصي للطالب' : 'Edit Student Profile'}</span>
              </h3>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ar' ? 'اسم الطالب الكامل' : 'Student Full Name'} *
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="مثال: مصطفى أحمد"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'المرحلة الدراسية' : 'Stage'}
                  </label>
                  <select
                    value={editStage}
                    onChange={(e) => setEditStage(Number(e.target.value) as Stage)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value={1}>المرحلة الأولى</option>
                    <option value={2}>المرحلة الثانية</option>
                    <option value={3}>المرحلة الثالثة</option>
                    <option value={4}>المرحلة الرابعة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'الشعبة' : 'Group'}
                  </label>
                  <select
                    value={editGroup}
                    onChange={(e) => setEditGroup(e.target.value as 'A' | 'B')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="A">الشعبة A</option>
                    <option value="B">الشعبة B</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'الرقم الجامعي' : 'University ID'}
                  </label>
                  <input
                    type="text"
                    value={editUniId}
                    onChange={(e) => setEditUniId(e.target.value)}
                    placeholder="CAE-2024-..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'الهدف اليومي (بالدقائق)' : 'Daily Goal (Mins)'}
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={300}
                    value={editGoal}
                    onChange={(e) => setEditGoal(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  {language === 'ar' ? 'حفظ البيانات على جهازي' : 'Save on My Device'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
