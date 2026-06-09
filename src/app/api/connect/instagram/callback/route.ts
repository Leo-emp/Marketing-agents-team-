/* ============================================================
   INSTAGRAM OAUTH CALLBACK — /api/connect/instagram/callback
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  const html = `<!DOCTYPE html><html><head><title>Connecting Instagram...</title></head><body>
    <script>
      ${error
        ? `window.opener?.postMessage({ type: "oauth-callback", platform: "instagram", error: "${error}" }, "*");`
        : `window.opener?.postMessage({ type: "oauth-callback", platform: "instagram", code: "${code}" }, "*");`
      }
      window.close();
    </script>
    <p>Connecting Instagram... this window will close automatically.</p>
  </body></html>`;

  return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
}
