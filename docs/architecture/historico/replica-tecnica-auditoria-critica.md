# Réplica Técnica à Auditoria Crítica
## Sistema Financeiro/Gerencial H Vieira Terraplanagem

**Papel assumido**: arquiteto responsável pela `arquitetura-tecnica.md` original, respondendo à `auditoria-critica-arquitetura-tecnica.md` como em uma revisão entre pares.

**Postura desta réplica**: cada crítica é julgada pelo mérito técnico, contra o texto literal do conceitual, do técnico e das `project-rules.md` — não pela autoria. Onde a auditoria acerta, digo que acerta e proponho a menor correção possível. Onde erra ou exagera, explico exatamente onde e por quê, citando a base. Nenhum documento existente é alterado por esta réplica; nenhuma decisão é consolidada; nenhuma tecnologia é escolhida.

---

## ÍNDICE

1. Overengineering da Clean Architecture uniforme
2. A proposta de "hexagonal seletivo"
3. Auditoria como mecanismo obrigatório vs. chamadas manuais
4. Permissões como mecanismo transversal
5. IA posicionada dentro do Domain
6. Duplicação de lógica entre Balanço, Obras, Frota e IA
7. Responsabilidade pela criação da `LIQUIDAÇÃO_FINANCEIRA` (Fatura)
8. Estratégia de cálculo do status do `LANÇAMENTO_FINANCEIRO`
9. Estrutura de pastas proposta
10. Separação Domain / Application / Infrastructure / Interfaces
11. Demais críticas da auditoria (testabilidade, manutenção, evolução, performance, vocabulário duplo)
12. Resumo final

---

## 1. OVERENGINEERING DA CLEAN ARCHITECTURE UNIFORME

**Veredito: parcialmente válida.**

**Onde a auditoria acerta**: é correto que o conceitual (Seção 19) só exige substituibilidade explícita em dois pontos (provedor de IA, origem da movimentação bancária) — e razoavelmente em um terceiro (autenticação, pendência 5). Aplicar a mesma ceremônia de 4 camadas a `Fornecedor`, `Cliente` e `Empresa` — cadastros sem nenhuma regra de negócio além de unicidade/formato — não tem contrapartida de benefício real. Isso é um custo desnecessário, e concordo com ele.

**Onde a auditoria exagera**: chamar isso de "arquitetura desenhada para um sistema muito maior do que este precisa" superestima o que foi de fato proposto. Clean Architecture, como descrita na Seção 4 do documento técnico, é um padrão de **organização de código dentro de um único processo/monólito** — a própria Seção 7 (item 6) do documento técnico já diz explicitamente "mesmo rodando como um único serviço no começo". Não há, em nenhum lugar do documento técnico, proposta de microsserviços, barramento de eventos, CQRS, ou qualquer coisa que caracterize "sistema muito maior". Overengineering de **governança interna de código** (camadas dentro de um monólito) e overengineering de **escala/distribuição** (múltiplos serviços, filas, réplicas) são categorias de erro diferentes, com custos muito diferentes — o documento técnico cometeu, no máximo, o primeiro, nunca propôs o segundo. A frase da auditoria mistura as duas categorias e isso infla a gravidade do achado.

**Um ponto que a auditoria não considerou, e que limita o alcance da concessão**: nem todo cadastro é garantidamente trivial para sempre. `CATEGORIA` especificamente já carrega uma pendência de negócio real (pendência 4 do conceitual: *"Separar Categoria em 'natureza do gasto' × 'sub-conta interna'"*) — ou seja, é um cadastro que pode ganhar regra de negócio não-trivial em breve. Simplificar agressivamente a camada de domínio de `CATEGORIA` hoje, para descobrir depois que ela precisa da mesma proteção que `LANÇAMENTO_FINANCEIRO`, é o mesmo tipo de erro de previsão que a auditoria acusa a arquitetura original de cometer (investir errado numa aposta sobre o futuro) — só que na direção oposta. `Empresa`, `Cliente` e `Fornecedor`, por outro lado, não têm nenhuma pendência de negócio pendurada nelas no conceitual — esses são candidatos seguros à simplificação.

