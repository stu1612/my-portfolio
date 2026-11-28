import { describe, expect, it } from "vitest";
import {
  formatDate,
  listKicker,
  olderLabel,
  postKicker,
  rowMeta,
} from "./format";

describe("formatDate", () => {
  it("formats an ISO date as day, short month and year", () => {
    expect(formatDate("2026-11-28")).toBe("28 Nov 2026");
    expect(formatDate("2026-01-02")).toBe("2 Jan 2026");
  });

  it("names every month", () => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    months.forEach((name, i) => {
      const mm = String(i + 1).padStart(2, "0");
      expect(formatDate(`2026-${mm}-15`)).toBe(`15 ${name} 2026`);
    });
  });

  it("never shifts the day, whatever the time zone", () => {
    // Reads the string parts; new Date("2026-01-01") would be 31 Dec in
    // a zone west of UTC.
    const zone = process.env.TZ;
    process.env.TZ = "America/Los_Angeles";
    try {
      expect(formatDate("2026-01-01")).toBe("1 Jan 2026");
    } finally {
      process.env.TZ = zone;
    }
  });

  it("rejects anything that isn't YYYY-MM-DD", () => {
    expect(() => formatDate("28/11/2026")).toThrow();
    expect(() => formatDate("2026-13-01")).toThrow();
  });
});

describe("postKicker", () => {
  it("joins blog, date and read time", () => {
    expect(postKicker({ published: "2026-11-28", readingMinutes: 6 })).toBe(
      "Blog · 28 Nov 2026 · 6 min read",
    );
  });
});

describe("listKicker", () => {
  it("counts posts in the singular and plural", () => {
    expect(listKicker(1)).toBe("Blog · 1 post");
    expect(listKicker(5)).toBe("Blog · 5 posts");
  });
});

describe("rowMeta", () => {
  it("shows read time alone without tags", () => {
    expect(rowMeta({ readingMinutes: 3, tags: [] })).toBe("3 min");
  });

  it("adds tags as written", () => {
    expect(rowMeta({ readingMinutes: 6, tags: ["Agents", "Process"] })).toBe(
      "6 min · Agents · Process",
    );
  });
});

describe("olderLabel", () => {
  it("labels the older post with its date", () => {
    expect(olderLabel("2026-11-10")).toBe("Older post · 10 Nov 2026");
  });
});
