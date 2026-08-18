# COMPRA_CARTÃO

## 1. Visão geral

**Finalidade**: cada compra feita no cartão (conceitual, Seção 3).

**Responsabilidade**: preservar individualmente fornecedor, valor, data, categoria, classificação, obra (quando houver) e veículo (quando houver) de cada compra — mesmo quando agrupada numa Fatura mista (Seção 7 do conceitual).

**Quem cria**: digitação manual, ou futura importação de fatura.

**Quem altera**: mesmo conjunto — digitação manual, sujeito à mesma ressalva de correção de cadastro. Uma correção em `categoria`/`obra`/`veículo` propaga automaticamente para os Lançamentos já gerados por esta Compra, exceto os que já têm `RATEIO_DESPESA` vinculado (D5, `decisions.md` decisão #27 — ver `09-lancamento-financeiro.md`, Seção 1).

**Quem consulta**: `PARCELA` (uma Compra Terraplanagem gera Parcelas). `FATURA` apenas indiretamente, via `PARCELA` — a Fatura agrupa as Parcelas do ciclo, não as Compras diretamente (uma Compra parcelada em N vezes contribui, através de suas Parcelas, para até N Faturas diferentes ao longo do tempo; ver `19-fatura.md` e `21-parcela.md`).

**Quem nunca deve alterar**: Financeiro (não escreve diretamente em Compra Cartão — só o módulo Cartões escreve aqui, per Seção 13 do conceitual), Conciliação, Obras, Frota, Balanço, IA.

---

## 2. Campos

| Campo | Significado | Tipo conceitual | Obrigatório? | Valor padrão | Pode mudar depois de criado? | Quem pode alterar | Regra de validação | Observações |
|---|---|---|---|---|---|---|---|---|
| `cartão` | Cartão em que a compra foi feita | Referência para outra entidade (Cartão de Crédito) | Sim | Nenhum | Não — inferência, o vínculo com o Cartão em que a compra ocorreu é um fato | — | Deve referenciar um Cartão existente | — |
| `fornecedor` | Fornecedor da compra | Referência para outra entidade (Fornecedor) | Sim (campo principal listado no conceitual) | Nenhum | Sim (correção de cadastro) | Usuário | Deve referenciar um Fornecedor existente | — |
| `valor` | Valor da compra | Valor monetário | Sim | Nenhum | Sim, sujeito à mesma cautela aplicada a `LANÇAMENTO_FINANCEIRO.valor` — não confirmado explicitamente para esta entidade | Usuário | Deve ser um valor monetário positivo | — |
| `data` | Data da compra | Data | Sim | Nenhum | Sim (correção de cadastro) | Usuário | Deve ser uma data válida | — |
| `categoria` | Natureza do gasto | Referência para outra entidade (Categoria) | Sim | Nenhum | Sim | Usuário, ou IA (sugestão confirmada) | Deve referenciar uma Categoria existente | Dimensão independente de `classificação` |
| `classificação` | De quem é esse dinheiro | Lista de valores (Terraplanagem / Fora da Operação / Transferência Interna / Retirada do Patrão / Não Classificada) | Sim | Não Classificada (mesma inferência aplicada a `MOVIMENTAÇÃO_BANCÁRIA`) | Sim | Usuário, ou IA (sugestão confirmada) | Um dos cinco valores | Determina se a compra gera Lançamento (só se Terraplanagem) |
| `obra` | Obra à qual a compra é atribuída | Referência para outra entidade (Obra) | Não | Nenhum (vazio) | Sim | Usuário | — | Opcional, mesma lógica de `LANÇAMENTO_FINANCEIRO.obra` |
| `veículo` | Veículo ao qual a compra é atribuída | Referência para outra entidade (Veículo) | Não | Nenhum (vazio) | Sim | Usuário | — | Pode coexistir com `obra` |
| `nº parcelas` | Em quantas parcelas a compra foi dividida | Número inteiro | Sim | 1 (inferência — uma compra à vista tem uma única parcela) | Não — inferência, o parcelamento é definido no momento da compra | Usuário | Deve ser um número inteiro positivo | Determina quantos registros de `PARCELA` são gerados |

---

## 3. Relacionamentos

| Relacionamento | Cardinalidade | Significado | Quem controla | Regras | Restrições |
|---|---|---|---|---|---|
| Cartão de Crédito → Compra Cartão | 1:N | Um Cartão tem várias Compras | Digitação manual, ou importação futura | — | — |
| Compra Cartão → Parcela | 1:N | Uma Compra é dividida em N Parcelas (`nº parcelas`) | Sistema, ao calcular o parcelamento | — | — |

**Nota de consistência**: `COMPRA_CARTÃO` **não tem relação direta com `FATURA`**. Uma Compra parcelada em mais de uma vez se distribui por várias Faturas ao longo do tempo — uma Parcela em cada ciclo — o que tornaria uma relação direta `Compra → Fatura` estruturalmente incorreta (só "pareceria" certa para compras à vista). A relação real é `PARCELA → FATURA`, atribuída no fechamento do ciclo (ou na importação, quando há fonte externa autoritativa) — ver `21-parcela.md`, Seção 3, e `19-fatura.md`, Seção 3.

---

## 4. Regras da entidade

- **Campos mutuamente exclusivos**: nenhum identificado (diferente de `LANÇAMENTO_FINANCEIRO`, esta entidade não tem uma exclusividade fornecedor/cliente — é sempre uma compra, sempre com fornecedor).
- **Campos obrigatórios por contexto**: nenhum além da obrigatoriedade geral.
- **Regras de criação**: digitação manual, ou futura importação de fatura.
- **Regras de alteração**: sujeitas à mesma cautela de correção de fatos financeiros já processados — não detalhado com precisão no conceitual. Correção de `categoria`/`obra`/`veículo` (D5, resolvida): propaga automaticamente para (i) Parcelas ainda não vencidas — o Lançamento, ao nascer, já lê o valor vigente; (ii) Lançamentos já gerados **sem** `RATEIO_DESPESA` vinculado — atualizados automaticamente. Lançamentos já gerados **com** `RATEIO_DESPESA` ficam desacoplados definitivamente — sem propagação, correção manual.
- **Regras de exclusão**: não definidas.
- **Regras de auditoria**: toda alteração de campo deve ser registrada em `LOG_AUDITORIA`.
- **Regras de integridade**: `cartão`, `fornecedor`, `categoria`, `obra` (quando preenchido) e `veículo` (quando preenchido) devem referenciar registros existentes.
- **Regras de negócio**:
  - Uma compra classificada Terraplanagem gera, via `PARCELA`, um `LANÇAMENTO_FINANCEIRO` próprio por parcela; uma compra Fora da Operação nunca gera Lançamento, mas continua registrada para que o valor da fatura bata com o extrato (Seção 7 do conceitual).
  - `COMPRA_CARTÃO` nunca é, ela mesma, um `LANÇAMENTO_FINANCEIRO` — é a origem de até um Lançamento por Parcela, condicionada à `classificação`.

---

## 5. Classificação dos campos

| Categoria | Campos |
|---|---|
| Derivados | Nenhum |
| Calculados | Nenhum |
| Persistidos | `cartão`, `fornecedor`, `valor`, `data`, `categoria`, `classificação`, `obra`, `veículo`, `nº parcelas` |
| Imutáveis | `cartão`, `nº parcelas` (por inferência) |
| Auditáveis | Todos os campos, especialmente `categoria` e `classificação` |

---

## 6. Dependências com outras entidades

Depende de `CARTÃO_CRÉDITO`, `FORNECEDOR` e `CATEGORIA` (obrigatórios). Depende opcionalmente de `OBRA` e `VEÍCULO`. É referenciada por `PARCELA`. Relaciona-se com `FATURA` apenas de forma transitiva, através de `PARCELA` — não há relação direta entre Compra Cartão e Fatura.

---

## 7. Checklist de decisões pendentes

**Esta entidade depende de alguma decisão ainda pendente? Não.**

Nenhuma das 14 pendências numeradas do conceitual afeta esta entidade especificamente. A futura "importação de fatura" citada como possível origem (Seção 3 do conceitual) é uma integração futura já reconhecida como fora do núcleo (Seção 19 do conceitual) e não muda a estrutura de campos aqui modelada.

~~D5 (`revisao-integridade-dominio.md`, achado crítico) — duplicação de `categoria`/`obra`/`veículo` com `LANÇAMENTO_FINANCEIRO`, sem regra de sincronização~~ — **Resolvida.** Propagação automática condicional definida — ver Seção 1 e Seção 4; `decisions.md`, decisão #27.
