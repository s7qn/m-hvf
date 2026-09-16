import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  BookOpen, 
  CheckCircle, 
  Laptop, 
  Layers
} from 'lucide-react';
import { ScheduleItem, Stage, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface ScheduleViewProps {
  schedule: ScheduleItem[];
  selectedStage: Stage | 'all';
  language: Language;
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
}) => {
  const t = TRANSLATIONS[language];
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [selectedGroup, setSelectedGroup] = useState<'A' | 'B' | 'الكل'>('A');

  const filteredSchedule = schedule.filter(item => {
    if (selectedStage !== 'all' && item.stage !== selectedStage) return false;
    if (item.dayIndex !== selectedDay) return false;
    if (selectedGroup !== 'الكل' && item.group !== 'الكل' && item.group !== selectedGroup) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-blue-100 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400" />
            <h2 className="text-xl sm:text-2xl font-black text-blue-950 dark:text-white">
              {t.tabSchedule}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.scheduleDesc}
          </p>
        </div>

        {/* Group Selector */}
        <div className="flex items-center gap-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <span className="text-slate-500 dark:text-slate-400 px-2">{t.group}:</span>
          <button
            onClick={() => setSelectedGroup('A')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              selectedGroup === 'A' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {language === 'ar' ? 'الشعبة A' : 'Group A'}
          </button>
          <button
            onClick={() => setSelectedGroup('B')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              selectedGroup === 'B' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {language === 'ar' ? 'الشعبة B' : 'Group B'}
          </button>
          <button
            onClick={() => setSelectedGroup('الكل')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              selectedGroup === 'الكل' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {language === 'ar' ? 'الكل' : 'All'}
          </button>
        </div>
      </div>

      {/* Days Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {DAYS.map((day) => (
          <button
            key={day.index}
            id={`day-tab-${day.index}`}
            onClick={() => setSelectedDay(day.index)}
            className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              selectedDay === day.index
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white dark:bg-slate-800 hover:bg-blue-50/70 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>{language === 'ar' ? day.nameAr : day.nameEn}</span>
          </button>
        ))}
      </div>

      {/* Schedule Items Timeline */}
      {filteredSchedule.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
          <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">
            {language === 'ar' ? 'لا توجد محاضرات مجدولة لهذا اليوم' : 'No lectures scheduled for this day'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'ar'
              ? 'يمكنك مراجعة أيام الأسبوع الأخرى أو تبديل الشعبة الدراسية.'
              : 'Switch between days or check other study groups.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredSchedule.map((item, index) => {
            const isPractical = item.type === 'practical';
            const isTutorial = item.type === 'tutorial';

            return (
              <div
                key={item.id}
                id={`sch-item-${item.id}`}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-blue-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-600 shadow-xs hover:shadow-md transition-all p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Time & Type */}
                <div className="flex items-start md:items-center gap-3 sm:gap-4">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/70 border border-blue-100 dark:border-blue-900 text-blue-700 dark:text-blue-300 flex flex-col items-center justify-center font-black text-xs shrink-0">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">#0{index + 1}</span>
                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg">
                        {item.startTime} - {item.endTime}
                      </span>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isPractical
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : isTutorial
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                      }`}>
                        {isPractical ? t.practical : isTutorial ? t.tutorial : t.theoretical}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        {language === 'ar' ? `المرحلة ${item.stage} (شعبة ${item.group})` : `Stage ${item.stage} (Group ${item.group})`}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-blue-950 dark:text-white mt-1.5">
                      {language === 'ar' ? item.subjectNameAr : item.subjectNameEn}
                    </h3>
                  </div>
                </div>

                {/* Room & Instructor Details */}
                <div className="flex flex-col sm:flex-row md:items-end gap-2.5 sm:gap-3 text-xs text-slate-600 dark:text-slate-300 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {language === 'ar' ? item.roomAr : item.roomEn}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-blue-50/60 dark:bg-blue-950/50 px-3 py-1.5 rounded-xl border border-blue-100 dark:border-blue-900 text-blue-900 dark:text-blue-200 font-semibold">
                    <User className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>
                      {language === 'ar' ? item.instructorAr : item.instructorEn}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
