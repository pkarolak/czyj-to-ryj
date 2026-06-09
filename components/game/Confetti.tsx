"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  spin: number;
  side: "left" | "right";
};

const COLORS = ["#f5c542", "#e85d75", "#4ecdc4", "#a78bfa", "#fb923c", "#34d399"];

type ConfettiProps = {
  /** viewport = pełny ekran; parent = wypełnia kontener (np. overlay) */
  scope?: "viewport" | "parent";
  className?: string;
};

export function Confetti({
  scope = "viewport",
  className,
}: ConfettiProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let raf = 0;

    const resize = () => {
      if (scope === "parent" && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    resize();
    window.addEventListener("resize", resize);

    let resizeObserver: ResizeObserver | undefined;
    if (scope === "parent" && canvas.parentElement) {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvas.parentElement);
    }

    const particles: Particle[] = [];
    const spawn = (side: "left" | "right", count: number) => {
      for (let i = 0; i < count; i++) {
        particles.push({
          x: side === "left" ? -10 : canvas.width + 10,
          y: Math.random() * canvas.height * 0.7 + canvas.height * 0.1,
          vx: side === "left" ? 4 + Math.random() * 6 : -(4 + Math.random() * 6),
          vy: -2 + Math.random() * 4,
          size: 6 + Math.random() * 8,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          rotation: Math.random() * Math.PI,
          spin: (Math.random() - 0.5) * 0.2,
          side,
        });
      }
    };

    const tick = () => {
      frame++;
      if (frame % 8 === 0) {
        spawn("left", 3);
        spawn("right", 3);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12;
        p.rotation += p.spin;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();

        if (
          p.y > canvas.height + 20 ||
          (p.side === "left" && p.x > canvas.width + 40) ||
          (p.side === "right" && p.x < -40)
        ) {
          particles.splice(i, 1);
        }
      }

      raf = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      resizeObserver?.disconnect();
    };
  }, [scope]);

  const defaultClassName =
    scope === "parent"
      ? "pointer-events-none absolute inset-0 z-0"
      : "pointer-events-none fixed inset-0 z-40";

  return (
    <canvas
      ref={canvasRef}
      className={className ?? defaultClassName}
      aria-hidden
    />
  );
}
