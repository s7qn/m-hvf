import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LecturesView } from './components/LecturesView';
import { SummariesView } from './components/SummariesView';
import { ExamsView } from './components/ExamsView';
import { ScheduleView } from './components/ScheduleView';
import { QuizzesView } from './components/QuizzesView';
import { SecureQuizModal } from './components/SecureQuizModal';
import { AdminAddModal } from './components/AdminAddModal';
import { LectureViewerModal } from './components/LectureViewerModal';
import { StudentDashboard } from './components/StudentDashboard';

import { 
  INITIAL_SUBJECTS, 
  INITIAL_LECTURES, 
  INITIAL_SUMMARIES, 
  INITIAL_EXAMS, 
  INITIAL_SCHEDULE 
} from './data/initialData';
import { Lecture, QuizAttempt, Stage, Language, DeviceMode } from './types';
import { TRANSLATIONS } from './data/translations';
import { useDeviceDetector } from './hooks/useDeviceDetector';
import { DeviceFrame } from './components/DeviceFrame';

export default function App() {
  // Automatic Device Detection Hook
  const { detectedType } = useDeviceDetector();

  // Device Mode View State ('auto' | 'mobile' | 'tablet' | 'desktop')
  const [deviceMode, setDeviceMode] = useState<DeviceMode>(() => {
    const saved = localStorage.getItem('saytara_device_mode');
    if (saved === 'auto' || saved === 'mobile' || saved === 'tablet' || saved === 'desktop') {
      return saved;
    }
    return 'auto';
  });

  const handleDeviceModeChange = (mode: DeviceMode) => {
    setDeviceMode(mode);
    localStorage.setItem('saytara_device_mode', mode);
  };

  // Theme state (Dark Mode / Light Mode)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('saytara_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  // Sync theme class to <html> element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('saytara_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Language & Direction state
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('saytara_lang');
    return (saved === 'en' || saved === 'ar') ? saved : 'ar';
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'lectures' | 'summaries' | 'exams' | 'schedule' | 'quizzes' | 'dashboard'>('lectures');
  
  // Academic Stage Filter
  const [selectedStage, setSelectedStage] = useState<Stage | 'all'>('all');

  // Dynamic Data with LocalStorage Persistence
  const [lectures, setLectures] = useState<Lecture[]>(() => {
    try {
      const saved = localStorage.getItem('saytara_lectures');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Exclude any legacy mock lectures for control theory or empty subjects
          const cleaned = parsed.filter((l: Lecture) => !l.id?.startsWith('lec-ct-'));
          return cleaned;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_LECTURES;
  });

  const [quizAttempts, setQuizAttempts] = useState<Record<string, QuizAttempt>>(() => {
    try {
      const saved = localStorage.getItem('saytara_attempts');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {};
  });

  // Track student read lectures
  const [readLectureIds, setReadLectureIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('saytara_read_lectures');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  const handleToggleReadLecture = (lectureId: string) => {
    setReadLectureIds(prev => {
      const updated = prev.includes(lectureId)
        ? prev.filter(id => id !== lectureId)
        : [...prev, lectureId];
      localStorage.setItem('saytara_read_lectures', JSON.stringify(updated));
      return updated;
    });
  };

  // Admin lock state: "خيار لي فقط لاضافة الملازم الدراسية"
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('saytara_admin_unlocked') === 'true';
  });
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [adminInitialSubjectId, setAdminInitialSubjectId] = useState<string | undefined>(undefined);

  // Active Quiz Modal state
  const [activeQuizLecture, setActiveQuizLecture] = useState<Lecture | null>(null);

  // Active Lecture Preview Modal state
  const [viewingLecture, setViewingLecture] = useState<Lecture | null>(null);

  // 1. Requirement: "وعند الانتقال لتبويب اخر حول اسم التبويب الى السيطرة تفتقدك"
  useEffect(() => {
    const defaultTitle = language === 'ar' 
      ? 'منصة سيطرة | هندسة تقنيات السيطرة والأتمتة' 
      : 'Saytara Platform | Control & Automation Eng.';

    const handleVisibilityChange = () => {
      if (document.hidden) {
        document.title = 'السيطرة تفتقدك ⚠️';
      } else {
        document.title = defaultTitle;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.title = defaultTitle;

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [language]);

  // 2. Sync html dir and lang attribute
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('saytara_lang', language);
  }, [language]);

  // Save lectures changes
  const handleAddLecture = (newLecture: Lecture) => {
    setLectures(prev => {
      const updated = [newLecture, ...prev];
      localStorage.setItem('saytara_lectures', JSON.stringify(updated));
      return updated;
    });
  };

  // Delete custom lecture
  const handleDeleteLecture = (lectureId: string) => {
    setLectures(prev => {
      const updated = prev.filter(l => l.id !== lectureId);
      localStorage.setItem('saytara_lectures', JSON.stringify(updated));
      return updated;
    });
  };

  const handleOpenAddLecture = (subjectId?: string) => {
    setAdminInitialSubjectId(subjectId);
    setShowAdminModal(true);
  };

  // Save quiz attempt
  const handleSaveAttempt = (attempt: QuizAttempt) => {
    setQuizAttempts(prev => {
      const updated = {
        ...prev,
        [attempt.quizId]: attempt,
      };
      localStorage.setItem('saytara_attempts', JSON.stringify(updated));
      return updated;
    });
  };

  const handleUnlockAdmin = () => {
    setIsAdminUnlocked(true);
    sessionStorage.setItem('saytara_admin_unlocked', 'true');
  };

  const t = TRANSLATIONS[language];

  return (
    <DeviceFrame
      deviceMode={deviceMode}
      onDeviceModeChange={handleDeviceModeChange}
      detectedType={detectedType}
      language={language}
    >
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0b1329] text-slate-800 dark:text-slate-100 antialiased selection:bg-blue-600 selection:text-white transition-colors duration-200">
        {/* Sticky Navbar */}
        <Navbar
          language={language}
          onLanguageChange={setLanguage}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          selectedStage={selectedStage}
          onStageChange={setSelectedStage}
          onOpenAdmin={() => handleOpenAddLecture()}
          isAdminUnlocked={isAdminUnlocked}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          deviceMode={deviceMode}
          onDeviceModeChange={handleDeviceModeChange}
          detectedType={detectedType}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-5 sm:py-8">
          {activeTab === 'lectures' && (
            <LecturesView
              lectures={lectures}
              subjects={INITIAL_SUBJECTS}
              selectedStage={selectedStage}
              language={language}
              onSelectLectureToView={(lec) => {
                setViewingLecture(lec);
                // Auto mark as read when viewed if not already marked
                if (!readLectureIds.includes(lec.id)) {
                  handleToggleReadLecture(lec.id);
                }
              }}
              onStartQuiz={(lec) => setActiveQuizLecture(lec)}
              onOpenAddCustomLecture={handleOpenAddLecture}
              onDeleteLecture={handleDeleteLecture}
              readLectureIds={readLectureIds}
              onToggleReadLecture={handleToggleReadLecture}
              quizAttempts={quizAttempts}
              onOpenDashboard={() => setActiveTab('dashboard')}
            />
          )}

          {activeTab === 'dashboard' && (
            <StudentDashboard
              lectures={lectures}
              subjects={INITIAL_SUBJECTS}
              readLectureIds={readLectureIds}
              onToggleReadLecture={handleToggleReadLecture}
              quizAttempts={quizAttempts}
              language={language}
              onNavigateToLectures={() => setActiveTab('lectures')}
              onNavigateToQuizzes={() => setActiveTab('quizzes')}
              onStartQuiz={(lec) => setActiveQuizLecture(lec)}
            />
          )}

          {activeTab === 'summaries' && (
            <SummariesView
              summaries={INITIAL_SUMMARIES}
              subjects={INITIAL_SUBJECTS}
              selectedStage={selectedStage}
              language={language}
            />
          )}

          {activeTab === 'exams' && (
            <ExamsView
              exams={INITIAL_EXAMS}
              subjects={INITIAL_SUBJECTS}
              selectedStage={selectedStage}
              language={language}
            />
          )}

          {activeTab === 'schedule' && (
            <ScheduleView
              schedule={INITIAL_SCHEDULE}
              selectedStage={selectedStage}
              language={language}
            />
          )}

          {activeTab === 'quizzes' && (
            <QuizzesView
              lectures={lectures}
              subjects={INITIAL_SUBJECTS}
              attempts={quizAttempts}
              selectedStage={selectedStage}
              language={language}
              onStartQuiz={(lec) => setActiveQuizLecture(lec)}
            />
          )}
        </main>

        {/* Dedicated Footer with: صنع بواسطة مصطفى احمد وحسن علوان */}
        <Footer language={language} />

        {/* Secure Quiz Proctored Modal */}
        {activeQuizLecture && (
          <SecureQuizModal
            quiz={activeQuizLecture.quiz}
            lectureTitle={language === 'ar' ? activeQuizLecture.titleAr : activeQuizLecture.titleEn}
            subjectName={(() => {
              const sub = INITIAL_SUBJECTS.find(s => s.id === activeQuizLecture.subjectId);
              return sub ? (language === 'ar' ? sub.nameAr : sub.nameEn) : '';
            })()}
            language={language}
            onClose={() => setActiveQuizLecture(null)}
            onSaveAttempt={handleSaveAttempt}
          />
        )}

        {/* Lecture Preview Modal */}
        {viewingLecture && (
          <LectureViewerModal
            lecture={viewingLecture}
            subject={INITIAL_SUBJECTS.find(s => s.id === viewingLecture.subjectId)}
            language={language}
            isRead={readLectureIds.includes(viewingLecture.id)}
            onToggleRead={() => handleToggleReadLecture(viewingLecture.id)}
            onClose={() => setViewingLecture(null)}
            onStartQuiz={(lec) => {
              setViewingLecture(null);
              setActiveQuizLecture(lec);
            }}
          />
        )}

        {/* Admin Add Course Notes Modal: "خياري فقط لاضافة الملازم الدراسية" */}
        {showAdminModal && (
          <AdminAddModal
            subjects={INITIAL_SUBJECTS}
            language={language}
            isAdminUnlocked={isAdminUnlocked}
            onUnlockAdmin={handleUnlockAdmin}
            onClose={() => {
              setShowAdminModal(false);
              setAdminInitialSubjectId(undefined);
            }}
            onAddLecture={handleAddLecture}
            initialSubjectId={adminInitialSubjectId}
          />
        )}
      </div>
    </DeviceFrame>
  );
}
