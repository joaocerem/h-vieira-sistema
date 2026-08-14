# Modelo Lógico
## Sistema Financeiro/Gerencial H Vieira Terraplanagem — Fase 3, Etapa 3.1

**Natureza deste documento**: primeiro artefato da Fase 3 (Modelagem Física do Banco de Dados). Traduz o modelo conceitual e as 24 entidades já congeladas na Fase 2 para uma forma lógica — mais próxima de uma estrutura de banco de dados, mas ainda **sem nenhuma decisão física**. Nenhuma linha de SQL, nenhum tipo de dado físico (`VARCHAR`, `NUMERIC`, etc.), nenhuma escolha de SGBD e nenhuma migration foram produzidos aqui.

**Fontes de verdade, na ordem usada para esta tradução**: `architecture/arquitetura-conceitual.md` → `project-rules.md` → `principios-de-modelagem.md` → as 24 entidades em `domain-model/` → `architecture/arquitetura-tecnica.md` → `decisions.md` → `pendencias.md` → `freeze-fase-2.md`. Nenhum documento em `historico/` foi consultado como fonte de decisão.

**Verificação de consistência realizada antes da redação**: as 5 fontes normativas (conceitual, princípios, as 24 entidades, decisões, pendências) foram conferidas entre si antes de iniciar esta tradução — mesma verificação já feita na auditoria final da Fase 2 e reconfirmada aqui especificamente sob a ótica de "isso pode ser traduzido para uma tabela lógica sem exigir uma decisão nova?". **Nenhuma inconsistência foi encontrada.** Os únicos pontos que exigiriam uma decisão nova (enumerações de `status`/`tipo` ainda não fechadas, mecanismo técnico do vínculo genérico, mutabilidade de algumas entidades) já estão identificados como pendências abertas em `pendencias.md` (D9-D13, B4) — este documento os representa como estão, sem resolvê-los nem inventar um valor provisório.

---

## 1. Objetivo do modelo lógico

O **modelo conceitual** (`arquitetura-conceitual.md`) e as 24 entidades descrevem *o que* o sistema precisa representar: conceitos de negócio, regras, relacionamentos e responsabilidades — na linguagem do domínio (Empresa, Lançamento Financeiro, Fatura), sem nenhum compromisso com como o dado é armazenado.

O **modelo lógico** é o passo intermediário entre esse conceito de negócio e um schema de banco de dados real. Ele:

- Traduz cada entidade conceitual numa **tabela lógica**, com um conjunto definido de atributos (colunas lógicas).
- Torna explícitos os **relacionamentos** como **chaves estrangeiras lógicas**, com suas cardinalidades.
- Distingue **o que é armazenado** (atributo persistido) do **que é apenas calculado em consulta** (atributo derivado/calculado) — para que nenhum indicador vire, por engano, uma coluna física na próxima etapa.
- Formaliza os **identificadores** de cada entidade, sem ainda escolher sua forma técnica.

O que o modelo lógico **não faz**: não escolhe SGBD, não define tipos de dado físicos, não define índices, não define estratégia de particionamento ou performance, não resolve nenhuma pendência de negócio ainda aberta. Essas decisões pertencem às próximas etapas da Fase 3 (modelagem física) e são, propositalmente, adiadas.

---

## 2. Convenções utilizadas

Convenções puramente lógicas — nenhuma delas é uma decisão de banco de dados:

| Conceito conceitual | Representação lógica |
|---|---|
| Entidade | Tabela lógica |
| Atributo persistido | Coluna lógica |
| Atributo calculado/derivado (nunca armazenado — princípio 6 de `principios-de-modelagem.md`) | **Não é coluna** — listado à parte, como resultado de consulta sobre outras tabelas lógicas |
| Relacionamento 1:N ou N:1 | Chave estrangeira lógica (FK) na tabela do lado "N" |
| Relacionamento N:N | Tabela lógica associativa própria (já existe no conceitual: `APLICAÇÃO_DE_LIQUIDAÇÃO` resolve `LANÇAMENTO_FINANCEIRO`↔`LIQUIDAÇÃO_FINANCEIRA`) |
| Identificador de cada entidade | **Identificador lógico único** — todo registro de toda tabela lógica tem um identificador que a distingue de qualquer outro. Por convenção de uniformidade, todas as tabelas lógicas recebem esse identificador da mesma forma abstrata, mesmo entidades associativas (ex. `APLICAÇÃO_DE_LIQUIDAÇÃO`). **A forma técnica exata (sequencial, identificador universal, chave natural, chave composta) é decisão da fase de modelagem física** — já sinalizada como fora de escopo conceitual em `domain-model/01-empresa.md` e aplicada aqui a todas as 24 entidades por analogia direta, não como decisão nova |
| Atributo obrigatório / opcional | Preservado exatamente como cada entidade já define na sua Seção 2 ("Obrigatório?") — sem NOT NULL físico, só a regra de negócio de obrigatoriedade |
| Atributo condicional (depende de um campo discriminador) | Grupo de atributos mutuamente exclusivos, ativo apenas para um valor do discriminador (ex. `taxa` só existe quando `CONTRATO_FINANCEIRO.tipo` = Financiamento) — já decidido como restrição de **negócio**, não de interface (Decisão 4) |
| Referência genérica de escopo fechado (`LOG_AUDITORIA.entidade`/`id`; `SUGESTÃO_IA.entidade_alvo`; "registro real gerado" de `AÇÃO_PROPOSTA_IA`) | Representada logicamente como uma **FK condicional a um conjunto fechado e explícito de tabelas lógicas** (nunca uma referência livre a qualquer tabela). O **mecanismo físico** exato (referência polimórfica, tabela de junção, ou outro) permanece pendência (`pendencias.md`, item B4) — não decidido aqui |
| Cardinalidade | Anotada em cada relacionamento como 1:1, 1:N, N:1 ou N:N, exatamente como consolidada na Fase 2 — nenhuma cardinalidade nova foi inferida |

