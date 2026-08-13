# Lista Mestra de Pendências
## Sistema Financeiro/Gerencial H Vieira Terraplanagem

**Natureza deste documento**: a partir desta consolidação, esta é **a única fonte corrente de pendências do projeto**. Nenhum outro documento deve ser consultado para saber "o que ainda está em aberto" — cada um dos documentos de origem (conceitual, arquitetura técnica, arbitragem, revisão de integridade, auditoria sistêmica) continua sendo a referência detalhada de *por que* cada pendência existe, mas não deve mais ser tratado como lista de pendências em si.

**O que este documento não contém**: pendências já resolvidas ao longo da consolidação (Pendências 1 a 11) não aparecem aqui como itens abertos — só um índice breve delas na Seção 7, para rastreabilidade.

**Formato**: cada pendência traz origem, motivo de permanecer aberta, fase em que deve ser resolvida, e se bloqueia alguma etapa futura. Dependências entre pendências são registradas explicitamente onde existem. Itens fundidos de mais de uma fonte citam todas as origens.

---

## ÍNDICE

1. Domínio
2. Arquitetura
3. IA
4. Banco de Dados
5. Tecnologia
6. Melhorias Futuras
7. Pendências já resolvidas (índice, não repetidas em detalhe)

---

## 1. DOMÍNIO

**D1 — Natureza jurídica das 6 "empresas" do grupo**
- Origem: conceitual, pendência 1
- Motivo em aberto: não afeta a existência do campo `EMPRESA.tipo`, só seus valores válidos
- Fase de resolução: antes de implementar o cadastro de Empresa, caso `tipo` deva determinar comportamento diferenciado (ex. relatórios fiscais separados)
- Bloqueia etapa futura? Não

**D2 — Retirada do Patrão: identificar qual sócio**
- Origem: conceitual, pendência 3; auditoria sistêmica, achado 8 (confirma a mesma pendência, sem conteúdo novo)
- Motivo em aberto: não há campo ou entidade correspondente hoje, nem definição de negócio de como distinguir sócios
- Fase de resolução: quando a necessidade de segregar por sócio se tornar concreta — funcionalidade futura
- Bloqueia etapa futura? Não

**D3 — Rateio pode ficar parcialmente pendente**
- Origem: conceitual, pendência 8
- Motivo em aberto: não está definido se um Lançamento pode existir com rateio incompleto por um período, ou se o rateio precisa fechar no ato do registro
- Fase de resolução: antes de desenhar o motor de validação de `RATEIO_DESPESA` (Fase 4 — Backend)
- Bloqueia etapa futura? Bloqueia o desenho da regra de validação de Rateio, não o núcleo financeiro

**D4 — Alocação de veículo a obra sem despesa ainda**
- Origem: conceitual, pendência 9
- Motivo em aberto: funcionalidade futura, fora do núcleo, sem definição de negócio hoje
- Fase de resolução: quando a necessidade concreta aparecer — trata-se como nova decisão de modelagem, não continuação desta pendência (`principios-de-modelagem.md`, princípio 2)
- Bloqueia etapa futura? Não

**D5 — Duplicação de `categoria`/`obra`/`veículo` entre Compra Cartão e o Lançamento gerado, sem regra de sincronização**
- Origem: `revisao-integridade-dominio.md`, achado crítico
- Motivo em aberto: não há definição de como (ou se) uma correção posterior em `COMPRA_CARTÃO.categoria`/`obra`/`veículo` deveria propagar para o `LANÇAMENTO_FINANCEIRO` já gerado
- Fase de resolução: antes de implementar o módulo Cartão (Fase 4 — Backend)
- Bloqueia etapa futura? Sim — risco real de duas fontes divergentes para o mesmo fato

**D6 — Vínculo Consórcio contemplado → Veículo não propagado aos Lançamentos de Parcela**
- Origem: `revisao-integridade-dominio.md`, achado crítico
- Motivo em aberto: `LANÇAMENTO_FINANCEIRO.veículo` é preenchido manualmente, sem regra de herança do `CONTRATO_FINANCEIRO.veículo` vinculado
- Fase de resolução: antes de implementar o relatório de custo de Frota para Contratos Financeiros (Fase 4 — Backend, módulo Financiamentos)
- Bloqueia etapa futura? Sim — custo de veículo ficaria incompleto por padrão para consórcios contemplados

