# FLUXOS OPERACIONAIS DEFINITIVOS
## H. Vieira Terraplanagem — Passo 1 da revisão operacional

---

## 1. Objetivo do documento

Este documento é a **fonte oficial de como a H. Vieira trabalha** e de como o sistema **deve interpretar** os processos financeiros.

Ele descreve processos, não soluções. Não define telas, componentes, entidades, banco de dados, endpoints nem arquitetura. Isso fica para o Passo 2 em diante.

Quando este documento entrar em conflito com documentação técnica anterior (`decisions.md`, `domain-model/`, `pendencias.md`, `handoff.md`), **este documento é mais recente e prevalece**. As divergências conhecidas estão na Seção 16.

---

## 2. Princípios operacionais

1. O sistema nasce da rotina real da empresa, não da arquitetura existente.
2. Menos retrabalho, menos digitação repetida, menos passos.
3. Corrigir é fácil. O usuário corrige ou completa a informação onde já está trabalhando.
4. Não é obrigatório cadastrar tudo antes. Fornecedor e Categoria podem nascer no momento do uso.
5. Automatizar quando for seguro. **Nunca alterar uma informação financeira automaticamente quando houver possibilidade relevante de erro.** Nesses casos o sistema sugere e o usuário confirma.
6. Tudo que ainda é projeção permanece editável.
7. **O banco é a verdade do que aconteceu financeiramente.**
8. **O Balanço é a visão gerencial**, não uma cópia do extrato. Movimentação bancária e fato gerencial não são necessariamente a mesma coisa. **Nem todo movimento bancário é Receita ou Despesa.**
9. **Nenhum fato gerencial é contado duas vezes.**
10. **O Balanço Gerencial é um critério interno da H. Vieira, não uma demonstração contábil oficial.** Ele reproduz a leitura financeira que a empresa já usa: "o que efetivamente entrou e saiu naquele mês".
11. Tarefas diárias são rápidas e próximas da experiência de uma planilha.

**Quem usa:** principalmente João e Cícero. Cícero faz a maior parte dos pagamentos. O patrão consome uma visão diária. A operação é simples, direta e intuitiva.

---

## 3. Contas a Pagar (Agenda de pagamentos)

**Objetivo:** ser a agenda das obrigações futuras de caixa e a lista de referência de Cícero na hora de pagar.

**Início:** João ou Cícero decidem que um pagamento deve ser realizado. A origem pode ser nota fiscal, romaneio, boleto, WhatsApp, e-mail, contato do fornecedor ou outro compromisso. Também entram na Agenda:
- as **parcelas de financiamentos e as recorrências** (Seção 5);
- as **faturas de cartão de crédito** (Seção 8).

Despesa incerta ou sem definição real de pagamento **fica fora do sistema**. O sistema **não decide** se uma conta deveria estar cadastrada. Isso é decisão humana.

**Informações:**
- empresa;
- fornecedor;
- categoria;
- descrição;
- valor;
- data programada (vencimento);
- forma de pagamento (boleto, PIX ou cheque);
- obra, quando aplicável;
- veículo, quando aplicável;
- documento/NF, quando houver (pode ficar em branco);
- parcela, quando aplicável (ex.: 1/2, 2/2).

Fornecedor e Categoria funcionam por busca: o usuário digita, o sistema sugere os existentes e, se não houver, permite cadastro rápido. Cliente continua com seleção simples (volume pequeno).

Categoria, obra e veículo são a **classificação geral** do lançamento simples. Quando uma mesma NF/pagamento pertence a vários veículos, categorias ou destinos, o lançamento pode ser **rateado gerencialmente** (Seção 18). Na Agenda ele continua sendo **um único compromisso pelo valor total**.

**Não registrar nesta etapa:** chave PIX, linha digitável, dados bancários de pagamento. Eles continuam nos papéis e documentos externos. A folha física de pagamentos continua existindo como redundância, e o sistema não a substitui agora.

**Data programada e remarcação:**
- "Programado" significa que existe uma data real pretendida: o vencimento do boleto, a data combinada do PIX ou a data definida por João/Cícero.
- Se a data mudar, o usuário altera a data. A data anterior não tem relevância operacional e não é preciso manter histórico de remarcações.
- Uma conta com data já passada e não paga fica **visualmente evidente**.
- O sistema **não** decide se ela está "atrasada" no sentido comercial (juros, tolerância do fornecedor). Isso é decisão humana.
- O sistema **não** cria regra automática de prioridade.

**Passos:**
1. João/Cícero cadastram o pagamento futuro.
2. O lançamento fica na Agenda, editável (data, valor, demais dados).
3. Cícero revisa a lista e confere.
4. Cícero executa os pagamentos manualmente no Internet Banking, em qualquer horário, sem agendamento prévio no banco.
5. O que estiver indefinido, ou para o que faltar dinheiro, fica para depois. A prioridade é decidida manualmente.
6. O pagamento aparece no extrato (OFX) e é conciliado (Seção 6).

**Exceções:**
- **Valor pago diferente do programado** (ex.: programado R$ 1.000, pago R$ 970): o banco prevalece. O sistema **não altera** o lançamento sozinho. Ele identifica a possível correspondência, sugere a correção e o usuário confirma.
- **Pagamento não programado:** Seção 5.1.
- **Pagamento de uma empresa feito pela conta de outra empresa do grupo:** permitido (Seção 6.5).

**Quando termina:** quando o pagamento está conciliado com o movimento bancário real.

**O que segue adiante:**
- para a Conciliação: os dados do pagamento esperado;
- para o Balanço: a saída projetada, que passa a realizada após a conciliação, conforme as regras de cada origem (Seção 12).

---

## 4. Contas a Receber (Agenda de recebimentos)

**Objetivo:** registrar antecipadamente as entradas futuras, para projeção financeira.

**Início:** existe uma entrada esperada.
- **Fonte principal: serviços executados (obras).** O recebimento de obra nasce da Medição (Seção 9).
- **Outras receitas eventuais:** reembolsos e outras entradas específicas.

**Entradas que não são receita** (Seção 7):
- liberação de financiamento;
- transferência entre contas próprias.

**Comportamento das principais cooperativas:**
- **COAMO:** processo previsível. Após a emissão da NF, costuma pagar em cerca de 3 dias úteis.
- **C.Vale:** processo mais burocrático, com autorização anterior para emitir a NF. Após a emissão, costuma pagar em cerca de 20 dias.
- Quando a NF é emitida, normalmente já existe uma boa estimativa da data de recebimento.

**Passos:**
1. A entrada esperada é registrada com valor e data prevista. Para Medição, o valor esperado é o **valor líquido a receber** (Seção 9).
2. Enquanto não estiver conciliada, é **previsão editável**: data e valor podem mudar. Se o recebimento for adiado, altera-se a data prevista.
3. O crédito aparece no extrato (OFX) e é conciliado (Seção 6).
4. O realizado só é confirmado quando o recebimento estiver conciliado.

**Exceções:**
- **Valor recebido diferente do previsto:** o banco prevalece. O sistema sugere a correção e o usuário confirma.
- **Um crédito cobrindo vários recebimentos** (ex.: duas NFs pagas juntas): Seção 6.6.
- **Crédito não programado:** nasce pela Conciliação (Seção 5.1).

