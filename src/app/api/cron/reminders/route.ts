import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { runReminderTick } from "@/lib/reminders";

// Deve girare su runtime Node (nodemailer e il driver Postgres non sono
// compatibili con l'edge runtime) e non deve mai essere messo in cache.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function autorizzato(request: Request): boolean {
  const atteso = process.env.CRON_SECRET;
  if (!atteso) return false;

  const header = request.headers.get("authorization") ?? "";
  const fornito = header.startsWith("Bearer ") ? header.slice(7) : "";

  const a = Buffer.from(fornito);
  const b = Buffer.from(atteso);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

async function esegui(request: Request) {
  if (!autorizzato(request)) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  try {
    const esito = await runReminderTick();
    return NextResponse.json({ ok: true, ...esito });
  } catch (err) {
    console.error("[cron] errore durante l'invio dei promemoria:", err);
    return NextResponse.json({ error: "Errore durante l'esecuzione" }, { status: 500 });
  }
}

export const GET = esegui;
export const POST = esegui;
