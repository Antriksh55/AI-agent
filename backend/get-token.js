/**
 * get-token.js
 *
 * Opens AI Studio in browser, intercepts the Gemini API token,
 * saves it to .env automatically.
 *
 * Run: node get-token.js
 * Then refresh the .env and restart server: node server.js
 */

const http = require("http");
const fs   = require("fs");
const path = require("path");

const ENV_PATH = path.join(__dirname, ".env");
const PORT = 9999;

const HTML = `<!DOCTYPE html>
<html>
<head><title>NovaTech Token Helper</title>
<style>
  body{font-family:sans-serif;max-width:600px;margin:40px auto;padding:20px;background:#0f172a;color:#e2e8f0}
  h2{color:#6366f1}
  input{width:100%;padding:10px;margin:10px 0;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#fff;font-size:14px}
  button{background:#6366f1;color:#fff;border:none;padding:12px 24px;border-radius:8px;font-size:16px;cursor:pointer;width:100%}
  .ok{background:#0f172a;border:2px solid #10b981;padding:16px;border-radius:8px;margin-top:20px;display:none}
  .steps{background:#1e293b;padding:16px;border-radius:8px;margin:16px 0;font-size:13px;line-height:1.8}
  code{background:#0f172a;padding:2px 6px;border-radius:4px;font-family:monospace}
</style>
</head>
<body>
<h2>🔑 NovaTech – Gemini Token Setup</h2>

<div class="steps">
  <strong>Step 1:</strong> Open <a href="https://aistudio.google.com" target="_blank" style="color:#6366f1">aistudio.google.com</a> in a new tab<br>
  <strong>Step 2:</strong> Open DevTools → F12 → Network tab<br>
  <strong>Step 3:</strong> Type any message in AI Studio's chat<br>
  <strong>Step 4:</strong> In Network tab, find a request to <code>generativelanguage.googleapis.com</code><br>
  <strong>Step 5:</strong> Click that request → Headers → find <code>authorization: Bearer AQ.xxx</code><br>
  <strong>Step 6:</strong> Copy the full <code>AQ.xxx...</code> value and paste below
</div>

<input type="text" id="token" placeholder="Paste AQ.xxx... token here" />
<button onclick="save()">Save Token & Start Backend</button>
<div class="ok" id="ok">✅ Token saved! Go back to terminal — backend will start automatically.</div>

<script>
async function save() {
  const token = document.getElementById('token').value.trim();
  if (!token) { alert('Please paste the token first'); return; }
  const res = await fetch('/save', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({token})
  });
  if (res.ok) {
    document.getElementById('ok').style.display='block';
    document.querySelector('button').disabled=true;
  }
}
</script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(HTML);
  } else if (req.method === "POST" && req.url === "/save") {
    let body = "";
    req.on("data", c => body += c);
    req.on("end", () => {
      try {
        const { token } = JSON.parse(body);
        if (!token || token.length < 20) {
          res.writeHead(400); res.end("Invalid token"); return;
        }

        // Read existing .env
        let env = "";
        if (fs.existsSync(ENV_PATH)) env = fs.readFileSync(ENV_PATH, "utf8");

        // Replace or add GEMINI_API_KEY
        if (env.includes("GEMINI_API_KEY=")) {
          env = env.replace(/GEMINI_API_KEY=.*/,  `GEMINI_API_KEY=${token}`);
        } else {
          env += `\nGEMINI_API_KEY=${token}\n`;
        }

        fs.writeFileSync(ENV_PATH, env);
        console.log("\n✅ Token saved to .env");
        console.log("   Restart the backend: node server.js\n");

        res.writeHead(200); res.end("ok");
        setTimeout(() => { server.close(); process.exit(0); }, 1000);
      } catch (e) {
        res.writeHead(500); res.end(e.message);
      }
    });
  } else {
    res.writeHead(404); res.end("not found");
  }
});

server.listen(PORT, () => {
  console.log("\n🔑 NovaTech Token Helper");
  console.log("─".repeat(40));
  console.log(`Open in browser: http://localhost:${PORT}`);
  console.log("Follow the steps shown in the page\n");
  // Try to open browser
  const { exec } = require("child_process");
  exec(`start http://localhost:${PORT}`);
});
