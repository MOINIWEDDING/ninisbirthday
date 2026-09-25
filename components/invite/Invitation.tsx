"use client";
import { useCallback, useState } from "react";
import { MotionConfig } from "motion/react";
import type { PublicGuest } from "@/lib/types";
import { Countdown } from "./Countdown";
import { Details } from "./Details";
import { Envelope } from "./Envelope";
import { Footer } from "./Footer";
import { Hero } from "./Hero";
import { Marquee } from "./Marquee";
import { Rsvp } from "./Rsvp";
import { Throwback } from "./Throwback";

export function Invitation({ guest, invalidCode }: { guest: PublicGuest | null; invalidCode?: boolean }) {
  const [ready, setReady] = useState(false);

  const onOpened = useCallback(() => {
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
        <Rsvp initialGuest={guest} invalidCode={invalidCode} />
      </main>
      <Footer />
    </MotionConfig>
  );
}
