# Plano Final de Consolidação da Documentação
## Sistema Financeiro/Gerencial H Vieira Terraplanagem

**Situação**: as 11 pendências bloqueantes listadas na Seção 7 de `plano-consolidacao.md` estão todas fechadas — 10 com decisão explícita, 1 (tolerância de conciliação) formalmente reclassificada como não-bloqueante e movida para a Seção 8. Este documento **substitui e finaliza** as Seções 7-10 daquele plano original, incorporando o resultado de todas as decisões tomadas.

**O que este documento ainda não é**: não é a consolidação em si. Nenhum arquivo foi alterado, movido ou reescrito. Isto é o plano de execução detalhado, para sua aprovação antes de qualquer edição real.

---

## 1. DECISÕES APROVADAS NESTA ETAPA — O QUE SERÁ INCORPORADO, E ONDE

| # | Decisão | Resumo | Documentos de destino |
|---|---|---|---|
| 1 | Status do Lançamento | Duas dimensões nunca fundidas: `situação_administrativa` (persistida, decisão humana) e `status_financeiro` (sempre calculado, nunca armazenado) | `09-lancamento-financeiro.md` |
| 2 | Cancelamento com Aplicação existente | Só permitido com soma de Aplicações = 0; correção pós-liquidação sempre via Ajuste; Cancelamento ≠ Ajuste, nunca o mesmo resultado por caminhos diferentes | `09-lancamento-financeiro.md`, `11-aplicacao-de-liquidacao.md`, `15-ajuste-financeiro.md` |
| 3 | Vínculo genérico (Log Auditoria / Sugestão IA / Ação Proposta IA) | Entidade única com referência genérica, só no nível conceitual; lista fechada de entidades referenciáveis; cada mecanismo mantém escopo próprio; a referência genérica nunca flexibiliza regra de negócio | `24-log-auditoria.md`, `22-sugestao-ia.md`, `23-acao-proposta-ia.md` |
| 4 | Contrato Financeiro unificado | Mantém entidade única com `tipo`; campos condicionais são restrição de negócio do domínio (não validação de interface) — o campo do outro tipo é conceitualmente inexistente, não só vazio; princípio geral: separar entidades só por diferença de **comportamento** | `20-contrato-financeiro.md` |
| 5 | Categoria mantida sem separação | `nome`/`tipo`, sem dimensão de "sub-conta interna"; princípio geral: o modelo só representa conceitos com significado de negócio já definido | `06-categoria.md` |
| 6 | Fatura fechada aceita vínculo tardio | `valor_total_calculado`/`valor_cobrado` são retrato histórico congelado no fechamento, nunca recalculados; divergência entre o total congelado e a soma atual de Parcelas é esperada, não é inconsistência; nenhum mecanismo novo de reconciliação | `19-fatura.md` |
| 7 | Estado da Parcela + regra de atribuição de ciclo | Ausência de vínculo com Fatura já representa "aguardando"; `status` da Parcela é dimensão independente; regra do "próximo ciclo aberto" vale só para Cenário A (manual, sem fonte externa); quando há fonte oficial, prevalece a decisão 6; usa `LOG_AUDITORIA.data/hora`, sem novo campo em Compra Cartão | `21-parcela.md` |
| 8 | Ajuste Financeiro exclusivamente humano | IA nunca formaliza `AÇÃO_PROPOSTA_IA` para criar Ajuste, em nenhum nível de sensibilidade; IA pode informar/explicar/recomendar, nunca iniciar o fluxo formal; regra arquitetural, não limitação de implementação | `23-acao-proposta-ia.md`, `15-ajuste-financeiro.md` |
| 9 | Saldo devedor de Contrato Financeiro | Sempre = soma das Parcelas ainda em aberto; `valor_contratado` nunca entra nessa fórmula (a fórmula "contratado menos pago" é inválida); `valor_contratado` continua útil para consulta/histórico; Parcela nunca é decomposta em principal/juros/taxas | `20-contrato-financeiro.md`, `21-parcela.md` |
| 10 | Tolerância de Rateio | Exclusivamente técnica (arredondamento da menor unidade monetária); nunca política de negócio; qualquer diferença além disso é inválida | `16-rateio-despesa.md` |
| 11 | Tolerância de conciliação | Reclassificada como não-bloqueante; resolvida só quando o mecanismo de sugestão automática for desenhado; deve ser configurável, nunca uma constante espalhada pelo sistema | Movida para a lista mestra de pendências (Seção 4 abaixo) — nenhuma entidade muda |

**Dois princípios gerais também foram registrados ao longo desta etapa**, além das decisões específicas:

- **Princípio de separação de entidades** (consolidado na decisão 4): entidades só devem ser separadas quando houver diferença de comportamento de negócio — diferenças de atributos isoladamente não justificam.
- **Princípio de definição de negócio** (consolidado na decisão 5): o modelo conceitual só representa conceitos com significado de negócio claramente definido — nada é modelado antecipadamente "para um possível uso futuro".

