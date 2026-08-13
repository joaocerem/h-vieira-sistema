# HANDOFF — Projeto H. Vieira Sistema
## Encerramento de sessão após conclusão das Etapas 1-7 da consolidação + correção pós-handoff

**Propósito deste documento**: permitir que uma nova sessão continue o projeto imediatamente, sem depender do histórico da conversa anterior. Leia este documento por completo antes de qualquer ação. **Não reabra nenhuma decisão aqui registrada como consolidada.**

---

## 1. ESTADO ATUAL DO PROJETO

- Arquitetura conceitual: concluída.
- Arquitetura técnica: concluída, auditada, arbitrada, e **consolidada** num único documento corrente.
- Modelo de domínio (24 entidades): concluído, revisado (integridade + auditoria sistêmica), e **com todas as 11 pendências bloqueantes já resolvidas e incorporadas**.
- Consolidação documental: **Etapas 1 a 7 concluídas — Fase 2 encerrada**, mais uma correção pontual de consistência feita após a Etapa 4 (ver Seção 9).
- Modelagem física do banco de dados: **não iniciada**.
- Código: **não iniciado**.

## 2. FASE ATUAL

**Consolidação da documentação — concluída** (Fase 2 do `roadmap.md`). As Etapas 1 a 7 do plano de consolidação foram concluídas. O próximo grande marco do projeto é a Fase 3 (modelagem física do banco de dados).

---

## 3. FILOSOFIA DO PROJETO (não é opcional, é a regra de trabalho)

1. Primeiro o domínio ficar completamente consistente. Só depois modelar o banco. Só depois implementar.
2. Nunca antecipar decisão técnica, banco ou código antes da hora.
3. Nunca decidir nada silenciosamente — toda decisão de negócio ou de arquitetura fica registrada e passa por aprovação explícita.
4. Ao encontrar qualquer inconsistência, ambiguidade ou omissão: **parar, registrar exatamente o motivo, aguardar confirmação** — nunca corrigir por conta própria.
5. Preferir sempre a menor alteração possível que resolva o problema.
6. Nada é apagado — documentos superados viram histórico, nunca são removidos.
7. Ao final de cada etapa de execução, relatar exatamente: (1) o que foi alterado; (2) se alguma nova decisão foi tomada (esperado: não); (3) se alguma regra de negócio mudou (esperado: não); (4) se foi encontrada alguma inconsistência. **Mantenha este formato de relatório nas próximas etapas.**

---

## 4. DOCUMENTOS FONTE DE VERDADE (ordem de prioridade)

1. **`architecture/arquitetura-conceitual.md`** — regras de negócio. Nunca alterado desde a criação.
2. **`project-rules.md`** — regras do projeto (como trabalhar, o que nunca fazer). Vigente desde o início, nunca alterado.
3. **`principios-de-modelagem.md`** — critérios permanentes de como o domínio deve ser modelado (7 princípios, normativo).
4. **`domain-model/01-empresa.md` a `24-log-auditoria.md`** — forma de cada entidade, já com as 11 decisões incorporadas.
5. **`architecture/arquitetura-tecnica.md`** — arquitetura técnica **consolidada** (não confundir com `arquitetura-tecnica-v1.md`, histórico).
6. **`decisions.md`** — registro oficial de decisões. **Preenchido na Etapa 7** — as 11 decisões consolidadas, as duas resoluções adicionais da Etapa 3, e o índice dos 7 princípios de modelagem.
7. **`pendencias.md`** — única fonte corrente de pendências abertas do projeto inteiro.

Documentos de apoio, não normativos, mas ainda vigentes: `roadmap.md` e `changelog.md` (ambos atualizados na Etapa 6).

---

## 5. ETAPAS CONCLUÍDAS

### Etapa 1 — Princípios de modelagem
Criado `docs/principios-de-modelagem.md`, com os 7 princípios normativos (separar entidades só por diferença de comportamento; modelo só representa conceitos com significado de negócio definido; não criar estrutura nova quando a existente resolve; fonte única da verdade; fatos históricos não são reescritos; indicadores derivados calculados, não persistidos; toda exceção deve ser justificada). Nenhuma decisão nova.

