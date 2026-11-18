// PowerPins cloud server — zero dependencies, needs only Node.js >= 18
//
// What it does:
//   POST /api/report   ESP32 gateway sends { "c": "M", "v": 41.2 }  (Bearer auth)
//   GET  /api/state    dashboard reads the latest values            (Bearer auth)
//   GET  /             serves ../app/index.html (the mobile web app)
//
// Run on your VPS:
//   API_KEY=pick-a-long-random-string PORT=8080 node server.js
//   (run it under systemd / pm2 / screen to keep it alive)
//
// Codes (same as the Uno sends over serial):
//   M = moisture %      P = pump state 1/0
//   S = watering started W = warning still dry
//
// Env:  PORT (default 8080)   API_KEY (default "change-me")
// State persists to state.json next to this file.

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = parseInt(process.env.PORT || "8080", 10);
const API_KEY = process.env.API_KEY || "change-me";
const STATE_FILE = path.join(__dirname, "state.json");
const APP_DIR = path.join(__dirname, "..", "app");

// { moisture, moistureAt, pumpOn, pumpAt, warning, warningAt, lastEventAt }
let state = {};
try {
  state = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
} catch (_) { /* first run */ }

const HISTORY_MAX = 288; // ~24 h at one point per 5 min
let history = state.history || [];

function save() {
  state.history = history;
  fs.writeFile(STATE_FILE, JSON.stringify(state), () => {});
}

function applyEvent(code, value) {
  const now = new Date().toISOString();
  state.lastEventAt = now;
  if (code === "M") {
    state.moisture = value;
    state.moistureAt = now;
    history.push({ t: now, v: value });
    if (history.length > HISTORY_MAX) history.shift();
    state.warning = ""; // fresh reading clears the warning banner
  } else if (code === "P") {
    state.pumpOn = value == 1;
    state.pumpAt = now;
  } else if (code === "S") {
    state.lastWatering = now;
  } else if (code === "W") {
    state.warning = "Still dry after max bursts";
    state.warningAt = now;
  } else {
    return false; // unknown code
  }
  save();
  return true;
}

function authed(req) {
  return req.headers.authorization === `Bearer ${API_KEY}`;
}

function send(res, code, body, headers = {}) {
  res.writeHead(code, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, content-type",
    ...headers,
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://x");

  if (req.method === "OPTIONS") return send(res, 204, "");

  if (url.pathname === "/api/report" && req.method === "POST") {
    if (!authed(req)) return send(res, 401, "bad key");
    let body = "";
    req.on("data", (c) => {
      body += c;
      if (body.length > 1024) req.destroy(); // never trust input size
    });
    req.on("end", () => {
      try {
        const { c, v } = JSON.parse(body);
        if (typeof c !== "string" || typeof v !== "number") throw 0;
        if (!applyEvent(c, v)) return send(res, 400, "unknown code");
        console.log(new Date().toISOString(), c, v);
        send(res, 200, "ok");
      } catch (_) {
        send(res, 400, "bad json");
      }
    });
    return;
  }

  if (url.pathname === "/api/state" && req.method === "GET") {
    if (!authed(req)) return send(res, 401, "bad key");
    return send(res, 200, JSON.stringify({ ...state, history }), {
      "Content-Type": "application/json",
    });
  }

  if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
    const file = path.join(APP_DIR, "index.html");
    return fs.readFile(file, (err, data) => {
      if (err) return send(res, 404, "app/index.html not found");
      send(res, 200, data, { "Content-Type": "text/html; charset=utf-8" });
    });
  }

  send(res, 404, "not found");
});

server.listen(PORT, () => {
  console.log(`PowerPins server on http://0.0.0.0:${PORT}`);
  if (API_KEY === "change-me") console.log("WARNING: set API_KEY");
});
