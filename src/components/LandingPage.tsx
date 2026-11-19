import React, { useState } from 'react';
import { ArrowRight, ArrowUpRight, BookOpen, CheckSquare, Clock, FileText, ShieldCheck } from 'lucide-react';
import { useLMS } from '../store/LMSContext';
import { BrandMark } from './BrandMark';
import { LandingHeroCarousel } from './LandingHeroCarousel';
import { formatMinutes, getModuleTotalMinutes } from '../utils/formatters';

export const LandingPage: React.FC = () => {
  const { state, currentUser, navigate } = useLMS();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const publishedModules = state.modules.filter((m) => m.status === 'Published');
  const categories = ['All', 'Cloud & DevOps', 'Systems Engineering', 'Cybersecurity', 'Data Architecture'];

  const filteredModules =
    selectedCategory === 'All'
      ? publishedModules
      : publishedModules.filter((m) => m.category === selectedCategory);

  const publishedFaqs = state.faqs.filter((f) => f.status === 'Published');

  const handleEnterWorkspace = () => {
    if (currentUser) {
      navigate(currentUser.role === 'admin' ? '/admin' : '/dashboard');
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#09090B] flex flex-col">
      {/* Sticky Frosted Glass Navigation */}
      <header className="sticky top-0 z-40 glass-light border-b border-[#E4E4E7]">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between gap-8">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
            className="whitespace-nowrap shrink-0"
          >
            <BrandMark theme="light" />
          </a>

          <nav className="hidden md:flex items-center gap-7 text-[14px] font-medium text-[#71717A]">
            <a
              href="#catalog-preview"
              className="hover:text-[#09090B] transition-colors whitespace-nowrap shrink-0"
            >
              Catalog
            </a>
            <a
              href="#platform-architecture"
              className="hover:text-[#09090B] transition-colors whitespace-nowrap shrink-0"
            >
              Architecture
            </a>
            <a
              href="#credentials"
              className="hover:text-[#09090B] transition-colors whitespace-nowrap shrink-0"
            >
              Credentials
            </a>
            <a
              href="#faq"
              className="hover:text-[#09090B] transition-colors whitespace-nowrap shrink-0"
            >
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            {currentUser ? (
              <button
                type="button"
                onClick={handleEnterWorkspace}
                className="px-4 py-2 rounded-[6px] bg-[#09090B] hover:bg-[#18181B] text-white text-[13px] font-medium transition-colors whitespace-nowrap shrink-0"
              >
                Open Workspace
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/signin')}
                  className="px-3.5 py-2 rounded-[6px] text-[13px] font-medium text-[#09090B] hover:bg-zinc-100 transition-colors whitespace-nowrap shrink-0"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="px-4 py-2 rounded-[6px] bg-[#09090B] hover:bg-[#18181B] text-white text-[13px] font-medium transition-colors whitespace-nowrap shrink-0"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Carousel + Interactive Glass Preview */}
      <LandingHeroCarousel
        onGetStarted={handleEnterWorkspace}
        onBrowseCatalog={() => {
          document.getElementById('catalog-preview')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Catalog Teaser & Value Grid */}
      <section id="catalog-preview" className="py-20 lg:py-24 border-b border-[#E4E4E7] bg-white">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-10 border-b border-[#E4E4E7]">
            <div>
              <div className="text-[13px] font-medium text-[#71717A] mb-2">
                Curriculum Catalog
              </div>
              <h2
                className="font-display font-semibold text-[#09090B] max-w-2xl"
                style={{ fontSize: 'clamp(1.75rem, 2.8vw, 2.5rem)', textWrap: 'balance' }}
              >
                Disciplined engineering tracks built for production systems.
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-1 p-1 bg-[#F4F4F5] rounded-[8px] border border-[#E4E4E7]">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-[#09090B] text-white'
                      : 'text-[#71717A] hover:text-[#09090B]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModules.map((mod) => {
              const totalMinutes = getModuleTotalMinutes(mod);
              return (
                <article
                  key={mod.id}
                  className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-[8px] p-6 flex flex-col justify-between hover:border-[#09090B]/40 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-[12px] text-[#71717A] font-mono tabular-nums mb-3">
                      <span>{mod.code}</span>
                      <span>
                        {mod.category} · {mod.difficulty}
                      </span>
                    </div>
                    <h3 className="font-display font-semibold text-[18px] text-[#09090B] leading-snug">
                      {mod.title}
                    </h3>
                    <p className="mt-2.5 text-[14px] leading-[1.6] text-[#71717A]">
                      {mod.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#E4E4E7] flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-[12px] text-[#71717A] font-mono tabular-nums">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                        {formatMinutes(totalMinutes)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{mod.chapters.length} Chapters</span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        currentUser
                          ? navigate(`/module/${mod.id}`)
                          : navigate('/signin')
                      }
                      className="inline-flex items-center gap-1 text-[13px] font-medium text-[#09090B] hover:underline whitespace-nowrap shrink-0"
                    >
                      <span>Inspect Module</span>
                      <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Platform Capabilities Grid */}
      <section id="platform-architecture" className="py-20 lg:py-24 border-b border-[#E4E4E7] bg-[#FAFAFA]">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-10">
          <div className="max-w-2xl mb-12">
            <div className="text-[13px] font-medium text-[#71717A] mb-2">
              Workspace Architecture
            </div>
            <h2
              className="font-display font-semibold text-[#09090B]"
              style={{ fontSize: 'clamp(1.75rem, 2.8vw, 2.4rem)', textWrap: 'balance' }}
            >
              Every study artifact unified in one structured workspace.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-[#E4E4E7] rounded-[8px] p-6">
              <BookOpen className="w-5 h-5 text-[#09090B] mb-4" strokeWidth={1.5} />
              <div className="text-[12px] font-mono text-[#71717A] mb-1">01</div>
              <h3 className="font-display font-semibold text-[16px] text-[#09090B]">
                Sequential Chapters
              </h3>
              <p className="mt-2 text-[14px] leading-[1.6] text-[#71717A]">
                Clear time estimates per chapter, live completion tracking, and downloadable architectural specs.
              </p>
            </div>

            <div className="bg-white border border-[#E4E4E7] rounded-[8px] p-6">
              <FileText className="w-5 h-5 text-[#09090B] mb-4" strokeWidth={1.5} />
              <div className="text-[12px] font-mono text-[#71717A] mb-1">02</div>
              <h3 className="font-display font-semibold text-[16px] text-[#09090B]">
                Per-Chapter Private Notes
              </h3>
              <p className="mt-2 text-[14px] leading-[1.6] text-[#71717A]">
                Auto-saved technical scratchpads bound to each chapter and searchable from your global workspace header.
              </p>
            </div>

            <div className="bg-white border border-[#E4E4E7] rounded-[8px] p-6">
              <CheckSquare className="w-5 h-5 text-[#09090B] mb-4" strokeWidth={1.5} />
              <div className="text-[12px] font-mono text-[#71717A] mb-1">03</div>
              <h3 className="font-display font-semibold text-[16px] text-[#09090B]">
                Knowledge Check Engine
              </h3>
              <p className="mt-2 text-[14px] leading-[1.6] text-[#71717A]">
                Instant grading, technical answer explanations, and unlimited structured review attempts until mastery.
              </p>
            </div>

            <div className="bg-white border border-[#E4E4E7] rounded-[8px] p-6">
              <ShieldCheck className="w-5 h-5 text-[#09090B] mb-4" strokeWidth={1.5} />
              <div className="text-[12px] font-mono text-[#71717A] mb-1">04</div>
              <h3 className="font-display font-semibold text-[16px] text-[#09090B]">
                Attendance Certificates
              </h3>
              <p className="mt-2 text-[14px] leading-[1.6] text-[#71717A]">
                Printable monochrome credentials issued automatically with unique verification IDs on completion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Credentials Proof Band */}
      <section id="credentials" className="py-20 bg-[#09090B] text-white border-b border-[#18181B]">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <div className="text-[13px] text-zinc-400 mb-2">Verifiable Recognition</div>
            <h2
              className="font-display font-semibold text-white"
              style={{ fontSize: 'clamp(1.75rem, 2.8vw, 2.5rem)', textWrap: 'balance' }}
            >
              Certificates earned through verified chapter completion and assessment.
            </h2>
            <p className="mt-4 text-[15px] leading-[1.65] text-zinc-300 max-w-xl">
              Complete all chapters in a track, pass the Knowledge Check above the 75% threshold, and generate your Intergrid IT Certificate of Attendance immediately—or receive cohort endorsements directly from curriculum administrators.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[6px] bg-white text-[#09090B] hover:bg-zinc-200 text-[14px] font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                <span>Create Learner Account</span>
                <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={() => navigate('/signin')}
                className="px-4 py-2.5 rounded-[6px] border border-white/20 text-white hover:bg-white/10 text-[14px] font-medium transition-colors whitespace-nowrap shrink-0"
              >
                Sign In to Demo
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white text-[#09090B] rounded-[8px] p-7 border border-zinc-200">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
                <BrandMark theme="light" size="sm" />
                <span className="font-mono text-[11px] text-[#71717A] tabular-nums">
                  IG-2026-302-9841
                </span>
              </div>
              <div className="py-6">
                <div className="text-[11px] font-mono text-[#71717A] tracking-wider uppercase">
                  Certificate of Attendance
                </div>
                <div className="mt-2 font-display font-semibold text-[22px] text-[#09090B]">
                  Maya Lin
                </div>
                <p className="mt-1.5 text-[13px] text-[#71717A]">
                  Has completed all required chapters and technical assessments for
                </p>
                <div className="mt-3 font-display font-semibold text-[16px] text-[#09090B]">
                  Enterprise Cybersecurity & Zero Trust (IG-302)
                </div>
              </div>
              <div className="pt-4 border-t border-zinc-200 flex items-center justify-between text-[12px] text-[#71717A]">
                <span>Issued 2026-11-12</span>
                <span>Verified by Claire Sterling</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Published FAQ */}
      <section id="faq" className="py-20 bg-white border-b border-[#E4E4E7]">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-10">
          <div className="max-w-2xl mb-10">
            <div className="text-[13px] font-medium text-[#71717A] mb-2">
              Questions & Answers
            </div>
            <h2 className="font-display font-semibold text-[28px] text-[#09090B]">
              Frequently asked by engineering cohorts.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {publishedFaqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-[8px] p-6"
              >
                <div className="text-[12px] font-mono text-[#71717A] mb-2">
                  {faq.moduleTitle || 'Platform'} · {faq.answeredAt || faq.createdAt}
                </div>
                <h3 className="font-display font-semibold text-[16px] text-[#09090B]">
                  {faq.question}
                </h3>
                <p className="mt-2.5 text-[14px] leading-[1.6] text-[#71717A]">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quiet Footer */}
      <footer className="py-10 bg-[#FAFAFA]">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <BrandMark theme="light" size="sm" />
          <div className="text-[13px] text-[#71717A]">
            Intergrid IT Learning Management System · Monochrome Swiss Edition
          </div>
          <div className="flex items-center gap-5 text-[13px] text-[#71717A]">
            <button
              type="button"
              onClick={() => navigate('/signin')}
              className="hover:text-[#09090B] transition-colors"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="hover:text-[#09090B] transition-colors"
            >
              Sign Up
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
