# Arbitragem Técnica Final
## Sistema Financeiro/Gerencial H Vieira Terraplanagem

**Papel assumido**: arquiteto-chefe, sem vínculo com nenhuma das três posições anteriores (`arquitetura-tecnica.md`, `auditoria-critica-arquitetura-tecnica.md`, `replica-tecnica-auditoria-critica.md`). Função: arbitrar, não redigir. Nenhuma tecnologia é escolhida aqui, nenhum documento existente é alterado, nenhuma pendência é resolvida além do próprio julgamento de qual posição procede.

**Critério de julgamento**: cada divergência é decidida pelo que o conceitual (`arquitetura-conceitual.md`) e as `project-rules.md` efetivamente exigem — nunca por preferência de estilo, nem por deferência a quem levantou o ponto primeiro.

---

## ÍNDICE DE DIVERGÊNCIAS

1. Proporcionalidade da arquitetura (Clean Architecture uniforme)
2. Módulos de leitura e módulo de consulta compartilhado
3. Auditoria como mecanismo obrigatório
4. Permissões como mecanismo transversal
5. IA posicionada dentro do Domain
6. Responsabilidade pela criação da `LIQUIDAÇÃO_FINANCEIRA` (Fatura)
7. Estratégia de cálculo do status do `LANÇAMENTO_FINANCEIRO`
8. Vocabulário arquitetural duplo (Clean Architecture + Hexagonal)
9. Sobreposição entre testes de aceitação e integração
10. Ferramenta de teste de fronteira de módulo
11. Eixo de evolução: troca de tecnologia vs. evolução de regra de negócio
12. Estratégia de índice e complexidade de consultas N:N
13. Estrutura de pastas — avaliação geral do esqueleto

---

## DIVERGÊNCIA 1 — PROPORCIONALIDADE DA ARQUITETURA (CLEAN ARCHITECTURE UNIFORME)

1. **Argumento da auditoria**: aplicar Clean Architecture/Hexagonal uniformemente a todo o sistema é desproporcional; cadastros simples (Fornecedor, Categoria, Cliente) não têm regra de negócio que justifique 4 camadas; isso é overengineering típico de sistema muito maior.
2. **Argumento da réplica**: concorda para `Empresa`, `Cliente`, `Fornecedor`, `Conta Bancária` (sem regra de negócio documentada); discorda para `Categoria` (tem pendência 4 do conceitual — possível divisão futura em natureza/sub-conta — logo já carrega risco de complexidade); discorda do enquadramento "sistema muito maior", pois nada do que foi proposto envolve distribuição/microsserviços — é overhead de organização interna de código, categoria de custo diferente.
3. **Análise técnica**: a distinção entre overengineering de *governança de código* (camadas dentro de um monólito) e overengineering de *escala/distribuição* (microsserviços, filas, réplicas) é uma distinção real e relevante — o documento técnico nunca propôs a segunda categoria, então a frase "sistema muito maior" da auditoria é retoricamente mais forte do que o que está de fato escrito na Seção 4 do documento técnico. Ao mesmo tempo, o núcleo do argumento da auditoria — que ceremônia sem invariante de negócio para proteger é custo sem contrapartida — está correto e não foi refutado pela réplica, só delimitado. A ressalva da réplica sobre `Categoria` é factualmente correta (a pendência 4 existe no conceitual) e evita um erro simétrico ao que a auditoria aponta: simplificar cedo demais uma entidade que pode ganhar regra de negócio em breve.
4. **Decisão**: **vence a posição da réplica**, que já é, ela mesma, uma terceira via entre a arquitetura original (uniforme) e a auditoria (simplificação ampla) — não uma defesa da arquitetura original.
5. **Por quê**: nenhuma das duas posições extremas resiste sozinha. "Uniforme para tudo" ignora que parte do sistema não tem invariante a proteger; "simplificar todos os cadastros" ignora que pelo menos um deles (`Categoria`) já tem complexidade de negócio anunciada no próprio conceitual. O critério de dois perfis (núcleo com invariante vs. cadastro simples, com `Categoria` classificada no perfil núcleo até a pendência 4 ser resolvida) é o único dos três que responde a todos os fatos documentados.
6. *(Não é necessária uma quarta solução — a da réplica já cumpre esse papel.)*

