import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function LandingPage() {
  const { isAuthenticated, user } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeRhythm, setActiveRhythm] = useState('Morning');

  const rhythmTasks = {
    Morning: [
      { title: 'Wipe down kitchen island & stove', person: 'Alex', time: '09:00', done: true },
      { title: 'Restock cold brew & oat milk', person: 'You', time: '10:15', done: true },
      { title: 'Water Monstera in the living room', person: 'Maya', time: '11:00', done: false, dueToday: true },
      { title: 'Settle electric & gas split (₹1,240)', person: 'All', time: 'Tomorrow', done: false }
    ],
    Afternoon: [
      { title: 'Receive grocery delivery package', person: 'Maya', time: '02:30 PM', done: true },
      { title: 'Run the robotic vacuum in hallway', person: 'You', time: '04:00 PM', done: false, dueToday: true },
      { title: 'Refill water filter pitcher', person: 'Alex', time: '05:15 PM', done: false }
    ],
    Evening: [
      { title: 'Take out compost & recycling bins', person: 'Alex', time: '07:30 PM', done: false, dueToday: true },
      { title: 'Load and start evening dishwasher', person: 'You', time: '09:00 PM', done: false, dueToday: true },
      { title: 'Lock balcony & dim common lights', person: 'Maya', time: '10:30 PM', done: false }
    ],
    Weekend: [
      { title: 'Deep clean shared bathroom & mirrors', person: 'Maya', time: 'Saturday 10 AM', done: false },
      { title: 'Farmers market fruit & pantry restock', person: 'You & Alex', time: 'Sunday 11 AM', done: false },
      { title: 'Vote on hosting movie night dinner', person: 'All', time: 'Active Poll', done: false }
    ]
  };

  return (
    <div className="min-h-screen bg-[#F4EDE3] text-[#234653] flex flex-col font-sans selection:bg-[#F2D4C8] selection:text-[#234653]">
      {/* Top Banner if logged in */}
      {isAuthenticated && (
        <div className="bg-[#234653] text-[#FFF9F1] px-4 py-2.5 text-xs text-center font-medium flex items-center justify-center gap-2 animate-fade-in-up">
          <span>Signed in as <strong>{user?.name}</strong>.</span>
          <Link to="/dashboard" className="underline hover:text-[#F2D4C8] font-semibold transition-colors">
            Go to your household space &rarr;
          </Link>
        </div>
      )}

      {/* Stylish & Elegant Editorial Navbar */}
      <header className="sticky top-0 z-40 bg-[#F4EDE3]/85 backdrop-blur-md border-b border-[#E8DEC8]/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-[#234653] text-[#FFF9F1] flex items-center justify-center font-serif text-lg font-bold shadow-xs group-hover:bg-[#17272C] group-hover:scale-105 group-active:scale-95 transition-all duration-200">
                ✦
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-[#234653] font-serif-editorial leading-none group-hover:text-[#17272C] transition-colors">
                  RoomSync
                </span>
                <span className="text-[10px] uppercase font-bold text-[#3E737C] tracking-widest mt-0.5 opacity-70">
                  Household Journal & OS
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links Pill */}
            <nav className="hidden md:flex items-center p-1 bg-[#FAF5ED]/80 rounded-2xl border border-[#E8DEC8]/70 shadow-2xs space-x-1">
              <a href="#overview" className="px-4 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-[#3E737C] hover:text-[#234653] hover:bg-[#FFF9F1] transition-all duration-200">
                Overview
              </a>
              <a href="#weekly-rhythm" className="px-4 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-[#3E737C] hover:text-[#234653] hover:bg-[#FFF9F1] transition-all duration-200">
                Rhythm
              </a>
              <a href="#features" className="px-4 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-[#3E737C] hover:text-[#234653] hover:bg-[#FFF9F1] transition-all duration-200">
                Features
              </a>
              <a href="#how-it-works" className="px-4 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-[#3E737C] hover:text-[#234653] hover:bg-[#FFF9F1] transition-all duration-200">
                How it works
              </a>
              <a href="#activity" className="px-4 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-[#3E737C] hover:text-[#234653] hover:bg-[#FFF9F1] transition-all duration-200">
                Live Timeline
              </a>
            </nav>

            {/* Desktop Right Auth Actions */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-xl bg-[#E86F5A] hover:bg-[#D65D48] hover-glow-coral text-[#FFF9F1] shadow-xs hover:shadow transition-all duration-200 active:scale-95"
                >
                  Open Household &rarr;
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#234653] hover:text-[#17272C] hover:bg-[#FAF5ED] rounded-xl transition-all duration-200 active:scale-95 border border-transparent hover:border-[#E8DEC8]"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-xl bg-[#E86F5A] hover:bg-[#D65D48] hover-glow-coral text-[#FFF9F1] shadow-xs hover:shadow transition-all duration-200 active:scale-95"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-2xl text-[#3E737C] hover:text-[#234653] bg-[#FAF5ED]/80 hover:bg-[#FFF9F1] border border-[#E8DEC8]/80 transition-all active:scale-95"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[#E8DEC8] bg-[#FFF9F1] px-5 pt-3 pb-6 space-y-4 animate-dropdown shadow-lg">
            <nav className="flex flex-col space-y-1.5">
              <a
                href="#overview"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-[#234653] hover:bg-[#FAF5ED]"
              >
                Overview
              </a>
              <a
                href="#weekly-rhythm"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-[#234653] hover:bg-[#FAF5ED]"
              >
                Household Rhythm
              </a>
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-[#234653] hover:bg-[#FAF5ED]"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-[#234653] hover:bg-[#FAF5ED]"
              >
                How it works
              </a>
              <a
                href="#activity"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-[#234653] hover:bg-[#FAF5ED]"
              >
                Live Timeline
              </a>
            </nav>
            <div className="pt-3 border-t border-[#E8DEC8] flex flex-col gap-2">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="w-full text-center px-4 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-xl bg-[#E86F5A] text-[#FFF9F1] shadow-xs"
                >
                  Open Household &rarr;
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="w-full text-center px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#234653] border border-[#E8DEC8] rounded-xl bg-[#FAF5ED]"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="w-full text-center px-4 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-xl bg-[#E86F5A] text-[#FFF9F1] shadow-xs"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section with Warm Editorial Artwork & Animations */}
      <section id="overview" className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-12 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-6 space-y-6 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF5ED] border border-[#E8DEC8] text-xs font-semibold text-[#234653] shadow-2xs hover:border-[#3E737C]/40 transition-colors">
                <span className="w-2 h-2 rounded-full bg-[#E86F5A] animate-pulse-gentle"></span>
                A quiet space for everyday shared living
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-[#234653] tracking-tight leading-[1.1] font-serif-editorial">
                A calmer way to run your household together.
              </h1>

              <p className="text-base sm:text-lg text-[#3E737C] leading-relaxed max-w-xl">
                RoomSync brings chores, expenses, shopping, decisions, help, and shared responsibilities into one synchronized household space.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link
                  to="/register"
                  className="px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-center rounded-xl bg-[#E86F5A] hover:bg-[#D65D48] hover-glow-coral text-[#FFF9F1] shadow-xs hover:shadow transition-all duration-200 active:scale-95"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/login"
                  className="px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-center rounded-xl bg-[#FFF9F1] border border-[#E8DEC8] hover:bg-[#FAF5ED] hover:border-[#3E737C]/40 text-[#234653] transition-all duration-200 active:scale-95 shadow-2xs"
                >
                  Sign In
                </Link>
              </div>

              <div className="pt-4 flex items-center gap-6 text-xs text-[#3E737C] font-medium">
                <div className="flex items-center gap-1.5 hover:text-[#234653] transition-colors">
                  <span className="text-[#E86F5A]">✦</span>
                  Instant roommate invites
                </div>
                <div className="flex items-center gap-1.5 hover:text-[#234653] transition-colors">
                  <span className="text-[#E86F5A]">✦</span>
                  Fair workload tracking
                </div>
                <div className="flex items-center gap-1.5 hover:text-[#234653] transition-colors">
                  <span className="text-[#E86F5A]">✦</span>
                  No awkward reminders
                </div>
              </div>
            </div>

            {/* Hero Right: Bespoke Artwork Showcase */}
            <div className="lg:col-span-6 relative animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              <div className="relative mx-auto max-w-lg lg:max-w-none">
                {/* Visual Artwork Container with Hover Lift */}
                <div className="relative bg-[#FFF9F1] border border-[#E8DEC8] rounded-3xl p-3 sm:p-4 shadow-xl overflow-hidden hover-lift group">
                  <div className="relative rounded-2xl overflow-hidden border border-[#E8DEC8]/80 aspect-4/3">
                    <img
                      src="/assets/hero-living-room.jpg"
                      alt="RoomSync Living Room Morning"
                      className="w-full h-full object-cover transform group-hover:scale-103 transition-transform duration-700 ease-out"
                    />
                    
                    {/* Editorial Badge Tag */}
                    <div className="absolute bottom-3 left-3 bg-[#FFF9F1]/95 backdrop-blur-xs border border-[#E8DEC8] px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#234653] flex items-center gap-2 shadow-2xs group-hover:border-[#3E737C]/40 transition-colors">
                      <span>🏠</span>
                      <span className="font-serif-editorial">The Maple Flat • Morning Rhythm</span>
                    </div>

                    <div className="absolute top-3 right-3 bg-[#234653]/90 text-[#FFF9F1] px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase flex items-center gap-1.5 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E86F5A] animate-pulse"></span>
                      Synchronized
                    </div>
                  </div>

                  {/* Overlaid Mini Journal Strip with Hover Effect */}
                  <div className="mt-3 p-3 bg-[#FAF5ED] hover:bg-[#FBF1EB]/60 rounded-xl border border-[#E8DEC8]/80 flex items-center justify-between text-xs transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#E86F5A] text-white flex items-center justify-center text-[10px] font-bold shadow-2xs">
                        ✓
                      </span>
                      <span className="font-semibold text-[#234653]">Alex made fresh coffee & emptied dishwasher</span>
                    </div>
                    <span className="text-[10px] text-[#3E737C] font-mono">08:45 AM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Decorative Editorial Divider */}
      <div className="flex items-center justify-center gap-4 py-6 max-w-md mx-auto text-[#E8DEC8]">
        <div className="h-px bg-[#E8DEC8] flex-1"></div>
        <span className="text-[#E7A83C] text-sm font-serif">✦</span>
        <div className="h-px bg-[#E8DEC8] flex-1"></div>
      </div>

      {/* "This Week at Home" Companion Artwork & Interactive Rhythm Section */}
      <section id="weekly-rhythm" className="py-16 sm:py-24 border-t border-[#E8DEC8] bg-[#F4EDE3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#234653] tracking-tight font-serif-editorial">
              This week at home.
            </h2>
            <p className="mt-3 text-base text-[#3E737C] leading-relaxed">
              The same view you open every morning: what is due, what is done, and one quiet line to coordinate it together.
            </p>
          </div>

          {/* 2-Column Art + Journal Checklist Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left: Vertical Artwork Card with Badge & Hover Lift */}
            <div className="lg:col-span-5 relative">
              <div className="h-full min-h-[420px] rounded-3xl overflow-hidden border border-[#E8DEC8] relative shadow-md bg-[#FFF9F1] hover-lift group">
                <img
                  src="/assets/kitchen-counter.jpg"
                  alt="Kitchen Pantry in Morning Light"
                  className="w-full h-full object-cover transform group-hover:scale-103 transition-transform duration-700 ease-out"
                />
                
                {/* Floating pill badge */}
                <div className="absolute bottom-4 left-4 bg-[#FFF9F1]/95 backdrop-blur-xs border border-[#E8DEC8] px-4 py-2 rounded-2xl text-xs font-semibold text-[#234653] shadow-xs flex items-center gap-2 group-hover:border-[#3E737C]/40 transition-colors">
                  <span className="text-[#E86F5A]">✦</span>
                  <span className="font-serif-editorial">Kitchen & Pantry, 9:00 AM</span>
                </div>
              </div>
            </div>

            {/* Right: Interactive Household Journal & Task Card */}
            <div className="lg:col-span-7">
              <div className="bg-[#FFF9F1] border border-[#E8DEC8] rounded-3xl p-6 sm:p-8 shadow-md space-y-6 flex flex-col justify-between h-full hover:border-[#3E737C]/30 transition-colors">
                <div>
                  {/* Card Header & Progress */}
                  <div className="flex items-center justify-between pb-4 border-b border-[#E8DEC8]">
                    <div>
                      <h3 className="text-xl font-bold text-[#234653] font-serif-editorial">
                        Maple Suite, week 38
                      </h3>
                      <span className="text-xs text-[#3E737C] mt-0.5 block">Shared apartment journal</span>
                    </div>
                    <span className="text-xs font-semibold text-[#234653] bg-[#FAF5ED] px-3 py-1 rounded-full border border-[#E8DEC8] shadow-2xs">
                      4 of 6 tended
                    </span>
                  </div>

                  {/* Rhythm Filter Tabs */}
                  <div className="flex items-center gap-2 pt-4 pb-2 border-b border-[#E8DEC8]/50">
                    {['Morning', 'Afternoon', 'Evening', 'Weekend'].map((rhythm) => (
                      <button
                        key={rhythm}
                        type="button"
                        onClick={() => setActiveRhythm(rhythm)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 active:scale-95 ${
                          activeRhythm === rhythm
                            ? 'bg-[#E86F5A] text-[#FFF9F1] shadow-2xs'
                            : 'text-[#3E737C] hover:text-[#234653] hover:bg-[#FAF5ED]'
                        }`}
                      >
                        {rhythm}
                      </button>
                    ))}
                  </div>

                  {/* Dynamic Checklist Items for Active Rhythm */}
                  <div className="space-y-2.5 pt-4">
                    {rhythmTasks[activeRhythm]?.map((task, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200 text-xs ${
                          task.done
                            ? 'bg-[#FAF5ED]/60 border-[#E8DEC8]/50 text-[#3E737C]'
                            : 'bg-[#FFF9F1] hover:bg-[#FAF5ED] border-[#E8DEC8] text-[#234653] shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {task.done ? (
                            <span className="w-4 h-4 rounded-full bg-[#E86F5A] text-white flex items-center justify-center text-[9px] font-bold shadow-2xs">
                              ✓
                            </span>
                          ) : (
                            <span className="w-4 h-4 rounded-full border border-[#3E737C]/60 flex items-center justify-center hover:border-[#E86F5A] transition-colors"></span>
                          )}
                          <span className={`${task.done ? 'line-through text-[#3E737C]/80' : 'font-semibold text-[#234653]'}`}>
                            {task.title}
                          </span>
                        </div>
                        <span className={`text-[11px] font-medium ${task.dueToday ? 'text-[#E86F5A] font-semibold' : 'text-[#3E737C]'}`}>
                          {task.person} • {task.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Search Bar & Action Trigger */}
                <div className="pt-4 border-t border-[#E8DEC8] space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      placeholder="Search chores, notes, or grocery list..."
                      className="w-full px-4 py-2.5 text-xs bg-[#FAF5ED] border border-[#E8DEC8] hover:border-[#3E737C]/40 rounded-xl text-[#3E737C] cursor-pointer transition-colors shadow-2xs"
                    />
                    <span className="absolute right-3.5 top-3 text-xs">🔍</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2 text-xs text-[#3E737C]">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#E86F5A] text-white flex items-center justify-center text-[8px]">✓</span>
                      <span>Remind roommates gently before due time</span>
                    </div>
                    <Link
                      to="/register"
                      className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-xl bg-[#E86F5A] hover:bg-[#D65D48] hover-glow-coral text-[#FFF9F1] shadow-xs hover:shadow transition-all duration-200 active:scale-95"
                    >
                      Log today's visit &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Decorative Editorial Divider */}
      <div className="flex items-center justify-center gap-4 py-6 max-w-md mx-auto text-[#E8DEC8]">
        <div className="h-px bg-[#E8DEC8] flex-1"></div>
        <span className="text-[#E7A83C] text-sm font-serif">✦</span>
        <div className="h-px bg-[#E8DEC8] flex-1"></div>
      </div>

      {/* Feature Section: Editorial Asymmetric Composition with Hover Lifts */}
      <section id="features" className="py-20 sm:py-28 border-t border-[#E8DEC8] bg-[#FFF9F1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E86F5A]">Capabilities</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#234653] tracking-tight mt-2 font-serif-editorial">
              Everything your household needs, in one place.
            </h2>
            <p className="mt-3 text-base sm:text-lg text-[#3E737C] leading-relaxed">
              Designed specifically for shared living. No corporate clutter, no confusing spreadsheets, just effortless synchronization.
            </p>
          </div>

          {/* Asymmetric Composition */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {/* Featured Primary Card: Chores (Spans 3 cols on lg) */}
            <div className="md:col-span-3 lg:col-span-3 rounded-3xl p-8 bg-[#FAF5ED] border border-[#E8DEC8] hover-lift group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#DCE8E8] text-[#234653] flex items-center justify-center text-2xl mb-5 shadow-2xs group-hover:scale-110 transition-transform duration-200">
                  🧹
                </div>
                <h3 className="text-xl font-bold text-[#234653] font-serif-editorial group-hover:text-[#17272C] transition-colors">
                  Chores & Fair Rotations
                </h3>
                <p className="mt-2 text-[#3E737C] text-sm leading-relaxed">
                  Assign, automate, and track recurring chores without nagging. Intelligent rotation ensures cleaning responsibilities stay evenly distributed across all roommates.
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-[#E8DEC8] flex items-center justify-between text-xs text-[#3E737C]">
                <span>Auto-rotation cycles</span>
                <span className="font-semibold text-[#E86F5A] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  Time-window scheduling &rarr;
                </span>
              </div>
            </div>

            {/* Featured Card 2: Expenses & Split Balances (Spans 3 cols on lg) */}
            <div className="md:col-span-3 lg:col-span-3 rounded-3xl p-8 bg-[#FAF5ED] border border-[#E8DEC8] hover-lift group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#F2D4C8] text-[#234653] flex items-center justify-center text-2xl mb-5 shadow-2xs group-hover:scale-110 transition-transform duration-200">
                  💰
                </div>
                <h3 className="text-xl font-bold text-[#234653] font-serif-editorial group-hover:text-[#17272C] transition-colors">
                  Expenses & Simplified Debts
                </h3>
                <p className="mt-2 text-[#3E737C] text-sm leading-relaxed">
                  Log shared groceries, utilities, and rent. Automatic multi-party debt simplification minimizes transfers so settling up is quick and transparent.
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-[#E8DEC8] flex items-center justify-between text-xs text-[#3E737C]">
                <span>Equal or custom splits</span>
                <span className="font-semibold text-[#E86F5A] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  Multi-way settlement &rarr;
                </span>
              </div>
            </div>

            {/* Supporting Card 3: Shopping */}
            <div className="md:col-span-1 lg:col-span-2 rounded-2xl p-6 bg-[#FAF5ED] border border-[#E8DEC8] hover-lift group">
              <div className="w-10 h-10 rounded-xl bg-[#FFF9F1] text-[#234653] border border-[#E8DEC8] flex items-center justify-center text-xl mb-4 shadow-2xs group-hover:scale-110 transition-transform">
                🛍️
              </div>
              <h3 className="text-base font-bold text-[#234653] font-serif-editorial">Shared Shopping</h3>
              <p className="mt-1.5 text-xs text-[#3E737C] leading-relaxed">
                Add grocery items the moment you notice them running low. Anyone at the store can check off items in real time.
              </p>
            </div>

            {/* Supporting Card 4: Help & Favors */}
            <div className="md:col-span-1 lg:col-span-2 rounded-2xl p-6 bg-[#FAF5ED] border border-[#E8DEC8] hover-lift group">
              <div className="w-10 h-10 rounded-xl bg-[#FBF1EB] text-[#234653] border border-[#F2D4C8] flex items-center justify-center text-xl mb-4 shadow-2xs group-hover:scale-110 transition-transform">
                🤝
              </div>
              <h3 className="text-base font-bold text-[#234653] font-serif-editorial">Help & Favors</h3>
              <p className="mt-1.5 text-xs text-[#3E737C] leading-relaxed">
                Need a hand moving furniture or someone to pick up a package? Post a request and roommates can accept instantly.
              </p>
            </div>

            {/* Supporting Card 5: Decisions & Polls */}
            <div className="md:col-span-1 lg:col-span-2 rounded-2xl p-6 bg-[#FAF5ED] border border-[#E8DEC8] hover-lift group">
              <div className="w-10 h-10 rounded-xl bg-[#DCE8E8] text-[#234653] flex items-center justify-center text-xl mb-4 shadow-2xs group-hover:scale-110 transition-transform">
                🗳️
              </div>
              <h3 className="text-base font-bold text-[#234653] font-serif-editorial">Decisions & Polls</h3>
              <p className="mt-1.5 text-xs text-[#3E737C] leading-relaxed">
                Resolve household decisions without endless texting. Vote on internet plans, hosting guests, or household items.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works: Connected Visual Flow */}
      <section id="how-it-works" className="py-20 sm:py-28 border-t border-[#E8DEC8] bg-[#F4EDE3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E86F5A]">Simplicity</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#234653] tracking-tight mt-2 font-serif-editorial">
              Less coordination. More living.
            </h2>
            <p className="mt-3 text-base text-[#3E737C]">
              Three simple steps to keep your household running smoothly every day.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-[#FFF9F1] p-8 rounded-3xl border border-[#E8DEC8] shadow-2xs space-y-3 hover-lift">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-[#234653] text-[#FFF9F1] font-mono text-xs font-bold shadow-2xs">
                01
              </div>
              <h3 className="text-lg font-bold text-[#234653] font-serif-editorial">Add</h3>
              <p className="text-xs text-[#3E737C] leading-relaxed">
                Add chores, split expenses, shopping items, quick favors, or group decisions in seconds from any device.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#FFF9F1] p-8 rounded-3xl border border-[#E8DEC8] shadow-2xs space-y-3 hover-lift">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-[#E86F5A] text-[#FFF9F1] font-mono text-xs font-bold shadow-2xs">
                02
              </div>
              <h3 className="text-lg font-bold text-[#234653] font-serif-editorial">Sync</h3>
              <p className="text-xs text-[#3E737C] leading-relaxed">
                Everyone in the household sees relevant updates instantly. Real-time notifications keep everyone on the same page.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#FFF9F1] p-8 rounded-3xl border border-[#E8DEC8] shadow-2xs space-y-3 hover-lift">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-[#E7A83C] text-[#FFF9F1] font-mono text-xs font-bold shadow-2xs">
                03
              </div>
              <h3 className="text-lg font-bold text-[#234653] font-serif-editorial">Stay balanced</h3>
              <p className="text-xs text-[#3E737C] leading-relaxed">
                Responsibilities and contributions remain visible. Everyone does their fair share and balances stay settled.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Synchronized Household Timeline Section with Artwork */}
      <section id="activity" className="py-20 sm:py-28 border-t border-[#E8DEC8] bg-[#FFF9F1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Headline & Artwork Thumbnail */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#E86F5A]">Transparency</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#234653] tracking-tight leading-tight font-serif-editorial">
                Everyone knows what's happening.
              </h2>
              <p className="text-base text-[#3E737C] leading-relaxed">
                No more wondering if the bins were taken out, who bought the milk, or when the utility bill is due. RoomSync gives everyone clarity without micro-management.
              </p>

              <div className="rounded-2xl overflow-hidden border border-[#E8DEC8] aspect-3/2 shadow-xs hover-lift group">
                <img
                  src="/assets/entryway-nook.jpg"
                  alt="Entryway and living nook"
                  className="w-full h-full object-cover transform group-hover:scale-103 transition-transform duration-700 ease-out"
                />
              </div>

              <div className="pt-2">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E86F5A] hover:text-[#D65D48] transition-colors"
                >
                  Start your household space &rarr;
                </Link>
              </div>
            </div>

            {/* Right: Visual Activity Timeline */}
            <div className="lg:col-span-7">
              <div className="bg-[#FAF5ED] rounded-3xl p-6 sm:p-8 border border-[#E8DEC8] space-y-5 shadow-xs hover:border-[#3E737C]/30 transition-colors">
                <div className="flex items-center justify-between pb-3 border-b border-[#E8DEC8]">
                  <span className="text-xs font-bold text-[#234653] tracking-wide uppercase font-serif-editorial">
                    Household Activity Stream
                  </span>
                  <span className="text-xs text-[#E86F5A] font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#E86F5A] animate-pulse"></span> Live Updates
                  </span>
                </div>

                <div className="space-y-3.5">
                  {/* Item 1 */}
                  <div className="flex items-start gap-3.5 group">
                    <div className="w-8 h-8 rounded-full bg-[#DCE8E8] text-[#234653] flex items-center justify-center font-bold text-xs shrink-0 font-serif group-hover:scale-110 transition-transform">
                      A
                    </div>
                    <div className="flex-1 bg-[#FFF9F1] group-hover:bg-[#FAF5ED] p-3.5 rounded-xl border border-[#E8DEC8]/80 text-xs transition-colors shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#234653]">Alex completed Kitchen Cleanup</span>
                        <span className="text-[10px] text-[#3E737C]">10:42 AM</span>
                      </div>
                      <p className="text-[#3E737C] mt-0.5">Assigned chore for Thursday morning</p>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="flex items-start gap-3.5 group">
                    <div className="w-8 h-8 rounded-full bg-[#F2D4C8] text-[#234653] flex items-center justify-center font-bold text-xs shrink-0 font-serif group-hover:scale-110 transition-transform">
                      Y
                    </div>
                    <div className="flex-1 bg-[#FFF9F1] group-hover:bg-[#FAF5ED] p-3.5 rounded-xl border border-[#E8DEC8]/80 text-xs transition-colors shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#234653]">You added groceries</span>
                        <span className="text-[10px] text-[#3E737C]">09:18 AM</span>
                      </div>
                      <p className="text-[#3E737C] mt-0.5">3 items checked off shopping list</p>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="flex items-start gap-3.5 group">
                    <div className="w-8 h-8 rounded-full bg-[#E8DEC8] text-[#234653] flex items-center justify-center font-bold text-xs shrink-0 font-serif group-hover:scale-110 transition-transform">
                      M
                    </div>
                    <div className="flex-1 bg-[#FFF9F1] group-hover:bg-[#FAF5ED] p-3.5 rounded-xl border border-[#E8DEC8]/80 text-xs transition-colors shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#234653]">Maya requested help</span>
                        <span className="text-[10px] text-[#3E737C]">08:30 AM</span>
                      </div>
                      <p className="text-[#3E737C] mt-0.5">"Need someone to receive package around 2 PM"</p>
                    </div>
                  </div>

                  {/* Item 4 */}
                  <div className="flex items-start gap-3.5 group">
                    <div className="w-8 h-8 rounded-full bg-[#FAF5ED] border border-[#E8DEC8] text-[#234653] flex items-center justify-center font-bold text-xs shrink-0 font-serif group-hover:scale-110 transition-transform">
                      R
                    </div>
                    <div className="flex-1 bg-[#FFF9F1] group-hover:bg-[#FAF5ED] p-3.5 rounded-xl border border-[#E8DEC8]/80 text-xs transition-colors shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#234653]">Shared electricity expense added</span>
                        <span className="text-[10px] text-[#3E737C]">Yesterday</span>
                      </div>
                      <p className="text-[#3E737C] mt-0.5">₹1,240 split equally among 3 roommates</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action Section with Peach Block */}
      <section className="py-20 sm:py-24 border-t border-[#E8DEC8] bg-[#F4EDE3]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-[#FBF1EB] border border-[#F2D4C8] text-center space-y-6 shadow-sm hover-lift">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E86F5A]">Start Your Household</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#234653] tracking-tight font-serif-editorial">
              Make your household easier to manage.
            </h2>
            <p className="text-base text-[#3E737C] max-w-xl mx-auto leading-relaxed">
              Bring everyday responsibilities into one shared space. Get started in less than two minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 text-xs font-semibold uppercase tracking-wider rounded-xl bg-[#E86F5A] hover:bg-[#D65D48] hover-glow-coral text-[#FFF9F1] shadow-xs hover:shadow transition-all duration-200 active:scale-95"
              >
                Create your household
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-3.5 text-xs font-semibold uppercase tracking-wider rounded-xl bg-[#FFF9F1] border border-[#E8DEC8] hover:bg-[#FAF5ED] text-[#234653] transition-all duration-200 active:scale-95 shadow-2xs"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="border-t border-[#E8DEC8] bg-[#FAF5ED] py-12 text-xs text-[#3E737C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#234653] text-[#FFF9F1] flex items-center justify-center font-serif text-base font-bold">
              ✦
            </div>
            <div>
              <span className="font-bold text-[#234653] text-sm font-serif-editorial">RoomSync</span>
              <p className="text-[#3E737C] mt-0.5">A calmer way to coordinate everyday life.</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <a href="#overview" className="hover:text-[#234653] transition-colors">Overview</a>
            <a href="#weekly-rhythm" className="hover:text-[#234653] transition-colors">Rhythm</a>
            <a href="#features" className="hover:text-[#234653] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#234653] transition-colors">How it works</a>
            <Link to="/login" className="hover:text-[#234653] transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-[#234653] transition-colors">Register</Link>
          </div>

          <div>
            &copy; {new Date().getFullYear()} RoomSync. A calmer household space.
          </div>
        </div>
      </footer>
    </div>
  );
}
