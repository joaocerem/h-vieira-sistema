# Análise das Lacunas da Alternativa A — Estado da Parcela e Compra Retroativa
## Sistema Financeiro/Gerencial H Vieira Terraplanagem

**Origem**: as duas lacunas registradas ao final de `analise-pendencia-fatura-parcela-compra.md`, Seção 8, após aprovação da Alternativa A (vínculo `Parcela → Fatura` armazenado explicitamente, atribuído no fechamento do ciclo).

**Escopo**: só estes dois pontos. Nenhum documento alterado, nenhuma implementação, nenhuma decisão consolidada — apenas análise e recomendação, aguardando aprovação.

---

## PONTO 1 — ESTADO DA PARCELA ENTRE O NASCIMENTO E A CRIAÇÃO DA FATURA CORRESPONDENTE

### Reconstrução do intervalo em questão

Pela Alternativa A já aprovada: a `PARCELA` nasce imediatamente no momento da Compra (ou do Contrato Financeiro), com `vencimento` já definido — mas a `FATURA` do ciclo correspondente só nasce depois, quando o Cartão fecha esse ciclo (`dia_fechamento`). Entre esses dois momentos, a Parcela existe, mas ainda não tem uma Fatura à qual pertencer. Esse intervalo pode durar de poucos dias a vários meses (para a última parcela de um parcelamento longo).

Vale notar, adicionalmente, que este intervalo tem duas fronteiras diferentes que merecem ser distinguidas: **(a)** entre o nascimento da Parcela e o fechamento do ciclo que a reivindica (quando ela ganha vínculo com uma Fatura), e **(b)** entre esse fechamento e o `vencimento` da própria Parcela (quando ela efetivamente gera o `LANÇAMENTO_FINANCEIRO`, "ao vencer"). São dois eventos distintos no tempo — o fechamento do ciclo (que atribui a Fatura) tipicamente acontece **antes** do vencimento (que é quando a fatura fica devida para pagamento). Isso significa que existem, na prática, **duas perguntas de estado diferentes** sobre uma Parcela: "ela já pertence a uma Fatura?" e "ela já venceu/gerou Lançamento?" — e a pergunta feita nesta etapa é só sobre a primeira.

### As duas opções

**Opção 1.A — A ausência de vínculo com Fatura é, por si só, suficiente**

Nenhum valor de status novo é criado. Uma Parcela sem `Fatura` associada é, por definição, uma Parcela "ainda não reivindicada por nenhum ciclo fechado". Uma consulta como "parcelas aguardando fatura" seria simplesmente "todas as Parcelas com `Fatura` vazia".

- **Vantagens**: nenhuma informação nova a manter; consistente com o princípio 8 do conceitual (não armazenar o que é diretamente derivável de outro dado já existente); nenhum risco de duas fontes dizendo coisas diferentes sobre o mesmo fato.
- **Desvantagens**: quem for construir uma consulta/relatório precisa saber filtrar "por ausência", em vez de um rótulo direto — um custo pequeno e puramente de conveniência de consulta, não de modelagem.

**Opção 1.B — Um valor de status dedicado (ex. algo como "Aguardando Fatura")**

Um valor específico no campo `status` da Parcela representaria explicitamente esse intervalo.

- **Vantagens**: mais direto para relatório/consulta, sem precisar de uma condição de exclusão.
- **Desvantagens**: cria uma segunda fonte para o mesmo fato — o valor do status precisaria permanecer sincronizado com a existência real do vínculo com a Fatura. Se, por qualquer falha, o vínculo for atribuído mas o status não for atualizado no mesmo instante (ou vice-versa), o sistema entraria exatamente no tipo de "estado impossível" (dois dados contraditórios sobre o mesmo fato) já identificado como achado 🔴 crítico em `revisao-integridade-dominio.md` para o caso de categoria/obra/veículo duplicados entre Compra e Lançamento. Seria reintroduzir, aqui, o mesmo padrão de risco que acabamos de evitar na análise anterior.

### Recomendação para o Ponto 1

