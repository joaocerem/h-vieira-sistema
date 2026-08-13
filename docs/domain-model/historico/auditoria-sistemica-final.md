# Auditoria Sistêmica Final do Modelo
## Sistema Financeiro/Gerencial H Vieira Terraplanagem

**Papel assumido**: arquiteto sênior lendo **todos** os documentos produzidos até agora — conceitual, arquitetura técnica, auditoria crítica, réplica técnica, arbitragem técnica, as 24 entidades do modelo de domínio, a revisão de integridade, e as três análises pontuais de Fatura/Parcela/Compra — como um sistema único, procurando falhas que só aparecem na leitura de conjunto.

**O que este documento NÃO faz**: não repete nenhum achado já registrado nos documentos anteriores (em especial, nada sobre Compra, Parcela, Fatura ou Cartão especificamente — esses já foram tratados em profundidade). Não altera nenhum documento. Não decide nada. Não avança para banco, SQL ou implementação.

**Método**: cada achado abaixo só foi incluído depois de uma verificação de "isso já não foi resolvido em outro lugar?" — em pelo menos um caso (ver Achado 4), essa verificação **derrubou** um achado que parecia sólido à primeira vista, e isso está registrado explicitamente, para deixar claro que nada aqui foi aceito sem crítica.

---

## ACHADOS

### Achado 1 — 🟠 Importante — Não existe, em lugar nenhum do modelo, um catálogo formal de quais `tipo_ação` existem e qual `nível_sensibilidade` cada um tem

1. **Por que existe**: `AÇÃO_PROPOSTA_IA.tipo_ação` foi documentado desde o início como "não enumerado explicitamente no conceitual" (já registrado em `23-acao-proposta-ia.md`, Seção 7), e `nível_sensibilidade` é descrito como "determinado pela natureza da ação" — mas nenhuma entidade, tabela ou lista fechada estabelece essa determinação. A regra existe em prosa (Seção 11 do conceitual, com só três exemplos ilustrativos: consultar, criar/alterar obrigação, confirmar Liquidação), nunca como um registro governável.
2. **Qual regra do modelo afeta**: regra 28 do conceitual ("ações financeiras sensíveis... exigem barreira de confirmação reforçada") depende inteiramente de o sistema saber, sem ambiguidade, que TODA ação de um determinado tipo é Alta — sem um catálogo fechado, essa classificação fica sujeita a interpretação caso a caso.
3. **Exige mudança estrutural ou só documentação?**: hoje, só documentação — é possível registrar esse catálogo como uma lista de regras de negócio (fora do modelo de entidades) sem alterar nenhuma entidade existente. Mas, sem essa lista, a implementação inevitavelmente terá que inventar a classificação de cada `tipo_ação` novo conforme aparece, sem uma referência única para conferir consistência — o que é exatamente o tipo de ambiguidade que a auditoria foi pedida para achar.
4. **Menor alteração possível**: um catálogo de negócio (não uma entidade nova) listando, para cada `tipo_ação` previsto, seu `nível_sensibilidade` correspondente — algo próximo de uma tabela de referência, não uma mudança de schema.

**É a causa-raiz dos Achados 2 e 3, abaixo.**

---

### Achado 2 — 🔴 Crítico — Nada impede, hoje, que a IA proponha criar um `AJUSTE_FINANCEIRO`, apesar de o catálogo do conceitual restringir essa entidade a "Usuário"

