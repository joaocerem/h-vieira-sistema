# H_VIEIRA_Arquitetura_Definitiva.md
## Arquitetura Conceitual Definitiva — Sistema Financeiro/Gerencial H Vieira Terraplanagem

**Este documento substitui integralmente todas as versões anteriores** (Relatório de Engenharia Reversa das planilhas continua válido como material de origem/contexto histórico; Modelo Conceitual, Arquitetura Revisada com IA, Etapa 4 — Auditoria Crítica e `H_VIEIRA_Arquitetura_Consolidada.md` estão todos superados por este). Onde qualquer conteúdo anterior divergir do que está aqui, **este documento prevalece**.

**Escopo desta etapa**: modelo de negócio, entidades, relacionamentos, regras e arquitetura conceitual da camada de IA. **Nenhuma decisão de banco de dados físico, SQL, código, API, framework ou tela foi tomada.**

**Nota de consolidação** (única simplificação estrutural introduzida nesta versão, registrada aqui para transparência, sem repetir processo de auditoria): as entidades antes tratadas como `PAGAMENTO` e `RECEBIMENTO` foram unificadas em uma única entidade, `LIQUIDAÇÃO_FINANCEIRA` (com campo `tipo` = Pagamento/Recebimento) — o mesmo padrão já usado para unificar Despesa/Receita em `LANÇAMENTO_FINANCEIRO`. Nenhuma regra de negócio muda; é só remoção de uma duplicação de entidade que fazia exatamente a mesma coisa para dois tipos de fluxo (saída/entrada de dinheiro).

---

## ÍNDICE

1. Princípios da arquitetura
2. Eventos financeiros: a cadeia central
3. Entidades (catálogo completo)
4. Relacionamentos (visão consolidada)
5. Regras de negócio vigentes
6. Módulo de Conciliação Bancária
7. Módulo de Cartão de Crédito
8. Módulo de Obras, Frota e Rateio
9. Ajuste Financeiro
10. Módulo de Financiamentos e Consórcios
11. Camada de Inteligência Artificial
12. Auditoria
13. Responsabilidade dos módulos
14. Exemplos ilustrativos (não duplicação)
15. Matriz de validação — cenários A a R
16. Pendências para decisão posterior
17. Mapa de origem — das planilhas antigas às entidades novas
18. CHECKLIST PARA MIGRAÇÃO AO CLAUDE CODE

---

## 1. PRINCÍPIOS DA ARQUITETURA

1. **Registrar o fato uma vez, analisar de várias formas.** Todo fato financeiro da terraplanagem nasce em `LANÇAMENTO_FINANCEIRO`. Financeiro, Balanço, Obra, Frota e IA leem esse mesmo dado — nenhum mantém cópia própria.
2. **Obrigação, liquidação e fato bancário são três naturezas diferentes de registro**, com ciclos de vida próprios: `LANÇAMENTO_FINANCEIRO` (o que se deve ou se tem direito a receber) → `LIQUIDAÇÃO_FINANCEIRA` (o evento de decidir/executar o pagamento ou recebimento) → `MOVIMENTAÇÃO_BANCÁRIA` (o que de fato aconteceu no banco). Nenhuma dessas três é substituta das outras.
3. **A conta bancária pode conter dinheiro que não é da terraplanagem.** Toda movimentação existe na Conciliação, sem exceção; uma dimensão de `classificação` determina o que participa das análises operacionais.
4. **Transferência entre contas próprias nunca é receita nem despesa.**
5. **Nada desaparece.** Não classificado, cancelado, retirada do patrão, compra fora da operação — tudo continua visível, nunca é apagado ou sobrescrito.
6. **Rateio e Ajuste são camadas de análise sobre um fato já existente, nunca duplicações do valor original.**
7. **Uma despesa pode ter Obra e/ou Veículo simultaneamente, sem duplicar registro.**
8. **Todo indicador (saldo, custo de obra, custo de veículo, resultado, custo líquido) é calculado em tempo de consulta a partir dos registros-fonte — nunca armazenado como número fixo editável.**
9. **A IA nunca é fonte de verdade.** Ela consulta por ferramentas controladas, nunca por acesso direto ao banco; toda sugestão ou ação proposta fica pendente até confirmação humana; ações que movimentam dinheiro exigem confirmação reforçada.
10. **Toda alteração relevante é auditável por campo**, com origem, usuário, data e — quando aplicável — se houve mediação de IA.

---

## 2. EVENTOS FINANCEIROS: A CADEIA CENTRAL

```
LANÇAMENTO_FINANCEIRO
   (obrigação/direito da terraplanagem — categoria, obra, veículo, valor)
        │
        ▼  quando liquidado, via N:N
LIQUIDAÇÃO_FINANCEIRA  (Pagamento ou Recebimento — escolhe a conta bancária)
        │
        ▼  a ligação é feita por
APLICAÇÃO_DE_LIQUIDAÇÃO  (quanto de qual Lançamento foi coberto por qual Liquidação)
        │
        ▼  a Liquidação, separadamente, gera ou é conferida com
MOVIMENTAÇÃO_BANCÁRIA  (fato puro do extrato — existe para 100% do banco, com ou sem
                          relação com a terraplanagem)
        │
        ▼
VÍNCULO_CONCILIAÇÃO  (estado da conferência entre banco e financeiro)
```

**Onde cada módulo lê seus números**:

- **Financeiro** (contas a pagar/receber) lê `LANÇAMENTO_FINANCEIRO`, todos os status.
- **Balanço Realizado** lê `LANÇAMENTO_FINANCEIRO` pela fração já coberta por `APLICAÇÃO_DE_LIQUIDAÇÃO`.
- **Balanço Projetado** lê `LANÇAMENTO_FINANCEIRO` por completo (Aberto + Parcial + Pago, exceto Cancelado).
- **Conciliação** lê `MOVIMENTAÇÃO_BANCÁRIA`, sempre 100% dela, com sua `classificação`.
- **Nenhum desses três lê os outros diretamente** — a ponte entre Financeiro/Balanço e Conciliação é sempre `LIQUIDAÇÃO_FINANCEIRA` + `APLICAÇÃO_DE_LIQUIDAÇÃO` + `VÍNCULO_CONCILIAÇÃO`.

