# Roadmap

## Fase 1
- [x] Arquitetura conceitual

## Fase 2
- [x] Arquitetura técnica
  - Consolidação documental: Etapas 1-7 concluídas — Fase 2 encerrada

## Fase 3
- [x] Modelagem do banco
  - Modelagem física concluída: modelo lógico, convenções físicas e modelagem por entidade; schema PostgreSQL implementado (tabelas, constraints, índices); `05_views.sql` e `07_triggers.sql` adiados, `06_functions.sql` descartado

## Fase 4
- [ ] Backend
  - T1 (linguagem/framework/gerenciador de dependências/ORM) definida: Java 21 LTS + Spring Boot + Maven + Hibernate/JPA — ver `decisions.md`, decisão #12
  - A1 (estilo de arquitetura de software) definida: Clean Architecture, com Hexagonal/Ports & Adapters tratado como a mesma alternativa arquitetural — ver `decisions.md`, decisão #13
  - T3 (estratégia de autenticação) definida: autenticação própria, Spring Security + JWT, hash de senha com Argon2 (bcrypt só como alternativa documentada), sem provedor externo — ver `decisions.md`, decisão #14
  - A4 (mecanismo dos dois pontos de checagem de permissão) definida: Spring Security Method Security (ponto por ação) + Hibernate/JPA Filters via `@FilterDef`/`@Filter` (ponto por escopo de Empresa) — ver `decisions.md`, decisão #15
  - A2 (modelo de permissões de usuário) definida: RBAC + escopo por Empresa — ver `decisions.md`, decisão #16
  - A3 (cruzamento entre papel de usuário e níveis de confirmação da IA) definida: Papel → nível máximo — ver `decisions.md`, decisão #17
  - A5 (mecanismo técnico de auditoria automática) definida: aspecto customizado (Spring AOP, `@Around`), interceptando cada caso de uso de escrita e gravando em `LOG_AUDITORIA` na mesma transação da escrita de negócio — ver `decisions.md`, decisão #18
  - Mecanismo do módulo de consulta compartilhado (`application/consultas-financeiras`) definido: serviço de aplicação (Application Service/Facade) sobre Spring Data JPA — decisão técnica independente, sem código de pendência associado — ver `decisions.md`, decisão #19. Desenho arquitetural do módulo (responsabilidade, consumidores, categorias de consulta, contrato) definido — ver `decisions.md`, decisão #35; A6 resolvida. Métodos concretos e fórmulas internas permanecem para quando cada funcionalidade for especificada
  - B4 (implementação técnica do vínculo genérico de auditoria) definida: referência polimórfica (`entidade_tipo`/`entidade_id`), sem FK nativa do banco, validação de existência na camada de aplicação — ver `decisions.md`, decisão #20. Estratégia de índice (B3) resolvida em nível arquitetural — ver `decisions.md`, decisão #37; indexação das colunas de referência genérica segue o mesmo critério objetivo
  - D7 (vínculo direto `LANÇAMENTO_FINANCEIRO` ↔ `EMPRESA`) definida: `empresa_id` obrigatório desde a criação em `LANÇAMENTO_FINANCEIRO`, com validação de consistência com `VEÍCULO.empresa_id` na camada de aplicação; `AÇÃO_PROPOSTA_IA` ganha `empresa_id`/status "Aguardando Empresa" — ver `decisions.md`, decisão #21. Demais decisões da Fase 4 permanecem em aberto — ver `pendencias.md`

## Fase 5
- [ ] Frontend

## Fase 6
- [ ] IA

## Fase 7
- [ ] Integração bancária