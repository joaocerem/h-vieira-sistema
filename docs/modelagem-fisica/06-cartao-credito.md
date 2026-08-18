# Modelagem Física — Módulo Cartão de Crédito
## Fase 3, Etapa 3.3.6 — `COMPRA_CARTÃO`, `FATURA`, `PARCELA`

Categorias de tipo físico referenciam `arquitetura-fisica-banco.md`, Seção 5, mais a categoria "Numérico inteiro" (ver validação prévia — lacuna técnica de §5, não decisão de domínio). Sem SQL.

**Validação prévia**: sem bloqueio (ver mensagem anterior) — D11 resolvida como remoção de `PARCELA.status` (`decisions.md` decisão #32), sem impacto de schema. `CARTÃO_CRÉDITO` (`17-cartao-credito.md`) não modelado nesta etapa — fora do escopo definido; referenciado por nome de tabela (`cartoes_credito`).

---

## `compras_cartao` (COMPRA_CARTÃO)

| Coluna | Categoria de tipo | Obrigatória | FK / Observação |
|---|---|---|---|
| `id` | Identificador | Sim | PK |
| `cartao_id` | Identificador (FK) | Sim | → `cartoes_credito.id`; imutável (inferência) |
| `fornecedor_id` | Identificador (FK) | Sim | → `fornecedores.id` |
| `valor` | Monetário (`NUMERIC`) | Sim | — |
| `data` | Data | Sim | — |
| `categoria_id` | Identificador (FK) | Sim | → `categorias.id` |
| `classificacao` | Enumerado — fechado (Terraplanagem / Fora da Operação / Transferência Interna / Retirada do Patrão / Não Classificada) | Sim | Default `Não Classificada` |
| `obra_id` | Identificador (FK) | Não | → `obras.id` |
| `veiculo_id` | Identificador (FK) | Não | → `veiculos.id` |
| `numero_parcelas` | Numérico inteiro | Sim | Default `1`; imutável (inferência) |

**PK**: `id` — `pk_compras_cartao`

**FKs**: `fk_compras_cartao_cartao`, `fk_compras_cartao_fornecedor`, `fk_compras_cartao_categoria`, `fk_compras_cartao_obra`, `fk_compras_cartao_veiculo` — todas `ON DELETE RESTRICT`.

**NOT NULL**: `id`, `cartao_id`, `fornecedor_id`, `valor`, `data`, `categoria_id`, `classificacao`, `numero_parcelas`.

**UNIQUE**: nenhuma.

**CHECK**: `ck_compras_cartao_valor_positivo` (`valor` > 0); `ck_compras_cartao_classificacao` (`classificacao` ∈ 5 valores fechados); `ck_compras_cartao_numero_parcelas_positivo` (`numero_parcelas` > 0).

**DEFAULT**: `classificacao` = `'Não Classificada'`; `numero_parcelas` = `1` (ambos já inferidos no próprio domínio, `18-compra-cartao.md` Seção 2).

**Índices previstos**: um por FK.

**Observações**:
- **Sem coluna/FK para `FATURA`** — confirmado: relação só transitiva via `PARCELA` (correção de consistência já aplicada na Fase 2).
- **D5, resolvida (`decisions.md`, decisão #27).** Correção de `categoria_id`/`obra_id`/`veiculo_id` propaga automaticamente para o `LANÇAMENTO_FINANCEIRO` já gerado, exceto quando já existe `rateio_despesa` vinculado (desacoplamento definitivo). Não afeta a estrutura de colunas desta tabela — regra de sincronização de camada de aplicação.
- `valor`: o domínio (`18-compra-cartao.md` Seção 2) marca mutabilidade como "Sim, sujeito à mesma cautela de `LANÇAMENTO_FINANCEIRO.valor` — não confirmado explicitamente". Nenhuma constraint de imutabilidade é aplicada aqui — a coluna permanece livremente mutável, sem inferir uma política mais restritiva do que o texto afirma.
- **Fora do escopo de `CHECK`** (regra multi-tabela, camada de aplicação — `arquitetura-fisica-banco.md` §6): quando aplicável (compra classificada Terraplanagem), cada Parcela originada desta Compra Cartão gera um `LANÇAMENTO_FINANCEIRO` ao vencer (Seção 7 do conceitual; `18-compra-cartao.md` Seção 4) — não expressável como `CHECK` de tabela única; já refletido do lado de `parcelas.lancamento_financeiro_id`.

---

## `faturas` (FATURA)

| Coluna | Categoria de tipo | Obrigatória | FK / Observação |
|---|---|---|---|
| `id` | Identificador | Sim | PK |
| `cartao_id` | Identificador (FK) | Sim | → `cartoes_credito.id`; imutável |
| `ciclo` | Texto curto | Sim | Imutável |
| `valor_total_calculado` | Monetário (`NUMERIC`) | Sim | Persistido como retrato histórico congelado — exceção justificada ao princípio 6 (`principios-de-modelagem.md`, princípio 7) |
| `valor_cobrado` | Monetário (`NUMERIC`) | Sim | Mutável até confirmação, depois congelado — ver observações |
| `liquidacao_financeira_id` | Identificador (FK) | Não | → `liquidacoes_financeiras.id` — preenchida quando a Fatura é paga (`modelo-logico.md` §3.19: "Fatura 1:1 Liquidação Financeira, opcional") |

**PK**: `id` — `pk_faturas`

**FKs**: `fk_faturas_cartao` (`cartao_id` → `cartoes_credito.id`); `fk_faturas_liquidacao_financeira` (`liquidacao_financeira_id` → `liquidacoes_financeiras.id`) — ambas `ON DELETE RESTRICT`.

**NOT NULL**: `id`, `cartao_id`, `ciclo`, `valor_total_calculado`, `valor_cobrado`. `liquidacao_financeira_id` nulável (só preenchida quando a Fatura é paga).

**UNIQUE**: `uq_faturas_cartao_ciclo` em (`cartao_id`, `ciclo`) — "um Cartão gera uma Fatura por ciclo" é cardinalidade literal (`19-fatura.md` Seção 3), não inferência. `uq_faturas_liquidacao_financeira` em `liquidacao_financeira_id` — impõe a cardinalidade 1:1 já consolidada (uma Liquidação paga no máximo uma Fatura).

**CHECK**: nenhum de positividade. Diferente dos demais campos `valor` da cadeia financeira, o conceitual **não declara explicitamente** que `valor_total_calculado`/`valor_cobrado` devem ser positivos — nenhum `CHECK` é adicionado aqui, para não inferir além do texto.

**DEFAULT**: nenhum.

**Índices previstos**: índice de FK padrão em `cartao_id` (a `UNIQUE` já cobre a consulta por `cartao_id` + `ciclo`); `liquidacao_financeira_id` já recebe índice implícito da `UNIQUE`.

**Observações**:
- `valor_total_calculado`: a fase "calculada" (antes do fechamento) não corresponde a nenhuma linha física desta tabela — a Fatura só nasce, já com o valor congelado, no momento do fechamento do ciclo. Não há `UPDATE` de recálculo a modelar.
- **Fora do escopo de `CHECK`** (regra multi-tabela, camada de aplicação — `arquitetura-fisica-banco.md` §6): no momento do fechamento, `valor_total_calculado` deve ser igual à soma dos valores das Parcelas do ciclo então conhecidas (`19-fatura.md` Seção 2) — não expressável como `CHECK` de tabela única, pois depende de agregação sobre `parcelas`.
- **`valor_cobrado` — congelamento sem marcador físico.** O domínio (`19-fatura.md` Seção 4) diz que o campo é "confirmado/ajustado pelo usuário" antes de congelar, mas **não define nenhum campo (ex. booleano de confirmação) que distinga fisicamente os dois estados**. Nenhum campo novo foi criado aqui para resolver isso — seria inventar estrutura não documentada. O bloqueio de `UPDATE` pós-confirmação fica, por ora, inteiramente a cargo da camada de aplicação, sem mecanismo físico definido.
- Vincular Parcelas descobertas depois a uma Fatura já fechada (Decisão 6) **não requer nenhum `UPDATE` nesta tabela** — só em `parcelas.fatura_id`.

---

## `parcelas` (PARCELA)

| Coluna | Categoria de tipo | Obrigatória | FK / Observação |
|---|---|---|---|
| `id` | Identificador | Sim | PK |
| `origem` | Enumerado — fechado (Compra Cartão / Contrato Financeiro) | Sim | Imutável |
| `compra_cartao_id` | Identificador (FK) | Condicional | → `compras_cartao.id` — só quando `origem` = Compra Cartão |
| `contrato_financeiro_id` | Identificador (FK) | Condicional | → `contratos_financeiros.id` (tabela de módulo futuro) — só quando `origem` = Contrato Financeiro |
| `numero` | Numérico inteiro | Sim | Imutável |
| `total` | Numérico inteiro | Sim | Imutável |
| `valor` | Monetário (`NUMERIC`) | Sim | — |
| `vencimento` | Data | Sim | — |
| `fatura_id` | Identificador (FK) | Não | → `faturas.id` — só aplicável quando `origem` = Compra Cartão; permanente uma vez atribuído |
| `lancamento_financeiro_id` | Identificador (FK) | Não | → `lancamentos_financeiros.id` — opcional, só preenchida quando a Parcela efetivamente gerou um Lançamento ao vencer |

**PK**: `id` — `pk_parcelas`

**FKs**: `fk_parcelas_compra_cartao` (`compra_cartao_id` → `compras_cartao.id`); `fk_parcelas_contrato_financeiro` (`contrato_financeiro_id` → `contratos_financeiros.id`); `fk_parcelas_fatura` (`fatura_id` → `faturas.id`); `fk_parcelas_lancamento_financeiro` (`lancamento_financeiro_id` → `lancamentos_financeiros.id`) — todas `ON DELETE RESTRICT`.

**NOT NULL**: `id`, `origem`, `numero`, `total`, `valor`, `vencimento`. `compra_cartao_id`/`contrato_financeiro_id`/`fatura_id`/`lancamento_financeiro_id` nuláveis a nível de coluna.

**UNIQUE**: `uq_parcelas_lancamento_financeiro` em `lancamento_financeiro_id` — cardinalidade 1:1 explícita ("Parcela → Lançamento Financeiro, 1:1 (opcional)", `21-parcela.md` Seção 3; `modelo-logico.md` §3.21). `(compra_cartao_id, número)` seria candidato plausível para impedir duas Parcelas com o mesmo número no mesmo parcelamento, mas **não há declaração explícita** disso no texto-fonte — não presumido, mesmo critério já usado para não aplicar `UNIQUE` a `USUÁRIO.identificador_de_acesso`.

**CHECK previstos**:
- `ck_parcelas_origem` — `origem` ∈ {Compra Cartão, Contrato Financeiro}.
- `ck_parcelas_origem_exclusiva` — exatamente um entre `compra_cartao_id`/`contrato_financeiro_id` preenchido, conforme `origem` (Seção 4, `21-parcela.md`).
- `ck_parcelas_fatura_apenas_compra_cartao` — `fatura_id` só pode ser não nulo quando `origem` = Compra Cartão.
- `ck_parcelas_numero_positivo` — `numero` > 0.
- `ck_parcelas_numero_menor_igual_total` — `numero` ≤ `total`.
- `ck_parcelas_total_positivo` — `total` > 0.
- `ck_parcelas_valor_positivo` — `valor` > 0.

**Fora do escopo de `CHECK`**:
- `total` deve corresponder a `compras_cartao.numero_parcelas` quando `origem` = Compra Cartão (`21-parcela.md` Seção 2) — regra multi-tabela, camada de aplicação (`arquitetura-fisica-banco.md` §6).

**DEFAULT**: nenhum.

**Índices previstos**: um por FK (`compra_cartao_id`, `contrato_financeiro_id`, `fatura_id`); `lancamento_financeiro_id` já recebe índice implícito da `UNIQUE`. `vencimento` é candidato plausível para consultas do motor de geração de Lançamento — não decidido nesta etapa.

**Observações**:
- Vínculo `fatura_id` permanente uma vez atribuído (Seção 3): mecanismo de bloqueio pós-atribuição (trigger ou revogação de privilégio) não escolhido nesta etapa — mesma reserva já usada nas tabelas anteriores.
- Regra de atribuição de ciclo (próximo ciclo aberto vs. fonte externa autoritativa, usando `LOG_AUDITORIA.data/hora`) é inteiramente lógica de aplicação — já resolvida como regra de negócio (Decisão 7), não afeta a estrutura desta tabela.
- Criação de todas as Parcelas de um parcelamento, de uma vez, no momento do registro da Compra ou do Contrato — requisito de atomicidade de camada de aplicação, mesmo padrão já usado para Liquidação+Aplicações.
- **D11 resolvida (`decisions.md`, decisão #32): coluna `status` removida, não só deixada sem `CHECK`.** O "estado" da Parcela é sempre calculado em consulta a partir de `vencimento` e `lancamento_financeiro_id` (já presente nesta tabela) — sem duplicar informação já coberta por essa FK.

---

*Nenhuma outra entidade foi modelada nesta etapa. `CARTÃO_CRÉDITO` permanece fora de escopo.*
