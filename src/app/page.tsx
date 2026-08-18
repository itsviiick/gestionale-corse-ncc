import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getOwnerUser } from "@/lib/rides";
import { formatRome } from "@/lib/timezone";
import { Header } from "@/components/layout/Header";

export default async function Home() {
  const session = await getSession();
  if (!session.authenticated) {
    redirect("/login");
  }

  const owner = await getOwnerUser();
  const now = new Date();
  const prossime = await prisma.ride.findMany({
    where: { ownerId: owner.id, status: "CONFIRMED", pickupDateTime: { gte: now } },
    orderBy: { pickupDateTime: "asc" },
    take: 4,
  });
  const totaleFuture = await prisma.ride.count({
    where: { ownerId: owner.id, status: "CONFIRMED", pickupDateTime: { gte: now } },
  });

  return (
    <>
      <Header />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-800 sm:text-3xl">
            Le tue corse, in un unico posto
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
            {totaleFuture === 0
              ? "Non ci sono corse in programma."
              : `Hai ${totaleFuture} ${totaleFuture === 1 ? "corsa in programma" : "corse in programma"}.`}
          </p>

          <Link
            href="/rides/new"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Aggiungi una corsa
          </Link>
        </div>

        <section className="mt-10 rounded-xl border border-slate-300 bg-surface shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5">
            <h2 className="text-sm font-semibold text-slate-800">Prossime corse</h2>
            <Link href="/calendar" className="text-sm text-slate-500 transition-colors hover:text-slate-800">
              Vedi calendario
            </Link>
          </div>

          {prossime.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-500">
              Quando aggiungerai una corsa, comparirà qui.
            </p>
          ) : (
            <ul className="divide-y divide-slate-200">
              {prossime.map((ride) => (
                <li key={ride.id}>
                  <Link
                    href={`/rides/${ride.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-slate-100"
                  >
                    <div className="w-28 shrink-0 text-sm font-medium tabular-nums text-slate-800">
                      {formatRome(ride.pickupDateTime, "dd/LL HH:mm")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">{ride.clientName}</p>
                      <p className="truncate text-sm text-slate-500">
                        {ride.pickupLocation}
                        {ride.dropoffLocation ? ` → ${ride.dropoffLocation}` : ""}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
