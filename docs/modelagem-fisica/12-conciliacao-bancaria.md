# Modelagem Física — `MOVIMENTAÇÃO_BANCÁRIA`, `TRANSFERÊNCIA_INTERNA`, `VÍNCULO_CONCILIAÇÃO`
## Fase 4 — Módulo Conciliação Bancária

**Nota sobre esta etapa**: diferente de `01` a `11` (escritos na Fase 3, antes de qualquer linha de código), este documento foi escrito durante a Fase 4 — depois da implementação do módulo Conciliação Bancária (migration Flyway `V15__conciliacao_bancaria.sql`, validada contra Postgres via Hibernate `ddl-auto: validate`). Reflete fielmente o schema já aplicado, sem propor nada novo. Categorias de tipo físico referenciam `arquitetura-fisica-banco.md`, Seção 5.

**Validação prévia**: auditoria documental enxuta realizada antes da implementação (decisões #1–#40, `pendencias.md`, `modelo-logico.md` Seção 3.12–3.14, `domain-model/12-14`) — sem pendência de domínio aberta (D1–D13 todas resolvidas). Único item tocando o módulo: **T6** (tolerância de dias no matching automático de conciliação, `pendencias.md` Seção 5) — resolvida nesta implementação como parâmetro configurável (`hvieira.conciliacao.tolerancia-dias-matching`, `application.yaml`, via `ConciliacaoProperties`), nunca uma constante fixa no código, conforme o próprio texto da pendência já exigia. Não é coluna de nenhuma tabela — vive inteiramente na camada de aplicação.

---

## `movimentacoes_bancarias` (MOVIMENTAÇÃO_BANCÁRIA)

**Finalidade**: fato puro do extrato bancário — reflete 100% do que passa pela Conta, sem exclusão de itens não-operacionais.

| Coluna | Categoria de tipo | Obrigatória | FK / Observação |
|---|---|---|---|
| `id` | Identificador | Sim | PK |
| `conta_bancaria_id` | Identificador (FK) | Sim | → `contas_bancarias.id` |
| `data` | Data | Sim | Data da movimentação no banco |
| `descricao` | Texto | Sim | Texto trazido literalmente pelo extrato |
| `valor` | Monetário (`NUMERIC`) | Sim | Guarda o sinal do extrato (entrada positiva / saída negativa) — convenção técnica de representação; o conceitual deixa isso deliberadamente fora de escopo (`12-movimentacao-bancaria.md`, Seção 2), então sem `CHECK` de sinal ou positividade |
| `classificacao` | Enumerado/lista fechada | Sim | `Terraplanagem` / `Fora da Operação` / `Transferência Interna` / `Retirada do Patrão` / `Não Classificada`. Default `Não Classificada` |

**PK**: `id` — `pk_movimentacoes_bancarias`

**FK**: `fk_movimentacoes_bancarias_conta_bancaria` (`conta_bancaria_id` → `contas_bancarias.id`), `ON DELETE RESTRICT`.

**NOT NULL**: `id`, `conta_bancaria_id`, `data`, `descricao`, `valor`, `classificacao` — todos obrigatórios.

**UNIQUE**: nenhuma — o conceitual não declara cadastro único para Movimentação Bancária.

**CHECK**: `ck_movimentacoes_bancarias_classificacao` (`classificacao IN ('Terraplanagem', 'Fora da Operação', 'Transferência Interna', 'Retirada do Patrão', 'Não Classificada')`) — mesma lista fechada já usada em `compras_cartao.classificacao` (`06-cartao-credito.md`).

**Fora do escopo de `CHECK`** (regra de camada de aplicação, `arquitetura-fisica-banco.md` §6):
- Toda Movimentação deve ter exatamente um `VÍNCULO_CONCILIAÇÃO` (relação 1:1 obrigatória) — garantido por `MovimentacaoBancariaService`, que cria os dois registros na mesma transação, nunca por trigger.
- Sinal do `valor` (Pagamento de Liquidação = saída/negativo, Recebimento = entrada/positivo) — decisão de representação técnica em `MovimentacaoBancariaService#gerarAPartirDeLiquidacao`, sem constraint de banco.

**DEFAULT**: `classificacao` = `'Não Classificada'`.

**Índices previstos**: índice de FK padrão em `conta_bancaria_id` (`idx_movimentacoes_bancarias_conta_bancaria_id`).

**Observações**:
- Sem criação livre pelo usuário como fato novo — só nasce por importação de extrato (`MovimentacaoBancariaService#importar`, upload manual — T5 já cobre a necessidade hoje) ou geração automática ao registrar uma Liquidação Financeira (`LiquidacaoFinanceiraService#criar` → `MovimentacaoBancariaService#gerarAPartirDeLiquidacao`, mesma transação; Vínculo já nasce `Confirmado`, não `Sugerido`, porque a correspondência é certa por construção).
- Campos factuais (`conta_bancaria_id`, `data`, `descricao`, `valor`) sem mecanismo de edição na camada de aplicação — só `classificacao` é mutável (`MovimentacaoBancaria#reclassificar`). Mecanismo de bloqueio de edição a nível de schema não implementado, mesma reserva já registrada para `liquidacoes_financeiras`/`aplicacoes_de_liquidacao` (`03-liquidacao-financeira.md`, `04-aplicacao-de-liquidacao.md`).
- `classificacao = 'Transferência Interna'` só é atribuída via `TransferenciaInternaService#criar` — `MovimentacaoBancariaService#reclassificar` recusa esse valor explicitamente, para preservar a garantia de que toda Movimentação com essa classificação tem uma `TRANSFERÊNCIA_INTERNA` real por trás.
- "Saldo da conta" não é campo desta tabela nem de `contas_bancarias` — sempre consulta agregada sobre o conjunto de Movimentações de uma Conta (mesmo princípio já registrado em `10-conta-bancaria.md`).

---

## `transferencias_internas` (TRANSFERÊNCIA_INTERNA)

**Finalidade**: vincula duas Movimentações Bancárias que são, juntas, uma transferência entre contas próprias do grupo — nunca receita, nunca despesa.

| Coluna | Categoria de tipo | Obrigatória | FK / Observação |
|---|---|---|---|
| `id` | Identificador | Sim | PK |
| `movimentacao_origem_id` | Identificador (FK) | Sim | → `movimentacoes_bancarias.id`; Movimentação de onde o dinheiro saiu |
| `movimentacao_destino_id` | Identificador (FK) | Sim | → `movimentacoes_bancarias.id`; Movimentação para onde o dinheiro entrou; mutuamente exclusiva com `movimentacao_origem_id` |
| `valor` | Monetário (`NUMERIC`) | Sim | — |
| `data` | Data | Sim | — |

**PK**: `id` — `pk_transferencias_internas`

**FKs**: `fk_transferencias_internas_movimentacao_origem` (`movimentacao_origem_id` → `movimentacoes_bancarias.id`); `fk_transferencias_internas_movimentacao_destino` (`movimentacao_destino_id` → `movimentacoes_bancarias.id`) — ambas `ON DELETE RESTRICT`.

**NOT NULL**: todas as colunas.

**UNIQUE**: `uq_transferencias_internas_movimentacao_origem` (`movimentacao_origem_id`); `uq_transferencias_internas_movimentacao_destino` (`movimentacao_destino_id`) — cada Movimentação só pode ser origem de, no máximo, uma Transferência, e só destino de, no máximo, uma Transferência (relação "1:1 opcional" do documento de domínio). O cruzamento entre as duas colunas — a mesma Movimentação não pode ser origem de uma Transferência **e** destino de outra — não é expressável por `UNIQUE` simples (checagem multi-linha); validado em `TransferenciaInternaService#criar` via `TransferenciaInternaRepository#existeTransferenciaEnvolvendoAlgumaDas`.

**CHECK**: `ck_transferencias_internas_valor_positivo` (`valor > 0`); `ck_transferencias_internas_origem_destino_distintos` (`movimentacao_origem_id <> movimentacao_destino_id`).

**DEFAULT**: nenhum.

**Índices previstos**: um por FK — `idx_transferencias_internas_movimentacao_origem_id`, `idx_transferencias_internas_movimentacao_destino_id` (redundantes com os índices implícitos das constraints `UNIQUE` correspondentes, mas nomeados explicitamente para manter o padrão do projeto de um índice de FK nomeado por relacionamento).

**Observações**:
- Ao criar uma Transferência Interna, a `classificacao` das duas Movimentações vinculadas passa a `'Transferência Interna'` automaticamente, na mesma transação (`TransferenciaInternaService#criar`) — regra do relacionamento (`12-movimentacao-bancaria.md`, Seção 3: "quando isso ocorre, a `classificação` correspondente deve ser Transferência Interna").
- Sem setters na entidade — "Regras de alteração: não definidas" no documento de domínio (`13-transferencia-interna.md`, Seção 4); tratada com a mesma cautela já aplicada a `LiquidacaoFinanceira`/`AplicacaoDeLiquidacao` (princípio 2: não expor edição sem confirmação de negócio).
- Nunca gera `LANÇAMENTO_FINANCEIRO` (regra 5 do conceitual) — por isso, sem qualquer FK para `lancamentos_financeiros` nesta tabela.
- Sugestão determinística por valor+data (criação automática) é regra técnica de correspondência, nunca confundida com `SUGESTÃO_IA` — não implementada nesta primeira entrega do módulo (só criação manual pelo usuário); ver `TransferenciaInternaService`, nota de escopo.

---

## `vinculos_conciliacao` (VÍNCULO_CONCILIAÇÃO)

**Finalidade**: estado da conferência entre uma Movimentação Bancária e uma Liquidação Financeira — dimensão independente de `classificacao`, nunca fundidas.

| Coluna | Categoria de tipo | Obrigatória | FK / Observação |
|---|---|---|---|
| `id` | Identificador | Sim | PK |
| `movimentacao_bancaria_id` | Identificador (FK) | Sim | → `movimentacoes_bancarias.id`; imutável — a Movimentação à qual o Vínculo se refere não muda |
| `liquidacao_financeira_id` | Identificador (FK) | Não | → `liquidacoes_financeiras.id`; nulo quando `estado_conciliacao` ∈ (`Não Vinculado`, `Sem Correspondência`) |
| `estado_conciliacao` | Enumerado/lista fechada | Sim | `Não Vinculado` / `Sugerido` / `Confirmado` / `Divergente` / `Sem Correspondência`. Default `Não Vinculado` |

**PK**: `id` — `pk_vinculos_conciliacao`

**FKs**: `fk_vinculos_conciliacao_movimentacao_bancaria` (`movimentacao_bancaria_id` → `movimentacoes_bancarias.id`); `fk_vinculos_conciliacao_liquidacao_financeira` (`liquidacao_financeira_id` → `liquidacoes_financeiras.id`) — ambas `ON DELETE RESTRICT`.

**NOT NULL**: `id`, `movimentacao_bancaria_id`, `estado_conciliacao`. `liquidacao_financeira_id` nulável.

**UNIQUE**: `uq_vinculos_conciliacao_movimentacao_bancaria` (`movimentacao_bancaria_id`) — relação 1:1 obrigatória, toda Movimentação tem exatamente um Vínculo; `uq_vinculos_conciliacao_liquidacao_financeira` (`liquidacao_financeira_id`) — relação 1:1 opcional, uma Liquidação tem no máximo um Vínculo correspondente.

**CHECK**: `ck_vinculos_conciliacao_estado` (`estado_conciliacao IN ('Não Vinculado', 'Sugerido', 'Confirmado', 'Divergente', 'Sem Correspondência')`); `ck_vinculos_conciliacao_liquidacao_coerente_com_estado` — `liquidacao_financeira_id` é `NULL` se e somente se `estado_conciliacao` ∈ (`Não Vinculado`, `Sem Correspondência`), e não-nulo se e somente se `estado_conciliacao` ∈ (`Sugerido`, `Confirmado`, `Divergente`). Mesmo padrão de `CHECK` multi-coluna já usado em `parcelas` (`06-cartao-credito.md`, `ck_parcelas_origem_exclusiva`).

**Fora do escopo de `CHECK`**: divergência de valor entre Movimentação e Liquidação nunca é resolvida automaticamente (regra confirmada, `14-vinculo-conciliacao.md` Seção 2) — `VinculoConciliacaoService#confirmar` recusa confirmar quando os valores não coincidem, exigindo a transição explícita para `Divergente`; não é uma constraint de banco, é regra de aplicação.

**DEFAULT**: `estado_conciliacao` = `'Não Vinculado'`.

**Índices previstos**: um por FK — `idx_vinculos_conciliacao_movimentacao_bancaria_id`, `idx_vinculos_conciliacao_liquidacao_financeira_id`.

**Observações**:
- Gerado automaticamente para toda Movimentação Bancária que existir (regra determinística, `14-vinculo-conciliacao.md` Seção 4) — `MovimentacaoBancariaService` cria o Vínculo na mesma transação da Movimentação: `Não Vinculado` na importação de extrato, `Confirmado` direto quando gerada a partir de uma Liquidação (correspondência certa por construção, sem passar por `Sugerido`).
- Sugestão automática (`VinculoConciliacaoService#rodarSugestaoAutomatica`) casa Movimentação × Liquidação por mesma Conta Bancária, mesmo valor absoluto e data dentro da tolerância configurável (T6) — nunca grava `Confirmado` sozinha, só `Sugerido` (candidata encontrada) ou `Sem Correspondência` (nenhuma candidata). Movimentação já classificada `Transferência Interna` é marcada `Sem Correspondência` direto, sem tentar matching (regra 5 do conceitual: Transferência Interna nunca gera Liquidação).
- Vínculo manual (`VinculoConciliacaoService#vincularManualmente`) permite ao usuário escolher a Liquidação diretamente — confirma direto se os valores batem, ou marca `Divergente` se não batem (mesma regra de "divergência nunca confirma sozinha", aqui já resolvida no ato pelo usuário).

---

*Nenhuma outra entidade foi modelada nesta etapa.*
