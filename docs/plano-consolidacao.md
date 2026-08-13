# Plano de Consolidação da Documentação
## Sistema Financeiro/Gerencial H Vieira Terraplanagem

**Papel assumido**: editor técnico oficial da documentação. Este documento é **só um plano** — um levantamento de como a consolidação deveria acontecer, quando aprovada. Nenhum arquivo foi alterado, movido, renomeado ou reescrito. Nenhuma decisão de negócio ou técnica nova foi tomada aqui — só decisões **editoriais** sobre organização de documentos, propostas para aprovação.

**Inventário-base**: 38 arquivos `.md` existem hoje no projeto, distribuídos em `docs/` (4), `docs/architecture/` (5) e `docs/domain-model/` (29, sendo 24 entidades + 5 documentos de análise/auditoria).

---

## ÍNDICE

1. Documentos obsoletos (substituídos por outros)
2. Documentos que são só análises temporárias
3. Documentos que devem existir na versão definitiva
4. Ordem recomendada da consolidação
5. Documentos que servirão só como histórico
6. Documentos que serão a fonte oficial da verdade
7. Pendências que precisam ser resolvidas antes da modelagem do banco
8. Pendências que podem permanecer abertas
9. Como evitar duplicação de informação entre documentos
10. Organização definitiva proposta

---

## 1. DOCUMENTOS OBSOLETOS (SUBSTITUÍDOS POR OUTROS)

**Nenhum documento está totalmente obsoleto no sentido de "descartável sem perda de informação".** Mas alguns tiveram seu papel de **fonte de decisão corrente** superado por um documento posterior, mesmo continuando válidos como registro histórico:

| Documento | Situação |
|---|---|
| `architecture/auditoria-critica-arquitetura-tecnica.md` | Suas conclusões individuais foram **arbitradas** por `arbitragem-tecnica-final.md` — algumas aceitas, outras rejeitadas, outras substituídas por uma terceira solução. Não deve mais ser lido como "posição corrente", só como uma das duas vozes do debate que a arbitragem resolveu. |
| `architecture/replica-tecnica-auditoria-critica.md` | Mesma situação — é a segunda voz do debate, também superada pela arbitragem como fonte de decisão corrente. |
| `architecture/arquitetura-tecnica.md` | **Parcialmente** superado — não no todo. A arbitragem ratificou partes dele sem alteração (ex. estrutura geral de pastas, separação Domain/Application/Infrastructure) e exigiu mudanças pontuais em outras (as 6 "mudanças obrigatórias" da Seção 12.3 da arbitragem — proporcionalidade da arquitetura, mecanismo de auditoria, mecanismo de permissão, estratégia de status, dono da Liquidação da Fatura, reuso de lógica de consulta). Hoje, **nenhuma dessas mudanças foi incorporada ao texto do documento** — ele continua exatamente como escrito antes da auditoria. Não é obsoleto, mas **não pode mais ser lido isoladamente como a arquitetura técnica corrente** — precisa ser lido em conjunto com `arbitragem-tecnica-final.md` até que os dois sejam fundidos num único documento. |

**Nenhum documento do modelo de domínio (as 24 entidades) está obsoleto.** Todos continuam sendo a base vigente — o que existe são correções pontuais já decididas (Fatura/Parcela/Compra) ou recomendadas (Ajuste/Ação IA, saldo devedor de Contrato) que ainda não foram escritas de volta nos documentos de entidade correspondentes. Isso é tratado na Seção 7.

---

## 2. DOCUMENTOS QUE SÃO SÓ ANÁLISES TEMPORÁRIAS

Estes documentos foram produzidos para **debater, investigar ou arbitrar** um ponto específico — seu valor está no raciocínio e na conclusão, não em serem, eles mesmos, parte da especificação final. Nenhum deve ser citado como "a regra" — a regra, quando confirmada, deve estar escrita no documento de entidade ou arquitetura correspondente.

