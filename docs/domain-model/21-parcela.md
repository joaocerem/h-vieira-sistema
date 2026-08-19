# PARCELA

## 1. Visão geral

**Finalidade**: parcela individual, reutilizada por Compra de Cartão e Contrato Financeiro (conceitual, Seção 3).

**Responsabilidade**: representar cada fração de um parcelamento — seja de uma Compra de Cartão, seja de um Contrato Financeiro — e ser a ponte que gera um `LANÇAMENTO_FINANCEIRO` no momento do vencimento, quando aplicável.

**Quem cria**: Sistema, ao calcular o parcelamento (a partir de `COMPRA_CARTÃO.nº parcelas` ou da estrutura de `CONTRATO_FINANCEIRO`).

**Quem altera**: não definido explicitamente no conceitual — ver Seção 7.

**Quem consulta**: `LANÇAMENTO_FINANCEIRO` (quando a Parcela vence e gera um), `FATURA` (que a reivindica no fechamento do ciclo correspondente, ou no momento de uma importação com fonte externa autoritativa, no caso de Parcelas de Cartão).

**Quem nunca deve alterar**: Financeiro não escreve diretamente em Parcela (é o módulo Cartões, ou o equivalente para Contrato Financeiro, que gera); Conciliação, Obras, Frota, Balanço, IA não escrevem aqui.

---

## 2. Campos

| Campo | Significado | Tipo conceitual | Obrigatório? | Valor padrão | Pode mudar depois de criado? | Quem pode alterar | Regra de validação | Observações |
|---|---|---|---|---|---|---|---|---|
| `origem` | Se a Parcela vem de uma Compra de Cartão ou de um Contrato Financeiro | Lista de valores (Compra Cartão / Contrato Financeiro) | Sim | Nenhum | Não | Sistema | Um dos dois valores | Determina qual dos dois relacionamentos condicionais se aplica |
| `número` | Posição desta Parcela na sequência (ex. "3" de "12") | Número inteiro | Sim | Nenhum | Não | Sistema | Deve ser maior que 0 e menor ou igual a `total` | — |
| `total` | Quantidade total de Parcelas do parcelamento | Número inteiro | Sim | Nenhum | Não | Sistema | Deve ser um número inteiro positivo | Corresponde a `COMPRA_CARTÃO.nº parcelas`, quando `origem` = Compra Cartão |
| `valor` | Valor desta Parcela específica | Valor monetário | Sim | Nenhum | Não definido | Sistema | Deve ser um valor monetário positivo | — |
| `vencimento` | Data em que esta Parcela vence | Data | Sim | Nenhum | Não definido | Sistema | Deve ser uma data válida | É o gatilho para gerar o `LANÇAMENTO_FINANCEIRO` correspondente |
| `fatura` | Fatura à qual esta Parcela foi atribuída — o ciclo em que passou a integrar o processo financeiro do sistema | Referência para outra entidade (Fatura) | Não — ausente até o vínculo ser atribuído | Nenhum (vazio até a atribuição) | Não, depois de atribuído — o vínculo é permanente, mesmo que a Fatura já esteja fechada (ver regra de atribuição na Seção 4) | Sistema | Quando preenchido, deve referenciar uma Fatura existente | Aplicável apenas quando `origem` = Compra Cartão (Parcelas de Contrato Financeiro não se relacionam com Fatura). A ausência deste vínculo já representa, por si só, o estado "aguardando fatura" |

