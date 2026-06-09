/* ============================================================
   LINKEDIN OAUTH CALLBACK — /api/connect/linkedin/callback
   ============================================================
   GET: LinkedIn redirects here after user approves. Renders a
   small page that sends the code back to the dashboard via
   postMessage, then the dashboard exchanges it for a token.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  // # Return a small HTML page that posts the code back to the opener window
  const html = `<!DOCTYPE html><html><head><title>Connecting LinkedIn...</title></head><body>
    <script>
      ${error
        ? `window.opener?.postMessage({ type: "oauth-callback", platform: "linkedin", error: "${error}" }, "*");`
        : `window.opener?.postMessage({ type: "oauth-callback", platform: "linkedin", code: "${code}" }, "*");`
      }
      window.close();
    </script>
    <p>Connecting LinkedIn... this window will close automatically.</p>
  </body></html>`;

  return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
}
