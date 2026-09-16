import React from 'react';
import { 
  ShieldCheck, 
  Clock, 
  HelpCircle, 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Play,
  FileText,
  Lock,
  GraduationCap,
  ShieldAlert
} from 'lucide-react';
import { Lecture, Subject, QuizAttempt, Stage, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface QuizzesViewProps {
  lectures: Lecture[];
  subjects: Subject[];
  attempts: Record<string, QuizAttempt>;
  selectedStage: Stage | 'all';
  language: Language;
  onStartQuiz: (lecture: Lecture) => void;
}

export const QuizzesView: React.FC<QuizzesViewProps> = ({
  lectures,
  subjects,
  attempts,
  selectedStage,
  language,
  onStartQuiz,
}) => {
  const t = TRANSLATIONS[language];

  const filteredLectures = lectures.filter(lec => {
    if (selectedStage !== 'all' && lec.stage !== selectedStage) return false;
    return true;
  });

  const getSubject = (subjectId: string) => subjects.find(s => s.id === subjectId);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white rounded-2xl p-6 sm:p-8 shadow-lg shadow-blue-950/20 relative overflow-hidden">
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{language === 'ar' ? 'نظام الاختبارات الإلكترونية المشفر والمؤمن' : 'Encrypted & Monitored Examination Portal'}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {t.tabQuizzes}
          </h2>

          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
            {t.quizzesHubDesc}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold text-blue-200">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {language === 'ar' ? 'منع النسخ والتحديد' : 'Anti-Copy Protection'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              {language === 'ar' ? 'حجب لقطات الشاشة' : 'Anti-Screenshot Shield'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              {language === 'ar' ? 'رصد مغادرة التبويب' : 'Anti Tab-Switch Detection'}
            </span>
          </div>
        </div>
      </div>

      {/* Quizzes List or Empty State */}
      {filteredLectures.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 max-w-2xl mx-auto transition-colors">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {language === 'ar' ? 'لا توجد اختبارات سرية حالياً' : 'No Secure Quizzes Available'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
              {language === 'ar'
                ? 'ترتبط الاختبارات بالملازم المرفوعة. عند إضافة ملزمة جديدة مع أسئلتها من تبويب المحاضرات والملازم، ستظهر الاختبارات السرية المؤمنة هنا تلقائياً.'
                : 'Quizzes are linked to uploaded lectures. When you add a lecture with its quiz questions from the Lectures tab, secure proctored exams will appear here.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredLectures.map((lecture) => {
            const subject = getSubject(lecture.subjectId);
            const attempt = attempts[lecture.quiz.id];

            return (
              <div
                key={lecture.id}
                id={`quiz-hub-card-${lecture.quiz.id}`}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-blue-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600 shadow-xs hover:shadow-md transition-all p-5 sm:p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 text-[11px] font-black border border-indigo-100 dark:border-indigo-900/60">
                        {t.lectureNumberPrefix} {lecture.lectureNumber}
                      </span>
                      {subject && (
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          {subject.code} — {language === 'ar' ? `المرحلة ${lecture.stage}` : `Year ${lecture.stage}`}
                        </span>
                      )}
                    </div>

                    {attempt ? (
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black flex items-center gap-1 border ${
                        attempt.passed 
                          ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                          : 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                      }`}>
                        {attempt.passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        <span>{language === 'ar' ? 'الدرجة:' : 'Score:'} %{attempt.percentage}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        {language === 'ar' ? 'لم يُختبر بعد' : 'Not Taken'}
                      </span>
                    )}
                  </div>

                  <div>
                    {subject && (
                      <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                        {language === 'ar' ? subject.nameAr : subject.nameEn}
                      </p>
                    )}
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      {language === 'ar' ? lecture.quiz.titleAr : lecture.quiz.titleEn}
                    </h3>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-around text-xs text-center">
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block text-[10px] font-bold uppercase">{language === 'ar' ? 'الأسئلة' : 'Questions'}</span>
                      <span className="font-black text-slate-800 dark:text-slate-200">{lecture.quiz.questions.length}</span>
                    </div>
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block text-[10px] font-bold uppercase">{language === 'ar' ? 'المدة' : 'Duration'}</span>
                      <span className="font-black text-slate-800 dark:text-slate-200">{lecture.quiz.durationMinutes} {language === 'ar' ? 'دقيقة' : 'min'}</span>
                    </div>
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block text-[10px] font-bold uppercase">{language === 'ar' ? 'النجاح' : 'Pass mark'}</span>
                      <span className="font-black text-emerald-700 dark:text-emerald-400">%{lecture.quiz.passingScore}</span>
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>{language === 'ar' ? 'مراقبة أمنية مباشرة' : 'Live Proctored'}</span>
                  </span>

                  <button
                    id={`btn-launch-secure-quiz-${lecture.quiz.id}`}
                    onClick={() => onStartQuiz(lecture)}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{attempt ? (language === 'ar' ? 'إعادة الاختبار' : 'Retake Exam') : (language === 'ar' ? 'بدء الاختبار السري' : 'Start Secure Quiz')}</span>
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