**Status de `LANÇAMENTO_FINANCEIRO` é sempre calculado, nunca digitado**, a partir da soma de `APLICAÇÃO_DE_LIQUIDAÇÃO.valor_aplicado` comparada ao `valor` do Lançamento:

| Soma das aplicações | Status |
|---|---|
| 0 | Aberto |
| Entre 0 e o valor total | Parcialmente Pago / Parcialmente Recebido |
| Igual ao valor total | Pago / Recebido |
| — (estado independente, definido por ação do usuário) | Cancelado |

---

## 3. ENTIDADES (catálogo completo)

| Entidade | Finalidade | Campos principais | Relaciona-se com | Quem cria/altera | Não representa |
|---|---|---|---|---|---|
| **EMPRESA** | Unidade do grupo (H Vieira, Helierti, CV, CD, Camila, Celso) | nome, tipo | Conta Bancária, Cartão, Veículo, Contrato Financeiro | Cadastro manual | Sócio/pessoa física, até confirmação (pendência 1) |
| **CONTA_BANCÁRIA** | Conta de uma Empresa | empresa_id, banco, apelido | Empresa, Movimentação Bancária, Cartão, Liquidação Financeira | Cadastro manual | Saldo fixo — saldo é sempre calculado a partir da Movimentação Bancária |
| **TRANSFERÊNCIA_INTERNA** | Vincula duas Movimentações Bancárias que são, juntas, uma transferência entre contas próprias | movimentação_origem_id, movimentação_destino_id, valor, data | Movimentação Bancária (x2) | Usuário, ou sugestão determinística por valor+data | Receita ou despesa |
| **FORNECEDOR** | Cadastro único de cada credor | nome | Lançamento Financeiro, Compra Cartão | Cadastro manual (ou ao digitar pela 1ª vez) | Cliente |
| **CLIENTE** | Cadastro único de cada cliente da terraplanagem | nome | Obra | Cadastro manual | Fornecedor |
| **CATEGORIA** | Natureza do gasto/receita (Combustível, Manutenção etc.) | nome, tipo | Lançamento Financeiro, Compra Cartão | Cadastro manual | Classificação operacional — dimensão independente |
| **OBRA** | Contrato/projeto de terraplanagem | nome, cliente_id, valor_contratado, data_início, data_prevista_término, data_real_término, status | Cliente, Lançamento Financeiro, Rateio Despesa | Cadastro manual | Centro de custo genérico obrigatório — despesa geral não precisa de obra |
| **VEÍCULO** | Bem da frota | nome/identificação, tipo, empresa_id | Lançamento Financeiro, Compra Cartão, Contrato Financeiro | Cadastro manual | Uma obra — dimensão independente, coexiste com obra no mesmo lançamento |
| **LANÇAMENTO_FINANCEIRO** | O fato econômico da terraplanagem, do nascimento (obrigação) ao status final (liquidado) | tipo (Despesa/Receita), categoria_id, fornecedor_id ou cliente_id, obra_id (opcional), veiculo_id (opcional), valor, data_competência, vencimento, status (calculado), origem | Categoria, Fornecedor/Cliente, Obra, Veículo, Rateio Despesa, Aplicação de Liquidação, Ajuste Financeiro, Parcela (opcional) | Manual; Cartão (via Parcela); Contrato Financeiro (via Parcela); Ação de IA confirmada | Movimentação bancária — nunca é o fato bancário em si |
| **LIQUIDAÇÃO_FINANCEIRA** | Evento de decisão/execução do pagamento ou recebimento de um ou mais Lançamentos | tipo (Pagamento/Recebimento), data_efetiva, valor, conta_bancária_id | Conta Bancária, Aplicação de Liquidação, Vínculo Conciliação | Usuário, ou Ação de IA confirmada (nível Alto) | O Lançamento em si — é um evento sobre ele |
| **APLICAÇÃO_DE_LIQUIDAÇÃO** | Liga N Lançamentos a N Liquidações, com o valor exato de cada combinação | lançamento_financeiro_id, liquidação_financeira_id, valor_aplicado | Lançamento Financeiro, Liquidação Financeira | Sistema, no momento do registro da liquidação | Um novo valor — é a distribuição do valor já existente |
| **MOVIMENTAÇÃO_BANCÁRIA** | Fato puro do extrato — existe para 100% do que passa pela conta | conta_bancária_id, data, descrição, valor, classificação | Conta Bancária, Vínculo Conciliação, Transferência Interna | Importação de extrato, ou gerada ao registrar uma Liquidação | Uma obrigação da terraplanagem |
| **VÍNCULO_CONCILIAÇÃO** | Estado da conferência entre uma Movimentação Bancária e uma Liquidação Financeira | movimentação_bancária_id, liquidação_financeira_id (nulo se Sem Correspondência), estado_conciliação | Movimentação Bancária, Liquidação Financeira | Sistema (regra determinística), usuário, ou (futuro) IA | Classificação — dimensão independente |
| **CARTÃO_CRÉDITO** | Cartão de crédito da empresa | conta_bancária_id, banco, apelido, dia_fechamento, dia_vencimento | Conta Bancária, Compra Cartão, Fatura | Cadastro manual | Uma conta bancária — é vinculado a uma, mas é entidade própria |
| **COMPRA_CARTÃO** | Cada compra feita no cartão | cartão_id, fornecedor_id, valor, data, categoria_id, classificação, obra_id (opcional), veiculo_id (opcional), nº parcelas | Cartão de Crédito, Parcela, Fatura | Digitação manual, ou futura importação de fatura | Um Lançamento Financeiro em si — só gera um (por Parcela) se classificação = Terraplanagem |
| **FATURA** | Agrupador de cobrança de um ciclo do cartão | cartão_id, ciclo, valor_total_calculado, valor_cobrado | Cartão de Crédito, Compra Cartão (via Parcela), Liquidação Financeira | Sistema calcula total; usuário confirma valor cobrado | Uma despesa financeira única — nunca gera Lançamento sozinha |
| **RATEIO_DESPESA** | Distribuição manual de uma Despesa entre várias Obras | lançamento_financeiro_id, obra_id, valor_rateado, critério_informado | Lançamento Financeiro, Obra | Usuário (manual, por definição) | Uma segunda despesa — o valor original nunca muda |
| **CONTRATO_FINANCEIRO** | Financiamento ou Consórcio (mesma estrutura, campo `tipo` diferencia) | tipo, empresa_id, conta_bancária_id, instituição, valor_contratado, taxa (financiamento) / grupo-cota (consórcio), contemplado (consórcio) | Empresa, Conta Bancária, Parcela, Veículo (opcional) | Cadastro manual | Um Lançamento Financeiro — só gera um por Parcela, ao vencer |
| **PARCELA** | Parcela individual, reutilizada por Compra de Cartão e Contrato Financeiro | origem (compra_cartão/contrato_financeiro), número, total, valor, vencimento, status | Compra Cartão (opcional), Contrato Financeiro (opcional), Lançamento Financeiro (1:1 quando vence) | Sistema, ao calcular o parcelamento | Um Lançamento por si só |
| **AJUSTE_FINANCEIRO** | Vínculo formal entre um Lançamento original e um Lançamento de estorno/reembolso/crédito | lançamento_original_id, lançamento_ajuste_id, tipo_ajuste (Estorno/Reembolso/Crédito/Ajuste), valor, data, usuário_id, observação | Lançamento Financeiro (x2) | Usuário | Uma alteração do lançamento original — ele nunca é tocado |
| **SUGESTÃO_IA** | Proposta de classificação (categoria, classificação operacional, obra, veículo) feita pela IA, pendente de confirmação | entidade_alvo, campo_sugerido, valor_sugerido, justificativa, status, grupo_sugestão_id (opcional, só apresentação) | Movimentação Bancária ou Lançamento Financeiro (alvo), Usuário | IA propõe; usuário confirma/edita/rejeita | O dado real — só vira dado real após confirmação |
| **AÇÃO_PROPOSTA_IA** | Proposta de criação/alteração de registro feita pela IA, pendente de confirmação | tipo_ação, dados_propostos, nível_sensibilidade, status | Usuário, registro real gerado (após confirmação) | IA propõe; usuário confirma/edita/rejeita | Uma ação já executada |
| **LOG_AUDITORIA** | Histórico granular (por campo) de alteração de qualquer entidade financeira relevante | entidade, id, campo_alterado, valor_anterior, valor_novo, data/hora, usuário, origem, referência a Sugestão/Ação de IA | Qualquer entidade financeira (relacionamento genérico — decisão técnica posterior) | Sistema, automaticamente | Um resumo — precisa ser por campo |

