const baseURL =
  process.env.ALIFE_BASE_URL || "http://127.0.0.1:5173/Alife-Lab/";
import { chromium } from "@playwright/test";
import fs from "node:fs";
const browser = await chromium.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(baseURL);
await page
  .getByRole("heading", { name: "A little closer to understanding life." })
  .waitFor();
await page.screenshot({ path: "/tmp/alife-desktop.png", fullPage: true });
await page.getByRole("button", { name: "Continue Learning" }).click();
await page.locator("article.lesson h2").waitFor();
await page.getByRole("button", { name: "Mark explored & practise" }).click();
await page.waitForURL("**/#quiz");
await page
  .getByRole("radio", { name: /A synthetic chemical protocell/ })
  .check();
await page.getByRole("button", { name: "Check answer" }).click();
await page.getByText("That’s it. Nicely reasoned.").waitFor();
await page.reload();
let stored = await page.evaluate(() =>
  JSON.parse(localStorage.getItem("alife-progress")),
);
if (stored.attempts.length !== 1 || !stored.completed.includes(1))
  throw Error("Progress failed to persist");
for (const route of [
  "learn",
  "quiz",
  "written",
  "exam",
  "lab",
  "revision",
  "settings",
  "sources",
  "hint",
]) {
  await page.goto(baseURL + "#" + route);
  await page.waitForTimeout(100);
  if (!(await page.locator("main h1").count()))
    throw Error("Missing route " + route);
}
await page.goto(baseURL + "#written");
await page
  .getByRole("textbox", { name: "Your written answer" })
  .fill(
    "AI studies intelligent behaviour. ALIFE studies processes of life. They overlap in adaptive robots.",
  );
await page.getByRole("button", { name: "Reveal model & rubric" }).click();
await page.locator(".rubric-point input").first().check();
await page.getByRole("button", { name: /Save 1\// }).click();
await page.goto(baseURL + "#exam");
await page.getByRole("button", { name: "Begin timed practice" }).click();
await page
  .getByRole("textbox", { name: "Exam answer" })
  .fill("A personal timed answer");
await page.getByRole("button", { name: "Finish & review" }).click();
await page.getByText("POST-EXAM REVIEW").waitFor();
await page.goto(baseURL + "#lab");
await page.getByRole("button", { name: "Step", exact: true }).click();
await page.getByText(/Generation 1 ·/).waitFor();
for (const tab of ["Schelling", "Boids", "Selection"]) {
  await page.getByRole("button", { name: tab, exact: true }).click();
  await page.waitForTimeout(100);
}
await page.getByRole("button", { name: "Draw 10 parents" }).click();
await page
  .getByText(/observed/)
  .first()
  .waitFor();
await page.screenshot({ path: "/tmp/alife-simulation.png", fullPage: true });
await page.setViewportSize({ width: 390, height: 844 });
for (const route of [
  "dashboard",
  "quiz",
  "learn",
  "written",
  "exam",
  "lab",
  "revision",
  "settings",
  "sources",
  "hint",
]) {
  await page.goto(baseURL + "#" + route);
  await page.waitForTimeout(100);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > innerWidth,
  );
  if (overflow) throw Error("Horizontal overflow " + route);
  if (route === "dashboard")
    await page.screenshot({ path: "/tmp/alife-mobile.png", fullPage: true });
}
if (errors.length) throw Error(errors.join("\n"));
console.log(
  "Browser checks passed: routes, quiz, lesson completion, persistence, written rubric, timed review, simulations; desktop 1440px and mobile 390px with no overflow or page errors.",
);
await browser.close();
