# Revisão de Integridade do Modelo de Domínio
## Sistema Financeiro/Gerencial H Vieira Terraplanagem

**Escopo**: as 24 entidades em `docs/domain-model/`, analisadas como sistema único — não entidade por entidade. Toda a documentação anterior (conceitual, técnica, auditoria, réplica, arbitragem, regras do projeto) foi usada como referência de validação.

**Postura**: nenhum achado abaixo é especulativo — cada um cita o campo, relacionamento ou documento exato de onde vem. Onde não há certeza (interpretação plausível, mas não confirmada por texto), isso é dito explicitamente, sem contar como defeito confirmado.

**Nada foi alterado.** Este documento é só a revisão.

---

## ÍNDICE

1. Consistência do domínio
2. Relacionamentos
3. Campos
4. Integridade do modelo
5. Fluxos
6. Aggregate Roots
7. Limites de agregados
8. Mapa de dependências
9. Ordem natural de implementação
10. Riscos futuros
11. Resumo final

---

## 1. CONSISTÊNCIA DO DOMÍNIO

### 🟢 Padrão positivo identificado (não é achado de problema, é validação)

O modelo reutiliza consistentemente o mesmo padrão para "compartilhar um valor entre múltiplas contrapartes sem duplicá-lo": `APLICAÇÃO_DE_LIQUIDAÇÃO` (Lançamento ↔ Liquidação) e `RATEIO_DESPESA` (Lançamento ↔ Obra) são estruturalmente o mesmo tipo de solução — uma entidade de junção com atributo próprio (`valor_aplicado`/`valor_rateado`). Isso é coerência de design real, não coincidência, e reduz o risco de um padrão divergente aparecer numa implementação futura.

### 🟠 Importante — `LANÇAMENTO_FINANCEIRO` concentra acoplamento estrutural do sistema inteiro

`LANÇAMENTO_FINANCEIRO` se relaciona, direta ou indiretamente, com `CATEGORIA`, `FORNECEDOR`, `CLIENTE`, `OBRA`, `VEÍCULO`, `RATEIO_DESPESA`, `APLICAÇÃO_DE_LIQUIDAÇÃO`, `AJUSTE_FINANCEIRO` e `PARCELA` — 9 relacionamentos. Isso é consistente com o desenho deliberado do conceitual ("todo fato financeiro nasce em Lançamento", princípio 1) e não é, em si, um erro. Mas é o único ponto do sistema cuja mudança de forma tem raio de impacto sobre praticamente todos os outros módulos. Isso não pede correção agora — pede atenção redobrada em qualquer mudança futura de schema desta entidade especificamente (ver Seção 10).

### 🟡 Melhoria — o modelo é uniformemente anêmico, por natureza da etapa, mas as regras precisam "sobreviver" à implementação

Como esta etapa é propositalmente livre de comportamento (só dados + regras descritas em texto), toda entidade é, por definição, anêmica agora. O risco real não está aqui — está em regras como "rateio × atribuição direta são mutuamente exclusivos" ou "valor do Lançamento imutável após primeira Aplicação" serem tratadas, na implementação futura, como validação externa opcional em vez de invariante protegida pelo próprio agregado. Não é um defeito do modelo atual, é um risco de tradução — sinalizado aqui para a próxima etapa.

### 🟡 Melhoria — `LANÇAMENTO_FINANCEIRO.tipo` como discriminador que alterna `fornecedor`/`cliente`

O padrão "um campo `tipo` que determina qual de dois outros campos é válido" é um cheiro clássico de "duas entidades disfarçadas de uma" em modelagem orientada a objetos. Neste caso específico, porém, é uma decisão **já deliberada e justificada por escrito** no próprio conceitual (nota de consolidação no topo do documento: Despesa/Receita e Pagamento/Recebimento foram unificados de propósito). Não é um achado novo — é reafirmado aqui só para registrar que o "custo" dessa unificação é que todo consumidor de `LANÇAMENTO_FINANCEIRO` precisa ramificar por `tipo` para saber qual referência é válida.

**Nenhuma responsabilidade duplicada ou ausente de gravidade 🔴 foi encontrada nesta seção.** Os achados de duplicação real de informação estão na Seção 4 (são um problema de campo/relacionamento, não de "responsabilidade de entidade").

---

## 2. RELACIONAMENTOS

### 🔴 Crítico — inconsistência real entre os três documentos que descrevem a relação Fatura ↔ Parcela ↔ Compra Cartão

Ao ler as três entidades **em conjunto** (o que a revisão entidade-por-entidade não fez), aparece uma contradição:

- `18-compra-cartao.md`, Seção 3: declara "Compra Cartão → Fatura | N:1 | ... determinado pela data da compra e o ciclo do Cartão" — uma relação **direta**, calculada por data.
- `19-fatura.md`, Seção 3: declara "Fatura → Compra Cartão (**via Parcela**) | 1:N | Uma Fatura agrupa as Parcelas do ciclo" — uma relação que passa **por Parcela**, não direta.
- `21-parcela.md`, Seção 3: **não declara nenhum relacionamento com Fatura**, nem direto nem indireto.

O próprio conceitual (Seção 4, "Cadeia de cartão") desenha explicitamente `FATURA ──1:N──> (Parcelas do ciclo...)` — ou seja, a fonte-origem trata isso como uma relação real entre Fatura e Parcela, e os três documentos do modelo de domínio não convergiram numa representação única e consistente dela.

