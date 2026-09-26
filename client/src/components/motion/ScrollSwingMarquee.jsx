import React, { useEffect, useRef, useState } from 'react';

/**
 * ScrollSwingMarquee
 * Moves rows side-to-side dynamically linked directly to the user's scroll position.
 * Scrolling down swings Row 1 to the left and Row 2 to the right.
 * Scrolling up swings them smoothly in the opposite direction.
 */
export default function ScrollSwingMarquee({ row1Items = [], row2Items = [] }) {
  const containerRef = useRef(null);
  const [scrollOffset, setScrollOffset] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            // Calculate relative progress of element through viewport (0 to 1)
            const totalDistance = windowHeight + rect.height;
            const currentPosition = windowHeight - rect.top;
            const progress = Math.max(0, Math.min(1, currentPosition / totalDistance));
            
            // Offset range: -180px to +180px (total 360px swing)
            const calculatedOffset = (progress - 0.5) * 360;
            setScrollOffset(calculatedOffset);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial position calculation

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="space-y-4 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] overflow-hidden py-2"
    >
      {/* Row 1: Swings left on scroll down */}
      <div className="overflow-hidden whitespace-nowrap">
        <div
          className="flex items-center gap-5 will-change-transform transition-transform duration-75 ease-out"
          style={{
            transform: `translateX(calc(-15% + ${-scrollOffset * 0.9}px))`,
          }}
        >
          {[...row1Items, ...row1Items, ...row1Items].map((aud, i) => (
            <div
              key={`row1-${i}`}
              className="flex items-center gap-3.5 text-base font-medium tracking-[-0.02em] text-[#1A1A1A] dark:text-[#FAF9F5] bg-white dark:bg-[#141413] px-5 py-3 rounded-2xl border border-[#E8E7E1] dark:border-[#2A2A28] shadow-xs shrink-0 select-none transition-transform hover:scale-[1.03] hover:border-[#1A1A1A]/30 dark:hover:border-white/20"
            >
              <img
                src={aud.img}
                alt=""
                className="size-9 rounded-lg -rotate-6 object-cover border border-[#E8E7E1] dark:border-[#2E2E2A] shadow-2xs pointer-events-none"
              />
              <span>{aud.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Row 2: Swings right on scroll down */}
      <div className="overflow-hidden whitespace-nowrap">
        <div
          className="flex items-center gap-5 will-change-transform transition-transform duration-75 ease-out"
          style={{
            transform: `translateX(calc(-25% + ${scrollOffset * 0.9}px))`,
          }}
        >
          {[...row2Items, ...row2Items, ...row2Items].map((aud, i) => (
            <div
              key={`row2-${i}`}
              className="flex items-center gap-3.5 text-base font-medium tracking-[-0.02em] text-[#1A1A1A] dark:text-[#FAF9F5] bg-white dark:bg-[#141413] px-5 py-3 rounded-2xl border border-[#E8E7E1] dark:border-[#2A2A28] shadow-xs shrink-0 select-none transition-transform hover:scale-[1.03] hover:border-[#1A1A1A]/30 dark:hover:border-white/20"
            >
              <img
                src={aud.img}
                alt=""
                className="size-9 rounded-lg rotate-6 object-cover border border-[#E8E7E1] dark:border-[#2E2E2A] shadow-2xs pointer-events-none"
              />
              <span>{aud.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
