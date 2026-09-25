"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Sticker } from "@/components/Sticker";
import { EVENT } from "@/lib/event";
import { Reveal } from "./Reveal";

const START = new Date(EVENT.startsAt).getTime();
const END = new Date(EVENT.endsAt).getTime();

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

const TILES = [
  { key: "d", label: "Días", bg: "#c2345a", fg: "#fff4f1", rot: -3 },
  { key: "h", label: "Horas", bg: "#f5d98f", fg: "#9c2145", rot: 2 },
  { key: "m", label: "Min", bg: "#ffe2d2", fg: "#c9650a", rot: -1.5 },
  { key: "s", label: "Seg", bg: "#ee8fa7", fg: "#3d1622", rot: 3 },
] as const;

export function Countdown() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const live = now !== null && now >= START && now < END;
  const over = now !== null && now >= END;
  const p = parts(now === null ? 0 : START - now);

  return (
    <section className="section count" aria-labelledby="count-h">
      <div className="deco" style={{ top: 40, right: "6%", width: "clamp(70px, 14vw, 120px)" }}>
        <Reveal kind="slap" rotate={12}>
          <Sticker name="durazno" />
        </Reveal>
      </div>
      <div className="deco" style={{ bottom: 30, left: "5%", width: "clamp(60px, 12vw, 100px)" }}>
        <Reveal kind="slap" rotate={-14} delay={0.15}>
          <Sticker name="margarita" />
        </Reveal>
      </div>
      <div className="section__wrap">
        <Reveal>
          <h2 id="count-h" className="script-h">
            {live ? "¡Es hoy, es hoy!" : over ? "¡Gracias por celebrar!" : "Faltan"}
          </h2>
        </Reveal>

        {!live && !over && (
          <div className="count__grid" role="timer" aria-live="off">
            {TILES.map((t, i) => {
              const value = now === null ? null : p[t.key];
              return (
                <Reveal key={t.key} kind="drop" delay={0.08 * i} rotate={t.rot}>
                  <div className="count__unit">
                    <div className="count__tile" style={{ background: t.bg, color: t.fg, borderRadius: i % 2 ? 6 : 14 }}>
                      <Digits value={value} />
                    </div>
                    <span className="count__label">{t.label}</span>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}
        {now !== null && !live && !over && (
          <p className="sr-only">
            Faltan {p.d} días, {p.h} horas y {p.m} minutos.
          </p>
        )}
        {live && <p className="count__done">La fiesta ya empezó en {EVENT.venue.name}.</p>}
      </div>
    </section>
  );
}

function Digits({ value }: { value: number | null }) {
  const str = value === null ? "--" : String(value).padStart(2, "0");
  return (
    <span className="count__digits" aria-hidden="true">
      {Array.from(str).map((ch, i) => (
        <Digit key={i} ch={ch} />
      ))}
    </span>
  );
}

function Digit({ ch }: { ch: string }) {
  const reduce = useReducedMotion();
  return (
    <span className="count__digit">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={ch}
          initial={reduce ? false : { y: "-100%", rotateX: -70, opacity: 0 }}
          animate={{ y: "0%", rotateX: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { y: "100%", rotateX: 70, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
        >
          {ch}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
