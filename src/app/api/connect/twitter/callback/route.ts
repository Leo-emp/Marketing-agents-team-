/* ============================================================
   TWITTER OAUTH CALLBACK — /api/connect/twitter/callback
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  const payload = JSON.stringify({
    type: "oauth-callback",
    platform: "twitter",
    code: code || null,
    error: error || null,
  }).replace(/</g, "\\u003c");

  const html = `<!DOCTYPE html><html><head><title>Connecting X...</title></head><body>
    <script id="oauth-data" type="application/json">${payload}</script>
    <script>
      var d = JSON.parse(document.getElementById('oauth-data').textContent);
      window.opener?.postMessage(d, window.location.origin);
      window.close();
    </script>
    <p>Connecting X... this window will close automatically.</p>
  </body></html>`;

  return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
}
