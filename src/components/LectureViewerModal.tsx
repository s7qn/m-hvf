import React from 'react';
import { 
  FileText, 
  Download, 
  ShieldCheck, 
  BookOpen, 
  Calendar, 
  User, 
  X, 
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { Lecture, Subject, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface LectureViewerModalProps {
  lecture: Lecture;
  subject?: Subject;
  language: Language;
  onClose: () => void;
  onStartQuiz: (lecture: Lecture) => void;
  isRead?: boolean;
  onToggleRead?: () => void;
}

export const LectureViewerModal: React.FC<LectureViewerModalProps> = ({
  lecture,
  subject,
  language,
  onClose,
  onStartQuiz,
  isRead = false,
  onToggleRead,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <div 
      id="lecture-viewer-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div 
        id="lecture-viewer-card"
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-blue-200 overflow-hidden flex flex-col my-auto max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-800 to-indigo-800 text-white p-5 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 text-[11px] font-bold border border-blue-400/30">
                {t.lectureNumberPrefix} {lecture.lectureNumber}
              </span>
              {subject && (
                <span className="text-xs font-semibold text-blue-200">
                  {language === 'ar' ? subject.nameAr : subject.nameEn}
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              {language === 'ar' ? lecture.titleAr : lecture.titleEn}
            </h2>
          </div>

          <button
            id="btn-close-lecture-viewer"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Metadata chips */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-600" />
              <span className="font-semibold">{t.instructor}:</span>
              <span>{language === 'ar' ? lecture.instructorAr : lecture.instructorEn}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="font-semibold">{t.uploadDate}:</span>
              <span>{lecture.uploadDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="font-semibold">{t.fileSize}:</span>
              <span>{lecture.fileSize} (PDF)</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-black text-blue-950">
              {language === 'ar' ? 'نبذة عن المحاضرة' : 'Lecture Overview'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {language === 'ar' ? lecture.descriptionAr : lecture.descriptionEn}
            </p>
          </div>

          {/* Key Topics Covered */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-black text-blue-950 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>{t.keyPoints}</span>
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {(language === 'ar' ? lecture.summaryPointsAr : lecture.summaryPointsEn).map((point, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Mathematical Formulas */}
          {lecture.keyFormulas && lecture.keyFormulas.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-black text-blue-950">
                {t.keyEquations}
              </h3>
              <div className="space-y-1.5 font-mono">
                {lecture.keyFormulas.map((eq, idx) => (
                  <div key={idx} className="bg-slate-900 text-blue-300 p-3 rounded-xl text-xs sm:text-sm border border-slate-800">
                    {eq}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attached Quiz Info Box */}
          <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-white border-2 border-indigo-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                  {language === 'ar' ? 'اختبار المحاضرة المؤمن' : 'Secured Lecture Quiz'}
                </span>
                <h4 className="text-sm font-bold text-indigo-950 mt-1">
                  {language === 'ar' ? lecture.quiz.titleAr : lecture.quiz.titleEn}
                </h4>
                <p className="text-xs text-slate-500">
                  {lecture.quiz.questions.length} {language === 'ar' ? 'أسئلة هندسية | بيئة سرية مانعة للغش' : 'Questions | Confidential & Anti-Cheat'}
                </p>
              </div>
            </div>

            <button
              id={`btn-launch-quiz-from-modal-${lecture.id}`}
              onClick={() => onStartQuiz(lecture)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all shrink-0"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{t.startQuiz}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="btn-download-from-viewer-modal"
              onClick={() => {
                if (lecture.fileUrl) {
                  const a = document.createElement('a');
                  a.href = lecture.fileUrl;
                  a.download = `${lecture.titleAr || 'Lecture'}.pdf`;
                  a.target = '_blank';
                  a.click();
                  return;
                }
                // Simulated direct text/PDF download
                const blob = new Blob([
                  `منصة سيطرة - هندسة تقنيات السيطرة والأتمتة\nالمحاضرة: ${lecture.titleAr}\nالأستاذ: ${lecture.instructorAr}\n\nأبرز المحاور:\n${lecture.summaryPointsAr.join('\n')}\n\nصنع بواسطة مصطفى احمد وحسن علوان`
                ], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Saytara-Lecture-${lecture.lectureNumber}.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>{lecture.fileUrl ? (language === 'ar' ? 'تحميل الملف المرفق' : 'Download File') : t.downloadPdf}</span>
            </button>

            {onToggleRead && (
              <button
                type="button"
                id={`btn-toggle-read-modal-${lecture.id}`}
                onClick={onToggleRead}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border shadow-xs ${
                  isRead
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                <CheckCircle className={`w-4 h-4 ${isRead ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>
                  {isRead
                    ? (language === 'ar' ? 'تمت القراءة بنجاح ✓' : 'Marked as Read ✓')
                    : (language === 'ar' ? 'تحديد كمقروءة' : 'Mark as Read')}
                </span>
              </button>
            )}
          </div>

          <button
            id="btn-close-viewer-footer"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors"
          >
            {language === 'ar' ? 'إغلاق المعاينة' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
