# FATURA

## 1. Visão geral

**Finalidade**: agrupador de cobrança de um ciclo do cartão (conceitual, Seção 3).

**Responsabilidade**: representar o total cobrado de um ciclo de Cartão de Crédito, sem ser, ela mesma, uma despesa financeira única — cada Compra individual preserva seus próprios dados (Seção 7 do conceitual).

**Quem cria**: o sistema calcula o total (`valor_total_calculado`); o usuário confirma o valor efetivamente cobrado (`valor_cobrado`).

**Quem altera**: usuário, para confirmar `valor_cobrado` no momento do fechamento. A partir do fechamento, `valor_total_calculado` e `valor_cobrado` ficam congelados como retrato histórico daquele momento — nunca recalculados depois, mesmo que novas Parcelas venham a se vincular ao ciclo posteriormente (ver Seção 4). Novas Parcelas descobertas por importação tardia podem, ainda assim, se vincular à Fatura já fechada, refletindo a composição real do ciclo — sem alterar os totais já congelados.

**Quem consulta**: `COMPRA_CARTÃO` (via `PARCELA`, para compor o total), `LIQUIDAÇÃO_FINANCEIRA` (quando a Fatura é paga).

**Quem nunca deve alterar**: Financeiro não cria a Fatura em si (é responsabilidade do módulo Cartões); Conciliação, Obras, Frota, Balanço, IA não escrevem nesta entidade.

---

## 2. Campos

| Campo | Significado | Tipo conceitual | Obrigatório? | Valor padrão | Pode mudar depois de criado? | Quem pode alterar | Regra de validação | Observações |
|---|---|---|---|---|---|---|---|---|
| `cartão` | Cartão ao qual esta Fatura pertence | Referência para outra entidade (Cartão de Crédito) | Sim | Nenhum | Não | — | Deve referenciar um Cartão existente | — |
| `ciclo` | Período de cobrança a que a Fatura se refere | Texto (referência a um período, ex. mês/ano) | Sim | Nenhum | Não | — | — | O conceitual não detalha o formato exato do ciclo — inferência de que se trata de um período mensal, dado o contexto de fechamento/vencimento de `CARTÃO_CRÉDITO`, não confirmado literalmente |
| `valor_total_calculado` | Soma de todas as Parcelas do ciclo, calculada pelo sistema | Valor calculado uma vez, depois congelado | Sim | Nenhum | Recalculado automaticamente enquanto o ciclo não fecha; **a partir do fechamento, congelado** — representa oficialmente um retrato histórico daquele momento, nunca mais recalculado, mesmo diante de novas Parcelas vinculadas depois (ver Seção 4) | Sistema | No momento do fechamento, deve ser igual à soma dos valores das Parcelas do ciclo então conhecidas | Distinto de `valor_cobrado`. Uma diferença entre este valor congelado e a soma atual das Parcelas hoje vinculadas à Fatura não representa uma inconsistência do sistema — é o efeito esperado quando informações históricas são descobertas por importação, depois do fechamento (ver Seção 4) |
| `valor_cobrado` | Valor que efetivamente veio cobrado (ex. no extrato/boleto da fatura) | Valor monetário | Sim | Nenhum | Sim, até confirmação; **a partir da confirmação, também congelado** como retrato histórico — mesma regra de `valor_total_calculado` | Usuário | Confirmado pelo usuário | Serve de base para o `valor` da `LIQUIDAÇÃO_FINANCEIRA` gerada ao pagar a Fatura |

---

## 3. Relacionamentos

| Relacionamento | Cardinalidade | Significado | Quem controla | Regras | Restrições |
|---|---|---|---|---|---|
| Cartão de Crédito → Fatura | 1:N | Um Cartão gera uma Fatura por ciclo | Sistema | — | — |
| Fatura → Parcela | 1:N | Uma Fatura agrupa diretamente as Parcelas do ciclo (não as Compras inteiras — uma Compra parcelada contribui com uma Parcela para cada Fatura em que uma parcela sua vence) | Sistema, no momento do fechamento do ciclo, ou no momento de uma importação que traga a Fatura já informada por fonte externa autoritativa | Só Parcelas de Compras Terraplanagem geram Lançamento; o vínculo Parcela↔Fatura é permanente uma vez atribuído | Uma Fatura já fechada continua aceitando novas Parcelas vinculadas, descobertas posteriormente por importação, sem que isso altere `valor_total_calculado`/`valor_cobrado`, já congelados (ver Seção 4) |
| Fatura → Liquidação Financeira | 1:1 | Quando a Fatura é paga, uma Liquidação nasce pelo valor total cobrado | Usuário (ou Ação de IA confirmada, nível Alto) | A Liquidação aplica, via `APLICAÇÃO_DE_LIQUIDAÇÃO`, apenas aos Lançamentos nascidos de compras Terraplanagem do ciclo — a diferença entre `valor_cobrado` e a soma das Aplicações corresponde às compras não-operacionais (Seção 7 do conceitual) | Este relacionamento está descrito na Seção 4 do conceitual, mas a linha "Relaciona-se com" da própria `LIQUIDAÇÃO_FINANCEIRA` (Seção 3) não cita Fatura de volta — assimetria do texto-fonte, já registrada no documento de `LIQUIDAÇÃO_FINANCEIRA`. A `arbitragem-tecnica-final.md` (Divergência 6) já esclarece, no nível de aplicação, que essa Liquidação é criada seguindo o mesmo caso de uso do módulo Financeiro — irrelevante para o modelo de domínio em si, que só enxerga o relacionamento Fatura↔Liquidação |

