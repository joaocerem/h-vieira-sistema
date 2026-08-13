# TRANSFERÊNCIA_INTERNA

## 1. Visão geral

**Finalidade**: vincular duas Movimentações Bancárias que são, juntas, uma transferência entre contas próprias do grupo (conceitual, Seção 3).

**Responsabilidade**: registrar formalmente que duas saídas/entradas em Contas Bancárias diferentes são, na verdade, o mesmo dinheiro se movendo dentro do próprio grupo — nunca receita, nunca despesa (princípio 4; regra 4).

**Quem cria**: Usuário, ou sugestão determinística por valor+data. **Importante**: essa sugestão determinística é uma regra de correspondência técnica (valor e data batendo entre duas Movimentações), **nunca deve ser confundida com `SUGESTÃO_IA`**, que trata exclusivamente de classificação/categoria/obra/veículo (distinção explícita da Seção 6 do conceitual).

**Quem altera**: não definido explicitamente no conceitual.

**Quem consulta**: `MOVIMENTAÇÃO_BANCÁRIA` (as duas movimentações vinculadas), Conciliação.

**Quem nunca deve alterar**: Financeiro (uma Transferência Interna nunca gera `LANÇAMENTO_FINANCEIRO` — regra 5), IA (não há previsão de a IA gerar transferências, apenas sugestões determinísticas técnicas, que são de outra natureza).

---

## 2. Campos

| Campo | Significado | Tipo conceitual | Obrigatório? | Valor padrão | Pode mudar depois de criado? | Quem pode alterar | Regra de validação | Observações |
|---|---|---|---|---|---|---|---|---|
| `movimentação_origem` | Movimentação Bancária de onde o dinheiro saiu | Referência para outra entidade (Movimentação Bancária) | Sim | Nenhum | Não definido | Usuário | Deve referenciar uma Movimentação existente | Mutuamente exclusiva com `movimentação_destino` — não podem ser a mesma Movimentação |
| `movimentação_destino` | Movimentação Bancária para onde o dinheiro entrou | Referência para outra entidade (Movimentação Bancária) | Sim | Nenhum | Não definido | Usuário | Deve referenciar uma Movimentação existente, diferente da origem | — |
| `valor` | Valor da transferência | Valor monetário | Sim | Nenhum | Não definido | Usuário | Presumivelmente deve corresponder ao valor das duas Movimentações vinculadas — inferência, não confirmado como regra de validação explícita | — |
| `data` | Data da transferência | Data | Sim | Nenhum | Não definido | Usuário | Deve ser uma data válida | — |

---

## 3. Relacionamentos

| Relacionamento | Cardinalidade | Significado | Quem controla | Regras | Restrições |
|---|---|---|---|---|---|
| Transferência Interna → Movimentação Bancária (origem) | 1:1 | A Movimentação de saída | Usuário, ou sugestão determinística | — | Deve ter `classificação` = Transferência Interna |
| Transferência Interna → Movimentação Bancária (destino) | 1:1 | A Movimentação de entrada | Usuário, ou sugestão determinística | — | Deve ter `classificação` = Transferência Interna |

---

## 4. Regras da entidade

- **Campos mutuamente exclusivos**: `movimentação_origem` e `movimentação_destino` não podem referenciar a mesma Movimentação.
- **Campos obrigatórios por contexto**: nenhum além da obrigatoriedade geral.
- **Regras de criação**: manual, ou por sugestão determinística de correspondência por valor+data — mas mesmo a sugestão automática exige confirmação humana para se tornar um registro real (inferência a partir do padrão geral do conceitual de que sugestões automáticas nunca gravam sozinhas, mas não confirmado textualmente para esta entidade específica).
- **Regras de alteração**: não definidas.
- **Regras de exclusão**: não definidas.
- **Regras de auditoria**: toda criação deve ser registrada em `LOG_AUDITORIA`.
- **Regras de integridade**: as duas Movimentações vinculadas devem existir e, presumivelmente, ter `classificação` = Transferência Interna.
- **Regras de negócio**:
  - Transferência entre contas próprias nunca é receita nem despesa (princípio 4).
  - Transferência entre contas próprias nunca gera `LANÇAMENTO_FINANCEIRO` (regra 5).

---

## 5. Classificação dos campos

| Categoria | Campos |
|---|---|
| Derivados | Nenhum |
| Calculados | Nenhum |
| Persistidos | `movimentação_origem`, `movimentação_destino`, `valor`, `data` |
| Imutáveis | Não definido no conceitual |
| Auditáveis | Todos os campos |

---

## 6. Dependências com outras entidades

Depende de `MOVIMENTAÇÃO_BANCÁRIA` (duas referências obrigatórias).

---

## 7. Checklist de decisões pendentes

**Esta entidade depende de alguma decisão ainda pendente? Não diretamente entre as 14 pendências numeradas**, mas fica sujeita à mesma observação de `MOVIMENTAÇÃO_BANCÁRIA`: a pendência 2 (tolerância de dias no matching automático) provavelmente também influencia a sugestão determinística de correspondência por valor+data usada para propor Transferências Internas, embora o conceitual não amarre essa pendência explicitamente a esta entidade — registrado aqui como observação, não como pendência confirmada.
