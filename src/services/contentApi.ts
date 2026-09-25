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
 * Fetch all shared content from Firestore first, falling back to backend server.
 * This guarantees cloud persistence for all students across devices.
 */
export async function fetchSharedContent(): Promise<SharedContentResponse | null> {
  // 1. Try Firestore direct cloud database first
  try {
    const firestoreData = await fetchAllFirestoreContent();
    if (firestoreData && (firestoreData.lectures.length > 0 || firestoreData.summaries.length > 0 || firestoreData.exams.length > 0)) {
      return {
        success: true,
        lectures: firestoreData.lectures,
        summaries: firestoreData.summaries,
        exams: firestoreData.exams,
        schedule: firestoreData.schedule.length > 0 ? firestoreData.schedule : null,
        deletedLectureIds: [],
        lastUpdated: new Date().toISOString(),
        source: 'firestore',
      };
    }
  } catch (firestoreErr) {
    console.warn('[ContentAPI] Firestore direct fetch note (falling back to server):', firestoreErr);
  }

  // 2. Fallback / supplementary check with server
  try {
    const res = await fetch('/api/content', {
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data && data.success) {
      return {
        success: true,
        lectures: Array.isArray(data.lectures) ? data.lectures : [],
        summaries: Array.isArray(data.summaries) ? data.summaries : [],
        exams: Array.isArray(data.exams) ? data.exams : [],
        schedule: Array.isArray(data.schedule) ? data.schedule : null,
        deletedLectureIds: Array.isArray(data.deletedLectureIds) ? data.deletedLectureIds : [],
        lastUpdated: data.lastUpdated,
        source: 'server',
      };
    }
  } catch (err) {
    console.warn('[ContentAPI] Could not fetch shared content from server:', err);
  }
  return null;
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
 * Save a new or updated lecture to both Firestore and the server
 * so it appears for all students across all devices and browsers immediately.
 */
export async function saveSharedLecture(lecture: Lecture): Promise<boolean> {
  let firestoreSuccess = false;
  try {
    firestoreSuccess = await saveLectureToFirestore(lecture);
  } catch (fsErr) {
    console.warn('[ContentAPI] Firestore save error:', fsErr);
  }

  let serverSuccess = false;
  try {
    const res = await fetch('/api/content/lectures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lecture }),
    });
    const data = await res.json();
    serverSuccess = Boolean(data && data.success);
  } catch (err) {
    console.error('[ContentAPI] Failed to save shared lecture to server:', err);
  }

  return firestoreSuccess || serverSuccess;
}

/**
 * Delete a lecture from Firestore and server
 */
export async function deleteSharedLecture(lectureId: string): Promise<boolean> {
  try {
    await deleteLectureFromFirestore(lectureId);
  } catch (fsErr) {
    console.warn('[ContentAPI] Firestore delete lecture error:', fsErr);
  }

  try {
    const res = await fetch(`/api/content/lectures/${encodeURIComponent(lectureId)}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    return Boolean(data && data.success);
  } catch (err) {
    console.error('[ContentAPI] Failed to delete shared lecture from server:', err);
    return false;
  }
}

/**
 * Save a summary to Firestore and server
 */
export async function saveSharedSummary(summary: Summary): Promise<boolean> {
  try {
    await saveSummaryToFirestore(summary);
  } catch (fsErr) {
    console.warn('[ContentAPI] Firestore save summary error:', fsErr);
  }

  try {
    const res = await fetch('/api/content/summaries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summary }),
    });
    const data = await res.json();
    return Boolean(data && data.success);
  } catch (err) {
    console.error('[ContentAPI] Failed to save shared summary:', err);
    return false;
  }
}

/**
 * Delete a summary from Firestore and server
 */
export async function deleteSharedSummary(summaryId: string): Promise<boolean> {
  try {
    await deleteSummaryFromFirestore(summaryId);
  } catch (fsErr) {
    console.warn('[ContentAPI] Firestore delete summary error:', fsErr);
  }

  try {
    const res = await fetch(`/api/content/summaries/${encodeURIComponent(summaryId)}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    return Boolean(data && data.success);
  } catch (err) {
    console.error('[ContentAPI] Failed to delete shared summary:', err);
    return false;
  }
}

/**
 * Save an exam to Firestore and server
 */
export async function saveSharedExam(exam: ExamQuestionPaper): Promise<boolean> {
  try {
    await saveExamToFirestore(exam);
  } catch (fsErr) {
    console.warn('[ContentAPI] Firestore save exam error:', fsErr);
  }

  try {
    const res = await fetch('/api/content/exams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exam }),
    });
    const data = await res.json();
    return Boolean(data && data.success);
  } catch (err) {
    console.error('[ContentAPI] Failed to save shared exam:', err);
    return false;
  }
}

/**
 * Delete an exam from Firestore and server
 */
export async function deleteSharedExam(examId: string): Promise<boolean> {
  try {
    await deleteExamFromFirestore(examId);
  } catch (fsErr) {
    console.warn('[ContentAPI] Firestore delete exam error:', fsErr);
  }

  try {
    const res = await fetch(`/api/content/exams/${encodeURIComponent(examId)}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    return Boolean(data && data.success);
  } catch (err) {
    console.error('[ContentAPI] Failed to delete shared exam:', err);
    return false;
  }
}

/**
 * Save a schedule item to Firestore and server
 */
export async function saveSharedScheduleItem(scheduleItem: ScheduleItem): Promise<boolean> {
  try {
    await saveScheduleItemToFirestore(scheduleItem);
  } catch (fsErr) {
    console.warn('[ContentAPI] Firestore save schedule error:', fsErr);
  }

  try {
    const res = await fetch('/api/content/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduleItem }),
    });
    const data = await res.json();
    return Boolean(data && data.success);
  } catch (err) {
    console.error('[ContentAPI] Failed to save shared schedule item:', err);
    return false;
  }
}

/**
 * Delete a schedule item from Firestore and server
 */
export async function deleteSharedScheduleItem(itemId: string): Promise<boolean> {
  try {
    await deleteScheduleItemFromFirestore(itemId);
  } catch (fsErr) {
    console.warn('[ContentAPI] Firestore delete schedule error:', fsErr);
  }

  try {
    const res = await fetch(`/api/content/schedule/${encodeURIComponent(itemId)}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    return Boolean(data && data.success);
  } catch (err) {
    console.error('[ContentAPI] Failed to delete shared schedule item:', err);
    return false;
  }
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
 * Upload a lecture file (PDF, DOCX, TXT) to the shared server
 * so that any student can download and read the real file.
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
