"use client";

import { useState, type FormEvent } from "react";

export interface RideFormValues {
  pickupDateTime: string;
  pickupLocation: string;
  dropoffLocation: string;
  clientName: string;
  clientPhone: string;
  price: string;
  passengerCount: string;
  flightNumber: string;
  notes: string;
}

export const emptyRideFormValues: RideFormValues = {
  pickupDateTime: "",
  pickupLocation: "",
  dropoffLocation: "",
  clientName: "",
  clientPhone: "",
  price: "",
  passengerCount: "",
  flightNumber: "",
  notes: "",
};

interface RideFormProps {
  initialValues?: Partial<RideFormValues>;
  missingFields?: string[];
  submitLabel?: string;
  onSubmit: (values: RideFormValues) => Promise<void>;
  onCancel?: () => void;
}

const BASE_INPUT =
  "w-full rounded-lg border px-3 py-2 text-slate-800 outline-none transition-colors placeholder:text-slate-400";
const NORMAL_INPUT = "border-slate-300 bg-surface focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10";
const MISSING_INPUT = "border-amber-400 bg-amber-50/60 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20";

function inputClass(missing: boolean) {
  return `${BASE_INPUT} ${missing ? MISSING_INPUT : NORMAL_INPUT}`;
}

const LABEL = "mb-1.5 block text-sm font-medium text-slate-700";

export function RideForm({
  initialValues,
  missingFields = [],
  submitLabel = "Salva",
  onSubmit,
  onCancel,
}: RideFormProps) {
  const [values, setValues] = useState<RideFormValues>({
    ...emptyRideFormValues,
    ...initialValues,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof RideFormValues>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!values.pickupDateTime || !values.pickupLocation || !values.clientName) {
      setError("Data e ora, luogo di ritiro e nome cliente sono obbligatori.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore durante il salvataggio.");
    } finally {
      setLoading(false);
    }
  }

  const dateMissing =
    missingFields.includes("pickupDate") || missingFields.includes("pickupTime");

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {missingFields.length > 0 && (
        <div className="flex gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
            aria-hidden="true"
          >
            <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
          </svg>
          <p className="text-sm text-amber-800">
            Completa i campi evidenziati: non sono stati trovati nel testo incollato.
          </p>
        </div>
      )}

      <div>
        <label className={LABEL}>
          Data e ora del ritiro <span className="text-red-500">*</span>
        </label>
        <input
          type="datetime-local"
          value={values.pickupDateTime}
          onChange={(e) => update("pickupDateTime", e.target.value)}
          className={inputClass(dateMissing)}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={LABEL}>
            Luogo di ritiro <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Es. Aeroporto Capodichino"
            value={values.pickupLocation}
            onChange={(e) => update("pickupLocation", e.target.value)}
            className={inputClass(missingFields.includes("pickupLocation"))}
          />
        </div>
        <div>
          <label className={LABEL}>Destinazione</label>
          <input
            type="text"
            placeholder="Es. Hotel Vesuvio, Napoli"
            value={values.dropoffLocation}
            onChange={(e) => update("dropoffLocation", e.target.value)}
            className={inputClass(missingFields.includes("dropoffLocation"))}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={LABEL}>
            Nome cliente <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={values.clientName}
            onChange={(e) => update("clientName", e.target.value)}
            className={inputClass(missingFields.includes("clientName"))}
          />
        </div>
        <div>
          <label className={LABEL}>Telefono</label>
          <input
            type="tel"
            value={values.clientPhone}
            onChange={(e) => update("clientPhone", e.target.value)}
            className={inputClass(missingFields.includes("clientPhone"))}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label className={LABEL}>Prezzo (€)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={values.price}
            onChange={(e) => update("price", e.target.value)}
            className={inputClass(missingFields.includes("price"))}
          />
        </div>
        <div>
          <label className={LABEL}>Passeggeri</label>
          <input
            type="number"
            min="1"
            value={values.passengerCount}
            onChange={(e) => update("passengerCount", e.target.value)}
            className={inputClass(missingFields.includes("passengerCount"))}
          />
        </div>
        <div>
          <label className={LABEL}>Volo</label>
          <input
            type="text"
            placeholder="Es. AZ123"
            value={values.flightNumber}
            onChange={(e) => update("flightNumber", e.target.value)}
            className={inputClass(missingFields.includes("flightNumber"))}
          />
        </div>
      </div>

      <div>
        <label className={LABEL}>Note</label>
        <textarea
          value={values.notes}
          onChange={(e) => update("notes", e.target.value)}
          rows={3}
          placeholder="Bagagli, richieste particolari, metodo di pagamento…"
          className={inputClass(missingFields.includes("notes"))}
        />
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-5">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Salvataggio…" : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 bg-surface px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            Annulla
          </button>
        )}
      </div>
    </form>
  );
}
