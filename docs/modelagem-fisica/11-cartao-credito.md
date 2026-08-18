# Modelagem Física — `CARTÃO_CRÉDITO`
## Fase 4 — Execução de especificação pendente da Fase 3 (Etapa 3.3)

**Nota de proveniência**: esta entidade estava 100% especificada em `domain-model/17-cartao-credito.md` e `modelo-logico.md` §3.17 desde a Fase 2/3, mas não foi traduzida em modelagem física durante a Etapa 3.3.6 (`06-cartao-credito.md`), que cobriu só `COMPRA_CARTÃO`, `FATURA` e `PARCELA` — os três consumidores de `CARTÃO_CRÉDITO`, não a própria entidade. Este documento **não é uma nova decisão** — traduz exatamente o que já estava definido, identificado como bloqueio real na auditoria de prontidão para implementação. Depende de `10-conta-bancaria.md` já criada.

**Validação prévia**: sem bloqueio — nenhuma pendência aberta afeta esta entidade (`domain-model/17-cartao-credito.md`, Seção 7).

---

## Colunas

| Coluna | Categoria de tipo | Obrigatória | FK / Observação |
|---|---|---|---|
| `id` | Identificador | Sim | PK |
| `conta_bancaria_id` | Identificador (FK) | Sim | → `contas_bancarias.id` |
| `banco` | Texto curto | Sim | — |
| `apelido` | Texto curto | Sim | — |
| `dia_fechamento` | Numérico inteiro | Sim | — |
| `dia_vencimento` | Numérico inteiro | Sim | — |

---

## PK
`id` — `pk_cartoes_credito`

## FKs
- `fk_cartoes_credito_conta_bancaria` (`conta_bancaria_id` → `contas_bancarias.id`), `ON DELETE RESTRICT` — padrão de `arquitetura-fisica-banco.md` §7.

## NOT NULL
`id`, `conta_bancaria_id`, `banco`, `apelido`, `dia_fechamento`, `dia_vencimento` — todos obrigatórios, sem exceção condicional.

## UNIQUE
Nenhuma — o conceitual não declara cadastro único para Cartão de Crédito.

## CHECK
Nenhum previsto para `dia_fechamento`/`dia_vencimento`. O domínio (`17-cartao-credito.md` Seção 2) já sinaliza a faixa "1 a 31" como **"inferência de bom senso, não confirmada textualmente com essa faixa exata"** — mesmo critério já usado em outros campos do projeto (ex. `OBRA.valor_contratado` sem `CHECK` de positividade): não inferir restrição além do que o texto-fonte confirma.

## DEFAULT
Nenhum — nenhum campo tem valor padrão documentado.

## Índices previstos
- Índice de FK padrão em `conta_bancaria_id` (critério base de B3, `decisions.md` decisão #37).
- Nenhum índice adicional — nenhuma consulta ou regra já documentada usa `banco`/`apelido`/`dia_fechamento`/`dia_vencimento` como filtro/agregação frequente.

## Observações

- **Conecta referências já declaradas, antes pendentes**: `compras_cartao.cartao_id` e `faturas.cartao_id` (ambas em `modelagem-fisica/06-cartao-credito.md`) já nomeavam as FKs `fk_compras_cartao_cartao` e `fk_faturas_cartao` — a criação desta tabela permite adicionar essas constraints em `database/03_constraints.sql`, sem alterar nenhum dos dois documentos.
- Nenhuma regra de negócio própria além da já registrada em `COMPRA_CARTÃO`/`FATURA` (`17-cartao-credito.md` Seção 4).

---

*Entidade única modelada neste documento.*
