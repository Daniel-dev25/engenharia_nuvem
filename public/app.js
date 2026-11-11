const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));

const menuToggle = $("#menu-toggle");
menuToggle.addEventListener("click", () => {
  const aberto = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!aberto));
  $(".sidebar").classList.toggle("open", !aberto);
});
$$("nav a").forEach(link => link.addEventListener("click", () => {
  $(".sidebar").classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
}));

const navLinks = $$("nav a");
const observer = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    navLinks.forEach(link => {
      const ativo = link.hash === "#" + entry.target.id;
      link.classList.toggle("active", ativo);
      if (ativo) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }
}, { rootMargin: "-10% 0px -70% 0px" });
$$("section.section").forEach(secao => observer.observe(secao));

let toastTimer;
function avisar(mensagem) {
  const toast = $("#toast");
  toast.textContent = mensagem;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 3500);
}
$$("[data-copy]").forEach(botao => botao.addEventListener("click", async () => {
  const texto = document.getElementById(botao.dataset.copy).textContent;
  try {
    await navigator.clipboard.writeText(texto);
    avisar("Copiado. Cole no seu editor ou terminal.");
  } catch {
    avisar("Selecione o texto e use Ctrl+C para copiar.");
  }
}));

function prepararTecladoAbas(botoes) {
  botoes.forEach((botao, indice) => {
    botao.addEventListener("keydown", evento => {
      const direcoes = { ArrowRight: 1, ArrowLeft: -1 };
      let destino;
      if (evento.key in direcoes) destino = (indice + direcoes[evento.key] + botoes.length) % botoes.length;
      if (evento.key === "Home") destino = 0;
      if (evento.key === "End") destino = botoes.length - 1;
      if (destino === undefined) return;
      evento.preventDefault();
      botoes[destino].click();
      botoes[destino].focus();
    });
  });
}
function selecionarAba(botoes, selecionado, painel) {
  botoes.forEach(botao => {
    const ativo = botao === selecionado;
    botao.setAttribute("aria-selected", String(ativo));
    botao.tabIndex = ativo ? 0 : -1;
  });
  painel.setAttribute("aria-labelledby", selecionado.id);
}

const abasCodigo = $$("[data-file]");
prepararTecladoAbas(abasCodigo);
let codigo = {};
let arquivoSelecionado = "lib/exportacao.js";
function mostrarCodigo(botao) {
  arquivoSelecionado = botao.dataset.file;
  selecionarAba(abasCodigo, botao, $("#code-panel"));
  $("#code-path").textContent = arquivoSelecionado;
  $("#code-content").textContent = codigo[arquivoSelecionado] || "Carregando o código…";
  $("#code-panel pre").scrollTo(0, 0);
}
abasCodigo.forEach(botao => botao.addEventListener("click", () => mostrarCodigo(botao)));
fetch("/codigo.json")
  .then(resposta => {
    if (!resposta.ok) throw new Error("Código indisponível.");
    return resposta.json();
  })
  .then(dados => {
    codigo = dados;
    $("#code-content").textContent = codigo[arquivoSelecionado];
  })
  .catch(() => {
    $("#code-content").textContent = "Não foi possível carregar os trechos. Baixe o projeto completo para abrir o código no IDE.";
  });