**Por que é crítico, e não só uma inconsistência de redação**: `FATURA.valor_total_calculado` só pode ser corretamente calculado se o sistema souber, sem ambiguidade, quais Parcelas (ou Compras) pertencem a qual ciclo/Fatura. Do mesmo modo, quando a Fatura é paga, a Liquidação resultante precisa aplicar exatamente aos Lançamentos nascidos das Parcelas Terraplanagem **daquele ciclo específico** (Seção 7 do conceitual) — sem uma relação Parcela↔Fatura bem definida, essa segunda etapa também fica ambígua. Isso afeta diretamente o exemplo de aceitação obrigatório da Seção 14 do conceitual ("fatura mista R$30.000"), que o próprio checklist do conceitual manda rodar como teste antes de qualquer entrega (Seção 18: "Rodar os dois exemplos da Seção 14... como casos de teste de aceitação"). Um teste de aceitação mandatório não pode ser implementado de forma inequívoca enquanto essa relação não for resolvida numa única versão.

**Não estou corrigindo isso agora** (fora do escopo desta revisão) — só registrando que existe e por que importa.

### 🟠 Importante — relacionamento Cliente ↔ Lançamento Financeiro não é simétrico entre os documentos-fonte

`09-lancamento-financeiro.md` modela corretamente `cliente` como referência direta (exigido pelo campo "fornecedor_id ou cliente_id" do catálogo do conceitual). Mas `04-cliente.md`, seguindo fielmente a linha "Relaciona-se com" do catálogo do conceitual (Seção 3), lista **só** `Obra` como relacionamento de Cliente — **não** lista Lançamento Financeiro.

Isso não é um erro introduzido pelo modelo de domínio — é uma omissão de referência cruzada que já existia no próprio `arquitetura-conceitual.md` e sobreviveu a todas as etapas anteriores de auditoria (que trabalharam em nível de arquitetura, não de campo a campo). É a primeira vez que esse nível de detalhe expõe a lacuna. Vale mais uma nota de rastreabilidade do que uma correção urgente, já que o campo em si está corretamente modelado nos dois lados — só a listagem de "relaciona-se com" de Cliente ficou incompleta.

### 🟠 Importante — vínculo Consórcio contemplado → Veículo não se propaga para os Lançamentos gerados pelas Parcelas

`CONTRATO_FINANCEIRO` pode se vincular a um `VEÍCULO` quando um Consórcio é contemplado (Seção 10 do conceitual). Mas cada `LANÇAMENTO_FINANCEIRO` gerado por uma `PARCELA` desse Contrato tem seu próprio campo `veículo`, preenchido manualmente pelo usuário — **não há, em nenhum documento, uma regra de propagação automática do vínculo Contrato→Veículo para os Lançamentos de amortização gerados**. Na prática, isso significa que "custo do Veículo" (consulta agregada filtrada por `veiculo_id` sobre `LANÇAMENTO_FINANCEIRO`) **não incluiria automaticamente** as parcelas de um consórcio contemplado vinculado a esse veículo, a menos que alguém lembre de preencher `veículo` manualmente em cada Lançamento gerado — um por parcela, potencialmente dezenas ao longo do contrato. Isso é exatamente o tipo de "relacionamento ausente" que só aparece analisando as duas entidades (Contrato Financeiro e Lançamento Financeiro) lado a lado.

### 🟡 Melhoria — cardinalidade 1:1 entre Liquidação e Movimentação Bancária é fiel ao texto-fonte, mas é uma simplificação que talvez não resista à integração bancária real

O conceitual desenha explicitamente 1:1 na cadeia central (Seção 4). O modelo de domínio reproduz isso fielmente — não é um erro de modelagem. Mas é uma suposição que vale a pena observar como risco (ver Seção 10): pagamentos reais podem gerar mais de uma entrada bancária por Liquidação (tarifas destacadas, estornos parciais, etc.).

### Cardinalidades verificadas e aprovadas sem ressalva

Empresa↔ContaBancária/Veículo/ContratoFinanceiro (1:N), Obra↔Cliente (N:1), Obra↔RateioDespesa (1:N), Cartão↔Compra/Fatura (1:N), Fatura↔Liquidação (1:1 opcional), Ajuste↔Lançamento original (1:N) / Ajuste↔Lançamento de ajuste (1:1), Vínculo↔Movimentação (1:1) — todas conferidas contra o texto do conceitual e internamente consistentes entre os documentos correspondentes.

### Nenhum relacionamento circular problemático foi encontrado

A cadeia Lançamento(original)→Ajuste→Lançamento(de ajuste) não é literalmente circular (é um grafo acíclico direcionado), mas o modelo não esclarece se um Lançamento-de-ajuste pode, por sua vez, virar `lançamento_original` de um novo Ajuste (ex. reembolso de um reembolso). Isso não é um erro — é uma regra de negócio não coberta, sinalizada aqui como 🟡 melhoria: se isso for possível, o cálculo de "custo efetivo" (Seção 9 do conceitual) precisa decidir se soma só os Ajustes de primeiro nível ou percorre a cadeia inteira — hoje nenhum dos dois está confirmado.

---

## 3. CAMPOS

### 🔴 Crítico — `COMPRA_CARTÃO.categoria`/`obra`/`veículo` e os mesmos campos no `LANÇAMENTO_FINANCEIRO` gerado são duas cópias armazenadas do mesmo fato, sem regra de sincronização

