import { Lecture, Summary, ExamQuestionPaper, ScheduleItem } from '../types';
import { 
  saveLectureToFirestore, 
  deleteLectureFromFirestore,
  saveSummaryToFirestore,
  deleteSummaryFromFirestore,
  saveExamToFirestore,
  deleteExamFromFirestore,
  saveScheduleItemToFirestore,
  deleteScheduleItemFromFirestore,
  fetchAllFirestoreContent
} from './firestoreSync';

export interface SharedContentResponse {
  success: boolean;
  lectures: Lecture[];
  summaries: Summary[];
  exams: ExamQuestionPaper[];
  schedule: ScheduleItem[] | null;
  deletedLectureIds?: string[];
  lastUpdated?: string;
  source?: 'firestore' | 'server';
}

/**
 * Fetch all shared content from Firestore and backend server concurrently.
 * Merges data so that any lecture added on any browser or device appears immediately.
 */
export async function fetchSharedContent(): Promise<SharedContentResponse | null> {
  const [fsResult, srvResult] = await Promise.allSettled([
    fetchAllFirestoreContent(),
    fetch('/api/content', { headers: { 'Cache-Control': 'no-cache' } })
      .then(res => res.ok ? res.json() : null)
      .catch(() => null)
  ]);

  const fsData = fsResult.status === 'fulfilled' ? fsResult.value : null;
  const srvData = (srvResult.status === 'fulfilled' && srvResult.value?.success) ? srvResult.value : null;

  // Unify and deduplicate lectures (Firestore authoritative, Server complementary)
  const lecturesMap = new Map<string, Lecture>();
  if (srvData && Array.isArray(srvData.lectures)) {
    srvData.lectures.forEach((l: Lecture) => {
      if (l && l.id) lecturesMap.set(l.id, l);
    });
  }
  if (fsData && Array.isArray(fsData.lectures)) {
    fsData.lectures.forEach((l: Lecture) => {
      if (l && l.id) lecturesMap.set(l.id, l);
    });
  }

  // Unify summaries
  const summariesMap = new Map<string, Summary>();
  if (srvData && Array.isArray(srvData.summaries)) {
    srvData.summaries.forEach((s: Summary) => {
      if (s && s.id) summariesMap.set(s.id, s);
    });
  }
  if (fsData && Array.isArray(fsData.summaries)) {
    fsData.summaries.forEach((s: Summary) => {
      if (s && s.id) summariesMap.set(s.id, s);
    });
  }

  // Unify exams
  const examsMap = new Map<string, ExamQuestionPaper>();
  if (srvData && Array.isArray(srvData.exams)) {
    srvData.exams.forEach((e: ExamQuestionPaper) => {
      if (e && e.id) examsMap.set(e.id, e);
    });
  }
  if (fsData && Array.isArray(fsData.exams)) {
    fsData.exams.forEach((e: ExamQuestionPaper) => {
      if (e && e.id) examsMap.set(e.id, e);
    });
  }

  // Unify schedule
  const schedule = (fsData && Array.isArray(fsData.schedule) && fsData.schedule.length > 0)
    ? fsData.schedule
    : (srvData && Array.isArray(srvData.schedule) && srvData.schedule.length > 0)
      ? srvData.schedule
      : null;

  return {
    success: true,
    lectures: Array.from(lecturesMap.values()),
    summaries: Array.from(summariesMap.values()),
    exams: Array.from(examsMap.values()),
    schedule,
    deletedLectureIds: [],
    lastUpdated: new Date().toISOString(),
    source: fsData ? 'firestore' : 'server',
  };
}

/**
 * Get GitHub & repository synchronization info
 */
export async function getSyncInfo(): Promise<{
  success: boolean;
  gitTrackedPath: string;
  lecturesCount: number;
  summariesCount: number;
  deletedLectureIds: string[];
  lastUpdated: string;
  sharedUrl: string;
} | null> {
  try {
    const res = await fetch('/api/sync/github-info');
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Save a new or updated lecture to both Firestore and the server concurrently
 * so it appears for all students across all devices and browsers immediately.
 */
export async function saveSharedLecture(lecture: Lecture): Promise<boolean> {
  const [fsResult, srvResult] = await Promise.allSettled([
    saveLectureToFirestore(lecture),
    fetch('/api/content/lectures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lecture }),
    }).then(res => res.json()).then(d => Boolean(d && d.success)).catch(() => false)
  ]);

  const fsOk = fsResult.status === 'fulfilled' && fsResult.value === true;
  const srvOk = srvResult.status === 'fulfilled' && srvResult.value === true;

  console.log(`[ContentAPI] Lecture save sync outcome: Firestore=${fsOk}, Server=${srvOk}`);
  return fsOk || srvOk;
}

/**
 * Delete a lecture from Firestore and server concurrently
 */
export async function deleteSharedLecture(lectureId: string): Promise<boolean> {
  const [fsResult, srvResult] = await Promise.allSettled([
    deleteLectureFromFirestore(lectureId),
    fetch(`/api/content/lectures/${encodeURIComponent(lectureId)}`, {
      method: 'DELETE',
    }).then(res => res.json()).then(d => Boolean(d && d.success)).catch(() => false)
  ]);

  const fsOk = fsResult.status === 'fulfilled' && fsResult.value === true;
  const srvOk = srvResult.status === 'fulfilled' && srvResult.value === true;
  return fsOk || srvOk;
}

/**
 * Save a summary to Firestore and server concurrently
 */
export async function saveSharedSummary(summary: Summary): Promise<boolean> {
  const [fsResult, srvResult] = await Promise.allSettled([
    saveSummaryToFirestore(summary),
    fetch('/api/content/summaries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summary }),
    }).then(res => res.json()).then(d => Boolean(d && d.success)).catch(() => false)
  ]);

  const fsOk = fsResult.status === 'fulfilled' && fsResult.value === true;
  const srvOk = srvResult.status === 'fulfilled' && srvResult.value === true;
  return fsOk || srvOk;
}