**Menor alteração proposta**: não reescrever a Seção 4 nem a recomendação de arquitetura. Adicionar um critério de proporcionalidade explícito (algumas linhas, não uma seção nova) definindo dois perfis de módulo:
- **Perfil "núcleo com invariante"**: cadeia financeira central, Conciliação, Cartão, Financiamento/Consórcio, Rateio, Ajuste, e os estados de IA (Sugestão/Ação) — mantêm domain + application + infrastructure completos, porque cada um tem pelo menos uma regra de negócio não-trivial documentada no conceitual.
- **Perfil "cadastro simples"**: `EMPRESA`, `CLIENTE`, `FORNECEDOR` (e `CONTA_BANCÁRIA`, que também não carrega regra de negócio própria além de pertencer a uma Empresa) — podem colapsar domain+application num único caso de uso leve por operação (validar + persistir), mantendo ainda assim um repositório/porta de persistência (para não perder o benefício real de troca de banco). `CATEGORIA` fica no perfil "núcleo com invariante" até a pendência 4 do conceitual ser resolvida, justamente por já ter complexidade de negócio anunciada.

**Classificação**: **importante, e efetivamente bloqueante para o primeiro módulo da ordem de implementação** (Cadastros Base é o passo 1 da Seção 14 do documento técnico) — não porque a arquitetura geral esteja errada, mas porque essa é a decisão que define o nível de esforço do primeiro módulo a ser construído.

---

## 2. A PROPOSTA DE "HEXAGONAL SELETIVO"

**Veredito: válida na intenção, mas incompleta como formulada — e contém uma tensão interna com o próprio Achado 5 da auditoria (duplicação de lógica de leitura), que precisa ser resolvida junto, não separadamente.**

**Onde concordo**: reservar a formalização de portas/adaptadores para os pontos que o conceitual de fato trata como variáveis (provedor de IA, origem de extrato bancário, e autenticação) é o critério certo — e coincide com a análise do item 1 acima.

**Onde a proposta, se aplicada ao pé da letra, cria um problema novo**: a auditoria escreve que a estrutura mais simples deve valer "especialmente nos módulos de cadastro **e nos módulos estritamente de leitura (Obra, Frota, Balanço)**". Isso está em tensão direta com o próprio Achado 5 da mesma auditoria, que exige que Balanço/Obra/Frota/IA **compartilhem exatamente a mesma lógica de agregação** para não correr risco de responder valores diferentes para a mesma pergunta. Uma lógica de agregação compartilhada e confiável **é mais fácil de garantir com uma camada de aplicação disciplinada** (um único caso de uso de leitura reaproveitado por todos os consumidores) **do que com consultas simplificadas/ad-hoc espalhadas em cada módulo** — que é exatamente o que "estrutura mais simples para módulos de leitura" tende a produzir na prática, se lido sem mais critério. Simplificar demais a camada de leitura é, portanto, a forma mais provável de o Achado 5 da própria auditoria se concretizar.

**Menor alteração proposta**: não introduzir um novo paradigma. Adicionar **um único módulo compartilhado de leitura/consulta** (ex. `application/consultas-financeiras`, ao lado dos módulos já existentes na Seção 6 do documento técnico) contendo as agregações centrais (custo de obra, custo de veículo, saldo, ranking de fornecedores etc.). Balanço, Obra, Frota e as "ferramentas de consulta" da IA passam a **consumir** esse módulo, em vez de cada um implementar sua própria versão. Isso resolve simultaneamente:
- a proporcionalidade pedida pela auditoria (Obra/Frota/Balanço não precisam de domain/infrastructure próprios — só consomem um serviço de aplicação já existente, o que já é mais simples que o desenho original);
- o risco de duplicação apontado no Achado 5 da própria auditoria (fonte única também na leitura, não só na escrita).

**Classificação**: **importante, bloqueante a partir da implementação do segundo consumidor de leitura** (o primeiro — provavelmente Balanço — pode ser implementado sem essa decisão; a partir do segundo, sem ela, a duplicação já começa a acontecer). Coincide com a classificação que a própria auditoria deu ao Achado 5 na sua lista de bloqueantes.

---

## 3. AUDITORIA COMO MECANISMO OBRIGATÓRIO VS. CHAMADAS MANUAIS

**Veredito: válida quanto ao risco identificado; parcialmente equivocada quanto à solução implícita.**

**Onde concordo, sem ressalva**: modelar auditoria como "mais um módulo que os outros chamam" (Seção 6 do documento técnico, `application/auditoria/registrar-log.*`) não garante, por construção, que toda escrita futura vá chamá-lo. Isso é um risco real contra o princípio 10 e a regra 31 do conceitual (*"toda alteração relevante"*) e contra `project-rules.md` (*"nunca remover auditoria"* — um esquecimento tem o mesmo efeito prático de uma remoção). A crítica está certa: o desenho atual depende de disciplina humana para uma regra que o conceitual trata como absoluta.