**Classificação**: **bloqueante** — Cadastros Base é o primeiro módulo da ordem de implementação (Seção 14 do documento técnico); o critério de proporcionalidade precisa existir antes de codificá-lo.
**Rótulo**: aceita parcialmente a crítica da auditoria, com a refinação da réplica prevalecendo como resolução.

---

## DIVERGÊNCIA 2 — MÓDULOS DE LEITURA E MÓDULO DE CONSULTA COMPARTILHADO

1. **Argumento da auditoria**: (a) "hexagonal seletivo" — simplificar especialmente Obra/Frota/Balanço, que são só leitura; (b) separadamente, alerta que Balanço/Obra/Frota/IA correm risco de duplicar lógica de agregação (custo de obra, exclusão de Cancelado, aplicação de Ajustes), ameaçando a fonte única da verdade; (c) nota que Frota nem sequer tem caso de uso listado na estrutura de pastas.
2. **Argumento da réplica**: aponta que (a) e (b), lidos juntos, se contradizem — "simplificar" os módulos de leitura, se feito à letra, tende a produzir consultas ad-hoc duplicadas em cada módulo, exatamente o risco que (b) descreve. Propõe um módulo de aplicação compartilhado (`application/consultas-financeiras` ou equivalente) consumido por todos os quatro consumidores, resolvendo simultaneamente a proporcionalidade (nenhum desses módulos precisa de domínio/infraestrutura próprios) e a duplicação (uma implementação só).
3. **Análise técnica**: a contradição apontada pela réplica é real, não uma leitura forçada — a própria auditoria, ao formular os dois achados separadamente, não os cruzou. Um módulo de consulta compartilhado é estruturalmente compatível com "menos camada por módulo de leitura" (nenhum precisa de domínio próprio) e com "uma fonte única de lógica de agregação" ao mesmo tempo — não é uma terceira posição inventada do nada, é a única forma de satisfazer os dois achados da própria auditoria sem que um cancele o outro.
4. **Decisão**: **vence a posição da réplica**.
5. **Por quê**: a auditoria identificou dois problemas reais mas não os reconciliou entre si; a arquitetura original não tinha proteção nenhuma contra a duplicação. A solução da réplica é estritamente superior às outras duas porque resolve ambos os achados da auditoria com uma única mudança pequena, sem reintroduzir a ceremônia que a própria auditoria queria evitar.
6. *(Solução já resolvida no ponto 3 acima — inclui corrigir a lacuna de Frota como parte da mesma mudança.)*

**Classificação**: **bloqueante a partir da implementação do segundo consumidor de leitura** (o primeiro pode nascer sem essa decisão; a partir do segundo, a duplicação já é possível).
**Rótulo**: aceita parcialmente ambos os achados da auditoria; resolvida por terceira solução (que coincide com a proposta da réplica).

---

## DIVERGÊNCIA 3 — AUDITORIA COMO MECANISMO OBRIGATÓRIO

1. **Argumento da auditoria**: registrar log de auditoria como chamada manual, feita por cada caso de uso, arrisca ser esquecida em algum caso de uso futuro — violando a palavra "toda" nas regras 10 e 31 do conceitual. Sugere um mecanismo automático (interceptador/middleware/decorator).
2. **Argumento da réplica**: concorda com o risco, mas discorda do mecanismo sugerido — um interceptador técnico genérico normalmente só enxerga contexto técnico (rota, usuário), não o contexto de negócio que a regra 31 exige (origem: Manual/Importação/Sugestão de IA Confirmada/Ação de IA Confirmada). Propõe manter a chamada explícita na aplicação (para preservar contexto), mas torná-la obrigatória por contrato de assinatura + teste de arquitetura.
3. **Análise técnica**: ambas as posições têm um ponto correto e um ponto incompleto. A auditoria está certa que uma chamada opcional é um risco real. A réplica está certa que um interceptador *puramente técnico* perderia contexto de negócio. Mas a dicotomia entre "interceptador automático sem contexto" e "chamada manual obrigatória por contrato" é falsa: um mecanismo automático (decorator/wrapper aplicado a todo caso de uso de escrita) pode perfeitamente **exigir** que o próprio caso de uso forneça o contexto de negócio como parte da chamada — nesse desenho, é fisicamente impossível executar a escrita sem fornecer a origem, porque o wrapper não delega ao passo seguinte sem esse dado. Isso é, ao mesmo tempo, automático (elimina o risco de esquecimento, que é a exigência da auditoria) e ciente de contexto (preserva a origem de negócio, que é a exigência da réplica). A proposta da réplica ("contrato de assinatura comum + teste de arquitetura") já está muito próxima disso, mas foi apresentada como alternativa ao mecanismo automático, quando na prática é uma variação dele.
4. **Decisão**: **nenhuma das duas está totalmente certa na formulação — terceira solução**.
5. **Por quê**: a auditoria simplifica ao supor que "automático" implica perda de contexto; a réplica simplifica ao supor que "preservar contexto" exclui automação. As duas exigências (não-opcional + contexto de negócio) não competem entre si — são resolvidas pela mesma peça de desenho.
6. **Terceira solução**: exigir, na arquitetura, um mecanismo de escrita que combine as duas propriedades — automático o suficiente para que nenhuma escrita passe sem gerar log, e parametrizado o suficiente para carregar a origem de negócio como dado obrigatório de entrada. O mecanismo exato (decorator, wrapper de "unit of work", ou outro) permanece decisão técnica em aberto — não escolhida aqui.

