"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, MotionConfig } from "motion/react";
import { Sticker } from "@/components/Sticker";
import { NiniPhoto } from "@/components/invite/NiniPhoto";

export function Login({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "No se pudo entrar.");
      setBusy(false);
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <main className="login">
        <div className="deco" style={{ top: -6, left: -10, width: 180 }}>
          <Sticker name="disco-esquina-rosa-top" eager />
        </div>
        <div className="deco" style={{ bottom: -6, right: -8, width: 220 }}>
          <Sticker name="disco-esquina-plata" eager style={{ transform: "scaleX(-1)" }} />
        </div>
        <motion.div
          className="login__card"
          initial={{ opacity: 0, y: 30, rotate: -2 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ type: "spring", stiffness: 160, damping: 16 }}
        >
          <div style={{ width: 120, margin: "-110px auto 4px" }}>
            <NiniPhoto id="2004" width="100%" tilt={-4} enter="mount" eager decorative />
          </div>
          <h1>Panel de Nini</h1>
          <p>Lista de invitados y confirmaciones.</p>
          {!configured ? (
            <p className="notice" role="alert">
              Falta la variable <code>ADMIN_PASSWORD</code>. Agrégala en Vercel (Settings, Environment Variables) y vuelve a desplegar.
            </p>
          ) : (
            <form onSubmit={submit}>
              <div className="field">
                <label htmlFor="pw">Contraseña</label>
                <input
                  id="pw"
                  className="input"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <button className="btn" type="submit" disabled={busy || !password}>
                {busy ? "Entrando…" : "Entrar"}
              </button>
            </form>
          )}
        </motion.div>
      </main>
    </MotionConfig>
  );
}