| Documento | Papel que cumpriu | O que fazer com o conteúdo |
|---|---|---|
| `architecture/auditoria-critica-arquitetura-tecnica.md` | Levantar críticas à arquitetura técnica | Absorvido pela arbitragem; mantido só como histórico (Seção 5) |
| `architecture/replica-tecnica-auditoria-critica.md` | Responder às críticas | Absorvido pela arbitragem; mantido só como histórico |
| `architecture/arbitragem-tecnica-final.md` | Arbitrar o debate | Suas conclusões precisam ser **incorporadas** a uma arquitetura técnica consolidada — o documento em si vira histórico depois disso |
| `domain-model/revisao-integridade-dominio.md` | Auditar o modelo de 24 entidades como sistema | Seus achados confirmados (Fatura/Parcela/Compra) já geraram análises de resolução; os demais achados ainda não incorporados às entidades |
| `domain-model/analise-pendencia-fatura-parcela-compra.md` | Analisar 4 alternativas para a pendência nº 1 | Decisão **já aprovada** (Alternativa A) — precisa ser escrita em `18-compra-cartao.md`, `19-fatura.md`, `21-parcela.md` |
| `domain-model/analise-lacunas-parcela-fatura.md` | Resolver as duas lacunas remanescentes da Alternativa A | Recomendações dadas (Opção 1.A, Alternativa 2.B), **ainda não aprovadas explicitamente** |
| `domain-model/analise-cenarios-compra-retroativa.md` | Verificar se Cenário A e B da compra retroativa são o mesmo processo | Confirmou que são diferentes; Cenário B ficou **parcialmente em aberto** (sub-caso B1) |
| `domain-model/auditoria-sistemica-final.md` | Auditar o conjunto de todos os documentos anteriores | 9 achados, nenhum ainda resolvido/incorporado |

Todos os oito são, por natureza, **documentos de processo** — registram como se chegou a uma conclusão, não são a conclusão em forma final de especificação. Isso não diminui seu valor: são exatamente o tipo de documento que explica "por que a regra é essa" quando alguém perguntar no futuro.

---

## 3. DOCUMENTOS QUE DEVEM EXISTIR NA VERSÃO DEFINITIVA

| Documento | Por quê |
|---|---|
| `architecture/arquitetura-conceitual.md` | Fonte oficial das regras de negócio — nunca contestada nem alterada em nenhuma etapa. Continua como está. |
| Uma **arquitetura técnica consolidada** (hoje fragmentada entre `arquitetura-tecnica.md` e `arbitragem-tecnica-final.md`) | É preciso um único documento técnico corrente, sem exigir que o leitor cruze dois arquivos para saber qual é a decisão vigente em cada ponto |
| As **24 entidades** do modelo de domínio (`domain-model/01-empresa.md` a `24-log-auditoria.md`) | Continuam sendo a espinha dorsal da especificação de dados — precisam só de atualizações pontuais (Seção 7) |
| `project-rules.md` | Regras do projeto, ainda válidas, sem alteração necessária |
| `roadmap.md` | Continua existindo, mas está desatualizado (Fase 2 aparece como não concluída, apesar do volume de trabalho já feito nela) — precisa de atualização de status, não de reescrita |
| `changelog.md` | Documento vivo, continua sendo atualizado a cada marco |
| `decisions.md` | Hoje vazio — é o candidato natural para se tornar o **registro oficial consolidado de decisões** (ver Seção 6) |
| Uma **lista mestra de pendências** (documento novo, ainda não existente) | Consolidaria, num único lugar, tudo que hoje está espalhado entre 8+ documentos (ver Seção 7 e 8) |

---

## 4. ORDEM RECOMENDADA DA CONSOLIDAÇÃO

A ordem importa porque cada passo depende do anterior estar fechado — consolidar fora de ordem arriscaria escrever algo definitivo em cima de uma decisão ainda instável.

```
Passo 1 — Fechar as decisões ainda em aberto que afetam a FORMA das entidades
           (Seção 7 abaixo: status do Lançamento, pendência 14, pendência 13,
           pendência 6, pendência 4, sub-caso B1 do Cenário B, Ponto 1/2 da
           análise de lacunas, achado 2 e achado 6 da auditoria sistêmica,
           pendências 2 e 7)
                    ↓
Passo 2 — Incorporar essas decisões aos documentos de entidade correspondentes
           (atualização pontual, não reescrita das 24 entidades)
                    ↓
Passo 3 — Fundir arquitetura-tecnica.md + arbitragem-tecnica-final.md num
           único documento de arquitetura técnica consolidada
                    ↓
Passo 4 — Criar a lista mestra de pendências, reunindo o que sobrar em aberto
           de todos os documentos (Seção 8) — só o que legitimamente pode
           continuar aberto
                    ↓
Passo 5 — Mover os documentos de processo (auditoria, réplica, arbitragem,
           revisão de integridade, as três análises pontuais, auditoria
           sistêmica) para uma área de histórico, claramente separada da
           especificação corrente
                    ↓
Passo 6 — Atualizar roadmap.md e changelog.md para refletir o estado real
                    ↓
Passo 7 — decisions.md passa a ser preenchido como o registro oficial e
           definitivo de tudo que foi decidido até aqui
```