**D7 — Vínculo direto `LANÇAMENTO_FINANCEIRO` ↔ `EMPRESA` ausente**
- Origem: `revisao-integridade-dominio.md`; reforçada por auditoria sistêmica, achado 5 (dependência circular com o mecanismo de permissão por Empresa)
- Motivo em aberto: não há campo/relacionamento direto; a Empresa só é conhecida indiretamente (via Veículo, ou só após Liquidação, via Conta Bancária)
- Fase de resolução: antes de implementar controle de acesso por escopo de Empresa
- Bloqueia etapa futura? Não bloqueia o núcleo financeiro; bloqueia especificamente a permissão por Empresa
- **Dependência**: ligada a A2 (modelo de permissão) e A4 (mecanismo dos dois pontos de checagem) — a checagem "por escopo de dado/Empresa" não pode ser implementada para Lançamento sem esta pendência resolvida primeiro

**D8 — Risco de edição retroativa de Rateio após Aplicação de Liquidação já existente**
- Origem: `revisao-integridade-dominio.md`, achado importante
- Motivo em aberto: nada impede hoje que um usuário altere como uma Despesa já paga é rateada entre Obras, mudando retroativamente relatórios de custo já fechados
- Fase de resolução: antes de implementar a regra de edição de `RATEIO_DESPESA` (Fase 4 — Backend)
- Bloqueia etapa futura? Não bloqueia o núcleo, mas deve ser decidida antes do motor de validação de Rateio

**D9 — Valores válidos de `OBRA.status` não enumerados**
- Origem: `domain-model/03-obra.md`, Seção 7 — lacuna identificada durante a modelagem do domínio, não catalogada entre as 14 pendências numeradas do conceitual
- Motivo em aberto: o conceitual não enumera os estados possíveis de uma Obra (diferente de `LANÇAMENTO_FINANCEIRO.status`, cujos valores são explícitos na Seção 2). A existência de `data_prevista_término`/`data_real_término` sugere, no mínimo, uma distinção entre "em andamento" e "concluída", mas não há confirmação textual do conjunto completo de valores, nem de eventuais estados adicionais (ex. "paralisada", "cancelada")
- Fase de resolução: antes de desenhar o cadastro/tela de Obra (Fase 4 — Backend)
- Bloqueia etapa futura? Não bloqueia o núcleo financeiro; bloqueia especificamente a modelagem física do campo `status` de Obra

**D10 — Valores válidos de `VEÍCULO.tipo` não enumerados**
- Origem: `domain-model/07-veiculo.md`, Seção 7 — lacuna identificada durante a modelagem do domínio, mesma natureza da lacuna de D9 (`OBRA.status`), não catalogada entre as 14 pendências numeradas
- Motivo em aberto: o conceitual não enumera os valores possíveis de classificação de Veículo; impacto menor que D9, pois `tipo` de Veículo não aparece hoje amarrado a nenhuma regra de negócio condicional
- Fase de resolução: antes de desenhar o cadastro de Veículo (Fase 4 — Backend), sem urgência
- Bloqueia etapa futura? Não

**D11 — Valores válidos de `PARCELA.status` não enumerados**
- Origem: `domain-model/21-parcela.md`, Seção 7 — lacuna identificada durante a modelagem do domínio, mesma natureza da lacuna de D9/D10, não catalogada entre as 14 pendências numeradas
- Motivo em aberto: sem os valores, não é possível confirmar todos os estados pelos quais uma Parcela passa antes e depois do vencimento (ex. se há distinção entre "não vencida" e "vencida mas ainda não processada"). Não afeta o campo `fatura`, já resolvido (Decisão 7 da consolidação)
- Fase de resolução: antes de implementar o motor de geração de Lançamento a partir de Parcela (Fase 4 — Backend, módulos Cartão e Financiamentos/Consórcios)
- Bloqueia etapa futura? Não bloqueia o núcleo, mas deve ser decidida antes do desenho da tela/motor de acompanhamento de Parcelas

