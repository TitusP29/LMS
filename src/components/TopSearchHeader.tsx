import React, { useMemo, useRef, useState } from 'react';
import {
  Award,
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  Compass,
  FileText,
  Flame,
  HelpCircle,
  Home,
  LogOut,
  Menu,
  Search,
  Send,
  Settings,
  Shield,
  User as UserIcon,
  X,
} from 'lucide-react';
import { useLMS } from '../store/LMSContext';
import { BrandMark } from './BrandMark';
import { getInitials } from '../utils/formatters';

export const TopSearchHeader: React.FC = () => {
  const {
    state,
    currentUser,
    route,
    navigate,
    globalSearchQuery,
    setGlobalSearchQuery,
    markNotificationRead,
    submitQuestion,
    toggleAutoAdvance,
    signOut,
  } = useLMS();

  const cleanPath = route.split('?')[0] || '/dashboard';

  // Expandable Search state
  const [searchHovered, setSearchHovered] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Popovers & Modals
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // 24/7 Support & FAQ modal state (migrated from SidebarNav)
  const [supportOpen, setSupportOpen] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [questionModule, setQuestionModule] = useState('General Support');
  const [submittedAck, setSubmittedAck] = useState(false);

  const isSearchExpanded =
    searchHovered || searchFocused || globalSearchQuery.trim().length > 0;

  const userNotifications = useMemo(
    () => state.notifications.filter((n) => n.userId === currentUser?.id),
    [state.notifications, currentUser?.id]
  );
  const unreadCount = userNotifications.filter((n) => !n.read).length;

  const publishedFaqs = useMemo(
    () => state.faqs.filter((f) => f.status === 'Published'),
    [state.faqs]
  );

  const searchResults = useMemo(() => {
    const q = globalSearchQuery.trim().toLowerCase();
    if (!q || !currentUser) return { modules: [], chapters: [], notes: [] };

    const enrolledIds = new Set(
      state.enrollments
        .filter((e) => e.userId === currentUser.id)
        .map((e) => e.moduleId)
    );

    const matchedModules = state.modules
      .filter(
        (m) =>
          m.status === 'Published' &&
          (m.title.toLowerCase().includes(q) ||
            m.code.toLowerCase().includes(q) ||
            m.category.toLowerCase().includes(q))
      )
      .map((m) => ({ ...m, isEnrolled: enrolledIds.has(m.id) }))
      .slice(0, 4);

    const matchedChapters: {
      moduleId: string;
      moduleCode: string;
      chapterId: string;
      chapterTitle: string;
      isEnrolled: boolean;
    }[] = [];

    state.modules.forEach((m) => {
      if (m.status !== 'Published') return;
      m.chapters.forEach((ch) => {
        if (
          ch.title.toLowerCase().includes(q) ||
          ch.summary.toLowerCase().includes(q)
        ) {
          matchedChapters.push({
            moduleId: m.id,
            moduleCode: m.code,
            chapterId: ch.id,
            chapterTitle: ch.title,
            isEnrolled: enrolledIds.has(m.id),
          });
        }
      });
    });

    const matchedNotes = state.notes
      .filter(
        (n) =>
          n.userId === currentUser.id && n.content.toLowerCase().includes(q)
      )
      .slice(0, 4)
      .map((n) => {
        const mod = state.modules.find((m) => m.id === n.moduleId);
        const ch = mod?.chapters.find((c) => c.id === n.chapterId);
        return {
          ...n,
          moduleTitle: mod?.title || 'Module',
          chapterTitle: ch?.title || 'Chapter',
        };
      });

    return {
      modules: matchedModules,
      chapters: matchedChapters.slice(0, 4),
      notes: matchedNotes,
    };
  }, [globalSearchQuery, currentUser, state.enrollments, state.modules, state.notes]);

  const hasResults =
    searchResults.modules.length > 0 ||
    searchResults.chapters.length > 0 ||
    searchResults.notes.length > 0;

  const handleNav = (path: string) => {
    navigate(path);
    setResourcesOpen(false);
    setProfileOpen(false);
    setNotifOpen(false);
    setMobileDrawerOpen(false);
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    submitQuestion(questionText, questionModule);
    setQuestionText('');
    setSubmittedAck(true);
    window.setTimeout(() => setSubmittedAck(false), 3500);
  };

  const isMyLearningActive =
    cleanPath === '/my-learning' || cleanPath.startsWith('/module/');
  const isCoursesActive = cleanPath === '/catalog';
  const isResourcesActive = cleanPath === '/notes' || cleanPath === '/certificates';

  const renderSearchDropdown = () =>
    globalSearchQuery.trim().length > 0 && (
      <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-[#E4E4E7] rounded-[8px] shadow-xl overflow-hidden z-50 max-h-[400px] overflow-y-auto min-w-[290px]">
        {!hasResults ? (
          <div className="p-4 text-[13px] text-[#71717A]">
            No modules, chapters, or private notes match "{globalSearchQuery}".
          </div>
        ) : (
          <div className="divide-y divide-[#E4E4E7]">
            {searchResults.modules.length > 0 && (
              <div className="p-2">
                <div className="px-2 py-1 text-[11px] font-medium text-[#71717A]">
                  Courses
                </div>
                {searchResults.modules.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onMouseDown={() => {
                      navigate(`/module/${m.id}`);
                      setGlobalSearchQuery('');
                      setSearchFocused(false);
                      setMobileSearchOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-[6px] hover:bg-[#F4F4F5] flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <BookOpen
                        className="w-3.5 h-3.5 text-[#09090B] shrink-0"
                        strokeWidth={1.5}
                      />
                      <span className="text-[13px] font-medium text-[#09090B] truncate">
                        {m.title}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-[#71717A] shrink-0">
                      {m.isEnrolled ? 'Enrolled' : m.code}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {searchResults.chapters.length > 0 && (
              <div className="p-2">
                <div className="px-2 py-1 text-[11px] font-medium text-[#71717A]">
                  Chapters
                </div>
                {searchResults.chapters.map((ch) => (
                  <button
                    key={ch.chapterId}
                    type="button"
                    onMouseDown={() => {
                      navigate(`/module/${ch.moduleId}?chapter=${ch.chapterId}`);
                      setGlobalSearchQuery('');
                      setSearchFocused(false);
                      setMobileSearchOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-[6px] hover:bg-[#F4F4F5] flex items-center justify-between gap-2"
                  >
                    <span className="text-[13px] text-[#09090B] truncate">
                      {ch.chapterTitle}
                    </span>
                    <span className="text-[11px] font-mono text-[#71717A] shrink-0">
                      {ch.moduleCode}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {searchResults.notes.length > 0 && (
              <div className="p-2">
                <div className="px-2 py-1 text-[11px] font-medium text-[#71717A]">
                  Private Notes
                </div>
                {searchResults.notes.map((note) => (
                  <button
                    key={note.id}
                    type="button"
                    onMouseDown={() => {
                      navigate(
                        `/module/${note.moduleId}?chapter=${note.chapterId}&notes=1`
                      );
                      setGlobalSearchQuery('');
                      setSearchFocused(false);
                      setMobileSearchOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-[6px] hover:bg-[#F4F4F5]"
                  >
                    <div className="flex items-center gap-2 text-[12px] font-medium text-[#09090B]">
                      <FileText className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                      <span className="truncate">{note.chapterTitle}</span>
                    </div>
                    <div className="text-[12px] text-[#71717A] truncate mt-0.5 pl-5">
                      {note.content.replace(/[#*`]/g, '')}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E4E4E7]">
        <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 h-16 flex items-center justify-between gap-3 sm:gap-4">
          {/* Left: Mobile Hamburger + Brand + Primary Navigation Links */}
          <div className="flex items-center gap-6 min-w-0">
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(true)}
                className="lg:hidden p-2 -ml-1 rounded-[6px] border border-[#E4E4E7] text-[#09090B] hover:bg-[#F4F4F5] transition-colors"
                aria-label="Open navigation menu"
              >
                <Menu className="w-4 h-4" strokeWidth={1.5} />
              </button>

              <button
                type="button"
                onClick={() => handleNav('/dashboard')}
                className="whitespace-nowrap shrink-0 text-left focus-visible:outline-none"
                aria-label="Intergrid IT Dashboard Home"
              >
                <BrandMark theme="light" />
              </button>
            </div>

            <nav
              className="hidden lg:flex items-center gap-1"
              aria-label="Primary workspace navigation"
            >
              <button
                type="button"
                onClick={() => handleNav('/my-learning')}
                className={`px-3 py-2 rounded-[6px] text-[13px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                  isMyLearningActive
                    ? 'bg-[#09090B] text-white'
                    : 'text-[#71717A] hover:text-[#09090B] hover:bg-[#F4F4F5]'
                }`}
              >
                My Learning
              </button>

              <button
                type="button"
                onClick={() => handleNav('/catalog')}
                className={`px-3 py-2 rounded-[6px] text-[13px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                  isCoursesActive
                    ? 'bg-[#09090B] text-white'
                    : 'text-[#71717A] hover:text-[#09090B] hover:bg-[#F4F4F5]'
                }`}
              >
                Courses
              </button>

              {/* Learning Resources Dropdown */}
              <div
                className="relative"
                onMouseLeave={() => setResourcesOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setResourcesOpen((o) => !o)}
                  onMouseEnter={() => setResourcesOpen(true)}
                  aria-expanded={resourcesOpen}
                  className={`inline-flex items-center gap-1 px-3 py-2 rounded-[6px] text-[13px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                    isResourcesActive
                      ? 'bg-[#09090B] text-white'
                      : 'text-[#71717A] hover:text-[#09090B] hover:bg-[#F4F4F5]'
                  }`}
                >
                  <span>Learning Resources</span>
                  <ChevronDown className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>

                {resourcesOpen && (
                  <div className="absolute left-0 top-full pt-1.5 w-[240px] z-50">
                    <div className="bg-white border border-[#E4E4E7] rounded-[8px] shadow-xl p-1.5 space-y-0.5">
                      <button
                        type="button"
                        onClick={() => handleNav('/notes')}
                        className={`w-full text-left px-3 py-2.5 rounded-[6px] flex items-start gap-2.5 transition-colors ${
                          cleanPath === '/notes'
                            ? 'bg-[#F4F4F5] text-[#09090B]'
                            : 'hover:bg-[#FAFAFA] text-[#09090B]'
                        }`}
                      >
                        <FileText
                          className="w-4 h-4 mt-0.5 text-[#09090B] shrink-0"
                          strokeWidth={1.5}
                        />
                        <div>
                          <div className="text-[13px] font-medium">Private Notes</div>
                          <div className="text-[11px] text-[#71717A]">
                            Search & edit chapter notes
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleNav('/certificates')}
                        className={`w-full text-left px-3 py-2.5 rounded-[6px] flex items-start gap-2.5 transition-colors ${
                          cleanPath === '/certificates'
                            ? 'bg-[#F4F4F5] text-[#09090B]'
                            : 'hover:bg-[#FAFAFA] text-[#09090B]'
                        }`}
                      >
                        <Award
                          className="w-4 h-4 mt-0.5 text-[#09090B] shrink-0"
                          strokeWidth={1.5}
                        />
                        <div>
                          <div className="text-[13px] font-medium">Certificates</div>
                          <div className="text-[11px] text-[#71717A]">
                            View & print credentials
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleNav('/catalog')}
                        className="w-full text-left px-3 py-2.5 rounded-[6px] flex items-start gap-2.5 hover:bg-[#FAFAFA] text-[#09090B] transition-colors"
                      >
                        <Compass
                          className="w-4 h-4 mt-0.5 text-[#09090B] shrink-0"
                          strokeWidth={1.5}
                        />
                        <div>
                          <div className="text-[13px] font-medium">Course Catalog</div>
                          <div className="text-[11px] text-[#71717A]">
                            Browse all engineering tracks
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSupportOpen(true)}
                className="px-3 py-2 rounded-[6px] text-[13px] font-medium text-[#71717A] hover:text-[#09090B] hover:bg-[#F4F4F5] transition-colors whitespace-nowrap shrink-0"
              >
                Support
              </button>
            </nav>
          </div>

          {/* Right: Expandable Search Bar, Notifications, Streak, Profile Dropdown */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Desktop/Tablet Hover-Expandable Search Bar */}
            <div
              className="hidden md:block relative"
              onMouseEnter={() => setSearchHovered(true)}
              onMouseLeave={() => setSearchHovered(false)}
            >
              <div
                onClick={() => searchInputRef.current?.focus()}
                className={`relative flex items-center h-9 rounded-[6px] border transition-[width,background-color,border-color] duration-200 ease-out overflow-hidden cursor-text ${
                  isSearchExpanded
                    ? 'w-[260px] xl:w-[320px] bg-white border-[#09090B]'
                    : 'w-10 bg-[#FAFAFA] border-[#E4E4E7] hover:border-[#09090B]'
                }`}
              >
                <Search
                  className="w-4 h-4 text-[#09090B] absolute left-3 shrink-0 pointer-events-none"
                  strokeWidth={1.5}
                />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={globalSearchQuery}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => window.setTimeout(() => setSearchFocused(false), 180)}
                  onChange={(e) => setGlobalSearchQuery(e.target.value)}
                  placeholder="Search courses, chapters, notes..."
                  aria-label="Search courses, chapters, and private notes"
                  className={`w-full h-full pl-9 pr-8 bg-transparent text-[13px] text-[#09090B] placeholder:text-[#71717A] focus:outline-none transition-opacity duration-150 ${
                    isSearchExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                />
                {globalSearchQuery && isSearchExpanded && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setGlobalSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-2.5 text-[#71717A] hover:text-[#09090B]"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                )}
              </div>

              {searchFocused && renderSearchDropdown()}
            </div>

            {/* Mobile Search Toggle */}
            <button
              type="button"
              onClick={() => setMobileSearchOpen((s) => !s)}
              aria-label="Toggle search"
              className="md:hidden w-9 h-9 rounded-[6px] border border-[#E4E4E7] bg-[#FAFAFA] hover:bg-[#F4F4F5] flex items-center justify-center text-[#09090B]"
            >
              {mobileSearchOpen ? (
                <X className="w-4 h-4" strokeWidth={1.5} />
              ) : (
                <Search className="w-4 h-4" strokeWidth={1.5} />
              )}
            </button>

            {/* Streak Counter */}
            <button
              type="button"
              onClick={() => handleNav('/profile')}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 h-9 rounded-[6px] border border-[#E4E4E7] bg-[#FAFAFA] hover:border-[#09090B] text-[12px] font-mono tabular-nums text-[#09090B] transition-colors whitespace-nowrap shrink-0"
              title="Daily learning streak"
            >
              <Flame className="w-3.5 h-3.5 text-[#09090B]" strokeWidth={1.5} />
              <span>{currentUser?.streakDays || 0}d streak</span>
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotifOpen((o) => !o);
                  setProfileOpen(false);
                }}
                aria-label="View notifications"
                className="relative w-9 h-9 rounded-[6px] border border-[#E4E4E7] bg-white hover:bg-[#F4F4F5] flex items-center justify-center text-[#09090B] transition-colors"
              >
                <Bell className="w-4 h-4" strokeWidth={1.5} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-[4px] bg-[#09090B] text-white text-[10px] font-mono tabular-nums flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-[310px] sm:w-[330px] bg-white border border-[#E4E4E7] rounded-[8px] shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#E4E4E7] flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-[#09090B]">
                      Notifications
                    </span>
                    <button
                      type="button"
                      onClick={() => setNotifOpen(false)}
                      className="text-[12px] text-[#71717A] hover:text-[#09090B]"
                    >
                      Close
                    </button>
                  </div>
                  <div className="max-h-[320px] overflow-y-auto divide-y divide-[#E4E4E7]">
                    {userNotifications.length === 0 ? (
                      <div className="p-4 text-[13px] text-[#71717A]">
                        No notifications yet.
                      </div>
                    ) : (
                      userNotifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3.5 ${n.read ? 'bg-white' : 'bg-[#FAFAFA]'}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                markNotificationRead(n.id);
                                setNotifOpen(false);
                                if (n.targetRoute) navigate(n.targetRoute);
                              }}
                              className="text-left flex-1 min-w-0"
                            >
                              <div className="text-[12px] font-semibold text-[#09090B]">
                                {n.title}
                              </div>
                              <div className="text-[12px] text-[#71717A] mt-0.5 leading-snug">
                                {n.detail}
                              </div>
                              <div className="text-[11px] font-mono text-[#71717A] mt-1">
                                {n.createdAt}
                              </div>
                            </button>
                            {!n.read && (
                              <button
                                type="button"
                                onClick={() => markNotificationRead(n.id)}
                                title="Mark as read"
                                className="p-1 rounded-[4px] hover:bg-[#E4E4E7] text-[#09090B]"
                              >
                                <Check className="w-3.5 h-3.5" strokeWidth={1.5} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile & Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen((o) => !o);
                  setNotifOpen(false);
                }}
                aria-expanded={profileOpen}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-[6px] border border-transparent hover:border-[#E4E4E7] hover:bg-[#FAFAFA] transition-colors"
              >
                {currentUser?.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-[6px] object-cover border border-[#E4E4E7] shrink-0"
                  />
                ) : (
                  <span className="w-8 h-8 rounded-[6px] bg-[#09090B] text-white text-[12px] font-mono font-medium flex items-center justify-center shrink-0">
                    {getInitials(currentUser?.name || 'IG')}
                  </span>
                )}
                <div className="hidden xl:block text-left max-w-[130px]">
                  <div className="text-[13px] font-medium text-[#09090B] leading-tight truncate">
                    {currentUser?.name}
                  </div>
                  <div className="text-[11px] text-[#71717A] leading-tight">
                    {currentUser?.role === 'admin' ? 'Admin' : 'Learner'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#71717A]" strokeWidth={1.5} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-[260px] bg-white border border-[#E4E4E7] rounded-[8px] shadow-xl z-50 overflow-hidden">
                  <div className="p-3.5 border-b border-[#E4E4E7] bg-[#FAFAFA]">
                    <div className="text-[13px] font-semibold text-[#09090B] truncate">
                      {currentUser?.name}
                    </div>
                    <div className="text-[12px] text-[#71717A] truncate">
                      {currentUser?.email}
                    </div>
                  </div>

                  <div className="p-1.5 space-y-0.5">
                    <button
                      type="button"
                      onClick={() => handleNav('/dashboard')}
                      className="w-full text-left px-3 py-2 rounded-[6px] hover:bg-[#F4F4F5] text-[13px] text-[#09090B] flex items-center gap-2.5"
                    >
                      <Home className="w-4 h-4 text-[#71717A]" strokeWidth={1.5} />
                      <span>Dashboard Home</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNav('/profile')}
                      className="w-full text-left px-3 py-2 rounded-[6px] hover:bg-[#F4F4F5] text-[13px] text-[#09090B] flex items-center gap-2.5"
                    >
                      <UserIcon className="w-4 h-4 text-[#71717A]" strokeWidth={1.5} />
                      <span>Profile & Settings</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNav('/notes')}
                      className="w-full text-left px-3 py-2 rounded-[6px] hover:bg-[#F4F4F5] text-[13px] text-[#09090B] flex items-center gap-2.5"
                    >
                      <FileText className="w-4 h-4 text-[#71717A]" strokeWidth={1.5} />
                      <span>Private Notes</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNav('/certificates')}
                      className="w-full text-left px-3 py-2 rounded-[6px] hover:bg-[#F4F4F5] text-[13px] text-[#09090B] flex items-center gap-2.5"
                    >
                      <Award className="w-4 h-4 text-[#71717A]" strokeWidth={1.5} />
                      <span>Certificates</span>
                    </button>

                    <div className="my-1 border-t border-[#E4E4E7]" />

                    <label className="px-3 py-2 rounded-[6px] hover:bg-[#F4F4F5] flex items-center justify-between gap-2 cursor-pointer">
                      <span className="text-[12px] text-[#09090B]">
                        Auto-advance chapters
                      </span>
                      <input
                        type="checkbox"
                        checked={currentUser?.autoAdvanceChapters ?? true}
                        onChange={(e) => toggleAutoAdvance(e.target.checked)}
                        className="w-4 h-4 accent-[#09090B]"
                      />
                    </label>

                    {currentUser?.role === 'admin' && (
                      <button
                        type="button"
                        onClick={() => handleNav('/admin')}
                        className="w-full text-left px-3 py-2 rounded-[6px] hover:bg-[#F4F4F5] text-[13px] font-medium text-[#09090B] flex items-center gap-2.5"
                      >
                        <Shield className="w-4 h-4 text-[#09090B]" strokeWidth={1.5} />
                        <span>Switch to Admin Console</span>
                      </button>
                    )}

                    <div className="my-1 border-t border-[#E4E4E7]" />

                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        signOut();
                      }}
                      className="w-full text-left px-3 py-2 rounded-[6px] hover:bg-[#F4F4F5] text-[13px] text-[#71717A] hover:text-[#09090B] flex items-center gap-2.5"
                    >
                      <LogOut className="w-4 h-4" strokeWidth={1.5} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Expandable Search Bar Row */}
        {mobileSearchOpen && (
          <div className="md:hidden px-4 pb-3 border-t border-[#E4E4E7] pt-3 bg-white">
            <div className="relative">
              <Search
                className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                strokeWidth={1.5}
              />
              <input
                type="search"
                autoFocus
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                placeholder="Search courses, chapters, private notes..."
                className="w-full pl-9 pr-8 py-2 rounded-[6px] border border-[#09090B] bg-white text-[13px] text-[#09090B] focus:outline-none"
              />
              {globalSearchQuery && (
                <button
                  type="button"
                  onClick={() => setGlobalSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#71717A]"
                  aria-label="Clear mobile search"
                >
                  <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              )}
              {renderSearchDropdown()}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative w-[290px] max-w-[85vw] h-full bg-[#09090B] text-white z-10 flex flex-col p-5">
            <div className="pb-4 border-b border-white/14 flex items-center justify-between">
              <BrandMark theme="dark" />
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 rounded-[6px] text-zinc-400 hover:text-white hover:bg-white/10"
                aria-label="Close mobile menu"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            <nav className="mt-5 flex-1 space-y-1" aria-label="Mobile workspace navigation">
              {[
                { label: 'Dashboard Home', path: '/dashboard', icon: Home },
                { label: 'My Learning', path: '/my-learning', icon: BookOpen },
                { label: 'Courses', path: '/catalog', icon: Compass },
                { label: 'Private Notes', path: '/notes', icon: FileText },
                { label: 'Certificates', path: '/certificates', icon: Award },
                { label: 'Profile & Settings', path: '/profile', icon: Settings },
              ].map((item) => {
                const Icon = item.icon;
                const active =
                  item.path === '/my-learning'
                    ? isMyLearningActive
                    : cleanPath === item.path;
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => handleNav(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[6px] text-[13px] font-medium transition-colors ${
                      active
                        ? 'bg-white text-[#09090B]'
                        : 'text-zinc-300 hover:text-white hover:bg-[#18181B]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  setMobileDrawerOpen(false);
                  setSupportOpen(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[6px] text-[13px] font-medium text-zinc-300 hover:text-white hover:bg-[#18181B]"
              >
                <HelpCircle className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                <span>24/7 Support & FAQ</span>
              </button>

              {currentUser?.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => handleNav('/admin')}
                  className="w-full mt-3 flex items-center gap-3 px-3 py-2.5 rounded-[6px] text-[13px] font-medium border border-white/15 text-zinc-200 hover:bg-[#18181B]"
                >
                  <Shield className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                  <span>Admin Console</span>
                </button>
              )}
            </nav>

            <div className="pt-4 border-t border-white/14">
              <button
                type="button"
                onClick={() => {
                  setMobileDrawerOpen(false);
                  signOut();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-[13px] text-zinc-400 hover:text-white hover:bg-[#18181B]"
              >
                <LogOut className="w-4 h-4" strokeWidth={1.5} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 24/7 Support & Curriculum FAQ Modal */}
      {supportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-[#E4E4E7] rounded-[10px] w-full max-w-[600px] max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-[#E4E4E7] flex items-center justify-between">
              <div>
                <h2 className="font-display font-semibold text-[18px] text-[#09090B]">
                  24/7 Support & Curriculum FAQ
                </h2>
                <p className="text-[13px] text-[#71717A]">
                  Submit a question to administrators or browse published answers.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSupportOpen(false)}
                className="p-2 rounded-[6px] text-[#71717A] hover:text-[#09090B] hover:bg-[#F4F4F5]"
                aria-label="Close support modal"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <form onSubmit={handleSupportSubmit} className="space-y-3">
                <div>
                  <label className="block text-[12px] font-medium text-[#09090B] mb-1">
                    Topic / Course
                  </label>
                  <select
                    value={questionModule}
                    onChange={(e) => setQuestionModule(e.target.value)}
                    className="w-full px-3 py-2 rounded-[6px] border border-[#E4E4E7] bg-white text-[13px] text-[#09090B] focus:outline-none focus:border-[#09090B]"
                  >
                    <option value="General Support">General Support</option>
                    <option value="Platform & Credentials">Platform & Credentials</option>
                    {state.modules.map((m) => (
                      <option key={m.id} value={m.title}>
                        {m.code} · {m.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#09090B] mb-1">
                    Your Question
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Ask about chapter concepts, lab setups, or certificate verification..."
                    className="w-full px-3 py-2 rounded-[6px] border border-[#E4E4E7] bg-white text-[13px] text-[#09090B] focus:outline-none focus:border-[#09090B]"
                  />
                </div>

                <div className="flex items-center justify-between gap-3">
                  {submittedAck ? (
                    <span className="text-[12px] font-medium text-[#09090B]">
                      Question sent to Admin inbox.
                    </span>
                  ) : (
                    <span className="text-[12px] text-[#71717A]">
                      Answered questions appear in the FAQ directory.
                    </span>
                  )}
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-[6px] bg-[#09090B] hover:bg-[#18181B] text-white text-[13px] font-medium transition-colors whitespace-nowrap shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>Submit Question</span>
                  </button>
                </div>
              </form>

              <div className="pt-4 border-t border-[#E4E4E7] space-y-3">
                <h3 className="font-display font-semibold text-[14px] text-[#09090B]">
                  Published Answers ({publishedFaqs.length})
                </h3>
                {publishedFaqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="p-4 rounded-[8px] bg-[#FAFAFA] border border-[#E4E4E7]"
                  >
                    <div className="text-[11px] font-mono text-[#71717A]">
                      {faq.moduleTitle} · Answered {faq.answeredAt || faq.createdAt}
                    </div>
                    <div className="text-[13px] font-semibold text-[#09090B] mt-1">
                      {faq.question}
                    </div>
                    <p className="text-[13px] text-[#71717A] mt-1.5 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
