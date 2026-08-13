# AÇÃO_PROPOSTA_IA

## 1. Visão geral

**Finalidade**: proposta de criação/alteração de registro feita pela IA, pendente de confirmação (conceitual, Seção 3).

**Responsabilidade**: ser o estado intermediário real no banco entre "a IA interpretou um comando em linguagem natural" e "um registro real foi criado ou alterado" — nunca executa sem confirmação explícita (regra 27), e exige barreira reforçada quando a ação envolve movimentar dinheiro (regra 28).

**Quem cria**: a IA propõe, a partir de comando em linguagem natural do usuário.

**Quem altera**: o usuário confirma, edita ou rejeita.

**Quem consulta**: `USUÁRIO`, `LOG_AUDITORIA` (referência de origem quando confirmada), e o registro real gerado após confirmação (uma entidade da lista fechada de entidades cuja criação/alteração é oficialmente permitida para IA, ver Seção 6 — não qualquer entidade do sistema).

**Quem nunca deve alterar**: nenhum módulo executa a ação proposta automaticamente — mesmo o nível de sensibilidade mais baixo exige confirmação explícita (regra 27); o nível Alto exige barreira reforçada, cujo mecanismo exato é decisão técnica pendente (pendência 12 do conceitual).

---

## 2. Campos

| Campo | Significado | Tipo conceitual | Obrigatório? | Valor padrão | Pode mudar depois de criado? | Quem pode alterar | Regra de validação | Observações |
|---|---|---|---|---|---|---|---|---|
| `tipo_ação` | Que tipo de ação está sendo proposta (ex. criar Lançamento, registrar Liquidação) | Texto (ou lista de valores, não enumerados explicitamente no conceitual) | Sim | Nenhum | Não | — | Deve corresponder a uma ação que o sistema de fato permite propor | Os tipos de ação possíveis não são enumerados taxativamente no conceitual — a Seção 11 cita exemplos (criar/alterar obrigação, confirmar Liquidação), mas não fecha a lista |
| `dados_propostos` | Os dados estruturados da ação, visíveis ao usuário antes de gravar | Conjunto de dados (estrutura variável conforme o `tipo_ação`) | Sim | Nenhum | Não — a proposta original não muda; se o usuário quiser algo diferente, isso é uma edição registrada como tal, não uma alteração silenciosa da proposta | Usuário, ao editar (gerando uma nova versão proposta, não sobrescrevendo a original sem rastro — inferência, não confirmado) | Deve conter todos os dados necessários para a ação proposta, "visíveis antes de gravar" (checklist do conceitual, Seção 18) | Este é o campo mais estruturalmente variável do modelo inteiro — seu formato depende inteiramente do `tipo_ação` |
| `nível_sensibilidade` | Grau de risco/impacto da ação proposta | Lista de valores (Baixo / Médio / Alto) | Sim | Nenhum — depende do `tipo_ação` (não é escolhido livremente, é determinado pela natureza da ação) | Não | — | Um dos três valores da Seção 11 do conceitual | Alto exige barreira de confirmação reforçada (regra 28; mecanismo exato — pendência 12) |
| `status` | Situação da ação proposta | Lista de valores (Pendente / Confirmada / Editada / Rejeitada — mesma inferência aplicada a `SUGESTÃO_IA`) | Sim | Pendente | Sim, uma única transição | Usuário | — | Valores exatos não enumerados literalmente no conceitual |

---

## 3. Relacionamentos

| Relacionamento | Cardinalidade | Significado | Quem controla | Regras | Restrições |
|---|---|---|---|---|---|
| Usuário → Ação Proposta IA | 1:N | Um Usuário confirma ou rejeita cada Ação Proposta | Usuário | Nível Alto exige barreira reforçada | Mecanismo exato — pendência 12 |
| Ação Proposta IA → registro real gerado | 0:1 (após confirmação) | Quando confirmada, a Ação gera (ou altera) um registro real numa das entidades elegíveis | Sistema, após confirmação | Só existe após confirmação — nunca antes | O registro real gerado depende do `tipo_ação` (ex. um novo `LANÇAMENTO_FINANCEIRO`, uma nova `LIQUIDAÇÃO_FINANCEIRA`) |

---

## 4. Regras da entidade