**Classificação**: **bloqueante** — muda o padrão de todo caso de uso de escrita; precisa existir antes do primeiro módulo de escrita ser codificado.
**Rótulo**: terceira solução.

---

## DIVERGÊNCIA 4 — PERMISSÕES COMO MECANISMO TRANSVERSAL

1. **Argumento da auditoria**: mesmo risco da auditoria — checagem de permissão feita manualmente por caso de uso pode ser esquecida.
2. **Argumento da réplica**: concorda com o risco, mas argumenta que aqui o problema é mais simples que o da auditoria — autorização só precisa de "quem" e "qual ação", dados disponíveis já na entrada HTTP, então um guard/middleware antes da camada de aplicação resolve sem o problema de contexto perdido que existia para log de auditoria. Também separa a decisão de "mecanismo" da decisão de "modelo" (RBAC vs. RBAC+empresa vs. ABAC), que a auditoria havia tratado como uma coisa só.
3. **Análise técnica**: a separação entre "mecanismo" e "modelo" feita pela réplica é correta e útil. Mas a afirmação de que autorização "só precisa de quem e qual ação" não se sustenta por completo neste sistema específico: o próprio documento técnico (Seção 11) já registra uma segunda dimensão de controle — escopo por Empresa (o grupo tem 6 empresas). Saber se um usuário pode agir sobre **um registro específico** de `LANÇAMENTO_FINANCEIRO` requer saber a qual Empresa aquele registro pertence — informação que só existe depois que o registro (ou pelo menos sua referência de Empresa) é carregado, não necessariamente disponível num guard posicionado antes de qualquer acesso a dado. Ou seja, para autorização **por ação** (pode o usuário registrar uma Liquidação?), um guard de entrada é suficiente; para autorização **por escopo de dado** (pode este usuário agir sobre esta Liquidação específica, de uma Empresa à qual ele não tem acesso?), o ponto de checagem precisa estar mais próximo de onde o dado é carregado — o que a réplica não distinguiu.
4. **Decisão**: **nenhuma das duas está completa — terceira solução**, que é um refinamento da posição da réplica, não uma rejeição dela.
5. **Por quê**: a réplica está certa que o mecanismo deve ser obrigatório e certa em separar mecanismo de modelo; está incompleta ao tratar autorização como um problema de um único ponto de checagem, quando o próprio documento técnico já previu uma dimensão (escopo por Empresa) que exige checagem em pelo menos dois pontos.
6. **Terceira solução**: exigir dois pontos de checagem, não um: (i) autorização por ação, num guard de entrada, antes da camada de aplicação — cobre "o usuário pode fazer X?"; (ii) autorização por escopo de dado, no ponto em que o registro-alvo é carregado (repositório ou início do caso de uso) — cobre "o usuário pode fazer X *neste* registro?". Ambos obrigatórios e não-opcionais, pelo mesmo raciocínio da Divergência 3. O modelo de permissão por trás (RBAC, RBAC+empresa, ABAC) continua pendência separada, como a réplica já indicava corretamente.

**Classificação**: **bloqueante**, mesmo motivo da Divergência 3.
**Rótulo**: terceira solução (refinamento da réplica).

---

## DIVERGÊNCIA 5 — IA POSICIONADA DENTRO DO DOMAIN

