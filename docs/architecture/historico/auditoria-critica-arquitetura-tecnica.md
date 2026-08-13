# Auditoria Crítica — Arquitetura Técnica
## Sistema Financeiro/Gerencial H Vieira Terraplanagem

**Objeto desta auditoria**: `docs/architecture/arquitetura-tecnica.md` (a partir de agora "o documento técnico").
**Referência de validação**: `docs/architecture/arquitetura-conceitual.md` ("o conceitual") — toda crítica aqui é medida contra o que o conceitual **de fato exige**, não contra preferência pessoal de estilo.
**Papel assumido**: arquiteto de software independente, tentando encontrar onde a arquitetura técnica quebra, exagera ou se contradiz — não tentando confirmá-la.

**O que este documento NÃO faz**: não corrige o documento técnico, não escolhe tecnologia, não resolve as 16 decisões já listadas na Seção 15 dele, não avança para banco de dados ou código. Só a Seção 6 abaixo lista o que é **realmente bloqueante**; tudo o mais é achado para sua avaliação.

---

## 1. MÉTODO

Para cada trecho do documento técnico, perguntei: *"Isso é exigido pelo conceitual, ou é uma preferência de engenharia adicionada por cima?"* Sempre que a resposta foi "adicionado por cima", perguntei em seguida: *"O benefício declarado (testabilidade, substituibilidade, auditoria) se paga no tamanho real deste sistema, ou existe uma forma mais simples de obter a mesma garantia?"*

Achado importante logo de saída: **o próprio conceitual, na Seção 19, diz explicitamente que estilo de arquitetura, linguagem, framework e ORM "não mudam o modelo de negócio" e ficam livres para a etapa técnica.** Ou seja, a escolha por Clean Architecture/Hexagonal no documento técnico não é uma exigência do conceitual — é 100% uma decisão de engenharia, e por isso está sujeita a esta crítica com o mesmo rigor que se aplicaria a qualquer outra escolha de stack.

---

## 2. OVERENGINEERING — RESPOSTA DIRETA À PERGUNTA CENTRAL

**Existe uma parte desenhada para um sistema muito maior do que este precisa? Sim: a aplicação uniforme de Clean Architecture + Ports & Adapters a 100% dos módulos, inclusive aos mais simples.**

O documento técnico (Seção 4, linha 156) justifica a escolha dizendo que "essas regras precisam sobreviver a qualquer troca de banco, framework ou provedor de IA". Isso é verdade **apenas para dois pontos que o próprio conceitual explicitamente marca como variáveis no tempo**:

1. O provedor de IA (conceitual, Seção 19: "Provedor de IA específico... decisão futura").
2. A origem da Movimentação Bancária (conceitual, Seção 19: "Formato e frequência de importação de extrato bancário... quando essa integração futura for implementada").

Fora esses dois pontos (e, por extensão razoável, o mecanismo de autenticação/permissão, ainda indefinido — pendência 5 do conceitual), **nada no conceitual indica que o banco de dados, o framework web, ou a forma como Obra/Frota/Rateio/Ajuste são implementados vá mudar**. Não há, em nenhuma das 19 seções do conceitual, um caso de uso que preveja trocar de banco relacional, trocar de linguagem, ou modularizar um serviço à parte. A justificativa de "substituibilidade" foi generalizada para o sistema inteiro a partir de uma necessidade real que existe em só ~2 pontos dele.

**Consequência prática do exagero**: no desenho atual (documento técnico, Seção 6), até um cadastro simples como `Fornecedor`, `Categoria` ou `Cliente` — que é puro CRUD, sem regra de negócio além de "nome único" — precisaria atravessar `interfaces/http` → `application` (caso de uso) → `domain` (entidade) → `infrastructure/database` (porta + adapter) para qualquer operação. Isso é ao menos 4 arquivos/camadas para inserir um nome numa lista. O ganho de "trocar o banco sem tocar o domínio" não se paga para uma entidade que não tem regra de negócio nenhuma para proteger.