**D12 — Mutabilidade de `LIQUIDAÇÃO_FINANCEIRA` já registrada**
- Origem: `domain-model/10-liquidacao-financeira.md`, Seção 7 — lacuna identificada durante a modelagem do domínio; relacionada, mas não idêntica, à pendência 14 do conceitual (já resolvida como Decisão 2 da consolidação, que trata do Lançamento, não da Liquidação em si)
- Motivo em aberto: o conceitual não define se uma Liquidação já registrada pode ser alterada ou apenas estornada/substituída por uma nova. Sem essa definição, os campos da entidade são imutáveis só por inferência (evento já ocorrido), não por regra confirmada
- Fase de resolução: antes de desenhar a tela/rota de correção de Liquidação (Fase 4 — Backend, módulo Financeiro)
- Bloqueia etapa futura? Não bloqueia o núcleo; bloqueia especificamente qualquer funcionalidade de correção de Liquidação já registrada

**D13 — Regras de alteração e exclusão de `AJUSTE_FINANCEIRO` não definidas**
- Origem: `domain-model/15-ajuste-financeiro.md`, Seção 7 — lacuna identificada durante a modelagem do domínio, sem urgência aparente dado o padrão de imutabilidade já observado em toda a cadeia financeira
- Motivo em aberto: o conceitual não define se um Ajuste Financeiro já criado pode ser alterado ou excluído; a inferência de imutabilidade (por analogia ao princípio "nada desaparece") não é regra confirmada
- Fase de resolução: antes de desenhar a tela/rota de edição de Ajuste Financeiro (Fase 4 — Backend, módulo Financeiro), sem urgência
- Bloqueia etapa futura? Não

---

## 2. ARQUITETURA

**A1 — Estilo de arquitetura de software (escolha final)**
- Origem: `arquitetura-tecnica.md`, decisão #1
- Motivo em aberto: Clean Architecture está recomendada, e o critério de proporcionalidade entre perfis de módulo já está resolvido (Seção 4); falta a aprovação formal do estilo em si
- Fase de resolução: Fase 2 (Arquitetura Técnica), antes de iniciar a Fase 4 (Backend)
- Bloqueia etapa futura? Sim — influencia estrutura de pastas e ritmo de implementação

**A2 — Modelo de permissões de usuário**
- Origem: conceitual, pendência 5; `arquitetura-tecnica.md`, decisão #14 (mesmo item, fundido)
- Motivo em aberto: RBAC simples / RBAC + escopo por empresa / ABAC ainda não escolhido; "Usuário mínimo" já viabiliza Auditoria desde o dia 1, mas o modelo completo continua indefinido
- Fase de resolução: antes de implementar controle de acesso (Fase 4 — Backend, módulo Usuários e Permissões)
- Bloqueia etapa futura? Não bloqueia o núcleo financeiro; bloqueia a fase de controle de acesso
- **Dependência**: A4 depende parcialmente deste modelo para sua implementação completa; D7 precisa estar resolvida antes de a checagem por escopo de Empresa funcionar para Lançamento

**A3 — Cruzamento entre papel de usuário e níveis de confirmação da IA**
- Origem: `arquitetura-tecnica.md`, decisão #15
- Motivo em aberto: nem todo usuário com acesso ao Financeiro deveria poder confirmar uma Ação de nível Alto — ainda não decidido
- Fase de resolução: junto com A2, antes de desenhar o cadastro de usuários
- Bloqueia etapa futura? Não bloqueia o núcleo; bloqueia o desenho fino de permissões da IA
- **Dependência**: depende diretamente de A2

**A4 — Mecanismo técnico dos dois pontos de checagem de permissão (por ação + por escopo de dado/Empresa)**
- Origem: `arbitragem-tecnica-final.md`, Divergência 4 — exigência já fixada e incorporada (`arquitetura-tecnica.md`, Seção 11); mecanismo técnico exato ainda aberto
- Motivo em aberto: falta o mecanismo técnico exato que implementa os dois pontos já exigidos
- Fase de resolução: Fase 4 — Backend, antes do primeiro módulo de escrita
- Bloqueia etapa futura? Sim
- **Dependência**: ver A2 e D7