1. **Argumento da auditoria**: colocar contratos de IA dentro de `domain/ia` contraria o princípio "IA nunca é fonte de verdade" (princípio 9 do conceitual) — a IA é, por natureza, periférica e substituível, não deveria estar no núcleo mais protegido da arquitetura.
2. **Argumento da réplica**: distingue duas coisas que o documento técnico misturou numa linha só: os contratos de ferramenta de consulta (schema exposto à IA — isso sim é fronteira/adaptador) e as entidades de estado `SUGESTÃO_IA`/`AÇÃO_PROPOSTA_IA` (catalogadas como entidades de domínio legítimas na Seção 3 do conceitual, com regras de negócio próprias). Argumenta que essas entidades de estado pertencem ao domínio por direito próprio — são, inclusive, o mecanismo que impede a IA de virar fonte de verdade, não uma concessão a ela.
3. **Análise técnica**: a distinção da réplica é factualmente verificável no próprio catálogo de entidades do conceitual (Seção 3), que lista `SUGESTÃO_IA` e `AÇÃO_PROPOSTA_IA` com os mesmos atributos estruturais de qualquer outra entidade (campos, relacionamentos, quem cria/altera, o que não representa) — não há base textual no conceitual para tratá-las como "a IA" em vez de "dado que registra uma proposta pendente de confirmação humana". A auditoria conflou o provedor de IA (que de fato deve ficar fora do domínio, e já fica — `infrastructure/ia-provider`) com o registro de suas propostas (que é dado do próprio sistema, não da IA).
4. **Decisão**: **vence integralmente a posição da réplica**.
5. **Por quê**: o princípio 9 do conceitual fala do comportamento da IA (nunca decide sozinha, nunca é fonte de verdade), não da localização de onde o sistema guarda os registros de suas propostas pendentes. A auditoria generalizou "IA" para incluir qualquer coisa com a palavra "IA" no nome, incluindo dado que é, estruturalmente, do sistema. A crítica sobre a mistura de duas responsabilidades na mesma linha da Seção 6, porém, procede — é só uma questão de organização de pastas, não de princípio violado.
6. *(Não necessária — divisão da linha, como já proposta pela réplica, resolve.)*

**Classificação**: **melhoria de clareza documental, não bloqueante** — nenhuma regra de negócio ou fronteira de escrita está em risco pelo posicionamento atual.
**Rótulo**: rejeitada a crítica da auditoria quanto à violação de princípio; aceita quanto à mistura de responsabilidades na mesma pasta.

---

## DIVERGÊNCIA 6 — RESPONSABILIDADE PELA CRIAÇÃO DA `LIQUIDAÇÃO_FINANCEIRA` (FATURA)

1. **Argumento da auditoria**: a tabela de responsabilidades do conceitual (Seção 13) só lista Financeiro como escritor de `LIQUIDAÇÃO_FINANCEIRA`; a Seção 6 do documento técnico, ao colocar `fechar-fatura.*` inteiro dentro de `application/cartao`, resolve essa lacuna silenciosamente numa direção que parece contradizer a tabela.
2. **Argumento da réplica**: concorda integralmente; propõe dividir `fechar-fatura.*` em dois passos — Cartão calcula/confirma o total da fatura (escreve só `FATURA`); o pagamento invoca o caso de uso já existente `financeiro/registrar-liquidacao.*`.
3. **Análise técnica**: não há divergência real entre as duas posições — a auditoria identificou o problema corretamente e a réplica propôs a correção mais direta possível, reaproveitando estrutura já existente no próprio documento técnico (não inventa módulo novo). Concordância total, sem necessidade de arbitrar lados opostos.
4. **Decisão**: **ambas as posições convergem; a proposta da réplica é ratificada como a resolução**.
5. **Por quê**: é a solução que resolve a ambiguidade com a menor alteração possível, sem contradizer nenhuma parte do conceitual ou do documento técnico.
6. *(Não aplicável — sem divergência a arbitrar além da confirmação.)*

**Classificação**: **bloqueante** antes de implementar Cartão ou Financeiro.
**Rótulo**: aceita integralmente a crítica; resolução da réplica ratificada.

---

## DIVERGÊNCIA 7 — ESTRATÉGIA DE CÁLCULO DO STATUS DO `LANÇAMENTO_FINANCEIRO`