Os Passos 1 e 2 são os únicos que tocam decisão de negócio/modelo — todos os demais são reorganização e consolidação editorial pura.

---

## 5. DOCUMENTOS QUE SERVIRÃO SÓ COMO HISTÓRICO

Depois da consolidação, estes documentos deixam de ser consultados para "qual é a regra hoje" e passam a ser consultados só para "por que essa regra existe" ou "que alternativas foram descartadas e por quê":

- `architecture/auditoria-critica-arquitetura-tecnica.md`
- `architecture/replica-tecnica-auditoria-critica.md`
- `architecture/arbitragem-tecnica-final.md` (depois de suas conclusões serem incorporadas ao documento técnico consolidado)
- `domain-model/revisao-integridade-dominio.md`
- `domain-model/analise-pendencia-fatura-parcela-compra.md`
- `domain-model/analise-lacunas-parcela-fatura.md`
- `domain-model/analise-cenarios-compra-retroativa.md`
- `domain-model/auditoria-sistemica-final.md`
- A versão original de `architecture/arquitetura-tecnica.md`, preservada como estava antes de incorporar as mudanças da arbitragem (útil para entender a evolução, mesmo depois de existir uma versão consolidada)

Nenhum desses deveria ser apagado — são o rastro de decisão que explica todas as escolhas feitas até aqui, e várias dessas análises (principalmente as de Fatura/Parcela/Compra) resolvem alternativas descartadas com justificativa detalhada, que seria caro reconstruir do zero se um dia for questionado.

---

## 6. DOCUMENTOS QUE SERÃO A FONTE OFICIAL DA VERDADE

| Camada | Fonte oficial |
|---|---|
| Regras de negócio | `architecture/arquitetura-conceitual.md` — inalterado desde o início, nunca superado |
| Decisões e estilo de arquitetura técnica | O futuro documento técnico consolidado (fundindo `arquitetura-tecnica.md` + `arbitragem-tecnica-final.md`) |
| Estrutura de dados conceitual (entidades, campos, relacionamentos) | As 24 entidades em `domain-model/`, após as atualizações pontuais do Passo 2 |
| Regras do projeto (como trabalhar, o que nunca fazer) | `project-rules.md` |
| Decisões formalmente consolidadas (o que foi decidido, quando, por quê) | `decisions.md`, depois de preenchido — hoje vazio, é a lacuna mais visível da documentação atual |
| O que ainda está pendente | A lista mestra de pendências (documento novo, ainda não criado) |

**Achado relevante para esta pergunta**: `decisions.md` existir vazio até agora não é um erro — é consequência direta de este projeto ter, deliberadamente, mantido "análise" e "consolidação" como etapas separadas em cada fase, por instrução explícita repetida ao longo de toda a conversa. Ele é, literalmente, o documento que esta consolidação (quando aprovada e executada) deveria preencher.

---

## 7. PENDÊNCIAS QUE REALMENTE PRECISAM SER RESOLVIDAS ANTES DA MODELAGEM DO BANCO

Estas afetam diretamente a **forma** de uma ou mais entidades (campos, relacionamentos, ou regras de validação estrutural) — resolver a modelagem de banco sem decidi-las primeiro arrisca retrabalho de schema:

1. **Estratégia de cálculo do `status` de `LANÇAMENTO_FINANCEIRO`** (persistido recalculado / view / tempo real) — a regra mais central de toda a cadeia financeira (Seção 19 do conceitual; Divergência 7 da arbitragem).
2. **Pendência 14 do conceitual** — cancelamento de Lançamento com Aplicação de Liquidação já existente (estornar, cancelar só o restante, ou bloquear).
3. **Pendência 13 do conceitual** — vínculo genérico de `LOG_AUDITORIA`, `SUGESTÃO_IA`, `AÇÃO_PROPOSTA_IA` e `AJUSTE_FINANCEIRO` (referência polimórfica, tabelas específicas, ou outra abordagem).
4. **Pendência 6 do conceitual** — manter `CONTRATO_FINANCEIRO` único ou separar em Financiamento/Consórcio.
5. **Pendência 4 do conceitual** — separar `CATEGORIA` em natureza do gasto × sub-conta interna, ou confirmar que permanece unificada.
6. **Sub-caso B1 do Cenário B da compra retroativa** (`analise-cenarios-compra-retroativa.md`) — mecanismo de reconciliação quando uma Fatura importada já existe no sistema.
7. **Ponto 1 e Ponto 2 da análise de lacunas** (`analise-lacunas-parcela-fatura.md`) — recomendações já dadas (Opção 1.A; Alternativa 2.B para o Cenário A), mas ainda sem aprovação formal.
8. **Achado 2 da auditoria sistêmica** (🔴) — se a IA pode ou não propor a criação de um `AJUSTE_FINANCEIRO` via `AÇÃO_PROPOSTA_IA`.
9. **Achado 6 da auditoria sistêmica** — regra de validação ligando a soma das Parcelas ao `valor_contratado`, e se este último inclui juros projetados para Financiamento.
10. **Pendência 7 do conceitual** — tolerância de soma do Rateio.
11. **Pendência 2 do conceitual** — tolerância de dias no matching automático de conciliação.

