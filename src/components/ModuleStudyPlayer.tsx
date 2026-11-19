import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  Download,
  FileText,
  FolderOpen,
  GripVertical,
  HelpCircle,
  ListChecks,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  RotateCcw,
  SlidersHorizontal,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useLMS } from '../store/LMSContext';
import { Certificate } from '../types/lms';
import {
  formatMinutes,
  formatMinutesLong,
  getEnrollmentStats,
  triggerTextDownload,
} from '../utils/formatters';
import { ChapterNotesEditor } from './ChapterNotesEditor';
import { ModuleQuizEngine } from './ModuleQuizEngine';
import { CertificateModal } from './CertificateModal';

interface ModuleStudyPlayerProps {
  moduleId: string;
}

interface ReaderPrefs {
  readerWidthPercent: number;
  splitRatioPercent: number;
  zoomPercent: number;
}

const READER_PREFS_KEY = 'intergrid_reader_prefs_v1';

const DEFAULT_READER_PREFS: ReaderPrefs = {
  readerWidthPercent: 100,
  splitRatioPercent: 62,
  zoomPercent: 100,
};

function loadReaderPrefs(): ReaderPrefs {
  try {
    const raw = localStorage.getItem(READER_PREFS_KEY);
    if (!raw) return DEFAULT_READER_PREFS;
    const parsed = JSON.parse(raw) as Partial<ReaderPrefs>;
    return {
      readerWidthPercent:
        typeof parsed.readerWidthPercent === 'number'
          ? Math.min(100, Math.max(55, parsed.readerWidthPercent))
          : DEFAULT_READER_PREFS.readerWidthPercent,
      splitRatioPercent:
        typeof parsed.splitRatioPercent === 'number'
          ? Math.min(78, Math.max(42, parsed.splitRatioPercent))
          : DEFAULT_READER_PREFS.splitRatioPercent,
      zoomPercent:
        typeof parsed.zoomPercent === 'number'
          ? Math.min(160, Math.max(85, parsed.zoomPercent))
          : DEFAULT_READER_PREFS.zoomPercent,
    };
  } catch {
    return DEFAULT_READER_PREFS;
  }
}