**A5 — Mecanismo técnico de auditoria: automático e ciente de contexto de negócio**
- Origem: `arbitragem-tecnica-final.md`, Divergência 3; `arquitetura-tecnica.md`, decisão #13 (mesmo item, fundido) — exigência já fixada e incorporada (Seção 10); mecanismo técnico exato ainda aberto
- Motivo em aberto: falta escolher o mecanismo exato (decorator, wrapper de "unit of work", ou outro)
- Fase de resolução: Fase 4 — Backend, antes do primeiro módulo de escrita
- Bloqueia etapa futura? Sim

**A6 — Desenho exato do módulo de consulta compartilhado (`application/consultas-financeiras`)**
- Origem: `arbitragem-tecnica-final.md`, Divergência 2 — existência do módulo já fixada e incorporada (Seção 6); desenho interno ainda aberto
- Motivo em aberto: falta desenhar exatamente quais consultas/funções o módulo expõe (custo de obra, custo de veículo, saldo devedor de contrato, etc.)
- Fase de resolução: Fase 4 — Backend, antes de implementar o segundo consumidor de leitura (Balanço, Obra, Frota ou IA)
- Bloqueia etapa futura? Sim, a partir do segundo consumidor

**A7 — Nota de reconciliação textual: "auditoria desde o dia 1" vs. "usuário não-bloqueante"**
- Origem: auditoria sistêmica, achado 4
- Motivo em aberto: já mitigado na prática pelo desenho de "Usuário mínimo" (`domain-model/02-usuario.md`); falta só escrever a nota formal cruzando as duas seções do conceitual
- Fase de resolução: qualquer momento, sem urgência — documentação, não decisão
- Bloqueia etapa futura? Não

---

## 3. IA

**I1 — Catálogo `tipo_ação` → `nível_sensibilidade` sem dono**
- Origem: auditoria sistêmica, achado 1
- Motivo em aberto: não existe registro formal mapeando cada `tipo_ação` possível ao seu `nível_sensibilidade`. A exclusão de "criar Ajuste Financeiro" já foi resolvida (Decisão 8 da consolidação); o catálogo completo continua aberto
- Fase de resolução: Fase 6 — IA (fase "ação"), quando `AÇÃO_PROPOSTA_IA` for modelada em detalhe
- Bloqueia etapa futura? Sim, para a fase de Ação de IA

**I2 — Sobreposição de escopo entre Sugestão IA e Ação Proposta IA**
- Origem: auditoria sistêmica, achado 3
- Motivo em aberto: a mesma correção (ex. mudar `categoria` de um Lançamento) pode, em tese, ser proposta pelos dois caminhos, com níveis de confirmação diferentes, sem regra de precedência definida
- Fase de resolução: Fase 6 — IA (fases "sugestão"/"ação")
- Bloqueia etapa futura? Sim, para a fase de IA

**I3 — Rejeição de sugestão de IA alimentar aprendizado futuro**
- Origem: conceitual, pendência 10
- Motivo em aberto: funcionalidade futura, fora do núcleo
- Fase de resolução: sem fase definida — nova decisão de modelagem quando concreta
- Bloqueia etapa futura? Não

**I4 — Ordem de implementação da IA (leitura → sugestão → ação)**
- Origem: conceitual, pendência 11; `arquitetura-tecnica.md`, decisão #16 (mesmo item, fundido)
- Motivo em aberto: já adotada como recomendação técnica (Seção 14 do documento técnico), mas ainda pendente de confirmação explícita como decisão de produto
- Fase de resolução: antes de iniciar a Fase 6 — IA
- Bloqueia etapa futura? Sim, para o início da Fase 6

**I5 — Mecanismo exato da barreira "Alto"**
- Ver A8 (categoria Arquitetura, por ser primariamente uma decisão de mecanismo técnico) — não duplicado aqui.