1. **Por que existe**: comparando as linhas do catálogo da Seção 3 do conceitual lado a lado — algo que só aparece ao ler as duas entidades juntas, não isoladamente — `LANÇAMENTO_FINANCEIRO` lista explicitamente **"Ação de IA confirmada"** como um dos criadores válidos; `AJUSTE_FINANCEIRO` lista **apenas "Usuário"**, sem menção a IA. Essa é uma diferença de formatação consistente e aparentemente deliberada no próprio catálogo — o conceitual distingue, entidade por entidade, onde a IA pode ou não originar um registro. Mas como o Achado 1 mostra que `tipo_ação` não tem catálogo fechado, **nada na estrutura do modelo impede tecnicamente** que um `AÇÃO_PROPOSTA_IA` seja criado com `tipo_ação` = "criar Ajuste Financeiro".
2. **Qual regra do modelo afeta**: a própria definição de escopo de `AJUSTE_FINANCEIRO` (Seção 9 do conceitual) e a garantia de que estornos/reembolsos/créditos — que movimentam dinheiro e alteram indiretamente indicadores financeiros — permaneçam sob controle exclusivamente humano, sem a via de "Ação de IA confirmada" disponível para outras entidades como Lançamento.
3. **Exige mudança estrutural ou só documentação?**: é resolvível só com documentação (o catálogo do Achado 1, se explicitamente excluir "criar Ajuste Financeiro" da lista de `tipo_ação` permitidos) — mas, sem essa exclusão explícita, uma implementação futura poderia legitimamente interpretar que a IA pode propor Ajustes, contrariando o que parece ser a intenção original do catálogo do conceitual. É uma ambiguidade real que **precisa de uma decisão explícita**, mesmo que a resolução em si não altere nenhuma entidade.
4. **Menor alteração possível**: uma frase no catálogo do Achado 1 (ou uma nota equivalente) confirmando (ou negando) explicitamente que `AJUSTE_FINANCEIRO` está fora do escopo de `tipo_ação` possíveis para `AÇÃO_PROPOSTA_IA`.

---

### Achado 3 — 🟠 Importante — Sobreposição de responsabilidade entre `SUGESTÃO_IA` e `AÇÃO_PROPOSTA_IA` para a mesma correção de negócio

1. **Por que existe**: `SUGESTÃO_IA` é escopada exatamente aos quatro campos de classificação (categoria, classificação, obra, veículo); `AÇÃO_PROPOSTA_IA` é escopada de forma genérica a "criação/alteração de registro". Nada na definição das duas entidades impede que a mesma correção real — por exemplo, mudar a `categoria` de um Lançamento — seja modelada como uma `SUGESTÃO_IA` (confirmação nível Baixo, um clique) **ou** como uma `AÇÃO_PROPOSTA_IA` (confirmação nível Médio, revisão explícita), dependendo apenas de como a implementação da IA decidir formular o pedido. O escopo mais estreito de `SUGESTÃO_IA` reduz bastante essa sobreposição, mas não a elimina estruturalmente.
2. **Qual regra do modelo afeta**: os níveis de confirmação (Seção 11 do conceitual) deixam de ser uma garantia confiável se a mesma classe de mudança puder, dependendo do caminho escolhido, exigir rigor de confirmação diferente em momentos diferentes.
3. **Exige mudança estrutural ou só documentação?**: só documentação — uma regra explícita do tipo "toda mudança restrita a categoria/classificação/obra/veículo passa sempre por Sugestão, nunca por Ação, mesmo quando avisada por linguagem natural" resolveria a ambiguidade sem tocar nenhuma entidade.
4. **Menor alteração possível**: uma frase de precedência explícita entre as duas entidades, documentando qual delas "vence" quando os dois caminhos poderiam se aplicar ao mesmo caso.

---

### Achado 4 — 🟠 Importante (rebaixado de uma leitura inicial mais grave, após verificação) — Contradição textual dentro do próprio conceitual entre "Auditoria desde o dia 1" e "Usuário é pendência não-bloqueante"

1. **Por que existe**: o checklist do conceitual (Seção 18) exige `LOG_AUDITORIA` "desde a primeira versão do schema — não adicionar depois como melhoria futura". Mas `LOG_AUDITORIA.usuário` depende inteiramente de `USUÁRIO`, cujo modelo é, por definição do próprio conceitual (Seção 16, pendência 5), uma pendência explicitamente marcada como **"Não" bloqueante**. São duas exigências do mesmo documento-fonte apontando em direções opostas sobre a mesma dependência.
   **Nota de verificação, feita antes de manter este achado**: a princípio, isso parecia um problema não-mitigado — mas `02-usuario.md` já havia antecipado exatamente essa tensão, propondo deliberadamente um "mínimo estrutural inevitável" (nome + identificador de acesso + situação de acesso) para que `LOG_AUDITORIA` pudesse existir desde o início sem esperar a resolução completa da pendência 5. Isso **mitiga** o problema na prática — mas não resolve a contradição textual em si, que continua existindo, sem nota, dentro do próprio conceitual.
