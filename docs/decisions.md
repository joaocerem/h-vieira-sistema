# Registro Oficial de Decisões
## Sistema Financeiro/Gerencial H Vieira Terraplanagem

**Natureza deste documento**: este é o registro oficial e definitivo de decisões do projeto — a partir desta consolidação (Etapa 7), é **a fonte corrente** para "qual foi a decisão sobre X", com a mesma autoridade normativa dos demais documentos fonte de verdade listados em `handoff.md`, Seção 4. As decisões abaixo estão **consolidadas e não devem ser reabertas ou reinterpretadas** — qualquer necessidade de revisão de uma decisão aqui registrada é, ela própria, uma nova decisão, que deve ser proposta, registrada e aprovada explicitamente, nunca presumida.

**Origem**: as 11 decisões da Seção A e as duas resoluções adicionais da Seção B foram consolidadas ao longo da etapa de resolução das pendências bloqueantes do modelo de domínio e da arquitetura técnica, e estão transcritas aqui exatamente como registradas em `handoff.md`, Seção 7 — sem reinterpretação, resumo ou alteração de sentido. Os 7 princípios de modelagem da Seção C são normativos desde `principios-de-modelagem.md` e estão referenciados aqui, não duplicados.

**Data de oficialização deste registro**: 2026-08-13 (Etapa 7 da consolidação documental).

---

## A. As 11 decisões consolidadas

1. **Status do Lançamento**: dividido em duas dimensões independentes, nunca fundidas — `situação_administrativa` (persistida, decisão humana sobre o ciclo de vida) e `status_financeiro` (sempre calculado a partir das Aplicações, nunca armazenado, sem exceção).
2. **Cancelamento**: `situação_administrativa` só pode virar "Cancelado" quando a soma de Aplicações de Liquidação vinculadas for exatamente zero. Qualquer correção de um Lançamento que já tenha Aplicações passa exclusivamente por `AJUSTE_FINANCEIRO`. Cancelamento e Ajuste são conceitos distintos que nunca produzem o mesmo resultado por caminhos diferentes.
3. **Vínculo genérico** (`LOG_AUDITORIA`, `SUGESTÃO_IA`, e o "registro gerado" por `AÇÃO_PROPOSTA_IA`): cada um permanece entidade única, com referência genérica **só no nível conceitual**. A lista de entidades referenciáveis é fechada e explícita — nunca uma referência totalmente livre; nova entidade auditável exige adição deliberada. Cada mecanismo mantém seu próprio escopo (Sugestão limitada a 2 tipos; Ação limitada às entidades oficialmente permitidas para IA; `AJUSTE_FINANCEIRO` continua com referências concretas, nunca genéricas). A referência genérica existe só para evitar duplicação estrutural — nunca flexibiliza regra de negócio. **Técnica de implementação (banco) continua em aberto** — ver `pendencias.md`, item B4.
4. **`CONTRATO_FINANCEIRO`**: permanece entidade única (Financiamento/Consórcio via `tipo`). Campos condicionais (`taxa`, `grupo-cota`, `contemplado`) são restrição de **negócio do domínio**, não validação de interface — o campo do outro tipo é conceitualmente inexistente, não apenas vazio. Princípio geral derivado: separar entidades só por diferença real de **comportamento**, nunca só de atributos.
5. **`CATEGORIA`**: permanece com `nome`/`tipo`, sem segunda dimensão de "sub-conta interna" — não há definição de negócio para esse conceito hoje. Reclassificada para o perfil arquitetural "cadastro simples" (consequência da mesma decisão, incorporada na Etapa 3).
6. **Fatura ↔ Parcela**: `PARCELA` referencia `FATURA` diretamente (nunca `COMPRA_CARTÃO` → `FATURA` direto — ver a correção registrada em `handoff.md`, Seção 9). Uma Fatura fechada continua aceitando vínculo de Parcelas descobertas depois, por importação — mas `valor_total_calculado`/`valor_cobrado` ficam **congelados** no momento do fechamento, nunca recalculados. Diferença entre o total congelado e a soma atual de Parcelas vinculadas é efeito esperado, não inconsistência. Nenhuma entidade nova de reconciliação foi criada.
7. **Atribuição de ciclo da Parcela**: ausência de vínculo com Fatura já representa "aguardando" — nenhum status novo criado; `status` da Parcela é dimensão independente de "tem Fatura". Regra de atribuição: cadastro **manual sem fonte externa autoritativa**, com data em ciclo já fechado → próximo ciclo aberto no momento do processamento (usa `LOG_AUDITORIA.data/hora`, sem campo novo em `COMPRA_CARTÃO`). Quando existe fonte externa autoritativa (importação) → vínculo direto com a Fatura real, mesmo já fechada — prevalece sempre sobre a regra do "próximo ciclo aberto".
8. **`AJUSTE_FINANCEIRO` é exclusivamente iniciativa humana**: a IA nunca pode formalizar uma proposta de criação de Ajuste via `AÇÃO_PROPOSTA_IA`, em nenhum nível de sensibilidade — regra arquitetural, não limitação de implementação. A IA **pode** informar, explicar e recomendar que o usuário avalie um Ajuste em linguagem natural; só não pode iniciar o fluxo formal.
9. **Saldo devedor de `CONTRATO_FINANCEIRO`**: sempre = soma das Parcelas ainda em aberto. `valor_contratado` **nunca** participa desse cálculo — a fórmula "contratado menos pago" é inválida para o modelo. `valor_contratado` continua útil para consulta/histórico. O modelo **não decompõe** Parcela em principal/juros/taxa de administração — cada Parcela é só o valor devido naquele vencimento.
10. **Tolerância de Rateio**: exclusivamente técnica (arredondamento da menor unidade monetária) — nunca uma política de negócio para permitir rateios aproximados. Qualquer diferença além do arredondamento é inválida.
11. **Tolerância de dias da conciliação**: reclassificada como **não-bloqueante**, permanece pendência (não afeta nenhuma entidade). Deve ser **configurável**, nunca uma constante fixa espalhada pelo sistema — resolvida só quando o mecanismo de sugestão automática de conciliação for projetado.

---

## B. Resoluções adicionais, fora da numeração 1-11

Registradas em `handoff.md`, Seção 7, junto com as 11 decisões acima, durante a Etapa 3 (consolidação da arquitetura técnica):

- Confirmação de que o módulo Financeiro cria `LIQUIDAÇÃO_FINANCEIRA` ao fechar uma Fatura (arbitragem técnica, Divergência 6).
- Correção de posicionamento da IA na estrutura de pastas (arbitragem técnica, Divergência 5).

---

## C. Os 7 princípios de modelagem

Normativos desde `principios-de-modelagem.md` — este registro **não duplica** o conteúdo de cada princípio (justificativa, origem, exemplos), apenas indexa os títulos oficiais para referência cruzada. Consultar o documento original para o texto completo de cada um.

1. Entidades só devem ser separadas quando houver diferença real de comportamento de negócio
2. O modelo só representa conceitos que possuem significado de negócio claramente definido
3. Não criar estrutura nova quando a estrutura existente já resolve o problema
4. Preservar uma única fonte da verdade para cada informação
5. Fatos históricos não são reescritos
6. Indicadores derivados devem, sempre que possível, ser calculados em vez de persistidos
7. Toda exceção a esses princípios deve ser explicitamente justificada

Ver `principios-de-modelagem.md` para o texto normativo completo de cada princípio, incluindo a origem específica que o motivou.

---

## D. Regras de uso deste documento

- **Não reabrir** nenhuma das 11 decisões da Seção A, nem as duas resoluções da Seção B, sem aprovação explícita de uma nova decisão que as substitua — reabertura nunca é silenciosa.
- **Pendências não são decisões.** O que ainda está em aberto está exclusivamente em `pendencias.md` — este documento nunca deve ser usado para inferir que algo pendente foi decidido.
- Qualquer decisão nova, a partir de agora, deve ser adicionada a este documento como um novo item numerado, com a mesma formalidade (registro explícito, sem reinterpretar decisões existentes), preservando o histórico das decisões 1-11 e B intactas.

---

## E. Decisões técnicas registradas após a consolidação (a partir da Fase 3)

Decisões técnicas resolvidas em sessões posteriores à Etapa 7, com a mesma formalidade das decisões da Seção A — numeração sequencial à decisão 11, mantidas em seção própria por serem de natureza técnica (tecnologia/arquitetura), não de domínio/negócio.

