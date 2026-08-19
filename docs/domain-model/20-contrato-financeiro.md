# CONTRATO_FINANCEIRO

## 1. Visão geral

**Finalidade**: Financiamento ou Consórcio — mesma estrutura, campo `tipo` diferencia (conceitual, Seção 3 e Seção 10).

**Responsabilidade**: generalizar Financiamento e Consórcio numa única entidade, cada um com suas Parcelas, que ao vencer geram `LANÇAMENTO_FINANCEIRO` (categoria "Amortização Empréstimo"/"Consórcios") seguindo o fluxo normal de liquidação (Seção 10 do conceitual).

**Quem cria**: cadastro manual.

**Quem altera**: cadastro manual.

**Quem consulta**: `PARCELA` (todo Contrato tem suas Parcelas), Balanço/relatórios (saldo devedor de financiamento/consórcio, uma das ferramentas de consulta da IA listadas na Seção 11 do conceitual).

**Quem nunca deve alterar**: Financeiro, Cartão, Conciliação, Obras, Frota, Balanço, IA — nenhum escreve na entidade Contrato Financeiro em si (só cadastro manual).

---

## 2. Campos

| Campo | Significado | Tipo conceitual | Obrigatório? | Valor padrão | Pode mudar depois de criado? | Quem pode alterar | Regra de validação | Observações |
|---|---|---|---|---|---|---|---|---|
| `tipo` | Se é Financiamento ou Consórcio | Lista de valores (Financiamento / Consórcio) | Sim | Nenhum | Não — inferência estrutural forte | — | Um dos dois valores | Determina quais dos campos condicionais abaixo se aplicam |
| `empresa` | Empresa titular do Contrato | Referência para outra entidade (Empresa) | Sim | Nenhum | Não definido | Cadastro manual | Deve referenciar uma Empresa existente | — |
| `conta_bancária` | Conta Bancária associada ao Contrato | Referência para outra entidade (Conta Bancária) | Sim | Nenhum | Não definido | Cadastro manual | Deve referenciar uma Conta Bancária existente | — |
| `fornecedor` | Instituição financeira contratada (banco/credor) | Referência para outra entidade (Fornecedor) | Sim | Nenhum | Sim (correção de cadastro) | Cadastro manual | Deve referenciar um Fornecedor existente | **[Atualização — decisão #40, Fase 4]** Substitui o campo `instituição` (texto livre) do catálogo original — bancos/instituições financeiras são cadastrados como `FORNECEDOR`, como qualquer outro credor. Permite que `LANÇAMENTO_FINANCEIRO.fornecedor`, gerado por uma Parcela deste Contrato, referencie diretamente o mesmo `fornecedor_id` |
| `valor_contratado` | Valor originalmente contratado — o compromisso firmado na origem | Valor monetário | Sim | Nenhum | Não definido | Cadastro manual | Deve ser um valor monetário válido | Representa apenas o compromisso originalmente firmado; continua sendo dado de negócio relevante para consulta, comparação e histórico, mas **nunca** é utilizado para calcular saldo devedor pela fórmula "valor contratado menos valor pago" — essa fórmula é inválida para este modelo (ver Seção 4). **[Atualização — decisão #40]** Também é a base da divisão automática entre as Parcelas geradas (ver `número de parcelas` abaixo) — reaproveitado, não duplicado |
| `número de parcelas` | Em quantas parcelas o Contrato é dividido | Número inteiro | Sim | Nenhum | Não — mesma inferência já usada em `COMPRA_CARTÃO.nº parcelas` | Cadastro manual | Deve ser um número inteiro positivo | **[Campo novo — decisão #40, Fase 4]** Determina quantos registros de `PARCELA` são gerados. Divisão do `valor_contratado`: fórmula da decisão #39 (últimas N-1 truncadas na 2ª casa decimal; última absorve o resíduo) |
| `data de vencimento da primeira parcela` | Data em que a 1ª Parcela vence | Data | Sim | Nenhum | Não | Cadastro manual | Deve ser uma data válida | **[Campo novo — decisão #40, Fase 4]** As Parcelas seguintes vencem mensalmente, no mesmo dia desta data (ajustado para o último dia do mês quando esse dia não existir no mês) |
| `taxa` | Taxa de juros do Financiamento | Percentual | Obrigatório quando `tipo` = Financiamento; **conceitualmente inexistente** quando `tipo` = Consórcio — não apenas vazio | Nenhum | Não definido | Cadastro manual | Só pode ser utilizado quando `tipo` = Financiamento — restrição de negócio do domínio, não apenas validação de interface | Mutuamente exclusivo com `grupo-cota`/`contemplado` |
| `grupo-cota` | Identificação do grupo e cota do Consórcio | Texto | Obrigatório quando `tipo` = Consórcio; **conceitualmente inexistente** quando `tipo` = Financiamento — não apenas vazio | Nenhum | Não definido | Cadastro manual | Só pode ser utilizado quando `tipo` = Consórcio — restrição de negócio do domínio, não apenas validação de interface | Mutuamente exclusivo com `taxa` |
| `contemplado` | Se o Consórcio já foi contemplado | Indicador (Sim/Não) | Obrigatório quando `tipo` = Consórcio; **conceitualmente inexistente** quando `tipo` = Financiamento — não apenas vazio | Não (inferência — um Consórcio nasce não contemplado) | Sim, no momento da contemplação | Cadastro manual | Só pode ser utilizado quando `tipo` = Consórcio — restrição de negócio do domínio, não apenas validação de interface | Quando passa a Sim, pode vincular-se a um Veículo (Seção 10 do conceitual) |
| `veículo` | Veículo ao qual o Consórcio contemplado está vinculado | Referência para outra entidade (Veículo) | Não — só aplicável quando `tipo` = Consórcio e `contemplado` = Sim; conceitualmente inexistente nos demais casos | Nenhum (vazio) | Sim (correção de cadastro) | Cadastro manual | Deve referenciar um Veículo existente; só é válido se `tipo` = Consórcio e `contemplado` = Sim | Só Lançamentos gerados **após** a contemplação herdam este vínculo automaticamente — sem propagação retroativa para Lançamentos já gerados (D6, `decisions.md` decisão #28) |

---

## 3. Relacionamentos

| Relacionamento | Cardinalidade | Significado | Quem controla | Regras | Restrições |
|---|---|---|---|---|---|
| Empresa → Contrato Financeiro | 1:N | Uma Empresa pode ter vários Contratos | Cadastro manual | — | — |
| Conta Bancária → Contrato Financeiro | 1:N | Um Contrato está associado a uma Conta Bancária | Cadastro manual | — | — |
| Contrato Financeiro → Parcela | 1:N | Cada Contrato tem suas Parcelas | Sistema, ao calcular o parcelamento | — | — |
| Contrato Financeiro → Veículo | N:1 (opcional) | Um Consórcio contemplado pode vincular-se a um Veículo | Usuário, ao registrar a contemplação | Só se aplica quando `tipo` = Consórcio e `contemplado` = Sim | Antes formalizado só como texto livre nas planilhas antigas; agora relacionamento real (Seção 10 do conceitual) |

---

## 4. Regras da entidade

- **Campos mutuamente exclusivos**: `taxa` (Financiamento) e `grupo-cota`/`contemplado` (Consórcio) — nunca preenchidos simultaneamente no mesmo Contrato, determinado por `tipo`. Esta é uma restrição de negócio do domínio, não apenas uma validação de interface: se `tipo` = Financiamento, somente os campos específicos de Financiamento podem ser utilizados; se `tipo` = Consórcio, somente os campos específicos de Consórcio podem ser utilizados. Os campos específicos do outro tipo permanecem conceitualmente inexistentes para aquele registro — não apenas vazios.
- **Campos obrigatórios por contexto**: `taxa` obrigatório se `tipo` = Financiamento; `grupo-cota` e `contemplado` obrigatórios se `tipo` = Consórcio.
- **Regras de criação**: cadastro manual.
- **Regras de alteração**: alteração manual; `contemplado` muda de Não para Sim no momento da contemplação, podendo então vincular-se a um Veículo.
- **Regras de exclusão**: não definidas.
- **Regras de auditoria**: toda alteração de campo deve ser registrada em `LOG_AUDITORIA`.
- **Regras de integridade**: `empresa` e `conta_bancária` devem existir; `veículo` (quando vinculado) deve existir e só é válido se `tipo` = Consórcio e `contemplado` = Sim.
- **Regras de negócio**:
  - Cada Parcela, ao vencer, gera um `LANÇAMENTO_FINANCEIRO` próprio (categoria "Amortização Empréstimo"/"Consórcios"), seguindo o fluxo normal de liquidação (Seção 10 do conceitual). Quando `tipo` = Consórcio e `contemplado` = Sim, o Lançamento gerado herda automaticamente `veículo` — mas só para Parcelas que vencem **após** a contemplação; Lançamentos gerados antes permanecem sem propagação retroativa (D6, `decisions.md` decisão #28).
  - `CONTRATO_FINANCEIRO` nunca é, ele mesmo, um Lançamento — só gera um por Parcela, ao vencer (coluna "Não representa" do catálogo).
  - **Saldo devedor é definido exclusivamente pela soma das Parcelas que ainda permanecem em aberto** (ainda não convertidas em Lançamento pago) — `valor_contratado` nunca participa desse cálculo. A fórmula "valor_contratado menos valor pago" é considerada inválida para o modelo conceitual.
  - O modelo não pretende decompor cada Parcela em principal, juros, taxa de administração ou qualquer outro componente financeiro. Cada Parcela representa apenas o valor efetivamente devido naquele vencimento — qualquer detalhamento financeiro além disso está deliberadamente fora do escopo deste sistema.

---

## 5. Classificação dos campos

| Categoria | Campos |
|---|---|
| Derivados | Nenhum |
| Calculados | Nenhum campo próprio — "saldo devedor" não é campo desta entidade; é sempre a soma das Parcelas ainda em aberto, calculada em consulta — nunca a partir de `valor_contratado` (ver Seção 4) |
| Persistidos | `tipo`, `empresa`, `conta_bancária`, `fornecedor`, `valor_contratado`, `número de parcelas`, `data de vencimento da primeira parcela`, `taxa`, `grupo-cota`, `contemplado`, `veículo` |
| Imutáveis | `tipo` (por inferência) |
| Auditáveis | Todos os campos |

---

## 6. Dependências com outras entidades

Depende de `EMPRESA`, `CONTA_BANCÁRIA` e `FORNECEDOR` (obrigatórios — `FORNECEDOR` desde a decisão #40, Fase 4, substituindo o antigo campo texto `instituição`). Depende opcionalmente de `VEÍCULO` (quando Consórcio contemplado). É referenciado por `PARCELA`.

---

## 7. Checklist de decisões pendentes

**Esta entidade depende de alguma decisão ainda pendente? Não — resolvida.**

A pendência 6 do conceitual (manter `CONTRATO_FINANCEIRO` único ou separar em duas entidades) foi decidida: a entidade **permanece única**, com `tipo` distinguindo Financiamento de Consórcio. Os motivos registrados na decisão: o comportamento financeiro dos dois é essencialmente o mesmo dentro do sistema; a lógica de Parcelas, Liquidações, Projeções e consultas permanece idêntica; a IA já trata "saldo devedor de financiamento/consórcio" como uma única capacidade de consulta; e o sistema já adota exatamente o mesmo padrão em `LANÇAMENTO_FINANCEIRO` (Despesa/Receita) e `LIQUIDAÇÃO_FINANCEIRA` (Pagamento/Recebimento), mantendo consistência arquitetural.

Os campos condicionais (`taxa`/`grupo-cota`/`contemplado`) deixaram de ser apenas uma observação e passaram a ser regra oficial do modelo, tratada como restrição de negócio do domínio — não apenas validação de interface (ver Seção 2 e Seção 4).

**Princípio geral registrado a partir desta decisão** (`principios-de-modelagem.md`, princípio 1): entidades só devem ser separadas quando existir diferença real de comportamento de negócio — diferenças apenas de atributos específicos não justificam novas entidades.

~~D6 (`revisao-integridade-dominio.md`, achado crítico) — vínculo Consórcio contemplado → Veículo não propagado aos Lançamentos de Parcela~~ — **Resolvida.** Só Lançamentos gerados após a contemplação herdam `veículo` automaticamente; sem propagação retroativa — ver Seção 2 e Seção 4; `decisions.md`, decisão #28.

~~Estrutura de parcelamento inexistente (nenhum campo permitia calcular as Parcelas) e `instituição` como texto livre (sem vínculo com Fornecedor, impedindo preencher `LANÇAMENTO_FINANCEIRO.fornecedor`)~~ — **Resolvida (Fase 4).** Ver notas na Seção 2; `decisions.md`, decisão #40.
