import React, { useState } from 'react';
import { 
  BookOpen, 
  FileText, 
  ShieldCheck, 
  Calendar, 
  Grid, 
  BarChart3, 
  HelpCircle, 
  X, 
  Moon, 
  Sun, 
  Languages, 
  Lock, 
  Unlock, 
  Smartphone, 
  Tablet, 
  Monitor, 
  Sparkles,
  GraduationCap,
  ChevronRight,
  Check
} from 'lucide-react';
import { Stage, Language, DeviceMode, StudentProfile } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { DetectedDeviceType } from '../hooks/useDeviceDetector';

interface MobileBottomNavProps {
  activeTab: 'lectures' | 'summaries' | 'exams' | 'schedule' | 'quizzes' | 'dashboard';
  onTabChange: (tab: 'lectures' | 'summaries' | 'exams' | 'schedule' | 'quizzes' | 'dashboard') => void;
  language: Language;
  selectedStage: Stage | 'all';
  onStageChange: (stage: Stage | 'all') => void;
  isAdminUnlocked: boolean;
  onOpenAdmin: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLanguageChange: (lang: Language) => void;
  deviceMode: DeviceMode;
  onDeviceModeChange: (mode: DeviceMode) => void;
  detectedType: DetectedDeviceType;
  profile?: StudentProfile;
  streakCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  language,
  selectedStage,
  onStageChange,
  isAdminUnlocked,
  onOpenAdmin,
  theme,
  onToggleTheme,
  onLanguageChange,
  deviceMode,
  onDeviceModeChange,
  detectedType,
  profile,
  streakCount,
}) => {
  const t = TRANSLATIONS[language];
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showStageMenu, setShowStageMenu] = useState(false);

  const isMoreActive = activeTab === 'dashboard' || activeTab === 'exams';

  return (
    <>
      {/* Sleek Mobile Bottom Navigation Bar */}
      <nav 
        id="mobile-bottom-navigation"
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-[#0b1329]/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)] pb-safe"
      >
        <div className="grid grid-cols-5 items-center h-16 px-1 max-w-lg mx-auto">
          {/* 1. Lectures */}
          <button
            id="mobile-nav-lectures"
            type="button"
            onClick={() => {
              onTabChange('lectures');
              setShowMoreMenu(false);
            }}
            className={`flex flex-col items-center justify-center h-full relative transition-all cursor-pointer ${
              activeTab === 'lectures'
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {activeTab === 'lectures' && (
              <span className="absolute top-0 w-8 h-1 rounded-full bg-blue-600 dark:bg-blue-400" />
            )}
            <BookOpen className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">{t.tabLectures}</span>
          </button>

          {/* 2. Summaries */}
          <button
            id="mobile-nav-summaries"
            type="button"
            onClick={() => {
              onTabChange('summaries');
              setShowMoreMenu(false);
            }}
            className={`flex flex-col items-center justify-center h-full relative transition-all cursor-pointer ${
              activeTab === 'summaries'
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {activeTab === 'summaries' && (
              <span className="absolute top-0 w-8 h-1 rounded-full bg-blue-600 dark:bg-blue-400" />
            )}
            <FileText className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">{t.tabSummaries}</span>
          </button>

          {/* 3. Secure Quizzes - Centered with prominent badge */}
          <button
            id="mobile-nav-quizzes"
            type="button"
            onClick={() => {
              onTabChange('quizzes');
              setShowMoreMenu(false);
            }}
            className="flex flex-col items-center justify-center h-full relative transition-all cursor-pointer group"
          >
            {activeTab === 'quizzes' && (
              <span className="absolute top-0 w-10 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400" />
            )}
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              activeTab === 'quizzes'
                ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30'
                : 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60'
            }`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className={`text-[10px] tracking-tight mt-0.5 ${
              activeTab === 'quizzes' ? 'font-black text-indigo-600 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400'
            }`}>
              {t.tabQuizzes}
            </span>
          </button>

          {/* 4. Schedule */}
          <button
            id="mobile-nav-schedule"
            type="button"
            onClick={() => {
              onTabChange('schedule');
              setShowMoreMenu(false);
            }}
            className={`flex flex-col items-center justify-center h-full relative transition-all cursor-pointer ${
              activeTab === 'schedule'
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {activeTab === 'schedule' && (
              <span className="absolute top-0 w-8 h-1 rounded-full bg-blue-600 dark:bg-blue-400" />
            )}
            <Calendar className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">{t.tabSchedule}</span>
          </button>

          {/* 5. More (Dashboard, Exams, Settings) */}
          <button
            id="mobile-nav-more"
            type="button"
            onClick={() => setShowMoreMenu(true)}
            className={`flex flex-col items-center justify-center h-full relative transition-all cursor-pointer ${
              isMoreActive || showMoreMenu
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {(isMoreActive || showMoreMenu) && (
              <span className="absolute top-0 w-8 h-1 rounded-full bg-blue-600 dark:bg-blue-400" />
            )}
            <div className="relative">
              <Grid className="w-5 h-5 mb-0.5" />
              {isMoreActive && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
              )}
            </div>
            <span className="text-[10px] tracking-tight">
              {language === 'ar' ? 'المزيد' : 'More'}
            </span>
          </button>
        </div>
      </nav>

      {/* Modern Slide-Up Action Sheet for "More" */}
      {showMoreMenu && (
        <div 
          id="mobile-more-sheet-backdrop"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end justify-center md:hidden"
          onClick={() => setShowMoreMenu(false)}
        >
          <div 
            id="mobile-more-sheet"
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 shadow-2xl p-5 pb-8 space-y-4 animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto" />

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {language === 'ar' ? 'القائمة والأقسام الإضافية' : 'More Features & Settings'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t.departmentSub}
                </p>
              </div>
              <button
                type="button"
                id="btn-close-more-sheet"
                onClick={() => setShowMoreMenu(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Student Personal Profile Card in Mobile Sheet */}
            <div
              id="mobile-student-profile-banner"
              onClick={() => {
                onTabChange('dashboard');
                setShowMoreMenu(false);
              }}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between gap-3 shadow-md cursor-pointer border border-blue-700/50 hover:opacity-95 transition-opacity"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center text-sm font-black shadow-xs">
                  {profile?.name ? profile.name.slice(0, 1) : 'ط'}
                </div>
                <div>
                  <h4 className="text-xs font-black text-white leading-tight">
                    {profile?.name || (language === 'ar' ? 'طالب هندسة السيطرة' : 'Student Profile')}
                  </h4>
                  <p className="text-[10px] text-blue-200 mt-0.5">
                    {language === 'ar' ? `المرحلة ${profile?.stage || 1} • شعبة ${profile?.group || 'A'}` : `Stage ${profile?.stage || 1} • Group ${profile?.group || 'A'}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {streakCount !== undefined && streakCount > 0 && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                    🔥 {streakCount} {language === 'ar' ? 'أيام' : 'days'}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-blue-300 rtl:rotate-180" />
              </div>
            </div>

            {/* Quick Navigation Cards */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Dashboard */}
              <button
                type="button"
                id="more-btn-dashboard"
                onClick={() => {
                  onTabChange('dashboard');
                  setShowMoreMenu(false);
                }}
                className={`p-3 rounded-2xl border text-start flex items-center gap-3 transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-100'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-black block">{t.tabDashboard}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {language === 'ar' ? 'الإحصائيات ونسب التقدم' : 'Progress & Stats'}
                  </span>
                </div>
              </button>

              {/* Exams Archive */}
              <button
                type="button"
                id="more-btn-exams"
                onClick={() => {
                  onTabChange('exams');
                  setShowMoreMenu(false);
                }}
                className={`p-3 rounded-2xl border text-start flex items-center gap-3 transition-all cursor-pointer ${
                  activeTab === 'exams'
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-100'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-black block">{t.tabExams}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {language === 'ar' ? 'السنوات السابقة' : 'Past Exams'}
                  </span>
                </div>
              </button>
            </div>

            {/* Stages Fast Switcher */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>{language === 'ar' ? 'المرحلة الدراسية:' : 'Academic Stage:'}</span>
                </span>
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">
                  {selectedStage === 'all' 
                    ? t.allStages 
                    : (language === 'ar' ? `المرحلة ${selectedStage}` : `Year ${selectedStage}`)}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 text-xs font-bold">
                {(['all', 1, 2, 3, 4] as (Stage | 'all')[]).map((stg) => {
                  const isCurrent = selectedStage === stg;
                  return (
                    <button
                      key={stg}
                      type="button"
                      onClick={() => onStageChange(stg)}
                      className={`py-1.5 rounded-xl text-center transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-blue-600 text-white shadow-xs font-black'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {stg === 'all' ? (language === 'ar' ? 'الكل' : 'All') : (language === 'ar' ? `م ${stg}` : `Y${stg}`)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions Row: Theme, Lang, Admin */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {/* Dark Mode */}
              <button
                type="button"
                id="more-btn-toggle-theme"
                onClick={onToggleTheme}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-blue-600 text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600" />
                )}
                <span className="text-[11px]">{theme === 'dark' ? t.lightMode : t.darkMode}</span>
              </button>

              {/* Language */}
              <button
                type="button"
                id="more-btn-toggle-lang"
                onClick={() => onLanguageChange(language === 'ar' ? 'en' : 'ar')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-blue-600 text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer"
              >
                <Languages className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-[11px]">{language === 'ar' ? 'English' : 'العربية'}</span>
              </button>

              {/* Admin Mode */}
              <button
                type="button"
                id="more-btn-admin"
                onClick={() => {
                  setShowMoreMenu(false);
                  onOpenAdmin();
                }}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  isAdminUnlocked
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                }`}
              >
                {isAdminUnlocked ? (
                  <Unlock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                )}
                <span className="text-[11px]">
                  {isAdminUnlocked ? (language === 'ar' ? 'مفعل' : 'Active') : (language === 'ar' ? 'إضافة ملزمة' : 'Admin')}
                </span>
              </button>
            </div>

            {/* Credits Footer */}
            <div className="pt-2 text-center text-[11px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800">
              صنع بواسطة مصطفى احمد وحسن علوان • هندسة السيطرة والأتمتة
            </div>
          </div>
        </div>
      )}
    </>
  );
};
