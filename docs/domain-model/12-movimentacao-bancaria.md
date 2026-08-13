# MOVIMENTAÇÃO_BANCÁRIA

## 1. Visão geral

**Finalidade**: fato puro do extrato — existe para 100% do que passa pela conta (conceitual, Seção 3).

**Responsabilidade**: refletir integralmente o extrato bancário de uma Conta, sem exclusão de itens não-operacionais (princípio 2; regra 2). É a única entidade que representa "o que de fato aconteceu no banco" — distinta de `LANÇAMENTO_FINANCEIRO` (obrigação) e `LIQUIDAÇÃO_FINANCEIRA` (decisão/execução) (princípio 2).

**Quem cria**: módulo de importação de extrato bancário ("Banco (importação)", tratado no conceitual como responsabilidade própria, distinta de Financeiro — Seção 13), ou gerada automaticamente ao registrar uma Liquidação.

**Quem altera**: **apenas o campo `classificação`** é regularmente alterável, por Usuário ou por Sugestão de IA confirmada. Os campos factuais (`data`, `descrição`, `valor`, `conta_bancária`) refletem o extrato real e não têm, no conceitual, nenhuma previsão de edição — são fatos, não interpretações.

**Quem consulta**: Conciliação (sempre 100% dela, com sua `classificação` — regra explícita da Seção 2 do conceitual), `VÍNCULO_CONCILIAÇÃO`, `TRANSFERÊNCIA_INTERNA`.

**Quem nunca deve alterar**: Balanço, Obra e Frota **nunca leem esta entidade diretamente**, e muito menos escrevem nela — é uma restrição explícita e reforçada do conceitual (Seção 2: "Nenhum desses três lê os outros diretamente"; Seção 13: Balanço "Nunca escreve em: Movimentação Bancária diretamente"). Financeiro também não escreve aqui diretamente (regra 13 do conceitual: "Banco (importação) | Nunca escreve em: LANÇAMENTO_FINANCEIRO diretamente" é a via inversa da mesma restrição).

---

## 2. Campos

| Campo | Significado | Tipo conceitual | Obrigatório? | Valor padrão | Pode mudar depois de criado? | Quem pode alterar | Regra de validação | Observações |
|---|---|---|---|---|---|---|---|---|
| `conta_bancária` | Conta em que a movimentação ocorreu | Referência para outra entidade (Conta Bancária) | Sim | Nenhum | Não — fato do extrato | — | Deve referenciar uma Conta Bancária existente | — |
| `data` | Data em que a movimentação ocorreu no banco | Data | Sim | Nenhum | Não — fato do extrato | — | Deve ser uma data válida | — |
| `descrição` | Texto descritivo trazido pelo extrato | Texto | Sim | Nenhum | Não — fato do extrato | — | — | Vem tipicamente literal do banco |
| `valor` | Valor da movimentação | Valor monetário | Sim | Nenhum | Não — fato do extrato | — | Deve representar o valor exato do extrato | O conceitual não especifica convenção de sinal (entrada/saída) — não tratado aqui por ser decisão de representação técnica, fora do escopo conceitual |
| `classificação` | De quem é esse dinheiro | Lista de valores (Terraplanagem / Fora da Operação / Transferência Interna / Retirada do Patrão / Não Classificada) | Sim | Não Classificada (inferência a partir da regra 7 — "movimentações não classificadas permanecem visíveis e identificáveis", sugerindo que esse é o estado inicial até alguém classificar) | Sim | Usuário, ou IA (sugestão confirmada) | Um dos cinco valores da Seção 6 do conceitual; não há subtipos de "Fora da Operação" (regra 4) | Dimensão independente de `estado_conciliação` (que vive em `VÍNCULO_CONCILIAÇÃO`) — nunca fundidas (Seção 6) |

---

## 3. Relacionamentos

