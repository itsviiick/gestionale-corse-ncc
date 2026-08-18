import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getOwnerUser } from "@/lib/rides";
import { formatRome } from "@/lib/timezone";
import { Header } from "@/components/layout/Header";
import { DeleteRideButton } from "@/components/rides/DeleteRideButton";

// Senza questo, Next.js pre-genera la pagina al momento del build e l'elenco
// resterebbe fermo ai dati esistenti in quel momento: le corse vanno lette
// dal database a ogni visita.
export const dynamic = "force-dynamic";

const STATO_ETICHETTA: Record<string, { testo: string; classe: string }> = {
  CONFIRMED: { testo: "Confermata", classe: "bg-blue-50 text-blue-700 ring-blue-600/20" },
  COMPLETED: { testo: "Completata", classe: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  CANCELLED: { testo: "Annullata", classe: "bg-slate-100 text-slate-600 ring-slate-500/20" },
};

export default async function RidesPage() {
  const owner = await getOwnerUser();
  const rides = await prisma.ride.findMany({
    where: { ownerId: owner.id },
    orderBy: { pickupDateTime: "asc" },
  });

  return (
    <>
      <Header />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-800">Corse</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              {rides.length === 0
                ? "Nessuna corsa registrata"
                : `${rides.length} ${rides.length === 1 ? "corsa registrata" : "corse registrate"}`}
            </p>
          </div>
          <Link
            href="/rides/new"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800"
          >
            Aggiungi corsa
          </Link>
        </div>

        <div className="rounded-xl border border-slate-300 bg-surface shadow-sm">
          {rides.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <p className="text-sm text-slate-600">Non hai ancora registrato nessuna corsa.</p>
              <Link
                href="/rides/new"
                className="mt-3 inline-block text-sm font-medium text-slate-800 underline underline-offset-4"
              >
                Aggiungi la prima
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-slate-200">
              {rides.map((ride) => {
                const stato = STATO_ETICHETTA[ride.status] ?? STATO_ETICHETTA.CONFIRMED;
                return (
                  <li
                    key={ride.id}
                    className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 transition-colors hover:bg-slate-100"
                  >
                    <div className="w-28 shrink-0 text-sm font-medium tabular-nums text-slate-800">
                      {formatRome(ride.pickupDateTime, "dd/LL HH:mm")}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium text-slate-800">{ride.clientName}</p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${stato.classe}`}
                        >
                          {stato.testo}
                        </span>
                      </div>
                      <p className="truncate text-sm text-slate-500">
                        {ride.pickupLocation}
                        {ride.dropoffLocation ? ` → ${ride.dropoffLocation}` : ""}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <Link
                        href={`/rides/${ride.id}`}
                        className="text-sm font-medium text-slate-700 transition-colors hover:text-slate-800"
                      >
                        Modifica
                      </Link>
                      <DeleteRideButton rideId={ride.id} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}