**[Nota de atualização — decisão #39, Fase 4]** Fórmula de divisão de `valor` e cálculo de `vencimento`, aplicável quando `origem` = Compra Cartão (lacuna não coberta na modelagem original, resolvida por resposta de negócio):
- **Divisão de `valor`**: as primeiras N-1 Parcelas recebem `COMPRA_CARTÃO.valor ÷ N`, truncado (arredondado para baixo) na segunda casa decimal; a última Parcela (`número` = `total`) recebe o valor residual — `COMPRA_CARTÃO.valor` menos a soma das N-1 primeiras —, absorvendo integralmente a diferença de arredondamento. Exemplo: R$100,00 em 3× = R$33,33 + R$33,33 + R$33,34.
- **Cálculo de `vencimento`**: o "ciclo" da Compra é determinado comparando o dia de `COMPRA_CARTÃO.data` com `CARTÃO_CRÉDITO.dia_fechamento` — dia ≤ `dia_fechamento` entra no ciclo do mês corrente da compra; dia > `dia_fechamento` entra no ciclo do mês seguinte. O `vencimento` da Parcela nº 1 é o dia `dia_vencimento` dentro do mês desse ciclo (ajustado para o último dia do mês quando `dia_vencimento` não existir nesse mês); cada Parcela seguinte vence um mês depois, sempre no dia `dia_vencimento`.

**Nota sobre `status`**: campo **removido do modelo** (D11, `decisions.md` decisão #32) — nunca existiu nas planilhas originais, e nenhuma regra de negócio o utilizava. O estado de uma Parcela é sempre derivável em consulta, sem campo próprio: `lançamento_financeiro` (Seção 3) preenchido = gerou Lançamento; `vencimento` no futuro = ainda não venceu; `vencimento` no passado sem `lançamento_financeiro` = vencida, aguardando processamento (exceto Parcelas de Compra Fora da Operação, que nunca geram Lançamento por definição — ver Seção 3). Nenhum campo substitui `status`; a dimensão "tem ou não Fatura vinculada" continua representada exclusivamente pela ausência/presença de `fatura`, como já era.

---

## 3. Relacionamentos

| Relacionamento | Cardinalidade | Significado | Quem controla | Regras | Restrições |
|---|---|---|---|---|---|
| Compra Cartão → Parcela | 1:N (condicional) | Presente quando `origem` = Compra Cartão | Sistema | Só gera Lançamento se a Compra é classificada Terraplanagem | — |
| Contrato Financeiro → Parcela | 1:N (condicional) | Presente quando `origem` = Contrato Financeiro | Sistema | Ao vencer, sempre gera Lançamento (categoria "Amortização Empréstimo"/"Consórcios") | Quando o Contrato é Consórcio contemplado, o Lançamento gerado herda `veículo` do Contrato — só se a Parcela vence após a contemplação (D6, `decisions.md` decisão #28) |
| Parcela → Lançamento Financeiro | 1:1 (opcional, "quando vence") | Ao vencer, a Parcela gera um Lançamento correspondente, se aplicável | Sistema | Só existe quando a Parcela efetivamente gerou um Lançamento | Uma Parcela de Compra Fora da Operação nunca gera este relacionamento. É também o caminho usado pela propagação de correções de `COMPRA_CARTÃO.categoria`/`obra`/`veículo` (D5, `decisions.md` decisão #27) e pela herança de `veículo` de Consórcio contemplado (D6, `decisions.md` decisão #28) — a Parcela em si não duplica esses campos, só serve de ponte |
| Fatura → Parcela | 1:N (condicional, quando `origem` = Compra Cartão) | Uma Fatura agrupa diretamente as Parcelas do ciclo correspondente | Sistema — no momento do fechamento do ciclo (quando não há fonte externa autoritativa) ou no momento da importação (quando há) | **Regra de atribuição**: se a Parcela nasce de uma Compra cadastrada manualmente, com `vencimento` pertencente a um ciclo já encerrado, e não existe fonte externa autoritativa informando a Fatura correta, a Parcela é atribuída ao **próximo ciclo aberto no momento do processamento** (usando `LOG_AUDITORIA.data/hora` como referência de quando o registro foi processado — nenhum campo adicional é necessário em `COMPRA_CARTÃO`). Se existe uma fonte externa autoritativa (ex. importação da operadora/banco) informando a Fatura correta, essa informação sempre prevalece, mesmo que o ciclo já esteja fechado — a Parcela se vincula à Fatura real, não ao próximo ciclo aberto | O vínculo é permanente uma vez atribuído; uma Fatura já fechada continua aceitando novos vínculos de Parcelas descobertas por importação tardia, sem que isso altere seus totais já congelados (ver `19-fatura.md`) |

---

## 4. Regras da entidade

- **Campos mutuamente exclusivos**: a Parcela pertence a uma Compra de Cartão OU a um Contrato Financeiro, nunca os dois (determinado por `origem`).
- **Campos obrigatórios por contexto**: nenhum além da obrigatoriedade geral.
- **Regras de criação**: sempre pelo sistema, no momento em que a Compra de Cartão ou o Contrato Financeiro é registrado, calculando o parcelamento completo de uma vez.
- **Regras de alteração**: não definidas no conceitual.
- **Regras de exclusão**: não definidas.
- **Regras de auditoria**: a geração do Lançamento correspondente, ao vencer, deve ser registrada em `LOG_AUDITORIA` com origem "Cartão (via Parcela)" ou "Contrato Financeiro (via Parcela)".
- **Regras de integridade**: exatamente um entre `COMPRA_CARTÃO` e `CONTRATO_FINANCEIRO` deve estar associado, conforme `origem`.
- **Regras de negócio**:
  - Uma Parcela nunca é, ela mesma, um Lançamento (coluna "Não representa" do catálogo) — é a origem de até um Lançamento, no momento do vencimento.
  - Só Parcelas de Compra Terraplanagem geram Lançamento (Seção 7); Parcelas de Contrato Financeiro geram Lançamento sempre, ao vencer (Seção 10).
  - A regra do "próximo ciclo aberto" vale exclusivamente para cadastros manuais sem fonte externa autoritativa. Sempre que existir uma fonte oficial informando a Fatura correta (como importação da operadora ou banco), prevalece essa fonte, independentemente de o ciclo já estar fechado.
  - O estado da Parcela (vencida ou não, gerou Lançamento ou não) nunca é representado pela existência ou não de vínculo com `Fatura`, e vice-versa — dimensões sempre independentes (D11, `decisions.md` decisão #32).

---

## 5. Classificação dos campos

| Categoria | Campos |
|---|---|
| Derivados | "Estado" da Parcela (vencida/não vencida, gerou Lançamento ou não) — sempre calculado a partir de `vencimento`, `lançamento_financeiro` e, quando necessário, da `classificação` da Compra/Contrato de origem; nunca persistido (D11, `decisions.md` decisão #32) |
| Calculados | Nenhum campo aritmético — mas `valor` de cada Parcela é definido no momento do cálculo do parcelamento (não digitado individualmente pelo usuário) |
| Persistidos | `origem`, `número`, `total`, `valor`, `vencimento`, `fatura` (quando aplicável) |
| Imutáveis | `origem`, `número`, `total` (por inferência estrutural — a posição de uma parcela num parcelamento já calculado não deveria mudar); `fatura`, depois de atribuída (o vínculo é permanente) |
| Auditáveis | A geração do Lançamento associado |

---

## 6. Dependências com outras entidades

Depende, de forma condicional e mutuamente exclusiva, de `COMPRA_CARTÃO` ou `CONTRATO_FINANCEIRO`. Depende também, opcionalmente e apenas quando `origem` = Compra Cartão, de `FATURA` (atribuída no fechamento do ciclo ou na importação). É referenciada por `LANÇAMENTO_FINANCEIRO` (opcionalmente, quando vence).

---

## 7. Checklist de decisões pendentes

**Esta entidade depende de alguma decisão ainda pendente? Não — resolvida.**

O relacionamento com `Fatura` e a regra de atribuição de ciclo (Cenário manual vs. Cenário com fonte externa autoritativa) estão **resolvidos** (ver Seções 2-4).

- ~~Os valores válidos do campo `status` não estavam enumerados no conceitual~~ — **Resolvida (D11), com reformulação.** Auditoria documental (regras de negócio, decisões #1-#31) não encontrou nenhum uso funcional do campo — o gatilho real de geração do Lançamento sempre foi `vencimento`, nunca `status`; a dimensão "gerou Lançamento" já era 100% derivável de `lançamento_financeiro`, coluna já existente. A pergunta original foi substituída por "o atributo ainda pertence ao modelo?", respondida como não — `status` foi **removido** da entidade (`decisions.md`, decisão #32). Não afeta o campo `fatura`, que permanece exatamente como estava.
