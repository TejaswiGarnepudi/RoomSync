import React, { useEffect, useState, useRef, useCallback } from 'react';

/**
 * Hero3DCardStage
 * Directly adapted from the Sparkdesign Hero Canvas Preview:
 * - Rounded 32px aspect canvas card with ambient blurred glow backdrop
 * - Top category tags ("Maple Flat #3B", "Live Journal")
 * - Interior title ("A study in shared harmony.")
 * - Floating Roommate Cursor tag ("Maya" / "Alex")
 * - Floating Comment Card ("Maya: Kitchen cleaned & coffee restocked!")
 * - Floating Status Pill ("3 flatmates. One shared home.")
 * - Interactive sample preview tabs (Chores, Splits, Grocery)
 * - 3D mouse parallax and scroll dispersion
 */
export default function Hero3DCardStage({ className = '' }) {
  const containerRef = useRef(null);
  const [activeTab, setActiveTab] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [commentResolved, setCommentResolved] = useState(false);
  const animFrameRef = useRef(null);

  const projects = [
    {
      title: 'A study in shared harmony.',
      tag: 'Maple Flat #3B / Chore OS',
      badge: 'Active Rotation',
      img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      comment: 'Kitchen cleaned & cold brew restocked! Who is taking dinner duty tonight?',
      commentAuthor: 'Maya',
      commentTime: 'just now',
      roommates: '3 flatmates. All chores synced.',
      pointerName: 'Maya',
      pointerPos: { top: '38%', right: '22%' }
    },
    {
      title: 'Clarity that keeps the peace.',
      tag: 'Expense Splitter / Wi-Fi & Rent',
      badge: 'Debt Simplified',
      img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      comment: 'Uploaded ₹2,400 grocery bill — automatic 3-way split calculated!',
      commentAuthor: 'Alex',
      commentTime: '2m ago',
      roommates: '1 transfer needed. No awkward math.',
      pointerName: 'Alex',
      pointerPos: { top: '44%', right: '28%' }
    },
    {
      title: 'Pantry always in stock.',
      tag: 'Shared Basket / Real-time',
      badge: '4 Items Pending',
      img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
      comment: 'Added oat milk & espresso beans to the list. Grabbing it at 5 PM.',
      commentAuthor: 'You',
      commentTime: '5m ago',
      roommates: 'Live basket updated on 3 phones.',
      pointerName: 'You',
      pointerPos: { top: '35%', right: '20%' }
    }
  ];

  const currentProject = projects[activeTab];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 60);
    if (window.matchMedia('(pointer: coarse)').matches) {
      setIsTouchDevice(true);
    }
    return () => clearTimeout(timer);
  }, []);

  // Automatic smooth slide progression every 4.5 seconds
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setActiveTab(prev => (prev + 1) % projects.length);
    }, 4500);
    return () => clearInterval(slideTimer);
  }, [projects.length]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (isTouchDevice || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos(prev => ({ ...prev, targetX: x, targetY: y }));
  }, [isTouchDevice]);

  const handleMouseLeave = () => {
    setMousePos(prev => ({ ...prev, targetX: 0, targetY: 0 }));
  };

  useEffect(() => {
    let active = true;
    const updatePhysics = () => {
      if (!active) return;
      setMousePos(prev => {
        const dx = prev.targetX - prev.x;
        const dy = prev.targetY - prev.y;
        if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) return prev;
        return {
          ...prev,
          x: prev.x + dx * 0.08,
          y: prev.y + dy * 0.08
        };
      });
      animFrameRef.current = requestAnimationFrame(updatePhysics);
    };

    animFrameRef.current = requestAnimationFrame(updatePhysics);
    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const scrollFactor = Math.min(scrollY / 500, 1.2);
  const tiltX = -mousePos.y * 6 - scrollFactor * 8;
  const tiltY = mousePos.x * 8;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full max-w-[580px] mx-auto select-none ${className}`}
      style={{ perspective: '1200px' }}
    >
      {/* Ambient Blurred Background Glow (Sparkdesign Signature) */}
      <div
        className="pointer-events-none absolute -inset-3 scale-[1.08] bg-cover bg-center opacity-25 blur-[64px] transition-all duration-700 rounded-[40px]"
        style={{ backgroundImage: `url(${currentProject.img})` }}
      />

      {/* 3D Root Stage */}
      <div
        className="relative transition-transform duration-200 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`
        }}
      >
        {/* Main Canvas Card */}
        <div className="relative isolate aspect-[1/1.02] w-full overflow-hidden rounded-[32px] bg-[#d9d8d4] shadow-[2px_7px_15px_#0000001a,8px_27px_28px_#00000017] border border-[#E2E1DA]">
          {/* Background Image */}
          <img
            src={currentProject.img}
            alt="RoomSync shared space"
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
          />

          {/* Gradient Overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/65 via-black/35 to-black/75" />

          {/* Top Pill Header */}
          <div className="absolute inset-x-6 top-6 flex justify-between gap-3 text-[11px] font-medium tracking-[0.01em] text-[#1A1A1A] z-10">
            <span className="rounded-full bg-white/90 px-3 py-1.5 backdrop-blur-md shadow-xs">
              {currentProject.tag}
            </span>
            <span className="rounded-full bg-white/90 px-3 py-1.5 backdrop-blur-md shadow-xs">
              {currentProject.badge}
            </span>
          </div>

          {/* Canvas Title */}
          <div className="absolute inset-x-7 top-20 max-w-[340px] text-white text-3xl sm:text-[36px] leading-[1.12] font-normal tracking-[-0.035em] drop-shadow-md z-10">
            {currentProject.title}
          </div>

          {/* Floating Pointer Cursor */}
          <div
            className="absolute z-20 transition-all duration-500"
            style={{ top: currentProject.pointerPos.top, right: currentProject.pointerPos.right }}
          >
            <div className="flex items-center gap-1.5 -rotate-6 text-[#1A1A1A]">
              <svg className="w-5 h-5 fill-current text-white drop-shadow-md" viewBox="0 0 24 24">
                <path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z" />
              </svg>
              <span className="rounded-md bg-[#dae8b8] px-2 py-0.5 text-[11px] font-semibold text-[#1A2E1A] shadow-md">
                {currentProject.pointerName}
              </span>
            </div>
          </div>

          {/* Bottom Left Pill */}
          <span className="absolute bottom-6 left-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-3 py-1.5 text-xs text-white backdrop-blur-md z-10">
            <span className="w-2 h-2 rounded-full bg-[#ddf0a6] animate-pulse"></span>
            <span>In this together</span>
          </span>
        </div>

        {/* ======================================================== */}
        {/* FLOATING OVERLAY CARD 1: ROOMMATE CHAT & TASK (Mid-Left) */}
        {/* ======================================================== */}
        <div
          className="absolute top-[48%] -left-6 sm:-left-10 z-30 w-[270px] sm:w-[290px] rounded-2xl border border-[#E2E1DA] bg-white p-4 text-[#1A1A1A] shadow-[0_12px_32px_rgba(0,0,0,0.12)] transition-all duration-500 ease-out"
          style={{
            transform: isLoaded
              ? `translate3d(${-mousePos.x * 14}px, ${-mousePos.y * 12}px, 60px)`
              : 'translate3d(-20px, 30px, 0px)',
            opacity: isLoaded ? 1 : 0
          }}
        >
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#EAE8E1] text-[#1A1A1A] font-bold text-[11px] flex items-center justify-center">
                {currentProject.commentAuthor[0]}
              </div>
              <div>
                <span className="font-semibold text-xs text-[#1A1A1A]">{currentProject.commentAuthor}</span>
                <span className="text-[10px] text-[#71716E] ml-1.5">{currentProject.commentTime}</span>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>

          <p className="mt-2.5 text-xs leading-relaxed text-[#4A4A48]">
            "{currentProject.comment}"
          </p>

          <button
            type="button"
            onClick={() => setCommentResolved(!commentResolved)}
            className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
              commentResolved
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-[#F4F3ED] text-[#71716E] hover:text-[#1A1A1A] hover:bg-[#EAE8E1]'
            }`}
          >
            <span>✓</span>
            <span>{commentResolved ? 'Resolved' : 'Mark completed'}</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* FLOATING OVERLAY CARD 2: ROOMMATES STATUS (Bottom-Right) */}
        {/* ======================================================== */}
        <div
          className="absolute -bottom-6 -right-4 sm:-right-8 z-30 flex items-center gap-2.5 rounded-xl border border-[#E2E1DA] bg-white px-4 py-3 text-xs text-[#1A1A1A] shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all duration-500 ease-out"
          style={{
            transform: isLoaded
              ? `translate3d(${-mousePos.x * 18}px, ${-mousePos.y * 16}px, 80px)`
              : 'translate3d(20px, 40px, 0px)',
            opacity: isLoaded ? 1 : 0
          }}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium">{currentProject.roommates}</span>
          <span className="ml-2 text-[10px] text-[#71716E] border-l border-[#E2E1DA] pl-2.5 hidden sm:inline">
            ✓ Live Sync
          </span>
        </div>

        {/* Sample Tabs Switcher at Bottom */}
        <div className="absolute inset-x-0 -bottom-14 flex items-center justify-center gap-2 z-20">
          {projects.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                activeTab === idx
                  ? 'w-8 bg-[#1A1A1A]'
                  : 'w-2.5 bg-[#1A1A1A]/25 hover:bg-[#1A1A1A]/50'
              }`}
              aria-label={`Show ${p.tag}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
