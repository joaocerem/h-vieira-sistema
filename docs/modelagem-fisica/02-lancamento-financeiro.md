# Modelagem Física — `LANÇAMENTO_FINANCEIRO`
## Fase 3, Etapa 3.3.2

Tabela: `lancamentos_financeiros`. Categorias de tipo físico referenciam `arquitetura-fisica-banco.md`, Seção 5. Sem SQL.

> **Atualizado — Sprint 3 (rodada de evolução operacional)**: `APLICAÇÃO_DE_LIQUIDAÇÃO` e
> `AJUSTE_FINANCEIRO`, citadas abaixo, foram removidas (ver `decisions.md`, decisão #51).
> `valor` não tem mais restrição de mutabilidade; `status_financeiro` passa a ser calculado a
> partir de `VÍNCULO_CONCILIAÇÃO` (binário Conciliado/Não Conciliado). Trechos afetados
> atualizados abaixo.

---

## Colunas

| Coluna | Categoria de tipo | Obrigatória | FK / Observação |
|---|---|---|---|
| `id` | Identificador | Sim | PK |
| `tipo` | Enumerado — fechado (Despesa / Receita) | Sim | Imutável após criação (inferência estrutural forte, `09-lancamento-financeiro.md` Seção 2) |
| `empresa_id` | Identificador (FK) | Sim | → `empresas.id` — obrigatório desde a criação (D7, `decisions.md` decisão #21); deve corresponder a `veiculos.empresa_id` quando `veiculo_id` estiver preenchido — validação na camada de aplicação, não `CHECK` (não é possível referenciar outra tabela em `CHECK`) |
| `categoria_id` | Identificador (FK) | Sim | → `categorias.id` |
| `fornecedor_id` | Identificador (FK) | Condicional | → `fornecedores.id` — presente só quando `tipo` = Despesa |
| `cliente_id` | Identificador (FK) | Condicional | → `clientes.id` — presente só quando `tipo` = Receita |
| `obra_id` | Identificador (FK) | Não | → `obras.id` — opcional |
| `veiculo_id` | Identificador (FK) | Não | → `veiculos.id` — opcional, pode coexistir com `obra_id` |
| `valor` | Monetário (`NUMERIC`) | Sim | Sempre mutável (Sprint 3) — editar um Lançamento já conciliado nunca é bloqueado, dispara revalidação da conciliação |
| `data_competencia` | Data | Sim | — |
| `vencimento` | Data | Sim | — |
| `situacao_administrativa` | Enumerado — fechado (Ativo / Cancelado) | Sim | Default `Ativo` |
| `origem` | Enumerado — fechado (Manual / Cartão via Parcela / Contrato Financeiro via Parcela / Ação de IA Confirmada) | Sim | Imutável após criação |
| `descricao` | Texto livre (`TEXT`) | Não | Adicionada em `V16` (rodada de evolução operacional 2026-08) — sem `CHECK`/regra associada além da própria existência |
| `documento` | Texto livre (`TEXT`) | Não | Adicionada em `V16` (rodada de evolução operacional 2026-08) — número do documento fiscal/comprovante, sem `CHECK`/regra associada além da própria existência |

**`status_financeiro` não é coluna desta tabela.** É valor sempre calculado, nunca persistido (princípio 6). A partir da Sprint 3, calculado a partir da existência de um `VÍNCULO_CONCILIAÇÃO` `Confirmado` referenciando este Lançamento (binário: Conciliado/Não Conciliado) — `LancamentoFinanceiroService#calcularStatusFinanceiro`, sem view dedicada.

**Coluna `empresa_id` presente e obrigatória** — vínculo direto com Empresa resolvido por D7 (`decisions.md`, decisão #21); ver linha da tabela acima.

---

## PK
`id` — `pk_lancamentos_financeiros`

## FKs
- `fk_lancamentos_financeiros_empresa` (`empresa_id` → `empresas.id`)
- `fk_lancamentos_financeiros_categoria` (`categoria_id` → `categorias.id`)
- `fk_lancamentos_financeiros_fornecedor` (`fornecedor_id` → `fornecedores.id`)
- `fk_lancamentos_financeiros_cliente` (`cliente_id` → `clientes.id`)
- `fk_lancamentos_financeiros_obra` (`obra_id` → `obras.id`)
- `fk_lancamentos_financeiros_veiculo` (`veiculo_id` → `veiculos.id`)

Todas com `ON DELETE RESTRICT` — padrão de `arquitetura-fisica-banco.md` §7, sem exceção justificada para esta tabela.

## NOT NULL
`id`, `tipo`, `empresa_id`, `categoria_id`, `valor`, `data_competencia`, `vencimento`, `situacao_administrativa`, `origem`. `fornecedor_id`/`cliente_id`/`obra_id`/`veiculo_id` nuláveis a nível de coluna — obrigatoriedade condicional de `fornecedor_id`/`cliente_id` é resolvida via `CHECK` (abaixo), não via `NOT NULL` simples.

## UNIQUE
Nenhuma — o conceitual não declara cadastro único para Lançamento Financeiro.

## CHECK previstos
- `ck_lancamentos_financeiros_tipo` — `tipo` ∈ {Despesa, Receita}.
- `ck_lancamentos_financeiros_situacao_administrativa` — `situacao_administrativa` ∈ {Ativo, Cancelado}.
- `ck_lancamentos_financeiros_origem` — `origem` ∈ {Manual, Cartão via Parcela, Contrato Financeiro via Parcela, Ação de IA Confirmada}.
- `ck_lancamentos_financeiros_valor_positivo` — `valor` > 0.
- `ck_lancamentos_financeiros_fornecedor_cliente_exclusivo` — exatamente um entre `fornecedor_id`/`cliente_id` preenchido, conforme `tipo` (`tipo`=Despesa ⇒ `fornecedor_id` preenchido e `cliente_id` nulo; `tipo`=Receita ⇒ o inverso). Regra já fechada e objetiva (Seção 4, `09-lancamento-financeiro.md`) — elegível a `CHECK` por `arquitetura-fisica-banco.md` §6.

**Fora do escopo de `CHECK`** (regra multi-tabela, pertence à camada de aplicação — `arquitetura-fisica-banco.md` §6): exclusividade entre `obra_id` preenchido e a existência de linhas em `RATEIO_DESPESA` para o mesmo Lançamento; consistência entre `empresa_id` e `veiculos.empresa_id` quando `veiculo_id` estiver preenchido (D7, `decisions.md` decisão #21) — `CHECK` não pode referenciar outra tabela em PostgreSQL, validada no caso de uso de criação. Nenhuma dessas é resolvida nesta tabela isoladamente.

## DEFAULT previstos
- `situacao_administrativa` = `'Ativo'`.

## Índices previstos
- Um por FK (`empresa_id`, `categoria_id`, `fornecedor_id`, `cliente_id`, `obra_id`, `veiculo_id`) — política padrão, `arquitetura-fisica-banco.md` §8.
- `idx_lancamentos_financeiros_data_competencia` — candidato explícito já citado em `arquitetura-tecnica.md`, Seção 7, para consultas agregadas (Balanço, custo de Obra/Veículo).

## Observações
- `tipo` e `origem` imutáveis: mecanismo exato de bloqueio no schema (trigger ou revogação de privilégio) não decidido nesta etapa — `arquitetura-fisica-banco.md` §7 já reserva essa escolha para a modelagem física de cada tabela, sem fixar qual. `valor` deixou de ser condicionalmente imutável na Sprint 3 (sempre editável).
- FKs para `obras` e `veiculos` referenciam tabelas ainda não modeladas fisicamente nesta etapa (módulos futuros) — nomes já fixados pela convenção de nomenclatura (`arquitetura-fisica-banco.md` §4), sem necessidade de antecipar a estrutura completa dessas tabelas.

---

*Nenhuma outra entidade foi modelada nesta etapa.*
