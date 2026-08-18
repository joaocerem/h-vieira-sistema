# Modelagem Física — `SUGESTÃO_IA`, `AÇÃO_PROPOSTA_IA`, `LOG_AUDITORIA`
## Fase 3, Etapa 3.3.9

Categorias de tipo físico referenciam `arquitetura-fisica-banco.md`, Seção 5. Sem SQL.

**Validação prévia**: bloqueio parcial já resolvido — **B4** (`decisions.md`, decisão #20) definiu as colunas de referência genérica das 3 tabelas como referência polimórfica, sem FK nativa por definição. Notas pontuais abaixo atualizadas; nenhuma coluna precisou ser alterada.

---

## `sugestoes_ia` (SUGESTÃO_IA)

**Finalidade**: proposta de classificação (categoria, classificação operacional, obra, veículo) feita pela IA, pendente de confirmação — nunca grava diretamente.

| Coluna | Categoria de tipo | Obrigatória | FK / Observação |
|---|---|---|---|
| `id` | Identificador | Sim | PK |
| `entidade_alvo_tipo` | Texto curto | Sim | Restrito a 2 valores fechados (Movimentação Bancária / Lançamento Financeiro) — **sem `FK` por definição (B4, referência polimórfica — `decisions.md` decisão #20)** |
| `entidade_alvo_id` | Identificador | Sim | **Sem `FK`** — mesma definição de B4; validação de existência é responsabilidade da camada de aplicação |
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

**Índices previstos**: índice de FK padrão em `grupo_sugestao_id`. `(entidade_alvo_tipo, entidade_alvo_id)` é implicação natural da referência polimórfica definida em B4 — segue o critério objetivo de B3 (`decisions.md` decisão #37) — indexação adicional só quando necessidade objetiva for demonstrada, não decidida antecipadamente aqui.

**Observações**:
- **Sem coluna para "quem confirmou"** — a autoria da confirmação vive exclusivamente em `logs_auditoria` (mesmo princípio já usado em `02-usuario.md`: entidades de negócio não duplicam autoria, que é centralizada no log).
- Regra 29 (nunca fundir `categoria` e `classificação` na mesma sugestão) já é garantida estruturalmente — cada linha representa um único `campo_sugerido`; duas mudanças exigem duas linhas, sem constraint adicional necessária.
- `grupo_sugestao_id` nunca deve ser usado para inferir confirmação em lote sem revisão individual — regra de comportamento da aplicação, sem impacto na estrutura.
- **Referência genérica (`entidade_alvo_tipo`/`entidade_alvo_id`) — B4, resolvida.** Referência polimórfica escolhida como mecanismo oficial (`decisions.md`, decisão #20); tabela de junção e FKs mutuamente exclusivas foram analisadas e descartadas. `22-sugestao-ia.md`, Seção 7, deve ser atualizada para refletir esta resolução.

---

## `acoes_propostas_ia` (AÇÃO_PROPOSTA_IA)

**Finalidade**: proposta de criação/alteração de registro feita pela IA a partir de linguagem natural, pendente de confirmação — nunca executa sem confirmação explícita.

| Coluna | Categoria de tipo | Obrigatória | FK / Observação |
|---|---|---|---|
| `id` | Identificador | Sim | PK |
| `tipo_acao` | Texto curto | Sim | Catálogo não enumerado — **I1, aberta** |
| `dados_propostos` | Texto longo | Sim | Estrutura variável conforme `tipo_acao` — forma física não resolvida |
| `nivel_sensibilidade` | Enumerado — fechado (Baixo / Médio / Alto) | Sim | — |
| `status` | Enumerado — inferido, não confirmado literalmente, mais "Aguardando Empresa" (D7) | Sim | Default `Pendente`, ou `'Aguardando Empresa'` quando `empresa_id` não puder ser determinado no momento da proposta |
| `empresa_id` | Identificador (FK) | Condicional | → `empresas.id` — nulo enquanto `status` = `'Aguardando Empresa'`; obrigatório para confirmação (D7, `decisions.md` decisão #21) |

**PK**: `id` — `pk_acoes_propostas_ia`

**FK**: `fk_acoes_propostas_ia_empresa` (`empresa_id` → `empresas.id`), `ON DELETE RESTRICT`.

**NOT NULL**: `id`, `tipo_acao`, `dados_propostos`, `nivel_sensibilidade`, `status`. `empresa_id` nulável a nível de coluna — obrigatoriedade condicional resolvida via `CHECK` (abaixo).

**UNIQUE**: nenhuma.

**CHECK**:
- `ck_acoes_propostas_ia_nivel_sensibilidade` — `nivel_sensibilidade` ∈ {Baixo, Médio, Alto} (afirmado diretamente, "um dos três valores da Seção 11 do conceitual").
- `ck_acoes_propostas_ia_empresa_condicional` — (`status` = `'Aguardando Empresa'` ⇒ `empresa_id` nulo) e (`status` ≠ `'Aguardando Empresa'` ⇒ `empresa_id` preenchido), a partir do momento em que a proposta deixa esse estado (D7, `decisions.md` decisão #21).

**Sem `CHECK` de `tipo_acao`**: catálogo não enumerado taxativamente — **I1**, sem inferência, sem lista.
**Sem `CHECK` de `status`**: mesma ressalva de `sugestoes_ia` — inferência não confirmada literalmente; o quinto valor ("Aguardando Empresa") é o único, entre os cinco, decidido tecnicamente (D7), não apenas inferido.

**DEFAULT**: `status` = `'Pendente'` (mesma base que `sugestoes_ia`).

**Índices previstos**: índice de FK padrão em `empresa_id` (política padrão, `arquitetura-fisica-banco.md` §8) — primeiro índice desta tabela, que antes não tinha nenhuma FK.

**Observações**:
- **Sem coluna para "registro real gerado".** A relação "Ação Proposta IA → registro gerado, 0:1" (`23-acao-proposta-ia.md` Seção 3) **não é atributo persistido** — ausente da Seção 2 daquele documento e de `modelo-logico.md` §3.23. Não foi inventada aqui nenhuma coluna para representá-la; o vínculo, quando existir, é rastreável indiretamente via `logs_auditoria` (origem "Ação de IA Confirmada" + referência à Ação).
- **Confirmação da política de auditoria (Decisão 8)**: como esta tabela não tem nenhuma coluna apontando para um registro gerado, não há como ela, por construção, referenciar `AJUSTE_FINANCEIRO` — nada aqui contradiz a Decisão 8 ("`AJUSTE_FINANCEIRO` nunca é gerado por `AÇÃO_PROPOSTA_IA`").
- **Sem coluna para "quem confirmou"** — mesma razão de `sugestoes_ia`.
- Barreira de confirmação reforçada para `nível_sensibilidade` = Alto: mecanismo definido como reautenticação (senha) — **A8**, `decisions.md`, decisão #22 — não modelado como constraint física, é comportamento de aplicação (nenhum campo novo em nenhuma tabela).
- **`empresa_id` e o status "Aguardando Empresa" (D7, `decisions.md` decisão #21)**: resolvem a dependência circular entre esta entidade e a permissão por escopo de Empresa (Achado 5, auditoria sistêmica) — quando a IA não consegue determinar a Empresa do Lançamento que está propondo criar, a proposta é persistida mesmo assim, com `empresa_id` nulo e `status` = `'Aguardando Empresa'`; a checagem de escopo por Empresa (A4, ponto ii) só precisa ocorrer na confirmação, quando `empresa_id` já estará preenchido.

---

## `logs_auditoria` (LOG_AUDITORIA)

**Finalidade**: histórico granular (por campo) de alteração de qualquer entidade financeira relevante.

| Coluna | Categoria de tipo | Obrigatória | FK / Observação |
|---|---|---|---|
| `id` | Identificador | Sim | PK |
| `entidade` | Texto curto | Sim | Lista fechada de entidades auditáveis — **ainda não compilada** (`24-log-auditoria.md` Seção 7); **sem `FK` por definição (B4, referência polimórfica — `decisions.md` decisão #20)** |
| `entidade_id` | Identificador | Sim | **Sem `FK`** — mesma definição de B4; validação de existência é responsabilidade da camada de aplicação |
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

**Índices previstos**: índice de FK padrão em `usuario_id`. `(entidade, entidade_id)` é implicação natural da referência polimórfica definida em B4 para consulta de histórico por registro — segue o critério objetivo de B3 (`decisions.md` decisão #37) — indexação adicional só quando necessidade objetiva for demonstrada, não decidida antecipadamente aqui.

**Observações**:
- **Imutabilidade — confirmada, não pendência.** Todos os campos desta entidade são imutáveis após criação, sem exceção (`24-log-auditoria.md` Seção 5) — mesma reserva de mecanismo (trigger/privilégio) já usada nas demais tabelas, não decidida aqui.
- Toda escrita relevante em entidade auditável deve gerar, na mesma transação, uma linha aqui — mecanismo automático e ciente de contexto já exigido por `arquitetura-tecnica.md` §10, não decisão nova.
- **Referência genérica (`entidade`/`entidade_id`; `referencia_tipo`/`referencia_id`) — B4, resolvida.** Referência polimórfica escolhida como mecanismo oficial, sem FK nativa (`decisions.md`, decisão #20); tabela de junção e FKs mutuamente exclusivas foram analisadas e descartadas. A forma conceitual (entidade única, referência restrita a lista fechada) continua como decidida na Decisão 3, agora complementada pela técnica física de B4.

---

*Nenhuma outra entidade foi modelada nesta etapa.*
