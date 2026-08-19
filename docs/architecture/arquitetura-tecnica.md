# Arquitetura Técnica — Consolidada
## Sistema Financeiro/Gerencial H Vieira Terraplanagem

**Fonte de verdade conceitual**: `arquitetura-conceitual.md`. Este documento **não altera nenhuma regra de negócio, entidade ou relacionamento** definido lá — ele traduz esse modelo em decisões de engenharia. Onde este documento e o conceitual divergirem em algo que **não seja** puramente técnico (linguagem, framework, banco físico, infra, UX), o conceitual prevalece e este documento está errado.

**Fonte de verdade do modelo de dados**: as 24 entidades em `domain-model/`, já com as decisões de consolidação incorporadas. Este documento não repete a forma de nenhuma entidade — só referencia.

**Fonte de verdade dos princípios de modelagem**: `principios-de-modelagem.md`.

**Natureza deste documento**: consolida a arquitetura técnica original com as mudanças já ratificadas pela arbitragem técnica (`arbitragem-tecnica-final.md`) e com as decisões já incorporadas ao modelo de domínio. Nenhuma linha de código, schema, SQL, classe ou endpoint foi criada. Onde existe mais de uma opção tecnicamente válida ainda sem decisão, isso permanece registrado na Seção 15. A versão original deste documento, anterior a esta consolidação, e o próprio processo de auditoria/réplica/arbitragem que a originou, estão preservados como histórico (`arquitetura-tecnica-v1.md`, `auditoria-critica-arquitetura-tecnica.md`, `replica-tecnica-auditoria-critica.md`, `arbitragem-tecnica-final.md`).

---

## ÍNDICE

1. Resumo do sistema
2. Principais módulos
3. Dependências entre módulos
4. Arquitetura de software
5. Stack tecnológica
6. Estrutura de pastas
7. Escalabilidade e manutenibilidade
8. Integração futura com IA
9. Integração bancária futura
10. Auditoria
11. Permissões de usuários
12. Testes
13. Versionamento de banco
14. Ordem recomendada de implementação
15. Decisões técnicas pendentes de aprovação

---

## 1. RESUMO DO SISTEMA

O sistema substitui um controle financeiro/gerencial hoje feito em planilhas para a H Vieira Terraplanagem (e outras 5 empresas do grupo: Helierti, CV, CD, Camila, Celso). O núcleo é uma **cadeia de eventos financeiros em três naturezas distintas**, nunca fundidas:

```
LANÇAMENTO_FINANCEIRO  (obrigação/direito — "o que se deve/tem direito a receber")
        │  N:N via APLICAÇÃO_DE_LIQUIDAÇÃO
        ▼
LIQUIDAÇÃO_FINANCEIRA  (decisão/execução do pagamento ou recebimento)
        │  1:1 (gera ou é conferida com)
        ▼
MOVIMENTAÇÃO_BANCÁRIA  (fato puro do extrato, 100% do banco)
        │
        ▼
VÍNCULO_CONCILIAÇÃO
```

Sobre esse núcleo, o sistema organiza:

- **Cartão de crédito**: compras individuais (com classificação própria) agrupadas em faturas; só compras "Terraplanagem" geram Lançamento, via Parcela.
- **Financiamentos/Consórcios**: mesma lógica de Parcela → Lançamento ao vencer.
- **Obras e Frota**: dimensões de leitura sobre `LANÇAMENTO_FINANCEIRO` (via `obra_id`/`veiculo_id`, que podem coexistir), nunca bases próprias.
- **Rateio**: divisão de uma despesa entre obras, sem duplicar o valor original.
- **Ajuste Financeiro**: estornos/reembolsos/créditos como novo Lançamento vinculado ao original, que nunca é alterado.
- **Conciliação bancária**: 100% do extrato sempre visível, com uma dimensão de `classificação` (o que é da operação) independente do `estado_conciliação` (o que já foi conferido).
- **IA**: consumidora de ferramentas de consulta controladas, nunca com acesso direto ao banco; toda sugestão/ação fica pendente até confirmação humana, com três níveis de sensibilidade (Baixo/Médio/Alto).
- **Auditoria**: log granular por campo, para toda entidade financeira relevante, desde a primeira versão.

Princípios que mais pesam na decisão técnica adiante: **fonte única da verdade** (nada é lido de cópia própria de outro módulo), **nada é apagado**, **todo indicador é calculado em consulta, nunca armazenado como número editável**, e **a IA nunca escreve diretamente em dado financeiro**. Esses quatro princípios, sozinhos, já eliminam boa parte das opções arquiteturais mais simples (ver Seção 4).

---

## 2. PRINCIPAIS MÓDULOS

| Módulo | Entidades que possui | Natureza |
|---|---|---|
| **Cadastros Base** | Empresa, Conta Bancária, Fornecedor, Cliente, Categoria | Suporte — usado por quase todos os outros |
| **Financeiro (núcleo)** | Lançamento Financeiro, Liquidação Financeira, Aplicação de Liquidação | Escrita — é o coração do sistema |
| **Conciliação Bancária** | Movimentação Bancária, Transferência Interna, Vínculo Conciliação | Escrita, mas isolado — nunca escreve em Lançamento |
| **Cartão de Crédito** | Cartão, Compra Cartão, Parcela, Fatura | Escrita — dispara Lançamento quando aplicável |
| **Financiamentos e Consórcios** | Contrato Financeiro, Parcela | Escrita — dispara Lançamento ao vencer |
| **Obras** | Obra, Rateio Despesa | Escrita só do cadastro; custo é sempre lido do Financeiro |
| **Frota** | Veículo | Escrita só do cadastro; custo é sempre lido do Financeiro |
| **Ajuste Financeiro** | Ajuste Financeiro | Escrita — vincula dois Lançamentos |
| **Balanço (Realizado/Projetado)** | — (sem entidade própria) | Somente leitura, agregação sobre Lançamento |
| **IA** | Sugestão IA, Ação Proposta IA | Escrita restrita a estados pendentes; leitura via ferramentas |
| **Auditoria** | Log Auditoria | Escrita automática, disparada por todos os módulos acima |
| **Usuários e Permissões** | (entidades a definir — pendência 5 do documento conceitual) | Suporte — cross-cutting |

---

## 3. DEPENDÊNCIAS ENTRE MÓDULOS

```
                         ┌────────────────────┐
                         │   Cadastros Base    │  (Empresa, Conta Bancária,
                         │                      │   Fornecedor, Cliente, Categoria)
                         └──────────┬───────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              ▼                     ▼                     ▼
        ┌───────────┐       ┌─────────────┐        ┌────────────┐
        │   Obras    │       │    Frota     │        │  Contrato  │
        │ (cadastro) │       │  (cadastro)  │        │ Financeiro │
        └─────┬──────┘       └──────┬───────┘        └─────┬──────┘
              │                     │                       │
              └──────────┬──────────┴───────────┬───────────┘
                         ▼                       ▼
                ┌─────────────────────┐   ┌─────────────┐
                │  FINANCEIRO (núcleo) │◄──│   Cartão    │
                │ Lançamento/Liquidação│   │  de Crédito │
                │ /Aplicação           │   └─────────────┘
                └──────────┬────────────┘
                            │
        ┌───────────────────┼────────────────────┬───────────────┐
        ▼                   ▼                    ▼               ▼
 ┌─────────────┐    ┌───────────────┐    ┌───────────────┐ ┌───────────┐
 │  Rateio      │    │    Ajuste      │    │  Conciliação  │ │  Balanço  │
 │  (sobre Lanç)│    │  Financeiro    │    │   Bancária    │ │(só leitura│
 └─────────────┘    └───────────────┘    └───────────────┘ │sobre Lanç)│
                                                              └───────────┘
                                    ▲
                                    │ (só via ferramentas de consulta,
                                    │  nunca acesso direto)
                              ┌───────────┐
                              │     IA     │
                              └───────────┘

  AUDITORIA: cross-cutting — todo módulo acima que escreve, escreve
             também em Log Auditoria (não aparece como "consumidor",
             é uma escrita paralela obrigatória).

  USUÁRIOS/PERMISSÕES: cross-cutting — todo módulo depende dele para
             autorizar a operação antes de executá-la.
```