export const ModuleStudyPlayer: React.FC<ModuleStudyPlayerProps> = ({ moduleId }) => {
  const {
    state,
    currentUser,
    navigate,
    enrollInModule,
    completeChapter,
    toggleAutoAdvance,
    setLastAccessedChapter,
  } = useLMS();

  const module = state.modules.find((m) => m.id === moduleId);
  const enrollment = state.enrollments.find(
    (e) => e.userId === currentUser?.id && e.moduleId === moduleId
  );

  const sortedChapters = useMemo(() => {
    if (!module) return [];
    return [...module.chapters].sort((a, b) => a.order - b.order);
  }, [module]);

  const initialParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const initialChapterParam = initialParams.get('chapter');
  const initialTabParam = initialParams.get('tab');
  const initialNotesParam = initialParams.get('notes');

  const [activeTab, setActiveTab] = useState<'study' | 'quiz' | 'resources'>(
    initialTabParam === 'quiz' ? 'quiz' : 'study'
  );
  const [selectedChapterId, setSelectedChapterId] = useState<string>(() => {
    if (initialChapterParam && sortedChapters.some((c) => c.id === initialChapterParam)) {
      return initialChapterParam;
    }
    if (
      enrollment?.lastAccessedChapterId &&
      sortedChapters.some((c) => c.id === enrollment.lastAccessedChapterId)
    ) {
      return enrollment.lastAccessedChapterId;
    }
    return sortedChapters[0]?.id || '';
  });

  const [curriculumOpen, setCurriculumOpen] = useState<boolean>(true);
  const [mobileCurriculumOpen, setMobileCurriculumOpen] = useState<boolean>(false);
  // Private notes stay hidden by default unless explicitly requested via ?notes=1 or button tap
  const [showNotesPanel, setShowNotesPanel] = useState<boolean>(initialNotesParam === '1');
  const [certModal, setCertModal] = useState<Certificate | null>(null);

  // Reader layout, zoom, and full-screen preferences
  const initialPrefs = useMemo(() => loadReaderPrefs(), []);
  const [readerWidthPercent, setReaderWidthPercent] = useState<number>(
    initialPrefs.readerWidthPercent
  );
  const [splitRatioPercent, setSplitRatioPercent] = useState<number>(
    initialPrefs.splitRatioPercent
  );
  const [zoomPercent, setZoomPercent] = useState<number>(initialPrefs.zoomPercent);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [isDraggingSplit, setIsDraggingSplit] = useState<boolean>(false);
  const [isDraggingWidth, setIsDraggingWidth] = useState<boolean>(false);

  // Completion & Auto-advance UI state
  const [completionBanner, setCompletionBanner] = useState<{
    chapterTitle: string;
    chapterOrder: number;
    hasNext: boolean;
    nextChapterId?: string;
    autoAdvancing: boolean;
  } | null>(null);
  const [showCourseCompletedScreen, setShowCourseCompletedScreen] = useState<boolean>(false);

  const autoAdvanceTimerRef = useRef<number | null>(null);
  const studyContainerRef = useRef<HTMLDivElement | null>(null);
  const fullScreenStageRef = useRef<HTMLDivElement | null>(null);

  const userCertificate = useMemo(
    () =>
      module
        ? state.certificates.find(
            (c) => c.userId === currentUser?.id && c.moduleId === module.id
          ) || null
        : null,
    [state.certificates, currentUser?.id, module]
  );

  const hasPassedQuiz = useMemo(
    () =>
      module
        ? state.quizAttempts.some(
            (qa) => qa.userId === currentUser?.id && qa.moduleId === module.id && qa.passed
          )
        : false,
    [state.quizAttempts, currentUser?.id, module]
  );

  const clearAutoAdvanceTimer = () => {
    if (autoAdvanceTimerRef.current !== null) {
      window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearAutoAdvanceTimer();
  }, []);

  // Persist reader preferences
  useEffect(() => {
    try {
      const prefs: ReaderPrefs = {
        readerWidthPercent,
        splitRatioPercent,
        zoomPercent,
      };
      localStorage.setItem(READER_PREFS_KEY, JSON.stringify(prefs));
    } catch {
      // Ignore storage quota errors
    }
  }, [readerWidthPercent, splitRatioPercent, zoomPercent]);

  // Sync URL query parameters when navigating between modules/search results
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ch = params.get('chapter');
    const tb = params.get('tab');
    const notesParam = params.get('notes');

    if (ch && sortedChapters.some((c) => c.id === ch)) {
      setSelectedChapterId(ch);
    } else if (sortedChapters.length > 0 && !sortedChapters.some((c) => c.id === selectedChapterId)) {
      setSelectedChapterId(sortedChapters[0].id);
    }
    if (tb === 'quiz') {
      setActiveTab('quiz');
    } else {
      setActiveTab('study');
    }
    setShowNotesPanel(notesParam === '1');
    setCompletionBanner(null);
    setShowCourseCompletedScreen(false);
    clearAutoAdvanceTimer();
  }, [moduleId, sortedChapters.length]);

  // Handle Escape key & native fullscreenchange events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullScreen) {
        // Keep CSS overlay if user only exited native fullscreen? Or sync exit cleanly:
        setIsFullScreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isFullScreen]);

  // Lock body scroll when full-screen reading overlay is open
  useEffect(() => {
    if (!isFullScreen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isFullScreen]);

  // Drag handler for split view divider (Chapter Content vs Private Notes)
  useEffect(() => {
    if (!isDraggingSplit) return;
    const handleMove = (clientX: number) => {
      if (!studyContainerRef.current) return;
      const rect = studyContainerRef.current.getBoundingClientRect();
      if (rect.width <= 0) return;
      const nextRatio = Math.round(((clientX - rect.left) / rect.width) * 100);
      setSplitRatioPercent(Math.min(78, Math.max(42, nextRatio)));
    };
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handleMove(e.touches[0].clientX);
    };
    const onEnd = () => setIsDraggingSplit(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchend', onEnd);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchend', onEnd);
    };
  }, [isDraggingSplit]);

  // Drag handler for centered Chapter Reader width when Private Notes is hidden
  useEffect(() => {
    if (!isDraggingWidth) return;
    const handleMove = (clientX: number) => {
      if (!studyContainerRef.current) return;
      const rect = studyContainerRef.current.getBoundingClientRect();
      if (rect.width <= 0) return;
      const centerX = rect.left + rect.width / 2;
      const distFromCenter = Math.abs(clientX - centerX);
      const nextWidth = Math.round(((distFromCenter * 2) / rect.width) * 100);
      setReaderWidthPercent(Math.min(100, Math.max(55, nextWidth)));
    };
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handleMove(e.touches[0].clientX);
    };
    const onEnd = () => setIsDraggingWidth(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchend', onEnd);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchend', onEnd);
    };
  }, [isDraggingWidth]);

  if (!module) {
    return (
      <div className="bg-white border border-[#E4E4E7] rounded-[8px] p-10 text-center">
        <div className="text-[16px] font-semibold text-[#09090B]">Course not found</div>
        <button
          type="button"
          onClick={() => navigate('/catalog')}
          className="mt-4 px-4 py-2 rounded-[6px] bg-[#09090B] text-white text-[13px]"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  const stats = getEnrollmentStats(module, enrollment);
  const completedSet = new Set(enrollment?.completedChapterIds || []);
  const activeChapterIndex = Math.max(
    0,
    sortedChapters.findIndex((c) => c.id === selectedChapterId)
  );
  const activeChapter = sortedChapters[activeChapterIndex] || sortedChapters[0];
  const prevChapter = activeChapterIndex > 0 ? sortedChapters[activeChapterIndex - 1] : null;
  const nextChapter =
    activeChapterIndex < sortedChapters.length - 1
      ? sortedChapters[activeChapterIndex + 1]
      : null;

  const isActiveChapterCompleted = activeChapter
    ? completedSet.has(activeChapter.id)
    : false;
  const autoAdvanceEnabled = currentUser?.autoAdvanceChapters ?? true;
  const zoomScale = zoomPercent / 100;

  const toggleFullScreenMode = async () => {
    if (!isFullScreen) {
      setIsFullScreen(true);
      try {
        if (fullScreenStageRef.current?.requestFullscreen && document.fullscreenEnabled) {
          await fullScreenStageRef.current.requestFullscreen();
        }
      } catch {
        // Fallback CSS full-viewport mode remains active inside restricted iframes
      }
    } else {
      setIsFullScreen(false);
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        }
      } catch {
        // Ignore fullscreen exit errors
      }
    }
  };

  const handleSelectChapter = (chapterId: string) => {
    clearAutoAdvanceTimer();
    setCompletionBanner(null);
    setShowCourseCompletedScreen(false);
    setSelectedChapterId(chapterId);
    setActiveTab('study');
    setMobileCurriculumOpen(false);
    if (enrollment) {
      setLastAccessedChapter(module.id, chapterId);
    }
  };

  const handleCompleteChapter = () => {
    if (!activeChapter || !enrollment) return;
    clearAutoAdvanceTimer();

    const { allCompleted } = completeChapter(module.id, activeChapter.id);

    if (!nextChapter && allCompleted) {
      if (isFullScreen) {
        setIsFullScreen(false);
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      }
      setCompletionBanner({
        chapterTitle: activeChapter.title,
        chapterOrder: activeChapter.order,
        hasNext: false,
        autoAdvancing: false,
      });
      setShowCourseCompletedScreen(true);
      return;
    }

    const shouldAutoAdvance = autoAdvanceEnabled && Boolean(nextChapter);
    setCompletionBanner({
      chapterTitle: activeChapter.title,
      chapterOrder: activeChapter.order,
      hasNext: Boolean(nextChapter),
      nextChapterId: nextChapter?.id,
      autoAdvancing: shouldAutoAdvance,
    });

    if (shouldAutoAdvance && nextChapter) {
      autoAdvanceTimerRef.current = window.setTimeout(() => {
        setSelectedChapterId(nextChapter.id);
        setLastAccessedChapter(module.id, nextChapter.id);
        setCompletionBanner(null);
        autoAdvanceTimerRef.current = null;
      }, 1100);
    }
  };

  const handleCancelAutoAdvance = () => {
    clearAutoAdvanceTimer();
    setCompletionBanner((prev) => (prev ? { ...prev, autoAdvancing: false } : null));
  };

  const curriculumList = (
    <div className="bg-white border border-[#E4E4E7] rounded-[8px] overflow-hidden">
      <div className="px-4 py-3.5 border-b border-[#E4E4E7] flex items-center justify-between gap-2">
        <div>
          <div className="text-[13px] font-semibold text-[#09090B]">
            Course Curriculum
          </div>
          <div className="text-[11px] font-mono tabular-nums text-[#71717A]">
            {stats.completedCount} / {stats.totalChapters} completed ·{' '}
            {formatMinutesLong(stats.totalMinutes)}
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setCurriculumOpen(false);
            setMobileCurriculumOpen(false);
          }}
          className="p-1.5 rounded-[6px] text-[#71717A] hover:text-[#09090B] hover:bg-[#F4F4F5]"
          aria-label="Collapse curriculum list"
          title="Collapse curriculum to full width"
        >
          <X className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>

      <div className="divide-y divide-[#E4E4E7] max-h-[620px] overflow-y-auto">
        {sortedChapters.map((ch) => {
          const isDone = completedSet.has(ch.id);
          const isCurrent =
            activeChapter?.id === ch.id &&
            activeTab === 'study' &&
            !showCourseCompletedScreen;
          return (
            <button
              key={ch.id}
              type="button"
              onClick={() => handleSelectChapter(ch.id)}
              className={`w-full text-left p-4 transition-colors flex items-start gap-3 ${
                isCurrent ? 'bg-[#09090B] text-white' : 'hover:bg-[#FAFAFA] text-[#09090B]'
              }`}
            >
              <span className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckCircle2
                    className={`w-4 h-4 ${isCurrent ? 'text-white' : 'text-[#09090B]'}`}
                    strokeWidth={1.75}
                  />
                ) : (
                  <Circle
                    className={`w-4 h-4 ${isCurrent ? 'text-zinc-400' : 'text-[#71717A]'}`}
                    strokeWidth={1.5}
                  />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[11px] font-mono ${
                      isCurrent ? 'text-zinc-300' : 'text-[#71717A]'
                    }`}
                  >
                    Chapter 0{ch.order}
                  </span>
                  {isDone && (
                    <span
                      className={`text-[10px] font-mono ${
                        isCurrent ? 'text-zinc-300' : 'text-[#09090B]'
                      }`}
                    >
                      Completed
                    </span>
                  )}
                </div>
                <div className="text-[13px] font-medium mt-0.5 leading-snug">
                  {ch.title}
                </div>
                <div
                  className={`mt-1.5 inline-flex items-center gap-1 text-[11px] font-mono tabular-nums ${
                    isCurrent ? 'text-zinc-300' : 'text-[#71717A]'
                  }`}
                >
                  <Clock className="w-3 h-3" strokeWidth={1.5} />
                  <span>{formatMinutesLong(ch.durationMinutes)}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  // Reusable Reader Controls Toolbar (Width / Split, Zoom, Private Notes Toggle, Full Screen)
  const readerToolbar = (
    <div className="bg-white border border-[#E4E4E7] rounded-[8px] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
      {/* Left: Width / Split Adjustment */}
      <div className="flex flex-wrap items-center gap-3 min-w-0">
        <div className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#09090B] shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#71717A]" strokeWidth={1.5} />
          <span>{showNotesPanel ? 'Split Width' : 'Chapter Width'}</span>
        </div>

        {showNotesPanel ? (
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="range"
              min={42}
              max={78}
              step={1}
              value={splitRatioPercent}
              onChange={(e) => setSplitRatioPercent(Number(e.target.value))}
              aria-label="Adjust chapter content and notes split width"
              className="hidden sm:block w-24 md:w-32 accent-[#09090B] cursor-pointer"
            />
            <span className="hidden sm:inline text-[11px] font-mono tabular-nums text-[#71717A] w-[62px]">
              {splitRatioPercent}/{100 - splitRatioPercent}
            </span>
            <div className="hidden md:flex items-center gap-1">
              {[
                { label: '50/50', value: 50 },
                { label: '62/38', value: 62 },
                { label: '75/25', value: 75 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setSplitRatioPercent(preset.value)}
                  className={`px-2 py-1 rounded-[4px] text-[11px] font-mono transition-colors ${
                    Math.abs(splitRatioPercent - preset.value) <= 2
                      ? 'bg-[#09090B] text-white'
                      : 'border border-[#E4E4E7] bg-[#FAFAFA] text-[#71717A] hover:text-[#09090B]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="range"
              min={55}
              max={100}
              step={1}
              value={readerWidthPercent}
              onChange={(e) => setReaderWidthPercent(Number(e.target.value))}
              aria-label="Adjust chapter reading width"
              className="hidden sm:block w-24 md:w-32 accent-[#09090B] cursor-pointer"
            />
            <span className="hidden sm:inline text-[11px] font-mono tabular-nums text-[#71717A] w-[38px]">
              {readerWidthPercent}%
            </span>
            <div className="flex items-center gap-1">
              {[
                { label: 'Focused', value: 65 },
                { label: 'Wide', value: 82 },
                { label: 'Full', value: 100 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setReaderWidthPercent(preset.value)}
                  className={`px-2.5 py-1 rounded-[4px] text-[11px] font-medium transition-colors whitespace-nowrap ${
                    Math.abs(readerWidthPercent - preset.value) <= 2
                      ? 'bg-[#09090B] text-white'
                      : 'border border-[#E4E4E7] bg-[#FAFAFA] text-[#71717A] hover:text-[#09090B]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: Zoom Controls + Notes Toggle + Full Screen */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {/* Zoom In / Out / Reset */}
        <div
          className="inline-flex items-center rounded-[6px] border border-[#E4E4E7] bg-[#FAFAFA] overflow-hidden"
          role="group"
          aria-label="Reading text zoom"
        >
          <button
            type="button"
            disabled={zoomPercent <= 85}
            onClick={() => setZoomPercent((z) => Math.max(85, z - 10))}
            className="p-1.5 text-[#09090B] hover:bg-[#F4F4F5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Zoom out"
            aria-label="Zoom out chapter text"
          >
            <ZoomOut className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => setZoomPercent(100)}
            className="px-2 py-1 text-[11px] font-mono tabular-nums text-[#09090B] hover:bg-[#F4F4F5] border-x border-[#E4E4E7] min-w-[48px] text-center"
            title="Reset zoom to 100%"
          >
            {zoomPercent}%
          </button>
          <button
            type="button"
            disabled={zoomPercent >= 160}
            onClick={() => setZoomPercent((z) => Math.min(160, z + 10))}
            className="p-1.5 text-[#09090B] hover:bg-[#F4F4F5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Zoom in"
            aria-label="Zoom in chapter text"
          >
            <ZoomIn className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
          {zoomPercent !== 100 && (
            <button
              type="button"
              onClick={() => setZoomPercent(100)}
              className="p-1.5 text-[#71717A] hover:text-[#09090B] hover:bg-[#F4F4F5] border-l border-[#E4E4E7]"
              title="Reset zoom"
              aria-label="Reset zoom"
            >
              <RotateCcw className="w-3 h-3" strokeWidth={1.5} />
            </button>
          )}
        </div>

        {/* Private Notes Toggle */}
        <button
          type="button"
          onClick={() => setShowNotesPanel((s) => !s)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-colors whitespace-nowrap shrink-0 ${
            showNotesPanel
              ? 'bg-[#09090B] text-white'
              : 'border border-[#E4E4E7] bg-white hover:border-[#09090B] text-[#09090B]'
          }`}
        >
          {showNotesPanel ? (
            <>
              <PanelRightClose className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Hide Private Notes</span>
            </>
          ) : (
            <>
              <PanelRightOpen className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Show Private Notes</span>
            </>
          )}
        </button>

        {/* Full Screen Toggle */}
        <button
          type="button"
          onClick={toggleFullScreenMode}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-colors whitespace-nowrap shrink-0 ${
            isFullScreen
              ? 'bg-[#09090B] text-white hover:bg-[#18181B]'
              : 'border border-[#E4E4E7] bg-white hover:border-[#09090B] text-[#09090B]'
          }`}
        >
          {isFullScreen ? (
            <>
              <Minimize2 className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Exit Full Screen</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Full Screen</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  // Full-Width Chapter Progress Strip shown whenever Curriculum sidebar is collapsed
  const fullWidthChapterProgress = (
    <div className="w-full bg-white border border-[#E4E4E7] rounded-[8px] p-4 sm:p-5 space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[12px] font-semibold text-[#09090B]">
            Full-Width Chapter Progress
          </div>
          <div className="text-[12px] font-mono tabular-nums text-[#71717A] mt-0.5">
            {stats.completedCount} of {stats.totalChapters} chapters completed ({stats.progressPercent}%) ·{' '}
            {formatMinutes(stats.remainingMinutes)} remaining
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[14px] font-mono font-semibold tabular-nums text-[#09090B]">
            {stats.progressPercent}%
          </span>
          {!isFullScreen && (
            <button
              type="button"
              onClick={() => setCurriculumOpen(true)}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#E4E4E7] hover:border-[#09090B] text-[12px] font-medium text-[#09090B] whitespace-nowrap"
            >
              <PanelLeftOpen className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Show Curriculum</span>
            </button>
          )}
        </div>
      </div>

      {/* Segmented Full-Width Progress Bar + Clickable Chapter Steps */}
      <div className="w-full h-2 rounded-[4px] bg-[#F4F4F5] overflow-hidden">
        <div
          className="h-full bg-[#09090B] transition-all duration-300"
          style={{ width: `${stats.progressPercent}%` }}
        />
      </div>

      <div className="overflow-x-auto pb-1">
        <div
          className="grid gap-2 min-w-[540px]"
          style={{
            gridTemplateColumns: `repeat(${Math.max(1, sortedChapters.length)}, minmax(0, 1fr))`,
          }}
        >
          {sortedChapters.map((ch) => {
            const isDone = completedSet.has(ch.id);
            const isCurrent =
              activeChapter?.id === ch.id &&
              activeTab === 'study' &&
              !showCourseCompletedScreen;
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => handleSelectChapter(ch.id)}
                className={`text-left p-2.5 rounded-[6px] border transition-colors min-w-0 ${
                  isCurrent
                    ? 'bg-[#09090B] border-[#09090B] text-white'
                    : isDone
                    ? 'bg-[#FAFAFA] border-[#09090B]/30 text-[#09090B] hover:border-[#09090B]'
                    : 'bg-white border-[#E4E4E7] text-[#09090B] hover:border-[#09090B]/50'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <span
                    className={`text-[10px] font-mono tabular-nums ${
                      isCurrent ? 'text-zinc-300' : 'text-[#71717A]'
                    }`}
                  >
                    0{ch.order}
                  </span>
                  {isDone ? (
                    <CheckCircle2
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isCurrent ? 'text-white' : 'text-[#09090B]'
                      }`}
                      strokeWidth={1.75}
                    />
                  ) : (
                    <Circle
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isCurrent ? 'text-zinc-400' : 'text-[#71717A]'
                      }`}
                      strokeWidth={1.5}
                    />
                  )}
                </div>
                <div className="text-[12px] font-medium truncate mt-1">
                  {ch.title}
                </div>
                <div
                  className={`text-[10px] font-mono tabular-nums mt-0.5 ${
                    isCurrent ? 'text-zinc-300' : 'text-[#71717A]'
                  }`}
                >
                  {formatMinutesLong(ch.durationMinutes)}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Core Chapter Reading Content + Optional Resizable Private Notes Pane
  const renderStudyReadingWorkspace = () => {
    if (!activeChapter) return null;

    const readingCard = (
      <div
        className="relative bg-white border border-[#E4E4E7] rounded-[8px] p-6 sm:p-8 space-y-6 transition-[width] duration-150"
        style={
          !showNotesPanel
            ? { width: '100%' }
            : undefined
        }
      >
        {/* Right-edge interactive width resize handle on desktop when Notes is hidden */}
        {!showNotesPanel && (
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              setIsDraggingWidth(true);
            }}
            onTouchStart={() => setIsDraggingWidth(true)}
            title="Drag to adjust chapter reading width"
            aria-label="Drag to adjust chapter reading width"
            className="hidden lg:flex absolute top-6 bottom-6 -right-3 w-4 items-center justify-center cursor-ew-resize group z-10"
          >
            <span
              className={`w-1.5 h-12 rounded-full transition-colors ${
                isDraggingWidth
                  ? 'bg-[#09090B]'
                  : 'bg-[#E4E4E7] group-hover:bg-[#09090B]'
              }`}
            />
          </button>
        )}

        {/* Completion Message Banner */}
        {completionBanner && (
          <div
            role="status"
            className="p-4 rounded-[8px] bg-[#09090B] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-start gap-2.5">
              <CheckCircle2
                className="w-5 h-5 text-white shrink-0 mt-0.5"
                strokeWidth={1.75}
              />
              <div>
                <div className="text-[13px] font-semibold">
                  Chapter 0{completionBanner.chapterOrder} completed — progress saved.
                </div>
                <div className="text-[12px] text-zinc-300 mt-0.5">
                  {completionBanner.autoAdvancing
                    ? 'Automatically advancing to the next chapter...'
                    : completionBanner.hasNext
                    ? 'Continue to the next chapter when ready.'
                    : 'You have completed all chapters in this course.'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {completionBanner.autoAdvancing && (
                <button
                  type="button"
                  onClick={handleCancelAutoAdvance}
                  className="px-3 py-1.5 rounded-[6px] border border-white/25 text-[12px] text-zinc-200 hover:bg-white/10"
                >
                  Stay
                </button>
              )}
              {completionBanner.hasNext && completionBanner.nextChapterId && (
                <button
                  type="button"
                  onClick={() => handleSelectChapter(completionBanner.nextChapterId!)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] bg-white text-[#09090B] hover:bg-zinc-200 text-[12px] font-semibold whitespace-nowrap shrink-0"
                >
                  <span>Next Chapter</span>
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Chapter Header (Zoom-Scaled) */}
        <div className="pb-4 border-b border-[#E4E4E7]">
          <div
            className="flex items-center justify-between gap-2 font-mono text-[#71717A]"
            style={{ fontSize: `${Math.round(12 * zoomScale)}px` }}
          >
            <span>
              Chapter 0{activeChapter.order} ·{' '}
              {isActiveChapterCompleted ? 'Completed' : 'In Progress'}
            </span>
            <span>{formatMinutesLong(activeChapter.durationMinutes)}</span>
          </div>
          <h2
            className="font-display font-semibold text-[#09090B] mt-1.5 leading-tight"
            style={{ fontSize: `${Math.round(22 * zoomScale)}px` }}
          >
            {activeChapter.title}
          </h2>
          <p
            className="mt-2 text-[#71717A] leading-relaxed"
            style={{ fontSize: `${Math.round(14 * zoomScale)}px` }}
          >
            {activeChapter.summary}
          </p>
        </div>

        {/* Reading & Code Sections (Zoom-Scaled) */}
        <div className="space-y-6">
          {activeChapter.sections.map((sec, idx) => (
            <section key={idx} className="space-y-2.5">
              <h3
                className="font-display font-semibold text-[#09090B] leading-snug"
                style={{ fontSize: `${Math.round(16 * zoomScale)}px` }}
              >
                {sec.heading}
              </h3>
              <p
                className="leading-[1.7] text-[#09090B]/90"
                style={{ fontSize: `${Math.round(14 * zoomScale)}px` }}
              >
                {sec.body}
              </p>
              {sec.codeBlock && (
                <div className="mt-3 rounded-[6px] bg-[#09090B] text-zinc-100 overflow-hidden border border-[#18181B]">
                  <div className="px-3.5 py-2 border-b border-white/10 text-[11px] font-mono text-zinc-400">
                    {sec.codeBlock.language}
                  </div>
                  <pre
                    className="p-4 font-mono overflow-x-auto leading-relaxed"
                    style={{ fontSize: `${Math.round(12 * zoomScale)}px` }}
                  >
                    <code>{sec.codeBlock.code}</code>
                  </pre>
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Key Takeaways (Zoom-Scaled) */}
        {activeChapter.keyTakeaways.length > 0 && (
          <div className="p-4 sm:p-5 rounded-[8px] bg-[#FAFAFA] border border-[#E4E4E7]">
            <div
              className="font-semibold text-[#09090B] mb-2"
              style={{ fontSize: `${Math.round(12 * zoomScale)}px` }}
            >
              Key Engineering Takeaways
            </div>
            <ul className="space-y-1.5">
              {activeChapter.keyTakeaways.map((item, idx) => (
                <li
                  key={idx}
                  className="text-[#09090B] flex items-start gap-2 leading-relaxed"
                  style={{ fontSize: `${Math.round(13 * zoomScale)}px` }}
                >
                  <span className="font-mono text-[#71717A] shrink-0">
                    0{idx + 1}.
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Chapter Study Materials */}
        {activeChapter.studyMaterials.length > 0 && (
          <div className="pt-4 border-t border-[#E4E4E7] space-y-2.5">
            <div className="text-[12px] font-semibold text-[#09090B]">
              Chapter Study Materials
            </div>
            {activeChapter.studyMaterials.map((res) => (
              <div
                key={res.id}
                className="p-3 rounded-[6px] border border-[#E4E4E7] bg-[#FAFAFA] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText
                    className="w-4 h-4 text-[#09090B] shrink-0"
                    strokeWidth={1.5}
                  />
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-[#09090B] truncate">
                      {res.title}
                    </div>
                    <div className="text-[11px] font-mono text-[#71717A]">
                      {res.type} · {res.sizeLabel}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    triggerTextDownload(
                      `${res.title.toLowerCase().replace(/\s+/g, '-')}.txt`,
                      res.urlOrContent
                    )
                  }
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[4px] border border-[#E4E4E7] bg-white hover:border-[#09090B] text-[12px] font-medium text-[#09090B] shrink-0"
                >
                  <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>Download</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Chapter Progression & Previous / Next Footer */}
        <div className="pt-5 border-t border-[#E4E4E7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!prevChapter}
              onClick={() => prevChapter && handleSelectChapter(prevChapter.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-[6px] border text-[13px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                prevChapter
                  ? 'border-[#E4E4E7] bg-white hover:border-[#09090B] text-[#09090B]'
                  : 'border-[#E4E4E7] bg-[#FAFAFA] text-[#71717A] opacity-60 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
              <span>Previous Chapter</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {!enrollment ? (
              <button
                type="button"
                onClick={() => enrollInModule(module.id)}
                className="px-4 py-2 rounded-[6px] bg-[#09090B] text-white text-[13px] font-medium"
              >
                Enroll to Save Progress
              </button>
            ) : (
              <>
                {isActiveChapterCompleted ? (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] border border-[#09090B] bg-[#FAFAFA] text-[#09090B] text-[13px] font-medium whitespace-nowrap shrink-0">
                    <CheckCircle2 className="w-4 h-4" strokeWidth={1.75} />
                    <span>Completed</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleCompleteChapter}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[6px] bg-[#09090B] hover:bg-[#18181B] text-white text-[13px] font-medium transition-colors whitespace-nowrap shrink-0"
                  >
                    <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
                    <span>Mark Chapter Complete</span>
                  </button>
                )}

                {nextChapter ? (
                  <button
                    type="button"
                    onClick={() => handleSelectChapter(nextChapter.id)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-[6px] text-[13px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                      isActiveChapterCompleted
                        ? 'bg-[#09090B] hover:bg-[#18181B] text-white'
                        : 'border border-[#E4E4E7] bg-white hover:border-[#09090B] text-[#09090B]'
                    }`}
                  >
                    <span>Next Chapter</span>
                    <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                ) : stats.isCompleted ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (isFullScreen) setIsFullScreen(false);
                      setShowCourseCompletedScreen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[6px] bg-[#09090B] hover:bg-[#18181B] text-white text-[13px] font-medium whitespace-nowrap shrink-0"
                  >
                    <span>Course Completed</span>
                    <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    );

    return (
      <div className="space-y-4">
        {readerToolbar}

        <div ref={studyContainerRef} className="w-full">
          {showNotesPanel ? (
            /* Split Workspace with Draggable Vertical Divider on Desktop */
            <div className="flex flex-col lg:flex-row items-stretch gap-4 lg:gap-0">
              <div
                className="min-w-0 w-full lg:w-[var(--left-pane-width)] lg:shrink-0"
                style={
                  {
                    '--left-pane-width': `calc(${splitRatioPercent}% - 8px)`,
                  } as React.CSSProperties
                }
              >
                {readingCard}
              </div>

              {/* Draggable Splitter Handle (Desktop) */}
              <div
                role="separator"
                aria-orientation="vertical"
                aria-label="Resize chapter content and private notes"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setIsDraggingSplit(true);
                }}
                onTouchStart={() => setIsDraggingSplit(true)}
                className="hidden lg:flex w-4 shrink-0 cursor-col-resize items-center justify-center group select-none"
                title="Drag to resize Chapter Content and Private Notes"
              >
                <div
                  className={`w-1.5 h-16 rounded-full flex items-center justify-center transition-colors ${
                    isDraggingSplit
                      ? 'bg-[#09090B] text-white'
                      : 'bg-[#E4E4E7] text-[#71717A] group-hover:bg-[#09090B] group-hover:text-white'
                  }`}
                >
                  <GripVertical className="w-3 h-3" strokeWidth={1.5} />
                </div>
              </div>

              <div
                className="min-w-0 w-full lg:w-[var(--right-pane-width)] lg:shrink-0"
                style={
                  {
                    '--right-pane-width': `calc(${100 - splitRatioPercent}% - 8px)`,
                  } as React.CSSProperties
                }
              >
                <div className="lg:sticky lg:top-20">
                  <ChapterNotesEditor
                    moduleId={module.id}
                    chapterId={activeChapter.id}
                    chapterTitle={activeChapter.title}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Adjustable-Width Single Reading Dashboard */
            <div
              className="w-full lg:w-[var(--reader-width)] mx-auto transition-[width] duration-150"
              style={
                {
                  '--reader-width': `${readerWidthPercent}%`,
                } as React.CSSProperties
              }
            >
              {readingCard}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Course Player Header Bar */}
      <div className="bg-white border border-[#E4E4E7] rounded-[8px] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E4E4E7]">
          <button
            type="button"
            onClick={() => navigate('/my-learning')}
            className="inline-flex items-center gap-1.5 text-[13px] text-[#71717A] hover:text-[#09090B] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            <span>Back to My Learning</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {/* Desktop Curriculum Toggle */}
            <button
              type="button"
              onClick={() => setCurriculumOpen((o) => !o)}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#E4E4E7] hover:border-[#09090B] text-[12px] font-medium text-[#09090B] whitespace-nowrap shrink-0"
            >
              {curriculumOpen ? (
                <>
                  <PanelLeftClose className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>Hide Curriculum</span>
                </>
              ) : (
                <>
                  <PanelLeftOpen className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>Show Curriculum</span>
                </>
              )}
            </button>

            {/* Mobile/Tablet Curriculum Drawer Trigger */}
            <button
              type="button"
              onClick={() => setMobileCurriculumOpen(true)}
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#E4E4E7] hover:border-[#09090B] text-[12px] font-medium text-[#09090B] whitespace-nowrap shrink-0"
            >
              <ListChecks className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>
                Curriculum ({stats.completedCount}/{stats.totalChapters})
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowNotesPanel((s) => !s)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                showNotesPanel
                  ? 'bg-[#09090B] text-white'
                  : 'border border-[#E4E4E7] hover:border-[#09090B] text-[#09090B]'
              }`}
            >
              {showNotesPanel ? (
                <>
                  <PanelRightClose className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>Hide Private Notes</span>
                </>
              ) : (
                <>
                  <PanelRightOpen className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>Show Private Notes</span>
                </>
              )}
            </button>

            {userCertificate && (
              <button
                type="button"
                onClick={() => setCertModal(userCertificate)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] bg-[#09090B] text-white text-[12px] font-medium hover:bg-[#18181B] transition-colors whitespace-nowrap shrink-0"
              >
                <Award className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>View Certificate</span>
              </button>
            )}
          </div>
        </div>

        {/* Course & Active Chapter Title + Course Progress Indicator */}
        <div className="pt-4 flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-[12px] font-mono text-[#71717A]">
              <span>{module.code}</span>
              <span aria-hidden="true">·</span>
              <span>{module.category}</span>
              {activeChapter && activeTab === 'study' && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>
                    Chapter 0{activeChapter.order} of 0{sortedChapters.length}
                  </span>
                </>
              )}
            </div>
            <h1 className="font-display font-semibold text-[22px] sm:text-[24px] text-[#09090B] mt-1">
              {module.title}
            </h1>
            {activeChapter && activeTab === 'study' && (
              <div className="mt-1 text-[14px] text-[#71717A] flex flex-wrap items-center gap-2">
                <span className="font-medium text-[#09090B]">
                  {activeChapter.title}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[12px]">
                  {isActiveChapterCompleted ? 'Completed' : 'In Progress'}
                </span>
              </div>
            )}
          </div>

          {!enrollment ? (
            <button
              type="button"
              onClick={() => enrollInModule(module.id)}
              className="px-4 py-2.5 rounded-[6px] bg-[#09090B] hover:bg-[#18181B] text-white text-[13px] font-medium whitespace-nowrap shrink-0"
            >
              Enroll to Track Progress
            </button>
          ) : (
            <div className="w-full lg:w-[320px] shrink-0">
              <div className="flex items-center justify-between text-[12px] font-mono tabular-nums mb-1.5">
                <span className="text-[#71717A]">
                  {stats.completedCount} / {stats.totalChapters} chapters ·{' '}
                  {formatMinutes(stats.remainingMinutes)} left
                </span>
                <span className="font-semibold text-[#09090B]">
                  {stats.progressPercent}%
                </span>
              </div>
              <div className="w-full h-2 rounded-[4px] bg-[#F4F4F5] overflow-hidden">
                <div
                  className="h-full bg-[#09090B] transition-all duration-300"
                  style={{ width: `${stats.progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Sub-navigation Tabs + Auto-Advance Preference */}
        <div className="mt-5 pt-4 border-t border-[#E4E4E7] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('study');
                setShowCourseCompletedScreen(false);
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] text-[13px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'study'
                  ? 'bg-[#09090B] text-white'
                  : 'text-[#71717A] hover:text-[#09090B] hover:bg-[#F4F4F5]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Chapter Content</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('resources')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] text-[13px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'resources'
                  ? 'bg-[#09090B] text-white'
                  : 'text-[#71717A] hover:text-[#09090B] hover:bg-[#F4F4F5]'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Additional Materials ({module.additionalMaterials.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('quiz')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] text-[13px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'quiz'
                  ? 'bg-[#09090B] text-white'
                  : 'text-[#71717A] hover:text-[#09090B] hover:bg-[#F4F4F5]'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Knowledge Check ({module.quiz.length}Q)</span>
            </button>
          </div>

          <label className="inline-flex items-center gap-2 text-[12px] text-[#09090B] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoAdvanceEnabled}
              onChange={(e) => toggleAutoAdvance(e.target.checked)}
              className="w-4 h-4 accent-[#09090B]"
            />
            <span>Auto-advance to next chapter</span>
          </label>
        </div>
      </div>

      {/* Main Layout: Collapsible Curriculum + Full-Width Study Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {curriculumOpen && (
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 sticky top-20">
            {curriculumList}
          </aside>
        )}

        <div
          className={`${
            curriculumOpen ? 'lg:col-span-8 xl:col-span-9' : 'lg:col-span-12'
          } space-y-5 min-w-0`}
        >
          {/* Full-Width Chapter Progress Bar shown whenever Curriculum Sidebar is Collapsed */}
          {!curriculumOpen && fullWidthChapterProgress}

          {activeTab === 'study' && showCourseCompletedScreen ? (
            /* Course Completed Screen */
            <div className="bg-[#09090B] text-white rounded-[8px] p-8 sm:p-10 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[12px] font-mono text-zinc-400">
                    {module.code} · Course Completed
                  </div>
                  <h2 className="font-display font-semibold text-[26px] text-white mt-1">
                    All chapters in {module.title} are complete.
                  </h2>
                  <p className="text-[14px] text-zinc-300 mt-2 max-w-xl leading-relaxed">
                    You completed all {sortedChapters.length} chapters ({formatMinutesLong(stats.totalMinutes)} of curriculum content).{' '}
                    {hasPassedQuiz
                      ? 'You have also passed the Knowledge Check and unlocked your Certificate of Attendance.'
                      : `Complete the Knowledge Check (${module.quizPassingScore}% passing score) to unlock your Certificate of Attendance.`}
                  </p>
                </div>
                <CheckCircle2 className="w-9 h-9 text-white shrink-0" strokeWidth={1.5} />
              </div>

              <div className="pt-5 border-t border-white/14 flex flex-wrap items-center gap-3">
                {userCertificate ? (
                  <button
                    type="button"
                    onClick={() => setCertModal(userCertificate)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[6px] bg-white text-[#09090B] hover:bg-zinc-200 text-[13px] font-semibold transition-colors"
                  >
                    <Award className="w-4 h-4" strokeWidth={1.75} />
                    <span>Open Certificate of Attendance</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveTab('quiz')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[6px] bg-white text-[#09090B] hover:bg-zinc-200 text-[13px] font-semibold transition-colors"
                  >
                    <HelpCircle className="w-4 h-4" strokeWidth={1.75} />
                    <span>Take Knowledge Check</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowCourseCompletedScreen(false)}
                  className="px-4 py-2.5 rounded-[6px] border border-white/25 text-white hover:bg-white/10 text-[13px] font-medium transition-colors"
                >
                  Review Chapter Content
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2.5 rounded-[6px] text-zinc-300 hover:text-white text-[13px] font-medium"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : null}

          {activeTab === 'study' &&
            activeChapter &&
            !showCourseCompletedScreen &&
            !isFullScreen &&
            renderStudyReadingWorkspace()}

          {activeTab === 'resources' && (
            <div className="bg-white border border-[#E4E4E7] rounded-[8px] p-6 space-y-4">
              <div>
                <h2 className="font-display font-semibold text-[18px] text-[#09090B]">
                  Additional Course Materials
                </h2>
                <p className="text-[13px] text-[#71717A] mt-0.5">
                  Supplementary lab bundles, cheat sheets, and architectural reference documents attached by instructors.
                </p>
              </div>

              {module.additionalMaterials.length === 0 ? (
                <div className="p-8 rounded-[6px] border border-[#E4E4E7] bg-[#FAFAFA] text-center text-[13px] text-[#71717A]">
                  No supplementary files uploaded for this course yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {module.additionalMaterials.map((res) => (
                    <div
                      key={res.id}
                      className="p-4 rounded-[6px] border border-[#E4E4E7] bg-[#FAFAFA] flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="text-[14px] font-semibold text-[#09090B]">
                          {res.title}
                        </div>
                        <div className="text-[12px] font-mono text-[#71717A] mt-0.5">
                          {res.type} · {res.sizeLabel} · Uploaded {res.uploadedAt} by{' '}
                          {res.uploadedBy}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          triggerTextDownload(
                            `${res.title.toLowerCase().replace(/\s+/g, '-')}.txt`,
                            res.urlOrContent
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] bg-[#09090B] hover:bg-[#18181B] text-white text-[12px] font-medium shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span>Download</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'quiz' && (
            <ModuleQuizEngine
              module={module}
              isUnlocked={stats.isCompleted}
              completedChapters={stats.completedCount}
              totalChapters={stats.totalChapters}
              onUnlockCertificate={() => {
                const latestCert = state.certificates.find(
                  (c) => c.userId === currentUser?.id && c.moduleId === module.id
                );
                if (latestCert) setCertModal(latestCert);
              }}
            />
          )}
        </div>
      </div>

      {/* Full-Screen Distraction-Free Reading Overlay */}
      {isFullScreen && activeChapter && (
        <div
          ref={fullScreenStageRef}
          className="fixed inset-0 z-50 bg-[#FAFAFA] overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label={`Full screen reading mode: ${activeChapter.title}`}
        >
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[#E4E4E7]">
            <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[11px] font-mono text-[#71717A]">
                  {module.code} · Chapter 0{activeChapter.order} of 0{sortedChapters.length} ·{' '}
                  {stats.progressPercent}% course complete
                </div>
                <div className="text-[14px] font-display font-semibold text-[#09090B] truncate">
                  {activeChapter.title}
                </div>
              </div>

              <button
                type="button"
                onClick={toggleFullScreenMode}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#09090B] text-white hover:bg-[#18181B] text-[12px] font-medium whitespace-nowrap shrink-0"
              >
                <Minimize2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Exit Full Screen (Esc)</span>
              </button>
            </div>
          </div>

          <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
            {fullWidthChapterProgress}
            {renderStudyReadingWorkspace()}
          </div>
        </div>
      )}

      {/* Tablet/Mobile Slide-Over Curriculum Drawer */}
      {mobileCurriculumOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileCurriculumOpen(false)}
          />
          <div className="relative w-[320px] max-w-[88vw] h-full bg-white z-10 p-4 overflow-y-auto">
            {curriculumList}
          </div>
        </div>
      )}

      {certModal && (
        <CertificateModal certificate={certModal} onClose={() => setCertModal(null)} />
      )}
    </div>
  );
};