**Quando termina:** quando o recebimento está conciliado.

**O que segue adiante:**
- para a Conciliação: o recebimento esperado (valor líquido, data prevista, pagador);
- para o Balanço Projetado: a entrada prevista.

**Para que serve a projeção:** responder se os serviços do mês cobrem as despesas, quanto se espera receber nas próximas semanas, como ficará o caixa e se o resultado projetado do período parece suficiente.

---

## 5. Pagamentos, recorrências e financiamentos

### 5.1 Pagamentos e recebimentos não programados

**Início:** uma despesa é paga na hora (ou um crédito entra) sem ter sido programada.

**Passos:**
1. O pagamento acontece.
2. Ele aparece no extrato/OFX.
3. Ele aparece na Conciliação como **Não conciliado**, só com os dados do banco.
4. João ou Cícero completam e corrigem as informações ali mesmo.
5. A informação financeira passa a existir **a partir da própria Conciliação**.
6. Ela é conciliada.

O usuário não é obrigado a sair da Conciliação para cadastrar em outro lugar.

**Quando termina:** quando o item está completo e conciliado.

### 5.2 Parcelas e pagamentos parciais

- **Cada pagamento é um lançamento próprio e independente.**
- Exemplo: uma nota de R$ 10.000 paga em R$ 4.000 (1/2) e R$ 6.000 (2/2) são **dois lançamentos**.
- Os dois podem ter o mesmo fornecedor, a mesma NF e a mesma descrição/origem, e carregam a informação de parcela (1/2, 2/2).
- **Não** se trata como um único lançamento dividido internamente.
- **Parcela não é rateio:** parcelas são pagamentos distintos; rateio é a distribuição gerencial de um único pagamento (Seção 18.6).

### 5.3 Séries de parcelas

- Lançar dezenas de parcelas à mão é inviável. O sistema permite cadastrar uma série informando, por exemplo, parcela atual 24, parcela final 48, valor padrão R$ X e vencimento padrão dia Y.
- Só as **parcelas restantes** necessárias são consideradas. As anteriores não precisam ser cadastradas.
- Normalmente o valor e o dia de vencimento se repetem.
- **Cada parcela é um lançamento independente.** Qualquer uma pode ter valor e data editados individualmente, e uma exceção não obriga alterar as demais.

### 5.4 Recorrências sem fim definido (ex.: aluguel de imóvel usado numa obra)

- A obrigação se repete e não há parcela final conhecida.
- Quando o usuário encerra a recorrência, **novos lançamentos deixam de surgir**.
- Depois de encerrada, o sistema **não recria** a obrigação.

### 5.5 Financiamentos e consórcios

**Objetivo:** acompanhar cada obrigação de financiamento ou consórcio e gerar e controlar suas parcelas futuras. O tratamento gerencial está na Seção 5.6.

**Informações relevantes do controle atual** (a forma exata, e quais são obrigatórias na primeira versão, será refinada depois):
- produto/descrição;
- instituição financeira;
- taxa de juros;
- número do título/contrato;
- data de liberação;
- vencimento final;
- valor liberado;
- valor pago;
- saldo devedor;
- valor da parcela;
- dia do vencimento;
- quantidade total de parcelas;
- parcelas pagas;
- parcelas restantes;
- valor para liquidação, quando disponível;
- periodicidade (ex.: mensal, anual).

**Parcelas (de financiamentos e de consórcios):**
- são geradas em série conforme a Seção 5.3, inclusive na migração (informando, por exemplo, parcela atual 24 e final 48, sem cadastrar as anteriores);
- cada parcela é um lançamento individual e editável;
- entram na Agenda de Contas a Pagar e são conciliadas normalmente quando pagas.

**Quando termina:** quando a última parcela é paga e conciliada.

### 5.6 Critério gerencial para compra de bens, financiamentos e consórcios

**Critério (decisão deliberada):**

> Para o Balanço Gerencial interno da H. Vieira, tudo que a empresa efetivamente paga com recursos próprios na aquisição de bens e no cumprimento de financiamentos e consórcios impacta o resultado gerencial no período do pagamento. O valor integral das parcelas pagas de financiamentos e consórcios é reconhecido como despesa no período do pagamento. Trata-se de um critério deliberadamente financeiro/gerencial, baseado no impacto mensal dessas obrigações sobre os recursos da empresa — não de uma contabilidade formal por competência, depreciação ou separação entre amortização de principal e encargos financeiros.

**Alcance:** o critério vale para compra de bens, entradas, parcelas, lances e complementos. **Não altera** as regras já decididas para os movimentos da Seção 7 (transferências internas, gastos reembolsáveis e retiradas de proprietário), que continuam fora da despesa operacional.

**O que não se faz:**
- **não** se separa principal, juros e encargos (pode ser adicionado no futuro, se houver fonte confiável e prática desses dados);
- **não** se estimam juros automaticamente;
- **não** se aplica depreciação;
- **não** se reproduz a contabilidade oficial.

**Caso 1 — Bem pago à vista** (ex.: máquina de R$ 800.000 paga integralmente com dinheiro da empresa)
- R$ 800.000 são **despesa gerencial no período do pagamento**.
- Um resultado muito negativo naquele mês é **aceito conscientemente**.

**Caso 2 — Entrada + financiamento** (ex.: máquina de R$ 800.000, entrada própria de R$ 200.000, financiamento de R$ 600.000)

| Evento | Tratamento |
|---|---|
| Entrada de R$ 200.000 (recursos próprios) | Despesa gerencial no período do pagamento |
| Liberação dos R$ 600.000 | Movimenta caixa. **Não é Receita** |
| Aquisição do bem com os R$ 600.000 financiados | **Não** gera outra despesa |
| Parcelas futuras | Cada parcela integral é despesa no período do pagamento |

**Caso 3 — Financiamento sem entrada relevante**

| Evento | Tratamento |
|---|---|
| Liberação | Aumenta o caixa. **Não é Receita** |
| Aquisição do bem com o valor financiado | **Não** gera despesa |
| Parcela paga | Valor integral é despesa no período do pagamento |

**Caso 4 — Consórcio** (tratado de forma equivalente ao financiamento)

| Evento | Tratamento |
|---|---|
| Parcelas pagas | Valor integral é despesa no período do pagamento |
| Lance pago com recursos próprios | Despesa no período do pagamento |
| Contemplação/carta de crédito | **Não é Receita** |
| Uso da carta para adquirir o bem | **Não** gera despesa pelo valor da carta |
| Complemento pago com recursos próprios | Despesa no período do pagamento |

**Nunca:** somar como despesas simultâneas a compra total do bem, a entrada e todas as parcelas, nem combinar parcelas, lance, complemento, valor da carta e aquisição do bem de forma que o mesmo dinheiro seja contado duas vezes. **A despesa gerencial é sempre o dinheiro próprio efetivamente pago**: à vista, entrada, parcela, lance ou complemento. Valor financiado e valor da carta nunca são despesa.

A assimetria entre "liberação/contemplação não é receita" e "parcela é despesa" é **aceita conscientemente**. O controle patrimonial do bem pode existir à parte, sem efeito no Balanço Gerencial.

Exemplo de resultado:

| Item | Valor |
|---|---|
| Receitas realizadas | R$ 500.000 |
| Despesas operacionais normais | −R$ 300.000 |
| Parcelas de financiamentos | −R$ 100.000 |
| **Resultado gerencial** | **R$ 100.000** |

