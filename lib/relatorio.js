// Produto base: todos os relatórios expõem gerar(pedidos).
// JavaScript usa este método como contrato em tempo de execução.
export class Relatorio {
  async gerar(pedidos) {
    throw new Error("Implemente gerar(pedidos) no relatório concreto.");
  }
}