---

## 4. RELACIONAMENTOS (visão consolidada)

**Cadeia financeira central:**
```
LANÇAMENTO_FINANCEIRO ──N:N──> LIQUIDAÇÃO_FINANCEIRA
        (a ligação, com o valor exato de cada combinação, é feita por:)
              APLICAÇÃO_DE_LIQUIDAÇÃO

LIQUIDAÇÃO_FINANCEIRA ──1:1──> MOVIMENTAÇÃO_BANCÁRIA ──1:1──> VÍNCULO_CONCILIAÇÃO
```

**Cadeia de cartão:**
```
CARTÃO_CRÉDITO ──1:N──> COMPRA_CARTÃO ──1:N──> PARCELA
                                                   │
                          (só se classificação = Terraplanagem)
                                                   ▼
                                        LANÇAMENTO_FINANCEIRO

CARTÃO_CRÉDITO ──1:N──> FATURA ──1:N──> (Parcelas do ciclo, geradoras de Lançamento ou não)
FATURA ──1:1──> LIQUIDAÇÃO_FINANCEIRA (paga o valor total cobrado; cobre, via
                 APLICAÇÃO_DE_LIQUIDAÇÃO, só os Lançamentos nascidos de Parcelas
                 Terraplanagem daquele ciclo)
```

**Cadeia de ajuste:**
```
LANÇAMENTO_FINANCEIRO (original) ──1:N──> AJUSTE_FINANCEIRO ──1:1──> LANÇAMENTO_FINANCEIRO (de ajuste)
```

**Cadeia de obra e rateio:**
```
OBRA ──1:N──> LANÇAMENTO_FINANCEIRO (direto, obra_id preenchido)
OBRA ──1:N──> RATEIO_DESPESA ──N:1──> LANÇAMENTO_FINANCEIRO (rateado, obra_id nulo no lançamento)
```

**Cadeia de veículo (independente e simultânea à de obra):**
```
VEÍCULO ──1:N──> LANÇAMENTO_FINANCEIRO (veiculo_id preenchido, pode coexistir com obra_id)
```

**Cadeia de IA:**
```
USUÁRIO ──> IA ──> FERRAMENTAS DE CONSULTA ──> (lê LANÇAMENTO_FINANCEIRO e demais fontes-oficiais) ──> IA ──> RESPOSTA
IA ──> SUGESTÃO_IA / AÇÃO_PROPOSTA_IA (pendente) ──> confirmação humana ──> dado real + LOG_AUDITORIA
```

---

## 5. REGRAS DE NEGÓCIO VIGENTES

*(Somente as regras finais — nenhuma regra revogada aparece abaixo.)*

