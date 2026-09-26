import React, { useEffect, useRef, useState } from 'react';

/**
 * Signature 3D Scroll Canvas
 * An interactive 3D perspective node & thread field representing the live synchronization of a household.
 * Inspired by React Bits "Threads" & "Antigravity" patterns.
 */
export default function Signature3DScroll({ className = '' }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [activeNode, setActiveNode] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let isVisible = false;
    let width = (canvas.width = container.clientWidth);
    let height = (canvas.height = container.clientHeight);

    let mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };

    // 3D Nodes representing household elements
    const nodes = [
      { id: 1, label: 'Kitchen Rhythm', icon: '🧹', x3d: -160, y3d: -50, z3d: 50, color: '#E86F5A', baseZ: 50 },
      { id: 2, label: 'Shared Groceries', icon: '🛍️', x3d: 140, y3d: -80, z3d: 80, color: '#3E737C', baseZ: 80 },
      { id: 3, label: 'Split Rent & Bills', icon: '💰', x3d: -120, y3d: 80, z3d: -30, color: '#E7A83C', baseZ: -30 },
      { id: 4, label: 'Balcony Plants', icon: '🌱', x3d: 160, y3d: 60, z3d: 20, color: '#234653', baseZ: 20 },
      { id: 5, label: 'Movie Night Poll', icon: '🗳️', x3d: 0, y3d: -110, z3d: 100, color: '#E86F5A', baseZ: 100 },
      { id: 6, label: 'Morning Coffee', icon: '☕', x3d: -40, y3d: 100, z3d: -60, color: '#3E737C', baseZ: -60 },
      { id: 7, label: 'Quiet Hours', icon: '🌙', x3d: 80, y3d: 20, z3d: -10, color: '#234653', baseZ: -10 }
    ];

    // Background floating dust/particles
    const particles = Array.from({ length: 42 }, () => ({
      x: (Math.random() - 0.5) * 500,
      y: (Math.random() - 0.5) * 400,
      z: (Math.random() - 0.5) * 300,
      radius: Math.random() * 2 + 1,
      color: Math.random() > 0.5 ? '#E8DEC8' : '#DCE8E8',
      speed: Math.random() * 0.008 + 0.003
    }));

    const resize = () => {
      if (!container || !canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', resize);
    resize();

    // Scroll progress tracking
    const handleScroll = () => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalDist = windowHeight + rect.height;
      const currentDist = windowHeight - rect.top;
      const progress = Math.max(0, Math.min(1, currentDist / totalDist));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Mouse movement inside canvas
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
    };

    container.addEventListener('mousemove', handleMouseMove);

    // Intersection observer to pause rendering when offscreen
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) {
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(render);
      }
    }, { threshold: 0.05 });

    observer.observe(container);

    let angleX = 0;
    let angleY = 0;
    let time = 0;
    let lastTime = performance.now();

    const render = (now) => {
      if (!isVisible) return;
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      time += dt;

      // Smooth mouse damping
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      const normMouseX = (mouse.x / width - 0.5) * 2;
      const normMouseY = (mouse.y / height - 0.5) * 2;

      // Scroll influences rotation & perspective
      const targetAngleY = normMouseX * 0.35 + (scrollProgress - 0.5) * 0.6;
      const targetAngleX = -normMouseY * 0.25 + Math.sin(time * 0.5) * 0.05;

      angleY += (targetAngleY - angleY) * 0.08;
      angleX += (targetAngleX - angleX) * 0.08;

      ctx.clearRect(0, 0, width, height);

      const fov = 340;
      const cx = width / 2;
      const cy = height / 2;

      // Project 3D point to 2D
      const project = (x, y, z) => {
        // Rotate around Y
        const cosY = Math.cos(angleY);
        const sinY = Math.sin(angleY);
        let x1 = x * cosY - z * sinY;
        let z1 = z * cosY + x * sinY;

        // Rotate around X
        const cosX = Math.cos(angleX);
        const sinX = Math.sin(angleX);
        let y2 = y * cosX - z1 * sinX;
        let z2 = z1 * cosX + y * sinX;

        const distance = fov + z2 + 100;
        const scale = fov / Math.max(distance, 10);
        return {
          x2d: cx + x1 * scale,
          y2d: cy + y2 * scale,
          scale,
          z2: z2
        };
      };

      // Draw background ambient particles
      particles.forEach((p) => {
        const floatY = p.y + Math.sin(time * 1.5 + p.x) * 12;
        const proj = project(p.x, floatY, p.z);
        if (proj.scale > 0) {
          ctx.beginPath();
          ctx.arc(proj.x2d, proj.y2d, Math.max(0.5, p.radius * proj.scale), 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.min(0.6, Math.max(0.1, proj.scale * 0.5));
          ctx.fill();
        }
      });

      // Project all main nodes
      const projectedNodes = nodes.map((node, i) => {
        const floatY = node.y3d + Math.sin(time * 1.8 + i * 1.2) * 10;
        const floatZ = node.baseZ + Math.cos(time * 1.2 + i * 0.8) * 15;
        const proj = project(node.x3d, floatY, floatZ);
        return { ...node, ...proj };
      });

      // Draw harmonic sync threads connecting nodes in 3D
      ctx.lineWidth = 1.2;
      for (let i = 0; i < projectedNodes.length; i++) {
        for (let j = i + 1; j < projectedNodes.length; j++) {
          const n1 = projectedNodes[i];
          const n2 = projectedNodes[j];
          const dist3D = Math.hypot(n1.x3d - n2.x3d, n1.y3d - n2.y3d, n1.baseZ - n2.baseZ);

          if (dist3D < 260) {
            const alpha = (1 - dist3D / 260) * 0.35 * Math.min(n1.scale, n2.scale);
            ctx.beginPath();
            ctx.moveTo(n1.x2d, n1.y2d);

            // Curve through center with breathing tension
            const midX = (n1.x2d + n2.x2d) / 2;
            const midY = (n1.y2d + n2.y2d) / 2 + Math.sin(time * 2 + i) * 6;
            ctx.quadraticCurveTo(midX, midY, n2.x2d, n2.y2d);

            ctx.strokeStyle = '#E86F5A';
            ctx.globalAlpha = Math.max(0.04, alpha);
            ctx.stroke();

            // Tiny light pulse travelling along the thread
            const pulseT = (time * 0.6 + i * 0.3) % 1;
            const pulseX = (1 - pulseT) * (1 - pulseT) * n1.x2d + 2 * (1 - pulseT) * pulseT * midX + pulseT * pulseT * n2.x2d;
            const pulseY = (1 - pulseT) * (1 - pulseT) * n1.y2d + 2 * (1 - pulseT) * pulseT * midY + pulseT * pulseT * n2.y2d;

            ctx.beginPath();
            ctx.arc(pulseX, pulseY, 2 * Math.min(n1.scale, n2.scale), 0, Math.PI * 2);
            ctx.fillStyle = '#E7A83C';
            ctx.globalAlpha = alpha * 1.5;
            ctx.fill();
          }
        }
      }

      // Sort nodes by Z depth so front nodes render over back nodes
      const sortedNodes = [...projectedNodes].sort((a, b) => a.z2 - b.z2);

      // Render 3D node spheres and labels
      sortedNodes.forEach((node) => {
        const radius = Math.max(12, 22 * node.scale);

        // Ambient glow around node
        const glow = ctx.createRadialGradient(node.x2d, node.y2d, radius * 0.2, node.x2d, node.y2d, radius * 2);
        glow.addColorStop(0, node.color);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.globalAlpha = 0.25;
        ctx.beginPath();
        ctx.arc(node.x2d, node.y2d, radius * 2, 0, Math.PI * 2);
        ctx.fill();

        // Node badge circle
        ctx.globalAlpha = 0.95;
        ctx.fillStyle = '#FFF9F1';
        ctx.beginPath();
        ctx.arc(node.x2d, node.y2d, radius, 0, Math.PI * 2);
        ctx.fill();

        // Border ring
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 1.5 * node.scale;
        ctx.stroke();

        // Icon inside node
        ctx.font = `${Math.round(13 * node.scale)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.icon, node.x2d, node.y2d);

        // Label pill below node
        const labelSize = Math.max(10, Math.round(11 * node.scale));
        ctx.font = `600 ${labelSize}px "Plus Jakarta Sans", sans-serif`;
        const textWidth = ctx.measureText(node.label).width;

        // Label background pill
        ctx.fillStyle = '#FAF5ED';
        ctx.strokeStyle = '#E8DEC8';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.9;
        const pillH = labelSize + 10;
        const pillW = textWidth + 16;
        const pillX = node.x2d - pillW / 2;
        const pillY = node.y2d + radius + 6;

        ctx.beginPath();
        ctx.roundRect(pillX, pillY, pillW, pillH, 8);
        ctx.fill();
        ctx.stroke();

        // Label text
        ctx.fillStyle = '#234653';
        ctx.globalAlpha = 1;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label, node.x2d, pillY + pillH / 2);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', handleScroll);
      container.removeEventListener('mousemove', handleMouseMove);
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [scrollProgress]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-3xl border border-[#E8DEC8] bg-[#FAF5ED]/90 backdrop-blur-md shadow-lg ${className}`}
      style={{ minHeight: '440px' }}
    >
      {/* 3D Canvas Background */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing pointer-events-auto" />

      {/* Editorial Content Overlay */}
      <div className="relative z-10 pointer-events-none flex flex-col justify-between h-full p-6 sm:p-10">
        <div className="max-w-md space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF9F1]/90 backdrop-blur-xs border border-[#E8DEC8] text-[11px] font-bold uppercase tracking-wider text-[#E86F5A] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#E86F5A] animate-ping"></span>
            Real-Time Synchronization Core
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-[#234653] font-serif-editorial tracking-tight leading-snug">
            All household strands harmonized in 3D.
          </h3>
          <p className="text-xs sm:text-sm text-[#3E737C] leading-relaxed">
            Move your cursor or scroll through to see how chores, debts, grocery requests, and roommate favors interlock seamlessly.
          </p>
        </div>

        <div className="pt-8 flex items-center justify-between text-[11px] text-[#3E737C] font-mono">
          <div className="flex items-center gap-2 bg-[#FFF9F1]/80 px-3 py-1.5 rounded-xl border border-[#E8DEC8]">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Live Socket Latency &lt; 24ms</span>
          </div>
          <span className="hidden sm:inline-block bg-[#FFF9F1]/80 px-3 py-1.5 rounded-xl border border-[#E8DEC8]">
            ✦ 3D Spatial Canvas
          </span>
        </div>
      </div>
    </div>
  );
}
