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
| `valor_rateado` | Parte do valor do Lançamento atribuída a esta Obra | Valor monetário | Sim | Nenhum | Sim, sem limite de tempo (D3, `decisions.md` decisão #25) | Usuário | A soma de `valor_rateado` de todos os registros de um mesmo Lançamento deve corresponder exatamente ao `valor` do Lançamento **quando o rateio estiver completo**, admitida apenas a diferença estritamente decorrente do arredondamento inevitável da menor unidade monetária — nunca uma tolerância de negócio maior. Soma menor que o valor é estado intermediário válido (D3) | A tolerância não representa uma política de negócio, mas apenas uma consequência matemática da representação de valores monetários |
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
- **Regras de alteração**: alteração manual; sujeita à mesma regra de soma compatível com o valor do Lançamento. Permanece livremente editável mesmo depois que o Lançamento já tem `APLICAÇÃO_DE_LIQUIDAÇÃO` vinculada — nenhum mecanismo equivalente a `AJUSTE_FINANCEIRO` protege o Rateio; erro identificado depois é corrigido diretamente no registro (D8, `decisions.md` decisão #29, decisão de negócio explícita — status quo mantido deliberadamente).
- **Regras de exclusão**: não definidas explicitamente. D3 (resolvida) confirma que o estado "incompleto" é tolerado sem limite de tempo. D8 (resolvida) confirma que **alteração** permanece livre mesmo após liquidação. Nenhuma das duas esclarece se um registro de Rateio pode ser **removido** (excluído) depois de criado — questão distinta, ainda em aberto.
- **Efeito colateral em `LANÇAMENTO_FINANCEIRO`**: a existência de qualquer registro de Rateio para um Lançamento também funciona como gatilho de desacoplamento da propagação automática de correções vindas de `COMPRA_CARTÃO` (D5, `decisions.md` decisão #27) — uma vez rateado, aquele Lançamento para de receber atualizações automáticas de `categoria`/`obra`/`veículo`, mesmo que a Compra de origem seja corrigida depois.
- **Regras de auditoria**: toda criação/alteração deve ser registrada em `LOG_AUDITORIA`.
- **Regras de integridade**: `lançamento_financeiro` e `obra` devem existir; a soma dos `valor_rateado` de um mesmo Lançamento deve corresponder exatamente ao `valor` do Lançamento **quando o rateio estiver completo**, com tolerância restrita ao arredondamento inevitável da menor unidade monetária. Soma menor que o valor é um estado intermediário válido, tolerado sem limite de tempo (D3, `decisions.md` decisão #25) — a completude é sempre calculada por comparação, nunca persistida (princípio 6).
- **Regras de criação/alteração**: um Lançamento pode ser registrado, e um Rateio pode existir, antes de a distribuição entre Obras estar completa — não há exigência de fechamento no ato do registro, nem prazo para completar (D3).
- **Regras de negócio**:
  - Rateio é manual; a soma dos valores rateados, quando completa, deve corresponder ao valor do lançamento, exceto por diferenças inevitáveis de arredondamento da menor unidade monetária — nunca uma tolerância de negócio para permitir rateios aproximados (regra 15).
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

**Esta entidade depende de alguma decisão ainda pendente? Não — ambas resolvidas.**

1. ~~Pendência 7 do conceitual — tolerância de soma do Rateio~~ — **Resolvida.** A tolerância é exclusivamente técnica, restrita ao arredondamento inevitável da menor unidade monetária — nunca uma política de negócio para permitir rateios aproximados. Ver Seção 2 e Seção 4.
2. ~~Pendência 8 do conceitual — "Rateio pode ficar parcialmente pendente"~~ — **Resolvida (D3).** Um Lançamento pode existir com rateio incompleto (soma menor que o valor total) por tempo indeterminado, sem prazo para fechamento — confirmado pela operação real. A regra de soma exata vale no fechamento, não a cada escrita. Nenhum campo novo — completude sempre calculada. Ver Seção 2, Seção 4 e `decisions.md`, decisão #25.
3. ~~D8 (`revisao-integridade-dominio.md`, achado importante) — risco de edição retroativa de Rateio após Aplicação de Liquidação já existente~~ — **Resolvida.** Mantido o status quo, por decisão de negócio explícita: Rateio permanece livremente editável mesmo após liquidação — sem mecanismo equivalente a `AJUSTE_FINANCEIRO`. Rastreabilidade preservada só via `LOG_AUDITORIA` genérico. Ver Seção 4 e `decisions.md`, decisão #29.

Nota: a **exclusão** de um registro de Rateio após criado continua sem regra definida (ver Seção 4) — questão distinta de D3 e D8, não resolvida por nenhuma das duas decisões.
