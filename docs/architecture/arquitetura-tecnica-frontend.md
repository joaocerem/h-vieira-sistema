# Arquitetura Técnica — Frontend
## Sistema Financeiro/Gerencial H Vieira Terraplanagem

**Fonte de verdade das decisões que este documento sintetiza**: `decisions.md`, decisões #42
e #44-#50 (T2, T7-T14, todas da Fase 5) — este documento não reabre nenhuma delas, só as
organiza numa arquitetura coerente. Onde este documento e `decisions.md` divergirem em
qualquer ponto, `decisions.md` prevalece.

**Fonte de verdade das pendências que este documento herda**: `pendencias.md`, Seção 7
(S1-S5) — a implementação de autenticação, autorização, escopo por Empresa e auditoria no
backend, deliberadamente adiada da Fase 4 (`decisions.md`, decisão #41; `freeze-fase-4.md`).

**Relação com `arquitetura-tecnica.md`** (documento irmão, backend): aquele documento
permanece a fonte de verdade dos módulos de domínio (Seção 2), das regras de dependência entre
eles (Seção 3) e do contrato de erro da API (`common/web/ApiError.java`). Este documento não
duplica esse conteúdo — referencia.

**Natureza deste documento**: arquitetura técnica, não implementação. Nenhum arquivo de
código do Frontend foi criado. A implementação só começa depois deste documento aprovado.

---

## ÍNDICE

1. Escopo e papel do Frontend
2. Stack tecnológica consolidada
3. Estrutura de pastas
4. Roteamento e navegação
5. Comunicação com a API
6. Gerenciamento de estado
7. Autenticação e autorização no cliente
8. UI, estilo e tema
9. Testes
10. Módulos (features) mapeados
11. Ordem recomendada de implementação
12. Dependências e bloqueios conhecidos
13. Itens deliberadamente fora de escopo

---

## 1. ESCOPO E PAPEL DO FRONTEND

O Frontend é uma **SPA desacoplada**, consumindo exclusivamente a API REST já implementada no
backend (Fase 4). Ele nunca contém regra de negócio própria — toda regra (status calculado,
rateio, ajuste, barreiras de confirmação da IA, escopo por Empresa) vive e é validada no
backend; o Frontend só apresenta, orquestra chamadas de API e cuida da experiência do usuário
(`decisions.md`, decisão #50).

Nenhum servidor Node roda no caminho de execução em produção — o build (Vite) é estático,
servido pela mesma infraestrutura do backend (`decisions.md`, decisão #43).

---

## 2. STACK TECNOLÓGICA CONSOLIDADA

| Camada | Escolha | Decisão |
|---|---|---|
| Framework/bundler | React + Vite + TypeScript | `decisions.md`, #42 |
| Roteamento | React Router | `decisions.md`, #44 |
| Testes | Vitest + React Testing Library (sem Jest; E2E fora de escopo) | `decisions.md`, #45 |
| Cliente HTTP | axios, isolado em `shared/api/client` | `decisions.md`, #46 |
| Estado de servidor | TanStack Query | `decisions.md`, #47 |
| Estado de UI local | Context API (sem Redux) | `decisions.md`, #47 |
| Autenticação no cliente | Cookie httpOnly (backend emite via `Set-Cookie`) | `decisions.md`, #48 |
| UI/estilo | Tailwind CSS + shadcn/ui (DataGrid fora de escopo) | `decisions.md`, #49 |
| Estrutura de pastas | Por feature/módulo de domínio | `decisions.md`, #50 |
| Hospedagem | Mesma plataforma PaaS do backend (T4) | `decisions.md`, #43 |

---

## 3. ESTRUTURA DE PASTAS

Definida em `decisions.md`, decisão #50:

```
frontend/
  src/
    app/                        → bootstrap da aplicação
      App.tsx                   → composição raiz dos providers abaixo
      providers/
        QueryProvider.tsx       → TanStack Query (Seção 6)
        AuthProvider.tsx        → Context API — sessão do usuário (Seção 7)
        ThemeProvider.tsx       → Context API — tema (Seção 8)
      main.tsx                  → entrypoint Vite

    features/                   → um diretório por módulo de negócio (Seção 10)
      lancamento-financeiro/
        api/                    → chamadas específicas deste módulo, via shared/api/client
        components/
        hooks/
        pages/
        types/
      liquidacao-financeira/
      conciliacao-bancaria/
      cartao-credito/
      financiamento-consorcio/  → Contrato Financeiro (Financiamento/Consórcio)
      obra/
      frota/
      ajuste-financeiro/
      balanco/
      cadastros-base/           → Empresa, Conta Bancária, Fornecedor, Cliente, Categoria
      usuarios/                 → cadastro/gestão de usuário (quando S2 existir)
      auditoria/                → consulta de LOG_AUDITORIA (quando S4 existir)
      ia/                       → Fase 6 — não implementado nesta fase

    shared/                     → só o genuinamente compartilhado entre features
      api/
        client.ts               → instância axios + interceptores (Seção 5)
        errors.ts                → tradução de ApiError → formato interno
      components/                → componentes shadcn/ui reaproveitados (Seção 8)
      context/                   → Context API genérico (Seção 6/7/8)
      hooks/                      → hooks genéricos, sem regra de negócio
      types/                      → tipos comuns entre features
      constants/

    routes/                      → só definição de rotas e guards (Seção 4)
      router.tsx
      guards/
        RequireAuth.tsx          → guard de autenticação (Seção 7)
        RequireRole.tsx          → guard de papel/Empresa (depende de S2/S3)

  index.html
  vite.config.ts
  tailwind.config.ts
```

**Regra estrutural**: nenhuma `feature/` importa de outra `feature/` diretamente — o que
precisa ser compartilhado entre duas ou mais features sobe para `shared/`. Isso espelha, em
espírito, a mesma disciplina de fronteira que o backend já aplica entre seus módulos
(`arquitetura-tecnica.md`, Seção 3), sem impor a estrutura de camadas completa do backend.

---

## 4. ROTEAMENTO E NAVEGAÇÃO

React Router (`decisions.md`, decisão #44), com rotas definidas centralmente em `routes/
router.tsx` — nenhuma feature define rota fora desse ponto único.

- **Lazy loading por feature**: cada rota carrega seu módulo sob demanda (`React.lazy`),
  evitando que o bundle inicial cresça com todos os 10+ módulos de domínio de uma vez.
- **Rotas aninhadas**: seguem a mesma hierarquia de navegação do sistema (ex. Cartão de
  Crédito → Fatura → Parcela), sem duplicar lógica de layout por tela.
- **Guards de rota** (`routes/guards/`):
  - `RequireAuth` — bloqueia acesso a qualquer rota autenticada quando não há sessão válida
    (cookie httpOnly ausente/expirado) — **implementação final depende de S1** (Seção 12).
  - `RequireRole` — bloqueia acesso a rotas condicionadas a papel/escopo de Empresa —
    **implementação final depende de S2/S3** (Seção 12). O componente pode ser desenhado e
    testado com dado mockado antes de S1-S3 existirem, mas não pode ser ligado à API real
    antes disso.

---

## 5. COMUNICAÇÃO COM A API

Camada única (`decisions.md`, decisão #46): `shared/api/client.ts` — nenhuma feature acessa
`axios` diretamente.

- **Configuração**: base URL da API, `withCredentials: true` (obrigatório para o cookie
  httpOnly de autenticação trafegar — `decisions.md`, decisão #48), timeout padrão.
- **Interceptor de resposta**: traduz o corpo de erro já padronizado do backend (`ApiError` —
  `timestamp`/`status`/`error`/`message`/`path`/`fieldErrors`,
  `backend/.../common/web/ApiError.java`) para um formato interno único (`shared/api/
  errors.ts`), consumido de forma consistente por toda a aplicação — nunca cada tela parseando
  o erro cru por conta própria.
- **`fieldErrors`**: mapeados para erro de campo de formulário (biblioteca de forms usada a
  partir da feature Empresa: `react-hook-form` + `zod` — decisão de detalhe de implementação,
  não arquitetural). **Achado registrado durante a implementação de Empresa**: o backend
  devolve `fieldErrors` como `FieldError.toString()` (Spring), um texto verboso, não um par
  `{campo, mensagem}` limpo — `shared/api/errors.ts` já extrai isso via regex
  (`parseFieldErrors`), com degradação graciosa se o formato mudar. Nenhuma alteração no
  backend foi feita — fora de escopo desta fase.
- **Chamadas por módulo**: cada `features/<modulo>/api/` expõe funções tipadas específicas
  daquele módulo (ex. `buscarLancamentos`, `criarLiquidacao`), todas construídas sobre a
  instância de `shared/api/client` — nunca reimplementando configuração própria de HTTP.
- **Padrão de validação de campo monetário (achado, Cadastros Base + Lançamento Financeiro)**:
  campo monetário sempre usa `z.coerce.number()` no schema Zod, nunca `register(campo, {
  valueAsNumber: true })` puro — um `<input type="number">` vazio, com `valueAsNumber`, vira
  `NaN` (`invalid_type`), e um `invalid_type` em qualquer campo do mesmo objeto faz o Zod 4
  pular `.superRefine()` do schema inteiro (achado original em `CartaoCreditoForm.tsx`,
  confirmado de novo em `LancamentoForm.tsx`/`LiquidacaoForm.tsx`). Consequência prática
  adicional: como `z.coerce.number()` muda o tipo de entrada do schema (`unknown`) em relação
  ao de saída (`number`), `useForm` precisa dos três generics —
  `useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>` — não só um. Exigência
  condicional entre campos (ex. Fornecedor obrigatório só para Despesa) não usa
  `.superRefine()` por esse motivo — é checada manualmente dentro do `onSubmit`, depois que o
  Zod já validou o resto.
- **Máscara de moeda universal, `CurrencyInput` (decisão de negócio, rodada de evolução
  operacional 2026-08 — Fase 1)**: todo campo de valor monetário em Real (`R$`) passou a usar
  `shared/components/form/CurrencyInput.tsx` — entrada por dígitos (o usuário digita só
  números, da direita para a esquerda, como em qualquer caixa eletrônico; os dois últimos
  dígitos são sempre os centavos), formatado em tempo real via `Intl.NumberFormat('pt-BR',
  {style:'currency', currency:'BRL'})` (reaproveitando `shared/lib/formatters.ts` →
  `formatCurrency`). Suporta `allowNegative` para os poucos campos onde o sinal é significativo
  (ex. `valor` de item de extrato importado em `ImportarMovimentacoesForm.tsx` — saída/entrada).
  **Não se aplica a campos percentuais** (ex. `taxa` de Contrato Financeiro) — só a valores em
  Real de fato.
  - Componente controlado, incompatível com `register()` puro — por isso usado via `Controller`
    do react-hook-form (junto de `AutocompleteField`, abaixo, os dois únicos pontos do projeto
    que usam `Controller`); os demais campos continuam em `register`, sem motivo para migrar o
    que já funciona.
  - `onValueChange` entrega `number | undefined` diretamente, nunca `NaN` — o schema Zod
    correspondente usa `z.number()` direto (opcionalmente com mensagem customizada de
    obrigatoriedade, `z.number({ message: '...' })`), **não** `z.coerce.number()`. Como não há
    coerção, o schema não precisa mais da distinção `z.input`/`z.output` só por causa do campo
    monetário — `useForm<z.infer<typeof schema>>` basta, a menos que outro campo do mesmo schema
    ainda use `z.coerce` por outro motivo (ex. `taxa`, percentual, em
    `ContratoFinanceiroForm.tsx`).
  - Este padrão **substitui** `z.coerce.number()` + `<input type="number">` para campos
    monetários especificamente — o padrão anterior (parágrafo acima) continua válido para
    campos numéricos não-monetários (ex. `numeroParcelas`, inteiro, via
    `register(campo, { valueAsNumber: true })` + `z.number().int()`).
  - Achado ao construir o componente: como é controlado, o React restaura o valor do `<input>`
    para o último valor conhecido logo após cada `onChange` caso o handler não chame
    `onValueChange` — um `-` digitado sozinho (antes de qualquer dígito, com `allowNegative`)
    seria perdido se o handler apenas "ignorasse" a tecla. Resolvido com um estado local
    (`pendingNegative`) só para lembrar o sinal enquanto não há dígito nenhum ainda — não
    interfere no tipo `number | undefined` exposto para fora.
- **Autocomplete + cadastro rápido, `AutocompleteField` (decisão de negócio, Sprint 2 —
  "Fluxo completo de Lançamentos")**: substitui `SelectField` para campos de referência de alto
  volume (Fornecedor/Categoria em `LancamentoForm.tsx`) — busca por texto sobre as opções já
  carregadas (sem novo endpoint de busca no backend, filtragem 100% client-side) e, quando o
  texto digitado não corresponde a nenhuma opção existente, uma opção "+ Criar '...'" que
  cadastra o registro na hora (endpoint `POST` já existente do módulo) e o seleciona
  automaticamente — sem sair da tela de Lançamento. **Não é a substituição universal de
  `SelectField`** — Empresa/Obra/Veículo (baixo volume) e Cliente (decisão explícita: volume
  baixo, autocomplete não traz ganho operacional) continuam em `SelectField`.
  - Construído sobre `Popover` de `radix-ui` (já uma dependência do projeto, sem pacote novo) —
    sem `Command`/`cmdk` (não instalado); filtragem, navegação por teclado (setas/Enter/Escape)
    e abertura por foco são implementadas à mão, deliberadamente simples.
  - Controlado via `Controller`, mesmo motivo de `CurrencyInput` acima.
  - **Achado real, só reproduzível com foco de janela verdadeiro (nunca apareceu em jsdom/RTL,
    onde os 9 testes do componente passavam desde a primeira versão)**: o `DismissableLayer` do
    Radix considera "de fora" qualquer clique que não esteja dentro de `Popover.Content` — como
    o campo de busca vive dentro de `Popover.Anchor` (usado só para posicionamento, não é o
    `Trigger` que o Radix reconhece como "de dentro"), o próprio clique que dá foco ao campo já
    contava como uma interação "de fora", fechando o painel no mesmo instante em que abria.
    Descoberto em teste manual no navegador (`document.hasFocus()` precisa ser `true` para
    reproduzir — daí nunca aparecer em jsdom). Corrigido desligando esse mecanismo do Radix
    (`onPointerDownOutside`/`onFocusOutside` com `preventDefault`) já que o componente tem seu
    próprio fechamento por `onBlur`, tornando o do Radix redundante, não substituído por nada
    faltando.
  - Cadastro rápido de Categoria passa `tipo` (Despesa/Receita) automaticamente, herdado do
    `tipo` já selecionado no próprio Lançamento — não pede essa escolha de novo ao usuário
    (`tipo` é obrigatório no backend, `CategoriaRequest`, `@NotBlank`); decisão de
    implementação, não de negócio, só evita perguntar a mesma coisa duas vezes.
  - Dois hooks novos em `shared/hooks/` (não em `features/fornecedor|categoria/hooks/`, mesmo
    padrão de `useFornecedorOptions.ts`/`useCategoriaOptions.ts` ao lado — `shared/` nunca
    importa de `features/*`): `useCriarFornecedorRapido.ts`/`useCriarCategoriaRapida.ts`, cada
    um chamando `apiClient` direto e invalidando a `sharedQueryKeys` correspondente.
  - Erro de cadastro rápido (ex. nome duplicado) não tem tratamento próprio no componente — já
    aparece no toast global (`QueryProvider`/`MutationCache`, decisão #46), mesmo mecanismo de
    qualquer outra mutation do projeto.

---

## 6. GERENCIAMENTO DE ESTADO

Duas naturezas de estado, tratadas por ferramentas diferentes (`decisions.md`, decisão #47):

- **Estado de servidor** (TanStack Query): todo dado vindo da API — cache, revalidação,
  deduplicação de requisições, estado de loading/error. Cada `features/<modulo>/hooks/` expõe
  hooks de query/mutation específicos daquele módulo, construídos sobre as funções de
  `features/<modulo>/api/`.
- **Estado de UI local** (Context API, `shared/context/` e `app/providers/`): restrito a
  estado genuinamente global de interface — sessão do usuário autenticado (`AuthProvider`),
  tema (`ThemeProvider`), preferências. Nenhum dado vindo da API é replicado em Context —
  fonte única da verdade preservada, mesmo princípio já normativo no domínio
  (`principios-de-modelagem.md`, princípio 4), aplicado aqui à camada de apresentação.
- **Sem Redux.** Se uma necessidade real de estado de UI global complexo aparecer no futuro,
  Zustand é a evolução já registrada como possível (`decisions.md`, decisão #47) — não uma
  reabertura desta arquitetura.

---

## 7. AUTENTICAÇÃO E AUTORIZAÇÃO NO CLIENTE

**Estratégia** (`decisions.md`, decisão #48): cookie httpOnly. O Frontend nunca lê nem
armazena o valor do token JWT — o navegador o envia automaticamente em toda requisição
(`withCredentials: true`, Seção 5).

- **Fluxo de login**: tela de login envia usuário/senha para o endpoint de autenticação;
  sucesso faz o backend responder com `Set-Cookie` (httpOnly, Secure em produção, SameSite) —
  o Frontend não lê nem manipula esse header, só reage ao sucesso da requisição.
- **Sessão do usuário** (`AuthProvider`, Context API): mantém em memória só o que a UI precisa
  exibir/decidir (nome, papel, Empresas com acesso) — nunca o token. Populado a partir de um
  endpoint de "usuário atual" (`/me` ou equivalente), chamado ao carregar a aplicação; o
  cookie já autentica essa chamada automaticamente.
- **Logout**: chamada a endpoint de logout que invalida/expira o cookie no backend — o
  Frontend não tenta apagar um cookie httpOnly por JavaScript (estruturalmente não consegue).
- **Refresh de sessão**: se necessário no futuro, é responsabilidade do backend (endpoint
  dedicado) — decisão já registrada como não alterando esta arquitetura (`decisions.md`,
  decisão #48).
- **UI condicionada a papel/Empresa** (RBAC + escopo por Empresa, A2 — `decisions.md`, decisão
  #16): menus, botões de ação e rotas (`RequireRole`, Seção 4) são condicionados ao papel e às
  Empresas do usuário autenticado, lidos de `AuthProvider`. **Implementação final bloqueada
  até S2/S3 existirem no backend** (Seção 12).

---

## 8. UI, ESTILO E TEMA

Tailwind CSS + shadcn/ui (`decisions.md`, decisão #49) — componentes copiados para
`shared/components/`, ajustáveis livremente ao domínio (tabelas financeiras densas,
formulários de lançamento, dashboards de Balanço/Obra/Frota).

- **Tema**: shadcn/ui já usa variáveis CSS (custom properties) para cor/tema por padrão —
  este documento reaproveita esse mecanismo (`tailwind.config.ts` + variáveis CSS em
  `app/`), sem decidir, por ora, suporte formal a modo escuro — nenhuma necessidade de negócio
  confirmada para isso hoje (mesmo critério do princípio 2, `principios-de-modelagem.md`). A
  estrutura de variáveis já deixa essa extensão possível sem retrabalho, se e quando for
  decidida.
- **DataGrid**: deliberadamente fora de escopo (`decisions.md`, decisão #49) — tabela HTML
  simples estilizada com Tailwind é o padrão até uma necessidade real e concreta (virtualização,
  agrupamento, edição em massa, filtros complexos, seleção múltipla) originar decisão técnica
  específica.

---

## 9. TESTES

Vitest + React Testing Library (`decisions.md`, decisão #45), testes focados em
comportamento visível ao usuário, não detalhe de implementação.

- **Organização**: teste ao lado do código testado, dentro de cada `features/<modulo>/`
  (mesmo módulo, mesma pasta) — sem diretório de teste global separado, mesma filosofia de
  organização por feature já definida em T13.
- **`shared/`**: testado isoladamente, por ser consumido por múltiplas features (ex. tradução
  de `ApiError`, guards de rota).
- **E2E (Cypress/Playwright)**: deliberadamente fora de escopo — avaliação futura, quando o
  Frontend estiver funcional (`decisions.md`, decisão #45), não bloqueando a implementação
  desta fase.

---

## 10. MÓDULOS (FEATURES) MAPEADOS

Espelha diretamente os módulos já definidos no backend (`arquitetura-tecnica.md`, Seção 2):

| Feature (`features/`) | Módulo de backend correspondente | Observação |
|---|---|---|
| `empresa/`, `fornecedor/`, `cliente/` ✅ | Cadastros Base | CRUD `nome` único — `shared/components/crud/NomeUnicoForm`/`NomeUnicoTable` |
| `categoria/` ✅ | Cadastros Base | `nome` + `tipo` (texto livre, sem enum) |
| `conta-bancaria/` ✅ | Cadastros Base | Seleciona Empresa na criação (`shared/hooks/useEmpresaOptions`) |
| `cartao-credito/` ✅ (só o cadastro) | Cartão de Crédito | Seleciona Conta Bancária na criação. **Não inclui** Compra/Parcela/Fatura — módulo financeiro próprio, item 7 |
| `usuario/` ✅ (nível básico) | Usuários e Permissões | Sem papel/escopo de Empresa — gestão completa é item 11, bloqueada por S1/S2 |
| `lancamento-financeiro/`, `liquidacao-financeira/` ✅ | Financeiro (núcleo) | Cadeia central. **Sem `features/aplicacao-liquidacao/`** — Aplicação de Liquidação não tem endpoint HTTP próprio no backend; é um campo-array (`aplicacoes`) embutido na criação de Liquidação, refletido assim no Frontend também |
| `conciliacao-bancaria/` ✅ | Conciliação Bancária | Isolado — nunca escreve em Lançamento. Três entidades (Movimentação, Transferência Interna, Vínculo Conciliação) numa só feature — sem tela própria de Vínculo (1:1 obrigatório com Movimentação, exibido na mesma tabela) |
| `compra-cartao/`, `parcela/`, `fatura/` ✅ | Cartão de Crédito | Fluxo financeiro do cartão — distinto do cadastro (`cartao-credito/`, já implementado). `parcela/` sem `criar` (sistema gera); `fatura/` sem `criar`/`atualizar` genéricos (só `fecharCiclo`/`pagar`) |
| `financiamento-consorcio/` ✅ | Financiamentos e Consórcios | Contrato Financeiro (`tipo` Financiamento/Consórcio; ação dedicada `contemplar`), reusando `features/parcela/` (filtro `?contratoFinanceiroId=`, real no backend) |
| `obra/` ✅, `frota/` ✅ | Obras, Frota | CRUD; Obra com ação dedicada de transição de status (`POST .../status`, D9). Referenciados por `lancamento-financeiro/` (`obraId`/`veiculoId`, opcionais) |
| `ajuste-financeiro/` ✅ | Ajuste Financeiro | Vincula dois Lançamentos já existentes — sem `atualizar`/`excluir` (imutável, D13); formulário só formaliza o vínculo, não cria o Lançamento de ajuste em si |
| `balanco/` ✅ | Balanço (Realizado/Projetado) | Só leitura/agregação — um único endpoint (`GET /api/balanco?empresaId=`), sem tela de criar/editar |
| `auditoria/` | Auditoria | Bloqueado até S4 (Seção 12) |
| `ia/` | IA | Fora desta fase — Fase 6 |

---

## 11. ORDEM RECOMENDADA DE IMPLEMENTAÇÃO

**Nota de revisão**: a ordem original desta seção colocava a tela de login logo após o
bootstrap (item 2). Auditoria específica desta sessão (ver `handoff.md`, Seção 17) confirmou
que não existe nenhuma dependência técnica real entre login/`AuthProvider` e a primeira
feature funcional — o backend está com todos os endpoints abertos (`SecurityConfig.java`,
`permitAll()`) até S1 ser implementado. **Login/`AuthProvider` foram reordenados para o
momento em que S1-S5 começarem a ser implementados no backend**, e a implementação passa a
seguir a mesma ordem já usada pelo backend (`arquitetura-tecnica.md`, Seção 14), começando
pela primeira feature funcional. Esta é uma mudança de **ordem**, não de arquitetura — nenhuma
decisão de `decisions.md` foi alterada ou reaberta.

1. **`app/` e `shared/`** ✅ — bootstrap, providers, `shared/api/client`, componentes base
   shadcn/ui. Guards de rota (`RequireAuth`/`RequireRole`) permanecem para o item 11.
2. **Cadastros Base** ✅ — `empresa/`, `fornecedor/`, `cliente/`, `categoria/`,
   `conta-bancaria/` implementados. `empresa/` foi a primeira feature funcional da Fase 5;
   as demais seguiram no mesmo lote, incluindo a extração de `shared/components/crud/
   NomeUnicoForm`/`NomeUnicoTable` (reuso real confirmado entre `empresa/`, `fornecedor/` e
   `cliente/`) e dos hooks de referência `shared/hooks/useEmpresaOptions`/
   `useContaBancariaOptions` (consumidos por `conta-bancaria/` e `cartao-credito/`).
3. **`usuario/`** ✅ (nível básico — campos hoje existentes no backend: nome, identificador de
   acesso, situação de acesso; papel/escopo de Empresa ainda não existem no domínio, ver
   `domain/usuario/Usuario.java`) e **`cartao-credito/`** ✅ (só o cadastro — banco, apelido,
   dias de fechamento/vencimento, Conta Bancária vinculada) — implementados no mesmo lote dos
   Cadastros Base, adiantados do item 7 original por já não terem bloqueio técnico (cadastro
   simples, sem regra financeira própria). A gestão completa de papel/Empresa de usuário é o
   item 11, bloqueada por S1/S2; o fluxo financeiro do cartão (Compra, Parcela, Fatura)
   continua no item 7.
4. **`lancamento-financeiro/`, `liquidacao-financeira/`** ✅ — cadeia financeira central.
   **Sem `features/aplicacao-liquidacao/`** (ver Seção 10) — o array `aplicacoes`, dentro do
   formulário de criação de Liquidação, cobre isso por completo. Na primeira implementação,
   `obra`/`veiculo` ficaram de fora do formulário de Lançamento (campos opcionais no backend);
   integrados no item 6, quando `obra/`/`frota/` passaram a existir.
5. **`conciliacao-bancaria/`** ✅ — Movimentação Bancária (importação em lote + reclassificação),
   Transferência Interna (criação + listagem) e Vínculo Conciliação (sem tela própria — 1:1
   obrigatório com Movimentação, ações de confirmar/marcar divergente/marcar sem
   correspondência/vincular manualmente/sugestão automática, todas embutidas na tabela de
   Movimentação). Novo hook de referência compartilhado (`shared/hooks/useLiquidacaoOptions`),
   mesmo padrão de `useLancamentoOptions`.
6. **`obra/`, `frota/`** ✅ — CRUD completo dos dois, incluindo a ação de transição de status
   de Obra (D9, `decisions.md` decisão #30, botões calculados a partir do mesmo mapa de
   transições do backend — `ObraStatusActions.tsx`). `features/lancamento-financeiro/`
   atualizada no mesmo lote para incluir seleção de Obra e de Veículo (este último filtrado
   pela Empresa selecionada, espelhando a validação do backend). `ajuste-financeiro/`
   implementado em sessão posterior — ver item 8.1.
7. **`compra-cartao/`, `parcela/`, `fatura/`** ✅ (fluxo financeiro do cartão) —
   `compra-cartao/` CRUD (`cartaoId`/`valor`/`numeroParcelas` imutáveis após criar; correção de
   `categoria`/`obra`/`veículo` propaga para Lançamentos já gerados, D5); `parcela/` só leitura +
   ação `gerar-lancamento` (gatilho manual do "vencimento" — sem agendador automático no
   projeto), filtro por Compra Cartão sincronizado com a URL; `fatura/` sem criação/edição
   genérica — só `fecharCiclo` (nasce já congelada) e `pagar` (cria Liquidação, que por sua vez
   gera Movimentação Bancária/Vínculo automaticamente — mesma cadeia de `useCriarLiquidacao`).
   Novos hooks de referência compartilhados (`useCartaoCreditoOptions`,
   `useCompraCartaoOptions`, `useParcelaOptions`).
   **`financiamento-consorcio/`** ✅ — `ContratoFinanceiroController` seguido exatamente:
   `criar`/`atualizar`/`contemplar` (transição Não→Sim, exclusiva de `tipo` = Consórcio, ação
   dedicada na página de edição, mesmo espírito de `ObraStatusActions`); campos condicionais por
   `tipo` (`taxa` × `grupoCota`/`contemplado`/`veiculoId`) exigidos só no modo criar, checados
   manualmente no `onSubmit` (não `.superRefine()`). `features/parcela/` estendida para o
   segundo filtro real do backend (`?contratoFinanceiroId=`, mutuamente exclusivo com
   `?compraCartaoId=`) — reuso direto, sem duplicar a tela de listagem de Parcelas. Novo hook
   compartilhado `useContratoFinanceiroOptions`.
8. **`balanco/`** ✅ — depende dos módulos acima já populados. `BalancoController` seguido
   exatamente: único endpoint (`GET /api/balanco?empresaId=`), sem escrita, sem entidade
   própria. Primeira tela genuinamente "dashboard" do Frontend — reaproveita
   `shared/components/ui/card` (shadcn/ui, cadastrado desde o bootstrap, nunca consumido até
   aqui). `ResultadoCard` extraído por reuso real (seis instâncias na mesma página).
8.1. **`ajuste-financeiro/`** ✅ — `AjusteFinanceiroController` seguido exatamente: único caso
   de uso de escrita é `criar` (sem `atualizar`/`excluir`, imutável desde a criação — D13,
   `decisions.md` decisão #34); o Lançamento de ajuste precisa já existir (criado via
   `features/lancamento-financeiro/`), este formulário só formaliza o vínculo. Reusa
   `useLancamentoOptions` (já existente) para as duas seleções de Lançamento — Cancelados
   excluídos das opções (UX; quem valida de fato é o backend); novo hook compartilhado
   `useUsuarioOptions` (`usuarioId` obrigatório, sem sessão autenticada ainda). Filtro por
   Lançamento original sincronizado com a URL (`?lancamentoOriginalId=`), mesmo padrão de
   `ParcelaListPage`; `features/lancamento-financeiro/` ganha o link "Ajustes" na tabela,
   apontando para esse filtro.
9. **Tela de login e `AuthProvider`** — construída quando S1 começar a ser implementado no
   backend (pode ser desenvolvida em paralelo, com API mockada, mas só faz sentido priorizar
   quando houver endpoint real para integrar).
10. **UI condicionada a papel/Empresa** (menus, botões, `RequireRole`) — aplicada
    progressivamente aos módulos acima, mas só liga à API real quando **S2/S3** existirem.
11. **`usuarios/`** (gestão completa de papel/escopo de Empresa) — bloqueado até **S1/S2**
    existirem no backend.
12. **`auditoria/`** — bloqueado até **S4** existir no backend.
13. **`ia/`** — fora desta fase (Fase 6).

---

## 12. DEPENDÊNCIAS E BLOQUEIOS CONHECIDOS

Herdados formalmente da Fase 4 (`decisions.md`, decisão #41; `pendencias.md`, Seção 7):

| Item | O que bloqueia no Frontend | Pode ser desenhado/testado antes? |
|---|---|---|
| **S1** (T3 — autenticação) | Integração real de login/logout; `RequireAuth` funcional | Sim — UI e fluxo com API mockada |
| **S2** (A2 — RBAC + escopo por Empresa) | UI condicionada a papel/Empresa; `RequireRole` funcional; feature `usuarios/` | Sim — componentes, não a integração |
| **S3** (A4 — checagem de permissão) | Reação a erro 403 real vindo da API (hoje inexistente — tudo aberto) | Sim — tratamento de erro 403 no `shared/api/errors.ts` já pode ser escrito |
| **S4** (A5 — auditoria automática) | Feature `auditoria/` (consulta de `LOG_AUDITORIA`) | Não — não há dado real para exibir antes disso existir |
| **S5** (A8 — reautenticação de IA) | Tela de confirmação de Ação de IA de nível Alto | Não relevante nesta fase — depende também da Fase 6 (IA) |

Nenhum desses cinco itens bloqueia o **início** da implementação do Frontend — bloqueiam só a
**integração final** dos pontos específicos listados acima. A ordem da Seção 11 já reflete
isso, deixando os itens bloqueados por último.

---

## 13. ITENS DELIBERADAMENTE FORA DE ESCOPO

Registrados nas próprias decisões constituintes, não elevados a pendência formal — para não
antecipar estrutura sem necessidade confirmada (princípio 2, `principios-de-modelagem.md`):

- **Biblioteca de DataGrid** (`decisions.md`, decisão #49) — tabela HTML + Tailwind até
  necessidade real e concreta.
- **Testes E2E** (`decisions.md`, decisão #45) — avaliação futura, quando o Frontend estiver
  funcional.
- **Modo escuro / tema alternativo** (Seção 8) — estrutura de variáveis CSS já deixa isso
  possível, sem decisão formal de implementá-lo agora.
- **Biblioteca de formulários** (ex. React Hook Form) — decisão de detalhe de implementação,
  não arquitetural; a integração com `fieldErrors` do `ApiError` (Seção 5) já está prevista,
  independente de qual biblioteca for usada.
- **Zustand** (`decisions.md`, decisão #47) — evolução possível de estado de UI local, só se
  Context API não bastar num caso real.

---

*Com este documento, a arquitetura técnica do Frontend está completa. Implementação de código
autorizada a partir daqui, seguindo a ordem da Seção 11 e respeitando os bloqueios da Seção
12.*
