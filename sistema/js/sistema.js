/* ==========================================================================
   MS Consultoria — Sistema interno · Demonstração visual navegável
   ==========================================================================
   IMPORTANTE: TODOS os dados abaixo são FICTÍCIOS/demonstrativos.
   Nenhum dado real da MS Consultoria é usado. A arquitetura conceitual é:

   CLIENTE → OBRAS → SERVIÇOS / OS → RELATÓRIOS DIÁRIOS (RDO)
          → ATIVIDADES → FOTOS → OBSERVAÇÕES

   Um cliente pode ter várias obras; uma obra pode ter vários serviços.
   As fotos ficam vinculadas à obra, ao serviço/OS, à data e ao relatório.
   ========================================================================== */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ======================================================================
     DADOS DEMONSTRATIVOS
     ====================================================================== */
  var NOW = new Date(2026, 8, 1, 16, 42); // 01/09/2026 16:42

  function iso(day, month, h, m) {
    return new Date(2026, month - 1, day, h || 8, m || 0);
  }
  function fmtTime(d) {
    return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  }
  function fmtDate(d) {
    return String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0") + "/" + d.getFullYear();
  }

  // ---- Clientes (cada cliente é único; obras são filhos) ----
  var CLIENTES = [
    {
      id: "c1",
      nome: "Construtora Exemplo",
      cnpj: "00.000.000/0001-00",
      segmento: "Construção civil",
      contato: "Carlos Mendes",
      email: "contato@construtorax.com.br",
      telefone: "(81) 3000-0000",
      responsavel: "Maria Silva",
      obras: [
        {
          id: "o1",
          nome: "Residencial Boa Vista",
          local: "Recife — PE",
          status: "Em andamento",
          responsavel: "Maria Silva",
          inicio: "12/05/2026",
          previsao: "12/12/2026",
          progresso: 68,
          resumo: "Condomínio residencial com 4 torres — acompanhamento SST em obras de acabamento, trabalhos em altura e instalações elétricas.",
          servicos: [
            { id: "s1", nome: "Acompanhamento SST", tipo: "Consultoria SST", inicio: "12/05/2026", previsao: "12/12/2026", responsavel: "Maria Silva", status: "Em andamento", os: "OS #2026-0048" },
            { id: "s2", nome: "Inspeção de segurança", tipo: "Inspeção de obra", inicio: "20/05/2026", previsao: "Recorrente", responsavel: "João Pereira", status: "Em andamento", os: "OS #2026-0051" },
            { id: "s3", nome: "Treinamento NR 35", tipo: "Treinamento", inicio: "03/08/2026", previsao: "07/08/2026", responsavel: "Ana Costa", status: "Finalizado", os: "OS #2026-0062" }
          ]
        },
        {
          id: "o2",
          nome: "Galpão Industrial Norte",
          local: "Olinda — PE",
          status: "Em andamento",
          responsavel: "João Pereira",
          inicio: "02/03/2026",
          previsao: "30/11/2026",
          progresso: 45,
          resumo: "Galpão logístico de 12.000 m² — implantação de PGR, gestão de riscos mecânicos e acompanhamento de movimentação de cargas.",
          servicos: [
            { id: "s4", nome: "Gestão de riscos", tipo: "PGR / NR-12", inicio: "02/03/2026", previsao: "30/11/2026", responsavel: "João Pereira", status: "Em andamento", os: "OS #2026-0039" },
            { id: "s5", nome: "Elaboração documental", tipo: "Documentação SST", inicio: "10/03/2026", previsao: "10/10/2026", responsavel: "Ana Costa", status: "Em andamento", os: "OS #2026-0040" }
          ]
        },
        {
          id: "o3",
          nome: "Edifício Central",
          local: "Jaboatão — PE",
          status: "Finalizada",
          responsavel: "Maria Silva",
          inicio: "15/01/2025",
          previsao: "15/01/2026",
          progresso: 100,
          resumo: "Edifício comercial de 18 pavimentos — obra concluída com PGR, PCMSO e CIPA implantados.",
          servicos: [
            { id: "s6", nome: "Consultoria SST completa", tipo: "Consultoria SST", inicio: "15/01/2025", previsao: "15/01/2026", responsavel: "Maria Silva", status: "Finalizado", os: "OS #2025-0007" }
          ]
        },
        {
          id: "o4",
          nome: "Vila Mariana Residencial",
          local: "Cabo de Santo Agostinho — PE",
          status: "Em andamento",
          responsavel: "Ana Costa",
          inicio: "01/07/2026",
          previsao: "01/07/2027",
          progresso: 22,
          resumo: "Residencial de 6 blocos — inicio de obras, implementação de PGR e treinamentos de integração.",
          servicos: [
            { id: "s7", nome: "Acompanhamento SST", tipo: "Consultoria SST", inicio: "01/07/2026", previsao: "01/07/2027", responsavel: "Ana Costa", status: "Em andamento", os: "OS #2026-0071" }
          ]
        }
      ]
    },
    {
      id: "c2",
      nome: "Indústria Recife Metal",
      cnpj: "00.000.000/0002-00",
      segmento: "Indústria metalúrgica",
      contato: "Roberto Ferreira",
      email: "rh@recifemetal.com.br",
      telefone: "(81) 3000-0001",
      responsavel: "João Pereira",
      obras: [
        {
          id: "o5",
          nome: "Planta Recife",
          local: "Recife — PE",
          status: "Em andamento",
          responsavel: "João Pereira",
          inicio: "10/02/2026",
          previsao: "10/08/2027",
          progresso: 54,
          resumo: "Indústria metalúrgica — gestão de riscos, PCMSO e treinamentos normativos.",
          servicos: [
            { id: "s8", nome: "Gestão de riscos", tipo: "PGR", inicio: "10/02/2026", previsao: "10/08/2027", responsavel: "João Pereira", status: "Em andamento", os: "OS #2026-0035" },
            { id: "s9", nome: "Treinamentos NR", tipo: "Treinamento", inicio: "15/03/2026", previsao: "Recorrente", responsavel: "Ana Costa", status: "Em andamento", os: "OS #2026-0044" }
          ]
        },
        {
          id: "o6",
          nome: "Unidade Paulista",
          local: "Paulista — PE",
          status: "Pendente",
          responsavel: "Maria Silva",
          inicio: "01/10/2026",
          previsao: "—",
          progresso: 0,
          resumo: "Nova unidade aguardando inicio de obras e mobilização da equipe de SST.",
          servicos: []
        }
      ]
    },
    {
      id: "c3",
      nome: "Transportadora Pernambuco Express",
      cnpj: "00.000.000/0003-00",
      segmento: "Transporte e logística",
      contato: "Ana Paula Silva",
      email: "contato@peexpress.com.br",
      telefone: "(81) 3000-0002",
      responsavel: "Maria Silva",
      obras: [
        {
          id: "o7",
          nome: "Base Matriz",
          local: "Recife — PE",
          status: "Em andamento",
          responsavel: "Maria Silva",
          inicio: "05/01/2026",
          previsao: "05/01/2027",
          progresso: 61,
          resumo: "Base operacional — eSocial, PCMSO, treinamento de direção defensiva e gestão de documentação.",
          servicos: [
            { id: "s10", nome: "Assessoria eSocial", tipo: "Assessoria", inicio: "05/01/2026", previsao: "05/01/2027", responsavel: "Maria Silva", status: "Em andamento", os: "OS #2026-0019" },
            { id: "s11", nome: "Direção defensiva", tipo: "Treinamento", inicio: "12/06/2026", previsao: "12/06/2026", responsavel: "Ana Costa", status: "Finalizado", os: "OS #2026-0055" }
          ]
        }
      ]
    },
    {
      id: "c4",
      nome: "Edificações Norte Engenharia",
      cnpj: "00.000.000/0004-00",
      segmento: "Construção civil",
      contato: "Paulo Andrade",
      email: "engenharia@norte.com.br",
      telefone: "(81) 3000-0003",
      responsavel: "João Pereira",
      obras: [
        {
          id: "o8",
          nome: "Torre Comercial Mar",
          local: "Olinda — PE",
          status: "Em andamento",
          responsavel: "João Pereira",
          inicio: "18/04/2026",
          previsao: "18/12/2026",
          progresso: 39,
          resumo: "Torre comercial — acompanhamento de fachada (trabalhos em altura), PGR e inspeções.",
          servicos: [
            { id: "s12", nome: "Acompanhamento SST", tipo: "Consultoria SST", inicio: "18/04/2026", previsao: "18/12/2026", responsavel: "João Pereira", status: "Em andamento", os: "OS #2026-0049" }
          ]
        }
      ]
    }
  ];

  // ---- Fotos demonstrativas vinculadas (obra, serviço, data, relatório) ----
  var FOTOS = [
    { id: "f1382", obra: "o1", servico: "s1", os: "OS #2026-0048", data: iso(1, 9, 14, 37), obs: "Instalação da proteção coletiva concluída neste pavimento.", relatorio: "RDO #034", responsavel: "Maria Silva", atividade: "Inspeção de EPC" },
    { id: "f1381", obra: "o1", servico: "s1", os: "OS #2026-0048", data: iso(1, 9, 14, 22), obs: "Guardacorpo fixado no perímetro do pavimento 4.", relatorio: "RDO #034", responsavel: "Maria Silva", atividade: "Inspeção de EPC" },
    { id: "f1380", obra: "o1", servico: "s2", os: "OS #2026-0051", data: iso(1, 9, 11, 20), obs: "Verificação de EPC concluída — sem não conformidades.", relatorio: "RDO #034", responsavel: "João Pereira", atividade: "Verificação de EPC" },
    { id: "f1379", obra: "o1", servico: "s2", os: "OS #2026-0051", data: iso(1, 9, 9, 40), obs: "Início das atividades da equipe — DDS realizado.", relatorio: "RDO #034", responsavel: "João Pereira", atividade: "DDS da equipe" },
    { id: "f1378", obra: "o1", servico: "s1", os: "OS #2026-0048", data: iso(31, 8, 17, 42), obs: "Finalização do dia — registro fotográfico do pavimento.", relatorio: "RDO #033", responsavel: "Maria Silva", atividade: "Encerramento" },
    { id: "f1377", obra: "o1", servico: "s1", os: "OS #2026-0048", data: iso(31, 8, 16, 10), obs: "Instalação de linha de vida horizontal no telhado.", relatorio: "RDO #033", responsavel: "Maria Silva", atividade: "Linha de vida" },
    { id: "f1376", obra: "o1", servico: "s3", os: "OS #2026-0062", data: iso(5, 8, 10, 5), obs: "Turma de treinamento NR 35 — parte prática.", relatorio: "RDO #027", responsavel: "Ana Costa", atividade: "Treinamento NR 35" },
    { id: "f1375", obra: "o1", servico: "s3", os: "OS #2026-0062", data: iso(4, 8, 9, 30), obs: "Treinamento NR 35 — sala de aula com equipe.", relatorio: "RDO #026", responsavel: "Ana Costa", atividade: "Treinamento NR 35" },
    { id: "f1374", obra: "o2", servico: "s4", os: "OS #2026-0039", data: iso(1, 9, 10, 15), obs: "Inspeção de empilhadeiras na área de expedição.", relatorio: "RDO #034", responsavel: "João Pereira", atividade: "Inspeção de máquinas" },
    { id: "f1373", obra: "o2", servico: "s4", os: "OS #2026-0039", data: iso(31, 8, 11, 2), obs: "Verificação de proteção de máquinas (NR-12).", relatorio: "RDO #033", responsavel: "João Pereira", atividade: "NR-12" },
    { id: "f1372", obra: "o3", servico: "s6", os: "OS #2025-0007", data: iso(14, 1, 15, 20), obs: "Obra concluída — entrega final da documentação SST.", relatorio: "RDO #120", responsavel: "Maria Silva", atividade: "Entrega" },
    { id: "f1371", obra: "o4", servico: "s7", os: "OS #2026-0071", data: iso(1, 9, 8, 55), obs: "Canteiro de obras — início da implantação do PGR.", relatorio: "RDO #034", responsavel: "Ana Costa", atividade: "Implantação PGR" }
  ];

  // ---- Equipe demonstrativa ----
  var EQUIPE = [
    { id: "e1", nome: "Maria Silva", funcao: "Responsável técnica", ctt: "(81) 90000-0001" },
    { id: "e2", nome: "João Pereira", funcao: "Técnico de Segurança", ctt: "(81) 90000-0002" },
    { id: "e3", nome: "Ana Costa", funcao: "Engenheira de Segurança", ctt: "(81) 90000-0003" },
    { id: "e4", nome: "Pedro Lima", funcao: "Técnico de Segurança", ctt: "(81) 90000-0004" },
    { id: "e5", nome: "Luana Souza", funcao: "Enfermeira do Trabalho", ctt: "(81) 90000-0005" }
  ];

  // ---- Relatórios (RDO) demonstrativos por obra ----
  function makeRDOs() {
    var rdos = [];
    var base = { o1: { n: 34, from: 27, months: 8 }, o2: { n: 31, from: 24, months: 8 }, o4: { n: 9, from: 6, months: 7 } };
    Object.keys(base).forEach(function (ok) {
      var cfg = base[ok];
      var num = cfg.n;
      for (var i = 0; i < 6; i++) {
        var d = new Date(2026, 8, 1 - i, 18, 0);
        if (d.getDay() === 0) { d = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1, 18, 0); }
        rdos.push({
          id: ok + "-r" + (num - i),
          obra: ok,
          numero: "RDO #0" + (num - i),
          data: d,
          status: i === 0 ? "Rascunho" : "Finalizado",
          atividades: 5 + ((num - i) % 3),
          fotos: 6 + ((num - i) % 4),
          obs: 2 + ((num - i) % 2),
          ocorrencias: (num - i) % 5 === 0 ? 1 : 0,
          equipe: ["Maria Silva", "João Pereira"],
          responsavel: "Maria Silva"
        });
      }
    });
    // o3 (concluída) — históricos antigos
    return rdos;
  }
  var RDOs = makeRDOs();

  function rdoPorObra(obraId) {
    return RDOs.filter(function (r) { return r.obra === obraId; })
      .sort(function (a, b) { return b.data - a.data; });
  }
  function obraPorId(id) { for (var i = 0; i < CLIENTES.length; i++) { var ob = CLIENTES[i].obras.filter(function (o) { return o.id === id; }); if (ob.length) return ob[0]; } return null; }
  function clientePorObra(obraId) { for (var i = 0; i < CLIENTES.length; i++) { if (CLIENTES[i].obras.some(function (o) { return o.id === obraId; })) return CLIENTES[i]; } return null; }
  function fotosPorObra(obraId) { return FOTOS.filter(function (f) { return f.obra === obraId; }).sort(function (a, b) { return b.data - a.data; }); }

  // ---- Atividade do dia (registros que alimentam o RDO do dia) ----
  var ATIVIDADES_DIA = [
    { tipo: "atividade", hora: "09:05", titulo: "Equipe iniciou atividades", desc: "DDS realizado com 14 colaboradores no pavimento 4.", responsavel: "João Pereira" },
    { tipo: "foto", hora: "11:20", titulo: "Verificação de EPC", desc: "Registro fotográfico da verificação de equipamentos de proteção coletiva.", responsavel: "João Pereira" },
    { tipo: "atividade", hora: "13:30", titulo: "Inspeção do pavimento 4", desc: "Inspeção de segurança do andar em acabamento.", responsavel: "Maria Silva" },
    { tipo: "foto", hora: "14:37", titulo: "Proteção coletiva concluída", desc: "Instalação da proteção coletiva concluída neste pavimento.", responsavel: "Maria Silva" },
    { tipo: "ocorrencia", hora: "15:10", titulo: "Piso molhado na escada", desc: "Risco de escorregamento identificado; sinalização e limpeza solicitadas.", responsavel: "Maria Silva" },
    { tipo: "observacao", hora: "15:45", titulo: "Reunião com a equipe", desc: "Alinhamento sobre cronograma de instalação da linha de vida.", responsavel: "João Pereira" }
  ];

  /* ======================================================================
     INFRAESTRUTURA UI (toast, modal, sheet, reveal, breadcrumb)
     ====================================================================== */
  var $ = function (sel) { return document.querySelector(sel); };
  var $$ = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };

  var view = $("#view");
  var toast = $("#toast");
  var toastTimer = null;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("is-show"); }, 2800);
  }

  // Reveal on render
  function revealAll(root) {
    var els = (root || document).querySelectorAll(".rv");
    if (prefersReduced) { els.forEach(function (el) { el.classList.add("is-in"); }); return; }
    els.forEach(function (el, i) {
      setTimeout(function () { el.classList.add("is-in"); }, Math.min(340, i * 40));
    });
  }

  // Breadcrumb
  var crumbs = [];
  function setCrumbs(list) {
    crumbs = list;
    renderCrumbs();
  }
  function renderCrumbs() {
    var el = $("#breadcrumb");
    var html = "";
    crumbs.forEach(function (c, i) {
      if (i > 0) html += '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8.6 4.6 15.9 12l-7.3 7.4-1.4-1.4 6-6-6-6z"/></svg>';
      if (c.href) {
        html += '<a class="crumb crumb--link" data-crumb href="#' + c.href + '">' + esc(c.label) + "</a>";
      } else {
        html += '<span class="crumb crumb--current">' + esc(c.label) + "</span>";
      }
    });
    el.innerHTML = html;
    $$("#breadcrumb [data-crumb]").forEach(function (a) {
      a.addEventListener("click", function () { closeMenu(); });
    });
  }

  // Modal
  function openModal(html) {
    var m = $("#modal");
    $("#modal-panel").innerHTML = html;
    m.hidden = false;
    $$("#modal [data-modal-close]").forEach(function (el) { el.addEventListener("click", closeModal); });
    $$("#modal [data-modal-action]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var fn = actions[btn.getAttribute("data-modal-action")];
        if (fn) fn(btn);
      });
    });
    revealAll($("#modal-panel"));
  }
  function closeModal() { $("#modal").hidden = true; $("#modal-panel").innerHTML = ""; }

  // Sheet
  var sheet = $("#sheet");
  function openSheet() {
    sheet.hidden = false;
    document.body.style.overflow = "hidden";
    $$("#sheet [data-sheet-close]").forEach(function (el) { el.addEventListener("click", closeSheet); });
    $$("#sheet [data-sheet-action]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var fn = actions[btn.getAttribute("data-sheet-action")];
        if (fn) fn(btn);
      });
    });
  }
  function closeSheet() {
    sheet.hidden = true;
    document.body.style.overflow = "";
  }

  // Sidebar mobile
  function openMenu() { $("#sidebar").classList.add("is-open"); $("#sidebar-scrim").hidden = false; }
  function closeMenu() { $("#sidebar").classList.remove("is-open"); $("#sidebar-scrim").hidden = true; }

  // Ações reutilizáveis (modais / sheet / toasts)
  var actions = {
    "novo-cliente": function () {
      openModal(modalNovoCliente());
    },
    "nova-obra": function () {
      var cliente = actions._ctxCliente;
      openModal(modalNovaObra(cliente));
    },
    "novo-servico": function () {
      var obra = actions._ctxObra;
      openModal(modalNovoServico(obra));
    },
    "adicionar-foto": function () {
      var obra = actions._ctxObra;
      openModal(modalAdicionarFoto(obra));
    },
    "novo-rdo": function () {
      openModal(modalGerarRDO(actions._ctxObra));
    },
    "registrar-atividade": function () {
      var obra = actions._ctxObra || obraPorId("o1");
      openModal(modalRegistrarAtividade(obra));
    },
    "visualizar-pdf": function () {
      openModal(modalPdfPreview(actions._ctxObra));
    },
    foto: function () {
      closeSheet();
      openModal(modalAdicionarFoto(actions._ctxObra || obraPorId("o1")));
    },
    obs: function () {
      closeSheet();
      showToast("Observação registrada no rascunho do RDO do dia.");
    },
    ocorrencia: function () {
      closeSheet();
      showToast("Ocorrência registrada e sinalizada no relatório do dia.");
    },
    atividade: function () {
      closeSheet();
      openModal(modalRegistrarAtividade(actions._ctxObra || obraPorId("o1")));
    }
  };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ======================================================================
     MODAIS
     ====================================================================== */
  function modalHeader(titulo) {
    return '<div class="modal__head"><h3>' + titulo + '</h3><button class="modal__close" data-modal-close aria-label="Fechar"><svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3 10.6 10.6 16.9 4.3z"/></svg></button></div>';
  }

  function modalNovoCliente() {
    return (
      modalHeader("+ Novo cliente") +
      '<div class="modal__body"><div class="form-grid">' +
      '<label class="field"><span class="field__label">Razão social</span><input class="field__input" value="Nova Empresa Ltda." /></label>' +
      '<div class="form-row-2">' +
      '<label class="field"><span class="field__label">Segmento</span><input class="field__input" value="Construção civil" /></label>' +
      '<label class="field"><span class="field__label">Contato</span><input class="field__input" value="Nome do responsável" /></label>' +
      "</div>" +
      '<div class="form-row-2">' +
      '<label class="field"><span class="field__label">E-mail</span><input class="field__input" type="email" value="contato@empresa.com.br" /></label>' +
      '<label class="field"><span class="field__label">Telefone</span><input class="field__input" value="(81) 3000-0009" /></label>' +
      "</div>" +
      '<label class="field"><span class="field__label">Responsável MS</span><select class="field__input">' + EQUIPE.map(function (e) { return '<option>' + e.nome + "</option>"; }).join("") + "</select></label>" +
      "</div></div>" +
      '<div class="modal__foot"><button class="btn btn--light" data-modal-close>Cancelar</button><button class="btn btn--primary" data-modal-action="salvar-cliente">Salvar cliente</button></div>'
    );
  }

  function modalNovaObra(cliente) {
    return (
      modalHeader("+ Nova obra") +
      '<div class="modal__body">' +
      '<div class="card" style="margin-bottom:14px;padding:12px 14px;background:var(--green-50);border-color:var(--green-100)"><strong style="font-size:.88rem">Cliente:</strong> ' + esc(cliente.nome) + ' <span class="badge">4 obras</span></div>' +
      '<div class="form-grid">' +
      '<label class="field"><span class="field__label">Nome da obra</span><input class="field__input" value="Nova Obra — Recife" /></label>' +
      '<div class="form-row-2">' +
      '<label class="field"><span class="field__label">Localização</span><input class="field__input" value="Recife — PE" /></label>' +
      '<label class="field"><span class="field__label">Status</span><select class="field__input"><option>Em andamento</option><option>Pendente</option></select></label>' +
      "</div>" +
      '<label class="field"><span class="field__label">Responsável MS</span><select class="field__input">' + EQUIPE.map(function (e) { return '<option>' + e.nome + "</option>"; }).join("") + "</select></label>" +
      "</div></div>" +
      '<div class="modal__foot"><button class="btn btn--light" data-modal-close>Cancelar</button><button class="btn btn--primary" data-modal-action="salvar-obra">Salvar obra</button></div>'
    );
  }

  function modalNovoServico(obra) {
    return (
      modalHeader("+ Novo serviço") +
      '<div class="modal__body">' +
      '<div class="card" style="margin-bottom:14px;padding:12px 14px;background:var(--green-50);border-color:var(--green-100)"><strong style="font-size:.88rem">Obra:</strong> ' + esc(obra.nome) + "</div>" +
      '<div class="form-grid">' +
      '<label class="field"><span class="field__label">Tipo de serviço</span><select class="field__input"><option>Consultoria SST</option><option>Acompanhamento de obra</option><option>Inspeção de segurança</option><option>Treinamento</option><option>Elaboração documental</option><option>Gestão de riscos</option></select></label>' +
      '<label class="field"><span class="field__label">Nome do serviço</span><input class="field__input" value="Acompanhamento SST" /></label>' +
      '<div class="form-row-2">' +
      '<label class="field"><span class="field__label">Início</span><input class="field__input" value="01/09/2026" /></label>' +
      '<label class="field"><span class="field__label">Previsão</span><input class="field__input" value="01/12/2026" /></label>' +
      "</div>" +
      '<label class="field"><span class="field__label">Responsável</span><select class="field__input">' + EQUIPE.map(function (e) { return '<option>' + e.nome + "</option>"; }).join("") + "</select></label>" +
      "</div></div>" +
      '<div class="modal__foot"><button class="btn btn--light" data-modal-close>Cancelar</button><button class="btn btn--primary" data-modal-action="salvar-servico">Criar serviço + OS</button></div>'
    );
  }

  function modalAdicionarFoto(obra) {
    return (
      modalHeader("Nova evidência") +
      '<div class="modal__body">' +
      '<div class="upload-zone"><div class="upload-zone__icon">📷</div><div class="upload-zone__title">Upload da foto</div><div class="upload-zone__sub">Arraste ou toque para escolher (demo)</div></div>' +
      '<div style="height:16px"></div>' +
      '<div class="form-grid">' +
      '<label class="field"><span class="field__label">Obra</span><select class="field__input"><option>' + esc(obra.nome) + "</option></select></label>" +
      '<label class="field"><span class="field__label">Serviço</span><select class="field__input">' + (obra.servicos.length ? obra.servicos.map(function (s) { return "<option>" + esc(s.nome) + "</option>"; }).join("") : "<option>—</option>") + "</select></label>" +
      '<label class="field"><span class="field__label">Atividade</span><input class="field__input" value="Inspeção de EPC" /></label>' +
      '<label class="field"><span class="field__label">Observação</span><textarea class="field__input" placeholder="Descreva a evidência…"></textarea></label>' +
      '<label class="field"><span class="field__label">Data/hora</span><input class="field__input" value="Automática — 01/09/2026 16:42" disabled style="opacity:.75" /></label>' +
      "</div></div>" +
      '<div class="modal__foot"><button class="btn btn--light" data-modal-close>Cancelar</button><button class="btn btn--primary" data-modal-action="salvar-foto">Salvar evidência</button></div>'
    );
  }

  function modalGerarRDO(obra) {
    var atividades = 7, fotos = 18, obs = 3, ocorrencia = 1, equipe = 5;
    return (
      modalHeader("Gerar relatório do dia") +
      '<div class="modal__body">' +
      '<p style="font-size:.92rem;color:var(--grey-500);margin-bottom:16px">O sistema reúne tudo que foi registrado hoje na obra <strong style="color:var(--green-900)">' + esc(obra.nome) + '</strong> e monta o rascunho do relatório.</p>' +
      '<div class="card" style="padding:18px;background:var(--green-50);border-color:var(--green-100)">' +
      '<h4 style="font-size:.95rem;margin-bottom:12px">Resumo do dia</h4>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
      '<div class="os-field"><div class="os-field__label">Atividades</div><div class="os-field__value">' + atividades + '</div></div>' +
      '<div class="os-field"><div class="os-field__label">Fotos</div><div class="os-field__value">' + fotos + '</div></div>' +
      '<div class="os-field"><div class="os-field__label">Observações</div><div class="os-field__value">' + obs + '</div></div>' +
      '<div class="os-field"><div class="os-field__label">Ocorrências</div><div class="os-field__value">' + ocorrencia + '</div></div>' +
      '<div class="os-field"><div class="os-field__label">Equipe presente</div><div class="os-field__value">' + equipe + ' integrantes</div></div>' +
      '<div class="os-field"><div class="os-field__label">Relatório</div><div class="os-field__value">RDO #034</div></div>' +
      "</div></div>" +
      '<div class="card" style="margin-top:14px;padding:14px 16px;background:#fdf3e0;border-color:#f7e3c4;font-size:.86rem;color:var(--grey-700)"><strong>Confira antes de finalizar:</strong> o relatório é gerado como <strong>Rascunho</strong> e nunca é finalizado sozinho — sempre passa pela conferência da responsável.</div>' +
      "</div>" +
      '<div class="modal__foot"><button class="btn btn--light" data-modal-close>Cancelar</button><button class="btn btn--amber" data-modal-action="gerar-rdo">Gerar RDO automaticamente</button></div>'
    );
  }

  function modalRegistrarAtividade(obra) {
    return (
      modalHeader("Registrar atividade") +
      '<div class="modal__body">' +
      '<div class="card" style="margin-bottom:14px;padding:12px 14px;background:var(--green-50);border-color:var(--green-100)"><strong style="font-size:.88rem">Obra:</strong> ' + esc(obra.nome) + "</div>" +
      '<div class="form-grid">' +
      '<label class="field"><span class="field__label">Tipo</span><select class="field__input"><option>Atividade executada</option><option>Observação</option><option>Ocorrência</option><option>Serviço realizado</option></select></label>' +
      '<label class="field"><span class="field__label">Atividade</span><input class="field__input" value="Inspeção do pavimento 4" /></label>' +
      '<label class="field"><span class="field__label">Descrição</span><textarea class="field__input" placeholder="Descreva o que foi executado…"></textarea></label>' +
      '<div class="form-row-2">' +
      '<label class="field"><span class="field__label">Horário</span><input class="field__input" value="16:42" /></label>' +
      '<label class="field"><span class="field__label">Responsável</span><select class="field__input"><option>Maria Silva</option></select></label>' +
      "</div>" +
      "</div></div>" +
      '<div class="modal__foot"><button class="btn btn--light" data-modal-close>Cancelar</button><button class="btn btn--primary" data-modal-action="salvar-atividade">Registrar</button></div>'
    );
  }

  function modalPdfPreview(obra) {
    return (
      modalHeader("Exportar PDF — conceitual") +
      '<div class="modal__body">' +
      '<p style="font-size:.92rem;color:var(--grey-500);margin-bottom:16px">O relatório final poderá gerar um PDF profissional com a identidade da MS.</p>' +
      '<div class="pdf-preview" style="background:#fff;border:1px solid var(--grey-200);border-radius:12px;padding:22px;box-shadow:var(--shadow)">' +
      '<div style="display:flex;align-items:center;gap:10px;border-bottom:2px solid var(--green-700);padding-bottom:12px">' +
      '<span class="brand__shield"><svg viewBox="0 0 32 32" width="30" height="30"><path d="M16 2 4 7v8c0 7 5 13 12 15 7-2 12-8 12-15V7L16 2z" fill="currentColor"/><path d="M16 7l-6.5 3v5.5c0 4.6 2.8 8.6 6.5 10 3.7-1.4 6.5-5.4 6.5-10V10L16 7z" fill="#fff"/></svg></span>' +
      '<div><strong style="color:var(--green-900)">MS Consultoria</strong><div style="font-size:.76rem;color:var(--grey-500)">Saúde e Segurança do Trabalho</div></div>' +
      '<span style="margin-left:auto" class="status status--muted">Rascunho</span>' +
      "</div>" +
      '<div style="padding:16px 0;display:grid;gap:4px;font-size:.9rem"><strong style="font-size:1.05rem;color:var(--green-900)">RDO — Relatório Diário de Obra</strong><span>' + esc(obra.nome) + "</span><span style='color:var(--grey-500)'>01 de setembro de 2026 · Responsável: Maria Silva</span></div>" +
      '<div style="border-top:1px dashed var(--grey-200);padding:14px 0;font-size:.84rem;color:var(--grey-700)"><strong style="color:var(--green-900)">Atividades executadas</strong><div style="margin-top:6px;display:grid;gap:4px">• Inspeção do pavimento 4<br/>• Verificação de EPC<br/>• DDS com a equipe</div></div>' +
      '<div style="border-top:1px dashed var(--grey-200);padding:14px 0;font-size:.84rem;color:var(--grey-700)"><strong style="color:var(--green-900)">Registro fotográfico</strong><div style="margin-top:8px;display:grid;grid-template-columns:repeat(3,1fr);gap:8px">' +
      '<div class="photo-card__img" style="aspect-ratio:4/3;border-radius:8px"></div><div class="photo-card__img" style="aspect-ratio:4/3;border-radius:8px"></div><div class="photo-card__img" style="aspect-ratio:4/3;border-radius:8px"></div>' +
      "</div></div>" +
      '<div style="border-top:1px dashed var(--grey-200);padding:14px 0;font-size:.84rem;color:var(--grey-700)"><strong style="color:var(--green-900)">Observações</strong><div style="margin-top:4px">Reunião de alinhamento sobre a instalação da linha de vida.</div></div>' +
      '<div style="border-top:1px solid var(--grey-200);padding:18px 0 0;display:flex;justify-content:space-between;align-items:center;font-size:.8rem;color:var(--grey-500)"><span>Assinatura da responsável<br/><span style="display:inline-block;margin-top:26px;border-bottom:1px solid var(--grey-300);width:150px">&nbsp;</span></span><span class="status status--muted">PDF · A4</span></div>' +
      "</div>" +
      '<div class="card" style="margin-top:14px;padding:12px 14px;background:var(--green-50);border-color:var(--green-100);font-size:.84rem">A geração real do PDF com identidade, fotos e assinatura será implementada na versão final.</div>' +
      "</div>" +
      '<div class="modal__foot"><button class="btn btn--light" data-modal-close>Fechar</button><button class="btn btn--primary" data-modal-action="baixar-pdf">Baixar PDF (demo)</button></div>'
    );
  }

  // Ações de modal que apenas confirmam (demo)
  actions["salvar-cliente"] = function () { closeModal(); showToast("Cliente criado (demonstração). O cadastro único permite várias obras."); };
  actions["salvar-obra"] = function () { closeModal(); showToast("Nova obra vinculada ao cliente — sem duplicar o cadastro."); };
  actions["salvar-servico"] = function () { closeModal(); showToast("Serviço criado com OS gerada automaticamente."); };
  actions["salvar-foto"] = function () { closeModal(); showToast("Foto salva e vinculada à obra, serviço, data e relatório."); };
  actions["salvar-atividade"] = function () { closeModal(); showToast("Atividade registrada no rascunho do RDO do dia."); };
  actions["gerar-rdo"] = function () {
    closeModal();
    showToast("RDO #034 gerado como Rascunho — pronto para revisão.");
    renderRoute();
  };
  actions["baixar-pdf"] = function () { showToast("Download de PDF disponível na versão final."); };

  /* ======================================================================
     RENDERERS DE TELA
     ====================================================================== */

  // ---------- Login ----------
  function renderLogin() {
    $("#login").hidden = false;
    $("#app").hidden = true;
    $("#fab").hidden = true;
    $("#demo-bar").hidden = false;
    crumbs = [];
    renderCrumbs();
    window.scrollTo(0, 0);
  }

  // ---------- Shell ----------
  function showApp() {
    $("#login").hidden = true;
    $("#app").hidden = false;
    $("#fab").hidden = false;
    window.scrollTo(0, 0);
    setActiveNav();
  }

  function setActiveNav() {
    var route = currentRoute().name;
    $$(".nav-item[data-nav]").forEach(function (el) {
      var on = el.getAttribute("data-nav") === route ||
        (route === "obra" && el.getAttribute("data-nav") === "obras") ||
        (route === "cliente" && el.getAttribute("data-nav") === "clientes") ||
        (route === "rdo" && el.getAttribute("data-nav") === "relatorios") ||
        (route === "fotos-obra" && el.getAttribute("data-nav") === "fotos");
      el.classList.toggle("is-active", on);
    });
  }

  // ---------- Dashboard ----------
  function renderDashboard() {
    showApp();
    setCrumbs([{ label: "Dashboard" }]);
    actions._ctxObra = null;

    var kpis = [
      { label: "Clientes ativos", value: "24", icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M16 11c1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3 1.3 3 3 3zm-8 0c1.7 0 3-1.3 3-3S9.7 5 8 5 5 6.3 5 8s1.3 3 3 3zm0 2c-2.3 0-7 1.2-7 3.5V19h14v-2.5c0-2.3-4.7-3.5-7-3.5zm8 0c-.3 0-.6 0-1 .1 1.2.8 2 1.8 2 3.4V19h6v-2.5c0-2.3-4.7-3.5-7-3.5z"/></svg>' },
      { label: "Obras ativas", value: "18", icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 8h-1V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2zM8 6h8v2H8V6zm11 12H5v-4h14v4zm0-6H5v-2h14v2z"/></svg>' },
      { label: "Serviços em andamento", value: "31", icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2 3 7v10l9 5 9-5V7l-9-5z"/></svg>' },
      { label: "Relatórios de hoje", value: "12", icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16H5V5h14v14z"/></svg>' },
      { label: "Pendências", value: "04", warn: true, icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2 1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z"/></svg>' },
      { label: "Aguardando revisão", value: "03", warn: true, icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>' }
    ];

    view.innerHTML =
      '<div class="page-head rv"><div><h1 class="page-head__title">Dashboard</h1><p class="page-head__sub">Visão operacional de hoje · <strong>01 de setembro de 2026</strong></p></div>' +
      '<div class="page-head__actions"><button class="btn btn--light btn--sm" data-action="novo-cliente">+ Novo cliente</button><button class="btn btn--primary btn--sm" data-action="novo-rdo">Gerar relatório do dia</button></div></div>' +

      '<div class="kpi-grid">' +
      kpis.map(function (k, i) {
        return '<div class="kpi rv' + (k.warn ? " kpi--warn" : "") + '" style="transition-delay:' + i * 30 + 'ms"><span class="kpi__icon">' + k.icon + "</span><span class=\"kpi__label\">" + k.label + '</span><div class="kpi__value">' + k.value + "</div></div>";
      }).join("") +
      "</div>" +

      '<div class="grid-2">' +
      '<div class="card rv"><div class="card__head"><h3>Hoje na operação</h3><span class="status status--active">Ao vivo · demo</span></div><div class="feed">' +
      [
        { icon: "photo", t: "14:37", title: "Foto adicionada", desc: "Proteção coletiva concluída — Residencial Boa Vista", obra: "o1" },
        { icon: "warn", t: "15:10", title: "Ocorrência registrada", desc: "Piso molhado na escada — Residencial Boa Vista", obra: "o1" },
        { icon: "", t: "14:02", title: "RDO #034 gerado (rascunho)", desc: "Residencial Boa Vista — aguardando revisão", obra: "o1" },
        { icon: "photo", t: "10:15", title: "Foto adicionada", desc: "Inspeção de empilhadeiras — Galpão Industrial Norte", obra: "o2" },
        { icon: "", t: "09:05", title: "Atividade registrada", desc: "Equipe iniciou atividades — Residencial Boa Vista", obra: "o1" },
        { icon: "", t: "08:55", title: "Implantação PGR iniciada", desc: "Vila Mariana Residencial", obra: "o4" }
      ].map(function (f) {
        return feedItem(f, "o1");
      }).join("") +
      "</div></div>" +

      '<div class="card rv"><div class="card__head"><h3>Relatórios aguardando revisão</h3><a class="link-btn" href="#/relatorios">Ver todos</a></div>' +
      '<div class="table-wrap"><table class="table"><thead><tr><th>RDO</th><th>Obra</th><th>Status</th><th>Ações</th></tr></thead><tbody>' +
      [
        { n: "RDO #034", obra: "o1", status: "Rascunho" },
        { n: "RDO #034", obra: "o2", status: "Rascunho" },
        { n: "RDO #033", obra: "o4", status: "Aguardando revisão" }
      ].map(function (r) {
        return '<tr class="is-clickable" data-href="#/obra/' + r.obra + '/rdo">' +
          '<td class="cell-strong">' + r.n + "</td>" +
          "<td>" + esc(obraPorId(r.obra).nome) + "</td>" +
          '<td><span class="status status--' + (r.status === "Rascunho" ? "warn status--rascunho" : "review") + '">' + r.status + "</span></td>" +
          '<td><span class="link-btn">Revisar</span></td></tr>';
      }).join("") +
      "</tbody></table></div></div>" +
      "</div>" +

      '<div class="grid-3">' +
      '<div class="card rv"><div class="card__head"><h3>Obras que receberam atualização</h3></div><div class="feed">' +
      [
        { t: "16:42", title: "Residencial Boa Vista", desc: "4 atividades · 6 fotos hoje", obra: "o1" },
        { t: "10:15", title: "Galpão Industrial Norte", desc: "2 atividades · 3 fotos hoje", obra: "o2" },
        { t: "08:55", title: "Vila Mariana Residencial", desc: "Implantação do PGR", obra: "o4" }
      ].map(function (f) { return feedItem(f, f.obra); }).join("") +
      "</div></div>" +

      '<div class="card rv"><div class="card__head"><h3>Responsáveis trabalhando</h3></div><div class="feed">' +
      EQUIPE.map(function (e, i) {
        return '<div class="feed__item"><span class="avatar avatar--sm">' + esc(e.nome.split(" ").map(function (p) { return p[0]; }).join("")) + '</span><div class="feed__body"><div class="feed__title">' + esc(e.nome) + '</div><div class="feed__desc">' + esc(e.funcao) + '</div><div class="feed__meta"><span class="status status--active">Em campo</span></div></div></div>';
      }).join("") +
      "</div></div>" +

      '<div class="card rv"><div class="card__head"><h3>Próximos vencimentos</h3><a class="link-btn" href="#/treinamentos">Ver agenda</a></div><div class="feed">' +
      [
        { t: "Set", title: "NR 35 — Turma B", desc: "Residencial Boa Vista · renova em 10/09", obra: "o1", warn: true },
        { t: "Set", title: "ASO — João P.", desc: "Galpão Industrial Norte · vence em 15/09", obra: "o2", warn: true },
        { t: "Out", title: "CIPA — Reeleição", desc: "Indústria Recife Metal · outubro/2026", obra: "o5" }
      ].map(function (f) { return feedItem(f, f.obra || "o1"); }).join("") +
      "</div></div>" +
      "</div>";

    wireView();
  }

  function feedItem(f, obraLink) {
    var iconClass = f.icon === "warn" ? " feed__icon--warn" : f.icon === "photo" ? " feed__icon--photo" : f.icon === "amber" ? " feed__icon--amber" : "";
    var svg = f.icon === "warn"
      ? '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2 1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z"/></svg>'
      : f.icon === "photo"
        ? '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5z"/></svg>'
        : f.icon === "amber"
          ? '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M13 13h-2V7h2v6zm0 4h-2v-2h2v2zM12 2 1 21h22L12 2z"/></svg>'
          : '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16H5V5h14v14z"/></svg>';
    return '<div class="feed__item is-clickable" data-href="#/obra/' + obraLink + '"><span class="feed__icon' + iconClass + '">' + svg + '</span><div class="feed__body"><div class="feed__title">' + esc(f.title) + '</div><div class="feed__desc">' + esc(f.desc) + '</div><div class="feed__meta"><span class="feed__time">' + f.t + "</span></div></div></div>";
  }

  // ---------- Clientes ----------
  function renderClientes() {
    showApp();
    setCrumbs([{ label: "Clientes" }]);
    actions._ctxObra = null;

    var rows = CLIENTES.map(function (c) {
      var ativas = c.obras.filter(function (o) { return o.status === "Em andamento"; }).length;
      var pend = c.obras.filter(function (o) { return o.status === "Pendente"; }).length;
      var servicos = c.obras.reduce(function (acc, o) { return acc + o.servicos.filter(function (s) { return s.status === "Em andamento"; }).length; }, 0);
      return '<tr class="is-clickable" data-href="#/cliente/' + c.id + '">' +
        '<td><span class="cell-strong">' + esc(c.nome) + '</span><span class="cell-sub">' + esc(c.segmento) + "</span></td>" +
        "<td>" + c.obras.length + "</td>" +
        "<td>" + servicos + "</td>" +
        "<td>01/09/2026</td>" +
        "<td>" + (pend ? '<span class="status status--warn">' + pend + " pendência</span>" : '<span class="status status--active">Em dia</span>') + "</td>" +
        "<td>" + (pend ? '<span class="status status--warn status--pendente">Pendente</span>' : '<span class="status status--active status--em-andamento">Ativo</span>') + "</td>" +
        "</tr>";
    }).join("");

    view.innerHTML =
      '<div class="page-head rv"><div><h1 class="page-head__title">Clientes</h1><p class="page-head__sub">Um cadastro único por cliente — cada um pode ter várias obras.</p></div>' +
      '<div class="page-head__actions"><button class="btn btn--primary btn--sm" data-action="novo-cliente">+ Novo cliente</button></div></div>' +

      '<div class="card rv" style="margin-bottom:16px;padding:14px 16px;display:flex;gap:12px;align-items:center;flex-wrap:wrap">' +
      '<label class="topbar__search" style="flex:1;min-width:220px"><svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M15.5 14h-.8l-.3-.3a6.5 6.5 0 1 0-.7.7l.3.3v.8l5 5 1.5-1.5-5-5zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z"/></svg><input id="cliente-busca" type="search" placeholder="Pesquisar cliente…" /></label>' +
      '<div class="filter-chip is-active">Todos</div><div class="filter-chip">Ativos</div><div class="filter-chip">Com pendência</div>' +
      "</div>" +

      '<div class="card rv"><div class="table-wrap"><table class="table"><thead><tr><th>Cliente</th><th>Obras</th><th>Serviços ativos</th><th>Último relatório</th><th>Pendências</th><th>Status</th></tr></thead>' +
      "<tbody>" + rows + "</tbody></table></div></div>";

    wireView();
    var busca = $("#cliente-busca");
    if (busca) busca.addEventListener("input", function () {
      var q = busca.value.toLowerCase();
      $$("#view tbody tr").forEach(function (tr) {
        tr.style.display = tr.textContent.toLowerCase().indexOf(q) >= 0 ? "" : "none";
      });
    });
  }

  // ---------- Perfil do cliente ----------
  function renderCliente(id) {
    var c = CLIENTES.filter(function (x) { return x.id === id; })[0];
    if (!c) return renderDashboard();
    showApp();
    setCrumbs([{ label: "Clientes", href: "clientes" }, { label: c.nome }]);
    actions._ctxCliente = c;
    actions._ctxObra = null;

    var ativas = c.obras.filter(function (o) { return o.status === "Em andamento"; }).length;
    var concluida = c.obras.filter(function (o) { return o.status === "Finalizada"; }).length;
    var pendente = c.obras.filter(function (o) { return o.status === "Pendente"; }).length;
    var servicos = c.obras.reduce(function (a, o) { return a + o.servicos.length; }, 0);
    var fotos = c.obras.reduce(function (a, o) { return a + fotosPorObra(o.id).length; }, 0);
    var rdos = c.obras.reduce(function (a, o) { return a + rdoPorObra(o.id).length; }, 0);

    view.innerHTML =
      '<div class="entity-head rv">' +
      '<span class="entity-head__icon"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M16 11c1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3 1.3 3 3 3zm-8 0c1.7 0 3-1.3 3-3S9.7 5 8 5 5 6.3 5 8s1.3 3 3 3zm0 2c-2.3 0-7 1.2-7 3.5V19h14v-2.5c0-2.3-4.7-3.5-7-3.5zm8 0c-.3 0-.6 0-1 .1 1.2.8 2 1.8 2 3.4V19h6v-2.5c0-2.3-4.7-3.5-7-3.5z"/></svg></span>' +
      '<div class="entity-head__titles"><h1>' + esc(c.nome) + '</h1><div class="entity-head__sub">' + esc(c.segmento) + " · " + esc(c.cnpj) + "</div></div>" +
      '<div class="entity-head__meta">' +
      '<div class="entity-meta"><div class="entity-meta__label">Contato</div><div class="entity-meta__value">' + esc(c.contato) + "</div></div>" +
      '<div class="entity-meta"><div class="entity-meta__label">Responsável MS</div><div class="entity-meta__value">' + esc(c.responsavel) + "</div></div>" +
      "</div></div>" +

      '<div class="indicators">' +
      '<div class="indicator rv"><div class="indicator__value">' + c.obras.length + '</div><div class="indicator__label">Obras</div></div>' +
      '<div class="indicator rv"><div class="indicator__value">' + servicos + '</div><div class="indicator__label">Serviços ativos</div></div>' +
      '<div class="indicator rv"><div class="indicator__value">' + rdos + '</div><div class="indicator__label">Relatórios</div></div>' +
      '<div class="indicator rv"><div class="indicator__value">' + fotos + '</div><div class="indicator__label">Fotos</div></div>' +
      "</div>" +

      '<div class="tabs rv">' +
      '<button class="tab is-active" data-tab="resumo">Visão geral</button>' +
      '<button class="tab" data-tab="obras">Obras <span class="tab__count">' + c.obras.length + "</span></button>" +
      '<button class="tab" data-tab="documentos">Documentos</button>' +
      '<button class="tab" data-tab="historico">Histórico</button>' +
      "</div>" +

      '<div id="tab-content"></div>';

    function tabResumo() {
      return (
        '<div class="grid-2">' +
        '<div class="card rv"><div class="card__head"><h3>Dados gerais</h3></div><div class="card__pad" style="display:grid;gap:10px;font-size:.92rem">' +
        '<div><span style="color:var(--grey-500)">Razão social</span><br/><strong>' + esc(c.nome) + "</strong></div>" +
        '<div><span style="color:var(--grey-500)">CNPJ</span><br/><strong>' + esc(c.cnpj) + "</strong></div>" +
        '<div><span style="color:var(--grey-500)">Contato</span><br/><strong>' + esc(c.contato) + " · " + esc(c.telefone) + "</strong></div>" +
        '<div><span style="color:var(--grey-500)">E-mail</span><br/><strong>' + esc(c.email) + "</strong></div>" +
        "</div></div>" +
        '<div class="card rv"><div class="card__head"><h3>Resumo das obras</h3><button class="btn btn--primary btn--sm" data-action="nova-obra">+ Nova obra</button></div><div class="card__pad">' +
        '<div class="grid-4" style="margin-bottom:8px">' +
        '<div class="os-field"><div class="os-field__label">Em andamento</div><div class="os-field__value">' + ativas + "</div></div>" +
        '<div class="os-field"><div class="os-field__label">Concluídas</div><div class="os-field__value">' + concluida + "</div></div>" +
        '<div class="os-field"><div class="os-field__label">Com pendência</div><div class="os-field__value">' + pendente + "</div></div>" +
        '<div class="os-field"><div class="os-field__label">Serviços</div><div class="os-field__value">' + servicos + "</div></div>" +
        "</div>" +
        '<p style="font-size:.84rem;color:var(--grey-500)">Um cliente pode ter várias obras ao mesmo tempo — sem duplicar o cadastro.</p>' +
        "</div></div>" +
        "</div>"
      );
    }

    function tabObras() {
      return (
        '<div class="grid-3">' +
        c.obras.map(function (o, i) {
          var cor = o.status === "Finalizada" ? "status--concluido" : o.status === "Pendente" ? "status--warn" : "status--active";
          return '<div class="card rv is-clickable" data-href="#/obra/' + o.id + '" style="transition-delay:' + i * 40 + 'ms">' +
            '<div class="card__pad">' +
            '<div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start;margin-bottom:10px"><h3 style="font-size:1.02rem">' + esc(o.nome) + '</h3><span class="status ' + cor + '">' + o.status + "</span></div>" +
            '<div style="font-size:.86rem;color:var(--grey-500);margin-bottom:12px">📍 ' + esc(o.local) + "</div>" +
            '<div style="display:flex;gap:16px;font-size:.82rem;margin-bottom:12px"><span><span style="color:var(--grey-500)">Serviços:</span> <strong>' + o.servicos.length + "</strong></span><span><span style='color:var(--grey-500)'>Relatórios:</span> <strong>" + rdoPorObra(o.id).length + "</strong></span></div>" +
            '<div style="display:flex;justify-content:space-between;font-size:.76rem;color:var(--grey-500);margin-bottom:5px"><span>Progresso</span><span>' + o.progresso + "%</span></div>" +
            '<div style="height:7px;border-radius:var(--radius-pill);background:var(--grey-100);overflow:hidden"><div style="width:' + o.progresso + '%;height:100%;border-radius:inherit;background:var(--green-500)"></div></div>' +
            "</div></div>";
        }).join("") +
        '<button class="card rv" data-action="nova-obra" style="display:grid;place-items:center;min-height:150px;border:2px dashed var(--green-300);background:var(--green-50);color:var(--green-700);font-weight:700;cursor:pointer">+ Nova obra<br/><span style="font-size:.78rem;font-weight:500;color:var(--grey-500)">vinculada a este cliente</span></button>' +
        "</div>"
      );
    }

    function tabDocumentos() {
      return (
        '<div class="card rv"><div class="table-wrap"><table class="table"><thead><tr><th>Documento</th><th>Obra</th><th>Validade</th><th>Status</th></tr></thead><tbody>' +
        [
          ["PGR 2026", "o1", "Dez/2026", "Em dia"],
          ["PCMSO 2026", "o1", "Dez/2026", "Em dia"],
          ["CIPA — ata", "o1", "Out/2026", "Em dia"],
          ["LTCAT", "o2", "Nov/2026", "Em dia"]
        ].map(function (d) {
          return '<tr class="is-clickable" data-href="#/obra/' + d[1] + '"><td class="cell-strong">' + d[0] + '</td><td>' + esc(obraPorId(d[1]).nome) + "</td><td>" + d[2] + '</td><td><span class="status status--active">' + d[3] + "</span></td></tr>";
        }).join("") +
        "</tbody></table></div></div>"
      );
    }

    function tabHistorico() {
      return '<div class="card rv"><div class="card__head"><h3>Linha do tempo do cliente</h3></div><div class="card__pad"><div class="timeline">' +
        [
          { c: "tl-item--done", t: "Hoje · 08:55", title: "Atividade registrada", desc: "Implantação do PGR — Vila Mariana Residencial" },
          { c: "tl-item--done", t: "31 ago", title: "RDO #033 finalizado", desc: "Residencial Boa Vista" },
          { c: "tl-item--done", t: "29 ago", title: "Treinamento NR 35 concluído", desc: "Residencial Boa Vista" },
          { c: "tl-item--done", t: "18 abr", title: "Nova obra iniciada", desc: "Torre Comercial Mar — Olinda" },
          { c: "", t: "15 jan", title: "Cliente cadastrado", desc: "Construtora Exemplo" }
        ].map(function (t) { return tlItem(t); }).join("") +
        "</div></div></div>";
    }

    function activate(tabName) {
      $$("#tab-content .tab").forEach(function (b) { b.classList.toggle("is-active", b.getAttribute("data-tab") === tabName); });
      var map = { resumo: tabResumo, obras: tabObras, documentos: tabDocumentos, historico: tabHistorico };
      var el = $("#tab-content");
      el.innerHTML = map[tabName]();
      wireView();
      revealAll(el);
    }
    activate("resumo");
    $$(".tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        activate(tab.getAttribute("data-tab"));
      });
    });
  }

  // ---------- Obras (lista global) ----------
  function renderObras() {
    showApp();
    setCrumbs([{ label: "Obras" }]);
    actions._ctxObra = null;
    var todas = [];
    CLIENTES.forEach(function (c) { c.obras.forEach(function (o) { todas.push({ c: c, o: o }); }); });

    view.innerHTML =
      '<div class="page-head rv"><div><h1 class="page-head__title">Obras</h1><p class="page-head__sub">Todas as obras de todos os clientes.</p></div>' +
      '<div class="page-head__actions"><button class="btn btn--primary btn--sm" data-action="nova-obra">+ Nova obra</button></div></div>' +
      '<div class="grid-3">' +
      todas.map(function (item, i) {
        var o = item.o, c = item.c;
        var cor = o.status === "Finalizada" ? "status--concluido" : o.status === "Pendente" ? "status--warn" : "status--active";
        return '<div class="card rv is-clickable" data-href="#/obra/' + o.id + '" style="transition-delay:' + i * 30 + 'ms"><div class="card__pad">' +
          '<div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start;margin-bottom:8px"><h3 style="font-size:1.02rem">' + esc(o.nome) + '</h3><span class="status ' + cor + '">' + o.status + "</span></div>" +
          '<div style="font-size:.82rem;color:var(--grey-500);margin-bottom:10px">' + esc(c.nome) + " · 📍 " + esc(o.local) + "</div>" +
          '<div style="display:flex;gap:14px;font-size:.8rem;flex-wrap:wrap"><span class="badge">' + o.servicos.length + ' serviços</span><span class="badge">' + rdoPorObra(o.id).length + " RDOs</span>" + (o.progresso === 100 ? '<span class="badge badge--grey">Concluída</span>' : "") + "</div>" +
          "</div></div>";
      }).join("") +
      "</div>";
    wireView();
  }

  // ---------- Tela da obra ----------
  function renderObra(id) {
    var o = obraPorId(id);
    if (!o) return renderObras();
    var c = clientePorObra(id);
    showApp();
    setCrumbs([{ label: "Clientes", href: "clientes" }, { label: c.nome, href: "cliente/" + c.id }, { label: o.nome }]);
    actions._ctxObra = o;
    actions._ctxCliente = c;

    var cor = o.status === "Finalizada" ? "status--concluido" : o.status === "Pendente" ? "status--warn" : "status--active";
    var fotos = fotosPorObra(id);
    var rdos = rdoPorObra(id);
    var pendentes = rdos.filter(function (r) { return r.status !== "Finalizado"; }).length;

    view.innerHTML =
      '<div class="entity-head rv">' +
      '<span class="entity-head__icon"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 8h-1V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2z"/></svg></span>' +
      '<div class="entity-head__titles"><h1>' + esc(o.nome) + '</h1><div class="entity-head__sub">Cliente: <strong>' + esc(c.nome) + "</strong> · 📍 " + esc(o.local) + "</div></div>" +
      '<div class="entity-head__meta">' +
      '<div class="entity-meta"><div class="entity-meta__label">Status</div><div class="entity-meta__value"><span class="status ' + cor + '" style="background:rgba(255,255,255,.14)">' + o.status + "</span></div></div>" +
      '<div class="entity-meta"><div class="entity-meta__label">Responsável</div><div class="entity-meta__value">' + esc(o.responsavel) + "</div></div>" +
      "</div></div>" +

      '<div class="kpi-grid" style="grid-template-columns:repeat(4,1fr)">' +
      '<div class="kpi rv"><span class="kpi__label">Relatórios</span><div class="kpi__value">' + rdos.length + '</div></div>' +
      '<div class="kpi rv"><span class="kpi__label">Fotos</span><div class="kpi__value">' + fotos.length + '</div></div>' +
      '<div class="kpi rv"><span class="kpi__label">Serviços</span><div class="kpi__value">' + o.servicos.length + '</div></div>' +
      '<div class="kpi rv' + (pendentes ? " kpi--alert" : "") + '"><span class="kpi__label">Pendências</span><div class="kpi__value">' + pendentes + "</div></div>" +
      "</div>" +

      '<div class="tabs rv">' +
      '<button class="tab is-active" data-tab="resumo">Resumo</button>' +
      '<button class="tab" data-tab="servicos">Serviços <span class="tab__count">' + o.servicos.length + "</span></button>" +
      '<button class="tab" data-tab="rdos">RDOs <span class="tab__count">' + rdos.length + "</span></button>" +
      '<button class="tab" data-tab="fotos">Fotos <span class="tab__count">' + fotos.length + "</span></button>" +
      '<button class="tab" data-tab="documentos">Documentos</button>' +
      '<button class="tab" data-tab="equipe">Equipe</button>' +
      '<button class="tab" data-tab="historico">Histórico</button>' +
      "</div>" +
      '<div id="tab-content"></div>';

    function tabResumo() {
      return (
        '<div class="grid-2">' +
        '<div class="card rv"><div class="card__head"><h3>Sobre a obra</h3></div><div class="card__pad">' +
        '<p style="font-size:.92rem;color:var(--grey-700);margin-bottom:14px">' + esc(o.resumo) + "</p>" +
        '<div class="form-row-2" style="gap:10px">' +
        '<div class="os-field"><div class="os-field__label">Início</div><div class="os-field__value">' + o.inicio + "</div></div>" +
        '<div class="os-field"><div class="os-field__label">Previsão</div><div class="os-field__value">' + o.previsao + "</div></div>" +
        '<div class="os-field"><div class="os-field__label">Responsável</div><div class="os-field__value">' + esc(o.responsavel) + "</div></div>" +
        '<div class="os-field"><div class="os-field__label">Local</div><div class="os-field__value">' + esc(o.local) + "</div></div>" +
        "</div>" +
        '<div style="margin-top:16px;display:flex;justify-content:space-between;font-size:.82rem;color:var(--grey-500);margin-bottom:5px"><span>Andamento</span><span>' + o.progresso + "%</span></div>" +
        '<div style="height:9px;border-radius:var(--radius-pill);background:var(--grey-100);overflow:hidden"><div style="width:' + o.progresso + '%;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--green-600),var(--green-400))"></div></div>' +
        "</div></div>" +
        '<div class="card rv"><div class="card__head"><h3>Timeline da obra</h3><a class="link-btn" href="#/obra/' + id + '/timeline">Ver completo</a></div><div class="card__pad"><div class="timeline">' +
        [
          { c: "tl-item--photo", t: "Hoje · 14:37", title: "Foto adicionada", desc: "Inspeção do pavimento 4" },
          { c: "tl-item--done", t: "Hoje · 11:20", title: "Atividade concluída", desc: "Verificação de EPC" },
          { c: "tl-item--done", t: "Hoje · 09:05", title: "Equipe iniciou atividades", desc: "DDS com 14 colaboradores" },
          { c: "tl-item--done", t: "Ontem · 17:42", title: "RDO #033 finalizado", desc: "Relatório diário fechado" }
        ].map(tlItem).join("") +
        "</div></div></div>" +
        "</div>"
      );
    }

    function tabServicos() {
      return (
        '<div class="grid-2" style="grid-template-columns:1fr 1.2fr">' +
        '<div class="card rv"><div class="card__head"><h3>Serviços da obra</h3><button class="btn btn--primary btn--sm" data-action="novo-servico">+ Novo serviço</button></div><div class="feed">' +
        o.servicos.map(function (s) {
          var cor = s.status === "Finalizado" ? "status--concluido" : "status--active";
          return '<div class="feed__item is-clickable" data-href="#/obra/' + id + '/servico/' + s.id + '">' +
            '<span class="feed__icon"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2 3 7v10l9 5 9-5V7l-9-5z"/></svg></span>' +
            '<div class="feed__body"><div class="feed__title">' + esc(s.nome) + '</div><div class="feed__desc">' + esc(s.tipo) + " · " + s.os + '</div><div class="feed__meta"><span class="status ' + cor + '">' + s.status + "</span><span>" + esc(s.responsavel) + "</span></div></div></div>";
        }).join("") +
        "</div></div>" +
        '<div class="card rv"><div class="card__head"><h3>Uma obra pode ter vários serviços</h3></div><div class="card__pad"><p style="font-size:.9rem;color:var(--grey-500);margin-bottom:14px">Cada serviço gera uma Ordem de Serviço própria e pode ter equipe, atividades, fotos e relatórios vinculados.</p>' +
        '<div class="grid-2">' +
        '<div class="os-field"><div class="os-field__label">Consultoria SST</div><div class="os-field__value">Contínuo</div></div>' +
        '<div class="os-field"><div class="os-field__label">Inspeção de segurança</div><div class="os-field__value">Semanal</div></div>' +
        '<div class="os-field"><div class="os-field__label">Treinamento</div><div class="os-field__value">Sob demanda</div></div>' +
        '<div class="os-field"><div class="os-field__label">Elaboração documental</div><div class="os-field__value">Por fase</div></div>' +
        "</div></div></div>" +
        "</div>"
      );
    }

    function tabRdos() {
      var lista = rdos;
      return (
        '<div class="card rv" style="margin-bottom:16px;padding:16px 18px;display:flex;align-items:center;gap:14px;flex-wrap:wrap;background:linear-gradient(120deg,var(--green-900),var(--green-800));border:none">' +
        '<div style="color:#fff;flex:1;min-width:200px"><strong style="font-size:1.02rem">Relatório do dia — 01/09/2026</strong><div style="font-size:.84rem;color:rgba(255,255,255,.75)">7 atividades · 18 fotos · 3 observações · 1 ocorrência</div></div>' +
        '<button class="btn btn--amber btn--sm" data-action="novo-rdo">Gerar RDO automaticamente</button>' +
        '<button class="btn btn--light btn--sm" data-action="registrar-atividade">+ Registrar atividade</button>' +
        "</div>" +
        '<div class="card rv"><div class="table-wrap"><table class="table"><thead><tr><th>Relatório</th><th>Data</th><th>Atividades</th><th>Fotos</th><th>Status</th><th>Ações</th></tr></thead><tbody>' +
        lista.map(function (r) {
          var st = r.status === "Finalizado" ? "status--concluido" : r.status === "Rascunho" ? "status--warn status--rascunho" : "status--review";
          return '<tr class="is-clickable" data-href="#/obra/' + id + '/rdo/' + r.id + '">' +
            '<td class="cell-strong">' + r.numero + "</td>" +
            "<td>" + fmtDate(r.data) + "</td>" +
            "<td>" + r.atividades + "</td>" +
            "<td>" + r.fotos + "</td>" +
            '<td><span class="status ' + st + '">' + r.status + "</span></td>" +
            '<td><span class="link-btn">Visualizar</span> · <span class="link-btn">PDF</span> · <span class="link-btn">Compartilhar</span></td>' +
            "</tr>";
        }).join("") +
        "</tbody></table></div></div>"
      );
    }

    function tabFotos() {
      return '<div class="card rv"><div class="card__head"><h3>Galeria da obra</h3><button class="btn btn--primary btn--sm" data-action="adicionar-foto">+ Adicionar foto</button></div><div class="card__pad">' +
        '<div class="gallery-toolbar"><div class="filter-chip is-active">Todas</div><div class="filter-chip">Hoje</div><div class="filter-chip">Esta semana</div><div class="filter-chip">Por serviço</div><div class="filter-chip">Por relatório</div></div>' +
        '<div class="gallery">' + fotos.map(photoCard).join("") + "</div>" +
        '<div class="card" style="margin-top:16px;padding:14px 16px;background:var(--green-50);border-color:var(--green-100);font-size:.86rem">Cada foto guarda o vínculo <strong>Cliente → Obra → Serviço/OS → Data → Relatório</strong> e pode ser filtrada por relatório, serviço ou responsável.</div>' +
        "</div></div>";
    }

    function tabDocumentos() {
      return '<div class="card rv"><div class="table-wrap"><table class="table"><thead><tr><th>Documento</th><th>Validade</th><th>Status</th><th>Arquivo</th></tr></thead><tbody>' +
        [
          ["PGR 2026", "Dez/2026", "Em dia", "pgr-2026.pdf"],
          ["PCMSO 2026", "Dez/2026", "Em dia", "pcMSO-2026.pdf"],
          ["CIPA — ata", "Out/2026", "Em dia", "ata-cipa.pdf"],
          ["Ordem de Serviço — Acompanhamento SST", "Vigente", "Em dia", "os-2026-0048.pdf"]
        ].map(function (d) {
          return '<tr><td class="cell-strong">' + d[0] + "</td><td>" + d[1] + '</td><td><span class="status status--active">' + d[2] + "</span></td><td><span class='link-btn'>" + d[3] + "</span></td></tr>";
        }).join("") +
        "</tbody></table></div></div>";
    }

    function tabEquipe() {
      return '<div class="grid-3">' + EQUIPE.map(function (e, i) {
        return '<div class="card rv" style="transition-delay:' + i * 30 + 'ms"><div class="card__pad" style="display:flex;align-items:center;gap:12px"><span class="avatar avatar--md">' + esc(e.nome.split(" ").map(function (p) { return p[0]; }).join("")) + '</span><div><strong style="font-size:.95rem">' + esc(e.nome) + "</strong><div style='font-size:.8rem;color:var(--grey-500)'>" + esc(e.funcao) + "</div><div style='font-size:.8rem;color:var(--grey-500)'>" + esc(e.ctt) + "</div></div></div></div>";
      }).join("") + "</div>";
    }

    function tabHistorico() {
      return '<div class="card rv"><div class="card__head"><h3>Linha do tempo da obra</h3></div><div class="card__pad"><div class="timeline">' +
        [
          { c: "tl-item--photo", t: "Hoje · 14:37", title: "Foto adicionada", desc: fotos[0] ? "Inspeção do pavimento 4 — " + fotos[0].obs : "Inspeção do pavimento 4" },
          { c: "tl-item--done", t: "Hoje · 11:20", title: "Atividade concluída", desc: "Verificação de EPC" },
          { c: "tl-item--done", t: "Hoje · 09:05", title: "Equipe iniciou atividades", desc: "DDS realizado com 14 colaboradores" },
          { c: "tl-item--done", t: "Ontem · 17:42", title: "RDO #033 finalizado", desc: "Relatório diário fechado e arquivado" },
          { c: "tl-item--done", t: "29 ago", title: "Treinamento NR 35 concluído", desc: "Turma B — 12 colaboradores" }
        ].map(tlItem).join("") +
        "</div></div></div>";
    }

    function activate(tabName) {
      $$("#view .tab").forEach(function (b) { b.classList.toggle("is-active", b.getAttribute("data-tab") === tabName); });
      var map = { resumo: tabResumo, servicos: tabServicos, rdos: tabRdos, fotos: tabFotos, documentos: tabDocumentos, equipe: tabEquipe, historico: tabHistorico };
      var el = $("#tab-content");
      el.innerHTML = map[tabName]();
      wireView();
      revealAll(el);
    }
    activate("resumo");
    $$(".tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        activate(tab.getAttribute("data-tab"));
      });
    });
  }

  // ---------- OS / Serviço ----------
  function renderServico(obraId, servicoId) {
    var o = obraPorId(obraId);
    if (!o) return renderObras();
    var s = o.servicos.filter(function (x) { return x.id === servicoId; })[0];
    if (!s) return renderObra(obraId);
    var c = clientePorObra(obraId);
    showApp();
    setCrumbs([{ label: "Clientes", href: "clientes" }, { label: c.nome, href: "cliente/" + c.id }, { label: o.nome, href: "obra/" + o.id }, { label: s.nome }]);
    actions._ctxObra = o;

    var cor = s.status === "Finalizado" ? "status--concluido" : "status--active";
    var fotos = fotosPorObra(obraId).filter(function (f) { return f.servico === servicoId; });

    view.innerHTML =
      '<div class="os-head rv">' +
      '<div class="os-head__top"><div><span class="os-head__num">' + s.os + '</span><span class="badge" style="margin-left:8px">' + esc(s.tipo) + "</span></div>" +
      '<span class="status ' + cor + '" style="margin-left:auto">' + s.status + "</span></div>" +
      '<div class="os-head__title" style="margin-top:6px">' + esc(s.nome) + " — " + esc(o.nome) + "</div>" +
      "</div>" +

      '<div class="os-grid">' +
      '<div class="os-field rv"><div class="os-field__label">Cliente</div><div class="os-field__value">' + esc(c.nome) + "</div></div>" +
      '<div class="os-field rv"><div class="os-field__label">Obra</div><div class="os-field__value">' + esc(o.nome) + "</div></div>" +
      '<div class="os-field rv"><div class="os-field__label">Início</div><div class="os-field__value">' + s.inicio + "</div></div>" +
      '<div class="os-field rv"><div class="os-field__label">Previsão</div><div class="os-field__value">' + s.previsao + "</div></div>" +
      '<div class="os-field rv"><div class="os-field__label">Responsável</div><div class="os-field__value">' + esc(s.responsavel) + "</div></div>" +
      '<div class="os-field rv"><div class="os-field__label">Equipe</div><div class="os-field__value">Maria Silva · João Pereira · Ana Costa</div></div>' +
      "</div>" +

      '<div class="grid-2">' +
      '<div class="card rv"><div class="card__head"><h3>Atividades do serviço</h3><button class="btn btn--primary btn--sm" data-action="registrar-atividade">+ Registrar atividade</button></div><div class="feed">' +
      ATIVIDADES_DIA.slice(0, 4).map(function (a) {
        var icon = a.tipo === "foto" ? " feed__icon--photo" : a.tipo === "ocorrencia" ? " feed__icon--warn" : a.tipo === "observacao" ? " feed__icon--amber" : "";
        return '<div class="feed__item"><span class="feed__icon' + icon + '"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16H5V5h14v14z"/></svg></span><div class="feed__body"><div class="feed__title">' + esc(a.titulo) + '</div><div class="feed__desc">' + esc(a.desc) + '</div><div class="feed__meta"><span class="feed__time">' + a.hora + "</span></div></div></div>";
      }).join("") +
      "</div></div>" +
      '<div class="card rv"><div class="card__head"><h3>Arquivos, fotos e relatórios</h3></div><div class="card__pad">' +
      '<div class="form-row-2">' +
      '<button class="btn btn--light" data-action="adicionar-foto">📷 Fotos (' + fotos.length + ")</button>" +
      '<button class="btn btn--light" data-action="novo-rdo">📄 Relatórios</button>' +
      "</div>" +
      '<div class="card" style="margin-top:14px;padding:12px 14px;background:var(--grey-100);font-size:.84rem">Informações, equipe, atividades, observações, arquivos, fotos e relatórios ficam vinculados a esta OS.</div>' +
      "</div></div>" +
      "</div>";
    wireView();
  }

  // ---------- Relatórios (lista global) ----------
  function renderRelatorios() {
    showApp();
    setCrumbs([{ label: "Relatórios" }]);
    actions._ctxObra = null;
    var all = RDOs.slice().sort(function (a, b) { return b.data - a.data; }).slice(0, 8);

    view.innerHTML =
      '<div class="page-head rv"><div><h1 class="page-head__title">Relatórios Diários</h1><p class="page-head__sub">RDO — Relatório Diário de Obra. Montado automaticamente, revisado antes de finalizar.</p></div>' +
      '<div class="page-head__actions"><button class="btn btn--amber btn--sm" data-action="novo-rdo">Gerar RDO do dia</button></div></div>' +
      '<div class="card rv"><div class="table-wrap"><table class="table"><thead><tr><th>RDO</th><th>Obra</th><th>Data</th><th>Atividades</th><th>Fotos</th><th>Status</th><th>Ações</th></tr></thead><tbody>' +
      all.map(function (r) {
        var ob = obraPorId(r.obra);
        var st = r.status === "Finalizado" ? "status--concluido" : r.status === "Rascunho" ? "status--warn status--rascunho" : "status--review";
        return '<tr class="is-clickable" data-href="#/obra/' + r.obra + '/rdo/' + r.id + '">' +
          '<td class="cell-strong">' + r.numero + "</td>" +
          "<td>" + esc(ob.nome) + "</td>" +
          "<td>" + fmtDate(r.data) + "</td>" +
          "<td>" + r.atividades + "</td>" +
          "<td>" + r.fotos + "</td>" +
          '<td><span class="status ' + st + '">' + r.status + "</span></td>" +
          '<td><span class="link-btn">Visualizar</span> · <span class="link-btn" data-pdf>PDF</span> · <span class="link-btn">Compartilhar</span></td>' +
          "</tr>";
      }).join("") +
      "</tbody></table></div></div>";
    wireView();
  }

  // ---------- RDO aberto ----------
  function renderRdo(obraId, rdoId) {
    var o = obraPorId(obraId);
    if (!o) return renderRelatorios();
    var r = rdoPorObra(obraId).filter(function (x) { return x.id === rdoId; })[0] || rdoPorObra(obraId)[0];
    var c = clientePorObra(obraId);
    showApp();
    setCrumbs([{ label: "Clientes", href: "clientes" }, { label: c.nome, href: "cliente/" + c.id }, { label: o.nome, href: "obra/" + o.id }, { label: "Relatórios", href: "obra/" + o.id }, { label: r.numero }]);
    actions._ctxObra = o;

    var st = r.status === "Finalizado" ? "status--concluido" : "status--warn status--rascunho";
    var fotos = fotosPorObra(obraId).filter(function (f) { return f.relatorio === r.numero; });

    view.innerHTML =
      '<div class="rdo-head rv">' +
      '<div><div class="rdo-head__num">' + r.numero + "</div><div class='rdo-head__title'>" + esc(o.nome) + " · " + fmtDate(r.data) + "</div></div>" +
      '<span class="status ' + st + '" style="background:rgba(255,255,255,.16)">' + r.status + "</span>" +
      '<div class="rdo-head__actions">' +
      '<button class="btn btn--light btn--sm" data-action="visualizar-pdf">Exportar PDF</button>' +
      '<button class="btn btn--amber btn--sm">Salvar rascunho</button>' +
      '<button class="btn btn--primary btn--sm">Finalizar relatório</button>' +
      "</div></div>" +

      '<div class="rdo-strip rv">' +
      '<div class="rdo-strip__item"><span class="rdo-strip__num">' + r.atividades + '</span><span class="rdo-strip__label">atividades</span></div>' +
      '<div class="rdo-strip__item"><span class="rdo-strip__num">' + r.fotos + '</span><span class="rdo-strip__label">fotos</span></div>' +
      '<div class="rdo-strip__item"><span class="rdo-strip__num">' + r.obs + '</span><span class="rdo-strip__label">observações</span></div>' +
      '<div class="rdo-strip__item"><span class="rdo-strip__num">' + r.ocorrencias + '</span><span class="rdo-strip__label">ocorrências</span></div>' +
      '<div class="rdo-strip__item"><span class="rdo-strip__num">' + r.equipe.length + '</span><span class="rdo-strip__label">equipe</span></div>' +
      "</div>" +

      '<div class="grid-2">' +
      '<div class="card rv"><div class="card__head"><h3>Informações gerais</h3></div><div class="card__pad" style="display:grid;gap:10px;font-size:.92rem">' +
      '<div><span style="color:var(--grey-500)">Cliente</span><br/><strong>' + esc(c.nome) + "</strong></div>" +
      '<div><span style="color:var(--grey-500)">Obra</span><br/><strong>' + esc(o.nome) + "</strong></div>" +
      '<div><span style="color:var(--grey-500)">Responsável</span><br/><strong>' + r.responsavel + "</strong></div>" +
      '<div><span style="color:var(--grey-500)">Data</span><br/><strong>' + fmtDate(r.data) + "</strong></div>" +
      "</div></div>" +
      '<div class="card rv"><div class="card__head"><h3>Equipe presente</h3></div><div class="feed">' +
      r.equipe.map(function (nome) {
        return '<div class="feed__item"><span class="avatar avatar--sm">' + esc(nome.split(" ").map(function (p) { return p[0]; }).join("")) + '</span><div class="feed__body"><div class="feed__title">' + esc(nome) + '</div><div class="feed__desc">Presente na obra</div></div></div>';
      }).join("") +
      "</div></div>" +
      "</div>" +

      '<div class="card rv"><div class="card__head"><h3>Atividades executadas</h3></div><div class="feed">' +
      ATIVIDADES_DIA.map(function (a, i) {
        var icon = a.tipo === "foto" ? " feed__icon--photo" : a.tipo === "ocorrencia" ? " feed__icon--warn" : a.tipo === "observacao" ? " feed__icon--amber" : "";
        return '<div class="feed__item"><span class="feed__icon' + icon + '"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/></svg></span>' +
          '<div class="feed__body"><div class="feed__title">' + esc(a.titulo) + '</div><div class="feed__desc">' + esc(a.desc) + '</div><div class="feed__meta"><span class="feed__time">' + a.hora + '</span><span>·</span><span>' + esc(a.responsavel) + "</span></div></div></div>";
      }).join("") +
      "</div></div>" +

      '<div class="card rv"><div class="card__head"><h3>Registro fotográfico do dia</h3><button class="btn btn--primary btn--sm" data-action="adicionar-foto">+ Adicionar foto</button></div><div class="card__pad">' +
      '<div class="gallery">' + fotos.map(photoCard).join("") + "</div>" +
      '<div class="card" style="margin-top:14px;padding:12px 14px;background:var(--green-50);border-color:var(--green-100);font-size:.84rem">As fotos registradas hoje na obra são incorporadas automaticamente ao RDO.</div>' +
      "</div></div>" +

      '<div class="card rv"><div class="card__head"><h3>Observações</h3><button class="btn btn--light btn--sm">+ Adicionar</button></div><div class="card__pad">' +
      '<div class="feed"><div class="feed__item"><span class="feed__icon feed__icon--amber"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M13 13h-2V7h2v6zm0 4h-2v-2h2v2zM12 2 1 21h22L12 2z"/></svg></span><div class="feed__body"><div class="feed__title">Reunião com a equipe</div><div class="feed__desc">Alinhamento sobre cronograma de instalação da linha de vida.</div><div class="feed__meta"><span class="feed__time">15:45</span></div></div></div></div>' +
      "</div></div>" +

      '<div class="card rv"><div class="card__head"><h3>Pendências para amanhã</h3></div><div class="card__pad"><div class="feed">' +
      '<div class="feed__item"><span class="feed__icon feed__icon--warn"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2 1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z"/></svg></span><div class="feed__body"><div class="feed__title">Sinalizar piso molhado</div><div class="feed__desc">Placa de sinalização e limpeza — pavimento 4.</div></div></div>' +
      '<div class="feed__item"><span class="feed__icon feed__icon--warn"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2 1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z"/></svg></span><div class="feed__body"><div class="feed__title">Confirmar material da linha de vida</div><div class="feed__desc">Verificar entrega com o almoxarifado.</div></div></div>' +
      "</div></div></div>";
    wireView();
  }

  // ---------- Galeria de fotos (global) ----------
  function renderFotos() {
    showApp();
    setCrumbs([{ label: "Fotos" }]);
    actions._ctxObra = null;

    view.innerHTML =
      '<div class="page-head rv"><div><h1 class="page-head__title">Fotos / Evidências</h1><p class="page-head__sub">Cada foto vinculada à obra, serviço/OS, data e relatório.</p></div>' +
      '<div class="page-head__actions"><button class="btn btn--primary btn--sm" data-action="adicionar-foto">+ Adicionar foto</button></div></div>' +
      '<div class="card rv"><div class="card__pad">' +
      '<div class="gallery-toolbar"><div class="filter-chip is-active">Todas</div><div class="filter-chip">Hoje</div><div class="filter-chip">Esta semana</div><div class="filter-chip">Este mês</div><div class="filter-chip">Por relatório</div><div class="filter-chip">Por serviço</div><div class="filter-chip">Por responsável</div></div>' +
      '<div class="gallery">' + FOTOS.slice().sort(function (a, b) { return b.data - a.data; }).map(photoCard).join("") + "</div>" +
      "</div></div>";
    wireView();
  }

  function photoCard(f) {
    var ob = obraPorId(f.obra);
    return '<div class="photo-card is-clickable" data-href="#/obra/' + f.obra + '">' +
      '<div class="photo-card__img"><span class="photo-card__num">' + f.id + "</span></div>" +
      '<div class="photo-card__body">' +
      '<div class="photo-card__title">' + esc(f.atividade || "Evidência") + "</div>" +
      '<div class="photo-card__meta"><span><strong>Cliente:</strong> ' + esc(clientePorObra(f.obra).nome) + "</span>" +
      "<span><strong>Obra:</strong> " + esc(ob.nome) + "</span>" +
      "<span><strong>Serviço:</strong> " + esc(obraPorId(f.obra).servicos.filter(function (s) { return s.id === f.servico; }).map(function (s) { return s.nome; })[0] || "—") + " · " + f.os + "</span>" +
      "<span><strong>Data:</strong> " + fmtDate(f.data) + " — " + fmtTime(f.data) + " · " + esc(f.relatorio) + "</span></div>" +
      '<div class="photo-card__obs">“' + esc(f.obs) + "”</div>" +
      "</div></div>";
  }

  // ---------- Timeline completa ----------
  function renderTimeline(obraId) {
    var o = obraPorId(obraId);
    if (!o) return renderObras();
    var c = clientePorObra(obraId);
    showApp();
    setCrumbs([{ label: "Clientes", href: "clientes" }, { label: c.nome, href: "cliente/" + c.id }, { label: o.nome, href: "obra/" + o.id }, { label: "Linha do tempo" }]);
    actions._ctxObra = o;
    var fotos = fotosPorObra(obraId);

    var items = ATIVIDADES_DIA.map(function (a) {
      return { c: a.tipo === "foto" ? "tl-item--photo" : a.tipo === "ocorrencia" ? "tl-item--warn" : "tl-item--done", t: "Hoje · " + a.hora, title: a.titulo, desc: a.desc };
    });
    items = items.concat([
      { c: "tl-item--done", t: "Ontem · 17:42", title: "RDO #033 finalizado", desc: "Relatório diário fechado e arquivado" },
      { c: "tl-item--done", t: "29 ago · 10:00", title: "Treinamento NR 35 concluído", desc: "Turma B — 12 colaboradores" },
      { c: "tl-item--done", t: "27 ago · 16:00", title: "Inspeção quinzenal", desc: "Checklist de segurança do canteiro" },
      { c: "tl-item--done", t: "12 mai · 09:00", title: "Obra iniciada", desc: "Mobilização da equipe de SST" }
    ]);

    view.innerHTML =
      '<div class="page-head rv"><div><h1 class="page-head__title">Linha do tempo</h1><p class="page-head__sub">' + esc(o.nome) + " · " + esc(c.nome) + "</p></div>" +
      '<div class="page-head__actions"><button class="btn btn--primary btn--sm" data-action="registrar-atividade">+ Registrar atividade</button></div></div>' +
      '<div class="grid-2"><div class="card rv"><div class="card__head"><h3>Tudo que aconteceu</h3></div><div class="card__pad"><div class="timeline">' +
      items.map(tlItem).join("") +
      "</div></div></div>" +
      '<div class="card rv"><div class="card__head"><h3>Fotos recentes</h3><a class="link-btn" href="#/obra/' + obraId + '/fotos">Ver galeria</a></div><div class="card__pad"><div class="gallery" style="grid-template-columns:repeat(2,1fr)">' +
      fotos.slice(0, 4).map(photoCard).join("") +
      "</div></div></div></div>";
    wireView();
  }

  function tlItem(t) {
    return '<div class="tl-item ' + t.c + '"><div class="tl-time">' + t.t + '</div><div class="tl-title">' + t.title + "</div><div class='tl-desc'>" + t.desc + "</div></div>";
  }

  // ---------- Telas placeholder (Agenda, Treinamentos, Documentos, Equipe, Notificações, Configurações) ----------
  function renderPlaceholder(name) {
    showApp();
    var titles = {
      agenda: "Agenda",
      treinamentos: "Treinamentos",
      documentos: "Documentos",
      equipe: "Equipe",
      notificacoes: "Notificações",
      configuracoes: "Configurações"
    };
    setCrumbs([{ label: titles[name] }]);
    actions._ctxObra = null;

    var body = "";
    if (name === "treinamentos") {
      body =
        '<div class="card rv"><div class="card__head"><h3>Treinamentos</h3><button class="btn btn--primary btn--sm">+ Novo treinamento</button></div><div class="table-wrap"><table class="table"><thead><tr><th>Treinamento</th><th>Obra</th><th>Data</th><th>Status</th></tr></thead><tbody>' +
        [
          ["NR 35 — Trabalho em Altura", "o1", "03–07/08/2026", "Concluído"],
          ["NR 06 — EPI", "o5", "12/09/2026", "Agendado"],
          ["NR 12 — Máquinas", "o2", "18/09/2026", "Agendado"],
          ["Primeiros Socorros", "o1", "25/09/2026", "Agendado"]
        ].map(function (t) {
          var st = t[3] === "Concluído" ? "status--concluido" : "status--active";
          return '<tr class="is-clickable" data-href="#/obra/' + t[1] + '"><td class="cell-strong">' + t[0] + "</td><td>" + esc(obraPorId(t[1]).nome) + "</td><td>" + t[2] + '</td><td><span class="status ' + st + '">' + t[3] + "</span></td></tr>";
        }).join("") +
        "</tbody></table></div></div>";
    } else if (name === "notificacoes") {
      body =
        '<div class="card rv"><div class="card__head"><h3>Central de notificações</h3></div><div class="feed">' +
        [
          { i: "warn", t: "Agora", title: "RDO #034 aguardando revisão", desc: "Residencial Boa Vista" },
          { i: "", t: "10 min", title: "Ocorrência registrada", desc: "Piso molhado na escada — Residencial Boa Vista" },
          { i: "amber", t: "1 h", title: "NR 35 — Turma B renova em 10/09", desc: "Residencial Boa Vista" },
          { i: "", t: "2 h", title: "Novas fotos adicionadas", desc: "Galpão Industrial Norte (3)" }
        ].map(function (n) {
          var cls = n.i === "warn" ? " feed__icon--warn" : n.i === "amber" ? " feed__icon--amber" : "";
          return '<div class="feed__item"><span class="feed__icon' + cls + '"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2zm6-6v-5a6 6 0 0 0-4-5.7V5a2 2 0 0 0-4 0v.3A6 6 0 0 0 6 11v5l-2 2v1h16v-1l-2-2z"/></svg></span><div class="feed__body"><div class="feed__title">' + n.title + '</div><div class="feed__desc">' + n.desc + '</div><div class="feed__meta"><span class="feed__time">' + n.t + "</span></div></div></div>";
        }).join("") +
        "</div></div>";
    } else {
      body =
        '<div class="card rv"><div class="card__head"><h3>' + titles[name] + '</h3><span class="badge badge--amber">Em breve</span></div><div class="card__pad" style="text-align:center;padding:48px 20px">' +
        '<div style="font-size:2.2rem;margin-bottom:10px">🚧</div>' +
        '<h3 style="margin-bottom:6px">Tela em construção</h3>' +
        '<p style="color:var(--grey-500);max-width:420px;margin:0 auto">Esta tela está representada na demonstração para mostrar a estrutura do menu. O conteúdo detalhado será implementado na versão final.</p>' +
        "</div></div>";
    }
    view.innerHTML =
      '<div class="page-head rv"><div><h1 class="page-head__title">' + titles[name] + "</h1><p class='page-head__sub'>Demonstração da área.</p></div></div>" + body;
    wireView();
  }

  /* ======================================================================
     ROUTER
     ====================================================================== */
  function parseHash() {
    var h = location.hash.replace(/^#\/?/, "");
    var parts = h.split("/").filter(Boolean);
    return { name: parts[0] || "dashboard", parts: parts };
  }
  function currentRoute() { return parseHash(); }

  function renderRoute() {
    var r = parseHash();
    switch (r.name) {
      case "login": renderLogin(); break;
      case "dashboard": renderDashboard(); break;
      case "clientes": renderClientes(); break;
      case "cliente": renderCliente(r.parts[1]); break;
      case "obras": renderObras(); break;
      case "servicos": renderServicosGlobal(); break;
      case "relatorios": renderRelatorios(); break;
      case "fotos": renderFotos(); break;
      case "agenda": renderPlaceholder("agenda"); break;
      case "treinamentos": renderPlaceholder("treinamentos"); break;
      case "documentos": renderPlaceholder("documentos"); break;
      case "equipe": renderPlaceholder("equipe"); break;
      case "notificacoes": renderPlaceholder("notificacoes"); break;
      case "configuracoes": renderPlaceholder("configuracoes"); break;
      case "obra":
        if (r.parts[2] === "servico") renderServico(r.parts[1], r.parts[3]);
        else if (r.parts[2] === "rdo") renderRdo(r.parts[1], r.parts[3]);
        else if (r.parts[2] === "timeline") renderTimeline(r.parts[1]);
        else if (r.parts[2] === "fotos") { showApp(); var ob = obraPorId(r.parts[1]); if (ob) { setCrumbs([{ label: "Clientes", href: "clientes" }, { label: clientePorObra(r.parts[1]).nome, href: "cliente/" + clientePorObra(r.parts[1]).id }, { label: ob.nome, href: "obra/" + ob.id }, { label: "Fotos" }]); actions._ctxObra = ob; renderObraFotos(r.parts[1]); } }
        else renderObra(r.parts[1]);
        break;
      default: renderDashboard();
    }
    setActiveNav();
  }

  function renderServicosGlobal() {
    showApp();
    setCrumbs([{ label: "Serviços / OS" }]);
    actions._ctxObra = null;
    var rows = [];
    CLIENTES.forEach(function (c) {
      c.obras.forEach(function (o) {
        o.servicos.forEach(function (s) {
          rows.push('<tr class="is-clickable" data-href="#/obra/' + o.id + '/servico/' + s.id + '">' +
            '<td class="cell-strong">' + s.os + "</td>" +
            "<td>" + esc(s.nome) + "</td>" +
            "<td>" + esc(o.nome) + "</td>" +
            "<td>" + esc(c.nome) + "</td>" +
            '<td><span class="status ' + (s.status === "Finalizado" ? "status--concluido" : "status--active") + '">' + s.status + "</span></td>" +
            "</tr>");
        });
      });
    });
    view.innerHTML =
      '<div class="page-head rv"><div><h1 class="page-head__title">Serviços / Ordens de Serviço</h1><p class="page-head__sub">Cada serviço possui uma OS com equipe, atividades, fotos e relatórios.</p></div>' +
      '<div class="page-head__actions"><button class="btn btn--primary btn--sm" data-action="novo-servico">+ Novo serviço</button></div></div>' +
      '<div class="card rv"><div class="table-wrap"><table class="table"><thead><tr><th>OS</th><th>Serviço</th><th>Obra</th><th>Cliente</th><th>Status</th></tr></thead><tbody>' +
      rows.join("") +
      "</tbody></table></div></div>";
    wireView();
  }

  function renderObraFotos(obraId) {
    var o = obraPorId(obraId);
    var fotos = fotosPorObra(obraId);
    view.innerHTML =
      '<div class="page-head rv"><div><h1 class="page-head__title">Fotos da obra</h1><p class="page-head__sub">' + esc(o.nome) + ' — somente fotos desta obra.</p></div>' +
      '<div class="page-head__actions"><button class="btn btn--primary btn--sm" data-action="adicionar-foto">+ Adicionar foto</button></div></div>' +
      '<div class="card rv"><div class="card__pad">' +
      '<div class="gallery-toolbar"><div class="filter-chip is-active">Galeria</div><div class="filter-chip">Linha do tempo</div><div class="filter-chip">Hoje</div><div class="filter-chip">Esta semana</div><div class="filter-chip">Por relatório</div><div class="filter-chip">Por serviço</div><div class="filter-chip">Por responsável</div></div>' +
      '<div class="gallery">' + fotos.map(photoCard).join("") + "</div>" +
      '<div class="card" style="margin-top:16px;padding:14px 16px;background:var(--green-50);border-color:var(--green-100);font-size:.86rem">Cada foto guarda o vínculo <strong>Cliente → Obra → Serviço/OS → Data → Relatório</strong>. É possível alternar entre <strong>Galeria</strong> e <strong>Linha do tempo</strong>.</div>' +
      "</div></div>";
    wireView();
  }

  /* ======================================================================
     BINDINGS DE EVENTOS GLOBAIS
     ====================================================================== */
  function wireView() {
    // Links internos (data-href)
    $$("[data-href]").forEach(function (el) {
      if (el.getAttribute("data-wired")) return;
      el.setAttribute("data-wired", "1");
      el.addEventListener("click", function (e) {
        var href = el.getAttribute("data-href");
        if (href && href.charAt(0) === "#") {
          e.preventDefault();
          location.hash = href;
        }
      });
    });
    // Ações (data-action)
    $$("[data-action]").forEach(function (el) {
      if (el.getAttribute("data-wired")) return;
      el.setAttribute("data-wired", "1");
      el.addEventListener("click", function () {
        var fn = actions[el.getAttribute("data-action")];
        if (fn) fn(el);
      });
    });
    // Botões PDF
    $$("[data-pdf]").forEach(function (el) {
      if (el.getAttribute("data-wired")) return;
      el.setAttribute("data-wired", "1");
      el.addEventListener("click", function () {
        var ob = actions._ctxObra || obraPorId("o1");
        openModal(modalPdfPreview(ob));
      });
    });
  }

  function initUI() {
    // Login
    $("#login-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var email = $("#login-email").value.trim();
      if (!email) { showToast("Informe o e-mail para entrar."); return; }
      showApp();
      location.hash = "#/dashboard";
    });
    $$(".field__eye").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var input = document.querySelector(btn.getAttribute("data-eye"));
        input.type = input.type === "password" ? "text" : "password";
      });
    });
    // Menu mobile
    $("#topbar-menu").addEventListener("click", openMenu);
    $("#sidebar-close").addEventListener("click", closeMenu);
    $("#sidebar-scrim").addEventListener("click", closeMenu);
    $("#fab").addEventListener("click", openSheet);
    // Fechar modal com ESC
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closeModal(); closeSheet(); closeMenu(); }
    });
    // Global search
    var gs = $("#global-search");
    gs.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        var q = gs.value.trim().toLowerCase();
        if (!q) return;
        var match = CLIENTES.filter(function (c) { return c.nome.toLowerCase().indexOf(q) >= 0; })[0];
        if (match) { location.hash = "#/cliente/" + match.id; showToast("Cliente: " + match.nome); }
        else { location.hash = "#/clientes"; showToast("Nenhum cliente encontrado — mostrando lista."); }
        gs.value = "";
      }
    });
    // Ano
    $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
    window.addEventListener("hashchange", renderRoute);
  }

  function init() {
    initUI();
    // Entrada: sem hash de rota (ou #/login) → tela de login demonstrativo
    var h = location.hash;
    if (!h || h === "#" || h === "#/" || h === "#/login") {
      renderLogin();
    } else {
      renderRoute();
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