---

## 3. Tradução das 24 entidades

### 3.01 — EMPRESA
- **Finalidade**: unidade do grupo empresarial à qual Contas Bancárias, Veículos e Contratos Financeiros pertencem.
- **Atributos lógicos**: `nome` (persistido, obrigatório); `tipo` (persistido, obrigatório — valores válidos ainda não enumerados, ver D1).
- **Identificador lógico**: identificador único de Empresa.
- **Relacionamentos e cardinalidades**: Empresa 1:N Conta Bancária; Empresa 1:N Veículo; Empresa 1:N Contrato Financeiro; Empresa 1:N Cartão de Crédito (**indireto**, via Conta Bancária — sem FK direta).
- **Dependências**: nenhuma (entidade raiz).
- **Observações**: valores de `tipo` pendentes (D1, não bloqueante). Nenhum campo de saldo ou dado financeiro — Empresa é puro cadastro.

### 3.02 — USUÁRIO
- **Finalidade**: identificar a pessoa responsável por uma ação do sistema, para autoria e auditoria. Entidade **inferida** — não consta no catálogo oficial do conceitual (pendência 5/A2 ainda aberta).
- **Atributos lógicos**: `nome` (persistido, obrigatório); `identificador_de_acesso` (persistido, obrigatório); `situação_de_acesso` (persistido, inferência estrutural não confirmada pelo conceitual).
- **Identificador lógico**: identificador único de Usuário.
- **Relacionamentos e cardinalidades**: Usuário 1:N Log Auditoria (condicional a `origem` humana); Usuário 1:N Sugestão IA; Usuário 1:N Ação Proposta IA; Usuário 1:N Ajuste Financeiro.
- **Dependências**: nenhuma.
- **Observações**: **estrutura deliberadamente mínima** — credenciais, papel/perfil, escopo por Empresa e nível de confirmação de IA ficam fora por decisão de modelagem (não inventar antes da pendência A2 ser resolvida). Este bloco deve ser revisado por completo quando A2 for decidida, não apenas complementado.

### 3.03 — OBRA
- **Finalidade**: contrato/projeto de terraplanagem executado para um Cliente.
- **Atributos lógicos**: `nome` (persistido, obrigatório); `cliente` (FK, obrigatório); `valor_contratado` (persistido, obrigatório); `data_início` (persistido, obrigatório); `data_prevista_término` (persistido, obrigatório); `data_real_término` (persistido, opcional — só quando concluída); `status` (persistido, obrigatório — valores ainda não enumerados, ver D9).
- **Identificador lógico**: identificador único de Obra.
- **Relacionamentos e cardinalidades**: Cliente 1:N Obra; Obra 1:N Lançamento Financeiro (direto, opcional, mutuamente exclusivo com Rateio para o mesmo Lançamento); Obra 1:N Rateio Despesa.
- **Dependências**: Cliente (obrigatória).
- **Observações**: "Lucro por Obra", "custo direto", "custo rateado" **não são atributos** — resultado de consulta agregada sobre Lançamento Financeiro e Rateio Despesa, nunca persistidos (princípio 6/8). Valores de `status` pendentes (D9).

### 3.04 — CLIENTE
- **Finalidade**: cadastro único de cada cliente da terraplanagem.
- **Atributos lógicos**: `nome` (persistido, obrigatório, cadastro único).
- **Identificador lógico**: identificador único de Cliente.
- **Relacionamentos e cardinalidades**: Cliente 1:N Obra.
- **Dependências**: nenhuma.
- **Observações**: nenhuma pendência associada — uma das entidades mais simples do modelo.

### 3.05 — FORNECEDOR
- **Finalidade**: cadastro único de cada credor da terraplanagem.
- **Atributos lógicos**: `nome` (persistido, obrigatório, cadastro único).
- **Identificador lógico**: identificador único de Fornecedor.
- **Relacionamentos e cardinalidades**: Fornecedor 1:N Lançamento Financeiro (condicional a `tipo` = Despesa); Fornecedor 1:N Compra Cartão.
- **Dependências**: nenhuma.
- **Observações**: nenhuma pendência associada.

