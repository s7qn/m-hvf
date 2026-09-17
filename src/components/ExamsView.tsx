import React, { useState } from 'react';
import { 
  HelpCircle, 
  Download, 
  CheckCircle2, 
  FileCheck, 
  Calendar, 
  BookOpen, 
  Clock, 
  Filter,
  Plus,
  Lock,
  Trash2
} from 'lucide-react';
import { ExamQuestionPaper, Subject, Stage, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface ExamsViewProps {
  exams: ExamQuestionPaper[];
  subjects: Subject[];
  selectedStage: Stage | 'all';
  language: Language;
  isAdminUnlocked?: boolean;
  onOpenAddModal?: () => void;
  onDeleteExam?: (id: string) => void;
}

export const ExamsView: React.FC<ExamsViewProps> = ({
  exams,
  subjects,
  selectedStage,
  language,
  isAdminUnlocked = false,
  onOpenAddModal,
  onDeleteExam,
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
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-blue-100 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400" />
            <h2 className="text-xl sm:text-2xl font-black text-blue-950 dark:text-white">
              {t.tabExams}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.examArchiveDesc}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-bold w-full md:w-auto scrollbar-none">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 rounded-xl transition-colors shrink-0 cursor-pointer ${
                selectedType === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {language === 'ar' ? 'الكل' : 'All'}
            </button>
            <button
              onClick={() => setSelectedType('final')}
              className={`px-3 py-1.5 rounded-xl transition-colors shrink-0 cursor-pointer ${
                selectedType === 'final'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {language === 'ar' ? 'النهائي (Final)' : 'Final'}
            </button>
            <button
              onClick={() => setSelectedType('midterm')}
              className={`px-3 py-1.5 rounded-xl transition-colors shrink-0 cursor-pointer ${
                selectedType === 'midterm'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {language === 'ar' ? 'نصف الفصل (Midterm)' : 'Midterm'}
            </button>
            <button
              onClick={() => setSelectedType('practical')}
              className={`px-3 py-1.5 rounded-xl transition-colors shrink-0 cursor-pointer ${
                selectedType === 'practical'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {language === 'ar' ? 'العملي والمختبر' : 'Practical'}
            </button>
          </div>

          {/* Admin Add Exam Button */}
          {onOpenAddModal && (
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer shrink-0"
            >
              {isAdminUnlocked ? <Plus className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5 text-blue-200" />}
              <span>{language === 'ar' ? 'إضافة نموذج امتحاني' : 'Add Exam'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Exams Grid or Empty State */}
      {filteredExams.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 max-w-2xl mx-auto transition-colors">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            <HelpCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {language === 'ar' ? 'لا توجد نماذج امتحانية متطابقة' : 'No Exam Papers Available'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
              {language === 'ar'
                ? 'أرشيف الأسئلة الامتحانية متاح لإضافة نماذج الامتحانات الوزارية والجامعية مع الحلول النموذجية.'
                : 'The exam papers archive is ready for semester and final examination papers with solved keys.'}
            </p>
          </div>

          {onOpenAddModal && (
            <button
              onClick={onOpenAddModal}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-500/20 inline-flex items-center gap-2 cursor-pointer transition-all mx-auto"
            >
              {isAdminUnlocked ? <Plus className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
              <span>{language === 'ar' ? 'إضافة أول نموذج امتحاني (للمشرف)' : 'Add First Exam'}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredExams.map((exam) => {
            const subject = getSubject(exam.subjectId);

            return (
              <div
                key={exam.id}
                id={`exam-card-${exam.id}`}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-blue-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-600 shadow-xs hover:shadow-md transition-all p-5 sm:p-6 flex flex-col justify-between group"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900">
                        {subject ? (language === 'ar' ? subject.nameAr : subject.nameEn) : 'المادة الدراسية'}
                      </span>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {exam.academicYear}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {exam.solved && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{t.solved}</span>
                        </span>
                      )}
                      {isAdminUnlocked && onDeleteExam && (
                        <button
                          onClick={() => onDeleteExam(exam.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title={language === 'ar' ? 'حذف النموذج' : 'Delete'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-black text-blue-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {language === 'ar' ? exam.titleAr : exam.titleEn}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>المرحلة {exam.stage} • {exam.fileSize}</span>
                    </div>
                  </div>

                  {exam.solved && (exam.solvedByAr || exam.solvedByEn) && (
                    <div className="bg-emerald-50/50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="font-semibold">
                        {language === 'ar' ? `حل وتدقيق: ${exam.solvedByAr}` : `Solved by: ${exam.solvedByEn}`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                    PDF Document
                  </span>

                  <a
                    href="#download"
                    onClick={(e) => {
                      e.preventDefault();
                      alert(language === 'ar' ? `بدء تنزيل النموذج: ${exam.titleAr}` : `Downloading ${exam.titleEn}`);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t.downloadExam}</span>
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
