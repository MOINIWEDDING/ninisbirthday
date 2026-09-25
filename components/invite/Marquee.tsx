import { Sticker } from "@/components/Sticker";
import { EVENT } from "@/lib/event";

const ITEMS = [
  { t: EVENT.title, script: false },
  { t: `${EVENT.age}`, script: true },
  { t: "24.10.2026", script: false },
  { t: EVENT.venue.name, script: true },
  { t: EVENT.timeLabel, script: false },
];

export function Marquee() {
  const group = (hidden: boolean) => (
    <div className="marquee__group" aria-hidden={hidden || undefined}>
      {ITEMS.map((it, i) => (
        <span key={i} style={{ display: "contents" }}>
          <span className={`marquee__item ${it.script ? "marquee__item--script" : ""}`}>{it.t}</span>
          <Sticker name={i % 2 ? "estrella-plata-2" : "estrella-rosa-2"} />
        </span>
      ))}
    </div>
  );
  return (
    <div className="marquee" role="presentation">
      <div className="marquee__track">
        {group(false)}
        {group(true)}
      </div>
    </div>
  );
}
