/**
 * Todos los datos del evento viven aquí. Cambia lo que necesites y vuelve a desplegar.
 */
export const EVENT = {
  honoree: "Nicole Wu",
  nickname: "NINI'S",
  title: "NINI'S Birthday",
  age: 25,
  // 24 de octubre de 2026, 7:00 PM hora de República Dominicana (UTC-4, sin horario de verano)
  startsAt: "2026-10-24T19:00:00-04:00",
  // Hora estimada de cierre, solo para el calendario
  endsAt: "2026-10-25T00:00:00-04:00",
  timeZone: "America/Santo_Domingo",
  dateLabel: "Sábado 24 de octubre",
  timeLabel: "7:00 PM",
  venue: {
    name: "Oli's Room",
    address: "Calle Primera No. 4-A, La Moraleja",
    city: "Santiago de los Caballeros",
    // Texto que se usa para buscar el lugar en Google Maps
    mapsQuery: "Oli's Room, Calle Primera 4-A, La Moraleja, Santiago de los Caballeros, República Dominicana",
  },
} as const;

export const mapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(EVENT.venue.mapsQuery)}&z=16&output=embed`;
export const mapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(EVENT.venue.mapsQuery)}`;

function gcalStamp(iso: string) {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export const googleCalendarUrl =
  "https://calendar.google.com/calendar/render?action=TEMPLATE" +
  `&text=${encodeURIComponent(EVENT.title)}` +
  `&dates=${gcalStamp(EVENT.startsAt)}/${gcalStamp(EVENT.endsAt)}` +
  `&details=${encodeURIComponent(`Los ${EVENT.age} de ${EVENT.honoree}.`)}` +
  `&location=${encodeURIComponent(`${EVENT.venue.name}, ${EVENT.venue.address}, ${EVENT.venue.city}`)}`;

export function buildIcs(url: string) {
  const esc = (s: string) => s.replace(/[,;\\]/g, (m) => `\\${m}`);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ninis-birthday//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:ninis-birthday-25@${new URL(url).host}`,
    `DTSTAMP:${gcalStamp(new Date().toISOString())}`,
    `DTSTART:${gcalStamp(EVENT.startsAt)}`,
    `DTEND:${gcalStamp(EVENT.endsAt)}`,
    `SUMMARY:${esc(EVENT.title)}`,
    `DESCRIPTION:${esc(`Los ${EVENT.age} de ${EVENT.honoree}. ${url}`)}`,
    `LOCATION:${esc(`${EVENT.venue.name}, ${EVENT.venue.address}, ${EVENT.venue.city}`)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT3H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc(EVENT.title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/** Tope de personas (contando acompañantes). Al acercarse, el panel avisa. */
export const GUEST_LIMIT = 20;
/** A partir de cuántas personas salta el aviso */
export const GUEST_WARN_AT = GUEST_LIMIT - 2;

/** Código de vestimenta + tablero de Pinterest para inspirarse */
export const DRESS_CODE = {
  title: "Tonos veraniegos",
  text: "Rosados, naranjas, amarillos y todo lo que se sienta a sol. Aquí tienes ideas del tablero de Nini.",
  pinterestUser: "niniemuti",
  pinterestBoard: "ninis-bday-party-25",
  get boardUrl() {
    return `https://www.pinterest.com/${this.pinterestUser}/${this.pinterestBoard}/`;
  },
  /** Cuántas fotos mostrar en la galería */
  maxPins: 12,
};
