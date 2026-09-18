/* ==========================================================================
   MS Consultoria — Sistema interno · MÓDULO CERTIFICADOS
   ==========================================================================
   DEMONSTRAÇÃO VISUAL/FUNCIONAL. Todos os dados são FICTÍCIOS.

   Fluxo real da MS que esta apresentação representa:
     planilha de participantes → revisão → configuração → geração
     individual OU em lote → histórico → vínculo com a turma do treinamento.

   Estrutura:
     CLIENTE → OBRA/EMPRESA → TREINAMENTO → TURMA → PARTICIPANTES → CERTIFICADOS

   O QUE É DEMO (não há backend nesta etapa):
   - NENHUM arquivo é enviado a servidor. O upload é uma simulação visual;
   - os CPFs são SEMPRE exibidos mascarados e os nomes são fictícios;
   - a geração de PDF/ZIP e o download são apenas visuais;
   - não há QR Code real — o campo existe como estrutura para a versão final.
   ========================================================================== */
(function () {
  "use strict";

  var MS = window.MS;
  if (!MS) { console.error("[MS] núcleo não carregado — o módulo de certificados não iniciou."); return; }

  var esc = MS.esc, iso = MS.iso, fmtDate = MS.fmtDate;

  /* ======================================================================
     1. CATÁLOGO DE TREINAMENTOS / NORMAS REGULAMENTADORAS
     ====================================================================== */
  var TREINAMENTOS = [
    { id: "nr18", nr: "NR 18", nome: "Segurança e Saúde no Trabalho na Indústria da Construção", validadeMeses: 24, cargaPadrao: 6 },
    { id: "nr35", nr: "NR 35", nome: "Trabalho em Altura", validadeMeses: 24, cargaPadrao: 8 },
    { id: "nr12", nr: "NR 12", nome: "Segurança no Trabalho em Máquinas e Equipamentos", validadeMeses: 24, cargaPadrao: 8 },
    { id: "nr10", nr: "NR 10", nome: "Segurança em Instalações e Serviços em Eletricidade", validadeMeses: 24, cargaPadrao: 40 },
    { id: "nr33", nr: "NR 33", nome: "Segurança e Saúde nos Trabalhos em Espaços Confinados", validadeMeses: 24, cargaPadrao: 16 },
    { id: "nr20", nr: "NR 20", nome: "Segurança com Inflamáveis e Combustíveis", validadeMeses: 24, cargaPadrao: 8 },
    { id: "nr11", nr: "NR 11", nome: "Transporte, Movimentação, Armazenagem e Manuseio de Materiais", validadeMeses: 24, cargaPadrao: 8 },
    { id: "nr23", nr: "NR 23", nome: "Proteção Contra Incêndios", validadeMeses: 24, cargaPadrao: 8 },
    { id: "nr06", nr: "NR 06", nome: "Uso Correto do EPI", validadeMeses: 12, cargaPadrao: 4 },
    { id: "nr05", nr: "NR 05", nome: "Comissão Interna de Prevenção de Acidentes — CIPA", validadeMeses: 12, cargaPadrao: 20 },
    { id: "ps", nr: "—", nome: "Primeiros Socorros", validadeMeses: 12, cargaPadrao: 8 },
    { id: "brigada", nr: "—", nome: "Brigada de Incêndio", validadeMeses: 12, cargaPadrao: 16 }
  ];

  function treinamentoPorId(id) {
    for (var i = 0; i < TREINAMENTOS.length; i++) if (TREINAMENTOS[i].id === id) return TREINAMENTOS[i];
    return { id: id, nr: "—", nome: "Treinamento não identificado", validadeMeses: 24, cargaPadrao: 8 };
  }

  /* ======================================================================
     2. GERADOR DETERMINÍSTICO DE PARTICIPANTES (dados fictícios)
     ----------------------------------------------------------------------
     Nomes e CPFs são SEMPRE fictícios e gerados por semente fixa, para que
     a demonstração seja estável entre recarregamentos — e nunca reproduza
     informação pessoal real.
     ====================================================================== */
  var PRIMEIROS = ["Ana", "Bruno", "Carla", "Daniel", "Eduardo", "Fernanda", "Gabriel", "Helena", "Igor", "Juliana",
    "Kleber", "Larissa", "Marcelo", "Natália", "Otávio", "Patrícia", "Rafael", "Sandra", "Thiago", "Vanessa",
    "Wagner", "Yara", "André", "Beatriz", "Caio", "Débora", "Emerson", "Flávia", "Gustavo", "Isabela",
    "Jonas", "Karina", "Leandro", "Michele", "Nelson", "Olívia", "Paulo", "Renata", "Sérgio", "Tatiana"];
  var MEIOS = ["Sales", "Pereira", "Henrique", "Alves", "Ribeiro", "Costa", "Moura", "Barbosa", "Cardoso", "Nogueira",
    "Teixeira", "Farias", "Bezerra", "Campos", "Duarte", "Freitas", "Gomes", "Lima", "Martins", "Pinto"];
  var SOBRENOMES = ["de Lima", "da Silva", "Souza", "Oliveira", "Santos", "Almeida", "Ferreira", "Rodrigues", "Carvalho", "Araújo",
    "Melo", "Cavalcanti", "Batista", "Correia", "Monteiro", "Machado", "Nascimento", "Vieira", "Ramos", "Dias"];

  function lcg(seed) {
    var s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  }
  function nomeFicticio(r) {
    return PRIMEIROS[Math.floor(r() * PRIMEIROS.length)] + " " +
      (r() > 0.55 ? MEIOS[Math.floor(r() * MEIOS.length)] + " " : "") +
      SOBRENOMES[Math.floor(r() * SOBRENOMES.length)];
  }
  // CPF da demonstração: SEMPRE mascarado na interface.
  function cpfFicticio(r) {
    var n = Math.floor(r() * 90000000000) + 10000000000;
    return { bruto: String(n), mascarado: MS.maskCpf() };
  }

  /* ======================================================================
     3. TURMAS (vínculo: cliente → empresa/obra → treinamento → turma)
     ====================================================================== */
  var INSTRUTORES = ["Maria Silva", "João Pereira", "Ana Costa", "Pedro Lima"];
  var RESPONSAVEIS = ["Maria Silva", "Ana Costa"];

  var SEDES = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  function gerarParticipantes(turma, quantidade, fixos) {
    var r = lcg(turma.seed);
    var lista = [];
    // Participantes com nome definido (usados nos exemplos da demonstração).
    (fixos || []).forEach(function (n, i) {
      lista.push({ id: turma.id + "-p" + (i + 1), nome: n.nome, cpf: n.cpf === false ? null : MS.maskCpf(), problemas: n.problemas || [] });
    });
    for (var i = lista.length; i < quantidade; i++) {
      var cpf = cpfFicticio(r);
      lista.push({ id: turma.id + "-p" + (i + 1), nome: nomeFicticio(r), cpf: cpf.mascarado, problemas: [] });
    }
    return lista;
  }

  // Código único do certificado — sequencial e estável.
  var seqCert = 0;
  function codigoCertificado(data) {
    seqCert++;
    return "MS-" + data.getFullYear() + "-" + String(seqCert).padStart(5, "0");
  }

  var TURMAS = [
    {
      id: "t1", treinamentoId: "nr18", clienteId: "c5", obraId: "o9",
      data: iso(15, 9, 8, 0), cargaHoraria: 6, instrutor: "Maria Silva", responsavel: "Maria Silva",
      local: "Recife — PE", modalidade: "Presencial", seed: 101, quantidade: 27,
      fixos: [
        { nome: "Igor Sales de Lima" },
        { nome: "João Pereira da Silva" },
        { nome: "Carlos Henrique Souza", cpf: false, problemas: ["CPF ausente", "Nome incompleto"] }
      ],
      situacao: "Certificados emitidos"
    },
    {
      id: "t2", treinamentoId: "nr35", clienteId: "c5", obraId: "o9",
      data: iso(9, 9, 8, 0), cargaHoraria: 8, instrutor: "João Pereira", responsavel: "Maria Silva",
      local: "Recife — PE", modalidade: "Presencial", seed: 202, quantidade: 9, fixos: [],
      situacao: "Certificados emitidos"
    },
    {
      id: "t3", treinamentoId: "nr12", clienteId: "c5", obraId: "o11",
      data: iso(22, 8, 8, 0), cargaHoraria: 8, instrutor: "João Pereira", responsavel: "Maria Silva",
      local: "Cabo de Santo Agostinho — PE", modalidade: "Presencial", seed: 303, quantidade: 24, fixos: [],
      situacao: "Certificados emitidos"
    },
    {
      id: "t4", treinamentoId: "nr10", clienteId: "c6", obraId: "o12",
      data: iso(12, 8, 7, 30), cargaHoraria: 40, instrutor: "Pedro Lima", responsavel: "Ana Costa",
      local: "Recife — PE", modalidade: "Presencial", seed: 404, quantidade: 30, fixos: [],
      situacao: "Certificados emitidos"
    },
    {
      id: "t5", treinamentoId: "nr33", clienteId: "c2", obraId: "o5",
      data: iso(28, 7, 8, 0), cargaHoraria: 16, instrutor: "Pedro Lima", responsavel: "Maria Silva",
      local: "Recife — PE", modalidade: "Presencial", seed: 505, quantidade: 19, fixos: [],
      situacao: "Certificados emitidos"
    },
    {
      id: "t6", treinamentoId: "nr06", clienteId: "c1", obraId: "o1",
      data: iso(14, 7, 8, 0), cargaHoraria: 4, instrutor: "Ana Costa", responsavel: "Ana Costa",
      local: "Recife — PE", modalidade: "Presencial", seed: 606, quantidade: 15, fixos: [],
      situacao: "Certificados emitidos"
    },
    {
      id: "t7", treinamentoId: "nr20", clienteId: "c2", obraId: "o6",
      data: iso(30, 6, 8, 0), cargaHoraria: 8, instrutor: "Pedro Lima", responsavel: "Maria Silva",
      local: "Paulista — PE", modalidade: "Presencial", seed: 707, quantidade: 34, fixos: [],
      situacao: "Certificados emitidos"
    },
    {
      id: "t8", treinamentoId: "nr11", clienteId: "c5", obraId: "o11",
      data: iso(18, 6, 8, 0), cargaHoraria: 8, instrutor: "João Pereira", responsavel: "Maria Silva",
      local: "Cabo de Santo Agostinho — PE", modalidade: "Presencial", seed: 808, quantidade: 16, fixos: [],
      situacao: "Certificados emitidos"
    },
    {
      id: "t9", treinamentoId: "nr18", clienteId: "c4", obraId: "o8",
      data: iso(20, 5, 8, 0), cargaHoraria: 6, instrutor: "Maria Silva", responsavel: "Maria Silva",
      local: "Olinda — PE", modalidade: "Presencial", seed: 909, quantidade: 23, fixos: [],
      situacao: "Certificados emitidos"
    },
    {
      id: "t10", treinamentoId: "ps", clienteId: "c3", obraId: "o7",
      data: iso(15, 4, 8, 0), cargaHoraria: 8, instrutor: "Ana Costa", responsavel: "Ana Costa",
      local: "Jaboatão dos Guararapes — PE", modalidade: "Presencial", seed: 1010, quantidade: 19, fixos: [],
      situacao: "Certificados emitidos"
    },
    {
      id: "t11", treinamentoId: "brigada", clienteId: "c6", obraId: "o12",
      data: iso(10, 3, 8, 0), cargaHoraria: 16, instrutor: "Pedro Lima", responsavel: "Ana Costa",
      local: "Recife — PE", modalidade: "Presencial", seed: 1111, quantidade: 11, fixos: [],
      situacao: "Certificados emitidos"
    },
    {
      id: "t12", treinamentoId: "nr05", clienteId: "c5", obraId: "o10",
      data: iso(25, 2, 2025), cargaHoraria: 20, instrutor: "Maria Silva", responsavel: "Maria Silva",
      local: "Jaboatão dos Guararapes — PE", modalidade: "Presencial", seed: 1212, quantidade: 13, fixos: [],
      situacao: "Certificados emitidos"
    },
    // Turma antiga: certificados JÁ VENCIDOS (a NR 05 tem validade de 12 meses).
    {
      id: "t13", treinamentoId: "nr06", clienteId: "c2", obraId: "o5",
      data: iso(2, 10, 2025), cargaHoraria: 4, instrutor: "Ana Costa", responsavel: "Ana Costa",
      local: "Recife — PE", modalidade: "Presencial", seed: 1313, quantidade: 3, fixos: [],
      situacao: "Certificados emitidos"
    },
    // Turmas com validade caindo nos próximos 60 dias (demonstram o alerta).
    {
      id: "t14", treinamentoId: "nr18", clienteId: "c1", obraId: "o1",
      data: iso(25, 9, 2024), cargaHoraria: 6, instrutor: "Maria Silva", responsavel: "Maria Silva",
      local: "Recife — PE", modalidade: "Presencial", seed: 1414, quantidade: 5, fixos: [],
      situacao: "Certificados emitidos"
    }
  ];

  /* ======================================================================
     4. CERTIFICADOS (gerados a partir das turmas e dos individuais)
     ====================================================================== */
  function validadeDe(data, treinamentoId) {
    var t = treinamentoPorId(treinamentoId);
    var d = new Date(data.getFullYear(), data.getMonth() + t.validadeMeses, data.getDate());
    return d;
  }

  function statusValidade(validade) {
    var info = MS.validadeInfo(validade, 60);
    if (info.nivel === "vencido") return { nome: "Vencido", cls: "status--warn", nivel: "vencido" };
    if (info.nivel === "proximo") return { nome: "Vencimento próximo", cls: "status--review", nivel: "proximo" };
    return { nome: "Válido", cls: "status--active", nivel: "ok" };
  }

  var CERTIFICADOS = [];
  function montarCertificados() {
    CERTIFICADOS = [];
    TURMAS.forEach(function (t) {
      var tr = treinamentoPorId(t.treinamentoId);
      var partes = gerarParticipantes(t, t.quantidade, t.fixos);
      t.participantes = partes;
      t.certificados = [];
      partes.forEach(function (p, i) {
        var c = {
          id: "ct-" + t.id + "-" + (i + 1),
          codigo: codigoCertificado(t.data),
          participante: p.nome,
          cpf: p.cpf,                     // já mascarado (ou null quando ausente)
          treinamentoId: t.treinamentoId,
          nr: tr.nr,
          treinamento: tr.nome,
          clienteId: t.clienteId,
          obraId: t.obraId,
          turmaId: t.id,
          emissao: t.data,
          validade: validadeDe(t.data, t.treinamentoId),
          cargaHoraria: t.cargaHoraria,
          instrutor: t.instrutor,
          responsavel: t.responsavel,
          local: t.local,
          modelo: "Modelo padrão MS Consultoria",
          status: p.problemas.length ? "Pendente de revisão" : "Emitido",
          problemas: p.problemas,
          demo: true
        };
        t.certificados.push(c);
        CERTIFICADOS.push(c);
      });
    });
    CERTIFICADOS.sort(function (a, b) { return b.emissao - a.emissao; });
  }
  montarCertificados();

  function clienteDe(c) { return MS.CLIENTES.filter(function (x) { return x.id === c.clienteId; })[0]; }
  function obraDe(c) { return MS.obraPorId(c.obraId); }
  function empresaDe(c) { var cl = clienteDe(c); return cl ? cl.nome : "—"; }
  function nomeObraDe(c) { var o = obraDe(c); return o ? o.nome : "—"; }
  function turmaPorId(id) { return TURMAS.filter(function (t) { return t.id === id; })[0]; }

  /* ======================================================================
     5. INDICADORES
     ====================================================================== */
  function indicadores() {
    var emitidos = CERTIFICADOS.length;
    var mes = CERTIFICADOS.filter(function (c) {
      return c.emissao.getMonth() === MS.NOW.getMonth() && c.emissao.getFullYear() === MS.NOW.getFullYear();
    }).length;
    var venc = CERTIFICADOS.filter(function (c) { return statusValidade(c.validade).nivel === "proximo"; }).length;
    return { emitidos: emitidos, mes: mes, vencimentos: venc, turmas: TURMAS.length };
  }

  function certificadosAvencer() {
    return CERTIFICADOS.filter(function (c) { return statusValidade(c.validade).nivel === "proximo"; })
      .sort(function (a, b) { return a.validade - b.validade; });
  }

  function turmasDoCliente(clienteId) {
    return TURMAS.filter(function (t) { return t.clienteId === clienteId; });
  }

  /* ======================================================================
     6. ÍCONES
     ====================================================================== */
  function ico(nome) {
    var p = {
      cert: '<path fill="currentColor" d="M12 2 3 6v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V6l-9-4zm-1 14-4-4 1.4-1.4L11 13.2l4.6-4.6L17 10l-6 6z"/>',
      award: '<path fill="currentColor" d="M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 12c-4 0-8 2-8 5v3h16v-3c0-3-4-5-8-5z"/>',
      upload: '<path fill="currentColor" d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/>',
      table: '<path fill="currentColor" d="M3 3h18v18H3V3zm2 2v4h6V5H5zm8 0v4h6V5h-6zM5 11v4h6v-4H5zm8 0v4h6v-4h-6zM5 17v2h6v-2H5zm8 0v2h6v-2h-6z"/>',
      clock: '<path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 11H7v-2h4V6h2v7z"/>',
      users: '<path fill="currentColor" d="M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 2c-2.7 0-8 1.3-8 4v3h10v-3c0-1 .4-1.9 1-2.7A9 9 0 0 0 8 13zm8 0c-.6 0-1.3 0-2 .1 1.2 1 2 2.2 2 3.9v3h8v-3c0-2.7-5.3-4-8-4z"/>',
      template: '<path fill="currentColor" d="M4 3h16v4H4V3zm0 6h7v12H4V9zm9 0h7v12h-7V9z"/>',
      download: '<path fill="currentColor" d="M12 16 6 10h4V3h4v7h4l-6 6zM4 18h16v3H4v-3z"/>',
      eye: '<path fill="currentColor" d="M12 5C6 5 2 12 2 12s4 7 10 7 10-7 10-7-4-7-10-7zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/>'
    };
    return '<svg viewBox="0 0 24 24">' + (p[nome] || p.cert) + "</svg>";
  }

  /* ======================================================================
     7. COMPONENTES REUTILIZÁVEIS DO MÓDULO
     ====================================================================== */

  // Pré-visualização do certificado (visual, sem geração real de arquivo).
  function previewCertificado(cfg) {
    return (
      '<div class="cert-doc">' +
      '<div class="cert-doc__border">' +
      '<div class="cert-doc__brand">' +
      '<span class="brand__shield"><svg viewBox="0 0 32 32" width="38" height="38"><path d="M16 2 4 7v8c0 7 5 13 12 15 7-2 12-8 12-15V7L16 2z" fill="currentColor"/><path d="M16 7l-6.5 3v5.5c0 4.6 2.8 8.6 6.5 10 3.7-1.4 6.5-5.4 6.5-10V10L16 7z" fill="#fff"/></svg></span>' +
      '<div><strong>MS CONSULTORIA</strong><span>Saúde e Segurança do Trabalho</span></div>' +
      "</div>" +
      '<h2 class="cert-doc__titulo">CERTIFICADO</h2>' +
      '<p class="cert-doc__sub">' + esc(cfg.treinamento) + "</p>" +
      '<p class="cert-doc__texto">Certificamos que <strong class="cert-doc__nome">' + esc(cfg.participante) + "</strong>" +
      ", CPF <strong>" + esc(cfg.cpf || "***.***.***-**") + "</strong>, concluiu com aproveitamento o treinamento de " +
      "<strong>" + esc(cfg.nr !== "—" ? cfg.nr + " — " + cfg.treinamento : cfg.treinamento) + "</strong>, " +
      "com carga horária de <strong>" + esc(cfg.cargaHoraria) + " horas</strong>, realizado em <strong>" + fmtDate(cfg.data) + "</strong>" +
      (cfg.local ? ", em <strong>" + esc(cfg.local) + "</strong>" : "") + ", atendendo aos requisitos das Normas Regulamentadoras do Ministério do Trabalho e Emprego.</p>" +
      '<div class="cert-doc__grid">' +
      certField("Participante", cfg.participante) +
      certField("Empresa", cfg.empresa) +
      certField("Treinamento", cfg.nr !== "—" ? cfg.nr + " — " + cfg.treinamento : cfg.treinamento) +
      certField("Carga horária", cfg.cargaHoraria + " horas") +
      certField("Data", fmtDate(cfg.data)) +
      certField("Local", cfg.local || "—") +
      "</div>" +
      '<div class="cert-doc__foot">' +
      '<div class="cert-doc__sign"><span class="cert-doc__line"></span><span>Instrutor<br/><strong>' + esc(cfg.instrutor) + "</strong></span></div>" +
      '<div class="cert-doc__sign"><span class="cert-doc__line"></span><span>Responsável técnico<br/><strong>' + esc(cfg.responsavel) + "</strong></span></div>" +
      '<div class="cert-doc__qr"><span class="qr-demo"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>' +
      '<span class="cert-doc__codigo">' + esc(cfg.codigo || "MS-2026-00000") + "</span>" +
      '<span class="cert-doc__qrlabel">Validação por QR Code<br/>(estrutura prevista)</span></div>' +
      "</div>" +
      "</div></div>"
    );
  }
  function certField(l, v) {
    return '<div class="cert-field"><span class="cert-field__l">' + esc(l) + '</span><span class="cert-field__v">' + esc(v) + "</span></div>";
  }

  function linhaCertificado(c, acoes) {
    var st = statusValidade(c.validade);
    return '<tr>' +
      '<td data-l="Participante" class="cell-strong">' + esc(c.participante) + '<span class="cell-sub">' + esc(c.cpf || "CPF não informado") + "</span></td>" +
      '<td data-l="Empresa">' + esc(empresaDe(c)) + "</td>" +
      '<td data-l="Treinamento">' + esc(c.nr !== "—" ? c.nr : c.treinamento) + '<span class="cell-sub">' + esc(c.treinamento) + "</span></td>" +
      '<td data-l="Emissão">' + fmtDate(c.emissao) + "</td>" +
      '<td data-l="Validade">' + fmtDate(c.validade) + "</td>" +
      '<td data-l="Status"><span class="status ' + st.cls + '">' + st.nome + "</span></td>" +
      (acoes ? '<td data-l="Ações"><div class="row-actions">' +
        '<button class="mini-btn" data-action="cert-ver" data-cert="' + c.id + '" title="Visualizar">' + ico("eye") + "</button>" +
        '<button class="mini-btn" data-toast-action="Download do certificado — demonstração visual." title="Baixar">' + ico("download") + "</button>" +
        '<button class="mini-btn" data-action="cert-editar" data-cert="' + c.id + '" title="Editar">✎</button>' +
        '<button class="mini-btn" data-toast-action="Certificado reemitido — demonstração visual." title="Reemitir">↻</button>' +
        "</div></td>" : "") +
      "</tr>";
  }

  /* ======================================================================
     8. TELA — DASHBOARD DE CERTIFICADOS
     ====================================================================== */
  function renderDashboard() {
    MS.showApp();
    MS.setCrumbs([{ label: "Treinamentos", href: "treinamentos" }, { label: "Certificados" }]);
    MS.actions._ctxObra = null;
    MS.actions._ctxCliente = null;

    var ind = indicadores();
    var aVencer = certificadosAvencer();
    var recentes = CERTIFICADOS.slice(0, 6);
    var turmasRecentes = TURMAS.slice(0, 5);

    MS.setView(
      '<div class="page-head rv"><div><h1 class="page-head__title">Certificados</h1>' +
      '<p class="page-head__sub">Gere, organize e acompanhe certificados de treinamentos.</p></div>' +
      '<div class="page-head__actions">' +
      '<button class="btn btn--light btn--sm" data-action="cert-individual">+ Novo certificado</button>' +
      '<button class="btn btn--primary btn--sm" data-action="cert-importar">' + ico("upload") + " Importar participantes</button>" +
      "</div></div>" +

      '<div class="kpi-grid kpi-grid--4">' +
      kpi("Certificados emitidos", ind.emitidos, "cert", false, 0) +
      kpi("Este mês", ind.mes, "clock", false, 30) +
      kpi("Próximos vencimentos", ind.vencimentos, "award", true, 60) +
      kpi("Turmas", ind.turmas, "users", false, 90) +
      "</div>" +

      '<div class="grid-2">' +
      // ---- Ações rápidas
      '<div class="card rv"><div class="card__head"><h3>Como a MS emite certificados</h3></div>' +
      '<div class="card__pad cert-atalhos">' +
      '<button class="atalho" data-action="cert-importar"><span class="atalho__ico">' + ico("table") + "</span>" +
      "<strong>Em lote, a partir da planilha</strong><span>Importe a lista de participantes (Excel/CSV), revise e gere todos os certificados de uma turma.</span></button>" +
      '<button class="atalho" data-action="cert-individual"><span class="atalho__ico">' + ico("cert") + "</span>" +
      "<strong>Individualmente</strong><span>Emita um certificado avulso informando os dados do participante e do treinamento.</span></button>" +
      '<button class="atalho" data-action="cert-modelos"><span class="atalho__ico">' + ico("template") + "</span>" +
      "<strong>Modelo do certificado</strong><span>Logotipo, título, texto de conclusão, assinaturas, QR Code e código único.</span></button>" +
      "</div></div>" +

      // ---- Próximos vencimentos
      '<div class="card rv"><div class="card__head"><h3>Próximos vencimentos</h3>' +
      '<button class="link-btn" data-action="cert-historico">Ver histórico</button></div>' +
      '<div class="card__pad" style="padding-top:4px">' +
      (aVencer.length ? aVencer.slice(0, 6).map(function (c) {
        var st = statusValidade(c.validade);
        return '<div class="venc-row"><div class="avatar avatar--sm">' + esc(MS.iniciais(c.participante)) + "</div>" +
          '<div class="venc-row__b"><strong>' + esc(c.participante) + '</strong><span>' + esc(c.nr !== "—" ? c.nr : c.treinamento) + " · " + esc(empresaDe(c)) + "</span></div>" +
          '<div class="venc-row__r"><span class="status ' + st.cls + '">' + fmtDate(c.validade) + '</span><span class="venc-row__d">' + MS.vencTexto(c.validade) + "</span></div></div>";
      }).join("") : '<p class="empty-line">Nenhum certificado próximo do vencimento.</p>') +
      "</div></div>" +
      "</div>" +

      '<div class="grid-2">' +
      // ---- Turmas recentes
      '<div class="card rv"><div class="card__head"><h3>Turmas recentes</h3>' +
      '<button class="link-btn" data-action="cert-turmas">Ver todas</button></div>' +
      '<div class="table-wrap table-cards"><table class="table"><thead><tr>' +
      "<th>Treinamento</th><th>Empresa</th><th>Data</th><th>Participantes</th><th>Certificados</th><th></th></tr></thead><tbody>" +
      turmasRecentes.map(function (t) {
        var tr = treinamentoPorId(t.treinamentoId);
        var cl = MS.CLIENTES.filter(function (x) { return x.id === t.clienteId; })[0];
        return '<tr class="is-clickable" data-href="#/certificados/turma/' + t.id + '">' +
          '<td data-l="Treinamento" class="cell-strong">' + esc(tr.nr !== "—" ? tr.nr : tr.nome) + '<span class="cell-sub">' + esc(tr.nome) + "</span></td>" +
          '<td data-l="Empresa">' + esc(cl ? cl.nome : "—") + "</td>" +
          '<td data-l="Data">' + fmtDate(t.data) + "</td>" +
          '<td data-l="Participantes">' + t.participantes.length + "</td>" +
          '<td data-l="Certificados"><span class="status status--concluido">' + t.certificados.length + " emitidos</span></td>" +
          '<td data-l=""><span class="link-btn">Abrir</span></td></tr>';
      }).join("") +
      "</tbody></table></div></div>" +

      // ---- Últimos certificados emitidos
      '<div class="card rv"><div class="card__head"><h3>Últimos certificados emitidos</h3></div>' +
      '<div class="card__pad" style="padding-top:4px">' +
      recentes.slice(0, 5).map(function (c) {
        return '<div class="cert-row"><div class="avatar avatar--sm">' + esc(MS.iniciais(c.participante)) + "</div>" +
          '<div class="cert-row__b"><strong>' + esc(c.participante) + "</strong>" +
          "<span>" + esc(c.nr !== "—" ? c.nr + " · " : "") + esc(c.treinamento) + " · " + esc(empresaDe(c)) + "</span></div>" +
          '<div class="cert-row__r"><span class="cert-row__data">' + fmtDate(c.emissao) + "</span>" +
          '<button class="link-btn" data-action="cert-ver" data-cert="' + c.id + '">Visualizar</button></div></div>';
      }).join("") +
      "</div></div>" +
      "</div>"
    );
  }

  function kpi(label, valor, icon, warn, delay) {
    return '<div class="kpi rv' + (warn ? " kpi--warn" : "") + '" style="transition-delay:' + (delay || 0) + 'ms">' +
      '<span class="kpi__icon">' + ico(icon) + '</span><span class="kpi__label">' + label + "</span>" +
      '<div class="kpi__value">' + valor + "</div></div>";
  }

  /* ======================================================================
     9. TELA — TURMA (vínculo treinamento → turma → participantes → certificados)
     ====================================================================== */
  function renderTurma(parts) {
    var t = turmaPorId(parts[2]);
    if (!t) { MS.showToast("Turma não encontrada nesta demonstração."); return renderDashboard(); }
    var tr = treinamentoPorId(t.treinamentoId);
    var cl = MS.CLIENTES.filter(function (x) { return x.id === t.clienteId; })[0];
    var ob = MS.obraPorId(t.obraId);

    MS.showApp();
    MS.setCrumbs([
      { label: "Certificados", href: "certificados" },
      { label: "Turmas", href: "certificados/turmas" },
      { label: tr.nr !== "—" ? tr.nr : tr.nome }
    ]);
    MS.actions._ctxCliente = cl;
    MS.actions._ctxObra = ob;
    MS.state.turmaAtual = t;

    var tot = t.certificados.length;
    var aVencer = t.certificados.filter(function (c) { return statusValidade(c.validade).nivel === "proximo"; }).length;

    MS.setView(
      '<div class="entity-head rv">' +
      '<span class="entity-head__icon">' + ico("users") + "</span>" +
      '<div class="entity-head__titles"><h1>Turma ' + esc(tr.nr !== "—" ? tr.nr + " — " + tr.nome : tr.nome) + "</h1>" +
      '<div class="entity-head__sub">' + esc(cl ? cl.nome : "—") + (ob ? " · Obra: " + esc(ob.nome) : "") + " · " + fmtDate(t.data) + "</div></div>" +
      '<div class="entity-head__meta">' +
      '<div class="entity-meta"><div class="entity-meta__label">Participantes</div><div class="entity-meta__value">' + tot + "</div></div>" +
      '<div class="entity-meta"><div class="entity-meta__label">Certificados</div><div class="entity-meta__value">' + tot + " emitidos</div></div>" +
      "</div></div>" +

      '<div class="grid-4 rv">' +
      infoCard("Treinamento", tr.nr !== "—" ? tr.nr + " — " + tr.nome : tr.nome) +
      infoCard("Carga horária", t.cargaHoraria + " horas") +
      infoCard("Instrutor", t.instrutor) +
      infoCard("Local", t.local) +
      "</div>" +

      '<div class="tabs rv">' +
      '<button class="tab is-active" data-turma-tab="participantes">Participantes <span class="tab__count">' + tot + "</span></button>" +
      '<button class="tab" data-turma-tab="certificados">Certificados <span class="tab__count">' + tot + "</span></button>" +
      '<button class="tab" data-turma-tab="dados">Dados da turma</button>' +
      "</div>" +
      '<div id="turma-content"></div>' +

      '<div class="card rv cert-vinculo">' +
      "<strong>Cadeia de vínculo desta turma</strong>" +
      '<div class="vinculo">' +
      '<span class="vinculo__i">Cliente<strong>' + esc(cl ? cl.nome : "—") + "</strong></span>" +
      '<span class="vinculo__s">→</span>' +
      '<span class="vinculo__i">Empresa / Obra<strong>' + esc(ob ? ob.nome : "—") + "</strong></span>" +
      '<span class="vinculo__s">→</span>' +
      '<span class="vinculo__i">Treinamento<strong>' + esc(tr.nr !== "—" ? tr.nr : tr.nome) + "</strong></span>" +
      '<span class="vinculo__s">→</span>' +
      '<span class="vinculo__i">Turma<strong>' + fmtDate(t.data) + "</strong></span>" +
      '<span class="vinculo__s">→</span>' +
      '<span class="vinculo__i">Participantes<strong>' + tot + "</strong></span>" +
      '<span class="vinculo__s">→</span>' +
      '<span class="vinculo__i vinculo__i--ok">Certificados<strong>' + tot + " emitidos</strong></span>" +
      "</div></div>" +

      (aVencer ? '<div class="card rv" style="padding:14px 16px;background:#fdf3e0;border-color:#f7e3c4">' +
        "<strong>" + aVencer + " certificado(s) desta turma " + (aVencer === 1 ? "está" : "estão") + " próximo(s) do vencimento.</strong> " +
        "O sistema pode programar o retreinamento e reemitir os certificados.</div>" : "")
    );

    function activate(nome) {
      var el = document.getElementById("turma-content");
      el.innerHTML = {
        participantes: tabParticipantes(t),
        certificados: tabCertificadosTurma(t),
        dados: tabDadosTurma(t)
      }[nome] || tabParticipantes(t);
      MS.wireView(); MS.revealAll(el);
    }
    activate("participantes");
    document.querySelectorAll("#view .tab[data-turma-tab]").forEach(function (b) {
      b.addEventListener("click", function () {
        activate(b.getAttribute("data-turma-tab"));
        document.querySelectorAll("#view .tab[data-turma-tab]").forEach(function (x) { x.classList.toggle("is-active", x === b); });
      });
    });
  }

  function infoCard(l, v) {
    return '<div class="card card--mini"><span class="card--mini__l">' + esc(l) + '</span><span class="card--mini__v">' + esc(v) + "</span></div>";
  }

  function tabParticipantes(t) {
    return '<div class="card rv"><div class="card__head"><h3>Participantes da turma</h3>' +
      '<span class="card__head-sub">' + t.participantes.length + " participantes</span></div>" +
      '<div class="table-wrap table-cards"><table class="table"><thead><tr>' +
      "<th>Participante</th><th>CPF</th><th>Empresa</th><th>Treinamento</th><th>Certificado</th></tr></thead><tbody>" +
      t.participantes.map(function (p, i) {
        var c = t.certificados[i];
        return '<tr><td data-l="Participante" class="cell-strong">' + esc(p.nome) +
          (p.problemas.length ? '<span class="cell-sub cell-sub--warn">' + esc(p.problemas.join(" · ")) + "</span>" : "") + "</td>" +
          '<td data-l="CPF">' + esc(p.cpf || "—") + "</td>" +
          '<td data-l="Empresa">' + esc(c ? empresaDe(c) : "—") + "</td>" +
          '<td data-l="Treinamento">' + esc(c ? (c.nr !== "—" ? c.nr : c.treinamento) : "—") + "</td>" +
          '<td data-l="Certificado">' + (c ? '<button class="link-btn" data-action="cert-ver" data-cert="' + c.id + '">' + esc(c.codigo) + "</button>"
            : '<span class="status status--muted">Não emitido</span>') + "</td></tr>";
      }).join("") +
      "</tbody></table></div></div>";
  }

  function tabCertificadosTurma(t) {
    return '<div class="card rv"><div class="card__head"><h3>Certificados da turma</h3>' +
      '<div class="row-actions">' +
      '<button class="btn btn--light btn--sm" data-toast-action="Exportação ZIP — demonstração visual.">Exportar ZIP</button>' +
      '<button class="btn btn--light btn--sm" data-toast-action="PDF único da turma — demonstração visual.">Gerar PDF único</button>' +
      '<button class="btn btn--primary btn--sm" data-toast-action="Download em lote — demonstração visual.">Baixar todos</button>' +
      "</div></div>" +
      '<div class="table-wrap table-cards"><table class="table"><thead><tr>' +
      "<th>Participante</th><th>Empresa</th><th>Treinamento</th><th>Emissão</th><th>Validade</th><th>Status</th><th>Ações</th>" +
      "</tr></thead><tbody>" +
      t.certificados.map(function (c) { return linhaCertificado(c, true); }).join("") +
      "</tbody></table></div></div>";
  }

  function tabDadosTurma(t) {
    var tr = treinamentoPorId(t.treinamentoId);
    var cl = MS.CLIENTES.filter(function (x) { return x.id === t.clienteId; })[0];
    return '<div class="card rv"><div class="card__head"><h3>Dados da turma</h3></div>' +
      '<div class="card__pad"><div class="nc-grid">' +
      cf("Treinamento", tr.nr !== "—" ? tr.nr + " — " + tr.nome : tr.nome) +
      cf("Empresa / Cliente", cl ? cl.nome : "—") +
      cf("Data de realização", fmtDate(t.data)) +
      cf("Carga horária", t.cargaHoraria + " horas") +
      cf("Instrutor", t.instrutor) +
      cf("Responsável técnico", t.responsavel) +
      cf("Local", t.local) +
      cf("Modalidade", t.modalidade) +
      cf("Validade do certificado", tr.validadeMeses + " meses (" + fmtDate(validadeDe(t.data, t.treinamentoId)) + ")") +
      "</div></div></div>";
  }
  function cf(k, v) { return '<div><span class="nc-box__k">' + esc(k) + '</span><span class="nc-box__v">' + esc(v) + "</span></div>"; }

  /* ======================================================================
     10. TELA — TODAS AS TURMAS
     ====================================================================== */
  function renderTurmas() {
    MS.showApp();
    MS.setCrumbs([{ label: "Certificados", href: "certificados" }, { label: "Turmas" }]);
    MS.setView(
      '<div class="page-head rv"><div><h1 class="page-head__title">Turmas de treinamento</h1>' +
      '<p class="page-head__sub">Cada turma reúne os participantes e os certificados emitidos.</p></div>' +
      '<div class="page-head__actions">' +
      '<button class="btn btn--primary btn--sm" data-action="cert-importar">' + ico("upload") + " Importar participantes</button></div></div>" +
      '<div class="card rv"><div class="table-wrap table-cards"><table class="table"><thead><tr>' +
      "<th>Treinamento</th><th>Empresa</th><th>Obra</th><th>Data</th><th>Carga</th><th>Participantes</th><th>Certificados</th><th></th>" +
      "</tr></thead><tbody>" +
      TURMAS.map(function (t) {
        var tr = treinamentoPorId(t.treinamentoId);
        var cl = MS.CLIENTES.filter(function (x) { return x.id === t.clienteId; })[0];
        var ob = MS.obraPorId(t.obraId);
        return '<tr class="is-clickable" data-href="#/certificados/turma/' + t.id + '">' +
          '<td data-l="Treinamento" class="cell-strong">' + esc(tr.nr !== "—" ? tr.nr : tr.nome) + '<span class="cell-sub">' + esc(tr.nome) + "</span></td>" +
          '<td data-l="Empresa">' + esc(cl ? cl.nome : "—") + "</td>" +
          '<td data-l="Obra">' + esc(ob ? ob.nome : "—") + "</td>" +
          '<td data-l="Data">' + fmtDate(t.data) + "</td>" +
          '<td data-l="Carga">' + t.cargaHoraria + "h</td>" +
          '<td data-l="Participantes">' + t.participantes.length + "</td>" +
          '<td data-l="Certificados"><span class="status status--concluido">' + t.certificados.length + " emitidos</span></td>" +
          '<td data-l=""><span class="link-btn">Abrir</span></td></tr>';
      }).join("") +
      "</tbody></table></div></div>"
    );
  }

  /* ======================================================================
     11. TELA — HISTÓRICO DE CERTIFICADOS
     ====================================================================== */
  var hf = { busca: "", empresa: "todas", treinamento: "todos", nr: "todos", periodo: "todos", status: "todos", limite: 25 };

  function renderHistorico() {
    MS.showApp();
    MS.setCrumbs([{ label: "Certificados", href: "certificados" }, { label: "Histórico" }]);
    var empresas = MS.CLIENTES.map(function (c) { return [c.id, c.nome]; });
    var nrs = TREINAMENTOS.map(function (t) { return [t.id, t.nr !== "—" ? t.nr + " — " + t.nome : t.nome]; });

    MS.setView(
      '<div class="page-head rv"><div><h1 class="page-head__title">Histórico de certificados</h1>' +
      '<p class="page-head__sub">Busque por participante e filtre por empresa, treinamento, NR, período e status.</p></div>' +
      '<div class="page-head__actions"><button class="btn btn--primary btn--sm" data-action="cert-individual">+ Novo certificado</button></div></div>' +

      '<div class="card rv filter-bar">' +
      '<label class="filter-search"><svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M15.5 14h-.8l-.3-.3a6.5 6.5 0 1 0-.7.7l.3.3v.8l5 5 1.5-1.5-5-5zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z"/></svg>' +
      '<input type="search" id="ch-busca" placeholder="Buscar participante..." value="' + esc(hf.busca) + '" /></label>' +
      sel("ch-empresa", "Empresa", [["todas", "Todas as empresas"]].concat(empresas), hf.empresa) +
      sel("ch-treinamento", "Treinamento", [["todos", "Todos os treinamentos"]].concat(nrs), hf.treinamento) +
      sel("ch-nr", "NR", [["todos", "Todas as NR"]].concat(TREINAMENTOS.filter(function (t) { return t.nr !== "—"; }).map(function (t) { return [t.nr, t.nr]; })), hf.nr) +
      sel("ch-periodo", "Período", [["todos", "Todo o período"], ["mes", "Setembro/2026"], ["60", "Últimos 60 dias"], ["365", "Últimos 12 meses"]], hf.periodo) +
      sel("ch-status", "Status", [["todos", "Todos os status"], ["valido", "Válido"], ["proximo", "Vencimento próximo"], ["vencido", "Vencido"], ["revisao", "Pendente de revisão"]], hf.status) +
      '<button class="btn btn--light btn--sm" id="ch-limpar">Limpar filtros</button>' +
      "</div>" +

      '<div class="card rv"><div id="ch-lista">' + corpoHistorico() + "</div></div>"
    );

    var b = document.getElementById("ch-busca");
    if (b) b.addEventListener("input", function () { hf.busca = b.value; hf.limite = 25; repintar(); });
    ["ch-empresa", "ch-treinamento", "ch-nr", "ch-periodo", "ch-status"].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("change", function () {
        if (id === "ch-empresa") hf.empresa = el.value;
        else if (id === "ch-treinamento") hf.treinamento = el.value;
        else if (id === "ch-nr") hf.nr = el.value;
        else if (id === "ch-periodo") hf.periodo = el.value;
        else hf.status = el.value;
        hf.limite = 25; repintar();
      });
    });
    var lp = document.getElementById("ch-limpar");
    if (lp) lp.addEventListener("click", function () {
      hf = { busca: "", empresa: "todas", treinamento: "todos", nr: "todos", periodo: "todos", status: "todos", limite: 25 };
      MS.rerender();
    });
  }

  function repintar() {
    var el = document.getElementById("ch-lista");
    if (el) { el.innerHTML = corpoHistorico(); MS.wireView(); }
  }

  function sel(id, label, opcoes, atual) {
    return '<label class="filter-select"><span class="filter-select__label">' + label + "</span>" +
      '<select class="field__input" id="' + id + '">' + opcoes.map(function (o) {
        return '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(atual) ? " selected" : "") + ">" + esc(o[1]) + "</option>";
      }).join("") + "</select></label>";
  }

  function filtrarHistorico() {
    return CERTIFICADOS.filter(function (c) {
      var st = statusValidade(c.validade);
      if (hf.empresa !== "todas" && c.clienteId !== hf.empresa) return false;
      if (hf.treinamento !== "todos" && c.treinamentoId !== hf.treinamento) return false;
      if (hf.nr !== "todos" && c.nr !== hf.nr) return false;
      if (hf.periodo === "mes" && !(c.emissao.getMonth() === MS.NOW.getMonth() && c.emissao.getFullYear() === MS.NOW.getFullYear())) return false;
      if (hf.periodo === "60" && c.emissao < MS.addDays(MS.NOW, -60)) return false;
      if (hf.periodo === "365" && c.emissao < MS.addDays(MS.NOW, -365)) return false;
      if (hf.status === "revisao" && c.status !== "Pendente de revisão") return false;
      if (hf.status !== "todos" && hf.status !== "revisao" && st.nivel !== hf.status) return false;
      if (hf.busca && c.participante.toLowerCase().indexOf(hf.busca.toLowerCase()) < 0) return false;
      return true;
    });
  }

  function corpoHistorico() {
    var lista = filtrarHistorico();
    if (!lista.length) {
      return '<div class="card__pad" style="text-align:center;padding:44px 20px;color:var(--grey-500)">' +
        "<h3 style=\"margin-bottom:6px\">Nenhum certificado encontrado</h3><p>Ajuste os filtros ou emita um novo certificado.</p></div>";
    }
    var visiveis = lista.slice(0, hf.limite);
    return '<div class="card__head"><h3>Certificados</h3>' +
      '<span class="card__head-sub">' + lista.length + " certificado" + (lista.length === 1 ? "" : "s") +
      (lista.length > hf.limite ? " · exibindo " + hf.limite : "") + "</span></div>" +
      '<div class="table-wrap table-cards"><table class="table"><thead><tr>' +
      "<th>Participante</th><th>Empresa</th><th>Treinamento</th><th>Emissão</th><th>Validade</th><th>Status</th><th>Ações</th>" +
      "</tr></thead><tbody>" + visiveis.map(function (c) { return linhaCertificado(c, true); }).join("") + "</tbody></table></div>" +
      (lista.length > hf.limite
        ? '<div class="load-more"><button class="btn btn--light btn--sm" id="ch-mais">Carregar mais (' +
          (lista.length - hf.limite) + " restantes)</button></div>"
        : "");
  }

  // "Carregar mais" — delegação
  document.addEventListener("click", function (e) {
    var m = e.target.closest ? e.target.closest("#ch-mais") : null;
    if (m) { hf.limite += 25; repintar(); }
  });

  /* ======================================================================
     12. TELA — MODELOS DE CERTIFICADO
     ====================================================================== */
  function renderModelos() {
    MS.showApp();
    MS.setCrumbs([{ label: "Certificados", href: "certificados" }, { label: "Modelos" }]);
    var exemploTurma = TURMAS[0];
    var exemplo = exemploTurma.certificados[0];

    MS.setView(
      '<div class="page-head rv"><div><h1 class="page-head__title">Modelos de certificado</h1>' +
      '<p class="page-head__sub">O modelo define o que aparece em todos os certificados emitidos.</p></div>' +
      '<div class="page-head__actions"><button class="btn btn--primary btn--sm" data-action="cert-individual">+ Novo certificado</button></div></div>' +

      '<div class="grid-2">' +
      '<div class="card rv"><div class="card__head"><h3>Modelos disponíveis</h3></div>' +
      '<div class="card__pad">' +
      '<div class="modelo is-on"><div class="modelo__thumb">' + ico("cert") + "</div>" +
      '<div class="modelo__b"><strong>Modelo padrão MS Consultoria</strong>' +
      "<span>Logotipo, título, nome do participante, NR, texto de conclusão, carga horária, data, assinaturas do instrutor e do responsável, QR Code de validação e código único.</span></div>" +
      '<span class="status status--concluido">Em uso</span></div>' +
      '<div class="modelo"><div class="modelo__thumb">' + ico("template") + "</div>" +
      '<div class="modelo__b"><strong>Modelo institucional — fundo branco</strong>' +
      "<span>Versão para impressão em preto e branco, sem elementos de cor.</span></div>" +
      '<button class="btn btn--light btn--sm" data-toast-action="Seleção de modelo — demonstração visual.">Selecionar</button></div>' +
      '<button class="btn btn--light btn--sm btn--block" data-toast-action="Editor de modelo — demonstração visual.">+ Criar novo modelo</button>' +
      "</div></div>" +

      '<div class="card rv"><div class="card__head"><h3>Campos previstos no modelo</h3></div>' +
      '<div class="card__pad"><ul class="campos-lista">' +
      ["Logotipo da MS Consultoria", "Título do certificado", "Nome do participante", "CPF (mascarado na listagem)",
        "Norma Regulamentadora / treinamento", "Texto de conclusão", "Carga horária", "Data de realização",
        "Local", "Assinatura do responsável técnico", "Assinatura do instrutor", "Código único do certificado",
        "QR Code de validação"].map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("") +
      "</ul>" +
      '<div class="card" style="margin-top:14px;padding:12px 14px;background:var(--green-50);border-color:var(--green-100);font-size:.84rem">' +
      "O <strong>QR Code de validação</strong> e o <strong>código único</strong> existem aqui como estrutura. " +
      "O QR real (que aponta para a validação do certificado) será gerado na versão final, com backend.</div>" +
      "</div></div>" +
      "</div>" +

      '<div class="card rv"><div class="card__head"><h3>Pré-visualização</h3>' +
      '<span class="card__head-sub">Modelo padrão MS Consultoria</span></div>' +
      '<div class="card__pad cert-preview-wrap">' +
      previewCertificado({
        participante: exemplo.participante,
        cpf: exemplo.cpf,
        empresa: empresaDe(exemplo),
        treinamento: exemplo.treinamento,
        nr: exemplo.nr,
        cargaHoraria: exemplo.cargaHoraria,
        data: exemplo.emissao,
        local: exemplo.local,
        instrutor: exemplo.instrutor,
        responsavel: exemplo.responsavel,
        codigo: exemplo.codigo
      }) +
      '<div class="cert-preview-acoes">' +
      '<button class="btn btn--light btn--sm" data-toast-action="Edição do modelo — demonstração visual.">Editar modelo</button>' +
      '<button class="btn btn--primary btn--sm" data-toast-action="Download do modelo — demonstração visual.">Baixar modelo</button>' +
      "</div></div></div>"
    );
  }

  /* ======================================================================
     13. TELA — IMPORTAÇÃO EM LOTE (assistente de 5 etapas)
     ====================================================================== */
  /* ESTADO DO ASSISTENTE — somente em memória.
     NENHUM arquivo é lido, enviado ou armazenado: a "planilha" abaixo é um
     conjunto de dados fictícios que simula o retorno da leitura. */
  var wiz = null;

  function novoWizard() {
    wiz = {
      etapa: 1,
      arquivo: null,
      colunas: [
        { origem: "NOME COMPLETO", destino: "Nome do participante" },
        { origem: "CPF", destino: "CPF" },
        { origem: "EMPRESA", destino: "Empresa" },
        { origem: "CURSO", destino: "Treinamento" },
        { origem: "DATA", destino: "Data do treinamento" },
        { origem: "CARGA HORÁRIA", destino: "Carga horária" }
      ],
      // Participantes "lidos" do arquivo: dados FICTÍCIOS e estáveis.
      encontrados: null,
      ignorados: {},
      config: {
        treinamentoId: "nr18",
        empresa: "Construtora Horizonte",
        data: iso(15, 9, 8, 0),
        cargaHoraria: 6,
        instrutor: "Maria Silva",
        responsavel: "Maria Silva",
        local: "Recife — PE",
        modelo: "Modelo padrão MS Consultoria"
      },
      gerado: false
    };
  }

  // Conjunto de participantes do arquivo "participantes-nr18.xlsx".
  // Os 27 registros vêm da turma t1 (fictícia) — 25 prontos e 2 a revisar.
  function participantesDoArquivo() {
    var t = turmaPorId("t1");
    return t.participantes.map(function (p, i) {
      var problemas = p.problemas.slice();
      // Terceiro registro da lista: problema de treinamento não identificado.
      if (i === 3) problemas.push("Treinamento não identificado");
      return {
        idx: i,
        nome: p.nome,
        cpf: p.cpf,
        empresa: "Construtora Horizonte",
        treinamento: problemas.indexOf("Treinamento não identificado") >= 0 ? "— não identificado —" : "NR 18",
        status: problemas.length ? "Revisar" : "Pronto",
        problemas: problemas
      };
    });
  }

  function listaEncontrados() { return wiz && wiz.encontrados ? wiz.encontrados : []; }
  function prontos() { return listaEncontrados().filter(function (p) { return !p.problemas.length && !wiz.ignorados[p.idx]; }); }
  function aRevisar() { return listaEncontrados().filter(function (p) { return p.problemas.length && !wiz.ignorados[p.idx]; }); }

  function renderImportar(parts) {
    if (!wiz) novoWizard();
    if (parts && parts[2] === "reset") { novoWizard(); }
    // Sem arquivo processado não há o que mapear/revisar: volta para a etapa 1.
    if (wiz.etapa > 1 && !listaEncontrados().length) wiz.etapa = 1;
    MS.showApp();
    MS.setCrumbs([
      { label: "Certificados", href: "certificados" },
      { label: "Importar participantes" }
    ]);
    MS.actions._ctxObra = null;

    MS.setView(
      '<div class="page-head rv"><div><h1 class="page-head__title">Importar participantes</h1>' +
      '<p class="page-head__sub">Importe a lista da turma, revise os dados e gere os certificados em lote.</p></div></div>' +
      '<div class="wizard-steps wizard-steps--big rv">' +
      ["Enviar arquivo", "Mapear colunas", "Revisar dados", "Configurar certificados", "Gerar certificados"].map(function (l, i) {
        var n = i + 1;
        return '<span class="wstep' + (wiz.etapa === n ? " is-on" : "") + (wiz.etapa > n ? " is-done" : "") + '">' +
          '<i>' + (wiz.etapa > n ? "✓" : n) + "</i>" + esc(l) + "</span>";
      }).join("") +
      "</div>" +
      '<div id="wiz-content"></div>'
    );

    var alvo = document.getElementById("wiz-content");
    alvo.innerHTML = [etapaUpload, etapaMapear, etapaRevisar, etapaConfigurar, etapaGerar][wiz.etapa - 1]();
    MS.wireView(); MS.revealAll(alvo);
  }

  function irPara(n) {
    if (n > 1 && !listaEncontrados().length) {
      MS.showToast("Envie a lista de participantes para continuar.");
      wiz.etapa = 1;
    } else {
      wiz.etapa = Math.min(5, Math.max(1, n));
    }
    renderImportar();
    if (window.scrollTo) window.scrollTo(0, 0);
  }

  /* ---- Etapa 1: enviar arquivo ---- */
  function etapaUpload() {
    return (
      '<div class="card rv"><div class="card__head"><h3>1. Enviar a lista de participantes</h3></div>' +
      '<div class="card__pad">' +

      '<div class="upload-zone upload-zone--big" data-upload-zone>' +
      '<div class="upload-zone__icon">' + ico("upload") + "</div>" +
      '<div class="upload-zone__title">Arraste o arquivo aqui</div>' +
      '<div class="upload-zone__sub">ou toque para selecionar no computador ou no celular</div>' +
      '<button class="btn btn--primary btn--sm" type="button" data-action="simular-arquivo">' +
      (wiz.arquivo ? "Escolher outro arquivo" : "Selecionar arquivo") + "</button>" +
      '<div class="upload-zone__tipos">' +
      '<span class="tipo tipo--ideal">.xlsx</span><span class="tipo tipo--ideal">.xls</span>' +
      '<span class="tipo tipo--ideal">.csv</span>' +
      '<span class="tipo">.docx</span><span class="tipo">.pdf</span>' +
      '<span class="tipo">.png</span><span class="tipo">.jpg</span><span class="tipo">.jpeg</span>' +
      "</div></div>" +

      '<div class="aviso-import">' +
      '<strong>Sobre os formatos aceitos</strong>' +
      "<p><strong>Excel (.xlsx/.xls) e CSV (.csv) são os formatos ideais</strong> para importação em lote: as colunas são lidas de forma estruturada e o mapeamento é direto.</p>" +
      "<p><strong>Word (.docx), PDF (.pdf) e imagens (.png/.jpg/.jpeg) são documentos de apoio.</strong> " +
      "Eles podem ser anexados à turma, mas <strong>não há garantia de leitura automática perfeita</strong>: " +
      "nesses casos o sistema faz uma extração preliminar e <strong>exige a etapa de revisão</strong> antes de gerar qualquer certificado — " +
      "ou o preenchimento manual dos participantes.</p>" +
      "</div>" +

      (wiz.arquivo
        ? '<div class="arquivo-ok"><div class="arquivo-ok__ico">' + ico("table") + "</div>" +
          '<div class="arquivo-ok__b"><strong>' + esc(wiz.arquivo.nome) + "</strong>" +
          '<span class="arquivo-ok__meta">' + esc(wiz.arquivo.tamanho) + " · " + esc(wiz.arquivo.formato) + "</span>" +
          '<span class="status status--concluido">Arquivo processado</span>' +
          '<span class="arquivo-ok__found">Encontrados: <strong>' + wiz.encontrados.length + " participantes</strong></span></div>" +
          '<button class="btn btn--light btn--sm" data-remover-arquivo>Remover</button></div>' +

          '<div class="table-wrap table-cards" style="margin-top:16px"><table class="table"><thead><tr>' +
          "<th>☑</th><th>Nome</th><th>CPF</th><th>Empresa</th><th>Treinamento</th><th>Status</th></tr></thead><tbody>" +
          wiz.encontrados.slice(0, 3).map(function (p) {
            return "<tr><td data-l=''><span class='chk-ok'>☑</span></td>" +
              '<td data-l="Nome" class="cell-strong">' + esc(p.nome) + "</td>" +
              '<td data-l="CPF">' + esc(p.cpf || "—") + "</td>" +
              '<td data-l="Empresa">' + esc(p.empresa) + "</td>" +
              '<td data-l="Treinamento">' + esc(p.treinamento) + "</td>" +
              '<td data-l="Status"><span class="status ' + (p.status === "Pronto" ? "status--active" : "status--review") + '">' + p.status + "</span></td></tr>";
          }).join("") +
          '<tr><td colspan="6" class="table-more">+ ' + (wiz.encontrados.length - 3) + " outros participantes encontrados no arquivo</td></tr>" +
          "</tbody></table></div>"
        : '<div class="demo-note">' +
          "<strong>Demonstração:</strong> ao clicar em <em>Selecionar arquivo</em>, o sistema simula a leitura do arquivo " +
          "<code>participantes-nr18.xlsx</code>. <strong>Nenhum arquivo é enviado a servidor nesta etapa</strong> — " +
          "os participantes exibidos são fictícios e servem para demonstrar o fluxo de revisão.</div>") +

      "</div></div>" +

      '<div class="wizard-foot">' +
      '<button class="btn btn--light" data-action="cert-voltar">Cancelar</button>' +
      '<button class="btn btn--primary" data-action="wiz-mapear"' + (wiz.arquivo ? "" : " disabled") + ">Mapear colunas</button>" +
      "</div>"
    );
  }

  /* ---- Etapa 2: mapear colunas ---- */
  var DESTINOS = ["Nome do participante", "CPF", "Empresa", "Treinamento", "Data do treinamento",
    "Carga horária", "Local", "Instrutor", "Observações", "Ignorar esta coluna"];

  function etapaMapear() {
    return (
      '<div class="card rv"><div class="card__head"><h3>2. Mapear as colunas da planilha</h3>' +
      '<span class="card__head-sub">' + esc(wiz.arquivo ? wiz.arquivo.nome : "participantes-nr18.xlsx") + "</span></div>" +
      '<div class="card__pad">' +
      '<p class="modal__hint">Confirme qual coluna do arquivo corresponde a cada informação do certificado. ' +
      "O mapeamento sugerido já vem preenchido — ajuste se a planilha do cliente tiver outro cabeçalho.</p>" +
      '<div class="mapear">' +
      '<div class="mapear__head"><span>Coluna no arquivo</span><span></span><span>Campo no certificado</span></div>' +
      wiz.colunas.map(function (c, i) {
        return '<div class="mapear__row">' +
          '<span class="mapear__origem">' + esc(c.origem) + "</span>" +
          '<span class="mapear__seta">→</span>' +
          '<select class="field__input mapear__sel" data-mapear="' + i + '">' +
          DESTINOS.map(function (d) { return '<option' + (d === c.destino ? " selected" : "") + ">" + esc(d) + "</option>"; }).join("") +
          "</select></div>";
      }).join("") +
      "</div>" +
      '<button class="btn btn--light btn--sm" data-toast-action="Mapeamento salvo para reutilização — demonstração visual." ' +
      'style="margin-top:12px">Salvar mapeamento para as próximas importações</button>' +
      "</div></div>" +
      '<div class="wizard-foot">' +
      '<button class="btn btn--light" data-action="wiz-voltar">Voltar</button>' +
      '<button class="btn btn--primary" data-action="wiz-revisar">Continuar para revisão</button>' +
      "</div>"
    );
  }

  /* ---- Etapa 3: revisão ---- */
  function etapaRevisar() {
    var pr = prontos().length, rv = aRevisar().length;
    var lista = aRevisar();
    return (
      '<div class="card rv"><div class="card__head"><h3>3. Revisar antes de gerar</h3>' +
      '<span class="card__head-sub">Nada é gerado sem passar por aqui</span></div>' +
      '<div class="card__pad">' +
      '<div class="rev-resumo">' +
      '<div class="rev-resumo__i"><span class="rev-resumo__n">' + wiz.encontrados.length + '</span><span class="rev-resumo__l">participantes encontrados</span></div>' +
      '<div class="rev-resumo__i rev-resumo__i--ok"><span class="rev-resumo__n">' + pr + '</span><span class="rev-resumo__l">prontos para emitir</span></div>' +
      '<div class="rev-resumo__i' + (rv ? " rev-resumo__i--warn" : "") + '"><span class="rev-resumo__n">' + rv + '</span><span class="rev-resumo__l">precisam de revisão</span></div>' +
      "</div>" +

      (rv
        ? '<div class="rev-lista">' + lista.map(function (p) {
            return '<div class="rev-item">' +
              '<div class="rev-item__top"><div class="rev-item__b">' +
              "<strong>" + esc(p.nome) + "</strong>" +
              '<span>' + esc(p.empresa) + " · " + esc(p.treinamento) + " · CPF " + esc(p.cpf || "não informado") + "</span></div>" +
              '<span class="status status--review">Revisar</span></div>' +
              '<div class="rev-item__probs">' + p.problemas.map(function (x) { return '<span class="prob">' + esc(x) + "</span>"; }).join("") + "</div>" +
              '<div class="rev-item__acoes">' +
              '<button class="btn btn--light btn--sm" data-action="wiz-editar" data-idx="' + p.idx + '">Editar</button>' +
              '<button class="btn btn--light btn--sm" data-action="wiz-ignorar" data-idx="' + p.idx + '">Ignorar participante</button>' +
              '<button class="btn btn--ghost btn--sm" data-action="wiz-corrigir" data-idx="' + p.idx + '">Corrigir informação</button>' +
              "</div></div>";
          }).join("") + "</div>"
        : '<div class="rev-ok"><span class="rev-ok__ico">✓</span><div><strong>Todos os participantes estão prontos para emissão.</strong>' +
          "<span>Nenhum problema encontrado nos dados importados.</span></div></div>") +

      '<div class="aviso-import aviso-import--soft">' +
      "<strong>Por que esta etapa existe</strong>" +
      "<p>Planilhas chegam com CPF ausente, nome incompleto ou treinamento não identificado. " +
      "O sistema <strong>não emite certificados cegamente</strong>: ele separa o que está pronto do que precisa de conferência humana " +
      "e só gera depois da sua decisão.</p>" +
      "</div>" +
      "</div></div>" +
      '<div class="wizard-foot">' +
      '<button class="btn btn--light" data-action="wiz-voltar">Voltar</button>' +
      '<button class="btn btn--primary" data-action="wiz-configurar">Continuar</button>' +
      "</div>"
    );
  }

  /* ---- Etapa 4: configurar ---- */
  function etapaConfigurar() {
    var cfg = wiz.config;
    var tr = treinamentoPorId(cfg.treinamentoId);
    var exemplo = prontos()[0] || { nome: "Participante da turma", cpf: "***.***.***-**" };
    return (
      '<div class="card rv"><div class="card__head"><h3>4. Configurar os certificados</h3>' +
      '<span class="card__head-sub">' + prontos().length + " certificados serão gerados</span></div>" +
      '<div class="card__pad">' +
      '<div class="grid-2 cfg-grid">' +
      '<div class="form-grid">' +
      '<label class="field"><span class="field__label">Treinamento</span>' +
      '<select class="field__input" id="cfg-treinamento">' +
      TREINAMENTOS.map(function (t) {
        return '<option value="' + t.id + '"' + (t.id === cfg.treinamentoId ? " selected" : "") + ">" + esc(t.nr !== "—" ? t.nr + " — " + t.nome : t.nome) + "</option>";
      }).join("") + "</select></label>" +
      '<label class="field"><span class="field__label">Empresa</span>' +
      '<select class="field__input" id="cfg-empresa">' +
      MS.CLIENTES.map(function (c) { return '<option' + (c.nome === cfg.empresa ? " selected" : "") + ">" + esc(c.nome) + "</option>"; }).join("") +
      "</select></label>" +
      '<div class="form-row-2">' +
      '<label class="field"><span class="field__label">Data</span><input class="field__input" id="cfg-data" value="' + fmtDate(cfg.data) + '" /></label>' +
      '<label class="field"><span class="field__label">Carga horária</span><input class="field__input" id="cfg-carga" value="' + cfg.cargaHoraria + '" /></label>' +
      "</div>" +
      '<div class="form-row-2">' +
      '<label class="field"><span class="field__label">Instrutor</span><select class="field__input" id="cfg-instrutor">' +
      INSTRUTORES.map(function (i) { return '<option' + (i === cfg.instrutor ? " selected" : "") + ">" + esc(i) + "</option>"; }).join("") + "</select></label>" +
      '<label class="field"><span class="field__label">Responsável</span><select class="field__input" id="cfg-resp">' +
      RESPONSAVEIS.map(function (i) { return '<option' + (i === cfg.responsavel ? " selected" : "") + ">" + esc(i) + "</option>"; }).join("") + "</select></label>" +
      "</div>" +
      '<div class="form-row-2">' +
      '<label class="field"><span class="field__label">Local</span><input class="field__input" id="cfg-local" value="' + esc(cfg.local) + '" /></label>' +
      '<label class="field"><span class="field__label">Modelo</span><select class="field__input" id="cfg-modelo">' +
      ["Modelo padrão MS Consultoria", "Modelo institucional — fundo branco"].map(function (m) {
        return '<option' + (m === cfg.modelo ? " selected" : "") + ">" + esc(m) + "</option>";
      }).join("") + "</select></label>" +
      "</div>" +
      '<div class="card" style="padding:12px 14px;background:var(--green-50);border-color:var(--green-100);font-size:.84rem">' +
      "Validade definida pela norma: <strong>" + esc(tr.nr !== "—" ? tr.nr : tr.nome) + " — " + tr.validadeMeses + " meses</strong>. " +
      "O vencimento entra automaticamente no histórico e nos alertas.</div>" +
      "</div>" +

      '<div class="cfg-preview"><span class="cfg-preview__label">Pré-visualização</span>' +
      previewCertificado({
        participante: exemplo.nome, cpf: exemplo.cpf, empresa: cfg.empresa, treinamento: tr.nome, nr: tr.nr,
        cargaHoraria: cfg.cargaHoraria, data: cfg.data, local: cfg.local,
        instrutor: cfg.instrutor, responsavel: cfg.responsavel, codigo: "MS-2026-" + String(prontos().length).padStart(5, "0")
      }) +
      "</div>" +
      "</div></div></div>" +
      '<div class="wizard-foot">' +
      '<button class="btn btn--light" data-action="wiz-voltar">Voltar</button>' +
      '<button class="btn btn--primary" data-action="wiz-gerar">Gerar ' + prontos().length + " certificados</button>" +
      "</div>"
    );
  }

  /* ---- Etapa 5: geração em lote ---- */
  function etapaGerar() {
    if (!wiz.gerado) {
      wiz.gerado = gerarEmLote();
    }
    var lista = wiz.gerado;
    return (
      '<div class="card rv"><div class="card__head"><h3>5. Certificados preparados</h3>' +
      '<span class="status status--concluido">✓ ' + lista.length + " certificados preparados</span></div>" +
      '<div class="card__pad">' +
      '<div class="rev-ok"><span class="rev-ok__ico">✓</span><div>' +
      "<strong>" + lista.length + " certificados preparados</strong>" +
      "<span>" + esc(wiz.config.empresa) + " · " + esc(treinamentoPorId(wiz.config.treinamentoId).nome) + " · " + fmtDate(wiz.config.data) + "</span></div></div>" +
      '<div class="table-wrap table-cards" style="margin-top:16px"><table class="table"><thead><tr>' +
      "<th>Participante</th><th>Treinamento</th><th>Código</th><th>Ações</th></tr></thead><tbody>" +
      lista.map(function (c) {
        return '<tr><td data-l="Participante" class="cell-strong">' + esc(c.participante) + "</td>" +
          '<td data-l="Treinamento">' + esc(c.nr !== "—" ? c.nr : c.treinamento) + "</td>" +
          '<td data-l="Código">' + esc(c.codigo) + "</td>" +
          '<td data-l="Ações"><div class="row-actions">' +
          '<button class="link-btn" data-action="cert-ver" data-cert="' + c.id + '">Visualizar</button>' +
          '<button class="link-btn" data-toast-action="Download do certificado — demonstração visual.">Baixar</button>' +
          "</div></td></tr>";
      }).join("") +
      "</tbody></table></div>" +
      '<div class="lote-acoes">' +
      '<button class="btn btn--primary" data-toast-action="Download de todos os certificados — demonstração visual.">Baixar todos</button>' +
      '<button class="btn btn--light" data-toast-action="Exportação em ZIP — demonstração visual.">Exportar ZIP</button>' +
      '<button class="btn btn--light" data-toast-action="PDF único com todos os certificados — demonstração visual.">Gerar PDF único</button>' +
      "</div>" +
      '<div class="demo-note">' +
      "<strong>Demonstração:</strong> os certificados acima existem na memória desta apresentação. " +
      "A geração real de PDF, o ZIP e o download serão implementados na versão final, com backend.</div>" +
      "</div></div>" +
      '<div class="wizard-foot">' +
      '<button class="btn btn--light" data-action="cert-historico">Ver no histórico</button>' +
      '<button class="btn btn--primary" data-action="cert-nova-importacao">Nova importação</button>' +
      "</div>"
    );
  }

  // Cria os certificados do lote a partir dos participantes prontos.
  function gerarEmLote() {
    var cfg = wiz.config;
    var tr = treinamentoPorId(cfg.treinamentoId);
    var empresa = MS.CLIENTES.filter(function (c) { return c.nome === cfg.empresa; })[0];
    var out = [];
    prontos().forEach(function (p, i) {
      var c = {
        id: "lote-" + Date.now() + "-" + i,
        codigo: "MS-" + cfg.data.getFullYear() + "-L" + String(i + 1).padStart(4, "0"),
        participante: p.nome,
        cpf: p.cpf || MS.maskCpf(),
        treinamentoId: cfg.treinamentoId,
        nr: tr.nr,
        treinamento: tr.nome,
        clienteId: empresa ? empresa.id : "c5",
        obraId: empresa && empresa.obras[0] ? empresa.obras[0].id : "o9",
        turmaId: null,
        emissao: cfg.data,
        validade: validadeDe(cfg.data, cfg.treinamentoId),
        cargaHoraria: cfg.cargaHoraria,
        instrutor: cfg.instrutor,
        responsavel: cfg.responsavel,
        local: cfg.local,
        modelo: cfg.modelo,
        status: "Preparado (demonstração)",
        problemas: [],
        demo: true
      };
      CERTIFICADOS.push(c);
      out.push(c);
    });
    MS.showToast(out.length + " certificados preparados. A geração real de arquivos será feita na versão final.");
    return out;
  }

  /* ======================================================================
     14. TELA — CERTIFICADO INDIVIDUAL
     ====================================================================== */
  function renderIndividual() {
    MS.showApp();
    MS.setCrumbs([{ label: "Certificados", href: "certificados" }, { label: "Novo certificado" }]);
    MS.setView(
      '<div class="page-head rv"><div><h1 class="page-head__title">Novo certificado</h1>' +
      '<p class="page-head__sub">Emita um certificado individual quando não houver turma importada.</p></div></div>' +
      '<div class="grid-2 cfg-grid">' +
      '<div class="card rv"><div class="card__head"><h3>Dados do certificado</h3></div>' +
      '<div class="card__pad"><div class="form-grid">' +
      '<label class="field"><span class="field__label">Nome completo</span><input class="field__input" id="ci-nome" value="Mariana Alves Correia" /></label>' +
      '<div class="form-row-2">' +
      '<label class="field"><span class="field__label">CPF</span><input class="field__input" id="ci-cpf" value="***.***.***-**" /></label>' +
      '<label class="field"><span class="field__label">Empresa</span><select class="field__input" id="ci-empresa">' +
      MS.CLIENTES.map(function (c) { return "<option>" + esc(c.nome) + "</option>"; }).join("") + "</select></label>" +
      "</div>" +
      '<label class="field"><span class="field__label">Treinamento</span><select class="field__input" id="ci-treinamento">' +
      TREINAMENTOS.map(function (t) { return '<option value="' + t.id + '">' + esc(t.nr !== "—" ? t.nr + " — " + t.nome : t.nome) + "</option>"; }).join("") + "</select></label>" +
      '<div class="form-row-2">' +
      '<label class="field"><span class="field__label">NR</span><input class="field__input" id="ci-nr" value="NR 18" /></label>' +
      '<label class="field"><span class="field__label">Data</span><input class="field__input" id="ci-data" value="15/09/2026" /></label>' +
      "</div>" +
      '<div class="form-row-2">' +
      '<label class="field"><span class="field__label">Carga horária</span><input class="field__input" id="ci-carga" value="6" /></label>' +
      '<label class="field"><span class="field__label">Local</span><input class="field__input" id="ci-local" value="Recife — PE" /></label>' +
      "</div>" +
      '<div class="form-row-2">' +
      '<label class="field"><span class="field__label">Instrutor</span><select class="field__input" id="ci-instrutor">' +
      INSTRUTORES.map(function (i) { return "<option>" + esc(i) + "</option>"; }).join("") + "</select></label>" +
      '<label class="field"><span class="field__label">Responsável</span><select class="field__input" id="ci-resp">' +
      RESPONSAVEIS.map(function (i) { return "<option>" + esc(i) + "</option>"; }).join("") + "</select></label>" +
      "</div>" +
      '<div class="form-row-2" style="margin-top:4px">' +
      '<button class="btn btn--primary" data-action="ci-gerar">Gerar certificado</button>' +
      '<button class="btn btn--light" data-action="ci-preview">Atualizar pré-visualização</button>' +
      "</div>" +
      '<div class="demo-note">CPF exibido mascarado nesta demonstração. Os dados são fictícios.</div>' +
      "</div></div></div>" +
      '<div class="card rv"><div class="card__head"><h3>Pré-visualização</h3></div>' +
      '<div class="card__pad cert-preview-wrap" id="ci-preview">' + previewIndividual() + "</div></div>" +
      "</div>"
    );
  }

  function previewIndividual() {
    function v(id, dv) { var el = document.getElementById(id); return el && el.value ? el.value : dv; }
    var tid = v("ci-treinamento", "");
    var tr = tid ? treinamentoPorId(tid) : treinamentoPorId("nr18");
    return previewCertificado({
      participante: v("ci-nome", "Mariana Alves Correia"),
      cpf: v("ci-cpf", MS.maskCpf()),
      empresa: v("ci-empresa", "Construtora Horizonte"),
      treinamento: tr.nome,
      nr: tr.nr,
      cargaHoraria: v("ci-carga", "6"),
      data: MS.NOW,
      local: v("ci-local", "Recife — PE"),
      instrutor: v("ci-instrutor", "Maria Silva"),
      responsavel: v("ci-resp", "Maria Silva"),
      codigo: "MS-2026-INDIVIDUAL"
    });
  }

  /* ======================================================================
     15. MODAL — VISUALIZAR CERTIFICADO
     ====================================================================== */
  MS.actions["cert-ver"] = function (el) {
    var id = el.getAttribute("data-cert");
    var c = CERTIFICADOS.filter(function (x) { return x.id === id; })[0];
    if (!c) return;
    MS.openModal(
      MS.modalHeader("Certificado " + esc(c.codigo)) +
      '<div class="modal__body cert-preview-wrap">' +
      previewCertificado({
        participante: c.participante, cpf: c.cpf, empresa: empresaDe(c), treinamento: c.treinamento, nr: c.nr,
        cargaHoraria: c.cargaHoraria, data: c.emissao, local: c.local,
        instrutor: c.instrutor, responsavel: c.responsavel, codigo: c.codigo
      }) +
      '<div class="cert-meta">' +
      '<div><span class="nc-box__k">Turma</span><span class="nc-box__v">' + (c.turmaId ? fmtDate(turmaPorId(c.turmaId).data) : "Certificado individual") + "</span></div>" +
      '<div><span class="nc-box__k">Obra / Unidade</span><span class="nc-box__v">' + esc(nomeObraDe(c)) + "</span></div>" +
      '<div><span class="nc-box__k">Emissão</span><span class="nc-box__v">' + fmtDate(c.emissao) + "</span></div>" +
      '<div><span class="nc-box__k">Validade</span><span class="nc-box__v">' + fmtDate(c.validade) + " · " + MS.vencTexto(c.validade) + "</span></div>" +
      "</div>" +
      '<div class="demo-note">Pré-visualização demonstrativa. O PDF real e a validação por QR Code entram na versão final.</div>' +
      "</div>" +
      '<div class="modal__foot">' +
      '<button class="btn btn--light" data-modal-close>Fechar</button>' +
      '<button class="btn btn--light" data-toast-action="Reemissão solicitada — demonstração visual.">Reemitir</button>' +
      '<button class="btn btn--primary" data-toast-action="Download do certificado — demonstração visual.">Baixar</button>' +
      "</div>"
    );
  };

  MS.actions["cert-editar"] = function (el) {
    var c = CERTIFICADOS.filter(function (x) { return x.id === el.getAttribute("data-cert"); })[0];
    if (!c) return;
    MS.openModal(
      MS.modalHeader("Editar certificado") +
      '<div class="modal__body"><div class="form-grid">' +
      '<label class="field"><span class="field__label">Nome completo</span><input class="field__input" id="ce-nome" value="' + esc(c.participante) + '" /></label>' +
      '<div class="form-row-2">' +
      '<label class="field"><span class="field__label">CPF</span><input class="field__input" value="' + esc(c.cpf || MS.maskCpf()) + '" disabled /></label>' +
      '<label class="field"><span class="field__label">Carga horária</span><input class="field__input" id="ce-carga" value="' + c.cargaHoraria + '" /></label>' +
      "</div>" +
      '<label class="field"><span class="field__label">Treinamento</span><input class="field__input" value="' + esc(c.nr !== "—" ? c.nr + " — " + c.treinamento : c.treinamento) + '" disabled /></label>' +
      '<div class="demo-note">Alteração demonstrativa — a edição persiste apenas nesta sessão.</div>' +
      "</div></div>" +
      '<div class="modal__foot"><button class="btn btn--light" data-modal-close>Cancelar</button>' +
      '<button class="btn btn--primary" data-modal-action="cert-salvar-edicao" data-cert="' + c.id + '">Salvar alterações</button></div>'
    );
  };

  MS.actions["cert-salvar-edicao"] = function (el) {
    var c = CERTIFICADOS.filter(function (x) { return x.id === el.getAttribute("data-cert"); })[0];
    if (c) {
      var n = document.getElementById("ce-nome");
      var g = document.getElementById("ce-carga");
      if (n && n.value) c.participante = n.value;
      if (g && g.value) c.cargaHoraria = g.value;
    }
    MS.closeModal();
    MS.showToast("Certificado atualizado (demonstração).");
    MS.rerender();
  };

  MS.actions["cert-importar"] = function () { novoWizard(); MS.go("certificados/importar"); MS.rerender(); };
  MS.actions["cert-nova-importacao"] = function () { novoWizard(); MS.rerender(); };
  MS.actions["cert-voltar"] = function () { wiz = null; MS.go("certificados"); MS.rerender(); };
  MS.actions["cert-individual"] = function () { MS.go("certificados/novo"); MS.rerender(); };
  MS.actions["cert-historico"] = function () { MS.go("certificados/historico"); MS.rerender(); };
  MS.actions["cert-modelos"] = function () { MS.go("certificados/modelos"); MS.rerender(); };
  MS.actions["cert-turmas"] = function () { MS.go("certificados/turmas"); MS.rerender(); };

  MS.actions["wiz-mapear"] = function () { irPara(2); };
  MS.actions["wiz-voltar"] = function () { irPara(wiz.etapa - 1); };
  MS.actions["wiz-revisar"] = function () { irPara(3); };
  MS.actions["wiz-configurar"] = function () { irPara(4); };
  MS.actions["wiz-gerar"] = function () { irPara(5); };

  MS.actions["simular-arquivo"] = function () {
    wiz.arquivo = { nome: "participantes-nr18.xlsx", tamanho: "38 KB", formato: "Excel (.xlsx) — planilha estruturada" };
    wiz.encontrados = participantesDoArquivo();
    MS.showToast("Arquivo processado (demonstração). Nenhum arquivo foi enviado a servidor.");
    MS.rerender();
  };
  MS.actions["remover-arquivo"] = function () {
    wiz.arquivo = null; wiz.encontrados = null; wiz.gerado = false;
    MS.showToast("Arquivo removido da demonstração.");
    MS.rerender();
  };

  MS.actions["wiz-ignorar"] = function (el) {
    var idx = Number(el.getAttribute("data-idx"));
    wiz.ignorados[idx] = true;
    MS.showToast("Participante ignorado — não receberá certificado nesta geração.");
    MS.rerender();
  };

  MS.actions["wiz-corrigir"] = function (el) {
    var idx = Number(el.getAttribute("data-idx"));
    var p = wiz.encontrados.filter(function (x) { return x.idx === idx; })[0];
    if (!p) return;
    MS.openModal(
      MS.modalHeader("Corrigir informação") +
      '<div class="modal__body"><div class="form-grid">' +
      '<label class="field"><span class="field__label">Nome completo</span><input class="field__input" id="wc-nome" value="' + esc(p.nome) + '" /></label>' +
      '<label class="field"><span class="field__label">CPF</span><input class="field__input" id="wc-cpf" placeholder="Informe o CPF do participante" value="' + esc(p.cpf || "") + '" /></label>' +
      '<label class="field"><span class="field__label">Treinamento</span>' +
      '<select class="field__input" id="wc-treinamento">' +
      TREINAMENTOS.map(function (t) { return "<option>" + esc(t.nr !== "—" ? t.nr + " — " + t.nome : t.nome) + "</option>"; }).join("") +
      "</select></label>" +
      '<div class="demo-note">Correção demonstrativa. Na versão final, o CPF informado será gravado com segurança no banco.</div>' +
      "</div></div>" +
      '<div class="modal__foot"><button class="btn btn--light" data-modal-close>Cancelar</button>' +
      '<button class="btn btn--primary" data-modal-action="wiz-salvar-correcao" data-idx="' + idx + '">Salvar correção</button></div>'
    );
  };

  MS.actions["wiz-editar"] = MS.actions["wiz-corrigir"];

  MS.actions["wiz-salvar-correcao"] = function (el) {
    var idx = Number(el.getAttribute("data-idx"));
    var p = wiz.encontrados.filter(function (x) { return x.idx === idx; })[0];
    if (!p) { MS.closeModal(); return; }
    var nome = (document.getElementById("wc-nome") || {}).value || "";
    var cpf = (document.getElementById("wc-cpf") || {}).value || "";
    var trein = (document.getElementById("wc-treinamento") || {}).value || "";
    var probs = p.problemas.slice();
    if (nome.split(" ").filter(Boolean).length >= 2) probs = probs.filter(function (x) { return x !== "Nome incompleto"; });
    if (cpf.trim().length >= 11) { p.cpf = MS.maskCpf(); probs = probs.filter(function (x) { return x !== "CPF ausente"; }); }
    if (trein && trein.indexOf("não identificado") < 0) {
      p.treinamento = trein;
      probs = probs.filter(function (x) { return x !== "Treinamento não identificado"; });
    }
    if (nome) p.nome = nome;
    p.problemas = probs;
    p.status = probs.length ? "Revisar" : "Pronto";
    MS.closeModal();
    MS.showToast(probs.length ? "Informação atualizada — ainda há pendências neste participante." : "Participante corrigido e pronto para emissão.");
    MS.rerender();
  };

  MS.actions["ci-gerar"] = function () {
    var nome = (document.getElementById("ci-nome") || {}).value || "";
    if (!nome.trim()) { MS.showToast("Informe o nome completo do participante."); return; }
    var tid = (document.getElementById("ci-treinamento") || {}).value || "nr18";
    var tr = treinamentoPorId(tid);
    var emp = (document.getElementById("ci-empresa") || {}).value || "Construtora Horizonte";
    var cl = MS.CLIENTES.filter(function (c) { return c.nome === emp; })[0];
    var nova = {
      id: "ind-" + Date.now(),
      codigo: "MS-" + MS.NOW.getFullYear() + "-I" + String(CERTIFICADOS.length + 1).padStart(4, "0"),
      participante: nome,
      cpf: (document.getElementById("ci-cpf") || {}).value || MS.maskCpf(),
      treinamentoId: tid, nr: tr.nr, treinamento: tr.nome,
      clienteId: cl ? cl.id : "c5",
      obraId: cl && cl.obras[0] ? cl.obras[0].id : "o9",
      turmaId: null,
      emissao: MS.NOW,
      validade: validadeDe(MS.NOW, tid),
      cargaHoraria: (document.getElementById("ci-carga") || {}).value || tr.cargaPadrao,
      instrutor: (document.getElementById("ci-instrutor") || {}).value || "Maria Silva",
      responsavel: (document.getElementById("ci-resp") || {}).value || "Maria Silva",
      local: (document.getElementById("ci-local") || {}).value || "Recife — PE",
      modelo: "Modelo padrão MS Consultoria",
      status: "Emitido", problemas: [], demo: true
    };
    CERTIFICADOS.unshift(nova);
    MS.showToast("Certificado individual gerado (demonstração). Código " + nova.codigo + ".");
    MS.actions["cert-ver"]({ getAttribute: function () { return nova.id; } });
  };
  MS.actions["ci-preview"] = function () {
    var el = document.getElementById("ci-preview");
    if (el) { el.innerHTML = previewIndividual(); MS.wireView(); }
    MS.showToast("Pré-visualização atualizada.");
  };

  /* ======================================================================
     16. DELEGAÇÃO — upload simulado e selects do assistente
     ====================================================================== */
  // Efeito visual de "enviando" na área de upload (nada sai do navegador).
  document.addEventListener("click", function (e) {
    var alvo = e.target.closest ? e.target.closest("[data-upload-zone] [data-action='simular-arquivo']") : null;
    if (!alvo) return;
    var zona = alvo.closest("[data-upload-zone]");
    if (!zona) return;
    zona.classList.add("is-loading");
    var txt = zona.querySelector(".upload-zone__title");
    if (txt) txt.textContent = "Lendo a planilha...";
    setTimeout(function () { zona.classList.remove("is-loading"); }, 600);
  });

  document.addEventListener("change", function (e) {
    var t = e.target;
    if (!t || !t.id) return;
    if (!wiz) return;
    if (t.id === "cfg-treinamento") { wiz.config.treinamentoId = t.value; MS.rerender(); }
    else if (t.id === "cfg-empresa") { wiz.config.empresa = t.value; }
    else if (t.id === "cfg-carga") { wiz.config.cargaHoraria = t.value; }
    else if (t.id === "cfg-local") { wiz.config.local = t.value; }
    else if (t.id === "cfg-instrutor") { wiz.config.instrutor = t.value; }
    else if (t.id === "cfg-resp") { wiz.config.responsavel = t.value; }
    else if (t.id === "cfg-modelo") { wiz.config.modelo = t.value; }
    else if (t.id === "cfg-data") {
      var p = String(t.value).split("/");
      var d = new Date(Number(p[2]), Number(p[1]) - 1, Number(p[0]));
      if (!isNaN(d.getTime())) wiz.config.data = d;
    }
  });

  // Mapeamento de colunas (selects)
  document.addEventListener("change", function (e) {
    var t = e.target;
    if (t && t.getAttribute && t.getAttribute("data-mapear") != null && wiz) {
      wiz.colunas[Number(t.getAttribute("data-mapear"))].destino = t.value;
      MS.showToast("Coluna mapeada para “" + t.value + "”.");
    }
  });

  /* ======================================================================
     17. ROTAS
     ====================================================================== */
  MS.registerRoute("certificados", function (parts) {
    var sub = parts[1];
    if (!sub) return renderDashboard();
    if (sub === "importar") return renderImportar(parts);
    if (sub === "turma") return renderTurma(parts);
    if (sub === "turmas") return renderTurmas();
    if (sub === "historico") return renderHistorico();
    if (sub === "modelos") return renderModelos();
    if (sub === "novo") return renderIndividual();
    return renderDashboard();
  });
  MS.registerRoute("certificado", function () { renderIndividual(); });

  // Exposição para inspeção da demonstração
  window.MS_CERTIFICADOS = {
    TURMAS: TURMAS,
    CERTIFICADOS: CERTIFICADOS,
    TREINAMENTOS: TREINAMENTOS,
    indicadores: indicadores,
    certificadosAvencer: certificadosAvencer,
    statusValidade: statusValidade,
    turmasDoCliente: turmasDoCliente,
    novoWizard: novoWizard,
    get wiz() { return wiz; },
    renderDashboard: renderDashboard,
    renderHistorico: renderHistorico
  };
})();
