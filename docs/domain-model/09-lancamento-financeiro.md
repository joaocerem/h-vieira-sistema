# LANÇAMENTO_FINANCEIRO

> **Atualizado — Sprint 3 (rodada de evolução operacional).** `APLICAÇÃO_DE_LIQUIDAÇÃO` e
> `AJUSTE_FINANCEIRO` foram removidos (ver `decisions.md`, decisão #51). `status_financeiro`
> passa a ser calculado a partir de `VÍNCULO_CONCILIAÇÃO` (binário: Conciliado/Não Conciliado);
> o cancelamento nunca é bloqueado por conciliação existente. Trechos abaixo que citavam as
> entidades removidas foram atualizados; o texto histórico específico delas continua em
> `domain-model/11-aplicacao-de-liquidacao.md`/`15-ajuste-financeiro.md`.

## 1. Visão geral

**Finalidade**: o fato econômico da terraplanagem, do nascimento (obrigação/direito) ao status final (liquidado) — conceitual, Seção 3. É a entidade central de todo o sistema (princípio 1: "todo fato financeiro da terraplanagem nasce em `LANÇAMENTO_FINANCEIRO`").

**Responsabilidade**: registrar, uma única vez, cada Despesa ou Receita da operação, para que Financeiro, Balanço, Obra, Frota e IA leiam esse mesmo dado — nenhum desses módulos mantém cópia própria (princípio 1).

**Quem cria**: Manual; Cartão (via `PARCELA`, quando a Compra é classificada Terraplanagem); Contrato Financeiro (via `PARCELA`, ao vencer — herdando `veículo` automaticamente quando é Consórcio contemplado e a Parcela vence após a contemplação, D6, `decisions.md` decisão #28); Ação de IA confirmada (nível Médio — "criar/alterar obrigação, revisão explícita", Seção 11 do conceitual).

**Quem altera**: mesmos criadores, dentro dos limites de cada campo (ver Seção 2). A partir da Sprint 3, edição e cancelamento **nunca são bloqueados** por conciliação já existente — decisão explícita do usuário: bloquear geraria mais retrabalho operacional do que benefício, já que é comum ajustar o valor lançado antecipadamente no momento da conciliação; em vez de bloquear, qualquer edição ou cancelamento de um Lançamento já conciliado dispara uma revalidação automática da compatibilidade (ver Seção 4). Cartão também altera automaticamente `categoria`/`obra`/`veículo` de um Lançamento já gerado, quando a `COMPRA_CARTÃO` de origem é corrigida — condicionado à **ausência** de `RATEIO_DESPESA` vinculado a este Lançamento; havendo Rateio, o Lançamento fica desacoplado e a correção passa a ser manual (D5, `decisions.md` decisão #27).

**Quem consulta**: Balanço (Realizado e Projetado), Obra, Frota, Conciliação (indiretamente, via `VÍNCULO_CONCILIAÇÃO`), IA (via ferramentas de consulta controladas), Auditoria.

**Quem nunca deve alterar**: Conciliação (nunca escreve em `LANÇAMENTO_FINANCEIRO` — regra explícita, Seção 13 do conceitual); Balanço, Obras e Frota (leitura estrita, nunca escrita); IA (nunca escreve diretamente — só propõe via `AÇÃO_PROPOSTA_IA`, que se torna um Lançamento real apenas após confirmação humana).

---

## 2. Campos

| Campo | Significado | Tipo conceitual | Obrigatório? | Valor padrão | Pode mudar depois de criado? | Quem pode alterar | Regra de validação | Observações |
|---|---|---|---|---|---|---|---|---|
| `tipo` | Se o Lançamento é uma Despesa ou uma Receita | Lista de valores (Despesa / Receita) | Sim | Nenhum | Não — inferência estrutural forte (mudar o tipo depois de criado não é mencionado no conceitual e contraria o sentido do fato registrado), não confirmado como regra explícita | — | Um dos dois valores | Determina qual dos dois campos `fornecedor`/`cliente` se aplica |
| `categoria` | Natureza do gasto/receita | Referência para outra entidade (Categoria) | Sim | Nenhum | Sim, inclusive por Sugestão de IA confirmada, ou automaticamente por correção da `COMPRA_CARTÃO` de origem (D5) | Usuário, IA (sugestão confirmada), ou Cartão (propagação automática, se não houver Rateio) | Deve referenciar uma Categoria existente | Dimensão independente de `classificação` (que não existe nesta entidade — ver observação abaixo) |
| `fornecedor` | Credor da Despesa | Referência para outra entidade (Fornecedor) | Condicional — presente quando `tipo` = Despesa | Nenhum | Sim | Usuário | Mutuamente exclusivo com `cliente` (ver Seção 4) | — |
| `cliente` | Cliente da Receita | Referência para outra entidade (Cliente) | Condicional — presente quando `tipo` = Receita | Nenhum | Sim | Usuário | Mutuamente exclusivo com `fornecedor` (ver Seção 4) | Este vínculo não está listado na linha "Relaciona-se com" de `CLIENTE` na Seção 3 do conceitual (que só lista Obra) — é uma referência real, presente na lista de campos do próprio Lançamento, tratada aqui como válida apesar da omissão cruzada |
| `empresa` | Empresa do grupo à qual o Lançamento pertence | Referência para outra entidade (Empresa) | Sim (Decisão D7) | Nenhum | Sim (correção de cadastro) | Usuário | Deve referenciar uma Empresa existente; quando `veículo` estiver preenchido, deve corresponder a `veículo.empresa` | Derivado automaticamente quando possível (via `veículo`, `contrato financeiro`, ou a cadeia Cartão→Conta Bancária→Empresa); informado manualmente quando não derivável — mecanismo definido em D7, `decisions.md` decisão #21 |
| `obra` | Obra à qual o Lançamento é atribuído diretamente | Referência para outra entidade (Obra) | Não | Nenhum (fica vazio) | Sim, sujeito à regra de exclusividade com Rateio; também alterado automaticamente por correção da `COMPRA_CARTÃO` de origem, só quando não há Rateio vinculado (D5) | Usuário, ou Cartão (propagação automática, se não houver Rateio) | Mutuamente exclusivo com o uso de `RATEIO_DESPESA` para o mesmo Lançamento (Seção 8 do conceitual) | Opcional simetricamente para Despesa e Receita (regra 21). A existência de Rateio é justamente o gatilho que desliga a propagação de D5 |
| `veículo` | Veículo ao qual o Lançamento é atribuído | Referência para outra entidade (Veículo) | Não | Nenhum (fica vazio); herdado automaticamente na criação quando a origem é Consórcio contemplado com Parcela vencendo após a contemplação (D6) | Sim, inclusive automaticamente por correção da `COMPRA_CARTÃO` de origem, se não houver Rateio vinculado (D5) | Usuário, ou Cartão (propagação automática, se não houver Rateio) | — | Pode coexistir com `obra` no mesmo Lançamento, sem duplicação (regra 18). Diferente de D5, a herança de D6 nunca é retroativa — só se aplica na criação do Lançamento |
| `valor` | Valor do fato econômico | Valor monetário | Sim | Nenhum | Sim, sempre — inclusive com o Lançamento já conciliado (Sprint 3: sem bloqueio; editar dispara revalidação da conciliação, ver Seção 4) | Usuário | Deve ser um valor monetário positivo | É um dos critérios de compatibilidade usados por `VÍNCULO_CONCILIAÇÃO` |
| `data_competência` | Data a que o fato econômico se refere | Data | Sim | Nenhum | Sim (correção de cadastro) | Usuário | Deve ser uma data válida | Distinta de `vencimento` |
| `vencimento` | Data limite para liquidação | Data | Sim | Nenhum | Sim | Usuário | Deve ser uma data válida | — |
| `situação_administrativa` | Situação administrativa do registro — decisão humana sobre o ciclo de vida do Lançamento | Lista de valores (hoje: Ativo / Cancelado) | Sim | Ativo (implícito) | Sim, sem restrição (Sprint 3: cancelamento nunca é bloqueado por conciliação já existente — ver Seção 4) | Usuário | — | Dimensão independente de `status_financeiro` — nunca fundidas, mesmo princípio já usado para `categoria`/`classificação` (ver Princípio de Modelagem nº 4, fonte única da verdade). Também é, desde a Sprint 3, um dos critérios de compatibilidade de `VÍNCULO_CONCILIAÇÃO` — um Lançamento Cancelado nunca é compatível com uma Movimentação |
| `status_financeiro` | Estado de conciliação do Lançamento (Sprint 3: binário — Conciliado / Não Conciliado, sem estado intermediário) | Valor calculado | Sim | Não Conciliado | Não é "alterado" — é sempre recalculado a partir da existência de um `VÍNCULO_CONCILIAÇÃO` `Confirmado` referenciando este Lançamento, sem exceção nenhuma | Sistema (cálculo automático) | Nunca armazenado, nunca digitado — sempre derivado (Seção 2 do conceitual, princípio 6) | Nunca reflete `situação_administrativa` — as duas dimensões são independentes e nunca fundidas. "Contas a Pagar"/"Contas a Receber" são só um filtro de `tipo`/`status_financeiro` sobre esta mesma listagem, sem entidade nem endpoint próprios |
| `origem` | De onde o Lançamento nasceu | Lista de valores (Manual / Cartão via Parcela / Contrato Financeiro via Parcela / Ação de IA Confirmada) | Sim | Nenhum | Não — inferência forte: é um fato histórico sobre a criação do registro, não deveria mudar depois | — | Um dos quatro valores | — |
| `descrição` | Texto livre descrevendo o Lançamento (decisão de negócio, rodada de evolução operacional 2026-08) | Texto | Não | Nenhum (fica vazio) | Sim (correção de cadastro) | Usuário | Nenhuma | Sem regra de negócio associada além da própria existência |
| `documento` | Número do documento fiscal ou comprovante associado (decisão de negócio, rodada de evolução operacional 2026-08) | Texto | Não | Nenhum (fica vazio) | Sim (correção de cadastro) | Usuário | Nenhuma | Sem regra de negócio associada além da própria existência |

**Nota sobre a separação em duas dimensões** (decisão consolidada, resolvendo a antiga pendência de estratégia de cálculo do `status` e a pendência 14 do conceitual): o que o catálogo original do conceitual descrevia como um único campo `status` foi separado em duas dimensões independentes, seguindo o mesmo princípio já usado para `categoria`/`classificação` — `situação_administrativa` (decisão humana, persistida) e `status_financeiro` (sempre calculado, nunca armazenado, sem exceção). A partir da Sprint 3 (rodada de evolução operacional), `status_financeiro` é calculado a partir de `VÍNCULO_CONCILIAÇÃO` (não mais de `APLICAÇÃO_DE_LIQUIDAÇÃO`, removida) e o cancelamento nunca é bloqueado por conciliação já existente — `AJUSTE_FINANCEIRO` também foi removido; uma divergência entre um Lançamento editado/cancelado e a Movimentação a que ele estava conciliado é detectada automaticamente (revalidação da compatibilidade), marcando o Vínculo como `Divergente` quando deixa de ser compatível, sem nenhum registro formal equivalente ao antigo Ajuste.

**Explicitamente fora desta entidade**: `classificação` (Terraplanagem / Fora da Operação / Transferência Interna / Retirada do Patrão / Não Classificada) não é campo de `LANÇAMENTO_FINANCEIRO` — essa dimensão vive em `MOVIMENTAÇÃO_BANCÁRIA` e `COMPRA_CARTÃO` (Seção 6 do conceitual). Um Lançamento só existe, por definição, para fatos já considerados da operação.

---

## 3. Relacionamentos

| Relacionamento | Cardinalidade | Significado | Quem controla | Regras | Restrições |
|---|---|---|---|---|---|
| Empresa → Lançamento | N:1 | Todo Lançamento pertence a exatamente uma Empresa do grupo (Decisão D7) | Usuário (ou derivação automática, quando possível) | Deve corresponder à Empresa do Veículo, quando `veículo` estiver preenchido | Nenhum Lançamento existe sem Empresa, desde a criação |
| Categoria → Lançamento | N:1 | Todo Lançamento tem exatamente uma Categoria | Usuário ou IA (sugestão confirmada) | — | — |
| Fornecedor → Lançamento | N:1 (condicional) | Presente quando `tipo` = Despesa | Usuário | Mutuamente exclusivo com Cliente | — |
| Cliente → Lançamento | N:1 (condicional) | Presente quando `tipo` = Receita | Usuário | Mutuamente exclusivo com Fornecedor | — |
| Obra → Lançamento | N:1 (opcional) | Atribuição direta de custo/receita a uma Obra | Usuário | Mutuamente exclusivo com Rateio Despesa para o mesmo Lançamento | — |
| Veículo → Lançamento | N:1 (opcional) | Atribuição de custo a um Veículo | Usuário | Pode coexistir com Obra | — |
| Lançamento → Rateio Despesa | 1:N (opcional) | Um Lançamento sem Obra direta pode ser dividido entre várias Obras | Usuário, manualmente | Só existe quando `obra` está vazio no Lançamento | Soma dos valores rateados deve ser compatível com `valor` (tolerância — pendência 7) |
| Lançamento ↔ Vínculo Conciliação | N:N (Sprint 3) | Um Lançamento pode estar ligado a um Vínculo; um Vínculo pode cobrir vários Lançamentos de uma vez (ex. pagamento de fatura de cartão cobrindo várias Parcelas) | Sistema, usuário | Um Lançamento só pode estar ligado a um único Vínculo por vez, em qualquer estado | Substitui, a partir da Sprint 3, o relacionamento com `LIQUIDAÇÃO_FINANCEIRA` via `APLICAÇÃO_DE_LIQUIDAÇÃO` (ambas removidas) — ver `domain-model/14-vinculo-conciliacao.md` |
| Parcela → Lançamento | 1:1 (opcional) | Uma Parcela de Cartão ou Contrato Financeiro gera um Lançamento ao vencer, somente se a origem qualifica (Compra Terraplanagem, ou Parcela de Contrato) | Sistema | Só existe quando `origem` = Cartão ou Contrato Financeiro | — |

---

## 4. Regras da entidade

- **Campos mutuamente exclusivos**:
  - `fornecedor` e `cliente` — nunca os dois preenchidos no mesmo Lançamento (inferência estrutural direta do campo único "fornecedor_id ou cliente_id" do catálogo do conceitual, correlacionado com `tipo`).
  - `obra` (atribuição direta) e a existência de registros em `RATEIO_DESPESA` para este Lançamento — nunca as duas formas ao mesmo tempo, para não contar valor em dobro (Seção 8 do conceitual).
- **Campos obrigatórios por contexto**: `fornecedor` obrigatório se `tipo` = Despesa; `cliente` obrigatório se `tipo` = Receita.
- **Regras de criação**: pode nascer manualmente, ou automaticamente a partir de uma Parcela (Cartão ou Contrato Financeiro) ao vencer, ou a partir de uma Ação de IA confirmada (nível Médio).
- **Regras de alteração** (Sprint 3): `valor` é sempre livremente corrigível, mesmo com o Lançamento já conciliado — sem bloqueio. `status_financeiro` nunca é digitado — é sempre recalculado, sem exceção. `situação_administrativa` transiciona para "Cancelado" sem restrição — o cancelamento nunca é bloqueado por conciliação já existente. Editar ou cancelar um Lançamento que tenha um Vínculo Conciliação `Confirmado` dispara automaticamente a revalidação da compatibilidade (mesmos critérios da sugestão/confirmação — Empresa, natureza, valor, vencimento, `situação_administrativa` = Ativo); deixando de ser compatível, o Vínculo vira `Divergente` sozinho — a regra depende exclusivamente do resultado da comparação, nunca de qual ação foi realizada.
- **Regras de exclusão**: não há regra de exclusão física no conceitual. O princípio "nada desaparece" (princípio 5) e a existência do estado Cancelado como alternativa confirmam que Lançamentos não são apagados, apenas cancelados.
- **Regras de auditoria**: toda alteração de campo deve ser registrada em `LOG_AUDITORIA`, incluindo a origem (Manual / Importação / Sugestão de IA Confirmada / Ação de IA Confirmada) — regra 31.
- **Regras de integridade**: `categoria`, `fornecedor`/`cliente`, `obra` e `veículo`, quando preenchidos, devem referenciar registros existentes.
- **Regras de negócio**:
  - Uma Despesa pode ser atribuída diretamente a uma Obra, ou rateada entre várias, sem alterar o valor original (regra 14).
  - Nem toda Despesa precisa pertencer a uma Obra (regra 16); Receita também pode existir sem Obra (regra 21).
  - Uma Despesa pode ter Obra e Veículo simultaneamente (regra 18).
  - Consultas de gasto por fornecedor consideram apenas Lançamentos que existem por terem sido classificados Terraplanagem na origem (regra 22) — o Lançamento em si já é, por definição, algo que passou por essa classificação (a classificação em si não é campo do Lançamento, é herdada da Movimentação/Compra que o originou).
  - **Sprint 3**: não existe mais mecanismo formal de estorno/reembolso/crédito (`AJUSTE_FINANCEIRO` removido) — qualquer correção é feita editando o próprio Lançamento; a divergência resultante com uma conciliação já confirmada é sempre detectada automaticamente (ver regras de alteração, acima).

---

## 5. Classificação dos campos

| Categoria | Campos |
|---|---|
| Derivados | Nenhum |
| Calculados | `status_financeiro` — sempre, sem exceção |
| Persistidos | `tipo`, `categoria`, `fornecedor`/`cliente`, `obra`, `veículo`, `empresa`, `valor`, `data_competência`, `vencimento`, `origem`, `situação_administrativa`, `descrição`, `documento` |
| Imutáveis | `tipo`, `origem` (por inferência estrutural, não regra explícita) |
| Auditáveis | Todos os campos |

**Importante**: "custo de obra", "custo de veículo", "lucro por obra", "saldo a receber" **não são campos desta entidade** — são resultados de consulta agregada sobre `LANÇAMENTO_FINANCEIRO` (e entidades relacionadas), calculados sempre em tempo de consulta (princípio 8), nunca armazenados em lugar nenhum.

---

## 6. Dependências com outras entidades

Depende de `CATEGORIA` e `EMPRESA` (ambos obrigatórios, desde D7) e, condicionalmente, de `FORNECEDOR` ou `CLIENTE`. Depende opcionalmente de `OBRA` e `VEÍCULO`. É referenciado por `RATEIO_DESPESA`, `VÍNCULO_CONCILIAÇÃO` (Sprint 3) e, opcionalmente, `PARCELA`.

---

## 7. Checklist de decisões pendentes

**Esta entidade depende de alguma decisão ainda pendente? Não — as quatro pendências que a afetavam diretamente já foram resolvidas.**

1. ~~Estratégia de cálculo do `status`~~ — **Resolvida.** O campo foi separado em `situação_administrativa` (persistida) e `status_financeiro` (sempre calculado, nunca armazenado, sem exceção; a partir da Sprint 3, binário Conciliado/Não Conciliado, calculado de `VÍNCULO_CONCILIAÇÃO`). Ver Seção 2.
2. ~~Cancelamento com Aplicação de Liquidação já existente (pendência 14 do conceitual)~~ — **Resolvida, e depois revista na Sprint 3.** A regra original (cancelamento só com soma de Aplicações zero, correção via `AJUSTE_FINANCEIRO`) foi superada — `APLICAÇÃO_DE_LIQUIDAÇÃO` e `AJUSTE_FINANCEIRO` não existem mais. Cancelamento nunca é bloqueado por conciliação; a divergência resultante é detectada automaticamente. Ver Seção 4 e `decisions.md`, decisão #51.
3. ~~Tolerância de soma do Rateio (pendência 7 do conceitual)~~ — **Resolvida.** A soma de `RATEIO_DESPESA.valor_rateado` deve corresponder exatamente ao `valor` do Lançamento, com tolerância restrita ao arredondamento inevitável da menor unidade monetária — nunca uma tolerância de negócio maior. Ver `16-rateio-despesa.md`.
4. ~~Nova lacuna identificada nesta modelagem, não catalogada nas 14 pendências: ausência de vínculo direto com Empresa~~ — **Resolvida (D7).** Definido como decisão de negócio que `LANÇAMENTO_FINANCEIRO` precisa de vínculo direto e obrigatório com `EMPRESA`, desde a criação, sem exceção — ver campo `empresa`, Seção 2, e `decisions.md`, decisão #21. O texto original desta lacuna permanece preservado para referência: *"`LANÇAMENTO_FINANCEIRO` não tem nenhum campo direto que o vincule a uma Empresa... o vínculo com Empresa hoje só existe de forma indireta e nem sempre presente: via `veículo.empresa`... ou, transitivamente, só no momento em que uma Liquidação... for registrada."*
