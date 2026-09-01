# Auditoria & Plano — MS Consultoria SST
### Apresentação Institucional Premium (Etapa 1 — Website Público)

Data: 26/08/2026
Escopo: Somente auditoria e planejamento. Nenhum arquivo foi alterado, nenhuma implementação foi feita.
Status: **Aguardando autorização para implementar.**

---

## A — DIAGNÓSTICO ATUAL

**Projeto (pasta de trabalho `MS Consultoria SST`):**
- Contém apenas a subpasta `Sobre a empresa/` com 10 prints da página atual, e `desktop.ini`.
- Não existe ainda nenhum código, build, componente ou estrutura de projeto.
- É um ponto de partida limpo: todo o website institucional será criado do zero.

**Website atual (`ms-segura-web.lovable.app`):**
- É uma landing page institucional de página única, construída em Lovable (editor no-code).
- Estrutura vertical padrão: Hero → Quem Somos → Valores/Princípios → Por que contratar → Serviços → Treinamentos → Depoimentos → Contato → Rodapé.
- Não tem área administrativa, portal do cliente, login, banco de dados nem módulos de SST. É essencialmente uma página comercial estática.
- Acesso ao site pelo sandbox foi bloqueado por política de rede; todo o conteúdo foi extraído com fidelidade a partir dos 10 prints fornecidos.

**Pontos de atenção identificados:**
- As estatísticas "21 soluções" e "1150" aparecem na seção Quem Somos, mas os valores exatos não são legíveis com certeza nos prints. **Não devem ser exibidos sem confirmação.**
- Não há CNPJ, telefone fixo, endereço de rua completo, redes sociais confirmadas (apenas Instagram `@msconsultoria24`), nem dados de anos de mercado ou nº de clientes nas fontes. **Nada disso será inventado.**
- Não há arquivo de logo separado — a marca é tipográfica ("MS Consultoria / Saúde e Segurança do Trabalho").

---

## B — CONTEÚDO EXTRAÍDO

### Identidade e marca
- **Nome:** MS Consultoria — Saúde e Segurança do Trabalho
- **Slogan:** "Soluções completas para ambientes de trabalho mais seguros, em conformidade com a legislação e com foco no cuidado com as pessoas."

### Contatos reais
- **Telefone/WhatsApp:** (81) 97304-7000
- **E-mail:** msconsultoria24@gmail.com
- **Endereço:** Recife - PE
- **Instagram:** @msconsultoria24

### Navegação atual
Início · Quem Somos · Serviços · Treinamentos · Blog · Contato

### Textos por seção
1. **Hero** — "CONSULTORIA ESPECIALIZADA" / "MS Consultoria em Saúde e Segurança do Trabalho" / slogan. CTAs: **Solicitar Orçamento** e **Falar pelo WhatsApp**.
2. **Quem Somos** — "MS CONSULTORIA é uma empresa especializada em Saúde e Segurança do Trabalho, dedicada a promover ambientes laborais mais seguros, saudáveis e em conformidade com a legislação vigente."
3. **Valores (3 cards)** — Prevenção de acidentes ("Proteção à vida e à integridade física dos colaboradores"); Conformidade legal ("Atendimento às normas e legislações vigentes"); Parceria estratégica ("Foco em resultados e crescimento sustentável").
4. **Nossos Princípios** —
   - **Missão:** "Promover excelência em Saúde e Segurança do Trabalho com ética e responsabilidade."
   - **Visão:** "Causar impacto positivo na vida dos colaboradores e realizar parcerias baseadas na confiança e na entrega de resultados."
   - **Valores:** "Excelência técnica, comprometimento, prevenção e conformidade legal."
