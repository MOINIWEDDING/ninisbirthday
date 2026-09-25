import { handleError, requireAdmin } from "@/lib/http";
import { listGuests } from "@/lib/store";

export const dynamic = "force-dynamic";

const LABEL = { pending: "Pendiente", yes: "Asiste", no: "No asiste" } as const;

export async function GET(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const origin = new URL(req.url).origin;
    const guests = await listGuests();
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = [
      ["Nombre", "Acompañantes", "Estado", "Personas que asisten", "Lugares", "Teléfono", "Nota", "Mensaje", "Código", "Enlace", "Abrió", "Respondió"],
      ...guests.map((g) => [
        g.name, (g.companions ?? []).filter(Boolean).join(", "), LABEL[g.status], g.status === "yes" ? g.attending : 0, g.seats, g.phone, g.note, g.message,
        g.code, `${origin}/i/${g.code}`, g.openedAt ?? "", g.respondedAt ?? "",
      ]),
    ];
    const csv = "\uFEFF" + rows.map((r) => r.map(esc).join(",")).join("\r\n");
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="invitados-ninis-birthday.csv"',
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return handleError(e);
  }
}
