import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOwnerUser } from "@/lib/rides";
import { toRomeInputValue } from "@/lib/timezone";
import { EditRideForm } from "@/components/rides/EditRideForm";
import { Header } from "@/components/layout/Header";

export default async function EditRidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const owner = await getOwnerUser();
  const ride = await prisma.ride.findFirst({ where: { id, ownerId: owner.id } });

  if (!ride) notFound();

  return (
    <>
      <Header />

      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8 sm:px-6">
        <Link
          href="/rides"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-800"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Torna alle corse
        </Link>

        <h1 className="mt-4 text-xl font-semibold tracking-tight text-slate-800">Modifica corsa</h1>
        <p className="mt-0.5 text-sm text-slate-500">{ride.clientName}</p>

        <div className="mt-6 rounded-xl border border-slate-300 bg-surface p-6 shadow-sm">
          <EditRideForm
            rideId={ride.id}
            initialValues={{
              pickupDateTime: toRomeInputValue(ride.pickupDateTime),
              pickupLocation: ride.pickupLocation,
              dropoffLocation: ride.dropoffLocation ?? "",
              clientName: ride.clientName,
              clientPhone: ride.clientPhone ?? "",
              price: ride.price?.toString() ?? "",
              passengerCount: ride.passengerCount?.toString() ?? "",
              flightNumber: ride.flightNumber ?? "",
              notes: ride.notes ?? "",
            }}
          />
        </div>

        {ride.rawText && ride.rawText !== "(inserito manualmente)" && (
          <details className="mt-4 rounded-xl border border-slate-300 bg-surface px-5 py-4 shadow-sm">
            <summary className="cursor-pointer text-sm font-medium text-slate-700">
              Testo originale della prenotazione
            </summary>
            <pre className="mt-3 whitespace-pre-wrap font-sans text-sm text-slate-600">
              {ride.rawText}
            </pre>
          </details>
        )}
      </main>
    </>
  );
}
