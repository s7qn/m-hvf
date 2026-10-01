import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  Copy, 
  Check, 
  Edit3, 
  Printer, 
  Calendar, 
  User, 
  Tag, 
  Sparkles, 
  BookOpen, 
  Layers,
  Share2
} from 'lucide-react';
import { Summary, Subject, Language } from '../types';

interface SummaryViewerModalProps {
  summary: Summary;
  subject?: Subject;
  language: Language;
  onClose: () => void;
  onEdit?: (summary: Summary) => void;
  isAdminUnlocked?: boolean;
}

export const SummaryViewerModal: React.FC<SummaryViewerModalProps> = ({
  summary,
  subject,
  language,
  onClose,
  onEdit,
  isAdminUnlocked = false,
}) => {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedFormulaIdx, setCopiedFormulaIdx] = useState<number | null>(null);

  // Standard fallback formulas based on subject if none explicitly attached
  const formulas: string[] = summary.keyFormulas && summary.keyFormulas.length > 0 
    ? summary.keyFormulas 
    : [
        'G(s) = Y(s) / R(s) = (b0*s^m + ... + bm) / (a0*s^n + ... + an)',
        'Characteristic Equation: 1 + G(s)H(s) = 0',
        'Steady-State Error: ess = lim(s->0) s * E(s) = lim(s->0) [s * R(s) / (1 + G(s))]',
        'Second-Order Form: s^2 + 2*zeta*omega_n*s + omega_n^2 = 0'
      ];

  const handleCopyAll = () => {
    const fullText = `ملخص: ${summary.titleAr}\n` +
      `المادة: ${subject?.nameAr || 'هندسة السيطرة'} (المرحلة ${summary.stage})\n` +
      `إعداد: ${summary.authorAr}\n\n` +
      `الوصف:\n${summary.descriptionAr}\n\n` +
      `أبرز القوانين والمعادلات:\n` +
      formulas.map((f, i) => `${i + 1}. ${f}`).join('\n') + '\n\n' +
      (summary.contentAr ? `المحتوى التفصيلي:\n${summary.contentAr}\n\n` : '') +
      `الوسوم: ${(summary.tagsAr || []).join('، ')}\n` +
      `منصة سيطرة التعليمية`;

    navigator.clipboard.writeText(fullText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleCopyFormula = (formula: string, idx: number) => {
    navigator.clipboard.writeText(formula);
    setCopiedFormulaIdx(idx);
    setTimeout(() => setCopiedFormulaIdx(null), 2000);
  };

  const handleDownload = () => {
    if (summary.downloadUrl) {
      const a = document.createElement('a');
      a.href = summary.downloadUrl;
      a.download = `${summary.titleAr}.pdf`;
      a.target = '_blank';
      a.click();
      return;
    }

    const header = `جمهورية العراق - وزارة التعليم العالي والبحث العلمي\n` +
      `منصة سيطرة التعليمية\n` +
      `ملخص وبطاقة قوانين: ${summary.titleAr}\n` +
      `المادة: ${subject?.nameAr || 'هندسة السيطرة'}\n` +
      `المرحلة: ${summary.stage} | إعداد: ${summary.authorAr}\n` +
      `==================================================\n\n`;

    const body = `${summary.descriptionAr}\n\n` +
      `[أهم القوانين الهندسية والمعادلات المعتمدة]\n` +
      formulas.map((f, i) => `[${i + 1}] ${f}`).join('\n') + '\n\n' +
      (summary.contentAr ? `[المحتوى والشرح النصي]\n${summary.contentAr}\n\n` : '') +
      `==================================================\n` +
      `الوسوم: ${(summary.tagsAr || []).join(', ')}`;

    const blob = new Blob([header + body], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${summary.titleAr.replace(/\s+/g, '_')}_ملخص.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden transition-all">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-gradient-to-r from-blue-50/60 to-indigo-50/40 dark:from-slate-800/60 dark:to-slate-900">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-600 text-white shadow-xs">
                {language === 'ar' ? 'معاينة الملخص والقوانين' : 'Summary Preview'}
              </span>
              {subject && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-slate-700">
                  {subject.code} — {language === 'ar' ? subject.nameAr : subject.nameEn}
                </span>
              )}
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {language === 'ar' ? `المرحلة ${summary.stage}` : `Year ${summary.stage}`}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white pt-1">
              {language === 'ar' ? summary.titleAr : summary.titleEn}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(summary);
                }}
                className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                title={language === 'ar' ? 'تعديل معلومات هذا الملخص' : 'Edit Summary'}
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

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200">
          
          {/* Metadata Bar */}
          <div className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs flex-wrap">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {language === 'ar' ? 'إعداد وتوثيق:' : 'Author:'}
              </span>
              <span className="font-black text-slate-900 dark:text-white">
                {language === 'ar' ? summary.authorAr : summary.authorEn}
              </span>
            </div>

            <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{summary.date}</span>
              </span>
              <span>•</span>
              <span>{summary.pagesCount} {language === 'ar' ? 'صفحات' : 'pages'}</span>
              <span>•</span>
              <span className="font-mono">{summary.fileSize}</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{language === 'ar' ? 'نظرة عامة وشرح المحتوى' : 'Overview & Summary Content'}</span>
            </h3>
            <p className="text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              {language === 'ar' ? summary.descriptionAr : summary.descriptionEn}
            </p>
          </div>

          {/* Key Formulas Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{language === 'ar' ? 'بطاقة القوانين والمعادلات الأساسية' : 'Key Engineering Formulas'}</span>
              </h3>
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                {formulas.length} {language === 'ar' ? 'معادلات' : 'formulas'}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {formulas.map((formula, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-blue-50/50 dark:bg-slate-800/70 border border-blue-200/80 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-500 transition-colors group"
                >
                  <div className="flex items-center gap-2.5 overflow-x-auto py-0.5">
                    <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-mono text-xs sm:text-sm font-black text-blue-950 dark:text-blue-200 whitespace-nowrap">
                      {formula}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyFormula(formula, idx)}
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 text-xs flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                    title={language === 'ar' ? 'نسخ المعادلة' : 'Copy Formula'}
                  >
                    {copiedFormulaIdx === idx ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[10px] font-bold text-emerald-600">{language === 'ar' ? 'تم' : 'Done'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold hidden sm:inline">{language === 'ar' ? 'نسخ' : 'Copy'}</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Optional Extended Text / Notes */}
          {summary.contentAr && (
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>{language === 'ar' ? 'الشرح والملاحظات التوثيقية' : 'Extended Text & Notes'}</span>
              </h3>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-mono whitespace-pre-wrap leading-relaxed text-slate-800 dark:text-slate-200">
                {summary.contentAr}
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span>{language === 'ar' ? 'الوسوم والمواضيع المرتبطة' : 'Tags & Categories'}</span>
            </h3>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(language === 'ar' ? summary.tagsAr : summary.tagsEn).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyAll}
              className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">{language === 'ar' ? 'تم نسخ كامل المحتوى!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'نسخ الملخص' : 'Copy All'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="طباعة"
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
              <span>{language === 'ar' ? 'تنزيل بطاقة الملخص' : 'Download Sheet'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
