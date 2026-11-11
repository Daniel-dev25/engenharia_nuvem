import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { parseArgs } from "node:util";
import handler from "../api/relatorio.js";

const raiz = resolve(import.meta.dirname, "../public");
const tipos = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".zip": "application/zip"
};

const servidor = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname === "/api/relatorio") {
      return await handler(req, res);
    }
    if (!["GET", "HEAD"].includes(req.method)) {
      res.writeHead(405, { Allow: "GET, HEAD" });
      return res.end();
    }
    const caminho = resolve(raiz, "." + decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname));
    if (!caminho.startsWith(raiz + sep)) {
      res.writeHead(403);
      return res.end("Acesso negado.");
    }
    const arquivo = await readFile(caminho);
    res.writeHead(200, { "Content-Type": tipos[extname(caminho)] || "application/octet-stream" });
    res.end(req.method === "HEAD" ? undefined : arquivo);
  } catch (erro) {
    res.writeHead(erro.code === "ENOENT" || erro.code === "EISDIR" ? 404 : 500);
    res.end("Arquivo indisponível.");
  }
});

const { values } = parseArgs({
  options: {
    port: { type: "string" },
    host: { type: "string", default: "127.0.0.1" },
    strictPort: { type: "boolean" }
  }
});
const porta = Number(values.port || process.env.PORT || 3000);
servidor.listen(porta, values.host, () => {
  console.log("Grupo 3 disponível em http://localhost:" + porta);
});
