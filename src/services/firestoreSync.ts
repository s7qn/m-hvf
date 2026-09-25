import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  onSnapshot 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, testConnection } from '../firebase';
import { Lecture, Summary, ExamQuestionPaper, ScheduleItem } from '../types';

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
 * Save Lecture to Firestore
 */
export async function saveLectureToFirestore(lecture: Lecture): Promise<boolean> {
  const path = 'lectures';
  try {
    const lectureRef = doc(db, path, lecture.id);
    // Remove any undefined fields for clean firestore storage
    const cleanLecture = JSON.parse(JSON.stringify(lecture));
    await setDoc(lectureRef, cleanLecture, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${lecture.id}`);
    return false;
  }
}

/**
 * Delete Lecture from Firestore
 */
export async function deleteLectureFromFirestore(lectureId: string): Promise<boolean> {
  const path = 'lectures';
  try {
    const lectureRef = doc(db, path, lectureId);
    await deleteDoc(lectureRef);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${lectureId}`);
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
    const cleanSummary = JSON.parse(JSON.stringify(summary));
    await setDoc(summaryRef, cleanSummary, { merge: true });
    return true;
  } catch (error) {
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
    return true;
  } catch (error) {
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
    const cleanExam = JSON.parse(JSON.stringify(exam));
    await setDoc(examRef, cleanExam, { merge: true });
    return true;
  } catch (error) {
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
    return true;
  } catch (error) {
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
    const cleanItem = JSON.parse(JSON.stringify(item));
    await setDoc(itemRef, cleanItem, { merge: true });
    return true;
  } catch (error) {
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
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${itemId}`);
    return false;
  }
}

/**
 * One-time fetch of all content directly from Firestore
 */
export async function fetchAllFirestoreContent(): Promise<FirestoreContentState | null> {
  try {
    const [lecturesSnap, summariesSnap, examsSnap, scheduleSnap] = await Promise.all([
      getDocs(collection(db, 'lectures')),
      getDocs(collection(db, 'summaries')),
      getDocs(collection(db, 'exams')),
      getDocs(collection(db, 'schedule')),
    ]);

    const lectures: Lecture[] = [];
    lecturesSnap.forEach(d => {
      const data = d.data();
      if (data && data.id) lectures.push(data as Lecture);
    });

    const summaries: Summary[] = [];
    summariesSnap.forEach(d => {
      const data = d.data();
      if (data && data.id) summaries.push(data as Summary);
    });

    const exams: ExamQuestionPaper[] = [];
    examsSnap.forEach(d => {
      const data = d.data();
      if (data && data.id) exams.push(data as ExamQuestionPaper);
    });

    const schedule: ScheduleItem[] = [];
    scheduleSnap.forEach(d => {
      const data = d.data();
      if (data && data.id) schedule.push(data as ScheduleItem);
    });

    return { lectures, summaries, exams, schedule };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'multiple-collections');
    return null;
  }
}

/**
 * Subscribe in real-time to Firestore lectures collection
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
      handleFirestoreError(error, OperationType.GET, path);
      if (onError) onError(error);
    }
  );
}

/**
 * Subscribe in real-time to Firestore summaries collection
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
      handleFirestoreError(error, OperationType.GET, path);
      if (onError) onError(error);
    }
  );
}

/**
 * Subscribe in real-time to Firestore exams collection
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
      handleFirestoreError(error, OperationType.GET, path);
      if (onError) onError(error);
    }
  );
}
