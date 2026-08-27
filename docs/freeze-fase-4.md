# Congelamento da Fase 4
## Sistema Financeiro/Gerencial H Vieira Terraplanagem

**Data do congelamento**: 2026-08-19

---

## Objetivo

Registrar formalmente o encerramento da Fase 4 (Backend) e autorizar o início da Fase 5
(Frontend), com o escopo de encerramento explicitado abaixo.

Este documento é um marco — não uma nova fonte de regras de negócio, arquitetura ou decisão.
Onde qualquer afirmação aqui divergir dos documentos fonte de verdade (`handoff.md`, Seção 4),
os documentos fonte de verdade prevalecem.

---

## Escopo validado

- [x] Modelo de domínio implementado — 24 módulos, em Clean Architecture (`domain`,
      `application`, `interfaces/http`, `infrastructure`), incorporando as decisões #12 a #40
- [x] Persistência via Hibernate/JPA (Spring Data JPA), migrations Flyway sobre o schema já
      congelado na Fase 3
- [x] Módulo de consulta compartilhado (`application/consultasfinanceiras`) implementado,
      conforme desenho arquitetural da decisão #35 (A6)
- [x] Lacunas de fórmula encontradas durante a implementação (divisão de parcelas de Compra
      no Cartão, decisão #39; estrutura de parcelamento e credor do Contrato Financeiro,
      decisão #40) resolvidas por resposta de negócio direta

## Escopo explicitamente fora do encerramento — adiado para a Fase 5

Por decisão registrada em `decisions.md`, decisão #41, **cinco decisões técnicas já
congeladas continuam sem implementação em código**, deliberadamente adiadas para a Fase 5
(etapa de segurança) — ver `pendencias.md`, Seção 7 (itens S1-S5):

- [ ] T3 — Autenticação (JWT/Argon2, decisão #14; transporte via cookie httpOnly definido em T11, decisão #48) → `pendencias.md`, S1
- [ ] A2 — RBAC + escopo por Empresa (decisão #16) → `pendencias.md`, S2
- [ ] A4 — Dois pontos de checagem de permissão (decisão #15) → `pendencias.md`, S3
- [ ] A5 — Aspecto automático de auditoria/`LOG_AUDITORIA` (decisão #18) → `pendencias.md`, S4
- [ ] A8 — Barreira de reautenticação para Ação de IA de nível Alto (decisão #22) →
      `pendencias.md`, S5

Nenhuma dessas cinco decisões foi reaberta ou alterada — permanecem congeladas exatamente
como registradas. O que muda é só o momento de implementação. Enquanto essas cinco não forem
implementadas, **todos os endpoints do backend permanecem publicamente acessíveis, sem
autenticação nem escopo por Empresa** (`infrastructure/auth/SecurityConfig.java`) — estado
aceito explicitamente, não uma falha a corrigir silenciosamente.

---

## Resultado do encerramento

- A Fase 4 é considerada encerrada com o escopo acima — código implementado e auditado para
  os 24 módulos de domínio; segurança/autorização/auditoria adiadas para a Fase 5, com
  dependência formal registrada, não implícita.
- `pendencias.md` ganhou a Seção 7 (Segurança — implementação adiada da Fase 4), com os itens
  S1-S5, todos apontando para `decisions.md`, decisão #41.
- **A Fase 5 não pode ser considerada tecnicamente completa sem S1-S5 resolvidos** — a
  arquitetura técnica do Frontend (login, rotas protegidas, UI condicionada a papel/Empresa)
  pode ser desenhada considerando esse contrato, mas sua implementação final depende dessas
  cinco peças existirem no backend.

---

## Regra de evolução

A partir deste marco, alterações no backend só devem ocorrer quando decorrentes de
necessidades reais identificadas durante a implementação da Fase 5, a resolução de S1-S5, ou
a evolução funcional do sistema.

**Não reabrir nenhuma das 41 decisões registradas em `decisions.md` apenas por refinamento
teórico.** Qualquer mudança futura é, ela mesma, uma nova decisão, proposta e registrada com
a mesma formalidade, nunca uma reinterpretação silenciosa de uma decisão existente.

---

*A partir deste congelamento, o projeto avança para a Fase 5 — Frontend, com S1-S5
(`pendencias.md`, Seção 7) como dependência explícita herdada da Fase 4.*
