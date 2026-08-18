import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOwnerUser } from "@/lib/rides";

export async function GET() {
  const owner = await getOwnerUser();
  return NextResponse.json({
    reminderLeadMinutes: owner.reminderLeadMinutes,
    email: owner.email,
    name: owner.name,
  });
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null);
  const minutes = Number(body?.reminderLeadMinutes);

  if (!Number.isFinite(minutes) || minutes < 0) {
    return NextResponse.json({ error: "Valore non valido." }, { status: 400 });
  }

  const owner = await getOwnerUser();
  const updated = await prisma.user.update({
    where: { id: owner.id },
    data: { reminderLeadMinutes: Math.round(minutes) },
  });

  return NextResponse.json({ reminderLeadMinutes: updated.reminderLeadMinutes });
}