**Opção 1.A.** Este estado **precisa existir como conceito de domínio** — ou seja, precisa ser entendido, documentado e levado em conta por qualquer relatório ou regra futura — mas **não precisa existir como um dado armazenado próprio**. É consequência natural e inevitável do fato de a Parcela nascer num momento e a Fatura nascer noutro (already estabelecido pela Alternativa A) — não é um estado arbitrário que alguém decidiu criar, é a simples ausência temporária de um relacionamento que ainda vai acontecer. Armazená-lo como um status redundante violaria o mesmo princípio de fonte única da verdade que a própria Alternativa A foi escolhida para proteger.

**Nota lateral, sem decisão**: o campo `PARCELA.status` (já registrado como pendente em `21-parcela.md`, valores não enumerados) deveria, à luz desta análise, tratar de uma dimensão **diferente e independente** — a situação da Parcela em relação ao seu próprio vencimento/geração de Lançamento (ex. "não vencida" / "vencida, aguardando lançamento" / "lançada") — nunca fundida com "tem ou não tem Fatura associada", pelo mesmo motivo pelo qual `categoria` e `classificação`, ou `classificação` e `estado_conciliação`, são mantidas como dimensões independentes em outras partes do modelo. Isso não é uma decisão tomada agora — é uma implicação natural a considerar quando essa pendência específica de `PARCELA.status` for resolvida.

---

## PONTO 2 — COMPRA LANÇADA RETROATIVAMENTE

### Cenário

Hoje é 20/06. O usuário cadastra uma Compra cuja `data` é 10/05. A Fatura de maio já fechou e já foi paga (já tem `LIQUIDAÇÃO_FINANCEIRA` associada). Pela regra de atribuição por data pura, a Parcela dessa Compra "deveria" pertencer ao ciclo de maio — mas esse ciclo já está encerrado.

### Alternativas analisadas

#### Alternativa 2.A — Vincular retroativamente a Parcela à Fatura de maio já fechada, recalculando `valor_total_calculado`

- **Vantagens**: reflete literalmente a data real do fato.
- **Desvantagens**: reabre um "livro fechado" — uma Fatura que já tem Liquidação (já foi paga) teria seu total recalculado depois do pagamento, sem que o valor pago automaticamente reflita essa mudança. Contraria diretamente o padrão de imutabilidade que já rege o resto do modelo: `LIQUIDAÇÃO_FINANCEIRA` e `MOVIMENTAÇÃO_BANCÁRIA` são tratadas como eventos ocorridos, não recalculáveis; e `AJUSTE_FINANCEIRO` existe exatamente para nunca alterar um fato original, sempre lançando a correção como um registro novo. Recalcular uma Fatura fechada vai na direção oposta desse padrão já estabelecido.
- **Impacto na auditoria**: ruim — um "total calculado" que muda depois de fechado quebra a confiança de que ele representa, de forma estável, o que foi de fato fechado naquele momento.
- **Impacto na rastreabilidade**: tecnicamente rastreável via `LOG_AUDITORIA` (a mudança do campo fica registrada), mas a Fatura deixa de ser um retrato fiel e estável do que foi fechado — dois usuários consultando a mesma Fatura em momentos diferentes veriam totais diferentes.
- **Impacto na fonte única da verdade**: paradoxalmente enfraquecido — "o total da Fatura de maio" passa a ter mais de uma resposta possível, dependendo de quando é consultada.
- **Impacto na experiência do usuário**: bom para quem lançou a compra atrasada (vê o valor no mês "certo"); ruim para quem acompanha relatórios financeiros mensais e vê números de meses fechados mudando depois, sem aviso natural de que isso pode acontecer.
- **Compatibilidade com regras já consolidadas**: baixa — contraria diretamente o padrão de imutabilidade de eventos fechados e o próprio motivo de existir de `AJUSTE_FINANCEIRO`.

#### Alternativa 2.B — A Parcela é atribuída ao próximo ciclo ainda aberto no momento em que é efetivamente processada, independente da data real da Compra

A Compra preserva corretamente `data` = 10/05 (o fato histórico não muda). A Parcela correspondente, porém, é reivindicada pela Fatura do ciclo que estiver aberto no momento em que o fechamento acontece (ex. a Fatura de junho, se ainda não fechou, ou julho, se junho também já fechou). `data` (quando o fato ocorreu) e "qual Fatura cobre" (quando foi processado) passam a ser, deliberadamente, duas informações distintas — o mesmo tipo de separação que já existe em `LANÇAMENTO_FINANCEIRO` entre `data_competência` e `vencimento`.

