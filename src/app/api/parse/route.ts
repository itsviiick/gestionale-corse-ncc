import { NextResponse } from "next/server";
import { parseBookingText } from "@/lib/parser";

const KEY_FIELDS = ["pickupDate", "pickupTime", "pickupLocation", "clientName"] as const;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const rawText = body?.rawText;

  if (typeof rawText !== "string" || !rawText.trim()) {
    return NextResponse.json({ error: "Testo mancante." }, { status: 400 });
  }

  let parsed;
  try {
    parsed = parseBookingText(rawText);
  } catch (err) {
    console.error("Errore durante il parsing del testo:", err);
    return NextResponse.json(
      { error: "Non è stato possibile analizzare il testo. Inserisci i dati manualmente." },
      { status: 500 }
    );
  }

  const missingFields = KEY_FIELDS.filter((field) => parsed[field] == null);

  return NextResponse.json({ parsed, missingFields, rawText });
}
