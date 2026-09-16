import React, { useState } from 'react';
import { 
  Lock, 
  Unlock, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  BookOpen, 
  HelpCircle, 
  X,
  FileUp,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { Subject, Lecture, Quiz, QuizQuestion, Stage, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface AdminAddModalProps {
  subjects: Subject[];
  language: Language;
  isAdminUnlocked: boolean;
  onUnlockAdmin: () => void;
  onClose: () => void;
  onAddLecture: (newLecture: Lecture) => void;
  initialSubjectId?: string;
}

export const AdminAddModal: React.FC<AdminAddModalProps> = ({
  subjects,
  language,
  isAdminUnlocked,
  onUnlockAdmin,
  onClose,
  onAddLecture,
  initialSubjectId,
}) => {
  const t = TRANSLATIONS[language];

  // Auth state
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passcodeError, setPasscodeError] = useState(false);

  // Form State
  const defaultSubId = initialSubjectId && subjects.some(s => s.id === initialSubjectId)
    ? initialSubjectId
    : (subjects[0]?.id || '');

  const [selectedSubjectId, setSelectedSubjectId] = useState(defaultSubId);
  
  const initialSubject = subjects.find(s => s.id === defaultSubId);
  const [stage, setStage] = useState<Stage>(initialSubject?.stage || 1);
  const [lectureNumber, setLectureNumber] = useState<number>(1);
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [instructorAr, setInstructorAr] = useState('أستاذ المادة');
  const [instructorEn, setInstructorEn] = useState('Course Lecturer');
  const [fileUrl, setFileUrl] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFileSize, setUploadedFileSize] = useState('2.8 MB');
  const [summaryPointsText, setSummaryPointsText] = useState('');
  const [keyFormulasText, setKeyFormulasText] = useState('');

  // Handle subject change and auto sync stage
  const handleSubjectChange = (newSubjectId: string) => {
    setSelectedSubjectId(newSubjectId);
    const sub = subjects.find(s => s.id === newSubjectId);
    if (sub) {
      setStage(sub.stage);
    }
  };

  // Attached Quiz State
  const [quizQuestions, setQuizQuestions] = useState<Array<{
    questionAr: string;
    questionEn: string;
    optionsAr: string[];
    optionsEn: string[];
    correctIndex: number;
    explanationAr: string;
    explanationEn: string;
    codeOrFormula?: string;
  }>>([
    {
      questionAr: 'ما هي الفكرة الجوهرية التي تركز عليها هذه المحاضرة في هندسة السيطرة؟',
      questionEn: 'What is the fundamental engineering focus of this lecture topic?',
      optionsAr: [
        'فهم النمذجة الرياضية وتطبيقات المنظومة العملية في السيطرة والأتمتة',
        'تجاهل معايير الأمان في الدارات الكهربائية',
        'استخدام أنظمة غير قابلة للمعايرة',
        'الاعتماد فقط على التخمين اليدوي بدون معادلات'
      ],
      optionsEn: [
        'Understanding mathematical modeling and practical automation implementations',
        'Neglecting safety standards in electrical circuits',
        'Employing uncalibrated industrial equipment',
        'Manual guessing without engineering equations'
      ],
      correctIndex: 0,
      explanationAr: 'التحليل الهندسي الدقيق والنمذجة الرياضية هما الأساس لتصميم منظومات السيطرة المستقرة والفعالة.',
      explanationEn: 'Rigorous engineering analysis and mathematical modeling form the backbone of stable and reliable control systems.'
    }
  ]);

  const [formError, setFormError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Passcode verification
  const handleVerifyPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = passcode.trim();
    if (cleaned === '1107') {
      onUnlockAdmin();
      setPasscodeError(false);
    } else {
      setPasscodeError(true);
    }
  };

  // Add question to quiz
  const handleAddQuestion = () => {
    setQuizQuestions(prev => [
      ...prev,
      {
        questionAr: '',
        questionEn: '',
        optionsAr: ['', '', '', ''],
        optionsEn: ['', '', '', ''],
        correctIndex: 0,
        explanationAr: '',
        explanationEn: '',
      }
    ]);
  };

  // Remove question
  const handleRemoveQuestion = (index: number) => {
    setQuizQuestions(prev => prev.filter((_, i) => i !== index));
  };

  // Submit new lecture
  const handleSubmitLecture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleAr.trim()) {
      setFormError(language === 'ar' ? 'يرجى إدخال عنوان المحاضرة بالعربية' : 'Please enter Arabic title');
      return;
    }
    if (!selectedSubjectId) {
      setFormError(language === 'ar' ? 'يرجى تحديد المادة الدراسية' : 'Please select subject');
      return;
    }

    const lectureId = 'lec-' + Date.now();
    const quizId = 'quiz-' + Date.now();

    const formattedQuestions: QuizQuestion[] = quizQuestions.map((q, idx) => ({
      id: `q-${quizId}-${idx}`,
      questionAr: q.questionAr || (language === 'ar' ? `سؤال اختبار المحاضرة ${idx + 1}` : `Quiz Question ${idx + 1}`),
      questionEn: q.questionEn || `Quiz Question ${idx + 1}`,
      optionsAr: q.optionsAr.map(opt => opt.trim() || 'خيار افتراضي'),
      optionsEn: q.optionsEn.map(opt => opt.trim() || 'Default Option'),
      correctIndex: q.correctIndex,
      explanationAr: q.explanationAr || 'تفسير هندسي للإجابة النموذجية بناءً على مادة المحاضرة.',
      explanationEn: q.explanationEn || 'Engineering derivation based on lecture material.',
      codeOrFormula: q.codeOrFormula,
    }));

    const newQuiz: Quiz = {
      id: quizId,
      lectureId: lectureId,
      subjectId: selectedSubjectId,
      titleAr: `اختبار: ${titleAr}`,
      titleEn: `Quiz: ${titleEn || titleAr}`,
      durationMinutes: 10,
      passingScore: 60,
      questions: formattedQuestions,
    };

    const summaryListAr = summaryPointsText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const formulasList = keyFormulasText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const newLecture: Lecture = {
      id: lectureId,
      subjectId: selectedSubjectId,
      stage,
      lectureNumber: Number(lectureNumber) || 1,
      titleAr,
      titleEn: titleEn || titleAr,
      descriptionAr: descriptionAr || titleAr,
      descriptionEn: descriptionEn || titleEn || titleAr,
      fileType: 'pdf',
      fileSize: uploadedFileSize || '2.8 MB',
      uploadDate: new Date().toISOString().split('T')[0],
      instructorAr: instructorAr || 'أستاذ المادة',
      instructorEn: instructorEn || 'Course Lecturer',
      summaryPointsAr: summaryListAr.length > 0 ? summaryListAr : ['مفاهيم هندسية وتطبيقات عملية في السيطرة والأتمتة'],
      summaryPointsEn: ['Practical control engineering principles and industrial automation guidelines'],
      keyFormulas: formulasList,
      fileUrl: fileUrl || undefined,
      quiz: newQuiz,
      isCustom: true,
    };

    onAddLecture(newLecture);
    setIsSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div 
      id="admin-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div 
        id="admin-modal-card"
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-blue-200 overflow-hidden flex flex-col my-auto max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-800 to-indigo-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              {isAdminUnlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                {t.adminModalTitle}
              </h2>
              <p className="text-xs text-blue-200 font-medium">
                {t.adminModalSubtitle}
              </p>
            </div>
          </div>

          <button
            id="btn-close-admin-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* STEP 1: Passcode authorization if not unlocked yet */}
          {!isAdminUnlocked ? (
            <div className="space-y-4 py-4 text-center max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto border border-blue-200">
                <Lock className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {language === 'ar' ? 'التحقق الأمني للمسؤول' : 'Admin Security Verification'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {t.adminPasscodePrompt}
                </p>
              </div>

              <form onSubmit={handleVerifyPasscode} className="space-y-4">
                <div className="relative">
                  <input
                    id="input-admin-passcode"
                    type={showPassword ? 'text' : 'password'}
                    value={passcode}
                    onChange={(e) => {
                      setPasscode(e.target.value);
                      if (passcodeError) setPasscodeError(false);
                    }}
                    placeholder={t.adminPasscodePlaceholder}
                    className="w-full text-center px-10 py-3 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-mono text-base tracking-widest outline-hidden transition-all placeholder:tracking-normal placeholder:font-sans placeholder:text-xs"
                    autoFocus
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 end-0 pe-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    title={showPassword ? (language === 'ar' ? 'إخفاء الرمز' : 'Hide passcode') : (language === 'ar' ? 'إظهار الرمز' : 'Show passcode')}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>

                  {passcodeError && (
                    <p className="text-xs text-red-600 font-bold mt-2 flex items-center justify-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{t.adminWrongCode}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-1/2 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
                  >
                    {t.adminCancel}
                  </button>
                  <button
                    type="submit"
                    id="btn-admin-login-submit"
                    className="w-1/2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-500/20 transition-all"
                  >
                    {t.adminLogin}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* STEP 2: Lecture & Attached Quiz Upload Form */
            <form onSubmit={handleSubmitLecture} className="space-y-6">
              {isSuccess && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{t.addedSuccess}</span>
                </div>
              )}

              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Basic Lecture Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-blue-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>{language === 'ar' ? 'بيانات المحاضرة أو الملزمة' : 'Lecture Information'}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Select Subject */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t.selectSubject} *
                    </label>
                    <select
                      id="select-lecture-subject"
                      value={selectedSubjectId}
                      onChange={(e) => handleSubjectChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden bg-white"
                    >
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.code} - {language === 'ar' ? s.nameAr : s.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Stage */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t.selectStage} *
                    </label>
                    <select
                      id="select-lecture-stage"
                      value={stage}
                      onChange={(e) => setStage(Number(e.target.value) as Stage)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden bg-white"
                    >
                      <option value={1}>{t.stage1}</option>
                      <option value={2}>{t.stage2}</option>
                      <option value={3}>{t.stage3}</option>
                      <option value={4}>{t.stage4}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t.lectureTitleInput} *
                    </label>
                    <input
                      id="input-lecture-title-ar"
                      type="text"
                      value={titleAr}
                      onChange={(e) => setTitleAr(e.target.value)}
                      placeholder="مثال: المحاضرة 1: مقدمة ومفاهيم أساسية"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'ar' ? 'رقم المحاضرة' : 'Lecture #'}
                    </label>
                    <input
                      id="input-lecture-number"
                      type="number"
                      min={1}
                      max={50}
                      value={lectureNumber}
                      onChange={(e) => setLectureNumber(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t.instructorName}
                    </label>
                    <input
                      id="input-instructor-name"
                      type="text"
                      value={instructorAr}
                      onChange={(e) => setInstructorAr(e.target.value)}
                      placeholder="اسم الأستاذ / المدرس"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden"
                    />
                  </div>

                  {/* File Upload / Link */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t.uploadLectureFile}
                    </label>
                    <div className="space-y-1.5">
                      <input
                        id="input-lecture-file-url"
                        type="text"
                        value={fileUrl}
                        onChange={(e) => setFileUrl(e.target.value)}
                        placeholder="رابط ملف المحاضرة (Google Drive / PDF Link)..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden"
                      />
                      <label 
                        className="flex items-center gap-2 p-2 rounded-xl border border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-50 cursor-pointer text-xs text-blue-800 transition-colors"
                      >
                        <FileUp className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="truncate">
                          {uploadedFileName 
                            ? `تم اختيار: ${uploadedFileName} (${uploadedFileSize})` 
                            : (language === 'ar' ? 'أو اختر ملف PDF / Word محلي من جهازك' : 'Or select local PDF/Word file')}
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setUploadedFileName(file.name);
                              const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
                              setUploadedFileSize(`${sizeMb} MB`);
                              if (!titleAr) {
                                setTitleAr(file.name.replace(/\.[^/.]+$/, ''));
                              }
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Summary points */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.summaryPointsInput}
                  </label>
                  <textarea
                    id="input-summary-points"
                    rows={3}
                    value={summaryPointsText}
                    onChange={(e) => setSummaryPointsText(e.target.value)}
                    placeholder="مفهوم التحكم التناسبي P وتأثيره على خطأ الحالة المستقرة&#10;طرق ضبط زيغلر-نيكولز الأولى والثانية&#10;تأثير الفعل التكاملي I في إلغاء الخطأ"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden"
                  />
                </div>

                {/* Key Formulas */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.formulasInput}
                  </label>
                  <input
                    id="input-key-formulas"
                    type="text"
                    value={keyFormulasText}
                    onChange={(e) => setKeyFormulasText(e.target.value)}
                    placeholder="مثال: u(t) = Kp * e(t) + Ki * ∫e(t)dt + Kd * de(t)/dt"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden"
                  />
                </div>
              </div>

              {/* Attached Quiz Builder */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-blue-900 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-600" />
                    <span>{t.addQuizQuestionsForLecture}</span>
                  </h3>
                  <button
                    type="button"
                    id="btn-add-quiz-question"
                    onClick={handleAddQuestion}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t.addQuestionBtn}</span>
                  </button>
                </div>

                {quizQuestions.map((q, qIndex) => (
                  <div 
                    key={qIndex}
                    className="p-4 rounded-xl border border-blue-100 bg-slate-50/60 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-900">
                        {language === 'ar' ? `السؤال رقم ${qIndex + 1}` : `Question #${qIndex + 1}`}
                      </span>
                      {quizQuestions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(qIndex)}
                          className="p-1 rounded-md text-red-500 hover:bg-red-50 text-xs"
                          title="حذف السؤال"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div>
                      <input
                        type="text"
                        value={q.questionAr}
                        onChange={(e) => {
                          const val = e.target.value;
                          setQuizQuestions(prev => prev.map((item, idx) => idx === qIndex ? { ...item, questionAr: val } : item));
                        }}
                        placeholder="نص السؤال بالعربية..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-blue-600 outline-hidden bg-white"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600 block">
                        {t.optionsLabel}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.optionsAr.map((opt, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-1.5">
                            <input
                              type="radio"
                              name={`correct-opt-${qIndex}`}
                              checked={q.correctIndex === optIndex}
                              onChange={() => {
                                setQuizQuestions(prev => prev.map((item, idx) => idx === qIndex ? { ...item, correctIndex: optIndex } : item));
                              }}
                              className="accent-blue-600"
                              title="تحديد كإجابة صحيحة"
                            />
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const val = e.target.value;
                                setQuizQuestions(prev => prev.map((item, idx) => {
                                  if (idx !== qIndex) return item;
                                  const updatedOpts = [...item.optionsAr];
                                  updatedOpts[optIndex] = val;
                                  return { ...item, optionsAr: updatedOpts };
                                }));
                              }}
                              placeholder={`الخيار ${String.fromCharCode(65 + optIndex)}`}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs focus:border-blue-600 outline-hidden bg-white"
                              required
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={q.explanationAr}
                        onChange={(e) => {
                          const val = e.target.value;
                          setQuizQuestions(prev => prev.map((item, idx) => idx === qIndex ? { ...item, explanationAr: val } : item));
                        }}
                        placeholder="التفسير الهندسي للإجابة النموذجية..."
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:border-blue-600 outline-hidden bg-white text-slate-600"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors"
                >
                  {t.adminCancel}
                </button>
                <button
                  type="submit"
                  id="btn-save-new-lecture"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-lg shadow-blue-500/25 flex items-center gap-1.5 transition-all"
                >
                  <FileUp className="w-4 h-4" />
                  <span>{t.saveLectureBtn}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
