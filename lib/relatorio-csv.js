import { Relatorio } from "./relatorio.js";

export class RelatorioCSV extends Relatorio {
  async gerar(pedidos) {
    const cabecalho = ["Pedido", "Produto", "Quantidade", "Total (R$)", "Status"];
    const linhas = pedidos.map(pedido => [
      pedido.id,
      pedido.produto,
      pedido.quantidade,
      (pedido.quantidade * pedido.precoCentavos / 100).toFixed(2).replace(".", ","),
      pedido.status
    ]);

    // Aspas duplicadas preservam vírgulas, separadores e quebras de linha.
    const csv = [cabecalho, ...linhas]
      .map(linha => linha.map(valor => '"' + String(valor).replaceAll('"', '""') + '"').join(";"))
      .join("\r\n");

    return {
      nome: "relatorio-vendas.csv",
      tipo: "text/csv; charset=utf-8",
      conteudo: Buffer.from("\uFEFF" + csv, "utf8")
    };
  }
}
