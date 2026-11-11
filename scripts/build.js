import { readFile, writeFile, readdir } from "node:fs/promises";
import { resolve, relative } from "node:path";
import JSZip from "jszip";
import { pedidos } from "../lib/pedidos.js";

const raiz = resolve(import.meta.dirname, "..");
const arquivosCodigo = [
  "lib/exportacao.js",
  "lib/exportadores.js",
  "lib/relatorio.js",
  "lib/relatorio-csv.js",
  "lib/relatorio-pdf.js",
  "api/relatorio.js"
];
const codigo = {};
for (const caminho of arquivosCodigo) {
  codigo[caminho] = await readFile(resolve(raiz, caminho), "utf8");
}
await writeFile(resolve(raiz, "public/codigo.json"), JSON.stringify(codigo));
await writeFile(resolve(raiz, "public/pedidos.json"), JSON.stringify(pedidos));

const zip = new JSZip();
const ignorados = new Set(["codigo.json", "pedidos.json", "projeto-grupo3.zip"]);
async function adicionarPasta(pasta) {
  for (const item of await readdir(resolve(raiz, pasta), { withFileTypes: true })) {
    if (ignorados.has(item.name)) continue;
    const caminho = resolve(raiz, pasta, item.name);
    if (item.isDirectory()) {
      await adicionarPasta(relative(raiz, caminho));
    } else {
      zip.file(relative(raiz, caminho).replaceAll("\\", "/"), await readFile(caminho));
    }
  }
}
for (const pasta of ["api", "lib", "dev", "scripts", "public", ".vscode"]) {
  await adicionarPasta(pasta);
}
for (const caminho of ["package.json", "package-lock.json", "vercel.json", "README.md", ".gitignore"]) {
  zip.file(caminho, await readFile(resolve(raiz, caminho)));
}
await writeFile(resolve(raiz, "public/projeto-grupo3.zip"), await zip.generateAsync({
  type: "nodebuffer",
  compression: "DEFLATE"
}));
console.log("Guia, código e projeto para download preparados.");
