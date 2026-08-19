/* ============================================================
   HTML TEMPLATE RENDERER — Puppeteer-based HTML → PNG
   ============================================================
   # Renders our 186 branded HTML/CSS templates to PNG buffers
   # using headless Chromium. Uses @sparticuz/chromium-min in
   # production (Vercel) and regular Puppeteer locally.
   ============================================================ */

import type { TemplateContent, TemplateId } from "./templates/shared";
import { buildTemplateHTML } from "./templates/index";

// # Lazy-loaded browser instance — reused across renders in the same process
let browserPromise: Promise<import("puppeteer-core").Browser> | null = null;

// # Get or launch headless Chromium
async function getBrowser() {
  if (browserPromise) return browserPromise;

  browserPromise = (async () => {
    // # Production (Vercel): use @sparticuz/chromium-min for serverless
    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      const chromium = await import("@sparticuz/chromium-min");
      const puppeteer = await import("puppeteer-core");

      // # chromium-min downloads the binary on first use from the official Sparticuz release
      const execPath = await chromium.default.executablePath(
        "https://github.com/Sparticuz/chromium/releases/download/v149.0.0/chromium-v149.0.0-pack.x64.tar"
      );

      return puppeteer.default.launch({
        args: chromium.default.args,
        defaultViewport: null,
        executablePath: execPath,
        headless: true,
      });
    }

    // # Local development: use full puppeteer with bundled Chromium
    const puppeteer = await import("puppeteer");
    return puppeteer.default.launch({
      headless: true,
      defaultViewport: null,
    });
  })();

  return browserPromise;
}

// # Render a template to PNG buffer
// # Takes a template ID (t1-t186), content data, and target dimensions
export async function renderTemplateHTML(
  templateId: TemplateId,
  content: TemplateContent,
  width: number,
  height: number
): Promise<Buffer> {
  // # Build the complete HTML page for this template
  const html = buildTemplateHTML(templateId, content, width, height);

  // # Launch or reuse browser
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    // # Block all outbound requests — only allow data: URIs (logo) and about:blank
    // # Prevents SSRF if injected content contains <img src="http://..."> etc.
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const url = req.url();
      if (url.startsWith("data:") || url === "about:blank") {
        req.continue();
      } else {
        req.abort("blockedbyclient");
      }
    });

    // # Set viewport to exact template dimensions
    await page.setViewport({ width, height, deviceScaleFactor: 1 });

    // # Load the HTML content directly (no server needed)
    await page.setContent(html, { waitUntil: "load" });

    // # Screenshot the page at exact dimensions → PNG buffer
    const screenshot = await page.screenshot({
      type: "png",
      clip: { x: 0, y: 0, width, height },
    });

    return Buffer.from(screenshot);
  } finally {
    await page.close();
  }
}

// # Cleanup — call when shutting down the process
export async function closeBrowser() {
  if (browserPromise) {
    const browser = await browserPromise;
    await browser.close();
    browserPromise = null;
  }
}