**Alternativa mais simples, preservando as mesmas regras de negócio**: aplicar a formalização de portas/adaptadores **só** onde o conceitual de fato pede substituibilidade — provedor de IA, origem de extrato bancário, e (se necessário) mecanismo de autenticação — e usar uma estrutura mais simples (camadas leves: rotas → serviços de aplicação com a regra de negócio → repositórios, sem a cerimônia formal de "portas" para cada dependência) no restante do sistema, especialmente nos módulos de cadastro e nos módulos estritamente de leitura (Obra, Frota, Balanço). Isso é chamado às vezes de **"hexagonal seletivo"**: hexagonal só nas fronteiras que o próprio negócio identificou como instáveis, monólito modular simples em tudo o mais. Nenhuma regra de negócio do conceitual muda com essa simplificação — só a quantidade de estrutura em volta dela.

---

## 3. INCONSISTÊNCIAS INTERNAS E DECISÕES QUE SE CONTRADIZEM

### 3.1 O documento técnico se autodeclara "nada decidido silenciosamente" — mas decide algo silenciosamente

O cabeçalho do documento técnico (linha 6) afirma: *"Onde existe mais de uma opção tecnicamente válida, as opções são apresentadas... e a decisão fica em aberto."* Mas a Seção 6 (estrutura de pastas, linha 243) já inclui um caso de uso chamado `calcular-status-lancamento.*` dentro de `application/financeiro`.

Isso **pressupõe** uma das opções que o próprio conceitual deixa em aberto (Seção 19: *"Estratégia de cálculo do status de LANÇAMENTO_FINANCEIRO — campo persistido recalculado a cada escrita, view, ou cálculo em tempo real na consulta"*). Nomear um caso de uso "calcular e gravar o status" sugere a opção "campo recalculado a cada escrita" — e silenciosamente descarta as opções "view" e "cálculo em tempo real na consulta", sem listar isso como decisão pendente em nenhum lugar da Seção 15. Isso é exatamente o tipo de escolha que o documento prometeu não fazer sem sinalizar.

**Por que importa**: é a regra mais citada do conceitual (Seção 2 inteira gira em torno disso) — um vazamento de decisão aqui não é cosmético.

### 3.2 Quem escreve `LIQUIDAÇÃO_FINANCEIRA` ao fechar uma Fatura — Cartão ou Financeiro?

O conceitual (Seção 13, tabela "Responsabilidade dos módulos") diz explicitamente: **"só Financeiro e Cartões escrevem em `LANÇAMENTO_FINANCEIRO`"** — e na mesma tabela, a linha "Cartões" lista como escrita apenas `COMPRA_CARTÃO`, `PARCELA`, `FATURA` (e o disparo de Lançamento). `LIQUIDAÇÃO_FINANCEIRA` não aparece como algo que o módulo Cartões escreve.

Só que o próprio conceitual (Seção 7) diz: *"Quando a Fatura é paga, nasce uma LIQUIDAÇÃO_FINANCEIRA pelo valor total cobrado"* — e não diz quem a cria.

O documento técnico (Seção 6, linha 249) resolve essa lacuna **silenciosamente**, colocando `fechar-fatura.*` dentro de `application/cartao` — o que, na prática, insinua que o módulo Cartão é quem cria a Liquidação da fatura, contradizendo a leitura mais direta da tabela de responsabilidades do conceitual (onde só Financeiro escreve `LIQUIDAÇÃO_FINANCEIRA`).

**Isto é uma ambiguidade que já existia no conceitual**, mas o documento técnico não a registrou como tal — ele a resolveu de fato ao posicionar o caso de uso numa pasta específica, sem declarar que fez essa escolha. Um segundo engenheiro lendo só a Seção 6 implementaria "Cartão cria Liquidação"; um terceiro lendo só a Seção 13 do conceitual implementaria "só Financeiro cria Liquidação, Cartão pede para o Financeiro criar". São dois desenhos de módulo diferentes.

### 3.3 Vocabulário duplo (Clean Architecture + Hexagonal) usado ao mesmo tempo

