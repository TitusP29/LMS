import React, { useEffect, useState } from 'react';
import { Award, BookOpen, CheckCircle2, Clock, Pause, Play } from 'lucide-react';
import { DEFAULT_AVATAR_URL } from '../data/seedData';

const PREVIEW_CHAPTERS = [
  {
    code: 'IG-101 · Chapter 03',
    title: 'Progressive Delivery & Automated Rollbacks',
    duration: '50m',
    progress: 68,
    done: false,
  },
  {
    code: 'IG-101 · Chapter 02',
    title: 'Container Scheduling & CNI Networking',
    duration: '45m',
    progress: 100,
    done: true,
  },
  {
    code: 'IG-302 · Chapter 01',
    title: 'Zero-Trust Identity & Mutual TLS',
    duration: '45m',
    progress: 100,
    done: true,
  },
];

export const GlassDashboardPreview: React.FC<{ onExploreClick: () => void }> = ({
  onExploreClick,
}) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(1428); // 23:48 live session
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setSecondsElapsed((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  const mins = Math.floor(secondsElapsed / 60);
  const secs = secondsElapsed % 60;
  const formattedTimer = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const active = PREVIEW_CHAPTERS[selectedIdx];
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (active.progress / 100) * circumference;

  return (
    <div className="glass-dark text-white rounded-[10px] p-5 shadow-2xl w-full max-w-[440px]">
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/14">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={DEFAULT_AVATAR_URL}
            alt="Maya Lin studying in Intergrid IT"
            referrerPolicy="no-referrer"
            className="w-9 h-9 rounded-[6px] object-cover border border-white/20 shrink-0"
          />
          <div className="min-w-0">
            <div className="text-[13px] font-medium text-white truncate">Maya Lin</div>
            <div className="text-[12px] text-zinc-400 truncate">
              Platform Reliability · 12-day streak
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-white/10 hover:bg-white/15 border border-white/14 text-[12px] font-mono tabular-nums transition-colors whitespace-nowrap shrink-0"
            aria-label={running ? 'Pause live chapter timer' : 'Resume live chapter timer'}
          >
            {running ? (
              <Pause className="w-3 h-3" strokeWidth={1.75} />
            ) : (
              <Play className="w-3 h-3" strokeWidth={1.75} />
            )}
            <span>{formattedTimer}</span>
          </button>
        </div>
      </div>

      <div className="py-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[11px] font-mono text-zinc-400 tracking-wide">
            {active.code}
          </div>
          <div className="text-[15px] font-display font-semibold text-white mt-0.5 leading-snug">
            {active.title}
          </div>
          <div className="flex items-center gap-2 text-[12px] text-zinc-400 mt-2 tabular-nums">
            <Clock className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
            <span>Est. {active.duration}</span>
            <span aria-hidden="true">·</span>
            <span>{active.done ? 'Completed' : 'Active Study'}</span>
          </div>
        </div>

        <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke="rgba(255,255,255,0.14)"
              strokeWidth="4"
              fill="none"
            />
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke="#FFFFFF"
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
              className="transition-all duration-300"
            />
          </svg>
          <span className="absolute text-[12px] font-mono font-medium tabular-nums text-white">
            {active.progress}%
          </span>
        </div>
      </div>

      <div className="space-y-1.5 pb-4 border-b border-white/14">
        {PREVIEW_CHAPTERS.map((item, idx) => {
          const isSelected = idx === selectedIdx;
          return (
            <button
              key={item.code}
              type="button"
              onClick={() => setSelectedIdx(idx)}
              className={`w-full text-left px-3 py-2 rounded-[6px] border transition-colors flex items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-white/12 border-white/25 text-white'
                  : 'bg-transparent border-transparent hover:bg-white/5 text-zinc-300'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {item.done ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" strokeWidth={1.5} />
                ) : (
                  <BookOpen className="w-3.5 h-3.5 text-zinc-400 shrink-0" strokeWidth={1.5} />
                )}
                <span className="text-[12px] truncate">{item.title}</span>
              </div>
              <span className="text-[11px] font-mono tabular-nums text-zinc-400 shrink-0">
                {item.duration}
              </span>
            </button>
          );
        })}
      </div>

      <div className="pt-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[12px] text-zinc-300 min-w-0">
          <Award className="w-4 h-4 text-white shrink-0" strokeWidth={1.5} />
          <span className="truncate">Credential Verified · IG-2026-302-9841</span>
        </div>
        <button
          type="button"
          onClick={onExploreClick}
          className="px-3 py-1.5 rounded-[6px] bg-white text-[#09090B] hover:bg-zinc-200 text-[12px] font-medium transition-colors whitespace-nowrap shrink-0"
        >
          Open Workspace
        </button>
      </div>
    </div>
  );
};