### 3.06 — CATEGORIA
- **Finalidade**: natureza do gasto/receita (Combustível, Manutenção etc.) — dimensão independente de `classificação`.
- **Atributos lógicos**: `nome` (persistido, obrigatório); `tipo` (persistido, obrigatório — valores não enumerados no conceitual).
- **Identificador lógico**: identificador único de Categoria.
- **Relacionamentos e cardinalidades**: Categoria 1:N Lançamento Financeiro; Categoria 1:N Compra Cartão.
- **Dependências**: nenhuma.
- **Observações**: pendência 4 do conceitual **resolvida** (Decisão 5) — sem segunda dimensão de "sub-conta interna". `categoria` nunca é inferida a partir de `classificação`, nem vice-versa (regra 29).

### 3.07 — VEÍCULO
- **Finalidade**: bem da frota — dimensão de custo independente e simultânea à de Obra.
- **Atributos lógicos**: `nome/identificação` (persistido, obrigatório); `tipo` (persistido, obrigatório — valores não enumerados, ver D10); `empresa` (FK, obrigatório).
- **Identificador lógico**: identificador único de Veículo.
- **Relacionamentos e cardinalidades**: Empresa 1:N Veículo; Veículo 1:N Lançamento Financeiro (opcional, pode coexistir com Obra); Veículo 1:N Compra Cartão (opcional); Veículo 1:N Contrato Financeiro (opcional — só Consórcio contemplado).
- **Dependências**: Empresa (obrigatória).
- **Observações**: valores de `tipo` pendentes (D10, impacto baixo). "Custo do Veículo" não é atributo — consulta agregada.

### 3.08 — CONTA_BANCÁRIA
- **Finalidade**: conta bancária de uma Empresa; referência de onde Movimentação Bancária acontece e para onde Liquidação Financeira aponta.
- **Atributos lógicos**: `empresa` (FK, obrigatório); `banco` (persistido, obrigatório); `apelido` (persistido, obrigatório).
- **Identificador lógico**: identificador único de Conta Bancária.
- **Relacionamentos e cardinalidades**: Empresa 1:N Conta Bancária; Conta Bancária 1:N Movimentação Bancária; Conta Bancária 1:N Cartão de Crédito; Conta Bancária 1:N Liquidação Financeira; Conta Bancária 1:N Contrato Financeiro.
- **Dependências**: Empresa (obrigatória).
- **Observações**: **`saldo` não é atributo** — sempre calculado a partir da soma de Movimentação Bancária (princípio 8; explícito na coluna "Não representa" do conceitual).

### 3.09 — LANÇAMENTO_FINANCEIRO
- **Finalidade**: o fato econômico da terraplanagem, do nascimento (obrigação/direito) ao status final — entidade central do sistema (princípio 1).
- **Atributos lógicos**: `tipo` (persistido, obrigatório, imutável — Despesa/Receita); `categoria` (FK, obrigatório); `fornecedor` (FK, condicional a `tipo`=Despesa) / `cliente` (FK, condicional a `tipo`=Receita) — **mutuamente exclusivos**; `obra` (FK, opcional — mutuamente exclusivo com a existência de Rateio Despesa para este Lançamento); `veículo` (FK, opcional, pode coexistir com `obra`); `valor` (persistido, obrigatório, imutável a partir da 1ª Aplicação de Liquidação); `data_competência` (persistido, obrigatório); `vencimento` (persistido, obrigatório); `situação_administrativa` (persistido, obrigatório — Ativo/Cancelado); `origem` (persistido, obrigatório, imutável); **`status_financeiro` — atributo CALCULADO, não é coluna persistida** (derivado da soma de `APLICAÇÃO_DE_LIQUIDAÇÃO.valor_aplicado`, sempre, sem exceção — Decisão 1).
- **Identificador lógico**: identificador único de Lançamento Financeiro.
- **Relacionamentos e cardinalidades**: Categoria N:1; Fornecedor N:1 (condicional); Cliente N:1 (condicional); Obra N:1 (opcional); Veículo N:1 (opcional); Lançamento 1:N Rateio Despesa (opcional); Lançamento N:N Liquidação Financeira, via Aplicação de Liquidação; Lançamento (original) 1:N Ajuste Financeiro; Ajuste Financeiro 1:1 Lançamento (de ajuste); Parcela 1:1 Lançamento (opcional, quando a Parcela vence).
- **Dependências**: Categoria (obrigatória); Fornecedor ou Cliente (condicional, exatamente um).
- **Observações**: `situação_administrativa` só transiciona para Cancelado com soma de Aplicações = 0 (Decisão 2); correções após qualquer Aplicação passam exclusivamente por `AJUSTE_FINANCEIRO` (nunca reescrevendo `valor`). Ausência de vínculo direto com Empresa é lacuna já catalogada (D7) — **não foi inventado nenhum campo `empresa` aqui** para não antecipar essa decisão.

