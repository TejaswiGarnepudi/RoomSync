import React, { useEffect, useRef, useState } from 'react';

/**
 * ScrollReveal component for smooth scroll-triggered entrance animations
 * Uses IntersectionObserver for 60fps performance and zero layout lag.
 */
export default function ScrollReveal({
  children,
  delay = 0,
  direction = 'up', // 'up' | 'down' | 'left' | 'right' | 'zoom' | 'perspective'
  distance = 28,
  duration = 0.65,
  className = '',
  stagger = false,
  threshold = 0.12,
  once = true
}) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef(null);

  useEffect(() => {
    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once && domRef.current) {
            observer.unobserve(domRef.current);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    const currentRef = domRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, once]);

  // Determine initial and visible transform styles based on direction
  const getTransformStyles = () => {
    if (!isVisible) {
      switch (direction) {
        case 'up':
          return `translateY(${distance}px)`;
        case 'down':
          return `translateY(-${distance}px)`;
        case 'left':
          return `translateX(${distance}px)`;
        case 'right':
          return `translateX(-${distance}px)`;
        case 'zoom':
          return `scale(0.94) translateY(${distance * 0.5}px)`;
        case 'perspective':
          return `perspective(1000px) rotateX(6deg) translateY(${distance}px)`;
        default:
          return `translateY(${distance}px)`;
      }
    }
    switch (direction) {
      case 'perspective':
        return 'perspective(1000px) rotateX(0deg) translateY(0px)';
      case 'zoom':
        return 'scale(1) translateY(0px)';
      default:
        return 'translateY(0px) translateX(0px)';
    }
  };

  const style = {
    opacity: isVisible ? 1 : 0,
    transform: getTransformStyles(),
    transition: `opacity ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
    willChange: isVisible ? 'auto' : 'transform, opacity'
  };

  return (
    <div ref={domRef} style={style} className={`${className} ${stagger ? 'motion-stagger-group' : ''}`}>
      {children}
    </div>
  );
}
