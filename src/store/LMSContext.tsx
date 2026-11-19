import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  Certificate,
  CertificateTemplate,
  CourseStatus,
  Enrollment,
  FAQItem,
  LMSState,
  Module,
  NotificationItem,
  QuizAttempt,
  ScheduledSession,
  StudyResource,
  User,
  UserRole,
} from '../types/lms';
import { DEFAULT_AVATAR_URL, SEED_STATE } from '../data/seedData';

const STORAGE_KEY = 'intergrid_lms_state_v1';

interface LMSContextValue {
  state: LMSState;
  currentUser: User | null;
  route: string;
  navigate: (to: string) => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (q: string) => void;
  signUp: (params: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }) => { ok: boolean; error?: string };
  signIn: (email: string, password: string) => { ok: boolean; user?: User; error?: string };
  signOut: () => void;
  enrollInModule: (moduleId: string, targetUserId?: string, cohortId?: string) => void;
  toggleChapterComplete: (moduleId: string, chapterId: string) => void;
  completeChapter: (
    moduleId: string,
    chapterId: string
  ) => { completedNow: boolean; allCompleted: boolean };
  toggleAutoAdvance: (enabled: boolean) => void;
  logStudyTime: (moduleId: string, minutes: number) => void;
  setLastAccessedChapter: (moduleId: string, chapterId: string) => void;
  saveChapterNote: (moduleId: string, chapterId: string, content: string) => void;
  submitQuizAttempt: (
    moduleId: string,
    selectedAnswers: Record<string, number>
  ) => QuizAttempt | null;
  updateProfile: (updates: {
    name: string;
    headline: string;
    avatarUrl: string;
    weeklyGoalHours: number;
    emailDigestEnabled: boolean;
    autoAdvanceChapters?: boolean;
    newPassword?: string;
  }) => void;
  addScheduledSession: (session: Omit<ScheduledSession, 'id' | 'userId'>) => void;
  markNotificationRead: (id: string) => void;
  submitQuestion: (question: string, moduleTitle?: string) => void;
  // Admin actions
  updateCourseStatus: (moduleId: string, status: CourseStatus) => void;
  attachStudyMaterial: (
    moduleId: string,
    chapterId: string,
    resource: Omit<StudyResource, 'id' | 'uploadedAt' | 'uploadedBy'>,
    appendSection?: { heading: string; body: string }
  ) => void;
  attachAdditionalMaterial: (
    moduleId: string,
    resource: Omit<StudyResource, 'id' | 'uploadedAt' | 'uploadedBy'>
  ) => void;
  issueCertificateManually: (params: {
    userId: string;
    moduleId: string;
    templateName: string;
    verificationNote?: string;
  }) => Certificate | null;
  uploadCertificateTemplate: (tpl: Omit<CertificateTemplate, 'id' | 'uploadedAt'>) => void;
  answerFAQ: (faqId: string, answer: string, publish: boolean) => void;
  adminEnrollStudent: (params: {
    name: string;
    email: string;
    moduleId: string;
    cohortId: string;
  }) => { ok: boolean; message: string };
}

const LMSContext = createContext<LMSContextValue | null>(null);

function loadInitialState(): LMSState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as LMSState;
      if (parsed && Array.isArray(parsed.modules) && Array.isArray(parsed.users)) {
        return parsed;
      }
    }
  } catch {
    // Fallback to seed state
  }
  return SEED_STATE;
}