### 3.10 — LIQUIDAÇÃO_FINANCEIRA
- **Finalidade**: evento de decisão/execução do pagamento ou recebimento de um ou mais Lançamentos.
- **Atributos lógicos**: `tipo` (persistido, obrigatório — Pagamento/Recebimento); `data_efetiva` (persistido, obrigatório); `valor` (persistido, obrigatório); `conta_bancária` (FK, obrigatório).
- **Identificador lógico**: identificador único de Liquidação Financeira.
- **Relacionamentos e cardinalidades**: Conta Bancária N:1; Lançamento Financeiro N:N, via Aplicação de Liquidação; Liquidação 1:1 Movimentação Bancária; Liquidação 1:1 (indireto) Vínculo Conciliação; Fatura 1:1 Liquidação (opcional).
- **Dependências**: Conta Bancária (obrigatória).
- **Observações**: soma das Aplicações vinculadas pode ser **menor** que `valor` (caso de Fatura mista — diferença explicável, não divergência), mas não deveria ser maior (inferência). **Mutabilidade após criação é pendência aberta (D12)** — o modelo lógico não presume nem regra de imutabilidade total, nem regra de edição.

### 3.11 — APLICAÇÃO_DE_LIQUIDAÇÃO
- **Finalidade**: liga N Lançamentos a N Liquidações, com o valor exato de cada combinação — resolve o relacionamento N:N da cadeia central.
- **Atributos lógicos**: `lançamento_financeiro` (FK, obrigatório); `liquidação_financeira` (FK, obrigatório); `valor_aplicado` (persistido, obrigatório).
- **Identificador lógico**: identificador único de Aplicação de Liquidação (por convenção de uniformidade — ver Seção 2; forma física, incluindo se será chave composta, é decisão posterior).
- **Relacionamentos e cardinalidades**: Lançamento Financeiro N:1; Liquidação Financeira N:1.
- **Dependências**: Lançamento Financeiro e Liquidação Financeira (ambos obrigatórios).
- **Observações**: **imutável depois de criada, confirmado** — nenhum fluxo do modelo altera ou remove uma Aplicação já existente (consequência da Decisão 2). Soma de `valor_aplicado` por Lançamento não deveria ultrapassar seu `valor`; soma por Liquidação não deveria ultrapassar o `valor` dela (inferências necessárias, não regras de validação explícitas no conceitual).

### 3.12 — MOVIMENTAÇÃO_BANCÁRIA
- **Finalidade**: fato puro do extrato — existe para 100% do que passa pela conta.
- **Atributos lógicos**: `conta_bancária` (FK, obrigatório, imutável); `data` (persistido, obrigatório, imutável); `descrição` (persistido, obrigatório, imutável); `valor` (persistido, obrigatório, imutável); `classificação` (persistido, obrigatório, mutável — único campo regularmente alterável).
- **Identificador lógico**: identificador único de Movimentação Bancária.
- **Relacionamentos e cardinalidades**: Conta Bancária N:1; Movimentação 1:1 Vínculo Conciliação; Movimentação 1:1 Transferência Interna (opcional, como origem ou destino).
- **Dependências**: Conta Bancária (obrigatória).
- **Observações**: `saldo da conta` não é atributo — consulta agregada. `classificação` e `estado_conciliação` (em Vínculo Conciliação) são dimensões independentes, nunca fundidas.

### 3.13 — TRANSFERÊNCIA_INTERNA
- **Finalidade**: vincula duas Movimentações Bancárias que são, juntas, uma transferência entre contas próprias do grupo.
- **Atributos lógicos**: `movimentação_origem` (FK, obrigatório); `movimentação_destino` (FK, obrigatório, mutuamente exclusiva de `movimentação_origem`); `valor` (persistido, obrigatório); `data` (persistido, obrigatório).
- **Identificador lógico**: identificador único de Transferência Interna.
- **Relacionamentos e cardinalidades**: Transferência Interna 1:1 Movimentação Bancária (origem); Transferência Interna 1:1 Movimentação Bancária (destino).
- **Dependências**: Movimentação Bancária (duas referências obrigatórias, distintas entre si).
- **Observações**: nunca gera Lançamento Financeiro (regra 5). Sugestão determinística por valor+data é distinta de `SUGESTÃO_IA` — nunca confundir os dois mecanismos.

### 3.14 — VÍNCULO_CONCILIAÇÃO
- **Finalidade**: estado da conferência entre uma Movimentação Bancária e uma Liquidação Financeira.
- **Atributos lógicos**: `movimentação_bancária` (FK, obrigatório, imutável); `liquidação_financeira` (FK, opcional — nulo quando Sem Correspondência); `estado_conciliação` (persistido, obrigatório, mutável).
- **Identificador lógico**: identificador único de Vínculo Conciliação.
- **Relacionamentos e cardinalidades**: Movimentação Bancária 1:1; Liquidação Financeira 1:1 (opcional).
- **Dependências**: Movimentação Bancária (obrigatória).
- **Observações**: toda Movimentação tem exatamente um Vínculo, mesmo que "Sem Correspondência". Divergência de valor nunca é resolvida automaticamente.

