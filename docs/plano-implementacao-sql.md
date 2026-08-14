# Plano de implementação SQL
## Fase 3, Etapa 3.4

## Objetivo

Definir apenas a **ordem** da implementação física do banco PostgreSQL, a partir do que já foi modelado em `docs/modelagem-fisica/`. Não é um documento de schema — nenhuma linha de SQL é escrita aqui.

---

## Estratégia geral

1. **Extensões** — nenhuma exigida pelas convenções já congeladas: `UUID` via `gen_random_uuid()` é nativo do PostgreSQL 13+ (`arquitetura-fisica-banco.md` §3), sem dependência de extensão externa. Passo mantido na estratégia por precaução, hoje vazio.
2. **Tabelas** — criadas na ordem de dependência da seção seguinte.
3. **Constraints** — `PK` e a maioria das `FK`/`UNIQUE`/`CHECK`/`NOT NULL`/`DEFAULT` já podem ser criadas junto com cada tabela, respeitando a ordem; as exceções estão listadas em "Constraints posteriores".
4. **Índices** — após as constraints, por tabela já criada.
5. **Views** — depois de todas as tabelas da cadeia que consultam existirem.
6. **Functions** — não aplicável a este projeto. Validação prévia à geração de `06_functions.sql` (ver "Funcionalidades futuras" abaixo) concluiu que nenhuma function está prevista em nenhum documento; nenhum script de functions será gerado nesta etapa.
7. **Triggers** — adiado. Validação prévia à geração de `07_triggers.sql` (ver "Funcionalidades futuras" abaixo) encontrou bloqueio real nas 16 triggers candidatas; nenhum script de triggers será gerado até os mecanismos de imutabilidade/auditoria pendentes serem escolhidos, ou as pendências D12/D13 serem resolvidas.
8. **Dados iniciais** — nenhum previsto nos documentos de modelagem até aqui; passo mantido para uso futuro.

---

## Ordem de criação das tabelas

**Passo 1 — Cadastros Básicos** (`01-cadastros-basicos.md`)
`empresas`, `usuarios`, `clientes`, `fornecedores`, `categorias` — sem FK entre si; qualquer ordem interna.

**Passo 2 — Obra, Veículo e Contrato Financeiro** (`08-obras-veiculos-rateio.md` parte; `07-contrato-financeiro.md`)
`obras` (→ Passo 1), `veiculos` (→ Passo 1), `contratos_financeiros` (→ Passo 1 e `veiculos`) — nenhuma depende do núcleo financeiro.

**Passo 3 — Núcleo financeiro central** (`02`, `03`, `04`)
`lancamentos_financeiros` (→ Passos 1-2) e `liquidacoes_financeiras` (→ Passo 1, com `conta_bancaria_id` adiado — ver "Constraints posteriores") podem ser criadas em qualquer ordem entre si; `aplicacoes_de_liquidacao` só depois de ambas.

**Passo 4 — Ajuste e Rateio** (`05`, `08` parte)
`ajustes_financeiros` (→ `lancamentos_financeiros`, `usuarios`), `rateios_despesa` (→ `lancamentos_financeiros`, `obras`).

**Passo 5 — Cartão de Crédito** (`06-cartao-credito.md`)
`compras_cartao` (→ Passos 1-2, com `cartao_id` adiado) → `faturas` (→ `liquidacoes_financeiras`, com `cartao_id` adiado) → `parcelas` por último (→ `compras_cartao`, `contratos_financeiros`, `faturas`, `lancamentos_financeiros`).

**Passo 6 — IA e Auditoria** (`09-ia-auditoria.md`)
`logs_auditoria` (→ `usuarios`), `sugestoes_ia` (auto-referência), `acoes_propostas_ia` (sem FK) — dependem só de `usuarios` (Passo 1); agrupadas aqui por seguirem o mesmo documento de origem, embora `logs_auditoria` pudesse, em tese, ser criada logo após o Passo 1, seguindo a recomendação de "auditoria desde o dia 1" (`arquitetura-tecnica.md` §14).

