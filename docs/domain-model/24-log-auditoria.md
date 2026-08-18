# LOG_AUDITORIA

## 1. Visão geral

**Finalidade**: histórico granular (por campo) de alteração de qualquer entidade financeira relevante (conceitual, Seção 3).

**Responsabilidade**: permitir reconstruir, para qualquer dado, quem alterou, quando, o valor anterior, se a origem foi humana ou mediada por IA, e quem confirmou (Seção 12 do conceitual). É a entidade que sustenta o princípio 10 ("toda alteração relevante é auditável por campo") e a regra 31.

**Quem cria**: Sistema, automaticamente — nunca digitado manualmente.

**Quem altera**: ninguém. Um log de auditoria, por natureza, não é editado depois de criado — inferência estrutural forte (um log editável deixaria de servir ao propósito de auditoria), não uma frase literal do conceitual, mas decorrente diretamente do princípio "nada desaparece" (princípio 5) aplicado ao próprio mecanismo de rastreabilidade.

**Quem consulta**: qualquer módulo, para investigar o histórico de uma entidade; `USUÁRIO` (para saber quem fez o quê); a própria IA, indiretamente, se uma futura ferramenta de consulta expuser histórico de auditoria (não previsto explicitamente no catálogo da Seção 11 do conceitual, portanto não modelado como capacidade hoje).

**Quem nunca deve alterar**: absolutamente nenhum módulo ou usuário altera uma entrada de log já criada — só o sistema cria novas entradas.

---

## 2. Campos

| Campo | Significado | Tipo conceitual | Obrigatório? | Valor padrão | Pode mudar depois de criado? | Quem pode alterar | Regra de validação | Observações |
|---|---|---|---|---|---|---|---|---|
| `entidade` | Nome do tipo de entidade que sofreu a alteração (ex. "Lançamento Financeiro") | Texto | Sim | Nenhum | Não | — | Deve corresponder a um dos tipos de entidade explicitamente incluídos na lista fechada de entidades oficialmente auditáveis do sistema — nunca uma referência livre | Parte do vínculo genérico, confirmado como referência genérica única no nível conceitual (ver Seção 7); a técnica exata de implementação é decisão da fase de modelagem do banco de dados |
| `id` | Identificação do registro específico que sofreu a alteração | Referência para outra entidade (genérica — qualquer entidade da lista fechada de entidades auditáveis) | Sim | Nenhum | Não | — | Deve referenciar um registro existente do tipo indicado em `entidade` | A forma técnica exata dessa referência genérica é decisão da fase de banco de dados — a existência do vínculo em si já está confirmada no nível conceitual (ver Seção 7) |
| `campo_alterado` | Nome do campo específico que mudou | Texto | Sim | Nenhum | Não | — | — | É o que torna o log "granular por campo", não um resumo |
| `valor_anterior` | Valor do campo antes da alteração | Texto ou valor genérico (o tipo real depende do campo original) | Sim, mesmo que vazio (ex. criação de um registro novo, onde "anterior" é a ausência do valor) | Nenhum | Não | — | — | — |
| `valor_novo` | Valor do campo depois da alteração | Texto ou valor genérico | Sim | Nenhum | Não | — | — | — |
| `data/hora` | Momento exato da alteração | Data e hora | Sim | Nenhum (sempre o momento real do evento) | Não | — | Deve ser uma data e hora válidas | — |
| `usuário` | Usuário responsável, quando a origem é humana | Referência para outra entidade (Usuário) | Condicional — obrigatório quando `origem` é Manual, Sugestão de IA Confirmada ou Ação de IA Confirmada; não se aplica quando `origem` é Importação Bancária | Nenhum | Não | — | Deve referenciar um Usuário existente, quando aplicável | — |
| `origem` | De onde veio a alteração | Lista de valores (Manual / Importação Bancária / Sugestão de IA Confirmada / Ação de IA Confirmada) | Sim | Nenhum | Não | — | Um dos quatro valores (Seção 12 do conceitual) | — |
| `referência a Sugestão/Ação de IA` | Aponta para a `SUGESTÃO_IA` ou `AÇÃO_PROPOSTA_IA` que originou a alteração | Referência para outra entidade (opcional, genérica entre as duas) | Condicional — presente apenas quando `origem` é Sugestão de IA Confirmada ou Ação de IA Confirmada | Nenhum (vazio) | Não | — | Deve referenciar uma Sugestão ou Ação existente, quando aplicável | — |

---

## 3. Relacionamentos

| Relacionamento | Cardinalidade | Significado | Quem controla | Regras | Restrições |
|---|---|---|---|---|---|
| Qualquer entidade financeira → Log Auditoria | 1:N | Cada alteração relevante de campo gera uma entrada de log | Sistema, automaticamente | Relacionamento genérico, confirmado no nível conceitual — restrito à lista fechada de entidades oficialmente auditáveis (ver Seção 4) | A técnica exata de implementação é decisão da fase de banco de dados |
| Usuário → Log Auditoria | 1:N (condicional) | Toda entrada de origem humana referencia o Usuário responsável | Sistema | — | Não se aplica a origem "Importação Bancária" |
| Sugestão IA ou Ação Proposta IA → Log Auditoria | 1:N (condicional) | Entradas de origem "Sugestão/Ação de IA Confirmada" referenciam a proposta que as originou | Sistema | — | — |

---

## 4. Regras da entidade