1. Base de dados única; cada fato relevante cadastrado uma única vez.
2. Movimentação bancária reflete 100% do extrato, sem exclusão de itens não-operacionais.
3. Toda Movimentação Bancária (e toda Compra de Cartão) recebe uma `classificação`: Terraplanagem, Fora da Operação, Transferência Interna, Retirada do Patrão, ou Não Classificada.
4. Não há detalhamento de subtipos de "fora da operação" (roça, pessoal etc.).
5. Transferência entre contas próprias nunca gera Lançamento Financeiro.
6. Retiradas do patrão continuam registradas e visíveis, sem virar despesa operacional.
7. Movimentações não classificadas permanecem visíveis e identificáveis.
8. Conciliação mostra 100% do banco; Balanço mostra o que foi classificado Terraplanagem — a segunda é sempre um filtro conceitual sobre `LANÇAMENTO_FINANCEIRO`, nunca uma segunda base de dados nem uma leitura direta de Movimentação Bancária.
9. Balanço Realizado e Projetado coexistem sem duplicar dados (Seção 2).
10. Uma obrigação (conta a pagar/receber) existe independentemente de já haver Movimentação Bancária.
11. A conta bancária de liquidação não é exigida no cadastro da obrigação, só no momento da Liquidação.
12. Obra tem nome, cliente, valor contratado, datas (início, término previsto, término real) e status.
13. Uma obra pode ter várias receitas ao longo do tempo.
14. Uma despesa pode ser atribuída diretamente a uma obra, ou rateada entre várias, sem alterar o valor original.
15. Rateio é manual; a soma dos valores rateados deve ser compatível com o valor do lançamento (tolerância exata a definir — pendência).
16. Nem toda despesa precisa pertencer a uma obra.
17. Uma despesa de frota é o mesmo Lançamento Financeiro de qualquer outra, com veículo identificado.
18. Uma despesa pode ter Obra e Veículo simultaneamente, sem duplicação.
19. Custo de máquina por hora é funcionalidade futura, fora do núcleo.
20. Lucro por Obra é uma visão (receita − custo direto − custo rateado), não uma base independente.
21. **Receita pode existir sem obra** (ex. venda de sucata) — `obra_id` é opcional para Despesa e para Receita, simetricamente.
22. **Consultas de gasto por fornecedor consideram apenas o que foi classificado Terraplanagem** (ou seja, apenas o que gerou `LANÇAMENTO_FINANCEIRO`) — gastos Fora da Operação, Retirada do Patrão ou Transferência Interna nunca entram nessa soma.
23. **Estornos, reembolsos e créditos são formalizados via `AJUSTE_FINANCEIRO`**, vinculando o Lançamento original a um novo Lançamento — o original nunca é alterado; "custo líquido" é sempre calculado em consulta.
24. A arquitetura prevê integração futura com IA de mercado via API, sem construir modelo próprio.
25. A IA responde perguntas em linguagem natural consultando por meio de ferramentas específicas, nunca por acesso irrestrito ao banco.
26. A IA pode sugerir classificações, mas nunca grava diretamente — toda sugestão fica pendente até confirmação humana.
27. A IA pode propor criação de registros a partir de linguagem natural, nunca executa sem confirmação explícita.
28. Ações financeiras sensíveis (liquidação real) propostas pela IA exigem barreira de confirmação reforçada.
29. **`categoria` e `classificação` são dimensões independentes** — a IA nunca assume uma a partir da outra; se as duas mudanças forem necessárias, são duas sugestões distintas, que podem ser agrupadas só visualmente (`grupo_sugestão_id`).
30. A IA nunca é fonte de verdade; nunca inventa causa para variações financeiras sem dado que a sustente; informa explicitamente quando não há dado suficiente.
31. Toda alteração relevante é registrada em `LOG_AUDITORIA`, por campo, com origem, usuário e data.

---

## 6. MÓDULO DE CONCILIAÇÃO BANCÁRIA

Dois conceitos independentes, nunca fundidos:

| Dimensão | Responde | Valores | Onde vive |
|---|---|---|---|
| `classificação` | De quem é esse dinheiro? | Terraplanagem / Fora da Operação / Transferência Interna / Retirada do Patrão / Não Classificada | `MOVIMENTAÇÃO_BANCÁRIA`, `COMPRA_CARTÃO` |
| `estado_conciliação` | Essa movimentação já foi conferida contra o financeiro? | Não Vinculado / Sugerido / Confirmado / Divergente / Sem Correspondência | `VÍNCULO_CONCILIAÇÃO` |

O `VÍNCULO_CONCILIAÇÃO` liga uma `MOVIMENTAÇÃO_BANCÁRIA` a uma `LIQUIDAÇÃO_FINANCEIRA`. Uma sugestão de vínculo pode vir de regra determinística (valor + data) ou, futuramente, de IA — mas **nunca é confundida com `SUGESTÃO_IA`**, que trata exclusivamente de classificação/categoria/obra/veículo. Divergência de valor nunca é conciliada automaticamente — sempre fica para revisão humana.

---

## 7. MÓDULO DE CARTÃO DE CRÉDITO

A `FATURA` **não é uma despesa financeira única** — é um agrupador de cobrança. Cada `COMPRA_CARTÃO` preserva individualmente fornecedor, valor, data, categoria, classificação, obra (quando houver) e veículo (quando houver). Uma compra classificada Terraplanagem gera, via `PARCELA`, um `LANÇAMENTO_FINANCEIRO` próprio por parcela; uma compra Fora da Operação nunca gera Lançamento, mas continua registrada para que o valor da fatura bata com o extrato.

Quando a Fatura é paga, nasce uma `LIQUIDAÇÃO_FINANCEIRA` pelo valor total cobrado, que aplica (via `APLICAÇÃO_DE_LIQUIDAÇÃO`) apenas aos Lançamentos nascidos de compras Terraplanagem daquele ciclo — a diferença entre o valor total pago e o valor total aplicado corresponde exatamente às compras não-operacionais daquela fatura, e é uma diferença explicável, não uma divergência de conciliação.

---

## 8. MÓDULO DE OBRAS, FROTA E RATEIO

