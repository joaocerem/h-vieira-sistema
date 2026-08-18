# Modelagem Física — `CONTA_BANCÁRIA`
## Fase 4 — Execução de especificação pendente da Fase 3 (Etapa 3.3)

**Nota de proveniência**: esta entidade estava 100% especificada em `domain-model/08-conta-bancaria.md` e `modelo-logico.md` §3.08 desde a Fase 2/3, mas não foi traduzida em modelagem física durante a Etapa 3.3 (que cobriu só `EMPRESA`, `USUÁRIO`, `CLIENTE`, `FORNECEDOR`, `CATEGORIA` em `01-cadastros-basicos.md`). Este documento **não é uma nova decisão** — traduz exatamente o que já estava definido, identificado como bloqueio real na auditoria de prontidão para implementação. Numeração `10` por ser a próxima etapa livre da sequência física, não por reabrir a Etapa 3.3 original.

**Validação prévia**: sem bloqueio — nenhuma pendência aberta afeta esta entidade (`domain-model/08-conta-bancaria.md`, Seção 7).

---

## Colunas

| Coluna | Categoria de tipo | Obrigatória | FK / Observação |
|---|---|---|---|
| `id` | Identificador | Sim | PK |
| `empresa_id` | Identificador (FK) | Sim | → `empresas.id` |
| `banco` | Texto curto | Sim | — |
| `apelido` | Texto curto | Sim | — |

---

## PK
`id` — `pk_contas_bancarias`

## FKs
- `fk_contas_bancarias_empresa` (`empresa_id` → `empresas.id`), `ON DELETE RESTRICT` — padrão de `arquitetura-fisica-banco.md` §7.

## NOT NULL
`id`, `empresa_id`, `banco`, `apelido` — todos obrigatórios, sem exceção condicional.

## UNIQUE
Nenhuma — o conceitual não declara cadastro único para Conta Bancária.

## CHECK
Nenhum previsto — nenhum campo desta entidade tem regra de validação fechada além de "não vazio" (texto), não expressável como `CHECK` sem inventar critério (mesmo padrão já usado para os demais campos de texto livre do projeto).

## DEFAULT
Nenhum — nenhum campo tem valor padrão documentado.

## Índices previstos
- Índice de FK padrão em `empresa_id` (`arquitetura-fisica-banco.md` §8; critério base de B3, `decisions.md` decisão #37 — toda FK recebe índice, independentemente de consulta específica).
- Nenhum índice adicional — nenhuma consulta ou regra de negócio já documentada usa `banco`/`apelido` como filtro/agregação frequente (critério objetivo de B3).

## Observações

- **`saldo` explicitamente fora desta tabela** — sempre calculado a partir da soma de `movimentacoes_bancarias` (ainda não implementada, módulo de Conciliação), nunca coluna aqui (princípio 8; `08-conta-bancaria.md` Seção 2 e Seção 5).
- **Conecta referências já declaradas, antes pendentes**: `liquidacoes_financeiras.conta_bancaria_id` (`modelagem-fisica/03-liquidacao-financeira.md`) e `contratos_financeiros.conta_bancaria_id` (`modelagem-fisica/07-contrato-financeiro.md`) já nomeavam a FK de destino — a criação desta tabela permite, agora, adicionar essas constraints em `database/03_constraints.sql`, sem alterar nenhum dos dois documentos.
- `cartoes_credito.conta_bancaria_id` (nova, ver `11-cartao-credito.md`) também referencia esta tabela.
- `movimentacoes_bancarias`, `transferencias_internas` e `vinculos_conciliacao` (módulo de Conciliação Bancária) permanecem fora do escopo desta etapa — não modelados aqui, sem relação com a criação desta tabela.

---

*Entidade única modelada neste documento.*