A Seção 4 do documento técnico primeiro compara Clean Architecture e Hexagonal como duas opções concorrentes na mesma tabela (linha 150, e a própria tabela admite: *"a diferença entre as duas na prática é mais de vocabulário/ênfase que de resultado final"*) — e depois a Recomendação (linha 154) escolhe as duas ao mesmo tempo: *"Clean Architecture... usando o vocabulário de Ports & Adapters"*.

Isso não é tecnicamente incorreto (as duas escolas realmente se sobrepõem), mas é uma fonte real de ambiguidade de implementação: a Seção 6 chama as pastas de infraestrutura de "adaptadores" (vocabulário Hexagonal) mas organiza tudo em camadas concêntricas domain→application→infrastructure→interfaces (vocabulário Clean Architecture clássico), sem nunca definir se **todo** ponto de infraestrutura deve ter uma "porta" formal (interface no domínio) ou só os pontos citados na Seção 8/9. Um time de implementação vai divergir sobre isso sem uma definição explícita.

---

## 4. PROBLEMAS COM CONCERNS TRANSVERSAIS (AUDITORIA E PERMISSÕES)

Este é, na minha avaliação, **o achado mais sério da auditoria** — mais sério que o overengineering geral, porque toca uma regra de negócio inegociável.

O documento técnico (Seção 3, linhas 118-123) descreve Auditoria e Permissões como **"cross-cutting"**, e a Seção 6 (linhas 236-237, 256-257) as modela como **módulos comuns** dentro de `domain/auditoria` e `application/auditoria/registrar-log.*`, chamados explicitamente por quem precisar (a mesma lógica vale, implicitamente, para `infrastructure/auth`).

**O problema**: concerns verdadeiramente transversais (auditoria, autorização) não deveriam depender de que cada caso de uso, no futuro, **se lembre de chamar** `registrar-log.*` ou a checagem de permissão. Modelá-los como "mais um módulo que os outros chamam" é uma escolha estrutural que **permite** que uma implementação futura esqueça de auditar uma escrita, ou esqueça de checar uma permissão num caso de uso novo — e nada na arquitetura descrita impede isso de acontecer silenciosamente.

Isso conflita diretamente com:
- Conceitual, princípio 10: *"Toda alteração relevante é auditável por campo"* — "toda" é uma palavra absoluta, e uma dependência de chamada manual não garante "toda".
- Conceitual, regra 31: *"Toda alteração relevante é registrada em LOG_AUDITORIA"*.
- Project-rules.md do próprio repositório: *"Nunca remover auditoria."* — um esquecimento equivale, na prática, a uma remoção pontual, mesmo sem intenção.

O documento técnico até reconhece o risco parcialmente na Seção 12 (linha 370), propondo um "teste de fronteira de módulo" — mas isso testa que módulos de leitura não escrevem em Lançamento, **não** testa que toda escrita gera log/checagem de permissão. Não há, em nenhuma seção, um mecanismo (interceptador, middleware, decorator, ou qualquer coisa equivalente) que torne auditoria e autorização **automáticas e não-opcionais** para qualquer novo caso de uso de escrita.

**Alternativa a considerar (não é decisão, é algo a avaliar)**: concerns verdadeiramente transversais costumam ser resolvidos por um mecanismo que **envolve** todos os casos de uso de escrita automaticamente (nomes comuns: middleware, decorator, interceptor, "unit of work" com hook de auditoria) — de forma que esquecer de chamar auditoria/permissão deixe de ser fisicamente possível, em vez de depender de disciplina do time. Qual mecanismo exato usar é uma decisão técnica (depende da stack, ainda não escolhida) — mas **que exista algum mecanismo assim, em vez de chamada manual módulo-a-módulo, é uma decisão que precisa ser tomada antes de implementar o primeiro módulo de escrita**, porque muda a forma como todo caso de uso subsequente é escrito. Ver Seção 6 deste documento.

---

## 5. RISCO DE DUPLICAÇÃO DE LÓGICA DE CONSULTA (AMEAÇA À FONTE ÚNICA DA VERDADE)

