const baseURL =
  process.env.ALIFE_BASE_URL || "http://127.0.0.1:5173/Alife-Lab/";
import { chromium } from "@playwright/test";
import fs from "node:fs";
const browser = await chromium.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const page = await browser.newPage();
await page.goto(baseURL + "#quiz");
const search = page.getByRole("textbox", { name: "Search questions" });
await search.fill("A live cell has five");
await page.getByRole("textbox", { name: "Your answer" }).fill("0");
await page.getByRole("textbox", { name: "Your answer" }).press("Enter");
await page.getByRole("button", { name: "Save this attempt" }).click();
await search.fill("Select every condition");
for (const text of [
  "Dead with 3 neighbours",
  "Alive with 2 neighbours",
  "Alive with 3 neighbours",
])
  await page.getByRole("checkbox", { name: new RegExp(text) }).check();
await page.getByRole("button", { name: "Check answer" }).click();
await page.getByText("That’s it. Nicely reasoned.").waitFor();
await search.fill("Match each ALIFE approach");
await page.getByLabel("Match Soft").selectOption("Digital systems");
await page.getByLabel("Match Hard").selectOption("Physical robots");
await page.getByLabel("Match Wet").selectOption("Biochemical systems");
await page.getByRole("button", { name: "Check answer" }).click();
await page.getByText("That’s it. Nicely reasoned.").waitFor();
await page.goto(baseURL + "#settings");
const q = JSON.parse(
  fs.readFileSync(new URL("../src/content.json", import.meta.url), "utf8"),
).questions.find((q) => q.type === "numeric");
q.id = "personal-numeric";
q.text = "Personal numeric check";
const file = {
  name: "bank.json",
  mimeType: "application/json",
  buffer: Buffer.from(JSON.stringify([q])),
};
await page.locator("input[type=file]").nth(1).setInputFiles(file);
await page.getByText("1 personal questions loaded.").waitFor();
await page.reload();
await page.getByText("1 personal questions loaded.").waitFor();
await page.goto(baseURL + "#exam");
await page.getByLabel("Exam question source").selectOption("personal");
await page.getByRole("button", { name: "Begin timed practice" }).click();
await page.getByRole("textbox", { name: "Exam answer" }).fill("0");
await page.getByRole("button", { name: "Finish & review" }).click();
await page.getByText("Personal numeric check", { exact: true }).waitFor();
await page.getByText("That’s it. Nicely reasoned.").waitFor();
const saved = await page.evaluate(() =>
  JSON.parse(localStorage.getItem("alife-progress")),
);
if (saved.attempts.length !== 3)
  throw Error("Expected three recorded objective attempts");
console.log(
  "Additional browser checks passed: numeric zero + Enter, multi-select, matching, personal bank import/persistence and timed private-bank review.",
);
await browser.close();