5. **Por que contratar? (vantagens)** — Prevenção de acidentes e redução de afastamentos; Conformidade legal e redução de multas; Otimização de custos com gestão de riscos. Apoio: "Descubra como a MS Consultoria pode transformar a gestão de SST da sua empresa." Complementares: **Valorização da marca e cuidado com as pessoas** e **Apoio técnico contínuo para tomada de decisão** (textos completos no relatório).
6. **Serviços (8)** — descrições completas em D.
7. **Treinamentos (10)** — NR 06 (EPI), NR 10 (Instalações Elétricas), NR 11 (Empilhadeiras), NR 12 (Máquinas e Equipamentos), NR 18 (Construção Civil), NR 33 (Espaços Confinados), NR 35 (Trabalho em Altura), Comportamentais e SIPAT, Primeiros Socorros e Brigada de Incêndio, Direção Defensiva e Preventiva.
8. **Depoimentos (3)** — Carlos Mendes (Diretor Administrativo, Construtora Norte Sul), Roberto Ferreira (Gerente de RH, Indústria Recife Metal), Ana Paula Silva (Proprietária, Transportadora Pernambuco Express).
9. **Contato** — "Entre em contato — Fale com a MS Consultoria. Solicite um orçamento ou tire suas dúvidas. Nossa equipe está pronta para ajudar sua empresa a se adequar às normas de SST."
10. **Rodapé** — logo tipográfica, menu, contatos e redes.

---

## C — IDENTIDADE VISUAL

- **Cores dominantes (extraídas por análise de pixels dos prints):**
  - Verde institucional escuro: ~`#106030` / `#207040` (hero e acentos)
  - Verde-claro de apoio: ~`#d0f0d0` / `#e0f0e0`
  - Fundo claro: ~`#f0f0f0` (off-white)
  - Texto cinza-escuro: ~`#202020` / `#303030`
- **Tipografia:** sans-serif moderna, títulos em peso alto, corpo limpo (fonte exata não confirmável nos prints; será adotada uma sans premium, ex. família Inter/Geist/Space Grotesk, com boa legibilidade).
- **Estilo:** institucional clean; cards brancos com sombra suave; botões verdes sólidos; seções alternando fundos claro/verde-suave; visual de indústria e segurança do trabalho no hero.
- **Logo:** tipográfica ("MS Consultoria — Saúde e Segurança do Trabalho"), sem arquivo de imagem separado.
- **Imagens:** fotografia de ambiente de trabalho/segurança no hero; ícones de serviços. Não há acervo próprio além dos prints.

**Direção de cor sugerida:** manter o verde institucional como cor-mãe e derivar uma paleta sofisticada (verdes profundos, tons de aço/cinza, acento de segurança — âmbar/caqui para destaques de alerta — e neutros quentes), preservando a marca.

---

## D — BIBLIOTECA (somente leitura — nada foi alterado)

Componentes e efeitos selecionados para adaptar no projeto da MS:

| # | Nome / Técnica | Localização | Função / Efeito | Uso pretendido |
|---|---|---|---|---|
| 1 | Smooth scroll Lenis | `Banco XP/dist/js/script.js` | Scroll suave cinematográfico | Base de navegação premium em toda a página |
| 2 | Scroll reveal GSAP ScrollTrigger | `Banco XP/dist/js/script.js` | Entrada de cards/títulos com stagger e scrub | Revelação de seções e cards de serviços |
| 3 | Blur-to-sharp reveal + scroll-driven CSS | `Banco XP/src/tailwind.css` | Textos e imagens entram desfocados→nítidos via `animation-timeline: view()` | Momentos de storytelling e cabeçalhos |
| 4 | Glowbox / borda gradiente animada | `Banco XP/src/tailwind.css` | Borda luminosa com conic-gradient girando | Cards de destaque e mockup do portal |
| 5 | Shaders WebGL fullscreen | `template-parallax` (Shaders pkg) | Fundo animado com shaders (Swirl/ChromaFlow) | Uso contido: fundo sutil de uma seção-chave |
| 6 | Scroll horizontal por seção | `template-parallax/app/page.tsx` | Roda-se vertical, seção avança na horizontal | Linha do processo / pilares de SST |
| 7 | Custom cursor + magnetic button + grain | `template-parallax/components` | Cursor com lerp, botões magnéticos, filme | Microinterações de sofisticação (desktop) |
| 8 | Dashboard preview flutuante | `template-IA/components/dashboard-preview.tsx` | Mockup de dashboard sobre a dobra | Seção "Futuro Digital" (Portal em breve) |
| 9 | Bento grid + animated-section (framer-motion) | `template-IA/components` | Cards glass com reveal; UIs mockadas | Grade de diferenciais e prévias do portal |
| 10 | Sticky header pill + sticky footer | `template-sass` | Header encolhe no scroll; footer só no fim | Header e rodapé da apresentação |
| 11 | Marquee infinito | `template-sass/ui/marquee.tsx` | Faixa em rolagem contínua | Faixa de pilares/NRs (ex.: NR06 · NR35 · PGR...) |
| 12 | Scroll-scrub frame-a-frame em canvas | `iron-man` (Next) e `logitech` (vanilla) | Seção sticky 400vh; frames trocam conforme scroll | **Momento 1:** narrativa visual dos riscos→prevenção |
| 13 | HUD/telemetria de filme + KPIs animados | `iron-man/components/ui` | Números grandes com entrada animada | Contadores e métricas de SST |
| 14 | Hero com vídeo de fundo | `agroeta` / `maryane` | Vídeo institucional + overlay | Abertura do hero (se houver vídeo) |
| 15 | KPIs + gráficos (dashboard) | `CMS-ECOMMERCE/pages/admin` | Métricas com variação %, ApexCharts, BRL | Conceito visual do futuro Portal do Cliente |
| 16 | Globo 3D (cobe) | `template-sass/ui/globe.tsx` | Globo interativo | Mapa de abrangência (opcional) |
| 17 | Before/After slider | `procoat/BeforeAfterSlider.tsx` | Comparação visual | "Antes x Depois" da gestão de SST |

