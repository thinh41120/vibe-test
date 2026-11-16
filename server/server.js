"use strict";
/*
 * Server tĩnh nhỏ cho game Đập chuột — chỉ dùng module có sẵn của Node.
 *   /            → thư mục app/      (index.html, style.css, game.js)
 *   /design/...  → thư mục design/   (tokens.css mà game nạp qua ../design/tokens.css)
 *   /healthz     → "ok" (cho Docker HEALTHCHECK)
 */
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const ROOT = path.resolve(__dirname, "..");
const APP_DIR = path.resolve(process.env.APP_DIR || path.join(ROOT, "app"));
const DESIGN_DIR = path.resolve(process.env.DESIGN_DIR || path.join(ROOT, "design"));

const MOUNTS = [
  { prefix: "/design/", dir: DESIGN_DIR },
  { prefix: "/", dir: APP_DIR },
];

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "X-Content-Type-Options": "nosniff",
    ...headers,
  });
  res.end(res.req.method === "HEAD" ? undefined : body);
}

/* Đổi URL thành đường dẫn file; trả null nếu không hợp lệ hoặc ra ngoài thư mục gốc. */
function resolveFile(urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch (_) {
    return null;
  }
  if (decoded.includes("\0")) return null;
  const mount = MOUNTS.find((m) => decoded.startsWith(m.prefix));
  let rel = decoded.slice(mount.prefix.length);
  if (rel === "" || rel.endsWith("/")) rel += "index.html";
  const file = path.resolve(mount.dir, rel);
  if (file !== mount.dir && !file.startsWith(mount.dir + path.sep)) return null;
  // Không phục vụ file ẩn (.env, .git...)
  if (path.relative(mount.dir, file).split(path.sep).some((p) => p.startsWith("."))) return null;
  return file;
}

function handler(req, res) {
  const started = Date.now();
  res.on("finish", () => {
    console.log(`${req.method} ${req.url} ${res.statusCode} ${Date.now() - started}ms`);
  });

  if (req.method !== "GET" && req.method !== "HEAD") {
    return send(res, 405, "Method Not Allowed\n", { Allow: "GET, HEAD" });
  }

  const urlPath = (req.url || "/").split("?")[0].split("#")[0];
  if (urlPath === "/healthz") return send(res, 200, "ok\n", { "Cache-Control": "no-store" });

  const file = resolveFile(urlPath);
  if (!file) return send(res, 400, "Bad Request\n");

  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) {
      // /design → /design/ ; thư mục khác → thử index.html bằng redirect có dấu /
      if (!err && stat.isDirectory()) {
        return send(res, 301, "Moved\n", { Location: urlPath + "/" });
      }
      return send(res, 404, "Not Found\n");
    }

    const lastModified = stat.mtime.toUTCString();
    const ims = req.headers["if-modified-since"];
    if (ims && Math.floor(stat.mtimeMs / 1000) <= Math.floor(Date.parse(ims) / 1000)) {
      res.writeHead(304, { "Last-Modified": lastModified, "Cache-Control": "no-cache" });
      return res.end();
    }

    res.writeHead(200, {
      "Content-Type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream",
      "Content-Length": stat.size,
      "Last-Modified": lastModified,
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
    });
    if (req.method === "HEAD") return res.end();
    fs.createReadStream(file)
      .on("error", () => res.destroy())
      .pipe(res);
  });
}

const server = http.createServer(handler);
server.listen(PORT, HOST, () => {
  console.log(`Đập chuột đang chạy tại http://localhost:${PORT} (app: ${APP_DIR}, design: ${DESIGN_DIR})`);
});

// Dừng gọn khi Docker gửi SIGTERM/SIGINT
for (const sig of ["SIGTERM", "SIGINT"]) {
  process.on(sig, () => {
    console.log(`Nhận ${sig}, đang dừng server...`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 5000).unref();
  });
}
