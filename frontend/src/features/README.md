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
cadastro (banco, apelido, dias de fechamento/vencimento), seleciona Conta Bancária na criação;
**não inclui** Compra/Parcela/Fatura. `usuario/` — nível básico (nome, identificador de
acesso, situação de acesso), sem papel/Empresa (bloqueado por S1/S2).

**Cadeia financeira central**: `lancamento-financeiro/` — CRUD + ação de cancelamento
(`POST .../cancelar`); seleção opcional de Obra e Veículo (este filtrado pela Empresa
selecionada); `valor` via `shared/components/form/CurrencyInput.tsx` (máscara de moeda
universal); `descricao`/`documento` (texto livre, opcionais, rodada de evolução operacional
2026-08 — Fase 1); `fornecedorId`/`categoriaId` via `shared/components/form/AutocompleteField.tsx`
(busca por texto + cadastro rápido embutido, Sprint 2 — `clienteId` permanece
`SelectField` tradicional, decisão explícita, volume baixo). `liquidacao-financeira/` — só
criação e detalhe (sem edição — imutável, D12); o array `aplicacoes` (quais Lançamentos a
Liquidação cobre, e em que valor) é preenchido na própria tela de criação. **Sem
`features/aplicacao-liquidacao/`** — essa entidade não tem endpoint HTTP próprio no backend.
**Nota**: `liquidacao-financeira/` e `ajuste-financeiro/` (mais abaixo) serão removidas na
Sprint 3 da rodada de evolução operacional — ver `docs/pendencias.md`, Seção 9.

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
`ObraStatusActions`) e uma ação de sugestão automática (`rodarSugestaoAutomatica`). Transferência
Interna: criação manual + listagem, sem edição (regra não definida no domínio). `shared/hooks/
useLiquidacaoOptions.ts` — novo hook de referência cross-feature (escolher a qual Liquidação uma
Movimentação corresponde), mesmo padrão de `useLancamentoOptions`.

**Cartão de Crédito (fluxo financeiro)**: `compra-cartao/` (`/compras-cartao`) — CRUD;
`cartaoId`/`valor`/`numeroParcelas` só no modo criar (imutáveis depois —
`AtualizarCompraCartaoRequest` não os tem); ao criar, o backend gera automaticamente as
Parcelas do parcelamento. `fatura/` (`/faturas`) — sem `criar`/`atualizar` genéricos: só
`fecharCiclo` (`/faturas/fechar-ciclo`, a Fatura nasce já com os totais congelados) e `pagar`
(`/faturas/:id/pagar`, cria uma Liquidação Financeira, que por sua vez gera automaticamente uma
Movimentação Bancária + Vínculo `Confirmado` — mesma cadeia de integração já corrigida em
`useCriarLiquidacao`). `FaturaDetailPage` cruza a lista completa de Parcelas por `faturaId` no
cliente — o backend não expõe esse filtro em `GET /api/parcelas`. `parcela/` (`/parcelas`) —
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

**Ajuste Financeiro**: `ajuste-financeiro/` (`/ajustes-financeiros`) — só `criar`, seguindo
`AjusteFinanceiroController` exatamente (sem `atualizar`/`excluir`, imutável desde a criação,
D13). O Lançamento de ajuste precisa já existir (criado antes, via
`features/lancamento-financeiro/`) — este formulário só formaliza o vínculo entre dois
Lançamentos, nunca cria um novo. Reusa `useLancamentoOptions` (já existente) para as duas
seleções (Lançamento original/de ajuste), excluindo Cancelados das opções. Novo hook
compartilhado `useUsuarioOptions.ts` (`usuarioId` obrigatório — sem sessão autenticada ainda,
S1, o usuário escolhe explicitamente quem está registrando). Filtro por Lançamento original
sincronizado com a URL (`?lancamentoOriginalId=`); `features/lancamento-financeiro/` ganhou o
link "Ajustes" na tabela, apontando para esse filtro.

## Pendentes

Nenhuma feature de negócio pendente na Fase 5 — resta só o que depende de S1-S5
(login/`AuthProvider`, UI condicionada a papel/Empresa, `usuarios/` completo, `auditoria/`) e a
Fase 6 (IA). Ver `docs/architecture/arquitetura-tecnica-frontend.md`, Seção 11.
