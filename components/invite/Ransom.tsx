"use client";
import { motion, useReducedMotion } from "motion/react";

/* Cada letra es un recorte distinto, como en la referencia "Birthday Party". Valores fijos para que SSR y cliente coincidan. */
const LOOKS = [
  { bg: "#c2345a", fg: "#fff4f1", font: "var(--font-serif)", italic: false, rot: -6, y: 4, clip: "polygon(2% 4%, 98% 0, 100% 96%, 0 100%)" },
  { bg: "#f5d98f", fg: "#9c2145", font: "var(--font-condensed)", italic: false, rot: 4, y: -6, clip: "polygon(0 2%, 100% 5%, 97% 100%, 3% 97%)" },
  { bg: "#ffe2d2", fg: "#c9650a", font: "var(--font-script)", italic: false, rot: -3, y: 2, clip: "polygon(4% 0, 100% 3%, 96% 98%, 0 100%)" },
  { bg: "#ee8fa7", fg: "#3d1622", font: "var(--font-serif)", italic: true, rot: 7, y: -2, clip: "polygon(0 0, 97% 4%, 100% 100%, 5% 95%)" },
  { bg: "#3d1622", fg: "#f7d3d9", font: "var(--font-condensed)", italic: false, rot: -8, y: 0, clip: "polygon(8% 0, 100% 10%, 90% 100%, 0 88%)" },
  { bg: "#e8801a", fg: "#fff4f1", font: "var(--font-serif)", italic: false, rot: 5, y: 3, clip: "polygon(3% 3%, 100% 0, 98% 97%, 0 100%)" },
  { bg: "#f7d3d9", fg: "#c2345a", font: "var(--font-condensed)", italic: false, rot: -4, y: -4, clip: "polygon(0 5%, 96% 0, 100% 100%, 4% 96%)" },
];

export function Ransom({ text, delay = 0, className }: { text: string; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  const chars = Array.from(text);
  return (
    <span className={`ransom ${className ?? ""}`} aria-label={text} role="text">
      {chars.map((ch, i) => {
        const look = LOOKS[i % LOOKS.length];
        const tick = ch === "'" || ch === "’";
        return (
          <motion.span
            key={i}
            aria-hidden="true"
            className={`ransom__tile ${tick ? "ransom__tile--tick" : ""}`}
            style={{
              background: look.bg,
              color: look.fg,
              fontFamily: look.font,
              fontStyle: look.italic ? "italic" : "normal",
              fontWeight: look.font.includes("condensed") ? 700 : 400,
              clipPath: look.clip,
              y: look.y,
            }}
            initial={reduce ? false : { opacity: 0, y: -140, rotate: look.rot * 5, scale: 1.4 }}
            animate={{ opacity: 1, y: look.y, rotate: look.rot, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 16, delay: delay + i * 0.09 }}
            whileHover={reduce ? undefined : { rotate: -look.rot, scale: 1.08, transition: { type: "spring", stiffness: 400, damping: 10 } }}
          >
            {ch === "'" ? "’" : ch}
          </motion.span>
        );
      })}
    </span>
  );
}
