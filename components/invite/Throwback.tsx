"use client";
import { Sticker } from "@/components/Sticker";
import type { NiniPhotoId } from "@/lib/nini";
import { NiniPhoto } from "./NiniPhoto";
import { Reveal } from "./Reveal";

const ITEMS: { id: NiniPhotoId; tilt: number; w: string }[] = [
  { id: "2002", tilt: -6, w: "100%" },
  { id: "2004", tilt: 5, w: "86%" },
  { id: "2006", tilt: -3, w: "100%" },
  { id: "2010", tilt: 4, w: "58%" },
  { id: "2011", tilt: -5, w: "96%" },
];

export function Throwback() {
  return (
    <section className="section throw" aria-labelledby="throw-h">
      <div className="deco" style={{ top: 30, left: "6%", width: 60 }}>
        <Reveal kind="slap" rotate={-12}>
          <Sticker name="estrella-rosa" />
        </Reveal>
      </div>
      <div className="deco" style={{ top: 70, right: "8%", width: 52 }}>
        <Reveal kind="slap" rotate={10} delay={0.2}>
          <Sticker name="beso-2" />
        </Reveal>
      </div>
      <div className="section__wrap">
        <Reveal>
          <h2 id="throw-h" className="script-h" style={{ textAlign: "center", rotate: "-2deg" }}>
            Mira quién cumple{"\u00a0"}25
          </h2>
        </Reveal>
        <ul className="throw__grid">
          {ITEMS.map((it, i) => (
            <li key={it.id} className="throw__item">
              <NiniPhoto id={it.id} width={it.w} tilt={it.tilt} delay={0.1 * i} style={{ margin: "0 auto" }} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
