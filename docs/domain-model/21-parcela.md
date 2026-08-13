# PARCELA

## 1. Visão geral

**Finalidade**: parcela individual, reutilizada por Compra de Cartão e Contrato Financeiro (conceitual, Seção 3).

**Responsabilidade**: representar cada fração de um parcelamento — seja de uma Compra de Cartão, seja de um Contrato Financeiro — e ser a ponte que gera um `LANÇAMENTO_FINANCEIRO` no momento do vencimento, quando aplicável.

**Quem cria**: Sistema, ao calcular o parcelamento (a partir de `COMPRA_CARTÃO.nº parcelas` ou da estrutura de `CONTRATO_FINANCEIRO`).

**Quem altera**: não definido explicitamente no conceitual — ver Seção 7.

**Quem consulta**: `LANÇAMENTO_FINANCEIRO` (quando a Parcela vence e gera um), `FATURA` (que a reivindica no fechamento do ciclo correspondente, ou no momento de uma importação com fonte externa autoritativa, no caso de Parcelas de Cartão).

**Quem nunca deve alterar**: Financeiro não escreve diretamente em Parcela (é o módulo Cartões, ou o equivalente para Contrato Financeiro, que gera); Conciliação, Obras, Frota, Balanço, IA não escrevem aqui.

---

## 2. Campos

| Campo | Significado | Tipo conceitual | Obrigatório? | Valor padrão | Pode mudar depois de criado? | Quem pode alterar | Regra de validação | Observações |
|---|---|---|---|---|---|---|---|---|
| `origem` | Se a Parcela vem de uma Compra de Cartão ou de um Contrato Financeiro | Lista de valores (Compra Cartão / Contrato Financeiro) | Sim | Nenhum | Não | Sistema | Um dos dois valores | Determina qual dos dois relacionamentos condicionais se aplica |
| `número` | Posição desta Parcela na sequência (ex. "3" de "12") | Número inteiro | Sim | Nenhum | Não | Sistema | Deve ser maior que 0 e menor ou igual a `total` | — |
| `total` | Quantidade total de Parcelas do parcelamento | Número inteiro | Sim | Nenhum | Não | Sistema | Deve ser um número inteiro positivo | Corresponde a `COMPRA_CARTÃO.nº parcelas`, quando `origem` = Compra Cartão |
| `valor` | Valor desta Parcela específica | Valor monetário | Sim | Nenhum | Não definido | Sistema | Deve ser um valor monetário positivo | — |
| `vencimento` | Data em que esta Parcela vence | Data | Sim | Nenhum | Não definido | Sistema | Deve ser uma data válida | É o gatilho para gerar o `LANÇAMENTO_FINANCEIRO` correspondente |
| `status` | Situação da Parcela | Lista de valores | Sim | Não definido | Sim, presumivelmente (ex. de "Pendente" para "Lançada", quando vence) | Sistema | Valores válidos não enumerados explicitamente no conceitual | Ver Seção 7. **Dimensão independente de "tem ou não Fatura vinculada" — nunca fundidas.** O estado de uma Parcela aguardando o fechamento do ciclo correspondente é representado pela ausência do campo `fatura` (abaixo), não por um valor de `status` |
| `fatura` | Fatura à qual esta Parcela foi atribuída — o ciclo em que passou a integrar o processo financeiro do sistema | Referência para outra entidade (Fatura) | Não — ausente até o vínculo ser atribuído | Nenhum (vazio até a atribuição) | Não, depois de atribuído — o vínculo é permanente, mesmo que a Fatura já esteja fechada (ver regra de atribuição na Seção 4) | Sistema | Quando preenchido, deve referenciar uma Fatura existente | Aplicável apenas quando `origem` = Compra Cartão (Parcelas de Contrato Financeiro não se relacionam com Fatura). A ausência deste vínculo já representa, por si só, o estado "aguardando fatura" |

---

## 3. Relacionamentos

| Relacionamento | Cardinalidade | Significado | Quem controla | Regras | Restrições |
|---|---|---|---|---|---|
| Compra Cartão → Parcela | 1:N (condicional) | Presente quando `origem` = Compra Cartão | Sistema | Só gera Lançamento se a Compra é classificada Terraplanagem | — |
| Contrato Financeiro → Parcela | 1:N (condicional) | Presente quando `origem` = Contrato Financeiro | Sistema | Ao vencer, sempre gera Lançamento (categoria "Amortização Empréstimo"/"Consórcios") | — |
| Parcela → Lançamento Financeiro | 1:1 (opcional, "quando vence") | Ao vencer, a Parcela gera um Lançamento correspondente, se aplicável | Sistema | Só existe quando a Parcela efetivamente gerou um Lançamento | Uma Parcela de Compra Fora da Operação nunca gera este relacionamento |
| Fatura → Parcela | 1:N (condicional, quando `origem` = Compra Cartão) | Uma Fatura agrupa diretamente as Parcelas do ciclo correspondente | Sistema — no momento do fechamento do ciclo (quando não há fonte externa autoritativa) ou no momento da importação (quando há) | **Regra de atribuição**: se a Parcela nasce de uma Compra cadastrada manualmente, com `vencimento` pertencente a um ciclo já encerrado, e não existe fonte externa autoritativa informando a Fatura correta, a Parcela é atribuída ao **próximo ciclo aberto no momento do processamento** (usando `LOG_AUDITORIA.data/hora` como referência de quando o registro foi processado — nenhum campo adicional é necessário em `COMPRA_CARTÃO`). Se existe uma fonte externa autoritativa (ex. importação da operadora/banco) informando a Fatura correta, essa informação sempre prevalece, mesmo que o ciclo já esteja fechado — a Parcela se vincula à Fatura real, não ao próximo ciclo aberto | O vínculo é permanente uma vez atribuído; uma Fatura já fechada continua aceitando novos vínculos de Parcelas descobertas por importação tardia, sem que isso altere seus totais já congelados (ver `19-fatura.md`) |