### 3.15 — AJUSTE_FINANCEIRO
- **Finalidade**: vínculo formal entre um Lançamento original e um Lançamento de estorno/reembolso/crédito/ajuste — mecanismo exclusivo de correção pós-liquidação.
- **Atributos lógicos**: `lançamento_original` (FK, obrigatório, imutável); `lançamento_ajuste` (FK, obrigatório, imutável); `tipo_ajuste` (persistido, obrigatório — Estorno/Reembolso/Crédito/Ajuste); `valor` (persistido, obrigatório); `data` (persistido, obrigatório); `usuário` (FK, obrigatório); `observação` (persistido, opcional).
- **Identificador lógico**: identificador único de Ajuste Financeiro.
- **Relacionamentos e cardinalidades**: Lançamento Financeiro (original) 1:N Ajuste Financeiro; Ajuste Financeiro 1:1 Lançamento Financeiro (de ajuste); Usuário N:1.
- **Dependências**: Lançamento Financeiro (duas referências obrigatórias); Usuário (obrigatória).
- **Observações**: criação **exclusivamente humana** — `AÇÃO_PROPOSTA_IA` nunca gera Ajuste, em nenhum nível de sensibilidade (Decisão 8). Regras de alteração/exclusão ainda não definidas (D13) — o modelo lógico não presume nenhuma delas.

### 3.16 — RATEIO_DESPESA
- **Finalidade**: distribuição manual de uma Despesa entre várias Obras, sem duplicar o valor original.
- **Atributos lógicos**: `lançamento_financeiro` (FK, obrigatório); `obra` (FK, obrigatório); `valor_rateado` (persistido, obrigatório); `critério_informado` (persistido, opcional).
- **Identificador lógico**: identificador único de Rateio Despesa.
- **Relacionamentos e cardinalidades**: Lançamento Financeiro 1:N (mutuamente exclusivo com `obra` preenchido diretamente no Lançamento); Obra 1:N.
- **Dependências**: Lançamento Financeiro e Obra (ambos obrigatórios).
- **Observações**: soma de `valor_rateado` deve corresponder exatamente a `valor` do Lançamento, tolerância restrita a arredondamento de menor unidade monetária — nunca tolerância de negócio (Decisão 10). Pendência D3 (rateio parcialmente pendente) não resolvida — modelo lógico não impõe fechamento obrigatório no ato do registro.

### 3.17 — CARTÃO_CRÉDITO
- **Finalidade**: cartão de crédito da empresa — agrupa Compras e Faturas, vinculado a uma Conta Bancária como entidade própria.
- **Atributos lógicos**: `conta_bancária` (FK, obrigatório); `banco` (persistido, obrigatório); `apelido` (persistido, obrigatório); `dia_fechamento` (persistido, obrigatório); `dia_vencimento` (persistido, obrigatório).
- **Identificador lógico**: identificador único de Cartão de Crédito.
- **Relacionamentos e cardinalidades**: Conta Bancária 1:N Cartão; Cartão 1:N Compra Cartão; Cartão 1:N Fatura.
- **Dependências**: Conta Bancária (obrigatória).
- **Observações**: nenhuma pendência associada.

### 3.18 — COMPRA_CARTÃO
- **Finalidade**: cada compra feita no cartão — preserva individualmente fornecedor, valor, categoria, classificação, obra e veículo, mesmo agrupada numa Fatura mista.
- **Atributos lógicos**: `cartão` (FK, obrigatório, imutável); `fornecedor` (FK, obrigatório); `valor` (persistido, obrigatório); `data` (persistido, obrigatório); `categoria` (FK, obrigatório); `classificação` (persistido, obrigatório); `obra` (FK, opcional); `veículo` (FK, opcional); `nº_parcelas` (persistido, obrigatório, imutável).
- **Identificador lógico**: identificador único de Compra Cartão.
- **Relacionamentos e cardinalidades**: Cartão de Crédito 1:N Compra Cartão; Compra Cartão 1:N Parcela.
- **Dependências**: Cartão de Crédito, Fornecedor, Categoria (obrigatórios).
- **Observações**: **sem relação direta com Fatura** — vínculo transitivo, só via Parcela (correção de consistência já aplicada em `18-compra-cartao.md`, Fase 2, Seção 9 do handoff). Só gera Lançamento (via Parcela) se `classificação` = Terraplanagem.

