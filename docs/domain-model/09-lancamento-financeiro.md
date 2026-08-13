# LANÇAMENTO_FINANCEIRO

## 1. Visão geral

**Finalidade**: o fato econômico da terraplanagem, do nascimento (obrigação/direito) ao status final (liquidado) — conceitual, Seção 3. É a entidade central de todo o sistema (princípio 1: "todo fato financeiro da terraplanagem nasce em `LANÇAMENTO_FINANCEIRO`").

**Responsabilidade**: registrar, uma única vez, cada Despesa ou Receita da operação, para que Financeiro, Balanço, Obra, Frota e IA leiam esse mesmo dado — nenhum desses módulos mantém cópia própria (princípio 1).

**Quem cria**: Manual; Cartão (via `PARCELA`, quando a Compra é classificada Terraplanagem); Contrato Financeiro (via `PARCELA`, ao vencer); Ação de IA confirmada (nível Médio — "criar/alterar obrigação, revisão explícita", Seção 11 do conceitual).

**Quem altera**: mesmos criadores, dentro dos limites de cada campo (ver Seção 2) — mas **nunca** para reverter um Lançamento já coberto por `AJUSTE_FINANCEIRO`, que segue fluxo próprio sem tocar o original (regra 23).

**Quem consulta**: Balanço (Realizado e Projetado), Obra, Frota, Conciliação (indiretamente, via `LIQUIDAÇÃO_FINANCEIRA`), IA (via ferramentas de consulta controladas), Auditoria.

**Quem nunca deve alterar**: Conciliação (nunca escreve em `LANÇAMENTO_FINANCEIRO` — regra explícita, Seção 13 do conceitual); Balanço, Obras e Frota (leitura estrita, nunca escrita); IA (nunca escreve diretamente — só propõe via `AÇÃO_PROPOSTA_IA`, que se torna um Lançamento real apenas após confirmação humana).

---

## 2. Campos

| Campo | Significado | Tipo conceitual | Obrigatório? | Valor padrão | Pode mudar depois de criado? | Quem pode alterar | Regra de validação | Observações |
|---|---|---|---|---|---|---|---|---|
| `tipo` | Se o Lançamento é uma Despesa ou uma Receita | Lista de valores (Despesa / Receita) | Sim | Nenhum | Não — inferência estrutural forte (mudar o tipo depois de criado não é mencionado no conceitual e contraria o sentido do fato registrado), não confirmado como regra explícita | — | Um dos dois valores | Determina qual dos dois campos `fornecedor`/`cliente` se aplica |
| `categoria` | Natureza do gasto/receita | Referência para outra entidade (Categoria) | Sim | Nenhum | Sim, inclusive por Sugestão de IA confirmada | Usuário, ou IA (sugestão confirmada) | Deve referenciar uma Categoria existente | Dimensão independente de `classificação` (que não existe nesta entidade — ver observação abaixo) |
| `fornecedor` | Credor da Despesa | Referência para outra entidade (Fornecedor) | Condicional — presente quando `tipo` = Despesa | Nenhum | Sim | Usuário | Mutuamente exclusivo com `cliente` (ver Seção 4) | — |
| `cliente` | Cliente da Receita | Referência para outra entidade (Cliente) | Condicional — presente quando `tipo` = Receita | Nenhum | Sim | Usuário | Mutuamente exclusivo com `fornecedor` (ver Seção 4) | Este vínculo não está listado na linha "Relaciona-se com" de `CLIENTE` na Seção 3 do conceitual (que só lista Obra) — é uma referência real, presente na lista de campos do próprio Lançamento, tratada aqui como válida apesar da omissão cruzada |
| `obra` | Obra à qual o Lançamento é atribuído diretamente | Referência para outra entidade (Obra) | Não | Nenhum (fica vazio) | Sim, sujeito à regra de exclusividade com Rateio | Usuário | Mutuamente exclusivo com o uso de `RATEIO_DESPESA` para o mesmo Lançamento (Seção 8 do conceitual) | Opcional simetricamente para Despesa e Receita (regra 21) |
| `veículo` | Veículo ao qual o Lançamento é atribuído | Referência para outra entidade (Veículo) | Não | Nenhum (fica vazio) | Sim | Usuário | — | Pode coexistir com `obra` no mesmo Lançamento, sem duplicação (regra 18) |
| `valor` | Valor do fato econômico | Valor monetário | Sim | Nenhum | Sim, enquanto não houver `APLICAÇÃO_DE_LIQUIDAÇÃO` vinculada; a partir daí, qualquer correção deve ocorrer via `AJUSTE_FINANCEIRO`, nunca alterando este campo diretamente (regra 23) | Usuário (antes de qualquer aplicação) | Deve ser um valor monetário positivo | É o valor de referência para o cálculo de `status` (Seção 2 do conceitual) |
| `data_competência` | Data a que o fato econômico se refere | Data | Sim | Nenhum | Sim (correção de cadastro) | Usuário | Deve ser uma data válida | Distinta de `vencimento` |
| `vencimento` | Data limite para liquidação | Data | Sim | Nenhum | Sim | Usuário | Deve ser uma data válida | — |
| `situação_administrativa` | Situação administrativa do registro — decisão humana sobre o ciclo de vida do Lançamento | Lista de valores (hoje: Ativo / Cancelado) | Sim | Ativo (implícito) | Sim, sujeito à regra de transição (ver Seção 4) | Usuário | Só pode transicionar para "Cancelado" quando a soma de `APLICAÇÃO_DE_LIQUIDAÇÃO.valor_aplicado` vinculada a este Lançamento for exatamente zero | Dimensão independente de `status_financeiro` — nunca fundidas, mesmo princípio já usado para `categoria`/`classificação` (ver Princípio de Modelagem nº 4, fonte única da verdade) |
| `status_financeiro` | Estado de liquidação do Lançamento (Aberto / Parcialmente Pago-Recebido / Pago-Recebido) | Valor calculado | Sim | Aberto (quando não há nenhuma Aplicação) | Não é "alterado" — é sempre recalculado a partir da soma de `APLICAÇÃO_DE_LIQUIDAÇÃO.valor_aplicado`, sem exceção nenhuma | Sistema (cálculo automático) | Nunca armazenado, nunca digitado — sempre derivado (Seção 2 do conceitual) | Nunca reflete `situação_administrativa` — as duas dimensões são independentes e nunca fundidas |
| `origem` | De onde o Lançamento nasceu | Lista de valores (Manual / Cartão via Parcela / Contrato Financeiro via Parcela / Ação de IA Confirmada) | Sim | Nenhum | Não — inferência forte: é um fato histórico sobre a criação do registro, não deveria mudar depois | — | Um dos quatro valores | — |

