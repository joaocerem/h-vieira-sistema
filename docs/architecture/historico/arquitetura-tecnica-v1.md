> **Documento histórico — preservado sem alteração.** Esta é a versão original de `arquitetura-tecnica.md`, anterior à consolidação com `arbitragem-tecnica-final.md`. Não é mais a fonte corrente — consulte `architecture/arquitetura-tecnica.md` para a versão consolidada e vigente. Mantido aqui só como registro histórico de como o documento evoluiu.

---

# Arquitetura_Tecnica.md
## Arquitetura Técnica — Sistema Financeiro/Gerencial H Vieira Terraplanagem

**Fonte de verdade conceitual**: `H_VIEIRA_Arquitetura_Definitiva.md`. Este documento **não altera nenhuma regra de negócio, entidade ou relacionamento** definido lá — ele traduz esse modelo em decisões de engenharia. Onde este documento e o conceitual divergirem em algo que **não seja** puramente técnico (linguagem, framework, banco físico, infra, UX), o conceitual prevalece e este documento está errado.

**Natureza deste documento**: nenhuma linha de código, schema, SQL, classe ou endpoint foi criada. Onde existe mais de uma opção tecnicamente válida, as opções são apresentadas com vantagens/desvantagens e a decisão fica em aberto para você (Seção 15 consolida todas).

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

### Recomendação

**Clean Architecture com fronteiras internas explícitas por módulo, usando o vocabulário de Ports & Adapters especificamente para os pontos que o documento conceitual já trata como fronteira controlada** (ferramentas de consulta da IA, importação de extrato bancário, e — futuramente — o provedor de IA e o provedor de Open Finance).

**Por quê**: os quatro princípios do domínio listados no início da Seção 1 deste documento (fonte única da verdade, nada é apagado, indicador sempre calculado, IA nunca escreve direto) são, estruturalmente, **regras de domínio que precisam sobreviver a qualquer troca de banco, framework ou provedor de IA**. Colocar essas regras no centro da arquitetura (não em controllers, não em triggers de banco) é a única opção das quatro que torna essas regras difíceis de violar por acidente — e não apenas "proibidas por convenção".

Isso é uma recomendação, não uma decisão tomada — está listada na Seção 15 para sua aprovação, porque é a decisão que mais influencia a estrutura de pastas (Seção 6) e o ritmo de implementação.

---

## 5. STACK TECNOLÓGICA

O documento conceitual (Seção 19) deixa deliberadamente em aberto: linguagem, framework, ORM, banco físico, infraestrutura, provedor de IA e formato de importação bancária. Nenhuma dessas escolhas muda o modelo de negócio — mas todas precisam de decisão explícita seguindo a mesma regra que já vinha sendo aplicada na etapa conceitual: **quando há mais de uma opção válida, apresento vantagens/desvantagens e peço sua decisão.**

### 5.1 Backend

