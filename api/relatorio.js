import { ExportacaoCSV, ExportacaoPDF } from "../lib/exportadores.js";
import { pedidos } from "../lib/pedidos.js";

const criadores = new Map([
  ["csv", ExportacaoCSV],
  ["pdf", ExportacaoPDF]
]);

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.statusCode = 405;
    return res.end("Use GET para gerar um relatório.");
  }

  const url = new URL(req.url, "http://localhost");
  const formato = url.searchParams.get("formato") || "pdf";
  const status = url.searchParams.get("status") || "todos";
  const Criador = criadores.get(formato);

  if (!Criador || !["todos", "pago", "pendente"].includes(status)) {
    res.statusCode = 400;
    return res.end("Formato ou status inválido.");
  }

  const selecionados = pedidos.filter(pedido => status === "todos" || pedido.status === status);
  const exportacao = new Criador();

  try {
    const arquivo = await exportacao.executar(selecionados);
    res.setHeader("Content-Type", arquivo.tipo);
    res.setHeader("Content-Disposition", 'attachment; filename="' + arquivo.nome + '"');
    res.setHeader("X-Criador", arquivo.criador);
    res.setHeader("X-Produto", arquivo.produto);
    res.setHeader("X-Pedidos", String(arquivo.quantidade));
    res.statusCode = 200;
    return res.end(arquivo.conteudo);
  } catch (erro) {
    console.error("Falha ao gerar relatório", erro);
    res.statusCode = 500;
    return res.end("Não foi possível gerar o relatório. Tente novamente.");
  }
}
