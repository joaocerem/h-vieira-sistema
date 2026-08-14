# Modelagem Física — `SUGESTÃO_IA`, `AÇÃO_PROPOSTA_IA`, `LOG_AUDITORIA`
## Fase 3, Etapa 3.3.9

Categorias de tipo físico referenciam `arquitetura-fisica-banco.md`, Seção 5. Sem SQL.

**Validação prévia**: bloqueio parcial (ver mensagem anterior) — **B4** afeta só as colunas de referência genérica das 3 tabelas (sem FK, sem escolha de mecanismo). Restante modelado integralmente.

---

## `sugestoes_ia` (SUGESTÃO_IA)

**Finalidade**: proposta de classificação (categoria, classificação operacional, obra, veículo) feita pela IA, pendente de confirmação — nunca grava diretamente.

| Coluna | Categoria de tipo | Obrigatória | FK / Observação |
|---|---|---|---|
| `id` | Identificador | Sim | PK |
| `entidade_alvo_tipo` | Texto curto | Sim | Restrito a 2 valores fechados (Movimentação Bancária / Lançamento Financeiro) — **sem `FK`, mecanismo pendente (B4)** |
| `entidade_alvo_id` | Identificador | Sim | **Sem `FK`** — mesma pendência |
| `campo_sugerido` | Texto curto | Sim | — |
| `valor_sugerido` | Texto curto | Sim | Tipo real depende de `campo_sugerido` — não resolvido nesta etapa |
| `justificativa` | Texto longo | Sim | — |
| `status` | Enumerado — inferido, não confirmado literalmente | Sim | Default `Pendente` |
| `grupo_sugestao_id` | Identificador (FK) | Não | → `sugestoes_ia.id` (auto-referência) — só apresentação |

**PK**: `id` — `pk_sugestoes_ia`

**FK**: `fk_sugestoes_ia_grupo_sugestao` (`grupo_sugestao_id` → `sugestoes_ia.id`), `ON DELETE RESTRICT`.

**NOT NULL**: `id`, `entidade_alvo_tipo`, `entidade_alvo_id`, `campo_sugerido`, `valor_sugerido`, `justificativa`, `status`. `grupo_sugestao_id` nulável.

**UNIQUE**: nenhuma.

**CHECK**:
- `ck_sugestoes_ia_campo_sugerido` — `campo_sugerido` ∈ {categoria, classificação, obra, veículo} (lista afirmada diretamente, `22-sugestao-ia.md` Seção 2, sem hedge de inferência).
- `ck_sugestoes_ia_entidade_alvo_tipo` — `entidade_alvo_tipo` ∈ {Movimentação Bancária, Lançamento Financeiro}.

**Sem `CHECK` de `status`**: os 4 valores citados (`Pendente`/`Confirmada`/`Editada`/`Rejeitada`) são explicitamente marcados como "inferência razoável... não enumerados literalmente no conceitual" (`22-sugestao-ia.md` Seção 2) — não presumidos aqui como lista fechada.

**DEFAULT**: `status` = `'Pendente'` — esse valor específico é confirmado diretamente no texto-fonte, mesmo a lista completa não sendo.

**Índices previstos**: índice de FK padrão em `grupo_sugestao_id`. `(entidade_alvo_tipo, entidade_alvo_id)` é candidato natural, mas a estratégia exata depende do mecanismo de B4 — não decidida.

**Observações**:
- **Sem coluna para "quem confirmou"** — a autoria da confirmação vive exclusivamente em `logs_auditoria` (mesmo princípio já usado em `02-usuario.md`: entidades de negócio não duplicam autoria, que é centralizada no log).
- Regra 29 (nunca fundir `categoria` e `classificação` na mesma sugestão) já é garantida estruturalmente — cada linha representa um único `campo_sugerido`; duas mudanças exigem duas linhas, sem constraint adicional necessária.
- `grupo_sugestao_id` nunca deve ser usado para inferir confirmação em lote sem revisão individual — regra de comportamento da aplicação, sem impacto na estrutura.
- **Referência genérica (`entidade_alvo_tipo`/`entidade_alvo_id`) — B4, sem solução aqui.** Nenhum mecanismo (referência polimórfica, duas FKs mutuamente exclusivas, ou outro) foi escolhido; ambos continuam só candidatos em `22-sugestao-ia.md` Seção 7.

---

## `acoes_propostas_ia` (AÇÃO_PROPOSTA_IA)

**Finalidade**: proposta de criação/alteração de registro feita pela IA a partir de linguagem natural, pendente de confirmação — nunca executa sem confirmação explícita.

| Coluna | Categoria de tipo | Obrigatória | FK / Observação |
|---|---|---|---|
| `id` | Identificador | Sim | PK |
| `tipo_acao` | Texto curto | Sim | Catálogo não enumerado — **I1, aberta** |
| `dados_propostos` | Texto longo | Sim | Estrutura variável conforme `tipo_acao` — forma física não resolvida |
| `nivel_sensibilidade` | Enumerado — fechado (Baixo / Médio / Alto) | Sim | — |
| `status` | Enumerado — inferido, não confirmado literalmente | Sim | Default `Pendente` |

**PK**: `id` — `pk_acoes_propostas_ia`

**FK**: nenhuma.

**NOT NULL**: `id`, `tipo_acao`, `dados_propostos`, `nivel_sensibilidade`, `status`.

**UNIQUE**: nenhuma.

**CHECK**:
- `ck_acoes_propostas_ia_nivel_sensibilidade` — `nivel_sensibilidade` ∈ {Baixo, Médio, Alto} (afirmado diretamente, "um dos três valores da Seção 11 do conceitual").