- **Obra**: entidade própria (nome, cliente, valor contratado, datas, status). Recebe Receitas e Despesas via `obra_id` direto, ou via `RATEIO_DESPESA` quando a despesa é compartilhada com outras Obras.
- **Frota**: `VEÍCULO` recebe despesas via `veiculo_id`, agregadas por categoria e período.
- **Veículo + Obra simultâneos**: um único `LANÇAMENTO_FINANCEIRO` pode ter `obra_id` e `veiculo_id` preenchidos ao mesmo tempo — aparece no custo de ambos, sem duplicação, porque cada consulta (Obra, Frota) simplesmente filtra pelo campo correspondente sobre a mesma linha.
- **Rateio × atribuição direta são mutuamente exclusivos** no mesmo Lançamento: ou o valor vai inteiro para uma Obra (`obra_id` direto), ou é dividido via `RATEIO_DESPESA` (nesse caso `obra_id` do Lançamento fica nulo) — nunca as duas formas ao mesmo tempo, para não contar valor em dobro.
- **Lucro por Obra** = Receita da obra (direta) − custo direto (Lançamentos com obra_id) − custo rateado (soma de `RATEIO_DESPESA`) ± ajustes vinculados (`AJUSTE_FINANCEIRO`) — sempre calculado, nunca armazenado.

---

## 9. AJUSTE FINANCEIRO

`AJUSTE_FINANCEIRO` vincula formalmente um `LANÇAMENTO_FINANCEIRO` original a um novo `LANÇAMENTO_FINANCEIRO` de estorno, reembolso, crédito ou ajuste (os quatro convivem como valores de `tipo_ajuste`, sem diferença estrutural entre eles). O Lançamento de ajuste segue o fluxo normal (Receita → Liquidação → Movimentação Bancária → Conciliação, possivelmente em conta bancária diferente da original). O Lançamento original **nunca é alterado nem apagado**. O "custo efetivo" (valor original menos ajustes vinculados) é sempre uma soma calculada em consulta — nunca um número armazenado — preservando a Fonte Única da Verdade e o princípio "nada desaparece".

---

## 10. MÓDULO DE FINANCIAMENTOS E CONSÓRCIOS

`CONTRATO_FINANCEIRO` generaliza Financiamento e Consórcio (campo `tipo` diferencia), cada um com suas `PARCELA` — ao vencer, cada Parcela gera um `LANÇAMENTO_FINANCEIRO` (categoria "Amortização Empréstimo"/"Consórcios"), seguindo o fluxo normal de liquidação. Consórcio contemplado pode vincular-se a um `VEÍCULO` — hoje, texto livre nas planilhas antigas; formalizado como relacionamento no sistema novo.

---

## 11. CAMADA DE INTELIGÊNCIA ARTIFICIAL

```
USUÁRIO → IA (modelo de mercado via API) → FERRAMENTAS DO SISTEMA → BANCO DE DADOS
                                          ← resultado estruturado ←
                                          IA interpreta e responde → USUÁRIO
```

- A IA nunca acessa o banco de dados diretamente — só ferramentas expostas pelo sistema.
- **Ferramentas de consulta** (catálogo conceitual): buscar pagamentos/recebimentos, despesas, receitas; custo de obra; custo de veículo; comparar fornecedores; contas a pagar/receber em aberto; movimentações não classificadas; saldo a receber de obra; saldo devedor de financiamento/consórcio; ranking de fornecedores; maiores despesas por período; comparação de custo entre obras/períodos. Todas leem `LANÇAMENTO_FINANCEIRO` e dimensões relacionadas — nunca `MOVIMENTAÇÃO_BANCÁRIA` diretamente para números de Balanço/Obra/Frota.
- **Sugestão de classificação** (`SUGESTÃO_IA`): a IA nunca funde `categoria` e `classificação` numa única suposição. Se o usuário disser "classifique como combustível", a IA propõe `categoria=Combustível`; se a `classificação` operacional já é Terraplanagem, apenas confirma isso junto; se está Não Classificada, pergunta separadamente se deve também virar Terraplanagem — nunca assume.
- **Ação proposta** (`AÇÃO_PROPOSTA_IA`): toda criação/alteração de registro por comando em linguagem natural fica pendente até confirmação explícita, com dados estruturados visíveis antes de gravar.
- **Níveis de confirmação**: Baixo (sugestão de classificação, um clique) → Médio (criar/alterar obrigação, revisão explícita) → Alto (qualquer ação que gere ou confirme uma Liquidação real — mecanismo exato de barreira extra é decisão técnica posterior).
- **Limites permanentes**: a IA nunca escreve direto em campo financeiro; nunca inventa valores; nunca executa Liquidação sem barreira Alta; nunca tem acesso a consulta livre; nunca afirma causa de uma variação sem dado que a sustente; informa quando não há dado suficiente.

---

## 12. AUDITORIA

`LOG_AUDITORIA` é granular por campo: entidade, id, campo alterado, valor anterior, valor novo, data/hora, usuário responsável, origem (Manual / Importação Bancária / Sugestão de IA Confirmada / Ação de IA Confirmada), referência à Sugestão/Ação de IA de origem quando aplicável — incluindo a criação de `AJUSTE_FINANCEIRO`. Isso permite reconstruir, para qualquer dado, quem alterou, quando, o valor anterior, se a origem foi humana ou mediada por IA, e quem confirmou.

---

## 13. RESPONSABILIDADE DOS MÓDULOS

