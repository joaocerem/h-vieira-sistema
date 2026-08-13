# Análise Complementar — Cenário A vs. Cenário B da Compra Retroativa
## Sistema Financeiro/Gerencial H Vieira Terraplanagem

**Origem**: hipótese levantada antes de fechar a pendência do Ponto 2 de `analise-lacunas-parcela-fatura.md` — a análise anterior tratou "compra retroativa" como um fenômeno único, mas pode ser dois processos diferentes.

**Escopo**: só esta verificação. Nenhum documento alterado, nenhuma decisão consolidada. Objetivo: confirmar (ou não) se existe distinção de negócio real, e, se existir, dizer com precisão o que muda.

---

## RESPOSTA DIRETA

**A hipótese procede. Cenário A e Cenário B não deveriam seguir a mesma regra — são processos diferentes, com uma diferença que importa diretamente ao problema já analisado.** A recomendação anterior (Alternativa 2.B — "a Parcela vai para o próximo ciclo aberto") continua correta, mas **só para o Cenário A**. Aplicada ao Cenário B, ela estaria errada. Isso não invalida a análise anterior — ela precisava desta distinção para ficar completa, e é exatamente para isso que serve esta verificação antes de fechar a pendência.

---

## 1. RECONSTRUÇÃO DOS DOIS CENÁRIOS, LADO A LADO

| | **Cenário A** — lançamento manual retroativo | **Cenário B** — importação de Fatura histórica |
|---|---|---|
| **O que entra no sistema primeiro** | Uma `COMPRA_CARTÃO` isolada, digitada pelo usuário, com uma `data` no passado | Uma `FATURA` inteira, com sua composição completa (todas as Compras/Parcelas que a formam), trazida de uma vez pela importação |
| **De onde vem a informação de "a que Fatura isso pertence"** | **Não vem de lugar nenhum** — o usuário só informa a data do fato; o sistema precisa **inferir/decidir** a Fatura de destino por uma regra, porque a informação não foi dada explicitamente | **Vem pronta, junto com o dado importado** — o próprio banco/operadora já diz, como fato, "esta Compra fez parte da Fatura de maio" |
| **Direção do fluxo de criação** | Compra → Parcela → (procura por uma Fatura) | Fatura → (traz consigo) → Compra → Parcela |
| **Natureza da fonte** | Digitação humana, sujeita a atraso, esquecimento, erro de data | Fonte externa autoritativa (o extrato oficial do cartão) — o mesmo tipo de fonte que o conceitual já trata como "fato puro" em `MOVIMENTAÇÃO_BANCÁRIA` |
| **Existe ambiguidade real a resolver?** | Sim — é exatamente o problema que a análise anterior resolveu (Alternativa 2.B) | Não — a resposta já vem dada; não há nada para o sistema "decidir" sobre qual Fatura, só registrar o que foi informado |
| **Previsão no conceitual** | Cadastro manual, já previsto desde o catálogo original (`COMPRA_CARTÃO`: "Digitação manual") | Também já previsto: `COMPRA_CARTÃO` lista explicitamente "ou futura importação de fatura" como origem alternativa (Seção 3 do conceitual) — **não é um cenário inventado nesta análise**, já estava latente no modelo, só não havia sido examinado com este nível de detalhe |

---

## 2. POR QUE OS DOIS CENÁRIOS JUSTIFICAM COMPORTAMENTOS DIFERENTES

A diferença central não é "quem faz a ação" (usuário vs. sistema) — é **se existe ou não uma ambiguidade real a ser resolvida por uma regra**.

No Cenário A, o sistema **precisa decidir** algo que não lhe foi informado: a Compra tem uma data de maio, mas ninguém disse "isto pertence à Fatura de maio" — essa associação não existe como dado, só como inferência possível a partir da data. É exatamente por essa ambiguidade que a Alternativa 2.B faz sentido: na ausência de uma indicação melhor, e para não reabrir uma Fatura já fechada e paga, a regra mais segura é atribuir ao próximo ciclo ainda aberto.

