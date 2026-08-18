# AJUSTE_FINANCEIRO

## 1. Visão geral

**Finalidade**: vínculo formal entre um Lançamento original e um Lançamento de estorno, reembolso, crédito ou ajuste (conceitual, Seção 3 e Seção 9).

**Responsabilidade**: formalizar correções financeiras sem jamais alterar o Lançamento original — preservando o princípio "nada desaparece" (princípio 5) e a fonte única da verdade. O "custo efetivo" (valor original menos ajustes vinculados) é sempre uma soma calculada em consulta, nunca um número armazenado (Seção 9 do conceitual). É o único mecanismo oficial do sistema para correções após qualquer liquidação — distinto de Cancelamento, que só se aplica antes de qualquer efeito financeiro (`situação_administrativa` de `LANÇAMENTO_FINANCEIRO`).

**Quem cria**: Usuário — exclusivamente. Esta é uma regra arquitetural confirmada, não apenas uma leitura do catálogo original: `AÇÃO_PROPOSTA_IA` nunca pode formalizar uma proposta de criação de Ajuste Financeiro, independentemente do nível de sensibilidade ou de futuras regras de confirmação. A IA pode identificar indícios, inconsistências ou situações que normalmente levariam um usuário a criar um Ajuste, e pode comunicar isso em linguagem natural durante uma consulta — mas não pode transformar essa conclusão em ação estruturada do sistema (`AÇÃO_PROPOSTA_IA`), nem iniciar o fluxo formal de criação. A IA pode informar, explicar e recomendar; a iniciativa formal pertence exclusivamente ao usuário.

