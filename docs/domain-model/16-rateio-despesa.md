# RATEIO_DESPESA

## 1. Visão geral

**Finalidade**: distribuição manual de uma Despesa entre várias Obras (conceitual, Seção 3).

**Responsabilidade**: ser a camada de análise que permite compartilhar o custo de um único Lançamento entre várias Obras, sem duplicar o valor original (princípio 6).

**Quem cria**: Usuário — manual, por definição (o próprio catálogo do conceitual enfatiza isso).

**Quem altera**: Usuário.

**Quem consulta**: `OBRA` (para calcular custo rateado), Balanço (indiretamente, para "Lucro por Obra").

**Quem nunca deve alterar**: Financeiro, Cartão, Conciliação, Frota, Balanço, IA — nenhum desses cria Rateio; é estritamente manual, por definição textual do próprio conceitual.

---

## 2. Campos

| Campo | Significado | Tipo conceitual | Obrigatório? | Valor padrão | Pode mudar depois de criado? | Quem pode alterar | Regra de validação | Observações |
|---|---|---|---|---|---|---|---|---|
| `lançamento_financeiro` | Lançamento (Despesa) sendo rateado | Referência para outra entidade (Lançamento Financeiro) | Sim | Nenhum | Não — o vínculo com o Lançamento rateado não deveria mudar (inferência) | — | Deve referenciar um Lançamento existente, com `obra` vazio nesse Lançamento | Ver regra de exclusividade na Seção 4 |
| `obra` | Obra que recebe parte do valor | Referência para outra entidade (Obra) | Sim | Nenhum | Não definido | Usuário | Deve referenciar uma Obra existente | Uma mesma Obra não deveria aparecer duas vezes para o mesmo Lançamento — inferência, não confirmado explicitamente |
| `valor_rateado` | Parte do valor do Lançamento atribuída a esta Obra | Valor monetário | Sim | Nenhum | Sim, enquanto o rateio total ainda não estiver fechado — não definido com precisão (ver pendência 8, Seção 7) | Usuário | A soma de `valor_rateado` de todos os registros de um mesmo Lançamento deve corresponder exatamente ao `valor` do Lançamento, admitida apenas a diferença estritamente decorrente do arredondamento inevitável da menor unidade monetária — nunca uma tolerância de negócio maior. Qualquer diferença além disso é inválida | A tolerância não representa uma política de negócio, mas apenas uma consequência matemática da representação de valores monetários |
| `critério_informado` | Anotação livre sobre o critério usado para ratear (ex. "50/50", "por horas de máquina") | Texto | Não definido explicitamente — inferência: opcional, campo de anotação | Nenhum | Sim | Usuário | Nenhuma | — |

---

## 3. Relacionamentos

| Relacionamento | Cardinalidade | Significado | Quem controla | Regras | Restrições |
|---|---|---|---|---|---|
| Lançamento Financeiro → Rateio Despesa | 1:N | Um Lançamento sem Obra direta pode ser dividido entre várias Obras | Usuário | Mutuamente exclusivo com atribuição direta (`obra` preenchido no Lançamento) | Só existe quando `LANÇAMENTO_FINANCEIRO.obra` está vazio |
| Obra → Rateio Despesa | 1:N | Uma Obra pode receber partes de vários Lançamentos rateados | Usuário | — | — |

---

## 4. Regras da entidade

- **Campos mutuamente exclusivos**: a existência de qualquer registro de `RATEIO_DESPESA` para um Lançamento é mutuamente exclusiva com o preenchimento de `LANÇAMENTO_FINANCEIRO.obra` — nunca as duas formas ao mesmo tempo, para não contar valor em dobro (Seção 8 do conceitual).
- **Campos obrigatórios por contexto**: nenhum além da obrigatoriedade geral.
- **Regras de criação**: sempre manual, nunca automática ou sugerida por IA (o rateio, por definição no conceitual, é manual — regra 15).
- **Regras de alteração**: alteração manual; sujeita à mesma regra de soma compatível com o valor do Lançamento.
- **Regras de exclusão**: não definidas explicitamente — ligada à pendência 8 (rateio pode ficar parcialmente pendente), que sugere que o estado "incompleto" é tolerado, mas não esclarece se um rateio pode ser removido depois de criado.
- **Regras de auditoria**: toda criação/alteração deve ser registrada em `LOG_AUDITORIA`.
- **Regras de integridade**: `lançamento_financeiro` e `obra` devem existir; a soma dos `valor_rateado` de um mesmo Lançamento deve corresponder exatamente ao `valor` do Lançamento, com tolerância restrita ao arredondamento inevitável da menor unidade monetária.
- **Regras de negócio**:
  - Rateio é manual; a soma dos valores rateados deve corresponder ao valor do lançamento, exceto por diferenças inevitáveis de arredondamento da menor unidade monetária — nunca uma tolerância de negócio para permitir rateios aproximados (regra 15).
  - O valor original do Lançamento nunca muda por causa do rateio (princípio 6; coluna "Não representa" do catálogo: "Uma segunda despesa — o valor original nunca muda").
  - Rateio e Ajuste são camadas de análise sobre um fato já existente, nunca duplicações do valor original (princípio 6).

---

## 5. Classificação dos campos

| Categoria | Campos |
|---|---|
| Derivados | Nenhum |
| Calculados | Nenhum campo próprio — mas esta entidade é o insumo do "custo rateado" usado no cálculo de "Lucro por Obra", sempre calculado em consulta (regra 20) |
| Persistidos | `lançamento_financeiro`, `obra`, `valor_rateado`, `critério_informado` |
| Imutáveis | Nenhum confirmado — apenas inferência sobre `lançamento_financeiro` |
| Auditáveis | Todos os campos |

---

## 6. Dependências com outras entidades

Depende de `LANÇAMENTO_FINANCEIRO` e `OBRA` (ambos obrigatórios).

---

## 7. Checklist de decisões pendentes

**Esta entidade depende de alguma decisão ainda pendente? Parcialmente — uma das duas já foi resolvida.**

1. ~~Pendência 7 do conceitual — tolerância de soma do Rateio~~ — **Resolvida.** A tolerância é exclusivamente técnica, restrita ao arredondamento inevitável da menor unidade monetária — nunca uma política de negócio para permitir rateios aproximados. Ver Seção 2 e Seção 4.
2. **Pendência 8 do conceitual — "Rateio pode ficar parcialmente pendente"** — permanece em aberto. **Por que**: determina se um Lançamento pode existir com rateio incompleto (soma menor que o valor total) por um período, ou se o rateio precisa ser fechado no ato do registro. **O que muda**: a regra de criação/alteração (Seção 4) ganha uma cláusula explícita sobre estados intermediários válidos, hoje ausente.