O conceitual é enfático: *"Registrar o fato uma vez, analisar de várias formas... nenhum [módulo] mantém cópia própria"* (princípio 1). Isso é sobre **dado**, e o documento técnico respeita isso na escrita (só Financeiro/Cartões escrevem Lançamento).

Mas o mesmo princípio tem uma face que o documento técnico não cobre: **lógica de leitura/agregação repetida em vários lugares é uma forma equivalente de duplicação**, mesmo sem duplicar a tabela. E o desenho atual tem pelo menos três consumidores independentes que precisam, cada um, saber exatamente as mesmas regras de filtragem sobre `LANÇAMENTO_FINANCEIRO` (por exemplo: excluir status Cancelado, aplicar Ajustes vinculados, respeitar a regra 22 do conceitual de que só Terraplanagem entra em consultas de gasto por fornecedor):

- **Balanço** (Seção 6, sem pasta própria explícita — "consulta sobre Lançamento").
- **Obra** (`application/obra/calcular-custo-obra.*`).
- **Frota** (mencionado no texto, sem caso de uso equivalente sequer listado na Seção 6 — outra lacuna, ver 5.1 abaixo).
- **IA**, via `executar-ferramenta-consulta.*` — cujo catálogo (custo de obra, custo de veículo, ranking de fornecedores etc.) é **quase idêntico** ao que Balanço/Obra/Frota já precisam calcular.

O documento técnico nunca declara se as "ferramentas de consulta" da IA **reaproveitam** os mesmos casos de uso de leitura que alimentam as telas de Balanço/Obra/Frota, ou se são implementadas paralelamente. Se forem paralelas (o que a estrutura da Seção 6 sugere, ao colocá-las em `application/ia` em vez de reaproveitar `application/obra`, `application/financeiro` etc.), **a regra de negócio "custo de obra" existiria em dois lugares de código independentes** — e o dia em que um deles for corrigido (ex.: um ajuste na regra de Ajuste Financeiro, ou na exclusão de Cancelados) sem o outro, o sistema literalmente responde valores diferentes para a mesma pergunta feita por tela ou por IA. Isso é uma violação de fato da fonte única da verdade, mesmo com o dado fisicamente armazenado uma única vez — porque a "verdade" de um indicador calculado é tão única quanto a lógica que o calcula.

### 5.1 Lacuna: Frota não tem caso de uso listado

Como nota lateral: a Seção 6 lista `calcular-custo-obra.*` em `application/obra`, mas não lista o equivalente para Frota (`calcular-custo-veiculo.*` ou similar) em nenhum lugar — apesar de Frota ser módulo de primeira classe na Seção 2 e na Seção 3. É uma omissão simples, mas é sintoma do mesmo problema: sem uma camada de leitura compartilhada explícita, cada consumidor tende a ser tratado ad-hoc.

---

## 6. TESTABILIDADE

- **Ambiguidade de camada para as mesmas regras**: se "status calculado" e "rateio mutuamente exclusivo com atribuição direta" são regras de domínio (deveriam viver como invariante da entidade `LANÇAMENTO_FINANCEIRO`) ou regras de caso de uso (application), o documento técnico não decide — a Seção 12 lista "cálculo de status" e "rateio mutuamente exclusivo" como exemplos de teste **unitário de domínio**, mas a Seção 6 já colocou `calcular-status-lancamento.*` em `application`, não em `domain`. Se a regra mora na aplicação mas é testada como se fosse pura de domínio, os testes vão precisar simular a camada de aplicação inteira para testar uma regra que deveria ser isolável em uma entidade — o que é exatamente o tipo de fricção que a Clean Architecture promete evitar, e aqui não está evitando por causa da ambiguidade de onde a regra realmente mora.
- **Sobreposição entre "teste de aceitação" e "teste de integração"**: a Matriz A–R e os dois exemplos da Seção 14 do conceitual (citados na Seção 12 do técnico como testes de aceitação) já cobrem, na prática, o mesmo caminho que os testes de integração descritos logo acima na mesma tabela ("registrar uma Liquidação gera corretamente Aplicações..."). Não há critério declarado de onde termina um e começa o outro — risco de a suíte de testes crescer com duplicação de cenários em duas camadas nominalmente diferentes, sem ganho real de cobertura.
- **Teste de "fronteira de módulo"** (Seção 12, linha 370) é uma boa ideia, mas exige uma ferramenta de análise de dependência entre pastas/pacotes que **não foi listada em nenhuma decisão de stack** (Seção 5) nem contabilizada como esforço — está mencionada como se fosse gratuita, mas normalmente exige uma ferramenta adicional (ex.: linter de arquitetura) escolhida e configurada à parte.

