import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOwnerUser } from "@/lib/rides";
import { rideInputSchema } from "@/lib/validation";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const owner = await getOwnerUser();
  const ride = await prisma.ride.findFirst({ where: { id, ownerId: owner.id } });
  if (!ride) return NextResponse.json({ error: "Non trovata" }, { status: 404 });
  return NextResponse.json(ride);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = rideInputSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const owner = await getOwnerUser();
  const existing = await prisma.ride.findFirst({ where: { id, ownerId: owner.id } });
  if (!existing) return NextResponse.json({ error: "Non trovata" }, { status: 404 });

  const data = parsed.data;
  const ride = await prisma.ride.update({
    where: { id },
    data: {
      ...(data.pickupDateTime !== undefined && { pickupDateTime: new Date(data.pickupDateTime) }),
      ...(data.pickupLocation !== undefined && { pickupLocation: data.pickupLocation }),
      ...(data.dropoffLocation !== undefined && { dropoffLocation: data.dropoffLocation || null }),
      ...(data.clientName !== undefined && { clientName: data.clientName }),
      ...(data.clientPhone !== undefined && { clientPhone: data.clientPhone || null }),
      ...(data.price !== undefined && { price: data.price ?? null }),
      ...(data.passengerCount !== undefined && { passengerCount: data.passengerCount ?? null }),
      ...(data.flightNumber !== undefined && { flightNumber: data.flightNumber || null }),
      ...(data.notes !== undefined && { notes: data.notes || null }),
      ...(data.status !== undefined && { status: data.status }),
    },
  });

  return NextResponse.json(ride);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const owner = await getOwnerUser();
  const existing = await prisma.ride.findFirst({ where: { id, ownerId: owner.id } });
  if (!existing) return NextResponse.json({ error: "Non trovata" }, { status: 404 });

  await prisma.ride.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
