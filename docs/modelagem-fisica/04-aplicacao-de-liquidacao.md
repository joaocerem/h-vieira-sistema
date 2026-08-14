# Modelagem Física — `APLICAÇÃO_DE_LIQUIDAÇÃO`
## Fase 3, Etapa 3.3.4

Tabela: `aplicacoes_de_liquidacao`. Categorias de tipo físico referenciam `arquitetura-fisica-banco.md`, Seção 5. Sem SQL.

**Validação prévia**: sem bloqueio (ver mensagem anterior) — entidade sem pendência de domínio associada (`11-aplicacao-de-liquidacao.md`, Seção 7).

---

## Colunas

| Coluna | Categoria de tipo | Obrigatória | FK / Observação |
|---|---|---|---|
| `id` | Identificador | Sim | PK |
| `lancamento_financeiro_id` | Identificador (FK) | Sim | → `lancamentos_financeiros.id` |
| `liquidacao_financeira_id` | Identificador (FK) | Sim | → `liquidacoes_financeiras.id` |
| `valor_aplicado` | Monetário (`NUMERIC`) | Sim | — |

---

## PK
`id` — `pk_aplicacoes_de_liquidacao`

## FKs
- `fk_aplicacoes_de_liquidacao_lancamento_financeiro` (`lancamento_financeiro_id` → `lancamentos_financeiros.id`), `ON DELETE RESTRICT`.
- `fk_aplicacoes_de_liquidacao_liquidacao_financeira` (`liquidacao_financeira_id` → `liquidacoes_financeiras.id`), `ON DELETE RESTRICT`.

## NOT NULL
`id`, `lancamento_financeiro_id`, `liquidacao_financeira_id`, `valor_aplicado` — todos obrigatórios.

## UNIQUE
Nenhuma. Sem base textual para `UNIQUE(lancamento_financeiro_id, liquidacao_financeira_id)` — não confirmado que o par não possa se repetir.

## CHECK
- `ck_aplicacoes_de_liquidacao_valor_positivo` — `valor_aplicado` > 0.

**Fora do escopo de `CHECK`** (multi-linha/multi-tabela, camada de aplicação): soma de `valor_aplicado` por `lancamento_financeiro_id` não deveria ultrapassar `lancamentos_financeiros.valor`; soma de `valor_aplicado` por `liquidacao_financeira_id` não deveria ultrapassar `liquidacoes_financeiras.valor`. Ambas inferências, não regras confirmadas (`11-aplicacao-de-liquidacao.md` Seção 2).

## DEFAULT
Nenhum documentado.

## Índices previstos
- Índice de FK padrão em `lancamento_financeiro_id` e `liquidacao_financeira_id` (`arquitetura-fisica-banco.md` §8).
- Índice composto (`lancamento_financeiro_id`, `liquidacao_financeira_id`) é candidato plausível para consulta futura — não decidido nesta etapa.

## Observações
- **Imutável após criação — confirmado** (decorrência da Decisão 2: cancelamento de Lançamento é bloqueado havendo Aplicação; correção passa exclusivamente por `AJUSTE_FINANCEIRO`, que nunca toca esta tabela). Mecanismo exato de bloqueio no schema (trigger ou revogação de privilégio) não escolhido nesta etapa — mesma reserva já aplicada em `02-lancamento-financeiro.md`.
- Criação exclusivamente pelo sistema, disparada pelo registro de uma Liquidação — nunca inserção livre pelo usuário. Atomicidade junto com a criação da Liquidação é requisito já registrado (`arquitetura-tecnica.md` §5.3), não decisão nova.
- É o mecanismo formal por trás do cálculo de `status_financeiro` de `LANÇAMENTO_FINANCEIRO` — a futura view `vw_status_financeiro_lancamentos` (antecipada em `02-lancamento-financeiro.md`) lê desta tabela.

---

*Nenhuma outra entidade foi modelada nesta etapa.*