---

## 4. Regras da entidade

- **Campos mutuamente exclusivos**: a Parcela pertence a uma Compra de Cartão OU a um Contrato Financeiro, nunca os dois (determinado por `origem`).
- **Campos obrigatórios por contexto**: nenhum além da obrigatoriedade geral.
- **Regras de criação**: sempre pelo sistema, no momento em que a Compra de Cartão ou o Contrato Financeiro é registrado, calculando o parcelamento completo de uma vez.
- **Regras de alteração**: não definidas no conceitual.
- **Regras de exclusão**: não definidas.
- **Regras de auditoria**: a geração do Lançamento correspondente, ao vencer, deve ser registrada em `LOG_AUDITORIA` com origem "Cartão (via Parcela)" ou "Contrato Financeiro (via Parcela)".
- **Regras de integridade**: exatamente um entre `COMPRA_CARTÃO` e `CONTRATO_FINANCEIRO` deve estar associado, conforme `origem`.
- **Regras de negócio**:
  - Uma Parcela nunca é, ela mesma, um Lançamento (coluna "Não representa" do catálogo) — é a origem de até um Lançamento, no momento do vencimento.
  - Só Parcelas de Compra Terraplanagem geram Lançamento (Seção 7); Parcelas de Contrato Financeiro geram Lançamento sempre, ao vencer (Seção 10).
  - A regra do "próximo ciclo aberto" vale exclusivamente para cadastros manuais sem fonte externa autoritativa. Sempre que existir uma fonte oficial informando a Fatura correta (como importação da operadora ou banco), prevalece essa fonte, independentemente de o ciclo já estar fechado.
  - `status` e `fatura` são dimensões independentes, nunca fundidas: `status` representa exclusivamente a situação própria da Parcela (vencimento, lançamento, ou outras dimensões que vierem a ser definidas); a existência ou não de vínculo com `Fatura` nunca é representada por um valor de `status`.

---

## 5. Classificação dos campos

| Categoria | Campos |
|---|---|
| Derivados | Nenhum |
| Calculados | Nenhum campo aritmético — mas `valor` de cada Parcela é definido no momento do cálculo do parcelamento (não digitado individualmente pelo usuário) |
| Persistidos | `origem`, `número`, `total`, `valor`, `vencimento`, `status`, `fatura` (quando aplicável) |
| Imutáveis | `origem`, `número`, `total` (por inferência estrutural — a posição de uma parcela num parcelamento já calculado não deveria mudar); `fatura`, depois de atribuída (o vínculo é permanente) |
| Auditáveis | `status`, e a geração do Lançamento associado |

---

## 6. Dependências com outras entidades

Depende, de forma condicional e mutuamente exclusiva, de `COMPRA_CARTÃO` ou `CONTRATO_FINANCEIRO`. Depende também, opcionalmente e apenas quando `origem` = Compra Cartão, de `FATURA` (atribuída no fechamento do ciclo ou na importação). É referenciada por `LANÇAMENTO_FINANCEIRO` (opcionalmente, quando vence).

---

## 7. Checklist de decisões pendentes

**Esta entidade depende de alguma decisão ainda pendente? Parcialmente.**

O relacionamento com `Fatura` e a regra de atribuição de ciclo (Cenário manual vs. Cenário com fonte externa autoritativa) estão **resolvidos** (ver Seções 2-4). Também está resolvido que `status` nunca representa a existência de vínculo com Fatura — são dimensões independentes.

O que permanece em aberto:
- **Qual decisão**: os valores válidos do campo `status` não estão enumerados no conceitual — mesma natureza de lacuna já identificada em `OBRA.status`, não catalogada entre as 14 pendências numeradas.
- **Por que**: sem esses valores, não é possível confirmar todos os estados pelos quais uma Parcela passa antes e depois do vencimento (ex. se há distinção entre "não vencida" e "vencida mas ainda não processada").
- **O que muda na entidade**: o conjunto de valores válidos de `status`, e possivelmente uma regra de transição associada à geração do Lançamento correspondente. Não afeta o campo `fatura`, já resolvido.
