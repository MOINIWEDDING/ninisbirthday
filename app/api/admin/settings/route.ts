import { fail, handleError, json, readJson, requireAdmin } from "@/lib/http";
import { DEFAULT_TEMPLATE, MESSAGE_SETTING_KEY } from "@/lib/message";
import { getSetting, setSetting } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const saved = await getSetting(MESSAGE_SETTING_KEY);
    return json({ template: saved ?? DEFAULT_TEMPLATE, isDefault: saved === null });
  } catch (e) {
    return handleError(e);
  }
}

export async function PUT(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = await readJson<{ template?: string; reset?: boolean }>(req);
  if (!body) return fail("Datos inválidos.");
  const template = body.reset ? DEFAULT_TEMPLATE : typeof body.template === "string" ? body.template.replace(/\r\n/g, "\n").trim() : "";
  if (!template) return fail("El mensaje no puede quedar vacío.");
  if (template.length > 3000) return fail("El mensaje es muy largo (máximo 3000 caracteres).");
  if (!template.includes("{link}")) return fail("El mensaje debe incluir {link} para que cada persona reciba su enlace.");
  try {
    await setSetting(MESSAGE_SETTING_KEY, template);
    return json({ template, isDefault: template === DEFAULT_TEMPLATE });
  } catch (e) {
    return handleError(e);
  }
}
