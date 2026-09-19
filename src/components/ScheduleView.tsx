import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  BookOpen, 
  Plus, 
  Lock, 
  Trash2,
  Grid,
  CalendarDays,
  Printer,
  RotateCcw,
  Building2,
  FlaskConical,
  Sparkles,
  Info
} from 'lucide-react';
import { ScheduleItem, Stage, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface ScheduleViewProps {
  schedule: ScheduleItem[];
  selectedStage: Stage | 'all';
  language: Language;
  isAdminUnlocked?: boolean;
  onOpenAddModal?: () => void;
  onDeleteScheduleItem?: (id: string) => void;
  onResetSchedule?: () => void;
}

const DAYS = [
  { index: 0, nameAr: 'الأحد', nameEn: 'Sunday' },
  { index: 1, nameAr: 'الاثنين', nameEn: 'Monday' },
  { index: 2, nameAr: 'الثلاثاء', nameEn: 'Tuesday' },
  { index: 3, nameAr: 'الأربعاء', nameEn: 'Wednesday' },
  { index: 4, nameAr: 'الخميس', nameEn: 'Thursday' },
];

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  schedule,
  selectedStage,
  language,
  isAdminUnlocked = false,
  onOpenAddModal,
  onDeleteScheduleItem,
  onResetSchedule,
}) => {
  const t = TRANSLATIONS[language];
  const [viewMode, setViewMode] = useState<'grid' | 'cards'>('grid');
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    const today = new Date().getDay(); // 0 is Sunday
    return today >= 0 && today <= 4 ? today : 0;
  });
  const [selectedGroup, setSelectedGroup] = useState<'A' | 'B' | 'الكل'>('الكل');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Filter for the cards view
  const filteredSchedule = schedule.filter(item => {
    if (selectedStage !== 'all' && item.stage !== selectedStage) return false;
    if (item.dayIndex !== selectedDay) return false;
    if (selectedGroup !== 'الكل' && item.group !== 'الكل' && item.group !== selectedGroup) return false;
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-blue-100 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 transition-colors">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400" />
            <h2 className="text-xl sm:text-2xl font-black text-blue-950 dark:text-white">
              {language === 'ar' ? 'الجدول الأسبوعي المعتمد' : 'Weekly Academic Schedule'}
            </h2>
            <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-black shadow-xs">
              {language === 'ar' ? 'الصف الثاني - الفصل الأول 2026-2027' : '2nd Stage - 1st Semester 2026-2027'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {language === 'ar'
              ? 'الجدول الأسبوعي الرسمي لمحاضرات ومختبرات طلبة الصف الثاني (شعبة A وشعبة B) بقسم هندسة السيطرة والأتمتة.'
              : 'Official weekly academic schedule for 2nd stage students (Groups A & B), Control and Automation Engineering.'}
          </p>
        </div>

        {/* View Switcher and Action Tools */}
        <div className="flex items-center gap-2.5 flex-wrap self-stretch lg:self-auto justify-end">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'مخطط الجدول الرسمي' : 'Official Grid'}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'البطاقات اليومية' : 'Daily Cards'}</span>
            </button>
          </div>

          {/* Group Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <button
              type="button"
              onClick={() => setSelectedGroup('A')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                selectedGroup === 'A'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {language === 'ar' ? 'شعبة A' : 'Group A'}
            </button>
            <button
              type="button"
              onClick={() => setSelectedGroup('B')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                selectedGroup === 'B'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {language === 'ar' ? 'شعبة B' : 'Group B'}
            </button>
            <button
              type="button"
              onClick={() => setSelectedGroup('الكل')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                selectedGroup === 'الكل'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {language === 'ar' ? 'الكل' : 'All'}
            </button>
          </div>

          {/* Print Schedule */}
          <button
            type="button"
            onClick={handlePrint}
            title={language === 'ar' ? 'طباعة أو حفظ كملف PDF' : 'Print / Export PDF'}
            className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Reset Schedule to Official */}
          {onResetSchedule && (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              title={language === 'ar' ? 'استعادة الجدول الرسمي المعتمد 2026-2027' : 'Reset to Official Schedule'}
              className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {/* Admin Add Lecture Button */}
          {onOpenAddModal && (
            <button
              type="button"
              onClick={onOpenAddModal}
              className="px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              {isAdminUnlocked ? <Plus className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5 text-blue-200" />}
              <span>{language === 'ar' ? 'إضافة للجدول' : 'Add to Schedule'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirmation modal for resetting to official schedule */}
      {showResetConfirm && onResetSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {language === 'ar' ? 'استعادة الجدول الرسمي المعتمد؟' : 'Restore Official Schedule?'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'ar'
                  ? 'سيتم إعادة تحميل الجدول الرسمي الصادر للعام الدراسي 2026-2027 للمرحلة الثانية كما ورد في وثيقة القسم.'
                  : 'This will reset and load the official 2026-2027 Stage 2 weekly schedule.'}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  onResetSchedule();
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md cursor-pointer transition-colors"
              >
                {language === 'ar' ? 'نعم، استعادة الجدول' : 'Yes, Restore'}
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer hover:bg-slate-100 transition-colors"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODE 1: OFFICIAL WEEKLY GRID TABLE (مطابق تماماً للوثيقة الرسمية) */}
      {/* ============================================================ */}
      {viewMode === 'grid' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-blue-100 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
          {/* Official Document Banner Header */}
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-4 sm:p-5 text-center relative overflow-hidden">
            <div className="relative z-10 space-y-1">
              <span className="text-[11px] font-bold text-blue-200 tracking-wider block uppercase">
                {language === 'ar' ? 'قسم هندسة السيطرة والأتمتة' : 'Control & Automation Engineering Department'}
              </span>
              <h3 className="text-base sm:text-lg md:text-xl font-black tracking-wide">
                {language === 'ar'
                  ? 'الجدول الاسبوعي لطلبة الصف الثاني - الفصل الأول - للعام الدراسي 2026-2027'
                  : 'Weekly Schedule for 2nd Stage Students - 1st Semester - Academic Year 2026-2027'}
              </h3>
              <div className="flex items-center justify-center gap-3 text-xs text-blue-200 pt-1 font-medium">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-blue-300" />
                  {language === 'ar' ? 'المحاضرات النظرية: قاعة 9' : 'Theoretical Lectures: Hall 9'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <FlaskConical className="w-3.5 h-3.5 text-blue-300" />
                  {language === 'ar' ? 'المختبرات التخصصية: A & B' : 'Specialized Labs: Groups A & B'}
                </span>
              </div>
            </div>
          </div>

          {/* Table Container with Smooth Horizontal Scroll on Mobile */}
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse min-w-[780px] font-sans">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black">
                  <th className="py-3.5 px-4 w-28 border-l border-slate-200 dark:border-slate-700">
                    {language === 'ar' ? 'اليوم' : 'Day'}
                  </th>
                  <th className="py-3.5 px-3 border-l border-slate-200 dark:border-slate-700">8:30 - 9:30</th>
                  <th className="py-3.5 px-3 border-l border-slate-200 dark:border-slate-700">9:30 - 10:30</th>
                  <th className="py-3.5 px-3 border-l border-slate-200 dark:border-slate-700">10:30 - 11:30</th>
                  <th className="py-3.5 px-3 border-l border-slate-200 dark:border-slate-700">11:30 - 12:30</th>
                  <th className="py-3.5 px-3 border-l border-slate-200 dark:border-slate-700">12:30 - 1:30</th>
                  <th className="py-3.5 px-3">1:30 - 2:30</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                
                {/* ----------------- الأحد (Sunday) ----------------- */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                  <td className="py-4 px-3 font-black text-sm text-blue-900 dark:text-blue-300 bg-slate-50/70 dark:bg-slate-800/40 border-l border-slate-200 dark:border-slate-800">
                    {language === 'ar' ? 'الأحد' : 'Sunday'}
                  </td>
                  {/* 8:30 - 10:30: المنطق الرقمي ق 9 */}
                  <td colSpan={2} className="p-2 border-l border-slate-200 dark:border-slate-800">
                    <div className="h-full min-h-[72px] p-2.5 rounded-2xl bg-blue-50/90 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex flex-col justify-center items-center shadow-2xs">
                      <span className="font-black text-slate-900 dark:text-white text-xs sm:text-sm">
                        المنطق الرقمي ق 9
                      </span>
                      <span className="text-[11px] text-blue-700 dark:text-blue-300 font-bold mt-0.5">
                        م.م. مرتضى محمد حسن
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        نظري • قاعة 9 (الكل)
                      </span>
                    </div>
                  </td>
                  {/* 10:30 - 12:30: جرائم حزب البعث */}
                  <td colSpan={2} className="p-2 border-l border-slate-200 dark:border-slate-800">
                    <div className="h-full min-h-[72px] p-2.5 rounded-2xl bg-indigo-50/90 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 flex flex-col justify-center items-center shadow-2xs">
                      <span className="font-black text-slate-900 dark:text-white text-xs sm:text-sm">
                        جرائم حزب البعث
                      </span>
                      <span className="text-[11px] text-indigo-700 dark:text-indigo-300 font-bold mt-0.5">
                        م.م. مرتضى عدنان كاظم
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        نظري • قاعة 9 (الكل)
                      </span>
                    </div>
                  </td>
                  {/* 12:30 - 2:30: فترة فراغ */}
                  <td colSpan={2} className="p-2 text-slate-400 dark:text-slate-600 italic text-[11px]">
                    —
                  </td>
                </tr>

                {/* ----------------- الاثنين (Monday) ----------------- */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                  <td className="py-4 px-3 font-black text-sm text-blue-900 dark:text-blue-300 bg-slate-50/70 dark:bg-slate-800/40 border-l border-slate-200 dark:border-slate-800">
                    {language === 'ar' ? 'الاثنين' : 'Monday'}
                  </td>
                  {/* 8:30 - 11:30 (3 slots): م. اساسيات البرمجة A (مختبر المحاكاة والحاسبات) */}
                  <td colSpan={3} className="p-2 border-l border-slate-200 dark:border-slate-800">
                    <div className={`h-full min-h-[72px] p-3 rounded-2xl border transition-all flex flex-col justify-center items-center shadow-2xs ${
                      selectedGroup === 'A' || selectedGroup === 'الكل'
                        ? 'bg-emerald-50/90 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800'
                        : 'opacity-50 bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                    }`}>
                      <div className="flex items-center gap-1.5 font-black text-slate-900 dark:text-white text-xs sm:text-sm">
                        <span>م. اساسيات البرمجة A</span>
                        <span className="px-1.5 py-0.2 rounded-md bg-emerald-600 text-white text-[10px]">شعبة A</span>
                      </div>
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-bold mt-1">
                        مختبر المحاكاة والحاسبات
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                        3 ساعات عملي وتطبيق برمجي
                      </span>
                    </div>
                  </td>
                  {/* 11:30 - 2:30 (3 slots): م. اساسيات البرمجة B (مختبر المحاكاة والحاسبات) */}
                  <td colSpan={3} className="p-2">
                    <div className={`h-full min-h-[72px] p-3 rounded-2xl border transition-all flex flex-col justify-center items-center shadow-2xs ${
                      selectedGroup === 'B' || selectedGroup === 'الكل'
                        ? 'bg-teal-50/90 dark:bg-teal-950/60 border-teal-300 dark:border-teal-800'
                        : 'opacity-50 bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                    }`}>
                      <div className="flex items-center gap-1.5 font-black text-slate-900 dark:text-white text-xs sm:text-sm">
                        <span>م. اساسيات البرمجة B</span>
                        <span className="px-1.5 py-0.2 rounded-md bg-teal-600 text-white text-[10px]">شعبة B</span>
                      </div>
                      <span className="text-[11px] text-teal-700 dark:text-teal-300 font-bold mt-1">
                        مختبر المحاكاة والحاسبات
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                        3 ساعات عملي وتطبيق برمجي
                      </span>
                    </div>
                  </td>
                </tr>

                {/* ----------------- الثلاثاء (Tuesday) ----------------- */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                  <td className="py-4 px-3 font-black text-sm text-blue-900 dark:text-blue-300 bg-slate-50/70 dark:bg-slate-800/40 border-l border-slate-200 dark:border-slate-800">
                    {language === 'ar' ? 'الثلاثاء' : 'Tuesday'}
                  </td>
                  {/* 8:30 - 10:30: Split cell for A & B */}
                  <td colSpan={2} className="p-2 border-l border-slate-200 dark:border-slate-800">
                    <div className="space-y-1.5">
                      <div className={`p-2 rounded-xl border text-center transition-all ${
                        selectedGroup === 'A' || selectedGroup === 'الكل'
                          ? 'bg-amber-50/90 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800'
                          : 'opacity-50 bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                      }`}>
                        <span className="font-black text-slate-900 dark:text-white text-xs block">
                          م. قياسات A <span className="text-amber-600 dark:text-amber-400 font-bold">(مختبر التحكم والروبوتات الذكية)</span>
                        </span>
                      </div>
                      <div className={`p-2 rounded-xl border text-center transition-all ${
                        selectedGroup === 'B' || selectedGroup === 'الكل'
                          ? 'bg-sky-50/90 dark:bg-sky-950/60 border-sky-300 dark:border-sky-800'
                          : 'opacity-50 bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                      }`}>
                        <span className="font-black text-slate-900 dark:text-white text-xs block">
                          م. المنطق الرقمي B <span className="text-sky-600 dark:text-sky-400 font-bold">(مختبر الاجهزة والقياسات)</span>
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* 10:30 - 12:30: قياسات - ق 9 */}
                  <td colSpan={2} className="p-2 border-l border-slate-200 dark:border-slate-800">
                    <div className="h-full min-h-[72px] p-2.5 rounded-2xl bg-blue-50/90 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex flex-col justify-center items-center shadow-2xs">
                      <span className="font-black text-slate-900 dark:text-white text-xs sm:text-sm">
                        قياسات - ق 9
                      </span>
                      <span className="text-[11px] text-blue-700 dark:text-blue-300 font-bold mt-0.5">
                        م.م. مي محمد علي
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        نظري • قاعة 9 (الكل)
                      </span>
                    </div>
                  </td>

                  {/* 12:30 - 2:30: Split cell for A & B */}
                  <td colSpan={2} className="p-2">
                    <div className="space-y-1.5">
                      <div className={`p-2 rounded-xl border text-center transition-all ${
                        selectedGroup === 'A' || selectedGroup === 'الكل'
                          ? 'bg-sky-50/90 dark:bg-sky-950/60 border-sky-300 dark:border-sky-800'
                          : 'opacity-50 bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                      }`}>
                        <span className="font-black text-slate-900 dark:text-white text-xs block">
                          م. المنطق الرقمي A <span className="text-sky-600 dark:text-sky-400 font-bold">(مختبر الاجهزة والقياسات)</span>
                        </span>
                      </div>
                      <div className={`p-2 rounded-xl border text-center transition-all ${
                        selectedGroup === 'B' || selectedGroup === 'الكل'
                          ? 'bg-amber-50/90 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800'
                          : 'opacity-50 bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                      }`}>
                        <span className="font-black text-slate-900 dark:text-white text-xs block">
                          م. قياسات B <span className="text-amber-600 dark:text-amber-400 font-bold">(مختبر التحكم والروبوتات الذكية)</span>
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>

                {/* ----------------- الأربعاء (Wednesday) ----------------- */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                  <td className="py-4 px-3 font-black text-sm text-blue-900 dark:text-blue-300 bg-slate-50/70 dark:bg-slate-800/40 border-l border-slate-200 dark:border-slate-800">
                    {language === 'ar' ? 'الأربعاء' : 'Wednesday'}
                  </td>
                  {/* 8:30 - 10:30: رياضيات هندسية ق 9 */}
                  <td colSpan={2} className="p-2 border-l border-slate-200 dark:border-slate-800">
                    <div className="h-full min-h-[72px] p-2.5 rounded-2xl bg-indigo-50/90 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 flex flex-col justify-center items-center shadow-2xs">
                      <span className="font-black text-slate-900 dark:text-white text-xs sm:text-sm">
                        رياضيات هندسية ق 9
                      </span>
                      <span className="text-[11px] text-indigo-700 dark:text-indigo-300 font-bold mt-0.5">
                        م.م. وسن اسعد جواد
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        نظري • قاعة 9 (الكل)
                      </span>
                    </div>
                  </td>
                  {/* 10:30 - 12:30: رياضيات هندسية ق 9 (تطبيقات وتمارين) */}
                  <td colSpan={2} className="p-2 border-l border-slate-200 dark:border-slate-800">
                    <div className="h-full min-h-[72px] p-2.5 rounded-2xl bg-indigo-50/90 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 flex flex-col justify-center items-center shadow-2xs">
                      <span className="font-black text-slate-900 dark:text-white text-xs sm:text-sm">
                        رياضيات هندسية ق 9
                      </span>
                      <span className="text-[11px] text-indigo-700 dark:text-indigo-300 font-bold mt-0.5">
                        م.م. وسن اسعد جواد
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        تطبيقات وتمارين • قاعة 9 (الكل)
                      </span>
                    </div>
                  </td>
                  {/* 12:30 - 2:30: اساسيات البرمجة - ق 9 */}
                  <td colSpan={2} className="p-2">
                    <div className="h-full min-h-[72px] p-2.5 rounded-2xl bg-blue-50/90 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex flex-col justify-center items-center shadow-2xs">
                      <span className="font-black text-slate-900 dark:text-white text-xs sm:text-sm">
                        اساسيات البرمجة - ق 9
                      </span>
                      <span className="text-[11px] text-blue-700 dark:text-blue-300 font-bold mt-0.5">
                        م.م. مهند عبد الباقر علي
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        نظري • قاعة 9 (الكل)
                      </span>
                    </div>
                  </td>
                </tr>

                {/* ----------------- الخميس (Thursday) ----------------- */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                  <td className="py-4 px-3 font-black text-sm text-blue-900 dark:text-blue-300 bg-slate-50/70 dark:bg-slate-800/40 border-l border-slate-200 dark:border-slate-800">
                    {language === 'ar' ? 'الخميس' : 'Thursday'}
                  </td>
                  {/* 8:30 - 10:30: نظرية السيطرة ق 9 */}
                  <td colSpan={2} className="p-2 border-l border-slate-200 dark:border-slate-800">
                    <div className="h-full min-h-[72px] p-2.5 rounded-2xl bg-blue-50/90 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex flex-col justify-center items-center shadow-2xs">
                      <span className="font-black text-slate-900 dark:text-white text-xs sm:text-sm">
                        نظرية السيطرة ق 9
                      </span>
                      <span className="text-[11px] text-blue-700 dark:text-blue-300 font-bold mt-0.5">
                        م.م. علياء ابراهيم داود
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        نظري • قاعة 9 (الكل)
                      </span>
                    </div>
                  </td>
                  {/* 10:30 - 12:30: م. نظرية السيطرة B (مختبر الشبكات الحاسوب) */}
                  <td colSpan={2} className="p-2 border-l border-slate-200 dark:border-slate-800">
                    <div className={`h-full min-h-[72px] p-2.5 rounded-2xl border transition-all flex flex-col justify-center items-center shadow-2xs ${
                      selectedGroup === 'B' || selectedGroup === 'الكل'
                        ? 'bg-purple-50/90 dark:bg-purple-950/60 border-purple-300 dark:border-purple-800'
                        : 'opacity-50 bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                    }`}>
                      <div className="flex items-center gap-1.5 font-black text-slate-900 dark:text-white text-xs sm:text-sm">
                        <span>م. نظرية السيطرة B</span>
                        <span className="px-1.5 py-0.2 rounded-md bg-purple-600 text-white text-[10px]">شعبة B</span>
                      </div>
                      <span className="text-[11px] text-purple-700 dark:text-purple-300 font-bold mt-0.5">
                        مختبر شبكات الحاسوب
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                        عملي تخصصي
                      </span>
                    </div>
                  </td>
                  {/* 12:30 - 2:30: م. نظرية السيطرة A (مختبر الشبكات الحاسوب) */}
                  <td colSpan={2} className="p-2">
                    <div className={`h-full min-h-[72px] p-2.5 rounded-2xl border transition-all flex flex-col justify-center items-center shadow-2xs ${
                      selectedGroup === 'A' || selectedGroup === 'الكل'
                        ? 'bg-purple-50/90 dark:bg-purple-950/60 border-purple-300 dark:border-purple-800'
                        : 'opacity-50 bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                    }`}>
                      <div className="flex items-center gap-1.5 font-black text-slate-900 dark:text-white text-xs sm:text-sm">
                        <span>م. نظرية السيطرة A</span>
                        <span className="px-1.5 py-0.2 rounded-md bg-purple-600 text-white text-[10px]">شعبة A</span>
                      </div>
                      <span className="text-[11px] text-purple-700 dark:text-purple-300 font-bold mt-0.5">
                        مختبر شبكات الحاسوب
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                        عملي تخصصي
                      </span>
                    </div>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>

          {/* Grid Footer Notes */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>
                {language === 'ar'
                  ? 'ملاحظة: حرف (م.) يشير إلى المختبر العملي التخصصي في المعامل المعتمدة.'
                  : 'Note: The prefix (م.) indicates practical hands-on laboratory sessions.'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-bold">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                {language === 'ar' ? 'نظري' : 'Theoretical'}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                {language === 'ar' ? 'عملي (مختبر)' : 'Practical (Lab)'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODE 2: DAILY TIMELINE & CARDS VIEW */}
      {/* ============================================================ */}
      {viewMode === 'cards' && (
        <div className="space-y-4">
          {/* Days Switcher */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {DAYS.map((day) => (
              <button
                key={day.index}
                id={`day-tab-${day.index}`}
                onClick={() => setSelectedDay(day.index)}
                className={`px-5 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer shadow-xs ${
                  selectedDay === day.index
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                    : 'bg-white dark:bg-slate-850 hover:bg-blue-50/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>{language === 'ar' ? day.nameAr : day.nameEn}</span>
              </button>
            ))}
          </div>

          {/* Timeline Cards */}
          {filteredSchedule.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
              <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">
                {language === 'ar' ? 'لا توجد محاضرات مجدولة لهذا اليوم للشعبة المحددة' : 'No lectures scheduled for this selection'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {language === 'ar'
                  ? 'يمكنك التبديل بين الأيام والشعب (A أو B أو الكل) لعرض باقي المواعيد.'
                  : 'Try switching between days or choosing All Groups.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSchedule.map((item, index) => {
                const isPractical = item.type === 'practical';
                const isTutorial = item.type === 'tutorial';

                return (
                  <div
                    key={item.id}
                    id={`sch-item-${item.id}`}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-blue-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-600 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between gap-4"
                  >
                    <div>
                      {/* Badge and Time */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border ${
                            isPractical
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : isTutorial
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                              : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                          }`}>
                            {isPractical ? (language === 'ar' ? 'مختبر عملي' : 'Practical Lab') : isTutorial ? (language === 'ar' ? 'تمارين وتطبيقات' : 'Tutorial') : (language === 'ar' ? 'محاضرة نظرية' : 'Theoretical')}
                          </span>
                          <span className="text-[11px] font-black px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {language === 'ar' ? (item.group === 'الكل' ? 'لكل الشعب' : `شعبة ${item.group}`) : `Group ${item.group}`}
                          </span>
                        </div>

                        <span className="font-mono text-xs font-black text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-xl flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{item.startTime} - {item.endTime}</span>
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-3">
                        {language === 'ar' ? item.subjectNameAr : item.subjectNameEn}
                      </h3>
                    </div>

                    {/* Location & Instructor */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold">
                        <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>{language === 'ar' ? item.roomAr : item.roomEn}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-blue-900 dark:text-blue-200 font-bold">
                        <User className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>{language === 'ar' ? item.instructorAr : item.instructorEn}</span>
                      </div>

                      {isAdminUnlocked && onDeleteScheduleItem && (
                        <button
                          type="button"
                          onClick={() => onDeleteScheduleItem(item.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title={language === 'ar' ? 'حذف من الجدول' : 'Delete'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Guide Cards to Halls & Labs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-2xs">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-black text-xs">
            <Building2 className="w-4 h-4" />
            <span>قاعة 9 (ق 9)</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {language === 'ar'
              ? 'القاعة المركزية المعتمدة للمحاضرات النظرية المشتركة لكافة طلبة الصف الثاني.'
              : 'Main central hall for theoretical lectures for all 2nd stage students.'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-2xs">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-xs">
            <FlaskConical className="w-4 h-4" />
            <span>مختبر المحاكاة والحاسبات</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {language === 'ar'
              ? 'يوم الاثنين لمادة أساسيات البرمجة (3 ساعات لكل شعبة A و B).'
              : 'Monday sessions for Programming Fundamentals C++ simulation.'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-2xs">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black text-xs">
            <FlaskConical className="w-4 h-4" />
            <span>مختبرات يوم الثلاثاء</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {language === 'ar'
              ? 'مختبر التحكم والروبوتات (القياسات) + مختبر الأجهزة (المنطق الرقمي) بالتناوب بين A و B.'
              : 'Robotics lab (Measurements) + Instrumentation lab (Logic) rotation.'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-2xs">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-black text-xs">
            <FlaskConical className="w-4 h-4" />
            <span>مختبر شبكات الحاسوب</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {language === 'ar'
              ? 'يوم الخميس لمختبر نظرية السيطرة العملي (ساعتان لكل شعبة بالتناوب).'
              : 'Thursday practical sessions for Control Theory lab.'}
          </p>
        </div>
      </div>
    </div>
  );
};