2. **Qual regra do modelo afeta**: princípio 10 e regra 31 (auditoria granular, sempre) versus a classificação explícita da pendência 5 como não-urgente.
3. **Exige mudança estrutural ou só documentação?**: só documentação — a mitigação estrutural já existe (o "Usuário mínimo"); falta apenas registrar, formalmente, que essa é a resposta deliberada à tensão entre as duas seções do conceitual, para que um leitor futuro não precise redescobrir essa reconciliação sozinho.
4. **Menor alteração possível**: uma nota cruzando a Seção 16 e a Seção 18 do conceitual (ou um adendo equivalente), explicando que a pendência 5 permanece não-bloqueante justamente porque um "Usuário mínimo" já viabiliza a Auditoria desde o dia 1, sem precisar do modelo de permissão completo.

---

### Achado 5 — 🟠 Importante — Dependência circular latente entre permissão por escopo de Empresa e a ausência de vínculo direto Lançamento↔Empresa

1. **Por que existe**: este achado é a interação entre dois achados já registrados **separadamente**, em momentos diferentes, que só aparece ao lê-los juntos. `revisao-integridade-dominio.md` já apontava que `LANÇAMENTO_FINANCEIRO` não tem nenhum campo direto para `EMPRESA`. `arbitragem-tecnica-final.md` (Divergência 4) já recomendava checagem de permissão em dois pontos, um deles "por escopo de dado/Empresa". A interação: se um `AÇÃO_PROPOSTA_IA` de nível Médio propõe **criar** um novo Lançamento, e o mecanismo de permissão escolhido (ainda não decidido) exigir checar se o usuário confirmador tem acesso à Empresa daquele Lançamento, essa checagem não tem como ser feita **antes** da confirmação — porque o Lançamento (e, portanto, sua Empresa, ainda que indireta) só existe **depois** de confirmado.
2. **Qual regra do modelo afeta**: a barreira de confirmação de nível Médio/Alto (regras 27-28) e a exigência de permissão por escopo de Empresa (arquitetura técnica, Seção 11; arbitragem, Divergência 4) — as duas juntas criam uma ordem de verificação que o modelo atual não tem como satisfazer para este caso específico.
3. **Exige mudança estrutural ou só documentação?**: depende da decisão ainda pendente sobre o modelo de permissão. Se o modelo final não exigir escopo por Empresa no momento da confirmação (só depois, para consulta), o problema desaparece sem nenhuma mudança. Se exigir, aí sim seria necessário decidir de onde a Empresa do Lançamento proposto viria antes de ele existir (ex.: um campo `dados_propostos.empresa` explícito dentro da própria Ação Proposta) — o que seria mudança estrutural.
4. **Menor alteração possível**: nenhuma agora — registrar esta dependência como uma restrição a verificar explicitamente quando o modelo de permissão (pendência 5) e o mecanismo da barreira Alto (pendência 12) forem finalmente decididos, para que a ordem de verificação seja projetada com esse caso em mente desde o início, em vez de descoberta tarde.

---

### Achado 6 — 🟠 Importante — Risco de duas respostas diferentes para "quanto falta pagar" de um `CONTRATO_FINANCEIRO`, sem regra de validação formal

