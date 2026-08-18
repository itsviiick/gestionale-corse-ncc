"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatRome } from "@/lib/timezone";

export interface RideEvent {
  id: string;
  clientName: string;
  pickupLocation: string;
  dropoffLocation: string | null;
  clientPhone: string | null;
  price: number | null;
  passengerCount: number | null;
  flightNumber: string | null;
  notes: string | null;
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED";
  pickupDateTime: string;
}

const STATO: Record<RideEvent["status"], { testo: string; classe: string }> = {
  CONFIRMED: { testo: "Confermata", classe: "bg-blue-50 text-blue-700 ring-blue-600/20" },
  COMPLETED: { testo: "Completata", classe: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  CANCELLED: { testo: "Annullata", classe: "bg-slate-100 text-slate-600 ring-slate-500/20" },
};

function Riga({ etichetta, children }: { etichetta: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-2">
      <dt className="w-28 shrink-0 text-sm text-slate-500">{etichetta}</dt>
      <dd className="min-w-0 flex-1 text-sm text-slate-800">{children}</dd>
    </div>
  );
}

export function RideEventModal({
  ride,
  onClose,
  onChanged,
}: {
  ride: RideEvent;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleDelete() {
    if (!confirm("Eliminare questa corsa?")) return;
    setLoading(true);
    await fetch(`/api/rides/${ride.id}`, { method: "DELETE" });
    setLoading(false);
    onChanged();
  }

  async function setStatus(status: "COMPLETED" | "CANCELLED") {
    setLoading(true);
    await fetch(`/api/rides/${ride.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    onChanged();
  }

  const stato = STATO[ride.status];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-xl bg-surface shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-slate-800">{ride.clientName}</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {formatRome(ride.pickupDateTime, "cccc d LLLL yyyy, HH:mm")}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${stato.classe}`}
          >
            {stato.testo}
          </span>
        </div>

        <dl className="divide-y divide-slate-200 px-6 py-2">
          <Riga etichetta="Ritiro">{ride.pickupLocation}</Riga>
          {ride.dropoffLocation && <Riga etichetta="Destinazione">{ride.dropoffLocation}</Riga>}
          {ride.clientPhone && (
            <Riga etichetta="Telefono">
              <a href={`tel:${ride.clientPhone.replace(/\s/g, "")}`} className="text-slate-800 underline underline-offset-4">
                {ride.clientPhone}
              </a>
            </Riga>
          )}
          {ride.price != null && <Riga etichetta="Prezzo">{ride.price.toFixed(2)} €</Riga>}
          {ride.passengerCount != null && <Riga etichetta="Passeggeri">{ride.passengerCount}</Riga>}
          {ride.flightNumber && <Riga etichetta="Volo">{ride.flightNumber}</Riga>}
          {ride.notes && <Riga etichetta="Note">{ride.notes}</Riga>}
        </dl>

        <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 bg-surface-muted px-6 py-4">
          <Link
            href={`/rides/${ride.id}`}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            Modifica
          </Link>

          {ride.status === "CONFIRMED" && (
            <>
              <button
                disabled={loading}
                onClick={() => setStatus("COMPLETED")}
                className="rounded-lg border border-slate-300 bg-surface px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-50"
              >
                Completata
              </button>
              <button
                disabled={loading}
                onClick={() => setStatus("CANCELLED")}
                className="rounded-lg border border-slate-300 bg-surface px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-50"
              >
                Annulla corsa
              </button>
            </>
          )}

          <button
            disabled={loading}
            onClick={handleDelete}
            className="ml-auto rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-red-600 disabled:opacity-50"
          >
            Elimina
          </button>
        </div>
      </div>
    </div>
  );
}
