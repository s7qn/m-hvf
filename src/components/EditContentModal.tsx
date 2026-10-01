import React, { useState } from 'react';
import { 
  X, 
  Save, 
  Edit3, 
  Eye, 
  FileText, 
  BookOpen, 
  Sparkles, 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  CheckCircle2, 
  UploadCloud, 
  Trash2, 
  AlertCircle,
  Layers,
  HelpCircle,
  Tag,
  FlaskConical,
  Building2
} from 'lucide-react';
import { Lecture, Summary, ExamQuestionPaper, ScheduleItem, Subject, Stage, Language } from '../types';
import { uploadSharedFile } from '../services/contentApi';

export type EditableContentType = 'lecture' | 'summary' | 'exam' | 'schedule';

interface EditContentModalProps {
  type: EditableContentType;
  data: any;
  subjects: Subject[];
  language: Language;
  onClose: () => void;
  onSaveLecture?: (updated: Lecture) => Promise<any> | void;
  onSaveSummary?: (updated: Summary) => Promise<any> | void;
  onSaveExam?: (updated: ExamQuestionPaper) => Promise<any> | void;
  onSaveScheduleItem?: (updated: ScheduleItem) => Promise<any> | void;
}

const WEEK_DAYS = [
  { index: 0, nameAr: 'الأحد', nameEn: 'Sunday' },
  { index: 1, nameAr: 'الاثنين', nameEn: 'Monday' },
  { index: 2, nameAr: 'الثلاثاء', nameEn: 'Tuesday' },
  { index: 3, nameAr: 'الأربعاء', nameEn: 'Wednesday' },
  { index: 4, nameAr: 'الخميس', nameEn: 'Thursday' },
];