Esses dois princípios não pertencem a nenhuma entidade específica — preciso da sua orientação sobre onde devem viver (ver Seção 5, "Decisão pendente antes de consolidar").

---

## 2. DOCUMENTOS QUE SERÃO INCORPORADOS (E EM QUÊ)

### 2.1 — Modelo de domínio: 10 dos 24 documentos de entidade recebem edição

| Documento | Recebe |
|---|---|
| `09-lancamento-financeiro.md` | Decisões 1 e 2 |
| `11-aplicacao-de-liquidacao.md` | Decisão 2 (confirmação de imutabilidade) |
| `15-ajuste-financeiro.md` | Decisões 2 e 8 (confirmação de escopo exclusivamente humano) |
| `24-log-auditoria.md` | Decisão 3 |
| `22-sugestao-ia.md` | Decisão 3 |
| `23-acao-proposta-ia.md` | Decisões 3 e 8 |
| `20-contrato-financeiro.md` | Decisões 4 e 9 |
| `06-categoria.md` | Decisão 5 (nota de confirmação, sem mudança de campo) |
| `19-fatura.md` | Decisão 6 |
| `21-parcela.md` | Decisões 7 e 9 |

**Os outros 14 documentos de entidade não são tocados** — nenhuma das 11 pendências os afetou.

### 2.2 — Arquitetura técnica: fusão de dois documentos em um

`architecture/arquitetura-tecnica.md` + as 6 "mudanças obrigatórias" já ratificadas em `architecture/arbitragem-tecnica-final.md` (Seção 3 daquele documento: proporcionalidade da arquitetura, módulo de consulta compartilhado, mecanismo de auditoria automático e ciente de contexto, mecanismo de permissão em dois pontos, separação fechar-fatura/registrar-liquidação, e a própria Decisão 1 desta etapa, que já resolve formalmente a Divergência 7 sobre status do Lançamento) → um único documento técnico consolidado.

### 2.3 — Novo documento: lista mestra de pendências

Um documento novo (`pendencias.md`), reunindo tudo que permanece legitimamente aberto depois desta etapa — ver Seção 4.

### 2.4 — Documentos que recebem atualização de status, não de conteúdo

- `roadmap.md` — Fase 2 (arquitetura técnica) e o trabalho de modelo de domínio precisam ser refletidos como concluídos/avançados.
- `changelog.md` — registro do marco "modelo de domínio consolidado, 11 pendências bloqueantes resolvidas".
- `decisions.md` — passa a conter o registro oficial e definitivo das 11 decisões e dos 2 princípios gerais, hoje vazio.

---

## 3. DOCUMENTOS QUE DEIXAM DE SER NORMATIVOS E PASSAM A SER HISTÓRICO

Nenhum é apagado — todos continuam existindo, só deixam de ser a fonte consultada para "qual é a regra hoje":

- `architecture/auditoria-critica-arquitetura-tecnica.md`
- `architecture/replica-tecnica-auditoria-critica.md`
- `architecture/arbitragem-tecnica-final.md` (depois de suas conclusões incorporadas ao documento técnico consolidado — Seção 2.2)
- A versão original de `architecture/arquitetura-tecnica.md`, preservada como registro de como a arquitetura era antes da fusão
- `domain-model/revisao-integridade-dominio.md`
- `domain-model/analise-pendencia-fatura-parcela-compra.md`
- `domain-model/analise-lacunas-parcela-fatura.md`
- `domain-model/analise-cenarios-compra-retroativa.md`
- `domain-model/auditoria-sistemica-final.md`

Estes nove documentos são exatamente o rastro de raciocínio que sustenta as 11 decisões da Seção 1 — continuam sendo a resposta para "por que essa regra existe", só não são mais consultados para "qual é a regra".

---

## 4. LISTA MESTRA DE PENDÊNCIAS — O QUE PERMANECE LEGITIMAMENTE ABERTO

Consolidando tudo que restou, de todos os documentos, depois desta etapa:

**Pendências do conceitual original, ainda não-bloqueantes:**
- Pendência 1 — natureza jurídica das Empresas
- Pendência 3 — identificar qual sócio faz uma Retirada do Patrão
- Pendência 5 — usuários e níveis de permissão (modelo completo; mitigado por "Usuário mínimo")
- Pendência 8 — rateio pode ficar parcialmente pendente
- Pendência 9 — alocação de veículo a obra sem despesa
- Pendência 10 — rejeição de sugestão de IA alimentar aprendizado futuro
- Pendência 11 — ordem de implementação da IA (decisão de produto)
- Pendência 12 — mecanismo exato da barreira de confirmação Alto
- **Pendência 2 — tolerância de dias no matching de conciliação, recém-reclassificada, com a exigência adicional de ser configurável**