**I6 — Orquestração da IA**
- Origem: `arquitetura-tecnica.md`, decisão #9
- Motivo em aberto: chamada direta ao SDK do provedor vs. framework de orquestração de agentes — ainda não escolhido
- Fase de resolução: Fase 6 — IA
- Bloqueia etapa futura? Sim, para a fase de IA

**I7 — Provedor de IA específico**
- Origem: `arquitetura-tecnica.md`, decisão #10
- Motivo em aberto: o conceitual já deixa isso propositalmente em aberto como "modelo de mercado via API" — nenhum provedor avaliado ainda
- Fase de resolução: Fase 6 — IA
- Bloqueia etapa futura? Sim, para a fase de IA

**I8 — Campo para "segundo aprovador" (quem iniciou ≠ quem confirmou)**
- Origem: auditoria sistêmica, achado 9
- Motivo em aberto: `AÇÃO_PROPOSTA_IA` não tem hoje campo para distinguir quem iniciou o pedido de quem confirmou — só necessário se a opção "segundo aprovador" for escolhida para A8
- Fase de resolução: condicional — só relevante se A8 for resolvida nesse sentido
- Bloqueia etapa futura? Não, a menos que A8 seja resolvida escolhendo "segundo aprovador"
- **Dependência**: depende diretamente de A8

---

## 4. BANCO DE DADOS

**A8 — Mecanismo exato da barreira de confirmação "Alto" da IA**
- Origem: conceitual, pendência 12; `arquitetura-tecnica.md`, decisão #8 (mesmo item, fundido)
- Motivo em aberto: reautenticação / segundo aprovador / confirmação simples reforçada — ainda não escolhido. Escopo já reduzido: `AJUSTE_FINANCEIRO` está fora do que a IA pode propor (Decisão 8), então a barreira só precisa cobrir criação/confirmação de `LIQUIDAÇÃO_FINANCEIRA` e ações equivalentes
- Fase de resolução: Fase 6 — IA (fase "ação"), antes de implementar `AÇÃO_PROPOSTA_IA` de nível Alto
- Bloqueia etapa futura? Sim, só para a fase de Ação de IA
- **Dependência**: I8 só se torna necessária se esta pendência for resolvida escolhendo "segundo aprovador"

*(nota: A8 é referenciada em Arquitetura e IA por afetar as duas; listada uma única vez, ver referência cruzada em I5)*

**B1 — Banco de dados físico**
- Origem: `arquitetura-tecnica.md`, decisão #4
- Motivo em aberto: PostgreSQL / MySQL-MariaDB / SQL Server — ainda não escolhido (PostgreSQL apontado como o mais citado para o perfil do domínio, mas não decidido)
- Fase de resolução: Fase 3 — Modelagem do banco
- Bloqueia etapa futura? Sim, para o início da Fase 3

**B2 — ORM / camada de acesso a dados**
- Origem: `arquitetura-tecnica.md`, decisão #5
- Motivo em aberto: depende diretamente da escolha de linguagem/backend (T1) — não é decisão independente
- Fase de resolução: Fase 3/4, junto com T1
- Bloqueia etapa futura? Sim
- **Dependência**: depende de T1

**B3 — Estratégia de índice**
- Origem: `arbitragem-tecnica-final.md`, Divergência 12
- Motivo em aberto: corretamente fora do escopo da Fase 2, mas não deve ser adiada indefinidamente dentro da Fase 3
- Fase de resolução: início da Fase 3 — Modelagem do banco
- Bloqueia etapa futura? Não bloqueia o início da Fase 3, mas deve ser tratada logo no começo dela
- **Dependência**: depende de B1 já escolhido

**B4 — Implementação técnica do vínculo genérico de auditoria**
- Origem: conceitual, pendência 13 (parcialmente resolvida); `arquitetura-tecnica.md`, decisão #12 (mesmo item, fundido)
- Motivo em aberto: a forma conceitual já está resolvida (entidade única, referência genérica — `domain-model/24-log-auditoria.md`); resta a técnica exata. "Tabela dedicada por entidade" foi eliminada por incompatibilidade com a decisão conceitual já tomada — só "referência polimórfica" permanece candidata viável (Event Sourcing mantido só por completude, já considerado desproporcional)
- Fase de resolução: Fase 3 — Modelagem do banco
- Bloqueia etapa futura? Sim, para a modelagem física de `LOG_AUDITORIA`