---

## 4. Regras da entidade

- **Campos mutuamente exclusivos**: nenhum identificado.
- **Campos obrigatórios por contexto**: nenhum além da obrigatoriedade geral.
- **Regras de criação**: o sistema calcula `valor_total_calculado` automaticamente a partir das Compras do ciclo; a Fatura em si nasce quando o ciclo fecha (`dia_fechamento` do Cartão).
- **Regras de alteração**: `valor_cobrado` é confirmado/ajustado pelo usuário.
- **Regras de exclusão**: não definidas.
- **Regras de auditoria**: toda confirmação/alteração de `valor_cobrado` deve ser registrada em `LOG_AUDITORIA`.
- **Regras de integridade**: `cartão` deve referenciar um Cartão existente.
- **Regras de negócio**:
  - A Fatura não é uma despesa financeira única — é um agrupador de cobrança (Seção 7 do conceitual).
  - A diferença entre `valor_cobrado` e a soma das Aplicações de Liquidação vinculadas à sua Liquidação corresponde exatamente às compras não-operacionais daquele ciclo — é uma diferença explicável, não uma divergência de conciliação (Seção 7 do conceitual, exemplo composto da Seção 14).
  - **Uma Fatura fechada representa um fato histórico.** Novas informações descobertas posteriormente podem enriquecer a composição histórica da Fatura — por exemplo, vinculando uma Parcela que realmente pertencia àquele ciclo, descoberta por importação tardia — mas nunca reescrevem os fatos históricos já registrados naquele fechamento.
  - Uma diferença entre o total histórico congelado (`valor_total_calculado`/`valor_cobrado`) e a soma atual das Parcelas hoje vinculadas à Fatura **não representa uma inconsistência do sistema** — é um efeito esperado quando informações históricas são descobertas posteriormente por importação.
  - Não existe nenhuma entidade nem mecanismo dedicado de reconciliação para tratar essa diferença — o vínculo direto entre Parcela e Fatura, já existente, é suficiente.

---

## 5. Classificação dos campos

| Categoria | Campos |
|---|---|
| Derivados | Nenhum |
| Calculados | `valor_total_calculado` — calculado uma única vez, no momento do fechamento; a partir daí é um fato histórico congelado, nunca recalculado |
| Persistidos | `cartão`, `ciclo`, `valor_total_calculado` (persistido como retrato histórico congelado a partir do fechamento — exceção deliberada e explicitamente justificada ao princípio de cálculo em consulta, protegendo um fato histórico já fechado; ver `principios-de-modelagem.md`, princípio 7), `valor_cobrado` |
| Imutáveis | `cartão`, `ciclo` |
| Auditáveis | `valor_cobrado` (o único campo sujeito a confirmação/correção humana) |

---

## 6. Dependências com outras entidades

Depende de `CARTÃO_CRÉDITO` (obrigatório). Depende, indiretamente, de todas as `COMPRA_CARTÃO`/`PARCELA` do ciclo (para compor `valor_total_calculado`). É referenciada por `LIQUIDAÇÃO_FINANCEIRA` quando paga.

---

## 7. Checklist de decisões pendentes

**Esta entidade depende de alguma decisão ainda pendente? Sim, uma — de natureza organizacional/aplicação, não de domínio puro.**

- **Qual decisão**: qual módulo (Financeiro ou Cartão) efetivamente cria a `LIQUIDAÇÃO_FINANCEIRA` ao fechar uma Fatura — tratada em profundidade nas três etapas de arquitetura (`auditoria-critica-arquitetura-tecnica.md`, `replica-tecnica-auditoria-critica.md`, `arbitragem-tecnica-final.md`, Divergência 6).
- **Por que**: embora resolvida no nível de arquitetura (o caso de uso `financeiro/registrar-liquidacao.*` é reaproveitado, acionado a partir do fechamento da Fatura), essa decisão não altera nenhum campo desta entidade — é citada aqui apenas para rastreabilidade completa, já que toca diretamente o relacionamento Fatura↔Liquidação.
- **O que muda na entidade**: nada na estrutura de campos ou relacionamentos deste documento — a decisão já resolvida na arbitragem é de responsabilidade de módulo/aplicação, não de modelo de dados conceitual.
