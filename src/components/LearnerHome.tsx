import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  HelpCircle,
  Play,
  Plus,
  ShieldCheck,
  Trophy,
} from 'lucide-react';
import { useLMS } from '../store/LMSContext';
import { MODULE_THUMBNAILS } from '../data/seedData';
import { formatMinutes, formatMinutesLong, getEnrollmentStats } from '../utils/formatters';

export const LearnerHome: React.FC = () => {
  const { state, currentUser, navigate, addScheduledSession } = useLMS();
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionDate, setSessionDate] = useState('2026-11-22');
  const [sessionModuleId, setSessionModuleId] = useState(state.modules[0]?.id || '');
  const [sessionKind, setSessionKind] = useState<'Study Session' | 'Quiz Target'>(
    'Study Session'
  );

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const firstName = currentUser?.name.split(' ')[0] || 'Learner';

  const enrolledItems = useMemo(() => {
    if (!currentUser) return [];
    return state.enrollments
      .filter((e) => e.userId === currentUser.id)
      .map((enrollment) => {
        const mod = state.modules.find((m) => m.id === enrollment.moduleId);
        if (!mod) return null;
        return {
          enrollment,
          module: mod,
          stats: getEnrollmentStats(mod, enrollment),
        };
      })
      .filter(Boolean) as {
      enrollment: (typeof state.enrollments)[number];
      module: (typeof state.modules)[number];
      stats: ReturnType<typeof getEnrollmentStats>;
    }[];
  }, [state.enrollments, state.modules, currentUser]);

  // Sort most recently accessed for Continue Learning & Recently Accessed Chapters
  const sortedByRecent = useMemo(
    () =>
      [...enrolledItems].sort((a, b) =>
        b.enrollment.lastAccessedAt.localeCompare(a.enrollment.lastAccessedAt)
      ),
    [enrolledItems]
  );

  const primaryResume =
    sortedByRecent.find((i) => !i.stats.isCompleted) || sortedByRecent[0] || null;

  const recentChapters = useMemo(() => {
    return sortedByRecent
      .map((item) => {
        const sortedChapters = [...item.module.chapters].sort(
          (a, b) => a.order - b.order
        );
        const chapter =
          sortedChapters.find(
            (c) => c.id === item.enrollment.lastAccessedChapterId
          ) || sortedChapters[0];
        if (!chapter) return null;
        const isCompleted = item.enrollment.completedChapterIds.includes(chapter.id);
        return {
          module: item.module,
          chapter,
          lastAccessedAt: item.enrollment.lastAccessedAt,
          isCompleted,
        };
      })
      .filter(Boolean) as {
      module: (typeof state.modules)[number];
      chapter: (typeof state.modules)[number]['chapters'][number];
      lastAccessedAt: string;
      isCompleted: boolean;
    }[];
  }, [sortedByRecent]);

  // Overall Progress calculations
  const totalChapters = enrolledItems.reduce((acc, i) => acc + i.stats.totalChapters, 0);
  const completedChapters = enrolledItems.reduce(
    (acc, i) => acc + i.stats.completedCount,
    0
  );
  const overallProgress =
    totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;
  const totalMinutesLogged = enrolledItems.reduce(
    (acc, i) => acc + i.enrollment.timeSpentMinutes,
    0
  );
  const completedCoursesCount = enrolledItems.filter((i) => i.stats.isCompleted).length;

  // Upcoming Assignments (Pending Quizzes) & Scheduled Sessions
  const pendingQuizModules = useMemo(() => {
    const passedSet = new Set(
      state.quizAttempts
        .filter((qa) => qa.userId === currentUser?.id && qa.passed)
        .map((qa) => qa.moduleId)
    );
    return enrolledItems
      .filter((item) => !passedSet.has(item.module.id))
      .map((item) => ({
        module: item.module,
        stats: item.stats,
      }));
  }, [enrolledItems, state.quizAttempts, currentUser?.id]);

  const upcomingSessions = useMemo(
    () =>
      [...state.scheduledSessions]
        .filter((s) => s.userId === currentUser?.id)
        .sort((a, b) => a.dateISO.localeCompare(b.dateISO)),
    [state.scheduledSessions, currentUser?.id]
  );

  // Achievements
  const passedQuizzesCount = state.quizAttempts.filter(
    (qa) => qa.userId === currentUser?.id && qa.passed
  ).length;
  const userCertificates = state.certificates.filter(
    (c) => c.userId === currentUser?.id
  );
  const achievements = [
    {
      id: 'ach-first-mod',
      title: 'First Course Complete',
      earned: completedCoursesCount >= 1,
    },
    {
      id: 'ach-streak',
      title: '7-Day Focus Streak',
      earned: (currentUser?.streakDays || 0) >= 7,
    },
    {
      id: 'ach-quiz',
      title: 'Quiz Master',
      earned: passedQuizzesCount >= 1,
    },
    {
      id: 'ach-notes',
      title: 'Systems Chronicler',
      earned: state.notes.some(
        (n) => n.userId === currentUser?.id && n.content.trim().length > 0
      ),
    },
  ];

  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallProgress / 100) * circumference;

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionTitle.trim()) return;
    addScheduledSession({
      title: sessionTitle.trim(),
      moduleId: sessionModuleId || state.modules[0]?.id || '',
      dateISO: sessionDate,
      timeLabel: '18:30',
      kind: sessionKind,
    });
    setSessionTitle('');
    setShowScheduleForm(false);
  };

  return (
    <div className="space-y-10">
      {/* 1. Welcome Section */}
      <section className="bg-white border border-[#E4E4E7] rounded-[8px] p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="text-[12px] font-mono text-[#71717A]">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </div>
          <h1 className="font-display font-semibold text-[28px] sm:text-[32px] text-[#09090B] mt-1">
            {greeting}, {firstName}.
          </h1>
          <p className="text-[14px] text-[#71717A] mt-1">
            {currentUser?.headline ||
              'Resume your engineering tracks and track chapter mastery.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/my-learning')}
            className="px-4 py-2.5 rounded-[6px] border border-[#E4E4E7] bg-white hover:border-[#09090B] text-[13px] font-medium text-[#09090B] transition-colors whitespace-nowrap shrink-0"
          >
            My Learning
          </button>
          <button
            type="button"
            onClick={() => navigate('/catalog')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[6px] bg-[#09090B] hover:bg-[#18181B] text-white text-[13px] font-medium transition-colors whitespace-nowrap shrink-0"
          >
            <span>Browse Courses</span>
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>
        </div>
      </section>

      {/* 2. Continue Learning Section */}
      {primaryResume && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-[20px] text-[#09090B]">
              Continue Learning
            </h2>
            <span className="text-[12px] font-mono text-[#71717A]">
              Last studied {primaryResume.enrollment.lastAccessedAt}
            </span>
          </div>

          <div className="bg-[#09090B] text-white rounded-[8px] overflow-hidden border border-[#18181B] grid grid-cols-1 lg:grid-cols-12 items-stretch">
            <div className="lg:col-span-4 xl:col-span-3 relative min-h-[180px] sm:min-h-[200px] bg-[#18181B]">
              {!imgErrors[primaryResume.module.id] &&
              MODULE_THUMBNAILS[primaryResume.module.category] ? (
                <img
                  src={MODULE_THUMBNAILS[primaryResume.module.category]}
                  alt={primaryResume.module.title}
                  referrerPolicy="no-referrer"
                  onError={() =>
                    setImgErrors((p) => ({ ...p, [primaryResume.module.id]: true }))
                  }
                  className="w-full h-full object-cover grayscale contrast-110 opacity-85"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#18181B] text-zinc-400">
                  <BookOpen className="w-10 h-10" strokeWidth={1.25} />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#09090B]/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 text-[11px] font-mono text-zinc-300">
                {primaryResume.module.code} · {primaryResume.module.category}
              </div>
            </div>

            <div className="lg:col-span-8 xl:col-span-9 p-5 sm:p-6 lg:p-7 flex flex-col justify-between min-w-0">
              <div>
                <div className="text-[12px] text-zinc-400">
                  Instructor: {primaryResume.module.instructor}
                </div>
                <h3 className="font-display font-semibold text-[22px] text-white mt-1">
                  {primaryResume.module.title}
                </h3>
                {(() => {
                  const ch =
                    primaryResume.module.chapters.find(
                      (c) => c.id === primaryResume.enrollment.lastAccessedChapterId
                    ) || primaryResume.module.chapters[0];
                  return ch ? (
                    <div className="mt-2.5 text-[14px] text-zinc-300 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <Play className="w-3.5 h-3.5 text-white shrink-0" strokeWidth={1.75} />
                      <span>
                        Chapter 0{ch.order}: {ch.title}
                      </span>
                      <span className="text-zinc-400 font-mono text-[12px] tabular-nums">
                        ({formatMinutesLong(ch.durationMinutes)})
                      </span>
                    </div>
                  ) : null;
                })()}
              </div>

              <div className="mt-6 pt-5 border-t border-white/14 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 max-w-md">
                  <div className="flex items-center justify-between text-[12px] font-mono tabular-nums text-zinc-300 mb-1.5">
                    <span>
                      {primaryResume.stats.completedCount} /{' '}
                      {primaryResume.stats.totalChapters} chapters completed
                    </span>
                    <span className="font-semibold text-white">
                      {primaryResume.stats.progressPercent}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-[4px] bg-white/15 overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-300"
                      style={{ width: `${primaryResume.stats.progressPercent}%` }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/module/${primaryResume.module.id}?chapter=${
                        primaryResume.enrollment.lastAccessedChapterId ||
                        primaryResume.module.chapters[0]?.id
                      }`
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[6px] bg-white hover:bg-zinc-200 text-[#09090B] text-[13px] font-semibold transition-colors whitespace-nowrap shrink-0"
                >
                  <span>
                    {primaryResume.stats.isCompleted ? 'Review Course' : 'Continue Learning'}
                  </span>
                  <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. My Enrolled Courses (Udemy-style Course Cards) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-semibold text-[20px] text-[#09090B]">
              My Enrolled Courses
            </h2>
            <p className="text-[13px] text-[#71717A] mt-0.5">
              Track progress and resume right where you left off.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/my-learning')}
            className="text-[13px] font-medium text-[#09090B] hover:underline whitespace-nowrap shrink-0"
          >
            View All ({enrolledItems.length})
          </button>
        </div>

        {enrolledItems.length === 0 ? (
          <div className="bg-white border border-[#E4E4E7] rounded-[8px] p-10 text-center">
            <BookOpen className="w-8 h-8 text-[#71717A] mx-auto mb-3" strokeWidth={1.5} />
            <h3 className="font-display font-semibold text-[16px] text-[#09090B]">
              You have not enrolled in any courses yet
            </h3>
            <p className="text-[13px] text-[#71717A] mt-1 max-w-md mx-auto">
              Browse the Intergrid IT course catalog to enroll in Cloud Infrastructure, Systems Engineering, Cybersecurity, or Data Architecture.
            </p>
            <button
              type="button"
              onClick={() => navigate('/catalog')}
              className="mt-5 px-4 py-2 rounded-[6px] bg-[#09090B] text-white text-[13px] font-medium"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5 lg:gap-6">
            {enrolledItems.map(({ enrollment, module, stats }) => {
              const thumbUrl = MODULE_THUMBNAILS[module.category];
              return (
                <article
                  key={module.id}
                  className="bg-white border border-[#E4E4E7] rounded-[8px] overflow-hidden flex flex-col justify-between hover:border-[#09090B]/60 transition-colors"
                >
                  <div>
                    {/* Course Thumbnail */}
                    <div className="relative aspect-[16/9] bg-[#18181B] overflow-hidden border-b border-[#E4E4E7]">
                      {!imgErrors[module.id] && thumbUrl ? (
                        <img
                          src={thumbUrl}
                          alt={module.title}
                          referrerPolicy="no-referrer"
                          onError={() =>
                            setImgErrors((p) => ({ ...p, [module.id]: true }))
                          }
                          className="w-full h-full object-cover grayscale contrast-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#18181B] text-zinc-400">
                          <BookOpen className="w-8 h-8" strokeWidth={1.5} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                      <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between text-[11px] font-mono text-white">
                        <span>{module.code}</span>
                        <span>{module.difficulty}</span>
                      </div>
                    </div>

                    {/* Course Body */}
                    <div className="p-5 pb-3">
                      <h3 className="font-display font-semibold text-[16px] text-[#09090B] leading-snug">
                        {module.title}
                      </h3>
                      <div className="text-[12px] text-[#71717A] mt-1 truncate">
                        {module.instructor}
                      </div>
                    </div>
                  </div>

                  {/* Course Progress & CTA */}
                  <div className="px-5 pb-5 pt-2 space-y-3.5">
                    <div>
                      <div className="flex items-center justify-between text-[12px] font-mono tabular-nums mb-1.5">
                        <span className="text-[#71717A]">
                          {stats.completedCount} / {stats.totalChapters} chapters
                        </span>
                        <span className="font-semibold text-[#09090B]">
                          {stats.progressPercent}% complete
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-[3px] bg-[#F4F4F5] overflow-hidden">
                        <div
                          className="h-full bg-[#09090B] transition-all duration-300"
                          style={{ width: `${stats.progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/module/${module.id}?chapter=${
                            enrollment.lastAccessedChapterId || module.chapters[0]?.id
                          }`
                        )
                      }
                      className="w-full py-2 px-3.5 rounded-[6px] bg-[#09090B] hover:bg-[#18181B] text-white text-[13px] font-medium transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>{stats.isCompleted ? 'Review Course' : 'Continue Learning'}</span>
                      <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Recently Accessed Chapters + 5. Learning Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* 4. Recently Accessed Chapters */}
        <section className="lg:col-span-7 bg-white border border-[#E4E4E7] rounded-[8px] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-[18px] text-[#09090B]">
                Recently Accessed Chapters
              </h2>
              <span className="text-[12px] font-mono text-[#71717A]">
                Jump back in
              </span>
            </div>

            {recentChapters.length === 0 ? (
              <div className="text-[13px] text-[#71717A] py-6">
                Open a course to begin tracking recently accessed chapters.
              </div>
            ) : (
              <div className="divide-y divide-[#E4E4E7]">
                {recentChapters.map(({ module, chapter, lastAccessedAt, isCompleted }) => (
                  <button
                    key={`${module.id}-${chapter.id}`}
                    type="button"
                    onClick={() =>
                      navigate(`/module/${module.id}?chapter=${chapter.id}`)
                    }
                    className="w-full text-left py-3.5 first:pt-1 last:pb-1 flex items-center justify-between gap-4 hover:bg-[#FAFAFA] px-2 -mx-2 rounded-[6px] transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-[11px] font-mono text-[#71717A]">
                        <span>{module.code}</span>
                        <span aria-hidden="true">·</span>
                        <span>Chapter 0{chapter.order}</span>
                        <span aria-hidden="true">·</span>
                        <span>{lastAccessedAt}</span>
                      </div>
                      <div className="text-[14px] font-medium text-[#09090B] truncate mt-0.5">
                        {chapter.title}
                      </div>
                      <div className="text-[12px] text-[#71717A] truncate">
                        {module.title}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[12px] font-mono tabular-nums text-[#71717A] hidden sm:inline">
                        {formatMinutesLong(chapter.durationMinutes)}
                      </span>
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-[4px] bg-[#09090B] text-white text-[11px] font-medium">
                          <CheckCircle2 className="w-3 h-3" strokeWidth={1.75} />
                          Done
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] border border-[#E4E4E7] text-[#09090B] text-[11px] font-medium">
                          Resume
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 5. Learning Progress */}
        <section className="lg:col-span-5 bg-white border border-[#E4E4E7] rounded-[8px] p-6 flex flex-col justify-between">
          <div>
            <h2 className="font-display font-semibold text-[18px] text-[#09090B]">
              Learning Progress
            </h2>
            <p className="text-[13px] text-[#71717A] mt-0.5">
              Curriculum mastery across all enrolled tracks
            </p>

            <div className="mt-5 flex items-center justify-between gap-5">
              <div className="flex-1">
                <div className="font-display font-semibold text-[32px] tabular-nums text-[#09090B]">
                  {overallProgress}%
                </div>
                <div className="text-[12px] text-[#71717A] tabular-nums">
                  {completedChapters} of {totalChapters} chapters completed
                </div>
                <div className="mt-3 w-full h-2 rounded-[4px] bg-[#F4F4F5] overflow-hidden">
                  <div
                    className="h-full bg-[#09090B] transition-all duration-300"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
              </div>

              <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 84 84">
                  <circle
                    cx="42"
                    cy="42"
                    r={radius}
                    stroke="#F4F4F5"
                    strokeWidth="6"
                    fill="none"
                  />
                  <circle
                    cx="42"
                    cy="42"
                    r={radius}
                    stroke="#09090B"
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
                <span className="absolute text-[12px] font-mono font-semibold tabular-nums text-[#09090B]">
                  {overallProgress}%
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E4E4E7] grid grid-cols-3 gap-3">
            <div>
              <div className="text-[11px] text-[#71717A]">Courses</div>
              <div className="font-display font-semibold text-[17px] tabular-nums text-[#09090B] mt-0.5">
                {enrolledItems.length}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[#71717A]">Completed</div>
              <div className="font-display font-semibold text-[17px] tabular-nums text-[#09090B] mt-0.5">
                {completedCoursesCount}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[#71717A]">Hours Logged</div>
              <div className="font-display font-semibold text-[17px] tabular-nums text-[#09090B] mt-0.5">
                {formatMinutes(totalMinutesLogged)}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 6. Upcoming Assignments and Activities + 7. Learning Streak and Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* 6. Upcoming Assignments and Activities */}
        <section className="lg:col-span-7 bg-white border border-[#E4E4E7] rounded-[8px] p-5 sm:p-6 space-y-5 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-display font-semibold text-[18px] text-[#09090B]">
                Upcoming Assignments & Activities
              </h2>
              <p className="text-[13px] text-[#71717A] mt-0.5">
                Pending knowledge checks and scheduled study sessions
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowScheduleForm((s) => !s)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#E4E4E7] hover:border-[#09090B] text-[12px] font-medium text-[#09090B] whitespace-nowrap shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Schedule Activity</span>
            </button>
          </div>

          {showScheduleForm && (
            <form
              onSubmit={handleCreateSession}
              className="p-4 rounded-[8px] bg-[#FAFAFA] border border-[#E4E4E7] grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              <input
                type="text"
                required
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder="Study goal or quiz prep title..."
                className="sm:col-span-2 px-3 py-2 rounded-[6px] border border-[#E4E4E7] bg-white text-[13px] focus:outline-none focus:border-[#09090B]"
              />
              <select
                value={sessionModuleId}
                onChange={(e) => setSessionModuleId(e.target.value)}
                className="px-3 py-2 rounded-[6px] border border-[#E4E4E7] bg-white text-[13px]"
              >
                {state.modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.code} · {m.title}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-[6px] border border-[#E4E4E7] bg-white text-[13px] font-mono"
                />
                <select
                  value={sessionKind}
                  onChange={(e) =>
                    setSessionKind(e.target.value as 'Study Session' | 'Quiz Target')
                  }
                  className="px-2.5 py-2 rounded-[6px] border border-[#E4E4E7] bg-white text-[12px]"
                >
                  <option value="Study Session">Study</option>
                  <option value="Quiz Target">Quiz</option>
                </select>
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleForm(false)}
                  className="px-3 py-1.5 rounded-[6px] text-[12px] text-[#71717A] hover:text-[#09090B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-[6px] bg-[#09090B] text-white text-[12px] font-medium"
                >
                  Save Activity
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {pendingQuizModules.map(({ module, stats }) => (
              <div
                key={`quiz-${module.id}`}
                className="p-3.5 rounded-[6px] border border-[#E4E4E7] bg-[#FAFAFA] flex items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <HelpCircle
                    className="w-4 h-4 text-[#09090B] mt-0.5 shrink-0"
                    strokeWidth={1.5}
                  />
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-[#09090B] truncate">
                      Knowledge Check · {module.title}
                    </div>
                    <div className="text-[12px] font-mono text-[#71717A] tabular-nums">
                      {module.code} · {module.quiz.length} questions · Pass{' '}
                      {module.quizPassingScore}% ·{' '}
                      {stats.isCompleted
                        ? 'Unlocked'
                        : `${stats.completedCount}/${stats.totalChapters} chapters done`}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/module/${module.id}?tab=quiz`)}
                  className="px-3 py-1.5 rounded-[6px] border border-[#E4E4E7] bg-white hover:border-[#09090B] text-[12px] font-medium text-[#09090B] whitespace-nowrap shrink-0"
                >
                  {stats.isCompleted ? 'Take Quiz' : 'View'}
                </button>
              </div>
            ))}

            {upcomingSessions.map((ses) => {
              const mod = state.modules.find((m) => m.id === ses.moduleId);
              return (
                <div
                  key={ses.id}
                  className="p-3.5 rounded-[6px] border border-[#E4E4E7] bg-white flex items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <Calendar
                      className="w-4 h-4 text-[#71717A] mt-0.5 shrink-0"
                      strokeWidth={1.5}
                    />
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium text-[#09090B] truncate">
                        {ses.title}
                      </div>
                      <div className="text-[12px] font-mono text-[#71717A] tabular-nums">
                        {ses.kind} · {ses.dateISO} at {ses.timeLabel} · {mod?.code}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/module/${ses.moduleId}`)}
                    className="px-3 py-1.5 rounded-[6px] border border-[#E4E4E7] hover:border-[#09090B] text-[12px] font-medium text-[#09090B] whitespace-nowrap shrink-0"
                  >
                    Open
                  </button>
                </div>
              );
            })}

            {pendingQuizModules.length === 0 && upcomingSessions.length === 0 && (
              <div className="text-[13px] text-[#71717A] py-4">
                No pending quizzes or scheduled study sessions.
              </div>
            )}
          </div>
        </section>

        {/* 7. Learning Streak and Achievements */}
        <section className="lg:col-span-5 bg-white border border-[#E4E4E7] rounded-[8px] p-6 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-[18px] text-[#09090B]">
                Streak & Achievements
              </h2>
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="text-[12px] text-[#71717A] hover:text-[#09090B]"
              >
                View Profile
              </button>
            </div>

            <div className="mt-4 p-4 rounded-[8px] bg-[#09090B] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[6px] bg-white/10 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="font-display font-semibold text-[22px] tabular-nums leading-none">
                    {currentUser?.streakDays || 0} Days
                  </div>
                  <div className="text-[12px] text-zinc-400 mt-1">
                    Active daily learning streak
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] font-mono text-zinc-400">Goal</div>
                <div className="text-[13px] font-mono tabular-nums text-white">
                  {currentUser?.weeklyGoalHours || 6}h / wk
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-3 rounded-[6px] border ${
                    ach.earned
                      ? 'bg-[#FAFAFA] border-[#09090B] text-[#09090B]'
                      : 'bg-[#FAFAFA] border-[#E4E4E7] text-[#71717A]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />
                    <span className="text-[10px] font-mono">
                      {ach.earned ? 'Unlocked' : 'Locked'}
                    </span>
                  </div>
                  <div className="mt-2 text-[12px] font-semibold leading-snug">
                    {ach.title}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#E4E4E7] flex items-center justify-between">
            <div className="inline-flex items-center gap-2 text-[13px] text-[#09090B]">
              <Award className="w-4 h-4" strokeWidth={1.5} />
              <span className="font-mono tabular-nums font-medium">
                {userCertificates.length} Certificates Earned
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/certificates')}
              className="inline-flex items-center gap-1 text-[12px] font-medium text-[#09090B] hover:underline"
            >
              <Trophy className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Gallery</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