### 3.19 — FATURA
- **Finalidade**: agrupador de cobrança de um ciclo do cartão — nunca uma despesa financeira única.
- **Atributos lógicos**: `cartão` (FK, obrigatório, imutável); `ciclo` (persistido, obrigatório, imutável); `valor_total_calculado` (**calculado até o fechamento; a partir daí, persistido como retrato histórico congelado — exceção justificada ao princípio 6, protegida pelo princípio 5**); `valor_cobrado` (persistido, obrigatório — mutável até a confirmação, depois congelado).
- **Identificador lógico**: identificador único de Fatura.
- **Relacionamentos e cardinalidades**: Cartão de Crédito 1:N Fatura; Fatura 1:N Parcela (atribuídas no fechamento do ciclo, ou por importação com fonte externa autoritativa); Fatura 1:1 Liquidação Financeira (opcional, quando paga).
- **Dependências**: Cartão de Crédito (obrigatória).
- **Observações**: uma Fatura fechada continua aceitando novas Parcelas vinculadas por importação tardia, **sem** recalcular os totais já congelados — diferença entre o congelado e a soma atual de Parcelas é efeito esperado, não inconsistência (Decisão 6).

### 3.20 — CONTRATO_FINANCEIRO
- **Finalidade**: Financiamento ou Consórcio — mesma estrutura, campo `tipo` diferencia (entidade única, Decisão 4).
- **Atributos lógicos**: `tipo` (persistido, obrigatório, imutável — Financiamento/Consórcio); `empresa` (FK, obrigatório); `conta_bancária` (FK, obrigatório); `instituição` (persistido, obrigatório); `valor_contratado` (persistido, obrigatório — nunca usado no cálculo de saldo devedor); `taxa` (persistido, **condicional a `tipo`=Financiamento**, conceitualmente inexistente para Consórcio); `grupo-cota` (persistido, **condicional a `tipo`=Consórcio**); `contemplado` (persistido, **condicional a `tipo`=Consórcio**).
- **Identificador lógico**: identificador único de Contrato Financeiro.
- **Relacionamentos e cardinalidades**: Empresa 1:N Contrato Financeiro; Conta Bancária 1:N Contrato Financeiro; Contrato Financeiro 1:N Parcela; Contrato Financeiro N:1 Veículo (opcional, só Consórcio contemplado).
- **Dependências**: Empresa e Conta Bancária (obrigatórios).
- **Observações**: `taxa` e `grupo-cota`/`contemplado` são **mutuamente exclusivos por restrição de negócio**, não validação de interface (Decisão 4). Saldo devedor **não é atributo** — sempre soma de Parcelas em aberto, nunca `valor_contratado` menos pago (Decisão 9).

### 3.21 — PARCELA
- **Finalidade**: parcela individual, reutilizada por Compra de Cartão e Contrato Financeiro — ponte que gera um Lançamento Financeiro ao vencer.
- **Atributos lógicos**: `origem` (persistido, obrigatório, imutável — Compra Cartão/Contrato Financeiro, discriminador); `número` (persistido, obrigatório, imutável); `total` (persistido, obrigatório, imutável); `valor` (persistido, obrigatório); `vencimento` (persistido, obrigatório); `status` (persistido, obrigatório — valores ainda não enumerados, ver D11); `fatura` (FK, opcional — só aplicável quando `origem`=Compra Cartão; permanente uma vez atribuído).
- **Identificador lógico**: identificador único de Parcela.
- **Relacionamentos e cardinalidades**: Compra Cartão N:1 (condicional); Contrato Financeiro N:1 (condicional — mutuamente exclusivo com Compra Cartão, via `origem`); Parcela 1:1 Lançamento Financeiro (opcional, ao vencer); Fatura N:1 (opcional, condicional a `origem`).
- **Dependências**: exatamente uma entre Compra Cartão e Contrato Financeiro (conforme `origem`).
- **Observações**: `status` e `fatura` são **dimensões independentes**, nunca fundidas — ausência de `fatura` já representa "aguardando" (Decisão 7). Valores de `status` pendentes (D11).

### 3.22 — SUGESTÃO_IA
- **Finalidade**: proposta de classificação (categoria, classificação operacional, obra, veículo) feita pela IA, pendente de confirmação — nunca grava diretamente.
- **Atributos lógicos**: `entidade_alvo` (**referência genérica de escopo fechado** a Movimentação Bancária OU Lançamento Financeiro, obrigatório, imutável); `campo_sugerido` (persistido, obrigatório, imutável); `valor_sugerido` (persistido, obrigatório, imutável); `justificativa` (persistido, obrigatório, imutável); `status` (persistido, obrigatório, mutável — uma única transição); `grupo_sugestão` (FK, opcional — só apresentação, sem efeito de negócio).
- **Identificador lógico**: identificador único de Sugestão IA.
- **Relacionamentos e cardinalidades**: Movimentação Bancária OU Lançamento Financeiro 1:N Sugestão IA (referência condicional); Usuário 1:N Sugestão IA (confirmação).
- **Dependências**: exatamente uma entre Movimentação Bancária e Lançamento Financeiro (via `entidade_alvo`); Usuário (para confirmação).
- **Observações**: regra 29 — `categoria` e `classificação` nunca fundidas na mesma sugestão. Mecanismo físico de `entidade_alvo` é pendência B4, não resolvida aqui.

