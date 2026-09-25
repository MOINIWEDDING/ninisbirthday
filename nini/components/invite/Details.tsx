"use client";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { CalendarPlus, MapPin, NavigationArrow } from "@phosphor-icons/react";
import { Sticker } from "@/components/Sticker";
import { EVENT, googleCalendarUrl, mapsDirectionsUrl, mapsEmbedUrl } from "@/lib/event";
import { Reveal } from "./Reveal";

export function Details() {
  const reduce = useReducedMotion();
  const [mapLoaded, setMapLoaded] = useState(false);

  return (
    <section className="section" aria-labelledby="details-h" id="detalles">
      <div className="section__wrap">
        <Reveal>
          <h2 id="details-h" className="script-h" style={{ textAlign: "center", rotate: "2deg" }}>
            Los detalles
          </h2>
        </Reveal>

        <div className="details__grid">
          <Reveal kind="drop" rotate={-2} style={{ position: "relative" }}>
            <article className="capsule">
              <div className="capsule__stripes" aria-hidden="true" />
              <div className="capsule__block">
                <p className="capsule__label">Cuándo</p>
                <p className="capsule__big">{EVENT.dateLabel}</p>
                <p className="capsule__small">{EVENT.timeLabel} en punto</p>
              </div>
              <div className="capsule__divider" aria-hidden="true" />
              <div className="capsule__block">
                <p className="capsule__label">Dónde</p>
                <p className="capsule__big">{EVENT.venue.name}</p>
                <p className="capsule__small">
                  {EVENT.venue.address}
                  <br />
                  {EVENT.venue.city}
                </p>
              </div>
              <div className="capsule__actions">
                <a className="btn btn--ghost btn--small" href={googleCalendarUrl} target="_blank" rel="noopener noreferrer">
                  <CalendarPlus size={20} weight="bold" />
                  Guardar la fecha
                </a>
                <a className="linklike" href="/api/calendar">
                  Apple o Outlook (.ics)
                </a>
              </div>
            </article>
            {/* Racimo de cítricos y flores sobre la tarjeta, como en la referencia del menú */}
            <div className="cluster" style={{ top: -30, left: "2%", width: 96 }}>
              <Reveal kind="slap" rotate={-10} delay={0.3}>
                <Sticker name="toronja-2" />
              </Reveal>
            </div>
            <div className="cluster" style={{ top: 6, left: "18%", width: 70 }}>
              <Reveal kind="slap" rotate={14} delay={0.42}>
                <Sticker name="plumeria" />
              </Reveal>
            </div>
            <div className="cluster" style={{ bottom: -24, right: "2%", width: 84 }}>
              <Reveal kind="slap" rotate={8} delay={0.5}>
                <Sticker name="spritz" />
              </Reveal>
            </div>
          </Reveal>

          <Reveal kind="rise" delay={0.1}>
            <div className="frame">
              <motion.div
                className="frame__oval"
                initial={reduce ? false : { scale: 0.85, rotate: 4 }}
                whileInView={{ scale: 1, rotate: -1.5 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ type: "spring", stiffness: 120, damping: 14 }}
              >
                {!mapLoaded && (
                  <div className="frame__fallback" style={{ position: "absolute", inset: 16, width: "auto", height: "auto" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <MapPin size={20} weight="fill" /> Cargando mapa
                    </span>
                  </div>
                )}
                <iframe
                  title={`Mapa de ${EVENT.venue.name}`}
                  src={mapsEmbedUrl}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  onLoad={() => setMapLoaded(true)}
                  style={{ position: "relative" }}
                />
              </motion.div>
              <div className="cluster" style={{ bottom: 96, right: -10, width: 110 }}>
                <Reveal kind="slap" rotate={-8} delay={0.35}>
                  <Sticker name="hibisco-naranja" />
                </Reveal>
              </div>
              <div className="cluster" style={{ bottom: 70, right: 76, width: 70 }}>
                <Reveal kind="slap" rotate={12} delay={0.5}>
                  <Sticker name="naranja" />
                </Reveal>
              </div>
              <div className="cluster" style={{ top: 10, left: -8, width: 64 }}>
                <Reveal kind="slap" rotate={-16} delay={0.6}>
                  <Sticker name="estrella-mar" />
                </Reveal>
              </div>
              <div className="frame__cta">
                <a className="btn btn--small" href={mapsDirectionsUrl} target="_blank" rel="noopener noreferrer">
                  <NavigationArrow size={18} weight="fill" />
                  Cómo llegar
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
