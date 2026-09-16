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
  Layers
} from 'lucide-react';
import { Summary, Subject, Stage, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface SummariesViewProps {
  summaries: Summary[];
  subjects: Subject[];
  selectedStage: Stage | 'all';
  language: Language;
}

export const SummariesView: React.FC<SummariesViewProps> = ({
  summaries,
  subjects,
  selectedStage,
  language,
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
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-blue-100 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <h2 className="text-xl sm:text-2xl font-black text-blue-950">
              {t.tabSummaries}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t.summariesDesc}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-blue-50 px-3.5 py-1.5 rounded-xl border border-blue-100 text-xs font-bold text-blue-800">
          <Layers className="w-4 h-4 text-blue-600" />
          <span>{filteredSummaries.length} {language === 'ar' ? 'ملخصات وبطاقات قوانين' : 'Summary Sheets'}</span>
        </div>
      </div>

      {/* Summaries Grid or Empty State */}
      {filteredSummaries.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs space-y-4 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-black text-slate-900">
              {language === 'ar' ? 'لا توجد ملخصات أو قوانين حالياً' : 'No Summaries or Formulas Available'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
              {language === 'ar'
                ? 'تم مسح كافة الملخصات والقوانين الافتراضية. هذا القسم خالٍ وجاهز لاستقبال ملخصاتكم وبطاقات القوانين الخاصة بالمواد.'
                : 'All default summaries and formula sheets have been removed. This section is ready for your custom summaries.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredSummaries.map((summary) => {
            const subject = getSubject(summary.subjectId);

            return (
              <div
                key={summary.id}
                id={`summary-card-${summary.id}`}
                className="bg-white rounded-2xl border border-blue-100 hover:border-blue-300 shadow-xs hover:shadow-md transition-all p-5 sm:p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    {subject && (
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 text-[11px] font-black border border-blue-100">
                        {subject.code} — {language === 'ar' ? subject.nameAr : subject.nameEn}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{summary.date}</span>
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-slate-900 hover:text-blue-700 transition-colors">
                    {language === 'ar' ? summary.titleAr : summary.titleEn}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {language === 'ar' ? summary.descriptionAr : summary.descriptionEn}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(language === 'ar' ? summary.tagsAr : summary.tagsEn).map((tag, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer details & download */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                  <div className="text-slate-500 font-medium">
                    <span className="text-blue-700 font-bold">
                      {language === 'ar' ? summary.authorAr : summary.authorEn}
                    </span>
                    <span className="mx-1.5">•</span>
                    <span>{summary.pagesCount} {language === 'ar' ? 'صفحات' : 'Pages'}</span>
                  </div>

                  <button
                    onClick={() => {
                      const blob = new Blob([
                        `منصة سيطرة | ملخص هندسي: ${summary.titleAr}\nإعداد: ${summary.authorAr}\n\n${summary.descriptionAr}\n\nصنع بواسطة مصطفى احمد وحسن علوان`
                      ], { type: 'text/plain;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `Summary-${summary.id}.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t.downloadPdf}</span>
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
