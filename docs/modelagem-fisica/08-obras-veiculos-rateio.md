# Modelagem Física — `OBRA`, `VEÍCULO`, `RATEIO_DESPESA`
## Fase 3, Etapa 3.3.8

Categorias de tipo físico referenciam `arquitetura-fisica-banco.md`, Seção 5. Sem SQL.

**Validação prévia**: sem bloqueio (ver mensagem anterior). D9 (`OBRA.status`) e D10 (`VEÍCULO.tipo`) resolvidas — `CHECK`/`DEFAULT` já aplicados abaixo. D3 e D8 não afetam nenhuma coluna/constraint — só lógica de validação/edição de camada de aplicação.

---

## `obras` (OBRA)

**Finalidade**: contrato/projeto de terraplanagem executado para um Cliente.

| Coluna | Categoria de tipo | Obrigatória | FK / Observação |
|---|---|---|---|
| `id` | Identificador | Sim | PK |
| `cliente_id` | Identificador (FK) | Sim | → `clientes.id` |
| `nome` | Texto curto | Sim | — |
| `valor_contratado` | Monetário (`NUMERIC`) | Sim | — |
| `data_inicio` | Data | Sim | — |
| `data_prevista_termino` | Data | Sim | — |
| `data_real_termino` | Data | Não | Só existe quando a Obra é concluída |
| `status` | Enumerado/lista fechada | Sim | `A executar` / `Em andamento` / `Pausada` / `Concluída` — D9, `decisions.md` decisão #30. Default `A executar` |

**PK**: `id` — `pk_obras`

**FK**: `fk_obras_cliente` (`cliente_id` → `clientes.id`), `ON DELETE RESTRICT`.

**NOT NULL**: `id`, `cliente_id`, `nome`, `valor_contratado`, `data_inicio`, `data_prevista_termino`, `status`. `data_real_termino` nulável.

**UNIQUE**: nenhuma — o conceitual não declara cadastro único para Obra.

**CHECK**: `ck_obras_status` (`status IN ('A executar', 'Em andamento', 'Pausada', 'Concluída')`) — D9, `decisions.md` decisão #30.
- Sem `CHECK` de positividade em `valor_contratado` — o conceitual diz "deve ser um valor monetário válido", sem o qualificador "positivo" usado em outros campos `valor` da cadeia financeira.
- Sem `CHECK` de `data_prevista_termino` posterior a `data_inicio` — `03-obra.md` Seção 2 diz explicitamente que essa ordem "não está confirmada como validação obrigatória", apenas inferência lógica.
- Sem `CHECK` de transição de `status` (ex. impedir pular direto para `Concluída`) — a regra de transição confirmada em D9 é tratada como regra de aplicação, não constraint de banco, mesmo padrão já usado para `situacao_administrativa` de `LANÇAMENTO_FINANCEIRO`.

**DEFAULT**: `status` = `'A executar'` (D9).

**Índices previstos**: índice de FK padrão em `cliente_id`.

**Observações**:
- "Lucro por Obra", "custo direto", "custo rateado" não são campos desta tabela — sempre calculados em consulta sobre `lancamentos_financeiros` e `rateios_despesa` (princípios 6/8).
- Exclusividade entre `lancamentos_financeiros.obra_id` preenchido e a existência de `rateios_despesa` para o mesmo Lançamento é regra do relacionamento, não desta tabela — já registrada em `02-lancamento-financeiro.md`.

---

## `veiculos` (VEÍCULO)

**Finalidade**: bem da frota — dimensão de custo independente e simultânea à de Obra.

| Coluna | Categoria de tipo | Obrigatória | FK / Observação |
|---|---|---|---|
| `id` | Identificador | Sim | PK |
| `empresa_id` | Identificador (FK) | Sim | → `empresas.id` |
| `nome_identificacao` | Texto curto | Sim | — |
| `tipo` | Enumerado/lista fechada | Sim | `Caminhão` / `Escavadeira` / `Pá carregadeira` / `Trator` / `Rolo compactador` / `Veículo leve` / `Terceiro` / `Outro` — D10, `decisions.md` decisão #31 |
| `obra_atual_id` | Identificador (FK) | Não | → `obras.id`, nullável — alocação operacional corrente (D4) |

**PK**: `id` — `pk_veiculos`

**FK**: `fk_veiculos_empresa` (`empresa_id` → `empresas.id`), `ON DELETE RESTRICT`; `fk_veiculos_obra_atual` (`obra_atual_id` → `obras.id`), `ON DELETE RESTRICT`.

**NOT NULL**: `id`, `empresa_id`, `nome_identificacao`, `tipo`. `obra_atual_id` nulável.

**UNIQUE**: nenhuma.

