import React, { useEffect, useState, useRef, useCallback } from 'react';

/**
 * Hero3DCardStage
 * A collection of interactive 3D floating UI cards representing the actual RoomSync product.
 * Features:
 * - Initial staggered 3D entrance animation on page load
 * - Continuous subtle harmonic floating in 3D space
 * - Smooth mouse parallax and perspective tilt
 * - Scroll-responsive 3D dispersion as user scrolls down
 * - High performance, zero DOM layout shift, mobile-responsive
 */
export default function Hero3DCardStage({ className = '' }) {
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
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

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
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

  // Scroll reaction factors (cards slowly rotate and expand in depth as user scrolls down)
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
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full max-w-lg lg:max-w-xl mx-auto select-none ${className}`}
      style={{
        perspective: '1200px',
        minHeight: '460px'
      }}
    >
      {/* 3D Scene Root */}
      <div
        className="relative w-full h-full min-h-[460px] flex items-center justify-center transition-transform duration-200 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`
        }}
      >
        {/* ======================================================== */}
        {/* CARD 1: PRIMARY CHORE / MORNING RHYTHM CARD (Center Anchor) */}
        {/* ======================================================== */}
        <div
          className="absolute z-20 w-[88%] sm:w-[350px] transition-all duration-700 ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: isLoaded
              ? `translate3d(${-mousePos.x * 10}px, ${-mousePos.y * 10 + Math.sin(Date.now() / 1200) * 0}px, 40px) scale(${1 - scrollFactor * 0.05})`
              : 'translate3d(0px, 40px, -60px) scale(0.9)',
            opacity: isLoaded ? 1 : 0,
            transitionDelay: '0.1s'
          }}
        >
          <div className="bg-[#FFF9F1] border border-[#E8DEC8] rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-md hover:border-[#3E737C]/40 transition-colors">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DEC8]">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-[#DCE8E8] text-[#234653] flex items-center justify-center text-sm shadow-2xs font-bold">
                  🧹
                </span>
                <div>
                  <h4 className="text-sm font-bold text-[#234653] font-serif-editorial">
                    Kitchen & Stove Rotation
                  </h4>
                  <span className="text-[10px] text-[#3E737C]">The Maple Flat • Morning Rhythm</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#234653] bg-[#FAF5ED] px-2.5 py-0.5 rounded-full border border-[#E8DEC8]">
                ✓ Complete
              </span>
            </div>

            {/* Task Item */}
            <div className="mt-3.5 space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF5ED] border border-[#E8DEC8]/70 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#E86F5A] text-white flex items-center justify-center text-[9px] font-bold">
                    ✓
                  </span>
                  <span className="font-semibold text-[#234653]">Alex wiped down counters</span>
                </div>
                <span className="text-[10px] font-mono text-[#3E737C]">08:45 AM</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFF9F1] border border-[#E8DEC8] text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border border-[#3E737C]/50 flex items-center justify-center text-[9px]"></span>
                  <span className="text-[#234653]">Run dishwasher cycle</span>
                </div>
                <span className="text-[10px] font-semibold text-[#E86F5A]">Assigned to You</span>
              </div>
            </div>

            {/* Progress Footer */}
            <div className="mt-4 pt-3 border-t border-[#E8DEC8]/80 flex items-center justify-between text-[11px] text-[#3E737C]">
              <span>Household balance</span>
              <span className="font-semibold text-[#234653]">4 of 6 tended today</span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CARD 2: EXPENSE SPLIT PANEL (Upper Left Layer, Z = 85) */}
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
                <span className="w-7 h-7 rounded-lg bg-[#F2D4C8] text-[#234653] flex items-center justify-center text-xs shadow-2xs font-bold">
                  💰
                </span>
                <div>
                  <span className="text-[11px] font-bold text-[#234653] block font-serif-editorial leading-tight">
                    Shared Groceries
                  </span>
                  <span className="text-[9px] text-[#3E737C]">Split 3 ways</span>
                </div>
              </div>
              <span className="text-xs font-bold text-[#234653] font-serif-editorial">₹1,240</span>
            </div>

            <div className="mt-3 flex items-center justify-between text-[10px] pt-2 border-t border-[#E8DEC8]/80 text-[#3E737C]">
              <div className="flex -space-x-1.5 overflow-hidden">
                <span className="inline-block w-5 h-5 rounded-full bg-[#DCE8E8] text-[#234653] text-[9px] font-bold text-center leading-5 border border-[#FFF9F1]">
                  A
                </span>
                <span className="inline-block w-5 h-5 rounded-full bg-[#F2D4C8] text-[#234653] text-[9px] font-bold text-center leading-5 border border-[#FFF9F1]">
                  M
                </span>
                <span className="inline-block w-5 h-5 rounded-full bg-[#234653] text-white text-[9px] font-bold text-center leading-5 border border-[#FFF9F1]">
                  Y
                </span>
              </div>
              <span className="font-semibold text-[#E86F5A]">₹413.33 / each</span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CARD 3: ROOMMATE FAVOR / HELP REQUEST (Lower Right, Z = 65) */}
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
              <span className="w-7 h-7 rounded-lg bg-[#DCE8E8] text-[#234653] flex items-center justify-center text-xs shadow-2xs font-bold shrink-0">
                🤝
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#234653] truncate font-serif-editorial">
                    Package Pickup Favor
                  </span>
                  <span className="text-[9px] text-[#E86F5A] font-bold bg-[#FBF1EB] px-2 py-0.5 rounded-full">
                    2:30 PM
                  </span>
                </div>
                <p className="text-[10px] text-[#3E737C] mt-1 leading-snug line-clamp-2">
                  "Delivery arriving while I'm at work. Could someone grab it from lobby?"
                </p>
                <div className="mt-2.5 flex items-center justify-between text-[10px] text-[#3E737C] pt-2 border-t border-[#E8DEC8]/60">
                  <span>Maya requested</span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Accepted by You
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CARD 4: TOP-RIGHT FLOATING LIVE STATUS BADGE (Z = 110) */}
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
            <span className="w-2 h-2 rounded-full bg-[#E86F5A] animate-pulse"></span>
            <span className="font-serif-editorial">The Maple Flat • Live Sync</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CARD 5: BOTTOM-LEFT FLOATING DECISION POLL (Z = 50) */}
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
            <span className="text-xs">🗳️</span>
            <span className="font-semibold">Movie night dinner:</span>
            <span className="font-bold text-[#E86F5A] bg-[#FAF5ED] px-2 py-0.5 rounded-lg border border-[#E8DEC8]">
              Friday (3 votes)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