---

## 7. MANUTENÇÃO

- **Multiplicação de pontos de alteração para mudanças simples**: no desenho de 4 camadas aplicado uniformemente (Seção 6), adicionar um campo novo a uma entidade já estável (ex. um campo novo em `OBRA`, que o conceitual já descreve com um conjunto fechado de campos) provavelmente toca: entidade de domínio, DTO/mapeamento de aplicação, mapeamento do adaptador de banco, e contrato da interface HTTP — no mínimo 4 pontos para um único campo. Para entidades simples e já bem especificadas no conceitual (Empresa, Categoria, Fornecedor, Cliente, Veículo, Obra), esse custo recorrente por mudança pequena não tem contrapartida clara, porque essas entidades não têm regra de negócio complexa para proteger com o isolamento de camadas.
- **Dois vocabulários arquiteturais simultâneos** (Seção 3.3 acima) é, por si, um custo de manutenção: cada desenvolvedor novo precisa entender duas escolas de arquitetura sobrepostas para saber onde colocar código novo, em vez de uma só.

---

## 8. EVOLUÇÃO FUTURA

O documento técnico otimiza fortemente para um tipo específico de mudança futura — **troca de peça técnica** (banco, framework, provedor de IA) — através de portas e adaptadores em todo lugar. Mas as mudanças futuras que o próprio conceitual já sinaliza como **prováveis** são de outra natureza: as 14 pendências de negócio da Seção 16 do conceitual (ex.: pendência 6 — separar/unificar Financiamento e Consórcio; pendência 13 — vínculo genérico de auditoria; pendência 14 — cancelamento com liquidação já aplicada). Nenhuma dessas é uma "troca de adaptador" — são mudanças de **regra de negócio dentro do domínio**, exatamente a camada que a arquitetura protege menos de mudança (mudar uma regra de domínio ainda exige mudar o domínio, não importa quantas camadas de infraestrutura existam em volta dele).

Isso é um desalinhamento sutil, mas real, entre onde a arquitetura investe rigidez de fronteira (troca de tecnologia — improvável, pelo que o conceitual descreve) e onde o próprio conceitual já avisa que mudança é esperada (regras de negócio pendentes — muito provável, e listadas por nome). Camadas extras não aceleram nem dificultam mudança de regra de negócio; elas só valem a pena para o eixo de mudança que este projeto tem menos sinal de que vá ocorrer.

---

## 9. PERFORMANCE

- **Agregações em tempo de consulta sem estratégia de índice definida desde já**: o conceitual exige que todo indicador (saldo, custo de obra, custo de veículo, resultado) seja sempre calculado em consulta, nunca armazenado editável (princípio 8) — isso está corretamente preservado no documento técnico (Seção 7, item 2). Mas a mitigação proposta ("índices sobre obra_id, veiculo_id, data_competência") é adiada para "se o volume um dia justificar" (mesma seção). Para um sistema que vai acumular anos de lançamentos de uma operação de terraplanagem (obras plurianuais, múltiplas empresas, cartão parcelado, financiamentos) e que provavelmente terá dashboards de Balanço/Obra/Frota consultados com frequência, **decidir a estratégia de índice depois que a lentidão aparecer é mais caro do que desenhar o schema já pensando nela** — não é um bloqueio de arquitetura, mas é um risco que a Seção 7 trata como "problema de amanhã" quando poderia ser "decisão de hoje, sem custo extra".
- **N:N entre Lançamento e Liquidação via Aplicação, mais Fatura cobrindo vários Lançamentos parcialmente**: consultas como "saldo a receber de uma Obra" ao longo de vários anos vão exigir joins não triviais (Lançamento → Aplicação → Liquidação, filtrando por Obra e por período). Nenhum gargalo foi identificado como certo, mas também nenhuma estratégia de leitura (view, projeção, ou índice composto) foi antecipada para esse padrão de consulta especificamente — é um ponto cego, não um erro.