As parcelas de financiamento **impactam o resultado final**. Não aparecem só como informação paralela de "compromissos".

**Movimento bancário que mistura recursos próprios e financiados:** se o valor financiado passar pela conta da empresa antes de pagar o fornecedor (ex.: entra a liberação de R$ 600.000 e depois sai um pagamento único de R$ 800.000), só a parte paga com recursos próprios (R$ 200.000) é despesa. A parte financiada desse pagamento não é. Se o banco pagar o fornecedor diretamente, só a entrada aparece na conta. Nos dois casos o resultado gerencial é o mesmo.

O mecanismo de interface das Seções 5.3 a 5.6 fica para o Passo 2.

---

## 6. Conciliação Bancária

**Objetivo:**
- ser um **extrato bancário enriquecido**, um dos principais fluxos diários;
- mostrar tudo que entrou e saiu;
- relacionar cada movimento com o que estava programado;
- permitir completar o que não foi programado;
- dar uma visão clara para João, Cícero e o patrão.

**Regras gerais:**
- Tudo que está no extrato aparece na Conciliação.
- **Nenhuma movimentação bancária é ignorada permanentemente.** Toda movimentação é classificada.
- **Aparecer na Conciliação não significa ser Receita ou Despesa.** Transferências internas, liberações de financiamento, retiradas do proprietário e itens reembolsáveis aparecem e movimentam caixa, mas não são receita ou despesa operacional (Seção 7). Recebimentos de Medição e débitos de fatura de cartão confirmam fatos cuja composição gerencial vem de outra origem (Seções 8 e 9).
- Tudo permanece editável.

### 6.1 Importação OFX

- O OFX é a fonte oficial de movimentações bancárias no primeiro momento. Uma integração via Open Finance pode vir no futuro.
- A empresa pretende importar cerca de **duas vezes por dia**.
- O mesmo período pode aparecer em mais de uma importação. O sistema **identifica o que já foi importado, não duplica e adiciona só o novo**.
  - Exemplo: de manhã chegam A, B e C. À tarde chegam A, B, C, D e E. O resultado tem A, B e C uma única vez, mais D e E.
- A estratégia técnica de detecção de duplicidade será definida depois.
- **Pendente:** validar arquivos OFX reais dos bancos utilizados.

### 6.2 Passos

1. O OFX é importado e cada movimento aparece.
2. O sistema procura itens programados correspondentes (ver 6.4).
3. **Há correspondência:** o usuário confirma o vínculo. Se o valor diferir, o sistema sugere a correção e o usuário confirma.
4. **Não há correspondência:** o movimento fica **Não conciliado**, só com os dados do banco, e é completado e classificado na própria Conciliação (Seção 5.1).
5. Vínculo e informações confirmados: **Conciliado**.

### 6.3 Estados visíveis ao usuário

- **Não conciliado:** ainda não existe vínculo confirmado e coerente com o movimento bancário.
- **Conciliado:** vínculo e informações confirmados.

Regras de transição:
- Se uma alteração posterior tornar um item conciliado incompatível com o movimento bancário, ele **volta a Não conciliado**. O usuário corrige e concilia de novo.
- Não é necessário expor ao usuário um estado separado "Divergente", salvo justificativa futura.
- Um vínculo feito errado pode ser **alterado ou desfeito com facilidade**.

### 6.4 Sugestões de conciliação

**Nível forte:** os dados batem de forma muito confiável (natureza compatível, valor igual, data próxima, demais informações compatíveis). O sistema pode sugerir fortemente o vínculo.

**Nível aproximado:** o valor ou outra informação não bate exatamente, mas há sinais claros de relação (data próxima, forma de pagamento semelhante, descrição compatível, fornecedor compatível, outros dados em comum). O sistema pode sugerir candidatos, mas **nunca altera nada nem assume o vínculo sozinho**.

**Sem candidato razoável:** o movimento fica Não conciliado, mostrando exatamente os dados do OFX, e o usuário completa manualmente.

**Vários candidatos igualmente compatíveis:** o sistema não escolhe. O usuário decide.

**O valor procurado no banco é o valor de caixa esperado:**
- para Medição, o **valor líquido a receber**;
- para cartão, o **valor da fatura**.

### 6.5 Empresa e conta bancária

- Uma despesa de uma empresa pode ser paga pela conta de outra empresa do grupo.
- A empresa ou conta de origem **não impede o vínculo**.
- O lançamento não precisa indicar antes de qual conta o dinheiro sairá. **O movimento bancário real define de qual conta saiu.**
- A empresa pode servir de informação auxiliar para a sugestão, nunca de bloqueio.

### 6.6 Um movimento para vários itens

O vínculo **não é obrigatoriamente 1 para 1**. Exemplo real: a COAMO paga a NF A (R$ 50.000) e a NF B (R$ 30.000) numa única transferência de R$ 80.000. A Conciliação relaciona esse único movimento aos dois recebimentos.

Isso **não é rateio**. Aqui são vários lançamentos para um movimento. No rateio é um único lançamento com várias classificações gerenciais internas, conciliado pelo seu valor total (Seção 18.5).

### 6.7 Visão diária para o patrão

O patrão normalmente está na roça ou em outras atividades e não acompanha a terraplanagem de perto. Ele precisa de informação objetiva e rápida:
- o que foi pago no dia anterior;
- o que entrou;
- o saldo das contas;
- o que está previsto para pagar no dia;
- as principais movimentações.

A forma dessa visão fica para o Passo 2.

**Quando termina:** quando cada movimento bancário está Conciliado, completo e classificado.

**O que segue adiante:**
- para Contas a Pagar e Receber: a confirmação do pagamento ou recebimento;
- para Medição: a confirmação do recebimento, **que também define o período realizado da Medição** (Seção 9);
- para Cartão: a confirmação do pagamento da fatura, que também define o período gerencial das compras (Seção 8);
- para o Balanço: o realizado bancário, respeitando as regras de não duplicidade (Seção 13).

---

## 7. Transferências internas e movimentos fora do resultado operacional

São movimentos que **aparecem na Conciliação e movimentam caixa**, mas **não são Receita nem Despesa operacional**.

| Movimento | Regra |
|---|---|
| **Transferência entre contas próprias** (ex.: sai R$ 50.000 do Sicredi, entra R$ 50.000 no Banco do Brasil) | Aparece nas duas contas e altera o saldo de cada uma. Não é Receita nem Despesa. Não altera o resultado consolidado: o caixa total da empresa não muda. |
| **Liberação de financiamento** | Aumenta o caixa e fica registrada. **Não é Receita** (Seção 5.6). |
| **Contemplação/carta de crédito de consórcio** | **Não é Receita**. O uso da carta para adquirir o bem não gera despesa (Seção 5.6). |
| **Gasto reembolsável/compensável** (ex.: CNH de funcionário, descontada depois em folha) | Pode movimentar caixa ou cartão. Não é despesa gerencial da empresa. A compensação posterior em folha não é receita. |
| **Retirada de proprietário** | Aparece como saída financeira. **Não** se confunde com custo operacional de obra ou serviço. |

Não se aprofunda agora uma estrutura contábil ou patrimonial para esses casos. A exigência é apenas **não classificá-los como Receita ou Despesa operacional normal**. O nome e a classificação técnica ficam para depois.

