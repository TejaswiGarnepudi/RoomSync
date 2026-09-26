import React from 'react';

/**
 * Ambient floating 3D glowing blur spheres
 * Adds physical depth, warmth, and lighting without DOM or layout disruption.
 */
export default function FloatingOrbs({ count = 3, className = '' }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {/* Orb 1: Warm Coral / Terracotta */}
      <div
        className="absolute -top-12 -left-12 w-72 h-72 rounded-full bg-[#F2D4C8]/40 blur-3xl mix-blend-multiply animate-float-slow"
        style={{ animationDuration: '8s' }}
      />
      {/* Orb 2: Honey Amber */}
      <div
        className="absolute top-1/3 -right-16 w-80 h-80 rounded-full bg-[#E7A83C]/20 blur-3xl mix-blend-multiply animate-float-slow"
        style={{ animationDuration: '11s', animationDelay: '2s' }}
      />
      {/* Orb 3: Mist Blue */}
      <div
        className="absolute -bottom-16 left-1/4 w-96 h-96 rounded-full bg-[#DCE8E8]/50 blur-3xl mix-blend-multiply animate-float-slow"
        style={{ animationDuration: '14s', animationDelay: '4s' }}
      />
    </div>
  );
}
