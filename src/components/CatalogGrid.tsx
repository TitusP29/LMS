import React, { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Clock, Layers, Search } from 'lucide-react';
import { useLMS } from '../store/LMSContext';
import { formatMinutesLong, getModuleTotalMinutes } from '../utils/formatters';

export const CatalogGrid: React.FC = () => {
  const { state, currentUser, enrollInModule, navigate } = useLMS();
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [query, setQuery] = useState('');

  const categories = [
    'All',
    'Cloud & DevOps',
    'Systems Engineering',
    'Cybersecurity',
    'Data Architecture',
  ];
  const difficulties = ['All', 'Foundational', 'Intermediate', 'Advanced'];

  const enrolledIds = useMemo(
    () =>
      new Set(
        state.enrollments
          .filter((e) => e.userId === currentUser?.id)
          .map((e) => e.moduleId)
      ),
    [state.enrollments, currentUser?.id]
  );

  const visibleModules = useMemo(() => {
    return state.modules.filter((m) => {
      if (m.status !== 'Published') return false;
      if (categoryFilter !== 'All' && m.category !== categoryFilter) return false;
      if (difficultyFilter !== 'All' && m.difficulty !== difficultyFilter) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return (
          m.title.toLowerCase().includes(q) ||
          m.code.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [state.modules, categoryFilter, difficultyFilter, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-[#E4E4E7]">
        <div>
          <h1 className="font-display font-semibold text-[26px] text-[#09090B]">
            Course Catalog
          </h1>
          <p className="text-[14px] text-[#71717A] mt-1">
            Select an Intergrid IT engineering module to enroll and begin chapter study.
          </p>
        </div>

        <div className="relative w-full md:w-[280px]">
          <Search
            className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2"
            strokeWidth={1.5}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter catalog..."
            className="w-full pl-9 pr-3 py-2 rounded-[6px] border border-[#E4E4E7] bg-white text-[13px] focus:outline-none focus:border-[#09090B]"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-[#F4F4F5] rounded-[8px] border border-[#E4E4E7]">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                categoryFilter === cat
                  ? 'bg-[#09090B] text-white'
                  : 'text-[#71717A] hover:text-[#09090B]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-[#F4F4F5] rounded-[8px] border border-[#E4E4E7] self-start">
          {difficulties.map((diff) => (
            <button
              key={diff}
              type="button"
              onClick={() => setDifficultyFilter(diff)}
              className={`px-2.5 py-1.5 rounded-[6px] text-[12px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                difficultyFilter === diff
                  ? 'bg-white text-[#09090B] shadow-xs'
                  : 'text-[#71717A] hover:text-[#09090B]'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid */}
      {visibleModules.length === 0 ? (
        <div className="bg-white border border-[#E4E4E7] rounded-[8px] p-10 text-center text-[14px] text-[#71717A]">
          No published modules match the selected filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
          {visibleModules.map((mod) => {
            const totalMinutes = getModuleTotalMinutes(mod);
            const isEnrolled = enrolledIds.has(mod.id);
            return (
              <article
                key={mod.id}
                className="bg-white border border-[#E4E4E7] rounded-[8px] p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-[12px] font-mono text-[#71717A] mb-2">
                    <span>
                      {mod.code} · {mod.category}
                    </span>
                    <span className="font-sans font-medium text-[#09090B]">
                      {mod.difficulty}
                    </span>
                  </div>

                  <h2 className="font-display font-semibold text-[19px] text-[#09090B]">
                    {mod.title}
                  </h2>
                  <p className="mt-2 text-[13px] leading-[1.6] text-[#71717A]">
                    {mod.description}
                  </p>

                  {mod.outcomes.length > 0 && (
                    <ul className="mt-4 space-y-1.5 pt-4 border-t border-[#E4E4E7]">
                      {mod.outcomes.slice(0, 2).map((out, idx) => (
                        <li
                          key={idx}
                          className="text-[12px] text-[#09090B] flex items-start gap-2"
                        >
                          <span className="font-mono text-[#71717A]">0{idx + 1}.</span>
                          <span>{out}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-[#E4E4E7] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-[12px] font-mono text-[#71717A] tabular-nums">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                      {formatMinutesLong(totalMinutes)}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" strokeWidth={1.5} />
                      {mod.chapters.length} Chapters
                    </span>
                  </div>

                  {isEnrolled ? (
                    <button
                      type="button"
                      onClick={() => navigate(`/module/${mod.id}`)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[6px] border border-[#09090B] bg-white hover:bg-[#F4F4F5] text-[#09090B] text-[13px] font-medium transition-colors whitespace-nowrap shrink-0"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>Open Module</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        enrollInModule(mod.id);
                        navigate(`/module/${mod.id}`);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[6px] bg-[#09090B] hover:bg-[#18181B] text-white text-[13px] font-medium transition-colors whitespace-nowrap shrink-0"
                    >
                      <span>Enroll in Module</span>
                      <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
