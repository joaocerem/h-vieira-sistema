# Modelagem Física — `MOVIMENTAÇÃO_BANCÁRIA`, `TRANSFERÊNCIA_INTERNA`, `VÍNCULO_CONCILIAÇÃO`
## Fase 4 — Módulo Conciliação Bancária

**Nota sobre esta etapa**: diferente de `01` a `11` (escritos na Fase 3, antes de qualquer linha de código), este documento foi escrito durante a Fase 4 — depois da implementação do módulo Conciliação Bancária (migration Flyway `V15__conciliacao_bancaria.sql`, validada contra Postgres via Hibernate `ddl-auto: validate`). Reflete fielmente o schema já aplicado, sem propor nada novo. Categorias de tipo físico referenciam `arquitetura-fisica-banco.md`, Seção 5.

> **Atualizado — Sprint 3 (rodada de evolução operacional, `V17__conta_bancaria_cartao_sem_apelido.sql`,
> `V18__vinculo_conciliacao_lancamento_nn.sql`, `V19__remove_liquidacao_financeira.sql`)**: a
> seção `vinculos_conciliacao` abaixo foi reescrita — `liquidacao_financeira_id` (FK para
> `liquidacoes_financeiras`, tabela removida) deu lugar a `vinculos_conciliacao_lancamentos`
> (tabela de junção N:N com `lancamentos_financeiros`). Ver `decisions.md`, decisão #51.

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

**DEFAULT**: `classificacao` = `'Não Classificada'`.

**Índices previstos**: índice de FK padrão em `conta_bancaria_id` (`idx_movimentacoes_bancarias_conta_bancaria_id`).

