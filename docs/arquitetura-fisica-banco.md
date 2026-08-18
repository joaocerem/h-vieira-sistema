# Arquitetura Física do Banco de Dados
## Sistema Financeiro/Gerencial H Vieira Terraplanagem — Fase 3, Etapa 3.2

**SGBD oficial**: PostgreSQL. Decisão congelada nesta etapa (resolve `pendencias.md`, item B1) — sem alternativas em aberto.

**Fontes de verdade**: `arquitetura-conceitual.md` → `project-rules.md` → `principios-de-modelagem.md` → `domain-model/` → `modelo-logico.md` → `arquitetura-tecnica.md` → `decisions.md` → `pendencias.md` → `freeze-fase-2.md`. Documentos em `historico/` não são fonte de decisão.

Este documento define **convenções globais**, não schema. Nenhuma tabela, coluna, constraint ou índice de entidade específica é criado aqui — isso pertence à próxima etapa.

---

## 1. Objetivo

Ser a base física única e normativa para toda a implementação do banco: a camada entre `modelo-logico.md` (o quê) e o schema físico de cada uma das 24 entidades (como, exatamente). Toda modelagem física futura aplica estas convenções por padrão — desvios exigem justificativa explícita (princípio 7).

---

## 2. Convenções gerais

- **Idioma**: português, para todo nome de objeto do banco (tabela, coluna, constraint) — mantém correspondência direta com `modelo-logico.md` e o domínio, sem tradução mental.
- **Case**: `snake_case`, sem acentuação — nativo do PostgreSQL (identificador não citado é sempre minúsculo) e portável entre ferramentas.
- **Organização**: schema único (`public` ou schema nomeado do projeto) para o núcleo do domínio nesta fase; particionamento por schema, se necessário, é decisão de escalabilidade futura, fora de escopo aqui.
- **Colunas padrão**: nenhuma coluna técnica (`created_at`, `updated_at`) é adicionada por padrão a toda tabela — o domínio já resolve rastreabilidade via `LOG_AUDITORIA` (Seção 9); adicionar essas colunas redundaria com o princípio de fonte única da verdade (princípio 4).

---

## 3. Identificadores

- **Chave primária**: substituta (surrogate), gerada pelo banco — nunca chave natural, mesmo quando existe candidato (ex. `CATEGORIA.nome`). Alinhado à nota de identidade já presente em `domain-model/01-empresa.md`, aplicada uniformemente às 24 entidades.
- **Tipo da PK**: `UUID` (`gen_random_uuid()`, nativo do PostgreSQL 13+). *Por quê*: evita expor volume/sequência de registros financeiros; permite gerar o identificador antes da persistência (útil para os estados pendentes de `SUGESTÃO_IA`/`AÇÃO_PROPOSTA_IA`); uniforme em todas as tabelas sem exceção. Alternativa descartada: `BIGINT`/identity sequencial — mais compacto, mas expõe contagem de registros e não permite geração prévia à escrita.
- **Nome da coluna PK**: `id`, uniforme em todas as tabelas.
- **Nome da coluna FK**: `<referência>_id`, no papel semântico do relacionamento (ex. `empresa_id`, `categoria_id`; quando há duas FKs para a mesma tabela, o papel diferencia — `lancamento_original_id`/`lancamento_ajuste_id`, `movimentacao_origem_id`/`movimentacao_destino_id`), já assim nos documentos de entidade.
- **Constraint de PK**: `pk_<tabela>`.
- **Constraint de FK**: `fk_<tabela_origem>_<papel_ou_tabela_destino>`.

---

## 4. Convenções de nomenclatura

| Objeto | Padrão | Exemplo |
|---|---|---|
| Tabela | `snake_case`, plural, português | `lancamentos_financeiros` |
| Coluna | `snake_case`, singular, português | `data_competencia` |
| Índice | `idx_<tabela>_<coluna(s)>` | `idx_lancamentos_financeiros_obra_id` |
| PK | `pk_<tabela>` | `pk_lancamentos_financeiros` |
| FK | `fk_<tabela>_<papel>` | `fk_ajustes_financeiros_lancamento_original` |
| UNIQUE | `uq_<tabela>_<coluna>` | `uq_clientes_nome` |
| CHECK | `ck_<tabela>_<regra>` | `ck_lancamentos_financeiros_valor_positivo` |
| View | `vw_<descrição>` | `vw_saldo_conta_bancaria` — reservado a indicadores calculados (Seção 8 de `principios-de-modelagem.md`), nunca tabela física |
| Sequence | `seq_<finalidade>` | reservado a contador de negócio futuro; não usado para PK (Seção 3) |
| Trigger (futuro) | `trg_<tabela>_<evento>_<ação>` | `trg_log_auditoria_bloqueio_update` |

