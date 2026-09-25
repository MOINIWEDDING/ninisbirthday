"use client";
import confetti from "canvas-confetti";

const COLORS = ["#c2345a", "#ee8fa7", "#e8801a", "#f5d98f", "#f7d3d9", "#d9d4cf", "#bd1e37"];

export function burst(origin = { x: 0.5, y: 0.55 }, power = 1) {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const base = { colors: COLORS, zIndex: 90, disableForReducedMotion: true, ticks: 260 };
  confetti({ ...base, particleCount: Math.round(90 * power), spread: 75, startVelocity: 42, origin, scalar: 1.05 });
  confetti({ ...base, particleCount: Math.round(40 * power), spread: 120, startVelocity: 30, origin, shapes: ["circle"], scalar: 0.8 });
}

export function celebrate() {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const end = Date.now() + 1400;
  const frame = () => {
    confetti({ particleCount: 5, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors: COLORS, zIndex: 90 });
    confetti({ particleCount: 5, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors: COLORS, zIndex: 90 });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
  burst({ x: 0.5, y: 0.45 }, 1.3);
}
