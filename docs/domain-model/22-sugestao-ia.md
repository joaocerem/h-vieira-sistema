# SUGESTÃO_IA

## 1. Visão geral

**Finalidade**: proposta de classificação (categoria, classificação operacional, obra, veículo) feita pela IA, pendente de confirmação (conceitual, Seção 3).

**Responsabilidade**: ser o estado intermediário real no banco entre "a IA percebeu um padrão" e "o dado real foi alterado" — nunca grava diretamente em nenhuma entidade financeira (princípio 9; regra 26). É, ela mesma, o mecanismo que impede a IA de ser fonte de verdade (ver `replica-tecnica-auditoria-critica.md`, Divergência 5, e `arbitragem-tecnica-final.md`, Divergência 5).

**Quem cria**: a IA propõe.

**Quem altera**: o usuário confirma, edita ou rejeita — nunca a IA sozinha.

**Quem consulta**: `USUÁRIO` (para revisar e decidir), `LOG_AUDITORIA` (para registrar a confirmação como origem de uma alteração real).

**Quem nunca deve alterar**: nenhum módulo grava o dado real diretamente a partir de uma Sugestão sem a confirmação explícita do usuário — nem a própria IA, nem nenhum processo automático.

---

## 2. Campos

| Campo | Significado | Tipo conceitual | Obrigatório? | Valor padrão | Pode mudar depois de criado? | Quem pode alterar | Regra de validação | Observações |
|---|---|---|---|---|---|---|---|---|
| `entidade_alvo` | A entidade (Movimentação Bancária ou Lançamento Financeiro) e o registro específico ao qual a sugestão se refere | Referência para outra entidade (genérica, mas restrita apenas aos tipos definidos para sugestões: Movimentação Bancária **ou** Lançamento Financeiro) | Sim | Nenhum | Não | — | Deve referenciar um registro existente de um dos dois tipos permitidos — lista fechada, nunca uma referência livre | Mesma forma de referência genérica confirmada para `LOG_AUDITORIA` (nível conceitual apenas, técnica de implementação pertence à fase de banco), aqui restrita ao escopo próprio de `SUGESTÃO_IA` — dois tipos possíveis, não "qualquer entidade auditável" como em `LOG_AUDITORIA`. Cada mecanismo mantém seu próprio escopo. |
| `campo_sugerido` | Nome do campo que a IA está sugerindo alterar (ex. "categoria", "classificação", "obra", "veículo") | Texto | Sim | Nenhum | Não | — | Deve ser um dos campos elegíveis para sugestão (categoria, classificação, obra, veículo) — regra 29 exige que `categoria` e `classificação` nunca sejam fundidas na mesma sugestão | — |
| `valor_sugerido` | O valor que a IA propõe para esse campo | Referência para outra entidade ou Texto, dependendo do campo sugerido | Sim | Nenhum | Não | — | Deve ser um valor válido para o `campo_sugerido` em questão | — |
| `justificativa` | Explicação da IA sobre por que está sugerindo esse valor | Texto | Sim (inferência — a IA "nunca inventa causa... sem dado que a sustente", regra 30, o que pressupõe que toda sugestão vem acompanhada de uma justificativa) | Nenhum | Não | — | Deve haver conteúdo — a IA nunca afirma sem base | — |
| `status` | Situação da sugestão | Lista de valores (Pendente / Confirmada / Editada / Rejeitada — inferido da frase "IA propõe; usuário confirma/edita/rejeita" do catálogo) | Sim | Pendente | Sim, uma única transição (de Pendente para um dos três estados finais) | Usuário | — | Os valores exatos não são enumerados literalmente no conceitual — inferência razoável a partir do texto descritivo |
| `grupo_sugestão` | Agrupamento visual de sugestões relacionadas | Referência para outra entidade (opcional) | Não | Nenhum | Não | — | — | Explicitamente "só apresentação" (catálogo do conceitual) — **não deve influenciar nenhuma regra de negócio ou de confirmação**, é puramente para a interface apresentar sugestões relacionadas juntas |

---

## 3. Relacionamentos