**Regras de dependência que a implementação não pode violar** (derivadas diretamente do documento conceitual, Seção 13):
- Só **Financeiro** e **Cartões** escrevem em `LANÇAMENTO_FINANCEIRO`.
- **Balanço**, **Obras** e **Frota** são estritamente leitura sobre `LANÇAMENTO_FINANCEIRO` — nenhuma consulta direta a `MOVIMENTAÇÃO_BANCÁRIA`.
- **Conciliação** nunca escreve em `LANÇAMENTO_FINANCEIRO`.
- **IA** nunca escreve em entidade financeira diretamente — só em `SUGESTÃO_IA`/`AÇÃO_PROPOSTA_IA`.

---

## 4. ARQUITETURA DE SOFTWARE

### O que o domínio exige, independente de framework

1. Regras de negócio "pesadas" e centrais (status calculado, rateio mutuamente exclusivo com atribuição direta, ajuste nunca altera o original, classificação ≠ categoria, barreiras de confirmação da IA) — regras assim se degradam rápido se ficarem espalhadas em controllers/rotas.
2. Módulos com fronteiras de leitura/escrita estritas (Seção 3) — a arquitetura precisa **tornar difícil** violar essas fronteiras, não só documentá-las.
3. Múltiplos "adaptadores externos" que vão mudar com o tempo sem tocar a regra de negócio: provedor de IA (hoje indefinido, Seção 19 do conceitual), origem da Movimentação Bancária (hoje manual, amanhã Open Finance), possíveis integrações futuras (nota fiscal, relatórios).
4. Auditoria granular desde o dia 1, cortando todos os módulos.

### Opções avaliadas

| Opção | Como ficaria aqui | Vantagens | Desvantagens |
|---|---|---|---|
| **MVC simples (padrão de framework web tradicional)** | Regras de negócio dentro de controllers/models do framework | Rápido de começar, muita literatura, produtivo para CRUD simples | Regras como "status calculado" e "barreira de confirmação da IA" tendem a vazar para controllers; troca de provedor de IA ou de origem bancária mexe em código de domínio; a distinção entre módulos de escrita/leitura vira convenção, não estrutura |
| **Arquitetura em camadas (N-tier: apresentação/serviço/dados)** | Camada de serviço concentra regra de negócio, camada de dados acessa banco | Melhora o MVC puro, separa regra de acesso a dados | Ainda tende a acoplar regra de negócio ao ORM/banco escolhido; fronteiras entre módulos (ex. "Obras nunca escreve em Lançamento") não são impostas pela estrutura, só por disciplina de code review |
| **Clean Architecture (camadas concêntricas: domínio → aplicação → infra/interfaces)** | Domínio (entidades + regras) no centro, sem dependência de framework/banco/IA; casos de uso na camada de aplicação; banco, web, IA como "detalhes" na borda | Regra de negócio testável sem banco nem framework; trocar banco, framework web ou provedor de IA não toca o domínio; fronteiras entre módulos podem ser impostas via módulos/pacotes internos | Mais boilerplate inicial; exige disciplina da equipe; para um sistema pequeno pode parecer "excesso de estrutura" no começo |
| **Hexagonal / Ports & Adapters** | Mesma ideia da Clean Architecture, formalizada como "portas" (interfaces) que o domínio define e "adaptadores" que as implementam (banco, IA, importação bancária) | Mapeia quase 1:1 com o próprio texto conceitual: "a IA nunca acessa o banco diretamente — só ferramentas expostas pelo sistema" já É uma porta; trocar de "importação manual" para "Open Finance" (Seção 9) é só trocar um adaptador | Mesmo custo inicial da Clean Architecture; a diferença entre as duas na prática é mais de vocabulário/ênfase que de resultado final |

### Decisão oficial (A1 — congelada)

**Clean Architecture com fronteiras internas explícitas por módulo, usando o vocabulário de Ports & Adapters especificamente para os pontos que o documento conceitual já trata como fronteira controlada** (ferramentas de consulta da IA, importação de extrato bancário, e — futuramente — o provedor de IA e o provedor de Open Finance). **Clean Architecture e Hexagonal/Ports & Adapters passam a ser tratadas, neste projeto, como uma única alternativa arquitetural** — a diferença entre as duas é de vocabulário/ênfase, não de resultado estrutural: ambas descrevem a mesma organização já detalhada na Seção 6.

**Por quê**: os quatro princípios do domínio listados no início da Seção 1 deste documento (fonte única da verdade, nada é apagado, indicador sempre calculado, IA nunca escreve direto) são, estruturalmente, **regras de domínio que precisam sobreviver a qualquer troca de banco, framework ou provedor de IA**. Colocar essas regras no centro da arquitetura (não em controllers, não em triggers de banco) é a única opção das quatro que torna essas regras difíceis de violar por acidente — e não apenas "proibidas por convenção".

**Decisão congelada** — ver `decisions.md`, decisão #13. A estrutura de pastas da Seção 6 deixa de ser recomendação e passa a ser o **padrão oficial** do backend.

