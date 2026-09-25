/* Mensaje de WhatsApp: plantilla editable desde el panel. Se usa en cliente y servidor. */

export const MESSAGE_SETTING_KEY = "whatsapp_template";

export const DEFAULT_TEMPLATE = `Hello, hello! {nombre} 🌞

As always, mi cumpleaños viene y toca celebrar mi nacimiento unos días después, porque aparentemente el calendario sigue jugando en mi contra. Sin embargo, quiero que disfrutes de este día (que técnicamente no me pertenece) junto a mí. 🥰

Te adjunto la invitación, ¡me dejas saber si puedes venir! 🤍

Como puedes escuchar en la canción y ver en la temática de la invitación, espero verte en tonos veraniegos. Aprovechemos que vivimos en el Caribe para celebrar el sol aunque ya estemos en otoño. 🌴☀️

Link de la invitación: {link}
Tu código de registro: {codigo}
{acompanantes}`;

export const PLACEHOLDERS = [
  { key: "{nombre}", help: "Primer nombre del invitado" },
  { key: "{nombre_completo}", help: "Nombre tal como está en la lista" },
  { key: "{link}", help: "Enlace personal de la invitación" },
  { key: "{codigo}", help: "Código de registro" },
  { key: "{acompanantes}", help: "Línea «Puedes venir con…» (solo si tiene más lugares)" },
] as const;

type MessageGuest = { name: string; code: string; seats: number; companions?: string[] };

function joinNames(names: string[]) {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`;
}

/** "Puedes venir con: Ana y Pedro" · "Puedes venir con 2 personas" · "Puedes venir con: Ana y 1 persona más" · "" */
export function companionsLine(seats: number, companions: string[] = []) {
  const extra = Math.max(0, seats - 1);
  if (!extra) return "";
  const named = companions.slice(0, extra).map((c) => c.trim()).filter(Boolean);
  const unnamed = extra - named.length;
  if (!named.length) return `Puedes venir con ${unnamed} ${unnamed === 1 ? "persona" : "personas"}`;
  if (!unnamed) return `Puedes venir con: ${joinNames(named)}`;
  return `Puedes venir con: ${named.join(", ")} y ${unnamed} ${unnamed === 1 ? "persona más" : "personas más"}`;
}

export function renderMessage(template: string, guest: MessageGuest, link: string) {
  const first = guest.name.trim().split(/\s+/)[0] ?? guest.name;
  const line = companionsLine(guest.seats, guest.companions);
  const out = template
    .replaceAll("{nombre_completo}", guest.name.trim())
    .replaceAll("{nombre}", first)
    .replaceAll("{link}", link)
    .replaceAll("{codigo}", guest.code)
    .replaceAll("{acompanantes}", line);
  // Si la línea de acompañantes quedó vacía, no deja renglones en blanco sobrantes
  return out.replace(/[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n").trim();
}

/** Normaliza lo que llega del formulario: un nombre por lugar extra */
export function cleanCompanions(input: unknown, seats: number): string[] {
  const extra = Math.max(0, seats - 1);
  const arr = Array.isArray(input) ? input : [];
  return Array.from({ length: extra }, (_, i) => (typeof arr[i] === "string" ? arr[i].replace(/\s+/g, " ").trim().slice(0, 60) : ""));
}
