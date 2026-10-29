import { chromium } from "@playwright/test";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import assert from "node:assert/strict";
const root = path.resolve(fileURLToPath(new URL("../dist/", import.meta.url)));
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webmanifest": "application/manifest+json",
};
// No SPA fallback: only actual files under the production repository subpath exist.
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    if (!url.pathname.startsWith("/Alife-Lab/")) {
      res.writeHead(404).end();
      return;
    }
    const relative =
      decodeURIComponent(url.pathname.slice("/Alife-Lab/".length)) ||
      "index.html";
    const file = path.resolve(root, relative);
    if (!file.startsWith(root + path.sep)) {
      res.writeHead(404).end();
      return;
    }
    if (!(await stat(file)).isFile()) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, {
      "Content-Type": mime[path.extname(file)] || "application/octet-stream",
    });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}/Alife-Lab/`;
let browser;
try {
  browser = await chromium.launch({
    executablePath:
      process.env.CHROME_PATH ||
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    acceptDownloads: true,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
  });
  await page.goto(base);
  await page
    .getByRole("heading", { name: "A little closer to understanding life." })
    .waitFor();
  const manifestURL = await page
    .locator("link[rel=manifest]")
    .getAttribute("href");
  assert.equal(manifestURL, "/Alife-Lab/manifest.webmanifest");
  const response = await page.request.get(new URL(manifestURL, base).href);
  assert.equal(response.status(), 200);
  const manifest = await response.json();
  assert.equal(
    new URL(manifest.start_url, response.url()).href,
    base + "#dashboard",
  );
  assert.equal(new URL(manifest.scope, response.url()).href, base);
  for (const icon of manifest.icons) {
    assert.equal(
      (await page.request.get(new URL(icon.src, response.url()).href)).status(),
      200,
    );
  }
  assert.equal(
    (await page.request.get(base + "icons/apple-touch-icon.png")).status(),
    200,
  );
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "dashboard",
      "quiz",
      "written",
      "learn",
      "exam",
      "lab",
      "revision",
      "settings",
      "sources",
      "hint",
    ]) {
      await page.goto(base + "#" + route);
      await page.reload();
      await page.locator("main h1").waitFor();
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
        `${width}px overflow: ${route}`,
      );
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + "#dashboard");
  await page.getByRole("button", { name: "Study menu" }).click();
  const transferLink = page
    .getByRole("navigation")
    .getByRole("link", { name: "Progress & imports" });
  assert.ok((await transferLink.boundingBox()).height >= 44);
  await transferLink.click();
  await page
    .getByRole("heading", { name: "Your study data belongs to you." })
    .waitFor();
  await page.goto(base + "#quiz");
  await page
    .getByRole("radio", { name: /A synthetic chemical protocell/ })
    .check();
  const check = page.getByRole("button", { name: "Check answer" });
  assert.ok((await check.boundingBox()).height >= 44);
  await check.click();
  await page.getByText("That’s it. Nicely reasoned.").waitFor();
  await page.goto(base + "#written");
  const answer = page.getByRole("textbox", { name: "Your written answer" });
  await answer.fill("Transfer test: a saved written draft.");
  assert.equal(
    await answer.evaluate((e) => getComputedStyle(e).fontSize),
    "16px",
  );
  assert.ok((await answer.boundingBox()).height >= 220);
  await page.reload();
  await page.getByRole("textbox", { name: "Your written answer" }).waitFor();
  assert.equal(
    await page
      .getByRole("textbox", { name: "Your written answer" })
      .inputValue(),
    "Transfer test: a saved written draft.",
  );
  await page.goto(base + "#settings");
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export progress" }).click();
  const downloaded = await pending;
  const exportBytes = await readFile(await downloaded.path());
  const other = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const target = await other.newPage();
  await target.goto(base + "#settings");
  await target
    .locator("input[type=file]")
    .first()
    .setInputFiles({
      name: "alife-progress.json",
      mimeType: "application/json",
      buffer: exportBytes,
    });
  await target.getByText("Import complete. Saved in this browser.").waitFor();
  await target.reload();
  const original = await page.evaluate(() =>
    localStorage.getItem("alife-progress"),
  );
  const transferred = await target.evaluate(() =>
    localStorage.getItem("alife-progress"),
  );
  assert.deepEqual(JSON.parse(transferred), JSON.parse(original));
  await page.goto(base + "#lab");
  const cell = page.getByRole("button", {
    name: "Cell 1, 1: dead",
    exact: true,
  });
  assert.ok((await cell.boundingBox()).width >= 44);
  await cell.click();
  await page
    .getByRole("button", { name: "Cell 1, 1: alive", exact: true })
    .waitFor();
  await page.goto(base + "#quiz");
  await page.screenshot({
    path: "/tmp/alife-pages-mobile-quiz.png",
    fullPage: true,
  });
  assert.deepEqual(errors, []);
  console.log(
    "PASS: production /Alife-Lab/ assets and icons, hash-route refreshes at 320/390/768/1440px, mobile navigation and 44px targets, 16px writing inputs, localStorage and actual JSON export/import between independent contexts.",
  );
} finally {
  if (browser) await browser.close();
  await new Promise((r) => server.close(r));
}
