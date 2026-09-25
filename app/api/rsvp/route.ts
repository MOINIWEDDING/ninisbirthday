import { EVENT } from "@/lib/event";
import { clampInt, cleanText, fail, handleError, json, readJson } from "@/lib/http";
import { getGuestByCode, saveGuest } from "@/lib/store";
import { toPublic } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get("code") ?? "";
  try {
    const guest = await getGuestByCode(code);
    if (!guest) return fail("No encontramos ese código. Revisa que esté bien escrito.", 404);
    return json({ guest: toPublic(guest) });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  const body = await readJson<{ code?: string; response?: string; attending?: number; message?: string }>(req);
  if (!body?.code) return fail("Falta tu código de invitación.");
  if (body.response !== "yes" && body.response !== "no") return fail("Elige si vas o no.");
  if (Date.now() > new Date(EVENT.endsAt).getTime()) return fail("La fiesta ya pasó. ¡Gracias por celebrar!", 410);
  try {
    const guest = await getGuestByCode(body.code);
    if (!guest) return fail("Esta invitación no está en la lista.", 404);
    guest.status = body.response;
    guest.attending = body.response === "yes" ? clampInt(body.attending, 1, guest.seats, guest.seats) : 0;
    guest.message = cleanText(body.message, 280);
    guest.respondedAt = new Date().toISOString();
    guest.openedAt ??= guest.respondedAt;
    await saveGuest(guest);
    return json({ guest: toPublic(guest) });
  } catch (e) {
    return handleError(e);
  }
}
