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
      {/* Sol de medianoche: disco cálido, rayos lentos y reflejo en el horizonte */}
      <motion.div
        className="sun"
        aria-hidden="true"
        style={{ y: yDown }}
        initial={reduce ? false : { opacity: 0, scale: 0.6 }}
        animate={ready ? { opacity: 1, scale: 1 } : undefined}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      >
        <span className="sun__rays" />
        <span className="sun__halo" />
        <motion.span
          className="sun__disc"
          animate={reduce ? undefined : { scale: [1, 1.035, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
      <div className="horizon" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      {/* Stickers de verano en las esquinas */}
      <motion.div className="deco" style={{ top: -30, left: -34, width: "clamp(110px, 22vw, 190px)", y: ySlow }} {...pop(0.2)}>
        <Sticker name="toronja" eager />
      </motion.div>
      <motion.div className="deco" style={{ bottom: -20, left: -30, width: "clamp(130px, 26vw, 230px)", y: yDown }} {...pop(0.35)}>
        <Sticker name="hibisco-naranja" eager />
      </motion.div>
      <motion.div className="deco" style={{ bottom: -14, right: -20, width: "clamp(100px, 18vw, 170px)", y: ySlow }} {...pop(0.45)}>
        <Sticker name="concha" eager />
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
            <b>{EVENT.dateLabel}, {EVENT.timeLabel}</b> en <b>{EVENT.venue.name}</b>.
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