Quando uma Compra Terraplanagem gera um Lançamento (via Parcela), os valores de `categoria`, `obra` e `veículo` precisam, na prática, ser copiados da Compra para o Lançamento — mas **nenhum documento afirma isso explicitamente**, e nenhum define o que acontece se o valor original na Compra for corrigido **depois** que o Lançamento já foi gerado. `LANÇAMENTO_FINANCEIRO.obra`, por exemplo, é descrito como alterável "por Usuário" independentemente da Compra que o originou.

**Por que isso é grave**: o módulo Obra/Frota só lê `LANÇAMENTO_FINANCEIRO` (nunca `COMPRA_CARTÃO` diretamente — regra explícita do conceitual, Seção 13). Se a classificação de uma Compra for corrigida depois que seu Lançamento já existe, e nada propaga essa correção, o sistema passa a ter **duas respostas diferentes** para "qual Obra é dona deste custo?", dependendo de qual entidade for consultada — uma violação de fato da fonte única da verdade, mesmo que cada dado individualmente esteja "correto" em seu próprio contexto.

Rebaixei este achado de 🔴 apenas parcialmente porque não quebra nenhum exemplo numérico já validado no conceitual (a matemática da Seção 14 funciona igual, contanto que a atribuição inicial esteja certa) — mas é um risco estrutural real de divergência silenciosa ao longo do tempo, por isso mantenho como 🔴 e não 🟠.

### 🟠 Importante — `FATURA.valor_total_calculado` é um campo calculado sendo tratado como persistido

O princípio 8 do conceitual é categórico: "todo indicador... é calculado em tempo de consulta... nunca armazenado como número fixo editável". `valor_total_calculado` é descrito no próprio catálogo do conceitual como algo que "o sistema calcula" — mas nada impede, e o documento `19-fatura.md` até sugere, que ele seja persistido "para referência histórica do ciclo". Isso é uma exceção ao princípio 8 que talvez seja legítima (um ciclo fechado é, por natureza, um fato histórico congelado, diferente de "custo de obra" que está sempre em aberto) — mas essa exceção **não está justificada explicitamente em lugar nenhum**, o que a torna uma inconsistência de princípio até ser deliberadamente confirmada como exceção válida.

### 🟡 Melhoria — `PARCELA.total` é redundante entre todas as parcelas do mesmo parcelamento

`total` (quantidade total de parcelas) tem o mesmo valor repetido em toda parcela de um mesmo parcelamento — já existe em `COMPRA_CARTÃO.nº parcelas`. Não é incorreto (facilita a leitura de cada Parcela isoladamente), mas é uma duplicação técnica de baixo risco, não de negócio.

### 🟡 Melhoria — campos condicionais de `CONTRATO_FINANCEIRO` (`taxa`/`grupo-cota`/`contemplado`) já sinalizam, por si só, que a entidade pode pertencer a duas formas distintas

Isso já está registrado como pendência 6 no modelo de `CONTRATO_FINANCEIRO` — reafirmado aqui só como confirmação de que é, tecnicamente, um caso de "campos que talvez pertençam a duas entidades diferentes", visível exatamente pelo padrão de campos mutuamente condicionados por `tipo`.

### Nenhum campo obrigatório impossível de preencher foi encontrado

Foi verificado com atenção — inclusive casos de borda como `LANÇAMENTO_FINANCEIRO.vencimento` para receitas instantâneas (ex. venda de sucata, regra 21) — e em todos os casos existe pelo menos um valor válido preenchível (mesmo que artificialmente, como repetir `data_competência` em `vencimento`). Isso é uma nota de baixo risco (🟡), não um bloqueio: `vencimento` pode não ter significado de negócio real para receitas sem prazo, mas não é estruturalmente impossível de preencher.

### 🟡 Melhoria — `AJUSTE_FINANCEIRO.observação` talvez devesse ser obrigatório, não opcional

É o único campo de texto livre que explica **por que** um estorno/reembolso/crédito aconteceu. Hoje modelado como opcional (inferência). Dado que ajustes financeiros são, por definição, correções sensíveis, exigir uma justificativa mínima teria valor de auditoria — mas isso não está confirmado como regra no conceitual, por isso fica como sugestão, não como achado confirmado.

---

## 4. INTEGRIDADE DO MODELO

### 🔴 Crítico — "estado impossível" concreto: `LANÇAMENTO_FINANCEIRO.status = Cancelado` coexistindo com Aplicações de Liquidação já somando o valor total

Este é o cenário exato da pendência 14 do conceitual, mas vale a pena descrevê-lo aqui em termos concretos de integridade de dados, porque é a única combinação de campos, em todo o modelo, que representa uma contradição real de negócio ("cancelado" e "totalmente pago" ao mesmo tempo) sem nenhuma regra que a impeça estruturalmente hoje. Nenhum outro "estado impossível" desta gravidade foi encontrado no resto do modelo.

### 🟠 Importante — edição de `RATEIO_DESPESA` depois que o `LANÇAMENTO_FINANCEIRO` já tem Aplicações pode alterar retroativamente relatórios de custo de Obra já fechados

Nada no modelo impede que um usuário ajuste como uma Despesa é rateada entre Obras **depois** que essa Despesa já foi parcial ou totalmente paga (as duas coisas — status de pagamento e rateio — são controladas por regras independentes, sem checagem cruzada documentada). Isso é tecnicamente permitido pelo modelo hoje, e teria o efeito de mudar, retroativamente, o custo já reportado de uma Obra em um período que um usuário talvez já tenha considerado "fechado". Não é um erro de dado (o rateio continua matematicamente correto), é um risco de integridade **temporal** de relatório.

