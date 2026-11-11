# Grupo 3 — Factory Method com CloudReports

Guia de estudo e aplicação de exportação de pedidos fictícios em CSV e PDF.

## Executar

Instale Node.js 24 e abra a pasta extraída no VS Code.

```bash
npm install
npm run dev
```

Abra http://localhost:3000. O site inclui o guia, a demonstração, o UML, o código e o roteiro para cinco integrantes.

## Depurar no VS Code

1. Se o servidor estiver rodando no terminal, encerre com Ctrl+C.
2. Coloque breakpoints nos comentários BREAKPOINT de lib/exportacao.js e lib/exportadores.js.
3. Pressione F5 e selecione “Grupo 3 — depurar Factory Method”.
4. Abra http://localhost:3000/#laboratorio.
5. Selecione PDF e clique em Gerar relatório.
6. Use F11 (Step Into) em this.criarRelatorio(). Inspecione this no criador concreto.
7. Use Shift+F11 (Step Out) para voltar. Após a atribuição, inspecione relatorio.
8. Na chamada gerar(), entre novamente ou use F10 (Step Over). F5 continua até concluir a resposta.
9. Repita com CSV. Observe os tipos concretos e a pilha de chamadas.

O VS Code precisa estar pausado em uma linha executável para mostrar a instância. A geração fica aguardando enquanto um breakpoint estiver ativo. O site permite baixar novamente o resultado após a execução.

## Estrutura

- api/relatorio.js recebe a requisição e escolhe a subclasse do criador.
- lib/exportacao.js contém o fluxo comum e o método fábrica.
- lib/exportadores.js sobrescreve o método fábrica nos criadores concretos.
- lib/relatorio.js define o contrato em tempo de execução.
- lib/relatorio-csv.js e lib/relatorio-pdf.js implementam os produtos.
- lib/pedidos.js contém os dados fictícios.
- public/ contém o site explicativo.
- dev/server.js executa a mesma API localmente.
- scripts/build.js prepara os trechos do código e o ZIP disponível no site.

## Vercel

Importe esta pasta como projeto através de um repositório Git ou use a Vercel CLI.
Framework Other, comando de build npm run build e diretório de saída public.
A configuração está em vercel.json. A API é uma Vercel Function Node.js.

```bash
npx vercel
npx vercel --prod
```

O primeiro comando permite configurar e conferir uma prévia. O segundo publica em produção.
As credenciais são gerenciadas pelo fluxo de autenticação da Vercel.

## Aula

20 minutos de apresentação, distribuídos em cinco blocos de quatro minutos.
Ao final, 5 minutos exclusivos para arguição.
Os nomes dos cinco integrantes podem ser ajustados em public/app.js.

## Extensão sugerida

Para adicionar JSON, implemente RelatorioJSON e ExportacaoJSON, registre a subclasse em api/relatorio.js e disponibilize o novo formato na interface. O fluxo base executar() pode ser reutilizado.

## Referências

- https://refactoring.guru/pt-br/design-patterns/factory-method
- https://vercel.com/docs/functions/runtimes/node-js
- https://code.visualstudio.com/docs/nodejs/nodejs-debugging
- https://pdf-lib.js.org/
