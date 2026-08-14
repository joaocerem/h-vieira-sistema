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