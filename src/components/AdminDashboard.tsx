import React, { useMemo, useState } from 'react';
import {
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  FilePlus2,
  FolderPlus,
  Layers,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useLMS } from '../store/LMSContext';
import { CourseStatus, User } from '../types/lms';
import { BrandMark } from './BrandMark';
import { formatMinutes, getEnrollmentStats, getInitials } from '../utils/formatters';

type AdminTab =
  | 'cohorts'
  | 'progress'
  | 'quizzes'
  | 'courses'
  | 'study-material'
  | 'additional-material'
  | 'certificates'
  | 'faqs'
  | 'enroll'
  | 'directory';

export const AdminDashboard: React.FC = () => {
  const {
    state,
    currentUser,
    signOut,
    navigate,
    updateCourseStatus,
    attachStudyMaterial,
    attachAdditionalMaterial,
    issueCertificateManually,
    uploadCertificateTemplate,
    answerFAQ,
    adminEnrollStudent,
  } = useLMS();

  const [activeTab, setActiveTab] = useState<AdminTab>('cohorts');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Filters & Student slide-over drawer
  const [progressFilter, setProgressFilter] = useState('');
  const [progressModuleFilter, setProgressModuleFilter] = useState('all');
  const [directorySearch, setDirectorySearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);

  // Upload Study Material state
  const [smModuleId, setSmModuleId] = useState(state.modules[0]?.id || '');
  const smModule = state.modules.find((m) => m.id === smModuleId) || state.modules[0];
  const [smChapterId, setSmChapterId] = useState(smModule?.chapters[0]?.id || '');
  const [smTitle, setSmTitle] = useState('');
  const [smType, setSmType] = useState<'Document' | 'Code Lab' | 'External Link'>('Document');
  const [smSectionHeading, setSmSectionHeading] = useState('');
  const [smContent, setSmContent] = useState('');
  const [smFeedback, setSmFeedback] = useState('');

  // Upload Additional Material state
  const [amModuleId, setAmModuleId] = useState(state.modules[0]?.id || '');
  const [amTitle, setAmTitle] = useState('');
  const [amType, setAmType] = useState<'Cheat Sheet' | 'Code Lab' | 'Reference PDF'>(
    'Cheat Sheet'
  );
  const [amContent, setAmContent] = useState('');
  const [amFeedback, setAmFeedback] = useState('');

  // Certificates & Template state
  const learners = useMemo(
    () => state.users.filter((u) => u.role === 'learner'),
    [state.users]
  );
  const [certUserId, setCertUserId] = useState(learners[0]?.id || '');
  const [certModuleId, setCertModuleId] = useState(state.modules[0]?.id || '');
  const [certTemplateName, setCertTemplateName] = useState(
    state.certificateTemplates[0]?.name || ''
  );
  const [certNote, setCertNote] = useState('');
  const [certFeedback, setCertFeedback] = useState('');

  const [tplName, setTplName] = useState('');
  const [tplIssuer, setTplIssuer] = useState('Director of Engineering Curriculum');
  const [tplSeal, setTplSeal] = useState('IG-AUTH-2026-B');
  const [tplFeedback, setTplFeedback] = useState('');

  // FAQ drafts
  const [faqDrafts, setFaqDrafts] = useState<Record<string, string>>({});

  // Enroll Student state
  const [enrollName, setEnrollName] = useState('');
  const [enrollEmail, setEnrollEmail] = useState('');
  const [enrollModuleId, setEnrollModuleId] = useState(state.modules[0]?.id || '');
  const [enrollCohortId, setEnrollCohortId] = useState(state.cohorts[0]?.id || '');
  const [enrollResult, setEnrollResult] = useState<{ ok: boolean; message: string } | null>(
    null
  );

  const navGroups: {
    group: string;
    items: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }[];
  }[] = [
    {
      group: 'Operations',
      items: [
        { id: 'cohorts', label: 'Cohort Overview', icon: Layers },
        { id: 'progress', label: 'Learner Progress', icon: UserCheck },
        { id: 'quizzes', label: 'Quiz Analytics', icon: BarChart3 },
        { id: 'courses', label: 'Course Status', icon: BookOpen },
      ],
    },
    {
      group: 'Content & Credentials',
      items: [
        { id: 'study-material', label: 'Upload Study Material', icon: FilePlus2 },
        { id: 'additional-material', label: 'Additional Materials', icon: FolderPlus },
        { id: 'certificates', label: 'Certificates & Templates', icon: Award },
      ],
    },
    {
      group: 'Students & Support',
      items: [
        { id: 'faqs', label: 'FAQ Management', icon: MessageSquare },
        { id: 'enroll', label: 'Enroll Students', icon: UserPlus },
        { id: 'directory', label: 'Browse Students', icon: Users },
      ],
    },
  ];

  // Computed analytics
  const cohortSummaries = useMemo(() => {
    return state.cohorts.map((cohort) => {
      const cohortEnrollments = state.enrollments.filter((e) => e.cohortId === cohort.id);
      const uniqueStudents = new Set(cohortEnrollments.map((e) => e.userId)).size;
      const ratios = cohortEnrollments.map((e) => {
        const mod = state.modules.find((m) => m.id === e.moduleId);
        return mod ? getEnrollmentStats(mod, e).progressPercent : 0;
      });
      const avgCompletion =
        ratios.length > 0
          ? Math.round(ratios.reduce((a, b) => a + b, 0) / ratios.length)
          : 0;
      return { ...cohort, enrolledCount: uniqueStudents, avgCompletion };
    });
  }, [state.cohorts, state.enrollments, state.modules]);

  const progressRows = useMemo(() => {
    return state.enrollments
      .map((enr) => {
        const student = state.users.find((u) => u.id === enr.userId);
        const mod = state.modules.find((m) => m.id === enr.moduleId);
        if (!student || !mod) return null;
        const stats = getEnrollmentStats(mod, enr);
        return { enr, student, mod, stats };
      })
      .filter(Boolean)
      .filter((row) => {
        if (!row) return false;
        if (progressModuleFilter !== 'all' && row.mod.id !== progressModuleFilter) {
          return false;
        }
        if (progressFilter.trim()) {
          const q = progressFilter.toLowerCase();
          return (
            row.student.name.toLowerCase().includes(q) ||
            row.student.email.toLowerCase().includes(q) ||
            row.mod.title.toLowerCase().includes(q)
          );
        }
        return true;
      }) as {
      enr: (typeof state.enrollments)[number];
      student: User;
      mod: (typeof state.modules)[number];
      stats: ReturnType<typeof getEnrollmentStats>;
    }[];
  }, [state.enrollments, state.users, state.modules, progressFilter, progressModuleFilter]);

  const quizModuleStats = useMemo(() => {
    return state.modules.map((mod) => {
      const attempts = state.quizAttempts.filter((qa) => qa.moduleId === mod.id);
      const avgScore =
        attempts.length > 0
          ? Math.round(attempts.reduce((a, b) => a + b.scorePercent, 0) / attempts.length)
          : 0;
      const passRate =
        attempts.length > 0
          ? Math.round(
              (attempts.filter((a) => a.passed).length / attempts.length) * 100
            )
          : 0;
      return { mod, attemptsCount: attempts.length, avgScore, passRate };
    });
  }, [state.modules, state.quizAttempts]);

  const filteredDirectory = useMemo(() => {
    const q = directorySearch.trim().toLowerCase();
    return learners.filter(
      (s) =>
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.headline.toLowerCase().includes(q)
    );
  }, [learners, directorySearch]);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#09090B] text-white px-4 py-5 select-none">
      <div className="px-2 pb-5 border-b border-white/10 flex items-center justify-between">
        <div>
          <BrandMark theme="dark" />
          <div className="text-[11px] font-mono text-zinc-400 mt-1.5">Admin Console</div>
        </div>
        <button
          type="button"
          onClick={() => setMobileNavOpen(false)}
          className="lg:hidden p-1.5 text-zinc-400 hover:text-white"
          aria-label="Close admin menu"
        >
          <X className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>

      <nav className="mt-5 flex-1 overflow-y-auto space-y-5" aria-label="Admin navigation">
        {navGroups.map((grp) => (
          <div key={grp.group}>
            <div className="px-3 text-[11px] font-medium text-zinc-500 mb-1.5">
              {grp.group}
            </div>
            <div className="space-y-0.5">
              {grp.items.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileNavOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-[13px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-white text-[#09090B]'
                        : 'text-zinc-400 hover:text-white hover:bg-[#18181B]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="pt-4 border-t border-white/10 space-y-1.5">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="w-full px-3 py-2 rounded-[6px] border border-white/15 text-[12px] font-medium text-zinc-200 hover:bg-[#18181B] text-left transition-colors"
        >
          Preview Learner Workspace
        </button>
        <button
          type="button"
          onClick={signOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-[6px] text-[13px] text-zinc-400 hover:text-white hover:bg-[#18181B] transition-colors"
        >
          <LogOut className="w-4 h-4" strokeWidth={1.5} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-[264px] shrink-0 bg-[#09090B] sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="relative w-[272px] h-full z-10">{sidebarContent}</div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-[#E4E4E7] px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-2 rounded-[6px] border border-[#E4E4E7] text-[#09090B]"
              aria-label="Open admin menu"
            >
              <Menu className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <div>
              <div className="text-[14px] font-semibold text-[#09090B]">
                Intergrid IT Administration
              </div>
              <div className="text-[12px] text-[#71717A] hidden sm:block">
                Curriculum governance, student analytics, and credential issuance
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[13px] font-medium text-[#09090B]">
                {currentUser?.name}
              </div>
              <div className="text-[11px] font-mono text-[#71717A]">Administrator</div>
            </div>
            <div className="w-8 h-8 rounded-[6px] bg-[#09090B] text-white font-mono text-[12px] flex items-center justify-center">
              {getInitials(currentUser?.name || 'AD')}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 max-w-[1680px] w-full mx-auto space-y-6">
          {/* 1. COHORT OVERVIEW */}
          {activeTab === 'cohorts' && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display font-semibold text-[24px] text-[#09090B]">
                  Cohort Overview
                </h1>
                <p className="text-[14px] text-[#71717A] mt-1">
                  Active and upcoming engineering cohorts with live completion metrics.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {cohortSummaries.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white border border-[#E4E4E7] rounded-[8px] p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#71717A]">
                        <span>Start {c.startDate}</span>
                        <span className="px-2 py-0.5 rounded-[4px] border border-[#E4E4E7] font-sans font-medium text-[#09090B]">
                          {c.status}
                        </span>
                      </div>
                      <h2 className="mt-2 font-display font-semibold text-[17px] text-[#09090B]">
                        {c.name}
                      </h2>
                      <div className="text-[12px] text-[#71717A] mt-0.5">{c.track}</div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-[#E4E4E7] flex items-center justify-between font-mono tabular-nums">
                      <div>
                        <div className="text-[11px] font-sans text-[#71717A]">Enrolled</div>
                        <div className="text-[18px] font-semibold text-[#09090B]">
                          {c.enrolledCount}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] font-sans text-[#71717A]">
                          Avg Completion
                        </div>
                        <div className="text-[18px] font-semibold text-[#09090B]">
                          {c.avgCompletion}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-[#E4E4E7] rounded-[8px] overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E4E4E7] text-[12px] text-[#71717A]">
                      <th className="py-3 px-4 font-medium">Cohort Name</th>
                      <th className="py-3 px-4 font-medium">Track</th>
                      <th className="py-3 px-4 font-medium">Start Date</th>
                      <th className="py-3 px-4 font-medium text-right">Enrolled</th>
                      <th className="py-3 px-4 font-medium text-right">Avg Completion</th>
                      <th className="py-3 px-4 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E4E7] text-[13px]">
                    {cohortSummaries.map((c) => (
                      <tr key={c.id} className="hover:bg-[#FAFAFA]">
                        <td className="py-3 px-4 font-medium text-[#09090B]">{c.name}</td>
                        <td className="py-3 px-4 text-[#71717A]">{c.track}</td>
                        <td className="py-3 px-4 font-mono tabular-nums text-[#71717A]">
                          {c.startDate}
                        </td>
                        <td className="py-3 px-4 font-mono tabular-nums text-right text-[#09090B]">
                          {c.enrolledCount}
                        </td>
                        <td className="py-3 px-4 font-mono tabular-nums text-right text-[#09090B]">
                          {c.avgCompletion}%
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-[#09090B]">
                          {c.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. LEARNER PROGRESS TRACKER */}
          {activeTab === 'progress' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="font-display font-semibold text-[24px] text-[#09090B]">
                    Learner Progress Tracker
                  </h1>
                  <p className="text-[14px] text-[#71717A] mt-1">
                    Filterable directory tracking module completion, logged hours, and active status.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative">
                    <Search
                      className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2"
                      strokeWidth={1.5}
                    />
                    <input
                      type="search"
                      value={progressFilter}
                      onChange={(e) => setProgressFilter(e.target.value)}
                      placeholder="Filter student or module..."
                      className="pl-8 pr-3 py-2 rounded-[6px] border border-[#E4E4E7] bg-white text-[13px] focus:outline-none focus:border-[#09090B]"
                    />
                  </div>
                  <select
                    value={progressModuleFilter}
                    onChange={(e) => setProgressModuleFilter(e.target.value)}
                    className="px-3 py-2 rounded-[6px] border border-[#E4E4E7] bg-white text-[13px] focus:outline-none focus:border-[#09090B]"
                  >
                    <option value="all">All Modules</option>
                    {state.modules.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.code} · {m.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-white border border-[#E4E4E7] rounded-[8px] overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E4E4E7] text-[12px] text-[#71717A]">
                      <th className="py-3 px-4 font-medium">Learner</th>
                      <th className="py-3 px-4 font-medium">Module</th>
                      <th className="py-3 px-4 font-medium text-right">Completion</th>
                      <th className="py-3 px-4 font-medium text-right">Time Spent</th>
                      <th className="py-3 px-4 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E4E7] text-[13px]">
                    {progressRows.map(({ enr, student, mod, stats }) => (
                      <tr key={enr.id} className="hover:bg-[#FAFAFA]">
                        <td className="py-3 px-4">
                          <div className="font-medium text-[#09090B]">{student.name}</div>
                          <div className="text-[12px] text-[#71717A]">{student.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-[#09090B]">{mod.title}</div>
                          <div className="text-[11px] font-mono text-[#71717A]">
                            {mod.code} · {stats.completedCount}/{stats.totalChapters} chapters
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-[#09090B]">
                          {stats.progressPercent}%
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-[#71717A]">
                          {formatMinutes(enr.timeSpentMinutes)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-[4px] text-[11px] font-medium ${
                              stats.isCompleted
                                ? 'bg-[#09090B] text-white'
                                : 'border border-[#E4E4E7] text-[#09090B]'
                            }`}
                          >
                            {stats.isCompleted ? 'Completed' : 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. QUIZ RESULTS ANALYTICS */}
          {activeTab === 'quizzes' && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display font-semibold text-[24px] text-[#09090B]">
                  Quiz Results Analytics
                </h1>
                <p className="text-[14px] text-[#71717A] mt-1">
                  Module pass rates, average scores, and individual learner assessment history.
                </p>
              </div>

              {/* Monochrome Bar Chart */}
              <div className="bg-white border border-[#E4E4E7] rounded-[8px] p-6">
                <div className="text-[14px] font-semibold text-[#09090B] mb-5">
                  Average Score & Pass Rate by Module
                </div>
                <div className="space-y-4">
                  {quizModuleStats.map((item) => (
                    <div key={item.mod.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="font-medium text-[#09090B]">
                          <span className="font-mono text-[#71717A] mr-2">
                            {item.mod.code}
                          </span>
                          {item.mod.title}
                        </span>
                        <span className="font-mono tabular-nums text-[12px] text-[#71717A]">
                          {item.attemptsCount} attempts · Avg {item.avgScore}% · Pass{' '}
                          {item.passRate}%
                        </span>
                      </div>
                      <div className="w-full h-3 rounded-[4px] bg-[#F4F4F5] overflow-hidden flex">
                        <div
                          className="h-full bg-[#09090B] transition-all"
                          style={{ width: `${item.avgScore}%` }}
                          title={`Average Score: ${item.avgScore}%`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-[#E4E4E7] rounded-[8px] overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E4E4E7] text-[12px] text-[#71717A]">
                      <th className="py-3 px-4 font-medium">Student</th>
                      <th className="py-3 px-4 font-medium">Module</th>
                      <th className="py-3 px-4 font-medium text-right">Score</th>
                      <th className="py-3 px-4 font-medium text-right">Outcome</th>
                      <th className="py-3 px-4 font-medium text-right">Attempted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E4E7] text-[13px]">
                    {state.quizAttempts.map((qa) => {
                      const student = state.users.find((u) => u.id === qa.userId);
                      const mod = state.modules.find((m) => m.id === qa.moduleId);
                      return (
                        <tr key={qa.id} className="hover:bg-[#FAFAFA]">
                          <td className="py-3 px-4 font-medium text-[#09090B]">
                            {student?.name || 'Unknown'}
                          </td>
                          <td className="py-3 px-4 text-[#71717A]">
                            {mod?.code} · {mod?.title}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-[#09090B]">
                            {qa.scorePercent}% ({qa.correctCount}/{qa.totalCount})
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-[4px] text-[11px] font-medium ${
                                qa.passed
                                  ? 'bg-[#09090B] text-white'
                                  : 'border border-[#E4E4E7] text-[#71717A]'
                              }`}
                            >
                              {qa.passed ? 'Passed' : 'Did Not Pass'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums text-[#71717A]">
                            {qa.attemptedAt.slice(0, 10)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. COURSE STATUS VIEW */}
          {activeTab === 'courses' && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display font-semibold text-[24px] text-[#09090B]">
                  Course Status View
                </h1>
                <p className="text-[14px] text-[#71717A] mt-1">
                  Manage module publication lifecycle (Published, Draft, Archived) and track enrollment ratios.
                </p>
              </div>

              <div className="bg-white border border-[#E4E4E7] rounded-[8px] overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E4E4E7] text-[12px] text-[#71717A]">
                      <th className="py-3 px-4 font-medium">Module</th>
                      <th className="py-3 px-4 font-medium">Category</th>
                      <th className="py-3 px-4 font-medium text-right">Enrolled</th>
                      <th className="py-3 px-4 font-medium text-right">Completion Ratio</th>
                      <th className="py-3 px-4 font-medium text-right">Lifecycle Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E4E7] text-[13px]">
                    {state.modules.map((mod) => {
                      const enrs = state.enrollments.filter((e) => e.moduleId === mod.id);
                      const completedCount = enrs.filter(
                        (e) => getEnrollmentStats(mod, e).isCompleted
                      ).length;
                      const ratio =
                        enrs.length > 0
                          ? Math.round((completedCount / enrs.length) * 100)
                          : 0;
                      return (
                        <tr key={mod.id} className="hover:bg-[#FAFAFA]">
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-[#09090B]">{mod.title}</div>
                            <div className="text-[11px] font-mono text-[#71717A]">
                              {mod.code} · {mod.chapters.length} chapters
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-[#71717A]">{mod.category}</td>
                          <td className="py-3.5 px-4 text-right font-mono tabular-nums text-[#09090B]">
                            {enrs.length}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono tabular-nums text-[#09090B]">
                            {ratio}%
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <select
                              value={mod.status}
                              onChange={(e) =>
                                updateCourseStatus(mod.id, e.target.value as CourseStatus)
                              }
                              aria-label={`Status for ${mod.title}`}
                              className="px-2.5 py-1.5 rounded-[6px] border border-[#E4E4E7] bg-white text-[12px] font-medium text-[#09090B] focus:outline-none focus:border-[#09090B]"
                            >
                              <option value="Published">Published</option>
                              <option value="Draft">Draft</option>
                              <option value="Archived">Archived</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. UPLOAD STUDY MATERIAL */}
          {activeTab === 'study-material' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h1 className="font-display font-semibold text-[24px] text-[#09090B]">
                  Upload Study Material
                </h1>
                <p className="text-[14px] text-[#71717A] mt-1">
                  Publish core lesson sections and downloadable study documents directly into any chapter.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const targetChapter =
                    smModule?.chapters.find((c) => c.id === smChapterId)?.id ||
                    smModule?.chapters[0]?.id ||
                    '';
                  if (!smModule || !targetChapter) return;
                  attachStudyMaterial(
                    smModule.id,
                    targetChapter,
                    {
                      title: smTitle.trim(),
                      type: smType,
                      sizeLabel: `${Math.max(4, Math.round(smContent.length / 40))} KB · ${smType}`,
                      urlOrContent: smContent.trim(),
                    },
                    smSectionHeading.trim()
                      ? { heading: smSectionHeading.trim(), body: smContent.trim() }
                      : undefined
                  );
                  setSmTitle('');
                  setSmSectionHeading('');
                  setSmContent('');
                  setSmFeedback('Study material published to chapter.');
                  window.setTimeout(() => setSmFeedback(''), 3500);
                }}
                className="bg-white border border-[#E4E4E7] rounded-[8px] p-6 space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-medium text-[#09090B] mb-1.5">
                      Target Module
                    </label>
                    <select
                      value={smModuleId}
                      onChange={(e) => {
                        const newModId = e.target.value;
                        setSmModuleId(newModId);
                        const found = state.modules.find((m) => m.id === newModId);
                        setSmChapterId(found?.chapters[0]?.id || '');
                      }}
                      className="w-full px-3 py-2 rounded-[6px] border border-[#E4E4E7] bg-white text-[13px]"
                    >
                      {state.modules.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.code} · {m.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#09090B] mb-1.5">
                      Target Chapter
                    </label>
                    <select
                      value={smChapterId}
                      onChange={(e) => setSmChapterId(e.target.value)}
                      className="w-full px-3 py-2 rounded-[6px] border border-[#E4E4E7] bg-white text-[13px]"
                    >
                      {smModule?.chapters.map((ch) => (
                        <option key={ch.id} value={ch.id}>
                          0{ch.order}. {ch.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-medium text-[#09090B] mb-1.5">
                      Resource Title
                    </label>
                    <input
                      type="text"
                      required
                      value={smTitle}
                      onChange={(e) => setSmTitle(e.target.value)}
                      placeholder="e.g., eBPF Packet Flow Specification"
                      className="w-full px-3 py-2 rounded-[6px] border border-[#E4E4E7] bg-white text-[13px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#09090B] mb-1.5">
                      Material Type
                    </label>
                    <select
                      value={smType}
                      onChange={(e) =>
                        setSmType(
                          e.target.value as 'Document' | 'Code Lab' | 'External Link'
                        )
                      }
                      className="w-full px-3 py-2 rounded-[6px] border border-[#E4E4E7] bg-white text-[13px]"
                    >
                      <option value="Document">Document</option>
                      <option value="Code Lab">Code Lab</option>
                      <option value="External Link">External Link</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#09090B] mb-1.5">
                    Optional Lesson Section Heading (Appends directly to chapter reading)
                  </label>
                  <input
                    type="text"
                    value={smSectionHeading}
                    onChange={(e) => setSmSectionHeading(e.target.value)}
                    placeholder="e.g., Production Verification Checklist"
                    className="w-full px-3 py-2 rounded-[6px] border border-[#E4E4E7] bg-white text-[13px]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#09090B] mb-1.5">
                    Lesson Text / Document Content / URL
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={smContent}
                    onChange={(e) => setSmContent(e.target.value)}
                    placeholder="Paste technical guide content, lab instructions, or reference URL..."
                    className="w-full px-3 py-2 rounded-[6px] border border-[#E4E4E7] bg-white text-[13px] font-mono"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[13px] font-medium text-[#09090B]">
                    {smFeedback}
                  </span>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-[6px] bg-[#09090B] hover:bg-[#18181B] text-white text-[13px] font-medium"
                  >
                    Publish Study Material
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 6. UPLOAD ADDITIONAL MATERIALS */}
          {activeTab === 'additional-material' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h1 className="font-display font-semibold text-[24px] text-[#09090B]">
                  Upload Additional Materials
                </h1>
                <p className="text-[14px] text-[#71717A] mt-1">
                  Attach supplementary cheat sheets, lab files, and reference PDFs to a module.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  attachAdditionalMaterial(amModuleId, {
                    title: amTitle.trim(),
                    type: amType,
                    sizeLabel: `${Math.max(8, Math.round(amContent.length / 30))} KB · ${amType}`,
                    urlOrContent: amContent.trim(),
                  });
                  setAmTitle('');
                  setAmContent('');
                  setAmFeedback('Supplementary resource attached to module.');
                  window.setTimeout(() => setAmFeedback(''), 3500);
                }}
                className="bg-white border border-[#E4E4E7] rounded-[8px] p-6 space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-medium text-[#09090B] mb-1.5">
                      Module
                    </label>
                    <select
                      value={amModuleId}
                      onChange={(e) => setAmModuleId(e.target.value)}
                      className="w-full px-3 py-2 rounded-[6px] border border-[#E4E4E7] bg-white text-[13px]"
                    >
                      {state.modules.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.code} · {m.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#09090B] mb-1.5">
                      Resource Format
                    </label>
                    <select
                      value={amType}
                      onChange={(e) =>
                        setAmType(
                          e.target.value as 'Cheat Sheet' | 'Code Lab' | 'Reference PDF'
                        )
                      }
                      className="w-full px-3 py-2 rounded-[6px] border border-[#E4E4E7] bg-white text-[13px]"
                    >
                      <option value="Cheat Sheet">Cheat Sheet</option>
                      <option value="Code Lab">Code Lab</option>
                      <option value="Reference PDF">Reference PDF</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#09090B] mb-1.5">
                    File / Resource Name
                  </label>
                  <input
                    type="text"
                    required
                    value={amTitle}
                    onChange={(e) => setAmTitle(e.target.value)}
                    placeholder="e.g., Zero-Trust Envoy Sidecar Cheat Sheet"
                    className="w-full px-3 py-2 rounded-[6px] border border-[#E4E4E7] bg-white text-[13px]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#09090B] mb-1.5">
                    Resource Payload / Spec Content
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={amContent}
                    onChange={(e) => setAmContent(e.target.value)}
                    placeholder="Enter cheat sheet commands, lab manifest, or reference notes..."
                    className="w-full px-3 py-2 rounded-[6px] border border-[#E4E4E7] bg-white text-[13px] font-mono"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[13px] font-medium text-[#09090B]">
                    {amFeedback}
                  </span>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-[6px] bg-[#09090B] hover:bg-[#18181B] text-white text-[13px] font-medium"
                  >
                    Attach Additional Material
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 7. UPLOAD / ISSUE CERTIFICATE */}
          {activeTab === 'certificates' && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display font-semibold text-[24px] text-[#09090B]">
                  Certificates & Templates
                </h1>
                <p className="text-[14px] text-[#71717A] mt-1">
                  Upload custom certificate templates or manually issue Certificates of Attendance.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Manual Certificate Issuance */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const cert = issueCertificateManually({
                      userId: certUserId,
                      moduleId: certModuleId,
                      templateName: certTemplateName,
                      verificationNote: certNote.trim() || undefined,
                    });
                    if (cert) {
                      setCertNote('');
                      setCertFeedback(`Issued ${cert.credentialId} to ${cert.userName}.`);
                      window.setTimeout(() => setCertFeedback(''), 4000);
                    }
                  }}
                  className="bg-white border border-[#E4E4E7] rounded-[8px] p-6 space-y-4"
                >
                  <h2 className="font-display font-semibold text-[16px] text-[#09090B]">
                    Issue Certificate to Learner
                  </h2>

                  <div>
                    <label className="block text-[12px] font-medium text-[#09090B] mb-1">
                      Learner
                    </label>
                    <select
                      value={certUserId}
                      onChange={(e) => setCertUserId(e.target.value)}
                      className="w-full px-3 py-2 rounded-[6px] border border-[#E4E4E7] bg-white text-[13px]"
                    >
                      {learners.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#09090B] mb-1">
                      Module
                    </label>
                    <select
                      value={certModuleId}
                      onChange={(e) => setCertModuleId(e.target.value)}
                      className="w-full px-3 py-2 rounded-[6px] border border-[#E4E4E7] bg-white text-[13px]"
                    >
                      {state.modules.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.code} · {m.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#09090B] mb-1">
                      Template
                    </label>
                    <select
                      value={certTemplateName}
                      onChange={(e) => setCertTemplateName(e.target.value)}
                      className="w-full px-3 py-2 rounded-[6px] border border-[#E4E4E7] bg-white text-[13px]"
                    >
                      {state.certificateTemplates.map((t) => (
                        <option key={t.id} value={t.name}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#09090B] mb-1">
                      Endorsement Note (optional)
                    </label>
                    <input
                      type="text"
                      value={certNote}
                      onChange={(e) => setCertNote(e.target.value)}
                      placeholder="e.g., Cohort Distinction — Live Lab Defense"
                      className="w-full px-3 py-2 rounded-[6px] border border-[#E4E4E7] bg-white text-[13px]"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[12px] font-medium text-[#09090B]">
                      {certFeedback}
                    </span>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-[6px] bg-[#09090B] hover:bg-[#18181B] text-white text-[13px] font-medium"
                    >
                      Issue Certificate
                    </button>
                  </div>
                </form>

                {/* Upload Certificate Template */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!tplName.trim()) return;
                    uploadCertificateTemplate({
                      name: tplName.trim(),
                      issuerTitle: tplIssuer.trim(),
                      sealCode: tplSeal.trim(),
                    });
                    setCertTemplateName(tplName.trim());
                    setTplName('');
                    setTplFeedback('Certificate template saved.');
                    window.setTimeout(() => setTplFeedback(''), 3500);
                  }}
                  className="bg-white border border-[#E4E4E7] rounded-[8px] p-6 space-y-4"
                >
                  <h2 className="font-display font-semibold text-[16px] text-[#09090B]">
                    Upload Certificate Template
                  </h2>

                  <div>
                    <label className="block text-[12px] font-medium text-[#09090B] mb-1">
                      Template Name
                    </label>
                    <input
                      type="text"
                      required
                      value={tplName}
                      onChange={(e) => setTplName(e.target.value)}
                      placeholder="e.g., Intergrid Security Fellowship Seal"
                      className="w-full px-3 py-2 rounded-[6px] border border-[#E4E4E7] bg-white text-[13px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#09090B] mb-1">
                      Issuer Title
                    </label>
                    <input
                      type="text"
                      required
                      value={tplIssuer}
                      onChange={(e) => setTplIssuer(e.target.value)}
                      className="w-full px-3 py-2 rounded-[6px] border border-[#E4E4E7] bg-white text-[13px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#09090B] mb-1">
                      Verification Seal Code
                    </label>
                    <input
                      type="text"
                      required
                      value={tplSeal}
                      onChange={(e) => setTplSeal(e.target.value)}
                      className="w-full px-3 py-2 rounded-[6px] border border-[#E4E4E7] bg-white text-[13px] font-mono"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[12px] font-medium text-[#09090B]">
                      {tplFeedback}
                    </span>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-[6px] border border-[#09090B] text-[#09090B] hover:bg-[#09090B] hover:text-white text-[13px] font-medium transition-colors"
                    >
                      Save Template
                    </button>
                  </div>
                </form>
              </div>

              {/* Issued Certificates Table */}
              <div className="bg-white border border-[#E4E4E7] rounded-[8px] overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E4E4E7] text-[12px] text-[#71717A]">
                      <th className="py-3 px-4 font-medium">Credential ID</th>
                      <th className="py-3 px-4 font-medium">Learner</th>
                      <th className="py-3 px-4 font-medium">Module</th>
                      <th className="py-3 px-4 font-medium">Template</th>
                      <th className="py-3 px-4 font-medium text-right">Issued</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E4E7] text-[13px]">
                    {state.certificates.map((c) => (
                      <tr key={c.id} className="hover:bg-[#FAFAFA]">
                        <td className="py-3 px-4 font-mono text-[#09090B]">
                          {c.credentialId}
                        </td>
                        <td className="py-3 px-4 font-medium text-[#09090B]">
                          {c.userName}
                        </td>
                        <td className="py-3 px-4 text-[#71717A]">
                          {c.moduleCode} · {c.moduleTitle}
                        </td>
                        <td className="py-3 px-4 text-[#71717A]">{c.templateName}</td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-[#71717A]">
                          {c.issuedAt}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 8. FAQ MANAGEMENT & ANSWERING */}
          {activeTab === 'faqs' && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display font-semibold text-[24px] text-[#09090B]">
                  FAQ Management & Answering
                </h1>
                <p className="text-[14px] text-[#71717A] mt-1">
                  Review learner-submitted questions, write official answers, and publish to the platform FAQ.
                </p>
              </div>

              <div className="space-y-4">
                {state.faqs.map((faq) => {
                  const draftAnswer =
                    faqDrafts[faq.id] !== undefined ? faqDrafts[faq.id] : faq.answer;
                  return (
                    <div
                      key={faq.id}
                      className="bg-white border border-[#E4E4E7] rounded-[8px] p-6 space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-[12px] font-mono text-[#71717A]">
                          {faq.authorName} · {faq.moduleTitle || 'General'} · Asked{' '}
                          {faq.createdAt}
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-[4px] text-[11px] font-medium ${
                            faq.status === 'Published'
                              ? 'bg-[#09090B] text-white'
                              : 'border border-[#E4E4E7] text-[#09090B]'
                          }`}
                        >
                          {faq.status}
                        </span>
                      </div>

                      <div className="font-display font-semibold text-[16px] text-[#09090B]">
                        {faq.question}
                      </div>

                      <textarea
                        rows={3}
                        value={draftAnswer}
                        onChange={(e) =>
                          setFaqDrafts((prev) => ({ ...prev, [faq.id]: e.target.value }))
                        }
                        placeholder="Write official answer for learners..."
                        className="w-full px-3.5 py-2.5 rounded-[6px] border border-[#E4E4E7] bg-[#FAFAFA] focus:bg-white text-[13px] focus:outline-none focus:border-[#09090B]"
                      />

                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          type="button"
                          onClick={() => answerFAQ(faq.id, draftAnswer, false)}
                          className="px-3.5 py-2 rounded-[6px] border border-[#E4E4E7] text-[12px] font-medium text-[#09090B] hover:border-[#09090B]"
                        >
                          Save Draft
                        </button>
                        <button
                          type="button"
                          onClick={() => answerFAQ(faq.id, draftAnswer, true)}
                          className="px-4 py-2 rounded-[6px] bg-[#09090B] hover:bg-[#18181B] text-white text-[12px] font-medium"
                        >
                          Publish Answer
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 9. ENROLL STUDENTS */}
          {activeTab === 'enroll' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h1 className="font-display font-semibold text-[24px] text-[#09090B]">
                  Enroll Students
                </h1>
                <p className="text-[14px] text-[#71717A] mt-1">
                  Enroll existing or new learners by email into a specific cohort and engineering module.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const res = adminEnrollStudent({
                    name: enrollName,
                    email: enrollEmail,
                    moduleId: enrollModuleId,
                    cohortId: enrollCohortId,
                  });
                  setEnrollResult(res);
                  if (res.ok) {
                    setEnrollName('');
                    setEnrollEmail('');
                  }
                }}
                className="bg-white border border-[#E4E4E7] rounded-[8px] p-6 space-y-4"
              >
                <div>
                  <label className="block text-[12px] font-medium text-[#09090B] mb-1.5">
                    Student Email
                  </label>
                  <input
                    type="email"
                    required
                    value={enrollEmail}
                    onChange={(e) => setEnrollEmail(e.target.value)}
                    placeholder="engineer@company.com"
                    className="w-full px-3.5 py-2.5 rounded-[6px] border border-[#E4E4E7] bg-white text-[13px] focus:outline-none focus:border-[#09090B]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#09090B] mb-1.5">
                    Full Name (used if creating new learner profile)
                  </label>
                  <input
                    type="text"
                    value={enrollName}
                    onChange={(e) => setEnrollName(e.target.value)}
                    placeholder="Jordan Vance"
                    className="w-full px-3.5 py-2.5 rounded-[6px] border border-[#E4E4E7] bg-white text-[13px] focus:outline-none focus:border-[#09090B]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-medium text-[#09090B] mb-1.5">
                      Cohort
                    </label>
                    <select
                      value={enrollCohortId}
                      onChange={(e) => setEnrollCohortId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-[6px] border border-[#E4E4E7] bg-white text-[13px]"
                    >
                      {state.cohorts.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#09090B] mb-1.5">
                      Module
                    </label>
                    <select
                      value={enrollModuleId}
                      onChange={(e) => setEnrollModuleId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-[6px] border border-[#E4E4E7] bg-white text-[13px]"
                    >
                      {state.modules.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.code} · {m.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {enrollResult && (
                  <div
                    className={`p-3 rounded-[6px] border text-[13px] ${
                      enrollResult.ok
                        ? 'bg-[#09090B] text-white border-[#09090B]'
                        : 'bg-[#FAFAFA] text-[#09090B] border-[#09090B]'
                    }`}
                  >
                    {enrollResult.message}
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-[6px] bg-[#09090B] hover:bg-[#18181B] text-white text-[13px] font-medium"
                  >
                    Enroll Student
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 10. BROWSE STUDENTS FOR INFO */}
          {activeTab === 'directory' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h1 className="font-display font-semibold text-[24px] text-[#09090B]">
                    Student Directory
                  </h1>
                  <p className="text-[14px] text-[#71717A] mt-1">
                    Click any student to inspect enrolled modules, quiz history, notes count, and certificates.
                  </p>
                </div>

                <div className="relative w-full sm:w-[280px]">
                  <Search
                    className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2"
                    strokeWidth={1.5}
                  />
                  <input
                    type="search"
                    value={directorySearch}
                    onChange={(e) => setDirectorySearch(e.target.value)}
                    placeholder="Search students..."
                    className="w-full pl-9 pr-3 py-2 rounded-[6px] border border-[#E4E4E7] bg-white text-[13px] focus:outline-none focus:border-[#09090B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDirectory.map((student) => {
                  const enrCount = state.enrollments.filter(
                    (e) => e.userId === student.id
                  ).length;
                  const certCount = state.certificates.filter(
                    (c) => c.userId === student.id
                  ).length;
                  return (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => setSelectedStudent(student)}
                      className="text-left bg-white border border-[#E4E4E7] hover:border-[#09090B] rounded-[8px] p-5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[6px] bg-[#09090B] text-white font-mono text-[13px] flex items-center justify-center shrink-0">
                          {getInitials(student.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-[14px] text-[#09090B] truncate">
                            {student.name}
                          </div>
                          <div className="text-[12px] text-[#71717A] truncate">
                            {student.email}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-[#E4E4E7] flex items-center justify-between text-[12px] font-mono tabular-nums text-[#71717A]">
                        <span>{enrCount} modules</span>
                        <span>{certCount} certs</span>
                        <span>{student.streakDays}d streak</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Student Info Slide-Over Drawer */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-[480px] bg-white h-full border-l border-[#E4E4E7] flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-[#E4E4E7] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[6px] bg-[#09090B] text-white font-mono text-[13px] flex items-center justify-center">
                  {getInitials(selectedStudent.name)}
                </div>
                <div>
                  <div className="font-display font-semibold text-[16px] text-[#09090B]">
                    {selectedStudent.name}
                  </div>
                  <div className="text-[12px] text-[#71717A]">
                    {selectedStudent.email}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="p-2 rounded-[6px] text-[#71717A] hover:text-[#09090B] hover:bg-[#F4F4F5]"
                aria-label="Close student drawer"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div>
                <div className="text-[11px] font-mono text-[#71717A]">Profile</div>
                <div className="text-[13px] text-[#09090B] mt-1">
                  {selectedStudent.headline}
                </div>
                <div className="mt-2 flex items-center gap-4 text-[12px] font-mono text-[#71717A] tabular-nums">
                  <span>Joined {selectedStudent.joinedAt}</span>
                  <span>·</span>
                  <span>
                    Notes:{' '}
                    {state.notes.filter((n) => n.userId === selectedStudent.id).length}
                  </span>
                  <span>·</span>
                  <span>{selectedStudent.streakDays}d streak</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E4E4E7]">
                <h3 className="text-[13px] font-semibold text-[#09090B] mb-2.5">
                  Enrolled Modules
                </h3>
                <div className="space-y-2">
                  {state.enrollments
                    .filter((e) => e.userId === selectedStudent.id)
                    .map((enr) => {
                      const mod = state.modules.find((m) => m.id === enr.moduleId);
                      if (!mod) return null;
                      const stats = getEnrollmentStats(mod, enr);
                      return (
                        <div
                          key={enr.id}
                          className="p-3 rounded-[6px] border border-[#E4E4E7] bg-[#FAFAFA]"
                        >
                          <div className="flex items-center justify-between text-[13px]">
                            <span className="font-medium text-[#09090B]">{mod.title}</span>
                            <span className="font-mono tabular-nums font-semibold">
                              {stats.progressPercent}%
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-[#71717A] mt-1">
                            {stats.completedCount}/{stats.totalChapters} chapters ·{' '}
                            {formatMinutes(enr.timeSpentMinutes)} logged
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="pt-4 border-t border-[#E4E4E7]">
                <h3 className="text-[13px] font-semibold text-[#09090B] mb-2.5">
                  Quiz History
                </h3>
                {state.quizAttempts.filter((qa) => qa.userId === selectedStudent.id)
                  .length === 0 ? (
                  <div className="text-[12px] text-[#71717A]">No quiz attempts yet.</div>
                ) : (
                  <div className="space-y-2">
                    {state.quizAttempts
                      .filter((qa) => qa.userId === selectedStudent.id)
                      .map((qa) => {
                        const mod = state.modules.find((m) => m.id === qa.moduleId);
                        return (
                          <div
                            key={qa.id}
                            className="p-3 rounded-[6px] border border-[#E4E4E7] flex items-center justify-between text-[12px]"
                          >
                            <div>
                              <div className="font-medium text-[#09090B]">
                                {mod?.title}
                              </div>
                              <div className="font-mono text-[#71717A]">
                                {qa.attemptedAt.slice(0, 10)}
                              </div>
                            </div>
                            <div className="font-mono font-semibold text-[#09090B]">
                              {qa.scorePercent}% · {qa.passed ? 'Pass' : 'Fail'}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[#E4E4E7]">
                <h3 className="text-[13px] font-semibold text-[#09090B] mb-2.5">
                  Certificates Earned
                </h3>
                {state.certificates.filter((c) => c.userId === selectedStudent.id)
                  .length === 0 ? (
                  <div className="text-[12px] text-[#71717A]">
                    No certificates issued yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {state.certificates
                      .filter((c) => c.userId === selectedStudent.id)
                      .map((c) => (
                        <div
                          key={c.id}
                          className="p-3 rounded-[6px] border border-[#09090B] bg-[#09090B] text-white text-[12px]"
                        >
                          <div className="flex items-center gap-2 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                            <span>{c.moduleTitle}</span>
                          </div>
                          <div className="font-mono text-zinc-400 mt-1">
                            {c.credentialId} · Issued {c.issuedAt}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
