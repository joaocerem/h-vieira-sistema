# VÍNCULO_CONCILIAÇÃO

## 1. Visão geral

**Finalidade**: estado da conferência entre uma Movimentação Bancária e uma Liquidação Financeira (conceitual, Seção 3).

**Responsabilidade**: responder "essa movimentação já foi conferida contra o financeiro?" — dimensão independente de `classificação` (que responde "de quem é esse dinheiro?"). As duas nunca são fundidas (Seção 6 do conceitual).

**Quem cria**: Sistema (regra determinística), usuário, ou futuramente IA.

**Quem altera**: mesmo conjunto — sistema, usuário, ou futuramente IA (para revisar um estado já sugerido/confirmado).

**Quem consulta**: Conciliação (é a entidade central desse módulo), Balanço (indiretamente, para saber se uma Liquidação está confirmada contra o banco).

**Quem nunca deve alterar**: Financeiro, Obras, Frota, Balanço — nenhum desses escreve em `VÍNCULO_CONCILIAÇÃO`; é exclusivamente escrita do módulo Conciliação (regra 13 do conceitual: "Conciliação | Escreve em: VÍNCULO_CONCILIAÇÃO, classificação de MOVIMENTAÇÃO_BANCÁRIA").

---

## 2. Campos

| Campo | Significado | Tipo conceitual | Obrigatório? | Valor padrão | Pode mudar depois de criado? | Quem pode alterar | Regra de validação | Observações |
|---|---|---|---|---|---|---|---|---|
| `movimentação_bancária` | Movimentação Bancária sendo conferida | Referência para outra entidade (Movimentação Bancária) | Sim | Nenhum | Não — a Movimentação à qual o Vínculo se refere não muda | Sistema | Deve referenciar uma Movimentação existente | Toda Movimentação tem um Vínculo, mesmo que "Sem Correspondência" |
| `liquidação_financeira` | Liquidação Financeira correspondente, quando existe | Referência para outra entidade (Liquidação Financeira) | Não — nulo quando o estado é Sem Correspondência | Nenhum (vazio) | Sim, à medida que a conferência avança (de Não Vinculado/Sugerido para Confirmado, por exemplo) | Sistema, usuário, ou futuramente IA | Quando preenchido, deve referenciar uma Liquidação existente | — |
| `estado_conciliação` | Situação da conferência | Lista de valores (Não Vinculado / Sugerido / Confirmado / Divergente / Sem Correspondência) | Sim | Não Vinculado (inferência — estado inicial antes de qualquer sugestão ou confirmação) | Sim | Sistema (regra determinística), usuário, ou futuramente IA | Um dos cinco valores da Seção 6 do conceitual; divergência de valor nunca é conciliada automaticamente — sempre fica para revisão humana | Dimensão independente de `classificação` |

---

## 3. Relacionamentos

| Relacionamento | Cardinalidade | Significado | Quem controla | Regras | Restrições |
|---|---|---|---|---|---|
| Movimentação Bancária → Vínculo Conciliação | 1:1 | Toda Movimentação tem exatamente um Vínculo | Sistema | — | — |
| Liquidação Financeira → Vínculo Conciliação | 1:1 (opcional) | Uma Liquidação pode ter um Vínculo correspondente, quando há correspondência bancária | Sistema, usuário, ou futuramente IA | Nulo se Sem Correspondência | — |

---

## 4. Regras da entidade

- **Campos mutuamente exclusivos**: nenhum identificado — mas `liquidação_financeira` é logicamente nula exatamente quando `estado_conciliação` = Sem Correspondência.
- **Campos obrigatórios por contexto**: `liquidação_financeira` só é preenchida quando o estado não é Sem Correspondência.
- **Regras de criação**: gerada automaticamente (regra determinística) para toda Movimentação Bancária que existir.
- **Regras de alteração**: `estado_conciliação` e `liquidação_financeira` evoluem à medida que a conferência avança; divergência de valor nunca é resolvida automaticamente — sempre exige revisão humana.
- **Regras de exclusão**: não definidas — presumivelmente não se exclui, já que toda Movimentação precisa ter um Vínculo (mesmo que "Sem Correspondência").
- **Regras de auditoria**: toda alteração de estado deve ser registrada em `LOG_AUDITORIA`, com origem (Sistema / Manual / futuramente IA).
- **Regras de integridade**: `movimentação_bancária` sempre obrigatória e existente; `liquidação_financeira`, quando preenchida, deve existir.
- **Regras de negócio**: `classificação` (em Movimentação Bancária) e `estado_conciliação` (aqui) são dimensões independentes, nunca fundidas — a segunda nunca é usada para inferir a primeira, nem vice-versa (Seção 6 do conceitual, por analogia direta à regra 29 sobre categoria/classificação).

---

## 5. Classificação dos campos

| Categoria | Campos |
|---|---|
| Derivados | Nenhum |
| Calculados | Nenhum campo do tipo "valor calculado" — mas `estado_conciliação` pode ser proposto por regra determinística (não digitação livre), o que é uma forma de sugestão automática, distinta de cálculo puro |
| Persistidos | `movimentação_bancária`, `liquidação_financeira`, `estado_conciliação` |
| Imutáveis | `movimentação_bancária` (a referência à Movimentação não muda) |
| Auditáveis | `liquidação_financeira`, `estado_conciliação` |

---

## 6. Dependências com outras entidades

Depende de `MOVIMENTAÇÃO_BANCÁRIA` (obrigatório) e, opcionalmente, de `LIQUIDAÇÃO_FINANCEIRA`.

---

## 7. Checklist de decisões pendentes

**Esta entidade depende de alguma decisão ainda pendente? Sim.**

- **Qual decisão**: pendência 2 do conceitual — tolerância de dias no matching automático de conciliação.
- **Por que**: a regra determinística que sugere `estado_conciliação` = Sugerido (correspondência entre Movimentação e Liquidação por valor+data) depende de uma janela de tolerância de dias que ainda não foi definida como parâmetro de negócio.
- **O que muda na entidade**: nenhum campo novo — a pendência afeta o **comportamento** da regra que popula `estado_conciliação`, não a estrutura de campos desta entidade, que permanece a mesma independentemente do valor de tolerância escolhido.
