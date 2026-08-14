# Modelagem Física — `AJUSTE_FINANCEIRO`
## Fase 3, Etapa 3.3.5

Tabela: `ajustes_financeiros`. Categorias de tipo físico referenciam `arquitetura-fisica-banco.md`, Seção 5. Sem SQL.

**Validação prévia**: bloqueio parcial (ver mensagem anterior) — pendência **D13** afeta só a política de alteração de `tipo_ajuste`, `valor` e `data`. Restante da tabela modelado integralmente.

---

## Colunas

| Coluna | Categoria de tipo | Obrigatória | FK / Observação |
|---|---|---|---|
| `id` | Identificador | Sim | PK |
| `lancamento_original_id` | Identificador (FK) | Sim | → `lancamentos_financeiros.id` |
| `lancamento_ajuste_id` | Identificador (FK) | Sim | → `lancamentos_financeiros.id` |
| `tipo_ajuste` | Enumerado — fechado (Estorno / Reembolso / Crédito / Ajuste) | Sim | Mutabilidade **não definida — D13** |
| `valor` | Monetário (`NUMERIC`) | Sim | Mutabilidade **não definida — D13** |
| `data` | Data | Sim | Mutabilidade **não definida — D13** |
| `usuario_id` | Identificador (FK) | Sim | → `usuarios.id` |
| `observacao` | Texto longo | Não | Mutável (inferência do domínio — correção de anotação) |

---

## PK
`id` — `pk_ajustes_financeiros`

## FKs
- `fk_ajustes_financeiros_lancamento_original` (`lancamento_original_id` → `lancamentos_financeiros.id`), `ON DELETE RESTRICT`.
- `fk_ajustes_financeiros_lancamento_ajuste` (`lancamento_ajuste_id` → `lancamentos_financeiros.id`), `ON DELETE RESTRICT`.
- `fk_ajustes_financeiros_usuario` (`usuario_id` → `usuarios.id`), `ON DELETE RESTRICT`.

## NOT NULL
`id`, `lancamento_original_id`, `lancamento_ajuste_id`, `tipo_ajuste`, `valor`, `data`, `usuario_id`. `observacao` nulável.

## UNIQUE
- `uq_ajustes_financeiros_lancamento_ajuste` em `lancamento_ajuste_id` — cardinalidade 1:1 explícita ("cada Ajuste gera exatamente um Lançamento de ajuste", `15-ajuste-financeiro.md` Seção 3).
- **Sem** `UNIQUE` em `lancamento_original_id` — um Lançamento original pode receber vários Ajustes (1:N, mesma Seção).

## CHECK
- `ck_ajustes_financeiros_tipo_ajuste` — `tipo_ajuste` ∈ {Estorno, Reembolso, Crédito, Ajuste}.
- `ck_ajustes_financeiros_valor_positivo` — `valor` > 0.
- `ck_ajustes_financeiros_lancamentos_distintos` — `lancamento_original_id` ≠ `lancamento_ajuste_id` (regra de integridade explícita, Seção 4).

## DEFAULT
Nenhum documentado.

## Índices previstos
- Índice de FK padrão em `lancamento_original_id` e `usuario_id` (`arquitetura-fisica-banco.md` §8).
- `lancamento_ajuste_id` já recebe índice implícito da `UNIQUE`.

## Observações
- **Exclusão física**: não utilizada — coberta pela política geral (`arquitetura-fisica-banco.md` §7, "nada desaparece"), aplicável diretamente por `AJUSTE_FINANCEIRO` representar um fato financeiro. Não depende de D13.
- **Imutabilidade de `lancamento_original_id` e `lancamento_ajuste_id`**: já inferida no próprio domínio, na classificação oficial de "Imutáveis" de `15-ajuste-financeiro.md` Seção 5 (vínculo formal não faz sentido se reatribuível) — mecanismo exato de bloqueio no schema não escolhido nesta etapa, mesma reserva já registrada em `02-lancamento-financeiro.md`.
- **`usuario_id` — imutabilidade não confirmada.** A Seção 2 de `15-ajuste-financeiro.md` chega a indicar "Não" para esse campo, mas a classificação oficial de "Imutáveis" da Seção 5 do mesmo documento **não inclui** `usuário` nessa lista — divergência interna da própria fonte, não uma regra consolidada. Este documento segue a Seção 5 (mesmo critério de `modelo-logico.md` §3.15, que também não marca `usuário` como imutável). Nenhuma constraint ou observação de imutabilidade é aplicada a `usuario_id`.
- **Mutabilidade de `tipo_ajuste`, `valor`, `data` — pendência D13, sem solução aqui.** Nenhuma inferência foi feita, nenhuma estratégia física (trigger, `REVOKE`, ou permitir `UPDATE` livre) foi escolhida, nem provisoriamente. Esta seção deve ser revisada quando D13 for resolvida.
- **Criação exclusivamente humana** — `AÇÃO_PROPOSTA_IA` nunca gera Ajuste (Decisão 8); nenhuma coluna ou constraint desta tabela precisa acomodar origem via IA.
- Criação do Ajuste e do Lançamento de ajuste correspondente deve ser atômica (decorrência direta da cardinalidade 1:1) — implementação de camada de aplicação, mesmo padrão já usado para Liquidação+Aplicação.
- "Custo efetivo" (`valor` do Lançamento original menos Ajustes vinculados) não é campo desta tabela — sempre calculado em consulta sobre esta tabela e `lancamentos_financeiros` (princípio 8).

---

*Nenhuma outra entidade foi modelada nesta etapa.*
