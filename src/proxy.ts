import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { unsealData } from "iron-session";
import { sessionOptions, type SessionData } from "@/lib/session";

// Percorsi che NON passano dal controllo di sessione.
// /api/cron ha una protezione propria (CRON_SECRET): deve restare fuori da
// qui, altrimenti il servizio di cron esterno riceve la pagina di login e i
// promemoria non partono mai, senza alcun errore visibile.
const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/auth/logout", "/api/cron"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(sessionOptions.cookieName)?.value;
  let authenticated = false;

  if (cookie) {
    try {
      const session = await unsealData<SessionData>(cookie, {
        password: sessionOptions.password,
      });
      authenticated = Boolean(session.authenticated);
    } catch {
      authenticated = false;
    }
  }

  if (!authenticated) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
