import { json, readJson } from "@/lib/http";
import { getGuestByCode, saveGuest } from "@/lib/store";

/** Marca que el invitado abrió el sobre (se llama desde el navegador, no desde vistas previas de WhatsApp). */
export async function POST(req: Request) {
  const body = await readJson<{ code?: string }>(req);
  try {
    const guest = body?.code ? await getGuestByCode(body.code) : null;
    if (guest && !guest.openedAt) {
      guest.openedAt = new Date().toISOString();
      await saveGuest(guest);
    }
  } catch {
    /* no bloquea la experiencia del invitado */
  }
  return json({ ok: true });
}