**Onde discordo da solução implícita**: a auditoria sugere, como direção provável, um mecanismo automático genérico — interceptador/middleware/decorator. Esse tipo de mecanismo tipicamente só tem acesso a contexto **técnico** (qual rota, qual usuário autenticado) — não a contexto de **negócio** (qual campo mudou e por quê, se a origem foi uma Sugestão de IA confirmada). A regra 31 do conceitual exige exatamente esse contexto de negócio na origem do log (*"Manual / Importação Bancária / Sugestão de IA Confirmada / Ação de IA Confirmada"*), e o próprio documento técnico já observava isso na Seção 10 original: *"triggers de banco... mais difícil de enriquecer com contexto de negócio"*. Um interceptador técnico genérico tem exatamente essa mesma limitação. Portanto, a chamada explícita da camada de aplicação **não é o defeito em si** — é, na verdade, a única forma de capturar o contexto de negócio exigido. O defeito real é a **ausência de uma garantia estrutural de que a chamada não será esquecida**, não o fato de a chamada ser explícita.

**Menor alteração proposta**: manter chamadas explícitas de auditoria na camada de aplicação (para preservar o contexto de negócio), mas torná-las **estruturalmente obrigatórias, não opcionais** — por exemplo, todo caso de uso de escrita implementa um contrato/interface comum que exige os dados de auditoria como parte da própria assinatura (não é possível compilar/executar um caso de uso de escrita sem fornecê-los), complementado por um teste de arquitetura (já citado na Seção 12 do documento técnico como ideia, mas nunca aplicado a este propósito específico) que falha caso um caso de uso de escrita não produza uma entrada de log correspondente. Isso é uma exigência de **padrão de código**, não uma escolha de tecnologia — não decide framework nem mecanismo de interceptação, só torna o requisito inegociável em vez de recomendado.

**Classificação**: **bloqueante**, mas não por causa do prazo (a Seção 14 do documento técnico já sequenciava Auditoria corretamente, em paralelo ao passo 1) — bloqueante porque muda o **padrão de escrita de todo caso de uso**, e esse padrão precisa existir antes do primeiro módulo de escrita ser codificado, sob pena de retrabalho em todos os módulos já implementados até a correção.

---

## 4. PERMISSÕES COMO MECANISMO TRANSVERSAL

**Veredito: válida, com o mesmo raciocínio do item 3, e uma ressalva de escopo.**

O argumento é estruturalmente idêntico ao da Auditoria: checagem de permissão feita manualmente por caso de uso corre o mesmo risco de omissão em um caso de uso futuro. Diferente da Auditoria, aqui **não há o mesmo problema de "contexto de negócio perdido"** — autorização normalmente só precisa saber "quem" e "qual ação", que são dados técnicos disponíveis facilmente em qualquer camada de entrada (ex. HTTP). Por isso, aqui um mecanismo mais automático (guard/middleware antes mesmo de chegar à camada de aplicação) é tecnicamente mais adequado do que para auditoria — não há a mesma tensão que apontei no item 3.

