"use client";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { Sticker } from "@/components/Sticker";
import { EVENT } from "@/lib/event";
import { NiniPhoto } from "./NiniPhoto";
import { Ransom } from "./Ransom";

export function Hero({ guestName, ready }: { guestName?: string; ready: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const drift = (n: number) => (reduce ? 0 : n);
  const yFast = useTransform(scrollYProgress, [0, 1], [0, drift(-220)]);
  const ySlow = useTransform(scrollYProgress, [0, 1], [0, drift(-90)]);
  const yDown = useTransform(scrollYProgress, [0, 1], [0, drift(140)]);
  const rot = useTransform(scrollYProgress, [0, 1], [0, drift(40)]);

  const base = ready ? 0.15 : 0.1;
  const pop = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { scale: 0, opacity: 0 },
          animate: ready ? { scale: 1, opacity: 1 } : undefined,
          transition: { type: "spring" as const, stiffness: 220, damping: 14, delay: base + delay },
        };

  return (
    <header ref={ref} className="hero">
      {/* Esquinas de bola disco, como en la referencia */}
      <motion.div className="deco" style={{ top: -8, left: -10, width: "clamp(120px, 26vw, 220px)", y: ySlow }} {...pop(0.2)}>
        <Sticker name="disco-esquina-rosa-top" eager />
      </motion.div>
      <motion.div className="deco" style={{ bottom: -6, left: -12, width: "clamp(150px, 30vw, 280px)", y: yDown }} {...pop(0.35)}>
        <Sticker name="disco-esquina-plata" eager />
      </motion.div>
      <motion.div className="deco" style={{ bottom: -6, right: -8, width: "clamp(110px, 20vw, 190px)", y: ySlow }} {...pop(0.45)}>
        <Sticker name="disco-esquina-rosa" eager />
      </motion.div>

      {/* Bola disco colgando que se balancea */}
      <motion.div
        className="hanging-disco"
        initial={reduce ? false : { y: -260 }}
        animate={ready ? { y: 0 } : undefined}
        transition={{ type: "spring", stiffness: 70, damping: 9, delay: 0.3 }}
      >
        <motion.div
          style={{ transformOrigin: "50% 0" }}
          animate={reduce ? undefined : { rotate: [4, -4, 4] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sticker name="bola-disco" eager alt="" />
          <Glints />
        </motion.div>
      </motion.div>

      <Twinkle name="estrella-rosa" style={{ top: "22%", left: "58%", width: 58 }} delay={0} y={yFast} />
      <Twinkle name="estrella-plata" style={{ top: "13%", left: "38%", width: 40 }} delay={0.7} y={ySlow} />
      <Twinkle name="estrella-rosa-2" style={{ bottom: "24%", right: "8%", width: 44 }} delay={1.3} y={yFast} />
      <Twinkle name="estrella-plata-2" style={{ bottom: "34%", left: "4%", width: 34 }} delay={0.4} y={ySlow} />
      <motion.div className="deco" style={{ top: "44%", right: "3%", width: 46, rotate: rot, y: yFast }} {...pop(0.9)}>
        <Sticker name="beso" eager />
      </motion.div>

      <div className="hero__inner">
        <div className="hero__copy">
          {guestName && (
            <motion.p
              className="tag"
              initial={reduce ? false : { opacity: 0, y: -20, rotate: 6 }}
              animate={ready ? { opacity: 1, y: 0, rotate: -2 } : undefined}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            >
              Para <strong>{guestName}</strong>
            </motion.p>
          )}
          <h1 className="hero__title">
            {ready ? <Ransom text={EVENT.nickname} delay={0.2} /> : <span className="ransom" style={{ visibility: "hidden" }}>{EVENT.nickname}</span>}
            <motion.span
              className="hero__birthday"
              initial={reduce ? false : { opacity: 0, clipPath: "inset(0 100% 0 0)" }}
              animate={ready ? { opacity: 1, clipPath: "inset(0 0% 0 0)" } : undefined}
              transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1], delay: 0.85 }}
            >
              Birthday
            </motion.span>
          </h1>
          <motion.p
            className="hero__sub"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={ready ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 1.35 }}
          >
            {EVENT.honoree} cumple {EVENT.age}. <b>{EVENT.dateLabel}, {EVENT.timeLabel}</b> en <b>{EVENT.venue.name}</b>.
          </motion.p>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16, scale: 0.9 }}
            animate={ready ? { opacity: 1, y: 0, scale: 1 } : undefined}
            transition={{ type: "spring", stiffness: 200, damping: 16, delay: 1.5 }}
          >
            <a className="btn" href="#confirmar">
              Confirmar asistencia
            </a>
          </motion.div>
        </div>

        <div className="hero__art" aria-hidden="true">
          <Balloon name="globo-2" className="balloon balloon--2" delay={0.5} ready={ready} bob={0} />
          <Balloon name="globo-5" className="balloon balloon--5" delay={0.7} ready={ready} bob={0.9} />
          <div className="hero__photo">
            <NiniPhoto id="2004" width="100%" tilt={6} enter="mount" active={ready} delay={1.0} eager />
          </div>
          <motion.div className="deco" style={{ bottom: "-2%", right: "0%", width: "clamp(80px, 18vw, 130px)", rotate: rot }} {...pop(1.25)}>
            <Sticker name="hibisco-rosa" eager />
          </motion.div>
        </div>
      </div>
    </header>
  );
}

function Balloon({ name, className, delay, ready, bob }: { name: "globo-2" | "globo-5"; className: string; delay: number; ready: boolean; bob: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { y: 420, opacity: 0 }}
      animate={ready ? { y: 0, opacity: 1 } : undefined}
      transition={{ type: "spring", stiffness: 55, damping: 11, delay }}
    >
      <motion.div
        animate={reduce ? undefined : { y: [0, -16, 0], rotate: [-3, 3, -3] }}
        transition={{ duration: 4.6, delay: bob, repeat: Infinity, ease: "easeInOut" }}
      >
        <Sticker name={name} eager className="" />
        <motion.span
          className="balloon__string"
          animate={reduce ? undefined : { rotate: [6, -6, 6] }}
          transition={{ duration: 3.4, delay: bob, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </motion.div>
  );
}

function Twinkle({
  name,
  style,
  delay,
  y,
}: {
  name: "estrella-rosa" | "estrella-plata" | "estrella-rosa-2" | "estrella-plata-2";
  style: React.CSSProperties;
  delay: number;
  y: MotionValue<number>;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div className="deco" style={{ ...style, y }} aria-hidden="true">
      <motion.div
        animate={reduce ? undefined : { scale: [0.85, 1.12, 0.85], rotate: [0, 18, 0], opacity: [0.75, 1, 0.75] }}
        transition={{ duration: 2.6, delay, repeat: Infinity, ease: "easeInOut" }}
      >
        <Sticker name={name} eager />
      </motion.div>
    </motion.div>
  );
}

function Glints() {
  const reduce = useReducedMotion();
  if (reduce) return null;
  const spots = [
    { left: "30%", top: "58%", d: 0 },
    { left: "62%", top: "72%", d: 0.9 },
    { left: "48%", top: "86%", d: 1.7 },
  ];
  return (
    <>
      {spots.map((s, i) => (
        <motion.span
          key={i}
          className="glint"
          style={{ left: s.left, top: s.top }}
          animate={{ scale: [0, 1.4, 0], rotate: [0, 45, 90], opacity: [0, 1, 0] }}
          transition={{ duration: 1.6, delay: s.d, repeat: Infinity, repeatDelay: 1.2 }}
        />
      ))}
    </>
  );
}
