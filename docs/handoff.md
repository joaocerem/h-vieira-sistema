# HANDOFF — Projeto H. Vieira Sistema
## Encerramento de sessão após conclusão da Fase 2 (consolidação) e da Fase 3 (modelagem física do banco), com correções pontuais de consistência

**Propósito deste documento**: permitir que uma nova sessão continue o projeto imediatamente, sem depender do histórico da conversa anterior. Leia este documento por completo antes de qualquer ação. **Não reabra nenhuma decisão aqui registrada como consolidada.**

---

## 1. ESTADO ATUAL DO PROJETO

- Arquitetura conceitual: concluída.
- Arquitetura técnica: concluída, auditada, arbitrada, e **consolidada** num único documento corrente.
- Modelo de domínio (24 entidades): concluído, revisado (integridade + auditoria sistêmica), e **com todas as 11 pendências bloqueantes já resolvidas e incorporadas**.
- Consolidação documental: **Etapas 1 a 7 concluídas — Fase 2 encerrada**, mais uma correção pontual de consistência feita após a Etapa 4 (ver Seção 9).
- Modelagem física do banco de dados: **concluída** (Fase 3) — modelo lógico e convenções físicas definidos, e schema PostgreSQL implementado: `database/02_tables/`, `database/03_constraints.sql` e `database/04_indexes.sql` concluídos; `05_views.sql` **adiado**; `06_functions.sql` **descartado** (nenhuma function especificada em nenhum documento — a lógica correspondente vive na aplicação, por decisão arquitetural já congelada); `07_triggers.sql` **adiado** (ver Seção 13 e `pendencias.md`).
- Backend: **implementado e a Fase 4 encerrada em 2026-08-19** — ver `freeze-fase-4.md`. 24 módulos de domínio implementados em Clean Architecture. Dez decisões técnicas da Fase 4 já **congeladas**: T1 (linguagem/framework/gerenciador de dependências/ORM do backend) = **Java 21 LTS + Spring Boot + Maven + Hibernate/JPA** (ver `decisions.md`, decisão #12); A1 (estilo de arquitetura de software) = **Clean Architecture, com o vocabulário de Ports & Adapters (Hexagonal) tratado como a mesma alternativa arquitetural** (ver `decisions.md`, decisão #13) — a estrutura de pastas de `arquitetura-tecnica.md`, Seção 6, deixou de ser recomendação e é agora padrão oficial do backend; T3 (estratégia de autenticação) = **autenticação própria — Spring Security, usuário/senha, JWT, hash de senha com Argon2 (bcrypt só como alternativa documentada), nenhum provedor externo** (ver `decisions.md`, decisão #14); A4 (mecanismo dos dois pontos de checagem de permissão) = **Spring Security Method Security (ponto por ação) + Hibernate/JPA Filters via `@FilterDef`/`@Filter` (ponto por escopo de Empresa)** (ver `decisions.md`, decisão #15); A2 (modelo de permissões de usuário) = **RBAC + escopo por Empresa** (ver `decisions.md`, decisão #16); A3 (cruzamento entre papel de usuário e níveis de confirmação da IA) = **Papel → nível máximo** (ver `decisions.md`, decisão #17); A5 (mecanismo técnico de auditoria automática) = **aspecto customizado (Spring AOP, `@Around`), interceptando cada caso de uso de escrita e gravando em `LOG_AUDITORIA` na mesma transação da escrita de negócio, com o contexto de negócio completo como parâmetro obrigatório de entrada** (ver `decisions.md`, decisão #18); B4 (implementação técnica do vínculo genérico de auditoria) = **referência polimórfica (`entidade_tipo`/`entidade_id`), sem FK nativa do banco, com validação de existência na camada de aplicação** (ver `decisions.md`, decisão #20) — a estratégia definitiva de indexação dessas colunas segue o critério de B3 [nota de atualização posterior a este handoff: B3 — estratégia de índice, resolvida em nível arquitetural em sessão futura, `decisions.md`, decisão #37]; D7 (vínculo direto `LANÇAMENTO_FINANCEIRO` ↔ `EMPRESA`) = **`empresa_id` obrigatório desde a criação em `LANÇAMENTO_FINANCEIRO`, com preenchimento/validação na camada de aplicação, e `empresa_id`/status "Aguardando Empresa" em `AÇÃO_PROPOSTA_IA`** (ver `decisions.md`, decisão #21) — parte da definição de negócio de que todo Lançamento pertence obrigatoriamente a uma Empresa, decidida durante a resolução desta pendência; e uma decisão técnica independente, **sem código de pendência associado**: mecanismo do módulo de consulta compartilhado `application/consultas-financeiras` = **serviço de aplicação (Application Service/Facade) sobre Spring Data JPA** (ver `decisions.md`, decisão #19). [Nota de atualização posterior a este handoff: A6 — desenho arquitetural do módulo (responsabilidade, consumidores, categorias de consulta, contrato) — foi resolvida em sessão futura, `decisions.md`, decisão #35; métodos concretos e fórmulas internas permanecem para quando cada funcionalidade for especificada.] Banco de dados já definido anteriormente como PostgreSQL (B1). **A Fase 4 foi encerrada em 2026-08-19 com escopo explícito** (decisão #41, `freeze-fase-4.md`): a implementação de T3 (autenticação), A2 (RBAC + escopo por Empresa), A4 (checagem de permissão), A5 (auditoria automática) e A8 (reautenticação de IA) foi deliberadamente adiada para a Fase 5 — todas as cinco decisões permanecem congeladas, só a implementação em código está pendente (`pendencias.md`, Seção 7, itens S1-S5). Até essa implementação existir, todos os endpoints do backend permanecem sem autenticação (`infrastructure/auth/SecurityConfig.java`), estado aceito, não uma falha. Frontend: **arquitetura técnica completa** — T2 (React + Vite + TypeScript, decisão #42) e as demais nove decisões constituintes (T7-T14, decisões #44-#50: roteamento, testes, cliente HTTP, estado, autenticação no cliente, UI/estilo, estrutura de pastas, hospedagem) resolvidas; síntese em `docs/architecture/arquitetura-tecnica-frontend.md`. **Código ainda não iniciado.**

## 2. FASE ATUAL

**Fase 2 (consolidação da documentação) e Fase 3 (modelagem física do banco de dados) — ambas concluídas.** As Etapas 1 a 7 do plano de consolidação foram concluídas (Fase 2); o modelo lógico, a arquitetura física e a implementação do schema PostgreSQL — tabelas, constraints e índices — foram concluídos (Fase 3), com `05_views.sql` e `07_triggers.sql` formalmente adiados e `06_functions.sql` descartado (ver Seção 13 e `pendencias.md`). O próximo grande marco do projeto é a Fase 4 (Backend) — ver `roadmap.md`. Dentro da Fase 4, nove pendências já foram resolvidas: T1 (linguagem/framework de backend) — Java 21 LTS + Spring Boot, Maven e Hibernate/JPA; A1 (estilo de arquitetura de software) — Clean Architecture, com Hexagonal/Ports & Adapters tratado como a mesma alternativa arquitetural; T3 (estratégia de autenticação) — autenticação própria, Spring Security + JWT, hash de senha com Argon2, sem provedor externo; A4 (mecanismo dos dois pontos de checagem de permissão) — Spring Security Method Security + Hibernate/JPA Filters; A2 (modelo de permissões de usuário) — RBAC + escopo por Empresa; A3 (cruzamento entre papel de usuário e níveis de confirmação da IA) — Papel → nível máximo; A5 (mecanismo técnico de auditoria automática) — aspecto customizado (Spring AOP, `@Around`); B4 (implementação técnica do vínculo genérico de auditoria) — referência polimórfica, sem FK nativa; e D7 (vínculo direto `LANÇAMENTO_FINANCEIRO` ↔ `EMPRESA`) — `empresa_id` obrigatório em `LANÇAMENTO_FINANCEIRO` desde a criação, com resolução da dependência circular com `AÇÃO_PROPOSTA_IA` via status "Aguardando Empresa" (ver `decisions.md`, decisões #12, #13, #14, #15, #16, #17, #18, #20 e #21; `pendencias.md`). Adicionalmente, uma decisão técnica independente foi registrada, **sem código de pendência associado** — mecanismo do módulo de consulta compartilhado `application/consultas-financeiras`: serviço de aplicação (Application Service/Facade) sobre Spring Data JPA (`decisions.md`, decisão #19). Essa decisão não resolveu A6 sozinha. [Nota de atualização posterior a este handoff: A6 — desenho arquitetural do módulo — foi resolvida em sessão futura, `decisions.md`, decisão #35; `pendencias.md`, item A6, removido das pendências abertas.] Nenhuma implementação de código foi iniciada. [Nota de atualização posterior a este handoff, 2026-08-19: a Fase 4 foi implementada e encerrada — ver Seção 14 deste documento e `freeze-fase-4.md`. O próximo grande marco do projeto passa a ser a **Fase 5 (Frontend)**, bloqueada por T2 (`pendencias.md`) e com S1-S5 (`pendencias.md`, Seção 7) como dependência formal herdada da Fase 4.]

---

## 3. FILOSOFIA DO PROJETO (não é opcional, é a regra de trabalho)

1. Primeiro o domínio ficar completamente consistente. Só depois modelar o banco. Só depois implementar.
2. Nunca antecipar decisão técnica, banco ou código antes da hora.
3. Nunca decidir nada silenciosamente — toda decisão de negócio ou de arquitetura fica registrada e passa por aprovação explícita.
4. Ao encontrar qualquer inconsistência, ambiguidade ou omissão: **parar, registrar exatamente o motivo, aguardar confirmação** — nunca corrigir por conta própria.
5. Preferir sempre a menor alteração possível que resolva o problema.
6. Nada é apagado — documentos superados viram histórico, nunca são removidos.
7. Ao final de cada etapa de execução, relatar exatamente: (1) o que foi alterado; (2) se alguma nova decisão foi tomada (esperado: não); (3) se alguma regra de negócio mudou (esperado: não); (4) se foi encontrada alguma inconsistência. **Mantenha este formato de relatório nas próximas etapas.**

---

## 4. DOCUMENTOS FONTE DE VERDADE (ordem de prioridade)

1. **`architecture/arquitetura-conceitual.md`** — regras de negócio. Nunca alterado desde a criação.
2. **`project-rules.md`** — regras do projeto (como trabalhar, o que nunca fazer). Vigente desde o início, nunca alterado.
3. **`principios-de-modelagem.md`** — critérios permanentes de como o domínio deve ser modelado (7 princípios, normativo).
4. **`domain-model/01-empresa.md` a `24-log-auditoria.md`** — forma de cada entidade, já com as 11 decisões incorporadas.
5. **`architecture/arquitetura-tecnica.md`** — arquitetura técnica **consolidada** (não confundir com `arquitetura-tecnica-v1.md`, histórico).
6. **`decisions.md`** — registro oficial de decisões. **Preenchido na Etapa 7** — as 11 decisões consolidadas, as duas resoluções adicionais da Etapa 3, e o índice dos 7 princípios de modelagem.
7. **`pendencias.md`** — única fonte corrente de pendências abertas do projeto inteiro.
8. **`modelo-logico.md`** — tradução das 24 entidades para modelo lógico (Fase 3, Etapa 3.1), sem nenhuma decisão física ainda.
9. **`arquitetura-fisica-banco.md`** — convenções físicas globais do banco (Fase 3, Etapa 3.2): SGBD PostgreSQL (resolve `pendencias.md`, item B1), identificadores, nomenclatura.
10. **`docs/modelagem-fisica/01-cadastros-basicos.md` a `09-ia-auditoria.md`** — modelagem física por entidade (Fase 3, Etapa 3.3), aplicando as convenções dos itens 8-9.
11. **`plano-implementacao-sql.md`** — ordem de implementação do schema e registro formal dos itens adiados/descartados — views, functions, triggers (Fase 3, Etapa 3.4).
12. **`database/02_tables/`, `database/03_constraints.sql`, `database/04_indexes.sql`** — schema físico implementado (Fase 3).

Documentos de apoio, não normativos, mas ainda vigentes: `roadmap.md` e `changelog.md` (ambos atualizados na Etapa 6, com entradas até a Fase 2 apenas) e `freeze-fase-2.md` (marco formal de encerramento da Fase 2 e autorização de início da Fase 3).

---

## 5. ETAPAS CONCLUÍDAS

### Etapa 1 — Princípios de modelagem
Criado `docs/principios-de-modelagem.md`, com os 7 princípios normativos (separar entidades só por diferença de comportamento; modelo só representa conceitos com significado de negócio definido; não criar estrutura nova quando a existente resolve; fonte única da verdade; fatos históricos não são reescritos; indicadores derivados calculados, não persistidos; toda exceção deve ser justificada). Nenhuma decisão nova.

### Etapas 2a-2f — Incorporação das 11 decisões ao modelo de domínio
Todas concluídas. Ver Seção 8 (arquivos alterados) para o detalhe de quais documentos cada sub-etapa tocou. Inclui duas correções de bookkeeping identificadas e tratadas com o mesmo rigor de uma etapa normal: Etapa 2e (Decisão 10 em `16-rateio-despesa.md`, que faltava no plano original) e Etapa 2f (Decisão 4 em `20-contrato-financeiro.md`, idem).

### Etapa 3 — Consolidação da arquitetura técnica
`architecture/arquitetura-tecnica.md` fundido com as mudanças já ratificadas de `arbitragem-tecnica-final.md`. Original preservado como `architecture/arquitetura-tecnica-v1.md`. Durante esta etapa, duas divergências foram encontradas, registradas e resolvidas com autorização explícita:
- `CATEGORIA` reclassificada do perfil "núcleo com invariante" para "cadastro simples" (consequência direta da Decisão 5 — a premissa que justificava a exceção deixou de existir).
- A correção de posicionamento da IA na estrutura de pastas (arbitragem, Divergência 5 — dividir a linha `domain/ia` entre estados de IA e contratos de ferramenta de consulta) foi incorporada como omissão de registro da própria arbitragem, não como nova decisão.

### Etapa 4 — Lista mestra de pendências
Criado `docs/pendencias.md`, organizando tudo que legitimamente continua em aberto em 6 categorias (Domínio, Arquitetura, IA, Banco de Dados, Tecnologia, Melhorias Futuras), com origem, motivo, fase de resolução e bloqueios/dependências para cada item. Este documento **substitui todos os outros como fonte de pendências** — não releia documentos antigos para descobrir o que falta decidir.

### Correção pós-Etapa-4 (fora da numeração das etapas, mas concluída)
Durante a revisão de um handoff anterior (produzido por outra ferramenta), foi identificada uma inconsistência real: `domain-model/18-compra-cartao.md` ainda descrevia uma relação direta `Compra Cartão → Fatura`, contradizendo `19-fatura.md` e `21-parcela.md`, que já refletiam a relação correta (`Compra Cartão → Parcela → Fatura`, sem vínculo direto). Essa inconsistência foi confirmada e corrigida — ver Seção 9 para o detalhe exato dos trechos alterados.

---

## 6. ETAPAS 5-7 (TODAS CONCLUÍDAS)

### Etapa 5 — Mover documentos de processo para histórico (CONCLUÍDA)

**Concluída.** Objetivo: reorganizar fisicamente os documentos que já são tratados como histórico (Seção 10), sem apagar nada e sem alterar conteúdo.

Lista exata de arquivos movidos:

Para `architecture/historico/` (pasta criada):
- `architecture/historico/auditoria-critica-arquitetura-tecnica.md`
- `architecture/historico/replica-tecnica-auditoria-critica.md`
- `architecture/historico/arbitragem-tecnica-final.md`
- `architecture/historico/arquitetura-tecnica-v1.md`

Para `domain-model/historico/` (pasta criada):
- `domain-model/historico/revisao-integridade-dominio.md`
- `domain-model/historico/analise-pendencia-fatura-parcela-compra.md`
- `domain-model/historico/analise-lacunas-parcela-fatura.md`
- `domain-model/historico/analise-cenarios-compra-retroativa.md`
- `domain-model/historico/auditoria-sistemica-final.md`

Critérios aprovados para esta etapa, todos cumpridos: preservar todos os arquivos; não apagar nada; não alterar conteúdo; apenas mover; manter os documentos consolidados (`arquitetura-tecnica.md`, as 24 entidades, `pendencias.md`, `principios-de-modelagem.md`) nas pastas correntes; atualizar referências cruzadas só se algum link quebrasse por causa do caminho novo (verificado: nenhum link markdown com caminho apontava para esses 9 arquivos — só citações textuais em crases, sem prefixo de pasta — nada precisou ser corrigido); registrar qualquer conflito antes de mover (nenhum conflito encontrado).

### Etapa 6 — Atualizar `roadmap.md` e `changelog.md` (CONCLUÍDA)
**Concluída.** `roadmap.md` recebeu, sob a Fase 2, uma nota registrando o avanço da consolidação documental. `changelog.md` recebeu novas entradas sob a data de 2026-08-13, registrando o marco desta consolidação (princípios de modelagem, incorporação das 11 decisões, consolidação da arquitetura técnica, lista mestra de pendências, reorganização dos documentos históricos) e uma entrada de correção (relação Compra Cartão → Fatura).

### Etapa 7 — Preencher `decisions.md` (CONCLUÍDA)
**Concluída.** `decisions.md` passou a ser o registro oficial e definitivo de decisões: as 11 decisões consolidadas (Seção 7 deste handoff), as duas resoluções adicionais da Etapa 3, e um índice dos 7 princípios de modelagem (referenciando `principios-de-modelagem.md`, sem duplicar conteúdo).

**Com a Etapa 7 concluída, a Fase 2 está encerrada.** A **Fase 3** (modelagem física do banco de dados) também foi concluída nesta linha do tempo do projeto — ver Seção 1 e Seção 13. O próximo grande marco do projeto é a **Fase 4** (Backend).

---

## 7. DECISÕES DEFINITIVAMENTE CONSOLIDADAS — NÃO REABRIR

1. **Status do Lançamento**: dividido em duas dimensões independentes, nunca fundidas — `situação_administrativa` (persistida, decisão humana sobre o ciclo de vida) e `status_financeiro` (sempre calculado a partir das Aplicações, nunca armazenado, sem exceção).
2. **Cancelamento**: `situação_administrativa` só pode virar "Cancelado" quando a soma de Aplicações de Liquidação vinculadas for exatamente zero. Qualquer correção de um Lançamento que já tenha Aplicações passa exclusivamente por `AJUSTE_FINANCEIRO`. Cancelamento e Ajuste são conceitos distintos que nunca produzem o mesmo resultado por caminhos diferentes.
3. **Vínculo genérico** (`LOG_AUDITORIA`, `SUGESTÃO_IA`, e o "registro gerado" por `AÇÃO_PROPOSTA_IA`): cada um permanece entidade única, com referência genérica **só no nível conceitual**. A lista de entidades referenciáveis é fechada e explícita — nunca uma referência totalmente livre; nova entidade auditável exige adição deliberada. Cada mecanismo mantém seu próprio escopo (Sugestão limitada a 2 tipos; Ação limitada às entidades oficialmente permitidas para IA; `AJUSTE_FINANCEIRO` continua com referências concretas, nunca genéricas). A referência genérica existe só para evitar duplicação estrutural — nunca flexibiliza regra de negócio. **Técnica de implementação (banco) continua em aberto** — ver `pendencias.md`, item B4.
4. **`CONTRATO_FINANCEIRO`**: permanece entidade única (Financiamento/Consórcio via `tipo`). Campos condicionais (`taxa`, `grupo-cota`, `contemplado`) são restrição de **negócio do domínio**, não validação de interface — o campo do outro tipo é conceitualmente inexistente, não apenas vazio. Princípio geral derivado: separar entidades só por diferença real de **comportamento**, nunca só de atributos.
5. **`CATEGORIA`**: permanece com `nome`/`tipo`, sem segunda dimensão de "sub-conta interna" — não há definição de negócio para esse conceito hoje. Reclassificada para o perfil arquitetural "cadastro simples" (consequência da mesma decisão, incorporada na Etapa 3).
6. **Fatura ↔ Parcela**: `PARCELA` referencia `FATURA` diretamente (nunca `COMPRA_CARTÃO` → `FATURA` direto — ver a correção da Seção 9). Uma Fatura fechada continua aceitando vínculo de Parcelas descobertas depois, por importação — mas `valor_total_calculado`/`valor_cobrado` ficam **congelados** no momento do fechamento, nunca recalculados. Diferença entre o total congelado e a soma atual de Parcelas vinculadas é efeito esperado, não inconsistência. Nenhuma entidade nova de reconciliação foi criada.
7. **Atribuição de ciclo da Parcela**: ausência de vínculo com Fatura já representa "aguardando" — nenhum status novo criado; `status` da Parcela é dimensão independente de "tem Fatura". Regra de atribuição: cadastro **manual sem fonte externa autoritativa**, com data em ciclo já fechado → próximo ciclo aberto no momento do processamento (usa `LOG_AUDITORIA.data/hora`, sem campo novo em `COMPRA_CARTÃO`). Quando existe fonte externa autoritativa (importação) → vínculo direto com a Fatura real, mesmo já fechada — prevalece sempre sobre a regra do "próximo ciclo aberto".
8. **`AJUSTE_FINANCEIRO` é exclusivamente iniciativa humana**: a IA nunca pode formalizar uma proposta de criação de Ajuste via `AÇÃO_PROPOSTA_IA`, em nenhum nível de sensibilidade — regra arquitetural, não limitação de implementação. A IA **pode** informar, explicar e recomendar que o usuário avalie um Ajuste em linguagem natural; só não pode iniciar o fluxo formal.
9. **Saldo devedor de `CONTRATO_FINANCEIRO`**: sempre = soma das Parcelas ainda em aberto. `valor_contratado` **nunca** participa desse cálculo — a fórmula "contratado menos pago" é inválida para o modelo. `valor_contratado` continua útil para consulta/histórico. O modelo **não decompõe** Parcela em principal/juros/taxa de administração — cada Parcela é só o valor devido naquele vencimento.
10. **Tolerância de Rateio**: exclusivamente técnica (arredondamento da menor unidade monetária) — nunca uma política de negócio para permitir rateios aproximados. Qualquer diferença além do arredondamento é inválida.
11. **Tolerância de dias da conciliação**: reclassificada como **não-bloqueante**, permanece pendência (não afeta nenhuma entidade). Deve ser **configurável**, nunca uma constante fixa espalhada pelo sistema — resolvida só quando o mecanismo de sugestão automática de conciliação for projetado.

**Resolvidas também, fora da numeração 1-11, durante a Etapa 3**: confirmação de que o módulo Financeiro cria `LIQUIDAÇÃO_FINANCEIRA` ao fechar uma Fatura (arbitragem, Divergência 6); correção de posicionamento da IA na estrutura de pastas (arbitragem, Divergência 5).

---

## 8. ARQUIVOS ALTERADOS E CRIADOS NESTA FASE DE CONSOLIDAÇÃO

### Documentos novos criados
- `docs/plano-consolidacao.md` (plano inicial de levantamento)
- `docs/plano-final-consolidacao.md` (plano final, pós-resolução das 11 pendências)
- `docs/principios-de-modelagem.md` (Etapa 1)
- `docs/architecture/arquitetura-tecnica-v1.md` (Etapa 3 — preservação do original)
- `docs/pendencias.md` (Etapa 4)
- `docs/handoff.md` (este documento)

### Documentos existentes editados
- `docs/domain-model/09-lancamento-financeiro.md` — Decisões 1, 2 (Etapa 2a); referência cruzada da Decisão 10 (Etapa 2e)
- `docs/domain-model/11-aplicacao-de-liquidacao.md` — Decisão 2 (Etapa 2a)
- `docs/domain-model/15-ajuste-financeiro.md` — Decisões 2, 8 (Etapa 2a)
- `docs/domain-model/24-log-auditoria.md` — Decisão 3 (Etapa 2b)
- `docs/domain-model/22-sugestao-ia.md` — Decisão 3 (Etapa 2b)
- `docs/domain-model/23-acao-proposta-ia.md` — Decisões 3, 8 (Etapa 2b)
- `docs/domain-model/19-fatura.md` — Decisões 6, 7 (Etapa 2c)
- `docs/domain-model/21-parcela.md` — Decisões 6, 7 (Etapa 2c)
- `docs/domain-model/20-contrato-financeiro.md` — Decisão 9 (Etapa 2c); Decisão 4 (Etapa 2f)
- `docs/domain-model/06-categoria.md` — Decisão 5 (Etapa 2d)
- `docs/domain-model/16-rateio-despesa.md` — Decisão 10 (Etapa 2e)
- `docs/architecture/arquitetura-tecnica.md` — consolidação completa (Etapa 3): cabeçalho, Seção 4 (proporcionalidade), Seção 6 (estrutura de pastas), Seção 10 (auditoria), Seção 11 (permissões), Seção 15 (decisões pendentes)
- `docs/domain-model/18-compra-cartao.md` — correção de consistência pós-handoff (Seção 9 deste documento)

**13 documentos de entidade + 1 documento de arquitetura técnica editados. 6 documentos novos criados.**

---

## 9. CORREÇÃO DE CONSISTÊNCIA EM `18-compra-cartao.md` (detalhe)

Identificada durante a revisão de um handoff produzido por outra sessão/ferramenta, confirmada e corrigida nesta sessão. `18-compra-cartao.md` ainda descrevia `COMPRA_CARTÃO → FATURA` como relação direta (N:1), o que está estruturalmente errado para compras parceladas (uma Compra em N parcelas contribui para até N Faturas diferentes) e contradizia `19-fatura.md`/`21-parcela.md`, já corretos.

Três trechos corrigidos, só neste arquivo:
- Seção 1 ("Quem consulta"): removida a menção a "Fatura agrupa Compras de um ciclo"; substituída por explicação de que a relação é indireta, via Parcela.
- Seção 3 (Relacionamentos): removida a linha `Compra Cartão → Fatura | N:1`; adicionada nota de consistência explicando por que essa relação direta é incorreta e apontando para a relação real (`PARCELA → FATURA`).
- Seção 6 (Dependências): "referenciada por Parcela e agrupada por Fatura" → "relaciona-se com Fatura apenas de forma transitiva, através de Parcela".

Nenhuma regra de negócio mudou — só a descrição de um relacionamento já decidido, que estava desatualizada num único documento.

---

## 10. DOCUMENTOS HISTÓRICOS — JÁ MOVIDOS FISICAMENTE (Etapa 5 concluída)

**Importante**: os documentos abaixo já **não são mais fonte corrente** (suas conclusões foram incorporadas aos documentos vigentes) e **já foram movidos fisicamente** para suas subpastas `historico/` (Etapa 5, concluída).

- `architecture/historico/auditoria-critica-arquitetura-tecnica.md`
- `architecture/historico/replica-tecnica-auditoria-critica.md`
- `architecture/historico/arbitragem-tecnica-final.md`
- `architecture/historico/arquitetura-tecnica-v1.md`
- `domain-model/historico/revisao-integridade-dominio.md`
- `domain-model/historico/analise-pendencia-fatura-parcela-compra.md`
- `domain-model/historico/analise-lacunas-parcela-fatura.md`
- `domain-model/historico/analise-cenarios-compra-retroativa.md`
- `domain-model/historico/auditoria-sistemica-final.md`

Use-os só para entender **por que** uma decisão foi tomada. Nunca para descobrir **o que ainda está pendente** — isso é só `pendencias.md`.

---

## 11. PENDÊNCIAS ABERTAS

Consultar **exclusivamente** `docs/pendencias.md` — 6 categorias (Domínio, Arquitetura, IA, Banco de Dados, Tecnologia, Melhorias Futuras), cada pendência com origem, motivo, fase de resolução, bloqueios e dependências já mapeados. Não releia os documentos históricos para tentar reconstruir a lista — ela já está consolidada, com duplicidades fundidas.

---

## 12. ORIENTAÇÕES PARA A PRÓXIMA SESSÃO

1. **Nunca reinterpretar ou reabrir nenhuma das 11 decisões da Seção 7**, nem as duas resolvidas na Etapa 3 (Divergências 5 e 6 da arbitragem).
2. **Nunca transformar uma recomendação ou "melhoria futura" antiga em decisão** sem aprovação explícita — `pendencias.md`, categoria "Melhorias Futuras", lista o que é intencionalmente não-decidido.
3. **Sempre registrar qualquer divergência ou inconsistência encontrada antes de editar** — nunca corrigir por conta própria, mesmo que a correção pareça óbvia (ver o precedente da Seção 9: mesmo uma correção "óbvia" foi registrada e só executada após confirmação explícita).
4. **Preservar o formato de relatório de 4 pontos** ao final de cada etapa (o que foi alterado; nova decisão? regra mudou? inconsistência encontrada?).
5. **Nada é apagado.** Documentos superados viram histórico — nunca são removidos, mesmo na Etapa 5 (que é reorganização de pasta, não exclusão).
6. **Preferir sempre a menor alteração possível.**
7. As **Etapas 5, 6 e 7** já foram concluídas (ver Seção 6) — a consolidação documental está encerrada e a Fase 2 terminou. A **Fase 3** (modelagem física do banco de dados) também já foi concluída (ver Seção 1 e Seção 13). O próximo passo é a **Fase 4** (Backend), mantendo o mesmo padrão de checkpoint já usado nas fases anteriores.
8. Esta sessão usou um sistema interno de tarefas (Etapas 1-7 rastreadas como itens individuais) para acompanhar o progresso — todas concluídas. Se a próxima sessão avançar para a Fase 4, recrie um rastreamento equivalente para as etapas dessa nova fase.

---

## 13. NOTA — ÚLTIMA CORREÇÃO DOCUMENTAL DA FASE 3 (Implementação SQL)

Após a releitura completa de `docs/plano-implementacao-sql.md`, já com `database/02_tables/`, `database/03_constraints.sql` e `database/04_indexes.sql` concluídos, e `05_views.sql`/`06_functions.sql`/`07_triggers.sql` formalmente adiados/descartados, foi encontrada **uma única inconsistência de completude**: a pendência **A5** (mecanismo técnico de auditoria automática) já era citada como bloqueio ativo na seção de Triggers do próprio plano, mas não aparecia na tabela "Pendências que permanecem abertas" do mesmo documento.

A inconsistência foi confirmada e corrigida — `A5` foi acrescentada à tabela, deixando explícito que bloqueia exclusivamente `07_triggers.sql`, não `06_functions.sql` (já descartado por motivo independente).

Esta foi a última correção documental realizada na Fase 3.

---

## 14. NOTA — ENCERRAMENTO DA FASE 4 (Backend)

A Fase 4 foi implementada (24 módulos de domínio, Clean Architecture) e formalmente encerrada
em 2026-08-19 — ver `freeze-fase-4.md`. Durante a implementação, duas lacunas de fórmula não
pré-catalogadas em `pendencias.md` foram encontradas e resolvidas por resposta de negócio
direta: divisão de valor e cálculo de vencimento das Parcelas de `COMPRA_CARTÃO` (decisão
#39) e estrutura de parcelamento/referência de credor de `CONTRATO_FINANCEIRO` (decisão #40).

**Escopo do encerramento — leitura obrigatória antes de iniciar a Fase 5**: por decisão
explícita do usuário (`decisions.md`, decisão #41), a Fase 4 foi encerrada **sem** a
implementação em código de cinco decisões técnicas já congeladas: T3 (autenticação, decisão
#14), A2 (RBAC + escopo por Empresa, decisão #16), A4 (dois pontos de checagem de permissão,
decisão #15), A5 (aspecto automático de auditoria, decisão #18) e A8 (barreira de
reautenticação de IA, decisão #22). Nenhuma dessas decisões foi reaberta — só a
implementação foi adiada, deliberadamente, para a Fase 5 (etapa de segurança). Ver
`pendencias.md`, Seção 7 (itens S1-S5), para o detalhe de cada uma.

**Consequência prática, válida até S1-S5 serem implementados**: todo endpoint do backend está
aberto, sem autenticação (`infrastructure/auth/SecurityConfig.java`); a entidade `Usuario`
não tem campo de senha, papel ou Empresa associada; `LOG_AUDITORIA` não tem implementação
funcional. A próxima sessão que avançar a Fase 5 deve tratar essa dependência como parte do
desenho da arquitetura técnica do Frontend (autenticação, rotas protegidas, UI condicionada a
papel/Empresa) — não como algo a assumir resolvido no backend.

Esta foi a última correção documental realizada antes do início da Fase 5.

---

## 15. NOTA — DECISÕES CONSTITUINTES DO FRONTEND E ARQUITETURA TÉCNICA COMPLETA

Na mesma sessão do encerramento da Fase 4 (Seção 14), a Fase 5 (Frontend) teve suas decisões
técnicas resolvidas uma a uma, da menor para a maior, mesmo processo usado na Fase 4: T2
(framework — React + Vite + TypeScript), T14 (hospedagem), T7 (roteamento — React Router), T8
(testes — Vitest + React Testing Library), T9 (cliente HTTP — axios), T10 (gerenciamento de
estado — TanStack Query + Context API), T11 (autenticação no cliente — cookie httpOnly, que
impõe requisito formal a S1) e T12 (UI/estilo — Tailwind + shadcn/ui), fechando em T13
(estrutura de pastas — por feature/módulo de domínio). Decisões registradas em `decisions.md`,
#42 e #44-#50; `pendencias.md`, Seção 5, todas movidas para resolvidas.

Com as nove decisões fechadas, a arquitetura técnica completa do Frontend foi elaborada em
`docs/architecture/arquitetura-tecnica-frontend.md` — estrutura de pastas, roteamento,
comunicação com API, gerenciamento de estado, autenticação/autorização no cliente, UI/tema,
testes, mapeamento de módulos, ordem recomendada de implementação e os bloqueios herdados de
S1-S5 (Seção 12 daquele documento).

**Nenhuma implementação de código do Frontend foi iniciada.** A próxima sessão deve ler
`docs/architecture/arquitetura-tecnica-frontend.md` por completo antes de começar a
implementar, e seguir a ordem da Seção 11 daquele documento (respeitando os bloqueios de
S1-S5 na Seção 12) — mesma disciplina de checkpoint já usada nas fases anteriores.

---

## 16. NOTA — IMPLEMENTAÇÃO DO BOOTSTRAP DO FRONTEND (Seção 11, item 1)

Na mesma sessão da Seção 15, o item 1 da ordem recomendada de implementação (`arquitetura-
tecnica-frontend.md`, Seção 11 — `app/` e `shared/`) foi executado. Criado `frontend/`:
projeto React + Vite + TypeScript (`decisions.md`, #42); Tailwind CSS + shadcn/ui (#49,
componentes em `shared/components/ui/`); React Router (#44, `routes/router.tsx`, sem guards
— deliberadamente ausentes); TanStack Query (#47, `app/providers/QueryProvider.tsx`, com
tratamento global de erro via toast); cliente axios em `shared/api/client.ts` (#46,
`withCredentials: true`, já pronto para o cookie httpOnly de S1/#48) e tradução do contrato
`ApiError` em `shared/api/errors.ts`; estrutura de pastas de T13 (#50) criada por completo
(`app/`, `features/` — vazio, com README apontando a ordem recomendada —, `shared/`,
`routes/`, incluindo `routes/guards/` com README explicando a ausência deliberada de
`RequireAuth`/`RequireRole` até S1-S3). Tema via `next-themes` (Context React internamente,
consistente com #47), sem toggle de UI — nenhuma necessidade de modo escuro confirmada.

**Nenhuma feature de negócio, autenticação, ou qualquer mecanismo relacionado a S1-S5 foi
implementado** — por instrução explícita, consistente com a decisão #41.

Validado nesta sessão: `npm run build` (type-check + build de produção) sem erros nem
warnings; `npm run test` (Vitest + RTL) — 1 teste de fumaça, passando; `npm run lint`
(oxlint) — só um aviso pré-existente em código gerado pelo shadcn/ui (`button.tsx`, padrão
conhecido da biblioteca, não específico deste projeto); aplicação verificada rodando via
`npm run dev`, sem erro de console, renderizando corretamente.

Próximo passo (na íntegra, superado pela Seção 17 abaixo): item 2 da Seção 11
(`arquitetura-tecnica-frontend.md`) — tela de login e `AuthProvider`. **Substituído** — ver
Seção 17.

---

## 17. NOTA — REVISÃO DA ORDEM DE IMPLEMENTAÇÃO E MÓDULO EMPRESA

Na mesma sessão da Seção 16, antes de prosseguir para o item 2 (login), foi feita uma
auditoria específica pedida pelo usuário: existe alguma dependência técnica real entre
login/`AuthProvider` e a primeira feature funcional? **Confirmado que não** —
`infrastructure/auth/SecurityConfig.java` mantém `permitAll()` em todos os endpoints até S1
ser implementado (`pendencias.md`, Seção 7); nenhuma feature de CRUD depende de sessão para
funcionar hoje.

**Ordem de implementação revisada** (`arquitetura-tecnica-frontend.md`, Seção 11 — mudança de
ordem, nenhuma decisão de `decisions.md` reaberta): login/`AuthProvider` movidos para o
momento em que S1-S5 começarem a ser implementados no backend; a implementação passa a seguir
a mesma ordem já usada pelo backend (`arquitetura-tecnica.md`, Seção 14), começando pelos
Cadastros Base.

**Módulo Empresa implementado** (`features/empresa/`) — primeira feature funcional da Fase 5:
`api/empresaApi.ts` (CRUD contra `EmpresaController`, backend), `hooks/` (TanStack Query —
`useEmpresas`, `useEmpresa`, `useCriarEmpresa`, `useAtualizarEmpresa`), `components/`
(`EmpresaForm` com `react-hook-form` + `zod`, `EmpresaTable` — tabela HTML simples, decisão
#49), `pages/` (`EmpresaListPage`, `EmpresaFormPage`, rota única para criar/editar). Rotas
`/empresas`, `/empresas/nova`, `/empresas/:id/editar` registradas em `routes/router.tsx`; link
de navegação adicionado ao `AppShell`. 13 testes (Vitest + RTL), cobrindo tradução de erro,
validação de formulário e o fluxo `TanStack Query` → componente com API mockada.

**Achados desta etapa**:
1. **Bug real, corrigido**: sem `frontend/.env` (só existia `.env.example`), o `axios` chamava
   `/api/empresas` relativo ao próprio Vite dev server (sem `baseURL`), que devolve o
   `index.html` (fallback de SPA) com status 200 — `EmpresaTable` recebia uma string em vez de
   array e quebrava (`empresas.map is not a function`). Corrigido criando `frontend/.env`
   local (não versionado, já coberto por `.gitignore`) e endurecendo `EmpresaListPage` para só
   renderizar a tabela quando `Array.isArray(empresas)`.
2. **Formato de `fieldErrors` do backend**: `FieldError.toString()` (Spring), verboso, não um
   par `{campo, mensagem}` limpo — `shared/api/errors.ts` já extrai isso via regex, com
   degradação graciosa. Documentado em `arquitetura-tecnica-frontend.md`, Seção 5. Nenhuma
   alteração no backend.
3. **Aviso de build, não bloqueante**: bundle único acima de 500kB (gzip ~170kB) — esperado
   com só uma feature e ainda sem code-splitting por rota (`React.lazy`, já previsto em
   `arquitetura-tecnica-frontend.md`, Seção 4, mas não aplicado ainda). Candidato a próxima
   melhoria quando houver mais features, não urgente com o volume atual.
4. **Limitação do ambiente de teste (não é bug do app)**: o navegador sandboxed usado para
   validação visual manual ficou com o `onlineManager` do TanStack Query preso em "paused"
   (retry infinito sem nunca chegar a `isError`) mesmo com `navigator.onLine === true` —
   comportamento específico do ambiente de preview desta sessão, não reproduzível de forma
   confiável fora dele. A cobertura real do caminho de erro/loading ficou pelos testes
   automatizados (mock de API), não pela checagem visual manual, que se limitou a confirmar
   layout, navegação e validação de formulário.

Build, testes e lint validados após todas as correções — ver relatório da sessão (formato de
4 pontos) para o detalhe completo.

**Próximo passo (na íntegra, superado pela Seção 18 abaixo)**: item 2 da Seção 11 revisada —
`conta-bancaria/`, `fornecedor/`, `cliente/`, `categoria/` (Cadastros Base restante), seguidos
por `usuario/` (nível básico). **Substituído** — ver Seção 18.

---

## 18. NOTA — CADASTROS BASE COMPLETOS (Categoria, Fornecedor, Cliente, Conta Bancária,
Cartão de Crédito, Usuário)

Na mesma sessão da Seção 17, os itens 2-3 revisados da Seção 11 (`arquitetura-tecnica-
frontend.md`) foram implementados de uma vez, por pedido do usuário: todos os Cadastros Base
antes de avançar aos módulos financeiros. Auditoria enxuta prévia (decisões #42-#50 e decisões
de domínio posteriores) não encontrou bloqueio real para nenhum dos seis módulos — confirmado
inspecionando os seis controllers do backend (`interfaces/http/{categoria,fornecedor,cliente,
contabancaria,cartaocredito,usuario}`) antes de codificar.

**Implementado**: `features/categoria/`, `fornecedor/`, `cliente/`, `conta-bancaria/`,
`cartao-credito/` (só o cadastro — banco, apelido, dias de fechamento/vencimento; **não**
inclui Compra/Parcela/Fatura, módulo financeiro separado) e `usuario/` (nível básico — nome,
identificador de acesso, situação de acesso; sem papel/Empresa, bloqueado por S1/S2). Rotas e
navegação (`AppShell`) atualizadas para as sete features agora existentes.

**Extração de componentes compartilhados (reuso real, não antecipado)**: depois de confirmado
que Empresa, Fornecedor e Cliente têm exatamente o mesmo formulário/tabela (`{nome}` único,
mesma validação), `shared/components/crud/NomeUnicoForm.tsx` e `NomeUnicoTable.tsx` foram
extraídos — `features/empresa/` foi refatorada para consumi-los também, eliminando a
triplicação. Dois hooks de referência entraram em `shared/hooks/` pela mesma razão de reuso
real: `useEmpresaOptions` (Conta Bancária precisa selecionar Empresa na criação) e
`useContaBancariaOptions` (Cartão de Crédito precisa selecionar Conta Bancária na criação) —
ambos reusam a chave de query (`shared/queryKeys.ts`) da feature "dona" da lista, evitando
requisição duplicada no mesmo cache do TanStack Query.

**Achado real, corrigido — `.superRefine()` do Zod 4 não é confiável para exigência
condicional por modo**: `ContaBancariaForm`, `CartaoCreditoForm` e `UsuarioForm` têm um campo
obrigatório só no modo "criar" (`empresaId`, `contaBancariaId`, `identificadorDeAcesso` —
todos imutáveis depois de criados, mesma regra em cada um dos três `Atualizar*Request` do
backend). A primeira implementação usou `.superRefine()` para essa exigência condicional,
mantendo o campo sempre opcional no shape base do schema. Isolando o resolver fora do
componente (`node` direto, fora do Vitest) confirmou o bug: em Zod 4, o efeito de
`.superRefine()` não roda quando o objeto já tem outro campo com erro de tipo (`invalid_type`)
— especificamente, quando os campos numéricos de `CartaoCreditoForm` (`diaFechamento`/
`diaVencimento`) ficam vazios, `valueAsNumber` do react-hook-form os converte para `NaN`, e o
erro de tipo resultante faz o `.superRefine()` ser silenciosamente pulado — a mensagem "Conta
bancária é obrigatória" nunca aparecia quando os outros campos também estavam inválidos.
Corrigido trocando os três formulários para exigência condicional **no shape do campo**
(ternário `modo === 'criar' ? z.string().min(1, ...) : z.string().optional()`), sem
`.superRefine()`, e derivando o tipo do formulário sempre via `z.infer<ReturnType<typeof
buildSchema>>` (nunca uma interface escrita à mão em paralelo) — evita permanentemente o
schema e o tipo do formulário divergirem entre os dois modos. Validado com um teste de
regressão específico (`CartaoCreditoForm.test.tsx`, o cenário exato do bug) e confirmado
manualmente no browser antes de fechar a sessão.

Validado: `npm run build` (type-check + build) sem erros; `npm run test` — 36/36 passando
(15 arquivos de teste); `npm run lint` — só o aviso pré-existente do shadcn/ui; validação
manual no browser (navegação entre as 7 features, formulários de criação de Categoria, Conta
Bancária, Cartão de Crédito e Usuário testados interativamente, incluindo o cenário exato do
bug do `.superRefine()` acima) sem erro de console além do `ERR_CONNECTION_REFUSED` esperado
(backend não está rodando nesta sessão).

Documentos atualizados: `arquitetura-tecnica-frontend.md` (Seção 10 — tabela de módulos
atualizada, cartão de crédito separado do fluxo financeiro; Seção 11 — itens 2-3 marcados
concluídos), `frontend/src/features/README.md`, `roadmap.md`, `changelog.md`.

**Próximo passo (na íntegra, superado pela Seção 19 abaixo)**: item 4 da Seção 11 — cadeia
financeira central (`lancamento-financeiro/`, `liquidacao-financeira/`). **Substituído** — ver
Seção 19.

---

## 19. NOTA — CADEIA FINANCEIRA CENTRAL (Lançamento Financeiro, Liquidação Financeira)

Na mesma sessão da Seção 18, o item 4 da Seção 11 (`arquitetura-tecnica-frontend.md`) foi
implementado, por pedido explícito do usuário — auditoria enxuta prévia sobre decisões #1-#50,
`domain-model/09-lancamento-financeiro.md`, `10-liquidacao-financeira.md`,
`11-aplicacao-de-liquidacao.md`, `modelo-logico.md`, `modelagem-fisica/`,
`arquitetura-tecnica-frontend.md` e `pendencias.md` não encontrou nenhum bloqueio real.

**Achado confirmado pela auditoria, não um bloqueio**: `AplicacaoDeLiquidacao` não tem
`Controller` HTTP próprio no backend — inspecionado o código (`interfaces/http/` não tem
pasta `aplicacaodeliquidacao`) e `LiquidacaoFinanceiraService`, que confirma no próprio
comentário: "`AplicacaoDeLiquidacao` não tem Controller HTTP próprio" porque nasce só como
parte da criação de uma Liquidação, na mesma transação. Por instrução explícita do usuário
("reflita exatamente isso... sem criar telas artificiais"), **não existe
`features/aplicacao-liquidacao/`** — o array `aplicacoes` (quais Lançamentos a Liquidação
cobre, e em que valor) é um campo dinâmico dentro do próprio formulário de criação de
Liquidação.

**Achado real, não um bloqueio (fica registrado para a próxima sessão de Obras/Frota)**: Obra
e Veículo (Frota) **já têm API REST completa no backend** (`interfaces/http/{obra,frota}/`,
CRUD, e Obra com endpoint próprio de transição de status) — descoberto ao ler
`LancamentoFinanceiroService`, cujo comentário registra que isso já era verdade desde "a
auditoria final da Fase 4", mas nenhuma sessão do Frontend havia implementado essas duas
features ainda. Como `obraId`/`veiculoId` são **opcionais** em `LANÇAMENTO_FINANCEIRO`, e
"Obras/Frota" não fazia parte do escopo desta rodada (pedido explícito do usuário cobria só
`lancamento-financeiro`/`liquidacao-financeira`), o formulário de Lançamento foi implementado
**sem** esses dois campos — nenhuma perda de funcionalidade obrigatória, só uma lacuna
opcional a preencher quando `features/obra/`/`features/frota/` forem implementadas (item 6 da
Seção 11).

**Implementado**: `features/lancamento-financeiro/` (CRUD completo + `POST .../cancelar`,
tipo Despesa/Receita com Fornecedor/Cliente exigidos condicionalmente) e
`features/liquidacao-financeira/` (só criação + detalhe — sem edição, imutável por D12; array
dinâmico de Aplicações). Novos hooks de referência compartilhados
(`useCategoriaOptions`, `useFornecedorOptions`, `useClienteOptions`, `useLancamentoOptions`) e
`shared/lib/formatters.ts` (`formatDate`, `formatCurrency`), extraído por reuso real
simultâneo entre os dois módulos. Rotas e `AppShell` atualizados, com o menu agora separado em
"Financeiro" e "Cadastros Base".

**Achado real, corrigido — mesma classe de bug do `.superRefine()` do Zod 4, confirmada pela
segunda vez**: campos monetários de `LancamentoForm`/`LiquidacaoForm` já nasceram usando
`z.coerce.number()` (não `valueAsNumber: true`) e exigência condicional (Fornecedor×Cliente)
já nasceu como checagem manual no `onSubmit` (não `.superRefine()`), aplicando diretamente a
lição da sessão anterior (Cartão de Crédito) — sem repetir o bug desta vez. Documentado como
padrão permanente em `arquitetura-tecnica-frontend.md`, Seção 5.

Build, testes (47/47, 19 arquivos) e lint validados; validação manual no browser confirmou
navegação, alternância Fornecedor↔Cliente por tipo, validação de todos os campos (incluindo o
array de Aplicações da Liquidação, adicionar/remover linha) sem erro de console além do
`ERR_CONNECTION_REFUSED` esperado (backend não está rodando nesta sessão).

Documentos atualizados: `arquitetura-tecnica-frontend.md` (Seção 5, Seção 10, Seção 11),
`frontend/src/features/README.md`, `roadmap.md`, `changelog.md`.

**Próximo passo (na íntegra, superado pela Seção 20 abaixo)**: item 5 da Seção 11 —
`conciliacao-bancaria/`. **Substituído** — ver Seção 20.

---

## 20. NOTA — OBRA E FROTA, INTEGRAÇÃO COM LANÇAMENTO FINANCEIRO

Na mesma sessão da Seção 19, o item 6 da Seção 11 (`arquitetura-tecnica-frontend.md`) foi
implementado, por pedido explícito do usuário — auditoria enxuta prévia sobre decisões #1-#50,
`domain-model/03-obra.md`, `07-veiculo.md`, `modelo-logico.md`, `modelagem-fisica/`,
`arquitetura-tecnica-frontend.md` e `pendencias.md` não encontrou nenhum bloqueio real.
Confirmado no código o que já havia sido registrado na Seção 19: `ObraController` e
`VeiculoController` (`interfaces/http/{obra,frota}/`) já existiam prontos, com CRUD completo e,
no caso de Obra, um endpoint dedicado de transição de status (`POST /api/obras/{id}/status`),
cujas transições válidas (`ObraService.TRANSICOES_VALIDAS`) foram espelhadas 1:1 no Frontend
(`ObraStatusActions.tsx`) só para decidir quais botões mostrar — quem valida de fato continua
sendo o backend.

**Implementado**: `features/obra/` (CRUD + transição de status) e `features/frota/` (CRUD,
rota `/veiculos` — nome de pasta segue o pacote do backend `interfaces/http/frota`, mas a URL
segue o nome do recurso, `/api/veiculos`; `tipo` com lista fechada de 8 valores, D10,
`decisions.md` decisão #31 — `z.enum`, diferente do texto livre já usado em `Categoria.tipo`/
`Usuario.situacaoDeAcesso`, porque aqui o domínio *confirma* um conjunto fechado). Novos hooks
de referência compartilhados (`useObraOptions`, `useVeiculoOptions`).

**Integração obrigatória cumprida**: `features/lancamento-financeiro/` atualizada para incluir
seleção opcional de Obra e de Veículo — Veículo filtrado pela Empresa selecionada no próprio
formulário (client-side), espelhando a regra real do backend
(`LancamentoFinanceiroService.resolverEValidarObraEVeiculo`: um Veículo só pode ser vinculado
a um Lançamento da mesma Empresa) — o backend continua sendo quem de fato valida, o filtro no
Frontend é só experiência de uso.

Build, testes (63/63, 24 arquivos) e lint validados; validação manual no browser confirmou
navegação (novos itens "Obras"/"Veículos" no menu), os 8 valores fechados de tipo de Veículo,
validação de todos os campos de Obra e Veículo, e o filtro de Veículo por Empresa no formulário
de Lançamento (placeholder "Selecione a empresa primeiro" até uma Empresa ser escolhida), sem
erro de console além do `ERR_CONNECTION_REFUSED` esperado.

Documentos atualizados: `arquitetura-tecnica-frontend.md` (Seção 10, Seção 11),
`frontend/src/features/README.md`, `roadmap.md`, `changelog.md`.

**Próximo passo (na íntegra, superado pela Seção 21 abaixo)**: item 5 da Seção 11 —
`conciliacao-bancaria/`. **Substituído** — ver Seção 21.

---

## 21. NOTA — CONCILIAÇÃO BANCÁRIA (Movimentação Bancária, Transferência Interna, Vínculo
Conciliação)

Em sessão posterior à da Seção 20, o item 5 da Seção 11 (`arquitetura-tecnica-frontend.md`) foi
implementado, por pedido explícito do usuário — auditoria enxuta prévia sobre decisões #1-#50,
`domain-model/12-movimentacao-bancaria.md`, `13-transferencia-interna.md`,
`14-vinculo-conciliacao.md`, `modelo-logico.md`, `modelagem-fisica/12-conciliacao-bancaria.md`,
`arquitetura-tecnica-frontend.md` e `pendencias.md`, cruzada com os três controllers/services
reais do backend (`interfaces/http/conciliacaobancaria/`,
`application/conciliacaobancaria/`), não encontrou nenhum bloqueio real nem inconsistência
documental.

**Confirmado pela auditoria, não um bloqueio**: `VÍNCULO_CONCILIAÇÃO` não tem caso de uso de
criação exposto — nasce automaticamente, na mesma transação, junto de toda Movimentação
Bancária (`MovimentacaoBancariaService`, tanto em `importar` quanto em
`gerarAPartirDeLiquidacao`). Por instrução explícita do usuário ("implementar somente o que
realmente possui endpoint... não criar telas artificiais"), **não existe
`features/vinculo-conciliacao/` própria** — a relação 1:1 obrigatória é exibida e operada
(`confirmar`/`marcarDivergente`/`marcarSemCorrespondencia`/`vincularManualmente`) na mesma
tabela de Movimentação Bancária, mesmo tratamento já dado a `AplicacaoDeLiquidacao` na Seção
19.

**Implementado**: `features/conciliacao-bancaria/`, cobrindo as três entidades reais numa só
feature (pedido explícito do usuário), cada uma seguindo exatamente seu conjunto de endpoints:
Movimentação Bancária (`importar`, lote via array dinâmico; `reclassificar`, único campo
mutável — `'Transferência Interna'` nunca oferecida como destino do select, só atribuída via
Transferência Interna, espelhando a recusa explícita de `MovimentacaoBancariaService`);
Transferência Interna (criação + listagem, sem edição — "Regras de alteração: não definidas" no
domínio); Vínculo Conciliação (sem tela própria, ver acima — botões de ação calculados a partir
das mesmas guardas de `VinculoConciliacaoService`, mesmo espírito de `ObraStatusActions`, mais
a ação de sugestão automática por valor+data, T6 já resolvida no backend como parâmetro
configurável). Integração cumprida com Conta Bancária (filtro/seleção), Lançamento Financeiro
(seleção de Movimentação em Transferência Interna) e Liquidação Financeira (seleção ao vincular
manualmente — novo hook compartilhado `shared/hooks/useLiquidacaoOptions.ts`).

**Achado real, corrigido — integração ausente com `useCriarLiquidacao`**: `
LiquidacaoFinanceiraService#criar` (backend) já gera automaticamente uma Movimentação Bancária
(com Vínculo `Confirmado`, mesma transação) — mas `useCriarLiquidacao` (Frontend, implementado
na Seção 19) só invalidava `lancamentosFinanceiros`, não as listas de Movimentação/Vínculo. A
nova Movimentação só apareceria na tela de Conciliação Bancária após um refresh manual.
Corrigido invalidando `sharedQueryKeys.movimentacoesBancarias`/`vinculosConciliacao` também no
`onSuccess` dessa mutação. `sharedQueryKeys` ganhou `liquidacoesFinanceiras`,
`movimentacoesBancarias`, `vinculosConciliacao`; `liquidacaoFinanceiraKeys` (antes chave local,
não compartilhada) passou a reusar `sharedQueryKeys.liquidacoesFinanceiras`, mesmo padrão já
usado por Categoria/Fornecedor/Cliente.

Build, testes (83/83, 30 arquivos) e lint validados; validação manual no browser (dev server,
backend não rodando nesta sessão) confirmou navegação (novo item "Conciliação Bancária" no menu
Financeiro), renderização das quatro telas (lista principal com filtro por Conta, importar
extrato, lista e formulário de Transferência Interna) sem erro de console além do
`ERR_CONNECTION_REFUSED` esperado.

Documentos atualizados: `arquitetura-tecnica-frontend.md` (Seção 10, Seção 11),
`frontend/src/features/README.md`, `roadmap.md`, `changelog.md`.

**Próximo passo (na íntegra, superado pela Seção 22 abaixo)**: item 7 da Seção 11 —
`compra-cartao/`, `parcela/`, `fatura/` (fluxo financeiro do cartão) e
`financiamento-consorcio/`. **Substituído** — ver Seção 22.

---

## 22. NOTA — CARTÃO DE CRÉDITO, FLUXO FINANCEIRO (Compra Cartão, Fatura, Parcela)

Em sessão posterior à da Seção 21, o item 7 da Seção 11 (`arquitetura-tecnica-frontend.md`) foi
implementado, por pedido explícito do usuário — auditoria enxuta prévia sobre decisões #1-#50
(com atenção às decisões #27/D5, #28/D6, #32/D11 e #39), `domain-model/18-compra-cartao.md`,
`19-fatura.md`, `21-parcela.md`, `modelagem-fisica/06-cartao-credito.md`, `pendencias.md` e
`arquitetura-tecnica-frontend.md`, cruzada com os três controllers/services reais do backend
(`interfaces/http/{compracartao,fatura,parcela}/`, `application/{compracartao,fatura,parcela}/`),
não encontrou nenhum bloqueio real nem inconsistência documental.

**Confirmado pela auditoria, não bloqueios**:
- `FaturaController`/`ParcelaController` não têm `POST` de criação genérica — Fatura só nasce
  por `fecharCiclo`, Parcela é sempre gerada pelo sistema (`ParcelaService#gerarParcelasParaCompra`,
  chamado na mesma transação de `CompraCartaoService#criar`). Nenhuma tela de "criar Fatura" ou
  "criar Parcela" foi construída — reflexo direto dessas duas regras.
- `ParcelaController` expõe `GET /api/parcelas` filtrável só por `compraCartaoId`/
  `contratoFinanceiroId` — sem `faturaId`. `FaturaDetailPage` cruza a lista completa de Parcelas
  (`useParcelaOptions`, novo hook compartilhado) por `faturaId` no cliente, mesmo padrão já usado
  em `LiquidacaoDetailPage`.
- `ParcelaService#gerarLancamento` é um gatilho manual (comentário do próprio backend: "o
  chamador decide quando invocar") — não existe agendador automático em nenhum ponto do
  projeto. O botão "Gerar lançamento" (`features/parcela/`) fica disponível sempre que
  `lancamentoFinanceiroId` for nulo, sem gate por data de vencimento (o backend também não tem
  esse gate).
- `CompraCartaoService` (`criar`/`atualizar`) não valida consistência entre `veiculoId` e a
  Empresa do Cartão (diferente de `LancamentoFinanceiroService`) — `CompraCartaoForm` não filtra
  Veículo por Empresa, para não inventar uma regra que o backend não tem.

**Implementado**: `features/compra-cartao/` (`/compras-cartao`) — CRUD completo,
`cartaoId`/`valor`/`numeroParcelas` exigidos só no modo criar (imutáveis depois,
`AtualizarCompraCartaoRequest` não os tem, mesmo padrão de `CartaoCreditoForm.tsx`);
`features/fatura/` (`/faturas`) — sem `criar`/`atualizar` genéricos, só `fecharCiclo`
(`/faturas/fechar-ciclo`, `ciclo` via `<input type="month">`, que já entrega `AAAA-MM` nativo)
e `pagar` (`/faturas/:id/pagar`); `features/parcela/` (`/parcelas`) — só leitura + ação
`gerar-lancamento`, filtro por Compra Cartão sincronizado com a URL (`?compraCartaoId=`,
`useSearchParams`), usado pelo link "Ver parcelas" de `compra-cartao/`. Três novos hooks
compartilhados: `useCartaoCreditoOptions`, `useCompraCartaoOptions`, `useParcelaOptions`.
`cartaoCreditoKeys` (antes chave local) passou a reusar `sharedQueryKeys.cartoesCredito`, mesmo
padrão já usado por Categoria/Fornecedor/Cliente/Liquidação.

**Achado real, corrigido — mesma classe de integração ausente já corrigida na Seção 21**:
`FaturaService#pagar` (backend) cria uma Liquidação Financeira ao pagar uma Fatura — que, em
cascata, gera automaticamente uma Movimentação Bancária + Vínculo `Confirmado` (mesmo mecanismo
de `LiquidacaoFinanceiraService#criar` já mapeado). `usePagarFatura` (Frontend) invalida as
quatro listas afetadas (Liquidação, Movimentação Bancária, Vínculo Conciliação e Lançamentos,
cujo `statusFinanceiro` é recalculado) — mesmo raciocínio já aplicado a `useCriarLiquidacao`,
mas disparado aqui por um ponto de entrada diferente (pagamento de Fatura, não criação direta de
Liquidação).

Build, testes (100/100, 37 arquivos) e lint validados; validação manual no browser (dev server,
backend não rodando nesta sessão) confirmou navegação (novo grupo "Cartão de Crédito" no menu —
Compras Cartão/Faturas/Parcelas), renderização das quatro telas principais (lista e formulário
de Compra Cartão, fechar ciclo de Fatura, lista de Parcelas com filtro) sem erro de console além
do `ERR_CONNECTION_REFUSED` esperado.

Documentos atualizados: `arquitetura-tecnica-frontend.md` (Seção 10, Seção 11),
`frontend/src/features/README.md`, `roadmap.md`, `changelog.md`.

**Próximo passo (na íntegra, superado pela Seção 23 abaixo)**: item 7 da Seção 11 (restante) —
`financiamento-consorcio/` (Contrato Financeiro, Parcela). Depois: item 8 — `balanco/`.
**Substituído** — ver Seção 23.

---

## 23. NOTA — FINANCIAMENTOS E CONSÓRCIOS (Contrato Financeiro)

Em sessão posterior à da Seção 22, o restante do item 7 da Seção 11
(`arquitetura-tecnica-frontend.md`) foi implementado, por pedido explícito do usuário —
auditoria enxuta prévia sobre `domain-model/20-contrato-financeiro.md`,
`modelagem-fisica/07-contrato-financeiro.md` e as decisões #4 (unificação Financiamento/
Consórcio), #28 (D6, propagação de veículo pós-contemplação, sem retroatividade) e #40
(estrutura de parcelamento + `fornecedor` substituindo `instituição`), cruzada com
`ContratoFinanceiroController`/`ContratoFinanceiroService` reais, não encontrou nenhum bloqueio
real nem inconsistência documental.

**Confirmado pela auditoria, não bloqueios**:
- `AtualizarContratoFinanceiroRequest` só tem `fornecedorId`/`veiculoId` — os outros seis campos
  (`tipo`, `empresaId`, `contaBancariaId`, `valorContratado`, `numeroParcelas`,
  `dataVencimentoPrimeiraParcela`) são imutáveis desde a criação, mesmo padrão já usado em
  `CompraCartaoForm.tsx`.
- Diferente de `CompraCartaoService` (D5, decisão #27), `ContratoFinanceiroService#atualizar`
  **não propaga** a correção para Lançamentos já gerados — sem regra equivalente documentada
  para este módulo. `useAtualizarContratoFinanceiro` não invalida
  `sharedQueryKeys.lancamentosFinanceiros`, para não inventar um comportamento que o backend
  não tem.
- `contemplar` só transiciona Não→Sim, sem tocar Parcelas/Lançamentos já existentes —
  `gerarLancamento` (Parcela) lê `contemplado` no momento em que é chamado, não no momento da
  contemplação (D6 já garante isso).

**Implementado**: `features/financiamento-consorcio/` (`/contratos-financeiros`) — CRUD +
ação dedicada `contemplar` (botão na página de edição, mesmo espírito de `ObraStatusActions`,
com o formulário remontado via `key` quando `contemplado` muda, para refletir o campo Veículo
sem `form.reset()`). Campos condicionais por `tipo` (`taxa` × `grupoCota`/`contemplado`/
`veiculoId`) exigidos só no modo criar, checados manualmente no `onSubmit` — mesmo achado de
Zod 4 + `.superRefine()` já documentado.

**Reuso real cumprido (pedido explícito do usuário)**: `features/parcela/` estendida para o
segundo filtro real do backend (`GET /api/parcelas?contratoFinanceiroId=`, mutuamente exclusivo
com `?compraCartaoId=`, mesma regra do próprio `ParcelaController`) — `ParcelaListPage` ganhou
um segundo seletor, `ParcelaTable` passou a resolver a origem "Contrato Financeiro" (antes só
"Compra Cartão" tinha resolução de referência). Nenhuma tela nova foi criada para "ver parcelas
de um Contrato" — o link de `ContratoFinanceiroTable` aponta para a mesma `/parcelas`, já
existente, com o filtro pré-selecionado via URL.

**Achado real, corrigido (não relacionado à auditoria prévia, encontrado ao editar
`ParcelaTable.tsx`)**: a coluna "Fatura" mostrava "Aguardando" para toda Parcela sem
`faturaId`, inclusive Parcelas de Contrato Financeiro — mas Parcela de Contrato Financeiro
**nunca** se relaciona com Fatura (`docs/domain-model/21-parcela.md`, Seção 2: "Aplicável
apenas quando `origem` = Compra Cartão"), então "Aguardando" era enganoso (sugere algo que vai
acontecer, mas nunca acontece para essa origem). Corrigido para mostrar "—" quando
`origem !== 'Compra Cartão'`.

Build, testes (111/111, 39 arquivos) e lint validados; validação manual no browser (dev server,
backend não rodando nesta sessão) confirmou navegação (novo item "Financiamentos e Consórcios"
no menu), os campos condicionais por `tipo` (Financiamento mostra Taxa; Consórcio mostra
Grupo-cota/Já contemplado/Veículo ao marcar o checkbox) e a tela de Parcelas com os dois
filtros, sem erro de console além do `ERR_CONNECTION_REFUSED` esperado.

Documentos atualizados: `arquitetura-tecnica-frontend.md` (Seção 10, Seção 11),
`frontend/src/features/README.md`, `roadmap.md`, `changelog.md`.

**Próximo passo (na íntegra, superado pela Seção 24 abaixo)**: item 8 da Seção 11 —
`balanco/` (Balanço Realizado/Projetado, camada de leitura/agregação). **Substituído** — ver
Seção 24.

---

## 24. NOTA — BALANÇO (Realizado/Projetado)

Em sessão posterior à da Seção 23, o item 8 da Seção 11 (`arquitetura-tecnica-frontend.md`) foi
implementado, por pedido explícito do usuário — auditoria enxuta prévia sobre
`arquitetura-conceitual.md` (regra 8, Seção 2, Seção 13), `arquitetura-tecnica.md` (Seção 2 —
Balanço "sem entidade própria") e a decisão #35 (A6, desenho do módulo de consulta
compartilhado), cruzada com o backend real (`BalancoController`, `BalancoService`,
`ConsultasFinanceirasService`), não encontrou nenhum bloqueio real nem inconsistência
documental — módulo mais simples já implementado nesta fase: um único endpoint de leitura, sem
escrita, sem entidade própria.

**Confirmado pela auditoria, não um bloqueio**: `ConsultasFinanceirasService` calcula só
"Realizado" (soma de `APLICAÇÃO_DE_LIQUIDAÇÃO.valor_aplicado`, por tipo) e "Projetado" (soma de
`LANÇAMENTO_FINANCEIRO`, por tipo, exceto Cancelado) — "Lucro por Obra" e qualquer composição
envolvendo `AJUSTE_FINANCEIRO` estão explicitamente fora de escopo da própria decisão #35/A6
(fórmula do sinal do Ajuste ainda não resolvida). Nenhuma tela para essas duas funcionalidades
foi construída — reflexo direto do que a decisão já deixa em aberto, não uma omissão desta
sessão.

**Implementado**: `features/balanco/` (`/balanco`) — página única, sem CRUD, filtro opcional por
Empresa (reusando `useEmpresaOptions`, já existente). Primeira tela genuinamente "dashboard" do
Frontend — `shared/components/ui/card` (shadcn/ui, cadastrado desde o bootstrap da Fase 5,
Seção 16, nunca consumido por nenhuma feature até aqui) usado pela primeira vez;
`ResultadoCard.tsx` extraído por reuso real (seis instâncias na mesma página — Receitas/
Despesas/Resultado × Realizado/Projetado).

Build, testes (116/116, 41 arquivos) e lint validados; validação manual no browser (dev server,
backend não rodando nesta sessão) confirmou navegação (novo item "Balanço" no menu Financeiro)
e renderização da página (título, filtro por empresa), sem erro de console além do
`ERR_CONNECTION_REFUSED` esperado.

Documentos atualizados: `arquitetura-tecnica-frontend.md` (Seção 10, Seção 11),
`frontend/src/features/README.md`, `roadmap.md`, `changelog.md`.

**Situação da Seção 11**: com Balanço concluído, os itens 1-5, 7 e 8 estão implementados;
`ajuste-financeiro/` (deixado pendente desde o item 6, `handoff.md` Seção 20) continua em
aberto — única feature de negócio ainda não implementada na Fase 5, fora dos itens
explicitamente bloqueados por S1-S5 (login/`AuthProvider`, UI condicionada a papel/Empresa,
`usuarios/` completo, `auditoria/`) e da Fase 6 (IA).

**Próximo passo (na íntegra, superado pela Seção 25 abaixo)**: `ajuste-financeiro/` (Ajuste
Financeiro — vincula dois Lançamentos, mecanismo de correção formal, decisões #2/#8).
**Substituído** — ver Seção 25.

---

## 25. NOTA — AJUSTE FINANCEIRO

Em sessão posterior à da Seção 24, `ajuste-financeiro/` foi implementado, por pedido explícito
do usuário — auditoria enxuta prévia sobre `domain-model/15-ajuste-financeiro.md`,
`modelagem-fisica/05-ajuste-financeiro.md` e a decisão #34 (D13, imutabilidade), cruzada com o
backend real (`AjusteFinanceiroController`, `AjusteFinanceiroService`), não encontrou nenhum
bloqueio real nem inconsistência documental. Com este módulo, **todas as features de negócio da
ordem recomendada de implementação da Fase 5 estão concluídas** — só restam os itens
formalmente bloqueados por S1-S5 (autenticação/autorização/auditoria) e a Fase 6 (IA).

**Confirmado pela auditoria, não bloqueios**:
- Único caso de uso de escrita é `criar` — sem `atualizar` (Ajuste Financeiro é totalmente
  imutável desde a criação, D13) nem exclusão física ("nada desaparece",
  `arquitetura-fisica-banco.md` §7). Nenhuma tela de edição foi construída — reflexo direto
  dessa regra.
- `AjusteFinanceiroService` **não cria** o Lançamento de ajuste — só formaliza o vínculo entre
  dois Lançamentos que já precisam existir (o de ajuste é criado separadamente, via
  `POST /api/lancamentos-financeiros`, origem "Manual"). O formulário reflete isso exatamente:
  as duas seleções (`lancamentoOriginalId`/`lancamentoAjusteId`) apontam para Lançamentos já
  cadastrados, reusando `useLancamentoOptions` já existente — nenhum campo de criação de
  Lançamento embutido aqui.
- `usuarioId` é obrigatório na criação, sem valor implícito de sessão — S1 (autenticação) ainda
  não existe, então o próprio usuário escolhe explicitamente quem está registrando o ajuste,
  via um select (`useUsuarioOptions`, novo hook compartilhado).

**Implementado**: `features/ajuste-financeiro/` (`/ajustes-financeiros`) — criação + listagem
(sem edição). Lançamentos Cancelados excluídos das duas seleções (UX; o backend também recusa);
origem e destino mutuamente exclusivas, checado manualmente no `onSubmit` (mesmo padrão de
`TransferenciaInternaForm.tsx`, evitando o achado de Zod 4 + `.superRefine()` já documentado).
Filtro por Lançamento original sincronizado com a URL (`?lancamentoOriginalId=`, único filtro
real do backend), mesmo padrão de `ParcelaListPage` — `features/lancamento-financeiro/` ganhou
o link "Ajustes" na tabela, apontando para esse filtro (reuso real de uma tela já existente).

**Reuso comprovado cumprido (pedido explícito do usuário)**: `useLancamentoOptions` (já
existente, sem alteração) para as duas seleções de Lançamento; novo hook compartilhado
`useUsuarioOptions.ts` (primeira vez que `USUÁRIO` é lido como referência cross-feature) —
`features/usuario/hooks/queryKeys.ts` refatorado para reusar `sharedQueryKeys.usuarios`, mesmo
padrão já usado por Categoria/Fornecedor/Cliente/Liquidação/Cartão de Crédito/Compra Cartão/
Parcela/Contrato Financeiro.

Build, testes (124/124, 43 arquivos) e lint validados; validação manual no browser (dev server,
backend não rodando nesta sessão) confirmou navegação (novo item "Ajustes" no menu Financeiro),
renderização da lista e do formulário (todos os campos, incluindo o filtro por Lançamento
original vindo da URL), sem erro de console além do `ERR_CONNECTION_REFUSED` esperado.

Documentos atualizados: `arquitetura-tecnica-frontend.md` (Seção 10, Seção 11),
`frontend/src/features/README.md`, `roadmap.md`, `changelog.md`.

**Situação da Fase 5**: nenhuma feature de negócio pendente — a implementação de código do
Frontend cobre integralmente a ordem recomendada da Seção 11 até o ponto em que S1-S5 passam a
ser pré-requisito formal.

**Próximo passo**: login/`AuthProvider` e o restante da segurança (S1-S5,
`pendencias.md`, Seção 7) — ou a Fase 6 (IA). **Nenhum dos dois iniciado nesta sessão, por
instrução explícita do usuário** ("não avance automaticamente para autenticação nem IA").
**Substituído** — ver Seção 26 abaixo: a Fase 5, com todas as features de negócio concluídas,
foi seguida por uma nova rodada de evolução baseada em feedback operacional real, que passa a
ter prioridade sobre login/IA.

---

## 26. NOTA — RODADA DE EVOLUÇÃO OPERACIONAL (2026-08), FASE 1

Em sessão posterior à da Seção 25, com todas as features de negócio da Fase 5 concluídas, o
usuário trouxe feedback de uso operacional real da empresa e 14 decisões de negócio que
**substituem a modelagem anterior sempre que houver conflito** — não incrementos, correções de
regra de negócio a partir do processo real da empresa (autocomplete/cadastro rápido, remoção de
`apelido` de Conta Bancária/Cartão, máscara de moeda universal, mudanças em Obra/Veículo,
Lançamento ganhando `descricao`/`documento`, **remoção completa de Liquidação Financeira e
Ajuste Financeiro**, Conciliação via OFX, nova entidade Medição de Obra, Faturamento Direto
incorporado ao Lançamento existente, Balanço deferido). Pedido explícito do usuário: auditoria
pura primeiro, **sem nenhum código na primeira resposta**. Entregue um relatório de
impacto/auditoria com 9 perguntas em aberto; o usuário respondeu todas, depois revisou duas
vezes o mecanismo de substituição de Liquidação (a versão final, mais radical: **nenhum estado
intermediário "Pago"** — só conciliação bancária confirma pagamento; Contas a Pagar/Receber
vira consulta derivada de lançamentos ativos + não conciliados, sem novo status visível como
"Aberto"). Análise revisada aprovada explicitamente, com autorização para iniciar a
implementação na ordem proposta (8 fases — registro completo em `pendencias.md`, Seção 9;
status por fase em `roadmap.md`).

**Implementado nesta sessão — só a Fase 1** (máscara de moeda universal + Categoria ordenação
alfabética + Lançamento descrição/documento/NF):

- `shared/components/form/CurrencyInput.tsx` (novo) — máscara de moeda em tempo real, entrada
  por dígitos (como caixa eletrônico). Primeiro uso de `Controller` (react-hook-form) no
  projeto — componente controlado, incompatível com `register()` puro. Aplicado a todo campo de
  valor monetário em Real ainda vivo: `LancamentoForm` (`valor`), `CompraCartaoForm` (`valor`),
  `FaturaFecharCicloForm` (`valorCobrado`), `ContratoFinanceiroForm` (`valorContratado` — **não**
  `taxa`, que é percentual, fora do escopo da máscara), `TransferenciaInternaForm` (`valor`) e
  `ImportarMovimentacoesForm` (`valor`, com `allowNegative` — sinal significativo,
  saída/entrada). `LiquidacaoForm`/`AjusteFinanceiroForm` deliberadamente fora do escopo — ambas
  removidas nas Fases 4/5 desta mesma rodada, não vale a pena migrar o que vai ser apagado.
- Achado real durante a construção do componente, coberto por teste antes de seguir adiante
  (disciplina "validar cada unidade antes de avançar"): como é controlado, o React restaura o
  valor do `<input>` para o último valor conhecido logo após cada `onChange`, mesmo sem
  re-render disparado pelo próprio componente — um `-` digitado sozinho (antes de qualquer
  dígito, com `allowNegative`) era perdido silenciosamente. Corrigido com um estado local
  (`pendingNegative`), só para lembrar o sinal enquanto não há dígito nenhum ainda — não
  interfere no tipo `number | undefined` exposto para fora. `CurrencyInput.test.tsx`, 6 casos.
- Todo campo convertido de `z.coerce.number()` para `z.number()` direto (o componente nunca
  produz `NaN`), eliminando a necessidade de `z.input`/`z.output` nesses schemas especificamente
  (outros campos não-monetários do mesmo schema, ex. `taxa`/`numeroParcelas`, continuam com o
  padrão anterior quando fizer sentido).
- Backend: `CategoriaRepository#findAllByOrderByNomeAsc` (nova) — decisão de negócio: lista de
  Categorias sempre em ordem alfabética, não a ordem de cadastro; `CategoriaService#listarTodas`
  atualizado.
- Backend: `LancamentoFinanceiro` ganhou `descricao`/`documento` (ambos opcionais, sem regra de
  negócio associada além da própria existência) — migração `V16`, entidade, `criar`/`atualizar`
  de `LancamentoFinanceiroService`, DTOs, `LancamentoFinanceiroMapper`,
  `LancamentoFinanceiroController`. `criarGeradoPeloSistema` (caminho Cartão via Parcela)
  manteve a assinatura sem esses dois campos — sem interface para preenchê-los nesse caminho
  ainda, passa `null`/`null` internamente. `CompraCartaoService#propagarParaLancamentosJaGerados`
  (propagação D5) atualizado para reenviar `descricao`/`documento` já existentes, sem apagá-los.
- `descricao` exibida na tabela de listagem do Frontend (`LancamentoTable`); `documento` só no
  formulário (evita sobrecarregar a tabela com um campo mais raramente consultado em lista).

Build, testes e lint validados nos dois lados: backend 160/160 (159 + 1 novo,
`CategoriaServiceTest`); Frontend 131/131 (124 + 7 novos — 6 de `CurrencyInput`, 1 de
`descricao`/`documento` em `LancamentoForm`), build e lint limpos. Ambiente sandbox continua
sem conseguir subir um servidor backend real (limitação já registrada, Seção 16) — validação
do backend feita via testes de integração (`@SpringBootTest`), não servidor real; desta vez o
ambiente tinha PostgreSQL acessível em `localhost:5432`, então os testes rodaram contra banco
real, migração `V16` incluída, não só `MockMvc`.

Documentos atualizados: `domain-model/06-categoria.md`, `domain-model/09-lancamento-financeiro.md`,
`modelagem-fisica/02-lancamento-financeiro.md`, `architecture/arquitetura-tecnica-frontend.md`
(Seção 5, novo padrão `CurrencyInput`/`Controller`), `pendencias.md` (Seção 9, nova — registro
do plano completo aprovado de 8 fases), `roadmap.md`, `changelog.md`,
`frontend/src/features/README.md`.

**Decisões arquiteturais novas desta etapa**: nenhuma fora do já aprovado — `CurrencyInput` é
detalhe de implementação (como qualquer outro componente de formulário), não decisão de
arquitetura. **Regra de negócio alterada**: nenhuma além das já aprovadas antes da
implementação (Seção 9 de `pendencias.md`).

**Situação da rodada de evolução**: Fase 1 (das 8 aprovadas) concluída. Fases 2-8 não
iniciadas, aguardando confirmação explícita do usuário a cada uma — disciplina do projeto
("nunca avançar automaticamente de fase/módulo sem instrução").

**Próximo passo**: Fase 2 (componente de autocomplete + cadastro rápido para Fornecedor/
Categoria, aplicado em Lançamento Financeiro) — não iniciada nesta sessão.
**Substituído** — ver Seção 27 abaixo: mudança de estratégia (Fases pequenas → Sprints por
fluxo operacional completo) antes de a Fase 2 começar.

---

## 27. NOTA — MUDANÇA DE ESTRATÉGIA (FASES → SPRINTS) E SPRINT 2: FLUXO COMPLETO DE LANÇAMENTOS

Em sessão posterior à da Seção 26, antes de iniciar a Fase 2, o usuário pediu uma revisão
técnica pura da Fase 1 (sem alterar código — achados apenas relatados). Único achado real: em
`CurrencyInput`, editar no *meio* de um valor já preenchido (não no final) corrompe o número
silenciosamente — confirmado empiricamente com um teste temporário (criado e descartado nesta
mesma sessão), não corrigido ainda (o usuário optou por seguir para a Sprint 2 primeiro; ver
Seção 26 para o diagnóstico completo — problema, causa, impacto e menor correção possível já
registrados lá).

Em seguida, o usuário decidiu mudar a estratégia de implementação: a divisão original em 8
fases pequenas e tecnicamente isoladas dificultava validar um processo operacional do início ao
fim — funcionalidades do mesmo fluxo real da empresa ficavam espalhadas por fases diferentes.
A partir daqui, a divisão passa a ser por **fluxo operacional completo**, nunca por semelhança
técnica de código — "Fase N" vira "Sprint N". Princípios obrigatórios definidos pelo usuário:
cada sprint entrega um fluxo operacional completo e utilizável; evitar dependências entre
sprints; nunca implementar metade de uma funcionalidade numa sprint e a outra metade na
seguinte (se uma funcionalidade só faz sentido quando outra existir, pertencem à mesma sprint,
mesmo com menos reaproveitamento técnico); o sistema fica sempre utilizável ao final de cada
sprint.

O usuário propôs uma divisão inicial em 4 sprints (Lançamentos → Financeiro → Obras →
Conciliação Final) e pediu análise crítica antes de implementar. Análise entregue, com
ajustes propostos por localidade técnica (ex. mover Conta Bancária/Cartão para a Sprint
Financeiro, já que os mesmos arquivos seriam tocados de qualquer forma). **O usuário corrigiu
essa interpretação**: o agrupamento deve ser só pelo processo real da empresa, nunca por
reaproveitamento técnico — mesma conclusão final nesse caso específico, mas por motivo
diferente (Conta Bancária/Cartão só são manipulados dentro do próprio fluxo financeiro/
conciliação, não é coincidência de arquivo).

**Correção mais importante desta rodada — Faturamento Direto**: a primeira interpretação
(mecanismo genérico de Lançamento, construído cedo na Sprint 2, reaproveitado depois pela
Medição) estava errada. Faturamento Direto **não é módulo, não é entidade, não é fluxo
independente, não é lançamento criado manualmente** — existe exclusivamente como consequência
de uma Medição (a cooperativa paga certos fornecedores diretamente durante a execução da obra —
diesel, pedra, tubos, brita, cimento — nunca pela conta bancária da empresa; só quando a
medição oficial fica pronta esses itens são registrados, descontados do valor bruto). Por isso
o mecanismo pertence inteiramente à Sprint 4 (Medição), nunca antecipado nem exposto
isoladamente ao usuário.

**Regra definitiva — Faturamento Direto e Contas a Pagar/Receber**: itens de Faturamento
Direto nunca entram em Contas a Pagar nem em Contas a Receber, e nunca são conciliados
individualmente — participam normalmente de custo da obra, relatórios, balanço, custo de
veículo e categoria, mas ficam inteiramente fora do fluxo bancário (esses fornecedores já
foram pagos por um terceiro; nunca haverá saída nem entrada bancária da empresa referente a
eles). Só o valor líquido esperado da Medição (bruto menos Faturamento Direto menos impostos)
entra em Contas a Receber e é conciliado. Impostos são diferentes: são despesa real da empresa,
entram normalmente em Contas a Pagar, geram Movimentação Bancária e são conciliados como
qualquer outra despesa — a única semelhança com Faturamento Direto é reduzir o valor líquido
esperado da Medição.

**Painel da Obra e Contas a Pagar/Receber — sem telas novas**: confirmado explicitamente pelo
usuário — a tela de Obra já existente evolui no próprio lugar (dados cadastrais + valor
contratado + valor recebido + saldo contratual + medições + faturamento direto + custos +
resultado parcial, tudo no mesmo contexto); Contas a Pagar/Receber são filtros da listagem de
Lançamentos já existente, não telas/módulos novos.

**Cliente permanece select tradicional** — decisão explícita, volume baixo, autocomplete não
traz ganho operacional (resolve a pergunta que ficara em aberto na Seção 26).

**Divisão final das sprints** (ver `pendencias.md`, Seção 9, e `roadmap.md` para o detalhe
completo): Sprint 2 (Lançamentos: autocomplete + cadastro rápido de Fornecedor/Categoria) →
Sprint 3 (Financeiro: remoção de Liquidação/Ajuste, nova filosofia de Contas a Pagar/Receber,
Conta Bancária/Cartão sem apelido) → Sprint 4 (Obras: Obra como centro operacional, Medição
com Faturamento Direto embutido, impostos, saldo contratual) → Sprint 5 (Conciliação Final:
OFX, Balanço novo). Veículo (`obraAtual` fora da interface) não pertence formalmente a nenhuma
sprint — item isolado, de baixo risco, resolvido a qualquer momento conveniente.

**Implementado nesta sessão — Sprint 2 (Fluxo completo de Lançamentos)**:

- `shared/components/form/AutocompleteField.tsx` (novo) — busca por texto sobre as opções já
  carregadas (sem endpoint novo, filtragem client-side), navegação por teclado, e uma opção
  "+ Criar '...'" que cadastra e seleciona na hora quando o texto não corresponde a nada
  existente. Substitui `SelectField` para `fornecedorId`/`categoriaId` em `LancamentoForm.tsx`.
  Segundo uso de `Controller` no projeto (depois de `CurrencyInput`).
- Cadastro rápido de Categoria herda o `tipo` (Despesa/Receita) já selecionado no Lançamento —
  não pergunta de novo (o campo é obrigatório no backend). Dois hooks novos em `shared/hooks/`
  (nunca em `features/*/hooks/` — `shared/` não depende de `features/*`, mesmo padrão de
  `useFornecedorOptions`/`useCategoriaOptions`): `useCriarFornecedorRapido.ts`,
  `useCriarCategoriaRapida.ts`.
- **Achado real, só reproduzível com foco de janela verdadeiro** (nunca apareceu nos 9 testes
  automatizados do componente, jsdom não reproduz o cenário): o `DismissableLayer` do Radix
  `Popover` tratava o próprio clique que abria o campo como uma interação "de fora" (o campo
  vive dentro de `Popover.Anchor`, não `Trigger`, que é o único que o Radix reconhece como "de
  dentro"), fechando o painel no mesmo instante em que abria. Descoberto testando manualmente
  no navegador de preview com dados reais do backend (Empresa/Obra/Categoria carregando de
  verdade) — precisou trazer a aba para primeiro plano (`document.hasFocus()` precisa ser
  verdadeiro para reproduzir; o ambiente headless por padrão não tem foco real de janela).
  Corrigido desligando esse mecanismo redundante do Radix, já que o componente já fecha
  sozinho via `onBlur`. Confirmado depois, em teste manual completo: abrir, filtrar por texto,
  selecionar por clique, e cadastro rápido de ponta a ponta (inclusive o toast de erro global
  aparecendo automaticamente quando o backend caiu no meio do teste, sem código extra).
- Erro de cadastro rápido não tem tratamento próprio — reaproveita o toast global já existente
  (`QueryProvider`/`MutationCache`).

Build, testes (frontend 143/143 — 131 anteriores + 9 de `AutocompleteField` + 3 novos em
`LancamentoForm`) e lint validados. Backend sem alteração nesta sprint.

Documentos atualizados: `architecture/arquitetura-tecnica-frontend.md` (Seção 5),
`pendencias.md` (Seção 9 — mudança de estratégia, regra definitiva de Faturamento Direto),
`roadmap.md`, `changelog.md`, `frontend/src/features/README.md`.

**Situação da rodada de evolução**: Sprint 2 (das agora 5, contando a Fase 1) concluída.
Sprints 3-5 não iniciadas, aguardando confirmação explícita do usuário a cada uma.

**Próximo passo**: Sprint 3 — Fluxo Financeiro (remoção de Liquidação Financeira e Ajuste
Financeiro, nova filosofia de Contas a Pagar/Receber como filtros da listagem existente, Conta
Bancária/Cartão sem apelido) — não iniciada nesta sessão. Também pendente, sem prazo definido:
a correção do achado de edição no meio do `CurrencyInput` (Seção 26), que o usuário optou por
adiar em favor de seguir com a Sprint 2 primeiro.
