import { clampInt, cleanText, fail, handleError, json, readJson, requireAdmin } from "@/lib/http";
import { listGuests, newCode, newId, saveGuest } from "@/lib/store";
import type { Guest } from "@/lib/types";
import { cleanCompanions } from "@/lib/message";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    return json({ guests: await listGuests() });
  } catch (e) {
    return handleError(e);
  }
}

type NewGuest = { name?: string; seats?: number; phone?: string; note?: string; companions?: string[] };

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = await readJson<NewGuest & { bulk?: NewGuest[] }>(req);
  if (!body) return fail("Datos inválidos.");
  const entries = Array.isArray(body.bulk) ? body.bulk.slice(0, 300) : [body];
  try {
    const created: Guest[] = [];
    for (const e of entries) {
      const name = cleanText(e.name, 80);
      if (!name) continue;
      const seats = clampInt(e.seats, 1, 10, 1);
      const guest: Guest = {
        id: newId(),
        code: await newCode(),
        name,
        seats,
        companions: cleanCompanions(e.companions, seats),
        phone: cleanText(e.phone, 30),
        note: cleanText(e.note, 140),
        status: "pending",
        attending: 0,
        createdAt: new Date(Date.now() - created.length).toISOString(),
      };
      created.push(await saveGuest(guest));
    }
    if (!created.length) return fail("Escribe al menos un nombre.");
    return json({ guests: created }, 201);
  } catch (e) {
    return handleError(e);
  }
}
