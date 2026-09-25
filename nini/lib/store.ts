import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";
import type { Guest, RsvpStatus } from "./types";

/*
 * Almacenamiento en Supabase (tabla public.guests, ver supabase/schema.sql).
 * Solo el servidor habla con Supabase usando la clave secreta (service role),
 * así que la tabla tiene RLS activado y ninguna política pública.
 */

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
const TABLE = "guests";

export const storageConfigured = Boolean(url && key);

const g = globalThis as unknown as { __niniSb?: SupabaseClient; __niniMem?: Map<string, Guest> };
const sb: SupabaseClient | null = storageConfigured
  ? (g.__niniSb ??= createClient(url!, key!, { auth: { persistSession: false, autoRefreshToken: false } }))
  : null;

/* Memoria local: solo para desarrollo sin Supabase. En Vercel se exige Supabase. */
const mem: Map<string, Guest> = (g.__niniMem ??= new Map());

export class StorageNotConfiguredError extends Error {
  constructor() {
    super("Falta conectar Supabase: agrega SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en Vercel.");
  }
}

function assertStorage() {
  if (!sb && process.env.VERCEL) throw new StorageNotConfiguredError();
}

type Row = {
  id: string;
  code: string;
  name: string;
  seats: number;
  phone: string | null;
  note: string | null;
  status: RsvpStatus;
  attending: number;
  message: string | null;
  created_at: string;
  opened_at: string | null;
  responded_at: string | null;
};

const u = <T,>(v: T | null) => (v === null ? undefined : v);

function fromRow(r: Row): Guest {
  return {
    id: r.id,
    code: r.code,
    name: r.name,
    seats: r.seats,
    phone: u(r.phone),
    note: u(r.note),
    status: r.status,
    attending: r.attending,
    message: u(r.message),
    createdAt: r.created_at,
    openedAt: u(r.opened_at),
    respondedAt: u(r.responded_at),
  };
}

function toRow(x: Guest): Row {
  return {
    id: x.id,
    code: x.code,
    name: x.name,
    seats: x.seats,
    phone: x.phone ?? null,
    note: x.note ?? null,
    status: x.status,
    attending: x.attending,
    message: x.message ?? null,
    created_at: x.createdAt,
    opened_at: x.openedAt ?? null,
    responded_at: x.respondedAt ?? null,
  };
}

function check<T>(res: { data: T; error: { message: string; code?: string } | null }): T {
  if (res.error) {
    if (res.error.code === "42P01" || /relation .* does not exist|Could not find the table/i.test(res.error.message)) {
      throw new Error("La tabla 'guests' no existe en Supabase. Ejecuta supabase/schema.sql en el SQL Editor.");
    }
    throw new Error(`Supabase: ${res.error.message}`);
  }
  return res.data;
}

export async function listGuests(): Promise<Guest[]> {
  assertStorage();
  if (sb) {
    const rows = check(await sb.from(TABLE).select("*").order("created_at", { ascending: false }).limit(2000));
    return (rows as Row[]).map(fromRow);
  }
  return [...mem.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getGuest(id: string): Promise<Guest | null> {
  assertStorage();
  if (sb) {
    const row = check(await sb.from(TABLE).select("*").eq("id", id).maybeSingle());
    return row ? fromRow(row as Row) : null;
  }
  return mem.get(id) ?? null;
}

export async function getGuestByCode(code: string): Promise<Guest | null> {
  assertStorage();
  const clean = normalizeCode(code);
  if (!clean) return null;
  if (sb) {
    const row = check(await sb.from(TABLE).select("*").eq("code", clean).maybeSingle());
    return row ? fromRow(row as Row) : null;
  }
  return [...mem.values()].find((x) => x.code === clean) ?? null;
}

export async function saveGuest(guest: Guest): Promise<Guest> {
  assertStorage();
  if (sb) {
    const row = check(await sb.from(TABLE).upsert(toRow(guest), { onConflict: "id" }).select("*").single());
    return fromRow(row as Row);
  }
  mem.set(guest.id, guest);
  return guest;
}

export async function deleteGuest(id: string): Promise<boolean> {
  assertStorage();
  if (sb) {
    const rows = check(await sb.from(TABLE).delete().eq("id", id).select("id"));
    return (rows as { id: string }[]).length > 0;
  }
  return mem.delete(id);
}

// Sin 0/O, 1/I/L para que el código se pueda dictar sin errores
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function normalizeCode(code: string) {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
}

async function codeTaken(code: string) {
  if (sb) {
    const row = check(await sb.from(TABLE).select("id").eq("code", code).maybeSingle());
    return Boolean(row);
  }
  return [...mem.values()].some((x) => x.code === code);
}

export async function newCode(): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const code = Array.from(randomBytes(6), (b) => ALPHABET[b % ALPHABET.length]).join("");
    if (!(await codeTaken(code))) return code;
  }
  throw new Error("No se pudo generar un código único");
}

export function newId() {
  return randomBytes(9).toString("base64url");
}