**CHECK**: `ck_veiculos_tipo` (`tipo IN ('Caminhão', 'Escavadeira', 'Pá carregadeira', 'Trator', 'Rolo compactador', 'Veículo leve', 'Terceiro', 'Outro')`) — D10, `decisions.md` decisão #31.

**DEFAULT**: nenhum — `tipo` sem valor inicial natural confirmado; cadastro exige informar explicitamente.

**Índices previstos**: índice de FK padrão em `empresa_id` e em `obra_atual_id`.

**Observações**:
- "Custo do Veículo" não é campo desta tabela — consulta agregada sobre `lancamentos_financeiros` filtrada por `veiculo_id`.
- D4 resolvida (`decisions.md`, decisão #26): `obra_atual_id` adicionado — fato operacional de alocação corrente, independente da dimensão financeira (`lancamentos_financeiros.veiculo_id`/`obra_id`). Histórico de mudanças via `log_auditoria`, sem tabela dedicada.
- D10 resolvida (`decisions.md`, decisão #31): oito valores de `tipo` confirmados e implementados como `CHECK`. `Terceiro` separa custo de frota própria de equipamento locado; `Outro` é categoria residual sem regra especial.

---

## `rateios_despesa` (RATEIO_DESPESA)

**Finalidade**: distribuição manual de uma Despesa entre várias Obras, sem duplicar o valor original.

| Coluna | Categoria de tipo | Obrigatória | FK / Observação |
|---|---|---|---|
| `id` | Identificador | Sim | PK |
| `lancamento_financeiro_id` | Identificador (FK) | Sim | → `lancamentos_financeiros.id` |
| `obra_id` | Identificador (FK) | Sim | → `obras.id` |
| `valor_rateado` | Monetário (`NUMERIC`) | Sim | — |
| `criterio_informado` | Texto longo | Não | Anotação livre (inferência: opcional) |

**PK**: `id` — `pk_rateios_despesa`

**FKs**: `fk_rateios_despesa_lancamento_financeiro` (`lancamento_financeiro_id` → `lancamentos_financeiros.id`); `fk_rateios_despesa_obra` (`obra_id` → `obras.id`) — ambas `ON DELETE RESTRICT`.

**NOT NULL**: `id`, `lancamento_financeiro_id`, `obra_id`, `valor_rateado`. `criterio_informado` nulável.

**UNIQUE**: nenhuma. `(lancamento_financeiro_id, obra_id)` seria candidato plausível — `16-rateio-despesa.md` Seção 2 chega a sugerir que "uma mesma Obra não deveria aparecer duas vezes para o mesmo Lançamento", mas o próprio texto marca isso como "inferência, não confirmado explicitamente" — não presumido aqui, mesmo critério já usado para `PARCELA`/`USUÁRIO`.

**CHECK**: nenhum previsto. Sem `CHECK` de positividade em `valor_rateado` — o texto-fonte não usa o qualificador "positivo" para este campo especificamente (só descreve a regra de soma, ver abaixo).

**Fora do escopo de `CHECK`** (regra multi-tabela/multi-linha, camada de aplicação — `arquitetura-fisica-banco.md` §6):
- Soma de `valor_rateado` de todos os registros de um mesmo `lancamento_financeiro_id` deve corresponder exatamente a `lancamentos_financeiros.valor`, com tolerância restrita ao arredondamento da menor unidade monetária (Decisão 10) — nunca tolerância de negócio maior.
- Exclusividade com `lancamentos_financeiros.obra_id` preenchido — mesma regra já registrada em `02-lancamento-financeiro.md`, vista aqui do lado de `RATEIO_DESPESA`.

**DEFAULT**: nenhum.

**Índices previstos**: um por FK (`lancamento_financeiro_id`, `obra_id`).

**Observações**:
- **D3, resolvida (`decisions.md`, decisão #25).** Um Lançamento pode existir com rateio incompleto (soma < valor) por tempo indeterminado, sem prazo para fechamento — confirmado pela operação real. A regra de soma (acima) é validada pela aplicação no **fechamento** do rateio, não a cada escrita. Nenhuma coluna ou constraint desta tabela precisou mudar — a completude é sempre calculada por comparação, nunca persistida.
- **D8, resolvida (`decisions.md`, decisão #29).** Decisão de negócio: `valor_rateado`/`obra_id` permanecem livremente editáveis mesmo depois de o Lançamento já ter Aplicação de Liquidação vinculada — nenhum mecanismo equivalente a `AJUSTE_FINANCEIRO` foi criado. Nenhuma constraint de imutabilidade aplicada a esta tabela, por escolha deliberada, não por lacuna.
- Criação de múltiplos Rateios de um mesmo Lançamento, quando dividido entre várias Obras, é candidata natural a atomicidade de camada de aplicação — mesmo padrão já usado em outras tabelas com criação múltipla relacionada (ex. Parcelas de uma Compra/Contrato).

---

*Nenhuma outra entidade foi modelada nesta etapa.*
