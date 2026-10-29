import { describe, it, expect } from "vitest";
import {
  mark,
  record,
  emptyProgress,
  validateProgress,
  validateBank,
  lifeStep,
  tournamentProb,
} from "./engine";
import content from "./content.json";
import type { Question } from "./engine";
const qs = content.questions as Question[];
describe("question marking", () => {
  it("marks all built-in objective answers", () => {
    for (const q of qs.filter((q) => q.type !== "written"))
      expect(
        mark(q, Array.isArray(q.answer) ? q.answer : String(q.answer)),
        q.id,
      ).toBe(true);
  });
  it("rejects blanks and nonfinite numeric values", () => {
    const q = qs.find((q) => q.type === "numeric")!;
    for (const a of ["", " ", "NaN", "Infinity", "one"])
      expect(mark(q, a)).toBe(false);
  });
  it("accepts sensible decimal rounding but rejects percent confusion", () => {
    const q = qs.find((q) => q.id === "L9-02")!;
    expect(mark(q, "0.4213")).toBe(true);
    expect(mark(q, "42.13")).toBe(false);
  });
  it("requires exactly the multiple selections and preserves matching order", () => {
    const q = qs.find((q) => q.type === "multiselect")!;
    expect(mark(q, [...(q.answer as string[])].reverse())).toBe(true);
    expect(mark(q, (q.answer as string[]).slice(1))).toBe(false);
    const m = qs.find((q) => q.type === "matching")!;
    expect(mark(m, [...(m.answer as string[])].reverse())).toBe(false);
  });
});
describe("progress", () => {
  it("round trips real attempts and schedules transparent reviews", () => {
    const p = record(emptyProgress(), "q", 0, 1, 1000);
    expect(p.attempts[0].due).toBe(1000);
    const a = record(p, "q", 1, 3, 1000);
    expect(a.attempts[1].due).toBe(86401000);
    const b = record(a, "q", 1, 3, 1000);
    expect(b.attempts[2].due).toBe(172801000);
    expect(validateProgress(JSON.parse(JSON.stringify(b)))).toEqual(b);
  });
  it("rejects malformed imports", () => {
    expect(() => validateProgress({ version: 1 })).toThrow();
    expect(() => validateBank([{ ...qs[0], id: "bad" }])).toThrow();
    expect(validateBank([{ ...qs[0], id: "personal-test" }])).toHaveLength(1);
  });
});
describe("experiments and content", () => {
  it("steps a blinker synchronously", () => {
    const g = Array(25).fill(0);
    g[11] = g[12] = g[13] = 1;
    const next = lifeStep(g, 5);
    expect(next.reduce<number>((a, b) => a + b, 0)).toBe(3);
    expect(next[7]).toBe(1);
    expect(next[12]).toBe(1);
    expect(next[17]).toBe(1);
    expect(lifeStep(next, 5)).toEqual(g);
  });
  it("normalises tournament probabilities and increases best chance", () => {
    for (const k of [1, 2, 5, 10])
      expect(
        Array.from({ length: 10 }, (_, i) =>
          tournamentProb(i + 1, 10, k),
        ).reduce((a, b) => a + b, 0),
      ).toBeCloseTo(1);
    expect(tournamentProb(10, 10, 5)).toBeGreaterThan(
      tournamentProb(10, 10, 2),
    );
  });
  it("has unique IDs, all requested lectures, sources and rubrics", () => {
    expect(new Set(qs.map((q) => q.id)).size).toBe(qs.length);
    for (let i = 1; i <= 12; i++)
      expect(qs.some((q) => q.lecture === i)).toBe(true);
    for (const q of qs) {
      expect(q.source.page).toBeGreaterThan(0);
      expect(q.source.file.endsWith(".pdf")).toBe(true);
      if (q.type === "written") expect(q.rubric.length).toBeGreaterThan(0);
    }
  });
});