**Contraponto deliberado:** o dinheiro próprio pago em bens, entradas, parcelas de financiamento e consórcio, lances e complementos movimenta caixa **e é** despesa gerencial integral (Seção 5.6).

---

## 8. Cartão de Crédito

**Objetivo:** registrar cada compra para o Balanço, programar a fatura como obrigação de caixa e confirmar seu pagamento pelo banco, sem contar a despesa duas vezes.

**Cartões em uso:** cerca de 3 ou 4.
- Cerca de 3 são da H. Vieira e 1 é de outra empresa.
- Um cartão da H. Vieira fica com o **encarregado**.
- Os demais ficam no **escritório** e são usados principalmente para compras à distância.

**Início:** compras acontecem ao longo do ciclo.

**Passos — cartão do encarregado:**
1. As compras acontecem ao longo do mês.
2. Quando a fatura fecha, o encarregado entrega comprovantes e notas.
3. João relaciona manualmente os comprovantes com os itens da fatura.
4. João classifica as despesas.

Esse processo continua manual. Não há necessidade de automatizar o que depende de papéis entregues pelo encarregado.

**Passos — cartões do escritório:** João/Cícero normalmente já sabem o que foi comprado. O preenchimento é manual e sem dificuldade relevante.

**Informações de cada compra** (cada compra importa para o Balanço e fica individualmente identificável):
- categoria/conta;
- data da compra;
- fornecedor/empresa/descrição;
- documento;
- valor total da compra;
- valor da parcela daquele mês;
- parcela atual e total de parcelas (ex.: 1/1, 1/3, 4/6, 8/12);
- vencimento final.

Uma compra individual também pode ser **rateada gerencialmente** entre categorias, obras e veículos (Seção 18). **A fatura nunca recebe rateio.**

**Compras parceladas:** são frequentes, mas os valores normalmente não justificam usar cada parcela futura na projeção. Não é obrigatório tratar cada parcela futura do cartão como obrigação separada na Agenda. A compra guarda valor total, número de parcelas, parcela atual, valor da parcela e a fatura correspondente.

**Fatura na Agenda:**
- A fatura **aparece na Agenda de Contas a Pagar**, porque é uma obrigação real e futura de caixa.
  - Exemplo: 13/08, Fatura Cartão Sicredi, R$ 7.281,07.
- Serve para previsão de caixa, para saber quanto será necessário pagar e para o Balanço Projetado (lado do caixa).
- A fatura **não é uma despesa gerencial**. É uma obrigação de caixa cuja composição gerencial são as compras individuais.

**Fatura — conferência e pagamento:**
- A fatura é conferida diretamente com o banco. João relaciona as despesas e normalmente os valores batem.
- Ela é paga **integralmente, num único pagamento**. Pagamento parcial, rotativo e parcelamento da fatura não fazem parte do fluxo normal.
- A Conciliação enxerga o pagamento da fatura como **um único débito bancário**, que confirma que a obrigação de caixa foi paga.

**Data gerencial:** as compras são reconhecidas no Balanço na **data em que a fatura correspondente é debitada/paga**, não na data da compra. Exemplo: compra em 20/07, fatura debitada em 13/08, despesa de agosto. A data da compra continua disponível para consulta. É uma escolha gerencial deliberada.

**Cartão × Balanço:**

| Item | No banco | No Balanço |
|---|---|---|
| Fatura | Um débito de R$ 7.281,07 | Nada (não é despesa) |
| Compras individuais | Não aparecem | Manutenção Frota R$ X, Informática R$ Y, EPI R$ Z… (categoria, obra, veículo quando aplicável) |

**Nunca:** compras individuais **mais** uma despesa "Fatura Cartão R$ 7.281,07".

**Gastos de cartão que não compõem o resultado** (ex.: CNH de funcionário):
- aparecem na fatura e participam do valor pago;
- são explicados na conferência da fatura;
- **não entram no Balanço como despesa** (Seção 7).

**Quando termina:** quando todas as compras da fatura estão relacionadas e classificadas e o débito da fatura está conciliado.

**O que segue adiante:**
- para a Agenda e a Conciliação: a fatura (valor e vencimento);
- para o Balanço: as compras individuais que compõem resultado, no período do débito da fatura.

---

## 9. Medições

**Objetivo:** registrar a realidade gerencial da obra. A Medição fornece a composição gerencial completa (receita, faturamento direto, impostos retidos) e o valor esperado no banco.

**Início:** a planilha oficial de Medição exigida pela cooperativa está pronta. O ERP **não substitui** essa planilha. A Medição é registrada quando houver informações suficientes.

### 9.1 Obra = pedido de compra/contrato

- **Cada novo pedido de compra ou contrato é uma nova Obra no sistema**, mesmo que seja continuação física do mesmo serviço.
  - Exemplo: "COAMO Ubiratã — Pedido 4500123" e "COAMO Ubiratã — Pedido 4500789" são duas Obras independentes.
- Cada Obra tem seus próprios valor contratado, medições, receitas, custos, saldo e resultado.
- O sistema **não** interpreta se o novo pedido é aditivo, continuação ou expansão. João/Cícero simplesmente cadastram uma nova Obra.
- Isso acompanha a forma como a empresa já organiza esses serviços em arquivos, medições, controles e acompanhamento.
- Não existe lógica de aditivos.

**Saldo contratual:**
- O saldo do contrato/pedido é consumido pelo **valor total da Medição**, que inclui o faturamento direto.
- O faturamento direto faz parte do valor medido. Ele é apenas descontado antes da emissão da NF e **não** reduz a base de consumo do contrato.
- **Não** se usa como consumo do contrato o valor da NF nem o valor líquido recebido.
- Uma Medição **não pode ultrapassar o saldo restante** do contrato/Obra (calculado pelo valor total).
- Isso vale para o controle de saldo, para o limite de Medições e para a comparação entre valor contratado e valor já medido.

Exemplo:

| Item | Valor |
|---|---|
| Contrato | R$ 1.000.000 |
| (−) Medição (valor total) | R$ 100.000 |
| **Saldo restante** | **R$ 900.000** |

Nessa Medição, a NF (R$ 80.000) e o líquido recebido (R$ 75.000) não são usados no cálculo do saldo.

### 9.2 Valores da Medição

| # | Valor | Significado | Exemplo |
|---|---|---|---|
| 1 | **Valor total da Medição** | Valor total do serviço medido. É o valor que consome o saldo do contrato | R$ 100.000 |
| 2 | **(−) Faturamento direto** | Pago diretamente pela cooperativa ou contratante a terceiros. É descontado **antes** da emissão da NF | R$ 20.000 |
| 3 | **= Valor bruto da NF** | Valor da NF emitida pela H. Vieira | R$ 80.000 |
| 4 | **(−) Impostos retidos** | Descontados da NF. Não geram pagamento posterior | R$ 5.000 |
| 5 | **= Valor líquido a receber** | Valor esperado no banco | R$ 75.000 |

Destinos de cada valor:
- **Contas a Receber** espera R$ 75.000.
- **A Conciliação** procura R$ 75.000.
- **O Balanço** representa a composição gerencial completa: receita da obra R$ 100.000, faturamento direto (custo) R$ 20.000, imposto retido R$ 5.000.
- **A entrada bancária de R$ 75.000 não cria outra receita.**