**Nota importante de contexto**: as pendências 2, 4, 6, 7, 13 e 14 foram classificadas como **"não bloqueante"** no próprio `arquitetura-conceitual.md` original (Seção 16). Essa classificação estava correta **para a fase em que foi feita** — nenhuma delas impedia continuar a etapa conceitual ou a arquitetura técnica. Elas se tornam bloqueantes **especificamente agora**, porque a próxima fase (modelagem de banco) precisa da forma final de cada entidade — e é exatamente aí que essas pendências deixam de ser adiáveis. Isso não é uma contradição com o conceitual original; é a mesma pendência sendo reavaliada sob o critério de uma fase diferente.

---

## 8. PENDÊNCIAS QUE PODEM PERMANECER ABERTAS SEM IMPEDIR A CONTINUIDADE

Estas não mudam a forma de nenhuma tabela do núcleo financeiro — podem ser resolvidas mais adiante, no momento em que o módulo específico que afetam for de fato modelado:

- **Pendência 1** (natureza jurídica das Empresas) — só afeta os valores válidos do campo `EMPRESA.tipo`, não sua existência.
- **Pendência 3** (identificar qual sócio faz uma Retirada do Patrão) — já confirmado, na auditoria sistêmica, que não tem hoje nenhum rastro estrutural necessário; pode continuar aberta indefinidamente.
- **Pendência 5** (usuários e níveis de permissão, modelo completo) — mitigada por um "Usuário mínimo" já modelado; só bloqueia a fase de controle de acesso, não o núcleo financeiro.
- **Pendência 8** (rateio pode ficar parcialmente pendente) — refina uma regra de validação já parametrizável depois.
- **Pendência 9** (alocação de veículo a obra sem despesa) — funcionalidade futura, fora do núcleo, por definição do próprio conceitual.
- **Pendência 10** (rejeição de sugestão de IA alimentar aprendizado futuro) — funcionalidade futura.
- **Pendência 11** (ordem de implementação da IA) — decisão de produto, já com recomendação técnica registrada.
- **Pendência 12** (mecanismo exato da barreira de nível Alto) — decisão técnica que só precisa estar fechada quando o módulo de Ação de IA for efetivamente modelado, bem mais à frente na ordem de implementação.
- **Achado 1 e Achado 3 da auditoria sistêmica** (catálogo tipo_ação/nível_sensibilidade; sobreposição Sugestão/Ação) — só afetam a modelagem das tabelas de IA, que vêm depois do núcleo financeiro na ordem de implementação já estabelecida.
- **Achado 4 da auditoria sistêmica** (contradição textual "auditoria desde o dia 1" vs. "usuário não-bloqueante") — já mitigada na prática; falta só uma nota, não uma decisão nova.
- **Achado 5 da auditoria sistêmica** (dependência circular Empresa/permissão/Ação de IA) — condicional à pendência 5, que já é não-bloqueante.
- **Achado 9 da auditoria sistêmica** (campo para "segundo aprovador") — condicional à pendência 12.
- **Sub-caso B2 do Cenário B** (Fatura importada que ainda não existe no sistema) — já resolvido em espírito na análise (sem conflito de imutabilidade); só falta redigir, não decidir.
- **As 16 decisões tecnológicas** de `arquitetura-tecnica.md`, Seção 15 (linguagem, framework, banco físico, ORM, frontend, hospedagem, provedor de IA, mecanismo exato da barreira Alto) — explicitamente fora do escopo de modelagem de domínio, continuam pendentes sem bloquear nada desta fase.

---

## 9. COMO EVITAR DUPLICAÇÃO DE INFORMAÇÃO ENTRE DOCUMENTOS