### Etapas 2a-2f — Incorporação das 11 decisões ao modelo de domínio
Todas concluídas. Ver Seção 8 (arquivos alterados) para o detalhe de quais documentos cada sub-etapa tocou. Inclui duas correções de bookkeeping identificadas e tratadas com o mesmo rigor de uma etapa normal: Etapa 2e (Decisão 10 em `16-rateio-despesa.md`, que faltava no plano original) e Etapa 2f (Decisão 4 em `20-contrato-financeiro.md`, idem).

### Etapa 3 — Consolidação da arquitetura técnica
`architecture/arquitetura-tecnica.md` fundido com as mudanças já ratificadas de `arbitragem-tecnica-final.md`. Original preservado como `architecture/arquitetura-tecnica-v1.md`. Durante esta etapa, duas divergências foram encontradas, registradas e resolvidas com autorização explícita:
- `CATEGORIA` reclassificada do perfil "núcleo com invariante" para "cadastro simples" (consequência direta da Decisão 5 — a premissa que justificava a exceção deixou de existir).
- A correção de posicionamento da IA na estrutura de pastas (arbitragem, Divergência 5 — dividir a linha `domain/ia` entre estados de IA e contratos de ferramenta de consulta) foi incorporada como omissão de registro da própria arbitragem, não como nova decisão.

### Etapa 4 — Lista mestra de pendências
Criado `docs/pendencias.md`, organizando tudo que legitimamente continua em aberto em 6 categorias (Domínio, Arquitetura, IA, Banco de Dados, Tecnologia, Melhorias Futuras), com origem, motivo, fase de resolução e bloqueios/dependências para cada item. Este documento **substitui todos os outros como fonte de pendências** — não releia documentos antigos para descobrir o que falta decidir.

### Correção pós-Etapa-4 (fora da numeração das etapas, mas concluída)
Durante a revisão de um handoff anterior (produzido por outra ferramenta), foi identificada uma inconsistência real: `domain-model/18-compra-cartao.md` ainda descrevia uma relação direta `Compra Cartão → Fatura`, contradizendo `19-fatura.md` e `21-parcela.md`, que já refletiam a relação correta (`Compra Cartão → Parcela → Fatura`, sem vínculo direto). Essa inconsistência foi confirmada e corrigida — ver Seção 9 para o detalhe exato dos trechos alterados.

---

## 6. ETAPAS 5-7 (TODAS CONCLUÍDAS)

### Etapa 5 — Mover documentos de processo para histórico (CONCLUÍDA)

**Concluída.** Objetivo: reorganizar fisicamente os documentos que já são tratados como histórico (Seção 10), sem apagar nada e sem alterar conteúdo.

Lista exata de arquivos movidos:

Para `architecture/historico/` (pasta criada):
- `architecture/historico/auditoria-critica-arquitetura-tecnica.md`
- `architecture/historico/replica-tecnica-auditoria-critica.md`
- `architecture/historico/arbitragem-tecnica-final.md`
- `architecture/historico/arquitetura-tecnica-v1.md`

Para `domain-model/historico/` (pasta criada):
- `domain-model/historico/revisao-integridade-dominio.md`
- `domain-model/historico/analise-pendencia-fatura-parcela-compra.md`
- `domain-model/historico/analise-lacunas-parcela-fatura.md`
- `domain-model/historico/analise-cenarios-compra-retroativa.md`
- `domain-model/historico/auditoria-sistemica-final.md`

Critérios aprovados para esta etapa, todos cumpridos: preservar todos os arquivos; não apagar nada; não alterar conteúdo; apenas mover; manter os documentos consolidados (`arquitetura-tecnica.md`, as 24 entidades, `pendencias.md`, `principios-de-modelagem.md`) nas pastas correntes; atualizar referências cruzadas só se algum link quebrasse por causa do caminho novo (verificado: nenhum link markdown com caminho apontava para esses 9 arquivos — só citações textuais em crases, sem prefixo de pasta — nada precisou ser corrigido); registrar qualquer conflito antes de mover (nenhum conflito encontrado).

### Etapa 6 — Atualizar `roadmap.md` e `changelog.md` (CONCLUÍDA)
**Concluída.** `roadmap.md` recebeu, sob a Fase 2, uma nota registrando o avanço da consolidação documental. `changelog.md` recebeu novas entradas sob a data de 2026-08-13, registrando o marco desta consolidação (princípios de modelagem, incorporação das 11 decisões, consolidação da arquitetura técnica, lista mestra de pendências, reorganização dos documentos históricos) e uma entrada de correção (relação Compra Cartão → Fatura).