### 9.3 Quando a Medição entra no Balanço realizado

- **Enquanto não houver recebimento:** a Medição permanece **projetada**, com data prevista e valor esperado ajustáveis.
- **Quando o recebimento é conciliado:** a Medição passa a **realizada no período da entrada bancária**.
  - Exemplo: NF faturada em outubro e recebida em novembro pertence a **novembro** no Balanço realizado.
- A data de emissão da NF **não** é usada como competência do Balanço realizado.
- **Faturamento direto e imposto retido acompanham o mesmo período** em que o recebimento da Medição é reconhecido. Eles não esperam movimento bancário próprio, porque nunca passam individualmente pelo banco.
- **Divisão de papéis:**
  - a **Medição** fornece o **valor gerencial** (a composição);
  - o **banco** determina **quando** esse fato passa de projetado a realizado;
  - a Conciliação **não** determina sozinha o valor gerencial da receita de obra.
- Depois de conciliada corretamente, a Medição não deve ser alterada de forma que destrua a consistência do realizado sem uma nova correção ou conciliação.

### 9.4 Pagador e recebimento

- O pagador normalmente é a cooperativa. Em alguns contratos, uma construtora. O sistema não assume que é sempre uma cooperativa, apenas permite identificar corretamente quem pagou.
- O valor líquido (NF menos impostos retidos) normalmente é pago integralmente. Recebimento parcial ou glosa após a emissão não é rotina.
- **Várias Medições num único crédito:** a NF A (R$ X) e a NF B (R$ Y) podem vir numa única transferência de R$ X + Y. Um movimento confirma várias Medições ao mesmo tempo (Seção 6.6), e cada uma passa a realizada no período desse crédito.

**Quando termina:** quando o recebimento da Medição está conciliado.

**O que segue adiante:**
- para Contas a Receber: o valor líquido a receber;
- para a Conciliação: o valor líquido a procurar;
- para o Balanço: a composição (receita total, faturamento direto, imposto retido), no período do recebimento.

---

## 10. Faturamento Direto

- Existe **exclusivamente dentro de uma Medição**. Não existe como lançamento genérico fora dela.
- Representa materiais e serviços pagos diretamente pela cooperativa ou contratante (diesel, tubos, cascalho, materiais).
- É descontado do valor total da Medição **antes** da emissão da NF da H. Vieira (Seção 9.2).

O que ele é e o que ele não é:
- **é** custo da obra e **entra** no Balanço, no período do recebimento da Medição;
- **não** passa pela conta bancária da H. Vieira;
- **não** entra em Contas a Pagar nem em Contas a Receber;
- **não** é conciliado individualmente.

**Informações suficientes** (o controle atual é resumido):
- NF;
- fornecedor;
- categoria/tipo;
- descrição quando necessário;
- valor;
- obra/Medição.

**Não** é necessário relacionar faturamento direto a veículo, pois isso não é controlado de forma confiável hoje.

---

## 11. Impostos retidos

- Os impostos da Medição são normalmente **retidos na NF**. Exemplo: NF de R$ 80.000 com R$ 5.000 retidos gera R$ 75.000 a receber.
- O imposto retido:
  - **não** gera pagamento posterior;
  - **não** entra em Contas a Pagar;
  - **não** aparece como débito separado no banco;
  - é registrado como **dedução da Medição** e entra na análise gerencial, no período do recebimento da Medição.
- A alíquota **varia conforme a cidade da obra**. O valor ou a taxa é informado manualmente, sem alíquota universal.
- Se no futuro algum imposto for de fato pago depois pela empresa, ele segue o fluxo normal do Contas a Pagar.

---

## 12. Balanço Projetado e Realizado

**Balanço:**
- é a visão gerencial alimentada por várias fontes, **não** apenas o somatório da Conciliação;
- é um **critério gerencial interno**, não uma demonstração contábil oficial;
- o período realizado segue a leitura "o que efetivamente entrou e saiu naquele mês";
- deverá permitir filtros por obra, veículo, categoria, fornecedor, empresa e período. Em lançamentos e compras de cartão rateados, obra, veículo e categoria vêm das partes do rateio (Seção 18).

**Projetado:**
- é o que ainda é esperado;
- pode mudar de data e de valor;
- serve para planejamento: caixa, entradas, saídas e resultado futuro;
- usa as Agendas de Pagar e Receber (incluindo faturas de cartão, parcelas de financiamento e consórcio e recebimentos de Medição) e as Medições ainda não recebidas;
- um lançamento rateado entra no caixa projetado **pelo valor total**; a distribuição gerencial projetada usa as partes do rateio quando já informadas (Seção 18.4).

**Critério deliberadamente financeiro:** o Balanço não tenta reproduzir contabilidade oficial, competência, depreciação nem separação de principal e juros (Seção 5.6).

**Realizado:** é o que já aconteceu. Cada origem tem sua regra.

| Origem | Valor gerencial | Período realizado |
|---|---|---|
| **Despesas e receitas normais** (Agenda ou nascidas na Conciliação) | O do lançamento conciliado: pela classificação geral ou, se rateado, pelas partes do rateio (Seção 18) | Data do movimento bancário |
| **Medição** | Composição da Medição: receita total, faturamento direto (custo), imposto retido | Data do recebimento bancário conciliado |
| **Compras de cartão** | Cada compra individual (exceto reembolsáveis): pela classificação da compra ou, se rateada, pelas partes do rateio (Seção 18) | Data do débito da fatura |
| **Fatura de cartão** | Nenhum (só caixa) | — |
| **Bem pago à vista** | Valor integral pago, como despesa | Data do pagamento |
| **Entrada de bem financiado** | Valor da entrada própria, como despesa | Data do pagamento |
| **Parcela de financiamento ou consórcio** | Valor integral da parcela, como despesa | Data do pagamento |
| **Lance ou complemento de consórcio** (recursos próprios) | Valor pago, como despesa | Data do pagamento |
| **Liberação de financiamento** | Nenhum (só caixa) | — |
| **Contemplação/carta de crédito** | Nenhum | — |
| **Aquisição do bem com valor financiado ou carta** | Nenhum | — |
| **Transferência interna** | Nenhum (só saldos das contas) | — |
| **Retirada de proprietário** | Não é custo operacional | — |
| **Gasto reembolsável** | Nenhum | — |

---

## 13. Regras de não duplicidade

1. **Medição:** a receita gerencial (R$ 100.000) e sua composição vêm da Medição. O crédito de R$ 75.000 só confirma o recebimento e define o período. Não cria nova receita.
2. **Faturamento direto:** é custo dentro da Medição, já descontado antes da NF. Não passa pelo banco, não vira Conta a Pagar e não é conciliado.
3. **Imposto retido:** é dedução da Medição. Não vira Conta a Pagar nem débito bancário.
4. **Cartão:** as despesas são as compras individuais (e seus rateios, quando houver). A fatura na Agenda e o seu débito bancário são só caixa. Nunca existe despesa "Fatura Cartão", e a fatura nunca é rateada.
5. **Bens, financiamentos e consórcios:** a despesa é sempre e somente o dinheiro próprio efetivamente pago (à vista, entrada, parcela, lance, complemento).
   - Liberação de financiamento e contemplação/carta de crédito **não são receita**.
   - O valor financiado e o valor da carta usados na aquisição do bem **não** geram despesa.
   - Nunca se somam a compra total do bem, a entrada e as parcelas como despesas simultâneas.