### 🟡 Melhoria — `status` de um Lançamento, sozinho, não comunica que ele foi objeto de um Ajuste

Um Lançamento com status = Pago pode ter sido, na prática, integralmente estornado por um `AJUSTE_FINANCEIRO` — mas isso só aparece consultando `AJUSTE_FINANCEIRO` separadamente, nunca no próprio campo `status`. Isso é consistente com o princípio de que "custo líquido é sempre calculado em consulta" (Seção 9 do conceitual) — não é um erro de modelagem, mas é um ponto real de confusão para qualquer relatório futuro que olhe só para `status` sem também verificar Ajustes vinculados.

### Nenhuma duplicação de informação adicional, além da já listada na Seção 3, foi encontrada

Verificado especificamente: `OBRA.valor_contratado` vs. soma de Receitas da Obra — **não é duplicação**, são conceitos diferentes (contratado vs. realizado), corretamente distintos no modelo.

### Nenhuma regra explicitamente contraditória (duas regras que se anulam) foi encontrada

Os dois casos mais próximos disso (rateio retroativo, status não refletindo ajuste) são melhor descritos como lacunas de regra, não como contradições diretas entre duas regras existentes.

---

## 5. FLUXOS

Cada fluxo principal foi percorrido campo a campo, entidade a entidade, na ordem em que os dados realmente se moveriam.

### ✅ Fluxo aprovado — Despesa direta simples
Lançamento (Aberto) → Liquidação registrada → Aplicação criada automaticamente → status recalcula para Pago → Movimentação gerada/conferida → Vínculo Confirmado → Balanço lê a fração coberta. Nenhuma quebra encontrada.

### ⚠️ Fluxo com problema — Fatura mista (cartão)
Quebra exatamente no ponto identificado na Seção 2 (🔴): sem uma relação Parcela↔Fatura consistente entre os três documentos envolvidos, não é possível determinar de forma inequívoca (a) quais Compras somam `valor_total_calculado`, nem (b) quais Lançamentos a Liquidação da Fatura deve cobrir via Aplicação. O restante do fluxo (Liquidação → Movimentação → Conciliação) funciona normalmente uma vez que esse ponto seja resolvido.

### ✅ Fluxo aprovado, com ressalva não-bloqueante — Rateio de despesa entre obras
Fluxo funciona ponta a ponta; a ressalva é o risco de edição retroativa já descrito na Seção 4 (🟠), que não impede o fluxo de funcionar, mas pode gerar resultados de relatório que mudam depois do esperado.

### ✅ Fluxo aprovado — Ajuste financeiro (estorno/reembolso/crédito)
Lançamento original intocado → novo Lançamento de ajuste segue fluxo normal e independente, inclusive com Liquidação em outra Conta. Coerente ponta a ponta.

### ✅ Fluxo aprovado — Movimentação não-operacional (retirada do patrão, fora da operação, transferência interna)
Classificação aplicada → nunca gera Lançamento → Vínculo permanece Sem Correspondência permanentemente, por design (não há Liquidação para essas classificações). Coerente.

### ⚠️ Fluxo com problema — Consórcio contemplado → custo do Veículo
Quebra identificada na Seção 2 (🟠): o vínculo Contrato→Veículo não se propaga automaticamente para os Lançamentos de amortização gerados pelas Parcelas, então "custo do Veículo" fica incompleto por padrão, sem intervenção manual em cada Lançamento.

### ✅ Fluxo aprovado — Sugestão de IA (classificação/categoria)
IA propõe → Usuário confirma/edita/rejeita → dado real atualizado → Log de auditoria com origem correta. `categoria` e `classificação` corretamente tratadas como sugestões independentes (regra 29). Coerente.

### ✅ Fluxo aprovado (no nível do modelo de dados) — Ação proposta de IA, níveis Médio e Alto
A estrutura de dados suporta o fluxo completo até a barreira de confirmação; o mecanismo exato da barreira "Alto" continua sendo a pendência 12, já conhecida, não uma quebra nova encontrada nesta revisão.

---

## 6. AGGREGATE ROOTS

O modelo **não converge para um único aggregate root dominante da cadeia financeira** — e isso é o desenho correto para este domínio, não uma falha. A razão: o próprio conceitual exige que Lançamento, Liquidação e Movimentação Bancária sejam "três naturezas diferentes de registro, com ciclos de vida próprios" (princípio 2) — três raízes de agregado independentes, ligadas por entidades de fronteira cujas invariantes cruzam mais de um agregado ao mesmo tempo. Abaixo, os aggregate roots identificados:

