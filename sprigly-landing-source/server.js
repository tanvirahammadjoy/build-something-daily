const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = Number(process.env.PORT || 3000);
const PUBLIC_DIR = path.join(__dirname, "public");
const DATA_DIR = path.join(__dirname, "data");
const WAITLIST_FILE = path.join(DATA_DIR, "waitlist.json");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".ico": "image/x-icon"
};

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function ensureStore() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(WAITLIST_FILE)) {
    fs.writeFileSync(WAITLIST_FILE, "[]\n", "utf8");
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function handleWaitlist(req, res) {
  try {
    const rawBody = await readBody(req);
    const payload = JSON.parse(rawBody || "{}");
    const name = String(payload.name || "").trim().slice(0, 80);
    const email = String(payload.email || "").trim().toLowerCase().slice(0, 120);
    const plan = String(payload.plan || "starter").trim().slice(0, 40);

    if (!name || !isEmail(email)) {
      sendJson(res, 422, {
        ok: false,
        message: "Please enter a name and a valid email."
      });
      return;
    }

    ensureStore();
    const entries = JSON.parse(fs.readFileSync(WAITLIST_FILE, "utf8"));
    const existing = entries.find((entry) => entry.email === email);

    if (!existing) {
      entries.push({
        id: crypto.randomUUID(),
        name,
        email,
        plan,
        createdAt: new Date().toISOString()
      });
      fs.writeFileSync(WAITLIST_FILE, `${JSON.stringify(entries, null, 2)}\n`, "utf8");
    }

    sendJson(res, 201, {
      ok: true,
      message: existing ? "You are already on the list." : "You are on the early access list.",
      count: entries.length
    });
  } catch (error) {
    sendJson(res, 400, {
      ok: false,
      message: "Something went wrong. Please try again."
    });
  }
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const requestedPath = path.normalize(path.join(PUBLIC_DIR, pathname));

  if (!requestedPath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(requestedPath, (error, content) => {
    if (error) {
      fs.readFile(path.join(PUBLIC_DIR, "index.html"), (fallbackError, fallback) => {
        if (fallbackError) {
          res.writeHead(404);
          res.end("Not found");
          return;
        }
        res.writeHead(200, { "Content-Type": MIME_TYPES[".html"] });
        res.end(fallback);
      });
      return;
    }

    const extension = path.extname(requestedPath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[extension] || "application/octet-stream"
    });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/api/waitlist") {
    handleWaitlist(req, res);
    return;
  }

  if (req.method === "GET") {
    serveStatic(req, res);
    return;
  }

  sendJson(res, 405, {
    ok: false,
    message: "Method not allowed"
  });
});

server.listen(PORT, () => {
  ensureStore();
  console.log(`Sprigly landing page running at http://localhost:${PORT}`);
});
