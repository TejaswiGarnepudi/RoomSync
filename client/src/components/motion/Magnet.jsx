import React, { useRef, useState, useCallback, useEffect } from 'react';

/**
 * Magnet Component
 * Inspired by React Bits Magnet pattern.
 * Gives child elements (like buttons or pill badges) a subtle magnetic pull towards the cursor.
 */
export default function Magnet({
  children,
  className = '',
  magnetStrength = 0.25,
  active = true,
  disabled = false,
  ...props
}) {
  const magnetRef = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsTouch(true);
    }
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (isTouch || disabled || !active || !magnetRef.current) return;
    const rect = magnetRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = (e.clientX - centerX) * magnetStrength;
    const dy = (e.clientY - centerY) * magnetStrength;

    setOffset({ x: dx, y: dy });
  }, [disabled, active, magnetStrength, isTouch]);

  const handleMouseEnter = () => {
    if (!isTouch && !disabled && active) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div
      ref={magnetRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0px)`,
        transition: isHovered ? 'transform 0.12s ease-out' : 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        display: 'inline-block',
        willChange: isHovered ? 'transform' : 'auto'
      }}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
}
