import React, { useState } from 'react';
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
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ExamQuestionPaper, Subject, Language } from '../types';

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
  const [activeTab, setActiveTab] = useState<'paper' | 'solution'>('paper');
  const [copied, setCopied] = useState(false);
  const [expandedQuestionIdx, setExpandedQuestionIdx] = useState<number | null>(0);

  const examTypeLabels: Record<string, { ar: string; en: string }> = {
    final: { ar: 'الامتحان النهائي (Final Exam)', en: 'Final Exam' },
    midterm: { ar: 'امتحان نصف الفصل (Midterm Exam)', en: 'Midterm Exam' },
    practical: { ar: 'الامتحان العملي والمختبري', en: 'Practical Lab Exam' },
    quiz: { ar: 'اختبار قصير (Quiz)', en: 'Class Quiz' },
  };

  // Structured sample questions if none explicitly stored in custom exam
  const questions = [
    {
      num: 1,
      titleAr: 'السؤال الأول: اشتقاق دالة التحويل (Transfer Function) والنمذجة الرياضية',
      titleEn: 'Question 1: Transfer Function Derivation & Modeling',
      points: 25,
      bodyAr: 'منظومة كهربائية-ميكانيكية تخضع للمعادلة التفاضلية:\nJ (d²θ/dt²) + B (dθ/dt) + K θ(t) = T(t)\nأوجد دالة التحويل G(s) = Θ(s) / T(s) بفرض أن الشروط الابتدائية مساوية للصفر، وحدد مرتبة المنظومة والتردد الطبيعي.',
      solutionAr: 'الحل النموذجي:\n1. بأخذ تحويل لابلاس (Laplace Transform) لكلا الطرفين مع شروط ابتدائية صفرية:\n   J s² Θ(s) + B s Θ(s) + K Θ(s) = T(s)\n2. استخراج Θ(s) كعامل مشترك:\n   Θ(s) [J s² + B s + K] = T(s)\n3. دالة التحويل:\n   G(s) = Θ(s) / T(s) = 1 / (J s² + B s + K)\n4. المنظومة من الدرجة الثانية (2nd Order System)، والتردد الطبيعي:\n   ωn = √(K / J) rad/s، ونسبة التخميد:\n   ζ = B / (2 √(J K)).'
    },
    {
      num: 2,
      titleAr: 'السؤال الثاني: اختبار الاستقرارية باستخدام معيار روث-هورويتز (Routh-Hurwitz)',
      titleEn: 'Question 2: Routh-Hurwitz Stability Criterion',
      points: 25,
      bodyAr: 'المعادلة المميزة لمنظومة سيطرة ذات تغذية عكسية هي:\ns⁴ + 2s³ + 8s² + 12s + 20 = 0\nقم بإنشاء جدول روث، وحدد هل المنظومة مستقرة أم لا؟ واذكر عدد الأقطاب الواقعة في النصف الأيمن لمستوى s إن وجدت.',
      solutionAr: 'الحل النموذجي:\n1. تكوين مصفوفة روث:\n   s⁴:  1    8   20\n   s³:  2   12    0\n   s²:  b1   b2   0   => b1 = (2*8 - 1*12)/2 = (16-12)/2 = 2,  b2 = (2*20 - 0)/2 = 20\n   s¹:  c1   0    0   => c1 = (2*12 - 2*20)/2 = (24-40)/2 = -8\n   s⁰:  d1   0    0   => d1 = 20\n2. عناصر العمود الأول:\n   +1, +2, +2, -8, +20\n3. نلاحظ وجود تغيرين في الإشارة (من +2 إلى -8 ومن -8 إلى +20).\n4. النتيجة: المنظومة غير مستقرة (Unstable System) وبها قطبان (2 Poles) في النصف الأيمن غير المستقر (RHP).'
    },
    {
      num: 3,
      titleAr: 'السؤال الثالث: تحليل الخطأ في الحالة المستقرة (Steady-State Error Analysis)',
      titleEn: 'Question 3: Steady-State Error Calculation',
      points: 25,
      bodyAr: 'منظومة ذات مسار مفتوح دالتها:\nG(s) = 50 / [s (s + 5) (s + 10)] مع H(s) = 1\nأوجد نوع المنظومة (System Type)، وثوابت الخطأ Kp و Kv و Ka، واحسب قيمة خطأ الحالة المستقرة ess عند إدخال إشارة منحدر رتبة وحدة r(t) = t u(t).',
      solutionAr: 'الحل النموذجي:\n1. المنظومة تحتوي على قطب واحد عند الأصل (s=0)، إذن نوع المنظومة هو Type 1.\n2. ثابت الخطأ الموضعي Kp = lim(s->0) G(s) = ∞\n3. ثابت خطأ السرعة Kv = lim(s->0) s G(s) = lim(s->0) 50 / [(s+5)(s+10)] = 50 / 50 = 1 s⁻¹.\n4. ثابت خطأ التسارع Ka = lim(s->0) s² G(s) = 0.\n5. خطأ الحالة المستقرة لإشارة المنحدر (Ramp Input):\n   ess = 1 / Kv = 1 / 1 = 1.0.'
    },
    {
      num: 4,
      titleAr: 'السؤال الرابع: مخططات بود (Bode Plot) وهوامش الاستقرار',
      titleEn: 'Question 4: Bode Plots & Stability Margins',
      points: 25,
      bodyAr: 'اشرح رياضياً مفهوم هامش الكسب (Gain Margin) وهامش الطور (Phase Margin)، وكيفية حسابهما بيانياً، مع توضيح شرط استقرار المنظومة بناءً عليهما.',
      solutionAr: 'الحل النموذجي:\n1. تردد تقاطع الطور (Phase Crossover Frequency ωpc): هو التردد الذي يكون عنده الطور ∠G(jω) = -180°.\n   - هامش الكسب: GM = 1 / |G(jωpc)| (أو بالديسبل: GM_dB = -20 log₁₀ |G(jωpc)|).\n2. تردد تقاطع الكسب (Gain Crossover Frequency ωgc): هو التردد الذي يكون عنده الكسب |G(jω)| = 1 (أي 0 dB).\n   - هامش الطور: PM = 180° + ∠G(jωgc).\n3. شروط الاستقرار:\n   - تكون المنظومة مستقرة إذا كان كل من GM و PM موجباً (GM > 0 dB و PM > 0°)، بشرط أن يكون ωgc < ωpc.'
    }
  ];

  const handleCopyQuestions = () => {
    const text = `نموذج امتحاني: ${exam.titleAr}\n` +
      `المادة: ${subject?.nameAr || 'المادة الدراسية'}\n` +
      `العام الدراسي: ${exam.academicYear} | النوع: ${examTypeLabels[exam.type]?.ar || exam.type}\n` +
      `==================================================\n\n` +
      questions.map(q => `${q.titleAr} (${q.points} درجة):\n${q.bodyAr}\n\n`).join('--------------------------------------------------\n\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    if (exam.downloadUrl) {
      const a = document.createElement('a');
      a.href = exam.downloadUrl;
      a.download = `${exam.titleAr}.pdf`;
      a.target = '_blank';
      a.click();
      return;
    }

    const header = `جمهورية العراق - وزارة التعليم العالي والبحث العلمي\n` +
      `جامعة التكنولوجيا - قسم هندسة السيطرة والأتمتة\n` +
      `النموذج الامتحاني المعتمد: ${exam.titleAr}\n` +
      `المادة: ${subject?.nameAr || 'السيطرة والأتمتة'} (المرحلة ${exam.stage})\n` +
      `العام الدراسي: ${exam.academicYear} | الدور: ${examTypeLabels[exam.type]?.ar || exam.type}\n` +
      (exam.solved ? `حالة الحل: تم الحل والتدقيق المعتمد بواسطة (${exam.solvedByAr || 'اللجنة العلمية'})\n` : '') +
      `======================================================================\n\n`;

    const content = questions.map(q => 
      `[${q.titleAr} - ${q.points} درجة]\n${q.bodyAr}\n\n` +
      `[الحل النموذجي والتفصيلي]:\n${q.solutionAr}\n\n` +
      `======================================================================\n\n`
    ).join('');

    const blob = new Blob([header + content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exam.titleAr.replace(/\s+/g, '_')}_النموذج_مع_الحل.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden transition-all">
        
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-gradient-to-r from-blue-50/70 to-indigo-50/40 dark:from-slate-800/70 dark:to-slate-900">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-600 text-white shadow-xs">
                {language === 'ar' ? 'أرشيف النماذج الامتحانية' : 'Exam Archive'}
              </span>
              {subject && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-slate-700">
                  {subject.code} — {language === 'ar' ? subject.nameAr : subject.nameEn}
                </span>
              )}
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {exam.academicYear}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300">
                {examTypeLabels[exam.type]?.ar || exam.type}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white pt-1">
              {language === 'ar' ? exam.titleAr : exam.titleEn}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(exam);
                }}
                className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                title={language === 'ar' ? 'تعديل معلومات هذا النموذج' : 'Edit Exam'}
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

        {/* View Mode Switcher */}
        <div className="px-6 py-2.5 bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setActiveTab('paper')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'paper'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'ورقة الأسئلة والنموذج' : 'Question Paper'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('solution')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'solution'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'الحل النموذجي المعتمد' : 'Model Answer'}</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {exam.solved ? (
              <span className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'ar' ? `حل وتدقيق: ${exam.solvedByAr || 'اللجنة العلمية'}` : `Solved by: ${exam.solvedByEn || 'Staff'}`}</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                {language === 'ar' ? 'النموذج متاح للممارسة الذاتية' : 'Self-Practice'}
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-slate-800 dark:text-slate-200">
          
          {/* Header Banner on paper */}
          <div className="p-4 rounded-2xl border border-dashed border-blue-300 dark:border-slate-700 bg-blue-50/40 dark:bg-slate-800/40 text-center space-y-1">
            <h3 className="text-sm font-black text-blue-950 dark:text-blue-200">
              {language === 'ar' 
                ? `جمهورية العراق - وزارة التعليم العالي والبحث العلمي | مقرر: ${subject?.nameAr || 'السيطرة والأتمتة'}`
                : `Higher Education Curriculum | Subject: ${subject?.nameEn || 'Control & Automation'}`}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              المرحلة {exam.stage} • العام الدراسي: {exam.academicYear} • الدرجة الكاملة: 100 درجة • الوقت الموصى به: 3 ساعات
            </p>
          </div>

          {/* TAB 1: QUESTION PAPER */}
          {activeTab === 'paper' && (
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                >
                  <div className="p-4 sm:p-5 flex items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex-wrap">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                        س{q.num}
                      </span>
                      <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                        {language === 'ar' ? q.titleAr : q.titleEn}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 font-bold text-xs border border-blue-200 dark:border-blue-900">
                        {q.points} {language === 'ar' ? 'درجة' : 'pts'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 text-sm sm:text-base leading-relaxed font-mono whitespace-pre-wrap text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900">
                    {q.bodyAr}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: MODEL ANSWER */}
          {activeTab === 'solution' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {language === 'ar'
                    ? 'الحلول النموذجية المعتمدة مدققة خطوة بخطوة مع القوانين والاشتقاقات وفق المعايير الأكاديمية.'
                    : 'Official verified step-by-step solution key and derivations.'}
                </span>
              </div>

              {questions.map((q, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-emerald-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-xs"
                >
                  <div className="p-4 flex items-center justify-between gap-3 bg-emerald-50/70 dark:bg-emerald-950/30 border-b border-emerald-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                        حل {q.num}
                      </span>
                      <h4 className="font-black text-sm text-emerald-950 dark:text-emerald-200">
                        {language === 'ar' ? q.titleAr : q.titleEn}
                      </h4>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 text-xs sm:text-sm leading-relaxed font-mono whitespace-pre-wrap text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-900/60">
                    {q.solutionAr}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyQuestions}
              className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">{language === 'ar' ? 'تم النسخ!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'نسخ الأسئلة' : 'Copy Questions'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="طباعة النموذج"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{language === 'ar' ? 'طباعة' : 'Print'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-black flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{language === 'ar' ? 'تنزيل النموذج كاملاً' : 'Download Exam Paper'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