**Observações**:
- Sem criação livre pelo usuário como fato novo — só nasce por importação de extrato (`MovimentacaoBancariaService#importar`, upload manual — T5 já cobre a necessidade hoje). Até a Sprint 3 também nascia automaticamente ao registrar uma Liquidação Financeira (`gerarAPartirDeLiquidacao`) — esse caminho foi removido junto com a entidade (ver decisão #51); importação é hoje o único caminho.
- Campos factuais (`conta_bancaria_id`, `data`, `descricao`, `valor`) sem mecanismo de edição na camada de aplicação — só `classificacao` é mutável (`MovimentacaoBancaria#reclassificar`).
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
- Sem setters na entidade — "Regras de alteração: não definidas" no documento de domínio (`13-transferencia-interna.md`, Seção 4) — princípio 2: não expor edição sem confirmação de negócio.
- Nunca gera `LANÇAMENTO_FINANCEIRO` (regra 5 do conceitual) — por isso, sem qualquer FK para `lancamentos_financeiros` nesta tabela.
- Sugestão determinística por valor+data (criação automática) é regra técnica de correspondência, nunca confundida com `SUGESTÃO_IA` — não implementada nesta primeira entrega do módulo (só criação manual pelo usuário); ver `TransferenciaInternaService`, nota de escopo.

---

## `vinculos_conciliacao` (VÍNCULO_CONCILIAÇÃO)

**Finalidade**: estado da conferência entre uma Movimentação Bancária e o(s) Lançamento(s) Financeiro(s) que ela corresponde — dimensão independente de `classificacao`, nunca fundidas.

> **Reescrita — Sprint 3.** Até `V17`, esta tabela tinha uma FK opcional `liquidacao_financeira_id`
> → `liquidacoes_financeiras.id`, com um `CHECK` multi-coluna coerente com o estado. `V18`
> adicionou a tabela de junção `vinculos_conciliacao_lancamentos` (N:N com `lancamentos_financeiros`),
> de forma aditiva. `V19` removeu `liquidacao_financeira_id` (coluna, FK, `UNIQUE` e o `CHECK`
> antigo) e a tabela `liquidacoes_financeiras`. O schema abaixo reflete o estado final (pós-`V19`).

| Coluna | Categoria de tipo | Obrigatória | FK / Observação |
|---|---|---|---|
| `id` | Identificador | Sim | PK |
| `movimentacao_bancaria_id` | Identificador (FK) | Sim | → `movimentacoes_bancarias.id`; imutável — a Movimentação à qual o Vínculo se refere não muda |
| `estado_conciliacao` | Enumerado/lista fechada | Sim | `Não Vinculado` / `Sugerido` / `Confirmado` / `Divergente` / `Sem Correspondência`. Default `Não Vinculado` |

**PK**: `id` — `pk_vinculos_conciliacao`

**FK**: `fk_vinculos_conciliacao_movimentacao_bancaria` (`movimentacao_bancaria_id` → `movimentacoes_bancarias.id`), `ON DELETE RESTRICT`.

**NOT NULL**: `id`, `movimentacao_bancaria_id`, `estado_conciliacao`.

**UNIQUE**: `uq_vinculos_conciliacao_movimentacao_bancaria` (`movimentacao_bancaria_id`) — relação 1:1 obrigatória, toda Movimentação tem exatamente um Vínculo.

**CHECK**: `ck_vinculos_conciliacao_estado` (`estado_conciliacao IN ('Não Vinculado', 'Sugerido', 'Confirmado', 'Divergente', 'Sem Correspondência')`). O `CHECK` multi-coluna que exigia `liquidacao_financeira_id` coerente com o estado (`ck_vinculos_conciliacao_liquidacao_coerente_com_estado`) foi removido em `V19` — sem substituto: a coerência entre `estado_conciliacao` e `vinculos_conciliacao_lancamentos` (vazio ⟺ Não Vinculado/Sem Correspondência) é garantida só pela camada de aplicação (`VinculoConciliacaoService`), não por `CHECK` de banco, já que a tabela de junção não pode ser referenciada diretamente por um `CHECK` de linha única.

**Fora do escopo de `CHECK`**: divergência entre Movimentação e Lançamento(s) nunca é resolvida automaticamente (regra confirmada, `14-vinculo-conciliacao.md` Seção 4) — `VinculoConciliacaoService#confirmar` recusa confirmar quando os critérios de compatibilidade não são atendidos, exigindo a transição explícita para `Divergente`; não é uma constraint de banco, é regra de aplicação.

**DEFAULT**: `estado_conciliacao` = `'Não Vinculado'`.

**Índices previstos**: `idx_vinculos_conciliacao_movimentacao_bancaria_id` (FK).

**Observações**:
- Gerado automaticamente para toda Movimentação Bancária que existir (regra determinística, `14-vinculo-conciliacao.md` Seção 4) — `MovimentacaoBancariaService` cria o Vínculo `Não Vinculado` na mesma transação da importação de extrato.
- Sugestão automática (`VinculoConciliacaoService#rodarSugestaoAutomatica`) casa Movimentação × Lançamento por mesma Empresa, mesma natureza, mesmo valor e vencimento dentro da tolerância configurável (T6) — nunca grava `Confirmado` sozinha, só `Sugerido` (candidato único encontrado) ou `Sem Correspondência` (nenhum candidato). Dois ou mais candidatos igualmente compatíveis: o sistema não escolhe, o Vínculo permanece `Não Vinculado`. Movimentação já classificada `Transferência Interna` é marcada `Sem Correspondência` direto, sem tentar matching (regra 5 do conceitual).
- Vínculo manual (`VinculoConciliacaoService#vincularManualmente`) permite ao usuário escolher um ou mais Lançamentos diretamente — confirma direto se os critérios de compatibilidade batem, ou marca `Divergente` se não batem.
- Edição/cancelamento de um Lançamento com Vínculo `Confirmado` dispara `revalidarConciliacao` — se deixar de ser compatível, o Vínculo vira `Divergente` sozinho (`LancamentoFinanceiroService#atualizar`/`#cancelar`).

---

## `vinculos_conciliacao_lancamentos` (junção N:N — Vínculo Conciliação × Lançamento Financeiro)

**Finalidade**: tabela de junção pura (`V18`) — só detalhe de persistência do `@ManyToMany` de `VinculoConciliacao#lancamentosFinanceiros`, sem entidade de domínio própria (decisão explícita do usuário: não recriar a complexidade de `APLICAÇÃO_DE_LIQUIDAÇÃO` com outro nome; ver `decisions.md`, decisão #51).

| Coluna | Categoria de tipo | Obrigatória | FK / Observação |
|---|---|---|---|
| `id` | Identificador | Sim | PK |
| `vinculo_conciliacao_id` | Identificador (FK) | Sim | → `vinculos_conciliacao.id` |
| `lancamento_financeiro_id` | Identificador (FK) | Sim | → `lancamentos_financeiros.id` |

**PK**: `id` — `pk_vinculos_conciliacao_lancamentos`

**FKs**: `fk_vcl_vinculo_conciliacao` (`vinculo_conciliacao_id` → `vinculos_conciliacao.id`); `fk_vcl_lancamento_financeiro` (`lancamento_financeiro_id` → `lancamentos_financeiros.id`) — ambas `ON DELETE RESTRICT`.

**NOT NULL**: todas as colunas.

**UNIQUE**: `uq_vinculos_conciliacao_lancamentos` (`vinculo_conciliacao_id`, `lancamento_financeiro_id`) — o par não se repete (mesmo Lançamento não é adicionado duas vezes ao mesmo Vínculo).

**Fora do escopo de `CHECK`**: um Lançamento só pode aparecer em, no máximo, uma linha desta tabela **no total** (não só por Vínculo) — ou seja, um Lançamento só pode estar ligado a um único Vínculo por vez, em qualquer estado. Não expressável como `UNIQUE` simples (não é por coluna isolada); garantido pela camada de aplicação (`VinculoConciliacaoRepository#existsByLancamentosFinanceiros_Id`, checado antes de sugerir/vincular).

**Sem coluna de valor por par** — diferente de `aplicacoes_de_liquidacao` (removida), não existe cobertura parcial: um Lançamento ligado a um Vínculo `Confirmado` conta pelo valor cheio.

**Índices**: `idx_vcl_vinculo_conciliacao_id`, `idx_vcl_lancamento_financeiro_id`.

---

*Nenhuma outra entidade foi modelada nesta etapa.*
