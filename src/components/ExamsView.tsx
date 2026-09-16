import React, { useState } from 'react';
import { 
  HelpCircle, 
  Download, 
  CheckCircle2, 
  FileCheck, 
  Calendar, 
  BookOpen, 
  Clock, 
  Filter
} from 'lucide-react';
import { ExamQuestionPaper, Subject, Stage, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface ExamsViewProps {
  exams: ExamQuestionPaper[];
  subjects: Subject[];
  selectedStage: Stage | 'all';
  language: Language;
}

export const ExamsView: React.FC<ExamsViewProps> = ({
  exams,
  subjects,
  selectedStage,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredExams = exams.filter(exam => {
    if (selectedStage !== 'all' && exam.stage !== selectedStage) return false;
    if (selectedType !== 'all' && exam.type !== selectedType) return false;
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
              {t.tabExams}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t.examArchiveDesc}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-bold">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1.5 rounded-xl transition-colors ${
              selectedType === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {language === 'ar' ? 'الكل' : 'All'}
          </button>
          <button
            onClick={() => setSelectedType('final')}
            className={`px-3 py-1.5 rounded-xl transition-colors ${
              selectedType === 'final'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {language === 'ar' ? 'النهائي (Final)' : 'Final'}
          </button>
          <button
            onClick={() => setSelectedType('midterm')}
            className={`px-3 py-1.5 rounded-xl transition-colors ${
              selectedType === 'midterm'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {language === 'ar' ? 'نصف الفصل (Midterm)' : 'Midterm'}
          </button>
          <button
            onClick={() => setSelectedType('practical')}
            className={`px-3 py-1.5 rounded-xl transition-colors ${
              selectedType === 'practical'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {language === 'ar' ? 'مختبر وعملي' : 'Practical'}
          </button>
        </div>
      </div>

      {/* Exams Grid or Empty State */}
      {filteredExams.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs space-y-4 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto">
            <HelpCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-black text-slate-900">
              {language === 'ar' ? 'لا توجد أسئلة أو نماذج امتحانية حالياً' : 'No Exam Papers Available'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
              {language === 'ar'
                ? 'تم مسح كافة الأسئلة الامتحانية والنماذج الافتراضية. أرشيف الأسئلة جاهز لاستقبال الأسئلة الامتحانية الرسمية الخاصة بكم.'
                : 'All default exam papers and questions have been removed. The archive is ready for your official exam papers.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredExams.map((exam) => {
            const subject = getSubject(exam.subjectId);

            return (
              <div
                key={exam.id}
                id={`exam-paper-card-${exam.id}`}
                className="bg-white rounded-2xl border border-blue-100 hover:border-blue-300 shadow-xs hover:shadow-md transition-all p-5 sm:p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 text-[11px] font-black uppercase">
                        {exam.type}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold">
                        {exam.academicYear}
                      </span>
                    </div>

                    {exam.solved && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-black flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{t.solvedBadge}</span>
                      </span>
                    )}
                  </div>

                  <div>
                    {subject && (
                      <p className="text-xs font-bold text-blue-600 mb-1">
                        {language === 'ar' ? subject.nameAr : subject.nameEn}
                      </p>
                    )}
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      {language === 'ar' ? exam.titleAr : exam.titleEn}
                    </h3>
                  </div>

                  {exam.solvedByAr && (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-xs text-slate-600 flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        {language === 'ar' ? `حل وتدقيق: ${exam.solvedByAr}` : `Solved by: ${exam.solvedByEn}`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom bar */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                  <span className="text-slate-500 font-medium">
                    PDF ({exam.fileSize})
                  </span>

                  <button
                    onClick={() => {
                      const blob = new Blob([
                        `منصة سيطرة | أرشيف الأسئلة الامتحانية\n${exam.titleAr}\nالعام الدراسي: ${exam.academicYear}\n${exam.solvedByAr ? 'حل: ' + exam.solvedByAr : ''}\n\nصنع بواسطة مصطفى احمد وحسن علوان`
                      ], { type: 'text/plain;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `Exam-${exam.id}.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'تحميل الأسئلة والحل' : 'Download Exam & Key'}</span>
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