1. **Argumento da auditoria**: o nome `calcular-status-lancamento.*`, ao lado de casos de uso de escrita, entrega implicitamente a opção "campo recalculado a cada escrita" — uma decisão que o conceitual (Seção 19) deixa explicitamente aberta — sem declarar isso como pendência, contradizendo a promessa do próprio documento técnico de "nada decidido silenciosamente".
2. **Argumento da réplica**: concorda com o risco e com a necessidade de correção, mas discorda do grau de certeza — argumenta que o nome, isoladamente, não força tecnicamente essa leitura; é só uma inferência razoável dada a posição no documento, não uma decisão no sentido estrito.
3. **Análise técnica**: as duas posições descrevem o mesmo fato (o nome cria viés de leitura) com pesos retóricos diferentes ("decisão silenciosa" vs. "aparência de decisão"). Isso não muda em nada a ação corretiva necessária — ambas concordam que o nome deve ser neutralizado e a decisão explicitamente listada como pendente. A diferença é só de ênfase sobre a gravidade da falha documental, não sobre o que precisa ser feito.
4. **Decisão**: **convergência prática entre as duas — a caracterização mais precisa (réplica) é adotada, mas a urgência apontada pela auditoria prevalece na classificação**.
5. **Por quê**: tecnicamente, o nome de um caso de uso não é uma decisão de arquitetura por si só (réplica está certa nisso); mas como é a regra mais estrutural de toda a cadeia central (Seção 2 do conceitual), qualquer viés não-declarado é inaceitável independente de quem "decidiu" o quê — o resultado prático exigido é o mesmo dos dois lados.
6. *(Não necessária — mesma correção nos dois lados: renomear neutro + registrar como pendência explícita na tabela consolidada.)*

**Classificação**: **bloqueante** — é a regra mais central da cadeia financeira; precisa de decisão explícita antes do desenho da primeira tabela.
**Rótulo**: aceita integralmente quanto à ação corretiva; aceita parcialmente quanto à caracterização do problema (réplica mais precisa).

---

## DIVERGÊNCIA 8 — VOCABULÁRIO ARQUITETURAL DUPLO (CLEAN ARCHITECTURE + HEXAGONAL)

1. **Argumento da auditoria**: usar Clean Architecture e Hexagonal/Ports & Adapters ao mesmo tempo, sem delimitar onde cada vocabulário vale, é fonte de ambiguidade para quem for implementar.
2. **Argumento da réplica**: concorda, propõe usar "Clean Architecture" como termo guarda-chuva e reservar "porta/adaptador" só para os pontos de integração genuinamente substituíveis.
3. **Análise técnica**: na prática de mercado, os dois vocabulários são usados de forma intercambiável com frequência em documentação de arquitetura, e um implementador experiente normalmente não se perde por isso. O risco de ambiguidade é real, mas de impacto baixo — é uma questão de precisão de comunicação, não de comportamento do sistema. Nem auditoria nem réplica cometem erro técnico aqui; a diferença é só de quanto peso dar a um problema genuinamente menor.
4. **Decisão**: **aceita, mas rebaixada em severidade** frente ao que ambas as posições sugeriam.
5. **Por quê**: vale a correção (é barata — poucas linhas de texto), mas não deveria ser tratada com a mesma prioridade de itens que afetam comportamento ou fronteira de módulo.
6. *(Não necessária.)*

**Classificação**: **melhoria futura** (cosmética/documental) — não bloqueia nada, pode ser corrigida a qualquer momento antes ou depois da implementação começar.
**Rótulo**: aceita, com severidade reduzida.

---

## DIVERGÊNCIA 9 — SOBREPOSIÇÃO ENTRE TESTES DE ACEITAÇÃO E DE INTEGRAÇÃO

