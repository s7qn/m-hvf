export type Language = 'ar' | 'en';

export type DeviceMode = 'auto' | 'mobile' | 'tablet' | 'desktop';

export type Stage = 1 | 2 | 3 | 4;

export interface Subject {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  stage: Stage;
  semester: 1 | 2;
  iconName: string;
  descriptionAr: string;
  descriptionEn: string;
  totalLectures: number;
}

export interface QuizQuestion {
  id: string;
  questionAr: string;
  questionEn: string;
  optionsAr: string[];
  optionsEn: string[];
  correctIndex: number;
  explanationAr: string;
  explanationEn: string;
  codeOrFormula?: string;
}

export interface Quiz {
  id: string;
  lectureId: string;
  subjectId: string;
  titleAr: string;
  titleEn: string;
  durationMinutes: number;
  passingScore: number;
  questions: QuizQuestion[];
}

export interface LectureSection {
  id: string;
  titleAr: string;
  titleEn: string;
  contentAr: string;
  contentEn?: string;
  keyTakeawaysAr?: string[];
  legalArticles?: string[];
}

export interface LectureChapter {
  id: string;
  chapterNumber: number;
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  sections: LectureSection[];
}

export interface Lecture {
  id: string;
  subjectId: string;
  stage: Stage;
  lectureNumber: number;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  fileUrl?: string;
  fileName?: string;
  fileType: 'pdf' | 'slides' | 'notes';
  fileSize: string;
  uploadDate: string;
  instructorAr: string;
  instructorEn: string;
  summaryPointsAr: string[];
  summaryPointsEn: string[];
  keyFormulas?: string[];
  quiz: Quiz;
  isCustom?: boolean;
  fullCurriculumTextAr?: string;
  chapters?: LectureChapter[];
}

export interface Summary {
  id: string;
  subjectId: string;
  stage: Stage;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  pagesCount: number;
  fileSize: string;
  authorAr: string;
  authorEn: string;
  downloadUrl?: string;
  tagsAr: string[];
  tagsEn: string[];
  date: string;
}

export interface ExamQuestionPaper {
  id: string;
  subjectId: string;
  stage: Stage;
  titleAr: string;
  titleEn: string;
  academicYear: string;
  type: 'midterm' | 'final' | 'quiz' | 'practical';
  fileSize: string;
  solved: boolean;
  solvedByAr?: string;
  solvedByEn?: string;
  downloadUrl?: string;
  date: string;
}

export interface ScheduleItem {
  id: string;
  stage: Stage;
  group: 'A' | 'B' | 'الكل';
  dayIndex: number; // 0: Sunday, 1: Monday, 2: Tuesday, 3: Wednesday, 4: Thursday
  dayNameAr: string;
  dayNameEn: string;
  startTime: string;
  endTime: string;
  subjectId: string;
  subjectNameAr: string;
  subjectNameEn: string;
  type: 'theoretical' | 'practical' | 'tutorial';
  roomAr: string;
  roomEn: string;
  instructorAr: string;
  instructorEn: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitleAr: string;
  quizTitleEn: string;
  subjectNameAr: string;
  subjectNameEn: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  date: string;
  strikes: number;
  passed: boolean;
  timeSpentSeconds: number;
}

export interface StudentProfile {
  name: string;
  universityId?: string;
  stage: Stage;
  group: 'A' | 'B';
  avatarId: string;
  joinedDate: string;
  dailyGoalMinutes: number;
}