6. **Transferência interna:** sai de uma conta e entra em outra, sem receita nem despesa.
7. **Itens reembolsáveis:** participam do caixa, não do resultado. A compensação posterior não é receita.
8. **Parcelas:** cada parcela é um lançamento próprio. Nunca existe um total mais as partes.
9. **OFX:** o mesmo movimento importado mais de uma vez existe uma única vez.
10. **Saldo contratual:** consumido só pelo valor total da Medição. A NF e o líquido recebido não consomem o saldo uma segunda vez.
11. **Rateio:** num lançamento ou compra de cartão rateados, as partes **substituem** a classificação geral. Nunca se somam o valor total classificado e as partes, e as partes nunca viram movimentos bancários separados (Seção 18).

---

## 14. Exceções operacionais importantes

| Situação | Tratamento |
|---|---|
| Pagamento ou recebimento não programado | Nasce na Conciliação, completado ali mesmo |
| Valor real diferente do programado | Banco prevalece; sistema sugere, usuário confirma |
| Data programada passou e não foi paga | Fica visualmente evidente; sem julgamento automático de "atraso" nem prioridade |
| Pagamento adiado por falta de dinheiro ou indefinição | Decisão humana; o usuário remarca a data se quiser |
| Despesa de uma empresa paga pela conta de outra | Permitido; a conta real é definida pelo banco |
| Um movimento cobrindo vários itens ou Medições | Vínculo de um para vários |
| Item conciliado editado e que deixou de bater | Volta a Não conciliado e é reconciliado |
| Vínculo errado | Alterado ou desfeito com facilidade |
| Gasto de cartão reembolsável | Explica a fatura, não entra no resultado |
| NF faturada num mês e recebida em outro | Realizada no mês do recebimento |
| Novo pedido de compra/contrato | Nova Obra |
| Recorrência encerrada | Para de gerar lançamentos e não é recriada |
| Migração de financiamento ou consórcio já em andamento | Gera só as parcelas restantes |
| Bem comprado à vista com recursos próprios | Despesa integral no mês do pagamento; mês muito negativo é aceito |
| Pagamento único de um bem misturando entrada própria e valor financiado | Só a parte própria é despesa |
| Medição que excederia o saldo do contrato | Não permitida; o excedente é novo pedido/contrato, portanto nova Obra |
| Uma NF ou compra de cartão com vários veículos, categorias ou destinos | Um único lançamento ou compra, rateado gerencialmente (Seção 18) |
| Valor total de um lançamento rateado alterado (raro) | O usuário ajusta manualmente as partes até a soma voltar a 100% do total (Seção 18.7) |

---

## 15. Pontos explicitamente deixados para o Passo 2 (ou depois)

**Passo 2 (interface):**
- forma da Agenda de Pagar e Receber (incluindo o destaque de data passada e a apresentação da fatura de cartão);
- edição rápida estilo planilha na Conciliação, inclusive em várias linhas;
- forma de cadastrar séries de parcelas, recorrências, financiamentos e consórcios, e de encerrar recorrências;
- forma de registrar a parte própria e a parte financiada num pagamento de bem;
- apresentação do saldo contratual da Obra;
- visão diária do patrão;
- concentração do fluxo de Cartão (hoje fragmentado em compras, faturas e parcelas) num fluxo único e simples;
- registro da Medição e da sua composição;
- apresentação das sugestões forte e aproximada e do vínculo de um movimento para vários itens;
- forma de informar o rateio de um lançamento ou compra de cartão, e forma de avisar, validar ou impedir que se salve um rateio cuja soma não corresponda ao valor total (Seção 18).

**Técnico, depois do Passo 2:**
- estratégia de detecção de duplicidade do OFX e validação com arquivos OFX reais;
- nome e classificação técnica dos movimentos fora do resultado operacional (Seção 7);
- campos obrigatórios do controle de financiamentos e consórcios na primeira versão (Seção 5.5);
- eventual controle patrimonial de bens, sem efeito no Balanço Gerencial;
- eventual separação futura de principal, juros e encargos, só se houver fonte confiável e prática (Seção 5.6).

---

## 16. Decisões antigas substituídas por estas regras

Estas regras prevalecem. A documentação técnica correspondente **não foi alterada** nesta etapa e deverá ser revisada quando cada mudança for implementada.

| Regra antiga | Onde | Substituída por |
|---|---|---|
| Estado "Divergente" visível ao usuário | `decisions.md` #51; `domain-model/14` | Só Não conciliado e Conciliado (Seção 6.3) |
| "Mesma Empresa" como critério obrigatório de compatibilidade | `decisions.md` #51; `VinculoConciliacaoService` | Empresa é só auxiliar (Seção 6.5) |
| Sugestão só com valor exato | `decisions.md` #51 | Dois níveis, forte e aproximado (Seção 6.4) |
| Realizado = soma dos lançamentos conciliados | `decisions.md` #51; `ConsultasFinanceirasService` | Realizado com várias origens, cada uma com valor e período próprios (Seção 12) |
| Líquido da Medição = bruto − faturamento direto − impostos, sem separar o valor da NF | `pendencias.md` Seção 9; `handoff.md` Seção 27 | Total − faturamento direto = NF; NF − retenções = líquido (Seção 9.2) |
| Impostos da Medição entram em Contas a Pagar e são conciliados | `pendencias.md` Seção 9; `handoff.md` Seção 27; `roadmap.md` (Sprint 4) | Impostos retidos, como dedução da Medição (Seção 11) |
| Faturamento direto com veículo próprio por item | `pendencias.md` Seção 9, decisão 11 da rodada | Sem veículo; controle resumido (Seção 10) |
| Saldo contratual e aditivos como parte da Obra (Sprint 4) | `roadmap.md`; `pendencias.md` Seção 9 | Cada pedido/contrato é uma Obra; sem aditivos (Seção 9.1) |
| Despesa de cartão nasce da Parcela no vencimento; só compras "Terraplanagem" geram lançamento | `domain-model/18`, `19`, `21`; `ParcelaService` | Compra individual reconhecida no débito da fatura; reembolsáveis fora do resultado (Seção 8) |
| Fatura com totais congelados; "paga" derivada da conciliação dos lançamentos de Parcela | `domain-model/19`; `decisions.md` #6 e #51 | Fatura como obrigação de caixa na Agenda, conciliada como débito único (Seção 8) |
| Contrato Financeiro (financiamento/consórcio) gera todas as parcelas desde a primeira | `decisions.md` #40 | Série a partir da parcela atual, cada parcela editável (Seções 5.3 e 5.5) |
| Saldo devedor do contrato = soma das parcelas em aberto, sem decompor principal/juros | `decisions.md` #9 | **Mantido e compatível.** Acrescenta o critério gerencial de parcela integral como despesa e liberação/contemplação como não receita (Seção 5.6) |
| Financiamento listado como "outra receita" | Versão anterior deste documento | Liberação não é receita (Seções 5.6 e 7) |
| Nenhum critério gerencial para compra de bens, entrada, lance, complemento ou carta de consórcio | Inexistente | Dinheiro próprio pago é despesa no período; valor financiado e carta não são (Seção 5.6) |
| Saldo contratual sem base definida | Versão anterior deste documento | Consumido pelo valor total da Medição (Seção 9.1) |
| Recorrência sem fim | Inexistente | Nova (Seção 5.4) |
| Forma de pagamento e "parcela 1/2" no lançamento | Inexistentes | Novas informações (Seção 3) |
| Movimentação nasce por digitação manual de item de extrato; OFX bloqueado | `pendencias.md` Seção 9 (Sprint 5); `MovimentacaoBancariaService#importar` | OFX como fonte oficial, ~2x por dia, sem duplicar (Seção 6.1) |
| Contas a Pagar/Receber apenas como filtro da listagem de Lançamentos | `decisions.md` #51 (Sprint 3) | Agendas de pagamentos e recebimentos; forma no Passo 2 (Seções 3 e 4) |
| Rateio de Despesa só entre Obras, exigindo `obra` vazia no lançamento; sem rateio em compra de cartão | `domain-model/16`; `domain-model/09` Seção 4; `RateioDespesaService`; `LancamentoFinanceiroService` | Rateio gerencial de lançamentos e de compras individuais de cartão: cada parte com valor e, quando aplicável, categoria, obra, veículo e complemento; as partes substituem a classificação geral (Seção 18) |
| Tolerância do Rateio exclusivamente técnica (arredondamento) | `decisions.md` #10 | **Compatível.** Soma das partes = valor total do lançamento (Seção 18.3) |
| Classificações "Retirada do Patrão" e "Fora da Operação" na Movimentação | `domain-model/12`; `MovimentacaoBancaria` | **Conceito mantido** (fora do resultado operacional). Nomes e lista finais ficam para depois (Seção 7) |