### 3.23 — AÇÃO_PROPOSTA_IA
- **Finalidade**: proposta de criação/alteração de registro feita pela IA a partir de linguagem natural, pendente de confirmação — nunca executa sem confirmação explícita.
- **Atributos lógicos**: `tipo_ação` (persistido, obrigatório, imutável — catálogo ainda não fechado, ver I1); `dados_propostos` (persistido, obrigatório, imutável — **estrutura variável conforme `tipo_ação`**, forma física ainda em aberto); `nível_sensibilidade` (persistido, obrigatório, imutável — Baixo/Médio/Alto); `status` (persistido, obrigatório, mutável — uma única transição).
- **Identificador lógico**: identificador único de Ação Proposta IA.
- **Relacionamentos e cardinalidades**: Usuário 1:N Ação Proposta IA; Ação Proposta IA 0:1 registro real gerado (**referência genérica de escopo fechado**, restrita às entidades oficialmente permitidas para IA — `AJUSTE_FINANCEIRO` explicitamente excluído).
- **Dependências**: Usuário (para confirmação).
- **Observações**: `AJUSTE_FINANCEIRO` está **definitivamente fora** do catálogo de ações possíveis, em qualquer nível de sensibilidade (Decisão 8). Nível Alto exige barreira reforçada cujo mecanismo é pendência A8, não resolvida aqui.

### 3.24 — LOG_AUDITORIA
- **Finalidade**: histórico granular (por campo) de alteração de qualquer entidade financeira relevante — sustenta o princípio 10 e a regra 31.
- **Atributos lógicos**: `entidade` (persistido, obrigatório, imutável — nome do tipo, restrito a lista fechada de entidades auditáveis); `id` (**referência genérica de escopo fechado**, obrigatório, imutável); `campo_alterado` (persistido, obrigatório, imutável); `valor_anterior` (persistido, obrigatório, imutável); `valor_novo` (persistido, obrigatório, imutável); `data/hora` (persistido, obrigatório, imutável); `usuário` (FK, condicional — obrigatório quando `origem` ≠ Importação Bancária); `origem` (persistido, obrigatório, imutável); `referência_a_sugestão_ou_ação` (FK, condicional — genérica entre Sugestão IA e Ação Proposta IA).
- **Identificador lógico**: identificador único de Log Auditoria (linha de log).
- **Relacionamentos e cardinalidades**: qualquer entidade financeira auditável 1:N Log Auditoria (referência genérica de escopo fechado); Usuário 1:N Log Auditoria (condicional); Sugestão IA ou Ação Proposta IA 1:N Log Auditoria (condicional).
- **Dependências**: nenhuma obrigatória fixa — depende, de forma genérica, de qualquer entidade da lista fechada de entidades auditáveis.
- **Observações**: **entidade 100% imutável após criação** — a única do modelo inteiro nessa condição. Mecanismo físico da referência genérica é pendência B4, não resolvida aqui; a lista fechada de entidades auditáveis ainda não foi compilada como artefato único (tarefa de organização documental, não pendência de modelagem).

---

## 4. Relacionamentos globais

Visão consolidada de todos os relacionamentos lógicos entre as 24 tabelas, agrupados pelas mesmas cadeias já usadas no conceitual (Seção 4 de `arquitetura-conceitual.md`) — nenhum relacionamento novo foi adicionado, nenhum foi removido.

**Cadastros base** (sem dependência de outra entidade de negócio):
- `EMPRESA`, `CLIENTE`, `FORNECEDOR`, `CATEGORIA` — independentes.
- `CONTA_BANCÁRIA` → depende de `EMPRESA`.
- `VEÍCULO` → depende de `EMPRESA`.
- `OBRA` → depende de `CLIENTE`.
- `CARTÃO_CRÉDITO` → depende de `CONTA_BANCÁRIA`.
- `USUÁRIO` → independente (estrutura mínima).

**Cadeia financeira central**:
```
LANÇAMENTO_FINANCEIRO ──N:N──> LIQUIDAÇÃO_FINANCEIRA
        (resolvida por)  APLICAÇÃO_DE_LIQUIDAÇÃO
LIQUIDAÇÃO_FINANCEIRA ──1:1──> MOVIMENTAÇÃO_BANCÁRIA ──1:1──> VÍNCULO_CONCILIAÇÃO
```

**Cadeia de cartão**:
```
CARTÃO_CRÉDITO ──1:N──> COMPRA_CARTÃO ──1:N──> PARCELA ──1:1(opcional)──> LANÇAMENTO_FINANCEIRO
CARTÃO_CRÉDITO ──1:N──> FATURA ──1:N──> PARCELA (mesma tabela acima, vínculo por atribuição de ciclo)
FATURA ──1:1(opcional)──> LIQUIDAÇÃO_FINANCEIRA
```
*(sem relação direta `COMPRA_CARTÃO` → `FATURA` — sempre via `PARCELA`)*

