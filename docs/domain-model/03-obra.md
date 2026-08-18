# OBRA

## 1. Visão geral

**Finalidade**: representar um contrato/projeto de terraplanagem executado para um Cliente.

**Responsabilidade**: ser o centro de custo/receita opcional ao qual Lançamentos Financeiros (diretos ou rateados) podem ser atribuídos, e servir de base para a visão de "Lucro por Obra" (sempre calculada em consulta, nunca armazenada — regra 20 do conceitual).

**Quem cria**: cadastro manual.

**Quem altera**: cadastro manual (correção de dados, atualização de status e datas ao longo da execução).

**Quem consulta**: `LANÇAMENTO_FINANCEIRO` (para exibir Obra associada), `RATEIO_DESPESA`, `VEÍCULO` (para alocação operacional corrente — `obra_atual`, D4, `decisions.md` decisão #26), o módulo de Balanço/relatórios (para calcular custo e lucro por Obra), `CLIENTE` (para listar Obras de um Cliente).

**Quem nunca deve alterar**: Financeiro, Cartão, Conciliação, Balanço, Frota, IA — nenhum desses escreve em Obra. O conceitual (Seção 13) restringe a escrita de Obra a "só cadastro de OBRA", e trata explicitamente o módulo Obras como leitor, nunca escritor, de `LANÇAMENTO_FINANCEIRO`.

---

## 2. Campos

| Campo | Significado | Tipo conceitual | Obrigatório? | Valor padrão | Pode mudar depois de criado? | Quem pode alterar | Regra de validação | Observações |
|---|---|---|---|---|---|---|---|---|
| `nome` | Nome/identificação da Obra | Texto | Sim | Nenhum | Sim | Cadastro manual | Não vazio | — |
| `cliente` | Cliente para quem a Obra é executada | Referência para outra entidade (Cliente) | Sim | Nenhum | Não definido se pode ser reatribuída a outro Cliente após criação — inferência: improvável, mas não confirmado | Cadastro manual | Deve referenciar um Cliente existente | Uma Obra sempre tem exatamente um Cliente (regra 12 do conceitual) |
| `valor_contratado` | Valor total do contrato da Obra | Valor monetário | Sim | Nenhum | Não definido explicitamente (ex. aditivo contratual alterando o valor) — observação, não regra confirmada | Cadastro manual | Deve ser um valor monetário válido | Não se confunde com a Receita realizada da Obra, que pode ocorrer em várias parcelas ao longo do tempo (regra 13) |
| `data_início` | Data em que a Obra começou | Data | Sim | Nenhum | Sim, por correção de cadastro | Cadastro manual | Deve ser uma data válida | — |
| `data_prevista_término` | Data planejada para conclusão | Data | Sim (campo principal listado no conceitual) | Nenhum | Sim — replanejamento é esperado ao longo da execução | Cadastro manual | Deve ser uma data válida | Não há regra explícita de que deva ser posterior a `data_início` — inferência lógica razoável, não confirmada como validação obrigatória |
| `data_real_término` | Data em que a Obra de fato terminou | Data | Não — só existe quando a Obra é concluída | Nenhum (em branco até a conclusão) | Preenchida uma vez, ao concluir; correções posteriores não vedadas explicitamente | Cadastro manual | Deve ser uma data válida quando preenchida | — |
| `status` | Situação atual da Obra | Lista de valores (A executar / Em andamento / Pausada / Concluída) | Sim | `A executar` | Sim, sujeito à regra de transição (ver Seção 4) | Cadastro manual | Um dos quatro valores — D9, `decisions.md` decisão #30 | Diferente de `LANÇAMENTO_FINANCEIRO.status`, que é explicitamente calculado (Seção 2 do conceitual); nada no conceitual indica que `OBRA.status` seja calculado — é tratado aqui como informado manualmente |

---

## 3. Relacionamentos

| Relacionamento | Cardinalidade | Significado | Quem controla | Regras | Restrições |
|---|---|---|---|---|---|
| Cliente → Obra | 1:N | Um Cliente pode ter várias Obras; cada Obra pertence a exatamente um Cliente | Cadastro manual da Obra | Obra não existe sem Cliente | — |
| Obra → Lançamento Financeiro (direto) | 1:N | Uma Obra pode ter vários Lançamentos (Receitas ou Despesas) atribuídos diretamente via `obra_id` | Usuário, ao registrar o Lançamento | Mutuamente exclusivo com o rateio (ver abaixo) | Nem toda Despesa precisa de Obra (regra 16); Receita também pode não ter Obra (regra 21) |
| Obra → Rateio Despesa | 1:N | Uma Obra pode receber parte do valor de uma Despesa compartilhada, via `RATEIO_DESPESA` | Usuário, manualmente (rateio é sempre manual — regra 15) | Quando uma Despesa é rateada, o `obra_id` do Lançamento original fica nulo — a Obra só aparece via `RATEIO_DESPESA`, nunca as duas formas ao mesmo tempo para o mesmo Lançamento | Ver Seção 4 |
| Obra → Veículo (alocação atual) | 1:N (opcional) | Uma Obra pode ter vários Veículos atualmente alocados a ela, via `VEÍCULO.obra_atual` | Usuário, ao gerenciar a alocação do Veículo | Inteiramente independente da dimensão financeira (Lançamento/Rateio) | D4, `decisions.md` decisão #26 |

---

## 4. Regras da entidade

- **Campos mutuamente exclusivos**: não há mutuamente exclusivos dentro da própria entidade Obra. A exclusividade mútua relevante (atribuição direta via `obra_id` no Lançamento **vs.** rateio via `RATEIO_DESPESA`) é uma regra do relacionamento Obra↔Lançamento, formalizada no conceitual (Seção 8): "nunca as duas formas ao mesmo tempo, para não contar valor em dobro".
- **Campos obrigatórios por contexto**: `data_real_término` só se aplica quando a Obra é concluída; nos demais estados, permanece vazio.
- **Regras de criação**: sempre cadastro manual; a criação de uma Obra nunca é disparada por outro módulo.
- **Regras de alteração**: alteração manual; toda mudança de campo deve ser auditada.
- **Regras de exclusão**: não definidas no conceitual. Dado que Obra pode ter Lançamentos e Rateios vinculados, e que o princípio "nada desaparece" se aplica a fatos financeiros, presumir exclusão física livre seria arriscado — mas isso é observação, não regra confirmada.
- **Regras de auditoria**: toda alteração de campo deve ser registrada em `LOG_AUDITORIA` (regra 31).
- **Regras de integridade**: `RATEIO_DESPESA.obra_id` deve referenciar uma Obra existente; `LANÇAMENTO_FINANCEIRO.obra_id`, quando preenchido, deve referenciar uma Obra existente.
- **Regras de negócio**:
  - `status` nasce em `A executar`; transições confirmadas: `A executar` → `Em andamento` (início); `Em andamento` ⇄ `Pausada` (pausa/retomada); `Em andamento` → `Concluída` (finalização). Nenhuma outra transição confirmada (D9, `decisions.md` decisão #30).
  - Uma Obra pode ter várias Receitas ao longo do tempo (regra 13).
  - Nem toda Despesa precisa pertencer a uma Obra (regra 16) — Obra não é centro de custo genérico obrigatório.
  - "Lucro por Obra" é sempre uma visão calculada (Receita direta − custo direto − custo rateado ± ajustes vinculados), **nunca um campo armazenado na entidade Obra** (regra 20, Seção 8 do conceitual) — ver Seção 5.
  - Uma Obra pode coexistir com um Veículo no mesmo Lançamento, sem que isso afete a entidade Obra em si (regra 18 — relevante à entidade Veículo/Lançamento, citada aqui por completude).

---

## 5. Classificação dos campos

| Categoria | Campos |
|---|---|
| Derivados | Nenhum campo derivado pertence à própria entidade Obra |
| Calculados | Nenhum — importante: "Lucro por Obra", "custo direto", "custo rateado" **não são campos de Obra**. São resultados de consulta agregada sobre `LANÇAMENTO_FINANCEIRO` e `RATEIO_DESPESA`, calculados sempre em tempo de consulta, nunca persistidos em lugar nenhum — nem na Obra, nem em outra tabela (regra 20; princípio 8 do conceitual) |
| Persistidos | `nome`, `cliente`, `valor_contratado`, `data_início`, `data_prevista_término`, `data_real_término`, `status` |
| Imutáveis | Nenhum campo é declarado imutável no conceitual |
| Auditáveis | Todos os campos persistidos |

---

## 6. Dependências com outras entidades

Depende de `CLIENTE` (obrigatório). É referenciada por `LANÇAMENTO_FINANCEIRO` (opcionalmente, via `obra_id`), por `RATEIO_DESPESA` (obrigatoriamente, quando existe rateio para essa Obra) e por `VEÍCULO` (opcionalmente, via `obra_atual` — D4, `decisions.md` decisão #26).

---

## 7. Checklist de decisões pendentes

**Esta entidade depende de alguma decisão ainda pendente? Não — resolvida.**

- ~~Os valores válidos do campo `status` de Obra não estavam enumerados em nenhum lugar do conceitual~~ — **Resolvida (D9).** Quatro valores confirmados: A executar / Em andamento / Pausada / Concluída, com regra de transição — ver Seção 2 e Seção 4; `decisions.md`, decisão #30. Permanece em aberto, sem relação com D9: se `status` = `Concluída` deveria exigir `data_real_término` preenchida — a resposta de negócio não tratou dessa relação entre os dois campos; a Seção 2 continua tratando o preenchimento de `data_real_término` só como observação/inferência, não como regra de validação confirmada.