> Nenhum arquivo da BIBLIOTECA foi editado, movido ou modificado. Apenas leitura e análise.

---

## E — NOVA EXPERIÊNCIA

Uma apresentação institucional premium em formato de website, com **direção de arte cinematográfica** — não um template vertical de "imagem + título + botão".

- **Tom:** empresarial, confiável, tecnológico e humano — ligado a indústria, prevenção e saúde ocupacional.
- **Narrativa de venda:** começa pela proteção das pessoas e da empresa, passa pela consultoria, serviços, conexão entre áreas de SST, diferenciais e termina na promessa do futuro digital.
- **Identidade:** paleta verde institucional sofisticada, tipografia premium, grids técnicos, linhas de engenharia, iluminação suave, profundidade.
- **Foco em pessoas + segurança + empresas + tecnologia + prevenção.**
- **Conteúdo real preservado** — nada de endereço/CNPJ/certificações inventadas.

---

## F — MAPA COMPLETO DA PÁGINA

1. **HERO** — título grande, subtítulo real, CTA "Solicitar Orçamento" + "Falar pelo WhatsApp", imagem/arte de segurança do trabalho, elementos técnicos flutuantes e indicadores.
2. **O PROBLEMA** — segurança do trabalho não é só burocracia: riscos, prazos, obrigações, documentos, exames, treinamentos (representação visual).
3. **A MS CONSULTORIA** — quem somos, posicionamento e princípios (Missão/Visão/Valores).
4. **SERVIÇOS** — os 8 serviços reais em cards com experiência individualizada.
5. **SST DE FORMA VISUAL** — fluxo conectado: Empresa → Colaboradores → Riscos → Prevenção → Documentação → Acompanhamento (animado no scroll).
6. **DIFERENCIAIS** — vantagens reais (prevenção, conformidade, custos, marca, apoio técnico).
7. **PROCESSO** — representação conceitual do atendimento (claramente visual, não oficial).
8. **PREVENÇÃO** — seção de forte apelo emocional sobre cuidado com pessoas.
9. **FUTURO DIGITAL** — mockup sofisticado do Portal do Cliente com indicação **"Em breve"** (sem alegar disponibilidade).
10. **CTA FINAL** — contatos reais + chamada forte.
11. **FOOTER** — informações reais reorganizadas profissionalmente.

---

## G — ANIMAÇÕES E SCROLL

Três momentos marcantes (os demais efeitos de apoio vêm da BIBLIOTECA):

- **MOMENTO 1 — Seção fixa (sticky) de transformação:** uma seção fica presa na tela enquanto o usuário rola; blocos de SST (riscos → exames → treinamentos → documentos → prevenção) mudam com scrub, estilo "frame-a-frame" (adaptado de iron-man/logitech).
- **MOMENTO 2 — Linha/processo animado:** um caminho conecta os pilares Empresa → Colaboradores → Riscos → Prevenção → Documentação → Acompanhamento, desenhado conforme o scroll (adaptado do scroll horizontal + timeline GSAP).
- **MOMENTO 3 — Transição para o futuro:** a interface se transforma visualmente no conceito do Portal do Cliente (dashboard mockup flutuante "Em breve", adaptado do dashboard-preview da BIBLIOTECA).

