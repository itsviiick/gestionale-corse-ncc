"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteRideButton({ rideId }: { rideId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Eliminare questa corsa?")) return;
    setLoading(true);
    await fetch(`/api/rides/${rideId}`, { method: "DELETE" });
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-sm font-medium text-slate-400 transition-colors hover:text-red-600 disabled:opacity-50"
    >
      Elimina
    </button>
  );
}
