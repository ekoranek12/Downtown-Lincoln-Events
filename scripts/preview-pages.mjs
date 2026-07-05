import { createReadStream, existsSync, statSync } from "node:fs";
import { mkdirSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import http from "node:http";

const basePath = "/Downtown-Lincoln-Events";
const distDir = normalize(join(process.cwd(), "dist"));
const publicDir = normalize(join(process.cwd(), "public"));
const port = Number(process.env.PORT || "4321");

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
};

mkdirSync(distDir, { recursive: true });

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
  const pathname = requestUrl.pathname;

  if (pathname === "/") {
    response.writeHead(302, { Location: `${basePath}/` });
    response.end();
    return;
  }

  if (!pathname.startsWith(basePath) && !pathname.startsWith("/favicon")) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  const relativePath = pathname.startsWith(basePath)
    ? pathname.slice(basePath.length) || "/"
    : pathname;
  const safePath = relativePath.replace(/^\/+/, "");
  const candidatePaths = [];

  if (pathname.startsWith("/favicon")) {
    candidatePaths.push(join(publicDir, pathname.replace(/^\/+/, "")));
  } else {
    candidatePaths.push(join(distDir, safePath));

    if (relativePath.endsWith("/")) {
      candidatePaths.push(join(distDir, safePath, "index.html"));
    } else {
      candidatePaths.push(join(distDir, `${safePath}.html`));
      candidatePaths.push(join(distDir, safePath, "index.html"));
    }
  }

  const filePath = candidatePaths.find((path) => existsSync(path) && statSync(path).isFile());

  if (!filePath) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  const contentType = contentTypes[extname(filePath)] || "application/octet-stream";
  response.writeHead(200, { "content-type": contentType });
  createReadStream(filePath).pipe(response);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Pages preview running at http://127.0.0.1:${port}${basePath}/`);
});