Princípios a aplicar na consolidação (não implementados aqui, só propostos):

1. **Cada fato deve ter exatamente um documento dono.** Regra de negócio → só no conceitual. Decisão de arquitetura → só no documento técnico consolidado. Forma de uma entidade → só no documento daquela entidade. Nenhum desses deveria ser reescrito, resumido ou parafraseado em outro documento — só referenciado por link/nome.
2. **Documentos históricos precisam de um aviso de cabeçalho explícito** dizendo que não são mais fonte de decisão corrente (alguns já têm isso — ex. `arquitetura-tecnica.md` já cita `H_VIEIRA_Arquitetura_Definitiva.md` como fonte de verdade para regra de negócio; o mesmo padrão deveria valer para os documentos de processo em relação às suas conclusões arbitradas).
3. **A lista mestra de pendências (Seção 7/8) deve ser o único lugar que numera pendências daqui em diante** — hoje cada documento numerado (conceitual: 14; auditoria sistêmica: 9; etc.) tem sua própria numeração independente, o que já causa a fragmentação identificada em `auditoria-sistemica-final.md` (Achado 7). Consolidar não significa apagar os números originais dentro de cada documento histórico — significa que, dali em diante, só a lista mestra é consultada para saber "o que falta decidir".
4. **Correções aprovadas devem ser incorporadas ao documento de entidade, nunca deixadas só no documento de análise.** Ex.: a Alternativa A (Fatura/Parcela/Compra) já foi aprovada, mas hoje só existe descrita em `analise-pendencia-fatura-parcela-compra.md` — enquanto isso não for escrito em `18-compra-cartao.md`, `19-fatura.md` e `21-parcela.md`, existe risco real de alguém ler só os documentos de entidade e não saber que a relação já foi corrigida.
5. **Nenhum novo documento de análise deveria repetir o conteúdo de um documento de entidade** — deveria sempre referenciar por nome/seção, nunca copiar trechos inteiros (o que já foi seguido consistentemente até aqui, vale preservar como padrão).

---

## 10. ORGANIZAÇÃO DEFINITIVA PROPOSTA

Estrutura de pastas proposta para depois da consolidação (proposta, não executada):

```
docs/
  arquitetura-conceitual.md              ← fonte oficial de regras de negócio (inalterado)
  project-rules.md                        ← regras do projeto (inalterado)
  roadmap.md                              ← atualizado a cada fase
  changelog.md                            ← log vivo, contínuo
  decisions.md                            ← registro oficial de decisões consolidadas (a preencher)
  pendencias.md                           ← NOVO: lista mestra única de pendências abertas

  architecture/
    arquitetura-tecnica.md                ← consolidada (arquitetura-tecnica.md + arbitragem fundidos)
    historico/
      arquitetura-tecnica-v1.md           ← versão original preservada
      auditoria-critica-arquitetura-tecnica.md
      replica-tecnica-auditoria-critica.md
      arbitragem-tecnica-final.md

  domain-model/
    01-empresa.md … 24-log-auditoria.md   ← atualizadas com as correções já aprovadas (Passo 2)
    historico/
      revisao-integridade-dominio.md
      analise-pendencia-fatura-parcela-compra.md
      analise-lacunas-parcela-fatura.md
      analise-cenarios-compra-retroativa.md
      auditoria-sistemica-final.md
```

Essa organização separa claramente **o que é fonte de verdade hoje** (raiz de `docs/`, `architecture/`, `domain-model/`) de **o que é histórico de como se chegou até aqui** (subpastas `historico/`) — sem apagar nem perder nenhum documento produzido.

---

## RESUMO PARA APROVAÇÃO

Este plano propõe, em ordem:
1. Fechar 11 pendências que afetam a forma das entidades (Seção 7) — a única parte deste plano que envolve decisão de negócio/modelo, e por isso a única que precisa da sua aprovação item a item antes de prosseguir.
2. Incorporar essas decisões às 24 entidades (edição pontual, não reescrita).
3. Fundir a arquitetura técnica com a arbitragem num documento único.
4. Criar a lista mestra de pendências com o que sobrar aberto (Seção 8).
5. Mover 9 documentos de processo para pastas de histórico, sem apagar nenhum.
6. Atualizar `roadmap.md` e `changelog.md`.
7. Preencher `decisions.md` como registro oficial.

**Nada disso foi executado.** Aguardo sua aprovação — geral, ou passo a passo — antes de alterar, mover ou consolidar qualquer arquivo.
