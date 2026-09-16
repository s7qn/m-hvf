import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  HelpCircle,
  EyeOff,
  Lock,
  ArrowRight,
  ArrowLeft,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Quiz, QuizAttempt, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface SecureQuizModalProps {
  quiz: Quiz;
  lectureTitle: string;
  subjectName: string;
  language: Language;
  onClose: () => void;
  onSaveAttempt: (attempt: QuizAttempt) => void;
}

export const SecureQuizModal: React.FC<SecureQuizModalProps> = ({
  quiz,
  lectureTitle,
  subjectName,
  language,
  onClose,
  onSaveAttempt,
}) => {
  const t = TRANSLATIONS[language];

  // Exam phase: 'briefing' | 'active' | 'result'
  const [phase, setPhase] = useState<'briefing' | 'active' | 'result'>('briefing');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(quiz.durationMinutes * 60);
  const [strikes, setStrikes] = useState(0);
  const [showStrikeWarning, setShowStrikeWarning] = useState(false);
  const [strikeReason, setStrikeReason] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [securityToast, setSecurityToast] = useState<string | null>(null);
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger brief security alert toast
  const showSecurityAlert = useCallback((msg: string) => {
    setSecurityToast(msg);
    setTimeout(() => {
      setSecurityToast(null);
    }, 2800);
  }, []);

  // Handle strike registration
  const registerStrike = useCallback((reason: string) => {
    if (phase !== 'active') return;
    setStrikes(prev => {
      const newStrikes = prev + 1;
      setStrikeReason(reason);
      setShowStrikeWarning(true);

      if (newStrikes >= 3) {
        // Force submit due to excessive violation
        setTimeout(() => {
          submitExam();
        }, 1500);
      }
      return newStrikes;
    });
  }, [phase]);

  // Anti-Cheat Event Listeners (Anti-copy, anti-tab-switching, anti-screenshot)
  useEffect(() => {
    if (phase !== 'active') return;

    // 1. Tab Switching & Visibility Change detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        document.title = 'السيطرة تفتقدك ⚠️';
        setIsWindowBlurred(true);
        registerStrike(
          language === 'ar' 
            ? 'تم رصد الانتقال إلى تبويب متصفح آخر أثناء الاختبار' 
            : 'Detected switching to another browser tab'
        );
      } else {
        setIsWindowBlurred(false);
      }
    };

    // 2. Window Blur detection (clicking outside window / opening devtools / apps)
    const handleWindowBlur = () => {
      setIsWindowBlurred(true);
      registerStrike(
        language === 'ar' 
          ? 'تم رصد مغادرة نافذة الاختبار أو النقر خارج المتصفح' 
          : 'Detected leaving the exam window or clicking outside'
      );
    };

    const handleWindowFocus = () => {
      setIsWindowBlurred(false);
    };

    // 3. Anti-Screenshot and Keyboard shortcuts prevention
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent PrintScreen
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        e.preventDefault();
        setIsWindowBlurred(true);
        showSecurityAlert(t.screenshotForbidden);
        registerStrike(
          language === 'ar' 
            ? 'محاولة التقاط شاشة (PrintScreen) ممنوعة في هذا الاختبار السري' 
            : 'Screenshot attempt blocked'
        );
        setTimeout(() => setIsWindowBlurred(false), 2000);
        return false;
      }

      // Prevent Ctrl+C / Cmd+C (Copy)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        showSecurityAlert(
          language === 'ar' ? 'النسخ ممنوع منعاً باتاً داخل الاختبار' : 'Copying is prohibited in this exam'
        );
        return false;
      }

      // Prevent Ctrl+P (Print)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        showSecurityAlert(language === 'ar' ? 'الطباعة ممنوعة' : 'Printing is blocked');
        return false;
      }

      // Prevent Windows+Shift+S or Cmd+Shift+3/4
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        (e.key === 's' || e.key === 'S' || e.key === '3' || e.key === '4')
      ) {
        e.preventDefault();
        setIsWindowBlurred(true);
        showSecurityAlert(t.screenshotForbidden);
        registerStrike(language === 'ar' ? 'محاولة أخذ لقطة شاشة' : 'Screenshot attempt detected');
        setTimeout(() => setIsWindowBlurred(false), 2000);
        return false;
      }
    };

    // 4. Anti-Right Click (Context Menu)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      showSecurityAlert(language === 'ar' ? 'النقر بالزر الأيمن معطل' : 'Right-click menu disabled');
      return false;
    };

    // 5. Anti-Select / Drag
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);

    document.body.classList.add('in-exam');

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
      document.body.classList.remove('in-exam');
    };
  }, [phase, registerStrike, showSecurityAlert, language, t.screenshotForbidden]);

  // Exam Countdown Timer
  useEffect(() => {
    if (phase !== 'active') return;

    timerRef.current = setInterval(() => {
      setTimeRemainingSeconds(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  // Start Exam
  const handleStartExam = () => {
    setPhase('active');
    setTimeRemainingSeconds(quiz.durationMinutes * 60);
    setStrikes(0);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Select option
  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIdx]: optionIdx,
    }));
  };

  // Calculate results and submit
  const submitExam = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    let correctCount = 0;
    quiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    const total = quiz.questions.length;
    const percentage = Math.round((correctCount / total) * 100);
    const passed = percentage >= quiz.passingScore;
    const timeSpent = quiz.durationMinutes * 60 - timeRemainingSeconds;

    const attempt: QuizAttempt = {
      id: 'att-' + Date.now(),
      quizId: quiz.id,
      quizTitleAr: quiz.titleAr,
      quizTitleEn: quiz.titleEn,
      subjectNameAr: subjectName,
      subjectNameEn: subjectName,
      score: correctCount,
      totalQuestions: total,
      percentage,
      date: new Date().toISOString(),
      strikes,
      passed,
      timeSpentSeconds: timeSpent,
    };

    onSaveAttempt(attempt);
    setPhase('result');

    if (passed) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore if unavailable
      }
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  return (
    <div 
      ref={containerRef}
      id="secure-quiz-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto exam-secure-mode"
    >
      {/* Security Toast Notification */}
      {securityToast && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-60 bg-red-600 text-white px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm shadow-xl flex items-center gap-2 border border-red-400 animate-bounce">
          <ShieldAlert className="w-4 h-4" />
          <span>{securityToast}</span>
        </div>
      )}

      {/* Screenshot / Tab Blur Privacy Shield */}
      {isWindowBlurred && phase === 'active' && (
        <div className="fixed inset-0 z-55 bg-slate-900/95 backdrop-blur-2xl flex flex-col items-center justify-center text-white p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mb-4 animate-pulse">
            <EyeOff className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-red-400 mb-2">
            {language === 'ar' ? 'تم تعتيم وحماية المحتوى السري للاختبار!' : 'Exam Content Obscured for Privacy Protection'}
          </h3>
          <p className="text-sm text-slate-300 max-w-md mb-6">
            {language === 'ar'
              ? 'يرجى النقر داخل نافذة الاختبار فوراً للعودة ومتابعة الإجابة. تذكر أن مغادرة التبويب تسجل مخالفة غش.'
              : 'Please click back into the exam window immediately. Tab-switching is penalized.'}
          </p>
          <button
            onClick={() => setIsWindowBlurred(false)}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-colors"
          >
            {language === 'ar' ? 'العودة للاختبار الآن' : 'Resume Exam'}
          </button>
        </div>
      )}

      {/* Main Modal Container */}
      <div 
        id="secure-quiz-container"
        className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-blue-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto max-h-[95vh] transition-colors"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 dark:from-[#0d1b3e] dark:via-[#11224d] dark:to-[#172554] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-wide text-blue-200 uppercase">
                  {t.examSecureTitle}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/30 text-red-200 font-bold border border-red-400/30">
                  {language === 'ar' ? 'مؤمن ضد الغش والنسخ' : 'Anti-Cheat Protected'}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-md">
                {language === 'ar' ? quiz.titleAr : quiz.titleEn}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {phase === 'active' && (
              <button
                id="btn-toggle-fullscreen"
                onClick={toggleFullscreen}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                title={t.fullscreenPrompt}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            )}
            {phase !== 'active' && (
              <button
                id="btn-close-quiz"
                onClick={onClose}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PHASE 1: BRIEFING & SECURITY AGREEMENT */}
        {/* ========================================================================= */}
        {phase === 'briefing' && (
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
            <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-blue-950 dark:text-white">
                    {language === 'ar' ? 'معلومات الاختبار والمحاضرة التابعة له' : 'Exam & Associated Lecture Details'}
                  </h3>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1 font-medium">
                    {subjectName} — {lectureTitle}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-blue-200/60 dark:border-blue-800/60 text-xs">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">{language === 'ar' ? 'عدد الأسئلة' : 'Questions'}</span>
                      <span className="font-bold text-blue-900 dark:text-blue-200">{quiz.questions.length} {language === 'ar' ? 'أسئلة' : 'Questions'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">{language === 'ar' ? 'مدة الاختبار' : 'Duration'}</span>
                      <span className="font-bold text-blue-900 dark:text-blue-200">{quiz.durationMinutes} {language === 'ar' ? 'دقائق' : 'Minutes'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">{language === 'ar' ? 'درجة النجاح' : 'Passing Grade'}</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">%{quiz.passingScore}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Anti-Cheat Rules specifically requested */}
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-black text-sm">
                <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span>{t.antiCheatRules}</span>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                  <span>{t.antiCheatRule1}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                  <span>{t.antiCheatRule2}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                  <span>{t.antiCheatRule3}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                  <span>{t.antiCheatRule4}</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                id="btn-cancel-briefing"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                {language === 'ar' ? 'إلغاء والعودة للمحاضرات' : 'Cancel & Back'}
              </button>
              <button
                id="btn-start-secure-quiz"
                onClick={handleStartExam}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{t.iUnderstandAndStart}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PHASE 2: ACTIVE SECURE EXAM */}
        {/* ========================================================================= */}
        {phase === 'active' && (
          <div className="p-4 sm:p-6 flex flex-col flex-1 overflow-y-auto space-y-4 select-none">
            {/* Live Stats Bar: Timer, Progress, Strikes */}
            <div className="bg-blue-50/70 dark:bg-slate-800/80 border border-blue-200 dark:border-slate-700 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
              {/* Question Progress */}
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="text-blue-700 dark:text-blue-400">
                  {t.questionProgress} {currentQuestionIndex + 1} {t.of} {quiz.questions.length}
                </span>
                <span className="text-slate-400">|</span>
                <span className="text-emerald-700 dark:text-emerald-400">
                  {answeredCount}/{quiz.questions.length} {language === 'ar' ? 'تمت الإجابة' : 'Answered'}
                </span>
              </div>

              {/* Timer */}
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1 rounded-lg font-mono font-black text-sm sm:text-base flex items-center gap-1.5 shadow-xs ${
                  timeRemainingSeconds < 180 
                    ? 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 animate-pulse'
                    : 'bg-white dark:bg-slate-900 text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-slate-700'
                }`}>
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>{formatTimer(timeRemainingSeconds)}</span>
                </div>
              </div>

              {/* Anti-Cheat Strike Indicator */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{t.strikesCount}:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3].map(stk => (
                    <span 
                      key={stk}
                      className={`w-3 h-3 rounded-full border transition-all ${
                        strikes >= stk 
                          ? 'bg-red-600 border-red-700 animate-ping-once' 
                          : 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600'
                      }`}
                      title={`${language === 'ar' ? 'مخالفة' : 'Strike'} ${stk}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
              />
            </div>

            {/* Current Question Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 text-xs font-black">
                    Q{currentQuestionIndex + 1}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {language === 'ar' ? 'سؤال متعدد الخيارات (اختيار واحد فقط)' : 'Single Choice Multiple Question'}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                  {language === 'ar' ? currentQuestion.questionAr : currentQuestion.questionEn}
                </h3>

                {currentQuestion.codeOrFormula && (
                  <div className="bg-slate-900 text-blue-300 font-mono text-xs sm:text-sm p-3 rounded-xl overflow-x-auto border border-slate-800">
                    {currentQuestion.codeOrFormula}
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="space-y-2.5 pt-2">
                {(language === 'ar' ? currentQuestion.optionsAr : currentQuestion.optionsEn).map((opt, optIdx) => {
                  const isSelected = selectedAnswers[currentQuestionIndex] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      id={`quiz-opt-${currentQuestionIndex}-${optIdx}`}
                      onClick={() => handleSelectOption(currentQuestionIndex, optIdx)}
                      className={`w-full text-start p-3.5 rounded-xl border font-medium text-xs sm:text-sm transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/90 dark:bg-blue-950/80 border-blue-500 dark:border-blue-500 text-blue-950 dark:text-blue-100 font-bold shadow-xs'
                          : 'bg-slate-50/60 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300 dark:border-slate-600'
                      }`}>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation Buttons between questions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                id="btn-prev-question"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs sm:text-sm text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {language === 'ar' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                <span>{language === 'ar' ? 'السابق' : 'Previous'}</span>
              </button>

              <div className="flex items-center gap-2">
                {isLastQuestion ? (
                  <button
                    id="btn-submit-exam"
                    onClick={submitExam}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t.submitQuiz}</span>
                  </button>
                ) : (
                  <button
                    id="btn-next-question"
                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>{language === 'ar' ? 'التالي' : 'Next'}</span>
                    {language === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PHASE 3: RESULTS & FULL ANSWER REVIEW */}
        {/* ========================================================================= */}
        {phase === 'result' && (
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[80vh]">
            {(() => {
              let correct = 0;
              quiz.questions.forEach((q, i) => {
                if (selectedAnswers[i] === q.correctIndex) correct++;
              });
              const total = quiz.questions.length;
              const pct = Math.round((correct / total) * 100);
              const isPassed = pct >= quiz.passingScore;

              return (
                <div className="space-y-6">
                  {/* Score Header */}
                  <div className={`p-6 rounded-2xl border text-center relative overflow-hidden ${
                    isPassed 
                      ? 'bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/30 dark:to-slate-900 border-emerald-200 dark:border-emerald-800' 
                      : 'bg-gradient-to-b from-rose-50 to-white dark:from-rose-950/30 dark:to-slate-900 border-rose-200 dark:border-rose-800'
                  }`}>
                    <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-md">
                      {isPassed ? (
                        <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
                          <CheckCircle2 className="w-8 h-8" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-rose-600 text-white flex items-center justify-center">
                          <XCircle className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    <h3 className={`text-xl sm:text-2xl font-black ${isPassed ? 'text-emerald-800 dark:text-emerald-300' : 'text-rose-800 dark:text-rose-300'}`}>
                      {isPassed ? t.passed : t.failed}
                    </h3>

                    <div className="flex items-center justify-center gap-6 mt-4">
                      <div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">{t.score}</span>
                        <span className="text-3xl font-black text-slate-900 dark:text-white">%{pct}</span>
                      </div>
                      <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
                      <div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">{t.correctAnswers}</span>
                        <span className="text-xl font-black text-blue-900 dark:text-blue-300">{correct} / {total}</span>
                      </div>
                      <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
                      <div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">{t.strikesCount}</span>
                        <span className={`text-xl font-black ${strikes > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {strikes}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Comprehensive Questions Breakdown & Explanations */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>{language === 'ar' ? 'مراجعة الإجابات والحلول النموذجية:' : 'Answer Review & Detailed Explanations:'}</span>
                    </h4>

                    {quiz.questions.map((q, idx) => {
                      const userChoice = selectedAnswers[idx];
                      const isCorrect = userChoice === q.correctIndex;
                      const options = language === 'ar' ? q.optionsAr : q.optionsEn;

                      return (
                        <div 
                          key={q.id}
                          className={`p-4 rounded-xl border text-xs sm:text-sm space-y-2.5 transition-all ${
                            isCorrect 
                              ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/80' 
                              : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/80'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                              {idx + 1}. {language === 'ar' ? q.questionAr : q.questionEn}
                            </span>
                            {isCorrect ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-[10px] font-bold shrink-0">
                                {language === 'ar' ? 'صحيحة' : 'Correct'}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 text-[10px] font-bold shrink-0">
                                {language === 'ar' ? 'خاطئة' : 'Incorrect'}
                              </span>
                            )}
                          </div>

                          <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 dark:text-slate-400 font-semibold">{t.yourAnswer}</span>
                              <span className={isCorrect ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-rose-700 dark:text-rose-400 font-bold line-through'}>
                                {userChoice !== undefined ? options[userChoice] : (language === 'ar' ? 'لم تتم الإجابة' : 'Not answered')}
                              </span>
                            </div>

                            {!isCorrect && (
                              <div className="flex items-center gap-2">
                                <span className="text-slate-500 dark:text-slate-400 font-semibold">{t.correctAnswer}</span>
                                <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                                  {options[q.correctIndex]}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Engineering Explanation */}
                          <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-lg border border-slate-200/80 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                            <span className="font-bold text-blue-900 dark:text-blue-300 block mb-1">
                              {t.explanation}
                            </span>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                              {language === 'ar' ? q.explanationAr : q.explanationEn}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      id="btn-retake-quiz"
                      onClick={handleStartExam}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>{t.retakeQuiz}</span>
                    </button>
                    <button
                      id="btn-finish-quiz"
                      onClick={onClose}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                    >
                      <span>{t.backToLecture}</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Security Strike Warning Modal (Active Exam) */}
      {showStrikeWarning && (
        <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-red-600 text-center space-y-4 animate-shake">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto animate-pulse">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-black text-red-700">
                {t.strikeWarningTitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2">
                {strikeReason || t.strikeWarningDesc}
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center justify-center gap-3">
              <span className="text-xs font-bold text-red-900">{t.strikesCount}:</span>
              <span className="text-2xl font-black text-red-700">{strikes} / 3</span>
            </div>

            <button
              id="btn-dismiss-strike-warning"
              onClick={() => setShowStrikeWarning(false)}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-sm shadow-lg transition-all"
            >
              {t.closeWarning}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
