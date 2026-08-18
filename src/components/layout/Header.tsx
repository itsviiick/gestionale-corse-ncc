"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/calendar", label: "Calendario" },
  { href: "/rides", label: "Corse" },
  { href: "/settings", label: "Impostazioni" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-800 bg-slate-900">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-white">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-slate-300"
            aria-hidden="true"
          >
            <path d="M5 17h14M5 17a2 2 0 1 0 4 0M5 17H3v-4l2-5h11l3 5h2v4h-2M9 17a2 2 0 1 0 4 0m2 0a2 2 0 1 0 4 0M6.5 12h11" />
          </svg>
          <span className="text-sm font-semibold tracking-tight">Gestione Corse</span>
        </Link>

        <nav className="flex flex-1 items-center gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? "bg-slate-800 font-medium text-white"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <form action="/api/auth/logout" method="post">
          <button
            type="submit"
            className="rounded-md px-3 py-1.5 text-sm text-slate-400 transition-colors hover:text-white"
          >
            Esci
          </button>
        </form>
      </div>
    </header>
  );
}