1. **Argumento da auditoria**: os mesmos cenários (ex. fatura mista R$30.000) aparecem tanto como teste de integração quanto de aceitação, sem critério declarado de onde termina um e começa o outro — risco de duplicação de esforço de teste.
2. **Argumento da réplica**: rejeita a crítica — argumenta que testar o mesmo cenário em dois níveis diferentes (correção técnica vs. correção de regra de negócio em linguagem de negócio) é redundância deliberada e defensável em um sistema financeiro, não desperdício.
3. **Análise técnica**: a justificativa da réplica (dois níveis afirmam coisas diferentes) é uma boa prática real de teste de software, mas — ponto que a réplica não observou — essa distinção **não está escrita em nenhum lugar do documento técnico**; é uma racionalização feita depois do fato, na própria réplica. Sem essa distinção documentada, o risco apontado pela auditoria (alguém escrever os mesmos casos duas vezes sem perceber, por falta de critério explícito) continua real, mesmo que a prática recomendada exista na cabeça de quem está arbitrando agora.
4. **Decisão**: **nenhuma das duas está completa — aceita parcialmente**.
5. **Por quê**: a réplica tem razão que a redundância *pode* ser desejável; a auditoria tem razão que, sem critério escrito, a redundância vira duplicação por acidente em vez de redundância deliberada. A diferença entre as duas coisas é exatamente ter ou não ter o critério documentado.
6. **Terceira posição**: quando o plano de testes for escrito (fase de implementação, não de arquitetura), declarar explicitamente o que cada camada de teste afirma para os cenários compartilhados (ex.: integração confirma que o código produz os registros certos; aceitação confirma que o resultado bate com a descrição em linguagem de negócio do conceitual) — sem isso, a distinção é só teórica.

**Classificação**: **melhoria futura** — só relevante quando o plano de testes for efetivamente escrito, não antes.
**Rótulo**: aceita parcialmente (rebaixada da rejeição total da réplica).

---

## DIVERGÊNCIA 10 — FERRAMENTA DE TESTE DE FRONTEIRA DE MÓDULO

1. **Argumento da auditoria**: o "teste de fronteira de módulo" citado no documento técnico exige uma ferramenta de análise de dependência (linter de arquitetura ou equivalente) que não está contabilizada em nenhuma decisão de stack.
2. **Argumento da réplica**: concorda, classifica como baixa severidade, propõe adicionar como item pendente quando a stack for escolhida.
3. **Análise técnica**: sem divergência — observação factual correta, sem contraponto técnico possível (a ferramenta de fato não está listada em lugar nenhum).
4. **Decisão**: **convergência total — aceita integralmente**.
5. **Por quê**: não há argumento contrário disponível; é uma lacuna simples de registro.
6. *(Não aplicável.)*

**Classificação**: **melhoria futura** — só relevante quando a suíte de testes for configurada em CI, bem depois da escolha de stack.
**Rótulo**: aceita integralmente.

---

## DIVERGÊNCIA 11 — EIXO DE EVOLUÇÃO: TROCA DE TECNOLOGIA VS. EVOLUÇÃO DE REGRA DE NEGÓCIO

1. **Argumento da auditoria**: a arquitetura investe rigidez de fronteira no eixo errado — protege contra troca de tecnologia (pouco provável, pelo que o conceitual descreve) em vez de otimizar para evolução de regra de negócio (muito provável, dadas as 14 pendências do conceitual).
2. **Argumento da réplica**: discorda da premissa — isolar domínio de infraestrutura também ajuda a evolução de regra de negócio, porque concentra a regra num lugar único e localizável, facilitando resolver pendências como a 14 (cancelamento com liquidação aplicada).
3. **Análise técnica**: a réplica está certa para mudanças **comportamentais** (alterar uma validação, um invariante, uma condição de negócio) — nesses casos, ter a regra isolada em um só lugar realmente reduz o custo de encontrá-la e mudá-la. Mas a auditoria tem razão para mudanças **estruturais** (alterar o formato/relacionamento de uma entidade — por exemplo, a pendência 6, decidir se `CONTRATO_FINANCEIRO` continua único ou é dividido em Financiamento/Consórcio separados): esse tipo de mudança tipicamente toca entidade de domínio, DTO de aplicação, mapeamento de infraestrutura e contrato de interface ao mesmo tempo — exatamente o custo de manutenção que a própria réplica já havia reconhecido como real (Divergência 1, item "manutenção"). Nenhuma das duas posições, isoladamente, cobre os dois tipos de mudança.
4. **Decisão**: **nenhuma das duas está completa — aceita parcialmente ambas**.
5. **Por quê**: "a arquitetura ajuda a evolução de regra de negócio" é verdade só para mudança comportamental; "a arquitetura otimiza o eixo errado" é verdade só para mudança estrutural. A conclusão correta depende do tipo de pendência em jogo, e o conceitual tem pendências dos dois tipos.
6. *(Não é uma terceira solução de desenho — é uma qualificação: nenhuma mudança estrutural é necessária agora, mas ao planejar a resolução de cada uma das 14 pendências do conceitual, avaliar antecipadamente se ela é comportamental ou estrutural, porque o custo de implementação é bem diferente entre as duas.)*