### Etapa 7 — Preencher `decisions.md` (CONCLUÍDA)
**Concluída.** `decisions.md` passou a ser o registro oficial e definitivo de decisões: as 11 decisões consolidadas (Seção 7 deste handoff), as duas resoluções adicionais da Etapa 3, e um índice dos 7 princípios de modelagem (referenciando `principios-de-modelagem.md`, sem duplicar conteúdo).

**Com a Etapa 7 concluída, a Fase 2 está encerrada.** O próximo grande marco do projeto é iniciar a **modelagem física do banco de dados** (Fase 3) — ainda sem escrever código.

---

## 7. DECISÕES DEFINITIVAMENTE CONSOLIDADAS — NÃO REABRIR

1. **Status do Lançamento**: dividido em duas dimensões independentes, nunca fundidas — `situação_administrativa` (persistida, decisão humana sobre o ciclo de vida) e `status_financeiro` (sempre calculado a partir das Aplicações, nunca armazenado, sem exceção).
2. **Cancelamento**: `situação_administrativa` só pode virar "Cancelado" quando a soma de Aplicações de Liquidação vinculadas for exatamente zero. Qualquer correção de um Lançamento que já tenha Aplicações passa exclusivamente por `AJUSTE_FINANCEIRO`. Cancelamento e Ajuste são conceitos distintos que nunca produzem o mesmo resultado por caminhos diferentes.
3. **Vínculo genérico** (`LOG_AUDITORIA`, `SUGESTÃO_IA`, e o "registro gerado" por `AÇÃO_PROPOSTA_IA`): cada um permanece entidade única, com referência genérica **só no nível conceitual**. A lista de entidades referenciáveis é fechada e explícita — nunca uma referência totalmente livre; nova entidade auditável exige adição deliberada. Cada mecanismo mantém seu próprio escopo (Sugestão limitada a 2 tipos; Ação limitada às entidades oficialmente permitidas para IA; `AJUSTE_FINANCEIRO` continua com referências concretas, nunca genéricas). A referência genérica existe só para evitar duplicação estrutural — nunca flexibiliza regra de negócio. **Técnica de implementação (banco) continua em aberto** — ver `pendencias.md`, item B4.
4. **`CONTRATO_FINANCEIRO`**: permanece entidade única (Financiamento/Consórcio via `tipo`). Campos condicionais (`taxa`, `grupo-cota`, `contemplado`) são restrição de **negócio do domínio**, não validação de interface — o campo do outro tipo é conceitualmente inexistente, não apenas vazio. Princípio geral derivado: separar entidades só por diferença real de **comportamento**, nunca só de atributos.
5. **`CATEGORIA`**: permanece com `nome`/`tipo`, sem segunda dimensão de "sub-conta interna" — não há definição de negócio para esse conceito hoje. Reclassificada para o perfil arquitetural "cadastro simples" (consequência da mesma decisão, incorporada na Etapa 3).
6. **Fatura ↔ Parcela**: `PARCELA` referencia `FATURA` diretamente (nunca `COMPRA_CARTÃO` → `FATURA` direto — ver a correção da Seção 9). Uma Fatura fechada continua aceitando vínculo de Parcelas descobertas depois, por importação — mas `valor_total_calculado`/`valor_cobrado` ficam **congelados** no momento do fechamento, nunca recalculados. Diferença entre o total congelado e a soma atual de Parcelas vinculadas é efeito esperado, não inconsistência. Nenhuma entidade nova de reconciliação foi criada.
7. **Atribuição de ciclo da Parcela**: ausência de vínculo com Fatura já representa "aguardando" — nenhum status novo criado; `status` da Parcela é dimensão independente de "tem Fatura". Regra de atribuição: cadastro **manual sem fonte externa autoritativa**, com data em ciclo já fechado → próximo ciclo aberto no momento do processamento (usa `LOG_AUDITORIA.data/hora`, sem campo novo em `COMPRA_CARTÃO`). Quando existe fonte externa autoritativa (importação) → vínculo direto com a Fatura real, mesmo já fechada — prevalece sempre sobre a regra do "próximo ciclo aberto".
8. **`AJUSTE_FINANCEIRO` é exclusivamente iniciativa humana**: a IA nunca pode formalizar uma proposta de criação de Ajuste via `AÇÃO_PROPOSTA_IA`, em nenhum nível de sensibilidade — regra arquitetural, não limitação de implementação. A IA **pode** informar, explicar e recomendar que o usuário avalie um Ajuste em linguagem natural; só não pode iniciar o fluxo formal.
9. **Saldo devedor de `CONTRATO_FINANCEIRO`**: sempre = soma das Parcelas ainda em aberto. `valor_contratado` **nunca** participa desse cálculo — a fórmula "contratado menos pago" é inválida para o modelo. `valor_contratado` continua útil para consulta/histórico. O modelo **não decompõe** Parcela em principal/juros/taxa de administração — cada Parcela é só o valor devido naquele vencimento.
10. **Tolerância de Rateio**: exclusivamente técnica (arredondamento da menor unidade monetária) — nunca uma política de negócio para permitir rateios aproximados. Qualquer diferença além do arredondamento é inválida.
11. **Tolerância de dias da conciliação**: reclassificada como **não-bloqueante**, permanece pendência (não afeta nenhuma entidade). Deve ser **configurável**, nunca uma constante fixa espalhada pelo sistema — resolvida só quando o mecanismo de sugestão automática de conciliação for projetado.

