"use client";
import { motion, useReducedMotion } from "motion/react";

type Kind = "rise" | "slap" | "drop";

/** Entrada al hacer scroll. "slap" = sticker que se pega; "drop" = recorte que cae. */
export function Reveal({
  children,
  kind = "rise",
  delay = 0,
  rotate = 0,
  className,
  style,
}: {
  children: React.ReactNode;
  kind?: Kind;
  delay?: number;
  rotate?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const reduce = useReducedMotion();
  const hidden =
    kind === "slap"
      ? { opacity: 0, scale: 1.8, rotate: rotate * 3 }
      : kind === "drop"
        ? { opacity: 0, y: -60, rotate: rotate * 4 }
        : { opacity: 0, y: 36 };
  const shown = { opacity: 1, scale: 1, y: 0, rotate };
  return (
    <motion.div
      className={className}
      style={style}
      initial={reduce ? { rotate } : hidden}
      whileInView={shown}
      viewport={{ once: true, amount: 0.3 }}
      transition={
        kind === "rise"
          ? { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }
          : { type: "spring", stiffness: 260, damping: 17, delay }
      }
    >
      {children}
    </motion.div>
  );
}