export const EditContentModal: React.FC<EditContentModalProps> = ({
  type,
  data,
  subjects,
  language,
  onClose,
  onSaveLecture,
  onSaveSummary,
  onSaveExam,
  onSaveScheduleItem,
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Lecture Edit State
  const initialLecture: Lecture = type === 'lecture' ? data : ({} as Lecture);
  const [lecTitleAr, setLecTitleAr] = useState(initialLecture.titleAr || '');
  const [lecTitleEn, setLecTitleEn] = useState(initialLecture.titleEn || '');
  const [lecDescAr, setLecDescAr] = useState(initialLecture.descriptionAr || '');
  const [lecDescEn, setLecDescEn] = useState(initialLecture.descriptionEn || '');
  const [lecSubjectId, setLecSubjectId] = useState(initialLecture.subjectId || (subjects[0]?.id ?? 'control-theory'));
  const [lecStage, setLecStage] = useState<Stage>(initialLecture.stage || 2);
  const [lecNumber, setLecNumber] = useState<number>(initialLecture.lectureNumber || 1);
  const [lecInstructorAr, setLecInstructorAr] = useState(initialLecture.instructorAr || '');
  const [lecInstructorEn, setLecInstructorEn] = useState(initialLecture.instructorEn || '');
  const [lecSummaryPointsText, setLecSummaryPointsText] = useState((initialLecture.summaryPointsAr || []).join('\n'));
  const [lecKeyFormulasText, setLecKeyFormulasText] = useState((initialLecture.keyFormulas || []).join('\n'));
  const [lecFileUrl, setLecFileUrl] = useState(initialLecture.fileUrl || '');
  const [lecFileName, setLecFileName] = useState(initialLecture.fileName || '');
  const [lecFileSize, setLecFileSize] = useState(initialLecture.fileSize || '2.5 MB');
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // 2. Summary Edit State
  const initialSummary: Summary = type === 'summary' ? data : ({} as Summary);
  const [sumTitleAr, setSumTitleAr] = useState(initialSummary.titleAr || '');
  const [sumTitleEn, setSumTitleEn] = useState(initialSummary.titleEn || '');
  const [sumDescAr, setSumDescAr] = useState(initialSummary.descriptionAr || '');
  const [sumSubjectId, setSumSubjectId] = useState(initialSummary.subjectId || (subjects[0]?.id ?? 'control-theory'));
  const [sumStage, setSumStage] = useState<Stage>(initialSummary.stage || 2);
  const [sumAuthorAr, setSumAuthorAr] = useState(initialSummary.authorAr || '');
  const [sumPagesCount, setSumPagesCount] = useState<number>(initialSummary.pagesCount || 4);
  const [sumTagsText, setSumTagsText] = useState((initialSummary.tagsAr || []).join('، '));
  const [sumFormulasText, setSumFormulasText] = useState((initialSummary.keyFormulas || []).join('\n'));
  const [sumContentText, setSumContentText] = useState(initialSummary.contentAr || '');

  // 3. Exam Edit State
  const initialExam: ExamQuestionPaper = type === 'exam' ? data : ({} as ExamQuestionPaper);
  const [examTitleAr, setExamTitleAr] = useState(initialExam.titleAr || '');
  const [examSubjectId, setExamSubjectId] = useState(initialExam.subjectId || (subjects[0]?.id ?? 'control-theory'));
  const [examStage, setExamStage] = useState<Stage>(initialExam.stage || 2);
  const [examYear, setExamYear] = useState(initialExam.academicYear || '2025-2026');
  const [examType, setExamType] = useState<'final' | 'midterm' | 'quiz' | 'practical'>(initialExam.type || 'final');
  const [examSolved, setExamSolved] = useState<boolean>(initialExam.solved ?? true);
  const [examSolvedByAr, setExamSolvedByAr] = useState(initialExam.solvedByAr || 'اللجنة العلمية وقسم السيطرة');
  const [examNotesAr, setExamNotesAr] = useState(initialExam.notesAr || '');

  // 4. Schedule Edit State
  const initialSchedule: ScheduleItem = type === 'schedule' ? data : ({} as ScheduleItem);
  const [schDayIndex, setSchDayIndex] = useState<number>(initialSchedule.dayIndex ?? 0);
  const [schSubjectId, setSchSubjectId] = useState(initialSchedule.subjectId || (subjects[0]?.id ?? 'control-theory'));
  const [schStage, setSchStage] = useState<Stage>(initialSchedule.stage || 2);
  const [schGroup, setSchGroup] = useState<'A' | 'B' | 'الكل'>(initialSchedule.group || 'الكل');
  const [schStartTime, setSchStartTime] = useState(initialSchedule.startTime || '08:30');
  const [schEndTime, setSchEndTime] = useState(initialSchedule.endTime || '10:30');
  const [schRoomAr, setSchRoomAr] = useState(initialSchedule.roomAr || 'القاعة 4 - مبنى السيطرة');
  const [schInstructorAr, setSchInstructorAr] = useState(initialSchedule.instructorAr || '');
  const [schType, setSchType] = useState<'theoretical' | 'practical' | 'tutorial'>(initialSchedule.type || 'theoretical');
  const [schNotesAr, setSchNotesAr] = useState(initialSchedule.notesAr || '');

  // Handlers for File Upload Replacement
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingFile(true);
      setErrorMsg('');
      const res = await uploadSharedFile(file);
      if (res && res.fileUrl) {
        setLecFileUrl(res.fileUrl);
        setLecFileName(file.name);
        setLecFileSize(res.fileSize || `${(file.size / (1024 * 1024)).toFixed(1)} MB`);
      } else {
        setErrorMsg(language === 'ar' ? 'تعذر رفع الملف الجديد' : 'Failed to upload new file');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Upload failed');
    } finally {
      setIsUploadingFile(false);
    }
  };

  // Main Submit Handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');

    try {
      if (type === 'lecture') {
        if (!lecTitleAr.trim()) throw new Error(language === 'ar' ? 'يرجى إدخال عنوان الملزمة' : 'Title is required');
        const summaryPointsAr = lecSummaryPointsText.split('\n').map(s => s.trim()).filter(Boolean);
        const keyFormulas = lecKeyFormulasText.split('\n').map(s => s.trim()).filter(Boolean);

        const updated: Lecture = {
          ...initialLecture,
          titleAr: lecTitleAr.trim(),
          titleEn: lecTitleEn.trim() || lecTitleAr.trim(),
          descriptionAr: lecDescAr.trim() || lecTitleAr.trim(),
          descriptionEn: lecDescEn.trim() || lecTitleEn.trim() || lecTitleAr.trim(),
          subjectId: lecSubjectId,
          stage: lecStage,
          lectureNumber: Number(lecNumber) || 1,
          instructorAr: lecInstructorAr.trim() || 'أستاذ المادة',
          instructorEn: lecInstructorEn.trim() || 'Course Lecturer',
          summaryPointsAr: summaryPointsAr.length > 0 ? summaryPointsAr : initialLecture.summaryPointsAr,
          keyFormulas: keyFormulas.length > 0 ? keyFormulas : initialLecture.keyFormulas,
          fileUrl: lecFileUrl || initialLecture.fileUrl,
          fileName: lecFileName || initialLecture.fileName,
          fileSize: lecFileSize || initialLecture.fileSize,
        };

        if (onSaveLecture) {
          const res = await onSaveLecture(updated);
          if (res && res.success === false) {
            throw new Error(res.error || 'Failed to update lecture');
          }
        }
      } else if (type === 'summary') {
        if (!sumTitleAr.trim()) throw new Error(language === 'ar' ? 'يرجى إدخال عنوان الملخص' : 'Title is required');
        const tagsAr = sumTagsText.split(/[,،\n]/).map(t => t.trim()).filter(Boolean);
        const keyFormulas = sumFormulasText.split('\n').map(s => s.trim()).filter(Boolean);

        const updated: Summary = {
          ...initialSummary,
          titleAr: sumTitleAr.trim(),
          titleEn: sumTitleEn.trim() || sumTitleAr.trim(),
          descriptionAr: sumDescAr.trim() || sumTitleAr.trim(),
          descriptionEn: sumDescAr.trim() || sumTitleAr.trim(),
          subjectId: sumSubjectId,
          stage: sumStage,
          authorAr: sumAuthorAr.trim() || 'ممثل الشعبة واللجنة العلمية',
          pagesCount: Number(sumPagesCount) || 4,
          tagsAr: tagsAr.length > 0 ? tagsAr : initialSummary.tagsAr,
          keyFormulas: keyFormulas.length > 0 ? keyFormulas : initialSummary.keyFormulas,
          contentAr: sumContentText.trim() || initialSummary.contentAr,
        };

        if (onSaveSummary) {
          await onSaveSummary(updated);
        }
      } else if (type === 'exam') {
        if (!examTitleAr.trim()) throw new Error(language === 'ar' ? 'يرجى إدخال عنوان النموذج' : 'Title is required');

        const updated: ExamQuestionPaper = {
          ...initialExam,
          titleAr: examTitleAr.trim(),
          titleEn: examTitleAr.trim(),
          subjectId: examSubjectId,
          stage: examStage,
          academicYear: examYear.trim(),
          type: examType,
          solved: examSolved,
          solvedByAr: examSolvedByAr.trim(),
          notesAr: examNotesAr.trim(),
        };

        if (onSaveExam) {
          await onSaveExam(updated);
        }
      } else if (type === 'schedule') {
        const sub = subjects.find(s => s.id === schSubjectId);
        const day = WEEK_DAYS.find(d => d.index === schDayIndex) || WEEK_DAYS[0];

        const updated: ScheduleItem = {
          ...initialSchedule,
          dayIndex: schDayIndex,
          dayNameAr: day.nameAr,
          dayNameEn: day.nameEn,
          subjectId: schSubjectId,
          subjectNameAr: sub?.nameAr || 'المادة الدراسية',
          subjectNameEn: sub?.nameEn || 'Course Subject',
          stage: schStage,
          group: schGroup,
          startTime: schStartTime,
          endTime: schEndTime,
          roomAr: schRoomAr.trim(),
          roomEn: schRoomAr.trim(),
          instructorAr: schInstructorAr.trim() || 'أستاذ المادة',
          instructorEn: schInstructorAr.trim() || 'Course Lecturer',
          type: schType,
          notesAr: schNotesAr.trim(),
        };

        if (onSaveScheduleItem) {
          await onSaveScheduleItem(updated);
        }
      }

      setSuccessMsg(language === 'ar' ? 'تم حفظ وتحديث المعلومات سحابياً بنجاح!' : 'Updated successfully in cloud!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err?.message || (language === 'ar' ? 'حدث خطأ أثناء الحفظ' : 'Save failed'));
    } finally {
      setIsSaving(false);
    }
  };

  const getModalTitle = () => {
    switch (type) {
      case 'lecture': return language === 'ar' ? 'تعديل معلومات الملزمة والمحاضرة' : 'Edit Lecture Note';
      case 'summary': return language === 'ar' ? 'تعديل ملخص وبطاقة القوانين' : 'Edit Summary Sheet';
      case 'exam': return language === 'ar' ? 'تعديل بيانات النموذج الامتحاني' : 'Edit Exam Paper';
      case 'schedule': return language === 'ar' ? 'تعديل موعد وبيانات المحاضرة في الجدول' : 'Edit Schedule Item';
    }
  };

  const selectedSubject = subjects.find(s => 
    s.id === (type === 'lecture' ? lecSubjectId : type === 'summary' ? sumSubjectId : type === 'exam' ? examSubjectId : schSubjectId)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden transition-all">
        
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-indigo-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {getModalTitle()}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'ar' 
                  ? 'يتم تحديث ونشر التعديلات فورياً لجميع الطلاب والأجهزة عبر قاعدة بيانات Firestore السحابية.'
                  : 'Edits are updated instantly for all students via Firestore.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher: Form vs Live Preview */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'form'
                    ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'النموذج' : 'Form'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'معاينة فورية' : 'Live Preview'}</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'form' ? (
            <form id="edit-content-form" onSubmit={handleSave} className="space-y-4">
              
              {/* Common Subject & Stage Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {language === 'ar' ? 'المادة الدراسية' : 'Subject'}
                  </label>
                  <select
                    value={type === 'lecture' ? lecSubjectId : type === 'summary' ? sumSubjectId : type === 'exam' ? examSubjectId : schSubjectId}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (type === 'lecture') setLecSubjectId(val);
                      else if (type === 'summary') setSumSubjectId(val);
                      else if (type === 'exam') setExamSubjectId(val);
                      else if (type === 'schedule') setSchSubjectId(val);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {language === 'ar' ? s.nameAr : s.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {language === 'ar' ? 'المرحلة الدراسية' : 'Academic Stage'}
                  </label>
                  <select
                    value={type === 'lecture' ? lecStage : type === 'summary' ? sumStage : type === 'exam' ? examStage : schStage}
                    onChange={(e) => {
                      const val = Number(e.target.value) as Stage;
                      if (type === 'lecture') setLecStage(val);
                      else if (type === 'summary') setSumStage(val);
                      else if (type === 'exam') setExamStage(val);
                      else if (type === 'schedule') setSchStage(val);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100"
                  >
                    <option value={1}>{language === 'ar' ? 'المرحلة الأولى' : 'Stage 1'}</option>
                    <option value={2}>{language === 'ar' ? 'المرحلة الثانية' : 'Stage 2'}</option>
                    <option value={3}>{language === 'ar' ? 'المرحلة الثالثة' : 'Stage 3'}</option>
                    <option value={4}>{language === 'ar' ? 'المرحلة الرابعة' : 'Stage 4'}</option>
                  </select>
                </div>
              </div>

              {/* SPECIFIC FIELDS: LECTURE */}
              {type === 'lecture' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {language === 'ar' ? 'عنوان الملزمة (عربي)' : 'Lecture Title (Arabic)'}
                      </label>
                      <input
                        type="text"
                        value={lecTitleAr}
                        onChange={(e) => setLecTitleAr(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-bold text-slate-900 dark:text-white"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {language === 'ar' ? 'رقم المحاضرة' : 'Lecture Number'}
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={lecNumber}
                        onChange={(e) => setLecNumber(Number(e.target.value) || 1)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {language === 'ar' ? 'وصف الملزمة والمحتوى العلمي' : 'Description'}
                    </label>
                    <textarea
                      rows={3}
                      value={lecDescAr}
                      onChange={(e) => setLecDescAr(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {language === 'ar' ? 'اسم الأستاذ المحاضر' : 'Instructor'}
                      </label>
                      <input
                        type="text"
                        value={lecInstructorAr}
                        onChange={(e) => setLecInstructorAr(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                      />
                    </div>

                    {/* Attached File Card with Replace Option */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {language === 'ar' ? 'ملف الـ PDF المرفق' : 'Attached PDF'}
                      </label>
                      <div className="flex items-center justify-between p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs">
                        <span className="truncate max-w-[150px] font-bold text-slate-700 dark:text-slate-200">
                          {lecFileName || 'الملف الحالي'} ({lecFileSize})
                        </span>
                        <label className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer transition-colors shrink-0">
                          <span>{isUploadingFile ? 'جارٍ الرفع...' : 'استبدال الملف'}</span>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.txt"
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={isUploadingFile}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {language === 'ar' ? 'أبرز نقاط الملخص (كل نقطة في سطر)' : 'Key Summary Points'}
                      </label>
                      <textarea
                        rows={3}
                        value={lecSummaryPointsText}
                        onChange={(e) => setLecSummaryPointsText(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {language === 'ar' ? 'القوانين والمعادلات الهندسية (كل قانون في سطر)' : 'Formulas'}
                      </label>
                      <textarea
                        rows={3}
                        value={lecKeyFormulasText}
                        onChange={(e) => setLecKeyFormulasText(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SPECIFIC FIELDS: SUMMARY */}
              {type === 'summary' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {language === 'ar' ? 'عنوان الملخص' : 'Summary Title'}
                    </label>
                    <input
                      type="text"
                      value={sumTitleAr}
                      onChange={(e) => setSumTitleAr(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-bold text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {language === 'ar' ? 'وصف الملخص' : 'Description'}
                    </label>
                    <textarea
                      rows={3}
                      value={sumDescAr}
                      onChange={(e) => setSumDescAr(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {language === 'ar' ? 'اسم المعد / الموثق' : 'Author'}
                      </label>
                      <input
                        type="text"
                        value={sumAuthorAr}
                        onChange={(e) => setSumAuthorAr(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {language === 'ar' ? 'عدد الصفحات' : 'Page Count'}
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={sumPagesCount}
                        onChange={(e) => setSumPagesCount(Number(e.target.value) || 1)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {language === 'ar' ? 'الوسوم (مفصولة بفاصلة)' : 'Tags'}
                      </label>
                      <input
                        type="text"
                        value={sumTagsText}
                        onChange={(e) => setSumTagsText(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {language === 'ar' ? 'بطاقة القوانين والمعادلات (سطر لكل معادلة)' : 'Formulas'}
                    </label>
                    <textarea
                      rows={3}
                      value={sumFormulasText}
                      onChange={(e) => setSumFormulasText(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {/* SPECIFIC FIELDS: EXAM */}
              {type === 'exam' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {language === 'ar' ? 'عنوان النموذج الامتحاني' : 'Exam Title'}
                      </label>
                      <input
                        type="text"
                        value={examTitleAr}
                        onChange={(e) => setExamTitleAr(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-bold"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {language === 'ar' ? 'العام الدراسي' : 'Academic Year'}
                      </label>
                      <input
                        type="text"
                        value={examYear}
                        onChange={(e) => setExamYear(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {language === 'ar' ? 'نوع الامتحان' : 'Exam Type'}
                      </label>
                      <select
                        value={examType}
                        onChange={(e) => setExamType(e.target.value as any)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                      >
                        <option value="final">{language === 'ar' ? 'الامتحان النهائي (Final)' : 'Final'}</option>
                        <option value="midterm">{language === 'ar' ? 'امتحان نصف الفصل (Midterm)' : 'Midterm'}</option>
                        <option value="practical">{language === 'ar' ? 'الامتحان العملي والمختبري' : 'Practical'}</option>
                        <option value="quiz">{language === 'ar' ? 'اختبار قصير (Quiz)' : 'Quiz'}</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {language === 'ar' ? 'جهة الحل والتدقيق' : 'Solved By'}
                      </label>
                      <input
                        type="text"
                        value={examSolvedByAr}
                        onChange={(e) => setExamSolvedByAr(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {language === 'ar' ? 'ملاحظات وتوجيهات امتحانية' : 'Notes'}
                    </label>
                    <textarea
                      rows={3}
                      value={examNotesAr}
                      onChange={(e) => setExamNotesAr(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* SPECIFIC FIELDS: SCHEDULE */}
              {type === 'schedule' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {language === 'ar' ? 'يوم الأسبوع' : 'Day of Week'}
                      </label>
                      <select
                        value={schDayIndex}
                        onChange={(e) => setSchDayIndex(Number(e.target.value))}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                      >
                        {WEEK_DAYS.map(d => (
                          <option key={d.index} value={d.index}>
                            {language === 'ar' ? d.nameAr : d.nameEn}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {language === 'ar' ? 'الشعبة' : 'Group'}
                      </label>
                      <select
                        value={schGroup}
                        onChange={(e) => setSchGroup(e.target.value as any)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                      >
                        <option value="الكل">{language === 'ar' ? 'كافة الشعب (الكل)' : 'All Groups'}</option>
                        <option value="A">{language === 'ar' ? 'شعبة A' : 'Group A'}</option>
                        <option value="B">{language === 'ar' ? 'شعبة B' : 'Group B'}</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {language === 'ar' ? 'طبيعة المحاضرة' : 'Type'}
                      </label>
                      <select
                        value={schType}
                        onChange={(e) => setSchType(e.target.value as any)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                      >
                        <option value="theoretical">{language === 'ar' ? 'نظري' : 'Theoretical'}</option>
                        <option value="practical">{language === 'ar' ? 'عملي ومختبر' : 'Practical Lab'}</option>
                        <option value="tutorial">{language === 'ar' ? 'حلقة نقاشية (Tutorial)' : 'Tutorial'}</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {language === 'ar' ? 'وقت البدء' : 'Start Time'}
                      </label>
                      <input
                        type="time"
                        value={schStartTime}
                        onChange={(e) => setSchStartTime(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {language === 'ar' ? 'وقت الانتهاء' : 'End Time'}
                      </label>
                      <input
                        type="time"
                        value={schEndTime}
                        onChange={(e) => setSchEndTime(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {language === 'ar' ? 'القاعة أو المختبر' : 'Hall / Lab'}
                      </label>
                      <input
                        type="text"
                        value={schRoomAr}
                        onChange={(e) => setSchRoomAr(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {language === 'ar' ? 'الأستاذ المحاضر' : 'Instructor'}
                      </label>
                      <input
                        type="text"
                        value={schInstructorAr}
                        onChange={(e) => setSchInstructorAr(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {language === 'ar' ? 'إرشادات المحاضرة والمتطلبات' : 'Requirements / Notes'}
                    </label>
                    <textarea
                      rows={2}
                      value={schNotesAr}
                      onChange={(e) => setSchNotesAr(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>
                </div>
              )}

            </form>
          ) : (
            /* LIVE PREVIEW TAB */
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <span>
                  {language === 'ar'
                    ? 'هذه معاينة فورية ومطابقة لما سيظهر للطلاب في المنصة فور حفظ التعديل:'
                    : 'Live exact preview of how students will see this item:'}
                </span>
              </div>

              {/* LECTURE PREVIEW CARD */}
              {type === 'lecture' && (
                <div className="p-5 rounded-2xl border border-blue-200 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-3 shadow-md">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 text-xs font-black">
                      المحاضرة {lecNumber}
                    </span>
                    <span className="text-xs text-slate-500">
                      {selectedSubject?.code} — المرحلة {lecStage}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {lecTitleAr || 'عنوان الملزمة'}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                    {lecDescAr || 'الوصف والمحتوى العلمي'}
                  </p>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>{lecInstructorAr || 'أستاذ المادة'}</span>
                    <span className="font-mono">{lecFileSize}</span>
                  </div>
                </div>
              )}

              {/* SUMMARY PREVIEW CARD */}
              {type === 'summary' && (
                <div className="p-5 rounded-2xl border border-blue-200 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-3 shadow-md">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300">
                      {selectedSubject?.nameAr} (المرحلة {sumStage})
                    </span>
                    <span className="text-xs text-slate-400 font-mono font-bold">
                      {sumPagesCount} صفحات
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {sumTitleAr || 'عنوان الملخص'}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {sumDescAr || 'وصف الملخص وبطاقة القوانين'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span>إعداد: {sumAuthorAr || 'ممثل الشعبة'}</span>
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">معاينة متاحة</span>
                  </div>
                </div>
              )}

              {/* EXAM PREVIEW CARD */}
              {type === 'exam' && (
                <div className="p-5 rounded-2xl border border-blue-200 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-3 shadow-md">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                      {selectedSubject?.nameAr} • {examYear}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                      {examSolved ? 'محلول مع الحل النموذجي' : 'غير محلول'}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {examTitleAr || 'عنوان النموذج'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    المرحلة {examStage} • {examType}
                  </p>
                </div>
              )}

              {/* SCHEDULE PREVIEW CARD */}
              {type === 'schedule' && (
                <div className="p-5 rounded-2xl border border-blue-200 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-3 shadow-md">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                      {WEEK_DAYS.find(d => d.index === schDayIndex)?.nameAr} • الشعبة: {schGroup}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[11px] font-bold">
                      {schType === 'theoretical' ? 'نظري' : schType === 'practical' ? 'عملي ومختبر' : 'مناقشة'}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {selectedSubject?.nameAr || 'المادة'}
                  </h3>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>{schStartTime} - {schEndTime}</span>
                    <span>{schRoomAr}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>

          <button
            type="submit"
            form="edit-content-form"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-black flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? (language === 'ar' ? 'جارٍ الحفظ في السحابة...' : 'Saving to cloud...') : (language === 'ar' ? 'حفظ وتحديث التعديلات سحابياً' : 'Save & Publish Changes')}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
