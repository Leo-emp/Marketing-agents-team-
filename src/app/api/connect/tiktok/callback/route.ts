/* ============================================================
   TIKTOK OAUTH CALLBACK — /api/connect/tiktok/callback
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");
  const state = req.nextUrl.searchParams.get("state");

  const payload = JSON.stringify({
    type: "oauth-callback",
    platform: "tiktok",
    code: code || null,
    error: error || null,
    state: state || null,
  }).replace(/</g, "\\u003c");

  const html = `<!DOCTYPE html><html><head><title>Connecting TikTok...</title></head><body>
    <script id="oauth-data" type="application/json">${payload}</script>
    <script>
      var d = JSON.parse(document.getElementById('oauth-data').textContent);
      window.opener?.postMessage(d, window.location.origin);
      window.close();
    </script>
    <p>Connecting TikTok... this window will close automatically.</p>
  </body></html>`;

  return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
}