| Aggregate Root | Entidades no agregado | Por que pertencem | Nunca deveriam ser alteradas diretamente | Invariantes que o agregado garante |
|---|---|---|---|---|
| **LANÇAMENTO_FINANCEIRO** | `RATEIO_DESPESA` | Rateio só existe em função de um Lançamento específico; sua validação central (soma compatível) é invariante do Lançamento | `RATEIO_DESPESA` nunca deveria ser criado/alterado sem checar a invariante do Lançamento pai | Obra direta XOR Rateio; fornecedor XOR cliente conforme tipo; valor imutável após primeira Aplicação |
| **LIQUIDAÇÃO_FINANCEIRA** | (nenhuma filha exclusiva) | `MOVIMENTAÇÃO_BANCÁRIA` tem vida própria forte demais para ser filha (existe mesmo sem nenhuma Liquidação) | — | Soma das Aplicações não ultrapassa seu `valor`; Conta Bancária sempre presente; barreira Alto respeitada na criação |
| **MOVIMENTAÇÃO_BANCÁRIA** | (nenhuma filha exclusiva) | `TRANSFERÊNCIA_INTERNA` referencia duas Movimentações — é objeto de fronteira, não filha de uma só | — | `classificação` sempre presente; campos factuais imutáveis após importação |
| **COMPRA_CARTÃO** | `PARCELA` (quando origem = Compra Cartão) | As Parcelas de uma Compra específica só existem em função dela, calculadas de uma vez no momento da compra | `PARCELA` nunca deveria ser criada/alterada isoladamente fora do cálculo de parcelamento da Compra | Soma das Parcelas = valor da Compra; nº parcelas consistente com os registros gerados |
| **CONTRATO_FINANCEIRO** | `PARCELA` (quando origem = Contrato Financeiro) | Mesma lógica da Compra Cartão | Mesma restrição | Soma das Parcelas = valor_contratado; `contemplado` só transita de Não para Sim |
| **AJUSTE_FINANCEIRO** | (raiz própria, sem filhos) | Referencia dois Lançamentos por identidade, mas não os possui — seu único propósito é o vínculo formal em si | — | O Lançamento original nunca é tocado; `lançamento_ajuste` é 1:1 |
| **OBRA**, **EMPRESA**, **CLIENTE**, **FORNECEDOR**, **CATEGORIA**, **VEÍCULO**, **USUÁRIO**, **CONTA_BANCÁRIA**, **CARTÃO_CRÉDITO**, **FATURA** | (raízes finas, sem filhos estruturais) | Cadastros de referência ou agregadores de leitura — sua "posse" sobre outras entidades é fraca ou inexistente | — | Majoritariamente unicidade e obrigatoriedade de campo — sem invariante complexa multi-entidade |
| **SUGESTÃO_IA**, **AÇÃO_PROPOSTA_IA** | (raízes próprias, sem filhos) | Ciclo de vida próprio (Pendente → Confirmada/Editada/Rejeitada) | — | Nunca viram dado real sem confirmação humana explícita |

**Entidades de fronteira (não pertencem a nenhum agregado sozinho, medeiam entre dois)**: `APLICAÇÃO_DE_LIQUIDAÇÃO` (entre Lançamento e Liquidação), `VÍNCULO_CONCILIAÇÃO` (entre Movimentação e Liquidação), `TRANSFERÊNCIA_INTERNA` (entre duas Movimentações). Nenhuma delas deveria ser criada/alterada como uma escrita isolada e independente — cada uma exige que uma operação (ou transação, ou processo) verifique a invariante dos dois lados ao mesmo tempo (ex.: soma de Aplicação não pode ultrapassar nem o Lançamento, nem a Liquidação). Isso **não pode ser garantido por um único aggregate root agindo sozinho** — é a implicação prática mais importante desta seção para a próxima etapa de implementação.

**`LOG_AUDITORIA` não é um aggregate root no sentido de "algo que se protege de escrita inconsistente"** — é melhor entendido como um registro de eventos/log transversal, cuja única invariante é "nunca é alterado depois de escrito". Não participa de nenhum agregado de negócio.

---

## 7. LIMITES DE AGREGADOS

- **Agregados grandes demais**: nenhum encontrado. O maior (Lançamento + Rateio) é pequeno e bem justificado.
- **Agregados pequenos demais / fragmentação excessiva**: não é um problema aqui — a maioria dos cadastros de referência (Empresa, Cliente, Fornecedor, Categoria, Veículo, Usuário, Conta Bancária, Cartão) são raízes finas por natureza (dados de referência, não processos de negócio), o que é esperado e correto, não uma fragmentação a corrigir.
- **Agregados dependentes entre si, no ponto exato onde nasce o risco de duplicação**: a fronteira entre o agregado `COMPRA_CARTÃO` e o agregado `LANÇAMENTO_FINANCEIRO` é exatamente onde o achado 🔴 da Seção 3 (duplicação de categoria/obra/veículo) vive — porque a travessia dessa fronteira acontece por **cópia de dado** (via geração de um novo Lançamento a partir de uma Parcela), não por referência. Sempre que um agregado "nasce" de outro por cópia de campos em vez de referência, esse é o padrão exato que introduz risco de duas fontes da verdade — vale registrar isso como o princípio geral por trás do achado específico.
- **Possíveis melhorias** (sem prescrever solução técnica, só apontando onde a fronteira merece decisão explícita antes da implementação): (a) definir se `FATURA`/`PARCELA` é uma relação de posse ou de leitura calculada por data; (b) decidir se a edição de `RATEIO_DESPESA` deveria ser bloqueada quando o Lançamento pai já tem Aplicações; (c) decidir explicitamente que `APLICAÇÃO_DE_LIQUIDAÇÃO`, `VÍNCULO_CONCILIAÇÃO` e `TRANSFERÊNCIA_INTERNA` são objetos de fronteira, e não pertencem a nenhum dos dois agregados que conectam — isso evita que uma implementação futura "force" uma delas para dentro de um agregado só, quebrando a invariante do outro lado.

---

## 8. MAPA DE DEPENDÊNCIAS

Camadas por profundidade de dependência estrutural (uma entidade só pode existir depois de tudo que ela referencia obrigatoriamente):

