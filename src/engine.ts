export type Question = {
  id: string;
  lecture: number;
  topic: string;
  type: string;
  text: string;
  answer: string | number | string[];
  explanation: string;
  source: { file: string; page: number };
  category: string;
  marks: number;
  difficulty: string;
  options: string[];
  hint: string;
  rubric: string[];
  mistakes: string;
  supportingSource?: { file: string; page: number };
};
export type Attempt = {
  id: string;
  score: number;
  confidence: number;
  at: number;
  due: number;
};
export type Progress = {
  version: 1;
  attempts: Attempt[];
  completed: number[];
  drafts: Record<string, string>;
};
export const emptyProgress = (): Progress => ({
  version: 1,
  attempts: [],
  completed: [],
  drafts: {},
});
export function mark(q: Question, value: string | string[]): boolean {
  if (q.type === "numeric") {
    const raw = String(value).trim();
    return (
      raw !== "" &&
      Number.isFinite(Number(raw)) &&
      Math.abs(Number(raw) - Number(q.answer)) <=
        Math.max(0.001, Math.abs(Number(q.answer)) * 0.001)
    );
  }
  if (Array.isArray(q.answer)) {
    const a = [...q.answer];
    const b = Array.isArray(value) ? [...value] : [];
    return (
      a.length === b.length &&
      (q.type === "matching"
        ? a.every((x, i) => x === b[i])
        : a.sort().every((x, i) => x === b.sort()[i]))
    );
  }
  return (
    String(value).trim().toLowerCase() === String(q.answer).trim().toLowerCase()
  );
}
export function record(
  p: Progress,
  id: string,
  score: number,
  confidence: number,
  now = Date.now(),
): Progress {
  const previous = p.attempts.filter(
    (a) => a.id === id && a.score >= 0.8,
  ).length;
  const days =
    score < 0.8 ? 0 : confidence < 3 ? 1 : Math.min(14, 2 ** previous);
  return {
    ...p,
    attempts: [
      ...p.attempts,
      { id, score, confidence, at: now, due: now + days * 86400000 },
    ],
  };
}
export function validateProgress(x: unknown): Progress {
  const p = x as Progress;
  if (
    !p ||
    p.version !== 1 ||
    !Array.isArray(p.attempts) ||
    !Array.isArray(p.completed) ||
    !p.drafts ||
    typeof p.drafts !== "object" ||
    Array.isArray(p.drafts) ||
    !Object.values(p.drafts).every((v) => typeof v === "string") ||
    !p.completed.every(Number.isInteger) ||
    !p.attempts.every(
      (a) =>
        typeof a.id === "string" &&
        Number.isFinite(a.score) &&
        a.score >= 0 &&
        a.score <= 1 &&
        Number.isFinite(a.at) &&
        Number.isFinite(a.due) &&
        [1, 2, 3].includes(a.confidence),
    )
  )
    throw Error(
      "Invalid progress file. Expected an ALIFE Lab version 1 export.",
    );
  return p;
}
export function loadProgress(): Progress {
  try {
    return validateProgress(
      JSON.parse(localStorage.getItem("alife-progress") || "null"),
    );
  } catch {
    return emptyProgress();
  }
}
export function validateBank(x: unknown): Question[] {
  if (!Array.isArray(x) || x.length > 500)
    throw Error("Import an array of at most 500 questions.");
  const ids = new Set<string>();
  for (const q of x) {
    if (
      !q ||
      typeof q.id !== "string" ||
      !q.id.startsWith("personal-") ||
      ids.has(q.id) ||
      typeof q.text !== "string" ||
      ![
        "mcq",
        "multiselect",
        "truefalse",
        "fill",
        "matching",
        "numeric",
        "written",
      ].includes(q.type) ||
      !Number.isInteger(q.lecture) ||
      q.lecture < 1 ||
      q.lecture > 12 ||
      !Number.isFinite(q.marks) ||
      q.marks <= 0 ||
      typeof q.topic !== "string" ||
      typeof q.explanation !== "string" ||
      typeof q.hint !== "string" ||
      typeof q.mistakes !== "string" ||
      !Array.isArray(q.rubric) ||
      !q.rubric.every((s: unknown) => typeof s === "string") ||
      !Array.isArray(q.options) ||
      !q.options.every((s: unknown) => typeof s === "string") ||
      !q.source ||
      typeof q.source.file !== "string" ||
      !Number.isInteger(q.source.page) ||
      q.source.page < 1 ||
      !["string", "number", "object"].includes(typeof q.answer) ||
      q.answer === null
    )
      throw Error(
        "Invalid question. Use the sample bank schema; IDs must start personal-.",
      );
    if (
      ["matching", "multiselect"].includes(q.type) &&
      (!Array.isArray(q.answer) ||
        !q.answer.every((s: unknown) => typeof s === "string"))
    )
      throw Error("Matching and multiple-select answers must be arrays.");
    if (
      q.type === "numeric" &&
      (typeof q.answer !== "number" || !Number.isFinite(q.answer))
    )
      throw Error("Numeric answer must be finite.");
    if (
      ["mcq", "truefalse", "fill", "written"].includes(q.type) &&
      typeof q.answer !== "string"
    )
      throw Error("This answer must be text.");
    if (q.type === "matching" && q.answer.length !== q.options.length)
      throw Error("Matching prompts and answers must have equal lengths.");
    if (
      ["mcq", "multiselect"].includes(q.type) &&
      (!q.options.length ||
        (Array.isArray(q.answer) ? q.answer : [q.answer]).some(
          (a: string) => !q.options.includes(a),
        ))
    )
      throw Error("Correct options must occur in options.");
    if (q.type === "written" && !q.rubric.length)
      throw Error("Written questions need a rubric.");
    if (q.type === "truefalse" && !["True", "False"].includes(q.answer))
      throw Error("True/false answers must be True or False.");
    ids.add(q.id);
  }
  return x as Question[];
}
export function lifeStep(g: number[], size: number) {
  return g.map((v, i) => {
    const x = i % size,
      y = Math.floor(i / size);
    let n = 0;
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++)
        if (dx || dy)
          n += g[((y + dy + size) % size) * size + ((x + dx + size) % size)];
    return n === 3 || (v === 1 && n === 2) ? 1 : 0;
  });
}
export function tournamentProb(rank: number, n: number, k: number) {
  return (rank / n) ** k - ((rank - 1) / n) ** k;
}
