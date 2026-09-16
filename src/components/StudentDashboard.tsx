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
  ExternalLink
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
import { Lecture, Subject, QuizAttempt, Language } from '../types';
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
}) => {
  const t = TRANSLATIONS[language];
  const [showDemoSample, setShowDemoSample] = useState(false);

  // Fallback demo attempts if user wants to preview charts with zero attempts
  const demoAttempts: Record<string, QuizAttempt> = useMemo(() => ({
    'demo-1': {
      id: 'demo-1',
      quizId: 'demo-q1',
      quizTitleAr: 'اختبار نظرية السيطرة - دوال التحويل',
      quizTitleEn: 'Control Theory - Transfer Functions',
      subjectNameAr: 'نظرية السيطرة',
      subjectNameEn: 'Control Theory',
      score: 4,
      totalQuestions: 5,
      percentage: 80,
      date: '2026-09-12',
      strikes: 0,
      passed: true,
      timeSpentSeconds: 145,
    },
    'demo-2': {
      id: 'demo-2',
      quizId: 'demo-q2',
      quizTitleAr: 'اختبار المنطق الرقمي - البوابات المنطقية',
      quizTitleEn: 'Digital Logic - Logic Gates',
      subjectNameAr: 'المنطق الرقمي',
      subjectNameEn: 'Digital Logic',
      score: 5,
      totalQuestions: 5,
      percentage: 100,
      date: '2026-09-13',
      strikes: 0,
      passed: true,
      timeSpentSeconds: 120,
    },
    'demo-3': {
      id: 'demo-3',
      quizId: 'demo-q3',
      quizTitleAr: 'اختبار الرياضيات الهندسية - تحويلات لابلاس',
      quizTitleEn: 'Engineering Math - Laplace Transforms',
      subjectNameAr: 'رياضيات هندسية',
      subjectNameEn: 'Engineering Mathematics',
      score: 2,
      totalQuestions: 5,
      percentage: 40,
      date: '2026-09-14',
      strikes: 1,
      passed: false,
      timeSpentSeconds: 210,
    },
    'demo-4': {
      id: 'demo-4',
      quizId: 'demo-q4',
      quizTitleAr: 'اختبار القياسات وأجهزة الاستشعار',
      quizTitleEn: 'Measurements & Sensors Quiz',
      subjectNameAr: 'قياسات',
      subjectNameEn: 'Measurements',
      score: 4,
      totalQuestions: 4,
      percentage: 100,
      date: '2026-09-15',
      strikes: 0,
      passed: true,
      timeSpentSeconds: 95,
    },
  }), []);

  // Use actual attempts or demo if toggled
  const effectiveAttempts = useMemo(() => {
    const actualKeys = Object.keys(quizAttempts);
    if (actualKeys.length > 0) return quizAttempts;
    if (showDemoSample) return demoAttempts;
    return {};
  }, [quizAttempts, showDemoSample, demoAttempts]);

  const attemptsList: QuizAttempt[] = useMemo(() => {
    return Object.values(effectiveAttempts);
  }, [effectiveAttempts]);

  // Read lectures calculation
  const totalLecturesCount = lectures.length;
  const readLecturesCount = useMemo(() => {
    if (showDemoSample && totalLecturesCount === 0) return 4;
    return lectures.filter(l => readLectureIds.includes(l.id)).length;
  }, [lectures, readLectureIds, showDemoSample, totalLecturesCount]);

  const effectiveTotalLectures = totalLecturesCount > 0 ? totalLecturesCount : (showDemoSample ? 6 : 0);

  const readPercentage = effectiveTotalLectures > 0
    ? Math.min(100, Math.round((readLecturesCount / effectiveTotalLectures) * 100))
    : 0;

  // Quiz statistics calculation
  const totalQuizzesTaken = attemptsList.length;
  const passedQuizzesCount = attemptsList.filter(a => a.passed).length;
  const failedQuizzesCount = totalQuizzesTaken - passedQuizzesCount;

  // Success rate: percentage of quizzes passed
  const quizSuccessRate = totalQuizzesTaken > 0
    ? Math.round((passedQuizzesCount / totalQuizzesTaken) * 100)
    : 0;

  // Average score across quizzes
  const averageScore = totalQuizzesTaken > 0
    ? Math.round(attemptsList.reduce((acc, a) => acc + a.percentage, 0) / totalQuizzesTaken)
    : 0;

  // Chart 1 Data: Quiz scores and success
  const quizScoresChartData = useMemo(() => {
    return attemptsList.map((att, idx) => ({
      name: language === 'ar' ? (att.quizTitleAr.length > 18 ? att.quizTitleAr.slice(0, 18) + '...' : att.quizTitleAr) : (att.quizTitleEn.length > 18 ? att.quizTitleEn.slice(0, 18) + '...' : att.quizTitleEn),
      fullName: language === 'ar' ? att.quizTitleAr : att.quizTitleEn,
      subject: language === 'ar' ? att.subjectNameAr : att.subjectNameEn,
      score: att.percentage,
      passed: att.passed,
      date: att.date,
      index: idx + 1,
    }));
  }, [attemptsList, language]);

  // Chart 2 Data: Reading Progress (Pie / Donut)
  const readingPieData = useMemo(() => {
    const unreadCount = Math.max(0, effectiveTotalLectures - readLecturesCount);
    return [
      {
        name: language === 'ar' ? 'محاضرات مقروءة' : 'Read Lectures',
        value: readLecturesCount,
        color: '#2563eb', // blue-600
      },
      {
        name: language === 'ar' ? 'محاضرات متبقية' : 'Remaining Lectures',
        value: unreadCount,
        color: '#e2e8f0', // slate-200
      },
    ];
  }, [readLecturesCount, effectiveTotalLectures, language]);

  // Subject-by-subject reading breakdown
  const subjectProgressData = useMemo(() => {
    return subjects.map(sub => {
      const subLectures = lectures.filter(l => l.subjectId === sub.id);
      const subRead = subLectures.filter(l => readLectureIds.includes(l.id)).length;
      return {
        code: sub.code,
        name: language === 'ar' ? sub.nameAr : sub.nameEn,
        total: subLectures.length,
        read: subRead,
        percentage: subLectures.length > 0 ? Math.round((subRead / subLectures.length) * 100) : 0,
      };
    });
  }, [subjects, lectures, readLectureIds, language]);

  return (
    <div id="student-dashboard-view" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'لوحة المتابعة الذكية للطلبة' : 'Student Analytics & Mastery'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {t.dashboardTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {t.dashboardSubtitle}
            </p>
          </div>

          {/* Quick Action / Demo Toggle */}
          <div className="flex items-center gap-2 flex-wrap">
            {totalQuizzesTaken === 0 && (
              <button
                id="btn-toggle-demo-stats"
                onClick={() => setShowDemoSample(!showDemoSample)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border shadow-sm ${
                  showDemoSample
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{showDemoSample ? (language === 'ar' ? 'إخفاء العينة التجريبية' : 'Hide Demo') : (language === 'ar' ? 'معاينة عينة إحصائيات' : 'Preview Demo Stats')}</span>
              </button>
            )}

            <button
              onClick={onNavigateToLectures}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-blue-500/30"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t.tabLectures}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Lectures Read */}
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
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500">/ {effectiveTotalLectures} {t.lectureCount}</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${readPercentage}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            <span>{language === 'ar' ? 'نسبة الإنجاز القرائي:' : 'Reading completion:'}</span>
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
                {quizSuccessRate >= 70 ? (language === 'ar' ? 'ممتاز' : 'Great') : (quizSuccessRate >= 50 ? (language === 'ar' ? 'جيد' : 'Good') : (language === 'ar' ? 'يحتاج مراجعة' : 'Needs review'))}
              </span>
            </div>
            {/* Progress Bar */}
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

        {/* KPI 3: Total Quizzes Taken */}
        <div id="kpi-quizzes-taken" className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-600 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t.totalQuizzesTakenCard}
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">{totalQuizzesTaken}</span>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500">{language === 'ar' ? 'اختبار مؤمن' : 'Quizzes'}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: totalQuizzesTaken > 0 ? '100%' : '0%' }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            <span>{language === 'ar' ? 'بيئة سرية مانعة للغش' : 'Live Proctored'}</span>
            <button
              onClick={onNavigateToQuizzes}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold cursor-pointer"
            >
              {language === 'ar' ? 'دخول الاختبارات ←' : 'Browse →'}
            </button>
          </div>
        </div>

        {/* KPI 4: Average Score */}
        <div id="kpi-average-score" className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-600 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t.averageScoreCard}
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">%{averageScore}</span>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                {averageScore >= 80 ? 'Grade A' : (averageScore >= 70 ? 'Grade B' : (averageScore >= 50 ? 'Grade C' : 'Review'))}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-blue-700 h-2 rounded-full transition-all duration-500"
                style={{ width: `${averageScore}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            <span>{language === 'ar' ? 'الدرجة التراكمية العامة' : 'Cumulative GPA average'}</span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">100 / {averageScore}</span>
          </div>
        </div>
      </div>

      {/* Recharts Section: Two Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Quiz Scores & Success Rate Bar Chart (2 columns wide on lg) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>{t.quizPerformanceChartTitle}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'ar'
                  ? 'رسم بياني يوضح نتائج الاختبارات التي خضتها ونسبة نجاحك مقارنة بحد الاجتياز (50%)'
                  : 'Bar chart showing scores of quizzes taken against the 50% passing threshold'}
              </p>
            </div>
            {totalQuizzesTaken > 0 && (
              <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-100 dark:border-blue-900/50">
                {totalQuizzesTaken} {language === 'ar' ? 'اختبارات منجزة' : 'Attempts'}
              </span>
            )}
          </div>

          {totalQuizzesTaken === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                <Award className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {language === 'ar' ? 'لا توجد بيانات اختبارات حتى الآن' : 'No quiz data recorded yet'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {t.noQuizzesTakenYet}
                </p>
              </div>
              <button
                onClick={() => setShowDemoSample(true)}
                className="px-4 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'تجربة عينة بيانية توضيحية' : 'Preview Sample Chart'}</span>
              </button>
            </div>
          ) : (
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quizScoresChartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    unit="%"
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-700">
                            <p className="font-bold text-sm text-blue-300">{data.fullName}</p>
                            <p className="text-slate-300">{language === 'ar' ? 'المادة:' : 'Subject:'} {data.subject}</p>
                            <p className="text-slate-300">{language === 'ar' ? 'التاريخ:' : 'Date:'} {data.date}</p>
                            <div className="pt-1 flex items-center justify-between gap-4 font-bold">
                              <span>{language === 'ar' ? 'الدرجة:' : 'Score:'} %{data.score}</span>
                              <span className={data.passed ? 'text-emerald-400' : 'text-rose-400'}>
                                {data.passed ? (language === 'ar' ? 'ناجح ✓' : 'Passed ✓') : (language === 'ar' ? 'لم يجتز ✗' : 'Failed ✗')}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine
                    y={50}
                    stroke="#10b981"
                    strokeDasharray="4 4"
                    label={{
                      value: language === 'ar' ? 'حد النجاح %50' : 'Pass 50%',
                      fill: '#10b981',
                      fontSize: 10,
                      position: 'top',
                    }}
                  />
                  <Bar
                    dataKey="score"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={45}
                  >
                    {quizScoresChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.passed ? '#2563eb' : '#f43f5e'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Chart footer legend */}
          <div className="flex items-center justify-center gap-6 pt-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-blue-600 inline-block" />
              <span>{language === 'ar' ? 'اختبار ناجح' : 'Passed Quiz'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" />
              <span>{language === 'ar' ? 'دون حد الاجتياز' : 'Below Passing'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-500 inline-block" />
              <span>{language === 'ar' ? 'خط حد النجاح (50%)' : 'Passing Threshold (50%)'}</span>
            </span>
          </div>
        </div>

        {/* Chart 2: Lectures Reading Donut & Progress (1 column on lg) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between transition-colors">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>{t.progressChartTitle}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'ar'
                ? 'نسبة المحاضرات التي أنجزت قراءتها من المجموع الكلي'
                : 'Ratio of lectures studied vs remaining course syllabus'}
            </p>
          </div>

          <div className="h-52 w-full flex items-center justify-center relative">
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
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0];
                      return (
                        <div className="bg-slate-900 text-white px-3 py-1.5 rounded-lg shadow-md text-xs font-bold">
                          {d.name}: {d.value} {t.lectureCount}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center percentage label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900 dark:text-white">%{readPercentage}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {language === 'ar' ? 'إنجاز' : 'Done'}
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span className="text-slate-600 dark:text-slate-400">{language === 'ar' ? 'مقروءة ومكتملة' : 'Read'}</span>
              </span>
              <span className="font-bold text-slate-900 dark:text-white">{readLecturesCount} {t.lectureCount}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span className="text-slate-600 dark:text-slate-400">{language === 'ar' ? 'متبقية للدراسة' : 'Remaining'}</span>
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {Math.max(0, effectiveTotalLectures - readLecturesCount)} {t.lectureCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lectures Study Checklist & Read Toggles */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>{language === 'ar' ? 'قائمة متابعة وتأكيد قراءة المحاضرات' : 'Lecture Study Checklist & Verification'}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'ar'
                ? 'حدد المحاضرات التي أكملت قراءتها ودراستها لتحديث إحصائياتك ومتابعة تقدمك'
                : 'Check off lectures you have completed reading to update your learning statistics'}
            </p>
          </div>

          <button
            onClick={onNavigateToLectures}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>{language === 'ar' ? 'عرض كافة الملازم والمحاضرات' : 'View all lectures'}</span>
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </button>
        </div>

        {lectures.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-2">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
              {language === 'ar' ? 'لا توجد ملازم مضافة حالياً' : 'No lectures uploaded yet'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {language === 'ar'
                ? 'عند إضافة الملازم الدراسية من قسم "المحاضرات والملازم"، ستتمكن من تسجيل قراءتها وتتبع نسبتك بدقة هنا.'
                : 'When you upload course materials, they will appear here to check off as studied.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {lectures.map(lec => {
              const isRead = readLectureIds.includes(lec.id);
              const subject = subjects.find(s => s.id === lec.subjectId);

              return (
                <div
                  key={lec.id}
                  id={`dashboard-lecture-row-${lec.id}`}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isRead
                      ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60 text-blue-950 dark:text-blue-200'
                      : 'bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => onToggleReadLecture(lec.id)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 shrink-0 transition-transform active:scale-95 cursor-pointer"
                      title={isRead ? t.markAsUnread : t.markAsRead}
                    >
                      {isRead ? (
                        <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 fill-blue-100 dark:fill-blue-950" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {subject && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
                            {subject.code}
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                          {t.lectureNumberPrefix} {lec.lectureNumber}
                        </span>
                      </div>
                      <h4 className={`text-xs sm:text-sm font-bold truncate mt-0.5 ${isRead ? 'text-blue-900 dark:text-blue-300 line-through decoration-blue-400' : 'text-slate-900 dark:text-slate-100'}`}>
                        {language === 'ar' ? lec.titleAr : lec.titleEn}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onToggleReadLecture(lec.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                        isRead
                          ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-300'
                      }`}
                    >
                      {isRead ? t.readStatus : t.markAsRead}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Quiz Attempts Table */}
      {attemptsList.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>{t.recentQuizAttemptsTitle}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'ar'
                  ? 'سجل درجاتك في كافة الاختبارات الهندسية ومعدل الإجابات الصحيحة وزمن الحل'
                  : 'History of your test attempts with percentages, accuracy, and timestamps'}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right rtl:text-right ltr:text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold border-y border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">{language === 'ar' ? 'الاختبار والمادة' : 'Quiz & Subject'}</th>
                  <th className="py-3 px-4 text-center">{t.score}</th>
                  <th className="py-3 px-4 text-center">{language === 'ar' ? 'النسبة المئوية' : 'Percentage'}</th>
                  <th className="py-3 px-4 text-center">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                  <th className="py-3 px-4 text-center">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {attemptsList.map((attempt) => (
                  <tr key={attempt.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {language === 'ar' ? attempt.quizTitleAr : attempt.quizTitleEn}
                      </div>
                      <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                        {language === 'ar' ? attempt.subjectNameAr : attempt.subjectNameEn}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                      {attempt.score} / {attempt.totalQuestions}
                    </td>
                    <td className="py-3 px-4 text-center font-bold">
                      <span className={`px-2 py-0.5 rounded-md font-mono ${
                        attempt.passed 
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300' 
                          : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300'
                      }`}>
                        %{attempt.percentage}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                        attempt.passed
                          ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300'
                      }`}>
                        {attempt.passed ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{language === 'ar' ? 'ناجح' : 'Passed'}</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>{language === 'ar' ? 'راسب' : 'Failed'}</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-500 dark:text-slate-400 font-mono">
                      {attempt.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