---

## 10. PONTOS ONDE A ARQUITETURA TÉCNICA NÃO REPRESENTA CORRETAMENTE A CONCEITUAL

Consolidando achados já detalhados acima, que são os mais graves desta categoria:

1. **IA colocada em `domain/ia`** (Seção 6, linha 236) — mas o conceitual é categórico: a IA "nunca é fonte de verdade" (princípio 9) e existe estritamente como consumidora externa de ferramentas (Seção 11 do conceitual: *"USUÁRIO → IA (modelo de mercado via API) → FERRAMENTAS DO SISTEMA"*). Modelar contratos de IA dentro da pasta `domain` — o núcleo mais protegido e mais "puro" da arquitetura — contraria o próprio espírito do conceitual, que trata a IA como periférica e substituível por definição (Seção 19: "Provedor de IA específico... decisão futura"). Contratos de ferramenta de IA são mais coerentes como parte de `application` (casos de uso de leitura que a IA consome) ou de `infrastructure` (o adaptador do provedor) — nunca como cidadão de primeira classe do domínio.
2. **Fechamento de Fatura implicitamente atribuído ao módulo Cartão** (item 3.2 acima) — risco de contradizer a tabela de responsabilidades do conceitual (Seção 13 dele), que não lista Cartão como escritor de `LIQUIDAÇÃO_FINANCEIRA`.
3. **Auditoria e Permissões modeladas como módulos chamáveis, não como mecanismo compulsório** (Seção 4 acima) — enfraquece, na prática de implementação, a palavra "toda" nas regras 10 e 31 do conceitual.

---

## 11. O QUE NÃO É PROBLEMA (para não gerar alarme onde não há)

Para manter a crítica proporcional, vale registrar o que a auditoria **não** encontrou de errado:

- A cadeia central (Lançamento → Liquidação → Aplicação → Movimentação → Vínculo) está representada com fidelidade ao conceitual, sem simplificação indevida nem distorção.
- A separação de que só Financeiro/Cartões escrevem em Lançamento, e Balanço/Obra/Frota são só leitura, está corretamente refletida na Seção 3.
- A escolha de banco relacional (Seção 5.3) é adequada ao perfil fortemente relacional do domínio — não é overengineering nem subdimensionamento.
- Nenhuma tecnologia foi escolhida silenciosamente — a Seção 15 do documento técnico é honesta sobre o que está em aberto (com a exceção pontual do item 3.1 desta auditoria).

---

## 12. DECISÕES REALMENTE BLOQUEANTES ANTES DA IMPLEMENTAÇÃO

Diferente da lista de 16 decisões da Seção 15 do documento técnico (que inclui itens adiáveis, como framework de frontend ou hospedagem), esta lista é filtrada para **só o que, se não for decidido antes, faz o time começar a implementar em cima de uma ambiguidade que gera retrabalho estrutural ou risco de violação de regra de negócio**:

