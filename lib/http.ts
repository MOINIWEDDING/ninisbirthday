import "server-only";
import { NextResponse } from "next/server";
import { isAdmin } from "./auth";
import { StorageNotConfiguredError } from "./store";

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export function fail(message: string, status = 400) {
  return json({ error: message }, status);
}

export async function requireAdmin() {
  return (await isAdmin()) ? null : fail("Tu sesión expiró. Vuelve a entrar.", 401);
}

export function handleError(err: unknown) {
  if (err instanceof StorageNotConfiguredError) return fail(err.message, 503);
  console.error(err);
  if (err instanceof Error && /^(La tabla|Falta actualizar)/.test(err.message)) return fail(err.message, 503);
  return fail("Algo salió mal. Intenta de nuevo.", 500);
}

export async function readJson<T>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

export function cleanText(v: unknown, max: number) {
  if (typeof v !== "string") return undefined;
  const t = v.replace(/\s+/g, " ").trim().slice(0, max);
  return t || undefined;
}

export function clampInt(v: unknown, min: number, max: number, fallback: number) {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}
