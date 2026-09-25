"use client";
import { motion, useReducedMotion, type TargetAndTransition } from "motion/react";
import { HAT_SIZE, NINI_PHOTOS, type NiniPhotoId } from "@/lib/nini";

export type Mood = "idle" | "happy" | "sad";

type Props = {
  id: NiniPhotoId;
  /** Ancho CSS del sticker (ej. "clamp(120px, 30vw, 220px)") */
  width: string;
  /** Inclinación de reposo */
  tilt?: number;
  hat?: boolean;
  /** Retraso de la entrada */
  delay?: number;
  /** "view" = aparece al hacer scroll; "mount" = aparece cuando active=true */
  enter?: "view" | "mount";
  active?: boolean;
  /** Movimiento continuo: flotar o bailar */
  idle?: "float" | "dance" | "none";
  mood?: Mood;
  eager?: boolean;
  decorative?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

/** Foto de Nini de niña convertida en sticker troquelado, con sombrerito de fiesta animado. */
export function NiniPhoto({
  id,
  width,
  tilt = 0,
  hat = true,
  delay = 0,
  enter = "view",
  active = true,
  idle = "float",
  mood = "idle",
  eager,
  decorative,
  className,
  style,
}: Props) {
  const reduce = useReducedMotion();
  const p = NINI_PHOTOS[id];
  const [hw, hh] = HAT_SIZE[p.hat];

  const hidden = { opacity: 0, scale: 1.7, rotate: tilt * 3 - 12 };
  const shown = { opacity: 1, scale: 1, rotate: tilt };
  const entry = reduce
    ? { initial: false as const, animate: shown }
    : enter === "view"
      ? { initial: hidden, whileInView: shown, viewport: { once: true, amount: 0.35 } }
      : { initial: hidden, animate: active ? shown : hidden };

  const moodAnim: TargetAndTransition =
    mood === "happy"
      ? { y: [0, -34, 0, -16, 0], rotate: [0, -8, 6, -3, 0], scale: [1, 1.08, 1, 1.03, 1], transition: { duration: 0.9 } }
      : mood === "sad"
        ? { y: 10, rotate: -10, scale: 0.94, transition: { type: "spring", stiffness: 160, damping: 12 } }
        : idle === "dance"
          ? { rotate: [-6, 6, -6], y: [0, -8, 0, -8, 0], transition: { duration: 1.4, repeat: Infinity, ease: "easeInOut" } }
          : idle === "float"
            ? { y: [0, -9, 0], rotate: [-1.5, 1.5, -1.5], transition: { duration: 5 + (Number(id) % 3), repeat: Infinity, ease: "easeInOut" } }
            : { y: 0, rotate: 0, scale: 1 };

  const hatAnim: TargetAndTransition =
    mood === "happy"
      ? { y: [0, -60, 0], rotate: [p.hatRot, p.hatRot + 380, p.hatRot + 360], transition: { duration: 0.9, ease: "easeOut" } }
      : mood === "sad"
        ? { rotate: p.hatRot - 18, y: 6, transition: { type: "spring", stiffness: 140, damping: 10 } }
        : { rotate: [p.hatRot - 7, p.hatRot + 7, p.hatRot - 7], y: 0, transition: { duration: 2.4, repeat: Infinity, ease: "easeInOut" } };

  return (
    <motion.div
      className={`nini ${className ?? ""}`}
      style={{ width, ...style }}
      {...entry}
      transition={{ type: "spring", stiffness: 240, damping: 15, delay }}
      whileHover={reduce ? undefined : { scale: 1.06, rotate: tilt - 4, transition: { type: "spring", stiffness: 300, damping: 12 } }}
      aria-hidden={decorative || undefined}
    >
      <motion.div className="nini__body" animate={reduce ? undefined : moodAnim} style={{ transformOrigin: "50% 90%" }}>
        <img
          src={`/nini/nini-${id}.webp`}
          width={p.w}
          height={p.h}
          alt={decorative ? "" : p.alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          className="nini__img"
        />
        {hat && (
          <motion.div
            className="nini__hat"
            aria-hidden="true"
            style={{ left: `${p.hatX * 100}%`, top: `${p.hatY * 100}%`, width: `${p.hatW * 100}%`, x: "-50%", y: "-100%", transformOrigin: "50% 100%" }}
            initial={reduce ? false : { scale: 0 }}
            {...(enter === "view" && !reduce ? { whileInView: { scale: 1 }, viewport: { once: true } } : { animate: { scale: active || reduce ? 1 : 0 } })}
            transition={{ type: "spring", stiffness: 300, damping: 12, delay: delay + 0.35 }}
          >
            <motion.img
              src={`/nini/hat-${p.hat}.webp`}
              width={hw}
              height={hh}
              alt=""
              draggable={false}
              loading={eager ? "eager" : "lazy"}
              style={{ width: "100%", height: "auto", display: "block", rotate: p.hatRot, transformOrigin: "50% 100%" }}
              animate={reduce ? undefined : hatAnim}
            />
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
