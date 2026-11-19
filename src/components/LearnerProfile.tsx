import React, { useMemo, useState } from 'react';
import { Award, CheckCircle2, Clock, Flame, ShieldCheck, Trophy } from 'lucide-react';
import { useLMS } from '../store/LMSContext';
import { Certificate } from '../types/lms';
import { formatMinutes, getInitials } from '../utils/formatters';
import { CertificateModal } from './CertificateModal';

export const LearnerProfile: React.FC = () => {
  const { state, currentUser, updateProfile } = useLMS();

  const [name, setName] = useState(currentUser?.name || '');
  const [headline, setHeadline] = useState(currentUser?.headline || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [weeklyGoalHours, setWeeklyGoalHours] = useState(
    currentUser?.weeklyGoalHours || 6
  );
  const [emailDigestEnabled, setEmailDigestEnabled] = useState(
    currentUser?.emailDigestEnabled ?? true
  );
  const [autoAdvanceChapters, setAutoAdvanceChapters] = useState(
    currentUser?.autoAdvanceChapters ?? true
  );
  const [newPassword, setNewPassword] = useState('');
  const [savedAck, setSavedAck] = useState(false);
  const [activeCert, setActiveCert] = useState<Certificate | null>(null);

  const stats = useMemo(() => {
    if (!currentUser) {
      return {
        totalMinutes: 0,
        chaptersCompleted: 0,
        completedModules: 0,
        passedQuizzes: 0,
        certificates: [] as Certificate[],
      };
    }
    const userEnrollments = state.enrollments.filter((e) => e.userId === currentUser.id);
    const totalMinutes = userEnrollments.reduce((acc, e) => acc + e.timeSpentMinutes, 0);
    const chaptersCompleted = userEnrollments.reduce(
      (acc, e) => acc + e.completedChapterIds.length,
      0
    );
    const completedModules = userEnrollments.filter((e) => {
      const mod = state.modules.find((m) => m.id === e.moduleId);
      return mod && mod.chapters.length > 0 && e.completedChapterIds.length >= mod.chapters.length;
    }).length;
    const passedQuizzes = state.quizAttempts.filter(
      (qa) => qa.userId === currentUser.id && qa.passed
    ).length;
    const certificates = state.certificates.filter((c) => c.userId === currentUser.id);

    return {
      totalMinutes,
      chaptersCompleted,
      completedModules,
      passedQuizzes,
      certificates,
    };
  }, [currentUser, state.enrollments, state.modules, state.quizAttempts, state.certificates]);

  const achievements = [
    {
      id: 'ach-first-mod',
      title: 'First Module Complete',
      criteria: 'Finish every chapter in an Intergrid IT module',
      earned: stats.completedModules >= 1,
    },
    {
      id: 'ach-streak',
      title: '7-Day Focus Streak',
      criteria: 'Maintain at least 7 consecutive days of study',
      earned: (currentUser?.streakDays || 0) >= 7,
    },
    {
      id: 'ach-quiz',
      title: 'Quiz Master',
      criteria: 'Pass a module Knowledge Check assessment',
      earned: stats.passedQuizzes >= 1,
    },
    {
      id: 'ach-notes',
      title: 'Systems Chronicler',
      criteria: 'Record private study notes across chapters',
      earned: state.notes.some((n) => n.userId === currentUser?.id && n.content.trim().length > 0),
    },
  ];

  const earnedCount = achievements.filter((a) => a.earned).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      headline,
      avatarUrl,
      weeklyGoalHours,
      emailDigestEnabled,
      autoAdvanceChapters,
      newPassword: newPassword.trim() || undefined,
    });
    setNewPassword('');
    setSavedAck(true);
    window.setTimeout(() => setSavedAck(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white border border-[#E4E4E7] rounded-[8px] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {currentUser?.avatarUrl ? (
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-[8px] object-cover border border-[#E4E4E7] shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-[8px] bg-[#09090B] text-white font-mono text-[18px] font-semibold flex items-center justify-center shrink-0">
              {getInitials(currentUser?.name || 'IG')}
            </div>
          )}
          <div>
            <h1 className="font-display font-semibold text-[22px] text-[#09090B]">
              {currentUser?.name}
            </h1>
            <p className="text-[13px] text-[#71717A] mt-0.5">{currentUser?.headline}</p>
            <div className="text-[12px] font-mono text-[#71717A] mt-1">
              {currentUser?.email} · Joined {currentUser?.joinedAt}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E4E4E7] rounded-[8px] p-5">
          <div className="flex items-center justify-between text-[12px] text-[#71717A]">
            <span>Learning Streak</span>
            <Flame className="w-4 h-4 text-[#09090B]" strokeWidth={1.5} />
          </div>
          <div className="mt-2 font-display font-semibold text-[24px] tabular-nums text-[#09090B]">
            {currentUser?.streakDays || 0} Days
          </div>
        </div>

        <div className="bg-white border border-[#E4E4E7] rounded-[8px] p-5">
          <div className="flex items-center justify-between text-[12px] text-[#71717A]">
            <span>Total Learning Time</span>
            <Clock className="w-4 h-4 text-[#09090B]" strokeWidth={1.5} />
          </div>
          <div className="mt-2 font-display font-semibold text-[24px] tabular-nums text-[#09090B]">
            {formatMinutes(stats.totalMinutes)}
          </div>
        </div>

        <div className="bg-white border border-[#E4E4E7] rounded-[8px] p-5">
          <div className="flex items-center justify-between text-[12px] text-[#71717A]">
            <span>Chapters Completed</span>
            <CheckCircle2 className="w-4 h-4 text-[#09090B]" strokeWidth={1.5} />
          </div>
          <div className="mt-2 font-display font-semibold text-[24px] tabular-nums text-[#09090B]">
            {stats.chaptersCompleted}
          </div>
        </div>

        <div className="bg-white border border-[#E4E4E7] rounded-[8px] p-5">
          <div className="flex items-center justify-between text-[12px] text-[#71717A]">
            <span>Earned Achievements</span>
            <Trophy className="w-4 h-4 text-[#09090B]" strokeWidth={1.5} />
          </div>
          <div className="mt-2 font-display font-semibold text-[24px] tabular-nums text-[#09090B]">
            {earnedCount} / {achievements.length}
          </div>
        </div>
      </div>

      {/* Achievements & Certificates Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-6 bg-white border border-[#E4E4E7] rounded-[8px] p-6 space-y-4">
          <h2 className="font-display font-semibold text-[17px] text-[#09090B]">
            Achievements
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className={`p-4 rounded-[6px] border ${
                  ach.earned
                    ? 'bg-[#09090B] text-white border-[#09090B]'
                    : 'bg-[#FAFAFA] text-[#71717A] border-[#E4E4E7]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <ShieldCheck
                    className={`w-4 h-4 ${ach.earned ? 'text-white' : 'text-[#71717A]'}`}
                    strokeWidth={1.5}
                  />
                  <span className="text-[11px] font-mono">
                    {ach.earned ? 'Earned' : 'Locked'}
                  </span>
                </div>
                <div
                  className={`mt-2.5 text-[14px] font-semibold ${
                    ach.earned ? 'text-white' : 'text-[#09090B]'
                  }`}
                >
                  {ach.title}
                </div>
                <div
                  className={`mt-1 text-[12px] leading-snug ${
                    ach.earned ? 'text-zinc-300' : 'text-[#71717A]'
                  }`}
                >
                  {ach.criteria}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="lg:col-span-6 bg-white border border-[#E4E4E7] rounded-[8px] p-6 space-y-4">
          <h2 className="font-display font-semibold text-[17px] text-[#09090B]">
            Certificates of Attendance
          </h2>
          {stats.certificates.length === 0 ? (
            <div className="p-6 rounded-[6px] border border-[#E4E4E7] bg-[#FAFAFA] text-[13px] text-[#71717A]">
              Complete a module and pass its Knowledge Check to earn your first Certificate of Attendance.
            </div>
          ) : (
            <div className="space-y-3">
              {stats.certificates.map((cert) => (
                <button
                  key={cert.id}
                  type="button"
                  onClick={() => setActiveCert(cert)}
                  className="w-full text-left p-4 rounded-[6px] border border-[#E4E4E7] hover:border-[#09090B] bg-[#FAFAFA] flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Award className="w-5 h-5 text-[#09090B] shrink-0" strokeWidth={1.5} />
                    <div className="min-w-0">
                      <div className="text-[14px] font-semibold text-[#09090B] truncate">
                        {cert.moduleTitle}
                      </div>
                      <div className="text-[12px] font-mono text-[#71717A]">
                        {cert.credentialId} · {cert.issuedAt}
                      </div>
                    </div>
                  </div>
                  <span className="text-[12px] font-medium text-[#09090B] shrink-0">
                    View
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Profile Management Form */}
      <section className="bg-white border border-[#E4E4E7] rounded-[8px] p-6">
        <h2 className="font-display font-semibold text-[17px] text-[#09090B] mb-4">
          Profile & Preferences
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-[12px] font-medium text-[#09090B] mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[6px] border border-[#E4E4E7] bg-white text-[13px] focus:outline-none focus:border-[#09090B]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#09090B] mb-1.5">
              Headline / Role
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[6px] border border-[#E4E4E7] bg-white text-[13px] focus:outline-none focus:border-[#09090B]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#09090B] mb-1.5">
              Avatar Image URL
            </label>
            <input
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="/src/assets/images/..."
              className="w-full px-3.5 py-2.5 rounded-[6px] border border-[#E4E4E7] bg-white text-[13px] focus:outline-none focus:border-[#09090B]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#09090B] mb-1.5">
              Update Password (optional)
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
              className="w-full px-3.5 py-2.5 rounded-[6px] border border-[#E4E4E7] bg-white text-[13px] focus:outline-none focus:border-[#09090B]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#09090B] mb-1.5">
              Weekly Study Goal (Hours)
            </label>
            <input
              type="number"
              min={1}
              max={40}
              value={weeklyGoalHours}
              onChange={(e) => setWeeklyGoalHours(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-[6px] border border-[#E4E4E7] bg-white text-[13px] font-mono tabular-nums focus:outline-none focus:border-[#09090B]"
            />
          </div>

          <div className="flex flex-col justify-center gap-2.5 pt-2">
            <label className="inline-flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={emailDigestEnabled}
                onChange={(e) => setEmailDigestEnabled(e.target.checked)}
                className="w-4 h-4 accent-[#09090B]"
              />
              <span className="text-[13px] text-[#09090B]">
                Receive weekly progress & cohort digest
              </span>
            </label>

            <label className="inline-flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={autoAdvanceChapters}
                onChange={(e) => setAutoAdvanceChapters(e.target.checked)}
                className="w-4 h-4 accent-[#09090B]"
              />
              <span className="text-[13px] text-[#09090B]">
                Automatically advance to next chapter on completion
              </span>
            </label>
          </div>

          <div className="md:col-span-2 pt-3 border-t border-[#E4E4E7] flex items-center justify-between gap-4">
            <span className="text-[13px] font-medium text-[#09090B]">
              {savedAck ? 'Profile changes saved.' : ''}
            </span>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-[6px] bg-[#09090B] hover:bg-[#18181B] text-white text-[13px] font-medium transition-colors"
            >
              Save Profile Settings
            </button>
          </div>
        </form>
      </section>

      {activeCert && (
        <CertificateModal certificate={activeCert} onClose={() => setActiveCert(null)} />
      )}
    </div>
  );
};