No Cenário B, **não existe essa ambiguidade** — a associação Compra↔Fatura não é inferida, é **declarada** pela fonte de dados. Aplicar a regra "vai para o próximo ciclo aberto" ao Cenário B seria, na prática, **descartar uma informação verdadeira e autoritativa** (a Fatura real, informada pelo banco) em favor de uma Fatura artificial e incorreta (a próxima aberta no sistema) — isso produziria uma Fatura no sistema que não corresponde à Fatura real do banco, exatamente o tipo de divergência que o módulo de Conciliação existe para capturar e nunca resolver silenciosamente (Seção 6 do conceitual: "divergência de valor nunca é conciliada automaticamente — sempre fica para revisão humana"). Forçar uma compra importada para o ciclo errado seria o oposto disso — uma divergência sendo **escondida** por uma regra automática, em vez de exposta.

Portanto, os dois cenários não são a mesma pergunta feita duas vezes — são duas perguntas diferentes: Cenário A pergunta "que Fatura devo atribuir, já que não sei?"; Cenário B pergunta "como registro a Fatura que já sei qual é?".

---

## 3. QUAL ENTIDADE É RESPONSÁVEL EM CADA FLUXO

### Cenário A
- `COMPRA_CARTÃO` nasce por ação do Usuário (digitação manual).
- `PARCELA` é calculada pelo Sistema a partir da Compra, imediatamente.
- **A atribuição à Fatura é responsabilidade do processo de fechamento de ciclo do Cartão** — o mesmo mecanismo já estabelecido na Alternativa A aprovada (`analise-pendencia-fatura-parcela-compra.md`), que reivindica Parcelas para a Fatura do ciclo corrente no momento em que esse ciclo fecha. Não é a Compra, nem a Parcela, nem o Usuário quem decide isso — é a regra ligada a `CARTÃO_CRÉDITO.dia_fechamento`.

### Cenário B
- `FATURA` nasce (ou é atualizada — ver Seção 4) diretamente do processo de importação, como unidade primária de entrada — não como efeito colateral de um fechamento de ciclo local.
- `COMPRA_CARTÃO` e `PARCELA` nascem **já vinculadas** à Fatura importada — a vinculação chega pronta, não é calculada pelo mecanismo de fechamento de ciclo.
- **A responsabilidade pela associação é do próprio processo de importação** — ele é quem declara a composição da Fatura, não quem infere. O mecanismo de "fechamento de ciclo" do Cenário A simplesmente não participa deste fluxo.

Essa é uma diferença estrutural real, não só de origem do dado: **no Cenário A, a Fatura é o resultado de um cálculo sobre Parcelas já existentes; no Cenário B, a Fatura é o ponto de partida, e as Parcelas nascem a partir dela.** São dois fluxos de responsabilidade em sentidos opostos.

---

## 4. ISSO MUDA A RECOMENDAÇÃO ANTERIOR?

**Sim, de uma forma específica — não uma reversão, uma delimitação de escopo que a análise anterior não tinha.**

### O que continua válido, sem alteração
- **Ponto 1 (estado da Parcela antes da Fatura, Opção 1.A — ausência de vínculo é suficiente)**: continua válido, mas com uma qualificação que não estava explícita antes: esse estado transitório ("Parcela sem Fatura ainda") **só existe no Cenário A**. No Cenário B, a Parcela nasce **já com a Fatura vinculada**, porque toda a informação chega pronta e de uma vez — não há intervalo de espera, porque não há "próximo fechamento de ciclo" a aguardar. Isso não invalida a recomendação — só esclarece que ela descreve o fluxo orgânico (Cenário A), não o fluxo de importação (Cenário B).

