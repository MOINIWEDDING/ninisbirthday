import { clampInt, cleanText, fail, handleError, json, readJson, requireAdmin } from "@/lib/http";
import { deleteGuest, getGuest, saveGuest } from "@/lib/store";
import type { Guest, RsvpStatus } from "@/lib/types";
import { cleanCompanions } from "@/lib/message";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const body = await readJson<Partial<Guest>>(req);
  if (!body) return fail("Datos inválidos.");
  try {
    const guest = await getGuest(id);
    if (!guest) return fail("Ese invitado ya no existe.", 404);
    const next: Guest = { ...guest };
    if (body.name !== undefined) next.name = cleanText(body.name, 80) ?? guest.name;
    if (body.phone !== undefined) next.phone = cleanText(body.phone, 30);
    if (body.note !== undefined) next.note = cleanText(body.note, 140);
    if (body.seats !== undefined) next.seats = clampInt(body.seats, 1, 10, guest.seats);
    if (body.status !== undefined) {
      const s = body.status as RsvpStatus;
      if (!["pending", "yes", "no"].includes(s)) return fail("Estado inválido.");
      next.status = s;
      next.respondedAt = s === "pending" ? undefined : new Date().toISOString();
      if (s !== "yes") next.attending = 0;
      else if (!next.attending) next.attending = next.seats;
    }
    if (body.attending !== undefined && next.status === "yes") {
      next.attending = clampInt(body.attending, 1, next.seats, next.seats);
    }
    next.companions = cleanCompanions(body.companions !== undefined ? body.companions : guest.companions, next.seats);
    next.attending = Math.min(next.attending, next.seats);
    return json({ guest: await saveGuest(next) });
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  try {
    const ok = await deleteGuest(id);
    return ok ? json({ ok: true }) : fail("Ese invitado ya no existe.", 404);
  } catch (e) {
    return handleError(e);
  }
}