**Quem altera**: ninguém — imutável desde a criação, confirmado (D13, `decisions.md` decisão #34). Representa uma decisão de correção já tomada.

**Quem consulta**: `LANÇAMENTO_FINANCEIRO` (tanto o original quanto o de ajuste), o módulo de Balanço/Obra (para calcular custo líquido em consulta), Auditoria.

**Quem nunca deve alterar**: nenhum módulo automatizado (Conciliação, Cartão, Balanço, Obras, Frota, IA) cria ou altera Ajuste Financeiro — é estritamente uma ação humana e deliberada.

---

## 2. Campos

| Campo | Significado | Tipo conceitual | Obrigatório? | Valor padrão | Pode mudar depois de criado? | Quem pode alterar | Regra de validação | Observações |
|---|---|---|---|---|---|---|---|---|
| `lançamento_original` | O Lançamento que está sendo ajustado | Referência para outra entidade (Lançamento Financeiro) | Sim | Nenhum | Não — o vínculo com o original é definitivo | — | Deve referenciar um Lançamento existente | O Lançamento original nunca é alterado por causa deste vínculo |
| `lançamento_ajuste` | O novo Lançamento criado como consequência do ajuste | Referência para outra entidade (Lançamento Financeiro) | Sim | Nenhum | Não | — | Deve referenciar um Lançamento existente, criado especificamente para este ajuste | Relacionamento 1:1 — cada Ajuste gera exatamente um Lançamento de ajuste |
| `tipo_ajuste` | Natureza do ajuste | Lista de valores (Estorno / Reembolso / Crédito / Ajuste) | Sim | Nenhum | **Não — imutável (D13, `decisions.md` decisão #34)** | — | Um dos quatro valores | Os quatro convivem como valores do mesmo campo, sem diferença estrutural entre eles (Seção 9 do conceitual) |
| `valor` | Valor do ajuste | Valor monetário | Sim | Nenhum | **Não — imutável (D13)** | — | Deve ser um valor monetário válido | — |
| `data` | Data do ajuste | Data | Sim | Nenhum | **Não — imutável (D13)** | — | Deve ser uma data válida | — |
| `usuário` | Usuário responsável pelo ajuste | Referência para outra entidade (Usuário) | Sim | Nenhum | Não | — | Deve referenciar um Usuário existente | É a única entidade do catálogo oficial do conceitual que já previa explicitamente um campo de referência a usuário responsável, antes mesmo da pendência 5 ser resolvida. **Fora do escopo de D13** — não confirmado por esta decisão, permanece exatamente como já estava |
| `observação` | Nota livre sobre o motivo/contexto do ajuste | Texto | Não definido explicitamente — inferência: opcional, por ser um campo de anotação livre | Nenhum | **Não — imutável (D13, `decisions.md` decisão #34)** | — | Nenhuma | — |

---

## 3. Relacionamentos

| Relacionamento | Cardinalidade | Significado | Quem controla | Regras | Restrições |
|---|---|---|---|---|---|
| Lançamento Financeiro (original) → Ajuste Financeiro | 1:N | Um Lançamento original pode receber vários Ajustes ao longo do tempo | Usuário | O original nunca é alterado | — |
| Ajuste Financeiro → Lançamento Financeiro (de ajuste) | 1:1 | Cada Ajuste gera exatamente um novo Lançamento | Usuário | O Lançamento de ajuste segue o fluxo normal (Receita → Liquidação → Movimentação → Conciliação), inclusive podendo ocorrer em Conta Bancária diferente da original | — |

---

## 4. Regras da entidade

- **Campos mutuamente exclusivos**: nenhum identificado.
- **Campos obrigatórios por contexto**: nenhum além da obrigatoriedade geral.
- **Regras de criação**: sempre por ação humana explícita (Usuário); nunca automática; nunca por Ação de IA, mesmo confirmada — regra arquitetural, não limitação de implementação.
- **Regras de alteração**: nenhuma alteração é permitida após a criação — imutável, por regra confirmada (D13, `decisions.md` decisão #34), não mais por inferência. Consistente com o princípio 5 de modelagem, que cita "uma decisão já tomada" como exemplo de fato histórico não reescrito — `AJUSTE_FINANCEIRO` é, por definição, exatamente isso.
- **Regras de exclusão**: exclusão física não é utilizada — coberta pela regra geral já existente do projeto para entidades que representam fato financeiro (`arquitetura-fisica-banco.md`, §7, "nada desaparece"), formalmente confirmada como aplicável a esta entidade (D13, `decisions.md` decisão #34), sem regra nova criada.
- **Regras de auditoria**: toda criação deve ser registrada em `LOG_AUDITORIA`, incluindo a criação de `AJUSTE_FINANCEIRO` explicitamente citada como caso a cobrir (Seção 12 do conceitual).
- **Regras de integridade**: `lançamento_original` e `lançamento_ajuste` devem referenciar Lançamentos existentes e distintos entre si; `usuário` deve referenciar um Usuário existente.
- **Regras de negócio**:
  - O Lançamento original nunca é alterado nem apagado (Seção 9).
  - O "custo efetivo" (valor original menos ajustes vinculados) é sempre uma soma calculada em consulta, nunca um número armazenado — nem nesta entidade, nem em `LANÇAMENTO_FINANCEIRO` (Seção 9; princípio 8).
  - Estornos, reembolsos e créditos são formalizados exclusivamente por este mecanismo (regra 23) — nunca existe um segundo caminho paralelo resolvendo o mesmo problema.
  - Cancelamento e Ajuste Financeiro são conceitos distintos que nunca produzem o mesmo resultado por caminhos diferentes: Cancelamento significa que o Lançamento foi invalidado antes de produzir qualquer efeito financeiro; Ajuste Financeiro significa que o Lançamento continua existindo como fato histórico, mas sofreu posteriormente um estorno, reembolso, crédito ou outro ajuste.

---

## 5. Classificação dos campos

| Categoria | Campos |
|---|---|
| Derivados | Nenhum |
| Calculados | Nenhum campo próprio — mas esta entidade é o insumo do "custo efetivo" calculado em consulta sobre `LANÇAMENTO_FINANCEIRO` |
| Persistidos | `lançamento_original`, `lançamento_ajuste`, `tipo_ajuste`, `valor`, `data`, `usuário`, `observação` |
| Imutáveis | `lançamento_original`, `lançamento_ajuste` (por inferência estrutural forte); `tipo_ajuste`, `valor`, `data`, `observação` (por regra confirmada — D13, `decisions.md` decisão #34). Só `usuário` permanece fora do escopo de imutabilidade confirmada |
| Auditáveis | Todos os campos |

---

## 6. Dependências com outras entidades

Depende de `LANÇAMENTO_FINANCEIRO` (duas referências obrigatórias, original e ajuste) e de `USUÁRIO` (obrigatório).

---

## 7. Checklist de decisões pendentes

**Esta entidade depende de alguma decisão ainda pendente? Não — resolvida.**

- Depende indiretamente da pendência 5 (usuários e permissões), na medida em que referencia `USUÁRIO` — mas nenhum campo próprio de `AJUSTE_FINANCEIRO` muda por causa disso.
- ~~Regras de alteração e exclusão desta entidade não estavam definidas em lugar nenhum do conceitual~~ — **Resolvida (D13).** Alteração: imutável desde a criação, em `tipo_ajuste`/`valor`/`data`/`observação` — ver Seção 2 e Seção 4; `decisions.md`, decisão #34. Exclusão: coberta pela regra geral já existente para entidades de fato financeiro (`arquitetura-fisica-banco.md` §7), formalmente confirmada, sem regra nova. `usuário` fora do escopo desta decisão. M8 (Ajuste-de-Ajuste, `pendencias.md`, Melhorias Futuras) permanece pendência distinta, não tocada.
- A ambiguidade sobre se a IA poderia propor a criação de um Ajuste (levantada na auditoria sistêmica, achado 2) foi **resolvida**: confirmado que não, de forma definitiva e arquitetural (ver Seção 1).