**Sem `CHECK` de `tipo_acao`**: catálogo não enumerado taxativamente — **I1**, sem inferência, sem lista.
**Sem `CHECK` de `status`**: mesma ressalva de `sugestoes_ia` — inferência não confirmada literalmente.

**DEFAULT**: `status` = `'Pendente'` (mesma base que `sugestoes_ia`).

**Índices previstos**: nenhum previsto nesta etapa (tabela sem FK).

**Observações**:
- **Sem coluna para "registro real gerado".** A relação "Ação Proposta IA → registro gerado, 0:1" (`23-acao-proposta-ia.md` Seção 3) **não é atributo persistido** — ausente da Seção 2 daquele documento e de `modelo-logico.md` §3.23. Não foi inventada aqui nenhuma coluna para representá-la; o vínculo, quando existir, é rastreável indiretamente via `logs_auditoria` (origem "Ação de IA Confirmada" + referência à Ação).
- **Confirmação da política de auditoria (Decisão 8)**: como esta tabela não tem nenhuma coluna apontando para um registro gerado, não há como ela, por construção, referenciar `AJUSTE_FINANCEIRO` — nada aqui contradiz a Decisão 8 ("`AJUSTE_FINANCEIRO` nunca é gerado por `AÇÃO_PROPOSTA_IA`").
- **Sem coluna para "quem confirmou"** — mesma razão de `sugestoes_ia`.
- Barreira de confirmação reforçada para `nível_sensibilidade` = Alto: mecanismo exato é pendência **A8**, não modelado como constraint física — comportamento de aplicação.

---

## `logs_auditoria` (LOG_AUDITORIA)

**Finalidade**: histórico granular (por campo) de alteração de qualquer entidade financeira relevante.

| Coluna | Categoria de tipo | Obrigatória | FK / Observação |
|---|---|---|---|
| `id` | Identificador | Sim | PK |
| `entidade` | Texto curto | Sim | Lista fechada de entidades auditáveis — **ainda não compilada** (`24-log-auditoria.md` Seção 7); **sem `FK`, mecanismo pendente (B4)** |
| `entidade_id` | Identificador | Sim | **Sem `FK`** — mesma pendência |
| `campo_alterado` | Texto curto | Sim | — |
| `valor_anterior` | Texto longo | Sim | Tipo real depende do campo original; obrigatório mesmo vazio (registro de criação) |
| `valor_novo` | Texto longo | Sim | Idem |
| `data_hora` | Data/hora (`TIMESTAMPTZ`) | Sim | — |
| `usuario_id` | Identificador (FK) | Condicional | → `usuarios.id` — obrigatório quando `origem` ≠ Importação Bancária |
| `origem` | Enumerado — fechado (Manual / Importação Bancária / Sugestão de IA Confirmada / Ação de IA Confirmada) | Sim | — |
| `referencia_tipo` | Texto curto | Condicional | Sugestão IA / Ação Proposta IA — só quando `origem` é uma das duas confirmadas; **sem `FK`** |
| `referencia_id` | Identificador | Condicional | Idem — **sem `FK`** |

**PK**: `id` — `pk_logs_auditoria`

**FK**: `fk_logs_auditoria_usuario` (`usuario_id` → `usuarios.id`), `ON DELETE RESTRICT`.

**NOT NULL**: `id`, `entidade`, `entidade_id`, `campo_alterado`, `valor_anterior`, `valor_novo`, `data_hora`, `origem`. `usuario_id`/`referencia_tipo`/`referencia_id` nuláveis a nível de coluna — obrigatoriedade condicional resolvida via `CHECK`.

**UNIQUE**: nenhuma.

**CHECK**:
- `ck_logs_auditoria_origem` — `origem` ∈ 4 valores fechados (afirmados diretamente, Seção 12 do conceitual).
- `ck_logs_auditoria_usuario_condicional` — (`origem` = Importação Bancária ⇒ `usuario_id` nulo) e (`origem` ≠ Importação Bancária ⇒ `usuario_id` preenchido). Regra fechada e objetiva (Seção 2, "não se aplica quando origem é Importação Bancária").
- `ck_logs_auditoria_referencia_condicional` — `referencia_tipo`/`referencia_id` preenchidos se e somente se `origem` ∈ {Sugestão de IA Confirmada, Ação de IA Confirmada} (regra explícita, "obrigatória quando origem = Sugestão/Ação de IA Confirmada", Seção 4).

**Sem `CHECK` de `entidade`**: a lista fechada de entidades auditáveis existe como conceito, mas ainda não foi compilada em nenhum artefato — impossível enumerar valores que não existem em lugar nenhum ainda.

**DEFAULT**: nenhum.

**Índices previstos**: índice de FK padrão em `usuario_id`. `(entidade, entidade_id)` é candidato natural para consulta de histórico por registro — estratégia exata depende do mecanismo de B4, não decidida.

**Observações**:
- **Imutabilidade — confirmada, não pendência.** Todos os campos desta entidade são imutáveis após criação, sem exceção (`24-log-auditoria.md` Seção 5) — mesma reserva de mecanismo (trigger/privilégio) já usada nas demais tabelas, não decidida aqui.
- Toda escrita relevante em entidade auditável deve gerar, na mesma transação, uma linha aqui — mecanismo automático e ciente de contexto já exigido por `arquitetura-tecnica.md` §10, não decisão nova.
- **Referência genérica (`entidade`/`entidade_id`; `referencia_tipo`/`referencia_id`) — B4, sem solução aqui.** Nenhum mecanismo físico foi escolhido; a forma conceitual (entidade única, referência restrita a lista fechada) permanece a única parte já decidida (Decisão 3).

---

*Nenhuma outra entidade foi modelada nesta etapa.*
