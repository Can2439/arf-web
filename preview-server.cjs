const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const args = process.argv.slice(2);
const valueAfter = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};

const host = valueAfter("--host", "0.0.0.0");
const port = Number(valueAfter("--port", process.env.PORT || "4173"));
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8",
};

const resolveRequest = (requestUrl) => {
  const pathname = decodeURIComponent(new URL(requestUrl, "http://preview.local").pathname);
  const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const requested = path.resolve(root, relative);
  if (!requested.startsWith(`${root}${path.sep}`) && requested !== root) return null;
  return requested;
};

http
  .createServer((request, response) => {
    let requested = resolveRequest(request.url);
    if (!requested) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    if (!fs.existsSync(requested) || fs.statSync(requested).isDirectory()) {
      requested = path.join(root, "404.html");
      response.statusCode = 404;
    }

    response.setHeader(
      "Content-Type",
      contentTypes[path.extname(requested).toLowerCase()] || "application/octet-stream",
    );
    response.setHeader("Cache-Control", "no-store");
    fs.createReadStream(requested).pipe(response);
  })
  .listen(port, host, () => {
    process.stdout.write(`ARF preview ready on ${host}:${port}\n`);
  });