**Nota sobre a separação em duas dimensões** (decisão consolidada, resolvendo a antiga pendência de estratégia de cálculo do `status` e a pendência 14 do conceitual): o que o catálogo original do conceitual descrevia como um único campo `status` foi separado em duas dimensões independentes, seguindo o mesmo princípio já usado para `categoria`/`classificação` — `situação_administrativa` (decisão humana, persistida) e `status_financeiro` (sempre calculado a partir de `APLICAÇÃO_DE_LIQUIDAÇÃO`, nunca armazenado, sem exceção). Cancelamento e Ajuste Financeiro nunca produzem o mesmo resultado por caminhos diferentes: `situação_administrativa` = Cancelado significa que o Lançamento foi invalidado **antes** de produzir qualquer efeito financeiro (soma de Aplicações = 0); qualquer necessidade de desfazer, reduzir, corrigir ou neutralizar os efeitos financeiros de um Lançamento que já possua Aplicações deve obrigatoriamente utilizar `AJUSTE_FINANCEIRO`, que preserva o Lançamento original como fato histórico, nunca alterado.

**Explicitamente fora desta entidade**: `classificação` (Terraplanagem / Fora da Operação / Transferência Interna / Retirada do Patrão / Não Classificada) não é campo de `LANÇAMENTO_FINANCEIRO` — essa dimensão vive em `MOVIMENTAÇÃO_BANCÁRIA` e `COMPRA_CARTÃO` (Seção 6 do conceitual). Um Lançamento só existe, por definição, para fatos já considerados da operação.

---

## 3. Relacionamentos