---

## 5. TECNOLOGIA

**T1 — Linguagem/framework de backend**
- Origem: `arquitetura-tecnica.md`, decisão #2
- Motivo em aberto: Node.js+TypeScript (NestJS) / Python (FastAPI) / .NET (C#) — ainda não escolhido
- Fase de resolução: antes do início da Fase 4 — Backend
- Bloqueia etapa futura? Sim
- **Dependência**: B2 depende desta

**T2 — Framework de frontend**
- Origem: `arquitetura-tecnica.md`, decisão #3
- Motivo em aberto: React (Next.js) / Vue 3 / Angular — ainda não escolhido
- Fase de resolução: Fase 5 — Frontend
- Bloqueia etapa futura? Sim, para o início da Fase 5

**T3 — Estratégia de autenticação**
- Origem: `arquitetura-tecnica.md`, decisão #6
- Motivo em aberto: autenticação própria (JWT) / provedor externo — ainda não escolhido
- Fase de resolução: Fase 4 — Backend
- Bloqueia etapa futura? Sim
- **Dependência**: relacionada a A4 — o guard de entrada precisa de um mecanismo de autenticação para saber "quem"

**T4 — Hospedagem/infraestrutura**
- Origem: `arquitetura-tecnica.md`, decisão #7
- Motivo em aberto: amarrada a T1 e B1 — ainda não decidida
- Fase de resolução: pode ser decidida em paralelo às Fases 4-5, antes do deploy
- Bloqueia etapa futura? Não bloqueia o início da implementação
- **Dependência**: depende de T1 e B1

**T5 — Momento e provedor de integração bancária futura (Open Finance)**
- Origem: `arquitetura-tecnica.md`, decisão #11
- Motivo em aberto: upload manual já cobre a necessidade hoje; agregador Open Finance / API direta do banco são opções futuras
- Fase de resolução: Fase 7 — Integração bancária, só depois do núcleo validado em produção com importação manual
- Bloqueia etapa futura? Não

**T6 — Tolerância de dias no matching automático de conciliação**
- Origem: conceitual, pendência 2 — já reclassificada como não-bloqueante durante a consolidação
- Motivo em aberto: parâmetro operacional dependente do comportamento real dos bancos usados pela empresa; deve ser configurável, nunca uma constante fixa
- Fase de resolução: quando o mecanismo de sugestão automática de conciliação for projetado (Fase 4 — Backend, módulo Conciliação)
- Bloqueia etapa futura? Não

---

## 6. MELHORIAS FUTURAS

*(formato resumido: origem, descrição, motivo, fase — sem repetir a argumentação completa dos documentos de origem)*

**M1 — Vocabulário arquitetural duplo (Clean Architecture + Porta/Adaptador)**
- Origem: `arbitragem-tecnica-final.md`, Divergência 8
- Descrição: delimitar por escrito onde termina um vocabulário e começa o outro
- Motivo: ambiguidade de baixo impacto, cosmética
- Fase: qualquer momento, antes ou depois do início da implementação

**M2 — Critério de teste para cenários compartilhados entre integração e aceitação**
- Origem: `arbitragem-tecnica-final.md`, Divergência 9
- Descrição: documentar o que cada camada de teste afirma quando dois níveis testam o mesmo cenário
- Motivo: só relevante quando o plano de testes for efetivamente escrito
- Fase: Fase 4 — Backend, na escrita do plano de testes

**M3 — Ferramenta de análise de dependência arquitetural**
- Origem: `arbitragem-tecnica-final.md`, Divergência 10
- Descrição: adicionar a ferramenta (linter de arquitetura) à lista de decisões de stack
- Motivo: só relevante quando a suíte de testes for configurada em CI
- Fase: Fase 4 — Backend, junto com T1

**M4 — Classificar pendências de negócio como comportamentais ou estruturais antes de estimar esforço**
- Origem: `arbitragem-tecnica-final.md`, Divergência 11
- Descrição: ao resolver cada pendência de Domínio ainda aberta, avaliar se ela muda comportamento ou estrutura de entidade antes de estimar esforço
- Motivo: critério a aplicar caso a caso, não uma decisão isolada
- Fase: aplicável a cada pendência da Seção 1 (Domínio), conforme forem resolvidas

**M5 — Redundância de `PARCELA.total`**
- Origem: `revisao-integridade-dominio.md`
- Descrição: o valor se repete identicamente em toda Parcela do mesmo parcelamento
- Motivo: redundância técnica de baixo risco, não de negócio
- Fase: Fase 3 — Modelagem do banco, se tratada como otimização de schema

**M6 — `AJUSTE_FINANCEIRO.observação` talvez devesse ser obrigatório**
- Origem: `revisao-integridade-dominio.md`
- Descrição: hoje opcional; exigir justificativa mínima teria valor de auditoria
- Motivo: sugestão, não confirmada como regra de negócio
- Fase: revisão de domínio futura, se a necessidade for confirmada

**M7 — `status_financeiro` de um Lançamento não comunica que ele foi objeto de um Ajuste**
- Origem: `revisao-integridade-dominio.md`
- Descrição: um Lançamento com `status_financeiro` = Pago pode já ter sido revertido por Ajuste, visível só consultando Ajuste separadamente
- Motivo: consistente com o princípio de cálculo em consulta, mas risco de confusão em relatórios
- Fase: Fase 5 — Frontend/relatórios, ao desenhar telas que exibam status

**M8 — Ambiguidade sobre Ajuste-de-Ajuste (cadeia de correções)**
- Origem: `revisao-integridade-dominio.md`
- Descrição: não está definido se um Lançamento de ajuste pode, por sua vez, ser objeto de um novo Ajuste
- Motivo: cenário não coberto explicitamente pelo conceitual
- Fase: revisão de domínio futura, se o cenário se tornar concreto

---

## 7. PENDÊNCIAS JÁ RESOLVIDAS (ÍNDICE, NÃO REPETIDAS EM DETALHE)

Resolvidas durante a etapa de consolidação (Pendências 1 a 11) — ver `plano-final-consolidacao.md`, Seção 1, e os documentos de entidade correspondentes para o detalhe de cada decisão:

1. Estratégia de cálculo do `status` de `LANÇAMENTO_FINANCEIRO`
2. Cancelamento de Lançamento com Aplicação de Liquidação já existente (pendência 14 do conceitual)
3. Vínculo genérico de `LOG_AUDITORIA`/`SUGESTÃO_IA`/`AÇÃO_PROPOSTA_IA` — forma conceitual (pendência 13 do conceitual, parcial — técnica permanece em B4)
4. Unificação de `CONTRATO_FINANCEIRO` (pendência 6 do conceitual)
5. Separação de `CATEGORIA` em natureza/sub-conta (pendência 4 do conceitual)
6. Relação `FATURA`↔`PARCELA`↔`COMPRA_CARTÃO` e congelamento de totais de Fatura fechada
7. Estado da Parcela antes da Fatura, e regra de atribuição de ciclo (Cenário A vs. B)
8. IA pode propor criar `AJUSTE_FINANCEIRO`? — Não, exclusivamente humano
9. Fórmula de saldo devedor de `CONTRATO_FINANCEIRO`
10. Tolerância de soma do Rateio (pendência 7 do conceitual)
11. Tolerância de dias no matching de conciliação (pendência 2 do conceitual) — reclassificada como não-bloqueante, ver T6

Resolvida durante a Etapa 3 (consolidação da arquitetura técnica):
- Confirmação de que o módulo Financeiro cria `LIQUIDAÇÃO_FINANCEIRA` ao fechar uma Fatura (arbitragem técnica, Divergência 6) — já incorporada em `arquitetura-tecnica.md`, Seção 6.
- Correção de posicionamento da IA na estrutura de pastas (arbitragem técnica, Divergência 5) — já incorporada em `arquitetura-tecnica.md`, Seção 6.
