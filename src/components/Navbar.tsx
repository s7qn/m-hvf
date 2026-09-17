import React from 'react';
import { 
  BookOpen, 
  FileText, 
  HelpCircle, 
  Calendar, 
  ShieldCheck, 
  Languages, 
  PlusCircle, 
  Cpu,
  Lock,
  Unlock, 
  BarChart3, 
  Moon, 
  Sun,
  ChevronDown,
  User,
  Flame
} from 'lucide-react';
import { Language, Stage, DeviceMode, StudentProfile } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { DeviceModeSelector } from './DeviceModeSelector';
import { DetectedDeviceType } from '../hooks/useDeviceDetector';

interface NavbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  activeTab: 'lectures' | 'summaries' | 'exams' | 'schedule' | 'quizzes' | 'dashboard';
  onTabChange: (tab: 'lectures' | 'summaries' | 'exams' | 'schedule' | 'quizzes' | 'dashboard') => void;
  selectedStage: Stage | 'all';
  onStageChange: (stage: Stage | 'all') => void;
  onOpenAdmin: () => void;
  isAdminUnlocked: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  deviceMode: DeviceMode;
  onDeviceModeChange: (mode: DeviceMode) => void;
  detectedType: DetectedDeviceType;
  profile?: StudentProfile;
  streakCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onLanguageChange,
  activeTab,
  onTabChange,
  selectedStage,
  onStageChange,
  onOpenAdmin,
  isAdminUnlocked,
  theme,
  onToggleTheme,
  deviceMode,
  onDeviceModeChange,
  detectedType,
  profile,
  streakCount,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0b1329]/95 backdrop-blur-md border-b border-blue-100 dark:border-slate-800 shadow-xs transition-colors duration-200">
      {/* 1. Mobile-Only Compact App Bar (< md) */}
      <div className="flex md:hidden items-center justify-between gap-2 px-3 py-2">
        {/* Brand Logo & Title */}
        <div 
          id="brand-logo-mobile"
          onClick={() => onTabChange('lectures')}
          className="flex items-center gap-2 cursor-pointer shrink-0"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 text-white flex items-center justify-center shadow-xs">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-black text-xs sm:text-sm text-blue-950 dark:text-white block leading-tight">
              {language === 'ar' ? 'منصة السيطرة' : 'CAE System'}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block leading-tight font-medium">
              هندسة الأتمتة
            </span>
          </div>
        </div>

        {/* Mobile Controls: Stage Dropdown Pill, Theme Toggle, Admin, Language */}
        <div className="flex items-center gap-1.5">
          {/* Student Profile Quick Access */}
          <button
            id="mobile-btn-profile"
            type="button"
            onClick={() => onTabChange('dashboard')}
            className={`px-2 py-1.5 rounded-xl border transition-colors shadow-2xs cursor-pointer flex items-center gap-1 ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white border-blue-700'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
            title="لوحة إحصائياتي الخاصة (محفوظة على جهازي)"
          >
            <div className="w-4 h-4 rounded-md bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center text-[9px] font-black">
              {profile?.name ? profile.name.slice(0, 1) : 'ط'}
            </div>
            {streakCount !== undefined && streakCount > 0 && (
              <span className="text-[10px] font-black text-amber-500">
                🔥{streakCount}
              </span>
            )}
          </button>

          {/* Fast Stage Selector Pill */}
          <div className="relative flex items-center">
            <select
              id="mobile-stage-select-pill"
              value={selectedStage}
              onChange={(e) => onStageChange(e.target.value === 'all' ? 'all' : Number(e.target.value) as Stage)}
              className="text-[11px] font-black bg-blue-50 dark:bg-slate-800 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-slate-700 rounded-xl px-2 py-1.5 outline-hidden cursor-pointer shadow-2xs"
            >
              <option value="all">{language === 'ar' ? 'المراحل' : 'All'}</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </div>

          {/* Theme Toggle */}
          <button
            id="mobile-btn-theme"
            type="button"
            onClick={onToggleTheme}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-blue-600 shadow-2xs cursor-pointer"
            title={theme === 'dark' ? t.lightMode : t.darkMode}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Admin Unlock Icon */}
          <button
            id="mobile-btn-admin"
            type="button"
            onClick={onOpenAdmin}
            className={`p-1.5 rounded-xl border transition-colors shadow-2xs cursor-pointer ${
              isAdminUnlocked
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border-emerald-300'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
            title="إضافة ملزمة (خاص بي)"
          >
            {isAdminUnlocked ? (
              <Unlock className="w-4 h-4 text-emerald-500" />
            ) : (
              <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            )}
          </button>

          {/* Language Switch */}
          <button
            id="mobile-btn-lang"
            type="button"
            onClick={() => onLanguageChange(language === 'ar' ? 'en' : 'ar')}
            className="px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-black shadow-2xs cursor-pointer"
            title="Language"
          >
            {language === 'ar' ? 'EN' : 'ع'}
          </button>
        </div>
      </div>

      {/* 2. Desktop Navigation (>= md) */}
      <div className="hidden md:block">
        {/* Top Banner / Department bar & Device Mode Controls */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 dark:from-[#0d1b3e] dark:via-[#11224d] dark:to-[#172554] text-white text-xs py-1 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-xs truncate">{t.departmentSub}</span>
            </div>

            {/* Device Selector: Automatic detection + manual selector (Phone, iPad, PC) */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-blue-200">
                {t.deviceModeLabel}:
              </span>
              <DeviceModeSelector
                deviceMode={deviceMode}
                onDeviceModeChange={onDeviceModeChange}
                detectedType={detectedType}
                language={language}
                compact
              />
            </div>
          </div>
        </div>

        {/* Main Navbar Desktop */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 space-y-2.5">
          {/* Row 1: Brand / Title on right, Admin Mode & Language Switcher on left */}
          <div className="flex items-center justify-between gap-4">
            {/* Logo & Brand */}
            <div 
              id="brand-logo"
              onClick={() => onTabChange('lectures')}
              className="flex items-center gap-3 cursor-pointer group shrink-0"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black tracking-tight text-blue-900 dark:text-white">
                    {t.platformName}
                  </h1>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80">
                    CAE System
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-1">
                  {t.departmentTitle}
                </p>
              </div>
            </div>

            {/* Dedicated Utility Controls (Dark Mode Toggle, Admin Mode, Language) */}
            <div className="flex items-center gap-2.5 shrink-0">
              {/* Student Personal Profile Button */}
              <button
                id="btn-nav-student-profile"
                type="button"
                onClick={() => onTabChange('dashboard')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 text-white border-blue-700 shadow-md shadow-blue-500/20'
                    : 'bg-white dark:bg-slate-800 hover:bg-blue-50/70 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                }`}
                title="لوحة إحصائياتي الخاصة (محفوظة على جهازي فقط)"
              >
                <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                  {profile?.name ? profile.name.slice(0, 1) : 'ط'}
                </div>
                <span className="font-bold truncate max-w-[120px]">
                  {profile?.name || (language === 'ar' ? 'إحصائياتي' : 'My Stats')}
                </span>
                {streakCount !== undefined && streakCount > 0 && (
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center gap-0.5 shrink-0">
                    🔥 {streakCount}
                  </span>
                )}
              </button>

              {/* Dark Mode Toggle Button */}
              <button
                id="btn-theme-toggle"
                type="button"
                onClick={onToggleTheme}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                title={theme === 'dark' ? t.lightMode : t.darkMode}
                aria-label={theme === 'dark' ? t.lightMode : t.darkMode}
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-bold">{t.lightMode}</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-slate-600 shrink-0" />
                    <span className="font-bold">{t.darkMode}</span>
                  </>
                )}
              </button>

              {/* Admin add notes button */}
              <button
                id="btn-admin-panel"
                onClick={onOpenAdmin}
                className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                  isAdminUnlocked
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/60'
                    : 'bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-600'
                }`}
                title="خاص بي فقط لإضافة الملازم والمحاضرات"
              >
                {isAdminUnlocked ? (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{t.adminModeActive}</span>
                    <PlusCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>{t.adminButton}</span>
                  </>
                )}
              </button>

              {/* Language Switcher */}
              <button
                id="btn-lang-toggle"
                onClick={() => onLanguageChange(language === 'ar' ? 'en' : 'ar')}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                title="تغيير لغة المنصة"
              >
                <Languages className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="font-bold">{language === 'ar' ? 'EN' : 'العربية'}</span>
              </button>
            </div>
          </div>

          {/* Row 2: Dedicated Navigation Tabs Bar (Desktop) */}
          <div className="bg-slate-100/90 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none shadow-xs">
            <button
              id="nav-tab-lectures"
              onClick={() => onTabChange('lectures')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                activeTab === 'lectures'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-white/80 dark:hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>{t.tabLectures}</span>
            </button>

            <button
              id="nav-tab-summaries"
              onClick={() => onTabChange('summaries')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                activeTab === 'summaries'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-white/80 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>{t.tabSummaries}</span>
            </button>

            <button
              id="nav-tab-exams"
              onClick={() => onTabChange('exams')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                activeTab === 'exams'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-white/80 dark:hover:bg-slate-800'
              }`}
            >
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span>{t.tabExams}</span>
            </button>

            <button
              id="nav-tab-schedule"
              onClick={() => onTabChange('schedule')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                activeTab === 'schedule'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-white/80 dark:hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>{t.tabSchedule}</span>
            </button>

            {/* Prominent Quizzes Tab with extra clarity, glowing pulse & shield badge */}
            <button
              id="nav-tab-quizzes"
              onClick={() => onTabChange('quizzes')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 whitespace-nowrap transition-all shrink-0 cursor-pointer relative ${
                activeTab === 'quizzes'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30 ring-2 ring-indigo-300 dark:ring-indigo-700'
                  : 'bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-750 text-indigo-950 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-900/60 shadow-xs'
              }`}
            >
              <ShieldCheck className={`w-4 h-4 shrink-0 ${activeTab === 'quizzes' ? 'text-indigo-200' : 'text-indigo-600 dark:text-indigo-400'}`} />
              <span>{t.tabQuizzes}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-black tracking-wide ${
                activeTab === 'quizzes' 
                  ? 'bg-white/20 text-white' 
                  : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300'
              }`}>
                {language === 'ar' ? 'مؤمن' : 'Secure'}
              </span>
            </button>

            {/* Academic Dashboard Tab */}
            <button
              id="nav-tab-dashboard"
              onClick={() => onTabChange('dashboard')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                  : 'text-blue-900 dark:text-blue-300 bg-white/70 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-750 border border-blue-200/70 dark:border-slate-700 shadow-xs'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>{t.tabDashboard}</span>
            </button>
          </div>

          {/* Stages Filter Bar (Desktop) */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 dark:text-slate-400 font-semibold ml-1">
                {language === 'ar' ? 'المرحلة:' : 'Stage:'}
              </span>
              <button
                id="filter-stage-all"
                onClick={() => onStageChange('all')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  selectedStage === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {t.allStages}
              </button>
              <button
                id="filter-stage-1"
                onClick={() => onStageChange(1)}
                className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  selectedStage === 1
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {t.stage1}
              </button>
              <button
                id="filter-stage-2"
                onClick={() => onStageChange(2)}
                className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  selectedStage === 2
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {t.stage2}
              </button>
              <button
                id="filter-stage-3"
                onClick={() => onStageChange(3)}
                className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  selectedStage === 3
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {t.stage3}
              </button>
              <button
                id="filter-stage-4"
                onClick={() => onStageChange(4)}
                className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  selectedStage === 4
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {t.stage4}
              </button>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold border border-blue-100 dark:border-blue-900/60">
                ⚡ تحكم وأتمتة صناعية
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

