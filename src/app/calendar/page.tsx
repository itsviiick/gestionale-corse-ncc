import Link from "next/link";
import { RideCalendar } from "@/components/calendar/RideCalendar";
import { Header } from "@/components/layout/Header";

export default function CalendarPage() {
  return (
    <>
      <Header />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-800">Calendario</h1>
            <p className="mt-0.5 text-sm text-slate-500">Tocca una corsa per vederne i dettagli</p>
          </div>
          <Link
            href="/rides/new"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800"
          >
            Aggiungi corsa
          </Link>
        </div>

        <div className="rounded-xl border border-slate-300 bg-surface p-3 shadow-sm sm:p-5">
          <RideCalendar />
        </div>
      </main>
    </>
  );
}
