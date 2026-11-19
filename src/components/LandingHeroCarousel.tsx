import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { HERO_SLIDES } from '../data/seedData';
import { GlassDashboardPreview } from './GlassDashboardPreview';

interface LandingHeroCarouselProps {
  onGetStarted: () => void;
  onBrowseCatalog: () => void;
}

const SLIDE_DURATION_MS = 5000;

export const LandingHeroCarousel: React.FC<LandingHeroCarouselProps> = ({
  onGetStarted,
  onBrowseCatalog,
}) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [imgError, setImgError] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, SLIDE_DURATION_MS);
    return () => window.clearInterval(id);
  }, []);

  const current = HERO_SLIDES[activeSlide];

  return (
    <section
      className="relative w-full min-h-[640px] lg:min-h-[680px] bg-[#09090B] overflow-hidden border-b border-[#E4E4E7]"
      aria-label="Featured Intergrid IT engineering tracks"
    >
      {/* Horizontal Auto-Scrolling Background Track */}
      <div
        className="absolute inset-0 flex h-full w-full transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ transform: `translateX(-${activeSlide * 100}%)` }}
        aria-hidden="true"
      >
        {HERO_SLIDES.map((slide) => (
          <div key={slide.id} className="relative w-full h-full shrink-0">
            {!imgError[slide.id] ? (
              <img
                src={slide.image}
                alt={slide.imageAlt}
                referrerPolicy="no-referrer"
                onError={() => setImgError((prev) => ({ ...prev, [slide.id]: true }))}
                className="w-full h-full object-cover object-center grayscale contrast-110"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#09090B] via-[#18181B] to-[#27272A]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-[#09090B]/92 via-[#09090B]/76 to-[#09090B]/50" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090B]/85 via-transparent to-[#09090B]/30" />
          </div>
        ))}
      </div>

      {/* Foreground Grid */}
      <div className="relative z-10 max-w-[1320px] mx-auto px-6 lg:px-10 py-14 lg:py-20 min-h-[640px] lg:min-h-[680px] flex flex-col justify-between">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center my-auto">
          {/* Left Typography Zone (auto-scrolls smoothly with active slide) */}
          <div className="lg:col-span-7 text-white">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="text-[13px] font-medium text-zinc-300 tracking-wide mb-4">
                  {current.kicker}
                </div>
                <h1
                  className="font-display font-semibold text-white leading-[1.08] tracking-[-0.025em] max-w-2xl"
                  style={{ fontSize: 'clamp(2.25rem, 4vw, 3.65rem)', textWrap: 'balance' }}
                >
                  {current.headline}
                </h1>
                <p className="mt-5 text-[16px] lg:text-[17px] leading-[1.6] text-zinc-300 max-w-xl">
                  {current.subheadline}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                onClick={onGetStarted}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-[8px] bg-white text-[#09090B] hover:bg-zinc-200 text-[14px] font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                <span>Start Learning</span>
                <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={onBrowseCatalog}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-[8px] border border-white/25 bg-white/8 hover:bg-white/15 text-white text-[14px] font-medium transition-colors whitespace-nowrap shrink-0"
              >
                <span>Explore Curriculum</span>
              </button>
            </div>

            <div className="mt-10 pt-6 border-t border-white/14 grid grid-cols-3 gap-6 max-w-lg">
              <div>
                <div className="text-[22px] font-display font-semibold tabular-nums text-white">
                  {current.metricValue}
                </div>
                <div className="text-[12px] text-zinc-400 mt-0.5">{current.metricLabel}</div>
              </div>
              <div>
                <div className="text-[22px] font-display font-semibold tabular-nums text-white">
                  100%
                </div>
                <div className="text-[12px] text-zinc-400 mt-0.5">Verifiable Credentials</div>
              </div>
              <div>
                <div className="text-[22px] font-display font-semibold tabular-nums text-white">
                  6 Tracks
                </div>
                <div className="text-[12px] text-zinc-400 mt-0.5">Systems & Security</div>
              </div>
            </div>
          </div>

          {/* Right Live Interactive Glass Dashboard Preview */}
          <div className="lg:col-span-5 flex justify-start lg:justify-end">
            <GlassDashboardPreview onExploreClick={onGetStarted} />
          </div>
        </div>

        {/* Passive Auto-Scroll Progress Indicator (No Toggle Buttons) */}
        <div className="mt-10 flex items-center justify-between gap-4 pt-4" aria-hidden="true">
          <div className="flex items-center gap-2.5 flex-1 max-w-xs">
            {HERO_SLIDES.map((s, idx) => {
              const isActive = idx === activeSlide;
              const isPast = idx < activeSlide;
              return (
                <div
                  key={s.id}
                  className={`h-1 rounded-[2px] bg-white/20 overflow-hidden transition-all duration-300 ${
                    isActive ? 'flex-[2]' : 'flex-1'
                  }`}
                >
                  {isActive ? (
                    <motion.div
                      key={`progress-${activeSlide}`}
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: SLIDE_DURATION_MS / 1000, ease: 'linear' }}
                      className="h-full bg-white"
                    />
                  ) : (
                    <div className={`h-full ${isPast ? 'w-full bg-white/60' : 'w-0'}`} />
                  )}
                </div>
              );
            })}
          </div>
          <span className="text-[12px] font-mono tabular-nums text-zinc-400">
            0{activeSlide + 1} / 0{HERO_SLIDES.length}
          </span>
        </div>
      </div>
    </section>
  );
};

