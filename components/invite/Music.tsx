"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Play } from "@phosphor-icons/react";
import "./music.css";

export const MUSIC_SRC = "/musica.mp3";
const TARGET_VOLUME = 0.55;

/**
 * Arranca la música. Debe llamarse dentro del toque del usuario (al abrir el sobre),
 * porque los navegadores bloquean el audio que empieza solo.
 */
export function startMusic(audio: HTMLAudioElement | null) {
  if (!audio) return;
  audio.volume = 0;
  audio
    .play()
    .then(() => {
      // Entrada suave del volumen (iOS ignora el volumen y suena normal)
      const t0 = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / 2200);
        audio.volume = TARGET_VOLUME * k;
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    })
    .catch(() => {
      /* bloqueado: el botón queda en "reproducir" */
    });
}

export function Music({ audioRef, visible }: { audioRef: React.RefObject<HTMLAudioElement | null>; visible: boolean }) {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const on = () => setPlaying(true);
    const off = () => setPlaying(false);
    audio.addEventListener("play", on);
    audio.addEventListener("pause", off);

    // Si salen de la pestaña se pausa, y al volver sigue (solo si no la pausaron ellos)
    let resumeOnReturn = false;
    const onVisibility = () => {
      if (document.hidden && !audio.paused) {
        resumeOnReturn = true;
        audio.pause();
      } else if (!document.hidden && resumeOnReturn) {
        resumeOnReturn = false;
        audio.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      audio.removeEventListener("play", on);
      audio.removeEventListener("pause", off);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [audioRef]);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.volume = TARGET_VOLUME;
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }

  return (
    <>
      <audio ref={audioRef} src={MUSIC_SRC} loop preload="auto" playsInline />
      <AnimatePresence>
        {visible && (
          <motion.button
            key="music"
            type="button"
            className="music"
            onClick={toggle}
            aria-pressed={playing}
            aria-label={playing ? "Pausar la música" : "Reproducir la música"}
            title={playing ? "Pausar la música" : "Reproducir la música"}
            initial={{ opacity: 0, scale: 0.4, rotate: -30 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.4 }}
            transition={{ type: "spring", stiffness: 260, damping: 16, delay: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            {playing ? (
              <span className="music__bars" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </span>
            ) : (
              <Play size={22} weight="fill" aria-hidden="true" />
            )}
            <span className="music__label">{playing ? "Pausar" : "Música"}</span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
