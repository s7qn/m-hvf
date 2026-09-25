import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Download, 
  ShieldCheck, 
  BookOpen, 
  Calendar, 
  User, 
  X, 
  CheckCircle,
  Copy,
  Check,
  Printer,
  Search,
  ChevronRight,
  ChevronLeft,
  Layers,
  Scale,
  Sparkles,
  UploadCloud,
  FileCheck,
  Maximize2,
  Edit3,
  Save,
  AlertCircle
} from 'lucide-react';
import { Lecture, Subject, Language, LectureChapter } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { uploadSharedFile } from '../services/contentApi';
import { getCloudFile, downloadCloudFile } from '../services/cloudFileStorage';

interface LectureViewerModalProps {
  lecture: Lecture;
  subject?: Subject;
  language: Language;
  onClose: () => void;
  onStartQuiz: (lecture: Lecture) => void;
  isRead?: boolean;
  onToggleRead?: () => void;
  initialMode?: 'pdf' | 'full' | 'overview';
  onUpdateLecture?: (updated: Lecture) => void;
}

export const LectureViewerModal: React.FC<LectureViewerModalProps> = ({
  lecture: initialLecture,
  subject,
  language,
  onClose,
  onStartQuiz,
  isRead = false,
  onToggleRead,
  initialMode,
  onUpdateLecture,
}) => {
  const t = TRANSLATIONS[language];
  const [currentLecture, setCurrentLecture] = useState<Lecture>(initialLecture);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [resolvedBlobUrl, setResolvedBlobUrl] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);

  // Resolve cloud file if URL starts with cloud-file://
  React.useEffect(() => {
    let active = true;
    if (currentLecture.fileUrl) {
      if (currentLecture.fileUrl.startsWith('cloud-file://')) {
        setIsLoadingPdf(true);
        const fileId = currentLecture.fileUrl.replace('cloud-file://', '');
        getCloudFile(fileId).then(res => {
          if (active && res && res.blobUrl) {
            setResolvedBlobUrl(res.blobUrl);
          }
          if (active) setIsLoadingPdf(false);
        }).catch(() => {
          if (active) setIsLoadingPdf(false);
        });
      } else {
        setResolvedBlobUrl(currentLecture.fileUrl);
      }
    } else {
      setResolvedBlobUrl(null);
    }
    return () => {
      active = false;
    };
  }, [currentLecture.fileUrl]);

  const hasPdfFile = Boolean(currentLecture.fileUrl);
  const hasFullChapters = Boolean(currentLecture.chapters && currentLecture.chapters.length > 0);
  const hasFullRawText = Boolean(currentLecture.fullCurriculumTextAr);

  // Default active tab: prefer 'pdf' if file exists, else 'full' if chapters exist, else 'overview'
  const defaultTab = initialMode || (hasPdfFile ? 'pdf' : (hasFullChapters || hasFullRawText ? 'full' : 'overview'));
  const [activeTab, setActiveTab] = useState<'pdf' | 'full' | 'overview'>(defaultTab);

  const [selectedChapterIndex, setSelectedChapterIndex] = useState<number | 'all'>(0);
  const [fontSizeClass, setFontSizeClass] = useState<'text-sm' | 'text-base' | 'text-lg'>('text-base');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  // Direct file uploading state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');
  const [uploadErrorMsg, setUploadErrorMsg] = useState('');

  // Verbatim Raw Text Editing Modal/Drawer
  const [isEditingVerbatim, setIsEditingVerbatim] = useState(false);
  const [verbatimDraftText, setVerbatimDraftText] = useState(currentLecture.fullCurriculumTextAr || '');

  const chapters: LectureChapter[] = currentLecture.chapters || [];

  const handleCopyFullText = () => {
    const textToCopy = currentLecture.fullCurriculumTextAr || chapters.map(ch => 
      `${ch.titleAr}\n${ch.descriptionAr || ''}\n\n` + 
      ch.sections.map(s => `--- ${s.titleAr} ---\n${s.contentAr}\n\nأبرز النقاط:\n${(s.keyTakeawaysAr || []).join('\n')}`).join('\n\n')
    ).join('\n\n====================\n\n');

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadFullBooklet = async () => {
    if (currentLecture.fileUrl) {
      if (currentLecture.fileUrl.startsWith('cloud-file://')) {
        const fileId = currentLecture.fileUrl.replace('cloud-file://', '');
        const success = await downloadCloudFile(fileId, currentLecture.fileName || `${currentLecture.titleAr || 'Lecture'}.pdf`);
        if (success) return;
      }
      const a = document.createElement('a');
      a.href = resolvedBlobUrl || currentLecture.fileUrl;
      a.download = currentLecture.fileName || `${currentLecture.titleAr || 'Lecture'}.pdf`;
      a.target = '_blank';
      a.click();
      return;
    }

    const fullContent = currentLecture.fullCurriculumTextAr || chapters.map(ch => 
      `${ch.titleAr}\n${ch.descriptionAr || ''}\n\n` + 
      ch.sections.map(s => `[${s.titleAr}]\n${s.contentAr}\n\nأبرز النقاط:\n${(s.keyTakeawaysAr || []).map(p => `• ${p}`).join('\n')}`).join('\n\n')
    ).join('\n\n========================================\n\n');

    const header = `جمهورية العراق - وزارة التعليم العالي والبحث العلمي\nمنصة سيطرة التعليمية\nالمقرر الدراسي: ${currentLecture.titleAr}\nالمدرس / الجهة: ${currentLecture.instructorAr}\nتاريخ التوثيق: ${currentLecture.uploadDate}\n\n` +
      `========================================\n\n`;

    const blob = new Blob([header + fullContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentLecture.titleAr.replace(/\s+/g, '_')}_النص_الكامل.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Direct File Upload Handler (Exact PDF / Document with zero alterations)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadErrorMsg('');
      setUploadSuccessMsg('');

      const res = await uploadSharedFile(file);
      if (res && res.fileUrl) {
        const updated: Lecture = {
          ...currentLecture,
          fileUrl: res.fileUrl,
          fileName: file.name,
          fileSize: res.fileSize,
          uploadDate: new Date().toISOString().split('T')[0],
        };

        setCurrentLecture(updated);
        if (onUpdateLecture) {
          onUpdateLecture(updated);
        }

        setUploadSuccessMsg(
          language === 'ar' 
            ? `تم رفع الملف الأصلي (${file.name}) بنجاح كما هو تماماً، وهو متاح لجميع الطلاب الآن!`
            : `Original file (${file.name}) uploaded exactly as is and published to all students!`
        );
        setActiveTab('pdf');
      } else {
        throw new Error('Upload response failed');
      }
    } catch (err: any) {
      setUploadErrorMsg(
        language === 'ar'
          ? 'تعذر رفع الملف، يرجى المحاولة مرة أخرى أو التأكد من حجم الملف.'
          : 'Failed to upload file. Please try again.'
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Save Raw Verbatim Text
  const handleSaveVerbatimText = () => {
    const updated: Lecture = {
      ...currentLecture,
      fullCurriculumTextAr: verbatimDraftText,
    };
    setCurrentLecture(updated);
    if (onUpdateLecture) {
      onUpdateLecture(updated);
    }
    setIsEditingVerbatim(false);
    setActiveTab('full');
  };

  const currentChapter = typeof selectedChapterIndex === 'number' ? chapters[selectedChapterIndex] : null;

  return (
    <div 
      id="lecture-viewer-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto"
    >
      {/* Hidden file input for uploading the exact original PDF */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".pdf,.doc,.docx,.txt"
        className="hidden"
      />

      <div 
        id="lecture-viewer-card"
        className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-blue-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto max-h-[96vh] transition-colors"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-5 flex items-start justify-between gap-3 shrink-0">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 text-[11px] font-bold border border-blue-400/30">
                {t.lectureNumberPrefix} {currentLecture.lectureNumber}
              </span>
              {subject && (
                <span className="text-xs font-semibold text-blue-200">
                  {language === 'ar' ? subject.nameAr : subject.nameEn}
                </span>
              )}
              {hasPdfFile && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-400/30 flex items-center gap-1">
                  <FileCheck className="w-3 h-3" />
                  <span>{language === 'ar' ? 'الملف الأصلي PDF مرفوع 100%' : 'Original PDF Uploaded'}</span>
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-xl font-black text-white truncate">
              {language === 'ar' ? currentLecture.titleAr : currentLecture.titleEn}
            </h2>
          </div>

          <button
            id="btn-close-lecture-viewer"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
            title={language === 'ar' ? 'إغلاق' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success or Error Notice Banner */}
        {uploadSuccessMsg && (
          <div className="bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800 px-4 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{uploadSuccessMsg}</span>
            </div>
            <button onClick={() => setUploadSuccessMsg('')} className="text-emerald-600 hover:text-emerald-800">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {uploadErrorMsg && (
          <div className="bg-red-50 dark:bg-red-950/60 border-b border-red-200 dark:border-red-800 px-4 py-2 text-xs font-bold text-red-800 dark:text-red-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{uploadErrorMsg}</span>
            </div>
            <button onClick={() => setUploadErrorMsg('')} className="text-red-600 hover:text-red-800">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Navigation Tabs (PDF vs Full Curriculum vs Summary) */}
        <div className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-2 flex items-center justify-between gap-3 flex-wrap shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            {/* TAB: Original PDF */}
            <button
              id="tab-btn-pdf"
              onClick={() => setActiveTab('pdf')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'pdf'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <FileText className="w-4 h-4 text-red-400" />
              <span>{language === 'ar' ? '📄 ملف الـ PDF الأصلي' : '📄 Original PDF File'}</span>
              {hasPdfFile && <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />}
            </button>

            {/* TAB: Full Text Curriculum */}
            <button
              id="tab-btn-full-curriculum"
              onClick={() => setActiveTab('full')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'full'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{language === 'ar' ? '📖 قارئ نص الملزمة كاملاً' : '📖 Full Curriculum Reader'}</span>
            </button>

            {/* TAB: Summary Overview */}
            <button
              id="tab-btn-overview"
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{language === 'ar' ? '📌 الملخص وأهم المحاور' : '📌 Summary & Review'}</span>
            </button>
          </div>

          {/* Quick Upload / Replace Button for User */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              title={language === 'ar' ? 'رفع نسختك الأصلية من الملف (PDF) كما هي دون أي تعديل' : 'Upload exact original file'}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>
                {isUploading 
                  ? (language === 'ar' ? 'جارٍ الرفع...' : 'Uploading...') 
                  : (hasPdfFile 
                      ? (language === 'ar' ? 'استبدال بملف PDF الأصلي' : 'Replace PDF') 
                      : (language === 'ar' ? 'رفع ملف PDF الأصلي' : 'Upload Original PDF'))}
              </span>
            </button>

            {/* Font size adjuster if on text tab */}
            {activeTab === 'full' && (
              <div className="hidden sm:flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5">
                <button
                  onClick={() => setFontSizeClass('text-sm')}
                  className={`px-2 py-0.5 text-xs font-bold rounded ${fontSizeClass === 'text-sm' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : 'text-slate-500 hover:text-slate-800'}`}
                  title="خط صغير"
                >
                  A-
                </button>
                <button
                  onClick={() => setFontSizeClass('text-base')}
                  className={`px-2 py-0.5 text-xs font-bold rounded ${fontSizeClass === 'text-base' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : 'text-slate-500 hover:text-slate-800'}`}
                  title="خط متوسط"
                >
                  A
                </button>
                <button
                  onClick={() => setFontSizeClass('text-lg')}
                  className={`px-2 py-0.5 text-xs font-bold rounded ${fontSizeClass === 'text-lg' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : 'text-slate-500 hover:text-slate-800'}`}
                  title="خط كبير"
                >
                  A+
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: ORIGINAL PDF EMBEDDED VIEWER */}
          {activeTab === 'pdf' && (
            <div className="space-y-4">
              {hasPdfFile ? (
                <div className="space-y-3">
                  {/* Top PDF Toolbar */}
                  <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        📄 {currentLecture.fileName || 'ملف المحاضرة الأصلي (PDF)'}
                      </span>
                      <span className="text-slate-500">({currentLecture.fileSize})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const target = resolvedBlobUrl || currentLecture.fileUrl;
                          if (target) window.open(target, '_blank');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-50 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'فتح بملء الشاشة' : 'Full Screen'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadFullBooklet}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'تحميل الملف' : 'Download'}</span>
                      </button>
                    </div>
                  </div>

                  {/* PDF iFrame */}
                  <div className="w-full h-[65vh] rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-inner relative">
                    {isLoadingPdf && (
                      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-10 text-white font-bold text-xs gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{language === 'ar' ? 'جارٍ تحميل ملف الـ PDF من السحابة...' : 'Loading PDF from cloud...'}</span>
                      </div>
                    )}
                    <iframe
                      src={`${resolvedBlobUrl || currentLecture.fileUrl}#view=FitH`}
                      title={currentLecture.titleAr}
                      className="w-full h-full border-0"
                    />
                  </div>
                </div>
              ) : (
                /* No PDF uploaded yet: Provide friendly dropzone */
                <div className="border-2 border-dashed border-blue-300 dark:border-slate-700 rounded-2xl p-8 sm:p-12 text-center bg-blue-50/40 dark:bg-slate-800/40 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center mx-auto shadow-sm">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <div className="space-y-1.5 max-w-lg mx-auto">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      {language === 'ar' ? 'رفع ملف الملزمة الأصلي (PDF) كما هو تماماً' : 'Upload Exact Original PDF File'}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      {language === 'ar' 
                        ? 'لكي يظهر الملف بجميع صفحاته وصياغته وتصميمه الأصلي 100% بدون أي تعديل أو صياغة إضافية، اختر الملف من جهازك الآن وسيظهر للجميع فوراً.'
                        : 'Upload your original untouched PDF to be displayed pixel-for-pixel without any automated edits.'}
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>{isUploading ? (language === 'ar' ? 'جارٍ رفع الملف...' : 'Uploading...') : (language === 'ar' ? 'اختيار ورفع ملف الـ PDF الأصلي الآن' : 'Choose Original PDF File')}</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('full')}
                      className="px-5 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                    >
                      {language === 'ar' ? 'أو قراءة النص الموثق بالكامل' : 'Or Read Complete Text'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FULL TEXTBOOK / CURRICULUM READER */}
          {activeTab === 'full' && (
            <div className="space-y-6">
              {/* Controls bar */}
              <div className="flex items-center justify-between gap-3 flex-wrap bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  <button
                    onClick={() => setSelectedChapterIndex('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                      selectedChapterIndex === 'all'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {language === 'ar' ? '📜 عرض الملزمة كاملة' : 'All Chapters'}
                  </button>

                  {chapters.map((ch, idx) => (
                    <button
                      key={ch.id}
                      onClick={() => setSelectedChapterIndex(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                        selectedChapterIndex === idx
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5 opacity-70" />
                      <span>{language === 'ar' ? `الفصل ${ch.chapterNumber}` : `Ch ${ch.chapterNumber}`}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditingVerbatim(!isEditingVerbatim)}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title={language === 'ar' ? 'لصق أو تعديل النص الحرفي للملف' : 'Edit Verbatim Text'}
                  >
                    <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                    <span>{language === 'ar' ? 'لصق النص الحرفي' : 'Paste Verbatim Text'}</span>
                  </button>

                  <button
                    onClick={handleCopyFullText}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{copied ? (language === 'ar' ? 'تم النسخ!' : 'Copied!') : (language === 'ar' ? 'نسخ النص' : 'Copy')}</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                    <span>{language === 'ar' ? 'طباعة' : 'Print'}</span>
                  </button>
                </div>
              </div>

              {/* Verbatim Editor Box (If Opened) */}
              {isEditingVerbatim && (
                <div className="bg-amber-50 dark:bg-slate-800/90 border border-amber-200 dark:border-slate-700 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-black text-amber-900 dark:text-amber-300">
                      <Edit3 className="w-4 h-4" />
                      <span>{language === 'ar' ? 'لصق أو حفظ النص الحرفي للملف كاملاً كما هو (بدون أي تعديل):' : 'Paste Verbatim File Text:'}</span>
                    </div>
                    <button onClick={() => setIsEditingVerbatim(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    rows={8}
                    value={verbatimDraftText}
                    onChange={(e) => setVerbatimDraftText(e.target.value)}
                    placeholder={language === 'ar' ? 'الصق نص الملف كاملاً هنا كلمة بكلمة...' : 'Paste verbatim document text here...'}
                    className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-100 font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setIsEditingVerbatim(false)}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
                    >
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      onClick={handleSaveVerbatimText}
                      className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'حفظ النص الحرفي كما هو' : 'Save Verbatim Text'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Search filter in chapters */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 rtl:right-3 ltr:left-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'ar' ? 'بحث في نصوص الملزمة والمباحث...' : 'Search curriculum text...'}
                  className="w-full pr-9 pl-4 rtl:pr-9 rtl:pl-4 ltr:pl-9 ltr:pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Chapters Render List */}
              <div className="space-y-8">
                {(selectedChapterIndex === 'all' ? chapters : currentChapter ? [currentChapter] : []).map((ch) => {
                  const filteredSections = ch.sections.filter(sec => {
                    if (!searchQuery.trim()) return true;
                    const q = searchQuery.toLowerCase();
                    return sec.titleAr.toLowerCase().includes(q) || sec.contentAr.toLowerCase().includes(q);
                  });

                  if (searchQuery.trim() && filteredSections.length === 0) {
                    return null;
                  }

                  return (
                    <div 
                      key={ch.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 space-y-6 shadow-xs"
                    >
                      {/* Chapter Title Banner */}
                      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-wider mb-1">
                          <Layers className="w-4 h-4" />
                          <span>{language === 'ar' ? `الفصل الدراسي ${ch.chapterNumber}` : `Chapter ${ch.chapterNumber}`}</span>
                        </div>
                        <h3 className="text-base sm:text-xl font-black text-slate-900 dark:text-white leading-snug">
                          {language === 'ar' ? ch.titleAr : ch.titleEn}
                        </h3>
                        {ch.descriptionAr && (
                          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                            {ch.descriptionAr}
                          </p>
                        )}
                      </div>

                      {/* Sections (المباحث) */}
                      <div className="space-y-6 divide-y divide-slate-100 dark:divide-slate-800/60">
                        {filteredSections.map((sec) => (
                          <div key={sec.id} className="pt-6 first:pt-0 space-y-4">
                            <div className="space-y-1">
                              <h4 className="text-sm sm:text-base font-black text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                                <span>{language === 'ar' ? sec.titleAr : sec.titleEn}</span>
                              </h4>
                            </div>

                            {/* Legal Articles / References Callout if present */}
                            {sec.legalArticles && sec.legalArticles.length > 0 && (
                              <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 rounded-xl p-3.5 space-y-2">
                                <div className="flex items-center gap-1.5 text-xs font-black text-amber-900 dark:text-amber-300">
                                  <Scale className="w-4 h-4 text-amber-600" />
                                  <span>{language === 'ar' ? 'السند والمواد القانونية المنصوصة:' : 'Legal Articles & Codified Standards:'}</span>
                                </div>
                                <ul className="space-y-1 text-xs text-amber-950 dark:text-amber-200 list-disc list-inside leading-relaxed">
                                  {sec.legalArticles.map((art, aIdx) => (
                                    <li key={aIdx}>{art}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Full Academic Content */}
                            <div className={`text-slate-700 dark:text-slate-200 leading-relaxed font-normal whitespace-pre-line ${fontSizeClass}`}>
                              {sec.contentAr}
                            </div>

                            {/* Key Takeaways Card */}
                            {sec.keyTakeawaysAr && sec.keyTakeawaysAr.length > 0 && (
                              <div className="bg-blue-50/60 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700/80 rounded-xl p-3.5 space-y-2">
                                <div className="flex items-center gap-1.5 text-xs font-black text-blue-900 dark:text-blue-300">
                                  <CheckCircle className="w-4 h-4 text-blue-600" />
                                  <span>{language === 'ar' ? 'أبرز الحقائق والنتائج الموثقة للمبحث:' : 'Key Documented Findings:'}</span>
                                </div>
                                <div className="grid grid-cols-1 gap-1.5">
                                  {sec.keyTakeawaysAr.map((takeaway, tIdx) => (
                                    <div key={tIdx} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                      <span>{takeaway}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Chapter Pagination buttons */}
              {typeof selectedChapterIndex === 'number' && chapters.length > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    disabled={selectedChapterIndex <= 0}
                    onClick={() => setSelectedChapterIndex(selectedChapterIndex - 1)}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 disabled:opacity-40 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
                    <span>{language === 'ar' ? 'الفصل السابق' : 'Previous Chapter'}</span>
                  </button>

                  <span className="text-xs font-bold text-slate-500">
                    {selectedChapterIndex + 1} / {chapters.length}
                  </span>

                  <button
                    disabled={selectedChapterIndex >= chapters.length - 1}
                    onClick={() => setSelectedChapterIndex(selectedChapterIndex + 1)}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 disabled:opacity-40 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <span>{language === 'ar' ? 'الفصل التالي' : 'Next Chapter'}</span>
                    <ChevronLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: OVERVIEW & KEY POINTS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Metadata chips */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300 bg-blue-50/50 dark:bg-slate-800/60 p-3 rounded-xl border border-blue-100 dark:border-slate-700">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-semibold">{t.instructor}:</span>
                  <span>{language === 'ar' ? currentLecture.instructorAr : currentLecture.instructorEn}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-semibold">{t.uploadDate}:</span>
                  <span>{currentLecture.uploadDate}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-semibold">{t.fileSize}:</span>
                  <span>{currentLecture.fileSize}</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-sm font-black text-blue-950 dark:text-blue-200">
                  {language === 'ar' ? 'نبذة عن المحاضرة' : 'Lecture Overview'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {language === 'ar' ? currentLecture.descriptionAr : currentLecture.descriptionEn}
                </p>
              </div>

              {/* Key Topics Covered */}
              <div className="space-y-2.5">
                <h3 className="text-sm font-black text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>{t.keyPoints}</span>
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {(language === 'ar' ? currentLecture.summaryPointsAr : currentLecture.summaryPointsEn).map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Formulas / Legal References */}
              {currentLecture.keyFormulas && currentLecture.keyFormulas.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-black text-blue-950 dark:text-blue-200">
                    {language === 'ar' ? 'أبرز القوانين والمراجع المعتمدة:' : t.keyEquations}
                  </h3>
                  <div className="space-y-1.5">
                    {currentLecture.keyFormulas.map((eq, idx) => (
                      <div key={idx} className="bg-slate-900 text-blue-300 p-3 rounded-xl text-xs sm:text-sm border border-slate-800">
                        {eq}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Attached Quiz Info Box */}
          <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-white dark:from-indigo-950/40 dark:via-blue-950/30 dark:to-slate-900 border-2 border-indigo-200 dark:border-indigo-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {language === 'ar' ? 'اختبار المحاضرة المؤمن' : 'Secured Lecture Quiz'}
                </span>
                <h4 className="text-sm font-bold text-indigo-950 dark:text-indigo-200 mt-1">
                  {language === 'ar' ? currentLecture.quiz.titleAr : currentLecture.quiz.titleEn}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {currentLecture.quiz.questions.length} {language === 'ar' ? 'أسئلة فكرية وتاريخية بدون مسائل | بيئة سرية مانعة للغش' : 'Questions | Confidential & Anti-Cheat'}
                </p>
              </div>
            </div>

            <button
              id={`btn-launch-quiz-from-modal-${currentLecture.id}`}
              onClick={() => onStartQuiz(currentLecture)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{t.startQuiz}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="btn-download-from-viewer-modal"
              onClick={handleDownloadFullBooklet}
              className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>
                {currentLecture.fileUrl
                  ? (language === 'ar' ? 'تحميل ملف الـ PDF الأصلي' : 'Download Original PDF')
                  : (language === 'ar' ? 'تحميل نص الملزمة كاملاً (.txt)' : 'Download Full Booklet')}
              </span>
            </button>

            {onToggleRead && (
              <button
                type="button"
                id={`btn-toggle-read-modal-${currentLecture.id}`}
                onClick={onToggleRead}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border shadow-xs cursor-pointer ${
                  isRead
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                <CheckCircle className={`w-4 h-4 ${isRead ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
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
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-bold text-xs transition-colors cursor-pointer"
          >
            {language === 'ar' ? 'إغلاق المعاينة' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
