import React, { useState, useEffect } from 'react';
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
  Share2,
  Maximize2,
  UploadCloud,
  FileCheck
} from 'lucide-react';
import { Summary, Subject, Language } from '../types';
import { getCloudFile, downloadCloudFile } from '../services/cloudFileStorage';

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
  const [resolvedBlobUrl, setResolvedBlobUrl] = useState<string | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedFormulaIdx, setCopiedFormulaIdx] = useState<number | null>(null);

  const fileUrl = summary.downloadUrl || (summary as any).fileUrl;
  const hasFormulas = Boolean(summary.keyFormulas && summary.keyFormulas.length > 0);

  // Default to interactive text/reader tab so user enters smoothly without browser download prompts
  const [activeTab, setActiveTab] = useState<'text' | 'formulas' | 'document'>('text');
  const [fontSizeClass, setFontSizeClass] = useState<'text-sm' | 'text-base' | 'text-lg'>('text-base');
  const [searchQuery, setSearchQuery] = useState('');

  // Resolve cloud file for embedded in-app viewing (only if user explicitly switches to document tab)
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
        console.warn('[SummaryViewer] File resolution note:', err);
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

  // Real formulas only - NO suggested or fake formulas
  const formulas: string[] = summary.keyFormulas || [];

  const handleCopyAll = () => {
    const fullText = `ملخص: ${summary.titleAr}\n` +
      `المادة: ${subject?.nameAr || 'هندسة السيطرة'} (المرحلة ${summary.stage})\n` +
      `إعداد: ${summary.authorAr}\n\n` +
      `الوصف:\n${summary.descriptionAr}\n\n` +
      (formulas.length > 0 ? `أبرز القوانين والمعادلات:\n` + formulas.map((f, i) => `${i + 1}. ${f}`).join('\n') + '\n\n' : '') +
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

  const handleDownload = async () => {
    if (fileUrl) {
      const fileName = `${summary.titleAr || 'Summary'}.pdf`;
      const ok = await downloadCloudFile(fileUrl, fileName);
      if (ok) return;
    }

    const header = `جمهورية العراق - وزارة التعليم العالي والبحث العلمي\n` +
      `منصة سيطرة التعليمية\n` +
      `ملخص وبطاقة قوانين: ${summary.titleAr}\n` +
      `المادة: ${subject?.nameAr || 'هندسة السيطرة'}\n` +
      `المرحلة: ${summary.stage} | إعداد: ${summary.authorAr}\n` +
      `==================================================\n\n`;

    const body = `${summary.descriptionAr}\n\n` +
      (formulas.length > 0 ? `[أهم القوانين الهندسية المعتمدة]\n` + formulas.map((f, i) => `[${i + 1}] ${f}`).join('\n') + '\n\n' : '') +
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden transition-all my-auto">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shrink-0">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-500/30 text-blue-200 border border-blue-400/30">
                {language === 'ar' ? 'الملخصات وبطاقات القوانين' : 'Summaries & Formulas'}
              </span>
              {subject && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/10 text-blue-200">
                  {subject.code} — {language === 'ar' ? subject.nameAr : subject.nameEn}
                </span>
              )}
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-white/10 text-white">
                {language === 'ar' ? `المرحلة ${summary.stage}` : `Year ${summary.stage}`}
              </span>
              {fileUrl && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <FileCheck className="w-3 h-3" />
                  <span>{language === 'ar' ? 'الملف متوفر' : 'File Available'}</span>
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-xl font-black text-white truncate pt-0.5">
              {language === 'ar' ? summary.titleAr : summary.titleEn}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isAdminUnlocked && onEdit && (
              <button
                type="button"
                id="btn-edit-summary-from-modal"
                onClick={() => {
                  onClose();
                  onEdit(summary);
                }}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                title={language === 'ar' ? 'تعديل هذا الملخص' : 'Edit Summary'}
              >
                <Edit3 className="w-4 h-4" />
                <span className="hidden sm:inline">{language === 'ar' ? 'تعديل' : 'Edit'}</span>
              </button>
            )}

            <button
              id="btn-close-summary-viewer"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title={language === 'ar' ? 'إغلاق' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Mode Tabs (Seamless like Lectures) */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-100/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap shrink-0">
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              id="tab-summary-text"
              onClick={() => setActiveTab('text')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'text'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? '📖 قراءة نص الملخص' : 'Summary Reader'}</span>
            </button>

            {hasFormulas && (
              <button
                type="button"
                id="tab-summary-formulas"
                onClick={() => setActiveTab('formulas')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'formulas'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'ar' ? '📐 القوانين والمعادلات' : 'Formulas'}</span>
              </button>
            )}

            {fileUrl && (
              <button
                type="button"
                id="tab-summary-doc"
                onClick={() => setActiveTab('document')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'document'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? '📄 ملف PDF الأصلي' : 'Original PDF'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Font size adjuster for comfortable reading */}
            {activeTab === 'text' && (
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
              onClick={handleCopyAll}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title={language === 'ar' ? 'نسخ نص الملخص' : 'Copy Text'}
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">{language === 'ar' ? 'تم النسخ' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'نسخ' : 'Copy'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={language === 'ar' ? 'طباعة الملخص' : 'Print'}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'طباعة' : 'Print'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title={language === 'ar' ? 'تنزيل الملخص' : 'Download'}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'تنزيل' : 'Download'}</span>
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">

          {/* TAB 1: EMBEDDED PDF DOCUMENT VIEWER (Direct in-browser reading without download) */}
          {activeTab === 'document' && fileUrl && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>{summary.titleAr}</span>
                  <span className="text-slate-400 font-mono">({summary.fileSize})</span>
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
                    <span>{language === 'ar' ? 'جارٍ تحميل ملف الملخص من السحابة...' : 'Loading summary document...'}</span>
                  </div>
                )}
                <iframe
                  src={`${resolvedBlobUrl || fileUrl}#view=FitH`}
                  title={summary.titleAr}
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          )}

          {/* TAB 2: SUMMARY CONTENT & OVERVIEW */}
          {activeTab === 'text' && (
            <div className="space-y-5 max-w-3xl mx-auto">
              
              {/* Metadata Bar */}
              <div className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs flex-wrap">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {language === 'ar' ? 'إعداد وتوثيق:' : 'Author:'}
                  </span>
                  <span className="font-black text-slate-900 dark:text-white">
                    {language === 'ar' ? summary.authorAr : summary.authorEn}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-medium">
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
                <p className={`${fontSizeClass} leading-relaxed text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 whitespace-pre-line`}>
                  {language === 'ar' ? summary.descriptionAr : summary.descriptionEn}
                </p>
              </div>

              {/* Extended Content */}
              {summary.contentAr && (
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span>{language === 'ar' ? 'تفاصيل وشرح المادة' : 'Detailed Content'}</span>
                  </h3>
                  <div className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ${fontSizeClass} leading-relaxed whitespace-pre-line text-slate-700 dark:text-slate-300`}>
                    {summary.contentAr}
                  </div>
                </div>
              )}

              {/* Tags */}
              {summary.tagsAr && summary.tagsAr.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-2">
                  {summary.tagsAr.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-bold px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: KEY FORMULAS (ONLY REAL FORMULAS - NO SUGGESTED QUESTIONS OR FAKE FORMULAS) */}
          {activeTab === 'formulas' && hasFormulas && (
            <div className="space-y-3 max-w-3xl mx-auto">
              <div className="flex items-center justify-between pb-1">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{language === 'ar' ? 'القوانين والمعادلات المعتمدة في هذا الملخص' : 'Formulas Included'}</span>
                </h3>
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                  {formulas.length} {language === 'ar' ? 'معادلات' : 'formulas'}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {formulas.map((formula, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-blue-50/50 dark:bg-slate-800/70 border border-blue-200/80 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
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
          )}

        </div>

      </div>
    </div>
  );
};