Efeitos de apoio com equilíbrio: smooth scroll Lenis, scroll reveal com stagger, parallax suave, números animados, cards com movimento e hover sofisticado, marquee de NRs, grain sutil, blur-to-sharp, glowbox. **Sem excesso** — priorizando confiança, legibilidade e performance. Respeita `prefers-reduced-motion`.

---

## H — RESPONSIVIDADE

- **Mobile-first:** as seções são pensadas para empilhar com boa hierarquia, não "espremidas".
- **Desktop/Notebook:** experiências completas (parallax, custom cursor, shaders sutis, scroll horizontal, cards magnéticos).
- **Tablet:** preserva a narrativa; reduz efeitos de cursor/parallax; grids viram 2 colunas.
- **Smartphone:** desativa efeitos pesados (shaders, scroll-scrub em canvas pode virar carrossel simples), aumenta espaçamentos, mantém CTAs grandes e acessíveis, garante legibilidade e CLS mínimo.
- Uso de `prefers-reduced-motion` para desativar animações quando o usuário preferir.
- Performance: lazy loading de imagens, fontes otimizadas, JS enxuto, animações fora da viewport pausadas.

---

## I — ARQUITETURA (preparada para o futuro)

```
PUBLIC WEBSITE        →  /  (apresentação institucional MS Consultoria)
ÁREA DO CLIENTE       →  /portal/login → /portal (futuro Portal do Cliente)
ÁREA INTERNA          →  /admin/login → /admin (futuro painel administrativo MS)
```

- Nesta etapa **não se implementa** backend, banco, autenticação nem o portal.
- A estrutura de rotas e pastas já nasce separada (ex.: `app/`, `components/` do site público), deixando espaço limpo para `/portal` e `/admin` sem retrabalho.
- Componentes de UI criados de forma reutilizável para servirem depois no portal.
- Sem alegações comerciais falsas sobre funcionalidades ainda inexistentes (usar "Em breve").

---

## J — PLANO DE IMPLEMENTAÇÃO

**Etapa 0 — Fundação** (após sua autorização)
1. Inicializar projeto (Next.js 15 App Router + TypeScript + Tailwind) ou HTML estático conforme ambiente.
2. Configurar fontes, paleta (verdes institucionais) e tokens de design.
3. Estrutura de pastas separada para site público (preparando `/portal` e `/admin`).

**Etapa 1 — Base visual**
4. Header fixo (pill que encolhe), footer, smooth scroll Lenis, grain sutil.
5. Componentes de reveal (framer-motion / IntersectionObserver) e marquee.

**Etapa 2 — Seções principais**
6. Hero cinematográfico.
7. Seção O Problema + Quem Somos (com princípios).
8. Serviços (8 cards reais) + Treinamentos (10 NRs).

**Etapa 3 — Momentos de scroll**
9. Momento 1: seção sticky de transformação (frame-a-frame / blocos com scrub).
10. Momento 2: linha/processo animado dos pilares de SST.
11. Momento 3: transição para o mockup do Portal "Em breve".

**Etapa 4 — Complementos**
12. Diferenciais, Prevenção, Depoimentos (3 reais).
13. CTA final + Footer completo.
14. Contatos reais integrados (WhatsApp/phone/e-mail/Instagram).

**Etapa 5 — Qualidade**
15. Responsividade desktop/tablet/mobile + `prefers-reduced-motion`.
16. Acessibilidade (semântica, headings, alt, focus, contraste).
17. Performance (lazy, fontes, JS enxuto) e revisão final.
18. Entrega para validação da dona (build local/commit conforme fluxo já usado em projetos anteriores).

---

## Notas finais

- **Estatísticas** ("21 soluções", "1150") e **frase cortada** do Quem Somos ("nosso compromisso é oferecer soluções em saúde ocupacional e atendimento...") precisam de confirmação antes de exibir.
- Nenhum arquivo do projeto foi alterado além deste relatório (criado como documento de referência). A BIBLIOTECA permanece 100% intacta.
