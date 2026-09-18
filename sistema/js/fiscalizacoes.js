/* ==========================================================================
   MS Consultoria — Sistema interno · MÓDULO FISCALIZAÇÕES / INSPEÇÕES DE SST
   ==========================================================================
   DEMONSTRAÇÃO VISUAL/FUNCIONAL. Todos os dados são FICTÍCIOS.

   Estrutura (a mesma regra de ouro da MS):
     CLIENTE → OBRA → FISCALIZAÇÃO → ITENS INSPECIONADOS
             → FOTOS / EVIDÊNCIAS → RELATÓRIO

   Um cliente pode ter VÁRIAS obras, e cada obra mantém suas próprias
   fiscalizações, fotos, relatórios, serviços e documentos.

   O QUE É DEMO (não há backend nesta etapa):
   - não há upload real de arquivo: a foto é registrada como referência;
   - não há persistência: recarregar a página restaura os dados originais;
   - a geração de PDF e o compartilhamento são apenas visuais.
   ========================================================================== */
(function () {
  "use strict";

  var MS = window.MS;
  if (!MS) { console.error("[MS] núcleo não carregado — o módulo de fiscalizações não iniciou."); return; }

  var esc = MS.esc, iso = MS.iso, fmtDate = MS.fmtDate;

  /* ======================================================================
     1. CATÁLOGO DE ITENS DE INSPEÇÃO
     ----------------------------------------------------------------------
     Não é uma lista fechada: a MS pode cadastrar novos itens pela tela
     (+ Adicionar item de inspeção). Os itens personalizados entram aqui.
     ====================================================================== */
  var CATALOGO_ITENS = [
    { id: "extintor", nome: "Extintor", grupo: "Combate a incêndio", validade: true, estado: true, quantidade: false },
    { id: "capacete", nome: "Capacetes dos funcionários", grupo: "EPI", validade: false, estado: true, quantidade: true },
    { id: "epi", nome: "EPI — Equipamento de Proteção Individual", grupo: "EPI", validade: true, estado: true, quantidade: false },
    { id: "epc", nome: "EPC — Equipamento de Proteção Coletiva", grupo: "EPC", validade: false, estado: true, quantidade: false },
    { id: "cinto-seguranca", nome: "Cinto de segurança (veículos e máquinas)", grupo: "Equipamentos", validade: false, estado: true, quantidade: false },
    { id: "cinto-paraquedista", nome: "Cinto paraquedista / trava-quedas", grupo: "Trabalho em altura", validade: true, estado: true, quantidade: false },
    { id: "bancos-assentos", nome: "Bancos e assentos de veículos e equipamentos", grupo: "Veículos", validade: false, estado: true, quantidade: false },
    { id: "empilhadeira", nome: "Empilhadeira / máquina de movimentação de carga", grupo: "Máquinas", validade: true, estado: true, quantidade: false },
    { id: "maquina", nome: "Máquina", grupo: "Máquinas", validade: false, estado: true, quantidade: false },
    { id: "equipamento", nome: "Equipamento", grupo: "Equipamentos", validade: false, estado: true, quantidade: false },
    { id: "veiculo", nome: "Veículo", grupo: "Veículos", validade: true, estado: true, quantidade: false },
    { id: "sinalizacao", nome: "Sinalização", grupo: "Sinalização", validade: false, estado: true, quantidade: false },
    { id: "condicoes-seguranca", nome: "Condições de segurança do ambiente", grupo: "Ambiente", validade: false, estado: false, quantidade: false },
    { id: "documentacao", nome: "Documentação de SST", grupo: "Documentos", validade: true, estado: false, quantidade: false },
    { id: "ordem-servico", nome: "Ordem de serviço / ficha de EPI", grupo: "Documentos", validade: false, estado: false, quantidade: false }
  ];

  function itemCatalogo(id) {
    for (var i = 0; i < CATALOGO_ITENS.length; i++) if (CATALOGO_ITENS[i].id === id) return CATALOGO_ITENS[i];
    return { id: id, nome: id, grupo: "Outros", validade: false, estado: true, quantidade: false };
  }

  /* ======================================================================
     2. DADOS DEMONSTRATIVOS — FISCALIZAÇÕES
     ====================================================================== */

  // Níveis de criticidade de uma não conformidade.
  var NIVEIS_NC = [
    { id: "baixo", nome: "Baixo", cor: "nivel--baixo" },
    { id: "medio", nome: "Médio", cor: "nivel--medio" },
    { id: "alto", nome: "Alto", cor: "nivel--alto" },
    { id: "critico", nome: "Crítico", cor: "nivel--critico" }
  ];

  var SITUACOES = [
    { id: "conforme", nome: "Conforme", cls: "status--active" },
    { id: "nao-conforme", nome: "Não conforme", cls: "status--warn" },
    { id: "na", nome: "Não se aplica", cls: "status--muted" }
  ];

  function situacaoInfo(id) {
    for (var i = 0; i < SITUACOES.length; i++) if (SITUACOES[i].id === id) return SITUACOES[i];
    return { id: null, nome: "Não verificado", cls: "status--muted" };
  }

  // Fábrica de item de inspeção.
  // extra pode conter: validade, estado, obs, qtd, qtdOk, qtdNc, equipamento,
  // funcionario, epi, ca, problema, nivel, acao, prazo, responsavel, fotos
  var seqItem = 0;
  function item(catId, titulo, situacao, extra) {
    var cat = itemCatalogo(catId);
    seqItem++;
    var o = {
      id: "it" + seqItem,
      cat: catId,
      titulo: titulo,
      grupo: cat.grupo,
      situacao: situacao || null,
      validade: null, estado: "", obs: "",
      qtd: null, qtdOk: null, qtdNc: null,
      fotos: []
    };
    extra = extra || {};
    Object.keys(extra).forEach(function (k) { o[k] = extra[k]; });
    // Não conformidade embutida no item (ex.: cinto com desgaste).
    if (o.situacao === "nao-conforme" && !o.nc) {
      o.nc = {
        problema: o.problema || "Não conformidade identificada na inspeção.",
        nivel: o.nivel || "medio",
        acao: o.acao || "Corrigir e registrar evidência da correção.",
        prazo: o.prazo || null,
        responsavel: o.responsavel || "Cliente",
        status: "Pendente",
        correcao: null
      };
    }
    return o;
  }

  function fotoRef(id, obs, quando) {
    return { id: id, obs: obs, data: quando || MS.NOW, demo: true };
  }

  var FISCALIZACOES = [
    /* ---------------- 1. Inspeção Geral de SST — Edifício Aurora --------- */
    {
      id: "f1",
      tipo: "Inspeção Geral de SST",
      clienteId: "c5", obraId: "o9",
      data: iso(17, 9, 9, 30),
      responsavel: "Maria Silva",
      status: "Concluída",
      obsGerais: "Inspeção geral de SST no canteiro do Edifício Aurora, com foco em proteções coletivas, EPIs, equipamentos de combate a incêndio e documentação da obra.",
      itens: [
        item("extintor", "Extintor — Recepção", "conforme", {
          validade: iso(20, 12), estado: "Bom",
          obs: "Equipamento dentro da validade, pressão normal e sinalização correta.",
          fotos: [fotoRef("ev-1001", "Extintor da recepção — etiqueta de validade legível.", iso(17, 9, 9, 42))]
        }),
        item("extintor", "Extintor — Pavimento 01", "conforme", {
          validade: iso(10, 10), estado: "Bom",
          obs: "Validade próxima do vencimento — acompanhar a troca.",
          fotos: [fotoRef("ev-1002", "Extintor do pavimento 01 — selo de validade 10/10/2026.", iso(17, 9, 9, 51))]
        }),
        item("extintor", "Extintor — Pavimento 02", "conforme", { validade: iso(12, 5, 2027), estado: "Bom" }),
        item("extintor", "Extintor — Almoxarifado", "conforme", { validade: iso(15, 4, 2027), estado: "Bom" }),
        item("capacete", "Capacetes da equipe", "nao-conforme", {
          qtd: 18, qtdOk: 16, qtdNc: 2,
          obs: "Dois capacetes apresentam desgaste.",
          problema: "Dois capacetes com desgaste na carcaça e suspensão comprometida.",
          nivel: "alto", acao: "Substituir imediatamente os dois capacetes e registrar a troca.",
          prazo: iso(22, 9), responsavel: "Construtora Horizonte",
          fotos: [fotoRef("ev-1003", "Capacete com desgaste na carcaça — recolhido da operação.", iso(17, 9, 10, 5))]
        }),
        item("cinto-seguranca", "Cinto de segurança — Empilhadeira 02", "nao-conforme", {
          equipamento: "Empilhadeira 02", estado: "Ruim",
          obs: "Cinto apresentando desgaste.",
          problema: "Cinto de segurança da Empilhadeira 02 com desgaste nas fibras e fecho com folga.",
          nivel: "critico", acao: "Retirar a empilhadeira de operação até a substituição do cinto.",
          prazo: iso(19, 9), responsavel: "Manutenção — Galpão Logístico",
          fotos: [fotoRef("ev-1004", "Cinto da Empilhadeira 02 — desgaste visível nas fibras.", iso(17, 9, 10, 22))]
        }),
        item("epi", "EPIs da equipe de produção", "conforme", {
          validade: iso(15, 3, 2027), estado: "Bom",
          obs: "Todos os colaboradores com EPI adequado à atividade e CA válido.",
          fotos: [fotoRef("ev-1005", "Verificação de EPIs com a equipe de produção.", iso(17, 9, 11, 2))]
        }),
        item("epc", "EPC — Proteções coletivas do pavimento 4", "conforme", {
          estado: "Bom", obs: "Guarda-corpo e aberturas protegidas conforme o PGR."
        }),
        item("epc", "EPC — Guarda-corpo do pavimento 12", "conforme", { estado: "Bom" }),
        item("epc", "EPC — Proteção de aberturas no piso", "conforme", { estado: "Bom" }),
        item("epc", "EPC — Plataforma de proteção da fachada", "conforme", { estado: "Bom" }),
        item("sinalizacao", "Sinalização de segurança", "conforme", {
          obs: "Rotas de fuga, extintores e áreas de risco sinalizados."
        }),
        item("sinalizacao", "Sinalização das rotas de fuga", "conforme", {}),
        item("condicoes-seguranca", "Condições de segurança — áreas de circulação", "conforme", {}),
        item("condicoes-seguranca", "Condições de segurança — instalações elétricas provisórias", "conforme", {}),
        item("documentacao", "Documentação de SST da obra", "conforme", {
          validade: iso(20, 12), obs: "PGR, PCMSO e ordens de serviço vigentes e arquivados."
        }),
        item("ordem-servico", "Ordem de serviço e ficha de EPI assinadas", "conforme", { validade: iso(31, 12) }),
        item("bancos-assentos", "Bancos e assentos de veículos da obra", "na", {
          obs: "A obra não possui frota própria — veículos terceirizados. Item não aplicável."
        })
      ]
    },

    /* ---------------- 2. Inspeção de Extintores — Parque Sul ------------- */
    {
      id: "f2",
      tipo: "Inspeção de Extintores",
      clienteId: "c5", obraId: "o10",
      data: iso(16, 9, 14, 10),
      responsavel: "João Pereira",
      status: "Com pendências",
      obsGerais: "Inspeção de todos os extintores do Residencial Parque Sul — blocos A, B e C, administração e guarita.",
      itens: [
        item("extintor", "Extintor — Bloco A · Térreo", "conforme", { validade: iso(5, 1, 2027), estado: "Bom" }),
        item("extintor", "Extintor — Bloco A · 1º pavimento", "conforme", { validade: iso(12, 1, 2027), estado: "Bom" }),
        item("extintor", "Extintor — Bloco B · Térreo", "nao-conforme", {
          validade: iso(2, 10), estado: "Ruim",
          problema: "Extintor com validade vencendo em 02/10 e manômetro indicando perda de pressão.",
          nivel: "alto", acao: "Substituir o equipamento antes do vencimento da validade.",
          prazo: iso(1, 10), responsavel: "Construtora Horizonte",
          fotos: [fotoRef("ev-1010", "Extintor do Bloco B — manômetro na faixa de recarga.", iso(16, 9, 14, 38))]
        }),
        item("extintor", "Extintor — Bloco B · 1º pavimento", "conforme", { validade: iso(22, 3, 2027), estado: "Bom" }),
        item("extintor", "Extintor — Bloco C · Térreo", "conforme", { validade: iso(18, 12), estado: "Bom" }),
        item("extintor", "Extintor — Bloco C · 2º pavimento", "nao-conforme", {
          estado: "Regular",
          problema: "Suporte de fixação danificado — equipamento fora da altura de instalação prevista.",
          nivel: "medio", acao: "Refixar o suporte e conferir a altura de instalação.",
          prazo: iso(25, 9), responsavel: "Equipe de manutenção da obra",
          fotos: [fotoRef("ev-1011", "Suporte do extintor danificado no Bloco C.", iso(16, 9, 15, 6))]
        }),
        item("extintor", "Extintor — Administração", "conforme", { validade: iso(9, 2, 2027), estado: "Bom" }),
        item("extintor", "Extintor — Guarita", "conforme", { validade: iso(30, 11), estado: "Bom" }),
        item("sinalizacao", "Sinalização dos extintores", "conforme", { obs: "Todos os pontos com placa de identificação." }),
        item("documentacao", "Fichas de inspeção dos extintores", "conforme", {
          validade: iso(16, 9, 2027), obs: "Fichas atualizadas e arquivadas por bloco."
        }),
        item("condicoes-seguranca", "Acesso aos pontos de extintor", "conforme", { obs: "Acessos livres, sem obstrução." }),
        item("equipamento", "Mangueiras e esguichos", "conforme", { estado: "Bom" })
      ]
    },

    /* ---------------- 3. Inspeção de EPIs — Empresa Alpha --------------- */
    {
      id: "f3",
      tipo: "Inspeção de EPIs",
      clienteId: "c6", obraId: "o12",
      data: iso(15, 9, 13, 40),
      responsavel: "Ana Costa",
      status: "Concluída",
      obsGerais: "Inspeção de EPIs com 24 colaboradores da Unidade Recife, com conferência de CA e estado de conservação.",
      itens: [
        item("capacete", "Capacetes — 24 colaboradores", "conforme", {
          qtd: 24, qtdOk: 24, qtdNc: 0, obs: "Todos em bom estado, com jugular e CA visível."
        }),
        item("epi", "EPI — Óculos de proteção", "conforme", { validade: iso(10, 5, 2027), estado: "Bom" }),
        item("epi", "EPI — Protetor auricular", "conforme", { validade: iso(28, 2, 2027), estado: "Bom" }),
        item("epi", "EPI — Luvas de proteção", "nao-conforme", {
          estado: "Regular",
          problema: "Dois colaboradores utilizando luvas inadequadas para a atividade executada.",
          nivel: "medio", acao: "Substituir as luvas pelo modelo correto e orientar a equipe.",
          prazo: iso(20, 9), responsavel: "Empresa Alpha",
          fotos: [
            fotoRef("ev-1020", "Luva inadequada para a atividade — registro de não conformidade.", iso(15, 9, 14, 5)),
            fotoRef("ev-1021", "Depois da correção — luvas corretas entregues à equipe.", iso(16, 9, 9, 10))
          ],
          nc: {
            problema: "Dois colaboradores utilizando luvas inadequadas para a atividade executada.",
            nivel: "medio", acao: "Substituir as luvas pelo modelo correto e orientar a equipe.",
            prazo: iso(20, 9), responsavel: "Empresa Alpha", status: "Corrigido",
            correcao: {
              data: iso(16, 9, 9, 10),
              obs: "Luvas corretas entregues aos dois colaboradores e orientação realizada em campo.",
              responsavel: "Empresa Alpha"
            }
          }
        }),
        item("epi", "EPI — Calçado de segurança", "conforme", { validade: iso(5, 8, 2027), estado: "Bom" }),
        item("epi", "EPI — Vestimenta de proteção", "conforme", { estado: "Bom" }),
        item("epi", "EPI — Proteção respiratória", "conforme", { validade: iso(12, 7, 2027), estado: "Bom" }),
        item("documentacao", "Fichas de entrega de EPI", "conforme", {
          validade: iso(31, 1, 2027), obs: "Fichas assinadas pelos 24 colaboradores."
        })
      ]
    },

    /* ---------------- 4. Cintos e veículos — Galpão Logístico ----------- */
    {
      id: "f4",
      tipo: "Inspeção de Cintos e Veículos",
      clienteId: "c5", obraId: "o11",
      data: iso(12, 9, 9, 15),
      responsavel: "Ana Costa",
      status: "Com pendências",
      obsGerais: "Inspeção de cintos de segurança, bancos e assentos dos veículos e máquinas de movimentação de carga.",
      itens: [
        item("cinto-seguranca", "Cinto de segurança — Empilhadeira 02", "nao-conforme", {
          equipamento: "Empilhadeira 02", estado: "Ruim",
          obs: "Cinto apresentando desgaste.",
          problema: "Cinto apresentando desgaste e fecho com folga.",
          nivel: "alto", acao: "Substituir o cinto e liberar a empilhadeira somente após a troca.",
          prazo: iso(19, 9), responsavel: "Manutenção interna",
          fotos: [fotoRef("ev-1030", "Cinto da Empilhadeira 02 com desgaste nas fibras.", iso(12, 9, 10, 50))]
        }),
        item("cinto-seguranca", "Cinto de segurança — Empilhadeira 01", "conforme", { equipamento: "Empilhadeira 01", estado: "Bom" }),
        item("cinto-seguranca", "Cinto de segurança — Caminhão 03", "conforme", { equipamento: "Caminhão 03", estado: "Bom" }),
        item("bancos-assentos", "Bancos e assentos — frota interna", "conforme", {
          qtd: 6, qtdOk: 6, qtdNc: 0, obs: "Assentos sem rasgos, fixação firme e regulagem funcionando."
        }),
        item("veiculo", "Veículo — Caminhão 03", "conforme", { validade: iso(14, 2, 2027), estado: "Bom" }),
        item("empilhadeira", "Empilhadeira 01 — inspeção geral", "conforme", { validade: iso(20, 11), estado: "Bom" }),
        item("maquina", "Máquina — esteira transportadora", "conforme", { estado: "Bom" }),
        item("equipamento", "Equipamentos de movimentação de carga", "conforme", { obs: "Cintas e ganchos de içamento em bom estado." })
      ]
    },

    /* ---------------- 5. Inspeção de EPCs — Edifício Aurora ------------- */
    {
      id: "f5",
      tipo: "Inspeção de EPCs e Trabalho em Altura",
      clienteId: "c5", obraId: "o9",
      data: iso(11, 9, 8, 50),
      responsavel: "Maria Silva",
      status: "Concluída",
      obsGerais: "Verificação de proteções coletivas e linhas de vida na fachada do Edifício Aurora.",
      itens: [
        item("epc", "EPC — Guarda-corpo do pavimento 12", "conforme", { estado: "Bom" }),
        item("epc", "EPC — Plataforma de proteção da fachada", "conforme", { estado: "Bom" }),
        item("cinto-paraquedista", "Cinto paraquedista e trava-quedas", "conforme", { validade: iso(3, 4, 2027), estado: "Bom" }),
        item("epc", "Linha de vida horizontal — telhado", "conforme", { estado: "Bom" }),
        item("epc", "EPC — Proteção de aberturas no piso", "conforme", { estado: "Bom" }),
        item("sinalizacao", "Sinalização de trabalho em altura", "conforme", {}),
        item("condicoes-seguranca", "Condições de acesso às áreas elevadas", "conforme", {}),
        item("documentacao", "Análise de Risco e Permissão de Trabalho", "conforme", {
          validade: iso(31, 12), obs: "ART e APR assinadas."
        })
      ]
    },

    /* ---------------- 6. Inspeção de Máquinas — Galpão Logístico -------- */
    {
      id: "f6",
      tipo: "Inspeção de Máquinas e Equipamentos",
      clienteId: "c5", obraId: "o11",
      data: iso(10, 9, 10, 20),
      responsavel: "João Pereira",
      status: "Concluída",
      obsGerais: "Inspeção de máquinas e equipamentos do galpão, com foco em proteções e dispositivos de segurança.",
      itens: [
        item("maquina", "Máquina — prensa hidráulica", "conforme", { estado: "Bom" }),
        item("maquina", "Máquina — serra circular de bancada", "conforme", { estado: "Bom" }),
        item("equipamento", "Equipamento — sistema de combate a incêndio", "conforme", { validade: iso(15, 1, 2027), estado: "Bom" }),
        item("epc", "EPC — proteção fixa das correias", "conforme", {}),
        item("sinalizacao", "Sinalização de máquinas (NR-12)", "conforme", {}),
        item("condicoes-seguranca", "Condições de segurança da área de produção", "conforme", {}),
        item("equipamento", "Botões de emergência", "conforme", { qtd: 8, qtdOk: 8, qtdNc: 0 }),
        item("documentacao", "Inventário de máquinas e manuais", "conforme", { validade: iso(30, 6, 2027) }),
        item("epi", "EPIs específicos das máquinas", "conforme", { estado: "Bom" }),
        item("extintor", "Extintor — área de produção", "conforme", { validade: iso(8, 1, 2027), estado: "Bom" })
      ]
    },

    /* ---------------- 7. Inspeção de Capacetes — Edifício Aurora -------- */
    {
      id: "f7",
      tipo: "Inspeção de Capacetes",
      clienteId: "c5", obraId: "o9",
      data: iso(9, 9, 16, 5),
      responsavel: "Maria Silva",
      status: "Concluída",
      obsGerais: "Conferência dos capacetes de toda a equipe de campo do Edifício Aurora.",
      itens: [
        item("capacete", "Capacetes — equipe de fachada", "conforme", { qtd: 12, qtdOk: 12, qtdNc: 0 }),
        item("capacete", "Capacetes — equipe de estrutura", "conforme", { qtd: 16, qtdOk: 16, qtdNc: 0 }),
        item("capacete", "Capacetes — equipe administrativa de obra", "na", {
          obs: "Equipe não acessa áreas de risco — item não aplicável."
        }),
        item("epi", "Jugulares e suspensões dos capacetes", "conforme", {}),
        item("documentacao", "Registro de substituição de capacetes", "conforme", { validade: iso(9, 9, 2027) })
      ]
    },

    /* ---------------- 8. Documentação — Empresa Alpha ------------------- */
    {
      id: "f8",
      tipo: "Inspeção de Documentação de SST",
      clienteId: "c6", obraId: "o12",
      data: iso(8, 9, 11, 30),
      responsavel: "Maria Silva",
      status: "Com pendências",
      obsGerais: "Auditoria da documentação de SST da Unidade Recife.",
      itens: [
        item("documentacao", "PGR — Programa de Gerenciamento de Riscos", "conforme", { validade: iso(30, 9) }),
        item("documentacao", "PCMSO — Programa de Controle Médico", "conforme", { validade: iso(28, 2, 2027) }),
        item("documentacao", "ASO dos colaboradores", "conforme", { validade: iso(20, 1, 2027), obs: "24 de 24 ASOs válidos." }),
        item("documentacao", "Ordens de serviço assinadas", "conforme", { validade: iso(31, 12) }),
        item("documentacao", "Fichas de EPI", "conforme", { validade: iso(31, 1, 2027) }),
        item("documentacao", "Certificados de treinamento NR", "nao-conforme", {
          problema: "Dois certificados de NR 12 com validade expirada.",
          nivel: "alto", acao: "Reagendar o treinamento e reemitir os certificados.",
          prazo: iso(30, 9), responsavel: "Empresa Alpha",
          fotos: [fotoRef("ev-1040", "Certificado de NR 12 com validade expirada.", iso(8, 9, 11, 55))]
        }),
        item("documentacao", "Registro de entrega de EPI", "conforme", { validade: iso(30, 6, 2027) })
      ]
    },

    /* ---------------- 9. Sinalização — Parque Sul ----------------------- */
    {
      id: "f9",
      tipo: "Inspeção de Sinalização e Condições de Segurança",
      clienteId: "c5", obraId: "o10",
      data: iso(5, 9, 15, 0),
      responsavel: "João Pereira",
      status: "Com pendências",
      obsGerais: "Inspeção de sinalização, rotas de fuga e condições gerais de segurança do canteiro.",
      itens: [
        item("sinalizacao", "Sinalização de rotas de fuga", "conforme", {}),
        item("sinalizacao", "Sinalização de advertência — áreas de risco", "nao-conforme", {
          problema: "Ausência de sinalização de advertência no acesso ao bloco B.",
          nivel: "medio", acao: "Instalar placas de advertência no acesso.",
          prazo: iso(12, 9), responsavel: "Construtora Horizonte",
          fotos: [fotoRef("ev-1050", "Acesso ao bloco B sem sinalização de advertência.", iso(5, 9, 16, 48))]
        }),
        item("sinalizacao", "Sinalização de extintores e hidrantes", "conforme", {}),
        item("condicoes-seguranca", "Organização e limpeza do canteiro", "conforme", {}),
        item("condicoes-seguranca", "Iluminação das áreas de circulação", "conforme", {}),
        item("condicoes-seguranca", "Instalações elétricas provisórias", "conforme", {}),
        item("condicoes-seguranca", "Vias de circulação e acessos", "conforme", { obs: "Rotas desobstruídas e sinalizadas." })
      ]
    },

    /* ---------------- 10. EPIs — Galpão Logístico ----------------------- */
    {
      id: "f10",
      tipo: "Inspeção de EPIs e EPCs",
      clienteId: "c5", obraId: "o11",
      data: iso(3, 9, 8, 40),
      responsavel: "Ana Costa",
      status: "Concluída",
      obsGerais: "Inspeção de EPIs e EPCs da equipe do Galpão Logístico Recife.",
      itens: [
        item("epi", "EPI — colete refletivo", "conforme", { validade: iso(10, 3, 2027), estado: "Bom" }),
        item("epi", "EPI — bota de segurança", "conforme", { validade: iso(18, 7, 2027), estado: "Bom" }),
        item("epi", "EPI — respirador semifacial", "conforme", {
          validade: iso(2, 10, 2027), estado: "Bom", obs: "Em dia — substituição dos filtros programada."
        }),
        item("epc", "EPC — faixas de isolamento de área", "conforme", {}),
        item("capacete", "Capacetes — equipe de expedição", "conforme", { qtd: 10, qtdOk: 10, qtdNc: 0 })
      ]
    },

    /* ---------------- 11. Extintores — Edifício Aurora ------------------ */
    {
      id: "f11",
      tipo: "Inspeção de Extintores",
      clienteId: "c5", obraId: "o9",
      data: iso(1, 9, 14, 25),
      responsavel: "Maria Silva",
      status: "Concluída",
      obsGerais: "Inspeção dos extintores do Edifício Aurora — pavimentos 1 a 6.",
      itens: [
        item("extintor", "Extintor — Pavimento 02", "conforme", { validade: iso(12, 5, 2027), estado: "Bom" }),
        item("extintor", "Extintor — Pavimento 03", "conforme", { validade: iso(12, 5, 2027), estado: "Bom" }),
        item("extintor", "Extintor — Pavimento 04", "conforme", { validade: iso(3, 6, 2027), estado: "Bom" }),
        item("extintor", "Extintor — Pavimento 05", "conforme", { validade: iso(3, 6, 2027), estado: "Bom" }),
        item("extintor", "Extintor — Pavimento 06", "conforme", { validade: iso(28, 7, 2027), estado: "Bom" }),
        item("extintor", "Extintor — Almoxarifado", "conforme", { validade: iso(15, 4, 2027), estado: "Bom" }),
        item("sinalizacao", "Sinalização dos extintores", "conforme", {}),
        item("documentacao", "Fichas de inspeção", "conforme", { validade: iso(1, 9, 2027) })
      ]
    },

    /* ---------------- 12. Programada — Empresa Alpha -------------------- */
    {
      id: "f12",
      tipo: "Inspeção Geral de SST",
      clienteId: "c6", obraId: "o12",
      data: iso(21, 9, 9, 0),
      responsavel: "Maria Silva",
      status: "Programada",
      obsGerais: "Inspeção geral programada para a Unidade Recife — checklist ainda não iniciado.",
      itens: [
        item("extintor", "Extintor — área administrativa", null, { validade: iso(26, 9) }),
        item("extintor", "Extintor — área de produção", null, { validade: iso(18, 1, 2027) }),
        item("epi", "EPIs — equipe de produção", null, {}),
        item("capacete", "Capacetes — equipe de campo", null, { qtd: 18, qtdOk: null, qtdNc: null }),
        item("epc", "EPCs da área industrial", null, {}),
        item("sinalizacao", "Sinalização de segurança", null, {}),
        item("condicoes-seguranca", "Condições gerais do ambiente", null, {}),
        item("documentacao", "Documentação de SST", null, {})
      ]
    }
  ];


  // Vínculos legíveis (cliente/obra) a partir dos IDs — sempre via núcleo.
  function clienteDa(f) { return MS.CLIENTES.filter(function (c) { return c.id === f.clienteId; })[0]; }
  function obraDa(f) { return MS.obraPorId(f.obraId); }
  function nomeCliente(f) { var c = clienteDa(f); return c ? c.nome : "—"; }
  function nomeObra(f) { var o = obraDa(f); return o ? o.nome : "—"; }

  /* ======================================================================
     3. CÁLCULOS / INDICADORES
     ====================================================================== */
  function noMes(f) { return f.data.getMonth() === MS.NOW.getMonth() && f.data.getFullYear() === MS.NOW.getFullYear(); }

  function contarItens(f) {
    var c = { total: 0, verificados: 0, conformes: 0, nc: 0, na: 0, pendentes: 0, corrigidos: 0 };
    f.itens.forEach(function (it) {
      c.total++;
      if (it.situacao) c.verificados++;
      if (it.situacao === "conforme") c.conformes++;
      if (it.situacao === "na") c.na++;
      if (it.situacao === "nao-conforme") {
        c.nc++;
        if (it.nc && it.nc.status === "Corrigido") c.corrigidos++;
        else c.pendentes++;
      }
    });
    c.progresso = MS.pct(c.verificados, c.total);
    return c;
  }

  // Itens com validade próxima do vencimento (até 60 dias) ou já vencidos,
  // considerando apenas itens efetivamente inspecionados.
  function vencimentosProximos() {
    var lista = [];
    FISCALIZACOES.forEach(function (f) {
      f.itens.forEach(function (it) {
        if (!it.validade || it.situacao === "na") return;
        var info = MS.validadeInfo(it.validade, 60);
        if (info.nivel === "proximo" || info.nivel === "vencido") lista.push({ f: f, it: it, info: info });
      });
    });
    return lista.sort(function (a, b) { return a.it.validade - b.it.validade; });
  }

  function todasNC() {
    var lista = [];
    FISCALIZACOES.forEach(function (f) {
      f.itens.forEach(function (it) {
        if (it.situacao === "nao-conforme" && it.nc) lista.push({ f: f, it: it, nc: it.nc });
      });
    });
    return lista;
  }

  function indicadores() {
    var mes = FISCALIZACOES.filter(noMes).length;
    var conformes = 0, pend = 0;
    FISCALIZACOES.forEach(function (f) {
      var c = contarItens(f);
      conformes += c.conformes;
      pend += c.pendentes;
    });
    return {
      mes: mes,
      conformes: conformes,
      pendencias: pend,
      vencimentos: vencimentosProximos().length
    };
  }

  /* ======================================================================
     4. HELPERS DE APRESENTAÇÃO
     ====================================================================== */
  function statusFiscalizacao(f) {
    if (f.status === "Concluída") return "status--concluido";
    if (f.status === "Programada") return "status--review";
    return "status--warn";
  }
  function nivelNome(id) {
    for (var i = 0; i < NIVEIS_NC.length; i++) if (NIVEIS_NC[i].id === id) return NIVEIS_NC[i].nome;
    return "—";
  }
  function nivelClasse(id) {
    for (var i = 0; i < NIVEIS_NC.length; i++) if (NIVEIS_NC[i].id === id) return NIVEIS_NC[i].cor;
    return "nivel--medio";
  }
  function avisoValidade(it, limite) {
    if (!it.validade) return "";
    var info = MS.validadeInfo(it.validade, limite == null ? 60 : limite);
    if (info.nivel === "ok") return "";
    var cls = info.nivel === "vencido" ? "venc-aviso--vencido" : "venc-aviso--proximo";
    return '<div class="venc-aviso ' + cls + '"><svg viewBox="0 0 24 24" width="15" height="15"><path fill="currentColor" d="M12 2 1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z"/></svg>' +
      "<span><strong>" + (info.nivel === "vencido" ? "Vencido" : "Vencimento próximo") + "</strong> · validade " +
      fmtDate(it.validade) + " (" + MS.vencTexto(it.validade) + ")</span></div>";
  }

  // Grade de evidências (miniaturas). Sem backend: cada foto é uma REFERÊNCIA
  // demonstrativa com legenda, data e vínculo — o upload real virá depois.
  function evidThumbs(f, itens, limite) {
    var lista = [];
    (itens || f.itens).forEach(function (it) {
      (it.fotos || []).forEach(function (ft) { lista.push({ it: it, ft: ft }); });
    });
    if (!lista.length) return '<p class="evid-vazio">Nenhuma evidência anexada ainda. Use <strong>+ Adicionar foto</strong> para registrar.</p>';
    var visiveis = limite ? lista.slice(0, limite) : lista;
    return '<div class="evid-grid">' + visiveis.map(function (e) {
      return '<button type="button" class="evid-thumb" data-foto="' + esc(e.ft.id) + '" data-fisc="' + f.id + '" data-item="' + e.it.id + '">' +
        '<span class="evid-thumb__img"><span class="evid-thumb__num">' + esc(e.ft.id) + "</span></span>" +
        '<span class="evid-thumb__cap">' + esc(e.ft.obs) + "</span>" +
        '<span class="evid-thumb__meta">' + fmtDate(e.ft.data) + " · " + esc(e.it.titulo) + "</span>" +
        "</button>";
    }).join("") + "</div>";
  }

  function encontrarFoto(fiscId, itemId, fotoId) {
    var f = FISCALIZACOES.filter(function (x) { return x.id === fiscId; })[0];
    if (!f) return null;
    var it = f.itens.filter(function (x) { return x.id === itemId; })[0];
    if (!it) return null;
    var ft = (it.fotos || []).filter(function (x) { return x.id === fotoId; })[0];
    if (!ft) return null;
    return { f: f, it: it, ft: ft };
  }

  /* ======================================================================
     5. TELA — LISTA DE FISCALIZAÇÕES
     ====================================================================== */
  var filtro = { cliente: "todos", obra: "todas", tipo: "todos", status: "todos", periodo: "todos", busca: "" };

  function renderLista() {
    MS.showApp();
    MS.setCrumbs([{ label: "Fiscalizações" }]);
    MS.actions._ctxObra = null;
    MS.actions._ctxCliente = null;

    var ind = indicadores();
    var kpis = [
      { label: "Fiscalizações no mês", value: ind.mes, icon: ico("clipboard") },
      { label: "Itens conformes", value: ind.conformes, icon: ico("check") },
      { label: "Pendências", value: ind.pendencias, warn: true, icon: ico("alert") },
      { label: "Vencimentos próximos", value: ind.vencimentos, warn: true, icon: ico("clock") }
    ];

    MS.setView(
      '<div class="page-head rv"><div><h1 class="page-head__title">Fiscalizações</h1>' +
      '<p class="page-head__sub">Acompanhe inspeções, não conformidades e evidências das obras.</p></div>' +
      '<div class="page-head__actions"><button class="btn btn--primary btn--sm" data-action="nova-fiscalizacao">+ Nova fiscalização</button></div></div>' +

      '<div class="kpi-grid kpi-grid--4">' + kpis.map(function (k, i) {
        return '<div class="kpi rv' + (k.warn ? " kpi--warn" : "") + '" style="transition-delay:' + i * 30 + 'ms">' +
          '<span class="kpi__icon">' + k.icon + '</span><span class="kpi__label">' + k.label + '</span>' +
          '<div class="kpi__value">' + k.value + "</div></div>";
      }).join("") + "</div>" +

      /* ---- Filtros ---- */
      '<div class="card rv filter-bar">' +
      '<label class="filter-search"><svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M15.5 14h-.8l-.3-.3a6.5 6.5 0 1 0-.7.7l.3.3v.8l5 5 1.5-1.5-5-5zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z"/></svg>' +
      '<input type="search" id="fisc-busca" placeholder="Buscar fiscalização..." value="' + esc(filtro.busca) + '" /></label>' +
      selectFiltro("fisc-cliente", "Cliente", [["todos", "Todos os clientes"]].concat(MS.CLIENTES.map(function (c) { return [c.id, c.nome]; })), filtro.cliente) +
      selectFiltro("fisc-obra", "Obra", [["todas", "Todas as obras"]].concat(obrasDeFiltro()), filtro.obra) +
      selectFiltro("fisc-tipo", "Tipo", [["todos", "Todos os tipos"]].concat(tiposDisponiveis()), filtro.tipo) +
      selectFiltro("fisc-status", "Status", [["todos", "Todos os status"], ["Concluída", "Concluída"], ["Com pendências", "Com pendências"], ["Programada", "Programada"]], filtro.status) +
      selectFiltro("fisc-periodo", "Período", [["todos", "Todo o período"], ["mes", "Setembro/2026"], ["30", "Últimos 30 dias"], ["7", "Últimos 7 dias"]], filtro.periodo) +
      '<button class="btn btn--light btn--sm" id="fisc-limpar">Limpar filtros</button>' +
      "</div>" +

      '<div class="card rv"><div id="fisc-lista">' + corpoLista() + "</div></div>"
    );

    wireFiltros();
  }

  function ico(nome) {
    var paths = {
      clipboard: '<path fill="currentColor" d="M19 3h-4.2a3 3 0 0 0-5.6 0H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 16H5V5h2v2h10V5h2v14zM7 10h10v2H7v-2zm0 4h7v2H7v-2z"/>',
      check: '<path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/>',
      alert: '<path fill="currentColor" d="M12 2 1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z"/>',
      clock: '<path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 11H7v-2h4V6h2v7z"/>',
      camera: '<path fill="currentColor" d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5z"/>',
      shield: '<path fill="currentColor" d="M16 2 4 7v8c0 7 5 13 12 15 7-2 12-8 12-15V7L16 2z"/>',
      doc: '<path fill="currentColor" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>'
    };
    return '<svg viewBox="0 0 24 24">' + (paths[nome] || paths.doc) + "</svg>";
  }

  function selectFiltro(id, label, opcoes, atual) {
    return '<label class="filter-select"><span class="filter-select__label">' + label + "</span>" +
      '<select class="field__input" id="' + id + '">' +
      opcoes.map(function (o) {
        return '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(atual) ? " selected" : "") + ">" + esc(o[1]) + "</option>";
      }).join("") + "</select></label>";
  }

  function obrasDeFiltro() {
    if (filtro.cliente !== "todos") {
      var c = MS.CLIENTES.filter(function (x) { return x.id === filtro.cliente; })[0];
      return c ? c.obras.map(function (o) { return [o.id, o.nome]; }) : [];
    }
    var todas = [];
    MS.CLIENTES.forEach(function (c) { c.obras.forEach(function (o) { todas.push([o.id, o.nome]); }); });
    return todas;
  }

  function tiposDisponiveis() {
    var vistos = {}, out = [];
    FISCALIZACOES.forEach(function (f) { if (!vistos[f.tipo]) { vistos[f.tipo] = 1; out.push([f.tipo, f.tipo]); } });
    return out;
  }

  function aplicarFiltros() {
    return FISCALIZACOES.filter(function (f) {
      if (filtro.cliente !== "todos" && f.clienteId !== filtro.cliente) return false;
      if (filtro.obra !== "todas" && f.obraId !== filtro.obra) return false;
      if (filtro.tipo !== "todos" && f.tipo !== filtro.tipo) return false;
      if (filtro.status !== "todos" && f.status !== filtro.status) return false;
      if (filtro.periodo === "mes" && !noMes(f)) return false;
      if (filtro.periodo === "30" && f.data < MS.addDays(MS.NOW, -30)) return false;
      if (filtro.periodo === "7" && f.data < MS.addDays(MS.NOW, -7)) return false;
      if (filtro.busca) {
        var alvo = (f.tipo + " " + nomeCliente(f) + " " + nomeObra(f) + " " + f.responsavel).toLowerCase();
        if (alvo.indexOf(filtro.busca.toLowerCase()) < 0) return false;
      }
      return true;
    }).sort(function (a, b) { return b.data - a.data; });
  }

  function corpoLista() {
    var lista = aplicarFiltros();
    if (!lista.length) {
      return '<div class="card__pad" style="text-align:center;padding:44px 20px;color:var(--grey-500)">' +
        "<h3 style=\"margin-bottom:6px\">Nenhuma fiscalização encontrada</h3>" +
        "<p>Ajuste os filtros ou cadastre uma nova fiscalização.</p></div>";
    }
    return '<div class="card__head"><h3>Todas as fiscalizações</h3>' +
      '<span class="card__head-sub">' + lista.length + (lista.length === 1 ? " registro" : " registros") + "</span></div>" +
      '<div class="table-wrap table-cards"><table class="table"><thead><tr>' +
      "<th>Fiscalização</th><th>Cliente</th><th>Obra</th><th>Data</th><th>Responsável</th><th>Itens</th><th>Status</th><th></th>" +
      "</tr></thead><tbody>" +
      lista.map(function (f) {
        var c = contarItens(f);
        // Texto de "Itens" coerente com o que a fiscalização realmente tem.
        var colaboradores = 0;
        f.itens.forEach(function (it) { if (it.qtd) colaboradores = Math.max(colaboradores, it.qtd); });
        var itensTxt;
        if (/EPI/i.test(f.tipo) && colaboradores > 0) itensTxt = colaboradores + " colaboradores";
        else if (f.status === "Programada") itensTxt = c.total + " itens previstos";
        else itensTxt = c.total + " itens verificados";
        return '<tr class="is-clickable" data-href="#/fiscalizacao/' + f.id + '">' +
          '<td data-l="Fiscalização" class="cell-strong">' + esc(f.tipo) + "</td>" +
          '<td data-l="Cliente">' + esc(nomeCliente(f)) + "</td>" +
          '<td data-l="Obra">' + esc(nomeObra(f)) + "</td>" +
          '<td data-l="Data">' + fmtDate(f.data) + "</td>" +
          '<td data-l="Responsável">' + esc(f.responsavel) + "</td>" +
          '<td data-l="Itens">' + itensTxt + "</td>" +
          '<td data-l="Status"><span class="status ' + statusFiscalizacao(f) + '">' + esc(f.status) + "</span></td>" +
          '<td data-l=""><span class="link-btn">Abrir</span></td>' +
          "</tr>";
      }).join("") +
      "</tbody></table></div>";
  }

  function wireFiltros() {
    var busca = document.getElementById("fisc-busca");
    if (busca) busca.addEventListener("input", function () {
      filtro.busca = busca.value;
      document.getElementById("fisc-lista").innerHTML = corpoLista();
      MS.wireView();
    });
    ["fisc-cliente", "fisc-obra", "fisc-tipo", "fisc-status", "fisc-periodo"].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("change", function () {
        if (id === "fisc-cliente") { filtro.cliente = el.value; filtro.obra = "todas"; }
        else if (id === "fisc-obra") filtro.obra = el.value;
        else if (id === "fisc-tipo") filtro.tipo = el.value;
        else if (id === "fisc-status") filtro.status = el.value;
        else filtro.periodo = el.value;
        // re-render completo porque o filtro de obra depende do cliente
        MS.rerender();
      });
    });
    var limpar = document.getElementById("fisc-limpar");
    if (limpar) limpar.addEventListener("click", function () {
      filtro = { cliente: "todos", obra: "todas", tipo: "todos", status: "todos", periodo: "todos", busca: "" };
      MS.rerender();
    });
  }

  /* ======================================================================
     6. TELA — DETALHE DA FISCALIZAÇÃO (checklist + NC + evidências + relatório)
     ====================================================================== */
  function renderDetalhe(parts) {
    var id = parts[1];
    var f = FISCALIZACOES.filter(function (x) { return x.id === id; })[0];
    if (!f) { MS.showToast("Fiscalização não encontrada nesta demonstração."); return renderLista(); }

    var aba = parts[2] || "checklist";
    var o = obraDa(f);
    var c = clienteDa(f);
    MS.showApp();
    MS.setCrumbs([
      { label: "Fiscalizações", href: "fiscalizacoes" },
      { label: o.nome, href: "obra/" + o.id },
      { label: f.tipo }
    ]);
    MS.actions._ctxObra = o;
    MS.actions._ctxCliente = c;
    MS.state.fiscalizacaoAtual = f;

    var c2 = contarItens(f);

    MS.setView(
      '<div class="entity-head rv">' +
      '<span class="entity-head__icon">' + ico("clipboard") + "</span>" +
      '<div class="entity-head__titles"><h1>' + esc(f.tipo) + "</h1>" +
      '<div class="entity-head__sub">Cliente: <strong>' + esc(c.nome) + "</strong> · Obra: <strong>" + esc(o.nome) +
      "</strong> · " + fmtDate(f.data) + "</div></div>" +
      '<div class="entity-head__meta">' +
      '<div class="entity-meta"><div class="entity-meta__label">Status</div><div class="entity-meta__value">' +
      '<span class="status ' + statusFiscalizacao(f) + '" style="background:rgba(255,255,255,.14)">' + esc(f.status) + "</span></div></div>" +
      '<div class="entity-meta"><div class="entity-meta__label">Responsável</div><div class="entity-meta__value">' + esc(f.responsavel) + "</div></div>" +
      "</div></div>" +

      /* ---- Progresso da inspeção ---- */
      '<div class="card rv prog-card">' +
      '<div class="prog-card__top">' +
      '<div><div class="prog-card__label">Progresso da inspeção</div>' +
      '<div class="prog-card__num">' + c2.verificados + " de " + c2.total + " itens verificados</div></div>" +
      '<div class="prog-card__stats">' +
      '<span class="prog-stat prog-stat--ok">' + c2.conformes + " conformes</span>" +
      '<span class="prog-stat prog-stat--nc">' + c2.nc + " não conformes</span>" +
      '<span class="prog-stat prog-stat--na">' + c2.na + " não se aplica</span>" +
      "</div></div>" +
      '<div class="prog"><div class="prog__fill" style="width:' + c2.progresso + '%"></div></div>' +
      "</div>" +

      /* ---- Abas ---- */
      '<div class="tabs rv">' +
      abaBtn("checklist", "Checklist", c2.total, aba) +
      abaBtn("nao-conformidades", "Não conformidades", c2.nc, aba) +
      abaBtn("evidencias", "Evidências", totalFotos(f), aba) +
      abaBtn("relatorio", "Relatório", null, aba) +
      "</div>" +
      '<div id="tab-content"></div>'
    );

    function activate(nome) {
      var el = document.getElementById("tab-content");
      var map = { checklist: tabChecklist, "nao-conformidades": tabNC, evidencias: tabEvidencias, relatorio: tabRelatorio };
      el.innerHTML = (map[nome] || tabChecklist)(f);
      MS.wireView();
      MS.revealAll(el);
    }
    activate(aba);

    document.querySelectorAll("#view .tab").forEach(function (t) {
      t.addEventListener("click", function () {
        activate(t.getAttribute("data-tab"));
        document.querySelectorAll("#view .tab").forEach(function (x) {
          x.classList.toggle("is-active", x === t);
        });
      });
    });
  }

  function abaBtn(id, label, count, ativa) {
    return '<button class="tab' + (id === ativa ? " is-active" : "") + '" data-tab="' + id + '">' + label +
      (count == null ? "" : ' <span class="tab__count">' + count + "</span>") + "</button>";
  }

  function totalFotos(f) {
    var n = 0;
    f.itens.forEach(function (it) { n += (it.fotos || []).length; });
    return n;
  }

  /* ---------------- Aba 1: CHECKLIST ---------------- */
  function tabChecklist(f) {
    var c = contarItens(f);
    return (
      '<div class="card rv chk-head">' +
      '<div class="chk-head__info">' +
      '<div><span class="chk-head__k">Fiscalização</span><strong>' + esc(f.tipo) + "</strong></div>" +
      '<div><span class="chk-head__k">Cliente</span><strong>' + esc(nomeCliente(f)) + "</strong></div>" +
      '<div><span class="chk-head__k">Data</span><strong>' + fmtDate(f.data) + "</strong></div>" +
      '<div><span class="chk-head__k">Progresso</span><strong>' + c.verificados + " de " + c.total + " itens verificados</strong></div>" +
      "</div>" +
      '<div class="prog"><div class="prog__fill" style="width:' + c.progresso + '%"></div></div>' +
      '<p class="chk-head__obs">' + esc(f.obsGerais) + "</p>" +
      "</div>" +

      '<div class="chk-actions rv">' +
      '<button class="btn btn--light btn--sm" data-action="add-item-inspecao">+ Adicionar item de inspeção</button>' +
      '<button class="btn btn--light btn--sm" data-action="add-evidencia">📷 + Adicionar foto</button>' +
      '<button class="btn btn--primary btn--sm" data-action="finalizar-fiscalizacao">Finalizar fiscalização</button>' +
      "</div>" +

      // Alternância de visão: cartões (ótimo no celular) ou compacta
      '<div class="chk-view rv">' +
      '<span class="chk-view__label">Visualização:</span>' +
      '<div class="filter-chip is-active" data-chkview="cards">Cartões</div>' +
      '<div class="filter-chip" data-chkview="compacta">Compacta</div>' +
      "</div>" +

      '<div class="chk-list" id="chk-list">' + f.itens.map(function (it) { return chkItem(f, it); }).join("") + "</div>"
    );
  }

  function chkItem(f, it) {
    var cat = itemCatalogo(it.cat);
    var s = situacaoInfo(it.situacao);
    var aviso = avisoValidade(it);
    var fotos = it.fotos || [];

    var html =
      '<div class="chk-item' + (it.situacao === "nao-conforme" ? " chk-item--nc" : "") + '" data-item="' + it.id + '">' +
      '<div class="chk-item__head">' +
      '<div class="chk-item__title"><span class="chk-item__grupo">' + esc(it.grupo) + "</span><h4>" + esc(it.titulo) + "</h4></div>" +
      '<span class="status ' + s.cls + ' chk-item__sit">' + s.nome + "</span>" +
      "</div>";

    // Quantidade verificada (capacetes, EPIs por equipe, etc.)
    if (cat.quantidade || it.qtd != null) {
      html += '<div class="chk-qtd">' +
        '<div class="os-field"><div class="os-field__label">Quantidade verificada</div><div class="os-field__value">' + (it.qtd == null ? "—" : it.qtd) + "</div></div>" +
        '<div class="os-field"><div class="os-field__label">Conformes</div><div class="os-field__value">' + (it.qtdOk == null ? "—" : it.qtdOk) + "</div></div>" +
        '<div class="os-field' + (it.qtdNc ? " os-field--nc" : "") + '"><div class="os-field__label">Não conformes</div><div class="os-field__value">' + (it.qtdNc == null ? "—" : it.qtdNc) + "</div></div>" +
        "</div>";
    }

    // Situação — botões segmentados (fáceis de tocar no celular)
    html += '<div class="chk-field"><span class="chk-field__label">Situação</span>' +
      '<div class="chk-opt" data-chk-opt="' + it.id + '">' +
      SITUACOES.map(function (o) {
        return '<button type="button" class="chk-opt__btn chk-opt__btn--' + o.id + (it.situacao === o.id ? " is-on" : "") +
          '" data-sit="' + o.id + '" data-item="' + it.id + '">' + o.nome + "</button>";
      }).join("") + "</div></div>";

    // Campos específicos do item
    if (cat.validade || it.validade) {
      html += '<div class="chk-fields">' +
        '<div class="os-field"><div class="os-field__label">Validade</div><div class="os-field__value">' +
        (it.validade ? fmtDate(it.validade) : "—") + "</div></div>" +
        (it.estado ? '<div class="os-field"><div class="os-field__label">Estado</div><div class="os-field__value">' + esc(it.estado) + "</div></div>" : "") +
        "</div>" + aviso;
    } else if (cat.estado || it.estado) {
      html += '<div class="chk-fields"><div class="os-field"><div class="os-field__label">Estado</div><div class="os-field__value">' +
        (it.estado || "—") + "</div></div></div>";
    }

    // Identificações contextuais
    var ids = [];
    if (it.equipamento) ids.push(["Equipamento/veículo", it.equipamento]);
    if (it.funcionario) ids.push(["Funcionário", it.funcionario]);
    if (it.epi) ids.push(["EPI", it.epi]);
    if (it.ca) ids.push(["CA", it.ca]);
    if (ids.length) {
      html += '<div class="chk-fields">' + ids.map(function (p) {
        return '<div class="os-field"><div class="os-field__label">' + p[0] + '</div><div class="os-field__value">' + esc(p[1]) + "</div></div>";
      }).join("") + "</div>";
    }

    // Observação (campo editável na demonstração)
    html += '<label class="chk-field"><span class="chk-field__label">Observação</span>' +
      '<textarea class="field__input chk-obs" rows="2" data-obs="' + it.id + '" placeholder="Descreva o que foi observado…">' + esc(it.obs) + "</textarea></label>";

    // Bloco de não conformidade
    if (it.situacao === "nao-conforme" && it.nc) {
      var nc = it.nc;
      var corrigido = nc.status === "Corrigido";
      html += '<div class="nc-box' + (corrigido ? " nc-box--ok" : "") + '">' +
        '<div class="nc-box__head">' +
        '<strong>' + (corrigido ? "Não conformidade corrigida" : "Não conformidade registrada") + "</strong>" +
        '<span class="nivel ' + nivelClasse(nc.nivel) + '">Risco ' + nivelNome(nc.nivel) + "</span>" +
        '<span class="status ' + (corrigido ? "status--concluido" : "status--pendente") + '">' + nc.status + "</span>" +
        "</div>" +
        '<div class="nc-box__grid">' +
        '<div><span class="nc-box__k">Problema encontrado</span><span class="nc-box__v">' + esc(nc.problema) + "</span></div>" +
        '<div><span class="nc-box__k">Ação recomendada</span><span class="nc-box__v">' + esc(nc.acao) + "</span></div>" +
        '<div><span class="nc-box__k">Prazo para correção</span><span class="nc-box__v">' + (nc.prazo ? fmtDate(nc.prazo) : "—") + "</span></div>" +
        '<div><span class="nc-box__k">Responsável pela correção</span><span class="nc-box__v">' + esc(nc.responsavel) + "</span></div>" +
        "</div>";

      if (corrigido && nc.correcao) {
        // ANTES → DEPOIS
        html += '<div class="antes-depois">' +
          '<div class="ad-col"><span class="ad-tag ad-tag--antes">Antes · problema</span>' +
          '<div class="ad-img">' + (fotos[0] ? esc(fotos[0].obs) : esc(nc.problema)) + "</div>" +
          (fotos[0] ? '<span class="ad-data">' + fmtDate(fotos[0].data) + "</span>" : "") + "</div>" +
          '<div class="ad-col"><span class="ad-tag ad-tag--depois">Depois · correção</span>' +
          '<div class="ad-img ad-img--ok">' + esc(nc.correcao.obs) + "</div>" +
          '<span class="ad-data">' + fmtDate(nc.correcao.data) + "</span></div>" +
          "</div>" +
          '<p class="nc-box__corr"><strong>Data da correção:</strong> ' + fmtDate(nc.correcao.data) + " · " + esc(nc.correcao.responsavel || "") + "</p>";
      } else {
        html += '<div class="nc-box__foot"><button class="btn btn--primary btn--sm" data-action="marcar-corrigido" data-fisc="' + f.id + '" data-item="' + it.id + '">Marcar como corrigido</button></div>';
      }
      html += "</div>";
    }

    // Fotos do item
    html += '<div class="chk-item__fotos"><span class="chk-field__label">Fotos / evidências (' + fotos.length + ")</span>" +
      (fotos.length ? '<div class="evid-grid evid-grid--sm">' + fotos.map(function (ft) {
        return '<button type="button" class="evid-thumb" data-foto="' + esc(ft.id) + '" data-fisc="' + f.id + '" data-item="' + it.id + '">' +
          '<span class="evid-thumb__img"><span class="evid-thumb__num">' + esc(ft.id) + "</span></span>" +
          '<span class="evid-thumb__cap">' + esc(ft.obs) + "</span></button>";
      }).join("") + "</div>" : '<p class="evid-vazio">Sem foto neste item.</p>') +
      '<button class="btn btn--light btn--sm" data-action="add-evidencia" data-fisc="' + f.id + '" data-item="' + it.id + '">+ Foto/Evidência</button></div>' +
      "</div>";
    return html;
  }

  /* ---------------- Aba 2: NÃO CONFORMIDADES ---------------- */
  function tabNC(f) {
    var lista = f.itens.filter(function (it) { return it.situacao === "nao-conforme" && it.nc; });
    if (!lista.length) {
      return '<div class="card rv"><div class="card__pad" style="text-align:center;padding:44px 20px">' +
        '<div class="nc-ok-ico">' + ico("check") + "</div>" +
        "<h3 style=\"margin-bottom:6px\">Nenhuma não conformidade</h3>" +
        '<p style="color:var(--grey-500)">Todos os itens verificados estão conformes nesta fiscalização.</p></div></div>';
    }
    var abertas = lista.filter(function (it) { return it.nc.status !== "Corrigido"; }).length;
    return (
      '<div class="nc-resumo rv">' +
      '<div class="indicator"><div class="indicator__value">' + lista.length + '</div><div class="indicator__label">Não conformidades</div></div>' +
      '<div class="indicator"><div class="indicator__value" style="color:var(--red-500)">' + abertas + '</div><div class="indicator__label">Aguardando correção</div></div>' +
      '<div class="indicator"><div class="indicator__value" style="color:var(--green-600)">' + (lista.length - abertas) + '</div><div class="indicator__label">Corrigidas</div></div>' +
      '<div class="indicator"><div class="indicator__value">' + lista.filter(function (it) { return it.nc.nivel === "critico" || it.nc.nivel === "alto"; }).length + '</div><div class="indicator__label">Risco alto ou crítico</div></div>' +
      "</div>" +
      '<div class="nc-lista">' + lista.map(function (it) {
        var nc = it.nc, corrigido = nc.status === "Corrigido";
        return '<div class="card rv nc-card' + (corrigido ? " nc-card--ok" : "") + '">' +
          '<div class="nc-card__head">' +
          "<div><h3>" + esc(it.titulo) + '</h3><span class="nc-card__grupo">' + esc(it.grupo) + " · " + esc(f.tipo) + "</span></div>" +
          '<div class="nc-card__tags"><span class="nivel ' + nivelClasse(nc.nivel) + '">Risco ' + nivelNome(nc.nivel) + "</span>" +
          '<span class="status ' + (corrigido ? "status--concluido" : "status--pendente") + '">' + nc.status + "</span></div>" +
          "</div>" +
          '<div class="card__pad nc-card__body">' +
          '<div class="nc-grid">' +
          '<div><span class="nc-box__k">Problema encontrado</span><span class="nc-box__v">' + esc(nc.problema) + "</span></div>" +
          '<div><span class="nc-box__k">Ação recomendada</span><span class="nc-box__v">' + esc(nc.acao) + "</span></div>" +
          '<div><span class="nc-box__k">Prazo para correção</span><span class="nc-box__v">' + (nc.prazo ? fmtDate(nc.prazo) + " · " + MS.vencTexto(nc.prazo) : "—") + "</span></div>" +
          '<div><span class="nc-box__k">Responsável pela correção</span><span class="nc-box__v">' + esc(nc.responsavel) + "</span></div>" +
          "</div>" +
          (corrigido && nc.correcao
            ? '<div class="antes-depois">' +
              '<div class="ad-col"><span class="ad-tag ad-tag--antes">Antes · problema</span><div class="ad-img">' + esc(nc.problema) + "</div></div>" +
              '<div class="ad-col"><span class="ad-tag ad-tag--depois">Depois · correção</span><div class="ad-img ad-img--ok">' + esc(nc.correcao.obs) + "</div>" +
              '<span class="ad-data">Corrigido em ' + fmtDate(nc.correcao.data) + "</span></div></div>"
            : '<div class="nc-card__foot"><button class="btn btn--primary btn--sm" data-action="marcar-corrigido" data-fisc="' + f.id + '" data-item="' + it.id + '">Marcar como corrigido</button>' +
              '<button class="btn btn--light btn--sm" data-action="add-evidencia" data-fisc="' + f.id + '" data-item="' + it.id + '">+ Foto/Evidência</button></div>') +
          "</div></div>";
      }).join("") + "</div>"
    );
  }

  /* ---------------- Aba 3: EVIDÊNCIAS ---------------- */
  function tabEvidencias(f) {
    return (
      '<div class="card rv"><div class="card__head"><h3>Evidências da fiscalização</h3>' +
      '<button class="btn btn--primary btn--sm" data-action="add-evidencia" data-fisc="' + f.id + '">+ Adicionar foto</button></div>' +
      '<div class="card__pad">' +
      '<div class="gallery-toolbar">' +
      '<div class="filter-chip is-active">Todas</div><div class="filter-chip">Itens conformes</div>' +
      '<div class="filter-chip">Não conformidades</div><div class="filter-chip">Com correção</div></div>' +
      evidThumbs(f) +
      '<div class="card" style="margin-top:16px;padding:14px 16px;background:var(--green-50);border-color:var(--green-100);font-size:.86rem">' +
      "Cada evidência guarda o vínculo <strong>Cliente → Obra → Fiscalização → Item inspecionado → Data → Observação</strong>. " +
      "Na versão final, o registro poderá ser feito pelo celular, inclusive usando a <strong>câmera durante a inspeção na obra</strong>." +
      "</div></div></div>"
    );
  }

  /* ---------------- Aba 4: RELATÓRIO ---------------- */
  function tabRelatorio(f) {
    var c = contarItens(f);
    var nc = f.itens.filter(function (it) { return it.situacao === "nao-conforme"; });
    var venc = f.itens.filter(function (it) {
      return it.validade && it.situacao !== "na" && MS.validadeInfo(it.validade, 60).nivel !== "ok";
    });
    var porGrupo = {};
    f.itens.forEach(function (it) {
      if (!porGrupo[it.grupo]) porGrupo[it.grupo] = [];
      porGrupo[it.grupo].push(it);
    });

    return (
      '<div class="card rv rel-doc">' +
      '<div class="rel-doc__head">' +
      '<span class="brand__shield">' + '<svg viewBox="0 0 32 32" width="34" height="34"><path d="M16 2 4 7v8c0 7 5 13 12 15 7-2 12-8 12-15V7L16 2z" fill="currentColor"/><path d="M16 7l-6.5 3v5.5c0 4.6 2.8 8.6 6.5 10 3.7-1.4 6.5-5.4 6.5-10V10L16 7z" fill="#fff"/></svg></span>' +
      '<div><strong>MS Consultoria</strong><div class="rel-doc__sub">Saúde e Segurança do Trabalho</div></div>' +
      '<span class="status ' + statusFiscalizacao(f) + '" style="margin-left:auto">' + esc(f.status) + "</span>" +
      "</div>" +

      '<h2 class="rel-doc__title">Relatório de Fiscalização</h2>' +

      '<div class="rel-doc__grid">' +
      relField("Cliente", nomeCliente(f)) +
      relField("Obra", nomeObra(f)) +
      relField("Data", fmtDate(f.data)) +
      relField("Responsável", f.responsavel) +
      relField("Tipo", f.tipo) +
      relField("Documento", "REL-" + f.id.toUpperCase() + "-2026") +
      "</div>" +

      '<h3 class="rel-doc__h">Resumo</h3>' +
      '<div class="rel-resumo">' +
      '<div class="rel-resumo__i"><span class="rel-resumo__n">' + c.total + '</span><span class="rel-resumo__l">itens verificados</span></div>' +
      '<div class="rel-resumo__i rel-resumo__i--ok"><span class="rel-resumo__n">' + c.conformes + '</span><span class="rel-resumo__l">conformes</span></div>' +
      '<div class="rel-resumo__i rel-resumo__i--nc"><span class="rel-resumo__n">' + c.nc + '</span><span class="rel-resumo__l">não conformes</span></div>' +
      '<div class="rel-resumo__i rel-resumo__i--venc"><span class="rel-resumo__n">' + venc.length + '</span><span class="rel-resumo__l">vencimento próximo</span></div>' +
      "</div>" +

      '<h3 class="rel-doc__h">Itens inspecionados</h3>' +
      '<div class="rel-grupos">' + Object.keys(porGrupo).map(function (g) {
        return '<div class="rel-grupo"><div class="rel-grupo__nome">' + esc(g) + "</div>" +
          porGrupo[g].map(function (it) {
            var s = situacaoInfo(it.situacao);
            return '<div class="rel-item">' +
              '<span class="status ' + s.cls + ' rel-item__sit">' + s.nome + "</span>" +
              '<div class="rel-item__body"><strong>' + esc(it.titulo) + "</strong>" +
              (it.validade ? '<span class="rel-item__meta">Validade ' + fmtDate(it.validade) + " · " + MS.vencTexto(it.validade) + "</span>" : "") +
              (it.estado ? '<span class="rel-item__meta">Estado: ' + esc(it.estado) + "</span>" : "") +
              (it.qtd != null ? '<span class="rel-item__meta">' + it.qtd + " verificados · " + (it.qtdOk || 0) + " conformes · " + (it.qtdNc || 0) + " não conformes</span>" : "") +
              (it.obs ? '<span class="rel-item__obs">“' + esc(it.obs) + '”</span>' : "") +
              ((it.fotos || []).length ? '<span class="rel-item__fotos">' + it.fotos.length + " evidência" + (it.fotos.length === 1 ? "" : "s") + "</span>" : "") +
              "</div></div>";
          }).join("") + "</div>";
      }).join("") + "</div>" +

      (nc.length ? '<h3 class="rel-doc__h">Não conformidades e plano de ação</h3>' +
        '<div class="rel-ncs">' + nc.map(function (it) {
          var n = it.nc;
          return '<div class="rel-nc"><div class="rel-nc__top"><strong>' + esc(it.titulo) + '</strong>' +
            '<span class="nivel ' + nivelClasse(n.nivel) + '">Risco ' + nivelNome(n.nivel) + "</span>" +
            '<span class="status ' + (n.status === "Corrigido" ? "status--concluido" : "status--pendente") + '">' + n.status + "</span></div>" +
            '<span class="rel-nc__v"><strong>Problema:</strong> ' + esc(n.problema) + "</span>" +
            '<span class="rel-nc__v"><strong>Ação:</strong> ' + esc(n.acao) + "</span>" +
            '<span class="rel-nc__v"><strong>Prazo:</strong> ' + (n.prazo ? fmtDate(n.prazo) : "—") + " · <strong>Responsável:</strong> " + esc(n.responsavel) + "</span>" +
            (n.correcao ? '<span class="rel-nc__v rel-nc__v--ok"><strong>Corrigido em ' + fmtDate(n.correcao.data) + ":</strong> " + esc(n.correcao.obs) + "</span>" : "") +
            "</div>";
        }).join("") + "</div>" : "") +

      '<h3 class="rel-doc__h">Observações gerais</h3>' +
      '<p class="rel-doc__p">' + esc(f.obsGerais) + "</p>" +

      '<div class="rel-doc__assin">' +
      '<div class="rel-doc__sign"><span class="rel-doc__line"></span><span>Assinatura da responsável técnica<br/><strong>' + esc(f.responsavel) + "</strong></span></div>" +
      '<div class="rel-doc__sign"><span class="rel-doc__line"></span><span>Ciência do cliente<br/><strong>' + esc(nomeCliente(f)) + "</strong></span></div>" +
      "</div>" +
      "</div>" +

      '<div class="card rv rel-acoes">' +
      '<button class="btn btn--primary btn--sm" data-action="rel-pdf">Visualizar relatório</button>' +
      '<button class="btn btn--light btn--sm" data-action="rel-pdf">Gerar PDF</button>' +
      '<button class="btn btn--light btn--sm" data-action="rel-share">Compartilhar</button>' +
      '<span class="rel-acoes__nota">Geração de PDF e compartilhamento são <strong>demonstração visual</strong> nesta etapa.</span>' +
      "</div>"
    );
  }

  function relField(label, valor) {
    return '<div class="rel-field"><span class="rel-field__l">' + label + '</span><span class="rel-field__v">' + esc(valor) + "</span></div>";
  }

  /* ======================================================================
     7. MODAIS
     ====================================================================== */

  // ---- Nova fiscalização (Etapa 1 — identificação) ----
  MS.actions["nova-fiscalizacao"] = function () { openNovaFiscalizacao(); };

  function openNovaFiscalizacao() {
    var tipos = tiposDisponiveis().map(function (t) { return t[0]; }).concat(["Inspeção de EPCs", "Inspeção de Veículos", "Inspeção de Sinalização"]);
    var tiposUnicos = tipos.filter(function (t, i) { return tipos.indexOf(t) === i; });

    MS.openModal(
      MS.modalHeader("+ Nova fiscalização") +
      '<div class="modal__body">' +
      '<div class="wizard-steps">' +
      '<span class="wstep is-on">1. Identificação</span><span class="wstep">2. Checklist</span><span class="wstep">3. Relatório</span>' +
      "</div>" +
      '<p class="modal__hint">Toda fiscalização fica vinculada a um <strong>cliente</strong> e a uma <strong>obra</strong>. ' +
      "Um cliente pode ter várias obras — cada obra mantém suas próprias fiscalizações.</p>" +
      '<div class="form-grid">' +
      '<label class="field"><span class="field__label">Cliente</span>' +
      '<select class="field__input" id="nf-cliente">' +
      MS.CLIENTES.map(function (c, i) { return '<option value="' + c.id + '"' + (i === 0 ? " selected" : "") + ">" + esc(c.nome) + " · " + c.obras.length + " obra(s)</option>"; }).join("") +
      "</select></label>" +

      '<label class="field"><span class="field__label">Obra</span>' +
      '<select class="field__input" id="nf-obra"></select></label>' +
      '<button type="button" class="btn btn--ghost btn--sm" data-action="nova-obra-da-fiscalizacao" style="justify-self:start">+ Cadastrar nova obra</button>' +

      '<label class="field"><span class="field__label">Tipo da fiscalização</span>' +
      '<select class="field__input" id="nf-tipo">' +
      tiposUnicos.map(function (t) { return '<option>' + esc(t) + "</option>"; }).join("") +
      "</select></label>" +

      '<div class="form-row-2">' +
      '<label class="field"><span class="field__label">Data</span><input class="field__input" id="nf-data" value="18/09/2026" /></label>' +
      '<label class="field"><span class="field__label">Responsável</span><select class="field__input" id="nf-resp">' +
      MS.EQUIPE.map(function (e) { return "<option>" + esc(e.nome) + "</option>"; }).join("") + "</select></label>" +
      "</div>" +

      '<label class="field"><span class="field__label">Observações gerais</span>' +
      '<textarea class="field__input" id="nf-obs" placeholder="Contexto da inspeção, escopo, áreas vistoriadas…"></textarea></label>' +

      '<div class="card" style="padding:12px 14px;background:var(--green-50);border-color:var(--green-100);font-size:.84rem">' +
      "Ao continuar, o checklist é criado a partir do <strong>tipo da fiscalização</strong> escolhido. " +
      "Você pode <strong>adicionar itens de inspeção</strong> a qualquer momento." +
      "</div>" +
      "</div></div>" +
      '<div class="modal__foot">' +
      '<button class="btn btn--light" data-modal-close>Cancelar</button>' +
      '<button class="btn btn--primary" data-modal-action="criar-checklist">Continuar para checklist</button>' +
      "</div>"
    );

    var selCliente = document.getElementById("nf-cliente");
    var selObra = document.getElementById("nf-obra");
    function preencherObras() {
      var c = MS.CLIENTES.filter(function (x) { return x.id === selCliente.value; })[0];
      selObra.innerHTML = c.obras.map(function (o) { return '<option value="' + o.id + '">' + esc(o.nome) + " — " + esc(o.local) + "</option>"; }).join("");
    }
    preencherObras();
    selCliente.addEventListener("change", preencherObras);
  }

  MS.actions["nova-obra-da-fiscalizacao"] = function () {
    var cid = document.getElementById("nf-cliente").value;
    var c = MS.CLIENTES.filter(function (x) { return x.id === cid; })[0];
    MS.openModal(
      MS.modalHeader("+ Nova obra") +
      '<div class="modal__body">' +
      '<div class="card" style="margin-bottom:14px;padding:12px 14px;background:var(--green-50);border-color:var(--green-100)"><strong style="font-size:.88rem">Cliente:</strong> ' + esc(c.nome) + "</div>" +
      '<div class="form-grid">' +
      '<label class="field"><span class="field__label">Nome da obra</span><input class="field__input" id="no-nome" value="Nova Obra — Recife" /></label>' +
      '<div class="form-row-2">' +
      '<label class="field"><span class="field__label">Localização</span><input class="field__input" id="no-local" value="Recife — PE" /></label>' +
      '<label class="field"><span class="field__label">Status</span><select class="field__input"><option>Em andamento</option><option>Pendente</option></select></label>' +
      "</div>" +
      '<label class="field"><span class="field__label">Responsável MS</span><select class="field__input">' + MS.EQUIPE.map(function (e) { return "<option>" + esc(e.nome) + "</option>"; }).join("") + "</select></label>" +
      "</div></div>" +
      '<div class="modal__foot"><button class="btn btn--light" data-modal-close>Cancelar</button>' +
      '<button class="btn btn--primary" data-modal-action="salvar-obra-fisc">Salvar obra</button></div>'
    );
  };

  MS.actions["salvar-obra-fisc"] = function () {
    var nome = (document.getElementById("no-nome") || {}).value || "Nova Obra";
    var local = (document.getElementById("no-local") || {}).value || "Recife — PE";
    var cid = document.getElementById("nf-cliente").value;
    var c = MS.CLIENTES.filter(function (x) { return x.id === cid; })[0];
    var novoId = "onovo" + (c.obras.length + 1) + c.id;
    c.obras.push({
      id: novoId, nome: nome, local: local, status: "Em andamento",
      responsavel: "Maria Silva", inicio: "18/09/2026", previsao: "—", progresso: 0,
      resumo: "Obra cadastrada durante a demonstração. O cadastro único do cliente é mantido — a obra apenas se vincula a ele.",
      servicos: []
    });
    MS.closeModal();
    openNovaFiscalizacao();
    var sel = document.getElementById("nf-obra");
    if (sel) sel.value = novoId;
    MS.showToast("Obra cadastrada e vinculada ao cliente " + c.nome + ". O cadastro do cliente não foi duplicado.");
  };

  MS.actions["criar-checklist"] = function () {
    var cid = document.getElementById("nf-cliente").value;
    var oid = document.getElementById("nf-obra").value;
    var tipo = document.getElementById("nf-tipo").value;
    var resp = document.getElementById("nf-resp").value;
    var obs = (document.getElementById("nf-obs") || {}).value || "";
    var dataTxt = (document.getElementById("nf-data") || {}).value || "18/09/2026";

    var partes = dataTxt.split("/");
    var data = new Date(Number(partes[2]), Number(partes[1]) - 1, Number(partes[0]), 9, 0);
    if (isNaN(data.getTime())) data = MS.NOW;

    var nova = {
      id: "f" + (FISCALIZACOES.length + 1) + "n",
      tipo: tipo,
      clienteId: cid,
      obraId: oid,
      data: data,
      responsavel: resp,
      status: "Em andamento",
      obsGerais: obs || "Fiscalização criada na demonstração — checklist gerado a partir do tipo selecionado.",
      itens: templateDoTipo(tipo)
    };
    FISCALIZACOES.push(nova);
    MS.closeModal();
    MS.showToast("Checklist criado com " + nova.itens.length + " itens. Registre a situação de cada um.");
    location.hash = "#/fiscalizacao/" + nova.id + "/checklist";
  };

  // Checklist inicial sugerido por tipo de fiscalização.
  function templateDoTipo(tipo) {
    var t = tipo.toLowerCase();
    if (t.indexOf("extintor") >= 0) {
      return [
        item("extintor", "Extintor — Térreo", null, { validade: MS.addDays(MS.NOW, 90), estado: "Bom" }),
        item("extintor", "Extintor — 1º pavimento", null, { validade: MS.addDays(MS.NOW, 90), estado: "Bom" }),
        item("extintor", "Extintor — Área externa", null, { validade: MS.addDays(MS.NOW, 90), estado: "Bom" }),
        item("sinalizacao", "Sinalização dos extintores", null, {}),
        item("documentacao", "Fichas de inspeção dos extintores", null, { validade: MS.addDays(MS.NOW, 365) })
      ];
    }
    if (t.indexOf("epi") >= 0) {
      return [
        item("capacete", "Capacetes da equipe", null, { qtd: 0, qtdOk: 0, qtdNc: 0 }),
        item("epi", "EPI — Proteção auditiva", null, { validade: MS.addDays(MS.NOW, 180), estado: "Bom" }),
        item("epi", "EPI — Proteção ocular", null, { validade: MS.addDays(MS.NOW, 180), estado: "Bom" }),
        item("epi", "EPI — Luvas de proteção", null, { estado: "Bom" }),
        item("epi", "EPI — Calçado de segurança", null, { validade: MS.addDays(MS.NOW, 180), estado: "Bom" }),
        item("documentacao", "Fichas de entrega de EPI", null, { validade: MS.addDays(MS.NOW, 365) })
      ];
    }
    if (t.indexOf("cinto") >= 0 || t.indexOf("veículo") >= 0 || t.indexOf("veiculo") >= 0) {
      return [
        item("cinto-seguranca", "Cinto de segurança — Equipamento 01", null, { equipamento: "Equipamento 01", estado: "Bom" }),
        item("cinto-seguranca", "Cinto de segurança — Equipamento 02", null, { equipamento: "Equipamento 02", estado: "Bom" }),
        item("bancos-assentos", "Bancos e assentos", null, { qtd: 0, qtdOk: 0, qtdNc: 0 }),
        item("veiculo", "Veículo — documentação e condições", null, { validade: MS.addDays(MS.NOW, 120), estado: "Bom" })
      ];
    }
    if (t.indexOf("epc") >= 0 || t.indexOf("altura") >= 0) {
      return [
        item("epc", "EPC — Guarda-corpo", null, { estado: "Bom" }),
        item("epc", "EPC — Proteção de aberturas", null, { estado: "Bom" }),
        item("cinto-paraquedista", "Cinto paraquedista e trava-quedas", null, { validade: MS.addDays(MS.NOW, 180), estado: "Bom" }),
        item("documentacao", "Análise de Risco e Permissão de Trabalho", null, { validade: MS.addDays(MS.NOW, 90) })
      ];
    }
    if (t.indexOf("máquina") >= 0 || t.indexOf("maquina") >= 0) {
      return [
        item("maquina", "Máquina — proteções fixas", null, { estado: "Bom" }),
        item("maquina", "Máquina — dispositivos de emergência", null, { estado: "Bom" }),
        item("sinalizacao", "Sinalização de máquinas (NR-12)", null, {}),
        item("documentacao", "Inventário de máquinas e manuais", null, { validade: MS.addDays(MS.NOW, 365) })
      ];
    }
    if (t.indexOf("documenta") >= 0) {
      return [
        item("documentacao", "PGR — Programa de Gerenciamento de Riscos", null, { validade: MS.addDays(MS.NOW, 120) }),
        item("documentacao", "PCMSO — Programa de Controle Médico", null, { validade: MS.addDays(MS.NOW, 120) }),
        item("documentacao", "ASO dos colaboradores", null, { validade: MS.addDays(MS.NOW, 120) }),
        item("documentacao", "Ordens de serviço assinadas", null, { validade: MS.addDays(MS.NOW, 240) }),
        item("documentacao", "Certificados de treinamento NR", null, { validade: MS.addDays(MS.NOW, 240) })
      ];
    }
    // Inspeção geral (padrão)
    return [
      item("extintor", "Extintor — Área principal", null, { validade: MS.addDays(MS.NOW, 90), estado: "Bom" }),
      item("extintor", "Extintor — Área secundária", null, { validade: MS.addDays(MS.NOW, 90), estado: "Bom" }),
      item("capacete", "Capacetes da equipe", null, { qtd: 0, qtdOk: 0, qtdNc: 0 }),
      item("epi", "EPIs da equipe", null, { validade: MS.addDays(MS.NOW, 180), estado: "Bom" }),
      item("epc", "EPCs — proteções coletivas", null, { estado: "Bom" }),
      item("sinalizacao", "Sinalização de segurança", null, {}),
      item("condicoes-seguranca", "Condições gerais de segurança", null, {}),
      item("documentacao", "Documentação de SST", null, { validade: MS.addDays(MS.NOW, 240) })
    ];
  }

  // ---- Adicionar item de inspeção ao catálogo/checklist ----
  MS.actions["add-item-inspecao"] = function () {
    var f = MS.state.fiscalizacaoAtual;
    MS.openModal(
      MS.modalHeader("+ Adicionar item de inspeção") +
      '<div class="modal__body">' +
      '<p class="modal__hint">O checklist <strong>não é uma lista fechada</strong>. Cadastre aqui qualquer novo tipo de item ' +
      "que a MS precisar fiscalizar — ele passa a ficar disponível no catálogo de itens de inspeção.</p>" +
      '<div class="form-grid">' +
      '<label class="field"><span class="field__label">Nome do item</span><input class="field__input" id="ai-nome" placeholder="Ex.: Escada extensível, Bandeja de contenção, Chuveiro de emergência…" /></label>' +
      '<div class="form-row-2">' +
      '<label class="field"><span class="field__label">Grupo</span><input class="field__input" id="ai-grupo" value="Outros" /></label>' +
      '<label class="field"><span class="field__label">Tem data de validade?</span><select class="field__input" id="ai-validade"><option>Não</option><option>Sim</option></select></label>' +
      "</div>" +
      '<div class="form-row-2">' +
      '<label class="field"><span class="field__label">Tem estado de conservação?</span><select class="field__input" id="ai-estado"><option>Sim</option><option>Não</option></select></label>' +
      '<label class="field"><span class="field__label">Tem quantidade verificada?</span><select class="field__input" id="ai-qtd"><option>Não</option><option>Sim</option></select></label>' +
      "</div>" +
      '<label class="field"><span class="field__label">Observação inicial</span><textarea class="field__input" id="ai-obs" placeholder="Opcional"></textarea></label>' +
      '<div class="card" style="padding:12px 14px;background:var(--green-50);border-color:var(--green-100);font-size:.84rem">' +
      "O item será adicionado <strong>a esta fiscalização</strong> e ao <strong>catálogo</strong> para uso nas próximas inspeções." +
      "</div></div></div>" +
      '<div class="modal__foot"><button class="btn btn--light" data-modal-close>Cancelar</button>' +
      '<button class="btn btn--primary" data-modal-action="salvar-item-inspecao">Adicionar item</button></div>'
    );
  };

  MS.actions["salvar-item-inspecao"] = function () {
    var f = MS.state.fiscalizacaoAtual;
    var nome = ((document.getElementById("ai-nome") || {}).value || "").trim();
    if (!nome) { MS.showToast("Informe o nome do item de inspeção."); return; }
    var grupo = ((document.getElementById("ai-grupo") || {}).value || "Outros").trim() || "Outros";
    var temVal = document.getElementById("ai-validade").value === "Sim";
    var temEst = document.getElementById("ai-estado").value === "Sim";
    var temQtd = document.getElementById("ai-qtd").value === "Sim";
    var obs = (document.getElementById("ai-obs") || {}).value || "";

    var novoCat = { id: "custom-" + Date.now(), nome: nome, grupo: grupo, validade: temVal, estado: temEst, quantidade: temQtd, custom: true };
    CATALOGO_ITENS.push(novoCat);

    if (f) {
      var novo = item(novoCat.id, nome, null, { obs: obs, estado: temEst ? "Bom" : "", validade: temVal ? MS.addDays(MS.NOW, 180) : null });
      novo.grupo = grupo;
      novo.titulo = nome;
      novo.qtd = temQtd ? 0 : null;
      novo.qtdOk = temQtd ? 0 : null;
      novo.qtdNc = temQtd ? 0 : null;
      f.itens.push(novo);
    }
    MS.closeModal();
    MS.showToast('Item "' + nome + '" adicionado ao checklist e ao catálogo de inspeção.');
    MS.rerender();
  };

  // ---- Adicionar evidência (foto) ----
  MS.actions["add-evidencia"] = function (el) {
    var f = MS.state.fiscalizacaoAtual;
    var fiscId = (el && el.getAttribute && el.getAttribute("data-fisc")) || (f && f.id);
    var itemId = (el && el.getAttribute && el.getAttribute("data-item")) || "";
    var f2 = FISCALIZACOES.filter(function (x) { return x.id === fiscId; })[0] || f;
    if (!f2) return;

    MS.openModal(
      MS.modalHeader("+ Adicionar foto / evidência") +
      '<div class="modal__body">' +
      '<div class="upload-zone" data-demo-upload>' +
      '<div class="upload-zone__icon">📷</div>' +
      '<div class="upload-zone__title">Foto do item inspecionado</div>' +
      '<div class="upload-zone__sub">Arraste, toque para escolher — ou use a câmera durante a inspeção (demo)</div>' +
      "</div>" +
      '<div class="upload-hint">' +
      "<strong>Nesta demonstração o envio é apenas visual.</strong> Nenhum arquivo é enviado a servidor. " +
      "Na versão final o registro será feito pelo celular, inclusive com a <strong>câmera na obra</strong>." +
      "</div>" +
      '<div class="form-grid" style="margin-top:16px">' +
      '<label class="field"><span class="field__label">Item inspecionado</span><select class="field__input" id="ev-item">' +
      f2.itens.map(function (it) {
        return '<option value="' + it.id + '"' + (it.id === itemId ? " selected" : "") + ">" + esc(it.titulo) + "</option>";
      }).join("") + "</select></label>" +
      '<label class="field"><span class="field__label">Descrição da evidência</span>' +
      '<textarea class="field__input" id="ev-obs" placeholder="Ex.: Capacete com desgaste na carcaça — recolhido da operação."></textarea></label>' +
      '<div class="form-row-2">' +
      '<label class="field"><span class="field__label">Cliente</span><input class="field__input" value="' + esc(nomeCliente(f2)) + '" disabled /></label>' +
      '<label class="field"><span class="field__label">Obra</span><input class="field__input" value="' + esc(nomeObra(f2)) + '" disabled /></label>' +
      "</div>" +
      '<div class="form-row-2">' +
      '<label class="field"><span class="field__label">Fiscalização</span><input class="field__input" value="' + esc(f2.tipo) + '" disabled /></label>' +
      '<label class="field"><span class="field__label">Data/hora</span><input class="field__input" value="Automática — 18/09/2026 16:42" disabled /></label>' +
      "</div>" +
      "</div></div>" +
      '<div class="modal__foot"><button class="btn btn--light" data-modal-close>Cancelar</button>' +
      '<button class="btn btn--primary" data-modal-action="salvar-evidencia">Salvar evidência</button></div>'
    );
  };

  MS.actions["salvar-evidencia"] = function () {
    var f = MS.state.fiscalizacaoAtual;
    if (!f) { MS.closeModal(); return; }
    var itemId = document.getElementById("ev-item").value;
    var obs = ((document.getElementById("ev-obs") || {}).value || "").trim() || "Evidência registrada durante a inspeção.";
    var it = f.itens.filter(function (x) { return x.id === itemId; })[0];
    if (!it) { MS.closeModal(); return; }
    if (!it.fotos) it.fotos = [];
    it.fotos.push(fotoRef("ev-" + (2000 + Math.floor(Math.random() * 7000)), obs, MS.NOW));
    MS.closeModal();
    MS.showToast("Evidência vinculada à obra, à fiscalização e ao item inspecionado.");
    MS.rerender();
  };

  // ---- Marcar não conformidade como corrigida ----
  MS.actions["marcar-corrigido"] = function (el) {
    var f = FISCALIZACOES.filter(function (x) { return x.id === el.getAttribute("data-fisc"); })[0];
    if (!f) return;
    var it = f.itens.filter(function (x) { return x.id === el.getAttribute("data-item"); })[0];
    if (!it || !it.nc) return;
    MS.openModal(
      MS.modalHeader("Marcar como corrigido") +
      '<div class="modal__body">' +
      '<div class="card" style="margin-bottom:14px;padding:14px 16px;background:var(--red-100);border-color:#f3cfc9">' +
      '<strong style="font-size:.88rem;color:var(--red-500)">Problema</strong>' +
      '<p style="font-size:.9rem;margin-top:4px;color:var(--grey-700)">' + esc(it.nc.problema) + "</p></div>" +
      '<div class="form-grid">' +
      '<div class="form-row-2">' +
      '<label class="field"><span class="field__label">Data da correção</span><input class="field__input" id="mc-data" value="18/09/2026" /></label>' +
      '<label class="field"><span class="field__label">Responsável pela correção</span><input class="field__input" id="mc-resp" value="' + esc(it.nc.responsavel) + '" /></label>' +
      "</div>" +
      '<label class="field"><span class="field__label">Observação da correção</span>' +
      '<textarea class="field__input" id="mc-obs" placeholder="Descreva o que foi feito para corrigir…">Item corrigido e conferido em campo pela fiscalização.</textarea></label>' +
      '<div class="upload-zone" data-demo-upload><div class="upload-zone__icon">📷</div>' +
      '<div class="upload-zone__title">Foto depois da correção</div>' +
      '<div class="upload-zone__sub">Registra o resultado — composição ANTES → DEPOIS (demo)</div></div>' +
      "</div></div>" +
      '<div class="modal__foot"><button class="btn btn--light" data-modal-close>Cancelar</button>' +
      '<button class="btn btn--primary" data-modal-action="salvar-correcao">Confirmar correção</button></div>'
    );
    MS.state.correcaoItem = it;
  };

  MS.actions["salvar-correcao"] = function () {
    var it = MS.state.correcaoItem;
    if (!it || !it.nc) { MS.closeModal(); return; }
    var dataTxt = (document.getElementById("mc-data") || {}).value || "18/09/2026";
    var partes = dataTxt.split("/");
    var d = new Date(Number(partes[2]), Number(partes[1]) - 1, Number(partes[0]));
    if (isNaN(d.getTime())) d = MS.NOW;
    it.nc.status = "Corrigido";
    it.nc.correcao = {
      data: d,
      obs: ((document.getElementById("mc-obs") || {}).value || "").trim() || "Corrigido e conferido em campo.",
      responsavel: (document.getElementById("mc-resp") || {}).value || it.nc.responsavel
    };
    // A evidência "depois" entra no mesmo item, formando o par ANTES → DEPOIS.
    if (!it.fotos) it.fotos = [];
    it.fotos.push(fotoRef("ev-" + (3000 + Math.floor(Math.random() * 6000)), "Depois da correção — " + it.nc.correcao.obs, d));
    MS.closeModal();
    MS.showToast("Não conformidade marcada como corrigida. O par antes → depois ficou registrado.");
    MS.rerender();
  };

  // ---- Finalizar fiscalização (mostra o relatório) ----
  MS.actions["finalizar-fiscalizacao"] = function () {
    var f = MS.state.fiscalizacaoAtual;
    if (!f) return;
    var c = contarItens(f);
    if (c.pendentes > 0) {
      MS.openModal(
        MS.modalHeader("Finalizar fiscalização") +
        '<div class="modal__body">' +
        '<div class="card" style="padding:14px 16px;background:#fdf3e0;border-color:#f7e3c4;font-size:.88rem;color:var(--grey-700);margin-bottom:14px">' +
        "<strong>Existem " + c.pendentes + " não conformidade(s) aguardando correção.</strong> " +
        "O relatório pode ser finalizado assim mesmo — as pendências ficam registradas no plano de ação.</div>" +
        '<div class="rel-resumo">' +
        '<div class="rel-resumo__i"><span class="rel-resumo__n">' + c.total + '</span><span class="rel-resumo__l">itens</span></div>' +
        '<div class="rel-resumo__i rel-resumo__i--ok"><span class="rel-resumo__n">' + c.conformes + '</span><span class="rel-resumo__l">conformes</span></div>' +
        '<div class="rel-resumo__i rel-resumo__i--nc"><span class="rel-resumo__n">' + c.nc + '</span><span class="rel-resumo__l">não conformes</span></div>' +
        "</div></div>" +
        '<div class="modal__foot"><button class="btn btn--light" data-modal-close>Revisar checklist</button>' +
        '<button class="btn btn--primary" data-modal-action="confirmar-final">Finalizar e ver relatório</button></div>'
      );
      return;
    }
    confirmarFinal();
  };

  function confirmarFinal() {
    var f = MS.state.fiscalizacaoAtual;
    if (!f) { MS.closeModal(); return; }
    var c = contarItens(f);
    f.status = c.pendentes > 0 ? "Com pendências" : "Concluída";
    MS.closeModal();
    MS.showToast("Fiscalização finalizada. Relatório disponível para visualização e PDF.");
    location.hash = "#/fiscalizacao/" + f.id + "/relatorio";
    MS.rerender();
  }
  MS.actions["confirmar-final"] = confirmarFinal;

  // ---- Relatório: PDF e compartilhar (visual) ----
  MS.actions["rel-pdf"] = function () {
    var f = MS.state.fiscalizacaoAtual;
    MS.showToast("Geração de PDF do relatório de fiscalização — demonstração visual.");
    if (f) openRelatorioPreview(f);
  };
  MS.actions["rel-share"] = function () {
    MS.showToast("Compartilhamento do relatório — demonstração visual (versão final: e-mail/WhatsApp).");
  };

  function openRelatorioPreview(f) {
    var c = contarItens(f);
    MS.openModal(
      MS.modalHeader("Relatório de fiscalização — PDF (conceitual)") +
      '<div class="modal__body">' +
      '<div class="pdf-preview" style="background:#fff;border:1px solid var(--grey-200);border-radius:12px;padding:22px">' +
      '<div style="display:flex;align-items:center;gap:10px;border-bottom:2px solid var(--green-700);padding-bottom:12px">' +
      '<span class="brand__shield"><svg viewBox="0 0 32 32" width="30" height="30"><path d="M16 2 4 7v8c0 7 5 13 12 15 7-2 12-8 12-15V7L16 2z" fill="currentColor"/><path d="M16 7l-6.5 3v5.5c0 4.6 2.8 8.6 6.5 10 3.7-1.4 6.5-5.4 6.5-10V10L16 7z" fill="#fff"/></svg></span>' +
      '<div><strong style="color:var(--green-900)">MS Consultoria</strong><div style="font-size:.76rem;color:var(--grey-500)">Saúde e Segurança do Trabalho</div></div>' +
      '<span style="margin-left:auto" class="status ' + statusFiscalizacao(f) + '">' + esc(f.status) + "</span></div>" +
      '<div style="padding:14px 0;display:grid;gap:4px;font-size:.9rem">' +
      '<strong style="font-size:1.05rem;color:var(--green-900)">Relatório de Fiscalização</strong>' +
      "<span>" + esc(f.tipo) + "</span>" +
      "<span style='color:var(--grey-500)'>" + esc(nomeCliente(f)) + " · " + esc(nomeObra(f)) + " · " + fmtDate(f.data) + " · " + esc(f.responsavel) + "</span></div>" +
      '<div style="border-top:1px dashed var(--grey-200);padding:12px 0;font-size:.84rem;color:var(--grey-700)">' +
      "<strong style='color:var(--green-900)'>Resumo</strong><div style='margin-top:6px'>" +
      c.total + " itens verificados · " + c.conformes + " conformes · " + c.nc + " não conformes · " + c.pendentes + " pendências</div></div>" +
      '<div style="border-top:1px dashed var(--grey-200);padding:12px 0;font-size:.84rem;color:var(--grey-700)">' +
      "<strong style='color:var(--green-900)'>Itens inspecionados</strong><div style='margin-top:6px'>" +
      f.itens.slice(0, 5).map(function (it) {
        return "• " + esc(it.titulo) + " — " + situacaoInfo(it.situacao).nome;
      }).join("<br/>") +
      (f.itens.length > 5 ? "<br/>• + " + (f.itens.length - 5) + " outros itens" : "") + "</div></div>" +
      '<div style="border-top:1px dashed var(--grey-200);padding:12px 0;font-size:.84rem;color:var(--grey-700)">' +
      "<strong style='color:var(--green-900)'>Registro fotográfico</strong><div style='margin-top:8px;display:grid;grid-template-columns:repeat(3,1fr);gap:8px'>" +
      '<div class="photo-card__img" style="aspect-ratio:4/3;border-radius:8px"></div>'.repeat(Math.min(3, Math.max(1, totalFotos(f)))) +
      "</div></div>" +
      '<div style="border-top:1px solid var(--grey-200);padding:16px 0 0;display:flex;justify-content:space-between;font-size:.8rem;color:var(--grey-500)">' +
      '<span>Assinatura da responsável<br/><span style="display:inline-block;margin-top:24px;border-bottom:1px solid var(--grey-300);width:140px">&nbsp;</span></span>' +
      '<span class="status status--muted">PDF · A4</span></div>' +
      "</div>" +
      '<div class="card" style="margin-top:14px;padding:12px 14px;background:var(--green-50);border-color:var(--green-100);font-size:.84rem">' +
      "A geração real do PDF, com identidade, fotos e assinatura, será implementada na versão final.</div>" +
      "</div>" +
      '<div class="modal__foot"><button class="btn btn--light" data-modal-close>Fechar</button>' +
      '<button class="btn btn--primary" data-toast-action="Download do PDF disponível na versão final.">Baixar PDF (demo)</button></div>'
    );
  }

  // ---- Lightbox de evidência ----
  MS.actions["ver-evidencia"] = function (el) {
    var res = encontrarFoto(el.getAttribute("data-fisc"), el.getAttribute("data-item"), el.getAttribute("data-foto"));
    if (!res) return;
    var f = res.f, it = res.it, ft = res.ft;
    MS.openModal(
      MS.modalHeader("Evidência " + esc(ft.id)) +
      '<div class="modal__body">' +
      '<div class="evid-viewer"><span class="evid-viewer__num">' + esc(ft.id) + '</span><span class="evid-viewer__tag">Evidência demonstrativa</span></div>' +
      '<p class="evid-viewer__cap">“' + esc(ft.obs) + '”</p>' +
      '<div class="evid-meta">' +
      '<div><span class="nc-box__k">Cliente</span><span class="nc-box__v">' + esc(nomeCliente(f)) + "</span></div>" +
      '<div><span class="nc-box__k">Obra</span><span class="nc-box__v">' + esc(nomeObra(f)) + "</span></div>" +
      '<div><span class="nc-box__k">Fiscalização</span><span class="nc-box__v">' + esc(f.tipo) + "</span></div>" +
      '<div><span class="nc-box__k">Item inspecionado</span><span class="nc-box__v">' + esc(it.titulo) + "</span></div>" +
      '<div><span class="nc-box__k">Data</span><span class="nc-box__v">' + fmtDate(ft.data) + "</span></div>" +
      '<div><span class="nc-box__k">Situação do item</span><span class="nc-box__v">' + situacaoInfo(it.situacao).nome + "</span></div>" +
      "</div>" +
      '<div class="card" style="margin-top:14px;padding:12px 14px;background:var(--green-50);border-color:var(--green-100);font-size:.84rem">' +
      "Pré-visualização <strong>demonstrativa</strong>: a imagem real enviada aparecerá aqui. " +
      "O vínculo com cliente, obra, fiscalização, item, data e observação já está estruturado.</div>" +
      "</div>" +
      '<div class="modal__foot"><button class="btn btn--light" data-modal-close>Fechar</button>' +
      '<button class="btn btn--primary" data-toast-action="Download da evidência disponível na versão final.">Baixar</button></div>'
    );
  };

  /* ======================================================================
     8. REGISTRO DAS ROTAS E BINDINGS
     ====================================================================== */
  MS.registerRoute("fiscalizacoes", function () { renderLista(); });
  MS.registerRoute("fiscalizacao", function (parts) { renderDetalhe(parts); });

  // Botões de situação do checklist e visualização compacta (delegação).
  document.addEventListener("click", function (e) {
    var opt = e.target.closest ? e.target.closest("[data-chk-opt] .chk-opt__btn") : null;
    if (opt) {
      var f = MS.state.fiscalizacaoAtual;
      if (!f) return;
      var itemId = opt.getAttribute("data-item");
      var sit = opt.getAttribute("data-sit");
      var it = f.itens.filter(function (x) { return x.id === itemId; })[0];
      if (!it) return;
      it.situacao = sit;
      // Ao marcar "não conforme" sem plano de ação, cria um bloco inicial
      // (os campos detalhados ficam na aba Não conformidades).
      if (sit === "nao-conforme" && !it.nc) {
        it.nc = {
          problema: it.obs || "Não conformidade identificada na inspeção.",
          nivel: "medio",
          acao: "Corrigir e registrar evidência da correção.",
          prazo: MS.addDays(MS.NOW, 15),
          responsavel: nomeCliente(f),
          status: "Pendente"
        };
        it.correcao = null;
      }
      if (sit !== "nao-conforme") it.nc = null;
      MS.rerender();
      return;
    }

    // Foto/evidência → lightbox
    var ft = e.target.closest ? e.target.closest("[data-foto]") : null;
    if (ft && !ft.closest("[data-action]")) {
      MS.actions["ver-evidencia"](ft);
      return;
    }

    // Alternância cartões / compacta
    var view = e.target.closest ? e.target.closest("[data-chkview]") : null;
    if (view) {
      var modo = view.getAttribute("data-chkview");
      document.querySelectorAll("[data-chkview]").forEach(function (c) { c.classList.toggle("is-active", c === view); });
      var lista = document.getElementById("chk-list");
      if (lista) lista.classList.toggle("chk-list--compact", modo === "compacta");
      return;
    }

    // Zona de upload demonstrativa
    var up = e.target.closest ? e.target.closest("[data-demo-upload]") : null;
    if (up) {
      up.classList.add("is-loading");
      MS.showToast("Envio de arquivo demonstrativo — nenhum arquivo é enviado nesta etapa.");
      setTimeout(function () { up.classList.remove("is-loading"); }, 1200);
    }
  });

  // Observação de item do checklist (salva no dado demo ao sair do campo)
  document.addEventListener("change", function (e) {
    var t = e.target;
    if (!t || !t.getAttribute || !t.getAttribute("data-obs")) return;
    var f = MS.state.fiscalizacaoAtual;
    if (!f) return;
    var it = f.itens.filter(function (x) { return x.id === t.getAttribute("data-obs"); })[0];
    if (it) it.obs = t.value;
  });

  // Exposição para inspeção da demonstração
  window.MS_FISCALIZACOES = {
    FISCALIZACOES: FISCALIZACOES,
    CATALOGO_ITENS: CATALOGO_ITENS,
    indicadores: indicadores,
    contarItens: contarItens,
    vencimentosProximos: vencimentosProximos,
    todasNC: todasNC,
    renderLista: renderLista
  };
})();
