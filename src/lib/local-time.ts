const formatters = new Map<string, Intl.DateTimeFormat>();

/** "HH:MM" (24-hour) for `date` in `timeZone`. Handles daylight saving. */
export function formatLocalTime(date: Date, timeZone: string): string {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZone,
    });
    formatters.set(timeZone, formatter);
  }
  return formatter.format(date);
}

/** Milliseconds until the next whole minute after `now`. */
export function msUntilNextMinute(now: number): number {
  return 60_000 - (now % 60_000);
}