```
CAMADA 0 (sem dependências — cadastros-base)
  EMPRESA   USUÁRIO   CATEGORIA   CLIENTE   FORNECEDOR

CAMADA 1 (dependem de exatamente uma entidade da Camada 0)
  CONTA_BANCÁRIA (Empresa)
  VEÍCULO (Empresa)
  OBRA (Cliente)

CAMADA 2 (dependem de Camadas 0–1)
  CARTÃO_CRÉDITO (Conta Bancária)
  CONTRATO_FINANCEIRO (Empresa, Conta Bancária, Veículo opcional)
  LANÇAMENTO_FINANCEIRO (Categoria, Fornecedor/Cliente, Obra opcional, Veículo opcional) — quando de origem Manual
  LIQUIDAÇÃO_FINANCEIRA (Conta Bancária)
  MOVIMENTAÇÃO_BANCÁRIA (Conta Bancária)

CAMADA 3 (dependem de pelo menos uma entidade da Camada 2)
  RATEIO_DESPESA (Lançamento, Obra)
  COMPRA_CARTÃO (Cartão, Fornecedor, Categoria, Obra/Veículo opcionais)
  AJUSTE_FINANCEIRO (Lançamento x2, Usuário)
  APLICAÇÃO_DE_LIQUIDAÇÃO (Lançamento, Liquidação)
  TRANSFERÊNCIA_INTERNA (Movimentação x2)
  VÍNCULO_CONCILIAÇÃO (Movimentação, Liquidação opcional)
  SUGESTÃO_IA (Movimentação ou Lançamento, Usuário)

CAMADA 4 (dependem de Camada 3)
  PARCELA (Compra Cartão OU Contrato Financeiro)
  LANÇAMENTO_FINANCEIRO — quando de origem Cartão/Contrato (via Parcela, dependência transitiva)
  FATURA (Cartão +, transitivamente, Compra/Parcela do ciclo — dependência exata sujeita ao achado 🔴 da Seção 2)

CAMADA TRANSVERSAL (referencia qualquer camada, por design)
  AÇÃO_PROPOSTA_IA — estruturalmente rasa (só depende de Usuário), mas funcionalmente só faz sentido depois
                       que as entidades-alvo que ela pode criar/alterar já existem e são estáveis
  LOG_AUDITORIA — pode referenciar qualquer entidade financeira do sistema; por design deve estar disponível
                   desde o início (não é "construída por último", é "construída em paralelo desde a Camada 0",
                   conforme já estabelecido em arquitetura-tecnica.md, Seção 14)
```

**Nota importante**: esta é uma ordem de **dependência referencial** (o que precisa existir para o quê fazer sentido), não uma ordem de valor de entrega. A ordem de implementação recomendada (Seção 9) leva em conta as duas coisas.

---

## 9. ORDEM NATURAL DE IMPLEMENTAÇÃO

Sem tecnologia — só a lógica de dependência e de risco:

```
1. EMPRESA, USUÁRIO, CATEGORIA, CLIENTE, FORNECEDOR
       ↓
2. CONTA_BANCÁRIA, VEÍCULO, OBRA
       ↓
3. LANÇAMENTO_FINANCEIRO, LIQUIDAÇÃO_FINANCEIRA, MOVIMENTAÇÃO_BANCÁRIA
   (o núcleo da cadeia central — ver nota abaixo sobre por que os três juntos)
       ↓
4. APLICAÇÃO_DE_LIQUIDAÇÃO, VÍNCULO_CONCILIAÇÃO, TRANSFERÊNCIA_INTERNA
   (as entidades de fronteira que ligam o núcleo — não fazem sentido sem o passo 3 completo)
       ↓
5. RATEIO_DESPESA, AJUSTE_FINANCEIRO
   (camadas de análise sobre o núcleo já funcionando)
       ↓
6. CARTÃO_CRÉDITO, CONTRATO_FINANCEIRO
       ↓
7. COMPRA_CARTÃO, PARCELA, FATURA
   (⚠️ o achado 🔴 da Seção 2 precisa estar resolvido antes deste passo — construir Fatura/Parcela
   sem definir a relação entre elas replicaria a inconsistência para dentro da implementação)
       ↓
8. SUGESTÃO_IA, AÇÃO_PROPOSTA_IA
   (só fazem sentido depois que as entidades-alvo que elas propõem alterar já existem e estão estáveis)

EM PARALELO A TUDO ACIMA, DESDE O PASSO 1:
  LOG_AUDITORIA (transversal por definição — não é um passo posterior, é uma capacidade que
                  acompanha cada passo anterior desde o início, conforme já estabelecido)
```

**Por que o núcleo (passo 3) reúne três entidades em vez de uma só**: Lançamento, Liquidação e Movimentação Bancária são estruturalmente independentes entre si (nenhuma referencia obrigatoriamente outra das três diretamente — a ligação entre elas é sempre por uma entidade de fronteira do passo 4). Elas podem, tecnicamente, ser construídas em qualquer ordem entre si — mas fazem parte do mesmo "degrau" porque nenhuma faz sentido de negócio sem que as outras duas também existam logo em seguida (a cadeia central do princípio 2 do conceitual só cumpre sua função com as três presentes).

**Por que Rateio e Ajuste vêm depois do núcleo, não junto**: ambas são explicitamente "camadas de análise sobre um fato já existente" (princípio 6 do conceitual) — não fazem sentido de negócio, nem são testáveis de forma significativa, antes de haver Lançamentos reais para analisar.

