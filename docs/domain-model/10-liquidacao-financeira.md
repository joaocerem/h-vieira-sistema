# LIQUIDAÇÃO_FINANCEIRA

## 1. Visão geral

**Finalidade**: evento de decisão/execução do pagamento ou recebimento de um ou mais Lançamentos (conceitual, Seção 3).

**Responsabilidade**: representar o momento em que a operação decide (ou executa) liquidar uma obrigação/direito — distinta do Lançamento (o que se deve) e da Movimentação Bancária (o que de fato aconteceu no banco). As três naturezas nunca se substituem (princípio 2).

**Quem cria**: Usuário, ou Ação de IA confirmada (nível Alto — "qualquer ação que gere ou confirme uma Liquidação real", Seção 11 do conceitual). Isso vale tanto para a liquidação de um único Lançamento quanto para a liquidação de uma Fatura de cartão (que cobre vários Lançamentos de uma vez) — a diferença está em qual módulo da aplicação aciona a criação, uma questão de orquestração técnica, não do domínio em si (ver `arbitragem-tecnica-final.md`, Divergência 6).

**Quem altera**: não há, no conceitual, previsão explícita de alteração de uma Liquidação já registrada — ela representa um evento que ocorreu. Ver Seção 7.

**Quem consulta**: `APLICAÇÃO_DE_LIQUIDAÇÃO` (para saber quais Lançamentos cobre), `VÍNCULO_CONCILIAÇÃO` (para conferir contra o extrato), `FATURA` (quando a Liquidação é o pagamento de uma fatura), Conciliação, Balanço (indiretamente, via Lançamento).

**Quem nunca deve alterar**: Conciliação (nunca cria Liquidação — só confere, via Vínculo); Balanço, Obras, Frota (leitura, nem essa diretamente); IA (nunca cria uma Liquidação sem confirmação humana reforçada de nível Alto).

---

## 2. Campos

| Campo | Significado | Tipo conceitual | Obrigatório? | Valor padrão | Pode mudar depois de criado? | Quem pode alterar | Regra de validação | Observações |
|---|---|---|---|---|---|---|---|---|
| `tipo` | Se é um Pagamento ou um Recebimento | Lista de valores (Pagamento / Recebimento) | Sim | Nenhum | Não — inferência estrutural, mudar o tipo de um evento já ocorrido não faz sentido de negócio; não confirmado como regra explícita | — | Um dos dois valores | — |
| `data_efetiva` | Data em que a decisão/execução da liquidação ocorreu | Data | Sim | Nenhum | Não definido — evento já ocorrido, presumivelmente imutável, mas sem confirmação textual explícita | — | Deve ser uma data válida | Distinta de `data_competência`/`vencimento` do Lançamento |
| `valor` | Valor total desta Liquidação | Valor monetário | Sim | Nenhum | Não definido — evento já ocorrido, presumivelmente imutável | — | Deve ser um valor monetário positivo | Pode ser maior que a soma das Aplicações vinculadas — ver nota abaixo |
| `conta_bancária` | Conta Bancária em que a Liquidação ocorre | Referência para outra entidade (Conta Bancária) | Sim | Nenhum | Não definido | — | Deve referenciar uma Conta Bancária existente | Não é exigida no cadastro da obrigação (Lançamento), só neste momento (regra 11) |

**Nota importante sobre `valor` e a soma das Aplicações**: no caso de uma Fatura mista (Seção 7 do conceitual), o `valor` da Liquidação corresponde ao total cobrado da fatura, mas a soma de `APLICAÇÃO_DE_LIQUIDAÇÃO.valor_aplicado` vinculada a essa Liquidação cobre **apenas** os Lançamentos nascidos de compras Terraplanagem daquele ciclo — a diferença entre os dois é exatamente o valor das compras não-operacionais da fatura, uma diferença explicável, não uma divergência de conciliação. Ou seja: **a soma das Aplicações de uma Liquidação pode ser menor que o `valor` da própria Liquidação, mas (por inferência, não confirmado textualmente) não deveria ser maior.**

---

## 3. Relacionamentos

