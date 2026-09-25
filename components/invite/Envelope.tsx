"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Sticker } from "@/components/Sticker";
import { burst } from "./confetti";

type Phase = "closed" | "opening" | "gone";

export function Envelope({ guestName, onOpened }: { guestName?: string; onOpened: () => void }) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("closed");

  useEffect(() => {
    if (phase === "gone") {
      document.documentElement.style.overflow = "";
      return;
    }
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [phase]);

  function open() {
    if (phase !== "closed") return;
    setPhase("opening");
    onOpened();
    const total = reduce ? 250 : 1750;
    if (!reduce) window.setTimeout(() => burst({ x: 0.5, y: 0.4 }, 0.8), 1050);
    window.setTimeout(() => setPhase("gone"), total);
  }

  const opening = phase === "opening";
  const first = guestName?.split(" ")[0];

  return (
    <AnimatePresence>
      {phase !== "gone" && (
        <motion.div
          className="intro"
          key="intro"
          exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.08, filter: "blur(6px)" }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <Deco />
          <div className="intro__stack">
            <motion.button
              type="button"
              className="env"
              onClick={open}
              aria-label={first ? `Abrir la invitación para ${first}` : "Abrir la invitación"}
              initial={reduce ? false : { y: 60, opacity: 0, rotate: -8 }}
              animate={
                opening
                  ? { y: 40, rotate: 0, opacity: 1 }
                  : { y: 0, opacity: 1, rotate: [-2, 2, -2] }
              }
              transition={
                opening
                  ? { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
                  : { y: { type: "spring", stiffness: 120, damping: 14 }, opacity: { duration: 0.4 }, rotate: { duration: 3.2, repeat: Infinity, ease: "easeInOut" } }
              }
              whileHover={opening || reduce ? undefined : { scale: 1.03 }}
              whileTap={opening ? undefined : { scale: 0.97 }}
            >
              <span className="env__back" />
              <motion.span
                className="env__card"
                style={{ zIndex: 1 }}
                animate={opening && !reduce ? { y: "-72%", rotate: -3 } : { y: 0 }}
                transition={{ delay: 0.62, type: "spring", stiffness: 110, damping: 14 }}
              >
                <img className="env__face" src="/nini/nini-2002.webp" alt="" width={525} height={543} />
                <span>
                  Nini’s
                  <small>25 · 24.10</small>
                </span>
              </motion.span>
              <span className="env__pocket" style={{ zIndex: 2 }} />
              <span className="env__to" style={{ zIndex: 3 }}>
                {first ? `Para ${first}` : "Estás invitad@"}
              </span>
              <motion.span
                className="env__flap"
                initial={false}
                animate={opening && !reduce ? { rotateX: 180, zIndex: 0 } : { rotateX: 0, zIndex: 4 }}
                transition={{ rotateX: { delay: 0.18, duration: 0.55, ease: [0.65, 0, 0.35, 1] }, zIndex: { delay: 0.45 } }}
              >
                <motion.span
                  className="env__seal"
                  animate={opening && !reduce ? { scale: [1, 1.3, 0], opacity: [1, 1, 0] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="env__seal-disc">
                    <Sticker name="beso" eager />
                  </span>
                </motion.span>
              </motion.span>
            </motion.button>
            <motion.p
              className="intro__hint"
              animate={opening ? { opacity: 0 } : { opacity: [0.55, 1, 0.55] }}
              transition={opening ? { duration: 0.2 } : { duration: 2, repeat: Infinity }}
            >
              Toca el sobre para abrir
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Deco() {
  const reduce = useReducedMotion();
  const items = [
    { name: "estrella-rosa", style: { top: "9%", left: "8%", width: 70 }, d: 0 },
    { name: "estrella-plata", style: { top: "16%", right: "10%", width: 54 }, d: 0.4 },
    { name: "beso-2", style: { bottom: "20%", left: "12%", width: 48 }, d: 0.8 },
    { name: "estrella-rosa-2", style: { bottom: "12%", right: "14%", width: 46 }, d: 1.2 },
  ] as const;
  return (
    <>
      {items.map((it) => (
        <motion.div
          key={it.name}
          className="intro__deco"
          style={it.style}
          initial={reduce ? false : { scale: 0, rotate: -40 }}
          animate={reduce ? undefined : { scale: [1, 1.15, 1], rotate: [0, 12, 0] }}
          transition={{ duration: 3, delay: it.d, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sticker name={it.name} eager />
        </motion.div>
      ))}
    </>
  );
}