| # | Decisão bloqueante | Por que é bloqueante agora, e não depois |
|---|---|---|
| 1 | **Proporcionalidade da arquitetura**: aplicar Clean Architecture/Hexagonal de forma uniforme a todos os módulos, ou só nos pontos que o conceitual marca como variáveis (IA, origem bancária, autenticação), com um desenho mais simples no restante | Define a estrutura de pastas (Seção 6 do técnico) e o esforço de cada módulo daqui em diante — mudar de ideia depois de vários módulos implementados exige retrabalho estrutural em todos eles |
| 2 | **Mecanismo de auditoria transversal**: chamada manual por caso de uso vs. mecanismo automático (interceptador/middleware/decorator) que torna log obrigatório e não-opcional | Auditoria precisa existir "desde a primeira versão do schema" (checklist do conceitual) — se o primeiro módulo de escrita for implementado com chamada manual e depois for preciso trocar para automático, todo caso de uso já escrito precisa ser revisado |
| 3 | **Mecanismo de autorização transversal**: mesma pergunta acima, aplicada a permissões — checagem manual por caso de uso vs. mecanismo automático | Mesmo argumento do item 2, mas para controle de acesso; adiar aumenta a superfície de código escrito sem essa proteção embutida |
| 4 | **Estratégia de cálculo do status de `LANÇAMENTO_FINANCEIRO`**: campo persistido recalculado a cada escrita, view, ou cálculo em tempo real na consulta | É a regra mais estrutural da cadeia central (Seção 2 do conceitual); a Seção 6 do documento técnico já pressupõe uma opção sem declarar isso — precisa virar decisão explícita antes de desenhar a primeira tabela |
| 5 | **Responsabilidade pela criação de `LIQUIDAÇÃO_FINANCEIRA` ao fechar uma Fatura**: módulo Financeiro ou módulo Cartão | Ambiguidade herdada do conceitual (Seção 13 dele não lista isso explicitamente); a Seção 6 do documento técnico já a resolveu implicitamente sem declarar — precisa ser confirmada antes de implementar Cartão ou Financeiro, porque define a fronteira de escrita entre os dois módulos |
| 6 | **Reuso ou duplicação de lógica de leitura/agregação entre Balanço, Obra, Frota e "ferramentas de consulta" da IA** | Se cada consumidor implementar sua própria versão da mesma agregação sobre Lançamento, o sistema corre risco real de responder valores diferentes para a mesma pergunta — o que é, na prática, uma violação da fonte única da verdade mesmo com o dado armazenado uma única vez. Precisa ser decidido antes de implementar o segundo consumidor de leitura (o primeiro é livre; a partir do segundo, a decisão já devia existir) |

**O que fica de fora desta lista, de propósito**: linguagem, framework, banco físico, ORM, frontend, hospedagem, provedor de IA específico, e o mecanismo exato da barreira "Alto" da IA — todos esses continuam adiáveis sem gerar retrabalho estrutural, exatamente como já registrado na Seção 15 do documento técnico. Esta auditoria não os repete; só adiciona os seis itens acima, que a Seção 15 original não cobria porque nasceram da leitura crítica da própria estrutura proposta, não da lista original de pendências tecnológicas.

---

## 13. RESUMO EXECUTIVO

A arquitetura técnica **representa corretamente a cadeia financeira central e as fronteiras de leitura/escrita entre módulos** — nisso, ela é fiel ao conceitual. O problema não está no que ela preserva, está no que ela **acrescenta**: uma formalização de Clean Architecture/Hexagonal aplicada uniformemente a todo o sistema, quando o conceitual só pede substituibilidade real em dois ou três pontos específicos (IA, origem bancária, autenticação). Essa generalização tem três efeitos negativos concretos, todos documentados acima: (a) custo de manutenção desproporcional em módulos simples de cadastro; (b) dois concerns que o conceitual trata como absolutos — auditoria e permissão — ficaram modelados de um jeito que depende de disciplina humana para não falhar; (c) pelo menos uma decisão de negócio real (status calculado) e uma ambiguidade herdada do conceitual (dono da Liquidação da Fatura) foram resolvidas implicitamente pela estrutura de pastas, sem virar decisão declarada — contrariando a própria promessa do documento de "nada decidido silenciosamente".

Nenhum desses achados exige jogar fora o documento técnico ou recomeçar a arquitetura — todos são ajustáveis preservando exatamente as mesmas regras de negócio do conceitual, que em nenhum momento foi contestado ou alterado por esta auditoria.
