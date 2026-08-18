import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOwnerUser } from "@/lib/rides";
import { rideInputSchema } from "@/lib/validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const owner = await getOwnerUser();

  const rides = await prisma.ride.findMany({
    where: {
      ownerId: owner.id,
      ...(from && to
        ? { pickupDateTime: { gte: new Date(from), lte: new Date(to) } }
        : {}),
    },
    orderBy: { pickupDateTime: "asc" },
  });

  return NextResponse.json(rides);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = rideInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const owner = await getOwnerUser();
  const data = parsed.data;

  const ride = await prisma.ride.create({
    data: {
      ownerId: owner.id,
      pickupDateTime: new Date(data.pickupDateTime),
      pickupLocation: data.pickupLocation,
      dropoffLocation: data.dropoffLocation || null,
      clientName: data.clientName,
      clientPhone: data.clientPhone || null,
      price: data.price ?? null,
      passengerCount: data.passengerCount ?? null,
      flightNumber: data.flightNumber || null,
      notes: data.notes || null,
      rawText: data.rawText || "(inserito manualmente)",
      source: data.source ?? "MANUAL_ENTRY",
    },
  });

  return NextResponse.json(ride, { status: 201 });
}
