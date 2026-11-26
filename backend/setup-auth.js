/**
 * One-time Google OAuth2 setup for Gemini API access.
 *
 * Run this ONCE:   node setup-auth.js
 *
 * What it does:
 *  1. Opens your browser to a Google sign-in page
 *  2. You sign in and grant permission
 *  3. Saves refresh token to data/google-credentials.json
 *  4. The main app uses this forever — auto-refreshes every hour
 *
 * You NEVER need to run this again unless you delete the credentials file.
 */

require("dotenv").config();

const { OAuth2Client } = require("google-auth-library");
const http   = require("http");
const url    = require("url");
const open   = require("open").default;
const fs     = require("fs");
const path   = require("path");

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, CREDENTIALS_PATH, SCOPES } = require("./services/aiService");

const REDIRECT_PORT = 3456;
const REDIRECT_URI  = `http://localhost:${REDIRECT_PORT}/oauth2callback`;

async function main() {
  console.log("\n🔐 NovaTech Gemini Auth Setup");
  console.log("─".repeat(40));

  const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URI);

  const authUrl = client.generateAuthUrl({
    access_type:  "offline",
    scope:        SCOPES,
    prompt:       "consent",   // forces refresh_token to be returned
  });

  console.log("\n1. Opening browser for Google sign-in...");
  console.log("   If browser doesn't open, go to:\n  ", authUrl, "\n");

  // Open browser
  try { await open(authUrl); } catch { /* ignore if open fails */ }

  // Start local server to catch the callback
  const code = await new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const qs = url.parse(req.url, true).query;
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`<html><body style="font-family:sans-serif;padding:40px">
        <h2 style="color:#10b981">✅ Authentication successful!</h2>
        <p>You can close this tab and return to your terminal.</p>
      </body></html>`);
      server.close();
      if (qs.code) resolve(qs.code);
      else reject(new Error("No code in callback: " + req.url));
    });
    server.listen(REDIRECT_PORT, () => {
      console.log(`2. Waiting for Google sign-in on port ${REDIRECT_PORT}...`);
    });
    server.on("error", reject);
    // Timeout after 5 minutes
    setTimeout(() => { server.close(); reject(new Error("Timeout waiting for auth")); }, 300000);
  });

  console.log("\n3. Exchanging code for tokens...");
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  // Save
  fs.mkdirSync(path.dirname(CREDENTIALS_PATH), { recursive: true });
  fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(tokens, null, 2));

  console.log("\n✅ Done! Credentials saved to:", CREDENTIALS_PATH);
  console.log("   Token type:", tokens.refresh_token ? "Full OAuth2 (auto-refreshes forever)" : "Access token only");

  if (!tokens.refresh_token) {
    console.warn("\n⚠️  No refresh_token received.");
    console.warn("   This can happen if you already authorized this app before.");
    console.warn("   Fix: Go to https://myaccount.google.com/permissions, revoke access");
    console.warn("   to this app, then run setup-auth.js again.");
  } else {
    console.log("\n🎉 You're all set! Restart the backend:");
    console.log("   node server.js");
    console.log("\n   Gemini will work automatically and tokens refresh every hour.");
  }
  process.exit(0);
}

main().catch((err) => {
  console.error("\n❌ Setup failed:", err.message);
  process.exit(1);
});
