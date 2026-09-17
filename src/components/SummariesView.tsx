import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Sparkles, 
  Tag, 
  Calendar, 
  User, 
  BookOpen, 
  CheckCircle,
  ExternalLink,
  Layers,
  Plus,
  Lock,
  Trash2
} from 'lucide-react';
import { Summary, Subject, Stage, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface SummariesViewProps {
  summaries: Summary[];
  subjects: Subject[];
  selectedStage: Stage | 'all';
  language: Language;
  isAdminUnlocked?: boolean;
  onOpenAddModal?: () => void;
  onDeleteSummary?: (id: string) => void;
}

export const SummariesView: React.FC<SummariesViewProps> = ({
  summaries,
  subjects,
  selectedStage,
  language,
  isAdminUnlocked = false,
  onOpenAddModal,
  onDeleteSummary,
}) => {
  const t = TRANSLATIONS[language];
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const filteredSummaries = summaries.filter(sum => {
    if (selectedStage !== 'all' && sum.stage !== selectedStage) return false;
    return true;
  });

  const getSubject = (subjectId: string) => subjects.find(s => s.id === subjectId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-blue-100 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400" />
            <h2 className="text-xl sm:text-2xl font-black text-blue-950 dark:text-white">
              {t.tabSummaries}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.summariesDesc}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-blue-50 dark:bg-slate-800 px-3.5 py-1.5 rounded-xl border border-blue-100 dark:border-slate-700 text-xs font-bold text-blue-800 dark:text-blue-300">
            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>{filteredSummaries.length} {language === 'ar' ? 'ملخصات وبطاقات قوانين' : 'Summary Sheets'}</span>
          </div>

          {/* Admin Add Button */}
          {onOpenAddModal && (
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              {isAdminUnlocked ? (
                <Plus className="w-4 h-4" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-blue-200" />
              )}
              <span>{language === 'ar' ? 'إضافة ملخص وقوانين' : 'Add Summary'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Summaries Grid or Empty State */}
      {filteredSummaries.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 max-w-2xl mx-auto transition-colors">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {language === 'ar' ? 'لا توجد ملخصات أو قوانين حالياً' : 'No Summaries or Formulas Available'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
              {language === 'ar'
                ? 'قسم الملخصات متاح لإضافة ملخصات المواد وبطاقات القوانين الهندسية مع التوثيق المعتمد.'
                : 'This section is ready for course summaries and engineering formula sheets.'}
            </p>
          </div>

          {onOpenAddModal && (
            <button
              onClick={onOpenAddModal}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-500/20 inline-flex items-center gap-2 cursor-pointer transition-all mx-auto"
            >
              {isAdminUnlocked ? <Plus className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
              <span>{language === 'ar' ? 'إضافة أول ملخص للمادة (للمشرف)' : 'Add First Summary'}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredSummaries.map((summary) => {
            const subject = getSubject(summary.subjectId);

            return (
              <div
                key={summary.id}
                id={`summary-card-${summary.id}`}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-blue-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-600 shadow-xs hover:shadow-md transition-all p-5 sm:p-6 flex flex-col justify-between group"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900">
                      {subject ? (language === 'ar' ? subject.nameAr : subject.nameEn) : 'هندسة السيطرة'} (المرحلة {summary.stage})
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-mono font-bold">
                        {summary.pagesCount} {language === 'ar' ? 'صفحات' : 'pages'} • {summary.fileSize}
                      </span>
                      {isAdminUnlocked && onDeleteSummary && (
                        <button
                          onClick={() => onDeleteSummary(summary.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title={language === 'ar' ? 'حذف الملخص' : 'Delete'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-black text-blue-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {language === 'ar' ? summary.titleAr : summary.titleEn}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {language === 'ar' ? summary.descriptionAr : summary.descriptionEn}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {(language === 'ar' ? summary.tagsAr : summary.tagsEn).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>{language === 'ar' ? summary.authorAr : summary.authorEn}</span>
                  </div>

                  <a
                    href="#download"
                    onClick={(e) => {
                      e.preventDefault();
                      alert(language === 'ar' ? `بدء تنزيل: ${summary.titleAr} (${summary.fileSize})` : `Downloading ${summary.titleEn}`);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-bold transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'تنزيل الملخص' : 'Download'}</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
