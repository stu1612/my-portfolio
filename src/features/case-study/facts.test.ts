import { describe, expect, it } from "vitest";
import { kicker, nextLabel, toFacts } from "./facts";

const entry = {
  client: "Probell Nutrition",
  role: "Design and development (freelance)",
  year: 2026,
  stack: ["Astro", "Vercel", "HubSpot", "TypeScript"],
  readingMinutes: 4,
};

describe("toFacts", () => {
  it("lists role, stack, year and read time in order", () => {
    expect(toFacts(entry)).toEqual([
      { label: "Role", value: "Design and development (freelance)" },
      { label: "Stack", value: "Astro · Vercel · HubSpot · TypeScript" },
      { label: "Year", value: "2026" },
      { label: "Read", value: "4 min" },
    ]);
  });
});

describe("kicker", () => {
  it("names the client and year", () => {
    expect(kicker(entry)).toBe("Case study · Probell Nutrition · 2026");
  });
});

describe("nextLabel", () => {
  it("shows at most three stack items, then the year", () => {
    expect(nextLabel(entry)).toBe(
      "Next project · Astro · Vercel · HubSpot · 2026",
    );
  });

  it("shows fewer when the stack is short", () => {
    expect(nextLabel({ stack: ["Astro.js", "TypeScript"], year: 2026 })).toBe(
      "Next project · Astro.js · TypeScript · 2026",
    );
  });
});
