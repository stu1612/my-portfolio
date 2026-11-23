"use client";

import { useSyncExternalStore } from "react";
import { formatLocalTime, msUntilNextMinute } from "@/lib/local-time";
import { site } from "@/lib/site";

// Ticks on each whole minute. The snapshot is the minute number, so it only
// changes (and re-renders) once a minute.
function subscribe(onChange: () => void) {
  let interval: ReturnType<typeof setInterval> | undefined;
  const timeout = setTimeout(() => {
    onChange();
    interval = setInterval(onChange, 60_000);
  }, msUntilNextMinute(Date.now()));
  return () => {
    clearTimeout(timeout);
    clearInterval(interval);
  };
}

const getSnapshot = () => Math.floor(Date.now() / 60_000);

// The page is prerendered, so the server never shows a time: it would be
// stale. The client fills it in after hydration.
const getServerSnapshot = () => null;

export function AvailabilityStatus({ className = "" }: { className?: string }) {
  const minute = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const time =
    minute === null
      ? "--:--"
      : formatLocalTime(new Date(minute * 60_000), site.timeZone);

  return (
    <p
      className={`type-meta items-center gap-2 ${className}`}
      data-testid="availability"
    >
      {site.availability.open && (
        <span aria-hidden className="bg-success size-2 rounded-full" />
      )}
      <span>
        {site.location} <span className="tabular-nums">{time}</span> ·{" "}
        {site.availability.label}
      </span>
    </p>
  );
}
