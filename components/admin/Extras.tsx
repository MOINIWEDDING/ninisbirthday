"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { ArrowCounterClockwise } from "@phosphor-icons/react";
import { Sticker } from "@/components/Sticker";
import { GUEST_LIMIT } from "@/lib/event";
import { DEFAULT_TEMPLATE, PLACEHOLDERS, renderMessage } from "@/lib/message";
import "./admin-extra.css";

/* ---------- Campos de acompañantes ---------- */
export function CompanionFields({
  seats,
  value,
  onChange,
  idPrefix,
}: {
  seats: number;
  value: string[];
  onChange: (v: string[]) => void;
  idPrefix: string;
}) {
  const extra = Math.max(0, seats - 1);
  if (!extra) return null;
  return (
    <div className="companions">
      <span className="field__label">Acompañantes</span>
      <p className="field__help">Opcional. Si lo dejas vacío, el mensaje dirá «Puedes venir con {extra === 1 ? "1 persona" : `${extra} personas`}».</p>
      <div className="companions__grid">
        {Array.from({ length: extra }, (_, i) => (
          <input
            key={i}
            id={`${idPrefix}-c${i}`}
            className="input"
            aria-label={`Nombre del acompañante ${i + 1}`}
            placeholder={`Acompañante ${i + 1}`}
            value={value[i] ?? ""}
            maxLength={60}
            onChange={(e) => {
              const next = Array.from({ length: extra }, (_, k) => value[k] ?? "");
              next[i] = e.target.value;
              onChange(next);
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------- Medidor de cupo (20 soles) ---------- */
export function LimitMeter({ total }: { total: number }) {
  const cells = Math.max(GUEST_LIMIT, total);
  return (
    <div className="meter" role="img" aria-label={`${total} de ${GUEST_LIMIT} lugares ocupados`}>
      {Array.from({ length: cells }, (_, i) => (
        <motion.span
          key={i}
          className={`meter__dot ${i < total ? (i >= GUEST_LIMIT ? "is-over" : "is-on") : ""}`}
          initial={false}
          animate={i < total ? { scale: [0.6, 1.25, 1] } : { scale: 1 }}
          transition={{ duration: 0.4, delay: i * 0.015 }}
        />
      ))}
    </div>
  );
}

/* ---------- Aviso de Moisés ---------- */
export function LimitAlert({ total, onOk, onAsh }: { total: number; onOk: () => void; onAsh: () => void }) {
  const over = total > GUEST_LIMIT;
  return (
    <motion.div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="limit-h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        className="dialog__card limit"
        initial={{ scale: 0.6, rotate: -8, y: 40 }}
        animate={{ scale: 1, rotate: 0, y: 0, x: [0, -10, 10, -8, 8, -4, 4, 0] }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 14, x: { delay: 0.3, duration: 0.5 } }}
      >
        <motion.div className="limit__sticker" animate={{ rotate: [-8, 8, -8] }} transition={{ duration: 1.2, repeat: Infinity }}>
          <Sticker name="beso" eager />
        </motion.div>
        <h3 id="limit-h">Chichi, ya te estás pasando del límite</h3>
        <p className="limit__big">Moisés te va a ahorcar.</p>
        <p className="limit__count">
          Van <b>{total}</b> de {GUEST_LIMIT} personas{over ? `, ${total - GUEST_LIMIT} de más` : ""}.
        </p>
        <div className="dialog__row limit__row">
          <button className="btn btn--ghost" type="button" onClick={onOk}>
            Ok, Moisés
          </button>
          <button className="btn" type="button" onClick={onAsh} autoFocus>
            Ash 🙄
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------- "Se cayó la página" ---------- */
export function Crash() {
  const [phase, setPhase] = useState<"glitch" | "down">("glitch");
  const id = useMemo(() => `iad1::moises-${Date.now()}-${Math.random().toString(16).slice(2, 14)}`, []);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.documentElement.style.overflow = "hidden";
    const prevTitle = document.title;
    const t = window.setTimeout(() => {
      setPhase("down");
      document.title = "500: Se cancela el cumpleaños";
    }, 650);
    return () => {
      window.clearTimeout(t);
      document.title = prevTitle;
      document.documentElement.style.overflow = "";
    };
  }, []);

  if (!mounted) return null;
  return createPortal(
    phase === "glitch" ? (
      <div className="crash crash--glitch" aria-hidden="true" />
    ) : (
      <div className="crash" role="alert">
        <div className="crash__box">
          <h1>Se cancela el cumpleaños</h1>
          <p>Esta página dejó de funcionar y no va a volver.</p>
          <button type="button" className="crash__btn" onClick={() => window.history.back()}>
            Go back
          </button>
          <code>
            500 INTERNAL_SERVER_ERROR
            <br />
            Code: FIESTA_CANCELADA
            <br />
            {id}
          </code>
        </div>
        <div className="crash__foot">VIEW DOCUMENTATION&nbsp;&nbsp;/&nbsp;&nbsp;COPY DEBUG PROMPT</div>
      </div>
    ),
    document.body,
  );
}

/* ---------- Editor del mensaje de WhatsApp ---------- */
type Sample = { name: string; code: string; seats: number; companions: string[] };

export function MessageEditor({
  initial,
  sample,
  onClose,
  onSave,
}: {
  initial: string;
  sample: Sample;
  onClose: () => void;
  onSave: (template: string | null) => Promise<string | null>;
}) {
  const [text, setText] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const area = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const preview = renderMessage(text, sample, `${typeof window !== "undefined" ? window.location.origin : ""}/i/${sample.code}`);

  function insert(token: string) {
    const el = area.current;
    if (!el) return setText((t) => t + token);
    const start = el.selectionStart ?? text.length;
    const end = el.selectionEnd ?? text.length;
    const next = text.slice(0, start) + token + text.slice(end);
    setText(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + token.length, start + token.length);
    });
  }

  async function save(reset = false) {
    if (!reset && !text.includes("{link}")) {
      setError("Incluye {link} para que cada persona reciba su enlace.");
      return;
    }
    setBusy(true);
    setError("");
    const err = await onSave(reset ? null : text);
    setBusy(false);
    if (err) setError(err);
  }

  return (
    <motion.div
      className="dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="msg-h"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="dialog__card msged"
        initial={{ scale: 0.94, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 10 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
      >
        <h3 id="msg-h">Mensaje de WhatsApp</h3>
        <p className="field__help" style={{ marginTop: 4 }}>
          Toca un campo para insertarlo donde está el cursor. Cada invitado recibe sus propios datos.
        </p>
        <div className="msged__chips" role="group" aria-label="Campos disponibles">
          {PLACEHOLDERS.map((p) => (
            <button key={p.key} type="button" className="msged__chip" onClick={() => insert(p.key)} title={p.help}>
              {p.key}
            </button>
          ))}
        </div>
        <div className="msged__grid">
          <div className="field" style={{ marginTop: 0 }}>
            <label htmlFor="msg-text">Texto</label>
            <textarea id="msg-text" ref={area} className="textarea msged__text" value={text} onChange={(e) => setText(e.target.value)} spellCheck />
          </div>
          <div className="field" style={{ marginTop: 0 }}>
            <span className="field__label">Así lo verá {sample.name.split(" ")[0]}</span>
            <div className="msged__bubble">{preview}</div>
          </div>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="dialog__row msged__row">
          <button className="iconbtn" type="button" onClick={() => setText(DEFAULT_TEMPLATE)} disabled={busy}>
            <ArrowCounterClockwise size={18} />
            Restaurar original
          </button>
          <span style={{ flex: 1 }} />
          <button className="btn btn--ghost btn--small" type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn--small" type="button" onClick={() => save()} disabled={busy}>
            {busy ? "Guardando…" : "Guardar mensaje"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
