// Rasterise the existing vector brand mark; no image service or runtime dependency.
import { chromium } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
try {
  const page = await browser.newPage();
  const svg = await readFile(
    new URL("../public/icons/icon.svg", import.meta.url),
    "utf8",
  );
  for (const [name, size] of [
    ["favicon-32", 32],
    ["apple-touch-icon", 180],
    ["icon-192", 192],
    ["icon-512", 512],
    ["icon-maskable-512", 512],
  ]) {
    const png = await page.evaluate(
      async ({ svg, size }) => {
        const image = new Image();
        image.src =
          "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
        await image.decode();
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = size;
        canvas.getContext("2d").drawImage(image, 0, 0, size, size);
        return canvas.toDataURL("image/png").split(",")[1];
      },
      { svg, size },
    );
    await writeFile(
      new URL(`../public/icons/${name}.png`, import.meta.url),
      Buffer.from(png, "base64"),
    );
  }
} finally {
  await browser.close();
}
