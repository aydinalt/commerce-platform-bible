"use client";

import { useEffect, useRef, useState } from "react";

import { useSession } from "@/lib/session";

/**
 * Sign in and register, in one dialog with two faces.
 *
 * One component rather than two screens because the two forms differ by two
 * fields and a heading, and a person who opened the wrong one should be able
 * to cross over without losing what they typed.
 *
 * **The refusals here are the ones the platform already decided.** A failed
 * sign-in names neither half — not "wrong password", not "no such account" —
 * because naming either tells a stranger whether an address is registered.
 * The prototype keeps that wording so the screen being reviewed is the screen
 * that would ship.
 */
export function AuthDialog() {
  const { closeGate, gate, openGate, signIn } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const firstField = useRef<HTMLInputElement>(null);

  const registering = gate === "register";

  useEffect(() => {
    if (gate !== null) firstField.current?.focus();
  }, [gate]);

  useEffect(() => {
    if (gate === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeGate();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeGate, gate]);

  if (gate === null) return null;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!email.includes("@") || email.trim().length < 5) {
      setError("Geçerli bir e-posta adresi girin.");
      return;
    }
    if (password.length < 8) {
      setError("Parola en az 8 karakter olmalı.");
      return;
    }
    if (registering && name.trim().length < 2) {
      setError("Adınızı yazın.");
      return;
    }
    /*
     * The one refusal that is not a field error, kept so the screen shows what
     * a wrong sign-in looks like. It names neither the address nor the
     * password, which is the whole point.
     */
    if (!registering && password === "12345678") {
      setError("E-posta adresi veya parola hatalı.");
      return;
    }

    signIn({
      email: email.trim(),
      name: registering ? name.trim() : (email.split("@")[0] ?? "Üye")
    });
    setName("");
    setEmail("");
    setPassword("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 px-4 py-10"
      onClick={(event) => {
        if (event.target === event.currentTarget) closeGate();
      }}
      role="presentation"
    >
      <div
        aria-labelledby="auth-basligi"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
        role="dialog"
      >
        <div className="mb-1 flex items-start justify-between gap-4">
          <h2
            className="text-xl font-bold tracking-tight text-slate-900"
            id="auth-basligi"
          >
            {registering ? "Kayıt ol" : "Giriş yap"}
          </h2>
          <button
            aria-label="Kapat"
            className="-mt-1 rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            onClick={closeGate}
            type="button"
          >
            ✕
          </button>
        </div>

        <p className="mb-5 text-sm text-slate-500">
          {registering
            ? "Favori listenizi ve fiyat takibinizi hesabınıza bağlayın."
            : "Favorileriniz ve yorumlarınız hesabınıza kayıtlıdır."}
        </p>

        <form className="space-y-4" noValidate onSubmit={submit}>
          {registering ? (
            <div>
              <label
                className="mb-1 block text-sm font-medium text-slate-700"
                htmlFor="auth-ad"
              >
                Ad Soyad
              </label>
              <input
                autoComplete="name"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
                id="auth-ad"
                onChange={(event) => setName(event.target.value)}
                ref={firstField}
                type="text"
                value={name}
              />
            </div>
          ) : null}

          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="auth-eposta"
            >
              E-posta
            </label>
            <input
              autoComplete="email"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
              id="auth-eposta"
              onChange={(event) => setEmail(event.target.value)}
              ref={registering ? undefined : firstField}
              type="email"
              value={email}
            />
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="auth-parola"
            >
              Parola
            </label>
            <input
              autoComplete={registering ? "new-password" : "current-password"}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
              id="auth-parola"
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
            <p className="mt-1 text-[12px] text-slate-500">
              {registering
                ? "En az 8 karakter."
                : "Parolanızı unuttuysanız e-posta ile sıfırlayabilirsiniz."}
            </p>
          </div>

          {error === null ? null : (
            <p
              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            className="w-full rounded-lg bg-orange-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-800"
            type="submit"
          >
            {registering ? "Hesap oluştur" : "Giriş yap"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          {registering ? "Zaten hesabınız var mı?" : "Hesabınız yok mu?"}{" "}
          <button
            className="font-semibold text-sky-700 underline-offset-2 hover:underline"
            onClick={() => {
              setError(null);
              openGate(registering ? "login" : "register");
            }}
            type="button"
          >
            {registering ? "Giriş yapın" : "Kayıt olun"}
          </button>
        </p>
      </div>
    </div>
  );
}
