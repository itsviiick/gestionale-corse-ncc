"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";

export default function SettingsPage() {
  const [minutes, setMinutes] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setMinutes(String(data.reminderLeadMinutes));
        setEmail(data.email);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reminderLeadMinutes: Number(minutes) }),
    });
    setSaving(false);
    setSaved(true);
  }

  const anticipo = Number(minutes);
  const descrizioneAnticipo = Number.isFinite(anticipo) && anticipo >= 60
    ? `${Math.floor(anticipo / 60)} ${Math.floor(anticipo / 60) === 1 ? "ora" : "ore"}${anticipo % 60 ? ` e ${anticipo % 60} minuti` : ""} prima`
    : `${anticipo || 0} minuti prima`;

  return (
    <>
      <Header />

      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="text-xl font-semibold tracking-tight text-slate-800">Impostazioni</h1>
        <p className="mt-0.5 text-sm text-slate-500">Come e quando ricevere i promemoria</p>

        {loading ? (
          <div className="mt-6 rounded-xl border border-slate-300 bg-surface p-6 text-sm text-slate-500 shadow-sm">
            Caricamento…
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-slate-300 bg-surface shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <p className="text-sm font-medium text-slate-700">Indirizzo per i promemoria</p>
              <p className="mt-1 text-sm text-slate-800">{email}</p>
              <p className="mt-1 text-xs text-slate-500">
                Per cambiarlo, modifica l&apos;utente nel database.
              </p>
            </div>

            <div className="px-6 py-5">
              <label htmlFor="anticipo" className="mb-1.5 block text-sm font-medium text-slate-700">
                Anticipo del promemoria
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="anticipo"
                  type="number"
                  min={0}
                  step={15}
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className="w-32 rounded-lg border border-slate-300 bg-surface px-3 py-2 text-slate-800 outline-none transition-colors focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
                <span className="text-sm text-slate-500">minuti prima della corsa</span>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                Riceverai l&apos;email <strong className="font-medium text-slate-700">{descrizioneAnticipo}</strong> di
                ogni corsa.
              </p>

              <div className="mt-5 flex items-center gap-3 border-t border-slate-200 pt-5">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Salvataggio…" : "Salva"}
                </button>
                {saved && <span className="text-sm text-emerald-600">Impostazioni salvate.</span>}
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
