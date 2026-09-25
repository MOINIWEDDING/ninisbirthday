"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import {
  ArrowClockwise,
  ChatCircleText,
  Check,
  CopySimple,
  DownloadSimple,
  EnvelopeOpen,
  MagnifyingGlass,
  Minus,
  PencilSimple,
  Phone,
  Plus,
  SignOut,
  Trash,
  UserPlus,
  WhatsappLogo,
} from "@phosphor-icons/react";
import { Sticker } from "@/components/Sticker";
import { EVENT } from "@/lib/event";
import type { Guest, RsvpStatus } from "@/lib/types";

type Filter = "all" | RsvpStatus;

const STATUS_LABEL: Record<RsvpStatus, string> = { yes: "Asiste", no: "No asiste", pending: "Pendiente" };

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || "Algo salió mal.") as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return data as T;
}

function inviteLink(code: string) {
  return `${window.location.origin}/i/${code}`;
}

function whatsappUrl(g: Guest) {
  const first = g.name.split(" ")[0];
  const text =
    `¡Hola ${first}! Estás invitad@ a ${EVENT.title}, los ${EVENT.age} de Nicole. ` +
    `${EVENT.dateLabel}, ${EVENT.timeLabel} en ${EVENT.venue.name}. ` +
    `Abre tu invitación y confirma aquí: ${inviteLink(g.code)}`;
  let digits = (g.phone ?? "").replace(/\D/g, "");
  if (digits.length === 10 && /^(809|829|849)/.test(digits)) digits = `1${digits}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

function fmtDate(iso?: string) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("es-DO", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: EVENT.timeZone }).format(
    new Date(iso),
  );
}

export function Dashboard({ storageReady }: { storageReady: boolean }) {
  const router = useRouter();
  const [guests, setGuests] = useState<Guest[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");
  const [editing, setEditing] = useState<Guest | null>(null);
  const [removing, setRemoving] = useState<Guest | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast((t) => (t === msg ? "" : t)), 2400);
  }, []);

  const handleAuth = useCallback(
    (err: unknown) => {
      if ((err as { status?: number }).status === 401) router.refresh();
    },
    [router],
  );

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await api<{ guests: Guest[] }>("/api/admin/guests");
      setGuests(data.guests);
      setLoadError("");
    } catch (err) {
      handleAuth(err);
      setLoadError(err instanceof Error ? err.message : "No se pudo cargar la lista.");
      setGuests((g) => g ?? []);
    } finally {
      setRefreshing(false);
    }
  }, [handleAuth]);

  useEffect(() => {
    load();
    const id = window.setInterval(load, 30000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  const stats = useMemo(() => {
    const list = guests ?? [];
    const yes = list.filter((g) => g.status === "yes");
    return {
      invites: list.length,
      people: yes.reduce((n, g) => n + g.attending, 0),
      seats: list.reduce((n, g) => n + g.seats, 0),
      yes: yes.length,
      no: list.filter((g) => g.status === "no").length,
      pending: list.filter((g) => g.status === "pending").length,
      opened: list.filter((g) => g.openedAt).length,
    };
  }, [guests]);

  const visible = useMemo(() => {
    const q = query
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .trim();
    return (guests ?? []).filter((g) => {
      if (filter !== "all" && g.status !== filter) return false;
      if (!q) return true;
      const hay = `${g.name} ${g.phone ?? ""} ${g.note ?? ""} ${g.code}`
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [guests, filter, query]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    router.refresh();
  }

  async function copy(g: Guest) {
    const link = inviteLink(g.code);
    try {
      await navigator.clipboard.writeText(link);
      notify("Enlace copiado");
    } catch {
      window.prompt("Copia el enlace:", link);
    }
  }

  async function saveEdit(patch: Partial<Guest>) {
    if (!editing) return;
    try {
      const { guest } = await api<{ guest: Guest }>(`/api/admin/guests/${editing.id}`, { method: "PATCH", body: JSON.stringify(patch) });
      setGuests((list) => (list ?? []).map((g) => (g.id === guest.id ? guest : g)));
      setEditing(null);
      notify("Cambios guardados");
    } catch (err) {
      handleAuth(err);
      notify(err instanceof Error ? err.message : "No se pudo guardar");
    }
  }

  async function confirmRemove() {
    if (!removing) return;
    const target = removing;
    setRemoving(null);
    try {
      await api(`/api/admin/guests/${target.id}`, { method: "DELETE" });
      setGuests((list) => (list ?? []).filter((g) => g.id !== target.id));
      notify(`${target.name} salió de la lista`);
    } catch (err) {
      handleAuth(err);
      notify(err instanceof Error ? err.message : "No se pudo eliminar");
    }
  }

  const FILTERS: { key: Filter; label: string; n: number }[] = [
    { key: "all", label: "Todos", n: stats.invites },
    { key: "yes", label: "Asisten", n: stats.yes },
    { key: "pending", label: "Pendientes", n: stats.pending },
    { key: "no", label: "No asisten", n: stats.no },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <main className="admin">
        <div className="admin__wrap">
          <nav className="admin__bar" aria-label="Panel">
            <div className="admin__brand">
              <Sticker name="bola-disco" eager style={{ width: 24 }} />
              <b>Nini’s</b>
              <span>Panel</span>
            </div>
            <div className="admin__baractions">
              <a className="iconbtn" href="/" target="_blank" rel="noopener noreferrer" title="Ver invitación">
                <EnvelopeOpen size={20} />
                <span className="hide-sm">Ver invitación</span>
              </a>
              <button className="iconbtn" type="button" onClick={logout} title="Salir">
                <SignOut size={20} />
                <span className="hide-sm">Salir</span>
              </button>
            </div>
          </nav>

          <h1>Invitados</h1>
          <p className="admin__intro">
            Agrega a cada invitado y envíale su enlace personal. Solo las personas de esta lista pueden confirmar.
          </p>

          {!storageReady && (
            <p className="notice" role="status">
              Estás usando memoria temporal: los datos se borran al reiniciar. Agrega <code>SUPABASE_URL</code> y{" "}
              <code>SUPABASE_SERVICE_ROLE_KEY</code> para guardarlos en Supabase.
            </p>
          )}

          <section className="stats" aria-label="Resumen">
            <motion.div className="stat stat--hero" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div>
                <div className="stat__num">
                  {guests ? stats.people : "…"}
                  <span style={{ fontSize: "1.3rem", opacity: 0.8 }}> / {guests ? stats.seats : "…"}</span>
                </div>
                <div className="stat__label">Personas confirmadas</div>
              </div>
              <span style={{ display: "flex" }}>
                <Sticker name="globo-2" eager style={{ width: 38 }} />
                <Sticker name="globo-5" eager style={{ width: 36, marginLeft: -8 }} />
              </span>
            </motion.div>
            {[
              { n: stats.invites, l: "Invitaciones" },
              { n: stats.yes, l: "Asisten" },
              { n: stats.pending, l: "Pendientes" },
              { n: stats.opened, l: "Abrieron el sobre" },
            ].map((s, i) => (
              <motion.div
                key={s.l}
                className="stat"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.06 * (i + 1) }}
              >
                <div className="stat__num">{guests ? s.n : "…"}</div>
                <div className="stat__label">{s.l}</div>
              </motion.div>
            ))}
          </section>

          <AddGuests
            onAdded={(created) => {
              setGuests((list) => [...created, ...(list ?? [])]);
              notify(created.length === 1 ? `${created[0].name} agregad@` : `${created.length} invitados agregados`);
            }}
            onAuthError={handleAuth}
          />

          <section className="panel" aria-labelledby="list-h">
            <div className="panel__head">
              <h2 id="list-h">Lista</h2>
              <div style={{ display: "flex", gap: 4 }}>
                <button className="iconbtn" type="button" onClick={load} disabled={refreshing} title="Actualizar">
                  <motion.span animate={refreshing ? { rotate: 360 } : { rotate: 0 }} transition={{ repeat: refreshing ? Infinity : 0, duration: 0.8, ease: "linear" }} style={{ display: "inline-flex" }}>
                    <ArrowClockwise size={18} />
                  </motion.span>
                  Actualizar
                </button>
                <a className="iconbtn" href="/api/admin/export">
                  <DownloadSimple size={18} />
                  CSV
                </a>
              </div>
            </div>

            <div className="toolbar">
              <div className="seg" role="group" aria-label="Filtrar por estado">
                {FILTERS.map((f) => (
                  <button key={f.key} type="button" aria-pressed={filter === f.key} onClick={() => setFilter(f.key)}>
                    {f.label} ({f.n})
                  </button>
                ))}
              </div>
              <div className="search">
                <MagnifyingGlass size={18} />
                <label className="sr-only" htmlFor="q">
                  Buscar invitado
                </label>
                <input id="q" className="input" placeholder="Buscar por nombre o teléfono" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            </div>

            {loadError && (
              <p className="form-error" role="alert">
                {loadError}
              </p>
            )}

            {guests === null ? (
              <div className="skeleton" style={{ marginTop: 18 }} aria-label="Cargando">
                <div />
                <div style={{ width: "80%" }} />
                <div style={{ width: "60%" }} />
              </div>
            ) : visible.length === 0 ? (
              <div className="empty">
                <Sticker name="fresa-disco" />
                <b>{guests.length === 0 ? "La lista está vacía" : "Nadie por aquí"}</b>
                <span>{guests.length === 0 ? "Agrega el primer invitado arriba y comparte su enlace." : "Prueba con otro filtro o búsqueda."}</span>
              </div>
            ) : (
              <ul className="glist">
                <AnimatePresence initial={false}>
                  {visible.map((g) => (
                    <motion.li
                      key={g.id}
                      layout
                      className="grow"
                      initial={{ opacity: 0, y: -10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div>
                        <div className="grow__name">{g.name}</div>
                        <div className="grow__meta">
                          <span>Código {g.code}</span>
                          {g.phone && (
                            <span>
                              <Phone size={14} /> {g.phone}
                            </span>
                          )}
                          {g.openedAt ? (
                            <span title={`Abrió: ${fmtDate(g.openedAt)}`}>
                              <EnvelopeOpen size={14} /> Abrió {fmtDate(g.openedAt)}
                            </span>
                          ) : (
                            <span>Sin abrir</span>
                          )}
                          {g.note && <span>{g.note}</span>}
                        </div>
                        {g.message && (
                          <div className="grow__msg">
                            <ChatCircleText size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />
                            {g.message}
                          </div>
                        )}
                      </div>
                      <button type="button" className={`chip chip--${g.status}`} onClick={() => setEditing(g)} title="Cambiar estado">
                        {g.status === "yes" && <Check size={14} weight="bold" />}
                        {STATUS_LABEL[g.status]}
                      </button>
                      <div className="grow__people">
                        {g.status === "yes" ? `${g.attending} de ${g.seats}` : `${g.seats} ${g.seats === 1 ? "lugar" : "lugares"}`}
                      </div>
                      <div className="grow__actions">
                        <button className="iconbtn" type="button" onClick={() => copy(g)} title="Copiar enlace" aria-label={`Copiar enlace de ${g.name}`}>
                          <CopySimple size={19} />
                        </button>
                        <a
                          className="iconbtn"
                          href={whatsappUrl(g)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Enviar por WhatsApp"
                          aria-label={`Enviar invitación a ${g.name} por WhatsApp`}
                        >
                          <WhatsappLogo size={19} />
                        </a>
                        <button className="iconbtn" type="button" onClick={() => setEditing(g)} title="Editar" aria-label={`Editar ${g.name}`}>
                          <PencilSimple size={19} />
                        </button>
                        <button
                          className="iconbtn iconbtn--danger"
                          type="button"
                          onClick={() => setRemoving(g)}
                          title="Eliminar"
                          aria-label={`Eliminar a ${g.name}`}
                        >
                          <Trash size={19} />
                        </button>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </section>
        </div>

        <AnimatePresence>
          {editing && <EditDialog key="edit" guest={editing} onClose={() => setEditing(null)} onSave={saveEdit} />}
          {removing && (
            <Dialog key="rm" onClose={() => setRemoving(null)} label="Eliminar invitado">
              <h3>¿Eliminar a {removing.name}?</h3>
              <p style={{ color: "var(--ink-soft)", marginBottom: 0 }}>Su enlace dejará de funcionar y se borrará su respuesta.</p>
              <div className="dialog__row">
                <button className="btn btn--ghost btn--small" type="button" onClick={() => setRemoving(null)}>
                  Cancelar
                </button>
                <button className="btn btn--small" type="button" onClick={confirmRemove}>
                  Eliminar
                </button>
              </div>
            </Dialog>
          )}
          {toast && (
            <motion.div
              key="toast"
              className="toast"
              role="status"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20 }}
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </MotionConfig>
  );
}

function Stepper({ value, onChange, min = 1, max = 10, label }: { value: number; onChange: (n: number) => void; min?: number; max?: number; label: string }) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="Menos">
        <Minus size={16} weight="bold" />
      </button>
      <output aria-live="polite">{value}</output>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="Más">
        <Plus size={16} weight="bold" />
      </button>
    </div>
  );
}

function AddGuests({ onAdded, onAuthError }: { onAdded: (g: Guest[]) => void; onAuthError: (e: unknown) => void }) {
  const [mode, setMode] = useState<"one" | "many">("one");
  const [name, setName] = useState("");
  const [seats, setSeats] = useState(1);
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [bulk, setBulk] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const parsedBulk = useMemo(
    () =>
      bulk
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((line) => {
          const [n, s, p] = line.split(/[,;\t]/).map((x) => x.trim());
          return { name: n, seats: Number(s) || 1, phone: p };
        })
        .filter((g) => g.name),
    [bulk],
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const body = mode === "one" ? { name, seats, phone, note } : { bulk: parsedBulk };
    if (mode === "one" && !name.trim()) return setError("Escribe el nombre.");
    if (mode === "many" && !parsedBulk.length) return setError("Pega al menos un nombre.");
    setBusy(true);
    try {
      const { guests } = await api<{ guests: Guest[] }>("/api/admin/guests", { method: "POST", body: JSON.stringify(body) });
      onAdded(guests);
      setName("");
      setSeats(1);
      setPhone("");
      setNote("");
      setBulk("");
    } catch (err) {
      onAuthError(err);
      setError(err instanceof Error ? err.message : "No se pudo agregar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel" aria-labelledby="add-h">
      <div className="panel__head">
        <h2 id="add-h">Agregar invitados</h2>
        <div className="seg" role="group" aria-label="Modo">
          <button type="button" aria-pressed={mode === "one"} onClick={() => setMode("one")}>
            Uno
          </button>
          <button type="button" aria-pressed={mode === "many"} onClick={() => setMode("many")}>
            Varios
          </button>
        </div>
      </div>
      <form onSubmit={submit} noValidate>
        {mode === "one" ? (
          <div className="addform addform--single">
            <div className="field">
              <label htmlFor="g-name">Nombre</label>
              <input id="g-name" className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" maxLength={80} />
            </div>
            <div className="field">
              <span className="field__label">Lugares</span>
              <Stepper value={seats} onChange={setSeats} label="Lugares" />
            </div>
            <div className="field">
              <label htmlFor="g-phone">WhatsApp (opcional)</label>
              <input id="g-phone" className="input" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="809 555 0123" />
            </div>
            <div className="field">
              <label htmlFor="g-note">Nota (opcional)</label>
              <input id="g-note" className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Prima, amiga de la uni…" maxLength={140} />
            </div>
            <button className="btn" type="submit" disabled={busy}>
              <UserPlus size={20} weight="bold" />
              {busy ? "Agregando…" : "Agregar"}
            </button>
          </div>
        ) : (
          <div className="addform">
            <div className="field">
              <label htmlFor="g-bulk">Un invitado por línea</label>
              <textarea
                id="g-bulk"
                className="textarea"
                style={{ minHeight: 150 }}
                value={bulk}
                onChange={(e) => setBulk(e.target.value)}
                placeholder={"Camila Rosario, 2, 8095550123\nAndrés Peña\nLuisa y Marcos Tavárez, 2"}
                aria-describedby="bulk-help"
              />
              <p id="bulk-help" className="field__help">
                Formato: nombre, lugares, WhatsApp. Solo el nombre es obligatorio. {parsedBulk.length > 0 && `Se agregarán ${parsedBulk.length}.`}
              </p>
            </div>
            <div>
              <button className="btn" type="submit" disabled={busy}>
                <UserPlus size={20} weight="bold" />
                {busy ? "Agregando…" : "Agregar todos"}
              </button>
            </div>
          </div>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </form>
    </section>
  );
}

function Dialog({ children, onClose, label }: { children: React.ReactNode; onClose: () => void; label: string }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <motion.div
      className="dialog"
      role="dialog"
      aria-modal="true"
      aria-label={label}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="dialog__card"
        initial={{ scale: 0.92, y: 20, rotate: -1 }}
        animate={{ scale: 1, y: 0, rotate: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function EditDialog({ guest, onClose, onSave }: { guest: Guest; onClose: () => void; onSave: (p: Partial<Guest>) => Promise<void> }) {
  const [name, setName] = useState(guest.name);
  const [seats, setSeats] = useState(guest.seats);
  const [phone, setPhone] = useState(guest.phone ?? "");
  const [note, setNote] = useState(guest.note ?? "");
  const [status, setStatus] = useState<RsvpStatus>(guest.status);
  const [attending, setAttending] = useState(guest.status === "yes" ? guest.attending : guest.seats);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await onSave({ name, seats, phone, note, status, attending: Math.min(attending, seats) });
    setBusy(false);
  }

  return (
    <Dialog onClose={onClose} label={`Editar ${guest.name}`}>
      <form onSubmit={submit}>
        <h3>Editar invitado</h3>
        <div className="field">
          <label htmlFor="e-name">Nombre</label>
          <input id="e-name" className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
        </div>
        <div className="field">
          <span className="field__label">Lugares</span>
          <Stepper value={seats} onChange={setSeats} label="Lugares" />
        </div>
        <div className="field">
          <label htmlFor="e-phone">WhatsApp</label>
          <input id="e-phone" className="input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="e-note">Nota</label>
          <input id="e-note" className="input" value={note} onChange={(e) => setNote(e.target.value)} maxLength={140} />
        </div>
        <div className="field">
          <span className="field__label">Estado</span>
          <div className="seg" role="group" aria-label="Estado">
            {(["pending", "yes", "no"] as RsvpStatus[]).map((s) => (
              <button key={s} type="button" aria-pressed={status === s} onClick={() => setStatus(s)}>
                {STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        </div>
        {status === "yes" && seats > 1 && (
          <div className="field">
            <span className="field__label">Personas que asisten</span>
            <Stepper value={Math.min(attending, seats)} onChange={setAttending} max={seats} label="Personas que asisten" />
          </div>
        )}
        <div className="dialog__row">
          <button className="btn btn--ghost btn--small" type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn--small" type="submit" disabled={busy || !name.trim()}>
            {busy ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