**Por que Cartão/Contrato vêm depois de Rateio/Ajuste, e não logo após o núcleo**: tecnicamente, `COMPRA_CARTÃO` e `CONTRATO_FINANCEIRO` só dependem de entidades das Camadas 0–1 (Empresa, Conta Bancária, Fornecedor, Categoria) — poderiam, em tese, ser construídos em paralelo ao núcleo. A razão de colocá-los depois é de **risco**, não de dependência: são os módulos que geram Lançamentos indiretamente (via Parcela), e validar que o núcleo (passo 3-4) já está correto e testado **antes** de acrescentar uma segunda via de geração automática de Lançamentos reduz a chance de um defeito em Cartão/Contrato ser confundido com um defeito no núcleo.

**Por que IA vem por último**: toda a lógica de IA (Sugestão e Ação) opera sobre entidades que precisam já existir e ter comportamento estável — sugerir uma `categoria` só faz sentido depois que `CATEGORIA` e `LANÇAMENTO_FINANCEIRO` já funcionam; propor uma Ação de nível Alto só faz sentido depois que `LIQUIDAÇÃO_FINANCEIRA` já é confiável. Isso está alinhado com a ordem já registrada em `arquitetura-tecnica.md` (Seção 14: "leitura → sugestão → ação").

---

## 10. RISCOS FUTUROS

*(Só riscos — nenhuma solução técnica proposta, conforme pedido.)*

**Mais usuários**:
- Nenhuma regra de concorrência está definida para o caso de dois usuários classificarem a mesma `MOVIMENTAÇÃO_BANCÁRIA` (ou confirmarem a mesma `SUGESTÃO_IA`) quase ao mesmo tempo — com poucos usuários isso é raro; com mais, deixa de ser.
- A ausência de modelo de permissão (pendência 5) é hoje uma lacuna teórica; com mais usuários, vira um risco operacional real — decidir quem pode confirmar uma Ação de nível Alto deixa de ser uma pergunta acadêmica.

**Mais empresas** (o grupo crescendo além das 6 atuais):
- A ausência de vínculo direto `LANÇAMENTO_FINANCEIRO`→`EMPRESA` (já registrada no modelo de Lançamento) se torna proporcionalmente mais dolorosa: hoje, com 6 empresas conhecidas e um volume presumivelmente gerenciável, é possível "se virar" sem esse vínculo direto; com mais empresas, a necessidade de segregar relatórios por Empresa cresce, e a ausência desse vínculo direto vira um obstáculo real de escala, não só uma lacuna teórica.
- `CATEGORIA` é global (sem escopo por Empresa) — se o grupo incorporar um negócio de natureza muito diferente da terraplanagem, a lista de categorias compartilhada entre todas as empresas pode deixar de fazer sentido para todas elas igualmente.

**Integração bancária** (Open Finance/API):
- A suposição 1:1 entre `LIQUIDAÇÃO_FINANCEIRA` e `MOVIMENTAÇÃO_BANCÁRIA` (fiel ao conceitual hoje) tende a ser tensionada por dados bancários reais, que costumam fragmentar um único pagamento em múltiplos eventos (tarifas, estornos parciais, IOF destacado).
- O modelo exige que toda divergência de valor em conciliação seja resolvida por revisão humana, sem nenhum conceito de aprovação em lote — com o volume mais alto e mais automático que a integração bancária tende a trazer, esse ponto de revisão 100% manual pode virar um gargalo operacional.

**IA**:
- `SUGESTÃO_IA.entidade_alvo` hoje só cobre dois tipos de entidade (Movimentação Bancária, Lançamento Financeiro). Se o escopo de sugestões da IA crescer (ex. sugerir um Rateio, sugerir uma atribuição de Obra em lote), esse desenho de "só dois tipos possíveis" precisará ser revisitado.
- `AÇÃO_PROPOSTA_IA.dados_propostos` é, por definição, uma estrutura livre e variável conforme o `tipo_ação` — nada no modelo define, hoje, um catálogo fechado de quais `tipo_ação` existem nem qual formato de dados cada um exige. Conforme mais tipos de ação forem adicionados ao longo do tempo, a ausência desse catálogo é um risco crescente à promessa de que "a IA nunca inventa" — sem uma validação estrutural do que pode estar dentro de `dados_propostos`, essa garantia depende inteiramente de disciplina de implementação, não da estrutura de dados em si.

**Muitos lançamentos** (crescimento de volume ao longo dos anos):
- Todo indicador (saldo, custo de obra, custo de veículo, lucro por obra) é, por princípio, sempre calculado em consulta, nunca armazenado (princípio 8) — `FATURA.valor_total_calculado` é a **única** exceção nesse sentido em todo o modelo de 24 entidades. À medida que o histórico cresce (anos de lançamentos, várias obras, várias empresas), esse compromisso de "sempre calcular ao vivo" — combinado com os *joins* necessários entre Lançamento, Aplicação, Rateio e Ajuste — é o ponto do modelo mais exposto ao crescimento de volume, puramente por causa de como o princípio 8 foi aplicado de forma consistente em todo o resto do sistema.
- Cadeias de `AJUSTE_FINANCEIRO` (se ajuste-de-ajuste for permitido, ver Seção 2) compõem esse mesmo risco: quanto mais longa a cadeia possível, mais cara a consulta de "custo efetivo".

---

## 11. RESUMO FINAL

**Modelo consistente**: em sua estrutura geral, sim — a cadeia financeira central, as fronteiras de escrita entre módulos, e a fidelidade ao conceitual estão corretas e internamente coerentes. Os problemas encontrados são localizados, não sistêmicos.

