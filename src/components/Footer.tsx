import React from 'react';
import { ShieldCheck, Heart, Award, Cpu, BookOpen, Layers } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface FooterProps {
  language: Language;
}

export const Footer: React.FC<FooterProps> = ({ language }) => {
  const t = TRANSLATIONS[language];

  return (
    <footer className="mt-16 bg-white dark:bg-[#0b1329] border-t border-blue-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-colors duration-200">
      {/* Upper Footer Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center border-b border-blue-50 dark:border-slate-800/80 pb-8">
          {/* Platform Identity */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black text-blue-900 dark:text-blue-100 tracking-tight">
                  {t.platformName}
                </h3>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">
                  {t.departmentTitle}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
              {language === 'ar' 
                ? 'المنصة الأكاديمية الأولى المتخصصة بهندسة تقنيات السيطرة والأتمتة لتبادل المحاضرات، حلول الامتحانات، والاختبارات التفاعلية السرية.'
                : 'The premier academic portal for Control & Automation Engineering Technology students, offering lecture notes, exam archives, and secure proctored testing.'}
            </p>
          </div>

          {/* Academic Features Highlights */}
          <div className="flex items-center justify-around bg-blue-50/50 dark:bg-slate-900/60 p-4 rounded-2xl border border-blue-100 dark:border-slate-800 text-center">
            <div className="space-y-1">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center mx-auto">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-blue-950 dark:text-slate-200 block">
                {language === 'ar' ? 'ملازم ومحاضرات' : 'Lecture Notes'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                {language === 'ar' ? 'تحديث دوري' : 'Updated Regularly'}
              </span>
            </div>

            <div className="space-y-1">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-blue-950 dark:text-slate-200 block">
                {language === 'ar' ? 'اختبارات مؤمنة' : 'Secure Exams'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                {language === 'ar' ? 'حماية من الغش' : 'Anti-Cheat Mode'}
              </span>
            </div>

            <div className="space-y-1">
              <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 flex items-center justify-center mx-auto">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-blue-950 dark:text-slate-200 block">
                {language === 'ar' ? 'ملخصات وقوانين' : 'Formulas & Sheets'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                {language === 'ar' ? 'حلول نموذجية' : 'Model Solutions'}
              </span>
            </div>
          </div>

          {/* Dedicated Creators Card */}
          <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white p-5 rounded-2xl shadow-lg shadow-blue-950/20 text-center relative overflow-hidden border border-blue-800/40">
            <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-[11px] font-bold border border-blue-400/30 mb-2">
              <Award className="w-3.5 h-3.5 text-blue-300" />
              <span>{language === 'ar' ? 'إشراف وتطوير المهندسين' : 'Engineers & Developers'}</span>
            </div>
            
            {/* Exactly as requested: "صنع بواسطة مصطفى احمد وحسن علوان" */}
            <h4 className="text-base sm:text-lg font-black tracking-wide text-white flex items-center justify-center gap-2">
              <span>{t.footerMadeBy}</span>
            </h4>
            
            <p className="text-xs text-blue-200 mt-1 font-medium">
              {language === 'ar'
                ? 'قسم هندسة تقنيات السيطرة والأتمتة'
                : 'Department of Control & Automation Engineering Technology'}
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p className="font-medium flex items-center gap-1.5">
            <span>© {new Date().getFullYear()}</span>
            <span className="font-bold text-blue-900 dark:text-blue-300">{t.platformName}</span>
            <span>—</span>
            <span>{t.footerRights}</span>
          </p>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-md border border-blue-100 dark:border-blue-900/50">
              {t.footerMadeBy}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
