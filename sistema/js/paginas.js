/* ==========================================================================
   MS Consultoria — Sistema interno · PÁGINAS COMPLEMENTARES
   ==========================================================================
   DEMONSTRAÇÃO VISUAL/FUNCIONAL. Todos os dados são FICTÍCIOS.

   Este arquivo preenche as telas que antes apareciam como "em construção"
   e acrescenta os novos blocos ao Dashboard, SEM alterar nada do que já
   existia:

     · Agenda             (fiscalizações, treinamentos, visitas, vencimentos,
                           retornos e correções de não conformidade)
     · Documentos         (central de arquivos com categorias e ações)
     · Notificações       (alertas de SST, certificados e documentos)
     · Equipe             (equipe técnica, obras e situação)
     · Treinamentos       (turmas → certificados)
     · Blocos extras do Dashboard (fiscalizações recentes, pendências de
       segurança, extintores a vencer, treinamentos, certificados, obras
       ativas e o bloco ATENÇÃO)

   Todas as rotas são registradas via MS.registerRoute — o roteador do
   sistema dá prioridade a elas e nada mais precisa ser alterado.

   O QUE É DEMO: nenhum arquivo é enviado ou baixado; "Visualizar", "Baixar",
   "Compartilhar", "Renomear" e "Excluir" apenas demonstram o fluxo.
   ========================================================================== */