---

## 17. Revisão crítica final

| # | Verificação | Resultado |
|---|---|---|
| 1 | Bem à vista impacta diretamente o resultado | ✔ Seção 5.6, Caso 1; Seção 12 |
| | Entrada com recurso próprio impacta o resultado | ✔ Seção 5.6, Caso 2 |
| | Parcela integral de financiamento ou consórcio impacta o resultado | ✔ Seção 5.6; Seção 12 |
| | Liberação de financiamento não é Receita | ✔ Seções 5.6 e 7 |
| | Contemplação de consórcio não é Receita | ✔ Seções 5.6 e 7 |
| | Uso do valor financiado ou da carta não gera segunda despesa | ✔ Seção 5.6; Seção 13.5 |
| | Sem dupla contagem entre compra, entrada, parcelas, lance, complemento e carta | ✔ Seção 5.6 ("Nunca"); Seção 13.5 |
| 2 | Saldo do contrato consumido pelo valor total da Medição | ✔ Seção 9.1; Seção 13.10 |
| | Faturamento direto faz parte do valor medido | ✔ Seções 9.1 e 9.2 |
| | NF pode ser menor que o valor total da Medição | ✔ Seção 9.2 |
| | Imposto retido reduz o líquido recebido e não vira Conta a Pagar | ✔ Seções 9.2 e 11 |
| | Valor líquido é o esperado em Receber e o conciliado no banco | ✔ Seções 4, 6.4 e 9.2 |
| 3 | Medição projetada até o recebimento | ✔ Seção 9.3 |
| | Realizada no período da entrada bancária | ✔ Seção 9.3 |
| | Faturamento direto e imposto retido acompanham esse período | ✔ Seções 9.3, 10 e 11 |
| 4 | Critério gerencial deliberadamente financeiro | ✔ Seções 2, 5.6 e 12 |
| | Sem reproduzir contabilidade oficial | ✔ Seções 5.6 e 12 |
| | Sem dupla contagem em nenhuma origem | ✔ Seção 13 |
| 5 | Financiamentos e consórcios com parcelas independentes e editáveis | ✔ Seções 5.3 e 5.5 |
| | Cadastro a partir da parcela atual na migração | ✔ Seções 5.3 e 5.5 |
| | Recorrências sem fim encerráveis e não recriadas | ✔ Seção 5.4 |
| — | Fatura de cartão na Agenda, sem despesa duplicada | ✔ Seções 8 e 13.4 |
| — | Novo pedido/contrato = nova Obra | ✔ Seção 9.1 |
| — | Conciliação mostra tudo, e nem todo movimento é Receita ou Despesa | ✔ Seções 6 e 7 |
| — | OFX sem duplicidade | ✔ Seção 6.1 |
| — | Nenhuma decisão de interface inventada | ✔ |

**Consequências observadas** (não são contradições, são efeitos das decisões tomadas):

1. **Projetado × realizado do cartão.** Entre o fechamento da fatura e a classificação das compras, o caixa projetado já conhece o valor da fatura, mas o resultado projetado ainda não tem as compras. Isso é coerente com o processo, em que João classifica as compras na conferência da fatura.
2. **Medição faturada e não recebida no fim do mês.** Aparece no Projetado e não no Realizado daquele mês, junto com o seu faturamento direto e o imposto retido.
3. **Compra de bem à vista.** Pode gerar um mês com resultado muito negativo. Isso é aceito conscientemente.
4. **Pagamento único que mistura recurso próprio e financiado.** Só a parte própria é despesa (Seção 5.6). A forma de registrar essa separação é tema do Passo 2.
5. **Alcance do critério "pago com recursos próprios = despesa".** Aplica-se a bens, entradas, financiamentos e consórcios. Não revoga as regras explícitas da Seção 7 (transferências internas, reembolsáveis e retiradas de proprietário continuam fora da despesa operacional).

**Nenhuma contradição operacional real permanece.** Os pontos D1 a D5, P1 e P2 foram decididos e incorporados.

---

## 18. Regra complementar — Rateio gerencial

> **Regra operacional complementar identificada durante a modelagem da interface (Passo 2).** Não reabre o Passo 1. Complementa a forma como uma despesa é classificada gerencialmente e como o Balanço a interpreta.

### 18.1 Regra e alcance

> Uma despesa individual que compõe o Balanço pode possuir rateio gerencial quando seu valor precisar ser distribuído entre múltiplas categorias, obras, veículos ou outros destinos gerenciais previstos.

**Alcance atual:**
- **lançamentos financeiros comuns** (Agenda/Contas a Pagar ou nascidos na Conciliação);
- **compras individuais de cartão** (Seção 8).

Não se generaliza para outras origens ainda não discutidas.

**A fatura do cartão nunca recebe rateio.** Ela continua só agrupando as compras do ciclo, aparecendo na Agenda como obrigação de caixa, sendo paga num único débito e sendo conciliada com o movimento bancário. O Balanço recebe as despesas pelas compras individuais e seus rateios. Ratear a fatura criaria dupla contagem.

**Exemplos reais:**
- NF de oficina de R$ 6.000: R$ 2.500 do Caminhão 12, R$ 1.500 do Caminhão 17 e R$ 2.000 da Escavadeira 01.
- Compra no cartão de R$ 6.000: R$ 2.500 Manutenção (Caminhão 12), R$ 1.500 Manutenção (Caminhão 17), R$ 2.000 Material (sem veículo).

Em ambos os casos o pagamento continua sendo **um só**. A regra não é um simples "rateio por veículo": cada parte pode ter também categoria e outros destinos próprios.

