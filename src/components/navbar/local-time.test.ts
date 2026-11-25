import { describe, expect, it } from "vitest";
import { formatLocalTime, msUntilNextMinute } from "./local-time";

const tz = "Europe/Stockholm";

describe("formatLocalTime", () => {
  it("is UTC+1 in winter", () => {
    expect(formatLocalTime(new Date("2026-01-15T13:05:00Z"), tz)).toBe("14:05");
  });

  it("is UTC+2 in summer", () => {
    expect(formatLocalTime(new Date("2026-07-15T13:05:00Z"), tz)).toBe("15:05");
  });

  it("follows the spring daylight-saving change (29 March 2026, 01:00 UTC)", () => {
    expect(formatLocalTime(new Date("2026-03-29T00:59:00Z"), tz)).toBe("01:59");
    expect(formatLocalTime(new Date("2026-03-29T01:00:00Z"), tz)).toBe("03:00");
  });

  it("follows the autumn daylight-saving change (25 October 2026, 01:00 UTC)", () => {
    expect(formatLocalTime(new Date("2026-10-25T00:59:00Z"), tz)).toBe("02:59");
    expect(formatLocalTime(new Date("2026-10-25T01:00:00Z"), tz)).toBe("02:00");
  });

  it("writes midnight as 00:00, not 24:00", () => {
    expect(formatLocalTime(new Date("2026-01-15T23:00:00Z"), tz)).toBe("00:00");
  });

  it("pads single-digit hours and minutes", () => {
    expect(formatLocalTime(new Date("2026-01-15T07:03:00Z"), tz)).toBe("08:03");
  });
});

describe("msUntilNextMinute", () => {
  it("counts to the next whole minute", () => {
    expect(msUntilNextMinute(Date.UTC(2026, 0, 1, 12, 0, 45, 500))).toBe(
      14_500,
    );
  });

  it("waits a full minute when exactly on the minute", () => {
    expect(msUntilNextMinute(Date.UTC(2026, 0, 1, 12, 0, 0, 0))).toBe(60_000);
  });
});