(function () {
  "use strict";

  var MS = window.MS;
  if (!MS) { console.error("[MS] núcleo não carregado — as páginas complementares não iniciaram."); return; }

  var esc = MS.esc, iso = MS.iso, fmtDate = MS.fmtDate;

  // Módulos carregados antes deste arquivo (podem não existir — tudo é opcional).
  var FISC = window.MS_FISCALIZACOES || null;
  var CERT = window.MS_CERTIFICADOS || null;

  /* ======================================================================
     ÍCONES
     ====================================================================== */
  function ico(nome) {
    var p = {
      agenda: '<path fill="currentColor" d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>',
      file: '<path fill="currentColor" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/>',
      bell: '<path fill="currentColor" d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2zm6-6v-5a6 6 0 0 0-4-5.7V5a2 2 0 0 0-4 0v.3A6 6 0 0 0 6 11v5l-2 2v1h16v-1l-2-2z"/>',
      user: '<path fill="currentColor" d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"/>',
      train: '<path fill="currentColor" d="M22 18V3H2v15H0v2h24v-2h-2zm-2 0H4V5h16v13zM6 7h12v2H6V7zm0 4h12v2H6v-2zm0 4h8v2H6v-2z"/>',
      cert: '<path fill="currentColor" d="M12 2 3 6v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V6l-9-4z"/>',
      shield: '<path fill="currentColor" d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3z"/>',
      warn: '<path fill="currentColor" d="M12 2 1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z"/>',
      fire: '<path fill="currentColor" d="M13.5 2c.5 2.5-.5 4.5-2 6-1.5 1.5-3 3-3 5.5A5.5 5.5 0 0 0 14 19a5.5 5.5 0 0 0 5.5-5.5c0-4-3-7-6-11.5zM9 20.5C6.5 20 4 18 4 15c0-3 2-5 3.5-6.5C9 7 10 5.5 10 3c-3 2-6 5-6 9 0 4 2.5 7.5 5 8.5z"/>',
      clock: '<path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 11H7v-2h4V6h2v7z"/>',
      check: '<path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/>',
      obra: '<path fill="currentColor" d="M19 8h-1V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2zM8 6h8v2H8V6zm11 12H5v-4h14v4zm0-6H5v-2h14v2z"/>'
    };
    return '<svg viewBox="0 0 24 24">' + (p[nome] || p.file) + "</svg>";
  }

  /* ======================================================================
     1. AGENDA
     ----------------------------------------------------------------------
     Fiscalizações, treinamentos, visitas, vencimentos, retornos e correções
     de não conformidade — vindos dos módulos quando disponíveis.
     ====================================================================== */
  var AGENDA = [
    {
      data: iso(18, 9, 9, 0), tipo: "Fiscalização", titulo: "Fiscalização — Edifício Aurora",
      cliente: "Construtora Horizonte", obra: "Edifício Aurora", local: "Recife — PE",
      responsavel: "Maria Silva", href: "#/fiscalizacao/f1/checklist"
    },
    {
      data: iso(19, 9, 8, 0), tipo: "Treinamento", titulo: "Treinamento NR 18 — Segurança e Saúde na Construção",
      cliente: "Construtora Horizonte", obra: "Edifício Aurora", local: "Recife — PE",
      responsavel: "Maria Silva", href: "#/certificados/turma/t1"
    },
    {
      data: iso(22, 9, 14, 0), tipo: "Retorno de não conformidade", titulo: "Retorno de não conformidade — Residencial Parque Sul",
      cliente: "Construtora Horizonte", obra: "Residencial Parque Sul", local: "Jaboatão dos Guararapes — PE",
      responsavel: "João Pereira", href: "#/fiscalizacao/f2/nao-conformidades"
    },
    {
      data: iso(21, 9, 9, 0), tipo: "Fiscalização", titulo: "Inspeção Geral de SST — Unidade Recife",
      cliente: "Empresa Alpha", obra: "Unidade Recife", local: "Recife — PE",
      responsavel: "Ana Costa", href: "#/fiscalizacao/f12/checklist"
    },
    {
      data: iso(24, 9, 10, 0), tipo: "Treinamento", titulo: "Treinamento NR 35 — Trabalho em Altura",
      cliente: "Construtora Horizonte", obra: "Edifício Aurora", local: "Recife — PE",
      responsavel: "João Pereira", href: "#/certificados/turma/t2"
    },
    {
      data: iso(26, 9, 8, 30), tipo: "Vencimento", titulo: "Extintor — área administrativa vence",
      cliente: "Empresa Alpha", obra: "Unidade Recife", local: "Recife — PE",
      responsavel: "Ana Costa", href: "#/fiscalizacoes"
    },
    {
      data: iso(28, 9, 9, 0), tipo: "Visita técnica", titulo: "Visita técnica — acompanhamento SST",
      cliente: "Construtora Horizonte", obra: "Galpão Logístico Recife", local: "Cabo de Santo Agostinho — PE",
      responsavel: "Maria Silva", href: "#/obra/o11"
    },
    {
      data: iso(30, 9, 9, 0), tipo: "Vencimento", titulo: "PGR 2026 vence — revisão necessária",
      cliente: "Empresa Alpha", obra: "Unidade Recife", local: "Recife — PE",
      responsavel: "Ana Costa", href: "#/documentos"
    },
    {
      data: iso(2, 10, 15, 0), tipo: "Correção de não conformidade", titulo: "Prazo de correção — cinto de segurança da Empilhadeira 02",
      cliente: "Construtora Horizonte", obra: "Edifício Aurora", local: "Recife — PE",
      responsavel: "Maria Silva", href: "#/fiscalizacao/f1/nao-conformidades"
    },
    {
      data: iso(5, 10, 8, 0), tipo: "Treinamento", titulo: "Treinamento NR 12 — Máquinas e Equipamentos",
      cliente: "Construtora Horizonte", obra: "Galpão Logístico Recife", local: "Cabo de Santo Agostinho — PE",
      responsavel: "João Pereira", href: "#/certificados/turma/t3"
    }
  ];

  var TIPO_AGENDA = {
    "Fiscalização": { cls: "ag-tipo--fisc", ico: "shield" },
    "Treinamento": { cls: "ag-tipo--trein", ico: "train" },
    "Visita técnica": { cls: "ag-tipo--visita", ico: "user" },
    "Vencimento": { cls: "ag-tipo--venc", ico: "clock" },
    "Retorno de não conformidade": { cls: "ag-tipo--retorno", ico: "warn" },
    "Correção de não conformidade": { cls: "ag-tipo--correcao", ico: "check" }
  };

  function renderAgenda() {
    MS.showApp();
    MS.setCrumbs([{ label: "Agenda" }]);
    MS.actions._ctxObra = null;
    MS.actions._ctxCliente = null;

    var hoje = AGENDA.filter(function (a) { return MS.daysUntil(a.data) === 0; });
    var semana = AGENDA.filter(function (a) { var d = MS.daysUntil(a.data); return d > 0 && d <= 7; });
    var tipos = ["Fiscalização", "Treinamento", "Visita técnica", "Vencimento", "Retorno de não conformidade", "Correção de não conformidade"];

    MS.setView(
      '<div class="page-head rv"><div><h1 class="page-head__title">Agenda</h1>' +
      '<p class="page-head__sub">Fiscalizações, treinamentos, visitas, vencimentos, retornos e correções de não conformidade.</p></div>' +
      '<div class="page-head__actions">' +
      '<button class="btn btn--light btn--sm" data-toast-action="Exportação da agenda — demonstração visual.">Exportar</button>' +
      '<button class="btn btn--primary btn--sm" data-toast-action="Novo compromisso — demonstração visual.">+ Agendar</button>' +
      "</div></div>" +

      '<div class="kpi-grid kpi-grid--4">' +
      kpi("Compromissos hoje", hoje.length, "agenda", false, 0) +
      kpi("Próximos 7 dias", semana.length, "clock", false, 30) +
      kpi("Fiscalizações", AGENDA.filter(function (a) { return a.tipo === "Fiscalização"; }).length, "shield", false, 60) +
      kpi("Treinamentos", AGENDA.filter(function (a) { return a.tipo === "Treinamento"; }).length, "train", false, 90) +
      "</div>" +

      calendario() +

      '<div class="card rv filter-bar">' +
      '<div class="filter-chips" id="ag-filtros">' +
      '<button class="filter-chip is-active" data-ag="todos">Todos</button>' +
      tipos.map(function (t) {
        return '<button class="filter-chip" data-ag="' + esc(t) + '">' + esc(t) + "</button>";
      }).join("") +
      "</div>" +
      '<button class="btn btn--light btn--sm" id="ag-limpar-dia" hidden>Ver o mês inteiro</button>' +
      "</div>" +

      '<div id="ag-lista">' + corpoAgenda("todos", null) + "</div>"
    );

    // Filtro por tipo
    var wrap = document.getElementById("ag-filtros");
    var atual = { tipo: "todos", dia: null };
    function repintar() {
      var el = document.getElementById("ag-lista");
      el.innerHTML = corpoAgenda(atual.tipo, atual.dia);
      MS.wireView(); MS.revealAll(el);
    }
    if (wrap) wrap.addEventListener("click", function (e) {
      var b = e.target.closest("[data-ag]");
      if (!b) return;
      atual.tipo = b.getAttribute("data-ag");
      wrap.querySelectorAll("[data-ag]").forEach(function (x) { x.classList.toggle("is-active", x === b); });
      repintar();
    });

    // Filtro por dia do calendário (clique no dia)
    var cal = document.getElementById("ag-calendario");
    if (cal) cal.addEventListener("click", function (e) {
      var d = e.target.closest("[data-ag-dia]");
      if (!d) return;
      var dia = parseInt(d.getAttribute("data-ag-dia"), 10);
      atual.dia = (atual.dia === dia) ? null : dia;
      cal.querySelectorAll("[data-ag-dia]").forEach(function (x) {
        x.classList.toggle("is-sel", String(atual.dia) === x.getAttribute("data-ag-dia"));
      });
      var limpar = document.getElementById("ag-limpar-dia");
      if (limpar) limpar.hidden = atual.dia === null;
      repintar();
    });

    var limpar = document.getElementById("ag-limpar-dia");
    if (limpar) limpar.addEventListener("click", function () {
      atual.dia = null;
      cal.querySelectorAll("[data-ag-dia]").forEach(function (x) { x.classList.remove("is-sel"); });
      limpar.hidden = true;
      repintar();
    });
  }

  /* Mini-calendário do mês corrente. Os dias com compromisso recebem marcador;
     clicar em um dia filtra a lista logo abaixo. */
  function calendario() {
    var base = MS.NOW;
    var ano = base.getFullYear(), mes = base.getMonth();
    var primeiro = new Date(ano, mes, 1);
    var ultimo = new Date(ano, mes + 1, 0).getDate();
    var inicioSemana = primeiro.getDay(); // 0 = domingo
    var nomeMes = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"][mes];

    var porDia = {};
    AGENDA.forEach(function (a) {
      if (a.data.getMonth() === mes && a.data.getFullYear() === ano) {
        var d = a.data.getDate();
        (porDia[d] = porDia[d] || []).push(a);
      }
    });

    var celulas = "";
    for (var i = 0; i < inicioSemana; i++) celulas += '<span class="cal-dia cal-dia--vazio"></span>';
    for (var d = 1; d <= ultimo; d++) {
      var evs = porDia[d] || [];
      var ehHoje = d === base.getDate();
      celulas += '<button type="button" class="cal-dia' + (ehHoje ? " is-hoje" : "") + (evs.length ? " tem-evento" : "") +
        '" data-ag-dia="' + d + '"' + (evs.length ? "" : " disabled") + ">" +
        "<span>" + d + "</span>" +
        (evs.length ? '<span class="cal-dia__pontos">' + evs.slice(0, 3).map(function (e) {
          var t = TIPO_AGENDA[e.tipo] || { cls: "" };
          return '<i class="' + esc(t.cls) + '"></i>';
        }).join("") + "</span>" : "") +
        "</button>";
    }

    return '<div class="card rv cal-card" id="ag-calendario">' +
      '<div class="cal-card__head"><h3>' + nomeMes + " / " + ano + "</h3>" +
      '<span class="card__head-sub">Clique em um dia para filtrar</span></div>' +
      '<div class="cal-semana">' + ["D", "S", "T", "Q", "Q", "S", "S"].map(function (x) { return "<span>" + x + "</span>"; }).join("") + "</div>" +
      '<div class="cal-grid">' + celulas + "</div></div>";
  }

  function corpoAgenda(filtro, dia) {
    var lista = AGENDA.filter(function (a) {
      if (filtro !== "todos" && a.tipo !== filtro) return false;
      if (dia && a.data.getDate() !== dia) return false;
      return true;
    }).sort(function (a, b) { return a.data - b.data; });

    var grupos = {};
    lista.forEach(function (a) {
      var d = MS.daysUntil(a.data);
      var chave = d === 0 ? "Hoje — 18/09/2026" : d === 1 ? "Amanhã — 19/09/2026" : "Próximos dias";
      (grupos[chave] = grupos[chave] || []).push(a);
    });

    if (!lista.length) {
      return '<div class="card rv"><div class="card__pad" style="text-align:center;padding:44px 20px;color:var(--grey-500)">' +
        "<h3 style=\"margin-bottom:6px\">Nenhum compromisso deste tipo</h3><p>Selecione outro filtro para ver a agenda.</p></div></div>";
    }

    return Object.keys(grupos).map(function (chave) {
      return '<div class="card rv"><div class="card__head"><h3>' + esc(chave) + "</h3>" +
        '<span class="card__head-sub">' + grupos[chave].length + " compromisso" + (grupos[chave].length === 1 ? "" : "s") + "</span></div>" +
        '<div class="card__pad ag-lista">' +
        grupos[chave].map(function (a) {
          var t = TIPO_AGENDA[a.tipo] || { cls: "", ico: "agenda" };
          var d = MS.daysUntil(a.data);
          return '<a class="ag-item is-clickable" href="' + esc(a.href) + '">' +
            '<span class="ag-item__hora">' + MS.fmtTime(a.data) + "</span>" +
            '<span class="ag-tipo ' + t.cls + '">' + ico(t.ico) + "</span>" +
            '<span class="ag-item__b"><strong>' + esc(a.titulo) + "</strong>" +
            '<span>' + esc(a.cliente) + " · " + esc(a.obra) + "</span>" +
            '<span class="ag-item__meta">' + esc(a.tipo) + " · " + esc(a.responsavel) + " · " + esc(a.local) + "</span></span>" +
            '<span class="ag-item__d"><span class="ag-item__data">' + fmtDate(a.data) + "</span>" +
            '<span class="ag-item__quando">' + (d === 0 ? "hoje" : d === 1 ? "amanhã" : "em " + d + " dias") + "</span></span>" +
            "</a>";
        }).join("") +
        "</div></div>";
    }).join("");
  }

  function kpi(label, valor, icon, warn, delay) {
    return '<div class="kpi rv' + (warn ? " kpi--warn" : "") + '" style="transition-delay:' + (delay || 0) + 'ms">' +
      '<span class="kpi__icon">' + ico(icon) + '</span><span class="kpi__label">' + esc(label) + "</span>" +
      '<div class="kpi__value">' + valor + "</div></div>";
  }

  /* ======================================================================
     2. DOCUMENTOS — CENTRAL DE ARQUIVOS
     ====================================================================== */
  var CATEGORIAS = ["Certificados", "Relatórios", "Fiscalizações", "Treinamentos", "Clientes", "Obras", "Documentos SST", "Outros"];

  var ARQUIVOS = [
    { nome: "pgr-2026-edificio-aurora.pdf", tipo: "PDF", cat: "Documentos SST", cliente: "Construtora Horizonte", obra: "Edifício Aurora", data: iso(12, 1, 9, 0), tamanho: "1,8 MB", validade: iso(30, 9, 8, 0) },
    { nome: "pcMSO-2026-edificio-aurora.pdf", tipo: "PDF", cat: "Documentos SST", cliente: "Construtora Horizonte", obra: "Edifício Aurora", data: iso(12, 1, 9, 30), tamanho: "1,2 MB" },
    { nome: "relatorio-fiscalizacao-f1.pdf", tipo: "PDF", cat: "Fiscalizações", cliente: "Construtora Horizonte", obra: "Edifício Aurora", data: iso(17, 9, 17, 0), tamanho: "3,4 MB" },
    { nome: "relatorio-fiscalizacao-f2.pdf", tipo: "PDF", cat: "Fiscalizações", cliente: "Construtora Horizonte", obra: "Residencial Parque Sul", data: iso(16, 9, 15, 0), tamanho: "2,1 MB" },
    { nome: "certificados-nr18-turma-15-09-2026.zip", tipo: "ZIP", cat: "Certificados", cliente: "Construtora Horizonte", obra: "Edifício Aurora", data: iso(15, 9, 18, 0), tamanho: "8,7 MB" },
    { nome: "participantes-nr18.xlsx", tipo: "Excel", cat: "Treinamentos", cliente: "Construtora Horizonte", obra: "Edifício Aurora", data: iso(15, 9, 7, 40), tamanho: "38 KB" },
    { nome: "lista-presenca-nr18.pdf", tipo: "PDF", cat: "Treinamentos", cliente: "Construtora Horizonte", obra: "Edifício Aurora", data: iso(15, 9, 17, 0), tamanho: "640 KB" },
    { nome: "RDO-034-edificio-aurora.pdf", tipo: "PDF", cat: "Relatórios", cliente: "Construtora Horizonte", obra: "Edifício Aurora", data: iso(18, 9, 14, 2), tamanho: "4,2 MB" },
    { nome: "RDO-033-edificio-aurora.pdf", tipo: "PDF", cat: "Relatórios", cliente: "Construtora Horizonte", obra: "Edifício Aurora", data: iso(17, 9, 17, 42), tamanho: "3,9 MB" },
    { nome: "fotos-fiscalizacao-edificio-aurora.zip", tipo: "ZIP", cat: "Fiscalizações", cliente: "Construtora Horizonte", obra: "Edifício Aurora", data: iso(17, 9, 18, 0), tamanho: "12,4 MB" },
    { nome: "contrato-consultoria-sst-2026.docx", tipo: "Word", cat: "Clientes", cliente: "Construtora Horizonte", obra: "—", data: iso(3, 2, 9, 0), tamanho: "212 KB" },
    { nome: "ordem-servico-2026-0081.pdf", tipo: "PDF", cat: "Obras", cliente: "Construtora Horizonte", obra: "Edifício Aurora", data: iso(3, 2, 8, 0), tamanho: "420 KB" },
    { nome: "ata-cipa-setembro.docx", tipo: "Word", cat: "Documentos SST", cliente: "Empresa Alpha", obra: "Unidade Recife", data: iso(9, 9, 10, 0), tamanho: "96 KB" },
    { nome: "ltcat-2026.pdf", tipo: "PDF", cat: "Documentos SST", cliente: "Empresa Alpha", obra: "Unidade Recife", data: iso(20, 3, 9, 0), tamanho: "2,6 MB", validade: iso(20, 11, 2026) },
    { nome: "foto-extintor-pavimento-01.jpg", tipo: "Imagem", cat: "Fiscalizações", cliente: "Construtora Horizonte", obra: "Edifício Aurora", data: iso(17, 9, 9, 45), tamanho: "1,1 MB" },
    { nome: "foto-capacete-desgaste.jpg", tipo: "Imagem", cat: "Fiscalizações", cliente: "Construtora Horizonte", obra: "Edifício Aurora", data: iso(17, 9, 10, 12), tamanho: "980 KB" },
    { nome: "planilha-epi-setembro.xlsx", tipo: "Excel", cat: "Outros", cliente: "Empresa Alpha", obra: "Unidade Recife", data: iso(15, 9, 13, 40), tamanho: "72 KB" },
    { nome: "modelo-certificado-ms.docx", tipo: "Word", cat: "Certificados", cliente: "—", obra: "—", data: iso(2, 1, 10, 0), tamanho: "148 KB" }
  ];

  var df = { busca: "", cat: "todas", cliente: "todos", tipo: "todos" };

  function renderDocumentos() {
    MS.showApp();
    MS.setCrumbs([{ label: "Documentos" }]);
    MS.actions._ctxObra = null;

    MS.setView(
      '<div class="page-head rv"><div><h1 class="page-head__title">Documentos</h1>' +
      '<p class="page-head__sub">Central de arquivos — PDF, Word, Excel, imagens e relatórios, organizados por categoria.</p></div>' +
      '<div class="page-head__actions">' +
      '<button class="btn btn--light btn--sm" data-toast-action="Criação de pasta — demonstração visual.">+ Nova pasta</button>' +
      '<button class="btn btn--primary btn--sm" data-toast-action="Envio de arquivo — demonstração visual. Nenhum arquivo é enviado a servidor.">↑ Enviar arquivo</button>' +
      "</div></div>" +

      '<div class="cat-grid rv">' +
      CATEGORIAS.map(function (c) {
        var n = ARQUIVOS.filter(function (a) { return a.cat === c; }).length;
        return '<button class="cat-card' + (df.cat === c ? " is-on" : "") + '" data-doc-cat="' + esc(c) + '">' +
          '<span class="cat-card__ico">' + ico(c === "Certificados" ? "cert" : c === "Documentos SST" ? "shield" : "file") + "</span>" +
          '<strong>' + esc(c) + "</strong><span>" + n + " arquivo" + (n === 1 ? "" : "s") + "</span></button>";
      }).join("") +
      '<button class="cat-card' + (df.cat === "todas" ? " is-on" : "") + '" data-doc-cat="todas">' +
      '<span class="cat-card__ico">' + ico("file") + "</span><strong>Todos os arquivos</strong><span>" + ARQUIVOS.length + " arquivos</span></button>" +
      "</div>" +

      '<div class="card rv filter-bar">' +
      '<label class="filter-search"><svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M15.5 14h-.8l-.3-.3a6.5 6.5 0 1 0-.7.7l.3.3v.8l5 5 1.5-1.5-5-5zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z"/></svg>' +
      '<input type="search" id="doc-busca" placeholder="Buscar arquivo..." value="' + esc(df.busca) + '" /></label>' +
      sel("doc-cliente", "Cliente", [["todos", "Todos os clientes"]].concat(MS.CLIENTES.map(function (c) { return [c.nome, c.nome]; })), df.cliente) +
      sel("doc-tipo", "Tipo", [["todos", "Todos os tipos"], ["PDF", "PDF"], ["Word", "Word"], ["Excel", "Excel"], ["Imagem", "Imagem"], ["ZIP", "ZIP"]], df.tipo) +
      '<button class="btn btn--light btn--sm" id="doc-limpar">Limpar filtros</button>' +
      "</div>" +

      '<div class="card rv"><div id="doc-lista">' + corpoDocumentos() + "</div></div>"
    );

    var b = document.getElementById("doc-busca");
    if (b) b.addEventListener("input", function () { df.busca = b.value; repintarDocs(); });
    ["doc-cliente", "doc-tipo"].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("change", function () {
        if (id === "doc-cliente") df.cliente = el.value; else df.tipo = el.value;
        repintarDocs();
      });
    });
    var lp = document.getElementById("doc-limpar");
    if (lp) lp.addEventListener("click", function () { df = { busca: "", cat: "todas", cliente: "todos", tipo: "todos" }; MS.rerender(); });

    var cats = document.querySelectorAll("[data-doc-cat]");
    cats.forEach(function (b2) {
      b2.addEventListener("click", function () {
        df.cat = b2.getAttribute("data-doc-cat");
        cats.forEach(function (x) { x.classList.toggle("is-on", x.getAttribute("data-doc-cat") === df.cat); });
        repintarDocs();
      });
    });
  }

  function sel(id, label, opcoes, atual) {
    return '<label class="filter-select"><span class="filter-select__label">' + esc(label) + "</span>" +
      '<select class="field__input" id="' + id + '">' + opcoes.map(function (o) {
        return '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(atual) ? " selected" : "") + ">" + esc(o[1]) + "</option>";
      }).join("") + "</select></label>";
  }

  function repintarDocs() {
    var el = document.getElementById("doc-lista");
    if (el) { el.innerHTML = corpoDocumentos(); MS.wireView(); MS.revealAll(el); }
  }

  function filtrarDocs() {
    return ARQUIVOS.filter(function (a) {
      if (df.cat !== "todas" && a.cat !== df.cat) return false;
      if (df.cliente !== "todos" && a.cliente !== df.cliente) return false;
      if (df.tipo !== "todos" && a.tipo !== df.tipo) return false;
      if (df.busca && a.nome.toLowerCase().indexOf(df.busca.toLowerCase()) < 0) return false;
      return true;
    }).sort(function (a, b) { return b.data - a.data; });
  }

  function corpoDocumentos() {
    var lista = filtrarDocs();
    if (!lista.length) {
      return '<div class="card__pad" style="text-align:center;padding:44px 20px;color:var(--grey-500)">' +
        "<h3 style=\"margin-bottom:6px\">Nenhum arquivo encontrado</h3><p>Ajuste os filtros ou envie um novo arquivo.</p></div>";
    }
    return '<div class="card__head"><h3>' + esc(df.cat === "todas" ? "Todos os arquivos" : df.cat) + "</h3>" +
      '<span class="card__head-sub">' + lista.length + " arquivo" + (lista.length === 1 ? "" : "s") + "</span></div>" +
      '<div class="table-wrap table-cards"><table class="table"><thead><tr>' +
      "<th>Nome</th><th>Tipo</th><th>Cliente</th><th>Obra</th><th>Categoria</th><th>Data</th><th>Tamanho</th><th>Ações</th>" +
      "</tr></thead><tbody>" +
      lista.map(function (a, i) {
        var venc = a.validade ? MS.validadeInfo(a.validade, 90) : null;
        return "<tr>" +
          '<td data-l="Nome" class="cell-strong">' + esc(a.nome) +
          (venc ? '<span class="cell-sub ' + (venc.nivel === "ok" ? "" : "cell-sub--warn") + '">Validade: ' + fmtDate(a.validade) + " · " + MS.vencTexto(a.validade) + "</span>" : "") + "</td>" +
          '<td data-l="Tipo"><span class="file-tipo file-tipo--' + esc(a.tipo.toLowerCase()) + '">' + esc(a.tipo) + "</span></td>" +
          '<td data-l="Cliente">' + esc(a.cliente) + "</td>" +
          '<td data-l="Obra">' + esc(a.obra) + "</td>" +
          '<td data-l="Categoria">' + esc(a.cat) + "</td>" +
          '<td data-l="Data">' + fmtDate(a.data) + "</td>" +
          '<td data-l="Tamanho">' + esc(a.tamanho) + "</td>" +
          '<td data-l="Ações"><div class="row-actions">' +
          '<button class="mini-btn" data-toast-action="Visualização de arquivo — demonstração visual." title="Visualizar">👁</button>' +
          '<button class="mini-btn" data-toast-action="Download de arquivo — demonstração visual." title="Baixar">↓</button>' +
          '<button class="mini-btn" data-action="doc-renomear" data-nome="' + esc(a.nome) + '" title="Renomear">✎</button>' +
          '<button class="mini-btn" data-action="doc-mover" data-nome="' + esc(a.nome) + '" title="Mover">⇄</button>' +
          '<button class="mini-btn mini-btn--danger" data-action="doc-excluir" data-nome="' + esc(a.nome) + '" title="Excluir">✕</button>' +
          "</div></td></tr>";
      }).join("") +
      "</tbody></table></div>";
  }

  MS.actions["doc-renomear"] = function (el) {
    MS.openModal(
      MS.modalHeader("Renomear arquivo") +
      '<div class="modal__body"><label class="field"><span class="field__label">Nome do arquivo</span>' +
      '<input class="field__input" id="doc-novo-nome" value="' + esc(el.getAttribute("data-nome")) + '" /></label>' +
      '<div class="demo-note">Alteração demonstrativa — o arquivo não existe de verdade nesta apresentação.</div></div>' +
      '<div class="modal__foot"><button class="btn btn--light" data-modal-close>Cancelar</button>' +
      '<button class="btn btn--primary" data-modal-action="doc-salvar-nome" data-nome="' + esc(el.getAttribute("data-nome")) + '">Salvar</button></div>'
    );
  };
  MS.actions["doc-salvar-nome"] = function (el) {
    var antigo = el.getAttribute("data-nome");
    var novo = (document.getElementById("doc-novo-nome") || {}).value || antigo;
    ARQUIVOS.forEach(function (a) { if (a.nome === antigo) a.nome = novo; });
    MS.closeModal();
    MS.showToast("Arquivo renomeado (demonstração).");
    MS.rerender();
  };
  MS.actions["doc-mover"] = function (el) {
    MS.openModal(
      MS.modalHeader("Mover arquivo") +
      '<div class="modal__body"><p class="modal__hint">Escolha a nova categoria de <strong>' + esc(el.getAttribute("data-nome")) + "</strong>.</p>" +
      '<div class="move-grid">' + CATEGORIAS.map(function (c) {
        return '<button class="move-opt" data-modal-action="doc-salvar-mover" data-nome="' + esc(el.getAttribute("data-nome")) + '" data-cat="' + esc(c) + '">' + esc(c) + "</button>";
      }).join("") + "</div></div>" +
      '<div class="modal__foot"><button class="btn btn--light" data-modal-close>Cancelar</button></div>'
    );
  };
  MS.actions["doc-salvar-mover"] = function (el) {
    var nome = el.getAttribute("data-nome"), cat = el.getAttribute("data-cat");
    ARQUIVOS.forEach(function (a) { if (a.nome === nome) a.cat = cat; });
    MS.closeModal();
    MS.showToast("Arquivo movido para “" + cat + "” (demonstração).");
    MS.rerender();
  };
  MS.actions["doc-excluir"] = function (el) {
    var nome = el.getAttribute("data-nome");
    MS.openModal(
      MS.modalHeader("Excluir arquivo") +
      '<div class="modal__body"><p class="modal__hint">Confirma a exclusão de <strong>' + esc(nome) + "</strong>?</p>" +
      '<div class="demo-note">Ação demonstrativa — nada é apagado de verdade.</div></div>' +
      '<div class="modal__foot"><button class="btn btn--light" data-modal-close>Cancelar</button>' +
      '<button class="btn btn--danger" data-modal-action="doc-confirmar-exclusao" data-nome="' + esc(nome) + '">Excluir</button></div>'
    );
  };
  MS.actions["doc-confirmar-exclusao"] = function (el) {
    var nome = el.getAttribute("data-nome");
    ARQUIVOS = ARQUIVOS.filter(function (a) { return a.nome !== nome; });
    MS.closeModal();
    MS.showToast("Arquivo removido da demonstração.");
    MS.rerender();
  };

  /* ======================================================================
     3. NOTIFICAÇÕES
     ====================================================================== */
  function notificacoes() {
    var lista = [
      { i: "warn", t: "há 12 min", titulo: "Extintor próximo do vencimento — Edifício Aurora", desc: "Extintor do Pavimento 01 vence em 10/10/2026 (22 dias).", href: "#/fiscalizacao/f1/checklist", tag: "Fiscalização" },
      { i: "warn", t: "há 40 min", titulo: "2 não conformidades aguardando correção", desc: "Cinto de segurança da Empilhadeira 02 e capacetes da equipe — Edifício Aurora.", href: "#/fiscalizacao/f1/nao-conformidades", tag: "Não conformidade" },
      { i: "amber", t: "há 1 h", titulo: "Fiscalização programada para amanhã", desc: "Inspeção Geral de SST — Unidade Recife, 21/09/2026 às 09:00.", href: "#/agenda", tag: "Agenda" },
      { i: "", t: "há 2 h", titulo: "27 certificados da turma NR 18 foram preparados", desc: "Construtora Horizonte · Edifício Aurora · 15/09/2026.", href: "#/certificados/turma/t1", tag: "Certificados" },
      { i: "warn", t: "há 3 h", titulo: "Documento próximo do vencimento", desc: "PGR 2026 vence em 30/09/2026 (12 dias) — revisão necessária.", href: "#/documentos", tag: "Documentos" }
    ];
    if (CERT) {
      var av = CERT.certificadosAvencer();
      if (av.length) {
        lista.splice(3, 0, {
          i: "amber", t: "há 2 h", titulo: av.length + " certificados de treinamento próximos do vencimento",
          desc: av[0].nr + " — " + av[0].participante + " e outros. Retreinamento pode ser programado.",
          href: "#/certificados/historico", tag: "Certificados"
        });
      }
    }
    if (FISC) {
      var nc = FISC.todasNC();
      if (nc.length > 2) {
        lista.push({
          i: "", t: "ontem", titulo: nc.length + " não conformidades abertas no total",
          desc: "Distribuídas entre as obras ativas. Acompanhe os prazos de correção.",
          href: "#/fiscalizacoes", tag: "Fiscalização"
        });
      }
    }
    lista.push({ i: "", t: "ontem", titulo: "Novas fotos adicionadas", desc: "Galpão Logístico Recife (3 fotos) e Unidade Recife (2 fotos).", href: "#/fotos", tag: "Fotos" });
    lista.push({ i: "", t: "2 dias", titulo: "Treinamento NR 18 concluído", desc: "27 participantes — certificados preparados para emissão.", href: "#/certificados/turma/t1", tag: "Treinamentos" });
    return lista;
  }

  function renderNotificacoes() {
    MS.showApp();
    MS.setCrumbs([{ label: "Notificações" }]);
    MS.actions._ctxObra = null;
    var lista = notificacoes();
    var naoLidas = lista.filter(function (n) { return n.i; }).length;

    MS.setView(
      '<div class="page-head rv"><div><h1 class="page-head__title">Notificações</h1>' +
      '<p class="page-head__sub">Vencimentos, não conformidades, certificados e documentos que precisam da sua atenção.</p></div>' +
      '<div class="page-head__actions">' +
      '<button class="btn btn--light btn--sm" data-toast-action="Notificações marcadas como lidas — demonstração visual.">Marcar todas como lidas</button>' +
      "</div></div>" +

      '<div class="notif-resumo rv">' +
      '<span class="badge badge--red">' + naoLidas + " exigem atenção</span>" +
      '<span class="badge badge--grey">' + lista.length + " no total</span>" +
      "</div>" +

      '<div class="card rv"><div class="card__head"><h3>Central de notificações</h3></div><div class="feed">' +
      lista.map(function (n) {
        var cls = n.i === "warn" ? " feed__icon--warn" : n.i === "amber" ? " feed__icon--amber" : "";
        return '<div class="feed__item is-clickable" data-href="' + esc(n.href) + '">' +
          '<span class="feed__icon' + cls + '">' + ico("bell") + "</span>" +
          '<div class="feed__body"><div class="feed__title">' + esc(n.titulo) + '</div>' +
          '<div class="feed__desc">' + esc(n.desc) + '</div>' +
          '<div class="feed__meta"><span class="feed__time">' + esc(n.t) + '</span><span class="badge badge--grey">' + esc(n.tag) + "</span></div></div>" +
          '<span class="notif-arrow">›</span></div>';
      }).join("") +
      "</div></div>"
    );
  }

  /* ======================================================================
     4. EQUIPE
     ====================================================================== */
  function renderEquipe() {
    MS.showApp();
    MS.setCrumbs([{ label: "Equipe" }]);
    MS.actions._ctxObra = null;

    var obrasPorPessoa = {
      "Maria Silva": ["Edifício Aurora", "Residencial Parque Sul"],
      "João Pereira": ["Residencial Parque Sul", "Galpão Logístico Recife"],
      "Ana Costa": ["Unidade Recife"],
      "Pedro Lima": ["Unidade Recife"],
      "Luana Souza": ["Edifício Aurora"]
    };

    MS.setView(
      '<div class="page-head rv"><div><h1 class="page-head__title">Equipe</h1>' +
      '<p class="page-head__sub">Equipe técnica da MS Consultoria, obras atendidas e situação em campo.</p></div>' +
      '<div class="page-head__actions">' +
      '<button class="btn btn--primary btn--sm" data-toast-action="Cadastro de membro — demonstração visual.">+ Novo membro</button>' +
      "</div></div>" +

      '<div class="kpi-grid kpi-grid--4">' +
      kpi("Equipe técnica", MS.EQUIPE.length, "user", false, 0) +
      kpi("Em campo hoje", 3, "check", false, 30) +
      kpi("Fiscalizações no mês", FISC ? FISC.indicadores().mes : 0, "shield", false, 60) +
      kpi("Certificados emitidos", CERT ? CERT.indicadores().emitidos : 0, "cert", false, 90) +
      "</div>" +

      '<div class="grid-3">' +
      MS.EQUIPE.map(function (e, i) {
        var obras = obrasPorPessoa[e.nome] || [];
        var emCampo = i < 3;
        return '<div class="card rv" style="transition-delay:' + i * 40 + 'ms"><div class="card__pad eq-card">' +
          '<span class="avatar avatar--lg">' + esc(MS.iniciais(e.nome)) + "</span>" +
          "<strong>" + esc(e.nome) + "</strong>" +
          '<span class="eq-card__funcao">' + esc(e.funcao) + "</span>" +
          '<span class="eq-card__ctt">' + esc(e.ctt) + "</span>" +
          '<span class="status ' + (emCampo ? "status--active" : "status--review") + '">' + (emCampo ? "Em campo" : "Escritório") + "</span>" +
          '<div class="eq-card__obras">' + (obras.length
            ? obras.map(function (o) { return '<span class="chip-mini">' + esc(o) + "</span>"; }).join("")
            : '<span class="chip-mini chip-mini--muted">Sem obra vinculada</span>') + "</div>" +
          "</div></div>";
      }).join("") +
      "</div>" +

      '<div class="card rv"><div class="card__head"><h3>Responsabilidade por obra</h3></div>' +
      '<div class="table-wrap table-cards"><table class="table"><thead><tr>' +
      "<th>Obra</th><th>Cliente</th><th>Responsável</th><th>Situação</th><th></th></tr></thead><tbody>" +
      todasObras().map(function (item) {
        return '<tr class="is-clickable" data-href="#/obra/' + item.o.id + '">' +
          '<td data-l="Obra" class="cell-strong">' + esc(item.o.nome) + "</td>" +
          '<td data-l="Cliente">' + esc(item.c.nome) + "</td>" +
          '<td data-l="Responsável">' + esc(item.o.responsavel) + "</td>" +
          '<td data-l="Situação"><span class="status ' + (item.o.status === "Em andamento" ? "status--active" : item.o.status === "Finalizada" ? "status--concluido" : "status--warn") + '">' + esc(item.o.status) + "</span></td>" +
          '<td data-l=""><span class="link-btn">Abrir</span></td></tr>';
      }).join("") +
      "</tbody></table></div></div>"
    );
  }

  function todasObras() {
    var out = [];
    MS.CLIENTES.forEach(function (c) { c.obras.forEach(function (o) { out.push({ c: c, o: o }); }); });
    return out;
  }

  /* ======================================================================
     5. TREINAMENTOS (com acesso aos certificados)
     ====================================================================== */
  function renderTreinamentos() {
    MS.showApp();
    MS.setCrumbs([{ label: "Treinamentos" }]);
    MS.actions._ctxObra = null;

    var turmas = CERT ? CERT.TURMAS : [];
    var ind = CERT ? CERT.indicadores() : { emitidos: 0, mes: 0, vencimentos: 0, turmas: 0 };

    MS.setView(
      '<div class="page-head rv"><div><h1 class="page-head__title">Treinamentos</h1>' +
      '<p class="page-head__sub">Turmas realizadas, participantes e certificados emitidos por treinamento.</p></div>' +
      '<div class="page-head__actions">' +
      '<button class="btn btn--light btn--sm" data-action="cert-importar">Importar participantes</button>' +
      '<button class="btn btn--primary btn--sm" data-action="cert-individual">+ Novo certificado</button>' +
      "</div></div>" +

      '<button class="acesso-cert rv" data-action="cert-historico">' +
      '<span class="acesso-cert__ico">' + ico("cert") + "</span>" +
      '<span class="acesso-cert__b"><strong>Certificados</strong>' +
      "<span>Gere, organize e acompanhe certificados de treinamentos — individualmente ou em lote a partir da planilha de participantes.</span></span>" +
      '<span class="acesso-cert__ir">Abrir certificados →</span></button>' +

      '<div class="kpi-grid kpi-grid--4">' +
      kpi("Turmas", ind.turmas, "train", false, 0) +
      kpi("Certificados emitidos", ind.emitidos, "cert", false, 30) +
      kpi("Emitidos este mês", ind.mes, "clock", false, 60) +
      kpi("Próximos vencimentos", ind.vencimentos, "warn", true, 90) +
      "</div>" +

      '<div class="card rv"><div class="card__head"><h3>Turmas de treinamento</h3>' +
      '<button class="link-btn" data-action="cert-turmas">Ver todas</button></div>' +
      '<div class="table-wrap table-cards"><table class="table"><thead><tr>' +
      "<th>Treinamento</th><th>Empresa</th><th>Obra</th><th>Data</th><th>Participantes</th><th>Certificados</th><th></th></tr></thead><tbody>" +
      turmas.slice(0, 8).map(function (t) {
        var tr = treinamentoNome(t.treinamentoId);
        var cl = MS.CLIENTES.filter(function (x) { return x.id === t.clienteId; })[0];
        var ob = MS.obraPorId(t.obraId);
        return '<tr class="is-clickable" data-href="#/certificados/turma/' + t.id + '">' +
          '<td data-l="Treinamento" class="cell-strong">' + esc(tr) + "</td>" +
          '<td data-l="Empresa">' + esc(cl ? cl.nome : "—") + "</td>" +
          '<td data-l="Obra">' + esc(ob ? ob.nome : "—") + "</td>" +
          '<td data-l="Data">' + fmtDate(t.data) + "</td>" +
          '<td data-l="Participantes">' + t.participantes.length + "</td>" +
          '<td data-l="Certificados"><span class="status status--concluido">' + t.certificados.length + " emitidos</span></td>" +
          '<td data-l=""><span class="link-btn">Ver certificados</span></td></tr>';
      }).join("") +
      "</tbody></table></div></div>" +

      '<div class="card rv"><div class="card__head"><h3>Treinamentos previstos</h3></div>' +
      '<div class="table-wrap table-cards"><table class="table"><thead><tr>' +
      "<th>Treinamento</th><th>Cliente / Obra</th><th>Data</th><th>Situação</th></tr></thead><tbody>" +
      [
        ["NR 18 — Segurança e Saúde na Construção", "Construtora Horizonte · Edifício Aurora", iso(19, 9, 8, 0), "Agendado"],
        ["NR 35 — Trabalho em Altura", "Construtora Horizonte · Edifício Aurora", iso(24, 9, 10, 0), "Agendado"],
        ["NR 12 — Máquinas e Equipamentos", "Construtora Horizonte · Galpão Logístico Recife", iso(5, 10, 8, 0), "Agendado"],
        ["NR 06 — Uso Correto do EPI", "Empresa Alpha · Unidade Recife", iso(10, 10, 8, 0), "Agendado"],
        ["Primeiros Socorros", "Construtora Horizonte · Residencial Parque Sul", iso(16, 10, 8, 0), "Agendado"]
      ].map(function (t) {
        return '<tr><td data-l="Treinamento" class="cell-strong">' + esc(t[0]) + "</td>" +
          '<td data-l="Cliente / Obra">' + esc(t[1]) + "</td>" +
          '<td data-l="Data">' + fmtDate(t[2]) + "</td>" +
          '<td data-l="Situação"><span class="status status--review">' + esc(t[3]) + "</span></td></tr>";
      }).join("") +
      "</tbody></table></div></div>"
    );
  }

  function treinamentoNome(id) {
    var nomes = {
      nr18: "NR 18 — Segurança e Saúde na Construção", nr35: "NR 35 — Trabalho em Altura",
      nr12: "NR 12 — Máquinas e Equipamentos", nr10: "NR 10 — Instalações Elétricas",
      nr33: "NR 33 — Espaços Confinados", nr20: "NR 20 — Inflamáveis e Combustíveis",
      nr11: "NR 11 — Movimentação de Materiais", nr23: "NR 23 — Proteção Contra Incêndios",
      nr06: "NR 06 — Uso Correto do EPI", nr05: "NR 05 — CIPA",
      ps: "Primeiros Socorros", brigada: "Brigada de Incêndio"
    };
    return nomes[id] || (id || "Treinamento").toUpperCase();
  }

  /* ======================================================================
     6. BLOCOS NOVOS DO DASHBOARD
     ----------------------------------------------------------------------
     Inseridos via MS.registerDashTopo / registerDashFim — o dashboard
     original continua exatamente como estava, apenas com estes blocos a
     mais. Nenhum bloco existente foi removido ou alterado.
     ====================================================================== */

  // ---- Faixa de ATENÇÃO + acesso rápido às novas áreas ----
  MS.registerDashTopo(function () {
    var itens = [];
    if (FISC) {
      FISC.vencimentosProximos().forEach(function (v) {
        var titulo = v.it.titulo || "";
        var cat = /extintor/i.test(titulo) ? "extintor" : /pgr|pcMSO|documenta|lTCAT|ordem/i.test(titulo) ? "documento" : "item";
        itens.push({ tipo: cat, titulo: titulo, data: v.it.validade, href: "#/fiscalizacao/" + v.f.id + "/checklist", origem: "Fiscalização" });
      });
    }
    if (CERT) {
      CERT.certificadosAvencer().forEach(function (c) {
        itens.push({ tipo: "treinamento", titulo: (c.nr !== "—" ? c.nr + " — " : "") + c.participante, data: c.validade, href: "#/certificados/historico", origem: "Certificado" });
      });
    }
    itens.sort(function (a, b) { return a.data - b.data; });

    var extintores = itens.filter(function (i) { return i.tipo === "extintor"; }).length;
    var documentos = itens.filter(function (i) { return i.tipo === "documento"; }).length;
    var treinamentos = itens.filter(function (i) { return i.tipo === "treinamento"; }).length;
    var partes = [];
    if (extintores) partes.push(extintores + " extintor" + (extintores === 1 ? "" : "es"));
    if (documentos) partes.push(documentos + " documento" + (documentos === 1 ? "" : "s"));
    if (treinamentos) partes.push(treinamentos + " certificado" + (treinamentos === 1 ? "" : "s") + " de treinamento");

    if (!itens.length) return "";

    return (
      '<div class="atencao rv">' +
      '<div class="atencao__head"><span class="atencao__ico">' + ico("warn") + "</span>" +
      "<div><strong>ATENÇÃO</strong>" +
      "<span>" + itens.length + " " + (itens.length === 1 ? "item" : "itens") + " próximos do vencimento — " + partes.join(", ") + "</span></div>" +
      "</div>" +
      '<div class="atencao__lista">' +
      itens.slice(0, 4).map(function (i) {
        return '<a class="atencao__item" href="' + esc(i.href) + '">' +
          '<span class="atencao__tipo">' + esc(i.tipo === "extintor" ? "Extintor" : i.tipo === "documento" ? "Documento" : "Treinamento") + "</span>" +
          '<span class="atencao__titulo">' + esc(i.titulo) + "</span>" +
          '<span class="atencao__venc">' + fmtDate(i.data) + " · " + MS.vencTexto(i.data) + "</span></a>";
      }).join("") +
      "</div>" +
      '<div class="atencao__foot">' +
      '<button class="btn btn--light btn--sm" data-href="#/fiscalizacoes">Ver fiscalizações</button>' +
      '<button class="btn btn--light btn--sm" data-href="#/certificados/historico">Ver certificados</button>' +
      '<button class="btn btn--light btn--sm" data-href="#/documentos">Ver documentos</button>' +
      "</div></div>"
    );
  });

  // ---- Fiscalizações recentes + Pendências de segurança + Extintores ----
  MS.registerDashFim(function () {
    var out = "";

    if (FISC) {
      var recentes = FISC.FISCALIZACOES.slice().sort(function (a, b) { return b.data - a.data; })
        .filter(function (f) { return f.status !== "Programada"; }).slice(0, 5);
      var nc = FISC.todasNC();
      var venc = FISC.vencimentosProximos().filter(function (v) { return /extintor/i.test(v.it.titulo || ""); });

      out += '<div class="grid-2">';

      out += '<div class="card rv"><div class="card__head"><h3>Fiscalizações recentes</h3>' +
        '<button class="link-btn" data-href="#/fiscalizacoes">Ver todas</button></div>' +
        '<div class="table-wrap table-cards"><table class="table"><thead><tr>' +
        "<th>Fiscalização</th><th>Obra</th><th>Data</th><th>Itens</th><th>Status</th></tr></thead><tbody>" +
        recentes.map(function (f) {
          var c = FISC.contarItens(f);
          return '<tr class="is-clickable" data-href="#/fiscalizacao/' + f.id + '/checklist">' +
            '<td data-l="Fiscalização" class="cell-strong">' + esc(f.tipo) + "</td>" +
            '<td data-l="Obra">' + esc(nomeObra(f)) + "</td>" +
            '<td data-l="Data">' + fmtDate(f.data) + "</td>" +
            '<td data-l="Itens">' + c.total + " itens</td>" +
            '<td data-l="Status"><span class="status ' + (f.status === "Concluída" ? "status--concluido" : "status--warn") + '">' + esc(f.status) + "</span></td></tr>";
        }).join("") +
        "</tbody></table></div></div>";

      out += '<div class="card rv"><div class="card__head"><h3>Pendências de segurança</h3>' +
        '<span class="badge badge--red">' + nc.length + " abertas</span></div>" +
        '<div class="card__pad" style="padding-top:6px">' +
        (nc.length ? nc.slice(0, 5).map(function (n) {
          return '<a class="pend-item" href="#/fiscalizacao/' + n.f.id + '/nao-conformidades">' +
            '<span class="pend-item__nivel nivel nivel--' + esc(n.it.nc.nivel) + '">' + esc(nivelNome(n.it.nc.nivel)) + "</span>" +
            '<span class="pend-item__b"><strong>' + esc(n.it.titulo) + "</strong>" +
            "<span>" + esc(nomeObra(n.f)) + " · " + esc(n.it.nc.problema) + "</span></span>" +
            '<span class="pend-item__prazo">' + (n.it.nc.prazo ? fmtDate(n.it.nc.prazo) : "sem prazo") + "</span></a>";
        }).join("") : '<p class="empty-line">Nenhuma não conformidade aberta.</p>') +
        "</div></div>";
      out += "</div>";

      out += '<div class="grid-2">';

      out += '<div class="card rv"><div class="card__head"><h3>Extintores próximos do vencimento</h3>' +
        '<span class="card__head-sub">Controle de validade</span></div>' +
        '<div class="table-wrap table-cards"><table class="table"><thead><tr>' +
        "<th>Extintor</th><th>Obra</th><th>Validade</th><th>Situação</th></tr></thead><tbody>" +
        (venc.length ? venc.map(function (v) {
          var info = MS.validadeInfo(v.it.validade, 60);
          return '<tr class="is-clickable" data-href="#/fiscalizacao/' + v.f.id + '/checklist">' +
            '<td data-l="Extintor" class="cell-strong">' + esc(v.it.titulo) + "</td>" +
            '<td data-l="Obra">' + esc(nomeObra(v.f)) + "</td>" +
            '<td data-l="Validade">' + fmtDate(v.it.validade) + "</td>" +
            '<td data-l="Situação"><span class="status ' + info.cls + '">' + info.label + "</span></td></tr>";
        }).join("") : '<tr><td colspan="4" class="table-more">Nenhum extintor próximo do vencimento.</td></tr>') +
        "</tbody></table></div></div>";

      var f = FISC.indicadores();
      out += '<div class="card rv"><div class="card__head"><h3>Segurança em números</h3></div><div class="card__pad">' +
        '<div class="grid-2" style="gap:12px">' +
        numeroBox("Fiscalizações no mês", f.mes) +
        numeroBox("Itens conformes", f.conformes) +
        numeroBox("Pendências", f.pendencias, true) +
        numeroBox("Vencimentos próximos", f.vencimentos, true) +
        "</div>" +
        '<div class="atencao__foot" style="margin-top:14px">' +
        '<button class="btn btn--primary btn--sm" data-href="#/fiscalizacoes">Abrir fiscalizações</button>' +
        '<button class="btn btn--light btn--sm" data-action="nova-fiscalizacao">+ Nova fiscalização</button>' +
        "</div></div></div>";
      out += "</div>";
    }

    // ---- Bloco de certificados e treinamentos ----
    if (CERT) {
      var ind = CERT.indicadores();
      var certs = CERT.CERTIFICADOS.slice().sort(function (a, b) { return b.emissao - a.emissao; }).slice(0, 5);
      var vencCert = CERT.certificadosAvencer();

      out += '<div class="grid-2">';

      out += '<div class="card rv"><div class="card__head"><h3>Certificados emitidos</h3>' +
        '<button class="link-btn" data-action="cert-historico">Ver histórico</button></div>' +
        '<div class="card__pad" style="padding-top:4px">' +
        certs.map(function (c) {
          return '<div class="cert-row"><div class="avatar avatar--sm">' + esc(MS.iniciais(c.participante)) + "</div>" +
            '<div class="cert-row__b"><strong>' + esc(c.participante) + "</strong>" +
            "<span>" + esc(c.nr !== "—" ? c.nr + " · " : "") + esc(c.treinamento) + "</span></div>" +
            '<div class="cert-row__r"><span class="cert-row__data">' + fmtDate(c.emissao) + "</span>" +
            '<button class="link-btn" data-action="cert-ver" data-cert="' + c.id + '">Visualizar</button></div></div>';
        }).join("") +
        '<div class="cert-totais">' +
        '<div><span>Emitidos</span><strong>' + ind.emitidos + "</strong></div>" +
        '<div><span>Este mês</span><strong>' + ind.mes + "</strong></div>" +
        '<div><span>A vencer</span><strong>' + vencCert.length + "</strong></div>" +
        '<div><span>Turmas</span><strong>' + ind.turmas + "</strong></div>" +
        "</div>" +
        '<div class="atencao__foot" style="margin-top:12px">' +
        '<button class="btn btn--primary btn--sm" data-action="cert-importar">Importar participantes</button>' +
        '<button class="btn btn--light btn--sm" data-action="cert-individual">+ Novo certificado</button>' +
        "</div></div></div>";

      var turmas = CERT.TURMAS.slice(0, 5);
      out += '<div class="card rv"><div class="card__head"><h3>Treinamentos recentes</h3>' +
        '<button class="link-btn" data-href="#/treinamentos">Ver treinamentos</button></div>' +
        '<div class="feed">' +
        turmas.map(function (t) {
          var cl = MS.CLIENTES.filter(function (x) { return x.id === t.clienteId; })[0];
          return '<div class="feed__item is-clickable" data-href="#/certificados/turma/' + t.id + '">' +
            '<span class="feed__icon">' + ico("train") + "</span>" +
            '<div class="feed__body"><div class="feed__title">' + esc(treinamentoNome(t.treinamentoId)) + "</div>" +
            '<div class="feed__desc">' + esc(cl ? cl.nome : "—") + " · " + t.participantes.length + " participantes</div>" +
            '<div class="feed__meta"><span class="feed__time">' + fmtDate(t.data) + "</span>" +
            '<span class="status status--concluido">' + t.certificados.length + " certificados</span></div></div></div>";
        }).join("") +
        "</div></div>";
      out += "</div>";
    }

    // ---- Obras ativas ----
    var ativas = MS.obrasEmAndamento();
    out += '<div class="card rv"><div class="card__head"><h3>Obras ativas</h3>' +
      '<span class="card__head-sub">' + ativas.length + " em andamento</span></div>" +
      '<div class="obras-strip">' +
      ativas.map(function (item) {
        return '<a class="obra-mini" href="#/obra/' + item.o.id + '">' +
          '<strong>' + esc(item.o.nome) + "</strong>" +
          "<span>" + esc(item.c.nome) + "</span>" +
          '<span class="obra-mini__local">' + esc(item.o.local) + "</span>" +
          '<span class="prog"><span class="prog__fill" style="width:' + item.o.progresso + '%"></span></span>' +
          '<span class="obra-mini__pct">' + item.o.progresso + "%</span></a>";
      }).join("") +
      "</div></div>";

    return out;
  });

  // Nome legível do nível de risco (o módulo de Fiscalizações expõe só a classe).
  function nivelNome(id) {
    return { baixo: "Risco baixo", medio: "Risco médio", alto: "Risco alto", critico: "Risco crítico" }[id] || "Risco médio";
  }

  function numeroBox(label, valor, warn) {
    return '<div class="num-box' + (warn ? " num-box--warn" : "") + '">' +
      '<span class="num-box__v">' + valor + '</span><span class="num-box__l">' + esc(label) + "</span></div>";
  }

  function nomeObra(f) {
    var o = MS.obraPorId(f.obraId);
    return o ? o.nome : "—";
  }

  /* ======================================================================
     7. ABAS EXTRAS — FISCALIZAÇÕES NO CLIENTE E NA OBRA
     ====================================================================== */
  // Não é um módulo novo: apenas conecta a tela de Fiscalizações ao
  // histórico do cliente e da obra, como o trabalho real exige.
  if (FISC) {
    MS.registerObraTab({
      id: "fiscalizacoes",
      label: "Fiscalizações",
      count: function (o) { return FISC.FISCALIZACOES.filter(function (f) { return f.obraId === o.id; }).length; },
      render: function (o) {
        var lista = FISC.FISCALIZACOES.filter(function (f) { return f.obraId === o.id; })
          .sort(function (a, b) { return b.data - a.data; });
        if (!lista.length) {
          return '<div class="card rv"><div class="card__pad" style="text-align:center;padding:40px 20px;color:var(--grey-500)">' +
            "<h3 style=\"margin-bottom:6px\">Nenhuma fiscalização nesta obra</h3>" +
            "<p>Crie a primeira inspeção de SST para esta obra.</p>" +
            '<button class="btn btn--primary btn--sm" style="margin-top:14px" data-action="nova-fiscalizacao">+ Nova fiscalização</button></div></div>';
        }
        var tot = lista.reduce(function (a, f) { return a + FISC.contarItens(f).total; }, 0);
        var nc = lista.reduce(function (a, f) { return a + FISC.contarItens(f).nc; }, 0);
        return '<div class="grid-3 rv" style="margin-bottom:16px">' +
          numeroBox("Fiscalizações", lista.length) +
          numeroBox("Itens verificados", tot) +
          numeroBox("Não conformidades", nc, nc > 0) +
          "</div>" +
          '<div class="card rv"><div class="card__head"><h3>Fiscalizações da obra</h3>' +
          '<button class="btn btn--primary btn--sm" data-action="nova-fiscalizacao">+ Nova fiscalização</button></div>' +
          '<div class="table-wrap table-cards"><table class="table"><thead><tr>' +
          "<th>Fiscalização</th><th>Data</th><th>Responsável</th><th>Itens</th><th>Status</th><th></th></tr></thead><tbody>" +
          lista.map(function (f) {
            var c = FISC.contarItens(f);
            return '<tr class="is-clickable" data-href="#/fiscalizacao/' + f.id + '/checklist">' +
              '<td data-l="Fiscalização" class="cell-strong">' + esc(f.tipo) + "</td>" +
              '<td data-l="Data">' + fmtDate(f.data) + "</td>" +
              '<td data-l="Responsável">' + esc(f.responsavel) + "</td>" +
              '<td data-l="Itens">' + c.total + " itens</td>" +
              '<td data-l="Status"><span class="status ' + (f.status === "Concluída" ? "status--concluido" : f.status === "Programada" ? "status--review" : "status--warn") + '">' + esc(f.status) + "</span></td>" +
              '<td data-l=""><span class="link-btn">Abrir checklist</span></td></tr>';
          }).join("") +
          "</tbody></table></div></div>";
      }
    });

    MS.registerClienteTab({
      id: "fiscalizacoes",
      label: "Fiscalizações",
      count: function (c) {
        var ids = c.obras.map(function (o) { return o.id; });
        return FISC.FISCALIZACOES.filter(function (f) { return ids.indexOf(f.obraId) >= 0; }).length;
      },
      render: function (c) {
        var ids = c.obras.map(function (o) { return o.id; });
        var lista = FISC.FISCALIZACOES.filter(function (f) { return ids.indexOf(f.obraId) >= 0; });
        return '<div class="card rv"><div class="card__head"><h3>Fiscalizações do cliente</h3>' +
          '<span class="card__head-sub">' + lista.length + " no total · " + c.obras.length + " obra" + (c.obras.length === 1 ? "" : "s") + "</span></div>" +
          '<div class="table-wrap table-cards"><table class="table"><thead><tr>' +
          "<th>Fiscalização</th><th>Obra</th><th>Data</th><th>Itens</th><th>Status</th><th></th></tr></thead><tbody>" +
          (lista.length ? lista.sort(function (a, b) { return b.data - a.data; }).map(function (f) {
            var cc = FISC.contarItens(f);
            return '<tr class="is-clickable" data-href="#/fiscalizacao/' + f.id + '/checklist">' +
              '<td data-l="Fiscalização" class="cell-strong">' + esc(f.tipo) + "</td>" +
              '<td data-l="Obra">' + esc(nomeObra(f)) + "</td>" +
              '<td data-l="Data">' + fmtDate(f.data) + "</td>" +
              '<td data-l="Itens">' + cc.total + " itens</td>" +
              '<td data-l="Status"><span class="status ' + (f.status === "Concluída" ? "status--concluido" : f.status === "Programada" ? "status--review" : "status--warn") + '">' + esc(f.status) + "</span></td>" +
              '<td data-l=""><span class="link-btn">Abrir</span></td></tr>';
          }).join("") : '<tr><td colspan="6" class="table-more">Nenhuma fiscalização registrada para este cliente.</td></tr>') +
          "</tbody></table></div></div>";
      }
    });
  }

  /* ======================================================================
     8. HISTÓRICO DA OBRA — CLIENTE → OBRA
     ----------------------------------------------------------------------
     REGRA CENTRAL DA MS: um cliente NÃO significa uma única obra.
     Por isso a tela do cliente sempre mostra quantas obras estão
     cadastradas e oferece os atalhos para cada uma, e a tela da obra
     reúne o histórico completo dela (fiscalizações, relatórios, fotos,
     serviços/OS, documentos e pendências).

     Nada disso substitui as telas existentes: os blocos entram por
     MS.registerClienteTopo / MS.registerObraTopo, que o núcleo insere
     logo abaixo do cabeçalho da entidade.
     ====================================================================== */

  function contaFotosObra(obraId) {
    return MS.fotosPorObra(obraId).length;
  }

  function contaRelatoriosObra(obraId) {
    return MS.obrasEmAndamento && MS.rdoPorObra ? MS.rdoPorObra(obraId).length : 0;
  }

  function contaFiscalizacoesObra(obraId) {
    if (!FISC) return 0;
    return FISC.FISCALIZACOES.filter(function (f) { return f.obraId === obraId; }).length;
  }

  // Pendências da obra = não conformidades em aberto + itens a vencer.
  function contaPendenciasObra(obraId) {
    if (!FISC) return 0;
    var nc = FISC.todasNC().filter(function (n) {
      return n.f.obraId === obraId && n.nc.status !== "Corrigido";
    }).length;
    var venc = FISC.vencimentosProximos().filter(function (v) { return v.f.obraId === obraId; }).length;
    return nc + venc;
  }

  /* ---- Bloco do CLIENTE: quantas obras + atalhos ---- */
  MS.registerClienteTopo(function (c) {
    var n = c.obras.length;
    var chips = c.obras.map(function (o) {
      var pend = contaPendenciasObra(o.id);
      var cor = o.status === "Finalizada" ? "status--concluido" : o.status === "Pendente" ? "status--warn" : "status--active";
      return '<button class="obra-chip" data-href="#/obra/' + o.id + '">' +
        '<span class="obra-chip__b"><strong>' + esc(o.nome) + "</strong>" +
        '<span class="obra-chip__meta">' + esc(o.local) + " · " + contaFiscalizacoesObra(o.id) + " fiscalização" +
        (contaFiscalizacoesObra(o.id) === 1 ? "" : "ões") + (pend ? " · " + pend + " pendência" + (pend === 1 ? "" : "s") : "") + "</span></span>" +
        '<span class="status ' + cor + '">' + esc(o.status) + "</span></button>";
    }).join("");

    return '<div class="hist-obra rv">' +
      '<div class="hist-obra__head">' +
      '<span class="hist-obra__ico">' + ico("obra") + "</span>" +
      '<div class="hist-obra__b"><h2>Histórico da obra</h2>' +
      '<p>Obras cadastradas: <strong>' + n + "</strong> — acesse o histórico completo de cada uma.</p></div>" +
      '<button class="btn btn--primary btn--sm" data-action="nova-obra">+ Nova obra</button>' +
      "</div>" +
      '<div class="hist-obra__chips">' + chips +
      '<button class="obra-chip obra-chip--novo" data-action="nova-obra"><strong>+ Nova obra</strong>' +
      '<span class="obra-chip__meta">vinculada a este cliente</span></button>' +
      "</div></div>";
  });

  /* ---- Bloco da OBRA: histórico com os contadores ---- */
  MS.registerObraTopo(function (o) {
    var c = MS.clientePorObra(o.id);
    var fiscalizacoes = contaFiscalizacoesObra(o.id);
    var relatorios = MS.rdoPorObra(o.id).length;
    var fotos = contaFotosObra(o.id);
    var pendencias = contaPendenciasObra(o.id);

    var contadores = [
      ["Fiscalizações", fiscalizacoes, false],
      ["Relatórios", relatorios, false],
      ["Fotos", fotos, false],
      ["Pendências", pendencias, pendencias > 0]
    ].map(function (k) {
      return '<div class="hist-num' + (k[2] ? " hist-num--warn" : "") + '">' +
        '<span class="hist-num__v">' + k[1] + '</span><span class="hist-num__l">' + esc(k[0]) + "</span></div>";
    }).join("");

    return '<div class="hist-obra rv">' +
      '<div class="hist-obra__head">' +
      '<span class="hist-obra__ico">' + ico("shield") + "</span>" +
      '<div class="hist-obra__b"><h2>Histórico da obra</h2>' +
      "<p>" + esc(c.nome) + " · " + esc(o.nome) + " — fiscalizações, relatórios, fotos, serviços e documentos desta obra.</p></div>" +
      '<button class="btn btn--primary btn--sm" data-action="nova-fiscalizacao">+ Nova fiscalização</button>' +
      "</div>" +
      '<div class="hist-obra__num">' + contadores + "</div>" +
      '<div class="hist-obra__atalhos">' +
      '<button class="hist-atalho" data-hist-tab="fiscalizacoes">Fiscalizações</button>' +
      '<button class="hist-atalho" data-hist-tab="rdos">Relatórios</button>' +
      '<button class="hist-atalho" data-hist-tab="fotos">Fotos</button>' +
      '<button class="hist-atalho" data-hist-tab="servicos">Serviços / OS</button>' +
      '<button class="hist-atalho" data-hist-tab="documentos">Documentos</button>' +
      '<button class="hist-atalho" data-hist-tab="resumo">Visão geral</button>' +
      "</div></div>";
  });

  // Os atalhos abrem a aba correspondente da própria tela da obra.
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-hist-tab]");
    if (!b) return;
    var alvo = document.querySelector('#view .tab[data-tab="' + b.getAttribute("data-hist-tab") + '"]');
    if (alvo) { e.preventDefault(); alvo.click(); }
  });

  /* ======================================================================
     9. ROTAS
     ====================================================================== */
  MS.registerRoute("agenda", function () { renderAgenda(); });
  MS.registerRoute("documentos", function () { renderDocumentos(); });
  MS.registerRoute("notificacoes", function () { renderNotificacoes(); });
  MS.registerRoute("equipe", function () { renderEquipe(); });
  MS.registerRoute("treinamentos", function (parts) {
    if (parts && parts[1] === "certificados") return MS.go("certificados");
    renderTreinamentos();
  });

  // Exposição para inspeção da demonstração
  window.MS_PAGINAS = {
    AGENDA: AGENDA,
    ARQUIVOS: ARQUIVOS,
    CATEGORIAS: CATEGORIAS,
    notificacoes: notificacoes,
    renderAgenda: renderAgenda,
    renderDocumentos: renderDocumentos,
    renderNotificacoes: renderNotificacoes,
    renderEquipe: renderEquipe,
    renderTreinamentos: renderTreinamentos
  };
})();
