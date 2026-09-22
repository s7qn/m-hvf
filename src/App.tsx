import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
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
import { Lecture, QuizAttempt, Stage, Language, DeviceMode, Summary, ExamQuestionPaper, ScheduleItem } from './types';
import { TRANSLATIONS } from './data/translations';
import { useDeviceDetector } from './hooks/useDeviceDetector';
import { DeviceFrame } from './components/DeviceFrame';
import { setFavicon, PLATFORM_LOGO_SVG, PLATFORM_AWAY_LOGO_SVG } from './utils/tabVisibility';
import { useStudentProgress } from './hooks/useStudentProgress';
import { 
  fetchSharedContent, 
  saveSharedLecture, 
  deleteSharedLecture, 
  saveSharedSummary, 
  deleteSharedSummary, 
  saveSharedExam, 
  deleteSharedExam, 
  saveSharedScheduleItem, 
  deleteSharedScheduleItem, 
  resetSharedSchedule 
} from './services/contentApi';

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

  // Student Local Device Progress Hook (Saved locally on student's machine/browser)
  const {
    profile,
    updateProfile,
    studyDays,
    studyMinutes,
    streakCount,
    recordActivityToday,
    exportStudentBackup,
    importStudentBackup,
    resetStudentProgress,
  } = useStudentProgress();

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
  
  // Helper to remove any Baath party materials as requested by the user
  const isBaathMaterial = (item: any) => {
    if (!item) return false;
    if (item.subjectId === 'baath-crimes') return true;
    const titleAr = String(item.titleAr || '');
    const titleEn = String(item.titleEn || '');
    return titleAr.includes('البعث') || titleEn.toLowerCase().includes('baath');
  };

  // Academic Stage Filter
  const [selectedStage, setSelectedStage] = useState<Stage | 'all'>('all');

  // Dynamic Lectures with LocalStorage Persistence
  const [lectures, setLectures] = useState<Lecture[]>(() => {
    try {
      const saved = localStorage.getItem('saytara_lectures');
      const deleted: string[] = JSON.parse(localStorage.getItem('saytara_deleted_lectures') || '[]');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((l: Lecture) => 
            !l.id?.startsWith('lec-ct-') && 
            !isBaathMaterial(l) && 
            !deleted.includes(l.id)
          );
          localStorage.setItem('saytara_lectures', JSON.stringify(cleaned));
          return cleaned;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_LECTURES.filter(l => !isBaathMaterial(l));
  });

  // Dynamic Summaries with LocalStorage Persistence
  const [summaries, setSummaries] = useState<Summary[]>(() => {
    try {
      const saved = localStorage.getItem('saytara_summaries');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((s: Summary) => !isBaathMaterial(s));
          return cleaned;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_SUMMARIES.filter(s => !isBaathMaterial(s));
  });

  // Dynamic Exams with LocalStorage Persistence
  const [exams, setExams] = useState<ExamQuestionPaper[]>(() => {
    try {
      const saved = localStorage.getItem('saytara_exams');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_EXAMS;
  });

  // Dynamic Schedule with LocalStorage Persistence
  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => {
    try {
      const saved = localStorage.getItem('saytara_schedule');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_SCHEDULE;
  });

  // Student Quiz Attempts (Saved on Student Device)
  const [quizAttempts, setQuizAttempts] = useState<Record<string, QuizAttempt>>(() => {
    try {
      const saved = localStorage.getItem('saytara_attempts');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {};
  });

  // Student Read Lectures List (Saved on Student Device)
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
    recordActivityToday(15);
  };

  // Admin lock state: "امكانية الاضافة في خانة الملخصات والجداول والاسئلة والامتحانات لي فقط من خلال الرمز السري"
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('saytara_admin_unlocked') === 'true';
  });
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [adminInitialSubjectId, setAdminInitialSubjectId] = useState<string | undefined>(undefined);
  const [adminInitialTab, setAdminInitialTab] = useState<'lectures' | 'summaries' | 'schedule' | 'exams' | 'sync'>('lectures');

  // Active Quiz Modal state
  const [activeQuizLecture, setActiveQuizLecture] = useState<Lecture | null>(null);

  // Active Lecture Preview Modal state
  const [viewingLecture, setViewingLecture] = useState<Lecture | null>(null);

  // --------------------------------------------------------------------------
  // TAB VISIBILITY & LOGO SWITCHING (User Requirement):
  // "ومن يغادر احد المنصة حول اسم التبويب الى السيطرة تفتقدك وغير لوغو التبويب عند المغادرة لجعله نفس لوغو المنصة"
  // --------------------------------------------------------------------------
  useEffect(() => {
    const defaultTitle = language === 'ar' 
      ? 'منصة سيطرة | هندسة تقنيات السيطرة والأتمتة' 
      : 'Saytara Platform | Control & Automation Eng.';

    const awayTitle = language === 'ar'
      ? 'السيطرة تفتقدك'
      : 'Saytara Misses You!';

    setFavicon(PLATFORM_LOGO_SVG);
    document.title = defaultTitle;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        document.title = awayTitle;
        setFavicon(PLATFORM_AWAY_LOGO_SVG);
      } else {
        document.title = defaultTitle;
        setFavicon(PLATFORM_LOGO_SVG);
      }
    };

    const handleWindowBlur = () => {
      document.title = awayTitle;
      setFavicon(PLATFORM_AWAY_LOGO_SVG);
    };

    const handleWindowFocus = () => {
      document.title = defaultTitle;
      setFavicon(PLATFORM_LOGO_SVG);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [language]);

  // Sync html dir and lang attribute
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('saytara_lang', language);
  }, [language]);

  // --------------------------------------------------------------------------
  // SERVER SYNCHRONIZATION FOR ALL STUDENTS
  // "المحاضرة من اضيفها اريدها تظهر للكل مو بس الي يعني لكل الطلاب"
  // --------------------------------------------------------------------------
  const syncContentFromServer = async () => {
    try {
      const data = await fetchSharedContent();
      if (!data) return;

      // 1. Sync Lectures: Combine default lectures with server-persisted shared lectures
      if (Array.isArray(data.lectures)) {
        setLectures(prev => {
          const serverDeleted = Array.isArray(data.deletedLectureIds) ? data.deletedLectureIds : [];
          let localDeleted: string[] = [];
          try {
            localDeleted = JSON.parse(localStorage.getItem('saytara_deleted_lectures') || '[]');
          } catch {
            localDeleted = [];
          }
          const allDeleted = new Set([...serverDeleted, ...localDeleted]);

          const map = new Map<string, Lecture>();
          // Base official lectures (excluding any deleted or baath lectures)
          INITIAL_LECTURES.forEach(l => {
            if (!allDeleted.has(l.id) && !isBaathMaterial(l)) {
              map.set(l.id, l);
            }
          });

          // Server authoritative lectures (persisted for all students)
          data.lectures.forEach(l => {
            if (!allDeleted.has(l.id) && !isBaathMaterial(l)) {
              map.set(l.id, l);
            }
          });

          // Previous local custom items (if not deleted and not baath)
          prev.filter(l => l.isCustom && !allDeleted.has(l.id) && !isBaathMaterial(l)).forEach(l => {
            if (!map.has(l.id)) {
              map.set(l.id, l);
            }
          });

          const combined = Array.from(map.values());
          // Sort so custom/newly added lectures appear at the top
          const custom = combined.filter(l => l.isCustom);
          const standard = combined.filter(l => !l.isCustom);
          const finalLectures = [...custom, ...standard];
          localStorage.setItem('saytara_lectures', JSON.stringify(finalLectures));
          return finalLectures;
        });
      }

      // 2. Sync Summaries
      if (Array.isArray(data.summaries)) {
        setSummaries(prev => {
          const map = new Map<string, Summary>();
          INITIAL_SUMMARIES.filter(s => !isBaathMaterial(s)).forEach(s => map.set(s.id, s));
          prev.filter(s => !isBaathMaterial(s)).forEach(s => map.set(s.id, s));
          data.summaries.filter(s => !isBaathMaterial(s)).forEach(s => map.set(s.id, s));
          const finalSummaries = Array.from(map.values());
          localStorage.setItem('saytara_summaries', JSON.stringify(finalSummaries));
          return finalSummaries;
        });
      }

      // 3. Sync Exams
      if (Array.isArray(data.exams)) {
        setExams(prev => {
          const map = new Map<string, ExamQuestionPaper>();
          INITIAL_EXAMS.filter(e => !isBaathMaterial(e)).forEach(e => map.set(e.id, e));
          prev.filter(e => !isBaathMaterial(e)).forEach(e => map.set(e.id, e));
          data.exams.filter(e => !isBaathMaterial(e)).forEach(e => map.set(e.id, e));
          const finalExams = Array.from(map.values());
          localStorage.setItem('saytara_exams', JSON.stringify(finalExams));
          return finalExams;
        });
      }

      // 4. Sync Schedule (if modified on server)
      if (Array.isArray(data.schedule) && data.schedule.length > 0) {
        setSchedule(data.schedule);
        localStorage.setItem('saytara_schedule', JSON.stringify(data.schedule));
      }
    } catch (err) {
      console.warn('[Sync] Content sync warning:', err);
    }
  };

  useEffect(() => {
    // Initial fetch on mount
    syncContentFromServer();

    // Periodic synchronization every 15 seconds to fetch lectures added by other users/admin
    const interval = setInterval(syncContentFromServer, 15000);

    // Re-sync whenever user returns to window tab
    const handleFocus = () => {
      syncContentFromServer();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // --------------------------------------------------------------------------
  // CONTENT MANAGEMENT HANDLERS (Admin Only - Shared With All Students)
  // --------------------------------------------------------------------------
  const handleAddLecture = (newLecture: Lecture) => {
    if (isBaathMaterial(newLecture)) return;

    setLectures(prev => {
      const updated = [newLecture, ...prev.filter(l => l.id !== newLecture.id)];
      localStorage.setItem('saytara_lectures', JSON.stringify(updated));
      return updated;
    });

    // If it was in locally deleted list, remove it
    try {
      const deleted: string[] = JSON.parse(localStorage.getItem('saytara_deleted_lectures') || '[]');
      const filtered = deleted.filter(id => id !== newLecture.id);
      localStorage.setItem('saytara_deleted_lectures', JSON.stringify(filtered));
    } catch {
      // ignore
    }

    // Persist to server so it is immediately visible to all students across the shared link and saved in repo!
    saveSharedLecture(newLecture).catch(err => console.error(err));
  };

  const handleDeleteLecture = (lectureId: string) => {
    setLectures(prev => {
      const updated = prev.filter(l => l.id !== lectureId);
      localStorage.setItem('saytara_lectures', JSON.stringify(updated));
      return updated;
    });

    // Record in local deleted blacklist so periodic sync will never resurrect it
    try {
      const deleted: string[] = JSON.parse(localStorage.getItem('saytara_deleted_lectures') || '[]');
      if (!deleted.includes(lectureId)) {
        deleted.push(lectureId);
        localStorage.setItem('saytara_deleted_lectures', JSON.stringify(deleted));
      }
    } catch {
      // ignore
    }

    deleteSharedLecture(lectureId).catch(err => console.error(err));
  };

  const handleAddSummary = (newSummary: Summary) => {
    setSummaries(prev => {
      const updated = [newSummary, ...prev.filter(s => s.id !== newSummary.id)];
      localStorage.setItem('saytara_summaries', JSON.stringify(updated));
      return updated;
    });
    saveSharedSummary(newSummary).catch(err => console.error(err));
  };

  const handleDeleteSummary = (summaryId: string) => {
    setSummaries(prev => {
      const updated = prev.filter(s => s.id !== summaryId);
      localStorage.setItem('saytara_summaries', JSON.stringify(updated));
      return updated;
    });
    deleteSharedSummary(summaryId).catch(err => console.error(err));
  };

  const handleAddScheduleItem = (newItem: ScheduleItem) => {
    setSchedule(prev => {
      const updated = [newItem, ...prev.filter(item => item.id !== newItem.id)];
      localStorage.setItem('saytara_schedule', JSON.stringify(updated));
      return updated;
    });
    saveSharedScheduleItem(newItem).catch(err => console.error(err));
  };

  const handleDeleteScheduleItem = (itemId: string) => {
    setSchedule(prev => {
      const updated = prev.filter(s => s.id !== itemId);
      localStorage.setItem('saytara_schedule', JSON.stringify(updated));
      return updated;
    });
    deleteSharedScheduleItem(itemId).catch(err => console.error(err));
  };

  const handleResetSchedule = () => {
    setSchedule(INITIAL_SCHEDULE);
    localStorage.setItem('saytara_schedule', JSON.stringify(INITIAL_SCHEDULE));
    resetSharedSchedule().catch(err => console.error(err));
  };

  const handleAddExam = (newExam: ExamQuestionPaper) => {
    setExams(prev => {
      const updated = [newExam, ...prev.filter(e => e.id !== newExam.id)];
      localStorage.setItem('saytara_exams', JSON.stringify(updated));
      return updated;
    });
    saveSharedExam(newExam).catch(err => console.error(err));
  };

  const handleDeleteExam = (examId: string) => {
    setExams(prev => {
      const updated = prev.filter(e => e.id !== examId);
      localStorage.setItem('saytara_exams', JSON.stringify(updated));
      return updated;
    });
    deleteSharedExam(examId).catch(err => console.error(err));
  };

  const handleOpenAdminTab = (tab: 'lectures' | 'summaries' | 'schedule' | 'exams' | 'sync', subjectId?: string) => {
    setAdminInitialTab(tab);
    setAdminInitialSubjectId(subjectId);
    setShowAdminModal(true);
  };

  // Save student quiz attempt
  const handleSaveAttempt = (attempt: QuizAttempt) => {
    setQuizAttempts(prev => {
      const updated = {
        ...prev,
        [attempt.quizId]: attempt,
      };
      localStorage.setItem('saytara_attempts', JSON.stringify(updated));
      return updated;
    });
    recordActivityToday(20);
  };

  const handleUnlockAdmin = () => {
    setIsAdminUnlocked(true);
    sessionStorage.setItem('saytara_admin_unlocked', 'true');
  };

  // Full reset of student progress on this device
  const handleFullReset = () => {
    resetStudentProgress();
    setReadLectureIds([]);
    setQuizAttempts({});
  };

  // Import backup file
  const handleImportBackup = (jsonString: string) => {
    const success = importStudentBackup(jsonString);
    if (success) {
      try {
        const savedReads = localStorage.getItem('saytara_read_lectures');
        if (savedReads) setReadLectureIds(JSON.parse(savedReads));
        const savedAttempts = localStorage.getItem('saytara_attempts');
        if (savedAttempts) setQuizAttempts(JSON.parse(savedAttempts));
      } catch (e) {
        console.error(e);
      }
    }
    return success;
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
        {/* Sticky Navbar with Student Profile & Streak Display */}
        <Navbar
          language={language}
          onLanguageChange={setLanguage}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          selectedStage={selectedStage}
          onStageChange={setSelectedStage}
          onOpenAdmin={() => handleOpenAdminTab('lectures')}
          isAdminUnlocked={isAdminUnlocked}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          deviceMode={deviceMode}
          onDeviceModeChange={handleDeviceModeChange}
          detectedType={detectedType}
          profile={profile}
          streakCount={streakCount}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-8 pb-24 md:pb-8">
          {activeTab === 'lectures' && (
            <LecturesView
              lectures={lectures}
              subjects={INITIAL_SUBJECTS}
              selectedStage={selectedStage}
              language={language}
              onSelectLectureToView={(lec) => {
                setViewingLecture(lec);
                recordActivityToday(10);
                if (!readLectureIds.includes(lec.id)) {
                  handleToggleReadLecture(lec.id);
                }
              }}
              onStartQuiz={(lec) => setActiveQuizLecture(lec)}
              onOpenAddCustomLecture={(subId) => handleOpenAdminTab('lectures', subId)}
              onDeleteLecture={handleDeleteLecture}
              readLectureIds={readLectureIds}
              onToggleReadLecture={handleToggleReadLecture}
              quizAttempts={quizAttempts}
              onOpenDashboard={() => {
                setActiveTab('dashboard');
                recordActivityToday(5);
              }}
              isAdminUnlocked={isAdminUnlocked}
            />
          )}

          {/* Student Private Statistics Dashboard:
              "سوي لكل طالب لوحة احصائيات خاصة بي بس هو يكدر يشوفها واحفظ تقدم الطالب بالمنصة ولا تفقده لمن يغادرها ويكون الحفظ في جهاز الطالب"
          */}
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
              profile={profile}
              onUpdateProfile={updateProfile}
              streakCount={streakCount}
              studyMinutes={studyMinutes}
              onExportBackup={exportStudentBackup}
              onImportBackup={handleImportBackup}
              onResetProgress={handleFullReset}
            />
          )}

          {activeTab === 'summaries' && (
            <SummariesView
              summaries={summaries}
              subjects={INITIAL_SUBJECTS}
              selectedStage={selectedStage}
              language={language}
              isAdminUnlocked={isAdminUnlocked}
              onOpenAddModal={() => handleOpenAdminTab('summaries')}
              onDeleteSummary={handleDeleteSummary}
            />
          )}

          {activeTab === 'exams' && (
            <ExamsView
              exams={exams}
              subjects={INITIAL_SUBJECTS}
              selectedStage={selectedStage}
              language={language}
              isAdminUnlocked={isAdminUnlocked}
              onOpenAddModal={() => handleOpenAdminTab('exams')}
              onDeleteExam={handleDeleteExam}
            />
          )}

          {activeTab === 'schedule' && (
            <ScheduleView
              schedule={schedule}
              selectedStage={selectedStage}
              language={language}
              isAdminUnlocked={isAdminUnlocked}
              onOpenAddModal={() => handleOpenAdminTab('schedule')}
              onDeleteScheduleItem={handleDeleteScheduleItem}
              onResetSchedule={handleResetSchedule}
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

        {/* Dedicated Footer */}
        <Footer language={language} />

        {/* Mobile Sticky Bottom Navigation Bar */}
        <MobileBottomNav
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab === 'dashboard') recordActivityToday(5);
          }}
          language={language}
          selectedStage={selectedStage}
          onStageChange={setSelectedStage}
          isAdminUnlocked={isAdminUnlocked}
          onOpenAdmin={() => handleOpenAdminTab(activeTab === 'summaries' ? 'summaries' : activeTab === 'schedule' ? 'schedule' : activeTab === 'exams' ? 'exams' : 'lectures')}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onLanguageChange={setLanguage}
          deviceMode={deviceMode}
          onDeviceModeChange={handleDeviceModeChange}
          detectedType={detectedType}
          profile={profile}
          streakCount={streakCount}
        />

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

        {/* Admin Add Course Notes Modal: Passcode Protected */}
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
            onAddSummary={handleAddSummary}
            onAddScheduleItem={handleAddScheduleItem}
            onAddExam={handleAddExam}
            initialSubjectId={adminInitialSubjectId}
            initialTab={adminInitialTab}
          />
        )}
      </div>
    </DeviceFrame>
  );
}
