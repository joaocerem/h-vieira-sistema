# FORNECEDOR

## 1. Visão geral

**Finalidade**: cadastro único de cada credor da terraplanagem (conceitual, Seção 3).

**Responsabilidade**: identificar, de forma não duplicada, cada fornecedor a quem a operação deve/pagou por uma Despesa ou Compra de Cartão.

**Quem cria**: cadastro manual, "ou ao digitar pela 1ª vez" — o próprio conceitual admite que o cadastro possa nascer no fluxo de registro de um Lançamento ou Compra de Cartão, não só por tela dedicada.

**Quem altera**: cadastro manual.

**Quem consulta**: `LANÇAMENTO_FINANCEIRO` (Despesas referenciam um Fornecedor), `COMPRA_CARTÃO` (idem).

**Quem nunca deve alterar**: Conciliação, Obras, Frota, Balanço, IA — nenhum desses escreve em Fornecedor segundo a tabela de responsabilidades do conceitual (Seção 13).

---

## 2. Campos

| Campo | Significado | Tipo conceitual | Obrigatório? | Valor padrão | Pode mudar depois de criado? | Quem pode alterar | Regra de validação | Observações |
|---|---|---|---|---|---|---|---|---|
| `nome` | Nome do fornecedor/credor | Texto | Sim | Nenhum | Sim (correção de cadastro) | Cadastro manual | Não vazio; **cadastro único** — a finalidade textual da entidade ("cadastro único de cada credor") implica não duplicar o mesmo fornecedor em dois registros | Único campo principal listado no conceitual para esta entidade |

---

## 3. Relacionamentos

| Relacionamento | Cardinalidade | Significado | Quem controla | Regras | Restrições |
|---|---|---|---|---|---|
| Fornecedor → Lançamento Financeiro | 1:N | Um Fornecedor pode ser referenciado por vários Lançamentos do tipo Despesa | Usuário, ao registrar o Lançamento | Um Lançamento do tipo Despesa referencia `fornecedor_id` OU `cliente_id`, nunca os dois — essa exclusividade é regra da entidade `LANÇAMENTO_FINANCEIRO`, citada aqui por completude | — |
| Fornecedor → Compra Cartão | 1:N | Um Fornecedor pode ser referenciado por várias Compras de Cartão | Usuário, ao registrar a Compra | — | — |

---

## 4. Regras da entidade

- **Campos mutuamente exclusivos**: não aplicável dentro da própria entidade.
- **Campos obrigatórios por contexto**: não aplicável.
- **Regras de criação**: cadastro manual, podendo nascer no fluxo de registro de Lançamento ou Compra de Cartão.
- **Regras de alteração**: alteração manual; toda mudança de `nome` deve ser auditada.
- **Regras de exclusão**: não definidas no conceitual — mesma ressalva feita para Cliente.
- **Regras de auditoria**: toda alteração de `nome` deve ser registrada em `LOG_AUDITORIA`.
- **Regras de integridade**: `LANÇAMENTO_FINANCEIRO.fornecedor_id` e `COMPRA_CARTÃO.fornecedor_id`, quando preenchidos, devem referenciar um Fornecedor existente.
- **Regras de negócio**: a regra 22 do conceitual ("consultas de gasto por fornecedor consideram apenas o que foi classificado Terraplanagem") não é uma regra da entidade Fornecedor em si, mas da consulta agregada sobre `LANÇAMENTO_FINANCEIRO` — citada aqui porque afeta diretamente como o Fornecedor é usado em relatórios.

---

## 5. Classificação dos campos

| Categoria | Campos |
|---|---|
| Derivados | Nenhum |
| Calculados | Nenhum — "gasto total por fornecedor" não é campo de Fornecedor, é resultado de consulta agregada sobre `LANÇAMENTO_FINANCEIRO`, nunca armazenado |
| Persistidos | `nome` |
| Imutáveis | Nenhum |
| Auditáveis | `nome` |

---

## 6. Dependências com outras entidades

`LANÇAMENTO_FINANCEIRO` e `COMPRA_CARTÃO` dependem opcionalmente de `FORNECEDOR` (Despesas e Compras referenciam um Fornecedor).

---

## 7. Checklist de decisões pendentes

**Esta entidade depende de alguma decisão ainda pendente? Não.**

Nenhuma pendência numerada do conceitual, nem decisão das etapas de arquitetura, afeta diretamente esta entidade.
