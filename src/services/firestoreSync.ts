import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  onSnapshot 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, testConnection } from '../firebase';
import { Lecture, Summary, ExamQuestionPaper, ScheduleItem, QuizAttempt } from '../types';

export interface FirestoreContentState {
  lectures: Lecture[];
  summaries: Summary[];
  exams: ExamQuestionPaper[];
  schedule: ScheduleItem[];
}

/**
 * Test initial Firestore connection on app startup
 */
export async function initFirestoreConnection() {
  return await testConnection();
}

/**
 * Save Lecture to Firestore Cloud Database with safety timeout
 */
export async function saveLectureToFirestore(lecture: Lecture): Promise<boolean> {
  const path = 'lectures';
  try {
    const lectureRef = doc(db, path, lecture.id);
    const payload = {
      ...lecture,
      createdAt: lecture.uploadDate || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
      isCustom: true,
    };
    // Ensure payload is JSON-serializable without undefined fields
    const sanitized = JSON.parse(JSON.stringify(payload));
    
    // Safety timeout promise to prevent write stream hanging
    const writePromise = setDoc(lectureRef, sanitized, { merge: true });
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Firestore write timeout')), 6000)
    );

    await Promise.race([writePromise, timeoutPromise]);
    console.log(`[Firestore] Successfully saved lecture: "${lecture.titleAr}" (${lecture.id})`);
    return true;
  } catch (error: any) {
    if (error?.code === 'resource-exhausted' || error?.message?.includes('RESOURCE_EXHAUSTED') || error?.message?.includes('Write stream')) {
      console.warn('[Firestore] Write quota note. Falling back to persistent server store.');
      return false;
    }
    console.warn(`[Firestore] Write note for ${path}/${lecture.id}:`, error?.message || error);
    return false;
  }
}

/**
 * Delete Lecture from Firestore with safety timeout
 */
export async function deleteLectureFromFirestore(lectureId: string): Promise<boolean> {
  const path = 'lectures';
  try {
    const lectureRef = doc(db, path, lectureId);
    const deletePromise = deleteDoc(lectureRef);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Firestore delete timeout')), 6000)
    );
    await Promise.race([deletePromise, timeoutPromise]);
    console.log(`[Firestore] Successfully deleted lecture: ${lectureId}`);
    return true;
  } catch (error: any) {
    console.warn(`[Firestore] Delete note for ${path}/${lectureId}:`, error?.message || error);
    return false;
  }
}

/**
 * Save Summary to Firestore
 */
export async function saveSummaryToFirestore(summary: Summary): Promise<boolean> {
  const path = 'summaries';
  try {
    const summaryRef = doc(db, path, summary.id);
    const sanitized = JSON.parse(JSON.stringify(summary));
    await setDoc(summaryRef, sanitized, { merge: true });
    console.log(`[Firestore] Successfully saved summary: "${summary.titleAr}" (${summary.id})`);
    return true;
  } catch (error: any) {
    if (error?.code === 'resource-exhausted' || error?.message?.includes('RESOURCE_EXHAUSTED') || error?.message?.includes('Write stream')) {
      return false;
    }
    handleFirestoreError(error, OperationType.WRITE, `${path}/${summary.id}`);
    return false;
  }
}

/**
 * Delete Summary from Firestore
 */
export async function deleteSummaryFromFirestore(summaryId: string): Promise<boolean> {
  const path = 'summaries';
  try {
    const summaryRef = doc(db, path, summaryId);
    await deleteDoc(summaryRef);
    console.log(`[Firestore] Successfully deleted summary: ${summaryId}`);
    return true;
  } catch (error: any) {
    if (error?.code === 'resource-exhausted' || error?.message?.includes('RESOURCE_EXHAUSTED')) {
      return false;
    }
    handleFirestoreError(error, OperationType.DELETE, `${path}/${summaryId}`);
    return false;
  }
}

/**
 * Save Exam to Firestore
 */
export async function saveExamToFirestore(exam: ExamQuestionPaper): Promise<boolean> {
  const path = 'exams';
  try {
    const examRef = doc(db, path, exam.id);
    const sanitized = JSON.parse(JSON.stringify(exam));
    await setDoc(examRef, sanitized, { merge: true });
    console.log(`[Firestore] Successfully saved exam: "${exam.titleAr}" (${exam.id})`);
    return true;
  } catch (error: any) {
    if (error?.code === 'resource-exhausted' || error?.message?.includes('RESOURCE_EXHAUSTED') || error?.message?.includes('Write stream')) {
      return false;
    }
    handleFirestoreError(error, OperationType.WRITE, `${path}/${exam.id}`);
    return false;
  }
}

/**
 * Delete Exam from Firestore
 */
export async function deleteExamFromFirestore(examId: string): Promise<boolean> {
  const path = 'exams';
  try {
    const examRef = doc(db, path, examId);
    await deleteDoc(examRef);
    console.log(`[Firestore] Successfully deleted exam: ${examId}`);
    return true;
  } catch (error: any) {
    if (error?.code === 'resource-exhausted' || error?.message?.includes('RESOURCE_EXHAUSTED')) {
      return false;
    }
    handleFirestoreError(error, OperationType.DELETE, `${path}/${examId}`);
    return false;
  }
}

/**
 * Save Schedule Item to Firestore
 */