12. **T1 — Linguagem, framework, gerenciador de dependências e ORM do backend**: definidos como stack oficial do projeto — **Java 21 LTS**, **Spring Boot**, **Maven** (gerenciador de dependências) e **Hibernate/JPA**, via Spring Data JPA (ORM principal). Banco de dados físico (PostgreSQL) já decidido anteriormente (B1, `arquitetura-fisica-banco.md`).
    - **Alternativas analisadas**: Node.js + TypeScript (NestJS), Python (FastAPI) e .NET (C# + ASP.NET Core) — comparação original em `arquitetura-tecnica.md`, Seção 5.1. Java foi identificado posteriormente como candidato nunca avaliado na documentação original (nenhuma justificativa registrada para a ausência) e analisado nos mesmos critérios das outras três antes desta decisão.
    - **Java e .NET foram considerados tecnicamente equivalentes para este projeto** — ambos com tipagem forte, imposição estrutural de fronteiras entre camadas (via módulos de build), ORM e migrations maduros, e histórico consolidado em sistemas financeiros corporativos. Nenhuma incompatibilidade técnica foi encontrada em nenhuma das quatro opções analisadas contra a arquitetura já congelada, o domínio financeiro ou o schema PostgreSQL já implementado.
    - **Motivo da escolha**: decorre da combinação entre essa equivalência técnica com .NET e a redução do risco operacional de um projeto mantido predominantemente por um único desenvolvedor durante vários anos — o mantenedor já está investindo na stack Java, o que reduz o risco real de a manutenção solo ficar bloqueada por falta de familiaridade, e o ecossistema Spring Boot tem o maior volume de documentação/exemplos entre as quatro opções, reforçando esse mesmo ponto. Essa é a justificativa registrada — preferência pessoal, isoladamente, não foi usada como razão técnica da escolha.
    - **Consequência direta**: `pendencias.md`, item B2 (ORM/camada de acesso a dados) deixa de depender da escolha de linguagem; resta, só se houver necessidade real, o detalhe de estratégia de uso do Hibernate/JPA.
    - **Onde está discutida**: `arquitetura-tecnica.md`, Seção 5.1 (comparação e nota de decisão).

13. **A1 — Estilo de arquitetura de software**: definido como Clean Architecture, com o vocabulário de Ports & Adapters (Hexagonal) aplicado especificamente aos pontos que o próprio domínio já trata como fronteira controlada (ferramentas de consulta da IA, importação de extrato bancário, e futuramente o provedor de IA e o provedor de Open Finance) — a recomendação de `arquitetura-tecnica.md`, Seção 4, é adotada integralmente, sem alteração de conteúdo.
    - **Alternativas analisadas**: MVC simples e Camadas (N-tier) — descartadas por não oferecerem nenhum mecanismo estrutural que imponha as fronteiras de escrita já exigidas (`arquitetura-tecnica.md`, Seção 3) nem o isolamento de regra de negócio já exigido (Seção 4).
    - **Clean Architecture e Hexagonal/Ports & Adapters passam a ser tratadas, neste projeto, como uma única alternativa arquitetural** — não como candidatos concorrentes entre si: descrevem a mesma organização estrutural já detalhada em `arquitetura-tecnica.md`, Seção 6, diferindo só em vocabulário/ênfase, nunca em resultado final.
    - **Motivo técnico da decisão**: os quatro princípios estruturais do domínio (fonte única da verdade, nada é apagado, indicador sempre calculado, IA nunca escreve direto) precisam sobreviver a qualquer troca de banco, framework ou provedor de IA — colocar essas regras no centro da arquitetura, isolada de framework/banco/IA, é a única das opções analisadas que torna essas regras difíceis de violar por acidente, e não apenas proibidas por convenção.
    - **Critério de proporcionalidade** entre perfis de módulo (núcleo com invariante / cadastro simples), já resolvido anteriormente (arbitragem técnica, Divergência 1, incorporada na Etapa 3), **permanece vigente, sem alteração**.
    - **Consequência direta**: a estrutura de pastas de `arquitetura-tecnica.md`, Seção 6, deixa de ser recomendação e passa a ser o **padrão oficial** do backend.
    - **Onde está discutida**: `arquitetura-tecnica.md`, Seção 4 e Seção 6.

14. **T3 — Estratégia de autenticação**: definida como autenticação própria — usuário/senha, com **Spring Security** e **JWT** como mecanismo de autenticação; hash de senha com **Argon2** (preferencial), com bcrypt mantido apenas como alternativa caso surja impedimento técnico documentado ao usar Argon2. Nenhum provedor externo (Auth0, Clerk, Keycloak) é utilizado.
    - **Alternativas analisadas**: provedor externo, nas duas variantes documentadas (SaaS gerenciado — Auth0/Clerk — e auto-hospedado — Keycloak) — descartadas por desalinhamento com o perfil do sistema: nenhuma das capacidades centrais de um provedor externo (auto-cadastro público, login social, escala multi-tenant) tem uso num sistema interno, fechado, sem cadastro público, com poucos usuários, e sem necessidade documentada de SSO entre múltiplos sistemas do grupo.
    - **Motivo técnico da escolha**: reduz a complexidade operacional total do sistema (nenhum serviço adicional a implantar/operar, nenhuma dependência de rede externa no caminho crítico de login) e o risco operacional de longo prazo (nenhuma dependência de continuidade/preço de terceiro) — relevante para um sistema mantido predominantemente por um único desenvolvedor durante muitos anos. Spring Security, já parte da stack congelada (T1), dá suporte nativo e maduro a esse padrão.
    - **Consequência direta**: A4 (mecanismo dos dois pontos de checagem de permissão) implementa validação de identidade via filtro JWT próprio, não via `resource-server` OAuth2/OIDC de terceiro. A5 (auditoria automática) usa diretamente o `USUÁRIO` interno como fonte única de identidade, sem necessidade de mapeamento para um ID externo. A2 (modelo de permissões) permanece decisão independente, não afetada por esta escolha.
    - **Onde está discutida**: `arquitetura-tecnica.md`, Seção 5.5.

15. **A4 — Mecanismo técnico dos dois pontos de checagem de permissão**: definido como
    composição de dois mecanismos — **Spring Security Method Security**
    (`@PreAuthorize`/`@PostAuthorize`, com `PermissionEvaluator` customizado) para o ponto
    (i) — autorização por ação, no guard de entrada —, e **Hibernate/JPA Filters**
    (`@FilterDef`/`@Filter`) para o ponto (ii) — autorização por escopo de dado/Empresa, no
    carregamento do registro.
    - **Alternativas analisadas para o ponto (i)**: Spring Security Method Security e
      aspecto/interceptor customizado (Spring AOP) — Method Security escolhida por ser
      mecanismo nativo do Spring Security, com maior maturidade, menor volume de código
      próprio a manter, e integração de primeira classe com T1/T3 já congeladas.
    - **Alternativas analisadas para o ponto (ii)**: checagem manual explícita e
      Hibernate/JPA Filters — Hibernate Filters escolhida por eliminar estruturalmente o
      risco de esquecimento (aplica-se automaticamente a toda consulta da entidade), por
      desempenho superior (registro de outra Empresa nunca é carregado), e por aderência
      direta ao domínio.
    - **Mecanismo exato do ponto (ii)**: `@FilterDef`/`@Filter` (Hibernate clássico),
      parametrizado com a lista de Empresas permitidas ao usuário — não `@TenantId`. Este
      projeto não é multi-tenant no sentido tradicional (sem SaaS, sem isolamento de
      schema/banco por tenant) e um usuário pode ter acesso a mais de uma Empresa
      simultaneamente (ver A2, "RBAC + escopo por empresa"), cenário que `@TenantId` — que
      assume um único tenant ativo por sessão — não acomoda naturalmente. `@Filter` aceita
      parâmetro de coleção, compatível com uma lista variável de Empresas por usuário.
    - **Local de aplicação do ponto (i)**: as anotações de Method Security devem estar no
      bean de aplicação (caso de uso) que executa cada operação, nunca restritas a um
      adaptador de entrada específico (ex. só controllers HTTP) — garantindo que qualquer
      ponto de entrada presente ou futuro (controller, scheduler, consumidor de fila,
      confirmação de Ação de IA) passe pela mesma checagem, sem precisar replicá-la
      manualmente a cada novo adaptador. As chamadas devem sempre ocorrer via injeção de
      dependência do container Spring, nunca por auto-invocação dentro da mesma classe,
      para que o proxy de segurança seja efetivamente acionado.
    - **Combinações alternativas descartadas**: Method Security + checagem manual, e
      aspecto customizado + checagem manual (ambas com o ponto (ii) sujeito a
      esquecimento, o risco central que A4 existe para eliminar); aspecto customizado +
      Hibernate Filters (tecnicamente viável e com melhor isolamento de Clean Architecture,
      mas exige a maior quantidade de código de infraestrutura própria a construir e
      manter, sem vantagem adicional suficiente sobre a combinação escolhida para
      justificar esse custo).
    - **Desvantagens conhecidas e aceitas**: anotações de Method Security tocam a camada de
      aplicação, criando tensão com o isolamento estrito de A1 — aceita deliberadamente em
      troca de cobertura uniforme independente do adaptador de entrada; Hibernate Filters
      exige ativação correta em toda transação, ponto de configuração centralizado cuja
      falha silenciosa teria consequência séria (vazamento de dados entre empresas) —
      exige atenção redobrada nessa configuração específica; ambos os mecanismos podem
      exigir revisão se A2 evoluir para um modelo de permissão mais dinâmico (ABAC).
    - **Consequência direta**: a implementação completa depende de A2 (modelo de
      permissão) estar decidida, para alimentar as regras que o `PermissionEvaluator` e o
      parâmetro do filtro vão checar; D7 (vínculo direto Lançamento↔Empresa ausente) foi
      resolvida separadamente, para que o ponto (ii) funcione para
      `LANÇAMENTO_FINANCEIRO` especificamente — ver decisão #21.
    - **Onde está discutida**: `arquitetura-tecnica.md`, Seção 11.

16. **A2 — Modelo de permissões de usuário**: definido como **RBAC + escopo por Empresa** —
    papel fixo (ex. Admin, Financeiro, Consulta) combinado com escopo sobre uma ou mais
    Empresas do grupo às quais o usuário tem acesso.
    - **Alternativas analisadas**: RBAC simples (insuficiente — não cobre a dimensão "por
      Empresa" exigida pelo domínio, `arquitetura-tecnica.md` Seção 11); ABAC (descartado
      por desproporção — complexidade de motor de regras dinâmico para um problema de duas
      dimensões fixas e conhecidas, já reconhecido textualmente na própria Seção 11); ACL
      por objeto individual (descartado pelo mesmo motivo já usado para excluí-la de A4 —
      granularidade por registro individual não corresponde a nenhum requisito documentado,
      que pede escopo por grupo de registros — Empresa —, não por registro isolado).
    - **Motivo técnico da escolha**: cobre exatamente as duas dimensões de controle já
      identificadas em `arquitetura-tecnica.md`, Seção 11 (por ação e por Empresa), com
      suporte nativo de primeira classe no Spring Security para o conceito de papel.
    - **Consequência direta**: compatível com o mecanismo já em desenho para A4, sem exigir
      redesenho; A3 (cruzamento entre papel de usuário e níveis de confirmação da IA) passa
      a ter um modelo de papéis concreto sobre o qual definir a regra de negócio (ainda
      pendente, decisão de negócio distinta desta); a estrutura de `USUÁRIO` em
      `modelo-logico.md` precisa da revisão estrutural completa já prevista, não mais um
      bloco deliberadamente mínimo; D7, pré-requisito para o escopo por Empresa funcionar
      em `LANÇAMENTO_FINANCEIRO`, foi resolvida separadamente — ver decisão #21.
    - **Onde está discutida**: `arquitetura-tecnica.md`, Seção 11.

17. **A3 — Cruzamento entre papel de usuário e níveis de confirmação da IA**: definido como
    **Papel → nível máximo** — cada papel de usuário (definido em A2) autoriza a confirmação
    até um nível máximo fixo entre os três já congelados no documento conceitual (Baixo,
    Médio, Alto); nenhuma exigência de segunda confirmação por outro usuário.
    - **Alternativas analisadas**: Maker-checker/dupla aprovação — descartado porque, no
      cenário mais provável deste projeto (empresa do grupo com apenas um usuário
      financeiro presente), o modelo trava a confirmação de ações de nível Alto por falta
      de um segundo aprovador disponível, comprometendo a continuidade operacional. Sem
      diferenciação por papel, confirmação baseada em valor financeiro e matriz papel ×
      tipo de ação também foram avaliados e descartados, por desalinhamento com o domínio
      ou desproporção ao porte deste projeto.
    - **Motivo da escolha**: para um sistema interno, de uso fechado, com poucos usuários
      por empresa entre as seis do grupo, Papel → nível máximo garante continuidade
      operacional sem depender da disponibilidade simultânea de duas pessoas, e exige menos
      infraestrutura própria para manter ao longo dos anos. É compatível com o mecanismo já
      definido em A4. O risco de fraude que o maker-checker mitiga corresponde a um perfil
      de ameaça (atores não plenamente confiáveis, conluio em larga escala) que não
      corresponde ao contexto já descrito para este projeto.
    - **Consequência direta**: A8 permanece livre para escolher seu próprio mecanismo de
      barreira para o nível Alto, sem sobreposição criada por esta decisão; I8 continua
      condicional exclusivamente à escolha de A8, não a esta decisão; I1 não é afetada. O
      mapeamento concreto entre cada papel específico e seu nível máximo permanece como
      detalhamento a ser especificado separadamente, dentro do modelo aqui definido.
    - **Onde está discutida**: `arquitetura-tecnica.md`, Seção 11.

18. **A5 — Mecanismo técnico de auditoria automática**: definido como um aspecto customizado
    (Spring AOP, `@Around`), que intercepta a execução de cada caso de uso de escrita,
    captura o estado do registro antes e depois da operação, e grava a linha correspondente
    em `LOG_AUDITORIA`, dentro da mesma transação da escrita de negócio. O contexto de
    execução exigido como parâmetro obrigatório de entrada contempla a totalidade das
    informações exigidas por `LOG_AUDITORIA`, conforme definido em
    `domain-model/24-log-auditoria.md`, Seção 2.
    - **Alternativas analisadas**: Hibernate Envers — descartado porque gera nativamente
      uma tabela de auditoria por entidade, contrariando a decisão já congelada de
      `LOG_AUDITORIA` como entidade única genérica; JPA Entity Listeners — descartado
      porque não recebe o contexto de negócio nativamente, exigindo mecanismo de contorno
      adicional; Spring Data JPA Auditing — descartado por não gerar histórico granular por
      campo nem capturar contexto de negócio, resolvendo um problema adjacente ao de A5;
      Spring Application Events — descartado por depender de publicação manual em cada
      caso de uso, o que não garante que nenhuma escrita relevante escape.
    - **Motivo da escolha**: é o único mecanismo, entre os analisados, que satisfaz
      simultaneamente as duas propriedades exigidas pela arquitetura técnica — automático
      (nenhuma escrita relevante passa sem gerar log) e ciente do contexto de negócio
      (recebe o contexto completo exigido por `LOG_AUDITORIA`) —, sem contrariar nenhuma
      decisão já congelada. É compatível com A4, sem alterar nem pressupor seu mecanismo
      interno.
    - **Desvantagens conhecidas e aceitas**: é infraestrutura própria a construir e manter,
      não uma biblioteca pronta; exige disciplina para que todo caso de uso novo seja
      efetivamente marcado para interceptação; a captura de diferença campo a campo exige
      lógica própria de comparação; testar que a interceptação ocorre no método certo
      geralmente exige contexto Spring carregado, não só teste unitário isolado; assim como
      em A4, o aspecto toca a camada de aplicação, criando a mesma tensão com o isolamento
      estrito de A1, aceita deliberadamente pelo mesmo motivo já registrado na decisão #15.
    - **Consequência direta**: o mecanismo não altera a forma física do vínculo genérico de
      `LOG_AUDITORIA` (`entidade`/`id`), que permanece pendência separada (B4); todo caso de
      uso de escrita passa a expor, como parâmetro obrigatório de entrada, o contexto
      completo exigido por `LOG_AUDITORIA`, para que o aspecto o capture.
    - **Onde está discutida**: `arquitetura-tecnica.md`, Seção 10.

19. **Mecanismo de implementação do módulo de consulta compartilhado
    (`application/consultas-financeiras`)**: definido como um serviço de aplicação
    (Application Service/Facade), implementado como componentes Spring (`@Service`) dentro
    de `application/consultas-financeiras`, que compõem os resultados de repositórios
    Spring Data JPA (Hibernate/JPA) para expor as consultas agregadas aos quatro
    consumidores já previstos (Balanço, Obra, Frota e ferramentas de consulta da IA). **Esta
    é uma decisão técnica independente, registrada sem código de pendência associado**
    (`decisions.md`, Seção D). O catálogo fechado de quais consultas/funções específicas o
    módulo expõe permanece pendência aberta, registrada em `pendencias.md`, item A6 — esta
    decisão não a resolve, nem total nem parcialmente.
    - **Alternativas analisadas**: Spring Data JPA com `@Query` (JPQL)/Projections —
      tecnicamente também recebe os Hibernate/JPA Filters de A4 automaticamente (mesma
      sessão do Hibernate), mas desloca a fórmula de agregação (regra de negócio) para a
      camada de infraestrutura/repositório, tensionando o isolamento de A1; jOOQ como
      camada de consulta dedicada — já citada em `pendencias.md`, item B2, como candidata
      futura, mas introduz uma segunda ferramenta de acesso a dados além do Hibernate/JPA
      já congelado em T1, e suas consultas não passam pela sessão do Hibernate, não
      recebendo automaticamente os Filters de A4; Views de banco (SQL Views) —
      tecnicamente viável, mas o próprio projeto já tentou essa técnica para uma das três
      agregações-exemplo de A6 ("saldo devedor de Contrato") e a adiou por completo em
      `05_views.sql`, por bloqueio de ambiguidade de domínio ainda não resolvido; CQRS com
      modelo de leitura dedicado — descartado por desproporção: nenhum documento do
      projeto registra necessidade de escala que justifique um banco de leitura separado,
      e exigiria estrutura de infraestrutura não prevista na estrutura de pastas hoje
      oficial.
    - **Motivo da escolha**: é a única alternativa com correspondência textual direta e
      integral com a Divergência 2 da arbitragem técnica (módulo de aplicação
      compartilhado, sem domínio/infraestrutura próprios por consumidor) e com a estrutura
      de pastas já oficializada por A1 (decisão #13); usa exclusivamente a stack já
      congelada em T1 (Hibernate/JPA via Spring Data JPA), sem introduzir nova tecnologia
      de acesso a dados; mantém a fórmula de agregação na camada de aplicação, evitando a
      tensão com o isolamento de A1 registrada para a alternativa baseada em JPQL direto
      no repositório.
    - **Desvantagens conhecidas e aceitas**: agregações muito complexas expressas em
      código Java, em vez de SQL, podem ser menos eficientes para grandes volumes; exige
      atenção a consultas N+1 se mal implementado.
    - **Consequência direta**: as consultas deste módulo passam pela sessão do Hibernate
      por padrão, herdando automaticamente os Hibernate/JPA Filters de escopo por Empresa
      já definidos em A4, sem exigir código adicional de checagem manual. *(Nota de
      escopo, não consequência desta escolha específica: o catálogo fechado de
      consultas/funções expostas — o motivo original de A6 — permanece indefinido
      independentemente do mecanismo aqui escolhido; a consulta "saldo devedor de
      Contrato" herda um bloqueio de ambiguidade de domínio já documentado em
      `plano-implementacao-sql.md`; B2 continua dependendo do catálogo estar definido, não
      apenas do mecanismo.)*
    - **Onde está discutida**: `arquitetura-tecnica.md`, Seção 6.

20. **B4 — Implementação técnica do vínculo genérico de auditoria**: definida como
    referência polimórfica (`entidade_tipo` + `entidade_id`, e os pares equivalentes
    `referencia_tipo`/`referencia_id` em `LOG_AUDITORIA` e `entidade_alvo_tipo`/
    `entidade_alvo_id` em `SUGESTÃO_IA`), sem FK nativa do banco. A integridade
    referencial é mitigada, não eliminada, pela validação feita na camada de aplicação
    responsável por gravar os registros de auditoria — não pelo banco. Em Hibernate/JPA,
    as colunas são mapeadas como campos simples, não como associação `@Any`/`@ManyToAny`;
    a resolução do registro real referenciado, quando necessária, é feita explicitamente
    pela aplicação, não pelo ORM.
    - **Alternativas analisadas**: Tabela de junção — descartada por exigir
      reestruturação significativa do schema físico já implementado (as colunas de
      referência genérica já existem, sem FK, nas três tabelas afetadas) e por escalar mal
      conforme a lista de entidades auditáveis crescer (proliferação de tabelas
      satélite); FKs mutuamente exclusivas — descartada pelos mesmos dois motivos: exige
      reestruturação do schema já implementado, e tem a mesma limitação de escalabilidade
      (proliferação de colunas), característica conhecida do padrão "exclusive arc".
    - **Motivo da escolha**: é a única alternativa que não exige nenhuma reestruturação do
      schema físico já implementado; cresce sem exigir novas tabelas nem novas colunas
      conforme a lista fechada de entidades auditáveis aumentar, mantendo a adição de uma
      nova entidade como mudança pequena e localizada (atualizar a lista/CHECK),
      consistente com a regra já registrada de que essa adição deve ser sempre
      deliberada; mantém a resolução da referência na aplicação, evitando deslocar essa
      responsabilidade para triggers do banco; a validação na aplicação, embora não
      garanta integridade, mitiga o risco prático de referência órfã, porque a escrita
      nessas colunas ocorre por caminhos controlados da aplicação, e não por entrada
      externa diretamente no banco.
    - **Desvantagens conhecidas e aceitas**: sem integridade referencial garantida pelo
      banco — um `entidade_id` inválido não é rejeitado automaticamente pelo PostgreSQL;
      suporte do Hibernate a esse tipo de referência é limitado à extensão proprietária
      `@Any`, com restrições de query conhecidas — por isso não adotada, deslocando a
      resolução do registro real referenciado para a aplicação.
    - **Consequência direta**: nenhuma mudança estrutural nas colunas já existentes; esta
      decisão fixa apenas a forma da referência (polimórfica) — um índice composto
      `(entidade, entidade_id)`, e os equivalentes nas outras duas colunas, é uma
      implicação técnica natural dessa forma, mas sua estratégia definitiva de
      indexação permanece subordinada a B3, não resolvida aqui. A validação da existência
      do registro referenciado passa a ser responsabilidade da camada de aplicação que
      grava os registros de auditoria, e não do banco.
    - **Onde está discutida**: `arquitetura-tecnica.md`, Seção 10; `arquitetura-fisica-banco.md`,
      Seção 9; `docs/modelagem-fisica/09-ia-auditoria.md`.

21. **D7 — Vínculo direto `LANÇAMENTO_FINANCEIRO` ↔ `EMPRESA`**: esta implementação parte
    da definição de negócio de que todo `LANÇAMENTO_FINANCEIRO` pertence obrigatoriamente a
    uma `EMPRESA` desde sua criação, premissa definida durante a resolução de D7.
    `LANÇAMENTO_FINANCEIRO` ganha `empresa_id` (FK, `NOT NULL`), obrigatório desde a criação
    em todos os caminhos (Manual, Cartão via Parcela, Contrato Financeiro via Parcela, Ação
    de IA Confirmada). O preenchimento (derivado automaticamente quando possível — via
    `veículo`, `contrato financeiro`, ou a cadeia Cartão→Conta Bancária→Empresa — ou
    informado manualmente quando não derivável) e a validação de consistência com
    `VEÍCULO.empresa_id` (quando `veiculo_id` estiver presente) ocorrem na camada de
    aplicação, não via trigger de banco. `AÇÃO_PROPOSTA_IA` ganha `empresa_id` (FK,
    nullable) e um novo valor de `status` ("Aguardando Empresa"), permitindo persistir uma
    proposta antes de a Empresa ser conhecida; a confirmação fica bloqueada enquanto
    `empresa_id` for nulo.
    - **Alternativas analisadas**: para o mecanismo em `LANÇAMENTO_FINANCEIRO` — trigger de
      banco, descartado por tensionar com A1 (Clean Architecture) e com o precedente já
      estabelecido em B4 (decisão #20), que evitou trigger pelo mesmo motivo; constraint
      declarativa pura, sem lógica de derivação/validação em nenhuma camada, descartada
      por não conseguir, sozinha, garantir a consistência com `VEÍCULO.empresa_id` — um
      `CHECK` não pode referenciar outra tabela em PostgreSQL. Para `AÇÃO_PROPOSTA_IA` —
      manter a proposta incompleta só na camada de aplicação até completar, descartada por
      exigir infraestrutura de retenção de estado não prevista em nenhuma decisão
      congelada, por reduzir a rastreabilidade do momento em que a IA de fato propôs a
      ação, e por contrariar a própria descrição já existente da entidade como "estado
      intermediário real no banco" (`domain-model/23-acao-proposta-ia.md`, Seção 1);
      Empresa embutida em `dados_propostos` sem coluna dedicada, descartada por sobrepor
      duas exigências de completude distintas — a de `dados_propostos`, já existente, e a
      nova, de Empresa — no mesmo campo.
    - **Motivo da escolha**: a validação na aplicação mantém a mesma abordagem já adotada
      em B4 para o mesmo tipo de decisão (onde colocar lógica de derivação/validação),
      preservando o isolamento de A1; persistir a proposta incompleta mantém o padrão já
      documentado para esta mesma família de entidades (`SUGESTÃO_IA`/`AÇÃO_PROPOSTA_IA`
      sempre criadas como registros reais, nunca como rascunho fora do banco), preserva
      rastreabilidade e auditoria do momento exato em que a IA propôs a ação, e não exige
      nenhuma infraestrutura nova além do schema já existente.
    - **Desvantagens conhecidas e aceitas**: a validação de consistência com Veículo só
      protege quem passa pelo caso de uso de criação — qualquer novo ponto de escrita
      futuro em `lancamentos_financeiros` precisaria replicar essa validação
      deliberadamente, mesmo risco já aceito em decisões anteriores que optaram por
      aplicação em vez de trigger; o novo valor de `status` em `AÇÃO_PROPOSTA_IA` estende
      um conjunto hoje só inferido, não confirmado literalmente no conceitual
      (`domain-model/23-acao-proposta-ia.md`, Seção 2).
    - **Consequência direta**: as tabelas já implementadas `lancamentos_financeiros` e
      `acoes_propostas_ia` precisam de alteração de schema (`ALTER TABLE`) para as novas
      colunas. A dependência entre D7 e A8 (Achado 5 da auditoria sistêmica) deixa de ser
      um impasse estrutural — a checagem de escopo por Empresa pode ocorrer no momento da
      confirmação, quando `empresa_id` já estará preenchido, não mais exigindo resposta
      antes da criação da proposta. A ausência de caminho `OBRA`→`EMPRESA`, identificada
      no levantamento desta pendência, deixa de ser um problema, já que Empresa passa a
      ser sempre informada diretamente.
    - **Onde está discutida**: `pendencias.md`, item D7; `domain-model/09-lancamento-financeiro.md`,
      Seção 7; `domain-model/23-acao-proposta-ia.md`; `docs/domain-model/historico/auditoria-sistemica-final.md`,
      Achado 5.

22. **A8 — Mecanismo da barreira reforçada para ações de IA de nível Alto**: definida como
    **reautenticação (senha)** — no momento da confirmação de uma `AÇÃO_PROPOSTA_IA` de
    nível Alto, o usuário deve reinformar sua senha antes que a ação seja executada; a
    verificação é feita contra o hash já definido em T3 (Argon2, preferencial), como um
    controle adicional e independente da sessão em uso — não envolve reemitir nem
    revalidar o token JWT de sessão, que continua resolvendo apenas identidade/autorização
    geral (A4), não esta barreira específica. **Escopo**: aplica-se exclusivamente à
    criação/confirmação de `LIQUIDAÇÃO_FINANCEIRA` e ações equivalentes propostas pela IA —
    `AJUSTE_FINANCEIRO` já está fora do que a IA pode propor, em qualquer nível de
    sensibilidade (Decisão 8), então não há sobreposição a considerar aqui.
    - **Alternativas analisadas**: **Segundo aprovador foi retirada da comparação
      técnica**, não avaliada como candidata concorrente nesta decisão — a decisão #17
      (A3) já congelou, como premissa arquitetural, que o cenário típico deste projeto é
      uma empresa do grupo com apenas um usuário financeiro disponível; exigir segundo
      aprovador para a barreira "Alto" reproduziria exatamente o cenário operacional que
      A3 rejeitou (travamento da confirmação por falta de um segundo usuário disponível).
      Permaneceram em comparação **Reautenticação (senha)** e **Confirmação simples
      reforçada** (tela de revisão explícita dos dados antes de gravar, sem segundo
      fator).
    - **Correções feitas à comparação antes da escolha**: duas assimetrias foram
      encontradas em auditoria e corrigidas. (1) Confirmação simples reforçada trazia, na
      comparação original, uma vantagem tratada como exclusiva ("já cobre a exigência
      mínima do conceitual — regras 27/28") que na verdade não a diferencia de
      Reautenticação — a exigência de confirmação explícita antes de gravar é satisfeita
      igualmente pelas duas alternativas, não é uma vantagem específica de uma sobre a
      outra. (2) Reautenticação estava penalizada por fricção ("fricção a cada ação
      sensível") atribuída à combinação "senha/2FA" tratada como opção única — mas 2FA
      nunca foi avaliado nem escolhido separadamente nesta decisão; a fricção real da
      alternativa efetivamente decidida (reinformar só a senha) é menor do que a fricção
      implícita de também exigir um segundo fator, e a comparação foi corrigida para
      refletir isso.
    - **Motivo da escolha**: segurança efetivamente obtida — reautenticação exige prova
      ativa de posse da senha no momento exato da ação sensível, o que Confirmação simples
      reforçada não oferece: essa alternativa garante revisão dos dados antes de gravar,
      mas nenhuma verificação adicional de identidade, não protegendo contra uma sessão já
      autenticada porém comprometida (ex. dispositivo destravado, token de sessão exposto)
      executando a ação sem nenhuma barreira real além da revisão visual dos dados. A
      leitura conjunta das regras 27 (nunca executa sem confirmação explícita) e 28
      (barreira reforçada para nível Alto) permanece só como reforço interpretativo do
      requisito já existente no conceitual — não foi usada como fundamento principal desta
      escolha.
    - **Desvantagens conhecidas e aceitas**: fricção operacional a cada ação de nível Alto
      (o usuário precisa reinformar a senha no momento da confirmação) — aceita
      deliberadamente em troca da segurança efetivamente obtida; nenhum segundo fator
      (2FA) é exigido por esta decisão — se o projeto decidir adotar 2FA no futuro, isso é
      uma extensão possível do mesmo mecanismo (reautenticação), não uma alternativa a ele
      nem uma reabertura desta decisão.
    - **Consequência direta**: não altera nem depende do mecanismo de A4 — a
      reautenticação é um terceiro controle, específico da confirmação de Ação de IA de
      nível Alto, adicional às checagens já feitas pelo Method Security (ponto i) e pelos
      Hibernate Filters (ponto ii) de A4, sem sobreposição nem substituição de nenhum dos
      dois. Interage com D7: como D7 já garante `empresa_id` preenchido em
      `LANÇAMENTO_FINANCEIRO`/`AÇÃO_PROPOSTA_IA` no momento da confirmação, a barreira de
      reautenticação e a checagem de escopo por Empresa (Hibernate Filter de A4) passam a
      ocorrer no mesmo momento — a confirmação —, sem dependência de ordem entre elas. I8
      (campo para "segundo aprovador") deixa de ser necessária, porque a alternativa que a
      exigiria foi excluída da comparação, não escolhida.
    - **Onde está discutida**: `arquitetura-tecnica.md`, Seção 8; `pendencias.md`, Seção 7
      (item A8 removido da lista de pendências abertas, indexado entre as resolvidas);
      `decisions.md`, decisão #17 (A3, premissa do usuário financeiro único).

23. **D1 — Existência de `EMPRESA.tipo`**: pendência reformulada e resolvida nesta mesma
    decisão. A pergunta original ("quais valores `tipo` deve ter?") foi substituída por "o
    atributo ainda pertence ao modelo de domínio?", com base em auditoria documental
    completa conduzida nesta sessão. **Resposta: não — o campo é removido do modelo de
    domínio.**
    - **Alternativa descartada**: manter o campo e definir valores para `tipo` (a
      formulação original de D1) — descartada porque nenhuma das 31 regras de negócio
      vigentes, nenhuma das 22 decisões congeladas (#1-#22), nenhuma das 24 entidades de
      domínio, e nenhum mecanismo de permissão/IA/auditoria/financeiro consulta ou depende
      de `EMPRESA.tipo`, em nenhum momento da evolução do projeto. Manter o campo sem
      função confirmada violaria diretamente o princípio 2 de modelagem — *"o modelo só
      representa conceitos que possuem significado de negócio claramente definido"*
      (`principios-de-modelagem.md`).
    - **Motivo da escolha**: a auditoria (regras de negócio vigentes, decisões #1-#22,
      entidades de domínio, modelagem lógica/física, schema implementado) não encontrou
      nenhum uso funcional do campo em nenhum ponto da evolução do projeto. Sua existência
      decorre exclusivamente de constar do catálogo conceitual original
      (`arquitetura-conceitual.md`, Seção 3) — nunca de uma necessidade de negócio
      confirmada. `pendencias.md` chegava a afirmar textualmente que a pendência "não
      afeta a existência do campo, só seus valores válidos" — afirmação sem fundamento
      documental próprio, que a auditoria desta sessão não confirmou.
    - **Desvantagens conhecidas e aceitas**: nenhuma regra de negócio real é perdida
      (nenhuma dependia do campo). Se no futuro a natureza jurídica das 6 unidades do
      grupo (H Vieira, Helierti, CV, CD, Camila, Celso) precisar acionar comportamento
      diferenciado (ex. relatórios fiscais separados), um campo equivalente precisará ser
      reintroduzido como nova decisão de modelagem, com definição de negócio concreta
      desde a criação — não como herança não fundamentada do catálogo original.
    - **Consequência direta**: campo removido de `domain-model/01-empresa.md`,
      `modelo-logico.md`, `modelagem-fisica/01-cadastros-basicos.md` e do schema físico
      (`database/02_tables/01_cadastros_basicos.sql`). `pendencias.md`, item D1, removido
      da lista de pendências abertas. `arquitetura-conceitual.md` (Seção 3) permanece
      **inalterado** — nunca é editado — e continua listando `tipo` como campo original;
      esta decisão passa a ser a fonte corrente sobre os campos de `EMPRESA`, com
      precedência sobre o catálogo conceitual nesse ponto específico, conforme o
      preâmbulo deste documento.
    - **Onde está discutida**: auditoria documental completa desta sessão (conclusões
      incorporadas diretamente nesta decisão, sem arquivo de auditoria próprio);
      `domain-model/01-empresa.md`, Seção 7 (atualizada); `principios-de-modelagem.md`,
      princípio 2.

24. **D2 — Identificação individual do sócio em "Retirada do Patrão"**: resolvida como
    **não necessária**. Resposta de negócio confirmada: existe apenas um patrão realizando
    retiradas — a classificação `Retirada do Patrão` continua exatamente como já
    implementada hoje (`MOVIMENTAÇÃO_BANCÁRIA`/`COMPRA_CARTÃO`.`classificação`), sem
    diferenciação por sócio.
    - **Alternativas analisadas**: manter D2 aberta indefinidamente como funcionalidade
      futura sem definição concreta, aguardando um cenário de múltiplos sócios que nunca
      se materializou — descartada por contrariar o princípio 2 de modelagem (não
      estruturar antecipadamente um conceito sem definição de negócio real); encerrar a
      pendência com base no fato de negócio confirmado — escolhida.
    - **Motivo da escolha**: a resposta de negócio elimina a premissa que sustentava a
      pendência (existência de múltiplos sócios a diferenciar). Diferente de D1, aqui
      nenhuma estrutura chegou a ser criada — a pendência nunca gerou campo, entidade ou
      mecanismo — então a decisão é simplesmente **não criar** nada, mesmo precedente já
      usado para `CATEGORIA`/"sub-conta interna" (decisão #5).
    - **Desvantagens conhecidas e aceitas**: se no futuro houver mais de um sócio
      realizando retiradas, será necessária uma nova decisão de modelagem (campo ou
      entidade), sem nenhuma estrutura pré-construída aguardando esse cenário — mesmo
      risco já aceito em D1 para o caso equivalente.
    - **Consequência direta**: nenhuma alteração estrutural — nenhum campo, entidade ou
      alteração de schema. A regra 6 do conceitual ("retiradas do patrão continuam
      registradas e visíveis, sem virar despesa operacional") já está satisfeita pela
      classificação existente, sem exigir diferenciação por sócio.
    - **Onde está discutida**: `arquitetura-conceitual.md`, regra 6 (Seção 5) e pendência 3
      (Seção 16) — documento nunca alterado; `domain-model/12-movimentacao-bancaria.md`;
      `docs/domain-model/historico/auditoria-sistemica-final.md`, Achado 8.

25. **D3 — Rateio pode ficar parcialmente pendente**: resolvido que **sim** — um
    `LANÇAMENTO_FINANCEIRO` pode existir com `RATEIO_DESPESA` incompleto (soma de
    `valor_rateado` menor que `valor` do Lançamento) por tempo indeterminado, sem prazo
    para fechamento. Confirmado por resposta de negócio: a operação real registra despesas
    antes de a divisão entre Obras estar definida, sem limite de tempo para completar.
    - **Alternativa descartada**: exigir que o rateio feche no ato do registro (a segunda
      opção da própria formulação original da pendência) — descartada por contrariar
      diretamente a prática operacional confirmada.
    - **Motivo da escolha**: resposta de negócio direta e sem ambiguidade — única
      alternativa compatível com a operação real.
    - **Desvantagens conhecidas e aceitas**: um Lançamento pode permanecer com distribuição
      por Obra incompleta por tempo indeterminado; "Lucro por Obra" e "custo rateado"
      (sempre calculados em consulta, nunca persistidos — princípio 6) refletem, nesse
      período, uma distribuição parcial — efeito esperado da regra confirmada, não
      inconsistência.
    - **Consequência direta**: a regra de soma exata (Decisão 10 — tolerância só de
      arredondamento) passa a ser entendida como aplicável ao **fechamento** do rateio, não
      a cada escrita individual — estado intermediário com soma menor é válido e tolerado
      indefinidamente. Nenhuma coluna, constraint ou entidade nova é necessária: a
      "completude" do rateio é sempre calculada por comparação entre a soma de
      `valor_rateado` e `LANÇAMENTO_FINANCEIRO.valor`, nunca persistida (princípio 6) —
      mesmo padrão já usado para `status_financeiro`. D8 (edição retroativa de Rateio após
      Aplicação de Liquidação já existente) permanece pendência distinta, não resolvida por
      esta decisão.
    - **Onde está discutida**: `domain-model/16-rateio-despesa.md`, Seção 4 e Seção 7;
      `modelagem-fisica/08-obras-veiculos-rateio.md`; `modelo-logico.md`, 3.16.

26. **D4 — Alocação operacional de Veículo a Obra sem despesa**: confirmada necessidade de
    negócio real (logística diária, base para sugestão automática de Obra ao lançar
    despesa de frota, e futura gestão de equipes). `VEÍCULO` ganha `obra_atual` (FK para
    `OBRA`, nullable) — fato operacional corrente de onde o veículo está trabalhando,
    inteiramente independente da dimensão financeira já existente
    (`LANÇAMENTO_FINANCEIRO.veiculo_id`/`obra_id`, regra 18). Nulo = veículo sem alocação
    corrente.
    - **Alternativas analisadas**:
      (a) Entidade dedicada de alocação (com `data_início`/`data_fim`, histórico
      consultável diretamente, múltiplas alocações simultâneas) — descartada por ora: a
      necessidade confirmada descreve um estado corrente único ("um veículo está
      trabalhando em determinada obra", singular, presente), sem requisito de alocações
      concorrentes, agendamento futuro, ou histórico como funcionalidade própria distinta
      de auditoria. Estruturar isso agora anteciparia conceito sem definição de negócio
      confirmada (princípio 2) — se "gestão de equipes" exigir um padrão de alocação
      temporal compartilhado entre Veículo e Funcionário, é nova decisão quando concreto,
      não extensão silenciosa desta.
      (b) FK inversa em `OBRA` (`veiculo_atual_id`) — descartada por cardinalidade
      incorreta: uma Obra recebe tipicamente vários veículos simultaneamente ao longo da
      execução, então o relacionamento corrente é Obra 1:N Veículo, não 1:1 — a FK precisa
      estar do lado N (Veículo).
      (c) Campo simples em `VEÍCULO` (`obra_atual`, FK nullable) — **escolhida**: cobre o
      fato operacional confirmado, com histórico de mudanças já coberto pelo mecanismo
      genérico de `LOG_AUDITORIA` (toda alteração de campo em Veículo já é auditada).
    - **Motivo da escolha**: resolve a necessidade confirmada com a menor estrutura nova
      possível (princípio 3), sem duplicar capacidade de histórico já coberta por
      `LOG_AUDITORIA` (princípio 4), e sem antecipar requisitos não confirmados —
      alocações múltiplas ou agendamento futuro (princípio 2).
    - **Desvantagens conhecidas e aceitas**: consultar o histórico completo de alocações de
      um Veículo exige ler `LOG_AUDITORIA` filtrado por entidade/campo, não uma tabela
      dedicada — aceito por não haver requisito confirmado de relatório de histórico como
      funcionalidade própria; se necessário no futuro, é candidato a nova decisão, não
      reabertura desta. Sem suporte a um veículo alocado a mais de uma Obra simultaneamente
      nem a alocação futura agendada — nenhum dos dois foi descrito como necessidade hoje.
    - **Consequência direta**: `VEÍCULO` ganha `obra_atual` (FK opcional, `ON DELETE
      RESTRICT`, mesmo padrão das demais FKs opcionais do projeto). `OBRA` passa a ser
      referenciada também por `VEÍCULO`, além de `LANÇAMENTO_FINANCEIRO` e
      `RATEIO_DESPESA`. Base estrutural criada para as funcionalidades futuras citadas
      (sugestão automática de Obra, gestão de equipes) — nenhuma implementada por esta
      decisão. Nenhuma alteração em `LANÇAMENTO_FINANCEIRO`, `COMPRA_CARTÃO` ou
      `CONTRATO_FINANCEIRO` — a dimensão financeira de Veículo/Obra (regra 18) permanece
      inalterada.
    - **Onde está discutida**: `domain-model/07-veiculo.md`, Seções 1-3 e 7;
      `domain-model/03-obra.md`, Seção 3; `modelo-logico.md`, 3.07;
      `modelagem-fisica/08-obras-veiculos-rateio.md`; schema físico
      (`database/02_tables/08_obras_veiculos_rateio.sql`, `database/03_constraints.sql`,
      `database/04_indexes.sql`).

27. **D5 — Sincronização entre `COMPRA_CARTÃO` e `LANÇAMENTO_FINANCEIRO` gerado**: resolvida
    com propagação automática condicional. Quando `COMPRA_CARTÃO.categoria`/`obra`/`veículo`
    é corrigido: (i) Parcelas ainda não vencidas — nada a propagar, o Lançamento, ao nascer
    no vencimento, já lê o valor vigente de `COMPRA_CARTÃO` naquele momento (mecanismo já
    existente — `PARCELA` não duplica esses campos, ver `21-parcela.md`); (ii) Parcelas já
    vencidas (Lançamento já existe) **sem** `RATEIO_DESPESA` vinculado — o Lançamento é
    atualizado automaticamente; (iii) Parcelas já vencidas **com** `RATEIO_DESPESA`
    vinculado — o Lançamento fica definitivamente desacoplado da Compra, sem propagação
    automática futura; qualquer correção passa a ser manual.
    - **Alternativas analisadas**: nunca propagar para Lançamentos já gerados (sempre
      correção manual) — descartada, contraria diretamente a resposta de negócio; sempre
      propagar, mesmo com Rateio vinculado — descartada, sobrescreveria trabalho manual de
      rateio já realizado, criando risco real de inconsistência entre a granularidade do
      rateio e a nova classificação; propagação condicionada à ausência de Rateio —
      **escolhida**, confirmada como a regra de negócio desejada.
    - **Motivo da escolha**: resposta de negócio direta, sem ambiguidade. Compatível com o
      que já estava congelado: `categoria`/`obra`/`veículo` já são campos livremente
      corrigíveis em `LANÇAMENTO_FINANCEIRO` (Seção 2 de `09-lancamento-financeiro.md`),
      independentemente da existência de Aplicação de Liquidação — a regra de
      `AJUSTE_FINANCEIRO` (regra 23) protege exclusivamente `valor`, nunca essas três
      dimensões. A propagação automática é só um novo gatilho para uma edição já
      permitida, não uma exceção ao princípio 5 (fatos históricos não reescritos), que
      protege eventos financeiros (valor, liquidação), não metadados de classificação.
    - **Desvantagens conhecidas e aceitas**: a existência de qualquer Rateio desliga
      completamente a propagação automática para aquele Lançamento, mesmo para campos que
      o Rateio não afeta diretamente (ex. `veículo`) — simplificação deliberada, sem
      granularidade por campo, aceita como está. Correções feitas após o desacoplamento
      exigem edição manual, sem aviso automático de divergência com a Compra de origem.
    - **Consequência direta**: `LANÇAMENTO_FINANCEIRO` (Seção 1, "Quem altera") passa a
      incluir explicitamente Cartão como origem de alteração automática pós-criação,
      condicionada à ausência de Rateio. Nenhuma alteração de schema físico — mecanismo de
      camada de aplicação, mesmo padrão já usado para regras de sincronização/validação
      multi-tabela do projeto (ex. soma de Rateio, D3).
    - **Onde está discutida**: `domain-model/18-compra-cartao.md`;
      `domain-model/09-lancamento-financeiro.md`, Seção 1 e Seção 2;
      `domain-model/21-parcela.md`, Seção 3; `domain-model/16-rateio-despesa.md`.

28. **D6 — Vínculo Consórcio contemplado → Veículo, propagação aos Lançamentos de
    Parcela**: resolvido que **só Lançamentos gerados após a contemplação** herdam
    automaticamente o `veículo` do `CONTRATO_FINANCEIRO` — Lançamentos já gerados antes da
    contemplação permanecem exatamente como estão, sem propagação retroativa. Confirmado
    por resposta de negócio: não há necessidade operacional de propagar retroativamente;
    manter o histórico como estava é suficiente para o uso real.
    - **Alternativas analisadas**: propagar retroativamente para todos os Lançamentos já
      gerados (mesmo espírito do braço (ii) de D5) — descartada, contraria diretamente a
      resposta de negócio; propagar só para Lançamentos futuros, sem tocar os já
      existentes — **escolhida**, confirmada como regra de negócio desejada. Diferente de
      D5, não há aqui um gatilho de desacoplamento equivalente ao Rateio — a resposta de
      negócio já é categórica: nenhuma propagação retroativa em nenhuma circunstância, não
      apenas condicionada à ausência de algum outro registro.
    - **Motivo da escolha**: resposta de negócio direta e categórica. Compatível com o
      restante do modelo: `veículo` em `LANÇAMENTO_FINANCEIRO` continua sendo, em geral,
      campo corrigível manualmente (Seção 2 daquele documento) — esta decisão não retira
      essa mutabilidade, apenas define que a **contemplação em si** não é, por escolha de
      negócio, um gatilho de atualização automática para Lançamentos passados.
    - **Desvantagens conhecidas e aceitas**: Lançamentos gerados antes da contemplação
      continuam sem `veículo` atribuído — custo de frota incompleto por padrão para essas
      parcelas específicas, exatamente o risco que a pendência original identificava como
      bloqueio. Aceito explicitamente pela resposta de negócio como suficiente para o uso
      real; qualquer preenchimento retroativo necessário exigirá correção manual,
      Lançamento a Lançamento.
    - **Consequência direta**: o caminho "Contrato Financeiro via Parcela" passa a ler
      `CONTRATO_FINANCEIRO.veículo` no momento da geração de cada Lançamento (mesmo
      mecanismo genérico já usado no caminho Cartão — `PARCELA` não duplica o campo, só
      serve de ponte) — mas, diferente de D5, **sem** nenhuma propagação automática para
      Lançamentos já existentes, em nenhuma condição. Nenhuma alteração de schema físico —
      regra de aplicação, no momento da geração do Lançamento.
    - **Onde está discutida**: `domain-model/20-contrato-financeiro.md`;
      `domain-model/21-parcela.md`, Seção 3; `domain-model/09-lancamento-financeiro.md`,
      Seção 1 e Seção 2.

29. **D8 — Edição de `RATEIO_DESPESA` após Aplicação de Liquidação já existente**: resolvido
    que o Rateio permanece **livremente editável**, mesmo depois que a Despesa já foi
    paga/recebida (Aplicação de Liquidação vinculada) — nenhum mecanismo equivalente a
    `AJUSTE_FINANCEIRO` é criado para o Rateio. Erros identificados posteriormente são
    corrigidos diretamente no próprio registro de `RATEIO_DESPESA`.
    - **Alternativa descartada**: proteger o Rateio após Aplicação, exigindo um mecanismo
      equivalente a `AJUSTE_FINANCEIRO` (ou bloqueio de edição) — descartada, contraria
      diretamente a resposta de negócio. Sem alternativa real remanescente a comparar.
    - **Motivo da escolha**: resposta de negócio direta e categórica — confirma que o
      comportamento já vigente (sem restrição) é o desejado; nenhuma mudança estrutural é
      necessária.
    - **Desvantagens conhecidas e aceitas**: o fato histórico de qual Obra efetivamente
      arcou com qual custo pode ser reescrito após a liquidação, sem o mesmo grau de
      proteção formal que `AJUSTE_FINANCEIRO` dá a correções de `valor` — mitigado apenas
      pela auditoria genérica já existente (`LOG_AUDITORIA` registra toda alteração de
      campo, com valor anterior/novo, usuário e data), que preserva rastreabilidade mesmo
      sem mecanismo de correção dedicado. Como "custo por Obra" é sempre calculado em
      consulta, nunca persistido (regra 20, princípio 6), não há relatório tecnicamente
      "quebrado" — mas comparações feitas antes e depois da edição podem divergir sem
      aviso automático, exigindo consulta ao `LOG_AUDITORIA` para reconstruir o histórico.
    - **Consequência direta**: nenhuma alteração de schema; nenhuma mudança de regra em
      `RATEIO_DESPESA` além de formalizar por escrito o comportamento já vigente —
      consistente com a regra do projeto de nunca decidir nada silenciosamente, mesmo
      quando a decisão é manter o status quo.
    - **Onde está discutida**: `domain-model/16-rateio-despesa.md`, Seção 4 e Seção 7.

30. **D9 — Valores válidos de `OBRA.status`**: definidos como **A executar / Em andamento /
    Pausada / Concluída**, com transições: `A executar` → `Em andamento` (início);
    `Em andamento` ⇄ `Pausada` (pausa/retomada); `Em andamento` → `Concluída`
    (finalização). Valor inicial: `A executar`. Confirmado por resposta de negócio, sem
    ambiguidade.
    - **Alternativas analisadas**: nenhuma — a pendência era puramente uma lacuna de
      enumeração (conceitual nunca chegou a listar candidatos), não uma escolha entre
      opções técnicas. A resposta de negócio fecha diretamente o conjunto de valores e as
      transições válidas.
    - **Motivo da escolha**: resposta de negócio direta.
    - **Desvantagens conhecidas e aceitas**: a resposta não cobre explicitamente toda
      transição imaginável (ex. `Pausada` → `Concluída` direto, sem retomar
      `Em andamento`) — não presumida aqui; só as transições explicitamente informadas são
      tratadas como regra confirmada. Se um caso real exigir uma transição não coberta,
      isso é esclarecimento futuro, não reabertura desta decisão.
    - **Consequência direta**: `OBRA.status` passa a ter lista fechada de valores — schema
      físico ganha `CHECK` (`ck_obras_status`) e `DEFAULT 'A executar'`, mesmo padrão já
      usado para os demais campos enumerados do projeto (ex.
      `lancamentos_financeiros.situacao_administrativa`). Nenhuma outra entidade depende
      deste campo hoje (confirmado durante a modelagem original de `OBRA`, Seção 6
      daquele documento) — sem consequência em cascata.
    - **Onde está discutida**: `domain-model/03-obra.md`, Seção 2, Seção 4 e Seção 7;
      `modelo-logico.md`, 3.03; `modelagem-fisica/08-obras-veiculos-rateio.md`; schema
      físico (`database/02_tables/08_obras_veiculos_rateio.sql`).

31. **D10 — Valores válidos de `VEÍCULO.tipo`**: definidos como **Caminhão / Escavadeira /
    Pá carregadeira / Trator / Rolo compactador / Veículo leve / Terceiro / Outro**.
    Confirmado por resposta de negócio, sem ambiguidade. `Terceiro` identifica
    máquinas/veículos locados, permitindo separar custo de frota própria de equipamento
    alugado em análises futuras; `Outro` é categoria residual, sem regra especial de uso.
    - **Alternativas analisadas**: nenhuma quanto aos valores — pendência de enumeração
      pura, sem candidatos concorrentes a comparar, mesma natureza de D9. Quanto ao
      **mecanismo físico**, três caminhos foram considerados: `CHECK IN (...)` sobre coluna
      `TEXT` (escolhido — mesmo padrão já usado em 100% dos campos enumerados do projeto,
      incluindo `OBRA.status`/D9); `ENUM` nativo do PostgreSQL (descartado — nunca usado em
      nenhum outro campo do projeto, quebraria consistência sem motivo técnico específico
      a este campo); tabela de domínio/lookup (descartada — estrutura desproporcional a uma
      lista pequena e estável, contra o princípio 3, "não criar estrutura nova quando a
      existente resolve").
    - **Motivo da escolha**: resposta de negócio direta para os valores; consistência
      total com o padrão físico já estabelecido para o mecanismo.
    - **Desvantagens conhecidas e aceitas**: alterar a lista de valores no futuro exige
      migration de constraint (`DROP`/`ADD CHECK`), mesma limitação já aceita para todos os
      demais campos enumerados do projeto — não é uma desvantagem específica desta decisão.
      Nenhum `DEFAULT` foi definido — não há valor inicial natural confirmado (diferente de
      D9, onde `A executar` era claramente o estado de nascimento); cadastro de Veículo
      exige informar `tipo` explicitamente, sem valor implícito.
    - **Consequência direta**: `VEÍCULO.tipo` passa a ter lista fechada de valores — schema
      físico ganha `CHECK` (`ck_veiculos_tipo`), sem `DEFAULT`. Nenhuma outra entidade
      depende deste campo hoje (confirmado durante a auditoria de D10) — sem consequência
      em cascata.
    - **Onde está discutida**: `domain-model/07-veiculo.md`, Seção 2 e Seção 7;
      `modelo-logico.md`, 3.07; `modelagem-fisica/08-obras-veiculos-rateio.md`; schema
      físico (`database/02_tables/08_obras_veiculos_rateio.sql`).

32. **D11 — Existência de `PARCELA.status`**: pendência reformulada e resolvida nesta mesma
    decisão. A pergunta original ("quais valores `status` deve ter?") foi substituída por
    "o atributo ainda pertence ao modelo?" — **resposta: não**. `status` é **removido**; o
    estado de uma Parcela passa a ser sempre derivável de `vencimento`,
    `lançamento_financeiro` (preenchido só quando a Parcela efetivamente gerou um
    Lançamento) e, quando necessário, da `classificação` da Compra/Contrato de origem.
    - **Alternativa descartada**: manter o campo e enumerar valores (a formulação original
      de D11, mesmo padrão de D9/D10) — descartada: o campo não existe em nenhuma das
      planilhas originais, nenhuma regra de negócio o utiliza (confirmado exaustivamente na
      auditoria — o gatilho real de geração do Lançamento é `vencimento`, nunca `status`),
      e a dimensão mais relevante que ele representaria — "gerou Lançamento ou não" — já é
      100% derivável de `lançamento_financeiro`, coluna já existente no schema físico.
      Manter os dois lado a lado criaria uma segunda fonte de verdade sujeita a
      dessincronia, contrariando o princípio 4 (fonte única da verdade).
    - **Motivo da escolha**: decisão de negócio explícita, alinhada ao princípio 2 (não
      representar conceitos sem significado de negócio definido) e ao princípio 6
      (indicadores derivados calculados, não persistidos) — mesmo padrão já aplicado a
      `LANÇAMENTO_FINANCEIRO.status_financeiro` (Decisão 1) e à completude do Rateio (D3,
      decisão #25).
    - **Desvantagens conhecidas e aceitas**: qualquer exibição do "estado" de uma Parcela
      (ex. tela de acompanhamento) precisa calcular isso em consulta, combinando
      `vencimento`, `lançamento_financeiro` e, para Parcelas de Compra Fora da Operação
      (que nunca geram Lançamento, por definição), a `classificação` da Compra de origem —
      mais lógica de leitura do que uma simples coluna, mas sem risco de inconsistência. O
      mecanismo exato de geração do Lançamento (síncrono vs. processamento em lote)
      continua indefinido — decisão técnica de implementação futura, não bloqueada nem
      redefinida por esta remoção.
    - **Consequência direta**: `PARCELA` perde o campo `status` no domínio, no modelo
      lógico e no schema físico (`parcelas.status`). Nenhum campo substitui `status`;
      nenhuma regra nova é criada — só eliminação do atributo redundante.
    - **Onde está discutida**: `domain-model/21-parcela.md`, Seção 2, Seção 4, Seção 5 e
      Seção 7; `modelo-logico.md`; `modelagem-fisica/06-cartao-credito.md`; schema físico
      (`database/02_tables/06_cartao_credito.sql`).

33. **D12 — Mutabilidade de `LIQUIDAÇÃO_FINANCEIRA`**: definida como **imutável desde a
    criação** — nenhum dos quatro campos (`tipo`, `data_efetiva`, `valor`,
    `conta_bancária`) pode ser alterado depois de registrado, em nenhuma circunstância.
    Esta decisão trata **exclusivamente** da mutabilidade — não define nem pressupõe
    nenhum mecanismo de correção para erros identificados posteriormente; se essa
    necessidade aparecer, será tratada como decisão independente, não uma extensão
    implícita desta.
    - **Alternativas analisadas**: livremente editável, mesmo padrão de D8 (Rateio) —
      descartada: diferente do Rateio (divisão interna, sem contraparte externa), a
      Liquidação representa um evento bancário real, e o princípio 5 de modelagem cita
      literalmente **"uma liquidação"** como exemplo do conceito de fato histórico não
      reescrito; editável até confirmação em Conciliação (`estado_conciliação` =
      Confirmado), depois congelada — descartada: usaria a Conciliação (verificação
      externa) como o que constitui o fato, invertendo a hierarquia do princípio 1
      ("registrar o fato uma vez"), e deixaria Liquidações com Vínculo permanentemente
      "Sem Correspondência" editáveis indefinidamente; **imutável desde a criação** —
      **escolhida**, consistente com o texto literal do princípio 5, com
      `APLICAÇÃO_DE_LIQUIDAÇÃO` (mesma família, nascida no mesmo instante, já confirmada
      imutável) e com `MOVIMENTAÇÃO_BANCÁRIA` (campos factuais sem previsão de edição
      desde a criação).
    - **Motivo da escolha**: o marco natural em que o registro se torna fato histórico é a
      própria criação, não um evento posterior — a entidade já é definida (Seção 1 de
      `10-liquidacao-financeira.md`) como "o momento em que a decisão/execução ocorreu"; o
      evento real já aconteceu no instante em que o registro passa a existir, e Liquidação
      e Aplicação nascem na mesma operação, sem janela de rascunho a proteger.
    - **Desvantagens conhecidas e aceitas**: nenhum mecanismo de correção existe hoje para
      um erro identificado após o registro — consequência explicitamente fora do escopo
      desta decisão, por instrução direta; se emergir necessidade real no futuro, será
      nova decisão independente, não inferida a partir desta.
    - **Consequência direta**: os quatro campos de `LIQUIDAÇÃO_FINANCEIRA` deixam de ser
      "imutáveis por inferência" e passam a ser "imutáveis por regra confirmada". Nenhuma
      alteração de schema físico — mecanismo exato de bloqueio (trigger ou revogação de
      privilégio) permanece não escolhido nesta etapa, mesma reserva já usada para
      `APLICAÇÃO_DE_LIQUIDAÇÃO`.
    - **Onde está discutida**: `domain-model/10-liquidacao-financeira.md`, Seções 1, 2, 4,
      5 e 7; `modelo-logico.md`, 3.10; `modelagem-fisica/03-liquidacao-financeira.md`;
      `principios-de-modelagem.md`, princípio 5.

34. **D13 — Mutabilidade e exclusão de `AJUSTE_FINANCEIRO`**: mutabilidade definida como
    **imutável desde a criação** — `tipo_ajuste`, `valor`, `data` e `observação` tornam-se
    explicitamente imutáveis, por regra confirmada (`lançamento_original` e
    `lançamento_ajuste` já eram imutáveis por inferência estrutural, não alterado por esta
    decisão). Exclusão: `AJUSTE_FINANCEIRO` está coberto pela regra geral já existente do
    projeto — entidades que representam fato financeiro não sofrem `DELETE` físico
    (`arquitetura-fisica-banco.md`, §7) — esta decisão apenas formaliza essa cobertura, sem
    criar regra nova.
    - **Alternativas analisadas**: livremente editável, mesmo padrão de D8 (Rateio) —
      descartada: diferente do Rateio, `AJUSTE_FINANCEIRO` é o próprio mecanismo formal de
      correção/rastreabilidade do sistema — torná-lo editável comprometeria a garantia que
      ele existe para oferecer; imutável desde a criação — **escolhida**, consistente com
      o texto literal do princípio 5 ("uma decisão já tomada" — exemplo que mapeia
      diretamente na própria definição da entidade), com D12/`LIQUIDAÇÃO_FINANCEIRA`
      (mesma família, decidida com o mesmo raciocínio), com `APLICAÇÃO_DE_LIQUIDAÇÃO` e
      `MOVIMENTAÇÃO_BANCÁRIA`.
    - **Motivo da escolha**: resposta de negócio direta, ancorada no precedente textual
      mais preciso já encontrado no projeto — princípio 5 nomeia "uma decisão já tomada"
      como fato histórico, e `AJUSTE_FINANCEIRO` é, por definição (Seção 1 do domínio),
      exatamente isso.
    - **Desvantagens conhecidas e aceitas**: nenhum mecanismo de correção existe para um
      Ajuste registrado incorretamente — consequência explicitamente fora do escopo desta
      decisão, por instrução direta. M8 (ambiguidade sobre Ajuste-de-Ajuste,
      `pendencias.md`, Melhorias Futuras) permanece intocada, sem relação com esta decisão.
      `usuário` não faz parte do escopo desta decisão — sua mutabilidade permanece
      exatamente como já estava documentada, sem resolução nova.
    - **Consequência direta**: os quatro campos passam de "não definido"/"inferência" para
      "imutáveis por regra confirmada". Exclusão física formalmente coberta pela regra
      geral já existente — nenhuma regra nova. Nenhuma alteração de schema físico —
      mecanismo exato de bloqueio (trigger/revogação de privilégio) permanece não
      escolhido, mesma reserva já usada para D12/`APLICAÇÃO_DE_LIQUIDAÇÃO`.
    - **Onde está discutida**: `domain-model/15-ajuste-financeiro.md`, Seções 1, 2, 4, 5 e
      7; `modelo-logico.md`, 3.15; `modelagem-fisica/05-ajuste-financeiro.md`;
      `arquitetura-fisica-banco.md`, §7; `principios-de-modelagem.md`, princípio 5.

35. **A6 — Desenho arquitetural do módulo de consulta compartilhado
    (`application/consultas-financeiras`)**: definido em **nível arquitetural** —
    responsabilidade, consumidores, forma de utilização e contrato — sem fixar métodos
    concretos nem fórmulas internas, que continuam a ser definidas quando cada
    funcionalidade for especificada e implementada.
    - **Responsabilidade**: expor consultas agregadas de leitura compartilhadas entre
      múltiplos consumidores, sempre calculadas em tempo de consulta, nunca persistidas
      (princípio 6); fonte única da verdade preservada — nenhum consumidor mantém cópia
      própria da mesma agregação (princípio 4).
    - **Consumidores fechados**: Balanço, Obra, Frota e ferramentas de consulta da IA —
      já congelados pela Divergência 2 da arbitragem técnica; nenhum outro consumidor,
      nenhum deles reimplementa a lógica separadamente.
    - **Categorias de consulta expostas** (nível arquitetural, não catálogo de métodos):
      (1) custo agregado por dimensão (ex. Obra, Veículo); (2) resultado financeiro
      derivado, composto a partir de custo agregado, receita e ajustes (ex. "Lucro por
      Obra"); (3) saldo/posição em aberto (ex. saldo devedor de Contrato Financeiro);
      (4) efeito líquido de correções sobre um fato original (ex. custo efetivo de um
      Lançamento após Ajustes).
    - **Forma de utilização**: cada categoria é acessada via método do Application
      Service/Facade já definido (decisão #19); escopo por Empresa herdado
      automaticamente via Hibernate/JPA Filters (A4), sem checagem manual adicional;
      parâmetros específicos de cada categoria (período, Obra/Veículo/Contrato-alvo)
      permanecem em aberto, definidos quando cada função for implementada.
    - **Contrato arquitetural**: nenhum consumidor acessa repositórios diretamente para
      essas agregações — sempre via este módulo; nenhuma agregação é persistida em
      nenhuma tabela; a fórmula interna de cada categoria (ex. sinal do Ajuste em "Lucro
      por Obra", exclusão ou não de Lançamentos Cancelados, terminologia de status
      subjacente) permanece **fora do escopo desta decisão** — cada uma será resolvida
      quando a funcionalidade específica for especificada e implementada, sem bloquear o
      desenho arquitetural aqui definido.
    - **Alternativas analisadas**: nenhuma nova — o mecanismo técnico (Application
      Service/Facade) já foi decidido e comparado contra alternativas na decisão #19;
      esta decisão trata só do desenho arquitetural em nível de categoria, não repete
      essa comparação.
    - **Motivo da escolha**: resolve exatamente o nível em que a pendência foi formulada —
      arquitetural — sem inventar fórmulas de negócio ainda não confirmadas (sinal do
      Ajuste, exclusão de Cancelado, terminologia de status), que permanecem documentadas
      em `plano-implementacao-sql.md` (Views adiadas), fora do escopo desta decisão, sem
      serem elevadas a pendência formal.
    - **Desvantagens conhecidas e aceitas**: o módulo nasce com categorias de consulta
      definidas, mas sem cada método/fórmula concreta especificado — implementação
      completa de cada categoria com bloqueio de fórmula permanece condicionada à
      resolução dessas ambiguidades, quando alcançadas na Fase 4/5/6, sem bloquear este
      desenho.
    - **Consequência direta**: B2 (`pendencias.md`) passa a ter seu pré-requisito
      satisfeito (A6 desenhada) — mas continua aberta, pois depende também de um caso real
      de necessidade de estratégia complementar, não resolvido por esta decisão. Nenhuma
      alteração de schema físico ou de mecanismo — decisão #19 permanece integralmente
      vigente.
    - **Onde está discutida**: `arquitetura-tecnica.md`, Seção 6; `decisions.md`, decisão
      #19; `pendencias.md`, itens A6 e B2; `plano-implementacao-sql.md` (referência às
      ambiguidades de fórmula, não resolvidas aqui).

36. **A7 — Nota de reconciliação textual: "auditoria desde o dia 1" vs. "usuário
    não-bloqueante"**: registrada formalmente a explicação já decorrente das decisões
    existentes — `LOG_AUDITORIA` sempre pôde existir desde a primeira versão do sistema
    graças ao "Usuário mínimo" (`nome`, `identificador de acesso`, `situação de acesso`),
    sem depender do modelo completo de permissões; o modelo completo **nunca foi
    pré-requisito** para a auditoria. Hoje a tensão tem só valor histórico, já que a
    antiga pendência 5 foi encerrada por A2 (decisão #16).
    - **Alternativas analisadas**: nenhuma — não é decisão de negócio ou técnica, é o
      registro formal de uma explicação já verdadeira, decorrente do desenho já existente
      ("Usuário mínimo") e da decisão A2 já congelada.
    - **Motivo da escolha**: a nota estava faltando desde a auditoria sistêmica (Achado 4);
      a mitigação prática e a resolução de A2 já existiam, só não estavam formalmente
      cruzadas nos documentos que tocam os dois lados da tensão.
    - **Desvantagens conhecidas e aceitas**: nenhuma — decisão puramente documental, sem
      regra nova nem mudança de significado.
    - **Consequência direta**: `domain-model/02-usuario.md` e
      `domain-model/24-log-auditoria.md` ganham nota cruzada explícita. Nenhuma alteração
      de schema, domínio ou regra de negócio.
    - **Onde está discutida**: `docs/domain-model/historico/auditoria-sistemica-final.md`,
      Achado 4; `arquitetura-conceitual.md`, Seções 16 e 18 (nunca editado); `decisions.md`,
      decisão #16 (A2).

37. **B3 — Estratégia de índice**: definida em **nível arquitetural**. `PK`, `FK` e
    `UNIQUE` permanecem parte do schema inicial (já implementado). Índices adicionais
    entram no schema inicial **apenas** quando uma consulta ou regra de negócio já
    documentada demonstrar objetivamente sua necessidade — esta decisão **não congela**
    nenhuma lista de colunas específicas. Durante a implementação de cada módulo, esse
    critério será aplicado às consultas já aprovadas. Qualquer outro índice só será criado
    após medição real de desempenho (`EXPLAIN`, monitoramento ou testes com volume
    representativo) — nunca por suposição.
    - **Alternativas analisadas**: indexar preventivamente todas as colunas candidatas já
      citadas em documentos anteriores — descartada, por comprometer-se com uma lista
      fechada sem necessidade objetiva demonstrada no momento, contrariando o princípio 3;
      estratégia inteiramente reativa, sem nenhum critério objetivo de antecipação —
      descartada, por ignorar consultas e regras de negócio já documentadas e aprovadas
      (ex. as categorias de consulta de A6, decisão #35) que já demonstram necessidade
      objetiva; **critério objetivo por consulta/regra já documentada, aplicado durante a
      implementação de cada módulo** — **escolhida**.
    - **Motivo da escolha**: usa exclusivamente estrutura e decisões já existentes (A6,
      `arquitetura-tecnica.md` §7) como fonte de necessidade objetiva, sem inventar
      requisito nem comprometer índice específico antes da implementação real de cada
      módulo.
    - **Desvantagens conhecidas e aceitas**: a decisão não resolve, por si só, qual índice
      cada tabela terá — isso continua para o momento de implementação de cada módulo,
      aplicando o critério aqui definido; risco aceito de alguma consulta real exigir
      índice não identificado antecipadamente, mitigado pela via reativa (medição real).
    - **Consequência direta**: nenhuma alteração no schema físico atual — `PK`/`FK`/`UNIQUE`
      já implementados permanecem como estão; nenhuma coluna adicional é indexada por esta
      decisão. `obra_id`, `veiculo_id`, `data_competência`, `vencimento` permanecem, nos
      documentos onde já apareciam, como **exemplos** de aplicação do critério — não uma
      lista obrigatória criada por esta decisão.
    - **Onde está discutida**: `arquitetura-fisica-banco.md`, §8; `arquitetura-tecnica.md`,
      Seção 7; `decisions.md`, decisão #35 (A6).

38. **T4 — Estratégia de hospedagem/infraestrutura**: definida em **nível arquitetural**,
    sem escolher provedor específico. A implantação inicial **prioriza uma plataforma PaaS
    gerenciada** (categoria — ex. Railway, Render ou equivalente), reduzindo ao máximo a
    carga operacional; a escolha do provedor específico permanece **decisão operacional**,
    podendo mudar sem impacto na arquitetura. VPS e provedores de maior porte (AWS, Azure
    ou equivalente) continuam **compatíveis** com a stack já congelada (Java 21 + Spring
    Boot + PostgreSQL), mas não são a estratégia inicial — migração para eles só deve
    ocorrer quando houver **necessidade real** de escala, disponibilidade, integrações ou
    requisitos operacionais que a justifiquem.
    - **Alternativas analisadas**: escolher desde já um provedor específico — descartada,
      seria decisão operacional/comercial antecipada sem necessidade comprovada,
      contrariando a filosofia do projeto de não antecipar complexidade nem otimizar antes
      de necessidade real; adotar diretamente infraestrutura de maior porte (AWS/Azure)
      desde o início — descartada, desproporcional ao porte atual (uso interno, seis
      empresas do grupo, poucos usuários simultâneos); manter a arquitetura agnóstica de
      plataforma, com PaaS gerenciada como estratégia inicial e caminho de migração
      explícito condicionado a necessidade real — **escolhida**.
    - **Motivo da escolha**: preserva portabilidade (nenhuma decisão já congelada — T1, B1
      — depende de provedor específico); reduz carga operacional inicial, consistente com
      o risco de manutenção solo já identificado como critério real em T1; migração futura
      permanece aberta sem custo de retrabalho arquitetural, já que a escolha de provedor é
      puramente operacional.
    - **Desvantagens conhecidas e aceitas**: a decisão não elimina a necessidade de uma
      escolha operacional futura de provedor específico — só adia essa escolha,
      deliberadamente, para o momento da implantação; nenhuma garantia de alta
      disponibilidade/SLA formal é assumida nesta fase.
    - **Consequência direta**: nenhuma alteração de schema, mecanismo ou dependência já
      congelada — decisão puramente de estratégia de implantação.
    - **Onde está discutida**: `arquitetura-tecnica.md`, §5.6 e Seção 15.

39. **Fórmula de divisão de valor e cálculo de vencimento das Parcelas de `COMPRA_CARTÃO`**:
    lacuna encontrada durante a Fase 4 (implementação do backend, não pré-catalogada em
    `pendencias.md`) — nenhum documento definia como `COMPRA_CARTÃO.valor` é dividido entre
    as N Parcelas quando a divisão não é exata, nem a fórmula que relaciona a `data` da
    Compra e `CARTÃO_CRÉDITO.dia_fechamento`/`dia_vencimento` ao `vencimento` de cada
    Parcela — ambos campos obrigatórios (`NOT NULL`) que o próprio sistema deveria calcular
    ao gerar as Parcelas. Resolvida por resposta de negócio direta:
    - **Divisão de valor**: as primeiras N-1 Parcelas recebem `valor_total ÷ N`, truncado
      (arredondado para baixo) na segunda casa decimal; a última Parcela recebe o valor
      residual (`valor_total` menos a soma das N-1 primeiras), absorvendo integralmente a
      diferença de arredondamento. Exemplo confirmado: R$100,00 em 3× = R$33,33 + R$33,33 +
      R$33,34.
    - **Cálculo de vencimento**: o "ciclo" de uma Compra é determinado pela comparação entre
      o dia da `data` da Compra e `dia_fechamento` do Cartão — dia ≤ `dia_fechamento` entra
      no ciclo do mês corrente da compra; dia > `dia_fechamento` entra no ciclo do mês
      seguinte. O vencimento da 1ª Parcela é o dia `dia_vencimento` dentro do mês desse
      ciclo (ajustado para o último dia do mês quando `dia_vencimento` não existir nesse
      mês, ex. dia 31 em fevereiro — necessidade técnica de calendário, não regra de
      negócio); cada Parcela seguinte vence um mês depois, sempre no dia `dia_vencimento`.
    - **Alternativas descartadas**: nenhuma — a pendência era uma lacuna pura de fórmula
      (nenhum candidato concorrente a comparar), mesma natureza de D9/D10.
    - **Motivo da escolha**: resposta de negócio direta, sem ambiguidade, descrevendo
      exatamente o funcionamento real do cartão de crédito já em uso.
    - **Desvantagens conhecidas e aceitas**: nenhuma identificada — a fórmula reflete o
      comportamento real já esperado pela operação.
    - **Consequência direta**: nenhuma alteração de schema físico — mecanismo de camada de
      aplicação, calculado no momento da criação de `COMPRA_CARTÃO`. Documentado em
      `domain-model/18-compra-cartao.md` e `domain-model/21-parcela.md`.
    - **Onde está discutida**: descoberta e resposta de negócio nesta sessão (Fase 4);
      `domain-model/18-compra-cartao.md`, Seção 2 e Seção 4; `domain-model/21-parcela.md`,
      Seção 2.

40. **Estrutura de parcelamento e referência de credor de `CONTRATO_FINANCEIRO`**: lacunas
    encontradas durante a Fase 4 (implementação do backend, não pré-catalogadas em
    `pendencias.md`) — `CONTRATO_FINANCEIRO` não tinha nenhum campo que permitisse ao
    sistema calcular suas Parcelas automaticamente (diferente de `COMPRA_CARTÃO`, que tem
    `valor`/`nº parcelas`), e `instituição` era texto livre, sem vínculo com `FORNECEDOR`,
    impedindo preencher `LANÇAMENTO_FINANCEIRO.fornecedor` (obrigatório quando `tipo` =
    Despesa) a partir de uma Parcela de Contrato. Resolvidas por resposta de negócio direta:
    - **Plano de parcelamento**: `CONTRATO_FINANCEIRO` ganha dois campos novos, informados no
      cadastro — `número de parcelas` e `data de vencimento da primeira parcela`. `valor
      contratado` (campo já existente) passa a ser também a base da divisão entre as
      Parcelas — reaproveitado, não duplicado. Divisão de valor: mesma fórmula da decisão
      #39 (últimas N-1 truncadas na 2ª casa decimal; última absorve o resíduo). Vencimentos:
      1ª Parcela na data informada; as seguintes, mensalmente, no mesmo dia do mês da 1ª
      (ajustado para o último dia do mês quando esse dia não existir no mês seguinte —
      mesma necessidade técnica de calendário já usada na decisão #39, não regra de
      negócio nova).
    - **Referência de credor**: `instituição` (texto livre) é **removida** e substituída por
      `fornecedor` (referência obrigatória para `FORNECEDOR`) — bancos e instituições
      financeiras passam a ser cadastrados como Fornecedor, como qualquer outro credor.
      Elimina duplicação de cadastro e permite que `LANÇAMENTO_FINANCEIRO.fornecedor`,
      gerado por uma Parcela de Contrato Financeiro, referencie diretamente o mesmo
      `fornecedor_id` do Contrato — sem mecanismo de resolução/lookup adicional.
    - **Alternativas descartadas**: nenhuma — ambas as lacunas eram puras (nenhum campo
      existente cobria a necessidade, nenhum candidato concorrente a comparar), mesma
      natureza de D9/D10/decisão #39.
    - **Motivo da escolha**: resposta de negócio direta, sem ambiguidade, e diretamente
      compatível com a estrutura já congelada (reaproveita `valor_contratado` em vez de
      criar um campo redundante; reaproveita `FORNECEDOR`, já existente, em vez de criar uma
      nova entidade "Instituição Financeira").
    - **Desvantagens conhecidas e aceitas**: nenhuma identificada.
    - **Consequência direta**: `contratos_financeiros.instituicao` removida do schema físico;
      `contratos_financeiros.fornecedor_id` (FK, `NOT NULL`), `numero_parcelas` (`NOT NULL`)
      e `data_vencimento_primeira_parcela` (`NOT NULL`) adicionadas — migration Flyway V14,
      tabela sem registros no momento da alteração (sem necessidade de migração de dados).
      `domain-model/20-contrato-financeiro.md`, `modelo-logico.md` e
      `modelagem-fisica/07-contrato-financeiro.md` atualizados.
    - **Onde está discutida**: descoberta e resposta de negócio nesta sessão (Fase 4);
      `domain-model/20-contrato-financeiro.md`, Seção 2 e Seção 4; `domain-model/05-fornecedor.md`.

41. **Escopo do encerramento da Fase 4 — implementação de autenticação, autorização,
    auditoria automática e reautenticação adiada para a Fase 5**: confirmado por resposta de
    negócio direta que a Fase 4 (Backend) é considerada **encerrada** com o seguinte escopo
    explícito: os 24 módulos de domínio estão implementados (Clean Architecture — `domain`,
    `application`, `interfaces/http`, `infrastructure`), incorporando as decisões #12 a #40.
    **Fica deliberadamente fora do escopo desta implementação, e adiada para a Fase 5
    (etapa de segurança)**: T3 (autenticação — JWT/Argon2, decisão #14), A2 (RBAC + escopo
    por Empresa, decisão #16), A4 (Method Security + Hibernate/JPA Filters, decisão #15), A5
    (aspecto automático de auditoria/`LOG_AUDITORIA`, decisão #18) e A8 (barreira de
    reautenticação para ações de IA de nível Alto, decisão #22). Essas cinco decisões
    **permanecem congeladas exatamente como registradas** — esta entrada não as reabre, não
    altera seu conteúdo, nem propõe mecanismo provisório algum para contorná-las. O que muda é
    só o **momento de implementação**: passa de "dentro da Fase 4" para "explicitamente
    dentro da Fase 5".
    - **Estado de código no momento desta decisão**: `SecurityConfig.java` mantém todos os
      endpoints abertos (`permitAll()`), documentado no próprio código como provisório; a
      entidade `Usuario` não tem campos de credencial, papel ou escopo de Empresa; não existe
      implementação de `LOG_AUDITORIA` (só `package-info.java`, sem aspecto funcional). Nenhum
      desses pontos é uma omissão não identificada — são exatamente os pontos cobertos por
      T3/A2/A4/A5/A8, cuja implementação esta decisão adia deliberadamente.
    - **Alternativas analisadas**: declarar a Fase 4 encerrada sem registrar nada sobre essa
      lacuna (deixar implícito) — descartada, contraria diretamente a regra do projeto de
      nunca decidir nada silenciosamente (`handoff.md`, Seção 3, item 3); reabrir a Fase 4 e
      bloquear o início da Fase 5 até auth/autorização/auditoria estarem implementadas —
      descartada por instrução direta do usuário; encerrar a Fase 4 com o escopo explicitado
      nesta decisão, registrando a implementação pendente como dependência formal herdada pela
      Fase 5 — **escolhida**, por instrução direta do usuário.
    - **Motivo da escolha**: resposta de negócio/processo direta — o encerramento da Fase 4 é
      intencional nesses termos; nenhuma solução provisória de autenticação/autorização deve
      ser construída só para "fechar" a fase artificialmente.
    - **Desvantagens conhecidas e aceitas**: entre o encerramento formal da Fase 4 e a
      implementação real de T3/A2/A4/A5/A8 na Fase 5, o backend permanece com todos os
      endpoints publicamente acessíveis, sem autenticação nem escopo por Empresa — aceito
      explicitamente pelo usuário como o estado esperado para este intervalo, não uma falha.
    - **Consequência direta**: a Fase 5 (Frontend) herda, como dependência explícita e não
      opcional, a implementação de T3/A2/A4/A5/A8 no backend — o desenho de login, rotas
      protegidas, UI condicionada a papel/Empresa e a barreira de reautenticação da IA no
      Frontend não podem ser finalizados sem essa implementação existir. `pendencias.md` ganha
      nova Seção 7 (Segurança — implementação adiada da Fase 4), com um item por decisão
      (S1-S5), todos apontando para esta entrada. `roadmap.md`, `handoff.md` e `changelog.md`
      atualizados para refletir o encerramento da Fase 4 nestes termos.
    - **Onde está discutida**: `pendencias.md`, Seção 7; `freeze-fase-4.md`; `roadmap.md`,
      Fase 4; `handoff.md`, Seção 1 e Seção 14; `infrastructure/auth/SecurityConfig.java`
      (comentário já existente no código, citado como evidência desta decisão).

42. **T2 — Framework de frontend**: definido como **React + Vite + TypeScript** —
    aplicação frontend desacoplada, consumindo exclusivamente a API REST já implementada no
    backend (Fase 4), sem servidor Node próprio no caminho de execução.
    - **Alternativas analisadas**: **Next.js (React)** — descartado porque é um framework
      full-stack (SSR/SSG, rotas de API próprias, servidor Node em produção); nenhuma dessas
      capacidades tem uso confirmado neste projeto — o sistema é um ERP interno, sem
      necessidade de SEO nem de renderização no servidor, e já tem um backend próprio (Java/
      Spring Boot) como única fonte de API; adotar Next.js introduziria uma segunda
      superfície de "backend" (rotas de API do Next.js) que tensiona diretamente com a
      fronteira já estabelecida na Fase 4 (só o backend Spring Boot expõe a API); **Vue 3** —
      tecnicamente viável (curva de aprendizado suave, forte em telas de formulário/tabela,
      perfil real deste sistema), mas descartado em favor de React pela escolha direta do
      usuário; **Angular** — descartado por ser desproporcionalmente opinativo/verboso para
      manutenção majoritariamente solo, mesmo critério de risco operacional já usado em T1
      (decisão #12) para preferir a stack mais familiar ao mantenedor.
    - **Motivo da escolha**: resposta direta do usuário, ancorada num critério técnico
      objetivo — o sistema consome uma API REST já existente (Spring Boot, Fase 4), sem
      necessidade de SSR/SEO; Vite, como bundler/dev server dedicado a SPA, é mais simples e
      leve que um framework full-stack para esse perfil de consumo, e mantém a arquitetura do
      frontend estritamente desacoplada do backend — nenhuma rota de API roda dentro do
      processo do frontend, preservando a mesma fronteira de responsabilidade já estabelecida
      entre `backend/` e `frontend/` na estrutura de pastas do projeto (`README.md`).
    - **Desvantagens conhecidas e aceitas**: nenhuma capacidade de SSR/SSG fica disponível
      caso uma necessidade futura de SEO ou renderização no servidor apareça — aceito
      explicitamente, por não haver requisito confirmado (princípio 2, `principios-de-
      modelagem.md`); se essa necessidade se materializar, é nova decisão de arquitetura, não
      reabertura desta.
    - **Consequência direta**: `frontend/` passa a ser um projeto Vite (React + TypeScript),
      publicado como aplicação estática, consumindo a API REST do backend via HTTP —
      arquitetura técnica completa do frontend (estrutura de pastas, roteamento, gerenciamento
      de estado, comunicação com API, autenticação no cliente) a definir nas próximas decisões
      da Fase 5, todas subordinadas a esta escolha. `pendencias.md`, item T2, movido para
      resolvida.
    - **Onde está discutida**: `arquitetura-tecnica.md`, Seção 5.2 e Seção 15;
      `pendencias.md`, Seção 5 (Tecnologia) e Seção 8 (resolvidas).

43. **T14 — Hospedagem do Frontend**: definida como a **mesma plataforma PaaS gerenciada já
    escolhida em nível arquitetural para o backend** (T4, decisão #38) — sem infraestrutura
    separada para o Frontend neste momento.
    - **Alternativas analisadas**: plataforma dedicada a estáticos (ex. Vercel, Netlify,
      Cloudflare Pages) — tecnicamente viável para uma SPA Vite, mas descartada por
      introduzir uma segunda plataforma de implantação a operar/gerenciar, sem necessidade
      real demonstrada; mesma plataforma PaaS do backend (T4) — **escolhida**, por decisão
      direta do usuário.
    - **Motivo da escolha**: resposta direta do usuário — não separar a infraestrutura neste
      momento. Consistente com o motivo já registrado em T4 (decisão #38): reduzir a carga
      operacional inicial, relevante para um projeto mantido predominantemente por um único
      desenvolvedor.
    - **Desvantagens conhecidas e aceitas**: nenhuma otimização específica de CDN/edge para
      ativos estáticos, que uma plataforma dedicada ofereceria nativamente — aceito
      explicitamente, sem necessidade real demonstrada para o porte deste sistema (uso
      interno, seis empresas do grupo, poucos usuários simultâneos); se o cenário mudar, é
      nova decisão, não reabertura desta.
    - **Consequência direta**: nenhuma infraestrutura nova a provisionar além da já prevista
      em T4; a escolha do provedor específico dentro da categoria PaaS continua sendo
      decisão operacional (T4), não afetada por esta decisão. `pendencias.md`, item T14,
      movido para resolvida.
    - **Onde está discutida**: `pendencias.md`, Seção 5 (Tecnologia) e Seção 8 (resolvidas);
      `decisions.md`, decisão #38 (T4).

44. **T7 — Roteamento e navegação do Frontend**: definido como **React Router**.
    - **Alternativas analisadas**: **TanStack Router** — tecnicamente viável (tipagem de rota
      mais estrita, integração nativa com TanStack Query), mas descartado por não haver
      necessidade demonstrada de tipagem de rota além do que React Router já oferece, e por
      introduzir uma peça de ecossistema menor/menos estabelecida sem ganho confirmado para
      este projeto; **rotear sem biblioteca** — descartado por reimplementar, sem necessidade,
      capacidades que toda SPA deste porte precisa (rotas aninhadas, guards de rota para
      autenticação/papel); **React Router** — **escolhida**, por decisão direta do usuário.
    - **Motivo da escolha**: resposta direta do usuário, priorizando estabilidade, tamanho de
      comunidade, documentação e facilidade de manutenção — critério consistente com o mesmo
      raciocínio de risco operacional já usado em T1 (decisão #12) e T2 (decisão #42) para um
      projeto mantido predominantemente por um único desenvolvedor. É o padrão de fato do
      ecossistema React para SPA, cobrindo as necessidades já identificadas: rotas aninhadas,
      lazy loading de rotas por módulo, e rotas protegidas por autenticação/papel (quando T11 e
      S1-S5 — `pendencias.md`, Seção 7 — estiverem implementadas).
    - **Desvantagens conhecidas e aceitas**: nenhuma tipagem de rota estrita nativa (diferente
      de TanStack Router) — aceito, sem necessidade demonstrada; se necessário no futuro, é
      nova decisão, não reabertura desta.
    - **Consequência direta**: `frontend/` usa React Router para toda navegação — rotas
      aninhadas e lazy loading por módulo ficam disponíveis para a estrutura de pastas a
      definir em T13. `pendencias.md`, item T7, movido para resolvida.
    - **Onde está discutida**: `pendencias.md`, Seção 5 (Tecnologia) e Seção 8 (resolvidas).

45. **T8 — Testes do Frontend**: definido como **Vitest + React Testing Library**, sem Jest.
    - **Alternativas analisadas**: **Jest + React Testing Library** — descartado por exigir
      configuração adicional para rodar sobre Vite (não é nativo), sendo redundante já ter
      Vite como bundler e Jest como test runner separado; **E2E (Cypress/Playwright) como
      única camada de teste** — descartado por não substituir teste de unidade/componente
      rápido, desproporcional como única camada para este porte — deliberadamente **fora do
      escopo desta decisão**, fica para avaliação futura quando o Frontend estiver funcional;
      **Vitest + React Testing Library** — **escolhida**, por decisão direta do usuário.
    - **Motivo da escolha**: resposta direta do usuário — usar a stack nativa do ecossistema
      Vite (mesma configuração de build/teste, sem ferramenta paralela), com testes focados
      no comportamento visível ao usuário, não em detalhe interno de implementação — princípio
      central do React Testing Library, escolhido deliberadamente por esse motivo.
    - **Desvantagens conhecidas e aceitas**: nenhuma cobertura de ponta a ponta (E2E) por esta
      decisão — aceito explicitamente, avaliação de Cypress/Playwright adiada para fase
      futura, não bloqueando a Fase 5.
    - **Consequência direta**: `frontend/` usa Vitest como test runner e React Testing Library
      como biblioteca de teste de componente, mesma configuração de build do Vite (T2).
      `pendencias.md`, item T8, movido para resolvida.
    - **Onde está discutida**: `pendencias.md`, Seção 5 (Tecnologia) e Seção 8 (resolvidas).

46. **T9 — Cliente HTTP e contrato de erro do Frontend**: definido como **axios**, isolado
    numa camada compartilhada única (`frontend/src/api/client`), responsável por toda a
    comunicação HTTP com o backend.
    - **Alternativas analisadas**: **fetch nativo** — descartado por não ter interceptores
      nativos, exigindo camada própria equivalente por cima de qualquer forma para cobrir
      injeção de token e tratamento centralizado de erro — sem vantagem real sobre axios para
      este caso de uso; **axios** — **escolhida**, por decisão direta do usuário.
    - **Responsabilidade da camada compartilhada (`src/api/client`)**: centraliza configuração
      do axios (base URL, timeout), interceptores de request/response, e a tradução do
      contrato `ApiError` já definido no backend (`timestamp`/`status`/`error`/`message`/
      `path`/`fieldErrors`, `common/web/ApiError.java`/`GlobalExceptionHandler.java`) para um
      formato interno consistente consumido pelo resto da aplicação. Ponto único de injeção
      futura do token de autenticação (interceptor de request), quando T11/S1 (`pendencias.md`,
      Seção 7) existirem. **Telas e componentes nunca tratam resposta HTTP diretamente** — só
      consomem esta camada, mesmo princípio já usado no backend para `consultasfinanceiras`
      (decisão #19): módulo compartilhado único, nunca reimplementado em cada consumidor.
    - **Motivo da escolha**: resposta direta do usuário — API mais ergonômica para JSON,
      interceptores nativos cobrindo exatamente as duas necessidades já identificadas
      (tratamento uniforme de erro, injeção futura de token), evitando que cada tela replique
      `try/catch` e parsing de erro por conta própria.
    - **Desvantagens conhecidas e aceitas**: uma dependência a mais no projeto — aceita,
      madura e estável, baixo risco de manutenção.
    - **Consequência direta**: nenhuma tela ou componente do Frontend acessa `axios`
      diretamente — sempre via `src/api/client`. `pendencias.md`, item T9, movido para
      resolvida.
    - **Onde está discutida**: `pendencias.md`, Seção 5 (Tecnologia) e Seção 8 (resolvidas);
      `common/web/ApiError.java` (contrato de erro do backend, referenciado por esta decisão).

47. **T10 — Gerenciamento de estado e cache de dados do servidor**: definido como
    **TanStack Query** para estado de servidor (dados vindos da API) e **Context API**
    (nativo do React) para estado de UI local — sem Redux.
    - **Duas naturezas de estado, tratadas deliberadamente por ferramentas diferentes**:
      estado de servidor (lançamentos, faturas, contratos, etc. — precisa de cache,
      revalidação, deduplicação, loading/error) e estado de UI local (tema, usuário
      autenticado, preferências — nunca vem da API). Misturar as duas na mesma ferramenta foi
      justamente o motivo de descartar Redux para esse papel.
    - **Alternativas analisadas para estado de servidor**: **Redux (ou Redux Toolkit) para
      tudo** — descartado por tratar dado de servidor como estado local, reimplementando
      manualmente cache/revalidação/deduplicação que o TanStack Query já resolve pronto, e
      por misturar as duas naturezas de estado na mesma ferramenta; **estado "na mão"
      (`useState`/`useEffect` por tela)** — descartado por alto risco de inconsistência e
      requisições duplicadas, dado o volume de entidades relacionadas do domínio (Lançamento,
      Fatura, Parcela, Conciliação); **TanStack Query** — **escolhida**, por decisão direta
      do usuário.
    - **Alternativas analisadas para estado de UI local**: **Zustand** — tecnicamente viável,
      mas descartado por ora — nenhum caso real de estado de UI verdadeiramente global e
      complexo foi identificado que o Context API não cubra; fica registrado como evolução
      possível, não decisão antecipada (princípio 2, `principios-de-modelagem.md`); **Context
      API** — **escolhida**, por decisão direta do usuário, restrita a estado global de
      interface (tema, usuário autenticado, preferências).
    - **Motivo da escolha**: resposta direta do usuário — TanStack Query resolve exatamente o
      problema de dado de servidor deste sistema (muitas entidades relacionadas, cache e
      revalidação consistentes), sem introduzir a complexidade do Redux sem necessidade
      demonstrada; Context API é suficiente e nativo para o volume real de estado de UI
      identificado hoje.
    - **Desvantagens conhecidas e aceitas**: se um caso real de estado de UI global complexo
      surgir no futuro, Context API pode não escalar bem — aceito explicitamente; Zustand fica
      registrado como evolução possível nesse cenário, não uma reabertura desta decisão.
    - **Consequência direta**: todo dado vindo da API passa por TanStack Query, consumindo
      `src/api/client` (T9, decisão #46) como camada de requisição; estado de UI global
      (tema, usuário autenticado, preferências) vive em Context API. Nenhum Redux é
      introduzido no projeto. `pendencias.md`, item T10, movido para resolvida.
    - **Onde está discutida**: `pendencias.md`, Seção 5 (Tecnologia) e Seção 8 (resolvidas);
      `decisions.md`, decisão #46 (T9).

48. **T11 — Autenticação no cliente (Frontend)**: definida como **cookie httpOnly** — o
    Frontend nunca armazena nem acessa o token JWT diretamente; o navegador encaminha o
    cookie automaticamente em toda requisição à API.
    - **Alternativas analisadas**: **token em memória (variável JS)** — tecnicamente viável e
      não exige nada novo do backend além do login devolver o JWT no corpo da resposta, mas
      descartado porque a sessão não sobreviveria a um refresh de página (F5) sem endpoint de
      refresh — requisito explícito do usuário; **`localStorage`/`sessionStorage`** —
      descartados explicitamente por exporem o token a qualquer script rodando na página
      (superfície real de risco a XSS), inconsistente com o rigor de segurança já aplicado no
      backend (T3 — Argon2 preferencial; A8 — reautenticação para ações de IA de nível Alto);
      **cookie httpOnly** — **escolhida**, por decisão direta do usuário.
    - **Motivo da escolha**: elimina estruturalmente a exposição do token a JavaScript —
      mesmo princípio de "tornar difícil violar por acidente, não só proibir por convenção"
      já usado na escolha de A1 (Clean Architecture, decisão #13); sobrevive a refresh de
      página sem exigir armazenamento em JS; consistente com o padrão de segurança já
      estabelecido no restante do projeto.
    - **Requisito imposto à implementação futura de S1/T3 no backend** (`pendencias.md`,
      Seção 7): o endpoint de login deve emitir o token via `Set-Cookie`, com `httpOnly`,
      `Secure` (em produção) e `SameSite` configurado adequadamente (mitigação de CSRF) — não
      no corpo da resposta JSON. Isso **não reabre** a decisão #14 (T3 — JWT como mecanismo de
      autenticação, Argon2 como hash) — T3 continua definindo *o que* autentica; esta decisão
      define *como o token trafega entre backend e cliente*, uma camada de transporte
      adicional, não uma substituição do mecanismo já congelado.
    - **Desvantagens conhecidas e aceitas**: exige que a implementação de S1 (backend) já
      nasça emitindo o cookie corretamente — nenhuma opção provisória de token em corpo de
      resposta fica disponível como caminho intermediário; refresh de sessão, se necessário
      no futuro, é responsabilidade do backend (endpoint dedicado), sem alterar esta decisão
      do lado do cliente.
    - **Consequência direta**: `src/api/client` (T9, decisão #46) configura `axios` com
      `withCredentials: true`, sem interceptor de injeção manual de token (o navegador já
      envia o cookie automaticamente) — o "ponto futuro de injeção de token" citado na
      decisão #46 passa a ser, na prática, só a configuração de credenciais da requisição, não
      manipulação direta do valor do token. `pendencias.md`, item S1, ganha a exigência de
      cookie httpOnly como parte de sua implementação; item T11 movido para resolvida.
    - **Onde está discutida**: `pendencias.md`, Seção 5 (Tecnologia), Seção 7 (S1) e Seção 8
      (resolvidas); `decisions.md`, decisão #14 (T3) e decisão #46 (T9).

49. **T12 — UI e estilo (biblioteca de componentes/design system)**: definido como
    **Tailwind CSS + shadcn/ui**. **A escolha de uma biblioteca de DataGrid fica
    deliberadamente fora do escopo desta decisão** — enquanto uma tabela HTML com Tailwind
    atender ao requisito, ela é usada; necessidade real de recursos avançados (virtualização,
    agrupamento, edição em massa, filtros complexos, seleção múltipla) origina uma nova
    decisão técnica específica, sem alterar esta.
    - **Alternativas analisadas**: **MUI (Material UI)** — tecnicamente forte (componentes
      prontos, incluindo `DataGrid`), mas descartado por ser biblioteca fechada, com estética
      "Material" marcada exigindo customização, e menor controle fino por componente; **Ant
      Design** — tecnicamente adequado ao perfil admin/ERP do sistema, mas descartado pelo
      mesmo motivo (biblioteca fechada, estética própria a sobrescrever, bundle maior);
      **Chakra UI** — descartado por ecossistema menor de componentes prontos para o volume
      de telas densas deste sistema; **Tailwind CSS + shadcn/ui** — **escolhida**, por decisão
      direta do usuário.
    - **Motivo da escolha**: resposta direta do usuário — priorizar controle do código-fonte
      dos componentes (shadcn/ui é incorporado ao projeto, não instalado como dependência
      fechada), facilidade de customização e independência de biblioteca de terceiros. Tailwind
      como padrão único de estilização de toda a aplicação. Consistente com o mesmo critério
      já usado em T7 (decisão #44, React Router) e T9 (decisão #46, axios): preferir a opção
      mais direta/controlável ao invés da mais "pronta", quando não há necessidade
      demonstrada que justifique a segunda.
    - **DataGrid — decisão adiada, não uma lacuna esquecida**: por instrução explícita do
      usuário, nenhuma biblioteca de grid financeiro (ex. TanStack Table, AG Grid) é escolhida
      agora — mesmo princípio já aplicado repetidamente no domínio (princípio 2, `principios-
      de-modelagem.md`: não estruturar antecipadamente um conceito sem necessidade real
      confirmada). Tabela HTML simples, estilizada com Tailwind, é o padrão até que essa
      necessidade apareça concretamente.
    - **Desvantagens conhecidas e aceitas**: componentes mais complexos (ex. um data grid
      financeiro completo) exigem montagem manual, sem vir prontos de uma biblioteca fechada
      — aceito explicitamente; mais decisão de composição de UI recai sobre quem constrói
      cada tela, mitigado pelo próprio modelo shadcn/ui (componentes copiados, ajustáveis
      livremente, sem API fechada a contornar).
    - **Consequência direta**: `frontend/` usa Tailwind CSS como única forma de estilização e
      shadcn/ui como fonte de componentes base, incorporados ao código-fonte do projeto
      conforme a necessidade de cada tela (tabelas financeiras, formulários densos,
      dashboards, telas administrativas). `pendencias.md`, item T12, movido para resolvida;
      nenhuma pendência de DataGrid criada — registrada só como nota de escopo nesta decisão,
      não como item formal de `pendencias.md`, para não antecipar estrutura sem necessidade
      confirmada.
    - **Onde está discutida**: `pendencias.md`, Seção 5 (Tecnologia) e Seção 8 (resolvidas).

50. **T13 — Estrutura de pastas e padrão arquitetural do Frontend**: definida como
    organização **por feature/módulo de domínio** (`features/`), espelhando os módulos já
    definidos no backend (`arquitetura-tecnica.md`, Seção 2) — sem Clean Architecture
    completa e sem organização por camada técnica global.
    - **Alternativas analisadas**: **por camada técnica** (`components/`, `hooks/`, `pages/`,
      `services/` na raiz, tudo junto) — descartada por não escalar com o número de módulos
      do domínio (24 entidades) e por espalhar arquivos de um mesmo módulo de negócio em
      pastas diferentes, sem fronteira entre módulos; **Clean Architecture completa**
      (domain/application/infrastructure espelhando o backend) — descartada por
      desproporção: o "domínio" real (regra de negócio) já vive inteiramente no backend
      (Fase 4); o Frontend não tem invariante própria a proteger, mesmo critério de
      proporcionalidade já usado no próprio backend para reservar Clean Architecture completa
      só a módulos com "núcleo com invariante" (`arquitetura-tecnica.md`, Seção 4); **por
      feature/módulo de domínio** — **escolhida**, por decisão direta do usuário.
    - **Estrutura definida** (`frontend/src/`):
      - `app/` — bootstrap da aplicação: providers (TanStack Query, Context API, Router),
        configurações globais.
      - `features/` — um diretório por módulo de negócio, espelhando os módulos do backend
        (`arquitetura-tecnica.md`, Seção 2: Cadastros Base, Financeiro, Conciliação Bancária,
        Cartão de Crédito, Financiamentos e Consórcios, Obras, Frota, Ajuste Financeiro,
        Balanço, IA). Cada feature pode conter `components/`, `hooks/`, `api/`, `pages/`,
        `types/` e demais arquivos próprios daquele módulo.
      - `shared/` — só recursos genuinamente compartilhados entre features: componentes
        shadcn/ui reaproveitados (T12), `api/client` (T9, decisão #46), Context API (T10,
        decisão #47), hooks genéricos, constantes, tipos comuns.
      - `routes/` — só definição de rotas React Router (T7, decisão #44) e guards de
        autenticação (T11, decisão #48) — navegação mantida separada das features.
    - **Motivo da escolha**: resposta direta do usuário — mesma linguagem de negócio entre
      backend e Frontend (navegação mais fácil entre as duas bases de código), sem reproduzir
      rigidez desproporcional ao papel real do Frontend (apresentação, orquestração de
      chamadas de API, experiência do usuário — nunca regra de negócio).
    - **Desvantagens conhecidas e aceitas**: nenhuma identificada — a estrutura foi desenhada
      para o perfil já confirmado do sistema (muitos módulos de domínio, regra de negócio
      concentrada no backend).
    - **Consequência direta**: com T13 resolvida, todas as decisões constituintes da Fase 5
      necessárias antes da arquitetura técnica completa do Frontend estão fechadas (T2, T7,
      T8, T9, T10, T11, T12, T13, T14 — decisões #42 e #44-#50). A arquitetura técnica
      completa do Frontend (Seção 7 do processo desta fase) pode ser elaborada agora,
      sintetizando estas nove decisões. Se uma necessidade concreta futura exigir outra
      organização, é nova decisão técnica, não reabertura desta.
    - **Onde está discutida**: `pendencias.md`, Seção 5 (Tecnologia) e Seção 8 (resolvidas);
      `arquitetura-tecnica.md`, Seção 2 (módulos do backend, referência de espelhamento).
