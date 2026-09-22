import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Download, 
  ShieldCheck, 
  FileText, 
  User, 
  Calendar, 
  Eye,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  FolderOpen,
  CheckCircle2,
  BarChart3,
  TrendingUp,
  Award,
  CheckSquare,
  Square,
  Check,
  X
} from 'lucide-react';
import { Lecture, Subject, Stage, Language, QuizAttempt } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface LecturesViewProps {
  lectures: Lecture[];
  subjects: Subject[];
  selectedStage: Stage | 'all';
  language: Language;
  onSelectLectureToView: (lecture: Lecture) => void;
  onStartQuiz: (lecture: Lecture) => void;
  onOpenAddCustomLecture?: (subjectId?: string) => void;
  onDeleteLecture?: (lectureId: string) => void;
  readLectureIds?: string[];
  onToggleReadLecture?: (lectureId: string) => void;
  quizAttempts?: Record<string, QuizAttempt>;
  onOpenDashboard?: () => void;
  isAdminUnlocked?: boolean;
}

export const LecturesView: React.FC<LecturesViewProps> = ({
  lectures,
  subjects,
  selectedStage,
  language,
  onSelectLectureToView,
  onStartQuiz,
  onOpenAddCustomLecture,
  onDeleteLecture,
  readLectureIds = [],
  onToggleReadLecture,
  quizAttempts = {},
  onOpenDashboard,
  isAdminUnlocked = false,
}) => {
  const t = TRANSLATIONS[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [deletingLectureId, setDeletingLectureId] = useState<string | null>(null);

  // Filter subjects by stage
  const visibleSubjects = subjects.filter(s => selectedStage === 'all' || s.stage === selectedStage);

  // Count lectures per subject
  const getSubjectLectureCount = (subjectId: string) => {
    return lectures.filter(l => l.subjectId === subjectId).length;
  };

  // Filter lectures
  const filteredLectures = lectures.filter(lec => {
    // Stage filter
    if (selectedStage !== 'all' && lec.stage !== selectedStage) {
      return false;
    }
    // Subject filter
    if (selectedSubjectFilter !== 'all' && lec.subjectId !== selectedSubjectFilter) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (lec.titleAr + ' ' + lec.titleEn).toLowerCase().includes(q);
      const matchDesc = (lec.descriptionAr + ' ' + lec.descriptionEn).toLowerCase().includes(q);
      const matchInstructor = (lec.instructorAr + ' ' + lec.instructorEn).toLowerCase().includes(q);
      return matchTitle || matchDesc || matchInstructor;
    }
    return true;
  });

  const getSubject = (subjectId: string) => {
    return subjects.find(s => s.id === subjectId);
  };

  const currentSelectedSubject = selectedSubjectFilter !== 'all' 
    ? subjects.find(s => s.id === selectedSubjectFilter) 
    : undefined;

  const attemptsList = Object.values(quizAttempts) as QuizAttempt[];
  const passedAttemptsCount = attemptsList.filter((a: QuizAttempt) => a.passed).length;
  const quizSuccessRate = attemptsList.length > 0 ? Math.round((passedAttemptsCount / attemptsList.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Student Quick Stats Mini-Dashboard */}
      {lectures.length > 0 && (
        <div id="student-quick-dashboard-banner" className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-3.5 sm:p-5 shadow-xs border border-blue-800 transition-all">
          {/* Mobile view: compact 1-row summary */}
          <div className="flex md:hidden items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 text-blue-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white">
                    {readLectureIds.length}/{lectures.length}
                  </span>
                  <span className="text-[10px] text-blue-200">
                    {language === 'ar' ? 'مقروءة' : 'read'}
                  </span>
                  <span className="text-[10px] font-bold text-blue-300">
                    (%{lectures.length > 0 ? Math.round((readLectureIds.length / lectures.length) * 100) : 0})
                  </span>
                </div>
                <div className="w-24 bg-white/20 rounded-full h-1.5 mt-1 overflow-hidden">
                  <div 
                    className="bg-blue-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${lectures.length > 0 ? (readLectureIds.length / lectures.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {attemptsList.length > 0 && (
                <span className="text-[11px] font-black text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-2 py-1 rounded-lg">
                  %{quizSuccessRate} {language === 'ar' ? 'نجاح' : 'pass'}
                </span>
              )}

              {onOpenDashboard && (
                <button
                  type="button"
                  id="btn-open-full-dashboard-from-lectures-mobile"
                  onClick={onOpenDashboard}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1 shrink-0"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'التقدم' : 'Stats'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Desktop view: full stats layout */}
          <div className="hidden md:flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">
                    {language === 'ar' ? 'إحصائيات الإنجاز الأكاديمي' : 'Academic Progress Overview'}
                  </h3>
                  <span className="text-[10px] bg-blue-500/30 px-2 py-0.5 rounded-full border border-blue-400/30 font-bold text-blue-200">
                    Dashboard
                  </span>
                </div>
                <p className="text-xs text-blue-200">
                  {language === 'ar' 
                    ? `${readLectureIds.length} من ${lectures.length} محاضرة مقروءة`
                    : `${readLectureIds.length} of ${lectures.length} lectures studied`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 justify-end flex-wrap">
              {/* Reading Mini Progress */}
              <div className="text-right rtl:text-right ltr:text-left space-y-1">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-slate-300">{language === 'ar' ? 'المقروءة:' : 'Read:'}</span>
                  <span className="font-bold text-white">
                    %{lectures.length > 0 ? Math.round((readLectureIds.length / lectures.length) * 100) : 0}
                  </span>
                </div>
                <div className="w-36 bg-white/20 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-blue-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${lectures.length > 0 ? (readLectureIds.length / lectures.length) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Quiz Rate */}
              {attemptsList.length > 0 && (
                <div className="text-right rtl:text-right ltr:text-left">
                  <span className="text-xs text-slate-300 block">{language === 'ar' ? 'نسبة النجاح:' : 'Success rate:'}</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    %{quizSuccessRate}
                  </span>
                </div>
              )}

              {onOpenDashboard && (
                <button
                  type="button"
                  id="btn-open-full-dashboard-from-lectures"
                  onClick={onOpenDashboard}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-xs"
                >
                  <BarChart3 className="w-4 h-4 text-blue-200" />
                  <span>{language === 'ar' ? 'لوحة الإحصائيات' : 'Open Dashboard'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-blue-100 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <h2 className="text-xl sm:text-2xl font-black text-blue-950 dark:text-white">
                {t.tabLectures}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {language === 'ar' 
                ? 'ملفات المحاضرات والملازم التخصصية مع اختبار سري مؤمن خاص بكل محاضرة وإمكانية إضافة ملازم مخصصة.'
                : 'Official academic lecture notes and course handouts with individual attached quizzes and custom note additions.'}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Live Shared Sync Indicator */}
            <div 
              id="live-sync-indicator-pill"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-black shadow-2xs"
              title={language === 'ar' ? 'المحاضرات والملازم متزامنة وتظهر لجميع الطلاب على جميع الأجهزة' : 'All materials synced and visible to all students'}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{language === 'ar' ? 'مزامنة مباشرة للكل' : 'Live for All Students'}</span>
            </div>

            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/60 px-3.5 py-2 rounded-xl border border-blue-100 dark:border-blue-900/50 text-xs font-bold text-blue-800 dark:text-blue-300">
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{filteredLectures.length} {t.lectureCount}</span>
            </div>

            {onOpenAddCustomLecture && (
              <button
                id="btn-add-custom-lecture-header"
                onClick={() => onOpenAddCustomLecture(selectedSubjectFilter !== 'all' ? selectedSubjectFilter : undefined)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addCustomLecture}</span>
              </button>
            )}
          </div>
        </div>

        {/* Search & Subject Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {/* Search bar */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 right-3.5 rtl:right-3.5 ltr:left-3.5" />
            <input
              id="search-lectures-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full py-2.5 pr-10 pl-4 rtl:pr-10 rtl:pl-4 ltr:pl-10 ltr:pr-4 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden text-xs sm:text-sm bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          {/* Subject Filter */}
          <div>
            <select
              id="filter-subject-dropdown"
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              <option value="all">{t.allSubjects}</option>
              {visibleSubjects.map(s => {
                const count = getSubjectLectureCount(s.id);
                return (
                  <option key={s.id} value={s.id}>
                    {s.code} - {language === 'ar' ? s.nameAr : s.nameEn} ({count === 0 ? (language === 'ar' ? 'بدون ملازم' : '0 notes') : `${count} ${language === 'ar' ? 'ملازم' : 'notes'}`})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Quick Subject Chips Bar */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none text-xs">
            <button
              onClick={() => setSelectedSubjectFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                selectedSubjectFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {t.allSubjects}
            </button>

            {visibleSubjects.map(s => {
              const count = getSubjectLectureCount(s.id);
              const isSelected = selectedSubjectFilter === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSubjectFilter(s.id)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{language === 'ar' ? s.nameAr : s.nameEn}</span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                    count === 0 
                      ? (isSelected ? 'bg-blue-800 text-blue-100' : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300')
                      : (isSelected ? 'bg-blue-800 text-blue-100' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300')
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Empty State or Lectures Grid */}
      {filteredLectures.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 sm:p-12 text-center border border-blue-100 dark:border-slate-800 space-y-4 shadow-xs transition-colors">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto border border-blue-200 dark:border-slate-700">
            <FolderOpen className="w-8 h-8" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100">
              {currentSelectedSubject 
                ? (language === 'ar' 
                    ? `مادة «${currentSelectedSubject.nameAr}» بدون ملازم حالياً`
                    : `"${currentSelectedSubject.nameEn}" currently has no handouts`)
                : t.noLecturesFound}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {currentSelectedSubject 
                ? (language === 'ar'
                    ? 'تم إعداد هذه المادة بدون أي ملازم وهمية بناءً على طلبك. يمكنك الآن إضافة أول ملزمة أو محاضرة مخصصة لها مباشرة مع الاختبار الخاص بها.'
                    : 'This course has no pre-filled notes. You can now add your own custom lecture notes and quizzes directly.')
                : (language === 'ar'
                    ? 'المواد الدراسية خالية حالياً من الملازم الوهمية. استخدم زر الإضافة لرفع أو تسجيل ملازمك الخاصة.'
                    : 'Subjects currently have no fake handouts. Use the button below to add custom notes.')}
            </p>
          </div>

          {onOpenAddCustomLecture && (
            <div className="pt-2">
              <button
                id="btn-add-custom-lecture-empty-state"
                onClick={() => onOpenAddCustomLecture(currentSelectedSubject?.id)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-black shadow-md shadow-blue-500/20 inline-flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>
                  {currentSelectedSubject 
                    ? (language === 'ar' 
                        ? `إضافة ملزمة مخصصة لمادة ${currentSelectedSubject.nameAr}`
                        : `Add Custom Handout for ${currentSelectedSubject.nameEn}`)
                    : t.addCustomLecture}
                </span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredLectures.map((lecture) => {
            const subject = getSubject(lecture.subjectId);
            const isRead = readLectureIds.includes(lecture.id);

            return (
              <div
                key={lecture.id}
                id={`lecture-card-${lecture.id}`}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-blue-100/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-500 shadow-xs hover:shadow-md transition-all duration-200 p-5 sm:p-6 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 text-[11px] font-black border border-blue-200 dark:border-blue-800/80">
                        {t.lectureNumberPrefix} {lecture.lectureNumber}
                      </span>
                      {subject && (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold">
                          {subject.code} — {language === 'ar' ? `المرحلة ${lecture.stage}` : `Year ${lecture.stage}`}
                        </span>
                      )}
                      {lecture.isCustom && (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 text-[11px] font-black flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          <span>{language === 'ar' ? 'ملزمة مخصصة' : 'Custom Note'}</span>
                        </span>
                      )}
                      {/* Reading Status Pill */}
                      {isRead ? (
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>{t.readStatus}</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-medium">
                          {t.unreadStatus}
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{lecture.uploadDate}</span>
                    </span>
                  </div>

                  {/* Title & Subject */}
                  <div>
                    {subject && (
                      <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">
                        {language === 'ar' ? subject.nameAr : subject.nameEn}
                      </p>
                    )}
                    <h3 
                      onClick={() => onSelectLectureToView(lecture)}
                      className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors cursor-pointer"
                    >
                      {language === 'ar' ? lecture.titleAr : lecture.titleEn}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {language === 'ar' ? lecture.descriptionAr : lecture.descriptionEn}
                  </p>

                  {/* Summary Bullets Preview */}
                  <div className="bg-slate-50/80 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    <span className="font-bold text-blue-950 dark:text-blue-200 block text-[11px]">
                      {t.keyPoints}
                    </span>
                    {(language === 'ar' ? lecture.summaryPointsAr : lecture.summaryPointsEn).slice(0, 2).map((point, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-slate-600 dark:text-slate-300">
                        <span className="w-1 h-1 rounded-full bg-blue-500 mt-2 shrink-0" />
                        <span className="line-clamp-1">{point}</span>
                      </div>
                    ))}
                  </div>

                  {/* Instructor & File Size info */}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>{language === 'ar' ? lecture.instructorAr : lecture.instructorEn}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <FileText className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      <span>{lecture.fileSize}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Buttons: Preview, Download, Delete if custom, and Direct Secure Quiz Launch */}
                <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <button
                      id={`btn-view-lec-${lecture.id}`}
                      onClick={() => onSelectLectureToView(lecture)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title={t.viewLecture}
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>{t.viewLecture}</span>
                    </button>

                    {onToggleReadLecture && (
                      <button
                        type="button"
                        id={`btn-toggle-read-${lecture.id}`}
                        onClick={() => onToggleReadLecture(lecture.id)}
                        className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
                          isRead
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/60'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
                        }`}
                        title={isRead ? t.markAsUnread : t.markAsRead}
                      >
                        {isRead ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    )}

                    <button
                      id={`btn-download-lec-${lecture.id}`}
                      onClick={() => {
                        if (lecture.fileUrl) {
                          const a = document.createElement('a');
                          a.href = lecture.fileUrl;
                          a.download = `${lecture.titleAr || 'Lecture'}.pdf`;
                          a.target = '_blank';
                          a.click();
                          return;
                        }
                        const blob = new Blob([
                          `منصة سيطرة | المحاضرة رقم ${lecture.lectureNumber}\n${lecture.titleAr}\nالأستاذ: ${lecture.instructorAr}\n\nصنع بواسطة مصطفى احمد وحسن علوان`
                        ], { type: 'text/plain;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `Lecture-${lecture.lectureNumber}.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-xs transition-colors cursor-pointer"
                      title={t.downloadPdf}
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    {(lecture.isCustom || isAdminUnlocked) && onDeleteLecture && (
                      deletingLectureId === lecture.id ? (
                        <div className="flex items-center gap-1 p-1 bg-red-50 dark:bg-red-950/80 border border-red-300 dark:border-red-800 rounded-xl shadow-xs animate-fadeIn">
                          <span className="text-[11px] font-bold text-red-700 dark:text-red-300 px-1 whitespace-nowrap">
                            {language === 'ar' ? 'حذف؟' : 'Delete?'}
                          </span>
                          <button
                            id={`btn-confirm-delete-${lecture.id}`}
                            onClick={() => {
                              onDeleteLecture(lecture.id);
                              setDeletingLectureId(null);
                            }}
                            className="p-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
                            title={language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingLectureId(null)}
                            className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                            title={language === 'ar' ? 'إلغاء' : 'Cancel'}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          id={`btn-delete-lec-${lecture.id}`}
                          onClick={() => setDeletingLectureId(lecture.id)}
                          className="p-2 rounded-xl border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-xs transition-colors cursor-pointer"
                          title={language === 'ar' ? 'إزالة هذه الملزمة' : 'Delete Lecture'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )
                    )}
                  </div>

                  {/* Specifically requested: "ويكون الاختبار على كل ملف من ملفات المحاضرات المرسلة" */}
                  <button
                    id={`btn-start-quiz-${lecture.id}`}
                    onClick={() => onStartQuiz(lecture)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-blue-200" />
                    <span>{t.startQuiz}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