| Módulo | Lê de | Escreve em | Nunca escreve em |
|---|---|---|---|
| Financeiro | `LANÇAMENTO_FINANCEIRO`, `RATEIO_DESPESA`, `AJUSTE_FINANCEIRO` | `LANÇAMENTO_FINANCEIRO`, `LIQUIDAÇÃO_FINANCEIRA`, `APLICAÇÃO_DE_LIQUIDAÇÃO`, `RATEIO_DESPESA`, `AJUSTE_FINANCEIRO` | — |
| Balanço | `LANÇAMENTO_FINANCEIRO` | — (só leitura) | `MOVIMENTAÇÃO_BANCÁRIA` diretamente |
| Conciliação | `MOVIMENTAÇÃO_BANCÁRIA`, `VÍNCULO_CONCILIAÇÃO` | `VÍNCULO_CONCILIAÇÃO`, classificação de `MOVIMENTAÇÃO_BANCÁRIA` | `LANÇAMENTO_FINANCEIRO` |
| Banco (importação) | — | `MOVIMENTAÇÃO_BANCÁRIA` | `LANÇAMENTO_FINANCEIRO` diretamente |
| Cartões | `CARTÃO_CRÉDITO`, `COMPRA_CARTÃO`, `PARCELA`, `FATURA` | `COMPRA_CARTÃO`, `PARCELA`, `FATURA`; dispara `LANÇAMENTO_FINANCEIRO` quando Parcela é Terraplanagem | — |
| Obras | `LANÇAMENTO_FINANCEIRO`, `RATEIO_DESPESA`, `AJUSTE_FINANCEIRO` | Só cadastro de `OBRA` | `LANÇAMENTO_FINANCEIRO` (custo é sempre lido) |
| Frota | `LANÇAMENTO_FINANCEIRO` | Só cadastro de `VEÍCULO` | `LANÇAMENTO_FINANCEIRO` |
| IA | Só via ferramentas de consulta | `SUGESTÃO_IA`, `AÇÃO_PROPOSTA_IA` (nunca o dado real diretamente) | Qualquer entidade financeira diretamente |
| Auditoria | `LOG_AUDITORIA` | Escrito automaticamente por todos os módulos acima | — |

**Regra geral**: só Financeiro e Cartões escrevem em `LANÇAMENTO_FINANCEIRO`. Balanço, Obras e Frota são estritamente leitura.

---

## 14. EXEMPLOS ILUSTRATIVOS (não duplicação)

**Caso simples** — Combustível R$5.000 para a Obra X, pago depois: nasce 1 `LANÇAMENTO_FINANCEIRO` (R$5.000). A liquidação cria 1 `LIQUIDAÇÃO_FINANCEIRA` + 1 `APLICAÇÃO_DE_LIQUIDAÇÃO` (mesmo R$5.000, não um novo valor) + 1 `MOVIMENTAÇÃO_BANCÁRIA` (mesmo R$5.000) + 1 `VÍNCULO_CONCILIAÇÃO`. Balanço, Obra e (se houvesse veículo) Frota leem a mesma linha de `LANÇAMENTO_FINANCEIRO` — R$5.000 armazenados uma única vez, lidos em três visões diferentes.

**Caso composto** — Fatura de cartão R$30.000 (Compra A R$5k→Obra X Terraplanagem, B R$10k→Obra Y Terraplanagem, C R$3k→Veículo Terraplanagem, D R$12k→Fora da Operação): a Fatura registra R$30.000 (bate com o banco); nascem 3 Lançamentos somando R$18.000 (A+B+C); a Liquidação da fatura é de R$30.000 (bate com a Movimentação Bancária); as Aplicações de Liquidação somam R$18.000 — a diferença de R$12.000 corresponde exatamente à compra D, que nunca teve Lançamento. Balanço soma R$18.000; Obra X soma R$5.000; Obra Y soma R$10.000; Frota soma R$3.000. Nenhum valor duplicado, nenhum valor perdido.

---

## 15. MATRIZ DE VALIDAÇÃO — CENÁRIOS A A R

| # | Cenário | Suportado | Entidade(s) principal(is) | Ressalva |
|---|---|---|---|---|
| A | Conta a pagar futura | ✅ | Lançamento Financeiro (status Aberto) | — |
| B | Pagamento parcial | ✅ | Lançamento, Liquidação, Aplicação de Liquidação (status calculado) | — |
| C | Reembolso em conta diferente | ✅ | Lançamento (x2), Ajuste Financeiro | Custo líquido sempre calculado |
| D | Compra de cartão ligada a obra, fatura paga depois | ✅ | Compra Cartão, Parcela, Lançamento, Fatura | — |
| E | Fatura mista (obras + frota + fora da operação) | ✅ | Compra Cartão (classificação por compra), Lançamento, Fatura, Aplicação de Liquidação | — |
| F | Transferência entre contas | ✅ | Transferência Interna, Movimentação Bancária | — |
| G | Retirada do patrão | ✅ | Movimentação Bancária (classificação) | Formato de relatório específico — pendência não bloqueante |
| H | Despesa fora da operação | ✅ | Movimentação Bancária (classificação) | — |
| I | Despesa não classificada | ✅ | Movimentação Bancária (classificação) | — |
| J | Despesa direta a obra | ✅ | Lançamento Financeiro (obra_id) | — |
| K | Despesa compartilhada (rateio) | ✅ | Lançamento, Rateio Despesa | Tolerância de soma — pendência |
| L | Despesa com veículo e obra | ✅ | Lançamento Financeiro (obra_id + veiculo_id) | — |
| M | Despesa de veículo sem obra | ✅ | Lançamento Financeiro (veiculo_id, obra_id nulo) | — |
| N | Receita de obra | ✅ | Lançamento, Liquidação (Recebimento) | — |
| O | Receita sem obra | ✅ | Lançamento Financeiro (obra_id nulo) | — |
| P | Recebimento parcial | ✅ | Lançamento, Liquidação, Aplicação de Liquidação | — |
| Q | Conta cancelada | ✅ | Lançamento Financeiro (status Cancelado) | Cancelamento com aplicação já existente — pendência 14 |
| R | Mesmo fornecedor em obra/frota/fora da operação | ✅ | Fornecedor, Lançamento Financeiro | Escopo Terraplanagem-only é regra oficial (regra 22) |

---