| Relacionamento | Cardinalidade | Significado | Quem controla | Regras | Restrições |
|---|---|---|---|---|---|
| Lançamento ↔ Liquidação | N:N, via `APLICAÇÃO_DE_LIQUIDAÇÃO` | Uma Liquidação pode cobrir vários Lançamentos; um Lançamento pode ser coberto por várias Liquidações (pagamento parcial) | Sistema, no momento do registro | Ver `APLICAÇÃO_DE_LIQUIDAÇÃO` | — |
| Conta Bancária → Liquidação | N:1 | Toda Liquidação ocorre em exatamente uma Conta Bancária | Usuário, ao registrar | — | — |
| Liquidação → Movimentação Bancária | 1:1 | A Liquidação, separadamente, gera ou é conferida com uma Movimentação Bancária | Sistema (ao gerar) ou Conciliação (ao conferir) | — | Uma Liquidação e sua Movimentação Bancária são fatos de naturezas diferentes — a Liquidação é a decisão/execução, a Movimentação é o fato puro do extrato |
| Liquidação → Vínculo Conciliação | 1:1 (via a Movimentação vinculada) | Liga a Liquidação ao estado de conferência com o banco | Sistema (regra determinística), usuário, ou futuramente IA | — | — |
| Fatura → Liquidação | 1:1 (opcional) | Quando a Liquidação é o pagamento de uma Fatura, a Fatura referencia essa Liquidação pelo valor total cobrado | — | Este relacionamento está descrito na Seção 4 do conceitual sob a entidade Fatura, mas **não aparece na lista "Relaciona-se com" da própria linha de `LIQUIDAÇÃO_FINANCEIRA` na Seção 3** — assimetria do texto-fonte, registrada aqui por completude, sem tentar resolver a ambiguidade de responsabilidade de módulo já tratada na Divergência 6 da arbitragem técnica | — |

---

## 4. Regras da entidade

- **Campos mutuamente exclusivos**: nenhum identificado.
- **Campos obrigatórios por contexto**: nenhum além da obrigatoriedade geral dos quatro campos.
- **Regras de criação**: por Usuário, ou por Ação de IA confirmada com barreira reforçada de nível Alto (regra 28) — nunca por qualquer outro módulo agindo sozinho.
- **Regras de alteração**: não definidas no conceitual — uma Liquidação representa um evento ocorrido; presume-se, por analogia ao princípio "nada desaparece" e à natureza de evento factual, que correções após o registro não deveriam sobrescrever o evento original, mas isso não está confirmado (ver Seção 7).
- **Regras de exclusão**: não definidas no conceitual.
- **Regras de auditoria**: toda criação (e eventual alteração) deve ser registrada em `LOG_AUDITORIA`, com origem e, quando aplicável, referência à Ação de IA confirmada que a originou.
- **Regras de integridade**: `conta_bancária` deve referenciar uma Conta Bancária existente; a soma de `APLICAÇÃO_DE_LIQUIDAÇÃO.valor_aplicado` vinculada não deveria ultrapassar `valor` (inferência, ver nota da Seção 2).
- **Regras de negócio**:
  - É o ponto da cadeia central em que a Conta Bancária é escolhida — nunca antes (regra 11).
  - Ações financeiras sensíveis (liquidação real) propostas pela IA exigem barreira de confirmação reforçada (regra 28) — esta é a única entidade da cadeia central cuja criação está explicitamente ligada ao nível de confirmação "Alto".

---

## 5. Classificação dos campos

| Categoria | Campos |
|---|---|
| Derivados | Nenhum |
| Calculados | Nenhum campo próprio — mas é a partir desta entidade (e de `APLICAÇÃO_DE_LIQUIDAÇÃO`) que o `status` de `LANÇAMENTO_FINANCEIRO` é calculado |
| Persistidos | `tipo`, `data_efetiva`, `valor`, `conta_bancária` |
| Imutáveis | Todos os campos, por inferência (evento já ocorrido) — não confirmado explicitamente no conceitual |
| Auditáveis | Todos os campos |

---

## 6. Dependências com outras entidades

Depende de `CONTA_BANCÁRIA` (obrigatório). É referenciada por `APLICAÇÃO_DE_LIQUIDAÇÃO` (obrigatoriamente), `VÍNCULO_CONCILIAÇÃO` e, opcionalmente, por `FATURA`.

---

## 7. Checklist de decisões pendentes

**Esta entidade depende de alguma decisão ainda pendente? Sim.**

- **Qual decisão**: se uma Liquidação já registrada pode ser alterada ou apenas estornada/substituída por uma nova — não definida em nenhum lugar do conceitual. Está relacionada à pendência 14 (cancelamento de Lançamento com Aplicação já existente), mas não é exatamente a mesma pergunta: a 14 trata do Lançamento; esta trata da Liquidação em si.
- **Por que**: sem essa definição, não é possível confirmar se os campos desta entidade são imutáveis por regra de negócio ou apenas por inferência de bom senso (evento já ocorrido).
- **O que muda na entidade**: a coluna "pode mudar depois de criado" de todos os campos (Seção 2) deixaria de ser inferência e passaria a ser regra confirmada, numa direção ou noutra.