/**
 * Delete a summary from Firestore and server concurrently
 */
export async function deleteSharedSummary(summaryId: string): Promise<boolean> {
  const [fsResult, srvResult] = await Promise.allSettled([
    deleteSummaryFromFirestore(summaryId),
    fetch(`/api/content/summaries/${encodeURIComponent(summaryId)}`, {
      method: 'DELETE',
    }).then(res => res.json()).then(d => Boolean(d && d.success)).catch(() => false)
  ]);

  const fsOk = fsResult.status === 'fulfilled' && fsResult.value === true;
  const srvOk = srvResult.status === 'fulfilled' && srvResult.value === true;
  return fsOk || srvOk;
}

/**
 * Save an exam to Firestore and server concurrently
 */
export async function saveSharedExam(exam: ExamQuestionPaper): Promise<boolean> {
  const [fsResult, srvResult] = await Promise.allSettled([
    saveExamToFirestore(exam),
    fetch('/api/content/exams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exam }),
    }).then(res => res.json()).then(d => Boolean(d && d.success)).catch(() => false)
  ]);

  const fsOk = fsResult.status === 'fulfilled' && fsResult.value === true;
  const srvOk = srvResult.status === 'fulfilled' && srvResult.value === true;
  return fsOk || srvOk;
}

/**
 * Delete an exam from Firestore and server concurrently
 */
export async function deleteSharedExam(examId: string): Promise<boolean> {
  const [fsResult, srvResult] = await Promise.allSettled([
    deleteExamFromFirestore(examId),
    fetch(`/api/content/exams/${encodeURIComponent(examId)}`, {
      method: 'DELETE',
    }).then(res => res.json()).then(d => Boolean(d && d.success)).catch(() => false)
  ]);

  const fsOk = fsResult.status === 'fulfilled' && fsResult.value === true;
  const srvOk = srvResult.status === 'fulfilled' && srvResult.value === true;
  return fsOk || srvOk;
}

/**
 * Save a schedule item to Firestore and server concurrently
 */
export async function saveSharedScheduleItem(scheduleItem: ScheduleItem): Promise<boolean> {
  const [fsResult, srvResult] = await Promise.allSettled([
    saveScheduleItemToFirestore(scheduleItem),
    fetch('/api/content/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduleItem }),
    }).then(res => res.json()).then(d => Boolean(d && d.success)).catch(() => false)
  ]);

  const fsOk = fsResult.status === 'fulfilled' && fsResult.value === true;
  const srvOk = srvResult.status === 'fulfilled' && srvResult.value === true;
  return fsOk || srvOk;
}

/**
 * Delete a schedule item from Firestore and server concurrently
 */
export async function deleteSharedScheduleItem(itemId: string): Promise<boolean> {
  const [fsResult, srvResult] = await Promise.allSettled([
    deleteScheduleItemFromFirestore(itemId),
    fetch(`/api/content/schedule/${encodeURIComponent(itemId)}`, {
      method: 'DELETE',
    }).then(res => res.json()).then(d => Boolean(d && d.success)).catch(() => false)
  ]);

  const fsOk = fsResult.status === 'fulfilled' && fsResult.value === true;
  const srvOk = srvResult.status === 'fulfilled' && srvResult.value === true;
  return fsOk || srvOk;
}

/**
 * Reset schedule on the server
 */
export async function resetSharedSchedule(): Promise<boolean> {
  try {
    const res = await fetch('/api/content/schedule/reset', {
      method: 'POST',
    });
    const data = await res.json();
    return Boolean(data && data.success);
  } catch (err) {
    console.error('[ContentAPI] Failed to reset shared schedule:', err);
    return false;
  }
}

/**
 * Upload a lecture file (PDF, DOCX, TXT) to the server
 * so that any student on any browser or device can view and download the real file.
 */
export async function uploadSharedFile(file: File): Promise<{ fileUrl: string; fileSize: string; fileName: string } | null> {
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const resultStr = reader.result as string;
          const base64Data = resultStr.includes(',') ? resultStr.split(',')[1] : resultStr;
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: file.name,
              fileData: base64Data,
              mimeType: file.type,
            }),
          });
          const data = await res.json();
          if (data && data.success && data.fileUrl) {
            resolve({
              fileUrl: data.fileUrl,
              fileSize: data.fileSize || `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
              fileName: data.fileName || file.name,
            });
            return;
          }
        } catch (postErr) {
          console.error('[ContentAPI] Upload request error:', postErr);
        }
        resolve(null);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    } catch {
      resolve(null);
    }
  });
}