export async function saveScheduleItemToFirestore(item: ScheduleItem): Promise<boolean> {
  const path = 'schedule';
  try {
    const itemRef = doc(db, path, item.id);
    const sanitized = JSON.parse(JSON.stringify(item));
    await setDoc(itemRef, sanitized, { merge: true });
    console.log(`[Firestore] Successfully saved schedule item: ${item.id}`);
    return true;
  } catch (error: any) {
    if (error?.code === 'resource-exhausted' || error?.message?.includes('RESOURCE_EXHAUSTED') || error?.message?.includes('Write stream')) {
      return false;
    }
    handleFirestoreError(error, OperationType.WRITE, `${path}/${item.id}`);
    return false;
  }
}

/**
 * Delete Schedule Item from Firestore
 */
export async function deleteScheduleItemFromFirestore(itemId: string): Promise<boolean> {
  const path = 'schedule';
  try {
    const itemRef = doc(db, path, itemId);
    await deleteDoc(itemRef);
    console.log(`[Firestore] Successfully deleted schedule item: ${itemId}`);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${itemId}`);
    return false;
  }
}

/**
 * Fetch all content directly from Firestore
 */
export async function fetchAllFirestoreContent(): Promise<FirestoreContentState | null> {
  try {
    const [lecturesSnap, summariesSnap, examsSnap, scheduleSnap] = await Promise.all([
      getDocs(collection(db, 'lectures')).catch(() => null),
      getDocs(collection(db, 'summaries')).catch(() => null),
      getDocs(collection(db, 'exams')).catch(() => null),
      getDocs(collection(db, 'schedule')).catch(() => null),
    ]);

    const lectures: Lecture[] = [];
    if (lecturesSnap) {
      lecturesSnap.forEach(d => {
        const data = d.data();
        if (data && data.id) lectures.push(data as Lecture);
      });
    }

    const summaries: Summary[] = [];
    if (summariesSnap) {
      summariesSnap.forEach(d => {
        const data = d.data();
        if (data && data.id) summaries.push(data as Summary);
      });
    }

    const exams: ExamQuestionPaper[] = [];
    if (examsSnap) {
      examsSnap.forEach(d => {
        const data = d.data();
        if (data && data.id) exams.push(data as ExamQuestionPaper);
      });
    }

    const schedule: ScheduleItem[] = [];
    if (scheduleSnap) {
      scheduleSnap.forEach(d => {
        const data = d.data();
        if (data && data.id) schedule.push(data as ScheduleItem);
      });
    }

    return { lectures, summaries, exams, schedule };
  } catch (error) {
    console.warn('[Firestore] Error fetching all collections:', error);
    return null;
  }
}

/**
 * Real-time listener for Firestore lectures
 */
export function subscribeToFirestoreLectures(
  onUpdate: (lectures: Lecture[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'lectures';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const lectures: Lecture[] = [];
      snapshot.forEach(d => {
        const item = d.data();
        if (item && item.id) {
          lectures.push(item as Lecture);
        }
      });
      onUpdate(lectures);
    },
    (error) => {
      console.error('[Firestore Snapshot] Lectures error:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Real-time listener for Firestore summaries
 */
export function subscribeToFirestoreSummaries(
  onUpdate: (summaries: Summary[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'summaries';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const summaries: Summary[] = [];
      snapshot.forEach(d => {
        const item = d.data();
        if (item && item.id) {
          summaries.push(item as Summary);
        }
      });
      onUpdate(summaries);
    },
    (error) => {
      console.error('[Firestore Snapshot] Summaries error:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Real-time listener for Firestore exams
 */
export function subscribeToFirestoreExams(
  onUpdate: (exams: ExamQuestionPaper[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'exams';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const exams: ExamQuestionPaper[] = [];
      snapshot.forEach(d => {
        const item = d.data();
        if (item && item.id) {
          exams.push(item as ExamQuestionPaper);
        }
      });
      onUpdate(exams);
    },
    (error) => {
      console.error('[Firestore Snapshot] Exams error:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Real-time listener for Firestore schedule
 */
export function subscribeToFirestoreSchedule(
  onUpdate: (schedule: ScheduleItem[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'schedule';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const schedule: ScheduleItem[] = [];
      snapshot.forEach(d => {
        const item = d.data();
        if (item && item.id) {
          schedule.push(item as ScheduleItem);
        }
      });
      onUpdate(schedule);
    },
    (error) => {
      console.error('[Firestore Snapshot] Schedule error:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Save Student Quiz Attempt to Firestore
 */
export async function saveQuizAttemptToFirestore(attempt: QuizAttempt): Promise<boolean> {
  const path = 'quiz_attempts';
  const docId = attempt.id || `attempt-${attempt.quizId}-${Date.now()}`;
  try {
    const attemptRef = doc(db, path, docId);
    const sanitized = JSON.parse(JSON.stringify({
      ...attempt,
      id: docId,
      timestamp: new Date().toISOString()
    }));
    const writePromise = setDoc(attemptRef, sanitized, { merge: true });
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Firestore write timeout')), 6000)
    );
    await Promise.race([writePromise, timeoutPromise]);
    console.log(`[Firestore] Successfully saved quiz attempt: ${docId}`);
    return true;
  } catch (error: any) {
    console.warn(`[Firestore] Save attempt note for ${docId}:`, error?.message || error);
    return false;
  }
}