| Relacionamento | Cardinalidade | Significado | Quem controla | Regras | Restrições |
|---|---|---|---|---|---|
| Conta Bancária → Movimentação Bancária | 1:N | Toda Movimentação pertence a exatamente uma Conta | Importação, ou geração via Liquidação | 100% do extrato de uma Conta deve existir como Movimentação | — |
| Movimentação Bancária → Vínculo Conciliação | 1:1 | Toda Movimentação tem um estado de conciliação (mesmo que "Sem Correspondência") | Sistema, usuário, ou futuramente IA | — | — |
| Movimentação Bancária → Transferência Interna | 1:1 (opcional, x2 por Transferência) | Uma Movimentação pode ser um dos dois lados de uma Transferência Interna | Usuário, ou sugestão determinística por valor+data | Quando isso ocorre, a `classificação` correspondente deve ser Transferência Interna | — |

---

## 4. Regras da entidade

- **Campos mutuamente exclusivos**: nenhum identificado.
- **Campos obrigatórios por contexto**: nenhum além da obrigatoriedade geral.
- **Regras de criação**: por importação de extrato, ou gerada automaticamente ao registrar uma Liquidação — nunca digitada livremente pelo usuário como um fato novo (diferente de um Lançamento, que pode nascer manualmente).
- **Regras de alteração**: apenas `classificação` é alterável; os campos factuais não têm previsão de edição no conceitual.
- **Regras de exclusão**: não definidas — e o princípio 2 ("reflete 100% do extrato, sem exclusão de itens não-operacionais") sugere fortemente que a exclusão nunca é permitida, apenas a reclassificação.
- **Regras de auditoria**: toda alteração de `classificação` deve ser registrada em `LOG_AUDITORIA`, com origem (Manual / Importação / Sugestão de IA Confirmada).
- **Regras de integridade**: `conta_bancária` deve referenciar uma Conta existente.
- **Regras de negócio**:
  - Toda Movimentação Bancária (e toda Compra de Cartão) recebe uma `classificação` (regra 3).
  - Não há detalhamento de subtipos de "fora da operação" (regra 4).
  - Retiradas do patrão continuam registradas e visíveis, sem virar despesa operacional (regra 6).
  - Movimentações não classificadas permanecem visíveis e identificáveis (regra 7).
  - Conciliação mostra 100% do banco; Balanço mostra apenas o que foi classificado Terraplanagem, sempre como um filtro conceitual sobre `LANÇAMENTO_FINANCEIRO`, nunca uma leitura direta desta entidade (regra 8).

---

## 5. Classificação dos campos

| Categoria | Campos |
|---|---|
| Derivados | Nenhum |
| Calculados | Nenhum — **importante**: "saldo da conta" não é campo desta entidade nem de `CONTA_BANCÁRIA`; é sempre resultado de consulta agregada sobre o conjunto de Movimentações de uma Conta |
| Persistidos | `conta_bancária`, `data`, `descrição`, `valor`, `classificação` |
| Imutáveis | `conta_bancária`, `data`, `descrição`, `valor` (fatos do extrato) |
| Auditáveis | `classificação` (o único campo sujeito a alteração regular) |

---

## 6. Dependências com outras entidades

Depende de `CONTA_BANCÁRIA` (obrigatório). É referenciada por `VÍNCULO_CONCILIAÇÃO` (obrigatoriamente) e por `TRANSFERÊNCIA_INTERNA` (opcionalmente, quando é um dos dois lados de uma transferência).

---

## 7. Checklist de decisões pendentes

**Esta entidade depende de alguma decisão ainda pendente? Não diretamente**, mas duas pendências do conceitual afetam como ela é operacionalizada:

- Pendência 2 (tolerância de dias no matching automático de conciliação) afeta como sugestões de `VÍNCULO_CONCILIAÇÃO` são geradas a partir desta entidade, sem alterar a estrutura da própria Movimentação.
- O formato e frequência de importação de extrato bancário (Seção 19 do conceitual, integração bancária futura) afetam como esta entidade é populada, mas o conceitual já garante que qualquer formato de entrada resulta nesta mesma estrutura — nenhum campo muda por causa disso.
