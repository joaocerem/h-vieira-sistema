# Changelog

## 2026-08-13

### Adicionado

- Estrutura inicial do projeto
- Documentação da arquitetura conceitual
- Documentação da arquitetura técnica
- Criação das pastas do projeto
- Definição das regras do projeto
- Princípios de modelagem do domínio (7 princípios normativos)
- Incorporação das 11 decisões consolidadas ao modelo de domínio (24 entidades)
- Consolidação da arquitetura técnica num único documento corrente (fusão com a arbitragem técnica)
- Lista mestra de pendências do projeto (`pendencias.md`)
- Reorganização dos documentos de processo superados em pastas `historico/` (`architecture/` e `domain-model/`)

### Corrigido

- Relação `Compra Cartão → Fatura` em `18-compra-cartao.md`, corrigida para refletir o vínculo indireto via Parcela

## 2026-08-14

### Adicionado

- Modelagem física do banco de dados concluída: modelo lógico (`modelo-logico.md`), convenções físicas globais (`arquitetura-fisica-banco.md`) e modelagem por entidade (`docs/modelagem-fisica/01-cadastros-basicos.md` a `09-ia-auditoria.md`)
- Scripts SQL de criação de tabelas (`database/02_tables/`)
- Constraints do schema físico (`database/03_constraints.sql`)
- Índices do schema físico (`database/04_indexes.sql`)
- Plano de implementação SQL (`plano-implementacao-sql.md`), definindo a ordem de criação das tabelas e registrando formalmente os itens adiados/descartados

### Adiado / Descartado

- `05_views.sql` adiado por completo — bloqueios de ambiguidade de domínio em 5 das 6 views candidatas (ver `plano-implementacao-sql.md`)
- `06_functions.sql` descartado — nenhuma function especificada em nenhum documento do projeto; a lógica correspondente permanece na camada de aplicação, por decisão arquitetural já congelada
- `07_triggers.sql` adiado por completo — bloqueios de mecanismo de implementação não escolhido e de regras de negócio ainda pendentes (16 triggers candidatas, ver `plano-implementacao-sql.md`)

### Corrigido

- Pendência **A5** (mecanismo técnico de auditoria automática) acrescentada à tabela "Pendências que permanecem abertas" de `plano-implementacao-sql.md`, deixando explícito que bloqueia exclusivamente `07_triggers.sql`
- Estado do projeto em `handoff.md` (Seção 1, Seção 2, Seção 4, Seção 6, Seção 12) atualizado para refletir a conclusão da Fase 3, que ainda estava descrita como não iniciada

### Decidido

