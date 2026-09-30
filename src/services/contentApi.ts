import { Lecture, Summary, ExamQuestionPaper, ScheduleItem } from '../types';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '../firebase';
import { saveFileToCloudStorage, deleteCloudFile } from './cloudFileStorage';
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

  // Collect deleted IDs from both sources
  const deletedLectureIds = Array.from(new Set([
    ...(fsData?.deletedLectureIds || []),
    ...(srvData?.deletedLectureIds || [])
  ]));

  // Ensure deleted lectures are not in the active map
  deletedLectureIds.forEach(id => {
    lecturesMap.delete(id);
  });

  return {
    success: true,
    lectures: Array.from(lecturesMap.values()),
    summaries: Array.from(summariesMap.values()),
    exams: Array.from(examsMap.values()),
    schedule,
    deletedLectureIds,
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
 * Save a new or updated lecture to Firestore cloud database
 * Guarantees that the document is committed to Firestore before reporting success.
 */
export async function saveSharedLecture(lecture: Lecture): Promise<{ success: boolean; error?: string }> {
  // 1. Direct Firestore write via client SDK
  const fsResult = await saveLectureToFirestore(lecture);

  // 2. Mirror/backup to server (server also executes Firestore setDoc)
  let srvSuccess = false;
  try {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const srvRes = await fetch(`${baseUrl}/api/content/lectures`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lecture }),
    });
    const srvData = await srvRes.json();
    srvSuccess = Boolean(srvData && srvData.success);
  } catch (srvErr) {
    console.warn('[ContentAPI] Server sync note:', srvErr);
  }

  if (fsResult.success || srvSuccess) {
    console.log(`[ContentAPI] Lecture save confirmed in Firestore: "${lecture.titleAr}"`);
    return { success: true };
  }

  return {
    success: false,
    error: fsResult.error || 'فشلت عملية الكتابة إلى قاعدة بيانات Firestore السحابية. يرجى التحقق من الاتصال وإعادة المحاولة.'
  };
}

/**
 * Delete a lecture from Firestore and server concurrently
 * Also cleans up any attached file in Firestore lecture_files collection
 */
export async function deleteSharedLecture(lectureId: string, fileUrl?: string): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Clean up attached cloud file if present
    if (fileUrl) {
      await deleteCloudFile(fileUrl).catch(() => {});
    }

    // 2. Delete from Firestore and record in deleted_lectures collection
    const fsOk = await deleteLectureFromFirestore(lectureId);

    // 3. Mirror deletion to server store
    let srvOk = false;
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const srvRes = await fetch(`${baseUrl}/api/content/lectures/${encodeURIComponent(lectureId)}`, {
        method: 'DELETE',
      });
      const srvData = await srvRes.json();
      srvOk = Boolean(srvData && srvData.success);
    } catch (srvErr) {
      console.warn('[ContentAPI] Server delete note:', srvErr);
    }

    if (fsOk || srvOk) {
      console.log(`[ContentAPI] Successfully deleted lecture: ${lectureId}`);
      return { success: true };
    }

    return { success: false, error: 'فشل حذف الملزمة من قاعدة البيانات السحابية' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete lecture' };
  }
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
 * Upload a lecture file (PDF, DOCX, TXT)
 * Saves to Firestore lecture_files cloud database so it is 100% accessible across all browsers & devices.
 * Also mirrors to backend server storage for dual redundancy.
 * Never returns local blob: or temporary file system paths.
 */
export async function uploadSharedFile(file: File): Promise<{ fileUrl: string; fileSize: string; fileName: string } | null> {
  const sizeMB = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

  // 1. Primary: Save to Firestore lecture_files collection for persistent cross-device access
  try {
    const cloudRes = await saveFileToCloudStorage(file);
    if (cloudRes && cloudRes.fileUrl) {
      console.log(`[ContentAPI] File uploaded successfully to Cloud Storage in Firestore: ${cloudRes.fileUrl}`);
      return cloudRes;
    }
  } catch (err) {
    console.warn('[ContentAPI] Firestore cloud storage attempt note (falling back to server):', err);
  }

  // 2. Fallback: Upload to server uploads endpoint
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const resultStr = reader.result as string;
          const base64Data = resultStr.includes(',') ? resultStr.split(',')[1] : resultStr;
          const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
          const res = await fetch(`${baseUrl}/api/upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: file.name,
              fileData: base64Data,
              mimeType: file.type || 'application/pdf',
            }),
          });
          const data = await res.json();
          if (data && data.success && (data.fileUrl || data.relativeUrl)) {
            const finalUrl = data.relativeUrl || data.fileUrl;
            resolve({
              fileUrl: finalUrl,
              fileSize: data.fileSize || sizeMB,
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