| Opção | Vantagens | Desvantagens |
|---|---|---|
| **Node.js + TypeScript (NestJS)** | Tipagem estática ajuda muito num domínio com tantas entidades relacionadas; NestJS já organiza código em módulos com fronteiras explícitas (favorece a Seção 4); mesmo ecossistema de tipos pode ser reaproveitado no frontend; grande disponibilidade de SDKs para provedores de IA | Ecossistema mais "opinativo por convenção" que por imposição — decoradores do NestJS escondem parte da estrutura Clean Architecture se não houver disciplina |
| **Python (FastAPI)** | Ecossistema de IA/dados é o mais maduro (útil se o "adaptador de IA" ou análises futuras crescerem); tipagem gradual (type hints) ajuda, mas é opcional, então exige mais disciplina; FastAPI é leve e rápido de escrever | Tipagem não é imposta pela linguagem — mais fácil "escapar" das fronteiras de módulo sem ferramentas extras (mypy estrito); menos natural para uma estrutura de camadas rígida sem convenção manual |
| **.NET (C# + ASP.NET Core)** | Tipagem forte e madura; muito usado em sistemas financeiros corporativos; Entity Framework Core tem excelente suporte a migrations versionadas (Seção 13); bom encaixe natural com Clean Architecture (é quase o exemplo de livro-texto da comunidade .NET) | Ecossistema de IA (SDKs, exemplos, comunidade) é mais restrito que Node/Python; ambiente de desenvolvimento mais pesado |

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

| Opção | Vantagens | Desvantagens |
|---|---|---|
| **Prisma (Node/TS)** | Migrations versionadas muito claras, tipagem gerada automaticamente | Menos flexível para queries agregadas muito complexas (Balanço/custo de Obra podem precisar de SQL cru mesmo assim) |
| **TypeORM (Node/TS)** | Mais flexível, suporta padrão Repository nativamente (bom encaixe com Clean Architecture/Hexagonal) | Migrations historicamente menos confiáveis que Prisma |
| **SQLAlchemy (Python)** | Muito maduro, controle fino sobre queries agregadas | Curva de aprendizado maior, verboso |
| **Entity Framework Core (.NET)** | Excelente suporte a migrations e integridade referencial | Só faz sentido se a stack for .NET |

*(a escolha de ORM depende diretamente da escolha de linguagem/backend acima — não é uma decisão independente)*

### 5.5 Autenticação e autorização

| Opção | Vantagens | Desvantagens |
|---|---|---|
| **Autenticação própria (usuário/senha + JWT, hash de senha com bcrypt/argon2)** | Controle total, sem dependência externa, sem custo recorrente, adequado a um número pequeno e fechado de usuários internos (6 empresas do grupo, não um público externo) | Responsabilidade de segurança (armazenamento de senha, recuperação de conta, expiração de sessão) fica inteiramente com a equipe |
| **Provedor externo (ex. Auth0, Clerk, Keycloak auto-hospedado)** | Terceiriza gestão de senha, 2FA pronto, telas de login prontas | Custo recorrente (nos SaaS) ou esforço de hospedar (Keycloak); overhead desnecessário para uma base pequena e interna de usuários |

**Observação**: como o sistema é interno (não tem cadastro público de usuários), uma solução própria simples com JWT tende a ser suficiente e evita dependência externa para dados financeiros sensíveis — mas fica como decisão pendente, não escolha feita.

### 5.6 Hospedagem / infraestrutura

Fora do escopo definir agora em detalhe (o conceitual já marca isso como decisão futura, Seção 19), mas a escolha de banco/backend acima deve ser compatível com hospedagem de baixo custo operacional (VPS simples, ou serviços gerenciados tipo Railway/Render/Azure/AWS RDS) — a decidir junto com a stack.

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
    /ia                     → contratos de "ferramenta de consulta", Sugestão/Ação (estado, não execução)
    /auditoria

  /application                → casos de uso (orquestram entidades de domínio)
    /financeiro
      registrar-lancamento.*
      registrar-liquidacao.*
      calcular-status-lancamento.*
    /conciliacao
      importar-extrato.*
      vincular-movimentacao.*
    /cartao
      registrar-compra.*
      fechar-fatura.*
    /obra
      calcular-custo-obra.*
    /ia
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
- **Barreira de confirmação Alto**: o mecanismo exato é pendência técnica explícita no conceitual (pendência 12). Opções a decidir:

| Opção | Vantagens | Desvantagens |
|---|---|---|
| Reautenticação (senha/2FA no momento da confirmação) | Simples de implementar, familiar ao usuário | Fricção a cada ação sensível |
| Segundo aprovador (usuário diferente do que originou a conversa com a IA) | Barreira mais forte, reduz erro de um único operador | Exige mais de um usuário ativo no sistema — pode não ser viável no dia a dia de uma operação pequena |
| Confirmação simples reforçada (tela de revisão explícita dos dados antes de gravar, sem segundo fator) | Já cobre a exigência mínima do conceitual (regra 27/28: nunca executa sem confirmação explícita) | Mais fraca que as duas opções acima como "barreira" |

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

O conceitual exige granularidade por campo desde a primeira versão do schema (não como melhoria futura) e deixa em aberto o mecanismo do vínculo genérico com "qualquer entidade financeira" (pendência 13 do conceitual). Opções técnicas:

| Opção | Como funciona | Vantagens | Desvantagens |
|---|---|---|---|
| **Referência polimórfica** (`entidade_tipo` + `entidade_id` numa tabela única de log) | Uma tabela `LOG_AUDITORIA` genérica referencia qualquer entidade por tipo+id | Consulta "todo histórico de qualquer coisa" fica simples (uma tabela só); adicionar nova entidade auditável não exige nova tabela de log | Sem integridade referencial garantida pelo banco (FK não pode apontar para "tabela variável"); validação de que o `entidade_id` existe fica por conta da aplicação |
| **Tabela de log dedicada por entidade** | `LOG_LANCAMENTO`, `LOG_LIQUIDACAO`, etc., cada uma com FK real para sua entidade | Integridade referencial garantida pelo banco | Multiplica tabelas; consulta "todo histórico" exige unir várias tabelas; toda nova entidade auditável exige nova tabela |
| **Event Sourcing** (o estado de cada entidade é reconstruído a partir de uma sequência de eventos, e o log é o próprio armazenamento primário) | Auditoria é inerente ao modelo de dados, não uma tabela separada | Rastreabilidade máxima, "de fábrica" | Mudança de paradigma grande para o restante do sistema (todas as entidades passariam a ser reconstituídas por eventos, não CRUD direto) — desproporcional ao problema descrito no conceitual, que pede um log auditável, não um sistema orientado a eventos |

**Como o log é populado** — também decisão aberta:

| Opção | Vantagens | Desvantagens |
|---|---|---|
| Nível de aplicação (a própria camada de aplicação grava o log ao processar o caso de uso) | Total controle sobre o que é registrado, inclusive contexto de negócio (qual Sugestão/Ação de IA originou) | Só funciona se toda escrita passar pela aplicação — nunca por acesso direto ao banco |
| Nível de banco (triggers) | Captura qualquer escrita, mesmo fora da aplicação | Mais difícil de enriquecer com contexto de negócio (ex. "essa alteração veio de uma Sugestão de IA confirmada") |

Recomendação de leitura, não decisão: dado que o conceitual já exige registrar a **origem** (Manual/Importação/Sugestão de IA Confirmada/Ação de IA Confirmada) — informação que só existe no nível de aplicação, não no banco — o log de aplicação tende a ser o único capaz de cumprir esse requisito específico por si só; triggers de banco poderiam complementar como camada de segurança adicional. Fica como decisão pendente (Seção 15).

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

**Ponto que precisa de decisão de negócio, não só técnica**: os três níveis de confirmação da IA (Baixo/Médio/Alto, Seção 11 do conceitual) provavelmente devem se cruzar com o modelo de permissão — por exemplo, nem todo usuário com acesso ao Financeiro deveria necessariamente poder confirmar uma Ação de nível Alto. Isso deve ser decidido junto com a pendência 5 do conceitual, antes de desenhar o cadastro de usuários.

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

Nenhuma delas foi decidida silenciosamente neste documento — todas estão registradas aqui explicitamente para sua decisão antes de qualquer implementação.

| # | Decisão | Opções apresentadas | Onde está discutida |
|---|---|---|---|
| 1 | Estilo de arquitetura de software | MVC simples / Camadas (N-tier) / Clean Architecture / Hexagonal | Seção 4 |
| 2 | Linguagem/framework de backend | Node.js+TypeScript (NestJS) / Python (FastAPI) / .NET (C#) | Seção 5.1 |
| 3 | Framework de frontend | React (Next.js) / Vue 3 / Angular | Seção 5.2 |
| 4 | Banco de dados físico | PostgreSQL / MySQL-MariaDB / SQL Server | Seção 5.3 |
| 5 | ORM / camada de acesso a dados | Depende da decisão #2 (Prisma/TypeORM, SQLAlchemy, EF Core) | Seção 5.4 |
| 6 | Estratégia de autenticação | Autenticação própria (JWT) / Provedor externo (Auth0, Clerk, Keycloak) | Seção 5.5 |
| 7 | Hospedagem/infraestrutura | Em aberto, amarrada à decisão #2/#4 | Seção 5.6 |
| 8 | Mecanismo exato da barreira "Alto" da IA (pendência 12 do conceitual) | Reautenticação / Segundo aprovador / Confirmação simples reforçada | Seção 8 |
| 9 | Orquestração da IA | Chamada direta ao SDK do provedor / Framework de orquestração de agentes | Seção 8 |
| 10 | Provedor de IA específico | Não avaliado aqui — o conceitual (Seção 19) já deixa isso propositalmente em aberto como "modelo de mercado via API" | Seção 8 |
| 11 | Momento e provedor de integração bancária futura (Open Finance) | Upload manual (já cobre hoje) / Agregador Open Finance / API direta do banco | Seção 9 |
| 12 | Implementação do vínculo genérico de auditoria (pendência 13 do conceitual) | Referência polimórfica / Tabela dedicada por entidade / Event Sourcing | Seção 10 |
| 13 | Camada que popula o log de auditoria | Nível de aplicação / Nível de banco (triggers) / ambos | Seção 10 |
| 14 | Modelo de permissões de usuário (pendência 5 do conceitual) | RBAC simples / RBAC + escopo por empresa / ABAC | Seção 11 |
| 15 | Cruzamento entre papel de usuário e níveis de confirmação da IA | Não avaliado em detalhe — depende da decisão #14 e é também decisão de negócio | Seção 11 |
| 16 | Ordem de implementação da IA (leitura → sugestão → ação) | Adotada como recomendação técnica neste documento, mas está listada como pendência de produto no conceitual (pendência 11) — precisa de confirmação explícita, não só herdar a recomendação | Seção 14 |

**Nenhuma implementação começa antes de eu receber suas respostas para os itens acima** (ou a indicação de quais você quer decidir agora e quais prefere adiar, respeitando a mesma lógica do documento conceitual: pendência não-bloqueante pode ficar registrada e revisitada antes da etapa específica que dependa dela).

---

## 16. NOTA SOBRE MATERIAL AUSENTE

O checklist de migração do documento conceitual (Seção 18, item "Leitura obrigatória") cita `H_VIEIRA_Relatorio_Engenharia_Reversa_Financeiro.md` como leitura de contexto de negócio complementar. Esse arquivo **não está presente** na pasta `docs/` atual — só `H_VIEIRA_Arquitetura_Definitiva.md` foi encontrado. Isso não é uma inconsistência conceitual (o próprio documento diz que essa leitura é só contexto histórico, não fonte de decisão), então não bloqueei a produção deste documento por causa disso — mas registro aqui para o caso de você querer disponibilizá-lo antes da implementação.