## 16. PENDÊNCIAS PARA DECISÃO POSTERIOR

Nenhuma bloqueia o início do desenho técnico — todas são parâmetros de negócio ou decisões técnicas que o modelo já suporta em qualquer resposta possível.

| # | Questão | Tipo | Bloqueante? |
|---|---|---|---|
| 1 | Natureza jurídica das 6 "empresas" do grupo | Regra de negócio | Não |
| 2 | Tolerância de dias no matching automático de conciliação | Parâmetro de negócio | Não |
| 3 | Retirada do Patrão — identificar qual sócio, se houver mais de um | Regra de negócio | Não |
| 4 | Separar Categoria em "natureza do gasto" × "sub-conta interna" | Regra de negócio | Não |
| 5 | Usuários e níveis de permissão | Decisão técnica/negócio | Não |
| 6 | Financiamento/Consórcio: manter `CONTRATO_FINANCEIRO` único ou separar | Organização do modelo (não muda lógica) | Não |
| 7 | Tolerância de soma do Rateio | Parâmetro de negócio | Não |
| 8 | Rateio pode ficar parcialmente pendente | Regra de negócio | Não |
| 9 | Alocação de veículo a obra sem despesa ainda | Funcionalidade futura | Não |
| 10 | Rejeição de sugestão de IA alimentar aprendizado futuro | Funcionalidade futura | Não |
| 11 | Ordem de implementação da IA (leitura → sugestão → ação, ou junto) | Decisão de produto | Não |
| 12 | Mecanismo exato da barreira "Alto" para ações financeiras da IA | Decisão técnica | Não |
| 13 | Implementação do vínculo genérico de `LOG_AUDITORIA`/`SUGESTÃO_IA`/`AÇÃO_PROPOSTA_IA`/`AJUSTE_FINANCEIRO` | Decisão técnica | Não |
| 14 | Cancelamento de Lançamento com Aplicação de Liquidação já existente — estornar, cancelar só o restante, ou bloquear | Regra de negócio | Não, mas necessária antes do desenho de telas de cancelamento |

---

## 17. MAPA DE ORIGEM — DAS PLANILHAS ANTIGAS ÀS ENTIDADES NOVAS

| Planilha antiga | Entidade(s) nova(s) correspondente(s) |
|---|---|
| CONCILIAÇÃO_BANCÁRIA (livro-razão manual) | `CONTA_BANCÁRIA`, `MOVIMENTAÇÃO_BANCÁRIA`, `TRANSFERÊNCIA_INTERNA`, `VÍNCULO_CONCILIAÇÃO` |
| AGENDA_2026 (Programação/Pagos) | `LANÇAMENTO_FINANCEIRO` (status Aberto → Pago), `LIQUIDAÇÃO_FINANCEIRA` |
| CONTAS_A_PAGAR_RECEBER (fotografia diária) | Consulta em tempo real sobre `LANÇAMENTO_FINANCEIRO` + `CONTA_BANCÁRIA` — deixa de existir como planilha própria |
| CONCILIAÇÃO_CARTÃO (Sicredi/B.Brasil) | `CARTÃO_CRÉDITO`, `COMPRA_CARTÃO`, `PARCELA`, `FATURA` |
| RESUMO_FINANCIAMENTO | `CONTRATO_FINANCEIRO` (tipo=Financiamento), `PARCELA` |
| RESUMO_CONSÓRCIOS | `CONTRATO_FINANCEIRO` (tipo=Consórcio), `PARCELA`, vínculo com `VEÍCULO` quando contemplado |
| BALANÇO_GERENCIAL (Painel/Resumo Anual/Despesa por Categoria/Obras) | Consultas sobre `LANÇAMENTO_FINANCEIRO`, `CATEGORIA`, `OBRA` — sem tabelas próprias |
| Controle de Frota (mencionada, não enviada como arquivo) | Consulta sobre `LANÇAMENTO_FINANCEIRO` filtrada por `veiculo_id` |
| Lucro por Obra (mencionada, não enviada como arquivo) | Consulta sobre `LANÇAMENTO_FINANCEIRO` + `RATEIO_DESPESA` + `AJUSTE_FINANCEIRO`, filtrada por `obra_id` |

---

## 18. CHECKLIST PARA MIGRAÇÃO AO CLAUDE CODE

O que o agente de implementação deve analisar e confirmar **antes de escrever qualquer código, schema ou migration**:

### Leitura obrigatória
- [ ] Ler este documento por completo antes de propor qualquer tabela, classe ou endpoint.
- [ ] Não usar as versões anteriores (`H_VIEIRA_Modelo_Conceitual_Sistema.md`, `H_VIEIRA_Arquitetura_Revisada_com_IA.md`, `H_VIEIRA_Etapa4_Auditoria_Critica.md`, `H_VIEIRA_Arquitetura_Consolidada.md`) como referência de decisão — elas existem só como histórico do raciocínio; este documento é a única fonte de verdade vigente.
- [ ] Ler também `H_VIEIRA_Relatorio_Engenharia_Reversa_Financeiro.md` para contexto de negócio (como a empresa opera hoje), mas não replicar a estrutura das planilhas antigas no sistema novo.

### Antes de desenhar o schema
- [ ] Mapear cada entidade da Seção 3 para uma tabela (ou estrutura equivalente), preservando exatamente os relacionamentos da Seção 4 — nenhuma entidade deve ser fundida ou dividida sem justificar por escrito, seguindo o mesmo padrão de raciocínio já usado neste documento (ex. por que `LIQUIDAÇÃO_FINANCEIRA` é uma entidade só, e não duas).
- [ ] Implementar o `status` de `LANÇAMENTO_FINANCEIRO` como valor **calculado** (view, campo derivado, ou recálculo em toda escrita de `APLICAÇÃO_DE_LIQUIDAÇÃO`) — nunca como campo livremente editável pelo usuário ou pela API.
- [ ] Implementar `LOG_AUDITORIA` com granularidade por campo desde a primeira versão do schema — não adicionar depois como "melhoria futura".
- [ ] Resolver tecnicamente o vínculo genérico de `LOG_AUDITORIA`, `SUGESTÃO_IA`, `AÇÃO_PROPOSTA_IA` e `AJUSTE_FINANCEIRO` com "qualquer entidade financeira" (pendência 13) — escolher entre referência polimórfica, tabelas específicas por entidade-alvo, ou outra abordagem, e documentar a decisão.
- [ ] Não adicionar nenhum campo, tabela ou funcionalidade que não esteja neste documento "por garantia" — se aparecer necessidade nova durante a implementação, ela deve voltar para uma etapa de arquitetura, não ser decidida ad-hoc no código.

