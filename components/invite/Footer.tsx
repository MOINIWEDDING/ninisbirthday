import { Sticker } from "@/components/Sticker";
import { EVENT } from "@/lib/event";
import { NiniPhoto } from "./NiniPhoto";
import { Reveal } from "./Reveal";

const LINE = ["cangrejo", "concha", "durazno", "tortuga", "paloma", "estrella-mar"] as const;

export function Footer() {
  return (
    <footer className="foot">
      <div className="foot__line" aria-hidden="true">
        {LINE.map((n, i) => (
          <Reveal key={n} kind="slap" rotate={i % 2 ? 8 : -8} delay={i * 0.07}>
            <Sticker name={n} />
          </Reveal>
        ))}
      </div>
      <div className="foot__dance">
        <NiniPhoto id="2010" width="100%" idle="dance" tilt={-2} />
      </div>
      <p className="foot__sign">Con cariño, Nini</p>
      <p className="foot__meta">
        {EVENT.venue.name} · {EVENT.venue.city}
      </p>
    </footer>
  );
}
