import { Enrollment, Module } from '../types/lms';

export function formatMinutes(totalMinutes: number): string {
  const mins = Math.max(0, Math.round(totalMinutes));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatMinutesLong(totalMinutes: number): string {
  const mins = Math.max(0, Math.round(totalMinutes));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} mins`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} mins`;
}

export function getModuleTotalMinutes(mod: Module): number {
  return mod.chapters.reduce((acc, ch) => acc + ch.durationMinutes, 0);
}

export function getEnrollmentStats(mod: Module, enrollment?: Enrollment) {
  const totalChapters = mod.chapters.length;
  const totalMinutes = getModuleTotalMinutes(mod);
  if (!enrollment) {
    return {
      completedCount: 0,
      totalChapters,
      progressPercent: 0,
      remainingMinutes: totalMinutes,
      totalMinutes,
      isCompleted: false,
    };
  }
  const completedSet = new Set(enrollment.completedChapterIds);
  const completedCount = mod.chapters.filter((ch) => completedSet.has(ch.id)).length;
  const completedMinutes = mod.chapters
    .filter((ch) => completedSet.has(ch.id))
    .reduce((acc, ch) => acc + ch.durationMinutes, 0);
  const remainingMinutes = Math.max(0, totalMinutes - completedMinutes);
  const progressPercent =
    totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 0;

  return {
    completedCount,
    totalChapters,
    progressPercent,
    remainingMinutes,
    totalMinutes,
    isCompleted: totalChapters > 0 && completedCount === totalChapters,
  };
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('');
}

export function triggerTextDownload(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
