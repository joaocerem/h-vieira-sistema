# VÍNCULO_CONCILIAÇÃO

> **Reescrito — Sprint 3 (rodada de evolução operacional).** A versão anterior deste documento
> descrevia o Vínculo como 1:1 (opcional) com `LIQUIDAÇÃO_FINANCEIRA` — essa entidade foi
> removida (ver `decisions.md`, decisão #51, e `domain-model/10-liquidacao-financeira.md`). O
> Vínculo passa a referenciar `LANÇAMENTO_FINANCEIRO` diretamente, N:N. O conteúdo anterior não
> foi preservado à parte (era descrição de comportamento vigente, não um fato histórico
> independente — princípio 5 se aplica à entidade removida, não a este documento).

## 1. Visão geral

**Finalidade**: estado da conferência entre uma Movimentação Bancária e o(s) Lançamento(s) Financeiro(s) que ela corresponde (conceitual, Seção 3, reinterpretado após a remoção de Liquidação Financeira).

**Responsabilidade**: responder "essa movimentação já foi conferida contra o financeiro?" — dimensão independente de `classificação` (que responde "de quem é esse dinheiro?"). As duas nunca são fundidas (Seção 6 do conceitual). A partir da Sprint 3, é também a **única** confirmação válida de pagamento/recebimento do sistema — não existe mais nenhum estado "Pago" fora daqui.

**Quem cria**: Sistema (regra determinística, gerado automaticamente para toda Movimentação Bancária).

**Quem altera**: sistema (sugestão automática, revalidação após edição/cancelamento de um Lançamento conciliado) ou usuário (confirmar, marcar divergente, marcar sem correspondência, vincular manualmente).

**Quem consulta**: Conciliação (é a entidade central desse módulo), `FATURA` (`paga` é calculado a partir da conciliação dos Lançamentos gerados pelas Parcelas do ciclo), Balanço/Consultas Financeiras ("Realizado" = soma dos Lançamentos ligados a um Vínculo `Confirmado`), `LANÇAMENTO_FINANCEIRO` (`status_financeiro` é calculado a partir daqui).

**Quem nunca deve alterar**: Financeiro, Obras, Frota, Balanço — nenhum desses escreve em `VÍNCULO_CONCILIAÇÃO`; é exclusivamente escrita do módulo Conciliação (regra 13 do conceitual: "Conciliação | Escreve em: VÍNCULO_CONCILIAÇÃO, classificação de MOVIMENTAÇÃO_BANCÁRIA"). `LANÇAMENTO_FINANCEIRO#atualizar`/`#cancelar` disparam uma **revalidação** de compatibilidade (leitura + eventual transição para Divergente), nunca escrevem os campos do Vínculo diretamente.

---

## 2. Campos

| Campo | Significado | Tipo conceitual | Obrigatório? | Valor padrão | Pode mudar depois de criado? | Quem pode alterar | Regra de validação | Observações |
|---|---|---|---|---|---|---|---|---|
| `movimentação_bancária` | Movimentação Bancária sendo conferida | Referência para outra entidade (Movimentação Bancária) | Sim | Nenhum | Não — a Movimentação à qual o Vínculo se refere não muda | Sistema | Deve referenciar uma Movimentação existente | Toda Movimentação tem um Vínculo, mesmo que "Sem Correspondência" |
| `lançamentos_financeiros` | Lançamento(s) Financeiro(s) correspondentes, quando existem | N:N com `LANÇAMENTO_FINANCEIRO` | Não — vazio quando o estado é Não Vinculado ou Sem Correspondência | Vazio | Sim, à medida que a conferência avança (Não Vinculado/Sugerido → Confirmado, ou Confirmado → Divergente após revalidação) | Sistema, usuário | Cada Lançamento referenciado deve existir; um Lançamento só pode estar ligado a um Vínculo por vez (qualquer estado) | Um único Vínculo pode cobrir vários Lançamentos ao mesmo tempo (ex. pagamento de fatura de cartão cobrindo várias Parcelas de uma vez) — sem coluna de valor por par, não existe cobertura parcial |
| `estado_conciliação` | Situação da conferência | Lista de valores (Não Vinculado / Sugerido / Confirmado / Divergente / Sem Correspondência) | Sim | Não Vinculado | Sim | Sistema (regra determinística), usuário | Um dos cinco valores da Seção 6 do conceitual; divergência nunca é conciliada automaticamente — sempre fica para revisão humana | Dimensão independente de `classificação` |

---

## 3. Relacionamentos

| Relacionamento | Cardinalidade | Significado | Quem controla | Regras | Restrições |
|---|---|---|---|---|---|
| Movimentação Bancária → Vínculo Conciliação | 1:1 | Toda Movimentação tem exatamente um Vínculo | Sistema | — | — |
| Lançamento Financeiro → Vínculo Conciliação | N:N | Um Lançamento pode estar ligado a um Vínculo; um Vínculo pode cobrir vários Lançamentos | Sistema, usuário | Um Lançamento só pode estar ligado a um único Vínculo por vez, em qualquer estado (checado antes de sugerir/vincular) | Mapeado como `@ManyToMany`/`@JoinTable` simples — tabela de junção é só detalhe de persistência, sem entidade de domínio própria (decisão explícita, ver `decisions.md` #51) |

---

## 4. Regras da entidade

- **Campos mutuamente exclusivos**: nenhum identificado — mas `lançamentos_financeiros` fica vazio exatamente quando `estado_conciliação` ∈ {Não Vinculado, Sem Correspondência}.
- **Campos obrigatórios por contexto**: `lançamentos_financeiros` só é preenchido quando o estado é Sugerido, Confirmado ou Divergente.
- **Regras de criação**: gerada automaticamente (regra determinística) para toda Movimentação Bancária que existir, sempre em `Não Vinculado`.
- **Regras de alteração**: `estado_conciliação` e `lançamentos_financeiros` evoluem juntos, à medida que a conferência avança; divergência nunca é resolvida automaticamente — sempre exige revisão humana. Uma edição ou cancelamento de um Lançamento já conciliado (Vínculo `Confirmado`) dispara automaticamente uma revalidação da compatibilidade — se deixar de ser compatível, o Vínculo vira `Divergente` sozinho; a regra depende exclusivamente do resultado da comparação, nunca de qual ação (edição ou cancelamento) foi realizada.
- **Regras de exclusão**: não definidas — presumivelmente não se exclui, já que toda Movimentação precisa ter um Vínculo (mesmo que "Sem Correspondência").
- **Regras de auditoria**: toda alteração de estado deve ser registrada em `LOG_AUDITORIA`, com origem (Sistema / Manual).
- **Regras de integridade**: `movimentação_bancária` sempre obrigatória e existente; cada Lançamento em `lançamentos_financeiros`, quando presente, deve existir e não pode estar ligado a nenhum outro Vínculo simultaneamente.
- **Regras de negócio**:
  - `classificação` (em Movimentação Bancária) e `estado_conciliação` (aqui) são dimensões independentes, nunca fundidas — a segunda nunca é usada para inferir a primeira, nem vice-versa (Seção 6 do conceitual, por analogia direta à regra 29 sobre categoria/classificação).
  - **Critérios de compatibilidade** — usados idênticos pela sugestão automática (busca de candidatos), pela confirmação, pela vinculação manual e pela revalidação após edição/cancelamento: mesma Empresa (de todos os Lançamentos ligados, comparada à Empresa da Movimentação via Conta Bancária); mesma natureza (Despesa ↔ Movimentação com valor negativo, Receita ↔ valor positivo); mesmo valor (soma do `valor` de todos os Lançamentos ligados == valor absoluto da Movimentação — nunca comparação individual); vencimento de cada Lançamento ligado, individualmente, dentro de uma tolerância configurável (T6, `ConciliacaoProperties`, default 3 dias); e todos os Lançamentos ligados com `situação_administrativa` = "Ativo".
  - **Sugestão automática**: só propõe candidato único — nunca soma vários Lançamentos sozinha. Quando existem dois ou mais candidatos igualmente compatíveis, o sistema **não escolhe automaticamente** — o Vínculo permanece `Não Vinculado`, para o usuário resolver manualmente. Cobertura de vários Lançamentos por um só Vínculo só acontece pela vinculação manual, escolhida pelo usuário.
  - Movimentação já classificada como Transferência Interna nunca gera Lançamento (regra 5 do conceitual) — o Vínculo correspondente vai direto para `Sem Correspondência`, sem tentar matching.

---

## 5. Classificação dos campos

| Categoria | Campos |
|---|---|
| Derivados | Nenhum |
| Calculados | Nenhum campo do tipo "valor calculado" — mas `estado_conciliação` pode ser proposto por regra determinística (não digitação livre), o que é uma forma de sugestão automática, distinta de cálculo puro |
| Persistidos | `movimentação_bancária`, `lançamentos_financeiros`, `estado_conciliação` |
| Imutáveis | `movimentação_bancária` (a referência à Movimentação não muda) |
| Auditáveis | `lançamentos_financeiros`, `estado_conciliação` |

---

## 6. Dependências com outras entidades

Depende de `MOVIMENTAÇÃO_BANCÁRIA` (obrigatório) e, opcionalmente, de um ou mais `LANÇAMENTO_FINANCEIRO`. `LANÇAMENTO_FINANCEIRO.status_financeiro` e `FATURA.paga` dependem, por sua vez, do estado desta entidade (calculados a partir daqui, nunca o inverso).

---

## 7. Checklist de decisões pendentes

**Esta entidade depende de alguma decisão ainda pendente? Não.** A tolerância de dias do matching automático foi resolvida (T6, `ConciliacaoProperties`, configurável via `application.yaml`, default 3 dias) e os critérios de compatibilidade foram definidos explicitamente pelo usuário na Sprint 3 (ver `decisions.md`, decisão #51). Conciliação continua manual (importação de item de extrato) — conciliação via arquivo OFX real do banco permanece pendência, bloqueada até haver uma amostra real de arquivo `.ofx` (ver `pendencias.md`, Sprint 5).
