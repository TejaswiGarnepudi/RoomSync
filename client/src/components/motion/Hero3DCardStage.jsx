import React, { useEffect, useState, useRef, useCallback } from 'react';

/**
 * Hero3DCardStage
 * Interactive 3D floating Household Management cards (Chores, Expense Splits, Shopping, Polls).
 * Features:
 * - Staggered 3D entrance animation on page load
 * - Continuous subtle harmonic floating in 3D space
 * - Smooth mouse parallax and perspective tilt
 * - Scroll-responsive 3D dispersion as user scrolls down
 * - High performance, zero layout shift, mobile-responsive
 */
export default function Hero3DCardStage({ className = '' }) {
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const animFrameRef = useRef(null);

  // Trigger initial staggered entrance animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 60);
    return () => clearTimeout(timer);
  }, []);

  // Track scroll position for 3D scroll reaction
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth mouse damping loop
  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos(prev => ({ ...prev, targetX: x, targetY: y }));
  }, []);

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
        if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
          return prev;
        }
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

  // Scroll reaction factors
  const scrollFactor = Math.min(scrollY / 500, 1.2);
  const scrollRotateX = scrollFactor * 14;
  const scrollSpread = scrollFactor * 40;

  // Mouse tilt factors
  const tiltX = -mousePos.y * 10 - scrollRotateX;
  const tiltY = mousePos.x * 12;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full max-w-lg lg:max-w-xl mx-auto select-none ${className}`}
      style={{
        perspective: '1200px',
        minHeight: '480px'
      }}
    >
      {/* 3D Scene Root */}
      <div
        className="relative w-full h-full min-h-[480px] flex items-center justify-center transition-transform duration-200 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`
        }}
      >
        {/* ======================================================== */}
        {/* CARD 1: PRIMARY HOUSEHOLD CHORES & JOURNAL (Center Anchor, Z = 40) */}
        {/* ======================================================== */}
        <div
          className="absolute z-20 w-[90%] sm:w-[360px] transition-all duration-700 ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: isLoaded
              ? `translate3d(${-mousePos.x * 10}px, ${-mousePos.y * 10}px, 40px) scale(${1 - scrollFactor * 0.05})`
              : 'translate3d(0px, 40px, -60px) scale(0.9)',
            opacity: isLoaded ? 1 : 0,
            transitionDelay: '0.1s'
          }}
        >
          <div className="bg-[#FFF9F1] border border-[#E8DEC8] rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-md hover:border-[#3E737C]/40 transition-colors">
            {/* Household Header */}
            <div className="flex items-start justify-between pb-3.5 border-b border-[#E8DEC8]">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#DCE8E8] text-[#234653] font-bold text-base flex items-center justify-center border border-[#E8DEC8] font-serif shadow-2xs">
                  🏡
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#234653] font-serif-editorial">
                    The Maple Flat
                  </h4>
                  <span className="text-xs text-[#3E737C]">3 Roommates • Code: MAPLE-3B</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                ● Synchronized
              </span>
            </div>

            {/* Active Chores & Shared Schedule */}
            <div className="mt-3.5 space-y-2.5">
              <div className="p-2.5 rounded-2xl bg-[#FAF5ED] border border-[#E8DEC8] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#234653] text-[#FFF9F1] flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                  <span className="font-semibold text-[#234653]">Kitchen island & counters</span>
                </div>
                <span className="text-[10px] font-bold text-[#3E737C]">Done by Alex</span>
              </div>

              <div className="p-2.5 rounded-2xl bg-[#FAF5ED] border border-[#E8DEC8] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full border border-[#3E737C]/50 flex items-center justify-center text-[10px]">
                  </span>
                  <span className="font-semibold text-[#234653]">Living room & balcony sweep</span>
                </div>
                <span className="text-[10px] font-bold text-[#E86F5A]">Assigned to You</span>
              </div>
            </div>

            {/* Household Status Pills */}
            <div className="mt-3.5 pt-3 border-t border-[#E8DEC8]/80 flex flex-wrap gap-1.5">
              <span className="px-2.5 py-1 rounded-xl bg-[#FAF5ED] border border-[#E8DEC8] text-[10px] font-semibold text-[#234653]">
                🔄 Weekly Rotation
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-[#FAF5ED] border border-[#E8DEC8] text-[10px] font-semibold text-[#234653]">
                🛒 3 Shopping Items
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-[#FAF5ED] border border-[#E8DEC8] text-[10px] font-semibold text-[#234653]">
                📊 0 Unsettled Debts
              </span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CARD 2: SMART EXPENSE SPLIT CARD (Upper Left Layer, Z = 85) */}
        {/* ======================================================== */}
        <div
          className="absolute z-30 -top-8 sm:-top-10 -left-4 sm:-left-12 w-[72%] sm:w-[270px] transition-all duration-700 ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: isLoaded
              ? `translate3d(${-mousePos.x * 20 - scrollSpread * 0.4}px, ${-mousePos.y * 18 - scrollSpread * 0.2}px, 85px) rotateZ(-4deg)`
              : 'translate3d(-40px, -20px, 0px) rotateZ(-10deg)',
            opacity: isLoaded ? 1 : 0,
            transitionDelay: '0.22s'
          }}
        >
          <div className="bg-[#FAF5ED]/95 border border-[#E8DEC8] rounded-2xl p-4 shadow-xl backdrop-blur-md hover:border-[#E86F5A]/40 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#DCE8E8] text-[#234653] flex items-center justify-center text-xs shadow-2xs font-bold">
                  💰
                </span>
                <div>
                  <span className="text-[11px] font-bold text-[#234653] block font-serif-editorial leading-tight">
                    Expense Split
                  </span>
                  <span className="text-[9px] text-[#3E737C]">Wi-Fi & Groceries</span>
                </div>
              </div>
              <span className="text-xs font-bold text-[#E86F5A] font-serif-editorial">₹2,400</span>
            </div>

            <div className="mt-2.5 space-y-1 text-[10px] text-[#3E737C] pt-2 border-t border-[#E8DEC8]/80">
              <div className="flex items-center justify-between text-[#234653]">
                <span>Equal split (3 members):</span>
                <span className="font-bold">₹800 / each</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-700">
                <span className="font-bold">✓</span>
                <span>Debt simplified automatically</span>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CARD 3: ACTIVE HOUSEHOLD POLL & DECISION (Lower Right, Z = 65) */}
        {/* ======================================================== */}
        <div
          className="absolute z-25 -bottom-8 sm:-bottom-10 -right-2 sm:-right-8 w-[76%] sm:w-[280px] transition-all duration-700 ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: isLoaded
              ? `translate3d(${-mousePos.x * 16 + scrollSpread * 0.5}px, ${-mousePos.y * 14 + scrollSpread * 0.3}px, 65px) rotateZ(3deg)`
              : 'translate3d(40px, 40px, 0px) rotateZ(8deg)',
            opacity: isLoaded ? 1 : 0,
            transitionDelay: '0.34s'
          }}
        >
          <div className="bg-[#FFF9F1]/95 border border-[#E8DEC8] rounded-2xl p-4 shadow-xl backdrop-blur-md hover:border-[#3E737C]/40 transition-colors">
            <div className="flex items-start gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-[#F2D4C8] text-[#234653] flex items-center justify-center text-xs shadow-2xs font-bold shrink-0">
                🗳️
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#234653] truncate font-serif-editorial">
                    House Decision Poll
                  </span>
                  <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    67% Passed
                  </span>
                </div>
                <p className="text-[10px] text-[#3E737C] mt-1 leading-snug">
                  "Host Friday dinner for flatmates & friends?"
                </p>
                <div className="mt-2.5 flex items-center justify-between text-[10px] text-[#3E737C] pt-2 border-t border-[#E8DEC8]/60">
                  <span>Alex & Maya voted Yes</span>
                  <span className="font-semibold text-[#E86F5A]">Resolved</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CARD 4: TOP-RIGHT FLOATING STATUS PILL (Z = 110) */}
        {/* ======================================================== */}
        <div
          className="absolute z-35 -top-12 sm:-top-14 right-2 sm:right-0 transition-all duration-700 ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: isLoaded
              ? `translate3d(${-mousePos.x * 24 + scrollSpread * 0.2}px, ${-mousePos.y * 22}px, 110px) rotateZ(2deg)`
              : 'translate3d(20px, -30px, 40px)',
            opacity: isLoaded ? 1 : 0,
            transitionDelay: '0.45s'
          }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#234653] text-[#FFF9F1] text-[11px] font-semibold shadow-lg border border-[#234653]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-serif-editorial">Household OS • Real-Time</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CARD 5: BOTTOM-LEFT FLOATING PANTRY TAG (Z = 50) */}
        {/* ======================================================== */}
        <div
          className="absolute z-15 -bottom-10 sm:-bottom-12 left-0 sm:-left-8 transition-all duration-700 ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: isLoaded
              ? `translate3d(${-mousePos.x * 12 - scrollSpread * 0.3}px, ${-mousePos.y * 12 + scrollSpread * 0.2}px, 50px) rotateZ(-3deg)`
              : 'translate3d(-20px, 30px, 0px)',
            opacity: isLoaded ? 1 : 0,
            transitionDelay: '0.55s'
          }}
        >
          <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#FFF9F1] border border-[#E8DEC8] text-[11px] text-[#234653] shadow-md">
            <span className="text-xs">🛒</span>
            <span className="font-semibold">Shared Basket:</span>
            <span className="font-bold text-[#E86F5A] bg-[#FAF5ED] px-2 py-0.5 rounded-lg border border-[#E8DEC8]">
              Oat Milk & Coffee Beans
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
