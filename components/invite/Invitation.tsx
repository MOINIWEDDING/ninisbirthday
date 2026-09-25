"use client";
import { useCallback, useRef, useState } from "react";
import { MotionConfig } from "motion/react";
import type { PublicGuest } from "@/lib/types";
import type { Pin } from "@/lib/pinterest";
import { Countdown } from "./Countdown";
import { Details } from "./Details";
import { DressCode } from "./DressCode";
import { Envelope } from "./Envelope";
import { Footer } from "./Footer";
import { Hero } from "./Hero";
import { Marquee } from "./Marquee";
import { Music, startMusic } from "./Music";
import { Rsvp } from "./Rsvp";
import { Throwback } from "./Throwback";

export function Invitation({ guest, invalidCode, pins = [] }: { guest: PublicGuest | null; invalidCode?: boolean; pins?: Pin[] }) {
  const [ready, setReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const onOpened = useCallback(() => {
    // La música arranca aquí mismo, dentro del toque al sobre (así el navegador la permite)
    startMusic(audioRef.current);
    // Deja que el sobre termine su animación antes de lanzar el hero
    window.setTimeout(() => setReady(true), 900);
    if (guest) {
      fetch("/api/opened", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: guest.code }),
        keepalive: true,
      }).catch(() => {});
    }
  }, [guest]);

  return (
    <MotionConfig reducedMotion="user">
      <Envelope guestName={guest?.name} onOpened={onOpened} />
      <main>
        <Hero guestName={guest?.name} ready={ready} />
        <Countdown />
        <Throwback />
        <Marquee />
        <Details />
        <DressCode pins={pins} />
        <Rsvp initialGuest={guest} invalidCode={invalidCode} />
      </main>
      <Footer />
      <Music audioRef={audioRef} visible={ready} />
    </MotionConfig>
  );
}