export const LMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<LMSState>(loadInitialState);
  const [route, setRoute] = useState<string>(() => window.location.pathname || '/');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }, [state]);

  useEffect(() => {
    const handlePopState = () => {
      setRoute(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((to: string) => {
    if (window.location.pathname !== to) {
      window.history.pushState({}, '', to);
    }
    setRoute(to);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  const currentUser = state.users.find((u) => u.id === state.currentUserId) || null;

  const signUp: LMSContextValue['signUp'] = ({ name, email, password, role }) => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!name.trim() || !trimmedEmail || password.length < 4) {
      return { ok: false, error: 'Please complete all fields (password min 4 characters).' };
    }
    if (state.users.some((u) => u.email.toLowerCase() === trimmedEmail)) {
      return { ok: false, error: 'An account with this email already exists.' };
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: trimmedEmail,
      password,
      role,
      headline:
        role === 'admin'
          ? 'Curriculum Administrator · Intergrid IT'
          : 'Systems Engineering Practitioner',
      avatarUrl: DEFAULT_AVATAR_URL,
      streakDays: 1,
      cohortId: state.cohorts[0]?.id,
      joinedAt: new Date().toISOString().slice(0, 10),
      weeklyGoalHours: 6,
      emailDigestEnabled: true,
      autoAdvanceChapters: true,
    };

    const welcomeNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: newUser.id,
      title: 'Workspace Initialized',
      detail: 'Browse the Intergrid IT catalog to enroll in your first engineering track.',
      createdAt: new Date().toISOString().slice(0, 10),
      read: false,
      targetRoute: '/catalog',
    };

    setState((prev) => ({
      ...prev,
      users: [...prev.users, newUser],
      notifications: [welcomeNotif, ...prev.notifications],
    }));

    return { ok: true };
  };

  const signIn: LMSContextValue['signIn'] = (email, password) => {
    const trimmedEmail = email.trim().toLowerCase();
    const matched = state.users.find(
      (u) => u.email.toLowerCase() === trimmedEmail && u.password === password
    );
    if (!matched) {
      return { ok: false, error: 'Invalid email or password. Try one of the demo accounts below.' };
    }
    setState((prev) => ({ ...prev, currentUserId: matched.id }));
    return { ok: true, user: matched };
  };

  const signOut = () => {
    setState((prev) => ({ ...prev, currentUserId: null }));
    navigate('/');
  };

  const enrollInModule = (moduleId: string, targetUserId?: string, cohortId?: string) => {
    const uid = targetUserId || state.currentUserId;
    if (!uid) return;
    const mod = state.modules.find((m) => m.id === moduleId);
    if (!mod) return;

    setState((prev) => {
      const exists = prev.enrollments.some(
        (e) => e.userId === uid && e.moduleId === moduleId
      );
      if (exists) return prev;
      const newEnrollment: Enrollment = {
        id: `enr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        userId: uid,
        moduleId,
        cohortId: cohortId || prev.cohorts[0]?.id,
        enrolledAt: new Date().toISOString().slice(0, 10),
        completedChapterIds: [],
        timeSpentMinutes: 0,
        lastAccessedChapterId: mod.chapters[0]?.id || '',
        lastAccessedAt: new Date().toISOString().slice(0, 10),
      };
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        userId: uid,
        title: `Enrolled · ${mod.code}`,
        detail: `You are now enrolled in ${mod.title}.`,
        createdAt: new Date().toISOString().slice(0, 10),
        read: false,
        targetRoute: `/module/${mod.id}`,
      };
      return {
        ...prev,
        enrollments: [newEnrollment, ...prev.enrollments],
        notifications: [notif, ...prev.notifications],
      };
    });
  };

  const maybeUnlockCertificate = (
    draftState: LMSState,
    userId: string,
    moduleId: string
  ): LMSState => {
    const mod = draftState.modules.find((m) => m.id === moduleId);
    const enrollment = draftState.enrollments.find(
      (e) => e.userId === userId && e.moduleId === moduleId
    );
    const user = draftState.users.find((u) => u.id === userId);
    if (!mod || !enrollment || !user) return draftState;

    const allChaptersDone =
      mod.chapters.length > 0 &&
      mod.chapters.every((ch) => enrollment.completedChapterIds.includes(ch.id));
    const hasPassedQuiz = draftState.quizAttempts.some(
      (a) => a.userId === userId && a.moduleId === moduleId && a.passed
    );
    const alreadyHasCert = draftState.certificates.some(
      (c) => c.userId === userId && c.moduleId === moduleId
    );

    if (allChaptersDone && hasPassedQuiz && !alreadyHasCert) {
      const certNum = Math.floor(1000 + Math.random() * 9000);
      const newCert: Certificate = {
        id: `cert-${Date.now()}`,
        credentialId: `IG-2026-${mod.code.replace('IG-', '')}-${certNum}`,
        userId,
        userName: user.name,
        moduleId,
        moduleTitle: mod.title,
        moduleCode: mod.code,
        issuedAt: new Date().toISOString().slice(0, 10),
        issuedBy: 'Claire Sterling',
        templateName:
          draftState.certificateTemplates[0]?.name ||
          'Intergrid Executive Monochrome Standard',
      };
      const notif: NotificationItem = {
        id: `notif-cert-${Date.now()}`,
        userId,
        title: `Certificate Unlocked · ${mod.code}`,
        detail: `Certificate of Attendance issued for ${mod.title}.`,
        createdAt: new Date().toISOString().slice(0, 10),
        read: false,
        targetRoute: '/certificates',
      };
      return {
        ...draftState,
        certificates: [newCert, ...draftState.certificates],
        notifications: [notif, ...draftState.notifications],
      };
    }

    return draftState;
  };

  const toggleChapterComplete = (moduleId: string, chapterId: string) => {
    if (!state.currentUserId) return;
    const uid = state.currentUserId;

    setState((prev) => {
      const mod = prev.modules.find((m) => m.id === moduleId);
      const ch = mod?.chapters.find((c) => c.id === chapterId);
      const updatedEnrollments = prev.enrollments.map((e) => {
        if (e.userId !== uid || e.moduleId !== moduleId) return e;
        const alreadyDone = e.completedChapterIds.includes(chapterId);
        const completedChapterIds = alreadyDone
          ? e.completedChapterIds.filter((id) => id !== chapterId)
          : [...e.completedChapterIds, chapterId];
        const addedTime = !alreadyDone && ch ? Math.round(ch.durationMinutes * 0.75) : 0;
        return {
          ...e,
          completedChapterIds,
          timeSpentMinutes: e.timeSpentMinutes + addedTime,
          lastAccessedChapterId: chapterId,
          lastAccessedAt: new Date().toISOString().slice(0, 10),
        };
      });

      const nextState = { ...prev, enrollments: updatedEnrollments };
      return maybeUnlockCertificate(nextState, uid, moduleId);
    });
  };

  const completeChapter = (moduleId: string, chapterId: string) => {
    if (!state.currentUserId) return { completedNow: false, allCompleted: false };
    const uid = state.currentUserId;
    const mod = state.modules.find((m) => m.id === moduleId);
    const enrollment = state.enrollments.find(
      (e) => e.userId === uid && e.moduleId === moduleId
    );
    if (!mod || !enrollment) return { completedNow: false, allCompleted: false };

    const validChapter = mod.chapters.find((c) => c.id === chapterId);
    if (!validChapter) return { completedNow: false, allCompleted: false };

    const alreadyDone = enrollment.completedChapterIds.includes(chapterId);
    const nextCompletedIds = alreadyDone
      ? Array.from(new Set(enrollment.completedChapterIds))
      : Array.from(new Set([...enrollment.completedChapterIds, chapterId]));

    const allCompleted =
      mod.chapters.length > 0 &&
      mod.chapters.every((ch) => nextCompletedIds.includes(ch.id));

    setState((prev) => {
      const updatedEnrollments = prev.enrollments.map((e) => {
        if (e.userId !== uid || e.moduleId !== moduleId) return e;
        const isAlready = e.completedChapterIds.includes(chapterId);
        const dedupedIds = isAlready
          ? Array.from(new Set(e.completedChapterIds))
          : Array.from(new Set([...e.completedChapterIds, chapterId]));
        const addedTime = !isAlready ? Math.round(validChapter.durationMinutes * 0.75) : 0;
        return {
          ...e,
          completedChapterIds: dedupedIds,
          timeSpentMinutes: e.timeSpentMinutes + addedTime,
          lastAccessedChapterId: chapterId,
          lastAccessedAt: new Date().toISOString().slice(0, 10),
        };
      });
      const nextState = { ...prev, enrollments: updatedEnrollments };
      return maybeUnlockCertificate(nextState, uid, moduleId);
    });

    return { completedNow: !alreadyDone, allCompleted };
  };

  const toggleAutoAdvance = (enabled: boolean) => {
    if (!state.currentUserId) return;
    const uid = state.currentUserId;
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.id === uid ? { ...u, autoAdvanceChapters: enabled } : u
      ),
    }));
  };

  const logStudyTime = (moduleId: string, minutes: number) => {
    if (!state.currentUserId || minutes <= 0) return;
    const uid = state.currentUserId;
    setState((prev) => ({
      ...prev,
      enrollments: prev.enrollments.map((e) =>
        e.userId === uid && e.moduleId === moduleId
          ? {
              ...e,
              timeSpentMinutes: e.timeSpentMinutes + minutes,
              lastAccessedAt: new Date().toISOString().slice(0, 10),
            }
          : e
      ),
    }));
  };

  const setLastAccessedChapter = (moduleId: string, chapterId: string) => {
    if (!state.currentUserId) return;
    const uid = state.currentUserId;
    setState((prev) => ({
      ...prev,
      enrollments: prev.enrollments.map((e) =>
        e.userId === uid && e.moduleId === moduleId
          ? {
              ...e,
              lastAccessedChapterId: chapterId,
              lastAccessedAt: new Date().toISOString().slice(0, 10),
            }
          : e
      ),
    }));
  };

  const saveChapterNote = (moduleId: string, chapterId: string, content: string) => {
    if (!state.currentUserId) return;
    const uid = state.currentUserId;
    setState((prev) => {
      const existingIndex = prev.notes.findIndex(
        (n) => n.userId === uid && n.moduleId === moduleId && n.chapterId === chapterId
      );
      const now = new Date().toISOString();
      if (existingIndex >= 0) {
        const updated = [...prev.notes];
        updated[existingIndex] = { ...updated[existingIndex], content, updatedAt: now };
        return { ...prev, notes: updated };
      }
      return {
        ...prev,
        notes: [
          {
            id: `note-${Date.now()}`,
            userId: uid,
            moduleId,
            chapterId,
            content,
            updatedAt: now,
          },
          ...prev.notes,
        ],
      };
    });
  };

  const submitQuizAttempt: LMSContextValue['submitQuizAttempt'] = (
    moduleId,
    selectedAnswers
  ) => {
    if (!state.currentUserId) return null;
    const uid = state.currentUserId;
    const mod = state.modules.find((m) => m.id === moduleId);
    if (!mod || mod.quiz.length === 0) return null;

    let correctCount = 0;
    mod.quiz.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correctCount += 1;
      }
    });
    const scorePercent = Math.round((correctCount / mod.quiz.length) * 100);
    const passed = scorePercent >= mod.quizPassingScore;

    const attempt: QuizAttempt = {
      id: `qa-${Date.now()}`,
      userId: uid,
      moduleId,
      scorePercent,
      correctCount,
      totalCount: mod.quiz.length,
      passed,
      selectedAnswers,
      attemptedAt: new Date().toISOString(),
    };

    setState((prev) => {
      const nextState: LMSState = {
        ...prev,
        quizAttempts: [attempt, ...prev.quizAttempts],
      };
      return maybeUnlockCertificate(nextState, uid, moduleId);
    });

    return attempt;
  };

  const updateProfile: LMSContextValue['updateProfile'] = (updates) => {
    if (!state.currentUserId) return;
    const uid = state.currentUserId;
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.id === uid
          ? {
              ...u,
              name: updates.name.trim() || u.name,
              headline: updates.headline.trim(),
              avatarUrl: updates.avatarUrl.trim(),
              weeklyGoalHours: updates.weeklyGoalHours,
              emailDigestEnabled: updates.emailDigestEnabled,
              autoAdvanceChapters:
                updates.autoAdvanceChapters !== undefined
                  ? updates.autoAdvanceChapters
                  : u.autoAdvanceChapters,
              password:
                updates.newPassword && updates.newPassword.length >= 4
                  ? updates.newPassword
                  : u.password,
            }
          : u
      ),
    }));
  };

  const addScheduledSession: LMSContextValue['addScheduledSession'] = (session) => {
    if (!state.currentUserId) return;
    const newSession: ScheduledSession = {
      ...session,
      id: `ses-${Date.now()}`,
      userId: state.currentUserId,
    };
    setState((prev) => ({
      ...prev,
      scheduledSessions: [...prev.scheduledSessions, newSession],
    }));
  };

  const markNotificationRead = (id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  };

  const submitQuestion = (question: string, moduleTitle?: string) => {
    if (!currentUser || !question.trim()) return;
    const item: FAQItem = {
      id: `faq-${Date.now()}`,
      question: question.trim(),
      answer: '',
      authorName: currentUser.name,
      authorId: currentUser.id,
      moduleTitle: moduleTitle || 'General Support',
      status: 'Pending',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setState((prev) => ({
      ...prev,
      faqs: [item, ...prev.faqs],
    }));
  };

  const updateCourseStatus = (moduleId: string, status: CourseStatus) => {
    setState((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => (m.id === moduleId ? { ...m, status } : m)),
    }));
  };

  const attachStudyMaterial: LMSContextValue['attachStudyMaterial'] = (
    moduleId,
    chapterId,
    resource,
    appendSection
  ) => {
    const newResource: StudyResource = {
      ...resource,
      id: `res-${Date.now()}`,
      uploadedAt: new Date().toISOString().slice(0, 10),
      uploadedBy: currentUser?.name || 'Intergrid Admin',
    };
    setState((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => {
        if (m.id !== moduleId) return m;
        return {
          ...m,
          chapters: m.chapters.map((ch) => {
            if (ch.id !== chapterId) return ch;
            return {
              ...ch,
              sections:
                appendSection && appendSection.heading.trim() && appendSection.body.trim()
                  ? [...ch.sections, appendSection]
                  : ch.sections,
              studyMaterials: [...ch.studyMaterials, newResource],
            };
          }),
        };
      }),
    }));
  };

  const attachAdditionalMaterial: LMSContextValue['attachAdditionalMaterial'] = (
    moduleId,
    resource
  ) => {
    const newResource: StudyResource = {
      ...resource,
      id: `add-${Date.now()}`,
      uploadedAt: new Date().toISOString().slice(0, 10),
      uploadedBy: currentUser?.name || 'Intergrid Admin',
    };
    setState((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === moduleId
          ? { ...m, additionalMaterials: [...m.additionalMaterials, newResource] }
          : m
      ),
    }));
  };

  const issueCertificateManually: LMSContextValue['issueCertificateManually'] = ({
    userId,
    moduleId,
    templateName,
    verificationNote,
  }) => {
    const user = state.users.find((u) => u.id === userId);
    const mod = state.modules.find((m) => m.id === moduleId);
    if (!user || !mod) return null;

    const certNum = Math.floor(1000 + Math.random() * 9000);
    const cert: Certificate = {
      id: `cert-${Date.now()}`,
      credentialId: `IG-2026-${mod.code.replace('IG-', '')}-${certNum}`,
      userId: user.id,
      userName: user.name,
      moduleId: mod.id,
      moduleTitle: mod.title,
      moduleCode: mod.code,
      issuedAt: new Date().toISOString().slice(0, 10),
      issuedBy: currentUser?.name || 'Claire Sterling',
      templateName: templateName || state.certificateTemplates[0]?.name || 'Standard',
      verificationNote,
    };

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: user.id,
      title: `Certificate Issued · ${mod.code}`,
      detail: `${currentUser?.name || 'Admin'} issued your Certificate of Attendance for ${mod.title}.`,
      createdAt: new Date().toISOString().slice(0, 10),
      read: false,
      targetRoute: '/certificates',
    };

    setState((prev) => ({
      ...prev,
      certificates: [cert, ...prev.certificates],
      notifications: [notif, ...prev.notifications],
    }));

    return cert;
  };

  const uploadCertificateTemplate: LMSContextValue['uploadCertificateTemplate'] = (tpl) => {
    const newTpl: CertificateTemplate = {
      ...tpl,
      id: `tpl-${Date.now()}`,
      uploadedAt: new Date().toISOString().slice(0, 10),
    };
    setState((prev) => ({
      ...prev,
      certificateTemplates: [newTpl, ...prev.certificateTemplates],
    }));
  };

  const answerFAQ = (faqId: string, answer: string, publish: boolean) => {
    setState((prev) => {
      const target = prev.faqs.find((f) => f.id === faqId);
      const updatedFaqs = prev.faqs.map((f) =>
        f.id === faqId
          ? {
              ...f,
              answer,
              status: publish ? ('Published' as const) : ('Pending' as const),
              answeredAt: new Date().toISOString().slice(0, 10),
            }
          : f
      );
      const notifications =
        publish && target
          ? [
              {
                id: `notif-faq-${Date.now()}`,
                userId: target.authorId,
                title: 'Support Question Answered',
                detail: `An administrator answered your question: "${target.question.slice(0, 48)}..."`,
                createdAt: new Date().toISOString().slice(0, 10),
                read: false,
                targetRoute: '/dashboard',
              },
              ...prev.notifications,
            ]
          : prev.notifications;

      return { ...prev, faqs: updatedFaqs, notifications };
    });
  };

  const adminEnrollStudent: LMSContextValue['adminEnrollStudent'] = ({
    name,
    email,
    moduleId,
    cohortId,
  }) => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) return { ok: false, message: 'Student email is required.' };
    const mod = state.modules.find((m) => m.id === moduleId);
    if (!mod) return { ok: false, message: 'Selected module not found.' };

    let targetUser = state.users.find((u) => u.email.toLowerCase() === trimmedEmail);

    if (!targetUser) {
      targetUser = {
        id: `user-${Date.now()}`,
        name: name.trim() || trimmedEmail.split('@')[0],
        email: trimmedEmail,
        password: 'password123',
        role: 'learner',
        headline: 'Cohort Learner · Intergrid IT',
        avatarUrl: '',
        streakDays: 0,
        cohortId,
        joinedAt: new Date().toISOString().slice(0, 10),
        weeklyGoalHours: 6,
        emailDigestEnabled: true,
      };
      setState((prev) => ({
        ...prev,
        users: [...prev.users, targetUser!],
      }));
    }

    const alreadyEnrolled = state.enrollments.some(
      (e) => e.userId === targetUser!.id && e.moduleId === moduleId
    );
    if (alreadyEnrolled) {
      return {
        ok: false,
        message: `${targetUser.name} is already enrolled in ${mod.title}.`,
      };
    }

    enrollInModule(moduleId, targetUser.id, cohortId);
    return {
      ok: true,
      message: `Enrolled ${targetUser.name} (${trimmedEmail}) into ${mod.title}.`,
    };
  };

  return (
    <LMSContext.Provider
      value={{
        state,
        currentUser,
        route,
        navigate,
        globalSearchQuery,
        setGlobalSearchQuery,
        signUp,
        signIn,
        signOut,
        enrollInModule,
        toggleChapterComplete,
        completeChapter,
        toggleAutoAdvance,
        logStudyTime,
        setLastAccessedChapter,
        saveChapterNote,
        submitQuizAttempt,
        updateProfile,
        addScheduledSession,
        markNotificationRead,
        submitQuestion,
        updateCourseStatus,
        attachStudyMaterial,
        attachAdditionalMaterial,
        issueCertificateManually,
        uploadCertificateTemplate,
        answerFAQ,
        adminEnrollStudent,
      }}
    >
      {children}
    </LMSContext.Provider>
  );
};

export function useLMS() {
  const ctx = useContext(LMSContext);
  if (!ctx) throw new Error('useLMS must be used within LMSProvider');
  return ctx;
}
