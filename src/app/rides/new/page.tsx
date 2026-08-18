"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { RideForm, emptyRideFormValues, type RideFormValues } from "@/components/rides/RideForm";
import { Header } from "@/components/layout/Header";
import { fromRomeInputValueToISO } from "@/lib/timezone";
import type { ParsedBooking } from "@/lib/parser";

type Step = "paste" | "confirm";

function parsedToFormValues(parsed: ParsedBooking): RideFormValues {
  return {
    pickupDateTime: parsed.pickupDate && parsed.pickupTime ? `${parsed.pickupDate}T${parsed.pickupTime}` : "",
    pickupLocation: parsed.pickupLocation ?? "",
    dropoffLocation: parsed.dropoffLocation ?? "",
    clientName: parsed.clientName ?? "",
    clientPhone: parsed.clientPhone ?? "",
    price: parsed.price != null ? String(parsed.price) : "",
    passengerCount: parsed.passengerCount != null ? String(parsed.passengerCount) : "",
    flightNumber: parsed.flightNumber ?? "",
    notes: parsed.notes ?? "",
  };
}

export default function NewRidePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("paste");
  const [text, setText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const [initialValues, setInitialValues] = useState<RideFormValues>(emptyRideFormValues);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [rawText, setRawText] = useState("");
  const [source, setSource] = useState<"MANUAL_PASTE" | "MANUAL_ENTRY">("MANUAL_ENTRY");

  async function handleAnalyze(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;

    setAnalyzing(true);
    setParseError(null);

    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: text }),
      });

      const body = await res.json();

      if (!res.ok) {
        setParseError(body?.error ?? "Errore durante l'analisi del testo.");
        return;
      }

      setInitialValues(parsedToFormValues(body.parsed));
      setMissingFields(body.missingFields ?? []);
      setRawText(body.rawText ?? text);
      setSource("MANUAL_PASTE");
      setStep("confirm");
    } catch {
      setParseError("Errore di rete durante l'analisi del testo.");
    } finally {
      setAnalyzing(false);
    }
  }

  function skipToManual() {
    setInitialValues(emptyRideFormValues);
    setMissingFields([]);
    setRawText("(inserito manualmente)");
    setSource("MANUAL_ENTRY");
    setStep("confirm");
  }

  async function handleSubmit(values: RideFormValues) {
    const res = await fetch("/api/rides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pickupDateTime: fromRomeInputValueToISO(values.pickupDateTime),
        pickupLocation: values.pickupLocation,
        dropoffLocation: values.dropoffLocation || null,
        clientName: values.clientName,
        clientPhone: values.clientPhone || null,
        price: values.price ? Number(values.price) : null,
        passengerCount: values.passengerCount ? Number(values.passengerCount) : null,
        flightNumber: values.flightNumber || null,
        notes: values.notes || null,
        rawText,
        source,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error ? JSON.stringify(body.error) : "Errore nel salvataggio.");
    }

    router.push("/rides");
    router.refresh();
  }

  if (step === "paste") {
    return (
      <>
        <Header />
        <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8 sm:px-6">
          <h1 className="text-xl font-semibold tracking-tight text-slate-800">Nuova corsa</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Incolla il testo della prenotazione: i campi riconosciuti verranno compilati per te.
          </p>

          <form
            onSubmit={handleAnalyze}
            className="mt-6 rounded-xl border border-slate-300 bg-surface p-6 shadow-sm"
          >
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Testo della prenotazione
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={9}
              placeholder={"Incolla qui il testo copiato da un'email, da un'app di prenotazione\no da un messaggio del cliente…"}
              className="w-full rounded-lg border border-slate-300 bg-surface px-3 py-2 text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />

            {parseError && (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                {parseError}
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-200 pt-5">
              <button
                type="submit"
                disabled={analyzing || !text.trim()}
                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {analyzing ? "Analisi in corso…" : "Analizza testo"}
              </button>
              <button
                type="button"
                onClick={skipToManual}
                className="rounded-lg border border-slate-300 bg-surface px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
              >
                Inserisci a mano
              </button>
              <button
                type="button"
                onClick={() => router.push("/rides")}
                className="rounded-lg px-5 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
              >
                Annulla
              </button>
            </div>
          </form>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="text-xl font-semibold tracking-tight text-slate-800">Conferma i dati</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Controlla che sia tutto corretto prima di salvare la corsa.
        </p>

        <div className="mt-6 rounded-xl border border-slate-300 bg-surface p-6 shadow-sm">
          <RideForm
            initialValues={initialValues}
            missingFields={missingFields}
            onSubmit={handleSubmit}
            submitLabel="Salva corsa"
            onCancel={() => setStep("paste")}
          />
        </div>
      </main>
    </>
  );
}
