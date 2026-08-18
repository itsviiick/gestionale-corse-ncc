"use client";

import { useCallback, useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import luxon3Plugin from "@fullcalendar/luxon3";
import type { EventClickArg } from "@fullcalendar/core";

import { RideEventModal, type RideEvent } from "./RideEventModal";

const STATUS_COLOR: Record<string, string> = {
  CONFIRMED: "#2563eb",
  CANCELLED: "#9ca3af",
  COMPLETED: "#16a34a",
};

export function RideCalendar() {
  const [rides, setRides] = useState<RideEvent[]>([]);
  const [selected, setSelected] = useState<RideEvent | null>(null);

  const loadRides = useCallback(() => {
    fetch("/api/rides")
      .then((res) => res.json())
      .then(setRides)
      .catch(() => setRides([]));
  }, []);

  useEffect(() => {
    loadRides();
  }, [loadRides]);

  const events = rides.map((ride) => ({
    id: ride.id,
    title: `${ride.clientName} — ${ride.pickupLocation}`,
    start: ride.pickupDateTime,
    backgroundColor: STATUS_COLOR[ride.status],
    borderColor: STATUS_COLOR[ride.status],
    extendedProps: ride,
  }));

  return (
    <>
      <FullCalendar
        // luxon3Plugin abilita i fusi orari con nome: senza, FullCalendar
        // ignora "Europe/Rome" e mostra gli orari in UTC (2 ore indietro d'estate).
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin, luxon3Plugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,listWeek",
        }}
        locale="it"
        timeZone="Europe/Rome"
        height="auto"
        events={events}
        eventClick={(info: EventClickArg) => {
          setSelected(info.event.extendedProps as RideEvent);
        }}
      />

      {selected && (
        <RideEventModal
          ride={selected}
          onClose={() => setSelected(null)}
          onChanged={() => {
            setSelected(null);
            loadRides();
          }}
        />
      )}
    </>
  );
}