**Classificação**: **melhoria futura** — não é uma decisão a tomar agora, é um critério a aplicar quando cada pendência de negócio for resolvida.
**Rótulo**: aceita parcialmente ambas as posições.

---

## DIVERGÊNCIA 12 — ESTRATÉGIA DE ÍNDICE E COMPLEXIDADE DE CONSULTAS N:N

1. **Argumento da auditoria**: adiar a estratégia de índice "se o volume um dia justificar" é arriscado para um sistema que vai acumular anos de lançamentos de obras plurianuais; a complexidade de consultas N:N (Lançamento-Aplicação-Liquidação-Fatura) ao longo do tempo pode gerar lentidão.
2. **Argumento da réplica**: concorda que o ponto de atenção é legítimo, mas argumenta que índice é decisão de modelagem de banco (Fase 3 do roadmap), fora do escopo do documento de arquitetura técnica — cobrar isso da arquitetura técnica é cobrar da fase errada.
3. **Análise técnica**: a réplica está certa quanto ao escopo — o próprio conceitual (Seção 19) e o roadmap do projeto (`roadmap.md`, Fase 3 = "Modelagem do banco") já separam essa decisão como posterior. Não é uma falha do documento auditado deixar isso de fora. Ao mesmo tempo, a preocupação de fundo da auditoria (não adiar até a lentidão aparecer) é operacionalmente válida — só está endereçada à fase errada do processo, não ao documento errado em si.
4. **Decisão**: **vence a posição da réplica quanto ao escopo; a preocupação da auditoria é reencaminhada, não descartada**.
5. **Por quê**: arquitetura técnica e modelagem de banco são etapas sequenciais e propositalmente separadas neste projeto (Fases 2 e 3 do roadmap); cobrar decisão de índice nesta etapa contradiria a própria separação de fases já estabelecida.
6. *(Não aplicável a esta etapa — repassar como item de atenção para a Fase 3.)*

**Classificação**: **importante, mas pode esperar** — não bloqueia a Fase 2 (arquitetura técnica), deve ser tratado logo no início da Fase 3 (modelagem do banco), não adiado indefinidamente dentro dela.
**Rótulo**: aceita a posição da réplica quanto ao escopo; a preocupação de fundo da auditoria é preservada como item de atenção para a próxima fase.

---

## DIVERGÊNCIA 13 — ESTRUTURA DE PASTAS: AVALIAÇÃO GERAL DO ESQUELETO

1. **Argumento da auditoria**: não questiona o esqueleto geral da estrutura de pastas como um todo — as críticas da auditoria são todas pontuais (posicionamento de itens específicos), já cobertas nas Divergências 1, 2, 5 e 6.
2. **Argumento da réplica**: avalia explicitamente que o esqueleto (domain/application/infrastructure/interfaces, com subpastas por módulo) reflete corretamente os módulos do conceitual e não precisa ser reorganizado — só os pontos específicos já identificados precisam de ajuste.
3. **Análise técnica**: não há divergência real a arbitrar aqui — a auditoria nunca propôs reescrever o esqueleto geral, e a réplica apenas confirma essa ausência de crítica estrutural mais ampla. É uma verificação, não um conflito.
4. **Decisão**: **ratificado sem alteração** — o esqueleto geral da Seção 6 do documento técnico permanece válido.
5. **Por quê**: nenhuma das duas partes, mesmo em pontos de maior divergência entre si, argumentou que a árvore de diretórios como um todo estivesse mal desenhada — todas as correções aprovadas nesta arbitragem (Divergências 1, 2, 5, 6, 7) são edições localizadas dentro do esqueleto existente, não uma substituição dele.
6. *(Não aplicável.)*

**Classificação**: não é uma decisão pendente — está resolvida por ratificação.
**Rótulo**: mantém a arquitetura original quanto à estrutura geral.

---

## RESUMO FINAL DA ARBITRAGEM

### 1. Decisões aprovadas
*(posições que prevaleceram integralmente, de um lado ou do outro, sem necessidade de meio-termo)*
- Divergência 5 (IA no Domain): posição da réplica aprovada — a crítica de violação de princípio é rejeitada; a crítica de mistura de pastas é aprovada.
- Divergência 6 (Liquidação da Fatura): crítica da auditoria aprovada; resolução da réplica ratificada.
- Divergência 10 (ferramenta de teste de fronteira): crítica da auditoria/réplica aprovada, sem contraponto.
- Divergência 13 (esqueleto geral de pastas): arquitetura original ratificada sem alteração.

