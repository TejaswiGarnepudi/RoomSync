import React, { useRef, useState, useCallback } from 'react';

/**
 * TiltCard provides interactive 3D perspective tilt and cursor spotlight
 * Inspired by React Bits & Uiverse card patterns.
 */
export default function TiltCard({
  children,
  className = '',
  maxTilt = 6, // max tilt angle in degrees
  perspective = 1000,
  spotlight = true,
  spotlightColor = 'rgba(232, 111, 90, 0.08)',
  scaleOnHover = 1.015,
  ...props
}) {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState('');
  const [spotlightPos, setSpotlightPos] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;

    const rotateX = -((y - centerY) / centerY) * maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setTransform(`perspective(${perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scaleOnHover}, ${scaleOnHover}, 1)`);
    setSpotlightPos({ x: percentX, y: percentY, opacity: 1 });
  }, [maxTilt, perspective, scaleOnHover]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTransform(`perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`);
    setSpotlightPos(prev => ({ ...prev, opacity: 0 }));
  }, [perspective]);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: transform || undefined,
        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        transformStyle: 'preserve-3d',
        willChange: isHovered ? 'transform' : 'auto'
      }}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      {/* Radial Spotlight Overlay */}
      {spotlight && (
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300 rounded-[inherit] z-10"
          style={{
            opacity: spotlightPos.opacity,
            background: `radial-gradient(400px circle at ${spotlightPos.x}% ${spotlightPos.y}%, ${spotlightColor}, transparent 75%)`
          }}
        />
      )}
      <div className="relative z-0 h-full w-full">
        {children}
      </div>
    </div>
  );
}
