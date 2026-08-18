"use client";

import { useRouter } from "next/navigation";
import { RideForm, type RideFormValues } from "./RideForm";
import { fromRomeInputValueToISO } from "@/lib/timezone";

export function EditRideForm({
  rideId,
  initialValues,
}: {
  rideId: string;
  initialValues: RideFormValues;
}) {
  const router = useRouter();

  async function handleSubmit(values: RideFormValues) {
    const res = await fetch(`/api/rides/${rideId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pickupDateTime: fromRomeInputValueToISO(values.pickupDateTime),
        pickupLocation: values.pickupLocation,
        dropoffLocation: values.dropoffLocation || null,
        clientName: values.clientName,
        clientPhone: values.clientPhone || null,
        price: values.price ? Number(values.price) : null,
        passengerCount: values.passengerCount ? Number(values.passengerCount) : null,
        flightNumber: values.flightNumber || null,
        notes: values.notes || null,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error ? JSON.stringify(body.error) : "Errore nel salvataggio.");
    }

    router.push("/rides");
    router.refresh();
  }

  return (
    <RideForm
      initialValues={initialValues}
      onSubmit={handleSubmit}
      submitLabel="Salva modifiche"
      onCancel={() => router.push("/rides")}
    />
  );
}