---

## Constraints posteriores

FKs que **não podem** ser criadas com nenhuma das 19 tabelas atuais — dependem de tabelas ou decisões que ainda não existem:

- `liquidacoes_financeiras.conta_bancaria_id` → `contas_bancarias.id` — tabela `CONTA_BANCÁRIA` ainda não modelada fisicamente (módulo futuro).
- `compras_cartao.cartao_id` → `cartoes_credito.id` — tabela `CARTÃO_CRÉDITO` ainda não modelada.
- `faturas.cartao_id` → `cartoes_credito.id` — idem.
- `contratos_financeiros.conta_bancaria_id` → `contas_bancarias.id` — idem.
- Referências genéricas de `sugestoes_ia` (`entidade_alvo_tipo`/`entidade_alvo_id`), `logs_auditoria` (`entidade`/`entidade_id`, `referencia_tipo`/`referencia_id`) — dependem da resolução da pendência **B4** (técnica do vínculo genérico); nenhuma FK é possível até essa decisão, qualquer que seja o mecanismo escolhido.

Sem urgência, mas de prática comum: `sugestoes_ia.grupo_sugestao_id` (auto-referência) pode ser adicionada via `ALTER TABLE` após a criação da tabela — não é uma exigência técnica, só um padrão de implementação comum para auto-referências.

---

## Funcionalidades futuras

**Views** (indicadores calculados, nunca persistidos — princípio 6):

**`05_views.sql` adiado por completo.** Validação prévia à geração (ver histórico da sessão) encontrou bloqueio real em 5 das 6 views candidatas — nenhuma foi criada, nem mesmo a única sem bloqueio aparente, para não fragmentar a etapa. Retomar `05_views.sql` somente depois que os motivos abaixo forem resolvidos.

| View candidata | Status | Motivo do adiamento |
|---|---|---|
| `status_financeiro` de `LANÇAMENTO_FINANCEIRO` (`vw_status_financeiro_lancamentos`, já antecipada em `02`/`04`) | Adiada | Ambiguidade de domínio: `arquitetura-conceitual.md` Seção 2 descreve o resultado como valores separados por `tipo` ("Parcialmente Pago / Parcialmente Recebido"; "Pago / Recebido"); `09-lancamento-financeiro.md` Seção 2 descreve o mesmo campo como termo hifenizado único ("Parcialmente Pago-Recebido"; "Pago-Recebido"). Nenhum documento resolve qual forma é o valor literal correto — decidir isso na view seria criar regra de negócio nova |
| Saldo de `CONTA_BANCÁRIA` (`08` do modelo lógico, §3.08) | Adiada | Tabela inexistente: depende de `MOVIMENTAÇÃO_BANCÁRIA` e `CONTA_BANCÁRIA`, nenhuma das duas modelada fisicamente (módulo futuro) |
| Saldo devedor de `CONTRATO_FINANCEIRO` (`07`) | Adiada | Dependência de regra ainda não consolidada: por definição (Decisão 9), depende de saber quais Parcelas já foram "convertidas em Lançamento pago" — herda diretamente a mesma ambiguidade da view de `status_financeiro` |
| "Lucro por Obra", custo direto e custo rateado (`08`) | Adiada | Ambiguidade de domínio: a fórmula documentada ("Receita direta − custo direto − custo rateado ± ajustes vinculados") não define o sinal com que `AJUSTE_FINANCEIRO` entra na soma, nem se `LANÇAMENTO_FINANCEIRO` com `situação_administrativa` = Cancelado deve ser excluído |
| Custo de `VEÍCULO` (`08`) | Adiada | Mesma ambiguidade da anterior — exclusão ou não de `situação_administrativa` = Cancelado não está confirmada |
| "Custo efetivo" de `AJUSTE_FINANCEIRO` (`05`) | Sem bloqueio identificado, mas **não criada nesta etapa** | Fórmula literal e sem ambiguidade ("valor original menos ajustes vinculados", `15-ajuste-financeiro.md`); mantida adiada junto com as demais por decisão explícita de não fragmentar `05_views.sql` |