**Problemas encontrados**:
- 🔴 Crítico (2): inconsistência da relação Fatura↔Parcela↔Compra Cartão entre os três documentos correspondentes; duplicação de `categoria`/`obra`/`veículo` entre Compra Cartão e o Lançamento gerado, sem regra de sincronização; "estado impossível" de Lançamento Cancelado com Aplicações já somando o total (ligado à pendência 14, aqui descrito de forma concreta).
- 🟠 Importante (4): relacionamento Cliente↔Lançamento ausente na listagem de Cliente (herdado do próprio conceitual); vínculo Consórcio-Veículo não propagado aos Lançamentos de Parcela; edição retroativa de Rateio após pagamento parcial/total; `FATURA.valor_total_calculado` como exceção não-justificada ao princípio 8.
- 🟡 Melhoria (6): entidade uniformemente anêmica (esperado nesta etapa, risco de tradução futura); `tipo` como discriminador em Lançamento (já justificado, custo reconhecido); redundância de `PARCELA.total`; ambiguidade de cadeia de Ajustes-de-Ajuste; `AJUSTE_FINANCEIRO.observação` talvez devesse ser obrigatório; `status` de Lançamento não comunicando Ajuste vinculado.

**Aggregate Roots**: identificados 15 ao todo (detalhe completo na Seção 6); o modelo **não tem, nem deveria ter, um único agregado dominante** — a cadeia central é deliberadamente composta por três raízes independentes (Lançamento, Liquidação, Movimentação Bancária) ligadas por três entidades de fronteira (`APLICAÇÃO_DE_LIQUIDAÇÃO`, `VÍNCULO_CONCILIAÇÃO`, `TRANSFERÊNCIA_INTERNA`) cujas invariantes cruzam mais de um agregado — implicação direta para a próxima etapa: essas três entidades de fronteira não podem ser protegidas por um único aggregate root sozinho.

**Fluxos aprovados** (6): Despesa direta simples; Rateio entre obras (com ressalva não-bloqueante); Ajuste financeiro; Movimentação não-operacional/retirada do patrão/transferência interna; Sugestão de IA; Ação proposta de IA (no nível do modelo de dados).

**Fluxos com problema** (2): Fatura mista (cartão) — quebra na relação Parcela↔Fatura; Consórcio contemplado → custo do Veículo — quebra na ausência de propagação do vínculo.

**Dependências principais**: cadastros-base (Empresa/Usuário/Categoria/Cliente/Fornecedor) → entidades de um vínculo (Conta Bancária/Veículo/Obra) → núcleo da cadeia central (Lançamento/Liquidação/Movimentação) → entidades de fronteira (Aplicação/Vínculo/Transferência) → camadas de análise (Rateio/Ajuste) → Cartão/Contrato Financeiro → Compra/Parcela/Fatura → IA — com Auditoria transversal desde o primeiro passo. Mapa completo na Seção 8.

**Ordem recomendada de implementação**: detalhada na Seção 9 — resumidamente, cadastros-base → entidades de um vínculo → núcleo central (as três entidades juntas) → entidades de fronteira → Rateio/Ajuste → Cartão/Contrato → Compra/Parcela/Fatura (só depois de resolver o achado 🔴 correspondente) → IA, com Auditoria em paralelo desde o início.

**Pendências realmente bloqueantes** (novas, encontradas nesta revisão — distintas das já registradas nas etapas anteriores, que continuam todas válidas):
1. Definir, de forma única e consistente, a relação entre `FATURA`, `PARCELA` e `COMPRA_CARTÃO` — bloqueante antes de implementar qualquer um dos três, e antes de rodar o teste de aceitação da fatura mista (Seção 14 do conceitual).
2. Definir se/como `categoria`, `obra` e `veículo` de uma `COMPRA_CARTÃO` se sincronizam com o `LANÇAMENTO_FINANCEIRO` que ela gera — bloqueante antes de implementar o módulo Cartão.
3. Definir se o vínculo Consórcio-Veículo deveria se propagar automaticamente para os Lançamentos de Parcela gerados — bloqueante antes de implementar o relatório de custo de Frota para Contratos Financeiros.
4. Confirmar (ou formalizar como regra) se `LANÇAMENTO_FINANCEIRO` precisa de um vínculo direto com `EMPRESA` — bloqueante especificamente antes de implementar controle de acesso por escopo de Empresa (não bloqueia o núcleo financeiro em si).

**Confiança geral no modelo de domínio: 7/10.**

Justificativa: a espinha dorsal do sistema — a cadeia Lançamento→Liquidação→Aplicação→Movimentação→Conciliação, e as fronteiras de escrita entre módulos — está modelada com fidelidade real ao conceitual e resistiu a esta revisão sistêmica sem nenhum problema estrutural grave. A nota não é mais alta porque esta revisão encontrou um erro concreto e verificável dentro do próprio conjunto de documentos produzidos (a inconsistência Fatura↔Parcela, que é exatamente o tipo de problema que só aparece analisando entidades em conjunto, como pedido), mais uma lacuna real de sincronização de dado (categoria/obra/veículo duplicados) que toca diretamente o princípio de fonte única da verdade. Nenhum dos achados exige redesenhar o modelo — todos são correções localizadas e bem delimitadas — mas nenhum deles deveria ser ignorado antes da modelagem de banco começar, porque os três primeiros pendentes listados acima moldariam diretamente o formato das tabelas envolvidas.
