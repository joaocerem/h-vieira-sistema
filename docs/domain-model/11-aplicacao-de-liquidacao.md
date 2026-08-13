# APLICAÇÃO_DE_LIQUIDAÇÃO

## 1. Visão geral

**Finalidade**: ligar N Lançamentos a N Liquidações, com o valor exato de cada combinação (conceitual, Seção 3).

**Responsabilidade**: ser a peça que resolve o relacionamento N:N entre `LANÇAMENTO_FINANCEIRO` e `LIQUIDAÇÃO_FINANCEIRA`, permitindo pagamento parcial, liquidação de vários Lançamentos numa só vez (ex. Fatura mista), e o cálculo do `status` do Lançamento.

**Quem cria**: Sistema, no momento do registro da Liquidação — **não é um campo de digitação livre do usuário**; nasce como consequência direta de o usuário (ou a Ação de IA confirmada) registrar uma Liquidação e indicar quais Lançamentos ela cobre e em que valor.

**Quem altera**: ninguém — esta entidade é imutável depois de criada. Confirmado pela resolução da pendência 14 do conceitual (cancelamento de Lançamento): como o cancelamento de um Lançamento só é permitido quando não há nenhuma Aplicação vinculada, e qualquer correção de um Lançamento que já possua Aplicações passa exclusivamente por `AJUSTE_FINANCEIRO` (que nunca toca Aplicações existentes, apenas gera um novo Lançamento e sua própria cadeia), não existe fluxo nenhum que altere ou remova uma Aplicação já criada.

**Quem consulta**: `LANÇAMENTO_FINANCEIRO` (para calcular `status`), Balanço Realizado (lê a fração já coberta por Aplicação, conforme Seção 2 do conceitual), Conciliação (indiretamente).

**Quem nunca deve alterar**: Usuário, diretamente — o conceitual descreve a coluna "Não representa" desta entidade como "um novo valor — é a distribuição do valor já existente", o que indica que não é um dado digitado livremente, e sim derivado do ato de registrar uma Liquidação. IA nunca escreve aqui diretamente.

---

## 2. Campos

| Campo | Significado | Tipo conceitual | Obrigatório? | Valor padrão | Pode mudar depois de criado? | Quem pode alterar | Regra de validação | Observações |
|---|---|---|---|---|---|---|---|---|
| `lançamento_financeiro` | Lançamento coberto por esta aplicação | Referência para outra entidade (Lançamento Financeiro) | Sim | Nenhum | Não definido | Sistema | Deve referenciar um Lançamento existente | — |
| `liquidação_financeira` | Liquidação que está cobrindo o Lançamento | Referência para outra entidade (Liquidação Financeira) | Sim | Nenhum | Não definido | Sistema | Deve referenciar uma Liquidação existente | — |
| `valor_aplicado` | Quanto do valor da Liquidação foi aplicado a este Lançamento específico | Valor monetário | Sim | Nenhum | Não definido — ver Seção 7 | Sistema | Deve ser um valor monetário positivo; a soma de `valor_aplicado` de um mesmo Lançamento não deveria ultrapassar seu `valor` (inferência, necessária para a tabela de status da Seção 2 do conceitual fazer sentido); a soma de `valor_aplicado` de uma mesma Liquidação não deveria ultrapassar o `valor` dessa Liquidação (mesma inferência, ver Seção 2 de `LIQUIDAÇÃO_FINANCEIRA`) | Este é o campo que efetivamente determina o `status` calculado do Lançamento |

---

## 3. Relacionamentos

| Relacionamento | Cardinalidade | Significado | Quem controla | Regras | Restrições |
|---|---|---|---|---|---|
| Lançamento Financeiro → Aplicação de Liquidação | 1:N | Um Lançamento pode ter várias Aplicações (pagamentos parciais de diferentes Liquidações) | Sistema | A soma determina `status` | — |
| Liquidação Financeira → Aplicação de Liquidação | 1:N | Uma Liquidação pode ter várias Aplicações (cobrindo vários Lançamentos, ex. Fatura mista) | Sistema | A soma não deveria ultrapassar o `valor` da Liquidação (inferência) | — |

Esta entidade é, ela mesma, a materialização da relação N:N entre `LANÇAMENTO_FINANCEIRO` e `LIQUIDAÇÃO_FINANCEIRA` descrita na Seção 4 do conceitual — não é um simples elo de ligação sem atributo próprio, pois carrega `valor_aplicado`, que é informação de negócio real (a distribuição do valor entre as combinações).

---

## 4. Regras da entidade

- **Campos mutuamente exclusivos**: nenhum identificado.
- **Campos obrigatórios por contexto**: nenhum além da obrigatoriedade geral dos três campos.
- **Regras de criação**: sempre pelo sistema, disparada pelo ato de registrar uma Liquidação — nunca criada isoladamente por digitação direta do usuário.
- **Regras de alteração**: nenhuma — a entidade é imutável depois de criada (ver Seção 1).
- **Regras de exclusão**: nenhuma — a pendência 14 do conceitual foi resolvida confirmando o **bloqueio** do cancelamento quando há Aplicação vinculada (não o estorno), portanto uma Aplicação de Liquidação já criada nunca é removida nem alterada.
- **Regras de auditoria**: toda criação deve ser registrada em `LOG_AUDITORIA` (regra 31) — é uma escrita derivada de um evento financeiro real, portanto qualifica como "alteração relevante".
- **Regras de integridade**: `lançamento_financeiro` e `liquidação_financeira` devem referenciar registros existentes; as duas regras de soma descritas na Seção 2 (não ultrapassar o valor do Lançamento, nem o valor da Liquidação).
- **Regras de negócio**: é o mecanismo formal por trás da tabela de status da Seção 2 do conceitual (0 → Aberto; entre 0 e o total → Parcial; igual ao total → Pago/Recebido).

---

## 5. Classificação dos campos

| Categoria | Campos |
|---|---|
| Derivados | Nenhum |
| Calculados | Nenhum campo próprio desta entidade é calculado — mas ela é, ela mesma, o insumo do cálculo de `status` de `LANÇAMENTO_FINANCEIRO` |
| Persistidos | `lançamento_financeiro`, `liquidação_financeira`, `valor_aplicado` |
| Imutáveis | Todos os campos — a entidade inteira é imutável depois de criada |
| Auditáveis | Todos os campos |

---

## 6. Dependências com outras entidades

Depende de `LANÇAMENTO_FINANCEIRO` e `LIQUIDAÇÃO_FINANCEIRA` (ambos obrigatórios — esta entidade não existe isoladamente).

---

## 7. Checklist de decisões pendentes

**Esta entidade depende de alguma decisão ainda pendente? Não.**

A pendência 14 do conceitual, que afetava diretamente esta entidade, foi resolvida: o cancelamento de um Lançamento só é permitido quando a soma de Aplicações vinculadas for zero — ou seja, uma Aplicação de Liquidação já existente nunca é alterada, removida ou revertida por um cancelamento. Qualquer correção de efeito financeiro já aplicado passa exclusivamente por `AJUSTE_FINANCEIRO`, que não toca nesta entidade. Isso confirma, de forma definitiva, que `APLICAÇÃO_DE_LIQUIDAÇÃO` é imutável depois de criada.