- **Campos mutuamente exclusivos**: nenhum identificado — mas `usuário` e `referência a Sugestão/Ação de IA` têm presença condicionada a `origem`.
- **Campos obrigatórios por contexto**: `usuário` obrigatório quando `origem` ≠ Importação Bancária; `referência a Sugestão/Ação de IA` obrigatória quando `origem` = Sugestão/Ação de IA Confirmada.
- **Regras de criação**: automática pelo sistema, disparada por qualquer alteração relevante em qualquer entidade financeira coberta.
- **Regras de alteração**: nunca — um log de auditoria não é alterado depois de criado (inferência estrutural).
- **Regras de exclusão**: nunca — o mesmo princípio "nada desaparece" que rege os fatos financeiros se aplica, com ainda mais força, ao próprio mecanismo de rastreabilidade desses fatos.
- **Regras de auditoria**: esta entidade **é** o mecanismo de auditoria — não gera log sobre si mesma.
- **Regras de integridade**: `id` deve referenciar um registro existente do tipo declarado em `entidade`; `usuário` e `referência a Sugestão/Ação de IA`, quando aplicáveis, devem referenciar registros existentes.
- **Regras de negócio**:
  - Granularidade por campo, não um resumo (coluna "Não representa" do catálogo do conceitual).
  - Deve existir desde a primeira versão do schema, não como melhoria futura (checklist do conceitual, Seção 18). **Nota de reconciliação (A7, `decisions.md` decisão #36)**: essa exigência nunca dependeu do modelo completo de permissões (pendência 5 do conceitual, Seção 16, não-bloqueante) — o "Usuário mínimo" (`domain-model/02-usuario.md`) sempre foi suficiente para viabilizar `usuário` desde o início. O modelo completo de permissões nunca foi pré-requisito para a auditoria; hoje a tensão textual entre as duas seções do conceitual tem só valor histórico, já que a pendência 5 foi encerrada por A2 (decisão #16).
  - Permite reconstruir, para qualquer dado, quem alterou, quando, o valor anterior, se a origem foi humana ou mediada por IA, e quem confirmou (Seção 12 do conceitual).
  - A referência genérica existe apenas no nível conceitual — representa a ideia de que determinadas entidades podem ser alvo de auditoria; a técnica utilizada para implementá-la é decisão exclusiva da fase de modelagem do banco de dados.
  - A lista de entidades que podem ser referenciadas por `entidade` é fechada e explicitamente definida pelo sistema — nunca uma referência totalmente livre. Quando uma entidade nova precisar ser auditável no futuro, ela deve ser adicionada deliberadamente a essa lista, nunca passar a ser auditável automaticamente.
  - A existência da referência genérica não flexibiliza nenhuma regra de negócio — ela existe só para evitar duplicação estrutural (não seria necessário criar uma entidade de log por tipo de entidade auditável). As restrições de negócio de cada mecanismo (Sugestão IA, Ação Proposta IA, Ajuste Financeiro) continuam pertencendo às próprias entidades e fluxos, nunca ao mecanismo de referência em si.

---

## 5. Classificação dos campos

| Categoria | Campos |
|---|---|
| Derivados | Nenhum |
| Calculados | Nenhum |
| Persistidos | Todos os campos listados na Seção 2 |
| Imutáveis | Todos os campos, sem exceção — é a única entidade do modelo inteiro cujos campos são integralmente imutáveis após a criação, por definição de propósito |
| Auditáveis | Não aplicável — esta entidade não audita a si mesma (evitaria recursão infinita, e o conceitual não prevê isso) |

---

## 6. Dependências com outras entidades

Depende, de forma genérica, de qualquer entidade financeira do sistema (via `entidade` + `id`), de `USUÁRIO` (condicionalmente) e de `SUGESTÃO_IA`/`AÇÃO_PROPOSTA_IA` (condicionalmente). É a entidade com a maior superfície de dependência de todo o modelo, exatamente por ser transversal.

---

## 7. Checklist de decisões pendentes

**Esta entidade depende de alguma decisão ainda pendente? Parcialmente.**

A forma conceitual da pendência 13 do conceitual (vínculo genérico de `LOG_AUDITORIA`, e também `SUGESTÃO_IA`, `AÇÃO_PROPOSTA_IA`) foi **resolvida**: `LOG_AUDITORIA` permanece uma única entidade, com referência genérica (`entidade` + `id`) — não uma família de entidades por tipo auditável. Essa referência existe só no nível conceitual, é restrita a uma lista fechada de entidades oficialmente auditáveis, e não flexibiliza nenhuma regra de negócio própria de cada mecanismo (ver Seção 4). `AJUSTE_FINANCEIRO`, confirmado à parte, permanece usando referências concretas (não genéricas) — nunca fez parte do problema do vínculo genérico em si.

O que permanece em aberto:
- **A técnica exata de implementação** da referência genérica (referência polimórfica, tabela de junção, ou outra abordagem) — decisão exclusiva da fase de modelagem do banco de dados, fora do escopo conceitual. A Divergência 3 da arbitragem técnica (mecanismo automático e ciente de contexto de negócio para popular o log) também pertence a essa fase — não muda a estrutura de campos aqui modelada, só determina *como* e *quando* cada entrada é efetivamente criada.
- **A enumeração explícita da lista fechada de entidades auditáveis** ainda não foi compilada como artefato próprio — hoje ela existe de forma distribuída, porque cada um dos 24 documentos de entidade já declara, na sua Seção 5, se é auditável. Compilar essa lista num só lugar é um passo de organização documental, não uma nova decisão de modelagem.