**Ressalva que a auditoria não fez**: o modelo de permissão em si (RBAC simples / RBAC + escopo por empresa / ABAC) continua uma decisão separada, já listada como pendente (#14, Seção 15 do documento técnico) e não deveria ser confundida com a decisão de **mecanismo de aplicação** da checagem. É possível — e recomendável — decidir "a checagem de autorização acontece num ponto único e obrigatório antes de qualquer caso de uso de escrita" **sem** ainda decidir se o modelo por trás é RBAC ou RBAC+empresa. São duas perguntas independentes que a auditoria tratou como uma só.

**Menor alteração proposta**: mesma lógica do item 3 — um ponto único e obrigatório de checagem (guard na camada de interface, antes do caso de uso), independente de qual modelo de permissão for escolhido depois.

**Classificação**: **bloqueante** pelo mesmo motivo do item 3 (muda o padrão de todo caso de uso de escrita), mas a escolha do **modelo** de permissão continua não-bloqueante e pode ser decidida depois, como já registrado na Seção 15 original.

---

## 5. IA POSICIONADA DENTRO DO DOMAIN

**Veredito: parcialmente válida — o problema é de nomenclatura/organização, não de violação de princípio.**

**O que a auditoria acertou em apontar, mas descreveu de forma imprecisa**: a linha da Seção 6 do documento técnico (`domain/ia → contratos de "ferramenta de consulta", Sugestão/Ação (estado, não execução)`) mistura duas coisas de natureza diferente sob uma única pasta:
1. Os **contratos de ferramenta de consulta** (o esquema do que fica exposto à IA via function calling) — isso é, de fato, uma preocupação de fronteira/adaptador (o que a IA externa pode chamar), mais próxima de `application/ia` ou `infrastructure/ia-provider`, que já existem no mesmo documento.
2. As **entidades de estado** `SUGESTÃO_IA` e `AÇÃO_PROPOSTA_IA` — que **são** entidades de domínio legítimas, catalogadas como tal na Seção 3 do conceitual, com campos, relacionamentos e regras de negócio próprias (níveis de sensibilidade, proibição de fundir `categoria`/`classificação`, nunca executar sem confirmação). Essas regras são exatamente do tipo que o domínio deveria proteger — igual a `LANÇAMENTO_FINANCEIRO` ou `AJUSTE_FINANCEIRO`.

**Onde discordo do enquadramento da auditoria**: a crítica é apresentada na Seção 10 do documento de auditoria como "a arquitetura técnica não representa corretamente a conceitual", sugerindo uma violação do princípio "IA nunca é fonte de verdade" (princípio 9 do conceitual). Isso não procede: o princípio 9 fala sobre a **IA em si** (o provedor externo) nunca ser fonte de verdade — não sobre onde vivem as entidades `SUGESTÃO_IA`/`AÇÃO_PROPOSTA_IA`, que são justamente o mecanismo que **impede** a IA de ser fonte de verdade (elas existem para segurar qualquer proposta até confirmação humana). Colocar essas entidades no núcleo protegido da arquitetura é consistente com o princípio, não uma violação dele. A regra de dependência da Seção 3 do documento técnico (*"IA nunca escreve em entidade financeira diretamente — só em SUGESTÃO_IA/AÇÃO_PROPOSTA_IA"*) já está corretamente implementada independente de qual pasta guarda essas entidades.

**Menor alteração proposta**: dividir a linha da Seção 6 em duas, sem mudar nada de comportamento — `domain/ia` mantém só `SUGESTÃO_IA` e `AÇÃO_PROPOSTA_IA` (estado + invariantes); os "contratos de ferramenta de consulta" (schema exposto à IA) migram para perto de `application/ia/executar-ferramenta-consulta.*`, onde conceitualmente já pertencem. Isso é uma correção de duas linhas na estrutura de pastas, não uma mudança de arquitetura.

**Classificação**: **melhoria de clareza documental, não bloqueante** — nenhuma regra de negócio ou fronteira de escrita está em risco por causa do posicionamento atual; o ajuste evita confusão futura de quem for implementar, mas não corrige uma falha funcional.

---

## 6. DUPLICAÇÃO DE LÓGICA ENTRE BALANÇO, OBRAS, FROTA E IA

**Veredito: totalmente válida.**

Não há, na Seção 6 do documento técnico, nenhuma indicação de que `calcular-custo-obra.*`, a leitura usada por Balanço, e `executar-ferramenta-consulta.*` da IA compartilhem implementação. Dado que essas contas envolvem regras não-triviais (excluir `Cancelado`, aplicar `AJUSTE_FINANCEIRO`, respeitar a regra 22 do conceitual sobre escopo Terraplanagem-only), reimplementações independentes divergem com o tempo — isso é uma ameaça real e concreta à fonte única da verdade, mesmo com o dado fisicamente armazenado uma única vez. Concordo integralmente com o diagnóstico. A correção está unificada com o item 2 desta réplica (módulo de consulta compartilhado).

Sobre a lacuna apontada em 5.1 da auditoria (Frota sem caso de uso listado na Seção 6): correto, é uma omissão simples. Junto com a criação do módulo de consulta compartilhado (item 2 acima), a leitura de custo de Frota deve ser adicionada explicitamente ao mesmo módulo, ao lado de Obra.

**Classificação**: **bloqueante a partir do segundo consumidor de leitura** — mesma classificação do item 2 desta réplica, porque tecnicamente é a mesma decisão.

---

## 7. RESPONSABILIDADE PELA CRIAÇÃO DA `LIQUIDAÇÃO_FINANCEIRA` (FATURA)

**Veredito: totalmente válida.**

Reli a tabela de responsabilidades da Seção 13 do conceitual: `Cartões` tem como escrita listada apenas `COMPRA_CARTÃO`, `PARCELA`, `FATURA` (e o disparo de `LANÇAMENTO_FINANCEIRO`); `LIQUIDAÇÃO_FINANCEIRA` só aparece como escrita do módulo `Financeiro`. A Seção 7 do conceitual diz que a Fatura, ao ser paga, "gera" uma Liquidação, mas não atribui essa escrita a um módulo específico. A Seção 6 do documento técnico, ao colocar `fechar-fatura.*` inteiramente dentro de `application/cartao`, resolveu essa ambiguidade de fato — sem declarar que a resolveu — numa direção que, lida com rigor, contraria a leitura mais direta da tabela do conceitual (onde só Financeiro escreve Liquidação). A auditoria identificou corretamente uma ambiguidade herdada do conceitual que a técnica escondeu em vez de expor.

**Menor alteração proposta**: separar `fechar-fatura.*` em dois passos explícitos na Seção 6, sem inventar módulo novo:
- `cartao/fechar-fatura.*` — Cartão calcula/confirma o valor total cobrado do ciclo; escreve só em `FATURA`.
- O pagamento da fatura invoca o caso de uso **já existente** `financeiro/registrar-liquidacao.*` (o mesmo usado para qualquer outra Liquidação), passando a Fatura como origem/referência do valor a liquidar. `APLICAÇÃO_DE_LIQUIDAÇÃO` continua sendo escrita pelo sistema no mesmo ponto de sempre (regra já definida no conceitual, Seção 3, coluna "Quem cria/altera" de `APLICAÇÃO_DE_LIQUIDAÇÃO`: "Sistema, no momento do registro da liquidação").

Essa correção não cria abstração nova — só reaproveita um caso de uso que o próprio documento técnico já desenhava para o Financeiro, evitando que o módulo Cartão duplique a lógica de criar Liquidação/Aplicação.

**Classificação**: **bloqueante antes de implementar Cartão ou Financeiro** — concordo integralmente com a classificação da auditoria.

---

## 8. ESTRATÉGIA DE CÁLCULO DO STATUS DO `LANÇAMENTO_FINANCEIRO`

**Veredito: parcialmente válida — o risco apontado é real; a certeza da auditoria de que a decisão "já foi tomada silenciosamente" é uma leitura razoável, mas não a única possível.**

**Ressalva sobre o grau de certeza**: o nome `calcular-status-lancamento.*` (Seção 6 do documento técnico), por si só, não força tecnicamente a opção "campo persistido recalculado a cada escrita" — poderia, em tese, ser lido como uma função pura de cálculo, consumida tanto por um caminho de gravação quanto por uma projeção de leitura. Não concordo que exista, no texto, uma "decisão" no sentido estrito.

**Onde a auditoria está certa, independente dessa ressalva**: a posição do item — listado ao lado de `registrar-lancamento.*` e `registrar-liquidacao.*`, ambos inequivocamente casos de uso de escrita, dentro de `application/financeiro` — cria um viés de leitura razoável para "recalculado e persistido a cada escrita". Como esta é a regra mais citada e mais estrutural de todo o conceitual (Seção 2 inteira gira em torno dela, e o conceitual — Seção 19 — deliberadamente não decide entre campo persistido, view, ou cálculo em tempo real), qualquer viés não-declarado aqui é inaceitável, mesmo que involuntário. Concordo que o risco é real e concordo que precisa ser eliminado, independente de quem "decidiu" o quê.

**Menor alteração proposta**: renomear a entrada da Seção 6 para algo neutro (ex. `obter-status-lancamento.*`) e anexar uma nota explícita de que a estratégia (campo recalculado / view / tempo real) permanece uma decisão pendente, com referência cruzada à Seção 15 do documento técnico (que já lista esse tipo de decisão como aberta na Seção 19 do conceitual, mas não a incluiu explicitamente na tabela consolidada da Seção 15 — essa ausência na tabela consolidada é, isoladamente, uma falha real do documento técnico, independente da discussão sobre a pasta).

**Classificação**: **bloqueante** — concordo com a auditoria aqui sem reservas quanto à consequência, mesmo discordando parcialmente da certeza do diagnóstico. É a regra mais estrutural da cadeia central; precisa de decisão explícita antes de qualquer desenho de tabela.

---

## 9. ESTRUTURA DE PASTAS PROPOSTA

**Veredito: o esqueleto é válido; os defeitos são pontuais, não estruturais.**

Avaliando a estrutura como um todo (Seção 6 do documento técnico): a divisão por módulo dentro de cada camada reflete corretamente os módulos do conceitual (Seção 13 dele), e a regra de que `domain/obra`/`domain/frota` não devem ter dependência de escrita sobre Lançamento está corretamente declarada. Os problemas concretos que a auditoria encontrou — posicionamento da IA (item 5), ausência de módulo de consulta compartilhado (itens 2 e 6), ambiguidade do fechamento de fatura (item 7), viés no cálculo de status (item 8), lacuna de Frota (item 6) — são todos **defeitos localizados, corrigíveis com edições pequenas e específicas**, não evidência de que o esqueleto geral (domain/application/infrastructure/interfaces, um subpasta por módulo) esteja errado. Não há, na auditoria, nenhum achado que exija reorganizar a árvore de diretórios inteira — só ajustar o conteúedo de algumas pastas específicas.

**Classificação**: nenhuma ação de arquitetura necessária na estrutura geral; as correções pontuais já listadas nos itens 2, 5, 6, 7 e 8 acima são suficientes.

---

## 10. SEPARAÇÃO DOMAIN / APPLICATION / INFRASTRUCTURE / INTERFACES

**Veredito: válida a separação em si para o núcleo financeiro; válida a crítica de proporcionalidade para os módulos periféricos (já tratada no item 1).**

Justificando por que a separação de 4 camadas se paga especificamente para a cadeia financeira central e módulos correlatos (Cartão, Financiamento, Rateio, Ajuste, Conciliação): cada um desses módulos tem pelo menos uma invariante de negócio não-trivial e explicitamente documentada no conceitual que precisa sobreviver a qualquer reorganização técnica futura — status calculado (Seção 2), rateio mutuamente exclusivo com atribuição direta (regra 232 [Seção 8] do conceitual), Ajuste nunca altera o original (Seção 9), Fatura não é despesa única (Seção 7). Isolar essas regras de framework/banco não é sobre "trocar tecnologia" — é sobre ter um lugar único, testável sem infraestrutura, onde essas regras vivem e não podem ser contornadas acidentalmente por um controller apressado. Isso vale mesmo que o sistema nunca troque de banco.

Para os módulos de leitura (Balanço/Obra/Frota) e cadastro simples (Empresa/Cliente/Fornecedor), a separação nas 4 camadas continua tecnicamente correta, mas — como já concedido no item 1 e 2 — o **custo de implementá-la por completo em cada um deles individualmente** não se justifica: Obra/Frota/Balanço não precisam de uma entidade de domínio própria (elas leem a entidade `LANÇAMENTO_FINANCEIRO`, que já vive no núcleo) — precisam apenas consumir o módulo de consulta compartilhado proposto no item 2; e cadastros simples podem colapsar domain+application num caso de uso leve, mantendo só a camada de persistência como porta.

**Conclusão deste item**: a separação de 4 camadas não está errada como padrão — está superaplicada em módulos que não têm regra de negócio para proteger. A correção não é abandonar a separação, é reservá-la para onde ela protege algo real (já detalhado no item 1).

**Classificação**: mesma do item 1 — bloqueante para o primeiro módulo, resolvida pela mesma decisão de proporcionalidade.

---

## 11. DEMAIS CRÍTICAS DA AUDITORIA

| Crítica da auditoria | Veredito | Justificativa resumida | Classificação |
|---|---|---|---|
| Vocabulário duplo (Clean Architecture + Hexagonal) causa ambiguidade (Seção 3.3 da auditoria) | **Válida** | De fato, o documento técnico usa os dois vocabulários sem delimitar claramente onde cada um se aplica. Correção: usar "Clean Architecture" como termo guarda-chuva no texto, reservando "porta"/"adaptador" só para os pontos de integração genuinamente substituíveis (já é assim na prática, falta declarar isso explicitamente). | Melhoria de clareza documental, não bloqueante |
| Ambiguidade entre regra de domínio vs. de aplicação para "status calculado" e "rateio mutuamente exclusivo" (Seção 6 da auditoria) | **Válida, e é o mesmo problema do item 8 desta réplica** | Resolvida junto com a decisão de estratégia de status — uma vez declarada onde a regra mora, o teste correspondente também fica claro. | Bloqueante, mesma decisão do item 8 |
| Sobreposição entre testes de aceitação e de integração (Seção 6 da auditoria) | **Inválida como apontada** | Testar o mesmo cenário crítico (ex. fatura mista R$30.000) em dois níveis diferentes não é duplicação desperdiçada quando cada nível afirma algo diferente: integração confirma que o código está correto tecnicamente; aceitação confirma que o resultado bate com a regra de negócio descrita em linguagem de negócio no conceitual. Redundância deliberada em cenários financeiros críticos é defensável, não um defeito. | Não é uma ação de arquitetura; no máximo, documentar o que cada camada de teste afirma no plano de testes (fora do escopo deste documento) |
| Teste de "fronteira de módulo" exige ferramenta não contabilizada na Seção 5 (Seção 6 da auditoria) | **Válida, mas de baixa severidade** | Correto que é uma ferramenta adicional (linter de arquitetura ou equivalente) ainda não listada. Deve ser adicionada como mais um item pendente na Seção 15 do documento técnico quando a stack for escolhida. | Melhoria futura, não bloqueante — só relevante quando a suíte de testes for configurada em CI |
| Multiplicação de pontos de alteração para mudanças simples (Seção 7 da auditoria) | **Válida para cadastros simples; inválida para o núcleo financeiro** | Já tratada no item 1 desta réplica — o custo é real só onde não há regra de negócio a proteger; para o núcleo, é o preço aceitável de isolar uma invariante. | Resolvida junto com o item 1 |
| Arquitetura otimiza para troca de tecnologia (eixo improvável) em vez de evolução de regra de negócio (eixo provável, pendências 1-14 do conceitual) (Seção 8 da auditoria) | **Parcialmente válida** | Discordo da premissa de que isolar domínio de infraestrutura não ajuda na evolução de regra de negócio — ajuda, porque concentra a regra num lugar único e localizável, o que facilita resolver justamente pendências como a 14 (cancelamento com liquidação aplicada) ou a 6 (Financiamento/Consórcio). O documento técnico original subvendeu esse benefício, enfatizando só a troca de tecnologia — é uma falha de justificativa/comunicação, não de arquitetura. | Melhoria de justificativa textual, não bloqueante, não exige mudança estrutural |
| Estratégia de índice adiada "se o volume um dia justificar" (Seção 9 da auditoria) | **Parcialmente válida, mas fora do escopo do documento técnico** | O ponto de atenção é legítimo, mas índice é decisão de modelagem de banco (Fase 3 do roadmap do projeto), não de arquitetura técnica — o próprio conceitual (Seção 19) e o documento técnico deixam banco físico como decisão futura. Cobrar isso da arquitetura técnica é cobrar a fase errada, não um defeito dela. | Lembrete válido para a Fase 3 (modelagem do banco), não uma falha do documento auditado |
| Complexidade de consulta N:N Lançamento-Liquidação-Fatura ao longo de anos (Seção 9 da auditoria) | **Mesma resposta do item anterior** | Mesmo raciocínio — decisão de schema/índice, não de arquitetura. | Fase 3 (modelagem do banco), não bloqueante agora |

---

## 12. RESUMO FINAL

### Críticas aceitas integralmente
- Duplicação de lógica de leitura entre Balanço, Obra, Frota e ferramentas de consulta da IA (item 6).
- Ausência de caso de uso de Frota na estrutura de pastas (item 6, sub-achado 5.1 da auditoria).
- Ambiguidade sobre quem cria `LIQUIDAÇÃO_FINANCEIRA` ao fechar uma Fatura — Cartão vs. Financeiro (item 7).
- Risco estrutural de omissão nas chamadas de Auditoria e Permissões por dependerem de disciplina manual (itens 3 e 4).
- Vocabulário duplo (Clean Architecture + Hexagonal) sem delimitação clara (item 11).
- Ausência do item "estratégia de índice" ficar sinalizada como decisão de Fase 3, não perdida (item 11 — como lembrete, não como falha de arquitetura).
- Ausência da estratégia de status do Lançamento na tabela consolidada de decisões pendentes da Seção 15 (item 8).

### Críticas aceitas parcialmente
- Overengineering da Clean Architecture uniforme (item 1): correta para cadastros simples sem regra de negócio (Empresa, Cliente, Fornecedor, Conta Bancária); incorreta para `Categoria` (tem pendência de negócio real) e para o núcleo financeiro (tem invariantes reais a proteger); e o enquadramento "sistema muito maior" superestima o que foi de fato proposto (nunca houve proposta de distribuição/microsserviços).
- Proposta de "hexagonal seletivo" (item 2): correta na intenção, mas incompleta — se aplicada literalmente aos módulos de leitura, entra em tensão com o próprio Achado 5 da auditoria sobre duplicação de lógica; a correção certa é um módulo de consulta compartilhado, não uma simples redução de camadas.
- Mecanismo automático de auditoria (item 3): concordo com o risco identificado, discordo do mecanismo implícito sugerido (interceptador genérico) — ele não capturaria o contexto de negócio que a regra 31 do conceitual exige; a correção proposta mantém chamadas explícitas, mas as torna estruturalmente obrigatórias.
- IA posicionada dentro do Domain (item 5): o achado de mistura de responsabilidades na mesma pasta procede; a alegação de que isso viola o princípio "IA nunca é fonte de verdade" não procede — as entidades de estado de IA pertencem legitimamente ao domínio.
- Estratégia de cálculo do status do Lançamento (item 8): o risco e a necessidade de correção procedem integralmente; o grau de certeza da auditoria de que uma decisão já foi tomada silenciosamente é uma leitura razoável, mas não a única possível.
- Arquitetura otimizada para o eixo errado de mudança (item 11): a observação de ênfase excessiva em troca de tecnologia procede; a conclusão de que isolar domínio não ajuda na evolução de regra de negócio não procede.

### Críticas rejeitadas
- Sobreposição entre testes de aceitação e de integração como desperdício (item 11) — redundância deliberada em cenários financeiros críticos é defensável.
- Estratégia de índice e complexidade de consulta N:N como falha da arquitetura técnica (item 11) — são decisões de modelagem de banco, corretamente fora de escopo desta fase, não uma omissão do documento auditado.

### Mudanças que realmente recomenda fazer (todas pequenas, nenhuma reescrita)
1. Definir e registrar o critério de proporcionalidade (núcleo com invariante vs. cadastro simples) antes de iniciar Cadastros Base.
2. Criar um módulo de consulta/agregação compartilhado, consumido por Balanço, Obra, Frota e ferramentas de consulta da IA — incluindo Frota, hoje ausente.
3. Tornar a chamada de Auditoria estruturalmente obrigatória em todo caso de uso de escrita (via contrato/assinatura comum + teste de arquitetura), mantendo-a explícita na camada de aplicação por causa do contexto de negócio exigido pela regra 31.
4. Tornar a checagem de Permissão um ponto único e obrigatório antes de qualquer caso de uso de escrita, independente do modelo de permissão que for escolhido depois.
5. Separar, na Seção 6, os contratos de ferramenta de consulta da IA (→ `application/ia`) das entidades de estado Sugestão/Ação (→ permanecem em `domain/ia`).
6. Explicitar a divisão de `fechar-fatura.*` em dois passos: Cartão calcula/confirma o total da Fatura; o pagamento invoca o caso de uso já existente `financeiro/registrar-liquidacao.*`.
7. Neutralizar o nome/anotar como pendente a estratégia de cálculo do status do Lançamento, e adicioná-la explicitamente à tabela consolidada da Seção 15.
8. Delimitar por escrito onde termina o vocabulário "Clean Architecture" e onde começa "porta/adaptador" no texto da Seção 4.

### Mudanças que NÃO recomenda fazer
- Não simplificar a camada de domínio da cadeia financeira central, Cartão, Financiamento, Rateio, Ajuste ou Conciliação — essas invariantes são reais e documentadas no conceitual.
- Não simplificar `CATEGORIA` para o perfil "cadastro simples" enquanto a pendência 4 do conceitual não for resolvida.
- Não adotar um interceptador técnico genérico como mecanismo de auditoria sem antes resolver como ele captura contexto de negócio (origem Manual/Importação/Sugestão IA/Ação IA) — sob pena de não cumprir a regra 31 do conceitual.
- Não reorganizar a árvore de diretórios da Seção 6 como um todo — o esqueleto está correto, só pontos específicos precisam de ajuste.
- Não tratar estratégia de índice/schema de banco como pendência desta fase — pertence à Fase 3 (modelagem do banco) do roadmap.

### Decisões que continuam pendentes
- Todas as 16 decisões já listadas na Seção 15 do documento técnico permanecem pendentes e inalteradas por esta réplica.
- As 6 decisões bloqueantes levantadas pela auditoria continuam pendentes — nenhuma foi resolvida aqui, só analisada quanto à validade e ao tamanho da correção necessária.
- Nova pendência identificada nesta réplica: qual mecanismo estrutural (contrato de caso de uso + teste de arquitetura, ou outro equivalente) será usado para tornar Auditoria e Permissão obrigatórias — o **requisito** de que exista tal mecanismo é consensual entre auditoria e esta réplica; o mecanismo exato ainda não foi escolhido, propositalmente, para não decidir tecnologia neste documento.