- **Vantagens**: preserva a imutabilidade de toda Fatura já fechada, sem exceção; reflete como operadoras de cartão reais de fato se comportam (uma compra processada com atraso cai na fatura corrente, não reabre uma fatura antiga); não exige nenhuma entidade ou campo novo — usa exatamente a estrutura já aprovada na Alternativa A, só define a regra de qual ciclo "está aberto" no momento da atribuição.
- **Desvantagens**: cria uma divergência visível entre a `data` da Compra (maio) e a Fatura em que ela de fato aparece (julho) — pode gerar uma pergunta natural de quem olha rapidamente ("por que essa compra de maio está na fatura de julho?"), que precisa de alguma explicação acessível (fora do escopo conceitual desta análise); se usada sem nenhuma visibilidade, pode mascarar um padrão sistemático de lançamentos atrasados como se fosse normal.
- **Impacto na auditoria**: bom — cada Fatura permanece, para sempre, um retrato fiel e estável do que foi de fato fechado naquele momento.
- **Impacto na rastreabilidade**: boa — a Compra preserva sua data real; a Fatura preserva seu total real; a relação entre as duas (uma pertence à outra com defasagem) é rastreável e explicável, não escondida ou corrigida silenciosamente.
- **Impacto na fonte única da verdade**: forte — cada Fatura tem exatamente uma resposta estável para "qual foi seu total", para sempre, independente de quando é consultada.
- **Impacto na experiência do usuário**: neutro a positivo, desde que exista alguma comunicação (fora de escopo aqui) explicando por que uma compra antiga aparece numa fatura mais recente — é o comportamento que qualquer usuário já espera de um cartão de crédito real, o que reduz a estranheza.
- **Compatibilidade com regras já consolidadas**: alta — coerente com a imutabilidade de eventos fechados (Liquidação, Movimentação Bancária) e com o espírito de `AJUSTE_FINANCEIRO` (o passado nunca é reescrito, a correção sempre aparece como um evento novo).

#### Alternativa 2.C — Bloquear o cadastro de Compras com `data` anterior a um ciclo já fechado

O sistema rejeitaria a tentativa de registrar essa Compra, obrigando o usuário a usar outra data ou outro mecanismo.

- **Vantagens**: elimina estruturalmente qualquer ambiguidade — nunca existe uma Parcela "órfã" de um ciclo fechado.
- **Desvantagens**: é irrealista para a operação real (o próprio conceitual já prevê "futura importação de fatura" como origem de `COMPRA_CARTÃO`, o que pressupõe que compras podem chegar ao sistema bem depois de terem ocorrido); bloquear o cadastro empurraria o problema para fora do sistema — o usuário tenderia a digitar uma data falsa só para conseguir cadastrar, o que prejudica a fonte única da verdade mais do que qualquer uma das outras alternativas; vai na direção oposta ao princípio "nada desaparece" e à lógica de existir "Não Classificada" em vez de recusar um dado que não se encaixa perfeitamente.
- **Impacto na auditoria**: neutro — não há o que auditar, mas só porque o cenário é proibido de acontecer, não porque foi resolvido.
- **Impacto na rastreabilidade**: nula para este cenário específico, à custa de rejeitar informação real do negócio.
- **Impacto na fonte única da verdade**: aparentemente protegida (nunca há conflito), mas na prática arrisca ser pior — um usuário forçado a mentir a data para conseguir cadastrar corrompe a fonte única da verdade de forma mais grave do que qualquer divergência rastreável.
- **Impacto na experiência do usuário**: ruim — bloqueia um fluxo de trabalho realista sem oferecer alternativa clara dentro do próprio sistema.
- **Compatibilidade com regras já consolidadas**: baixa — contraria o princípio "nada desaparece".

#### Alternativa 2.D — Compra mantém a data real (maio), mas a divergência com a Fatura já fechada é registrada por um novo mecanismo dedicado de "correção de fatura"

Uma variante mais elaborada: em vez de simplesmente mover a Parcela para o próximo ciclo aberto (2.B), o sistema criaria um registro específico sinalizando que uma Fatura fechada tem uma Parcela tardia associada a ela, sem alterar o `valor_total_calculado` original, mas dando visibilidade formal ao caso.

