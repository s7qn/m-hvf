import React, { useState, useEffect } from 'react';
import { 
  X, 
  HelpCircle, 
  Download, 
  Printer, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  FileText, 
  Edit3, 
  BookOpen, 
  Check, 
  Copy, 
  Award,
  AlertCircle,
  Eye,
  Maximize2,
  UploadCloud,
  FileCheck,
  CheckCircle,
  ShieldCheck
} from 'lucide-react';
import { ExamQuestionPaper, Subject, Language } from '../types';
import { getCloudFile, downloadCloudFile } from '../services/cloudFileStorage';

interface ExamViewerModalProps {
  exam: ExamQuestionPaper;
  subject?: Subject;
  language: Language;
  onClose: () => void;
  onEdit?: (exam: ExamQuestionPaper) => void;
  isAdminUnlocked?: boolean;
}

export const ExamViewerModal: React.FC<ExamViewerModalProps> = ({
  exam,
  subject,
  language,
  onClose,
  onEdit,
  isAdminUnlocked = false,
}) => {
  const [resolvedBlobUrl, setResolvedBlobUrl] = useState<string | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [fontSizeClass, setFontSizeClass] = useState<'text-sm' | 'text-base' | 'text-lg'>('text-base');

  const fileUrl = exam.downloadUrl || (exam as any).fileUrl;
  
  // Default to 'questions' reader tab for smooth in-app reading without browser download popups
  const [activeTab, setActiveTab] = useState<'questions' | 'solution' | 'document'>('questions');

  // Resolve cloud file only when user explicitly switches to document tab
  useEffect(() => {
    let active = true;
    if (fileUrl && activeTab === 'document') {
      setIsLoadingFile(true);
      getCloudFile(fileUrl).then(res => {
        if (active && res && res.blobUrl) {
          setResolvedBlobUrl(res.blobUrl);
        } else if (active) {
          setResolvedBlobUrl(fileUrl);
        }
        if (active) setIsLoadingFile(false);
      }).catch(err => {
        console.warn('[ExamViewer] File resolution note:', err);
        if (active) {
          setResolvedBlobUrl(fileUrl);
          setIsLoadingFile(false);
        }
      });
    }
    return () => {
      active = false;
    };
  }, [fileUrl, activeTab]);

  const examTypeLabels: Record<string, { ar: string; en: string }> = {
    final: { ar: 'الامتحان النهائي (Final Exam)', en: 'Final Exam' },
    midterm: { ar: 'امتحان نصف الفصل (Midterm Exam)', en: 'Midterm Exam' },
    practical: { ar: 'الامتحان العملي والمختبري', en: 'Practical Lab Exam' },
    quiz: { ar: 'اختبار قصير (Quiz)', en: 'Class Quiz' },
  };

  const fullQuestionsText = exam.questionsTextAr || exam.notesAr || (
    language === 'ar'
      ? `نموذج الأسئلة الرسمي لمادة ${subject?.nameAr || 'المادة الدراسية'}\nالعام الدراسي: ${exam.academicYear} | الدور: ${examTypeLabels[exam.type]?.ar || exam.type}\nالمرحلة: ${exam.stage}\n\nتعليمات الامتحان:\n1. الإجابة عن جميع الأسئلة بدقة مع كتابة القوانين الهندسية المعتمدة.\n2. يُسمح باستخدام الحاسبة الهندسية غير القابلة للبرمجة.\n3. توضيح خطوات الحل الرياضي والرسم التخطيطي للدوائر ومخططات السيطرة.`
      : `Official examination questions for ${subject?.nameEn || 'Subject'}\nAcademic Year: ${exam.academicYear}\n\nInstructions:\n1. Answer all questions clearly with accredited engineering formulas.\n2. Non-programmable scientific calculators are permitted.\n3. Show all mathematical derivations and block diagrams.`
  );

  const fullSolutionText = exam.solutionTextAr || (
    exam.solved
      ? (language === 'ar'
          ? `الحل النموذجي المعتمد لنموذج: ${exam.titleAr}\nتدقيق ومراجعة: ${exam.solvedByAr || 'اللجنة العلمية وقسم هندسة السيطرة'}\n\nخطوات الحل النموذجي:\n- تم تدقيق جميع المعادلات الحسابية وجداول الحقيقة ونماذج الاستقرارية وفق المعايير الوزارية والجامعية المعتمدة.\n- التفاصيل الكاملة والخطوات الحسابية مطابقة لمفردات المنهج المعتمد.`
          : `Verified model solution for ${exam.titleEn || exam.titleAr}\nReviewed by: ${exam.solvedByEn || exam.solvedByAr || 'Scientific Department'}\n\nAll formulas and step-by-step derivations are checked according to university standards.`)
      : null
  );

  const handleCopyQuestions = () => {
    const header = `جمهورية العراق - وزارة التعليم العالي والبحث العلمي\nقسم هندسة السيطرة والأتمتة\n` +
      `النموذج الامتحاني: ${exam.titleAr}\nالمادة: ${subject?.nameAr || 'المادة'} (المرحلة ${exam.stage})\n` +
      `العام الدراسي: ${exam.academicYear} | ${examTypeLabels[exam.type]?.ar || exam.type}\n\n`;

    navigator.clipboard.writeText(header + fullQuestionsText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleDownload = async () => {
    if (fileUrl) {
      const fileName = `${exam.titleAr || 'Exam'}.pdf`;
      const ok = await downloadCloudFile(fileUrl, fileName);
      if (ok) return;
    }

    const header = `جمهورية العراق - وزارة التعليم العالي والبحث العلمي\n` +
      `قسم هندسة السيطرة والأتمتة\n` +
      `النموذج الامتحاني: ${exam.titleAr}\n` +
      `المادة: ${subject?.nameAr || 'المادة الدراسية'} (المرحلة ${exam.stage})\n` +
      `العام الدراسي: ${exam.academicYear} | الدور: ${examTypeLabels[exam.type]?.ar || exam.type}\n` +
      (exam.solved ? `حالة الحل: معتمد ومدقق بواسطة (${exam.solvedByAr || 'اللجنة العلمية'})\n` : '') +
      `======================================================================\n\n` +
      `[نص ورقة الأسئلة والتعليمات]:\n${fullQuestionsText}\n\n` +
      (fullSolutionText ? `======================================================================\n[الحل النموذجي المعتمد]:\n${fullSolutionText}\n\n` : '');

    const blob = new Blob([header], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exam.titleAr.replace(/\s+/g, '_')}_الامتحان.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden transition-all my-auto">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shrink-0">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-500/30 text-blue-200 border border-blue-400/30">
                {language === 'ar' ? 'أرشيف الأسئلة والامتحانات' : 'Exam Archive'}
              </span>
              {subject && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/10 text-blue-200">
                  {subject.code} — {language === 'ar' ? subject.nameAr : subject.nameEn}
                </span>
              )}
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-white/10 text-white">
                {exam.academicYear}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                {examTypeLabels[exam.type]?.ar || exam.type}
              </span>
              {exam.solved && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'حل نموذجي معتمد' : 'Solved'}</span>
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-xl font-black text-white truncate pt-0.5">
              {language === 'ar' ? exam.titleAr : exam.titleEn}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onEdit && (
              <button
                type="button"
                id="btn-edit-exam-from-modal"
                onClick={() => {
                  onClose();
                  onEdit(exam);
                }}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                title={language === 'ar' ? 'تعديل هذا النموذج' : 'Edit Exam'}
              >
                <Edit3 className="w-4 h-4" />
                <span className="hidden sm:inline">{language === 'ar' ? 'تعديل' : 'Edit'}</span>
              </button>
            )}

            <button
              id="btn-close-exam-viewer"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title={language === 'ar' ? 'إغلاق' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Mode Tabs (Smooth & In-App like Lectures) */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-100/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap shrink-0">
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              id="tab-exam-questions"
              onClick={() => setActiveTab('questions')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'questions'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? '📝 ورقة الأسئلة والنموذج' : 'Questions Sheet'}</span>
            </button>

            {(exam.solved || fullSolutionText) && (
              <button
                type="button"
                id="tab-exam-solution"
                onClick={() => setActiveTab('solution')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'solution'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'ar' ? '✅ الحل النموذجي المعتمد' : 'Model Answer'}</span>
              </button>
            )}

            {fileUrl && (
              <button
                type="button"
                id="tab-exam-doc"
                onClick={() => setActiveTab('document')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'document'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? '📄 ملف PDF الأصلي' : 'Original PDF'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Font size adjuster for comfortable reading */}
            {activeTab !== 'document' && (
              <div className="hidden sm:flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setFontSizeClass('text-sm')}
                  className={`px-2 py-0.5 text-xs font-bold rounded ${fontSizeClass === 'text-sm' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : 'text-slate-500 hover:text-slate-800'}`}
                  title="خط صغير"
                >
                  A-
                </button>
                <button
                  type="button"
                  onClick={() => setFontSizeClass('text-base')}
                  className={`px-2 py-0.5 text-xs font-bold rounded ${fontSizeClass === 'text-base' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : 'text-slate-500 hover:text-slate-800'}`}
                  title="خط متوسط"
                >
                  A
                </button>
                <button
                  type="button"
                  onClick={() => setFontSizeClass('text-lg')}
                  className={`px-2 py-0.5 text-xs font-bold rounded ${fontSizeClass === 'text-lg' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : 'text-slate-500 hover:text-slate-800'}`}
                  title="خط كبير"
                >
                  A+
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleCopyQuestions}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title={language === 'ar' ? 'نسخ نص الأسئلة' : 'Copy Questions'}
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">{language === 'ar' ? 'تم النسخ' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'نسخ الأسئلة' : 'Copy'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={language === 'ar' ? 'طباعة ورقة الامتحان' : 'Print'}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'طباعة' : 'Print'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title={language === 'ar' ? 'تنزيل ورقة الامتحان' : 'Download'}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'تنزيل' : 'Download'}</span>
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* TAB 1: IN-APP QUESTIONS SHEET READER (Smooth, direct reading with NO forced download) */}
          {activeTab === 'questions' && (
            <div className="space-y-4 max-w-4xl mx-auto animate-fadeIn">
              
              {/* Official Academic Exam Header */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-blue-50/80 to-slate-50 dark:from-slate-800/80 dark:to-slate-900 border-2 border-blue-200 dark:border-slate-700 text-center space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span>جمهورية العراق - وزارة التعليم العالي والبحث العلمي</span>
                  <span>قسم هندسة السيطرة والأتمتة</span>
                </div>

                <div className="py-1">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    {language === 'ar' ? exam.titleAr : exam.titleEn}
                  </h3>
                  <p className="text-xs text-blue-700 dark:text-blue-300 font-bold mt-0.5">
                    {subject ? (language === 'ar' ? subject.nameAr : subject.nameEn) : 'المادة الدراسية'} — المرحلة {exam.stage}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 sm:gap-6 text-xs text-slate-600 dark:text-slate-300 flex-wrap font-medium pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>العام الدراسي: <strong>{exam.academicYear}</strong></span>
                  </span>
                  <span>•</span>
                  <span>الدور: <strong>{examTypeLabels[exam.type]?.ar || exam.type}</strong></span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>الوقت المخصص: <strong>3 ساعات</strong></span>
                  </span>
                </div>
              </div>

              {/* Exam Question Content */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>{language === 'ar' ? 'الأسئلة والمسائل الهندسية' : 'Questions & Engineering Problems'}</span>
                  </span>

                  {fileUrl && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('document')}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'عرض الوثيقة الأصلية المرفقة (PDF)' : 'View Attached PDF Document'}</span>
                    </button>
                  )}
                </div>

                <div className={`${fontSizeClass} leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line font-medium space-y-2`}>
                  {fullQuestionsText}
                </div>
              </div>

              {/* Solved Status Callout */}
              {exam.solved && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div className="text-xs">
                      <span className="font-black text-emerald-900 dark:text-emerald-200 block">
                        {language === 'ar' ? 'الحل النموذجي المعتمد متوفر لهذا النموذج' : 'Model Answer Available'}
                      </span>
                      <span className="text-emerald-700 dark:text-emerald-300">
                        {language === 'ar' ? `تدقيق وحل: ${exam.solvedByAr || 'اللجنة العلمية'}` : `Verified by: ${exam.solvedByEn || exam.solvedByAr}`}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('solution')}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'الانتقال إلى الحل النموذجي' : 'View Solution'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MODEL SOLUTION (Step-by-step verified engineering answer key) */}
          {activeTab === 'solution' && (
            <div className="space-y-4 max-w-4xl mx-auto animate-fadeIn">
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <h3 className="text-sm font-black text-emerald-950 dark:text-emerald-100">
                      {language === 'ar' ? 'الحل النموذجي المعتمد والتدقيق الهندسي' : 'Verified Engineering Model Solution'}
                    </h3>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                      {language === 'ar' ? `إعداد وتدقيق: ${exam.solvedByAr || 'اللجنة العلمية وقسم السيطرة'}` : `Reviewed by: ${exam.solvedByEn || exam.solvedByAr || 'Department'}`}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('questions')}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-bold hover:bg-emerald-50 transition-colors cursor-pointer"
                >
                  {language === 'ar' ? 'العودة لورقة الأسئلة' : 'Back to Questions'}
                </button>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
                <div className={`${fontSizeClass} leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line font-medium`}>
                  {fullSolutionText}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ORIGINAL PDF EMBEDDED VIEWER (Direct in-browser reading without download) */}
          {activeTab === 'document' && fileUrl && (
            <div className="space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>{exam.titleAr}</span>
                  <span className="text-slate-400 font-mono">({exam.fileSize})</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const target = resolvedBlobUrl || fileUrl;
                    if (target) window.open(target, '_blank');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'فتح بملء الشاشة' : 'Full Screen'}</span>
                </button>
              </div>

              <div className="w-full h-[65vh] rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-inner relative">
                {isLoadingFile && (
                  <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-10 text-white font-bold text-xs gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{language === 'ar' ? 'جارٍ تحميل ورقة الامتحان من السحابة...' : 'Loading exam paper...'}</span>
                  </div>
                )}
                <iframe
                  src={`${resolvedBlobUrl || fileUrl}#view=FitH`}
                  title={exam.titleAr}
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