### Antes de implementar regras de negócio específicas
- [ ] Confirmar com o usuário (H Vieira) a pendência 14 (cancelamento de lançamento com liquidação já aplicada) antes de implementar a tela/rota de cancelamento.
- [ ] Confirmar as pendências 2, 7 e 8 (tolerâncias de conciliação e rateio) antes de implementar os respectivos motores de validação — não usar um valor padrão arbitrário sem sinalizar que é um placeholder.
- [ ] Confirmar a pendência 1 (natureza jurídica das empresas) antes de implementar o cadastro de `EMPRESA`, caso o campo `tipo` vá determinar comportamento diferente no sistema (ex. relatórios fiscais separados).

### Camada de IA
- [ ] Implementar a IA estritamente como consumidora de ferramentas (function calling / tool use) sobre as consultas da Seção 11 — nunca conceder acesso a query livre (SQL direto) ao modelo de IA.
- [ ] Implementar `SUGESTÃO_IA` e `AÇÃO_PROPOSTA_IA` como estados intermediários reais no banco (não como lógica só na camada de apresentação) — a distinção entre "IA propôs" e "usuário confirmou" precisa sobreviver a uma consulta de auditoria feita meses depois.
- [ ] Implementar os três níveis de confirmação (Baixo/Médio/Alto) como parte do fluxo de aprovação, não como texto de aviso na tela — a ação de nível Alto não deve ser tecnicamente possível de executar sem a barreira reforçada (mecanismo exato: pendência 12).
- [ ] Garantir que nenhuma ferramenta exposta à IA permita, mesmo indiretamente, escrita direta em `LANÇAMENTO_FINANCEIRO`, `LIQUIDAÇÃO_FINANCEIRA` ou `MOVIMENTAÇÃO_BANCÁRIA` sem passar pelos estados de proposta/confirmação.

### Validação antes de considerar a primeira versão pronta
- [ ] Rodar os dois exemplos da Seção 14 (combustível R$5.000 e fatura mista R$30.000) como casos de teste de aceitação — os valores finais em Balanço, Obra e Frota devem bater exatamente com o que está descrito.
- [ ] Validar a Matriz de Cenários A–R (Seção 15) como conjunto de testes funcionais mínimos antes de qualquer entrega.
- [ ] Confirmar que nenhum módulo (Balanço, Obras, Frota) tem, no código, uma consulta direta a `MOVIMENTAÇÃO_BANCÁRIA` — isso violaria a Seção 2 e reintroduziria o problema que a Etapa 4 identificou e corrigiu.

---

## 19. PONTOS DELIBERADAMENTE DEIXADOS PARA A ETAPA TÉCNICA

Itens que **não precisam** ser resolvidos na arquitetura conceitual porque nenhuma escolha entre eles muda o modelo de negócio, as entidades, os relacionamentos ou as regras já fixadas neste documento — são, por natureza, decisões de implementação:

- **Linguagem de programação, framework e ORM.**
- **Banco de dados físico** (relacional ou não, produto específico como PostgreSQL/MySQL etc.).
- **Infraestrutura, hospedagem, deploy, CI/CD.**
- **Design de telas e experiência de usuário (UX/UI).**
- **Provedor de IA específico** (OpenAI, Anthropic, Google etc.) e modelo exato — a arquitetura já exige que seja "um modelo de mercado via API", o que já é suficiente conceitualmente.
- **Mecanismo técnico exato da barreira reforçada de confirmação (nível Alto)** para ações de IA que movimentam dinheiro — a *exigência* de que essa barreira exista está fixada (regra 28); *como* implementá-la (reautenticação, segundo aprovador, outro mecanismo) é escolha técnica.
- **Implementação do vínculo genérico** de `LOG_AUDITORIA`, `SUGESTÃO_IA`, `AÇÃO_PROPOSTA_IA` e `AJUSTE_FINANCEIRO` com "qualquer entidade financeira" — referência polimórfica, tabelas específicas por entidade-alvo, ou outra abordagem; a exigência conceitual (rastreabilidade granular) já está fixada, a técnica de implementação não.
- **Estratégia de cálculo do status de `LANÇAMENTO_FINANCEIRO`** — campo persistido recalculado a cada escrita, view, ou cálculo em tempo real na consulta; a exigência de que seja sempre derivado das aplicações, nunca digitado livremente, já está fixada (Seção 2).
- **Formato e frequência de importação de extrato bancário** (upload manual, Open Finance, API do banco) — quando essa integração futura for implementada; a arquitetura já garante que qualquer formato de entrada resulta em `MOVIMENTAÇÃO_BANCÁRIA`, sem afetar o restante do modelo.
- **Assinatura técnica exata das ferramentas de IA** (nomes de função, formato de parâmetros) — o catálogo conceitual de capacidades (Seção 11) já define o que cada ferramenta deve fazer; como isso é exposto ao modelo de IA é decisão técnica.

Essas decisões pertencem à próxima etapa do projeto, e devem ser tratadas à parte, também com espaço para perguntas antes de fechar cada uma — seguindo o mesmo princípio usado durante toda a modelagem conceitual: nenhuma decisão que afete a estrutura de dados ou o comportamento do sistema deve ser tomada sem confirmação explícita.
