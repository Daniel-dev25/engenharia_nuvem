import { Exportacao } from "./exportacao.js";
import { RelatorioCSV } from "./relatorio-csv.js";
import { RelatorioPDF } from "./relatorio-pdf.js";

export class ExportacaoCSV extends Exportacao {
  criarRelatorio() {
    // BREAKPOINT 2 — aqui nasce o produto CSV.
    return new RelatorioCSV();
  }
}

export class ExportacaoPDF extends Exportacao {
  criarRelatorio() {
    // BREAKPOINT 2 — aqui nasce o produto PDF.
    return new RelatorioPDF();
  }
}
