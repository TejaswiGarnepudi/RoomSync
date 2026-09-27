import React, { useEffect, useRef } from 'react';

export default function ConstellationParticles({
  particleCount = 45,
  connectionDistance = 110,
  mouseConnectionDistance = 140,
  className = '',
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    // Track cursor position
    const mouse = {
      x: null,
      y: null,
      radius: mouseConnectionDistance
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const parentEl = canvas.parentElement;
    if (parentEl) {
      parentEl.addEventListener('mousemove', handleMouseMove);
      parentEl.addEventListener('mouseleave', handleMouseLeave);
    }

    // Particle class
    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.75;
        this.vy = (Math.random() - 0.5) * 0.75;
        this.radius = Math.random() * 1.5 + 1; // 1 - 2.5px
        this.baseAlpha = Math.random() * 0.4 + 0.3; // 0.3 - 0.7
        this.color = Math.random() > 0.4 ? 'rgba(255, 255, 255,' : (Math.random() > 0.5 ? 'rgba(16, 185, 129,' : 'rgba(6, 182, 212,');
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce on boundaries
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mouse interaction attraction
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (1 - dist / mouse.radius) * 0.02;
            this.x += dx * force;
            this.y += dy * force;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${this.color}${this.baseAlpha})`;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // Create particles
    const particles = Array.from({ length: particleCount }, () => new Particle());

    // Main animation loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw and connect particles
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.update();
        p1.draw();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.22;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }

        // Connect to mouse cursor if near
        if (mouse.x !== null && mouse.y !== null) {
          const dx = p1.x - mouse.x;
          const dy = p1.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const alpha = (1 - dist / mouse.radius) * 0.35;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (parentEl) {
        parentEl.removeEventListener('mousemove', handleMouseMove);
        parentEl.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [particleCount, connectionDistance, mouseConnectionDistance]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 size-full pointer-events-none ${className}`}
    />
  );
}
