# CONTA_BANCÁRIA

## 1. Visão geral

**Finalidade**: representar uma conta bancária de uma Empresa (conceitual, Seção 3).

**Responsabilidade**: ser a referência de onde `MOVIMENTAÇÃO_BANCÁRIA` acontece e para onde `LIQUIDAÇÃO_FINANCEIRA` aponta. **Não representa saldo** — saldo é sempre calculado a partir da soma das Movimentações Bancárias da conta, nunca um número fixo editável (coluna "Não representa" do catálogo do conceitual, Seção 3).

**Quem cria**: cadastro manual.

**Quem altera**: cadastro manual.

**Quem consulta**: `EMPRESA` (uma Empresa lista suas Contas), `MOVIMENTAÇÃO_BANCÁRIA` (toda movimentação pertence a uma Conta), `CARTÃO_CRÉDITO` (todo Cartão está vinculado a uma Conta), `LIQUIDAÇÃO_FINANCEIRA` (toda Liquidação escolhe uma Conta para ocorrer).

**Quem nunca deve alterar**: nenhum módulo além do cadastro manual escreve na entidade Conta Bancária em si — Financeiro, Conciliação, Cartão etc. escrevem em `MOVIMENTAÇÃO_BANCÁRIA`, `LIQUIDAÇÃO_FINANCEIRA` etc., referenciando a Conta, mas nunca alteram os dados cadastrais da Conta.

---

## 2. Campos

| Campo | Significado | Tipo conceitual | Obrigatório? | Valor padrão | Pode mudar depois de criado? | Quem pode alterar | Regra de validação | Observações |
|---|---|---|---|---|---|---|---|---|
| `empresa` | Empresa dona da conta | Referência para outra entidade (Empresa) | Sim | Nenhum | Não definido se pode ser reatribuída depois de criada — inferência: improvável | Cadastro manual | Deve referenciar uma Empresa existente | — |
| `banco` | Instituição bancária | Texto | Sim | Nenhum | Sim (correção de cadastro) | Cadastro manual | Não vazio | — |
| `apelido` | Nome usado internamente para identificar a conta | Texto | Sim (campo principal listado no conceitual) | Nenhum | Sim | Cadastro manual | Não vazio | — |

**Explicitamente fora desta entidade**: saldo. O conceitual é categórico — "Não representa: Saldo fixo — saldo é sempre calculado a partir da Movimentação Bancária" (Seção 3) e princípio 8 ("todo indicador... é calculado em tempo de consulta... nunca armazenado como número fixo editável"). Nenhum campo de saldo é modelado aqui.

---

## 3. Relacionamentos

| Relacionamento | Cardinalidade | Significado | Quem controla | Regras | Restrições |
|---|---|---|---|---|---|
| Empresa → Conta Bancária | 1:N | Uma Empresa pode ter várias Contas Bancárias | Cadastro manual | Conta não existe sem Empresa | — |
| Conta Bancária → Movimentação Bancária | 1:N | Toda Movimentação Bancária pertence a exatamente uma Conta | Importação de extrato, ou geração ao registrar uma Liquidação | 100% do extrato de uma Conta deve existir como Movimentação, sem exceção (regra 2) | — |
| Conta Bancária → Cartão de Crédito | 1:N | Um Cartão de Crédito está vinculado a exatamente uma Conta Bancária | Cadastro manual do Cartão | Cartão é entidade própria, mesmo vinculado a uma Conta | — |
| Conta Bancária → Liquidação Financeira | 1:N | Toda Liquidação escolhe uma Conta Bancária onde ocorre | Usuário, ao registrar a Liquidação | A Conta de liquidação não é exigida no cadastro da obrigação (`LANÇAMENTO_FINANCEIRO`), só no momento da Liquidação (regra 11) | — |

---

## 4. Regras da entidade

- **Campos mutuamente exclusivos**: não aplicável.
- **Campos obrigatórios por contexto**: não aplicável.
- **Regras de criação**: cadastro manual.
- **Regras de alteração**: alteração manual; toda mudança deve ser auditada.
- **Regras de exclusão**: não definidas no conceitual. Dado que uma Conta pode ter Movimentações e Liquidações vinculadas, e o princípio "nada desaparece" se aplica a fatos financeiros, presumir exclusão física livre seria arriscado — observação, não regra confirmada.
- **Regras de auditoria**: toda alteração de campo deve ser registrada em `LOG_AUDITORIA`.
- **Regras de integridade**: `MOVIMENTAÇÃO_BANCÁRIA.conta_bancária_id`, `CARTÃO_CRÉDITO.conta_bancária_id` e `LIQUIDAÇÃO_FINANCEIRA.conta_bancária_id` devem sempre referenciar uma Conta Bancária existente.
- **Regras de negócio**:
  - A conta bancária pode conter dinheiro que não é da terraplanagem (princípio 3) — isso não é um campo da Conta, é uma propriedade da `classificação` de cada Movimentação Bancária individual.
  - Toda Movimentação existe na Conciliação, sem exceção, para qualquer Conta cadastrada (princípio 3).

---

## 5. Classificação dos campos

| Categoria | Campos |
|---|---|
| Derivados | Nenhum |
| Calculados | Nenhum campo da própria entidade. **Saldo é explicitamente excluído como campo** — é sempre resultado de consulta agregada sobre `MOVIMENTAÇÃO_BANCÁRIA`, nunca armazenado nesta entidade nem em nenhuma outra |
| Persistidos | `empresa`, `banco`, `apelido` |
| Imutáveis | Nenhum |
| Auditáveis | `empresa`, `banco`, `apelido` |

---

## 6. Dependências com outras entidades

Depende de `EMPRESA` (obrigatório). É referenciada por `MOVIMENTAÇÃO_BANCÁRIA`, `CARTÃO_CRÉDITO` e `LIQUIDAÇÃO_FINANCEIRA`.

---

## 7. Checklist de decisões pendentes

**Esta entidade depende de alguma decisão ainda pendente? Não diretamente.**

Nenhuma das 14 pendências do conceitual, nem decisões das etapas de arquitetura, afeta esta entidade especificamente. A única dependência indireta é a pendência 1 (natureza jurídica das Empresas), na medida em que `CONTA_BANCÁRIA` referencia `EMPRESA` — mas nenhum campo desta entidade muda por causa disso.
