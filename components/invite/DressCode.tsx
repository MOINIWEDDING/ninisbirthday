"use client";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, PinterestLogo, X } from "@phosphor-icons/react";
import { Sticker } from "@/components/Sticker";
import { DRESS_CODE } from "@/lib/event";
import type { Pin } from "@/lib/pinterest";
import { Reveal } from "./Reveal";
import "./dresscode.css";

const TILTS = [-2.5, 1.8, -1, 2.6, -1.8, 1.2];

export function DressCode({ pins }: { pins: Pin[] }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="section dress" id="vestimenta" aria-labelledby="dress-h">
      <div className="deco" style={{ top: 40, right: "5%", width: "clamp(70px, 13vw, 120px)" }}>
        <Reveal kind="slap" rotate={12}>
          <Sticker name="hibisco-rosa" />
        </Reveal>
      </div>
      <div className="deco" style={{ bottom: 30, left: "4%", width: "clamp(56px, 10vw, 90px)" }}>
        <Reveal kind="slap" rotate={-10} delay={0.15}>
          <Sticker name="spritz" />
        </Reveal>
      </div>

      <div className="section__wrap">
        <Reveal>
          <p className="dress__eyebrow">Código de vestimenta</p>
          <h2 id="dress-h" className="script-h dress__title">
            {DRESS_CODE.title}
          </h2>
          <p className="dress__text">{DRESS_CODE.text}</p>
        </Reveal>

        {pins.length > 0 ? (
          <ul className="pins">
            {pins.map((pin, i) => (
              <motion.li
                key={pin.id}
                className="pin"
                style={{ rotate: TILTS[i % TILTS.length] }}
                initial={reduce ? false : { opacity: 0, y: 40, scale: 0.92 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ type: "spring", stiffness: 180, damping: 18, delay: (i % 4) * 0.07 }}
                whileHover={reduce ? undefined : { rotate: 0, scale: 1.03, y: -6 }}
              >
                <button type="button" className="pin__btn" onClick={() => setOpen(i)} aria-label={`Ver idea ${i + 1}${pin.title ? `: ${pin.title}` : ""}`}>
                  {i % 3 === 0 && <span className="pin__tape" aria-hidden="true" />}
                  <img src={pin.image} alt={pin.title || "Idea de vestimenta"} loading="lazy" decoding="async" referrerPolicy="no-referrer" />
                </button>
              </motion.li>
            ))}
          </ul>
        ) : (
          <BoardEmbed />
        )}

        <Reveal className="dress__cta">
          <a className="btn btn--ghost" href={DRESS_CODE.boardUrl} target="_blank" rel="noopener noreferrer">
            <PinterestLogo size={20} weight="fill" />
            Ver el tablero completo
          </a>
        </Reveal>
      </div>

      {/* El visor va directo al <body> para quedar por encima de todo */}
      {mounted &&
        createPortal(
          <AnimatePresence>{open !== null && <Lightbox pins={pins} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}</AnimatePresence>,
          document.body,
        )}
    </section>
  );
}

function Lightbox({ pins, index, onIndex, onClose }: { pins: Pin[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const reduce = useReducedMotion();
  const [dir, setDir] = useState(0);
  const go = useCallback(
    (d: number) => {
      setDir(d);
      onIndex((index + d + pins.length) % pins.length);
    },
    [index, onIndex, pins.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [go, onClose]);

  const pin = pins[index];
  return (
    <motion.div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Galería de ideas"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <button type="button" className="lightbox__close" onClick={onClose} aria-label="Cerrar">
        <X size={24} weight="bold" />
      </button>
      <div className="lightbox__stage" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.img
            key={pin.id}
            src={pin.image}
            alt={pin.title || "Idea de vestimenta"}
            referrerPolicy="no-referrer"
            className="lightbox__img"
            custom={dir}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: dir * 120, rotate: dir * 4 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: dir * -120, rotate: dir * -4 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            drag={pins.length > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={(_, info) => {
              if (info.offset.x < -70) go(1);
              else if (info.offset.x > 70) go(-1);
            }}
          />
        </AnimatePresence>
      </div>
      {pins.length > 1 && (
        <>
          <button type="button" className="lightbox__nav lightbox__nav--prev" onClick={() => go(-1)} aria-label="Anterior">
            <ArrowLeft size={22} weight="bold" />
          </button>
          <button type="button" className="lightbox__nav lightbox__nav--next" onClick={() => go(1)} aria-label="Siguiente">
            <ArrowRight size={22} weight="bold" />
          </button>
        </>
      )}
      <div className="lightbox__bar">
        <span>
          {index + 1} / {pins.length}
        </span>
        <a href={pin.link} target="_blank" rel="noopener noreferrer">
          <PinterestLogo size={18} weight="fill" /> Ver en Pinterest
        </a>
      </div>
    </motion.div>
  );
}

/** Respaldo: el widget oficial de Pinterest, por si no se pudieron leer las fotos */
function BoardEmbed() {
  useEffect(() => {
    const w = window as unknown as { PinUtils?: { build: () => void } };
    if (w.PinUtils) {
      w.PinUtils.build();
      return;
    }
    if (document.getElementById("pinterest-pinit")) return;
    const s = document.createElement("script");
    s.id = "pinterest-pinit";
    s.async = true;
    s.src = "https://assets.pinterest.com/js/pinit.js";
    document.body.appendChild(s);
  }, []);
  return (
    <div className="board-embed">
      <a data-pin-do="embedBoard" data-pin-board-width="1000" data-pin-scale-height="520" data-pin-scale-width="140" href={DRESS_CODE.boardUrl}>
        Abrir el tablero en Pinterest
      </a>
    </div>
  );
}
