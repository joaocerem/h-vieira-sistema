# features/

Um diretório por módulo de negócio, espelhando os módulos do backend
(`arquitetura-tecnica.md`, Seção 2) — ver `docs/architecture/arquitetura-tecnica-frontend.md`,
Seções 3 e 10.

Cada feature segue a mesma forma interna: `api/` (chamadas HTTP via `shared/api/client`),
`hooks/` (TanStack Query), `components/` (só quando há algo específico do módulo — features de
cadastro simples de `nome` único consomem `shared/components/crud/` diretamente, sem
`components/` próprio) e `pages/` (rotas).

## Implementadas

**Cadastros Base**: `empresa/`, `fornecedor/`, `cliente/` — CRUD simples (`nome`), via
`shared/components/crud/NomeUnicoForm`/`NomeUnicoTable`. `categoria/` — CRUD (`nome` + `tipo`,
ambos texto livre). `conta-bancaria/` — seleciona Empresa na criação. `cartao-credito/` — só o
cadastro (banco, dias de fechamento/vencimento), seleciona Conta Bancária na criação;
**não inclui** Compra/Parcela/Fatura. Sem `apelido` em Conta Bancária/Cartão desde a Sprint 3
da rodada de evolução operacional — identificação por Empresa + Banco. `usuario/` — nível
básico (nome, identificador de acesso, situação de acesso), sem papel/Empresa (bloqueado por
S1/S2).

**Cadeia financeira central**: `lancamento-financeiro/` — CRUD + ação de cancelamento
(`POST .../cancelar`, nunca bloqueada por conciliação — Sprint 3); seleção opcional de Obra e
Veículo (este filtrado pela Empresa selecionada); `valor` via
`shared/components/form/CurrencyInput.tsx` (máscara de moeda universal); `descricao`/
`documento` (texto livre, opcionais, rodada de evolução operacional 2026-08 — Fase 1);
`fornecedorId`/`categoriaId` via `shared/components/form/AutocompleteField.tsx` (busca por
texto + cadastro rápido embutido, Sprint 2 — `clienteId` permanece `SelectField` tradicional,
decisão explícita, volume baixo). `statusFinanceiro` binário (Conciliado/Não Conciliado, desde
a Sprint 3) — calculado pelo backend a partir da conciliação bancária, nunca aqui. Filtro por
`tipo`/`status` na própria listagem (`LancamentoListPage`) cobre "Contas a Pagar"/"Contas a
Receber" — recorte client-side sobre os mesmos dados, sem tela nem endpoint próprios.
**Sem `liquidacao-financeira/`, `aplicacao-liquidacao/` nem `ajuste-financeiro/`** — removidas
na Sprint 3 (rodada de evolução operacional): a única confirmação de pagamento/recebimento
válida passou a ser a conciliação bancária (`conciliacao-bancaria/`).

**Operacional**: `obra/` — CRUD + ação dedicada de transição de status (D9 — A executar →
Em andamento ⇄ Pausada → Concluída, botões calculados a partir do mesmo mapa de transições do
backend). `frota/` (rota `/veiculos`, nome de pasta igual ao pacote do backend
`interfaces/http/frota`) — CRUD, `tipo` com lista fechada de 8 valores (D10), alocação
opcional a uma Obra atual (`obraAtualId`).

**Conciliação Bancária**: `conciliacao-bancaria/` (rota `/conciliacao-bancaria`) — três
entidades numa só feature, seguindo exatamente os endpoints reais do backend
(`interfaces/http/conciliacaobancaria/`). Movimentação Bancária: sem `criar`/`atualizar` livre
— só `importar` (lote de extrato, array dinâmico) e `reclassificar` (único campo mutável,
inline na lista; `'Transferência Interna'` nunca oferecida como destino — só atribuída via
Transferência Interna). Vínculo Conciliação: **sem tela própria** — 1:1 obrigatório com
Movimentação (gerado automaticamente no backend), exibido e operado na mesma tabela de
Movimentação (`confirmar`/`marcarDivergente`/`marcarSemCorrespondencia`/`vincularManualmente`,
botões calculados a partir das mesmas guardas de `VinculoConciliacaoService`, mesmo espírito de
`ObraStatusActions`) e uma ação de sugestão automática (`rodarSugestaoAutomatica`). A partir da
Sprint 3 (rodada de evolução operacional): Vínculo N:N direto com Lançamento Financeiro
(substitui Liquidação Financeira) — `vincularManualmente` escolhe um ou mais Lançamentos de uma
vez, via lista de checkboxes reusando `shared/hooks/useLancamentoOptions.ts` (mesmo hook do
formulário de Lançamento, sem hook próprio novo). Transferência Interna: criação manual +
listagem, sem edição (regra não definida no domínio).