- **Vantagens**: preserva tanto a data real quanto a imutabilidade do total já fechado; rico em informação para reconciliação futura; simetria conceitual com `AJUSTE_FINANCEIRO` (correção sempre como registro novo, nunca reescrita).
- **Desvantagens**: introduz uma entidade/mecanismo novo, não previsto em nenhum lugar do catálogo do conceitual, para resolver um problema que a Alternativa 2.B já resolve com a estrutura já aprovada — aumenta a superfície do modelo sem necessidade comprovada; o comportamento observável pelo usuário final seria quase idêntico ao da 2.B (a Parcela "aparece" em outro lugar de qualquer forma), então o ganho não parece justificar o custo de modelagem adicional.
- **Impacto na auditoria**: muito bom, mas desproporcional ao problema.
- **Impacto na rastreabilidade**: excelente, mas redundante — o mesmo resultado já é alcançável combinando `COMPRA_CARTÃO.data` (preservada) com o vínculo real da Parcela (Alternativa A) e o `LOG_AUDITORIA` (que já registra quando o registro foi de fato criado).
- **Impacto na fonte única da verdade**: forte, mas sem vantagem clara sobre a 2.B para o custo de complexidade adicional.
- **Impacto na experiência do usuário**: semelhante à 2.B, com sinalização mais explícita — alcançável, alternativamente, por um relatório simples sobre os dados já existentes na 2.B, sem exigir uma entidade nova.
- **Compatibilidade com regras já consolidadas**: alta em princípio, mas introduz um conceito que nenhuma regra de negócio documentada pediu — risco de adicionar estrutura sem necessidade comprovada, exatamente o tipo de proporcionalidade que já foi cobrada da arquitetura técnica nas etapas anteriores (auditoria crítica, réplica, arbitragem) e que deveria valer também para o modelo de dados.

### Recomendação para o Ponto 2

**Alternativa 2.B.** É a única que resolve o cenário sem: (a) reabrir um livro fechado (o que a 2.A faz, contrariando o padrão de imutabilidade já estabelecido para Liquidação, Movimentação e Ajuste); (b) rejeitar um caso de uso realista do negócio (o que a 2.C faz, contrariando o princípio "nada desaparece"); ou (c) introduzir uma entidade nova não solicitada por nenhuma regra documentada, para um ganho que a própria 2.B já entrega com a estrutura já aprovada (o que a 2.D faz). A 2.B também é a que mais se aproxima do comportamento real de operadoras de cartão de crédito — um bom sinal de que está alinhada com a prática do negócio, não só com a teoria do modelo.

**O que fica em aberto, mesmo dentro desta recomendação** (não decidido aqui, só sinalizado, seguindo o mesmo padrão já usado nas análises anteriores): `COMPRA_CARTÃO` hoje só tem o campo `data` (a data do fato). A Alternativa 2.B pressupõe uma distinção clara entre "quando o fato ocorreu" e "quando o registro foi efetivamente processado pelo sistema" — hoje, essa segunda informação só existiria implicitamente através de `LOG_AUDITORIA` (que registra quando o registro foi criado), não como um campo dedicado da própria Compra. Se isso for suficiente ou se merece um campo próprio é uma pergunta que não foi feita nesta etapa, e não estou respondendo aqui — só registrando que a Alternativa 2.B depende dela para ser totalmente operacionalizável no futuro.

---

## RESUMO DAS DUAS RECOMENDAÇÕES

| Ponto | Recomendação | Envolve novo campo/entidade? |
|---|---|---|
| 1 — Estado da Parcela antes da Fatura | Opção 1.A — ausência de vínculo é suficiente; o estado existe como conceito, não como dado armazenado | Não |
| 2 — Compra retroativa | Alternativa 2.B — Parcela atribuída ao próximo ciclo aberto no momento do processamento; `data` da Compra preservada como fato histórico separado | Não (usa a estrutura já aprovada na Alternativa A) |

Nenhuma das duas recomendações exige nova entidade ou campo além do que a Alternativa A já introduziu. As duas seguem o mesmo princípio: preferir a solução mais simples que preserve a fonte única da verdade e a imutabilidade de eventos já fechados, em vez de adicionar estrutura nova para resolver algo que a estrutura já aprovada já é capaz de sustentar.

**Nada foi decidido de forma definitiva.** Aguardo sua aprovação antes de qualquer atualização de documento.