**Nota (M1, `pendencias.md`, satisfeita documentalmente)**: o parágrafo acima já delimita por completo a relação entre os dois vocabulários — não há fronteira a desenhar entre "onde termina Clean Architecture e começa Ports & Adapters", porque os dois **são a mesma alternativa arquitetural**, diferindo só em ênfase nos pontos de fronteira controlada já citados. Nenhuma decisão nova — M1 fecha por remissão a esta decisão (#13).

### Critério de proporcionalidade (arbitragem técnica, Divergência 1 — mudança obrigatória já incorporada)

A Clean Architecture recomendada acima não deve ser aplicada uniformemente a todo o sistema. Dois perfis de módulo:

- **Núcleo com invariante**: módulos com pelo menos uma regra de negócio real a proteger — cadeia financeira central (Lançamento, Liquidação, Aplicação), Conciliação, Cartão, Financiamento/Consórcio, Rateio, Ajuste Financeiro, e os estados de IA (Sugestão/Ação) — mantêm domain + application + infrastructure completos.
- **Cadastro simples**: módulos de referência sem regra de negócio própria além de obrigatoriedade/unicidade — Empresa, Cliente, Fornecedor, Conta Bancária **e Categoria** — podem colapsar domain+application num caso de uso leve por operação, mantendo ainda um repositório/porta de persistência.

**Nota de atualização em relação à arbitragem original**: a arbitragem (Divergência 1) havia mantido `Categoria` no perfil "núcleo com invariante", especificamente porque a pendência 4 do conceitual (possível separação em "natureza do gasto" × "sub-conta interna") ainda estava em aberto. Essa pendência foi resolvida no modelo de domínio (`domain-model/06-categoria.md`, Seção 7) — decidido manter `Categoria` sem separação, por não existir definição de negócio para a dimensão hipotética. Com a premissa que justificava a exceção removida, `Categoria` é reclassificada aqui para o perfil "cadastro simples". Esta reclassificação é consequência direta da decisão já aprovada no domínio, não uma nova decisão de arquitetura.

---

## 5. STACK TECNOLÓGICA

O documento conceitual (Seção 19) deixa deliberadamente em aberto: linguagem, framework, ORM, banco físico, infraestrutura, provedor de IA e formato de importação bancária. Nenhuma dessas escolhas muda o modelo de negócio — mas todas precisam de decisão explícita seguindo a mesma regra que já vinha sendo aplicada na etapa conceitual: **quando há mais de uma opção válida, apresento vantagens/desvantagens e peço sua decisão.**

### 5.1 Backend

| Opção | Vantagens | Desvantagens |
|---|---|---|
| **Node.js + TypeScript (NestJS)** | Tipagem estática ajuda muito num domínio com tantas entidades relacionadas; NestJS já organiza código em módulos com fronteiras explícitas (favorece a Seção 4); mesmo ecossistema de tipos pode ser reaproveitado no frontend; grande disponibilidade de SDKs para provedores de IA | Ecossistema mais "opinativo por convenção" que por imposição — decoradores do NestJS escondem parte da estrutura Clean Architecture se não houver disciplina |
| **Python (FastAPI)** | Ecossistema de IA/dados é o mais maduro (útil se o "adaptador de IA" ou análises futuras crescerem); tipagem gradual (type hints) ajuda, mas é opcional, então exige mais disciplina; FastAPI é leve e rápido de escrever | Tipagem não é imposta pela linguagem — mais fácil "escapar" das fronteiras de módulo sem ferramentas extras (mypy estrito); menos natural para uma estrutura de camadas rígida sem convenção manual |
| **.NET (C# + ASP.NET Core)** | Tipagem forte e madura; muito usado em sistemas financeiros corporativos; Entity Framework Core tem excelente suporte a migrations versionadas (Seção 13); bom encaixe natural com Clean Architecture (é quase o exemplo de livro-texto da comunidade .NET) | Ecossistema de IA (SDKs, exemplos, comunidade) é mais restrito que Node/Python; ambiente de desenvolvimento mais pesado |
| **Java 21 LTS + Spring Boot** — **ESCOLHIDA (decisão oficial)** | Tipagem estática forte; ecossistema extremamente maduro para sistemas corporativos/financeiros; módulos Maven/Gradle impõem fronteira física entre camadas em tempo de build (mesmo mecanismo do .NET); Hibernate/JPA e Flyway/Liquibase entre os ORMs/ferramentas de migration mais maduros do mercado; maior volume de documentação/exemplos entre as quatro opções avaliadas — relevante para manutenção predominantemente solo | Ambiente de desenvolvimento mais pesado (JVM) — maior consumo de memória e tempo de inicialização; maior boilerplate inicial; ecossistema de IA (SDKs, exemplos) mais restrito que Node/Python |

**Decisão oficial (T1 — congelada)**: **Java 21 LTS + Spring Boot**, com **Maven** como gerenciador de dependências e **Hibernate/JPA** (Spring Data JPA) como ORM principal. Java não fazia parte da comparação original acima — foi levantado posteriormente como candidato nunca analisado na documentação original (sem justificativa registrada para a ausência), avaliado nos mesmos critérios das outras três opções, e escolhido. Justificativa completa — incluindo as alternativas analisadas e o motivo real da escolha — registrada em `decisions.md`, decisão #12.

### 5.2 Frontend

| Opção | Vantagens | Desvantagens |
|---|---|---|
| **React (com Next.js)** | Ecossistema maior, mais componentes prontos para tabelas/dashboards financeiros; se o backend for Node/TS, tipos podem ser compartilhados | Next.js mistura backend e frontend no mesmo projeto — precisa de disciplina para não vazar regra de negócio para lá |
| **Vue 3** | Curva de aprendizado mais suave; muito adequado para telas de formulário/tabela (perfil forte deste sistema: lançamentos, conciliação, faturas) | Ecossistema menor que React para componentes financeiros prontos |
| **Angular** | Estrutura muito opinativa, força organização — pode encaixar bem com um backend também estruturado | Curva de aprendizado mais alta; verboso para um time pequeno |

### 5.3 Banco de dados

O modelo é fortemente relacional: N:N entre Lançamento e Liquidação, integridade obrigatória entre Compra→Parcela→Lançamento, necessidade de transações atômicas (ex.: registrar uma Liquidação e suas Aplicações precisa ser tudo-ou-nada), e forte necessidade de consultas agregadas (Balanço, custo de Obra, custo de Veículo). Isso aponta para um **banco relacional** — não há, no documento conceitual, nenhum caso de uso que peça um banco não-relacional (documento, grafo, etc.).

| Opção | Vantagens | Desvantagens |
|---|---|---|
| **PostgreSQL** | Melhor suporte a integridade referencial complexa, JSON quando necessário (útil para `dados_propostos` de `AÇÃO_PROPOSTA_IA`, que é estruturalmente variável), extensões maduras, gratuito, muito usado em sistemas financeiros | Nenhuma desvantagem relevante para este porte de projeto |
| **MySQL/MariaDB** | Também maduro e gratuito, mais familiar em hospedagens compartilhadas simples | Suporte a tipos JSON e constraints avançadas historicamente um degrau abaixo do PostgreSQL |
| **SQL Server** | Forte se o restante da stack for .NET; ferramentas de administração conhecidas no mercado corporativo brasileiro | Custo de licença fora do tier gratuito/Express; menor vantagem se a stack não for .NET |

**Observação sem caráter de decisão**: dado o perfil do domínio (muita integridade referencial, campo JSON variável em `AÇÃO_PROPOSTA_IA`, necessidade de zero custo de licença), PostgreSQL tende a ser o mais citado nesse tipo de sistema — mas isso é apontamento, não escolha; está na lista de decisões pendentes.

### 5.4 ORM / acesso a dados

Comparação original, feita antes da definição de T1 — as quatro opções abaixo eram candidatas amarradas a cada uma das linguagens então em avaliação, preservadas aqui como registro histórico, não mais como candidatas ativas:

| Opção | Vantagens | Desvantagens |
|---|---|---|
| **Prisma (Node/TS)** | Migrations versionadas muito claras, tipagem gerada automaticamente | Menos flexível para queries agregadas muito complexas (Balanço/custo de Obra podem precisar de SQL cru mesmo assim) |
| **TypeORM (Node/TS)** | Mais flexível, suporta padrão Repository nativamente (bom encaixe com Clean Architecture/Hexagonal) | Migrations historicamente menos confiáveis que Prisma |
| **SQLAlchemy (Python)** | Muito maduro, controle fino sobre queries agregadas | Curva de aprendizado maior, verboso |
| **Entity Framework Core (.NET)** | Excelente suporte a migrations e integridade referencial | Só faz sentido se a stack for .NET |

*(a escolha de ORM dependia diretamente da escolha de linguagem/backend acima — não era uma decisão independente)*

**ORM principal, já decidido**: com T1 definida (Java 21 LTS + Spring Boot), o ORM correspondente é **Hibernate/JPA, via Spring Data JPA** — ver `decisions.md`, decisão #12. As quatro opções acima ficam preservadas só como registro histórico da comparação feita antes de T1; não são mais candidatas.

**Única questão ainda existente (`pendencias.md`, item B2)**: não é mais escolha de tecnologia — é uma avaliação futura de implementação, sobre se as consultas agregadas mais complexas do domínio (custo de Obra, custo de Veículo, saldo devedor de Contrato) vão precisar de uma estratégia complementar ao Spring Data JPA (ex. jOOQ). O módulo de consultas compartilhadas (A6) já está desenhado em nível arquitetural (Seção 6; `decisions.md`, decisão #35) — falta só existir um caso real para essa avaliação fazer sentido.

### 5.5 Autenticação e autorização

| Opção | Vantagens | Desvantagens |
|---|---|---|
| **Autenticação própria (usuário/senha + JWT, hash de senha com bcrypt/argon2)** | Controle total, sem dependência externa, sem custo recorrente, adequado a um número pequeno e fechado de usuários internos (6 empresas do grupo, não um público externo) | Responsabilidade de segurança (armazenamento de senha, recuperação de conta, expiração de sessão) fica inteiramente com a equipe |
| **Provedor externo (ex. Auth0, Clerk, Keycloak auto-hospedado)** | Terceiriza gestão de senha, 2FA pronto, telas de login prontas | Custo recorrente (nos SaaS) ou esforço de hospedar (Keycloak); overhead desnecessário para uma base pequena e interna de usuários |

**Observação**: como o sistema é interno (não tem cadastro público de usuários), uma solução própria simples com JWT tende a ser suficiente e evita dependência externa para dados financeiros sensíveis — mas fica como decisão pendente, não escolha feita.

**Decisão oficial (T3 — congelada)**: **autenticação própria** — usuário/senha, com **Spring Security** e **JWT** como mecanismo de autenticação. Hash de senha com **Argon2** (preferencial); bcrypt permanece como alternativa apenas caso surja impedimento técnico documentado ao usar Argon2. **Nenhum provedor externo** (Auth0, Clerk, Keycloak) — descartados por desalinhamento com o perfil do sistema (interno, sem cadastro público, poucos usuários, sem necessidade documentada de SSO entre múltiplos sistemas do grupo). Justificativa completa registrada em `decisions.md`, decisão #14.

### 5.6 Hospedagem / infraestrutura

**Decisão oficial (T4 — congelada, nível arquitetural)**: a implantação inicial prioriza uma **plataforma PaaS gerenciada** (categoria — ex. Railway, Render ou equivalente), reduzindo ao máximo a carga operacional; a escolha do provedor específico permanece **decisão operacional**, podendo mudar sem impacto na arquitetura. VPS e provedores de maior porte (AWS, Azure ou equivalente) continuam compatíveis com a stack já congelada (Java 21 + Spring Boot + PostgreSQL), mas não são a estratégia inicial — migração para eles só deve ocorrer quando houver necessidade real de escala, disponibilidade, integrações ou requisitos operacionais que a justifiquem. Nenhum provedor específico é escolhido por esta decisão. Justificativa completa registrada em `decisions.md`, decisão #38.

---

## 6. ESTRUTURA DE PASTAS RECOMENDADA

Estrutura conceitual, independente da linguagem final escolhida (Seção 15), seguindo Clean Architecture/Hexagonal (Seção 4). Nomes de pasta são ilustrativos, não vinculantes a nenhuma linguagem específica:

```
/src
  /domain                    → regra de negócio pura, sem dependência de framework/banco
    /lancamento-financeiro
    /liquidacao-financeira
    /conciliacao-bancaria
    /cartao-credito
    /financiamento-consorcio
    /obra
    /frota
    /rateio
    /ajuste-financeiro
    /ia                     → só os estados de IA (Sugestão/Ação) — entidades de domínio por direito próprio,
                               nunca "a IA" em si. Os contratos de "ferramenta de consulta" NÃO ficam aqui
                               (correção da arbitragem técnica, Divergência 5 — ver /application/ia abaixo)
    /auditoria

  /application                → casos de uso (orquestram entidades de domínio)
    /financeiro
      registrar-lancamento.*
      registrar-liquidacao.*
      obter-status-financeiro-lancamento.*   → leitura/consulta; `status_financeiro` é sempre calculado,
                                                 nunca escrito (decisão de consolidação do domínio)
      alterar-situacao-administrativa.*       → único caso de uso de escrita para cancelamento; bloqueado
                                                 se houver Aplicação de Liquidação vinculada (soma > 0)
    /conciliacao
      importar-extrato.*
      vincular-movimentacao.*
    /cartao
      registrar-compra.*
      fechar-fatura.*          → Cartão calcula/confirma o total do ciclo; escreve só em Fatura.
                                  O pagamento invoca `financeiro/registrar-liquidacao.*` — este caso de uso
                                  nunca cria Liquidação diretamente (mudança obrigatória, arbitragem
                                  técnica, Divergência 6)
    /consultas-financeiras      → módulo de leitura compartilhado: custo de obra, custo de veículo, saldo
                                  devedor de contrato, e demais agregações — consumido por Balanço, Obra,
                                  Frota e pelas ferramentas de consulta da IA, nunca reimplementado em cada
                                  um separadamente (mudança obrigatória, arbitragem técnica, Divergência 2;
                                  inclui o caso de uso de Frota, antes ausente)
    /ia
      contratos-ferramenta-consulta.*   → schema do que a IA pode consultar (movido de domain/ia — correção
                                          da Divergência 5); consome application/consultas-financeiras
      executar-ferramenta-consulta.*
      registrar-sugestao.*
      confirmar-acao-proposta.*   → aqui vive a barreira de confirmação (Baixo/Médio/Alto)
    /auditoria
      registrar-log.*

  /infrastructure              → "adaptadores" — tudo que é detalhe técnico substituível
    /database                  → implementação concreta do banco escolhido (Seção 5.3/5.4)
    /ia-provider                → adaptador para o provedor de IA escolhido (Seção 8)
    /importacao-bancaria        → adaptador para extrato manual, e futuramente Open Finance (Seção 9)
    /auth                       → implementação de autenticação/permissões (Seção 11)

  /interfaces                  → pontos de entrada
    /http                       → API REST/GraphQL (a definir)
    /web                        → frontend, se no mesmo repositório

/tests
  /unit          → regras de domínio isoladas (ex.: status calculado, rateio, ajuste)
  /integration   → casos de uso + banco real (ou em memória)
  /acceptance    → Matriz de Validação A–R e os dois exemplos da Seção 14 do conceitual, como testes formais
```

**Regra estrutural que implementa a Seção 13 do conceitual**: o módulo `domain/obra` e `domain/frota` não devem conter nenhuma operação de escrita sobre Lançamento — apenas leitura/agregação. Isso deve ser garantido por não expor, nesses módulos, nenhuma dependência para os casos de uso de escrita de `application/financeiro`. Da mesma forma, `domain/ia` nunca deve ter acesso de escrita direto às pastas de `lancamento-financeiro`, `liquidacao-financeira` ou `conciliacao-bancaria` — só aos casos de uso de leitura e aos seus próprios estados pendentes.

**Decisão oficial (mecanismo do módulo `application/consultas-financeiras` — congelada)**: implementado como um serviço de aplicação (Application Service/Facade), com componentes Spring (`@Service`) que compõem os resultados de repositórios Spring Data JPA (Hibernate/JPA). Decisão técnica independente, registrada sem código de pendência associado (`decisions.md`, Seção D). Justificativa completa, incluindo alternativas descartadas, registrada em `decisions.md`, decisão #19.

**Decisão oficial (A6 — congelada, nível arquitetural)**: responsabilidade — expor consultas agregadas de leitura compartilhadas, sempre calculadas em consulta, nunca persistidas (princípio 6). Consumidores fechados: Balanço, Obra, Frota, ferramentas de consulta da IA — nenhum outro, nenhum reimplementa a lógica separadamente (Divergência 2). Quatro categorias de consulta (nível arquitetural, não catálogo de métodos concretos): (1) custo agregado por dimensão (Obra, Veículo); (2) resultado financeiro derivado, composto a partir de custo agregado, receita e ajustes (ex. "Lucro por Obra"); (3) saldo/posição em aberto (ex. saldo devedor de Contrato Financeiro); (4) efeito líquido de correções sobre um fato original (ex. custo efetivo de um Lançamento após Ajustes). Cada categoria é acessada via método do Facade, com escopo por Empresa herdado automaticamente via Hibernate/JPA Filters (A4). A fórmula interna de cada categoria (sinal do Ajuste, exclusão ou não de Lançamentos Cancelados, terminologia de status subjacente) permanece fora do escopo desta decisão — documentada em `plano-implementacao-sql.md` (Views adiadas), a resolver quando cada funcionalidade for especificada e implementada. Justificativa completa registrada em `decisions.md`, decisão #35.

---

## 7. ESTRATÉGIA DE ESCALABILIDADE E MANUTENIBILIDADE

1. **Domínio isolado de infraestrutura** (Seção 4/6) — trocar banco, framework web ou provedor de IA nunca deve exigir reescrever regra de negócio.
2. **Toda consulta agregada (Balanço, custo de Obra, custo de Veículo) implementada como leitura, nunca como número armazenado** — já é exigência do documento conceitual (princípio 8); tecnicamente, isso deve ser resolvido com queries otimizadas (índices sobre `obra_id`, `veiculo_id`, `data_competência`) em vez de desnormalização prematura. Se o volume de dados um dia justificar, uma camada de cache/view materializada pode ser adicionada **sem violar o princípio**, desde que a view seja recalculada, nunca editável manualmente.
3. **Módulos com fronteira de escrita única** (só Financeiro e Cartões escrevem em Lançamento) reduz a superfície de bugs de concorrência e simplifica auditoria.
4. **Migrations incrementais e reversíveis** (Seção 13) evitam que o crescimento do schema vire dívida técnica.
5. **Testes de aceitação vindos direto da Matriz A–R** (Seção 12) garantem que evolução futura não quebre uma regra de negócio já validada.
6. **Separação entre módulos por pasta/pacote desde o início**, mesmo rodando como um único serviço no começo — isso mantém a opção em aberto de, no futuro, extrair um módulo (ex. Conciliação, ou IA) como serviço separado, sem reescrever a lógica interna, caso o volume de uma parte específica cresça desproporcionalmente às demais.

---

## 8. ESTRATÉGIA PARA INTEGRAÇÃO FUTURA COM IA

O conceitual já fixa o contrato: **modelo de mercado via API, nunca acesso direto ao banco, só ferramentas controladas, e três níveis de confirmação (Baixo/Médio/Alto)** (Seção 11 do conceitual). Tecnicamente:

- **Porta de IA** (`infrastructure/ia-provider`, Seção 6): uma interface única de "ferramentas disponíveis para IA" (ex.: buscar despesas, custo de obra, ranking de fornecedores) implementada no domínio/aplicação, exposta ao provedor de IA escolhido via *function calling*/*tool use*. Trocar de provedor (Anthropic, OpenAI, Google) deve significar trocar só esse adaptador.
- **Estados pendentes reais no banco** para `SUGESTÃO_IA` e `AÇÃO_PROPOSTA_IA` (já exigido no checklist do conceitual) — nunca lógica só de tela.
- **Barreira de confirmação Alto**: comparação técnica original entre três opções, preservada abaixo por completude histórica:

| Opção | Vantagens | Desvantagens |
|---|---|---|
| Reautenticação (senha/2FA no momento da confirmação) | Simples de implementar, familiar ao usuário | Fricção a cada ação sensível |
| Segundo aprovador (usuário diferente do que originou a conversa com a IA) | Barreira mais forte, reduz erro de um único operador | Exige mais de um usuário ativo no sistema — pode não ser viável no dia a dia de uma operação pequena |
| Confirmação simples reforçada (tela de revisão explícita dos dados antes de gravar, sem segundo fator) | Já cobre a exigência mínima do conceitual (regra 27/28: nunca executa sem confirmação explícita) | Mais fraca que as duas opções acima como "barreira" |

**Nota sobre a comparação acima**: "Segundo aprovador" foi retirada da comparação técnica que embasou a decisão final — não avaliada como candidata concorrente, porque a decisão #17 (A3) já congelou, como premissa arquitetural, que o cenário típico deste projeto é uma empresa do grupo com apenas um usuário financeiro disponível — exatamente o cenário de travamento que essa alternativa reproduziria. Duas assimetrias na comparação entre as duas opções restantes (Reautenticação e Confirmação simples reforçada) foram identificadas em auditoria e corrigidas antes da escolha final — detalhe completo em `decisions.md`, decisão #22.

**Decisão oficial (A8 — congelada)**: **reautenticação (senha)** — no momento da confirmação de uma `AÇÃO_PROPOSTA_IA` de nível Alto, o usuário reinforma sua senha, verificada contra o hash já definido em T3 (Argon2), como controle adicional e independente da sessão em uso (não envolve o token JWT de sessão, que resolve identidade/autorização geral via A4, não esta barreira). Escopo: exclusivamente criação/confirmação de `LIQUIDAÇÃO_FINANCEIRA` e ações equivalentes — `AJUSTE_FINANCEIRO` já está fora do que a IA pode propor (Decisão 8). Não altera nem depende do mecanismo de A4 — é um terceiro controle, adicional aos dois pontos de checagem já definidos. Justificativa completa, incluindo as correções feitas à comparação técnica e a interação com D7, registrada em `decisions.md`, decisão #22.

- **Orquestração do lado do código**: chamar a API do provedor de IA diretamente (via SDK oficial) vs. usar um framework de orquestração de agentes (ex. Claude Agent SDK, LangChain). Para o escopo descrito (ferramentas de consulta bem definidas, sem necessidade de agente autônomo multi-etapas complexo), uma chamada direta ao SDK do provedor com *tool use* tende a ser suficiente e mais simples de auditar — mas isso também é decisão em aberto.

---

## 9. ESTRATÉGIA PARA INTEGRAÇÃO BANCÁRIA FUTURA

O conceitual já garante que qualquer formato de entrada resulta em `MOVIMENTAÇÃO_BANCÁRIA`, sem afetar o resto do modelo (Seção 19 do conceitual). Tecnicamente, isso deve ser modelado como uma **porta única "origem de movimentação bancária"**, com adaptadores intercambiáveis:

| Fase | Adaptador | Observação |
|---|---|---|
| Hoje | Upload manual de arquivo (CSV/OFX exportado do banco) | Cobre a necessidade imediata sem dependência externa |
| Futuro | Open Finance via agregador (ex. Pluggy, Belvo, Quanto — mercado brasileiro) | Terceiriza a conexão com os bancos; custo recorrente por conta conectada |
| Futuro alternativo | Integração direta com API do banco (quando disponível) | Sem intermediário, mas cada banco tem contrato/API própria — maior esforço de manutenção por banco |

**Ponto de atenção técnico**: o formato de entrada (CSV, OFX, JSON de API) nunca deve vazar para o domínio — o adaptador é responsável por normalizar qualquer formato de origem no formato interno de `MOVIMENTAÇÃO_BANCÁRIA` antes de entregar ao caso de uso `importar-extrato`.

---

## 10. ESTRATÉGIA PARA AUDITORIA

**Forma conceitual — resolvida** (`domain-model/24-log-auditoria.md`, Seção 7): `LOG_AUDITORIA` permanece uma única entidade, com referência genérica (`entidade` + `id`), restrita a uma lista fechada de entidades oficialmente auditáveis — nunca uma referência totalmente livre. A referência genérica existe só no nível conceitual e não flexibiliza nenhuma regra de negócio própria de cada mecanismo. Isso elimina, como opção técnica viável, a alternativa de "tabela de log dedicada por entidade" (que exigiria `LOG_AUDITORIA` deixar de ser uma única entidade) — ela é **incompatível** com a decisão já tomada, não apenas menos preferida.

**Técnica de implementação exata — definida (B4, decisão #20)**:

| Opção | Como funciona | Vantagens | Desvantagens |
|---|---|---|---|
| **Referência polimórfica** (`entidade_tipo` + `entidade_id` numa tabela única de log) — **ESCOLHIDA (decisão oficial)** | Uma tabela `LOG_AUDITORIA` genérica referencia qualquer entidade por tipo+id | Consulta "todo histórico de qualquer coisa" fica simples (uma tabela só); adicionar nova entidade auditável não exige nova tabela de log | Sem integridade referencial garantida pelo banco (FK não pode apontar para "tabela variável"); validação de que o `entidade_id` existe fica por conta da aplicação |
| **Event Sourcing** | Auditoria é inerente ao modelo de dados, não uma tabela separada | Rastreabilidade máxima, "de fábrica" | Mudança de paradigma grande para o restante do sistema — desproporcional ao problema descrito no conceitual, que pede um log auditável, não um sistema orientado a eventos. Mantido aqui só por completude; já descartado como candidato real desde a arbitragem técnica |

Duas outras alternativas foram comparadas na resolução de B4, fora desta tabela original: tabela de junção e FKs mutuamente exclusivas — ambas descartadas por exigirem reestruturação do schema físico já implementado e por escalarem mal conforme a lista de entidades auditáveis crescer. Justificativa completa em `decisions.md`, decisão #20.

**Mecanismo de população do log — requisito resolvido pela arbitragem técnica (Divergência 3, mudança obrigatória), mecanismo exato ainda em aberto**: não é mais uma escolha entre "nível de aplicação" ou "nível de banco" tratados como alternativas — a arquitetura exige um mecanismo que seja **ao mesmo tempo automático** (nenhuma escrita relevante passa sem gerar log — elimina o risco de omissão) **e ciente do contexto de negócio** (captura a origem — Manual/Importação/Sugestão de IA Confirmada/Ação de IA Confirmada — informação que só existe no nível de aplicação). Um mecanismo automático aplicado a todo caso de uso de escrita (decorator, wrapper de "unit of work", ou equivalente) que **exija** o contexto de negócio como parâmetro obrigatório de entrada satisfaz as duas propriedades ao mesmo tempo — a dicotomia entre "automático sem contexto" e "manual com contexto" é falsa; triggers de banco puros, sozinhos, não satisfazem o requisito de contexto de negócio e não são suficientes como mecanismo único.

**Decisão oficial (A5 — congelada)**: **aspecto customizado (Spring AOP, `@Around`)** — intercepta a execução de cada caso de uso de escrita, captura o estado do registro antes e depois da operação, e grava a linha correspondente em `LOG_AUDITORIA`, dentro da mesma transação da escrita de negócio; o contexto de execução exigido como parâmetro obrigatório de entrada contempla a totalidade das informações exigidas por `LOG_AUDITORIA` (Seção 2 de `domain-model/24-log-auditoria.md`). Hibernate Envers, JPA Entity Listeners, Spring Data JPA Auditing e Spring Application Events foram analisados e descartados. Compatível com A4, sem alterar nem pressupor seu mecanismo interno. Justificativa completa, incluindo alternativas descartadas e desvantagens aceitas, registrada em `decisions.md`, decisão #18. A técnica física do vínculo genérico de `LOG_AUDITORIA` (`entidade`/`id`) foi resolvida separadamente — ver B4, abaixo.

**[Nota de dependência de implementação — rodada de estabilização arquitetural, Fase 4]** A5 permanece **congelada e inalterada** — esta nota não é uma reabertura da decisão, apenas registra um bloqueio real encontrado ao tentar implementá-la: `LOG_AUDITORIA.usuario_id` é `NOT NULL` sempre que a origem do log é humana (hoje, o único valor alcançável, já que Importação Bancária e IA ainda não existem), e o Aspect não tem como saber "quem" está autenticado sem a cadeia real de T3/A4 (`infrastructure/auth/SecurityConfig.java`, hoje provisória — `permitAll`). Por decisão explícita do usuário nesta rodada, nenhum mecanismo provisório (cabeçalho HTTP, parâmetro explícito de "usuário responsável", usuário técnico placeholder) foi introduzido para contornar essa lacuna. **A implementação de A5 fica adiada até T3/A4 existirem de fato.**

**Decisão oficial (B4 — congelada)**: **referência polimórfica** (`entidade_tipo`/`entidade_id`, e os pares equivalentes `referencia_tipo`/`referencia_id` em `LOG_AUDITORIA` e `entidade_alvo_tipo`/`entidade_alvo_id` em `SUGESTÃO_IA`), sem FK nativa do banco. A integridade referencial é mitigada, não eliminada, pela validação feita na camada de aplicação que grava os registros de auditoria. Em Hibernate/JPA, as colunas são mapeadas como campos simples, não como associação `@Any`/`@ManyToAny` — a resolução do registro real referenciado é feita explicitamente pela aplicação, não pelo ORM. Tabela de junção e FKs mutuamente exclusivas foram analisadas e descartadas. A estratégia definitiva de indexação das colunas de referência genérica permanece subordinada a B3, não resolvida por esta decisão. Justificativa completa, incluindo alternativas descartadas e desvantagens aceitas, registrada em `decisions.md`, decisão #20.

---

## 11. ESTRATÉGIA PARA PERMISSÕES DE USUÁRIOS

O conceitual marca "usuários e níveis de permissão" como pendência de negócio/técnica (pendência 5) e não define papéis. Tecnicamente, o sistema já sugere pelo menos duas dimensões de controle de acesso que vão precisar de modelo de permissão:

1. **Por módulo/ação** — ex.: quem pode registrar uma Liquidação, quem pode só consultar Balanço, quem pode confirmar uma Ação Proposta de IA de nível Alto.
2. **Por empresa** — o grupo tem 6 empresas (H Vieira, Helierti, CV, CD, Camila, Celso); pode ser necessário restringir um usuário a ver/operar só os dados de uma ou algumas empresas.

| Opção | Vantagens | Desvantagens |
|---|---|---|
| **RBAC simples (papéis fixos: Admin, Financeiro, Consulta, etc.)** | Simples de implementar e de explicar a um usuário não-técnico | Menos flexível se no futuro surgirem combinações de permissão muito específicas |
| **RBAC + escopo por empresa** (papel + lista de empresas às quais o usuário tem acesso) | Cobre a necessidade de segregação por empresa do grupo, sem virar um sistema multi-tenant completo | Mais uma dimensão para gerenciar nos cadastros de usuário |
| **ABAC (permissão por atributo/regra dinâmica)** | Máxima flexibilidade | Complexidade desproporcional ao tamanho descrito da operação (uso interno, poucas empresas, poucos usuários) |

**Decisão oficial (A2 — congelada)**: **RBAC + escopo por Empresa** — papel fixo (ex. Admin, Financeiro, Consulta) combinado com escopo sobre uma ou mais Empresas do grupo às quais o usuário tem acesso. ACL por objeto individual também foi analisada e descartada, pelo mesmo motivo já usado para excluí-la de A4 — granularidade por registro individual não corresponde a nenhum requisito documentado. Justificativa completa registrada em `decisions.md`, decisão #16.

**Ponto que precisa de decisão de negócio, não só técnica**: os três níveis de confirmação da IA (Baixo/Médio/Alto, Seção 11 do conceitual) provavelmente devem se cruzar com o modelo de permissão — por exemplo, nem todo usuário com acesso ao Financeiro deveria necessariamente poder confirmar uma Ação de nível Alto. Isso deve ser decidido junto com a pendência 5 do conceitual, antes de desenhar o cadastro de usuários.

**Decisão oficial (A3 — congelada)**: **Papel → nível máximo** — cada papel de usuário autoriza a confirmação até um nível máximo fixo entre os três definidos no conceitual (Baixo, Médio, Alto); nenhuma exigência de segunda confirmação por outro usuário. Justificativa completa registrada em `decisions.md`, decisão #17.

**Mecanismo de checagem — requisito resolvido pela arbitragem técnica (Divergência 4, mudança obrigatória), modelo de permissão por trás ainda em aberto**: a checagem de permissão não pode depender de um único ponto de verificação opcional por caso de uso — precisa ser obrigatória, em **dois pontos distintos**: (i) autorização por ação, num guard de entrada, antes da camada de aplicação — cobre "o usuário pode fazer X?"; (ii) autorização por escopo de dado/Empresa, no ponto em que o registro-alvo é carregado (repositório ou início do caso de uso) — cobre "o usuário pode fazer X *neste* registro, desta Empresa específica?". O primeiro ponto sozinho não é suficiente porque a permissão por escopo de Empresa só pode ser verificada depois que o registro (ou sua referência de Empresa) é carregado. O modelo de permissão por trás (RBAC simples / RBAC + escopo por empresa / ABAC) continua decisão separada e pendente (Seção 15) — a exigência dos dois pontos de checagem vale independentemente de qual modelo for escolhido.

**Decisão oficial (A4 — congelada)**: composição de dois mecanismos — **Spring Security Method Security** (`@PreAuthorize`/`@PostAuthorize`, com `PermissionEvaluator` customizado) para o ponto (i), aplicado no bean de aplicação (caso de uso) que executa cada operação — nunca restrito a um adaptador de entrada específico, cobrindo qualquer ponto de entrada presente ou futuro (controller, scheduler, consumidor de fila, confirmação de Ação de IA); e **Hibernate/JPA Filters** (`@FilterDef`/`@Filter`, não `@TenantId`) para o ponto (ii), parametrizado com o escopo de Empresas permitidas ao usuário. Justificativa completa, incluindo alternativas descartadas, registrada em `decisions.md`, decisão #15.

**Decisão oficial (D7 — congelada)**: o ponto (ii) de A4 dependia de `LANÇAMENTO_FINANCEIRO` ter uma referência de Empresa para o Hibernate/JPA Filter usar — ausente até esta decisão. `LANÇAMENTO_FINANCEIRO` ganha `empresa_id` (FK, `NOT NULL`), obrigatório desde a criação em todos os caminhos (Manual, Cartão via Parcela, Contrato Financeiro via Parcela, Ação de IA Confirmada), com preenchimento e validação de consistência com `VEÍCULO.empresa_id` na camada de aplicação. `AÇÃO_PROPOSTA_IA` ganha `empresa_id` (FK, nullable) e o status "Aguardando Empresa", resolvendo a dependência circular com a checagem de escopo de Empresa quando a IA propõe criar um Lançamento (Achado 5, auditoria sistêmica) — a checagem passa a ocorrer na confirmação, não antes da criação da proposta. Justificativa completa registrada em `decisions.md`, decisão #21.

---

## 12. ESTRATÉGIA PARA TESTES

Pirâmide de testes alinhada à Clean Architecture proposta (Seção 4):

| Camada | O que testa | Exemplos diretos do domínio |
|---|---|---|
| **Unitários (domínio)** | Regras de negócio isoladas, sem banco nem framework | Cálculo de status do Lançamento (Aberto/Parcial/Pago) a partir de Aplicações; validação de que Rateio e atribuição direta são mutuamente exclusivos; Ajuste nunca altera o Lançamento original; `categoria` e `classificação` nunca inferidas uma da outra pela IA |
| **Integração** | Casos de uso completos contra banco real (ou em memória equivalente) | Registrar uma Liquidação gera corretamente Aplicações + dispara (ou concilia) Movimentação Bancária |
| **Aceitação** | Cenários de ponta a ponta, na linguagem do negócio | **Os dois exemplos da Seção 14 do conceitual** (combustível R$5.000 e fatura mista R$30.000) e **a Matriz de Validação A–R (Seção 15 do conceitual)**, formalizados como suíte de testes automatizados — não apenas conferidos manualmente uma vez |
| **Contrato (IA)** | Que cada "ferramenta de consulta" exposta à IA devolve exatamente o formato esperado, e nenhuma delas permite escrita direta em entidade financeira | Testar cada ferramenta do catálogo da Seção 11 do conceitual isoladamente |
| **Fronteira de módulo** | Que Balanço/Obras/Frota não têm, no código, nenhuma dependência de escrita sobre Lançamento, nem leitura direta de Movimentação Bancária | Pode ser validado por teste automatizado de arquitetura (ex. checagem de dependências entre pastas/pacotes), não só por revisão manual |

A escolha de framework de teste específico depende da linguagem definida na Seção 5 (decisão pendente).

---

## 13. ESTRATÉGIA PARA VERSIONAMENTO DO BANCO

- **Migrations incrementais, versionadas em controle de código junto com o código da aplicação** (nunca alteração manual direta em produção) — cada migration corresponde a uma mudança de schema rastreável, idealmente referenciando a decisão de negócio ou pendência do conceitual que a motivou (ex.: uma migration que resolve a pendência 13 — vínculo genérico de auditoria — deve citar isso na descrição).
- **Toda migration deve ser reversível sempre que tecnicamente possível** (ter um caminho de rollback), dado que o sistema lida com dado financeiro.
- **Nenhuma migration deve alterar dado histórico silenciosamente** — coerente com o princípio "nada desaparece" do conceitual; se uma migration precisar migrar dados existentes (ex. ao resolver a pendência 6, separar/unificar Financiamento e Consórcio), isso deve ser uma migration de dados explícita e auditável, não um `UPDATE` solto.
- **Ferramenta específica** depende da escolha de linguagem/ORM (Seção 5.4): Prisma Migrate, TypeORM migrations, Alembic (SQLAlchemy) ou EF Core Migrations são as candidatas naturais para cada stack correspondente — decisão amarrada à da Seção 5, não independente.

---

## 14. ORDEM RECOMENDADA DE IMPLEMENTAÇÃO DOS MÓDULOS

A ordem segue duas restrições do próprio conceitual: (a) auditoria deve existir **desde a primeira versão do schema**, não depois; (b) a ordem de implementação da IA já é sugerida no próprio documento como "leitura → sugestão → ação" (pendência 11 do conceitual, marcada como decisão de produto — aqui adoto essa ordem como recomendação técnica, mas ela também está sujeita à sua aprovação).

1. **Cadastros Base** (Empresa, Conta Bancária, Fornecedor, Cliente, Categoria) — nada mais existe sem isso.
2. **Auditoria (infraestrutura de log)** — implementada em paralelo ao passo 1, para que todo módulo seguinte já nasça auditado, conforme exigido no checklist do conceitual.
3. **Usuários e Permissões (nível básico)** — necessário antes de qualquer tela real de escrita, mesmo que o modelo fino de permissões (Seção 11) evolua depois.
4. **Cadeia financeira central**: Lançamento Financeiro → Liquidação Financeira → Aplicação de Liquidação (com status sempre calculado).
5. **Conciliação Bancária**: Movimentação Bancária, Transferência Interna, Vínculo Conciliação.
6. **Obras e Frota** (cadastro + leitura de custo sobre o Financeiro) e **Rateio de Despesa**.
7. **Ajuste Financeiro** (depende da cadeia central já existir).
8. **Cartão de Crédito** (Cartão, Compra, Parcela, Fatura) — depende de Cadastros Base e da cadeia financeira central para disparar Lançamento.
9. **Financiamentos e Consórcios** (Contrato Financeiro, Parcela) — mesma dependência do passo 8.
10. **Balanço Realizado e Projetado** (camada de leitura/agregação — só faz sentido com a cadeia central e Conciliação já povoadas).
11. **IA — fase leitura**: ferramentas de consulta (catálogo da Seção 11 do conceitual), sem nenhuma capacidade de sugestão/ação ainda.
12. **IA — fase sugestão**: `SUGESTÃO_IA` (classificação/categoria/obra/veículo), com confirmação humana obrigatória.
13. **IA — fase ação**: `AÇÃO_PROPOSTA_IA`, incluindo a barreira reforçada de nível Alto (mecanismo definido na Seção 8 deste documento).
14. **Integração bancária futura (Open Finance ou API de banco)** — só depois do núcleo estar validado em produção com importação manual.

---

## 15. DECISÕES TÉCNICAS QUE PRECISAM DA SUA APROVAÇÃO

Nenhuma delas foi decidida silenciosamente neste documento — todas estão registradas aqui explicitamente para sua decisão antes de qualquer implementação. **Itens já resolvidos pela consolidação do modelo de domínio ou pela arbitragem técnica foram atualizados ou removidos desta lista** (ver notas em cada linha afetada); os demais permanecem exatamente como estavam.

| # | Decisão | Opções apresentadas | Onde está discutida |
|---|---|---|---|
| 3 | Framework de frontend | React (Next.js) / Vue 3 / Angular | Seção 5.2 |
| 5 | ORM / camada de acesso a dados | **Já definido como Hibernate/JPA (Spring Data JPA), decorrente da escolha de T1** — resta, só se houver necessidade real, o detalhe de estratégia de uso (ver `pendencias.md`, item B2) | Seção 5.4 |
| 9 | Orquestração da IA | Chamada direta ao SDK do provedor / Framework de orquestração de agentes | Seção 8 |
| 10 | Provedor de IA específico | Não avaliado aqui — o conceitual (Seção 19) já deixa isso propositalmente em aberto como "modelo de mercado via API" | Seção 8 |
| 11 | Momento e provedor de integração bancária futura (Open Finance) | Upload manual (já cobre hoje) / Agregador Open Finance / API direta do banco | Seção 9 |
| 16 | Ordem de implementação da IA (leitura → sugestão → ação) | Adotada como recomendação técnica neste documento, mas está listada como pendência de produto no conceitual (pendência 11) — precisa de confirmação explícita, não só herdar a recomendação | Seção 14 |

**Itens removidos desta lista por já estarem resolvidos**:
- "Estratégia de cálculo do status do `LANÇAMENTO_FINANCEIRO`" — decidido (`domain-model/09-lancamento-financeiro.md`): `situação_administrativa` (persistida) e `status_financeiro` (sempre calculado, nunca armazenado) são dimensões independentes. Refletido na estrutura de pastas (Seção 6).
- "Linguagem/framework de backend" (item 2 original) — decidido: Java 21 LTS + Spring Boot, Maven, Hibernate/JPA (ver Seção 5.1 e `decisions.md`, decisão #12).
- "Banco de dados físico" (item 4 original) — decidido: PostgreSQL (ver `arquitetura-fisica-banco.md`, Seção 1, e `pendencias.md`, item B1).
- "Estilo de arquitetura de software" (item 1 original) — decidido: Clean Architecture, com o vocabulário de Ports & Adapters (Hexagonal) tratado como a mesma alternativa arquitetural (ver Seção 4 e `decisions.md`, decisão #13).
- "Estratégia de autenticação" (item 6 original) — decidido: autenticação própria, Spring Security + JWT, hash de senha com Argon2 (bcrypt só como alternativa documentada) — nenhum provedor externo (ver Seção 5.5 e `decisions.md`, decisão #14).
- "Modelo de permissões de usuário" (item 14 original) — decidido: RBAC + escopo por Empresa (ver Seção 11 e `decisions.md`, decisão #16).
- "Cruzamento entre papel de usuário e níveis de confirmação da IA" (item 15 original) — decidido: Papel → nível máximo (ver Seção 11 e `decisions.md`, decisão #17).
- "Mecanismo técnico exato que popula o log de auditoria" (item 13 original) — decidido: aspecto customizado (Spring AOP, `@Around`) (ver Seção 10 e `decisions.md`, decisão #18).
- "Implementação técnica do vínculo genérico de auditoria" (item 12 original) — decidido: referência polimórfica (`entidade_tipo`/`entidade_id`), sem FK nativa do banco (ver Seção 10 e `decisions.md`, decisão #20).
- "Mecanismo exato da barreira 'Alto' da IA" (item 8, pendência 12 do conceitual/A8) — decidido: reautenticação (senha) no momento da confirmação, verificada contra o hash já definido em T3 — "Segundo aprovador" excluído da comparação técnica (premissa de A3), "Confirmação simples reforçada" descartada por não oferecer verificação adicional de identidade (ver Seção 8 e `decisions.md`, decisão #22).
- "Hospedagem/infraestrutura" (item 7 original, T4) — decidido em nível arquitetural: implantação inicial prioriza plataforma PaaS gerenciada, sem provedor específico escolhido; migração para infraestrutura maior condicionada a necessidade real (ver Seção 5.6 e `decisions.md`, decisão #38).

**Itens de melhoria futura, registrados pela arbitragem técnica, ainda não decididos** (não bloqueiam implementação nesta fase): delimitar por escrito onde termina o vocabulário "Clean Architecture" e onde começa "porta/adaptador"; documentar, no plano de testes, o que cada camada de teste afirma para cenários compartilhados entre integração e aceitação; adicionar ferramenta de análise de dependência arquitetural à lista de decisões de stack quando a stack for escolhida; ao planejar a resolução de cada pendência de negócio do conceitual, classificá-la como comportamental ou estrutural antes de estimar esforço; priorizar estratégia de índice logo no início da Fase 3 (modelagem do banco), não adiar indefinidamente dentro dela.

**Nenhuma implementação começa antes de eu receber suas respostas para os itens acima** (ou a indicação de quais você quer decidir agora e quais prefere adiar, respeitando a mesma lógica do documento conceitual: pendência não-bloqueante pode ficar registrada e revisitada antes da etapa específica que dependa dela).

---

## 16. NOTA SOBRE MATERIAL AUSENTE

O checklist de migração do documento conceitual (Seção 18, item "Leitura obrigatória") cita `H_VIEIRA_Relatorio_Engenharia_Reversa_Financeiro.md` como leitura de contexto de negócio complementar. Esse arquivo **não está presente** na pasta `docs/` atual — só `H_VIEIRA_Arquitetura_Definitiva.md` foi encontrado. Isso não é uma inconsistência conceitual (o próprio documento diz que essa leitura é só contexto histórico, não fonte de decisão), então não bloqueei a produção deste documento por causa disso — mas registro aqui para o caso de você querer disponibilizá-lo antes da implementação.
