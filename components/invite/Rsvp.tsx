"use client";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Minus, Plus } from "@phosphor-icons/react";
import { Sticker } from "@/components/Sticker";
import type { PublicGuest } from "@/lib/types";
import { celebrate } from "./confetti";
import { NiniPhoto, type Mood } from "./NiniPhoto";
import { Reveal } from "./Reveal";

type View = "lookup" | "form" | "done";

export function Rsvp({ initialGuest, invalidCode }: { initialGuest: PublicGuest | null; invalidCode?: boolean }) {
  const [guest, setGuest] = useState<PublicGuest | null>(initialGuest);
  const [view, setView] = useState<View>(!initialGuest ? "lookup" : initialGuest.status === "pending" ? "form" : "done");
  const [mood, setMood] = useState<Mood>(initialGuest?.status === "yes" ? "happy" : initialGuest?.status === "no" ? "sad" : "idle");

  return (
    <section className="section rsvp" id="confirmar" aria-labelledby="rsvp-h">
      <div className="deco" style={{ top: 50, left: "4%", width: "clamp(70px, 14vw, 120px)" }}>
        <Reveal kind="slap" rotate={-10}>
          <Sticker name="mojito" />
        </Reveal>
      </div>
      <div className="deco" style={{ top: 120, right: "5%", width: "clamp(60px, 11vw, 96px)" }}>
        <Reveal kind="slap" rotate={14} delay={0.15}>
          <Sticker name="caballito" />
        </Reveal>
      </div>
      <div className="section__wrap">
        <Reveal>
          <h2 id="rsvp-h" className="script-h">
            ¿Vienes?
          </h2>
        </Reveal>
        <Reveal delay={0.1} className="ticket-wrap">
          <div className="rsvp__nini">
            <NiniPhoto id="2006" width="100%" tilt={8} mood={mood} delay={0.3} />
          </div>
          <div className="ticket">
            <AnimatePresence mode="wait" initial={false}>
              {view === "lookup" && (
                <Pane key="lookup">
                  <Lookup
                    invalidCode={invalidCode}
                    onFound={(g) => {
                      setGuest(g);
                      setView(g.status === "pending" ? "form" : "done");
                      window.history.replaceState(null, "", `/i/${g.code}#confirmar`);
                    }}
                  />
                </Pane>
              )}
              {view === "form" && guest && (
                <Pane key="form">
                  <Form
                    guest={guest}
                    onAnswer={(a) => setMood(a === "yes" ? "happy" : "sad")}
                    onSaved={(g) => {
                      setGuest(g);
                      setView("done");
                      setMood(g.status === "yes" ? "happy" : "sad");
                      if (g.status === "yes") celebrate();
                    }}
                  />
                </Pane>
              )}
              {view === "done" && guest && (
                <Pane key="done">
                  <Done guest={guest} onChange={() => setView("form")} />
                </Pane>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Pane({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, x: 40, rotate: 1 }}
      animate={{ opacity: 1, x: 0, rotate: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, x: -40, rotate: -1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Lookup({ onFound, invalidCode }: { onFound: (g: PublicGuest) => void; invalidCode?: boolean }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(invalidCode ? "Ese enlace no coincide con ninguna invitación. Escribe tu código." : "");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const clean = code.replace(/[^a-z0-9]/gi, "");
    if (clean.length < 4) {
      setError("El código tiene 6 letras o números.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/rsvp?code=${encodeURIComponent(clean)}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onFound(data.guest);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "No pudimos revisar el código. Intenta otra vez.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <p className="ticket__hello">La confirmación es personal</p>
      <p className="ticket__lead">Usa el enlace que te llegó o escribe el código de tu invitación.</p>
      <div className="field">
        <label htmlFor="code">Código de invitación</label>
        <input
          id="code"
          className="input input--code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 8))}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          inputMode="text"
          placeholder="K7QM4P"
          aria-describedby="code-help"
          aria-invalid={Boolean(error)}
        />
        <p id="code-help" className="field__help">
          Si no lo tienes, pídeselo a Nini.
        </p>
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="ticket__submit">
        <button className="btn" type="submit" disabled={busy}>
          {busy ? "Buscando…" : "Buscar mi invitación"}
        </button>
      </div>
    </form>
  );
}

function Form({ guest, onSaved, onAnswer }: { guest: PublicGuest; onSaved: (g: PublicGuest) => void; onAnswer: (a: "yes" | "no") => void }) {
  const [answer, setAnswer] = useState<"yes" | "no" | null>(guest.status === "pending" ? null : guest.status);
  const [count, setCount] = useState(guest.status === "yes" ? guest.attending : guest.seats);
  const [message, setMessage] = useState(guest.message ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const reduce = useReducedMotion();
  const first = guest.name.split(" ")[0];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!answer) {
      setError("Elige una opción para continuar.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: guest.code, response: answer, attending: count, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSaved(data.guest);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "No se pudo guardar. Revisa tu conexión e intenta otra vez.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <p className="ticket__hello">Hola, {first}</p>
      <p className="ticket__lead">
        {inviteLead(guest)} Cuéntanos si vienes.
      </p>

      <div className="choices" role="group" aria-label="¿Asistirás?">
        <button type="button" className="choice" aria-pressed={answer === "yes"} onClick={() => {
            setAnswer("yes");
            onAnswer("yes");
          }}>
          <Sticker name="naranja" />
          Ahí estaré
        </button>
        <button type="button" className="choice" aria-pressed={answer === "no"} onClick={() => {
            setAnswer("no");
            onAnswer("no");
          }}>
          <Sticker name="concha" />
          No podré ir
        </button>
      </div>

      <AnimatePresence initial={false}>
        {answer === "yes" && guest.seats > 1 && (
          <motion.div
            key="count"
            initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="field">
              <span className="field__label" id="count-label">
                ¿Cuántos van?
              </span>
              <div className="stepper" role="group" aria-labelledby="count-label">
                <button type="button" onClick={() => setCount((c) => Math.max(1, c - 1))} disabled={count <= 1} aria-label="Uno menos">
                  <Minus size={18} weight="bold" />
                </button>
                <output aria-live="polite">{count}</output>
                <button type="button" onClick={() => setCount((c) => Math.min(guest.seats, c + 1))} disabled={count >= guest.seats} aria-label="Uno más">
                  <Plus size={18} weight="bold" />
                </button>
              </div>
              <p className="field__help">Contándote a ti. Máximo {guest.seats}.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="field">
        <label htmlFor="msg">Un mensaje para Nini (opcional)</label>
        <textarea
          id="msg"
          className="textarea"
          value={message}
          maxLength={280}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="¡Feliz cumple! Nos vemos allá."
        />
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="ticket__submit">
        <button className="btn" type="submit" disabled={busy}>
          {busy ? "Guardando…" : "Enviar respuesta"}
        </button>
      </div>
    </form>
  );
}

function Done({ guest, onChange }: { guest: PublicGuest; onChange: () => void }) {
  const reduce = useReducedMotion();
  const yes = guest.status === "yes";
  return (
    <div className="done" aria-live="polite">
      <motion.div
        initial={reduce ? false : { scale: 2.6, rotate: -30, opacity: 0 }}
        animate={{ scale: 1, rotate: -8, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.1 }}
      >
        <Sticker name={yes ? "beso" : "caracola"} className="done__stamp" />
      </motion.div>
      <h3>{yes ? "¡Te esperamos!" : "Te vamos a extrañar"}</h3>
      <p>
        {yes
          ? guest.attending > 1
            ? `Confirmaste ${guest.attending} personas. Nos vemos el sábado 24 a las 7:00 PM.`
            : "Tu lugar está confirmado. Nos vemos el sábado 24 a las 7:00 PM."
          : "Gracias por avisar. Si tus planes cambian, puedes actualizar tu respuesta aquí."}
      </p>
      {guest.message && <p className="done__quote">“{guest.message}”</p>}
      <button type="button" className="linklike" onClick={onChange}>
        Cambiar mi respuesta
      </button>
    </div>
  );
}

function inviteLead(guest: PublicGuest) {
  if (guest.seats <= 1) return "Esta invitación es para ti.";
  const named = (guest.companions ?? []).filter(Boolean);
  const extra = guest.seats - 1;
  if (!named.length) return `Puedes venir con ${extra} ${extra === 1 ? "persona" : "personas"}.`;
  const rest = extra - named.length;
  const list = named.length > 1 ? `${named.slice(0, -1).join(", ")} y ${named[named.length - 1]}` : named[0];
  return rest > 0 ? `Puedes venir con ${list} y ${rest} ${rest === 1 ? "persona más" : "personas más"}.` : `Puedes venir con ${list}.`;
}
