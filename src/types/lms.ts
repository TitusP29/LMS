export type UserRole = 'learner' | 'admin';

export type ModuleCategory =
  | 'Cloud & DevOps'
  | 'Systems Engineering'
  | 'Cybersecurity'
  | 'Data Architecture';

export type DifficultyLevel = 'Foundational' | 'Intermediate' | 'Advanced';

export type CourseStatus = 'Published' | 'Draft' | 'Archived';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  headline: string;
  avatarUrl: string;
  streakDays: number;
  cohortId?: string;
  joinedAt: string;
  weeklyGoalHours: number;
  emailDigestEnabled: boolean;
  autoAdvanceChapters?: boolean;
}

export interface StudyResource {
  id: string;
  title: string;
  type: 'Document' | 'Code Lab' | 'Reference PDF' | 'Cheat Sheet' | 'External Link';
  sizeLabel: string;
  urlOrContent: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface ContentSection {
  heading: string;
  body: string;
  codeBlock?: {
    language: string;
    code: string;
  };
}

export interface Chapter {
  id: string;
  order: number;
  title: string;
  durationMinutes: number;
  summary: string;
  sections: ContentSection[];
  keyTakeaways: string[];
  studyMaterials: StudyResource[];
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Module {
  id: string;
  code: string;
  title: string;
  category: ModuleCategory;
  difficulty: DifficultyLevel;
  status: CourseStatus;
  instructor: string;
  description: string;
  outcomes: string[];
  chapters: Chapter[];
  additionalMaterials: StudyResource[];
  quizPassingScore: number;
  quiz: QuizQuestion[];
}

export interface Enrollment {
  id: string;
  userId: string;
  moduleId: string;
  cohortId?: string;
  enrolledAt: string;
  completedChapterIds: string[];
  timeSpentMinutes: number;
  lastAccessedChapterId: string;
  lastAccessedAt: string;
}

export interface ChapterNote {
  id: string;
  userId: string;
  moduleId: string;
  chapterId: string;
  content: string;
  updatedAt: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  moduleId: string;
  scorePercent: number;
  correctCount: number;
  totalCount: number;
  passed: boolean;
  selectedAnswers: Record<string, number>;
  attemptedAt: string;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  issuerTitle: string;
  sealCode: string;
  uploadedAt: string;
}

export interface Certificate {
  id: string;
  credentialId: string;
  userId: string;
  userName: string;
  moduleId: string;
  moduleTitle: string;
  moduleCode: string;
  issuedAt: string;
  issuedBy: string;
  templateName: string;
  verificationNote?: string;
}

export interface Cohort {
  id: string;
  name: string;
  track: string;
  startDate: string;
  status: 'Active' | 'Upcoming' | 'Completed';
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  authorName: string;
  authorId: string;
  moduleTitle?: string;
  status: 'Pending' | 'Published';
  createdAt: string;
  answeredAt?: string;
}

export interface ScheduledSession {
  id: string;
  userId: string;
  title: string;
  moduleId: string;
  dateISO: string; // YYYY-MM-DD
  timeLabel: string;
  kind: 'Study Session' | 'Quiz Target';
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  detail: string;
  createdAt: string;
  read: boolean;
  targetRoute?: string;
}

export interface LMSState {
  users: User[];
  currentUserId: string | null;
  modules: Module[];
  enrollments: Enrollment[];
  notes: ChapterNote[];
  quizAttempts: QuizAttempt[];
  certificates: Certificate[];
  certificateTemplates: CertificateTemplate[];
  cohorts: Cohort[];
  faqs: FAQItem[];
  scheduledSessions: ScheduledSession[];
  notifications: NotificationItem[];
}