1. **Por que existe**: "saldo devedor" pode, em tese, ser calculado de duas formas: (a) `valor_contratado` menos a soma dos Lançamentos já pagos gerados pelas Parcelas; (b) a soma direta dos `valor` de todas as Parcelas ainda não convertidas em Lançamento pago. Essas duas contas só produzem, garantidamente, o mesmo número se **Σ `PARCELA.valor` = `valor_contratado`** — e nenhum documento define essa igualdade como uma regra de validação formal (foi citada como um "invariante que o agregado deveria garantir" na revisão de integridade, mas nunca como regra de negócio explícita). O risco fica ainda mais concreto no caso de Financiamento: `CONTRATO_FINANCEIRO.taxa` existe como campo, mas nenhum documento esclarece se `valor_contratado` já inclui os juros projetados ou representa só o principal — se for só o principal, as duas contas divergem por construção, não por erro.
2. **Qual regra do modelo afeta**: a própria confiabilidade de qualquer consulta de "saldo devedor de financiamento/consórcio" — explicitamente listada como uma das ferramentas de consulta da IA no catálogo da Seção 11 do conceitual. Se a IA responder essa pergunta por um caminho e um relatório humano responder pelo outro, o sistema literalmente dá duas respostas diferentes para a mesma pergunta.
3. **Exige mudança estrutural ou só documentação?**: principalmente documentação — uma regra de negócio explícita ("`valor_contratado` de um Financiamento inclui juros projetados, sim ou não" e "a soma das Parcelas deve sempre igualar `valor_contratado`") resolveria a ambiguidade sem alterar nenhum campo.
4. **Menor alteração possível**: uma regra de validação explícita adicionada à descrição de `CONTRATO_FINANCEIRO`/`PARCELA` (não aos campos em si) esclarecendo essa igualdade e a composição exata de `valor_contratado` para cada `tipo`.

---

### Achado 7 — 🟠 Importante — Fragmentação de pendências entre documentos produzidos em momentos diferentes

1. **Por que existe**: hoje existem pendências registradas, com formatos de classificação diferentes, em pelo menos oito documentos: o conceitual (14 pendências numeradas), a arquitetura técnica (16 decisões), a auditoria crítica e a arbitragem (bloqueante/importante/melhoria), a revisão de integridade do domínio (🔴🟠🟡, mais 4 bloqueantes novas), e as três análises pontuais de Fatura/Parcela/Compra (cada uma com suas próprias pendências e sub-pendências, ex. o sub-caso B1 do Cenário B, ainda em aberto). Nenhum desses documentos tenta ser, nem substitui, uma lista única e atualizada de tudo que ainda está pendente.
2. **Qual regra do modelo afeta**: nenhuma regra de negócio específica — é um risco de **processo**, não de domínio. Mas afeta diretamente a confiabilidade de qualquer decisão futura: uma pendência pode ser resolvida num documento e permanecer, sem nota, como "aberta" em outro; ou uma nova pendência pode ser descoberta (como as desta própria auditoria) sem nunca ser cruzada com as anteriores.
3. **Exige mudança estrutural ou só documentação?**: só documentação — e nem isso é urgente agora, porque o processo até aqui deliberadamente separou "análise" de "consolidação" a cada etapa (por instrução explícita, em todas as fases desta conversa). Mas o risco cresce a cada nova análise que não é cruzada com as anteriores.
4. **Menor alteração possível**: nenhuma agora — só o registro de que, antes de avançar para a modelagem de banco, vai ser necessário um documento único que consolide (sem resolver) todas as pendências de todos os documentos anteriores, para servir de checklist final. Isso não foi pedido nesta etapa e não está sendo feito aqui.

---

### Achado 8 — 🟡 Melhoria — Pendência 3 do conceitual (qual sócio faz uma Retirada do Patrão) não tem nenhum campo ou entidade correspondente em todo o catálogo de 24 entidades

1. **Por que existe**: a pendência 3 já era conhecida e classificada como não-bloqueante desde o conceitual original. Mas, ao percorrer as 24 entidades do modelo de domínio, nenhuma delas — nem `MOVIMENTAÇÃO_BANCÁRIA`, nem qualquer outra — tem um campo, nem mesmo um placeholder, para capturar "qual sócio" quando há mais de um. Não existe também uma entidade `SÓCIO` ou equivalente.
2. **Qual regra do modelo afeta**: regra 6 do conceitual ("retiradas do patrão continuam registradas e visíveis") — hoje, tecnicamente satisfeita (a classificação "Retirada do Patrão" existe), mas sem capacidade de diferenciar entre sócios diferentes, caso isso um dia seja necessário.
3. **Exige mudança estrutural ou só documentação?**: nenhuma ação agora — a pendência já é conhecida e não-bloqueante. Isto é só a confirmação de que, quando ela for resolvida, provavelmente vai exigir um campo novo (ou até uma entidade nova) que hoje não existe nem como espaço reservado.
4. **Menor alteração possível**: nenhuma — registrado apenas para completar o mapeamento entre pendências já conhecidas e sua ausência de qualquer rastro estrutural no modelo atual.

