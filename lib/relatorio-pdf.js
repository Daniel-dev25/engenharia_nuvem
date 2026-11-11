import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Relatorio } from "./relatorio.js";

export class RelatorioPDF extends Relatorio {
  async gerar(pedidos) {
    const documento = await PDFDocument.create();
    const fonte = await documento.embedFont(StandardFonts.Helvetica);
    const negrito = await documento.embedFont(StandardFonts.HelveticaBold);
    documento.setTitle("CloudReports | Grupo 3");
    documento.setAuthor("Grupo 3");
    const dinheiro = centavos => (centavos / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
    let pagina;
    let y = 0;

    for (const pedido of pedidos) {
      if (y < 110) {
        pagina = documento.addPage([595.28, 841.89]);
        pagina.drawRectangle({ x: 0, y: 720, width: 596, height: 122, color: rgb(0.12, 0.10, 0.25) });
        pagina.drawText("CloudReports", { x: 42, y: 785, size: 28, font: negrito, color: rgb(1, 1, 1) });
        pagina.drawText("GRUPO 3  |  RELATORIO DE VENDAS", { x: 43, y: 754, size: 10, font: fonte, color: rgb(0.78, 0.74, 1) });
        y = 680;
      }

      pagina.drawText(pedido.id + "   " + pedido.produto, { x: 42, y, size: 12, font: negrito });
      const detalhe = pedido.quantidade + " un.  |  " + pedido.status
        + "  |  " + dinheiro(pedido.quantidade * pedido.precoCentavos);
      pagina.drawText(detalhe, { x: 42, y: y - 21, size: 10, font: fonte, color: rgb(0.35, 0.35, 0.42) });
      pagina.drawLine({ start: { x: 42, y: y - 37 }, end: { x: 552, y: y - 37 }, color: rgb(0.88, 0.87, 0.92) });
      y -= 65;
    }

    const total = pedidos.reduce((soma, pedido) => soma + pedido.quantidade * pedido.precoCentavos, 0);
    pagina.drawText("Total dos pedidos selecionados: " + dinheiro(total), { x: 42, y: y - 10, size: 13, font: negrito });
    for (const [indice, folha] of documento.getPages().entries()) {
      folha.drawText("Dados fictícios para demonstração acadêmica.  |  Página " + (indice + 1), {
        x: 42, y: 35, size: 9, font: fonte, color: rgb(0.45, 0.45, 0.5)
      });
    }

    return {
      nome: "relatorio-vendas.pdf",
      tipo: "application/pdf",
      conteudo: Buffer.from(await documento.save())
    };
  }
}