- **T1 — Linguagem/framework de backend** congelada: Java 21 LTS + Spring Boot, com Maven como gerenciador de dependências e Hibernate/JPA como ORM principal — decisão registrada em `decisions.md`, decisão #12. Documentos atualizados: `arquitetura-tecnica.md` (Seção 5.1 e Seção 15), `pendencias.md` (T1 movida para resolvida; B2 atualizada), `decisions.md` (nova Seção E, decisão #12), `handoff.md` (Seção 1 e Seção 2), `roadmap.md` (Fase 4)
- **A1 — Estilo de arquitetura de software** congelada: Clean Architecture, com o vocabulário de Ports & Adapters (Hexagonal) tratado como a mesma alternativa arquitetural (diferença só de vocabulário/ênfase) — decisão registrada em `decisions.md`, decisão #13; a estrutura de pastas de `arquitetura-tecnica.md`, Seção 6, passa de recomendação a padrão oficial do backend. Documentos atualizados: `arquitetura-tecnica.md` (Seção 4 e Seção 15), `pendencias.md` (A1 movida para resolvida), `decisions.md` (decisão #13), `handoff.md` (Seção 1 e Seção 2), `roadmap.md` (Fase 4)
- **T3 — Estratégia de autenticação** congelada: autenticação própria, com Spring Security e JWT como mecanismo, hash de senha com Argon2 (preferencial; bcrypt só como alternativa documentada), sem provedor externo — decisão registrada em `decisions.md`, decisão #14. Documentos atualizados: `arquitetura-tecnica.md` (Seção 5.5 e Seção 15), `pendencias.md` (T3 movida para resolvida), `decisions.md` (decisão #14), `handoff.md` (Seção 1 e Seção 2), `roadmap.md` (Fase 4)
- **A4 — Mecanismo técnico dos dois pontos de checagem de permissão** congelada: composição de Spring Security Method Security (ponto por ação, no bean de aplicação) e Hibernate/JPA Filters via `@FilterDef`/`@Filter` (ponto por escopo de Empresa) — decisão registrada em `decisions.md`, decisão #15. Documentos atualizados: `arquitetura-tecnica.md` (Seção 11), `pendencias.md` (A4 movida para resolvida), `decisions.md` (decisão #15), `handoff.md` (Seção 1 e Seção 2), `roadmap.md` (Fase 4)
- **A2 — Modelo de permissões de usuário** congelada: RBAC + escopo por Empresa — decisão registrada em `decisions.md`, decisão #16. Documentos atualizados: `arquitetura-tecnica.md` (Seção 11 e Seção 15), `pendencias.md` (A2 movida para resolvida), `decisions.md` (decisão #16), `handoff.md` (Seção 1 e Seção 2), `roadmap.md` (Fase 4)
- **A3 — Cruzamento entre papel de usuário e níveis de confirmação da IA** congelada: Papel → nível máximo — decisão registrada em `decisions.md`, decisão #17. Documentos atualizados: `arquitetura-tecnica.md` (Seção 11 e Seção 15), `pendencias.md` (A3 movida para resolvida), `decisions.md` (decisão #17), `handoff.md` (Seção 1 e Seção 2), `roadmap.md` (Fase 4)
- **A5 — Mecanismo técnico de auditoria automática** congelada: aspecto customizado (Spring AOP, `@Around`), interceptando cada caso de uso de escrita, capturando o estado do registro antes e depois da operação e gravando em `LOG_AUDITORIA` na mesma transação da escrita de negócio, com o contexto de negócio completo exigido por `LOG_AUDITORIA` como parâmetro obrigatório de entrada — decisão registrada em `decisions.md`, decisão #18. Documentos atualizados: `arquitetura-tecnica.md` (Seção 10 e Seção 15), `pendencias.md` (A5 movida para resolvida), `decisions.md` (decisão #18), `handoff.md` (Seção 1 e Seção 2), `roadmap.md` (Fase 4)
- **Mecanismo do módulo de consulta compartilhado (`application/consultas-financeiras`)** congelado: serviço de aplicação (Application Service/Facade), com componentes Spring (`@Service`) sobre repositórios Spring Data JPA (Hibernate/JPA) — **decisão técnica independente, registrada sem código de pendência associado** (`decisions.md`, Seção D) — decisão registrada em `decisions.md`, decisão #19. Não resolve nenhuma pendência: o catálogo fechado de consultas/funções que o módulo expõe permanece pendência aberta, sem alteração — `pendencias.md`, item A6. Documentos atualizados: `arquitetura-tecnica.md` (Seção 6), `decisions.md` (decisão #19), `handoff.md` (Seção 1 e Seção 2), `roadmap.md` (Fase 4). `pendencias.md` **não foi alterado**.
- **B4 — Implementação técnica do vínculo genérico de auditoria** congelada: referência polimórfica (`entidade_tipo`/`entidade_id`, e os pares equivalentes em `LOG_AUDITORIA.referencia_tipo`/`referencia_id` e `SUGESTÃO_IA.entidade_alvo_tipo`/`entidade_alvo_id`), sem FK nativa do banco — integridade referencial mitigada, não eliminada, pela validação na camada de aplicação que grava os registros de auditoria; mapeada em Hibernate/JPA como campos simples, sem `@Any`/`@ManyToAny` — decisão registrada em `decisions.md`, decisão #20. A estratégia definitiva de indexação das colunas de referência genérica permanece subordinada a B3, ainda aberta. Documentos atualizados: `decisions.md` (decisão #20), `pendencias.md` (B4 movida para resolvida), `arquitetura-tecnica.md` (Seção 10 e Seção 15), `arquitetura-fisica-banco.md` (Seções 6, 8, 9, 10), `modelo-logico.md`, `docs/modelagem-fisica/09-ia-auditoria.md`, `plano-implementacao-sql.md`, `handoff.md` (Seção 1 e Seção 2), `roadmap.md` (Fase 4).
- **D7 — Vínculo direto `LANÇAMENTO_FINANCEIRO` ↔ `EMPRESA`** congelada: parte da definição de negócio, decidida durante esta resolução, de que todo `LANÇAMENTO_FINANCEIRO` pertence obrigatoriamente a uma `EMPRESA` desde sua criação. `empresa_id` (FK, `NOT NULL`) acrescentado a `LANÇAMENTO_FINANCEIRO`, com preenchimento/validação (incluindo consistência com `VEÍCULO.empresa_id`) na camada de aplicação, não trigger; `AÇÃO_PROPOSTA_IA` ganha `empresa_id` (FK, nullable) e o status "Aguardando Empresa", resolvendo a dependência circular com a permissão por escopo de Empresa identificada no Achado 5 da auditoria sistêmica — decisão registrada em `decisions.md`, decisão #21. Documentos atualizados: `decisions.md` (decisão #21), `pendencias.md` (D7 movida para resolvida), `domain-model/09-lancamento-financeiro.md`, `domain-model/23-acao-proposta-ia.md`, `modelo-logico.md`, `docs/modelagem-fisica/02-lancamento-financeiro.md`, `docs/modelagem-fisica/09-ia-auditoria.md`, `arquitetura-tecnica.md` (Seção 11), `handoff.md` (Seção 1 e Seção 2), `roadmap.md` (Fase 4). Schema físico já implementado também atualizado — primeira decisão a alterar SQL já construído: `database/02_tables/02_lancamentos_financeiros.sql` (coluna `empresa_id UUID NOT NULL`), `database/02_tables/09_ia_auditoria.sql` (coluna `empresa_id UUID` em `acoes_propostas_ia`, mais `CHECK` condicional com `status`), `database/03_constraints.sql` (FKs `fk_lancamentos_financeiros_empresa` e `fk_acoes_propostas_ia_empresa`), `database/04_indexes.sql` (dois novos índices de FK).