### O que precisa ser delimitado
- **Ponto 2 (Alternativa 2.B — "a Parcela vai para o próximo ciclo aberto")**: essa recomendação **vale apenas para o Cenário A**. Para o Cenário B, ela não deveria ser aplicada — a Fatura de destino já é conhecida, não precisa ser inferida por regra nenhuma. O Cenário B precisa de uma resposta própria, ainda não dada, com pelo menos duas variações internas que também precisam ser distinguidas:

  - **Sub-caso B1 — a Fatura daquele ciclo já existe no sistema** (ex.: foi fechada normalmente pelo fluxo orgânico, com base em compras lançadas manualmente, e a importação revela uma compra que faltava). Aqui **sim** existe um conflito real com a imutabilidade de uma Fatura já fechada — potencialmente já paga —, parecido com o que a Alternativa 2.A da análise anterior descrevia como problemático. A diferença é que, aqui, a correção não vem de uma digitação humana de segunda mão, vem de uma fonte autoritativa (o extrato real do banco) — o que muda a natureza da situação: não é mais "o usuário errou a data", é "o sistema estava incompleto, e agora sabemos a verdade". Isso se parece mais com o papel que `AJUSTE_FINANCEIRO` cumpre para Lançamentos — registrar a diferença como uma correção explícita e rastreável, sem reescrever silenciosamente o valor original — do que com qualquer uma das quatro alternativas descritas antes para o Cenário A. Vale notar: a Alternativa 2.D da análise anterior (mecanismo dedicado de "correção de fatura"), que eu havia classificado como desproporcional **para o Cenário A**, pode não ser desproporcional para este sub-caso específico do Cenário B — a proporcionalidade de uma solução depende do problema que ela resolve, e este é um problema diferente.
  - **Sub-caso B2 — a Fatura daquele ciclo ainda não existe no sistema** (ex.: importação histórica de um período anterior ao uso do sistema, ou de um mês que simplesmente nunca foi processado). Aqui **não há conflito nenhum de imutabilidade** — a Fatura está sendo criada corretamente, pela primeira e única vez, com sua composição real completa. Isso não é "reabrir um livro fechado", é "escrever a história corretamente, de uma vez". Nenhuma das quatro alternativas da análise anterior precisa ser invocada aqui — é o caminho mais simples possível, sem tensão com nenhum princípio já estabelecido.

**Nenhuma dessas duas variações do Cenário B foi resolvida nesta verificação** — o objetivo aqui era só confirmar que a distinção existe e localizar com precisão onde ela afeta a pendência já analisada. A escolha de mecanismo para o sub-caso B1 fica como uma decisão nova, ainda em aberto.

---

## 5. RESUMO

| Pergunta | Resposta |
|---|---|
| Cenário A e Cenário B devem seguir a mesma regra? | **Não.** São processos diferentes: A resolve uma ambiguidade por inferência; B registra um fato já declarado por fonte externa. |
| Por quê? | Porque a origem da informação "a que Fatura isso pertence" é oposta nos dois casos — inferida em A, dada em B — e aplicar a regra de A (ir para o próximo ciclo aberto) em B descartaria uma informação verdadeira, criando exatamente o tipo de divergência escondida que o conceitual proíbe. |
| Quem é responsável em cada fluxo? | Em A, o mecanismo de fechamento de ciclo do Cartão (já existente na Alternativa A aprovada). Em B, o próprio processo de importação, que declara a composição da Fatura em vez de calculá-la. |
| Isso altera as recomendações anteriores? | O Ponto 1 permanece válido, com o esclarecimento de que o estado transitório descrito só existe no Cenário A. O Ponto 2 (Alternativa 2.B) permanece válido, mas **só para o Cenário A** — o Cenário B precisa de uma resposta própria, ainda não decidida, com uma distinção adicional entre Fatura já existente no sistema (sub-caso B1, mais próximo do papel do Ajuste Financeiro) e Fatura ainda inexistente (sub-caso B2, sem conflito nenhum). |

**Nada foi decidido de forma definitiva.** O Cenário B (e sua sub-divisão B1/B2) fica como uma nova pendência a ser analisada com o mesmo rigor, se e quando você quiser avançar nela. Aguardo sua orientação antes de qualquer atualização de documento.
