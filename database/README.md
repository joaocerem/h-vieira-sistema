# database/ — MATERIAL LEGADO (Fase 3)

> **LEGADO — NÃO USAR PARA O ESTADO ATUAL DO BANCO.**
> A referência vigente do schema são as **migrations Flyway** em
> `backend/src/main/resources/db/migration/` (V1 a V19).

## O que é esta pasta

Entrega da **Fase 3 (modelagem física do banco)**: o SQL PostgreSQL gerado a partir de
`docs/modelagem-fisica/` (tabelas em `02_tables/`, `03_constraints.sql`, `04_indexes.sql`).

Na Fase 4 esses scripts serviram de ponto de partida das migrations Flyway — `V1` a `V11` são
cópias idênticas dos arquivos de `02_tables/`, e `V12`/`V13` são cópias idênticas de
`03_constraints.sql`/`04_indexes.sql` (`docs/freeze-fase-4.md`: "migrations Flyway sobre o schema já congelado na Fase 3").
**Depois disso, só as migrations evoluíram. Esta pasta ficou congelada.**

## Por que não representa o banco atual

- Não contém as tabelas e alterações criadas depois (conciliação bancária — `V15`, ajustes de
  Contrato Financeiro e Lançamento — `V14`/`V16`, remoção de `apelido` — `V17`, vínculo N:N de
  conciliação — `V18`).
- Ainda cria estruturas **removidas na Sprint 3**: `liquidacoes_financeiras`,
  `aplicacoes_de_liquidacao` e `ajustes_financeiros` (removidas pela `V19`; ver
  `docs/decisions.md`, decisão #51), além de colunas que deixaram de existir.

## Regras para quem (pessoa ou IA) trabalhar neste repositório

- Para saber o estado do banco, ler as migrations Flyway — **nunca** estes scripts.
- Novas alterações de schema são feitas **somente** com novas migrations Flyway.
- Estes arquivos são mantidos intactos por princípio de modelagem 5 ("fatos históricos não são
  reescritos", `docs/principios-de-modelagem.md`). Não os edite para "atualizar" o schema.