| Relacionamento | Cardinalidade | Significado | Quem controla | Regras | Restrições |
|---|---|---|---|---|---|
| Movimentação Bancária ou Lançamento Financeiro → Sugestão IA | 1:N | Um registro pode receber várias sugestões ao longo do tempo | IA, ao propor | — | — |
| Usuário → Sugestão IA | 1:N | Um Usuário confirma, edita ou rejeita cada sugestão | Usuário | — | — |
| Sugestão IA → Sugestão IA (via `grupo_sugestão`) | N:1 (opcional) | Sugestões podem ser agrupadas apenas para apresentação | — | Não é uma regra de negócio, só de interface | Nunca deve ser usado para inferir confirmação em lote sem revisão individual — não confirmado explicitamente, mas coerente com regra 26 (toda sugestão fica pendente até confirmação humana) |

---

## 4. Regras da entidade

- **Campos mutuamente exclusivos**: se duas mudanças forem necessárias (ex. `categoria` e `classificação` simultaneamente), são duas Sugestões distintas, nunca uma só combinando os dois campos — regra 29, a mais importante desta entidade.
- **Campos obrigatórios por contexto**: nenhum além da obrigatoriedade geral.
- **Regras de criação**: só a IA cria Sugestões; nunca o usuário cria uma Sugestão manualmente (isso seria, simplesmente, uma alteração direta do dado).
- **Regras de alteração**: `status` muda de Pendente para Confirmada, Editada ou Rejeitada, exclusivamente por ação do usuário.
- **Regras de exclusão**: não definidas — presumivelmente uma Sugestão rejeitada permanece visível para auditoria (coerente com o princípio "nada desaparece"), não confirmado explicitamente.
- **Regras de auditoria**: a confirmação de uma Sugestão gera uma entrada em `LOG_AUDITORIA` com origem "Sugestão de IA Confirmada", referenciando esta Sugestão.
- **Regras de integridade**: `entidade_alvo` deve referenciar um registro existente de Movimentação Bancária ou Lançamento Financeiro.
- **Regras de negócio**:
  - A IA nunca funde `categoria` e `classificação` numa única suposição (regra 29).
  - Toda sugestão fica pendente até confirmação humana (regra 26).
  - Nível de confirmação Baixo — "sugestão de classificação, um clique" (Seção 11 do conceitual).
  - A IA nunca é fonte de verdade; nunca inventa causa sem dado que a sustente; informa quando não há dado suficiente (regra 30) — reflete-se diretamente na obrigatoriedade de `justificativa`.

---

## 5. Classificação dos campos

| Categoria | Campos |
|---|---|
| Derivados | Nenhum |
| Calculados | Nenhum |
| Persistidos | `entidade_alvo`, `campo_sugerido`, `valor_sugerido`, `justificativa`, `status`, `grupo_sugestão` |
| Imutáveis | `entidade_alvo`, `campo_sugerido`, `valor_sugerido`, `justificativa` (a proposta original da IA não muda; o que muda é o `status` da decisão humana sobre ela) |
| Auditáveis | `status` (a confirmação/edição/rejeição é o evento auditável) |

---

## 6. Dependências com outras entidades

Depende de `MOVIMENTAÇÃO_BANCÁRIA` ou `LANÇAMENTO_FINANCEIRO` (exatamente um dos dois, como alvo) e de `USUÁRIO` (para a confirmação).

---

## 7. Checklist de decisões pendentes

**Esta entidade depende de alguma decisão ainda pendente? Parcialmente.**

A forma conceitual da referência genérica `entidade_alvo` foi **resolvida**, em conjunto com a decisão equivalente para `LOG_AUDITORIA`: é uma referência genérica no nível conceitual, restrita à lista fechada e própria desta entidade (Movimentação Bancária ou Lançamento Financeiro — só esses dois tipos, nunca "qualquer entidade"), sem flexibilizar nenhuma regra de negócio (regra 29 continua exigindo sugestões separadas para `categoria`/`classificação`, por exemplo).

O que permanece em aberto:
- **A técnica exata de implementação** dessa referência (duas referências opcionais mutuamente exclusivas, ou outra abordagem) — decisão da fase de banco de dados, fora do escopo conceitual.
- **Pendência 10 do conceitual** — "Rejeição de sugestão de IA alimentar aprendizado futuro" (funcionalidade futura, não bloqueante). Não afeta a estrutura atual desta entidade, mas pode adicionar novos campos/relacionamentos no futuro, fora do escopo deste modelo.