### 18.2 Despesa não rateada e despesa rateada

Um lançamento ou compra de cartão pode ser:
1. **Não rateado** — a maior parte dos casos. A classificação geral (categoria, obra, veículo) representa o valor integral.
   - Exemplo: Posto X, R$ 4.300, Combustível, obra Vera MT, Caminhão 12. Não há partes.
2. **Rateado** — o valor total é dividido em **partes de rateio**, cada uma uma parcela **gerencial** do total.

O rateio **não é obrigatório**.

**O que pertence ao lançamento como um todo** (o compromisso financeiro):
- data/vencimento;
- empresa;
- fornecedor;
- descrição geral;
- documento/NF;
- parcela;
- forma de pagamento;
- valor total.

Na compra de cartão, os dados próprios da compra (Seção 8) continuam pertencendo à compra como um todo.

**O que cada parte de rateio pode ter:**
- valor;
- categoria;
- obra, quando aplicável;
- veículo, quando aplicável;
- descrição/complemento, quando necessário.

Veículo e obra **não** são obrigatórios em todas as partes.

### 18.3 Regra de 100% do valor

> **Um rateio só é consistente quando a soma das partes do rateio é igual ao valor total do lançamento (ou da compra).**

- **Correto:** lançamento de R$ 10.000 com partes de R$ 4.000 + R$ 3.000 + R$ 3.000.
- **Incompleto:** lançamento de R$ 10.000 com partes de R$ 4.000 + R$ 3.000. Os R$ 3.000 restantes precisam virar uma parte explícita, mesmo sem veículo, sem obra ou como despesa geral.

Nenhum valor fica implicitamente "sem destino".

### 18.4 Balanço: as partes substituem a classificação geral

| Despesa | O Balanço usa |
|---|---|
| Sem rateio | A classificação geral |
| Com rateio | **Somente** as partes do rateio |

Quando há rateio, o Balanço **nunca** usa ao mesmo tempo o valor total classificado e as partes. Isso criaria, por exemplo, uma despesa fictícia de R$ 20.000 para um lançamento de R$ 10.000.

Exemplo: uma NF de R$ 8.000 com R$ 5.000 de Manutenção (Caminhão 01) e R$ 3.000 de Material de Obra (sem veículo) aparece como Manutenção R$ 5.000 e Material de Obra R$ 3.000. Nunca como Manutenção R$ 8.000 nem como Material R$ 8.000.

**Projeção:** enquanto projetado, o lançamento participa da projeção de caixa **pelo valor total**. Quando a distribuição já está informada, a análise gerencial projetada a conhece. O rateio **não** multiplica nem altera o total projetado. Um lançamento projetado de R$ 10.000 rateado em R$ 4.000 + R$ 3.000 + R$ 3.000 projeta R$ 10.000 de saída, nunca R$ 20.000.

### 18.5 Agenda e Conciliação usam o valor total

- **Conciliação trabalha com o valor total; o rateio trabalha com a distribuição gerencial desse valor.**
- **Na Agenda/Contas a Pagar**, o compromisso continua único. Exemplo: "15/10 — Oficina X — NF 1234 — R$ 10.000". Ele **não** vira três contas a pagar.
- **Na Conciliação**, o movimento bancário de R$ 10.000 é relacionado ao lançamento de R$ 10.000. A Conciliação **não** procura movimentos de R$ 4.000, R$ 3.000 e R$ 3.000. O Balanço distribui os mesmos R$ 10.000 pelo rateio.
- No cartão, a Conciliação relaciona o débito da fatura. As compras e seus rateios só compõem o Balanço.
- As partes do rateio **nunca** viram movimentos bancários separados.

### 18.6 Rateio não é parcelamento nem vínculo múltiplo

| Conceito | O que é | Exemplo |
|---|---|---|
| **Parcelamento** (Seção 5.2) | Vários lançamentos financeiros independentes, cada um com vencimento, valor e conciliação próprios | NF de R$ 10.000 paga em 1/2 R$ 4.000 e 2/2 R$ 6.000 = dois lançamentos |
| **Vínculo de um movimento a vários lançamentos** (Seção 6.6) | Um movimento bancário relacionado a vários lançamentos | COAMO paga R$ 80.000 cobrindo receitas de R$ 50.000 e R$ 30.000 |
| **Rateio** | Uma única despesa com várias classificações gerenciais internas | Lançamento único de R$ 10.000: R$ 4.000 veículo A, R$ 3.000 veículo B, R$ 3.000 material |

Os três conceitos são independentes e não se confundem.

### 18.7 Alteração do valor de uma despesa rateada

Caso raro. Não há fluxo especial, status adicional nem classificação automática no Balanço.

Quando ocorre:
1. o usuário altera manualmente o valor do lançamento (inclusive durante a Conciliação, quando o banco mostra outro valor);
2. ele também corrige manualmente as partes do rateio;
3. a soma das partes volta a corresponder a 100% do valor total.

Exemplo: lançamento de R$ 10.000 rateado em R$ 4.000 + R$ 3.000 + R$ 3.000. A Conciliação confirma R$ 9.500. O usuário ajusta o lançamento e o rateio para R$ 4.000 + R$ 3.000 + R$ 2.500.

O sistema **não** faz automaticamente redistribuição proporcional, divisão igual, alteração de uma das partes nem criação de diferença.

A forma de avisar, validar ou impedir que um rateio inconsistente seja salvo fica para o Passo 2.

### 18.8 Compatibilidade com as regras já fechadas

| # | Regra existente | Situação |
|---|---|---|
| 1 | Cada pagamento parcial/parcela é um lançamento independente | ✔ Preservada (18.6) |
| 2 | Um movimento bancário pode corresponder a vários lançamentos | ✔ Preservada e distinta do rateio (18.6) |
| 3 | Lançamento rateado corresponde ao seu valor total na Conciliação | ✔ (18.5) |
| 4 | O banco é a verdade do que entrou e saiu | ✔ O rateio não altera nenhum valor financeiro |
| 5 | Rateio existe para análise gerencial | ✔ (18.2 e 18.4) |
| 6 | Balanço não duplica o total e as partes do rateio | ✔ (18.4; Seção 13.11) |
| 7 | Transferências internas fora de Receita/Despesa | ✔ Não afetada |
| 8 | Fatura de cartão sem despesa duplicada | ✔ A fatura não é rateada; só as compras individuais (18.1; Seção 13.4) |
| 9 | Medição sem receita duplicada pela Conciliação | ✔ Não afetada. O faturamento direto existe só dentro da Medição, fora do alcance do rateio, e continua sem relação com veículo (Seção 10) |
| 10 | Financiamentos seguem o critério gerencial aprovado | ✔ O rateio só distribui o valor reconhecido, nunca o altera |
| 11 | Lançamentos continuam editáveis | ✔ (18.7) |
| 12 | Total do rateio corresponde ao valor do lançamento | ✔ (18.3 e 18.7) |

**Nenhuma contradição real com as decisões existentes.**

---

## PASSO 1 — FLUXOS OPERACIONAIS: FECHADO.

Este documento, incluindo a regra complementar da Seção 18, é a referência operacional oficial para o Passo 2 (wireframes/interface). A documentação técnica do projeto (Seção 16) será revisada quando cada mudança for implementada.