**Resolvidas também, fora da numeração 1-11, durante a Etapa 3**: confirmação de que o módulo Financeiro cria `LIQUIDAÇÃO_FINANCEIRA` ao fechar uma Fatura (arbitragem, Divergência 6); correção de posicionamento da IA na estrutura de pastas (arbitragem, Divergência 5).

---

## 8. ARQUIVOS ALTERADOS E CRIADOS NESTA FASE DE CONSOLIDAÇÃO

### Documentos novos criados
- `docs/plano-consolidacao.md` (plano inicial de levantamento)
- `docs/plano-final-consolidacao.md` (plano final, pós-resolução das 11 pendências)
- `docs/principios-de-modelagem.md` (Etapa 1)
- `docs/architecture/arquitetura-tecnica-v1.md` (Etapa 3 — preservação do original)
- `docs/pendencias.md` (Etapa 4)
- `docs/handoff.md` (este documento)

### Documentos existentes editados
- `docs/domain-model/09-lancamento-financeiro.md` — Decisões 1, 2 (Etapa 2a); referência cruzada da Decisão 10 (Etapa 2e)
- `docs/domain-model/11-aplicacao-de-liquidacao.md` — Decisão 2 (Etapa 2a)
- `docs/domain-model/15-ajuste-financeiro.md` — Decisões 2, 8 (Etapa 2a)
- `docs/domain-model/24-log-auditoria.md` — Decisão 3 (Etapa 2b)
- `docs/domain-model/22-sugestao-ia.md` — Decisão 3 (Etapa 2b)
- `docs/domain-model/23-acao-proposta-ia.md` — Decisões 3, 8 (Etapa 2b)
- `docs/domain-model/19-fatura.md` — Decisões 6, 7 (Etapa 2c)
- `docs/domain-model/21-parcela.md` — Decisões 6, 7 (Etapa 2c)
- `docs/domain-model/20-contrato-financeiro.md` — Decisão 9 (Etapa 2c); Decisão 4 (Etapa 2f)
- `docs/domain-model/06-categoria.md` — Decisão 5 (Etapa 2d)
- `docs/domain-model/16-rateio-despesa.md` — Decisão 10 (Etapa 2e)
- `docs/architecture/arquitetura-tecnica.md` — consolidação completa (Etapa 3): cabeçalho, Seção 4 (proporcionalidade), Seção 6 (estrutura de pastas), Seção 10 (auditoria), Seção 11 (permissões), Seção 15 (decisões pendentes)
- `docs/domain-model/18-compra-cartao.md` — correção de consistência pós-handoff (Seção 9 deste documento)

**13 documentos de entidade + 1 documento de arquitetura técnica editados. 6 documentos novos criados.**

---

## 9. CORREÇÃO DE CONSISTÊNCIA EM `18-compra-cartao.md` (detalhe)

