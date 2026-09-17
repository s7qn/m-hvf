import { useState, useEffect, useCallback, useMemo } from 'react';
import { StudentProfile, Stage } from '../types';

const DEFAULT_PROFILE: StudentProfile = {
  name: 'طالب هندسة السيطرة والأتمتة',
  universityId: 'CAE-2024-01',
  stage: 2,
  group: 'A',
  avatarId: 'circuit',
  joinedDate: new Date().toISOString().split('T')[0],
  dailyGoalMinutes: 45,
};

export function useStudentProgress() {
  // 1. Student Profile
  const [profile, setProfile] = useState<StudentProfile>(() => {
    try {
      const saved = localStorage.getItem('saytara_student_profile');
      if (saved) return { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
    } catch {
      // fallback
    }
    return DEFAULT_PROFILE;
  });

  // 2. Active Study Days (for consecutive day streak calculation)
  const [studyDays, setStudyDays] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('saytara_study_days');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    const today = new Date().toISOString().split('T')[0];
    return [today];
  });

  // 3. Accumulated Study Minutes
  const [studyMinutes, setStudyMinutes] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('saytara_study_minutes');
      if (saved) return Number(saved) || 60;
    } catch {
      // fallback
    }
    return 60; // Initial starter 60 mins
  });

  // Save profile updates
  const updateProfile = useCallback((newProfile: Partial<StudentProfile>) => {
    setProfile(prev => {
      const updated = { ...prev, ...newProfile };
      localStorage.setItem('saytara_student_profile', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Record an active study session or interaction today
  const recordActivityToday = useCallback((addedMinutes = 15) => {
    const today = new Date().toISOString().split('T')[0];
    setStudyDays(prev => {
      if (!prev.includes(today)) {
        const updated = [...prev, today];
        localStorage.setItem('saytara_study_days', JSON.stringify(updated));
        return updated;
      }
      return prev;
    });

    setStudyMinutes(prev => {
      const updated = prev + addedMinutes;
      localStorage.setItem('saytara_study_minutes', String(updated));
      return updated;
    });
  }, []);

  // Compute Consecutive Daily Streak
  const streakCount = useMemo(() => {
    if (studyDays.length === 0) return 0;
    
    // Sort unique dates descending
    const sorted = Array.from(new Set(studyDays)).sort().reverse();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let checkDate = new Date(today);

    // If today is in studyDays or yesterday is in studyDays, start counting streak
    const todayStr = checkDate.toISOString().split('T')[0];
    const hasToday = sorted.includes(todayStr);

    if (!hasToday) {
      // Check if yesterday was active
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayStr = checkDate.toISOString().split('T')[0];
      if (!sorted.includes(yesterdayStr)) {
        return 0; // Streak broken
      }
    }

    // Iterate backwards day by day
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (sorted.includes(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return Math.max(1, streak);
  }, [studyDays]);

  // Export full student data as a JSON file to student's device
  const exportStudentBackup = useCallback(() => {
    try {
      const data = {
        profile,
        studyDays,
        studyMinutes,
        readLectures: JSON.parse(localStorage.getItem('saytara_read_lectures') || '[]'),
        quizAttempts: JSON.parse(localStorage.getItem('saytara_attempts') || '{}'),
        exportTimestamp: new Date().toISOString(),
        version: '1.0',
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `saytara_progress_${profile.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    } catch (e) {
      console.error('Failed to export backup:', e);
      return false;
    }
  }, [profile, studyDays, studyMinutes]);

  // Import student data from device
  const importStudentBackup = useCallback((jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.profile) {
        setProfile(parsed.profile);
        localStorage.setItem('saytara_student_profile', JSON.stringify(parsed.profile));
      }
      if (Array.isArray(parsed.studyDays)) {
        setStudyDays(parsed.studyDays);
        localStorage.setItem('saytara_study_days', JSON.stringify(parsed.studyDays));
      }
      if (typeof parsed.studyMinutes === 'number') {
        setStudyMinutes(parsed.studyMinutes);
        localStorage.setItem('saytara_study_minutes', String(parsed.studyMinutes));
      }
      if (Array.isArray(parsed.readLectures)) {
        localStorage.setItem('saytara_read_lectures', JSON.stringify(parsed.readLectures));
      }
      if (parsed.quizAttempts && typeof parsed.quizAttempts === 'object') {
        localStorage.setItem('saytara_attempts', JSON.stringify(parsed.quizAttempts));
      }
      return true;
    } catch (e) {
      console.error('Failed to import backup:', e);
      return false;
    }
  }, []);

  // Reset progress locally
  const resetStudentProgress = useCallback(() => {
    localStorage.removeItem('saytara_read_lectures');
    localStorage.removeItem('saytara_attempts');
    localStorage.removeItem('saytara_study_days');
    localStorage.removeItem('saytara_study_minutes');
    
    const today = new Date().toISOString().split('T')[0];
    setStudyDays([today]);
    setStudyMinutes(0);
  }, []);

  return {
    profile,
    updateProfile,
    studyDays,
    studyMinutes,
    streakCount,
    recordActivityToday,
    exportStudentBackup,
    importStudentBackup,
    resetStudentProgress,
  };
}
