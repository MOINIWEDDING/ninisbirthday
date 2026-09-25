import { cookies } from "next/headers";
import { adminConfigured, checkPassword, createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { fail, json, readJson } from "@/lib/http";

export async function POST(req: Request) {
  if (!adminConfigured()) return fail("Falta configurar ADMIN_PASSWORD en Vercel.", 503);
  const body = await readJson<{ password?: string }>(req);
  const password = typeof body?.password === "string" ? body.password : "";
  if (!checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 700)); // frena intentos por fuerza bruta
    return fail("Contraseña incorrecta.", 401);
  }
  const jar = await cookies();
  jar.set(SESSION_COOKIE, createSessionToken(), sessionCookieOptions);
  return json({ ok: true });
}