- **Campos mutuamente exclusivos**: nenhum identificado.
- **Campos obrigatórios por contexto**: nenhum além da obrigatoriedade geral.
- **Regras de criação**: só a IA cria Ações Propostas, a partir de comando em linguagem natural — nunca o usuário cria uma diretamente (isso seria simplesmente executar a ação).
- **Regras de alteração**: `status` muda de Pendente para Confirmada, Editada ou Rejeitada, exclusivamente por ação do usuário; ações de nível Alto exigem barreira adicional além da confirmação simples.
- **Regras de exclusão**: não definidas — mesma inferência de `SUGESTÃO_IA` (permanece visível para auditoria).
- **Regras de auditoria**: a confirmação gera uma entrada em `LOG_AUDITORIA` com origem "Ação de IA Confirmada", referenciando esta Ação — explicitamente exigido pelo checklist do conceitual (Seção 18: "a distinção entre 'IA propôs' e 'usuário confirmou' precisa sobreviver a uma consulta de auditoria feita meses depois").
- **Regras de integridade**: `dados_propostos` deve conter dados válidos e completos para o `tipo_ação` correspondente.
- **Regras de negócio**:
  - Toda criação/alteração de registro por comando em linguagem natural fica pendente até confirmação explícita, com dados estruturados visíveis antes de gravar (regra 27; checklist do conceitual).
  - Nenhuma ferramenta exposta à IA permite, mesmo indiretamente, escrita direta em `LANÇAMENTO_FINANCEIRO`, `LIQUIDAÇÃO_FINANCEIRA` ou `MOVIMENTAÇÃO_BANCÁRIA` sem passar pelos estados de proposta/confirmação (checklist do conceitual).
  - Ações de nível Alto (qualquer ação que gere ou confirme uma Liquidação real) exigem barreira de confirmação reforçada, tecnicamente não-contornável (regra 28; checklist do conceitual — "a ação de nível Alto não deve ser tecnicamente possível de executar sem a barreira reforçada").
  - A referência genérica ao "registro real gerado" (Seção 6) é restrita a uma lista fechada de entidades cuja criação/alteração é oficialmente permitida para IA — nunca uma referência livre a qualquer entidade do sistema. `AJUSTE_FINANCEIRO` está explicitamente **fora** dessa lista: a IA nunca pode formalizar, via `AÇÃO_PROPOSTA_IA`, uma proposta de criação de Ajuste Financeiro, independentemente do nível de sensibilidade. A IA pode identificar indícios ou situações que normalmente levariam um usuário a criar um Ajuste, e pode comunicar isso em linguagem natural durante uma consulta — mas não pode transformar essa conclusão em ação estruturada do sistema, nem iniciar o fluxo formal de criação. Essa exclusão é uma regra arquitetural, não uma limitação de implementação (ver `15-ajuste-financeiro.md`, Seção 1).

---

## 5. Classificação dos campos

| Categoria | Campos |
|---|---|
| Derivados | Nenhum |
| Calculados | Nenhum |
| Persistidos | `tipo_ação`, `dados_propostos`, `nível_sensibilidade`, `status` |
| Imutáveis | `tipo_ação`, `dados_propostos` (a proposta original), `nível_sensibilidade` |
| Auditáveis | `status` (o evento de confirmação/edição/rejeição) |

---

## 6. Dependências com outras entidades

Depende de `USUÁRIO` (para a confirmação). Pode gerar, após confirmação, um registro numa entidade da lista fechada de entidades elegíveis para criação/alteração por IA — hoje, pelo desenho do conceitual, isso inclui ao menos `LANÇAMENTO_FINANCEIRO` (criação, nível Médio) e `LIQUIDAÇÃO_FINANCEIRA` (nível Alto). `AJUSTE_FINANCEIRO` está explicitamente excluído dessa lista (ver Seção 4).

---

## 7. Checklist de decisões pendentes

**Esta entidade depende de alguma decisão ainda pendente? Sim.**

- **Qual decisão**: pendência 12 do conceitual — mecanismo exato da barreira "Alto" para ações financeiras da IA (reautenticação, segundo aprovador, ou outro mecanismo — já discutido tecnicamente em `arquitetura-tecnica.md`, Seção 8, e refinado em `arbitragem-tecnica-final.md`, Divergência 3, quanto ao princípio geral de mecanismos obrigatórios).
- **Por que**: sem essa decisão, o campo `nível_sensibilidade` = Alto está definido conceitualmente, mas o comportamento exato de confirmação que ele dispara não está.
- **O que muda na entidade**: nenhum campo novo necessariamente — a barreira reforçada é majoritariamente uma regra de comportamento/fluxo de confirmação, não uma mudança de estrutura de dados desta entidade. Pode, dependendo do mecanismo escolhido (ex. segundo aprovador), exigir um campo adicional para registrar o segundo Usuário envolvido — não modelado aqui por ainda não haver decisão.
- **Segunda pendência**: os valores possíveis de `tipo_ação` não são enumerados taxativamente no conceitual — mesma natureza de lacuna já identificada em outras entidades (`OBRA.status`, `PARCELA.status`), não catalogada entre as 14 pendências numeradas. Um ponto específico dessa lacuna já foi resolvido: `tipo_ação` = "criar Ajuste Financeiro" está confirmada e definitivamente **fora** do catálogo de ações permitidas (ver Seção 4). A enumeração completa dos demais valores válidos, e o mapeamento de cada um ao seu `nível_sensibilidade` correspondente, continua em aberto — a resolver quando o módulo de IA for modelado em detalhe.