| Relacionamento | Cardinalidade | Significado | Quem controla | Regras | Restrições |
|---|---|---|---|---|---|
| Categoria → Lançamento | N:1 | Todo Lançamento tem exatamente uma Categoria | Usuário ou IA (sugestão confirmada) | — | — |
| Fornecedor → Lançamento | N:1 (condicional) | Presente quando `tipo` = Despesa | Usuário | Mutuamente exclusivo com Cliente | — |
| Cliente → Lançamento | N:1 (condicional) | Presente quando `tipo` = Receita | Usuário | Mutuamente exclusivo com Fornecedor | — |
| Obra → Lançamento | N:1 (opcional) | Atribuição direta de custo/receita a uma Obra | Usuário | Mutuamente exclusivo com Rateio Despesa para o mesmo Lançamento | — |
| Veículo → Lançamento | N:1 (opcional) | Atribuição de custo a um Veículo | Usuário | Pode coexistir com Obra | — |
| Lançamento → Rateio Despesa | 1:N (opcional) | Um Lançamento sem Obra direta pode ser dividido entre várias Obras | Usuário, manualmente | Só existe quando `obra` está vazio no Lançamento | Soma dos valores rateados deve ser compatível com `valor` (tolerância — pendência 7) |
| Lançamento ↔ Liquidação | N:N, via `APLICAÇÃO_DE_LIQUIDAÇÃO` | Um Lançamento pode ser coberto por várias Liquidações (pagamento parcial); uma Liquidação pode cobrir vários Lançamentos (ex. fatura mista) | Sistema, no momento do registro da Liquidação | Soma das Aplicações determina o `status` | — |
| Lançamento (original) → Ajuste Financeiro | 1:N | Um Lançamento original pode ter vários Ajustes vinculados ao longo do tempo | Usuário | O Lançamento original nunca é alterado | — |
| Ajuste Financeiro → Lançamento (de ajuste) | 1:1 | Cada Ajuste Financeiro gera exatamente um novo Lançamento | Usuário | O Lançamento de ajuste segue o fluxo normal (pode ter Liquidação própria, inclusive em outra Conta) | — |
| Parcela → Lançamento | 1:1 (opcional) | Uma Parcela de Cartão ou Contrato Financeiro gera um Lançamento ao vencer, somente se a origem qualifica (Compra Terraplanagem, ou Parcela de Contrato) | Sistema | Só existe quando `origem` = Cartão ou Contrato Financeiro | — |

---

## 4. Regras da entidade

- **Campos mutuamente exclusivos**:
  - `fornecedor` e `cliente` — nunca os dois preenchidos no mesmo Lançamento (inferência estrutural direta do campo único "fornecedor_id ou cliente_id" do catálogo do conceitual, correlacionado com `tipo`).
  - `obra` (atribuição direta) e a existência de registros em `RATEIO_DESPESA` para este Lançamento — nunca as duas formas ao mesmo tempo, para não contar valor em dobro (Seção 8 do conceitual).
- **Campos obrigatórios por contexto**: `fornecedor` obrigatório se `tipo` = Despesa; `cliente` obrigatório se `tipo` = Receita.
- **Regras de criação**: pode nascer manualmente, ou automaticamente a partir de uma Parcela (Cartão ou Contrato Financeiro) ao vencer, ou a partir de uma Ação de IA confirmada (nível Médio).
- **Regras de alteração**: `valor` só é livremente corrigível antes de qualquer Aplicação de Liquidação; depois disso, correções passam a exigir `AJUSTE_FINANCEIRO` (regra 23). `status_financeiro` nunca é digitado — é sempre recalculado, sem exceção. `situação_administrativa` só transiciona para "Cancelado" quando a soma de `APLICAÇÃO_DE_LIQUIDAÇÃO.valor_aplicado` vinculada for exatamente zero — a partir do momento em que existir qualquer valor aplicado, ainda que parcial, o cancelamento deixa de ser permitido.
- **Regras de exclusão**: não há regra de exclusão física no conceitual. O princípio "nada desaparece" (princípio 5) e a existência do estado Cancelado como alternativa confirmam que Lançamentos não são apagados, apenas cancelados — e cancelamento, por sua vez, só é possível enquanto o Lançamento não tiver nenhuma Aplicação de Liquidação vinculada (ver regra de transição de `situação_administrativa`, acima).
- **Regras de auditoria**: toda alteração de campo deve ser registrada em `LOG_AUDITORIA`, incluindo a origem (Manual / Importação / Sugestão de IA Confirmada / Ação de IA Confirmada) — regra 31.
- **Regras de integridade**: `categoria`, `fornecedor`/`cliente`, `obra` e `veículo`, quando preenchidos, devem referenciar registros existentes. A soma de `APLICAÇÃO_DE_LIQUIDAÇÃO.valor_aplicado` para este Lançamento não deveria ultrapassar `valor` — inferência necessária para a tabela de status (Seção 2 do conceitual) fazer sentido, ainda que não esteja escrita como regra de validação explícita em nenhum lugar do texto.
- **Regras de negócio**:
  - Uma Despesa pode ser atribuída diretamente a uma Obra, ou rateada entre várias, sem alterar o valor original (regra 14).
  - Nem toda Despesa precisa pertencer a uma Obra (regra 16); Receita também pode existir sem Obra (regra 21).
  - Uma Despesa pode ter Obra e Veículo simultaneamente (regra 18).
  - Consultas de gasto por fornecedor consideram apenas Lançamentos que existem por terem sido classificados Terraplanagem na origem (regra 22) — o Lançamento em si já é, por definição, algo que passou por essa classificação (a classificação em si não é campo do Lançamento, é herdada da Movimentação/Compra que o originou).
  - Estornos, reembolsos e créditos são formalizados via `AJUSTE_FINANCEIRO` — o Lançamento original nunca é tocado (regra 23).
  - Cancelamento e Ajuste Financeiro representam conceitos diferentes, que nunca produzem o mesmo resultado por caminhos diferentes: Cancelamento significa que o Lançamento foi invalidado antes de produzir qualquer efeito financeiro; Ajuste Financeiro significa que o Lançamento continua existindo como fato histórico, mas sofreu posteriormente um estorno, reembolso, crédito ou outro ajuste. `AJUSTE_FINANCEIRO` é o único mecanismo oficial do sistema para correções após qualquer liquidação.

