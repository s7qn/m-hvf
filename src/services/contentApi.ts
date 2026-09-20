import { Lecture, Summary, ExamQuestionPaper, ScheduleItem } from '../types';

export interface SharedContentResponse {
  success: boolean;
  lectures: Lecture[];
  summaries: Summary[];
  exams: ExamQuestionPaper[];
  schedule: ScheduleItem[] | null;
  lastUpdated?: string;
}

/**
 * Fetch all shared content from the backend server so that
 * any lecture or material added by admin is visible to all students immediately.
 */
export async function fetchSharedContent(): Promise<SharedContentResponse | null> {
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
        lastUpdated: data.lastUpdated,
      };
    }
  } catch (err) {
    console.warn('[ContentAPI] Could not fetch shared content from server:', err);
  }
  return null;
}

/**
 * Save a new or updated lecture to the server so it appears for all students
 */
export async function saveSharedLecture(lecture: Lecture): Promise<boolean> {
  try {
    const res = await fetch('/api/content/lectures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lecture }),
    });
    const data = await res.json();
    return Boolean(data && data.success);
  } catch (err) {
    console.error('[ContentAPI] Failed to save shared lecture:', err);
    return false;
  }
}

/**
 * Delete a lecture from the server
 */
export async function deleteSharedLecture(lectureId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/content/lectures/${encodeURIComponent(lectureId)}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    return Boolean(data && data.success);
  } catch (err) {
    console.error('[ContentAPI] Failed to delete shared lecture:', err);
    return false;
  }
}

/**
 * Save a summary to the server
 */
export async function saveSharedSummary(summary: Summary): Promise<boolean> {
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
 * Delete a summary from the server
 */
export async function deleteSharedSummary(summaryId: string): Promise<boolean> {
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
 * Save an exam to the server
 */
export async function saveSharedExam(exam: ExamQuestionPaper): Promise<boolean> {
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
 * Delete an exam from the server
 */
export async function deleteSharedExam(examId: string): Promise<boolean> {
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
 * Save a schedule item to the server
 */
export async function saveSharedScheduleItem(scheduleItem: ScheduleItem): Promise<boolean> {
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
 * Delete a schedule item from the server
 */
export async function deleteSharedScheduleItem(itemId: string): Promise<boolean> {
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