**Cartão de Crédito (fluxo financeiro)**: `compra-cartao/` (`/compras-cartao`) — CRUD;
`cartaoId`/`valor`/`numeroParcelas` só no modo criar (imutáveis depois —
`AtualizarCompraCartaoRequest` não os tem); ao criar, o backend gera automaticamente as
Parcelas do parcelamento. `fatura/` (`/faturas`) — sem `criar`/`atualizar` genéricos: só
`fecharCiclo` (`/faturas/fechar-ciclo`, a Fatura nasce já com os totais congelados). Sem ação
"Pagar Fatura" desde a Sprint 3 (rodada de evolução operacional) — `paga` é sempre calculado
pelo backend (`FaturaService#calcularPaga`) a partir da conciliação bancária dos Lançamentos
gerados pelas Parcelas do ciclo; a única confirmação válida é conciliar a Movimentação
correspondente em `conciliacao-bancaria/`. `FaturaDetailPage` cruza a lista completa de
Parcelas por `faturaId` no cliente — o backend não expõe esse filtro em `GET /api/parcelas`.
`parcela/` (`/parcelas`) —
só leitura + ação `gerar-lancamento` (gatilho manual do "vencimento"; sem agendador automático
no projeto); filtro por Compra Cartão sincronizado com a URL (`?compraCartaoId=`), usado pelo
link "Ver parcelas" de `compra-cartao/`. Novos hooks compartilhados
`useCartaoCreditoOptions`/`useCompraCartaoOptions`/`useParcelaOptions`.

**Financiamentos e Consórcios**: `financiamento-consorcio/` (`/contratos-financeiros`) —
`ContratoFinanceiroController` seguido exatamente: CRUD (`tipo`/`empresaId`/`contaBancariaId`/
`valorContratado`/`numeroParcelas`/`dataVencimentoPrimeiraParcela` imutáveis após criar — só
`fornecedorId`/`veiculoId` editáveis depois) + ação dedicada `contemplar` (transição Não→Sim,
exclusiva de `tipo` = Consórcio, botão na página de edição, mesmo espírito de
`ObraStatusActions`). Campos condicionais por `tipo` (`taxa` para Financiamento;
`grupoCota`/`contemplado`/`veiculoId` para Consórcio) exigidos só no modo criar, checados
manualmente no `onSubmit` — nunca `.superRefine()`. Ao criar, o backend gera automaticamente as
Parcelas do parcelamento (decisão #40, mesma fórmula de Compra Cartão). `features/parcela/`
estendida para o segundo filtro real do backend (`?contratoFinanceiroId=`, mutuamente exclusivo
com `?compraCartaoId=` na mesma tela `/parcelas`) — reuso direto de uma feature já existente,
sem duplicar a listagem. Novo hook compartilhado `useContratoFinanceiroOptions`.

**Balanço**: `balanco/` (`/balanco`) — só leitura/agregação, espelhando o único endpoint de
`BalancoController` (`GET /api/balanco?empresaId=`). Sem página de criar/editar (sem entidade
própria). Primeira tela genuinamente "dashboard" do Frontend — `ResultadoCard.tsx` reaproveita
`shared/components/ui/card` (shadcn/ui, cadastrado desde o bootstrap, nunca consumido até aqui),
extraído por reuso real (seis instâncias — Receitas/Despesas/Resultado × Realizado/Projetado —
na mesma página).

## Pendentes

Nenhuma feature de negócio pendente na Fase 5 — resta só o que depende de S1-S5
(login/`AuthProvider`, UI condicionada a papel/Empresa, `usuarios/` completo, `auditoria/`) e a
Fase 6 (IA). Ver `docs/architecture/arquitetura-tecnica-frontend.md`, Seção 11.
