"use client";

import { useMemo, useState, useTransition } from "react";
import { Calendar } from "@/components/ui/calendar";
import { createBookingAction, cancelBookingAction } from "@/app/actions/bookings";

type Resource = { id: string; name: string };
type MyBooking = { id: string; date: string; resourceName: string };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

export default function BookingClient(props: {
  resources: Resource[];
  myBookings: MyBooking[];
}) {
  const [date, setDate] = useState<Date | undefined>();
  const [resourceId, setResourceId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canBook = useMemo(() => !!date && !!resourceId && !isPending, [date, resourceId, isPending]);

  function book() {
    if (!date || !resourceId) return;
    setMessage(null);

    startTransition(async () => {
      const res = await createBookingAction({ resourceId, dateISO: date.toISOString() });
      setMessage(res.success ? "Bokad!" : res.error);

      if (res.success) {
        // simplest: reload page to refresh bookings/resources
        window.location.reload();
      }
    });
  }

  function cancel(id: string) {
    setMessage(null);

    startTransition(async () => {
      const res = await cancelBookingAction(id);
      setMessage(res.success ? "Avbokad." : res.error);

      if (res.success) window.location.reload();
    });
  }

  return (
    <div className="w-full max-w-md space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Välj lokal</label>
        <select
          className="w-full rounded border p-2"
          value={resourceId}
          onChange={(e) => setResourceId(e.target.value)}
        >
          <option value="">Välj lokal</option>
          {props.resources.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded border p-2">
        <Calendar mode="single" selected={date} onSelect={setDate} />
      </div>

      <button
        onClick={book}
        disabled={!canBook}
        className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {isPending ? "Jobbar..." : "Boka"}
      </button>

      {message && <p className="text-sm">{message}</p>}

      <div className="pt-2">
        <h2 className="text-lg font-semibold">Mina bokningar</h2>
        <div className="mt-2 space-y-2">
          {props.myBookings.length === 0 ? (
            <p className="text-sm opacity-70">Inga bokningar ännu.</p>
          ) : (
            props.myBookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded border p-3">
                <div>
                  <div className="font-medium">{b.resourceName}</div>
                  <div className="text-sm opacity-70">{formatDate(b.date)}</div>
                </div>
                <button className="rounded border px-3 py-1 text-sm" onClick={() => cancel(b.id)} disabled={isPending}>
                  Avboka
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