---

## 5. Classificação dos campos

| Categoria | Campos |
|---|---|
| Derivados | Nenhum |
| Calculados | `status_financeiro` — sempre, sem exceção |
| Persistidos | `tipo`, `categoria`, `fornecedor`/`cliente`, `obra`, `veículo`, `valor`, `data_competência`, `vencimento`, `origem`, `situação_administrativa` |
| Imutáveis | `tipo`, `origem` (por inferência estrutural, não regra explícita); `valor`, depois de existir Aplicação de Liquidação vinculada (regra 23) |
| Auditáveis | Todos os campos |

**Importante**: "custo de obra", "custo de veículo", "lucro por obra", "saldo a receber" **não são campos desta entidade** — são resultados de consulta agregada sobre `LANÇAMENTO_FINANCEIRO` (e entidades relacionadas), calculados sempre em tempo de consulta (princípio 8), nunca armazenados em lugar nenhum.

---

## 6. Dependências com outras entidades

Depende de `CATEGORIA` (obrigatório) e, condicionalmente, de `FORNECEDOR` ou `CLIENTE`. Depende opcionalmente de `OBRA` e `VEÍCULO`. É referenciado por `RATEIO_DESPESA`, `APLICAÇÃO_DE_LIQUIDAÇÃO`, `AJUSTE_FINANCEIRO` e, opcionalmente, `PARCELA`.

---

## 7. Checklist de decisões pendentes

**Esta entidade depende de alguma decisão ainda pendente? Parcialmente — duas das pendências que a afetavam diretamente já foram resolvidas.**

1. ~~Estratégia de cálculo do `status`~~ — **Resolvida.** O campo foi separado em `situação_administrativa` (persistida) e `status_financeiro` (sempre calculado, nunca armazenado, sem exceção). Ver Seção 2.
2. ~~Cancelamento com Aplicação de Liquidação já existente (pendência 14 do conceitual)~~ — **Resolvida.** Cancelamento (`situação_administrativa` = Cancelado) só é permitido com soma de Aplicações igual a zero; qualquer correção posterior a uma liquidação passa exclusivamente por `AJUSTE_FINANCEIRO`. Ver Seção 4.
3. ~~Tolerância de soma do Rateio (pendência 7 do conceitual)~~ — **Resolvida.** A soma de `RATEIO_DESPESA.valor_rateado` deve corresponder exatamente ao `valor` do Lançamento, com tolerância restrita ao arredondamento inevitável da menor unidade monetária — nunca uma tolerância de negócio maior. Ver `16-rateio-despesa.md`.
4. **Nova lacuna identificada nesta modelagem, não catalogada nas 14 pendências**: `LANÇAMENTO_FINANCEIRO` **não tem nenhum campo direto que o vincule a uma Empresa** — nem `empresa_id`, nem `conta_bancária_id` (esse último só aparece em `LIQUIDAÇÃO_FINANCEIRA`). O vínculo com Empresa hoje só existe de forma indireta e nem sempre presente: via `veículo.empresa` (se houver Veículo), ou, transitivamente, só no momento em que uma Liquidação (com sua Conta Bancária) for registrada. **Por que importa**: a arquitetura técnica (Seção 11) e a arbitragem (Divergência 4) preveem permissão por escopo de Empresa — mas um Lançamento de Receita sem Obra, sem Veículo e ainda não liquidado não tem, hoje, nenhuma forma de saber a que Empresa pertence. **O que muda**: ou essa informação continua propositalmente ausente até a Liquidação acontecer (o que limitaria a permissão por Empresa a só poder ser aplicada depois da liquidação), ou será necessário decidir, numa etapa de negócio (não técnica), se `LANÇAMENTO_FINANCEIRO` precisa de um vínculo direto e obrigatório com `EMPRESA` — o que **não está no catálogo oficial do conceitual** e não deve ser adicionado por conta própria nesta modelagem. Permanece aberta.