Identificada durante a revisão de um handoff produzido por outra sessão/ferramenta, confirmada e corrigida nesta sessão. `18-compra-cartao.md` ainda descrevia `COMPRA_CARTÃO → FATURA` como relação direta (N:1), o que está estruturalmente errado para compras parceladas (uma Compra em N parcelas contribui para até N Faturas diferentes) e contradizia `19-fatura.md`/`21-parcela.md`, já corretos.

Três trechos corrigidos, só neste arquivo:
- Seção 1 ("Quem consulta"): removida a menção a "Fatura agrupa Compras de um ciclo"; substituída por explicação de que a relação é indireta, via Parcela.
- Seção 3 (Relacionamentos): removida a linha `Compra Cartão → Fatura | N:1`; adicionada nota de consistência explicando por que essa relação direta é incorreta e apontando para a relação real (`PARCELA → FATURA`).
- Seção 6 (Dependências): "referenciada por Parcela e agrupada por Fatura" → "relaciona-se com Fatura apenas de forma transitiva, através de Parcela".

Nenhuma regra de negócio mudou — só a descrição de um relacionamento já decidido, que estava desatualizada num único documento.

---

## 10. DOCUMENTOS HISTÓRICOS — JÁ MOVIDOS FISICAMENTE (Etapa 5 concluída)

**Importante**: os documentos abaixo já **não são mais fonte corrente** (suas conclusões foram incorporadas aos documentos vigentes) e **já foram movidos fisicamente** para suas subpastas `historico/` (Etapa 5, concluída).

- `architecture/historico/auditoria-critica-arquitetura-tecnica.md`
- `architecture/historico/replica-tecnica-auditoria-critica.md`
- `architecture/historico/arbitragem-tecnica-final.md`
- `architecture/historico/arquitetura-tecnica-v1.md`
- `domain-model/historico/revisao-integridade-dominio.md`
- `domain-model/historico/analise-pendencia-fatura-parcela-compra.md`
- `domain-model/historico/analise-lacunas-parcela-fatura.md`
- `domain-model/historico/analise-cenarios-compra-retroativa.md`
- `domain-model/historico/auditoria-sistemica-final.md`

Use-os só para entender **por que** uma decisão foi tomada. Nunca para descobrir **o que ainda está pendente** — isso é só `pendencias.md`.

---

## 11. PENDÊNCIAS ABERTAS

Consultar **exclusivamente** `docs/pendencias.md` — 6 categorias (Domínio, Arquitetura, IA, Banco de Dados, Tecnologia, Melhorias Futuras), cada pendência com origem, motivo, fase de resolução, bloqueios e dependências já mapeados. Não releia os documentos históricos para tentar reconstruir a lista — ela já está consolidada, com duplicidades fundidas.

---

## 12. ORIENTAÇÕES PARA A PRÓXIMA SESSÃO

1. **Nunca reinterpretar ou reabrir nenhuma das 11 decisões da Seção 7**, nem as duas resolvidas na Etapa 3 (Divergências 5 e 6 da arbitragem).
2. **Nunca transformar uma recomendação ou "melhoria futura" antiga em decisão** sem aprovação explícita — `pendencias.md`, categoria "Melhorias Futuras", lista o que é intencionalmente não-decidido.
3. **Sempre registrar qualquer divergência ou inconsistência encontrada antes de editar** — nunca corrigir por conta própria, mesmo que a correção pareça óbvia (ver o precedente da Seção 9: mesmo uma correção "óbvia" foi registrada e só executada após confirmação explícita).
4. **Preservar o formato de relatório de 4 pontos** ao final de cada etapa (o que foi alterado; nova decisão? regra mudou? inconsistência encontrada?).
5. **Nada é apagado.** Documentos superados viram histórico — nunca são removidos, mesmo na Etapa 5 (que é reorganização de pasta, não exclusão).
6. **Preferir sempre a menor alteração possível.**
7. As **Etapas 5, 6 e 7** já foram concluídas (ver Seção 6) — a consolidação documental está encerrada e a Fase 2 terminou. O próximo passo é a **Fase 3** (modelagem física do banco de dados), mantendo o mesmo padrão de checkpoint já usado em toda a consolidação.
8. Esta sessão usou um sistema interno de tarefas (Etapas 1-7 rastreadas como itens individuais) para acompanhar o progresso — todas concluídas. Se a próxima sessão avançar para a Fase 3, recrie um rastreamento equivalente para as etapas dessa nova fase.