**Achados da auditoria sistêmica, ainda não resolvidos:**
- Achado 1 — catálogo `tipo_ação → nível_sensibilidade` sem dono (a resolver quando o módulo de IA for modelado em detalhe)
- Achado 3 — sobreposição de escopo entre Sugestão IA e Ação Proposta IA
- Achado 4 — nota formal ainda não escrita reconciliando "auditoria desde o dia 1" com "usuário não-bloqueante" (mitigação já existe, falta só o registro)
- Achado 5 — dependência circular Empresa/permissão para Ações de IA que criam Lançamento (condicional à pendência 5)
- Achado 7 — a própria fragmentação de pendências entre documentos (que esta consolidação já está resolvendo)
- Achado 9 — campo para "segundo aprovador" (condicional à pendência 12)

**Decisões tecnológicas** (Seção 15 de `arquitetura-tecnica.md`, todas as 16) — linguagem, framework, banco físico, ORM, frontend, autenticação, hospedagem, provedor de IA, orquestração de IA, integração bancária futura, mecanismo do vínculo genérico *no nível técnico* (a forma conceitual já está decidida — decisão 3 — falta só a técnica de implementação), camada que popula o log, modelo de permissões, ordem da IA — todas explicitamente fora do escopo desta fase.

Nenhuma dessas impede a modelagem de banco de dados de começar.

---

## 5. EXISTE ALGUMA INCONSISTÊNCIA RESIDUAL A RESOLVER ANTES DE CONSOLIDAR?

Verifiquei especificamente se as 11 decisões desta etapa são consistentes entre si e com o que já existia — não uma nova auditoria, só a checagem de coerência necessária antes de qualquer consolidação.

**Não encontrei nenhuma inconsistência que bloqueie a consolidação.** Três pontos, porém, merecem registro — nenhum impede prosseguir, mas afetam *como* a edição deve ser feita:

1. **A "lista fechada de entidades" exigida pela Decisão 3** (para `LOG_AUDITORIA.entidade`) nunca foi explicitamente enumerada como artefato próprio — hoje ela existe só de forma distribuída, porque cada um dos 24 documentos de entidade já declara, na sua Seção 5, se é "auditável". A consolidação deveria compilar essa lista uma vez, num só lugar (proponho: dentro do próprio `24-log-auditoria.md`, já que é ele quem a usa). Isto não é uma inconsistência — é um trabalho de compilação que a consolidação já resolve naturalmente.
2. **A classificação de `FATURA.valor_total_calculado`** (Seção 5 daquele documento, hoje "Calculado") precisa de uma reclassificação mais precisa ao incorporar a Decisão 6: não é mais "sempre calculado", é "calculado uma vez, no fechamento, e então persistido como fato histórico congelado". É um ajuste de precisão na própria entidade, não uma contradição.
3. **Onde vivem os dois princípios gerais** (separação de entidades; definição de negócio) ainda não foi decidido — não é uma inconsistência, é uma decisão editorial pendente, tratada a seguir.

**Confirmação de consistência com decisões anteriores**: a Decisão 1 (status do Lançamento) resolve formalmente a Divergência 7 da arbitragem técnica, exatamente como ela já previa. A Decisão 3 confirma e generaliza o padrão já usado em `22-sugestao-ia.md` desde sua redação original. A Decisão 8 é consistente com (e mais específica que) a distinção já registrada naquele mesmo documento entre "provedor de IA" e "entidades de estado da IA". Nenhuma decisão desta etapa contradiz nada já aprovado nas etapas de arquitetura técnica, auditoria, réplica ou arbitragem.

---

## DECISÃO PENDENTE ANTES DE CONSOLIDAR (preciso da sua orientação)

Onde os dois princípios gerais consolidados nesta etapa devem viver formalmente:

- **Opção 1**: dentro de `project-rules.md`, como novas regras do projeto — já é o documento que define "como trabalhar, o que nunca fazer".
- **Opção 2**: dentro do documento técnico consolidado (Seção 2.2), como princípios de modelagem — mais próximo de onde decisões de forma de entidade são discutidas.
- **Opção 3**: num documento novo e específico, dedicado só a princípios de modelagem transversais (separado tanto das regras de projeto quanto da arquitetura técnica).

Não vou escolher por conta própria — é uma decisão editorial sobre organização da documentação, exatamente o tipo de coisa que esta fase pede para eu levantar, não decidir sozinho.

---

## RESUMO PARA APROVAÇÃO

1. 10 documentos de entidade recebem edição pontual (Seção 2.1).
2. 2 documentos de arquitetura técnica se fundem em 1 (Seção 2.2).
3. 1 documento novo é criado — lista mestra de pendências (Seção 2.3).
4. 3 documentos recebem atualização de status (Seção 2.4).
5. 9 documentos de processo migram para histórico, sem serem apagados (Seção 3).
6. Nenhuma inconsistência bloqueia a execução — só uma decisão editorial em aberto (onde vivem os 2 princípios gerais).

**Nada foi executado.** Aguardo sua aprovação — geral, ou com a escolha de onde os princípios gerais devem viver — antes de tocar em qualquer arquivo.