### 2. Decisões rejeitadas
*(alegações que não se sustentam, mesmo parcialmente, como formuladas)*
- Divergência 5: a alegação específica de que posicionar entidades de estado de IA no domínio viola o princípio "IA nunca é fonte de verdade" — rejeitada; essas entidades pertencem ao domínio por definição do próprio conceitual.
- Divergência 9: a rejeição total da réplica à crítica de sobreposição de testes — rejeitada como "total"; a crítica de fundo da auditoria sobrevive parcialmente (falta de critério documentado).
- Divergência 12: a cobrança de que a arquitetura técnica deveria já definir estratégia de índice — rejeitada quanto ao escopo (pertence à Fase 3), mantida como item de atenção.

### 3. Mudanças obrigatórias (bloqueantes antes da implementação)
1. Definir e registrar o critério de proporcionalidade de arquitetura (núcleo com invariante vs. cadastro simples, com `Categoria` no perfil núcleo) — Divergência 1.
2. Criar o módulo de consulta/agregação compartilhado, consumido por Balanço, Obra, Frota e ferramentas de consulta da IA, incluindo o caso de uso de Frota hoje ausente — Divergência 2.
3. Definir o mecanismo de auditoria como automático e ciente de contexto de negócio ao mesmo tempo (não uma escolha entre as duas propriedades) — Divergência 3.
4. Definir o mecanismo de permissão em dois pontos de checagem — por ação (entrada) e por escopo de dado/Empresa (carregamento do registro) — Divergência 4.
5. Separar, na estrutura de pastas, o fechamento de Fatura (Cartão) da criação da Liquidação (reaproveitando o caso de uso já existente do Financeiro) — Divergência 6.
6. Neutralizar o nome do caso de uso de status do Lançamento e registrar formalmente a estratégia de cálculo como decisão pendente na tabela consolidada — Divergência 7.

### 4. Mudanças opcionais (importantes, mas adiáveis, ou apenas melhoria futura)
- Delimitar por escrito onde termina o vocabulário "Clean Architecture" e onde começa "porta/adaptador" — Divergência 8 (melhoria futura).
- Documentar, no plano de testes (fase de implementação), o que cada camada de teste afirma para cenários compartilhados entre integração e aceitação — Divergência 9 (melhoria futura).
- Adicionar ferramenta de análise de dependência arquitetural à lista de decisões de stack quando a stack for escolhida — Divergência 10 (melhoria futura).
- Ao planejar a resolução de cada uma das 14 pendências de negócio do conceitual, classificar cada uma como comportamental ou estrutural antes de estimar esforço — Divergência 11 (melhoria futura).
- Priorizar estratégia de índice logo no início da Fase 3 (modelagem do banco), não adiar indefinidamente dentro dela — Divergência 12 (importante, mas pode esperar até o início da Fase 3).

### 5. Lista final de decisões realmente pendentes
*(nenhuma resolvida por esta arbitragem — apenas qualificadas quanto à validade e ao formato da solução; a escolha final continua com o responsável pelo projeto)*
1. Critério exato de proporcionalidade da arquitetura por módulo (Divergência 1).
2. Desenho exato do módulo de consulta compartilhado (Divergência 2).
3. Mecanismo técnico exato que torna a auditoria automática e ciente de contexto ao mesmo tempo (Divergência 3).
4. Mecanismo técnico exato dos dois pontos de checagem de permissão, e o modelo de permissão por trás (RBAC/RBAC+empresa/ABAC) (Divergência 4).
5. Confirmação formal de que o Financeiro é quem cria `LIQUIDAÇÃO_FINANCEIRA` ao fechar uma Fatura, mesmo quando acionado pelo módulo Cartão (Divergência 6).
6. Estratégia de cálculo do status do `LANÇAMENTO_FINANCEIRO` — campo persistido recalculado, view, ou cálculo em tempo real (Divergência 7).
7. Todas as 16 decisões já listadas na Seção 15 do documento técnico original, não tocadas por esta arbitragem.

Nenhuma dessas siete pendências foi resolvida aqui. Esta arbitragem qualifica cada divergência quanto à validade técnica e ao formato da solução — a decisão final continua sendo do responsável pelo projeto.
