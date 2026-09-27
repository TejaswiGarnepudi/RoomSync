import React, { useEffect, useRef } from 'react';

export default function FluidParticles({ className = '' }) {
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

    // Mouse tracking for fluid vortex interaction
    const mouse = {
      x: null,
      y: null,
      prevX: null,
      prevY: null,
      vx: 0,
      vy: 0,
      radius: 120,
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      if (mouse.x !== null) {
        mouse.vx = (currentX - mouse.x) * 0.3;
        mouse.vy = (currentY - mouse.y) * 0.3;
      }

      mouse.x = currentX;
      mouse.y = currentY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
      mouse.vx = 0;
      mouse.vy = 0;
    };

    const parentEl = canvas.parentElement;
    if (parentEl) {
      parentEl.addEventListener('mousemove', handleMouseMove);
      parentEl.addEventListener('mouseleave', handleMouseLeave);
    }

    // Colors matching RoomSync palette (Emerald, Cyan, Soft Amber, Luminous White)
    const colorPalette = [
      'rgba(16, 185, 129, ',  // Emerald
      'rgba(6, 182, 212, ',   // Cyan
      'rgba(245, 158, 11, ',  // Amber
      'rgba(250, 249, 245, ', // White / Bone
      'rgba(139, 92, 246, ',  // Violet
    ];

    const particleCount = 220;

    class FluidParticle {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height : height + 10;
        this.prevX = this.x;
        this.prevY = this.y;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = -(Math.random() * 0.8 + 0.4); // drift upwards
        this.size = Math.random() * 1.6 + 0.8;
        this.color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        this.alpha = Math.random() * 0.5 + 0.25;
        this.life = Math.random() * 200 + 100;
        this.age = initial ? Math.random() * this.life : 0;
        this.noiseScale = 0.0025 + Math.random() * 0.0015;
      }

      update(time) {
        this.prevX = this.x;
        this.prevY = this.y;

        // Fluid vector field calculation (Trigonometric Curl Flow)
        const angle =
          Math.sin(this.x * this.noiseScale + time * 0.4) *
          Math.cos(this.y * this.noiseScale + time * 0.3) *
          Math.PI * 2.5;

        // Apply vector field forces
        this.vx += Math.cos(angle) * 0.08;
        this.vy += Math.sin(angle) * 0.08 - 0.03; // upward buoyancy

        // Apply friction / fluid viscosity
        this.vx *= 0.94;
        this.vy *= 0.94;

        // Interactive Fluid Swirl / Push when mouse is near
        if (mouse.x !== null && mouse.y !== null) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius && dist > 1) {
            // Fluid vortex spin + repulsion
            const factor = (1 - dist / mouse.radius);
            const tangentX = -dy / dist;
            const tangentY = dx / dist;

            this.vx += (tangentX * 2.5 + (dx / dist) * 1.5 + mouse.vx * 0.4) * factor * 0.4;
            this.vy += (tangentY * 2.5 + (dy / dist) * 1.5 + mouse.vy * 0.4) * factor * 0.4;
          }
        }

        this.x += this.vx;
        this.y += this.vy;

        this.age++;

        // Reset if off screen or aged
        if (
          this.x < -20 ||
          this.x > width + 20 ||
          this.y < -20 ||
          this.age >= this.life
        ) {
          this.reset();
        }
      }

      draw() {
        // Draw fluid glowing line trail
        ctx.beginPath();
        ctx.moveTo(this.prevX, this.prevY);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = `${this.color}${this.alpha})`;
        ctx.lineWidth = this.size;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Soft head point glow
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `${this.color}${Math.min(1, this.alpha * 1.4)})`;
        ctx.fill();
      }
    }

    const particles = Array.from({ length: particleCount }, () => new FluidParticle());

    let time = 0;

    const animate = () => {
      time += 0.008;

      // Soft decay trailing clear (creates silky fluid trails)
      ctx.fillStyle = 'rgba(18, 18, 17, 0.16)';
      ctx.fillRect(0, 0, width, height);

      // Damp mouse velocity
      mouse.vx *= 0.85;
      mouse.vy *= 0.85;

      for (let i = 0; i < particles.length; i++) {
        particles[i].update(time);
        particles[i].draw();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    // Initial clear
    ctx.fillStyle = '#121211';
    ctx.fillRect(0, 0, width, height);

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (parentEl) {
        parentEl.removeEventListener('mousemove', handleMouseMove);
        parentEl.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 size-full pointer-events-none ${className}`}
    />
  );
}
