import React from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  BookOpen, 
  Edit3, 
  Building2, 
  FlaskConical, 
  Sparkles,
  Info,
  CheckCircle2,
  Layers,
  GraduationCap
} from 'lucide-react';
import { ScheduleItem, Subject, Language } from '../types';

interface ScheduleItemViewerModalProps {
  item: ScheduleItem;
  subject?: Subject;
  language: Language;
  onClose: () => void;
  onEdit?: (item: ScheduleItem) => void;
  isAdminUnlocked?: boolean;
}

export const ScheduleItemViewerModal: React.FC<ScheduleItemViewerModalProps> = ({
  item,
  subject,
  language,
  onClose,
  onEdit,
  isAdminUnlocked = false,
}) => {
  const isLab = item.type === 'practical';

  const typeConfig: Record<string, { labelAr: string; labelEn: string; bg: string; text: string; icon: any }> = {
    theoretical: {
      labelAr: 'محاضرة نظرية معتمدة',
      labelEn: 'Theoretical Lecture',
      bg: 'bg-blue-100 dark:bg-blue-950/80 border-blue-200 dark:border-blue-900',
      text: 'text-blue-800 dark:text-blue-300',
      icon: BookOpen,
    },
    practical: {
      labelAr: 'مختبر وتطبيق عملي تخصصي',
      labelEn: 'Practical Laboratory',
      bg: 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-900',
      text: 'text-emerald-800 dark:text-emerald-300',
      icon: FlaskConical,
    },
    tutorial: {
      labelAr: 'حلقة نقاشية ومسائل (Tutorial)',
      labelEn: 'Discussion Tutorial',
      bg: 'bg-purple-100 dark:bg-purple-950/80 border-purple-200 dark:border-purple-900',
      text: 'text-purple-800 dark:text-purple-300',
      icon: Sparkles,
    },
  };

  const currentType = typeConfig[item.type] || typeConfig.theoretical;
  const TypeIcon = currentType.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden transition-all">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-gradient-to-r from-blue-50/70 to-indigo-50/40 dark:from-slate-800/70 dark:to-slate-900">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-600 text-white shadow-xs">
                {language === 'ar' ? 'معاينة تفاصيل المحاضرة' : 'Schedule Item Preview'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {language === 'ar' ? item.dayNameAr : item.dayNameEn}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300">
                {language === 'ar' ? `المرحلة ${item.stage}` : `Year ${item.stage}`}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white pt-1">
              {language === 'ar' ? item.subjectNameAr : item.subjectNameEn}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isAdminUnlocked && onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(item);
                }}
                className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                title={language === 'ar' ? 'تعديل موعد أو تفاصيل هذه المحاضرة (للمشرف فقط)' : 'Edit Schedule Item (Supervisor Only)'}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{language === 'ar' ? 'تعديل' : 'Edit'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-slate-800 dark:text-slate-200">
          
          {/* Type Badge */}
          <div className={`p-3.5 rounded-2xl border ${currentType.bg} flex items-center justify-between gap-3`}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/80 dark:bg-slate-900/80 flex items-center justify-center shrink-0">
                <TypeIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className={`text-xs sm:text-sm font-black ${currentType.text}`}>
                {language === 'ar' ? currentType.labelAr : currentType.labelEn}
              </span>
            </div>

            <span className="px-2.5 py-1 rounded-lg bg-white/90 dark:bg-slate-900/90 text-[11px] font-black text-slate-800 dark:text-slate-200 shadow-2xs">
              {language === 'ar' ? `الشعبة: ${item.group}` : `Group: ${item.group}`}
            </span>
          </div>

          {/* Key Grid info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Time Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
              <span className="text-slate-400 text-xs font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>{language === 'ar' ? 'التوقيت الأكاديمي' : 'Session Timing'}</span>
              </span>
              <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-mono">
                {item.startTime} - {item.endTime}
              </p>
            </div>

            {/* Room / Hall Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
              <span className="text-slate-400 text-xs font-bold flex items-center gap-1.5">
                {isLab ? (
                  <FlaskConical className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                )}
                <span>{language === 'ar' ? 'المكان / القاعة' : 'Room / Hall'}</span>
              </span>
              <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                {language === 'ar' ? item.roomAr : item.roomEn}
              </p>
            </div>
          </div>

          {/* Instructor Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 block">
                  {language === 'ar' ? 'الأستاذ المحاضر / المشرف' : 'Course Instructor'}
                </span>
                <p className="text-sm font-black text-slate-900 dark:text-white">
                  {language === 'ar' ? item.instructorAr : item.instructorEn}
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[11px] font-bold text-blue-700 dark:text-blue-300">
              {subject?.code || 'CAE'}
            </span>
          </div>

          {/* Notes or Guidance */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
            <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{language === 'ar' ? 'إرشادات المحاضرة والمتطلبات' : 'Lecture Requirements & Preparation'}</span>
            </h4>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {item.notesAr || (
                isLab
                  ? (language === 'ar'
                      ? 'يرجى الحضور في مختبر السيطرة والأتمتة في الموعد المحدد مع إحضار دفتر التجارب والملزمة المعتمدة.'
                      : 'Please arrive on time at the control lab with lab experiment manual.')
                  : (language === 'ar'
                      ? 'يرجى مراجعة ملزمة المحاضرة وحل الواجبات المنزلية والتمارين المرتبطة قبل موعد المحاضرة.'
                      : 'Please review lecture notes and solve assigned homework prior to the session.')
              )}
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            {language === 'ar' ? 'إغلاق المعاينة' : 'Close Preview'}
          </button>
        </div>

      </div>
    </div>
  );
};