Tabela plural porque representa a coleção de registros, não o conceito de domínio (que permanece singular em toda a documentação) — reforça que a tabela é implementação, não o conceito em si.

---

## 5. Tipos físicos (por categoria, não aplicados a campos)

| Categoria | Tipo PostgreSQL | Uso |
|---|---|---|
| Identificador | `UUID` | toda PK/FK (Seção 3) |
| Monetário | `NUMERIC` (precisão exata) | qualquer `valor`/`valor_aplicado`/`valor_rateado` — nunca `FLOAT`/`REAL`, decorrência direta da Decisão 10 (tolerância restrita a arredondamento) |
| Percentual | `NUMERIC` (mesma família do monetário) | ex. `taxa` |
| Texto curto | `TEXT` com `CHECK` de tamanho quando aplicável, ou `VARCHAR(n)` | nomes, apelidos, identificadores textuais |
| Texto longo | `TEXT` | observações, justificativas, descrições |
| Data | `DATE` | fatos sem componente de horário (`data_competência`, `vencimento`) |
| Data/hora | `TIMESTAMPTZ` | eventos que exigem precisão temporal e ordenação exata (`LOG_AUDITORIA.data/hora`, `data_efetiva`) — sempre com fuso horário, nunca `TIMESTAMP` sem fuso, para eliminar ambiguidade |
| Booleano | `BOOLEAN` | indicadores binários (`contemplado`) |
| Enumerado/lista fechada | categoria reservada — mecanismo exato (`ENUM` nativo, `CHECK`, ou tabela de domínio) decidido campo a campo, quando cada enumeração é fechada. `OBRA.status` (D9) e `VEÍCULO.tipo` (D10) já resolvidas como `CHECK` (`decisions.md`, decisões #30 e #31). `PARCELA.status` (D11) não se tornou um campo enumerado — foi removida do modelo (`decisions.md`, decisão #32); a categoria física deixou de se aplicar a este campo |

Precisão e escala exatas de `NUMERIC`, e tamanho exato de `VARCHAR`, são decisão da modelagem física de cada campo — não desta etapa.

---

## 6. Integridade

- **NOT NULL**: aplicado sempre que a entidade já declara o atributo obrigatório em `modelo-logico.md` — nunca a critério da implementação.
- **UNIQUE**: só onde o conceitual declara explicitamente "cadastro único" (ex. `Cliente`, `Fornecedor`) — nunca presumido sem base textual.
- **CHECK**: reservado a regras já fechadas e objetivas (ex. `tipo` ∈ {Despesa, Receita}; valores monetários positivos; `OBRA.status`/D9 e `VEÍCULO.tipo`/D10, já fechadas — `decisions.md`, decisões #30 e #31) — nunca para enumerações ainda pendentes, nem para regra de negócio multi-tabela (essa vive na camada de aplicação, `arquitetura-tecnica.md` Seção 4). D11 não resultou em `CHECK` — `PARCELA.status` foi removida do modelo (`decisions.md`, decisão #32).
- **FOREIGN KEY**: aplicada a toda referência lógica do modelo, exceto as referências genéricas de escopo fechado (`LOG_AUDITORIA`, `SUGESTÃO_IA.entidade_alvo`, "registro real" de `AÇÃO_PROPOSTA_IA`), cuja técnica é a referência polimórfica definida em B4 (decisão #20) — ausência de FK é resultado deliberado dessa escolha, não pendência (Seção 9/10).
- **DEFAULT**: só onde o domínio já define um valor inicial claro (ex. `situação_administrativa` = Ativo; `classificação` = Não Classificada) — nunca inventado.

---

## 7. Exclusão e histórico

- **DELETE físico**: não utilizado em nenhuma entidade que represente fato financeiro, evento ou log — coerente com o princípio "nada desaparece" (princípio 5) e com `project-rules.md` ("nunca apagar lançamentos financeiros", "nunca remover auditoria"). Cadastros simples sem histórico vinculado podem, em tese, admitir exclusão física — decisão caso a caso da próxima etapa, não regra geral aqui.
- **CASCADE**: nunca usado em `ON DELETE CASCADE` sobre entidade financeira — excluir um registro-pai nunca apaga silenciosamente fatos dependentes.
- **RESTRICT**: política padrão para toda FK obrigatória do modelo. Exceção exige justificativa explícita registrada no momento (princípio 7).
- **Preservação de histórico**: entidades/campos já declarados imutáveis em `modelo-logico.md` (`LANÇAMENTO_FINANCEIRO.valor` após Aplicação, `APLICAÇÃO_DE_LIQUIDAÇÃO` inteira, `LOG_AUDITORIA` inteira, `MOVIMENTAÇÃO_BANCÁRIA` exceto `classificação`, `AJUSTE_FINANCEIRO.tipo_ajuste`/`valor`/`data`/`observação` — D13, `decisions.md` decisão #34) devem ter essa imutabilidade garantida no nível do schema, não só da aplicação — mecanismo exato (revogação de privilégio, trigger de bloqueio) é decisão da modelagem física de cada tabela.

---

## 8. Índices

**Estratégia definida em nível arquitetural (B3, `decisions.md` decisão #37)** — critério, não lista de colunas:

- `PK`, `FK` e `UNIQUE` permanecem parte do schema inicial (já implementado); toda FK recebe índice por padrão — PostgreSQL não cria índice automático em FK (diferente da PK).
- Índices adicionais entram no schema inicial **apenas** quando uma consulta ou regra de negócio já documentada demonstrar objetivamente sua necessidade — critério aplicado durante a implementação de cada módulo, às consultas já aprovadas (ex. categorias de A6, `decisions.md` decisão #35). Esta seção não congela nenhuma lista de colunas.
- Exemplos já documentados de aplicação do critério (não uma lista obrigatória): `obra_id`/`veiculo_id`/`data_competência` em `lancamentos_financeiros`; `vencimento` em `parcelas`.
- Qualquer outro índice só é criado depois, por medição real de desempenho (`EXPLAIN`, monitoramento ou testes com volume representativo) — nunca por suposição.

---

## 9. Auditoria

Requisitos que a implementação física deve obedecer, com a técnica exata já definida (B4, decisão #20):

- Toda entidade da lista fechada de entidades auditáveis deve ter suas alterações capturadas, por campo, em `LOG_AUDITORIA`, de forma automática — nunca dependente de chamada manual da aplicação (mecanismo já exigido por `arquitetura-tecnica.md`, Seção 10; não redecidido aqui).
- `LOG_AUDITORIA` é imune a `UPDATE`/`DELETE` no nível do schema (Seção 7), sem exceção.
- A referência genérica de `LOG_AUDITORIA.entidade`/`id` (e as equivalentes de `SUGESTÃO_IA`/`AÇÃO_PROPOSTA_IA`) permanece restrita à lista fechada de entidades auditáveis quando implementada — a técnica é a referência polimórfica definida em B4 (`decisions.md`, decisão #20), sem FK nativa; a validação de existência do registro referenciado é responsabilidade da camada de aplicação.
- Todo timestamp de auditoria usa `TIMESTAMPTZ` (Seção 5), para ordenação cronológica exata entre eventos.

---

## 10. Pendências que impactam a modelagem física

Só as que influenciam decisão física direta (lista completa e detalhada permanece em `pendencias.md`):

| Item | Impacto na modelagem física |
|---|---|
| B1 | **Resolvida nesta etapa** (PostgreSQL) — nota informativa, não mais pendência |
| B3 — estratégia de índice | **Resolvida** em nível arquitetural (`decisions.md` decisão #37) — critério objetivo definido (Seção 8); nenhuma lista de colunas congelada, aplicado módulo a módulo; nota informativa, não mais pendência |
| B4 — técnica do vínculo genérico | **Resolvida** (referência polimórfica, `decisions.md` decisão #20) — nota informativa, não mais pendência; estratégia de índice das colunas de referência genérica segue o mesmo critério de B3, aplicada quando houver necessidade objetiva demonstrada |
| D9 — enumeração de `OBRA.status` | **Resolvida** (A executar/Em andamento/Pausada/Concluída, `decisions.md` decisão #30) — implementada como `CHECK`; nota informativa, não mais pendência |
| D10 — enumeração de `VEÍCULO.tipo` | **Resolvida** (Caminhão/Escavadeira/Pá carregadeira/Trator/Rolo compactador/Veículo leve/Terceiro/Outro, `decisions.md` decisão #31) — implementada como `CHECK`; nota informativa, não mais pendência |
| D11 — existência de `PARCELA.status` | **Resolvida** (`decisions.md` decisão #32) — campo removido do modelo, não enumerado; estado da Parcela sempre calculado a partir de `vencimento`/`lancamento_financeiro_id`; nota informativa, não mais pendência |
| D12 — mutabilidade de `LIQUIDAÇÃO_FINANCEIRA` | **Resolvida** (imutável desde a criação, `decisions.md` decisão #33) — tabela append-only para esta entidade, sem `UPDATE` previsto; mecanismo exato de bloqueio ainda não escolhido; nota informativa, não mais pendência |
| D13 — mutabilidade e exclusão de `AJUSTE_FINANCEIRO` | **Resolvida** (imutável desde a criação; exclusão coberta pela regra geral de fato financeiro, `decisions.md` decisão #34) — tabela append-only, sem `UPDATE` previsto para `tipo_ajuste`/`valor`/`data`/`observação`; mecanismo exato de bloqueio ainda não escolhido; nota informativa, não mais pendência |

---

*Próxima etapa da Fase 3: modelagem física tabela a tabela, aplicando estas convenções — sujeita às pendências acima onde ainda abertas.*
