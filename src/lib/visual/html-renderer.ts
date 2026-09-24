/* ============================================================
   HTML TEMPLATE RENDERER — Puppeteer-based HTML → PNG
   ============================================================
   # Renders our branded HTML/CSS templates to PNG buffers
   # using headless Chromium. Uses @sparticuz/chromium-min in
   # production (Vercel) and regular Puppeteer locally.
   #
   # TIMEOUT: All Puppeteer operations are wrapped in a 20s
   # timeout. On Vercel, Chromium download on cold start can
   # take 10-30s and hang the function. If Puppeteer fails or
   # times out, the caller falls back to Canvas 2D renderer.
   ============================================================ */

import type { TemplateContent, TemplateId } from "./templates/shared";
import { buildTemplateHTML } from "./templates/index";

// # Lazy-loaded browser instance — reused across renders in the same process
let browserPromise: Promise<import("puppeteer-core").Browser> | null = null;

// # Track if browser launch has ever failed — skip Puppeteer entirely
// # for the rest of this function invocation to avoid repeated timeouts
let browserFailed = false;

// # Helper: race a promise against a timeout
// # Returns the result or throws "Puppeteer timeout" if it takes too long
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Puppeteer timeout: ${label} exceeded ${ms}ms`));
    }, ms);
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); },
    );
  });
}

// # Get or launch headless Chromium
// # Wrapped in 25s timeout — Chromium binary download on Vercel cold
// # start can take 10-30s and would otherwise hang the entire request
async function getBrowser() {
  // # If browser already failed this invocation, don't retry
  if (browserFailed) throw new Error("Puppeteer previously failed — skipping");

  if (browserPromise) return browserPromise;

  browserPromise = (async () => {
    // # Production (Vercel): use @sparticuz/chromium-min for serverless
    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      const chromium = await import("@sparticuz/chromium-min");
      const puppeteer = await import("puppeteer-core");

      // # chromium-min downloads the binary on first use from the official Sparticuz release
      // # This can take 10-30s on cold start — the outer timeout catches hangs
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

  try {
    return await withTimeout(browserPromise, 25_000, "browser launch");
  } catch (err) {
    // # Reset so next call doesn't reuse a failed promise
    browserPromise = null;
    browserFailed = true;
    throw err;
  }
}

// # Render a template to PNG buffer
// # Takes a template ID (t1-t186+), content data, and target dimensions
// # Throws on failure so the caller can fall back to Canvas 2D
export async function renderTemplateHTML(
  templateId: TemplateId,
  content: TemplateContent,
  width: number,
  height: number
): Promise<Buffer> {
  // # Build the complete HTML page for this template
  const html = buildTemplateHTML(templateId, content, width, height);

  // # Launch or reuse browser — may throw on timeout/failure
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
    // # 10s timeout — pages are local HTML with no network requests
    await page.setContent(html, { waitUntil: "load", timeout: 10_000 });

    // # Screenshot the page at exact dimensions → PNG buffer
    // # 10s timeout — screenshot of a static page should be instant
    const screenshot = await withTimeout(
      page.screenshot({ type: "png", clip: { x: 0, y: 0, width, height } }),
      10_000,
      "screenshot"
    );

    return Buffer.from(screenshot);
  } finally {
    await page.close().catch(() => {});
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