let pedidos = [];
let resultadoUrl;
const dinheiro = centavos => (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
function atualizarPedidos() {
  const status = $("#filtro").value;
  const selecionados = pedidos.filter(pedido => status === "todos" || pedido.status === status);
  const corpo = $("#pedidos");
  corpo.replaceChildren();
  selecionados.forEach(pedido => {
    const linha = document.createElement("tr");
    const valores = [pedido.id, pedido.produto, pedido.quantidade, dinheiro(pedido.precoCentavos * pedido.quantidade)];
    valores.forEach(valor => {
      const celula = document.createElement("td");
      celula.textContent = valor;
      linha.append(celula);
    });
    const celulaStatus = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = "status-badge " + pedido.status;
    badge.textContent = pedido.status === "pago" ? "Pago" : "Pendente";
    celulaStatus.append(badge);
    linha.append(celulaStatus);
    corpo.append(linha);
  });
  $("#quantidade").textContent = selecionados.length;
  $("#valor-total").textContent = dinheiro(selecionados.reduce((total, pedido) => total + pedido.precoCentavos * pedido.quantidade, 0));
}
$("#filtro").addEventListener("change", atualizarPedidos);
fetch("/pedidos.json")
  .then(resposta => {
    if (!resposta.ok) throw new Error("Pedidos indisponíveis.");
    return resposta.json();
  })
  .then(dados => {
    pedidos = dados;
    atualizarPedidos();
    $("#gerar").disabled = false;
  })
  .catch(() => {
    $("#pedidos").replaceChildren();
    const linha = document.createElement("tr");
    const celula = document.createElement("td");
    celula.colSpan = 5;
    celula.textContent = "Falha ao carregar os pedidos. Atualize a página para tentar novamente.";
    linha.append(celula);
    $("#pedidos").append(linha);
  });

$("#gerar").addEventListener("click", async () => {
  const botao = $("#gerar");
  const filtro = $("#filtro");
  const radios = $$('input[name="formato"]');
  const formato = $('input[name="formato"]:checked').value;
  const status = filtro.value;
  const statusNome = filtro.selectedOptions[0].textContent.toLowerCase();
  botao.disabled = true;
  filtro.disabled = true;
  radios.forEach(radio => { radio.disabled = true; });
  botao.textContent = "Gerando…";
  $(".execution").classList.remove("error");
  $("#execution-message").textContent = "Aguardando a API. Durante a depuração, continue a execução no VS Code para receber o arquivo.";
  $("#execution-trace").hidden = true;
  $("#download-result").hidden = true;

  try {
    const parametros = new URLSearchParams({ formato, status });
    const resposta = await fetch("/api/relatorio?" + parametros);
    if (!resposta.ok) throw new Error(await resposta.text());
    const arquivo = await resposta.blob();
    if (resultadoUrl) URL.revokeObjectURL(resultadoUrl);
    resultadoUrl = URL.createObjectURL(arquivo);
    const download = $("#download-result");
    download.href = resultadoUrl;
    download.download = "relatorio-vendas." + formato;
    download.hidden = false;
    download.click();
    $("#execution-message").textContent = formato.toUpperCase() + " gerado com "
      + resposta.headers.get("X-Pedidos") + " pedidos (" + statusNome + "). O download está pronto.";
    $("#trace-creator").textContent = resposta.headers.get("X-Criador");
    $("#trace-product").textContent = resposta.headers.get("X-Produto");
    $("#execution-trace").hidden = false;
  } catch (erro) {
    $(".execution").classList.add("error");
    $("#execution-message").textContent = "Falha na geração. " + erro.message;
  } finally {
    botao.disabled = false;
    filtro.disabled = false;
    radios.forEach(radio => { radio.disabled = false; });
    botao.textContent = "Gerar relatório ↓";
  }
});

const falas = [
  {
    titulo: "O problema e a primeira exportação",
    fala: [
      "Nossa aplicação representa uma loja que precisa compartilhar seus pedidos. A equipe que trabalha com planilhas quer receber CSV. Já a gestão precisa de um PDF pronto para leitura. Os dados são os mesmos, mas a forma de gerar cada arquivo muda.",
      "Vamos filtrar os pedidos pagos e gerar um PDF. Esse resultado vem de uma API executada em Node.js. Ao longo da apresentação, vamos abrir o código e acompanhar a criação do objeto que produz esse arquivo."
    ],
    acoes: ["00–01 min · Apresentar o cenário e a necessidade dos dois formatos.", "01–03 min · Abrir o laboratório, filtrar pagos, gerar PDF e mostrar o arquivo.", "03–04 min · Identificar no resultado o criador e o produto utilizados."],
    passagem: "Agora vamos relacionar essa execução ao diagrama e encontrar as classes no projeto."
  },
  {
    titulo: "O diagrama e os quatro papéis",
    fala: [
      "O criador base é Exportacao. Ele possui o fluxo executar(), que valida os dados e chama criarRelatorio(). As subclasses ExportacaoCSV e ExportacaoPDF sobrescrevem esse método para escolher qual relatório criar.",
      "Do outro lado do diagrama, Relatorio define o contrato gerar(pedidos). RelatorioCSV e RelatorioPDF implementam esse contrato. O triângulo mostra a herança. As setas tracejadas mostram dependências de uso e criação."
    ],
    acoes: ["04–05 min · Explicar o método fábrica e o contrato do produto.", "05–07 min · Percorrer as duas linhas do UML e localizar as classes no IDE.", "07–08 min · Apontar o método criarRelatorio() na base e nas subclasses."],
    passagem: "Vamos parar nessa chamada e observar qual implementação é executada."
  },
  {
    titulo: "A criação do PDF no debugger",
    fala: [
      "Colocamos o breakpoint na linha em que o fluxo chama this.criarRelatorio(). Vou gerar um PDF na tela. Aqui, this é uma instância de ExportacaoPDF e pedidos contém os registros selecionados.",
      "Ao entrar na chamada, chegamos à implementação de ExportacaoPDF. Ela executa new RelatorioPDF(). Retornando ao fluxo, a variável relatorio passa a referenciar essa instância. Na pilha de chamadas vemos de onde essa execução veio."
    ],
    acoes: ["08–09 min · Iniciar com F5 e gerar PDF pelo site local.", "09–11 min · Usar F11, inspecionar this, pedidos e a pilha de chamadas.", "11–12 min · Retornar, mostrar relatorio e continuar até baixar o PDF."],
    passagem: "Vamos repetir com CSV para observar a mudança do produto criado."
  },
  {
    titulo: "A criação do CSV e o contrato comum",
    fala: [
      "Com os mesmos pedidos, agora escolho CSV. A API instancia ExportacaoCSV. Quando o fluxo chama criarRelatorio(), entramos na versão que retorna um RelatorioCSV.",
      "Os dois produtos expõem gerar(pedidos), por isso o fluxo base consegue trabalhar com ambos. O CSV organiza colunas e linhas. O PDF desenha um documento. Vamos abrir os dois arquivos e conferir que correspondem à mesma seleção."
    ],
    acoes: ["12–13 min · Manter o filtro e mudar o formato para CSV.", "13–15 min · Depurar a criação, inspecionar relatorio e entrar em gerar().", "15–16 min · Concluir a execução e comparar os dados dos arquivos."],
    passagem: "Para fechar, vamos situar a API na nuvem e pensar em um terceiro formato."
  },
  {
    titulo: "Arquitetura, evolução e fechamento",
    fala: [
      "O navegador envia o formato e o filtro para a API. Na publicação, essa API roda como uma função Node.js na Vercel. É dentro dela que aplicamos o Factory Method. O resultado volta na resposta HTTP como um arquivo.",
      "Para acrescentar JSON, implementaríamos RelatorioJSON e ExportacaoJSON, registraríamos o criador na API e incluiríamos o formato na tela. O fluxo base pode ser reaproveitado. Essa flexibilidade vem com um custo, pois mantemos mais classes. A escolha depende das necessidades de evolução do sistema."
    ],
    acoes: ["16–17 min · Percorrer a arquitetura e localizar api/relatorio.js no IDE.", "17–19 min · Mostrar onde registrar JSON e quais classes seriam acrescentadas.", "19–20 min · Explicar o benefício, o custo e abrir a arguição."],
    passagem: "Encerramos a demonstração. Agora temos cinco minutos para as perguntas."
  }
];
const abasFalas = $$("[data-speaker]");
prepararTecladoAbas(abasFalas);
function mostrarFala(botao) {
  const fala = falas[Number(botao.dataset.speaker)];
  selecionarAba(abasFalas, botao, $("#speaker-panel"));
  // Conteúdo editorial fixo, definido neste arquivo.
  $("#speaker-panel").innerHTML = "<h3>" + fala.titulo + "</h3><div class='speaker-content'><div class='speech'>"
    + fala.fala.map(paragrafo => "<p>“" + paragrafo + "”</p>").join("")
    + "</div><div class='speaker-actions'><span class='tiny-number'>O QUE FAZER NA TELA</span><ol>"
    + fala.acoes.map(acao => "<li>" + acao + "</li>").join("")
    + "</ol></div></div><p class='handoff'><strong>Passagem para o próximo momento</strong>“" + fala.passagem + "”</p>";
}
abasFalas.forEach(botao => botao.addEventListener("click", () => mostrarFala(botao)));
mostrarFala(abasFalas[0]);

const checks = $$("[data-check]");
function atualizarChecklist() {
  $("#check-count").textContent = checks.filter(check => check.checked).length + " de 6 concluídos";
}
checks.forEach(check => {
  try { check.checked = localStorage.getItem("grupo3-" + check.dataset.check) === "true"; } catch { /* Armazenamento opcional. */ }
  check.addEventListener("change", () => {
    try { localStorage.setItem("grupo3-" + check.dataset.check, String(check.checked)); } catch { /* O checklist também funciona nesta sessão. */ }
    atualizarChecklist();
  });
});
atualizarChecklist();