**Cadeia de ajuste**:
```
LANÇAMENTO_FINANCEIRO (original) ──1:N──> AJUSTE_FINANCEIRO ──1:1──> LANÇAMENTO_FINANCEIRO (de ajuste)
AJUSTE_FINANCEIRO ──N:1──> USUÁRIO
```

**Cadeia de obra, veículo e rateio**:
```
OBRA ──1:N──> LANÇAMENTO_FINANCEIRO (direto, opcional)
OBRA ──1:N──> RATEIO_DESPESA ──N:1──> LANÇAMENTO_FINANCEIRO (rateado, mutuamente exclusivo com o direto)
VEÍCULO ──1:N──> LANÇAMENTO_FINANCEIRO (opcional, coexiste com Obra)
```

**Cadeia de financiamento/consórcio**:
```
EMPRESA ──1:N──> CONTRATO_FINANCEIRO ──1:N──> PARCELA ──1:1(opcional)──> LANÇAMENTO_FINANCEIRO
CONTRATO_FINANCEIRO ──N:1(opcional)──> VEÍCULO (só Consórcio contemplado)
```

**Cadeia de IA e auditoria** (todas com referência genérica de escopo fechado):
```
(MOVIMENTAÇÃO_BANCÁRIA | LANÇAMENTO_FINANCEIRO) ──1:N──> SUGESTÃO_IA ──N:1──> USUÁRIO
AÇÃO_PROPOSTA_IA ──N:1──> USUÁRIO
AÇÃO_PROPOSTA_IA ──0:1──> (registro real, entidade da lista fechada permitida para IA)
(qualquer entidade auditável) ──1:N──> LOG_AUDITORIA ──N:1(condicional)──> USUÁRIO
LOG_AUDITORIA ──N:1(condicional)──> (SUGESTÃO_IA | AÇÃO_PROPOSTA_IA)
```

---

## 5. Dependências de implementação

Itens que a futura modelagem física (próximas etapas da Fase 3) precisa considerar — nenhum deles é resolvido aqui, e nenhuma decisão nova foi tomada ao listá-los. Todos já estão catalogados em `pendencias.md`:

- **B1 — Banco de dados físico** ainda não escolhido. Afeta diretamente como os tipos lógicos deste documento viram tipos físicos (ex. suporte nativo a JSON para `AÇÃO_PROPOSTA_IA.dados_propostos`, precisão decimal para valores monetários).
- **B4 — Técnica de implementação do vínculo genérico** (`LOG_AUDITORIA.entidade`/`id`; `SUGESTÃO_IA.entidade_alvo`; "registro real" de `AÇÃO_PROPOSTA_IA`). Este documento representa essas referências como "FK condicional a um conjunto fechado de tabelas" — a forma física (referência polimórfica, ou outra) ainda não foi escolhida.
- **B3 — Estratégia de índice**, a decidir no início da modelagem física. Os campos mais consultados em agregação já são conhecidos pela arquitetura técnica (Seção 7): `obra_id`, `veiculo_id`, `data_competência` em `LANÇAMENTO_FINANCEIRO`.
- **D9, D10, D11 — Enumerações não fechadas** de `OBRA.status`, `VEÍCULO.tipo` e `PARCELA.status`. Cada uma precisa de um conjunto de valores confirmado antes de decidir se o campo físico será um tipo enumerado, uma tabela de domínio (lookup), ou uma constraint de verificação.
- **D12 — Mutabilidade de `LIQUIDAÇÃO_FINANCEIRA`** ainda não definida. Afeta se o schema físico permite `UPDATE` sobre essa tabela ou se ela deve ser append-only (só estorno/substituição).
- **D13 — Regras de alteração/exclusão de `AJUSTE_FINANCEIRO`** ainda não definidas. Mesma natureza de impacto que D12.
- **I1 — Catálogo `tipo_ação` → `nível_sensibilidade`** incompleto. Afeta se `AÇÃO_PROPOSTA_IA.tipo_ação` será, na modelagem física, um valor fechado (enum/lookup) ou permanece texto livre até a Fase 6 (IA).
- **A2 — Modelo de permissões de usuário** ainda não definido. `USUÁRIO`, tal como modelado aqui, é propositalmente mínimo — uma decisão futura sobre papéis/escopo por Empresa pode exigir revisão estrutural completa dessa tabela antes da Fase 4, sem impacto no restante do modelo lógico.
- **Precisão de valores monetários** (Decisão 10 — tolerância de Rateio restrita ao arredondamento da menor unidade monetária): qualquer tipo físico escolhido para campos de `valor`/`valor_aplicado`/`valor_rateado` precisa garantir exatidão decimal exata, nunca ponto flutuante — restrição já implícita na Decisão 10, não uma escolha nova desta etapa.

---

*Próximo passo da Fase 3, quando autorizado: seguir para a etapa seguinte de modelagem física (escolha de SGBD e tradução deste modelo lógico em schema físico), condicionada às pendências B1/B3/B4 listadas acima.*
