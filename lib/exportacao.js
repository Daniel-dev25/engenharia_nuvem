export class Exportacao {
  async executar(pedidos) {
    if (!Array.isArray(pedidos) || pedidos.length === 0) {
      throw new Error("Selecione pelo menos um pedido para exportar.");
    }

    // BREAKPOINT 1 — entre com F11 para observar o despacho polimórfico.
    const relatorio = this.criarRelatorio();

    // BREAKPOINT 3 — inspecione relatorio e avance para gerar().
    const arquivo = await relatorio.gerar(pedidos);

    return {
      ...arquivo,
      criador: this.constructor.name,
      produto: relatorio.constructor.name,
      quantidade: pedidos.length
    };
  }

  criarRelatorio() {
    throw new Error("Implemente criarRelatorio() no criador concreto.");
  }
}