---

### Achado 9 — 🟡 Melhoria — Se o mecanismo de "segundo aprovador" for escolhido para a barreira de nível Alto, o modelo atual não tem campo para diferenciar "quem iniciou a conversa com a IA" de "quem confirmou"

1. **Por que existe**: a arquitetura técnica (Seção 8) já lista "segundo aprovador (usuário diferente do que originou a conversa com a IA)" como uma das três opções possíveis para a barreira de confirmação Alto — ainda não decidida (pendência 12). `AÇÃO_PROPOSTA_IA`, como modelada hoje, só tem um relacionamento genérico "Usuário → Ação Proposta IA (confirma ou rejeita)" — não existe nenhum campo para registrar quem, especificamente, deu início ao pedido em linguagem natural que gerou a Ação. Sem essa distinção, a regra "o aprovador precisa ser diferente de quem pediu" seria estruturalmente impossível de verificar.
2. **Qual regra do modelo afeta**: regra 28 (barreira reforçada para ações de nível Alto) — especificamente, só no caso de essa opção específica de mecanismo ser a escolhida.
3. **Exige mudança estrutural ou só documentação?**: condicional — se essa opção for escolhida, sim, exigiria um campo novo em `AÇÃO_PROPOSTA_IA` (algo como "usuário que originou o pedido", distinto do usuário que confirma). Se outra opção for escolhida (reautenticação ou confirmação simples reforçada), nenhuma mudança é necessária.
4. **Menor alteração possível**: nenhuma agora — é uma dependência condicional a uma decisão ainda não tomada (pendência 12); registrada aqui para que, se "segundo aprovador" for a opção escolhida, a necessidade desse campo já esteja antecipada, em vez de descoberta depois.

---

## RESUMO

| # | Achado | Gravidade | Exige mudança estrutural? |
|---|---|---|---|
| 1 | Catálogo tipo_ação → nível_sensibilidade não tem dono | 🟠 | Não — só documentação |
| 2 | IA pode, hoje, propor criar um Ajuste Financeiro | 🔴 | Não — só documentação, mas urgente |
| 3 | Sobreposição Sugestão IA / Ação Proposta IA | 🟠 | Não — só documentação |
| 4 | Contradição textual "auditoria dia 1" vs. "usuário não-bloqueante" | 🟠 | Não — já mitigado, falta anotar |
| 5 | Dependência circular Empresa/permissão/Lançamento proposto por IA | 🟠 | Condicional à decisão de permissão ainda pendente |
| 6 | Duas respostas possíveis para saldo devedor de Contrato Financeiro | 🟠 | Não — só documentação |
| 7 | Pendências fragmentadas em 8+ documentos | 🟠 | Não — consolidação futura, não urgente agora |
| 8 | Pendência 3 (sócio) sem campo/entidade correspondente | 🟡 | Nenhuma ação agora |
| 9 | Campo ausente para "segundo aprovador ≠ originador" | 🟡 | Condicional a uma decisão ainda não tomada |

**Nenhum achado desta auditoria exige redesenhar o modelo.** Todos são resolvíveis com documentação/decisão explícita, exceto os dois marcados como condicionais a pendências já conhecidas e ainda não decididas (5 e 9), cuja eventual mudança estrutural depende inteiramente de qual opção for escolhida em cada uma.

**O achado de maior gravidade prática (🔴, Achado 2)** é o único que recomendo tratar como algo a não deixar em aberto por muito tempo — porque, diferente dos demais, ele não tem nenhuma mitigação parcial já em vigor em nenhum documento anterior, e toca diretamente controle sobre movimentação de dinheiro por ação de IA.

**Nada foi decidido, nenhum documento foi alterado.** Esta é só a auditoria.
