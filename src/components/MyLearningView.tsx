import React, { useMemo, useState } from 'react';
import { ArrowRight, Award, BookOpen, CheckCircle2, Clock, Search } from 'lucide-react';
import { useLMS } from '../store/LMSContext';
import { MODULE_THUMBNAILS } from '../data/seedData';
import { formatMinutes, getEnrollmentStats } from '../utils/formatters';

export const MyLearningView: React.FC = () => {
  const { state, currentUser, navigate } = useLMS();
  const [statusTab, setStatusTab] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [query, setQuery] = useState('');
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const rows = useMemo(() => {
    if (!currentUser) return [];
    return state.enrollments
      .filter((e) => e.userId === currentUser.id)
      .map((enrollment) => {
        const mod = state.modules.find((m) => m.id === enrollment.moduleId);
        if (!mod) return null;
        const stats = getEnrollmentStats(mod, enrollment);
        const passedQuiz = state.quizAttempts.some(
          (qa) => qa.userId === currentUser.id && qa.moduleId === mod.id && qa.passed
        );
        const hasCert = state.certificates.some(
          (c) => c.userId === currentUser.id && c.moduleId === mod.id
        );
        return { enrollment, module: mod, stats, passedQuiz, hasCert };
      })
      .filter(Boolean) as {
      enrollment: (typeof state.enrollments)[number];
      module: (typeof state.modules)[number];
      stats: ReturnType<typeof getEnrollmentStats>;
      passedQuiz: boolean;
      hasCert: boolean;
    }[];
  }, [state.enrollments, state.modules, state.quizAttempts, state.certificates, currentUser]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (statusTab === 'in_progress' && r.stats.isCompleted) return false;
      if (statusTab === 'completed' && !r.stats.isCompleted) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return (
          r.module.title.toLowerCase().includes(q) ||
          r.module.code.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [rows, statusTab, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-[#E4E4E7]">
        <div>
          <h1 className="font-display font-semibold text-[26px] text-[#09090B]">
            My Learning
          </h1>
          <p className="text-[14px] text-[#71717A] mt-1">
            Track exact chapter counts, time remaining to finish, and assessment readiness.
          </p>
        </div>

        <div className="relative w-full md:w-[260px]">
          <Search
            className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2"
            strokeWidth={1.5}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter enrolled courses..."
            className="w-full pl-9 pr-3 py-2 rounded-[6px] border border-[#E4E4E7] bg-white text-[13px] focus:outline-none focus:border-[#09090B]"
          />
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center justify-between gap-4">
        <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#F4F4F5] rounded-[8px] border border-[#E4E4E7]">
          {(
            [
              { id: 'all', label: `All (${rows.length})` },
              {
                id: 'in_progress',
                label: `In Progress (${rows.filter((r) => !r.stats.isCompleted).length})`,
              },
              {
                id: 'completed',
                label: `Completed (${rows.filter((r) => r.stats.isCompleted).length})`,
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusTab(tab.id)}
              className={`px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                statusTab === tab.id
                  ? 'bg-[#09090B] text-white'
                  : 'text-[#71717A] hover:text-[#09090B]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-[#E4E4E7] rounded-[8px] p-10 text-center">
          <div className="text-[15px] font-medium text-[#09090B]">
            No courses found in this view
          </div>
          <p className="text-[13px] text-[#71717A] mt-1">
            Enroll in additional courses from the catalog or adjust your filter.
          </p>
          <button
            type="button"
            onClick={() => navigate('/catalog')}
            className="mt-4 px-4 py-2 rounded-[6px] bg-[#09090B] text-white text-[13px] font-medium"
          >
            Browse Courses
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5 lg:gap-6">
          {filtered.map(({ enrollment, module, stats, passedQuiz, hasCert }) => {
            const thumbUrl = MODULE_THUMBNAILS[module.category];
            return (
              <article
                key={module.id}
                className="bg-white border border-[#E4E4E7] rounded-[8px] overflow-hidden flex flex-col justify-between hover:border-[#09090B]/60 transition-colors"
              >
                <div>
                  <div className="relative aspect-[16/9] bg-[#18181B] border-b border-[#E4E4E7] overflow-hidden">
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between text-[11px] font-mono text-white">
                      <span>{module.code}</span>
                      <span>
                        {stats.isCompleted ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 pb-3">
                    <h2 className="font-display font-semibold text-[17px] text-[#09090B] leading-snug">
                      {module.title}
                    </h2>
                    <div className="text-[12px] text-[#71717A] mt-1 truncate">
                      {module.instructor}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[#71717A] tabular-nums">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                        {stats.remainingMinutes === 0
                          ? '0m left'
                          : `${formatMinutes(stats.remainingMinutes)} left`}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Quiz: {passedQuiz ? 'Passed' : 'Pending'}</span>
                      {hasCert && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-1 text-[#09090B] font-medium">
                            <Award className="w-3.5 h-3.5" strokeWidth={1.5} />
                            Certificate
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2 space-y-3.5">
                  <div>
                    <div className="flex items-center justify-between text-[12px] font-mono tabular-nums mb-1.5">
                      <span className="inline-flex items-center gap-1 text-[#71717A]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#09090B]" strokeWidth={1.5} />
                        {stats.completedCount} / {stats.totalChapters} chapters
                      </span>
                      <span className="font-semibold text-[#09090B]">
                        {stats.progressPercent}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-[3px] bg-[#F4F4F5] overflow-hidden">
                      <div
                        className="h-full bg-[#09090B] transition-all"
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
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[6px] bg-[#09090B] hover:bg-[#18181B] text-white text-[13px] font-medium transition-colors"
                  >
                    <span>
                      {stats.isCompleted ? 'Open Course' : 'Continue Learning'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
