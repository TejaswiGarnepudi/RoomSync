"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "../../lib/utils";

export interface AnimatedTopographicBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  gridSize?: number;
  lineCount?: number;
}

// Helper function for smooth Perlin/Simplex noise
function createNoise() {
  const permutation = [
    151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140,
    36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120,
    234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
    88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71,
    134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133,
    230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161,
    1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130,
    116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250,
    124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227,
    47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44,
    154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98,
    108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34,
    242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14,
    239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121,
    50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243,
    141, 128, 195, 78, 66, 215, 61, 156, 180,
  ];

  const p = new Array(512);
  for (let i = 0; i < 256; i++) p[256 + i] = p[i] = permutation[i];

  function fade(t: number) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  function lerp(t: number, a: number, b: number) {
    return a + t * (b - a);
  }

  function grad(hash: number, x: number, y: number, z: number) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  return {
    noise2D: (x: number, y: number, z: number = 0) => {
      const X = Math.floor(x) & 255;
      const Y = Math.floor(y) & 255;
      const Z = Math.floor(z) & 255;

      x -= Math.floor(x);
      y -= Math.floor(y);
      z -= Math.floor(z);

      const u = fade(x);
      const v = fade(y);
      const w = fade(z);

      const A = p[X] + Y;
      const AA = p[A] + Z;
      const AB = p[A + 1] + Z;
      const B = p[X + 1] + Y;
      const BA = p[B] + Z;
      const BB = p[B + 1] + Z;

      return lerp(
        w,
        lerp(
          v,
          lerp(u, grad(p[AA], x, y, z), grad(p[BA], x - 1, y, z)),
          lerp(u, grad(p[AB], x, y - 1, z), grad(p[BB], x - 1, y - 1, z)),
        ),
        lerp(
          v,
          lerp(
            u,
            grad(p[AA + 1], x, y, z - 1),
            grad(p[BA + 1], x - 1, y, z - 1),
          ),
          lerp(
            u,
            grad(p[AB + 1], x, y - 1, z - 1),
            grad(p[BB + 1], x - 1, y - 1, z - 1),
          ),
        ),
      );
    },
  };
}

export function AnimatedTopographicBackground({
  children,
  className,
  gridSize = 48,
  lineCount = 18,
}: AnimatedTopographicBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const noise = useRef(createNoise()).current;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const resize = () => {
      const w = container ? container.offsetWidth : window.innerWidth;
      const h = container ? container.offsetHeight : window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = w || 800;
      height = h || 800;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();

    let time = 0;

    // Elevation contour rings definitions
    const centers = [
      { xRatio: 0.22, yRatio: 0.32, radius: 140, layers: 7, speed: 0.15 },
      { xRatio: 0.72, yRatio: 0.38, radius: 220, layers: 9, speed: -0.12 },
      { xRatio: 0.35, yRatio: 0.75, radius: 180, layers: 8, speed: 0.1 },
      { xRatio: 0.85, yRatio: 0.78, radius: 240, layers: 10, speed: -0.14 },
    ];

    const animate = () => {
      time += 0.003;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Subtle Coordinate Blueprint Grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.lineWidth = 0.75;
      ctx.setLineDash([]);

      for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = 0; y <= height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Draw Topographic Ridge Isobars (Horizontal sweeping contour waves)
      const rows = lineCount;
      const yStep = height / (rows + 1);

      for (let r = 1; r <= rows; r++) {
        const baseY = r * yStep;
        const isDashed = r % 3 === 0;
        const isMainContour = r % 5 === 0;

        ctx.beginPath();
        if (isDashed) {
          ctx.setLineDash([4, 6]);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
          ctx.lineWidth = 0.8;
        } else if (isMainContour) {
          ctx.setLineDash([]);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
          ctx.lineWidth = 1.2;
        } else {
          ctx.setLineDash([]);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
          ctx.lineWidth = 0.85;
        }

        const stepX = 14;
        let started = false;

        for (let x = 0; x <= width + stepX; x += stepX) {
          const n1 = noise.noise2D(x * 0.003, baseY * 0.003 + time * 0.2);
          const n2 = noise.noise2D(x * 0.008 + time * 0.15, baseY * 0.008);
          const n3 = Math.sin(x * 0.005 + time + r * 0.4) * 12;

          const offsetY = n1 * 55 + n2 * 18 + n3;
          const y = baseY + offsetY;

          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // 3. Draw Concentric Elevation Closed Loops (Peaks & Depressions)
      centers.forEach((center, cIdx) => {
        const cx = center.xRatio * width + Math.sin(time * 0.5 + cIdx) * 20;
        const cy = center.yRatio * height + Math.cos(time * 0.4 + cIdx) * 15;

        for (let l = 1; l <= center.layers; l++) {
          const ringRadius = (center.radius / center.layers) * l;
          const isDashed = (l + cIdx) % 2 === 0;
          const isMajor = l === center.layers || l === Math.floor(center.layers / 2);

          ctx.beginPath();
          if (isDashed) {
            ctx.setLineDash([3, 5]);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
            ctx.lineWidth = 0.8;
          } else if (isMajor) {
            ctx.setLineDash([]);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
            ctx.lineWidth = 1.15;
          } else {
            ctx.setLineDash([]);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
            ctx.lineWidth = 0.85;
          }

          const points = 42;
          for (let pIdx = 0; pIdx <= points; pIdx++) {
            const theta = (pIdx / points) * Math.PI * 2;

            const angleNoise = noise.noise2D(
              Math.cos(theta) * 1.5 + center.speed * time,
              Math.sin(theta) * 1.5 + center.speed * time + l * 0.2
            );

            const rPerturbed = ringRadius + angleNoise * (14 + l * 2);
            const finalX = cx + Math.cos(theta) * rPerturbed;
            const finalY = cy + Math.sin(theta) * rPerturbed;

            if (pIdx === 0) {
              ctx.moveTo(finalX, finalY);
            } else {
              ctx.lineTo(finalX, finalY);
            }
          }
          ctx.closePath();
          ctx.stroke();
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      resize();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [gridSize, lineCount, noise]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full overflow-hidden bg-[#0D0D0C]",
        className
      )}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      {children && (
        <div className="relative z-10 w-full h-full flex flex-col justify-between">
          {children}
        </div>
      )}
    </div>
  );
}

export default AnimatedTopographicBackground;