Nenhuma informação foi perdida ao adiar esta etapa: os 6 itens, seus documentos de origem e o motivo específico de cada bloqueio continuam registrados nesta tabela: nada precisa ser redescoberto quando `05_views.sql` for retomado.

**Functions — não aplicável, sem SQL a gerar.** Validação prévia (antes de qualquer tentativa de gerar `06_functions.sql`) concluiu, com fidelidade absoluta à documentação, que:

- **Nenhuma function foi especificada em nenhum documento do projeto** — nem nos 9 documentos de modelagem física, nem em `modelo-logico.md`, `decisions.md` ou `pendencias.md`. Nenhum nome, assinatura ou comportamento de function aparece em lugar nenhum.
- **A arquitetura já determina onde essa lógica deve viver**: `arquitetura-tecnica.md` §4 exige que regras de negócio "pesadas" fiquem centralizadas no domínio da aplicação, não espalhadas pela infraestrutura; `arquitetura-fisica-banco.md` §6 é explícito — `CHECK` "nunca [é usado] para regra de negócio multi-tabela (essa vive na camada de aplicação)". Criar uma function agora não seria antecipar uma decisão em aberto — seria contradizer uma decisão arquitetural já congelada sobre onde a regra deve residir.
- **Portanto, não existe nenhum SQL de functions a gerar nesta etapa.** `06_functions.sql` não foi criado, nem como arquivo vazio.

Grupos de regras que permanecem exclusivamente na camada de aplicação (registro de referência futura, sem detalhar implementação):
- **Aplicações de Liquidação**: soma de `valor_aplicado` não ultrapassar o `valor` do Lançamento nem da Liquidação correspondente.
- **Rateio**: soma de `valor_rateado` igual ao `valor` do Lançamento (tolerância de arredondamento, Decisão 10); exclusividade entre `obra_id` direto no Lançamento e a existência de Rateio.
- **Parcelas e Faturas**: correspondência entre `parcelas.total` e `compras_cartao.numero_parcelas`; correspondência entre `faturas.valor_total_calculado` e a soma das Parcelas do ciclo; geração de `LANÇAMENTO_FINANCEIRO` a partir de uma Parcela ao vencer.
- **Contratos Financeiros**: cálculo do saldo devedor como soma das Parcelas ainda em aberto (Decisão 9).
- **Auditoria**: geração automática de `logs_auditoria` a partir de qualquer escrita relevante (mecanismo ainda não escolhido — pendência A5).
- **Cancelamento**: transição de `situação_administrativa` para Cancelado exigir soma de Aplicações igual a zero (Decisão 2).

**Triggers — `07_triggers.sql` adiado por completo.** Validação prévia à geração encontrou bloqueio real nas 16 triggers candidatas citadas na documentação — nenhuma pode ser implementada nesta etapa sem criar decisão técnica ou de negócio nova. Retomar `07_triggers.sql` somente depois que os bloqueios abaixo forem resolvidos.

Inventário resumido, em três grupos:

**Grupo A — bloqueadas por mecanismo de implementação ainda não escolhido** (a regra em si já está confirmada; falta decidir entre trigger de bloqueio e revogação de privilégio, `arquitetura-fisica-banco.md` §7):
1. `lancamentos_financeiros.tipo` — imutável
2. `lancamentos_financeiros.origem` — imutável
3. `lancamentos_financeiros.valor` — imutável condicional (só após 1ª Aplicação; exigiria a trigger consultar `aplicacoes_de_liquidacao`)
4. `aplicacoes_de_liquidacao` (tabela inteira) — imutável
5. `ajustes_financeiros.lancamento_original_id` — imutável
6. `ajustes_financeiros.lancamento_ajuste_id` — imutável
7. `parcelas.fatura_id` — imutável pós-atribuição
8. `contratos_financeiros.tipo` — imutável
9. `compras_cartao.cartao_id` — imutável
10. `compras_cartao.numero_parcelas` — imutável
11. `faturas.cartao_id` — imutável
12. `faturas.ciclo` — imutável
13. `logs_auditoria` (tabela inteira) — imutável, única entidade do modelo assim

**Grupo B — bloqueadas porque a própria regra de negócio ainda está pendente** (não é só o mecanismo que falta; a regra não existe):
14. Qualquer bloqueio de `UPDATE` em `liquidacoes_financeiras` — **D12**, não definido se a Liquidação pode ser alterada ou só estornada/substituída
15. Qualquer bloqueio de `UPDATE` em `tipo_ajuste`/`valor`/`data` de `ajustes_financeiros` — **D13**, mesma natureza

**Grupo C — auditoria automática bloqueada por A5 e pela própria arquitetura técnica**:
16. Disparo automático de linha em `logs_auditoria` a cada escrita relevante — mecanismo não escolhido (pendência **A5**); `arquitetura-tecnica.md` §10 afirma explicitamente que "triggers de banco puros, sozinhos, não satisfazem o requisito de contexto de negócio e não são suficientes como mecanismo único" — implementar isso só como trigger contradiria a própria arquitetura, não apenas anteciparia uma decisão.

**Nenhuma trigger pode ser implementada nesta etapa sem criar decisão técnica ou de negócio nova.** Escolher "trigger" como mecanismo para os Grupos A e C, sem essa escolha estar congelada em nenhum documento, seria decisão técnica nova; para o Grupo B, seria além disso inventar a própria regra de negócio que a trigger executaria.

Nenhuma informação foi perdida ao adiar esta etapa: as 16 triggers candidatas, suas tabelas/colunas, origem documental e o motivo específico de cada bloqueio permanecem registrados acima — nada precisa ser redescoberto quando `07_triggers.sql` for retomado.

---

## Pendências que permanecem abertas

| Item | Impacto na implementação SQL |
|---|---|
| **A5** | Mecanismo técnico de auditoria automática ainda não escolhido; bloqueia exclusivamente `07_triggers.sql` — `arquitetura-tecnica.md` §10 deixa explícito que trigger pura não satisfaz sozinha o requisito de contexto de negócio, por isso a trigger de auditoria automática permanece formalmente adiada |
| **B4** | Sem mecanismo, nenhuma FK possível para as referências genéricas de `sugestoes_ia`/`logs_auditoria` |
| **D9** | Sem `CHECK`/enumeração em `obras.status` |
| **D10** | Sem `CHECK`/enumeração em `veiculos.tipo` |
| **D11** | Sem `CHECK`/enumeração em `parcelas.status` |
| **D12** | Sem política de `UPDATE` definida para `liquidacoes_financeiras` |
| **D13** | Sem política de `UPDATE` definida para `tipo_ajuste`/`valor`/`data` em `ajustes_financeiros` |
| **I1** | Sem `CHECK`/catálogo em `acoes_propostas_ia.tipo_acao` |

Também permanecem abertas, sem afetar nenhuma constraint de schema (só comportamento de aplicação, fora do escopo deste plano): D3 (fechamento de Rateio), D5 (sincronização Compra↔Lançamento), D6 (propagação de veículo em Consórcio), D8 (edição retroativa de Rateio).

---

## Critério para considerar o banco implementado

- [ ] Todas as tabelas criadas.
- [ ] Constraints aplicadas.
- [ ] Índices criados.
- [ ] Views criadas.
- [ ] Triggers criadas.
- [ ] Validação executada sem erros.
