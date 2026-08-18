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

*Nenhuma pendência aberta nesta categoria no momento — todas resolvidas (D1-D13, ver Seção 7).*

---

## 2. ARQUITETURA

*Nenhuma pendência aberta nesta categoria no momento — todas resolvidas (A6, A7, ver Seção 7).*

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

---

## 4. BANCO DE DADOS

**B2 — Estratégia complementar de consultas agregadas (avaliação futura de implementação)**
- Origem: `arquitetura-tecnica.md`, decisão #5
- Situação: **o ORM principal já está oficialmente decidido** — Hibernate/JPA via Spring Data JPA, definido em `decisions.md`, decisão #12, decorrente de T1 (ver também `arquitetura-tecnica.md`, Seção 5.4). **B2 não é mais uma decisão de tecnologia** — permanece só como avaliação futura de implementação: se as consultas agregadas mais complexas do domínio (custo de Obra, custo de Veículo, saldo devedor de Contrato) vão precisar de uma estratégia complementar ao Spring Data JPA (ex. jOOQ)
- Fase de resolução: A6 já está desenhada em nível arquitetural (`decisions.md`, decisão #35) — pré-requisito satisfeito; falta só existir um caso real que justifique a análise, não antes
- Bloqueia etapa futura? Não bloqueia o início da Fase 4, nem nenhum módulo que não dependa de consulta agregada complexa
- **Dependência**: dependia de A6 estar desenhada — satisfeita; permanece aberta só pela ausência de caso real

---

## 5. TECNOLOGIA

**T2 — Framework de frontend**
- Origem: `arquitetura-tecnica.md`, decisão #3
- Motivo em aberto: React (Next.js) / Vue 3 / Angular — ainda não escolhido
- Fase de resolução: Fase 5 — Frontend
- Bloqueia etapa futura? Sim, para o início da Fase 5

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
3. Vínculo genérico de `LOG_AUDITORIA`/`SUGESTÃO_IA`/`AÇÃO_PROPOSTA_IA` — forma conceitual (pendência 13 do conceitual, parcial — técnica resolvida separadamente em B4)
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

Resolvida durante a Fase 3 (modelagem física do banco de dados):
- **B1 — Banco de dados físico**: PostgreSQL definido como SGBD oficial do projeto — decisão congelada em `arquitetura-fisica-banco.md`, Seção 1 (Etapa 3.2), sem alternativas em aberto; já implementado no schema físico (`database/`).

Resolvida no início da Fase 4 (congelamento de T1):
- **T1 — Linguagem/framework de backend**: Java 21 LTS + Spring Boot definidos como stack oficial do backend, com Maven como gerenciador de dependências e Hibernate/JPA como ORM principal — decisão congelada em `decisions.md`, decisão #12; `arquitetura-tecnica.md`, Seção 5.1, atualizada.

Resolvida no início da Fase 4 (congelamento de A1):
- **A1 — Estilo de arquitetura de software**: Clean Architecture congelada como estilo oficial, com o vocabulário de Ports & Adapters (Hexagonal) tratado como a mesma alternativa arquitetural (diferença só de vocabulário/ênfase) — decisão congelada em `decisions.md`, decisão #13; `arquitetura-tecnica.md`, Seção 4, atualizada; estrutura de pastas da Seção 6 passa de recomendação a padrão oficial do backend.

Resolvida no início da Fase 4 (congelamento de T3):
- **T3 — Estratégia de autenticação**: autenticação própria congelada — Spring Security, usuário/senha, JWT como mecanismo de autenticação, hash de senha com Argon2 (preferencial; bcrypt só como alternativa documentada) — nenhum provedor externo — decisão congelada em `decisions.md`, decisão #14; `arquitetura-tecnica.md`, Seção 5.5, atualizada.

Resolvida no início da Fase 4 (congelamento de A4):
- **A4 — Mecanismo técnico dos dois pontos de checagem de permissão**: composição de Spring Security Method Security (ponto i — autorização por ação, no bean de aplicação que executa cada operação) e Hibernate/JPA Filters via `@FilterDef`/`@Filter` (ponto ii — autorização por escopo de dado/Empresa) — decisão congelada em `decisions.md`, decisão #15; `arquitetura-tecnica.md`, Seção 11, atualizada.

Resolvida no início da Fase 4 (congelamento de A2):
- **A2 — Modelo de permissões de usuário**: RBAC + escopo por Empresa congelado como modelo oficial — papel fixo combinado com escopo sobre uma ou mais Empresas do grupo às quais o usuário tem acesso — decisão congelada em `decisions.md`, decisão #16; `arquitetura-tecnica.md`, Seção 11, atualizada.

Resolvida no início da Fase 4 (congelamento de A3):
- **A3 — Cruzamento entre papel de usuário e níveis de confirmação da IA**: Papel → nível máximo congelado como modelo oficial — cada papel de usuário autoriza a confirmação até um nível máximo fixo entre os três definidos no conceitual (Baixo, Médio, Alto) — decisão congelada em `decisions.md`, decisão #17; `arquitetura-tecnica.md`, Seção 11, atualizada.

Resolvida no início da Fase 4 (congelamento de A5):
- **A5 — Mecanismo técnico de auditoria automática**: aspecto customizado (Spring AOP, `@Around`) congelado como mecanismo oficial — intercepta cada caso de uso de escrita, captura o estado do registro antes e depois da operação e grava a linha correspondente em `LOG_AUDITORIA` na mesma transação da escrita de negócio, com o contexto de negócio completo exigido por `LOG_AUDITORIA` como parâmetro obrigatório de entrada — decisão congelada em `decisions.md`, decisão #18; `arquitetura-tecnica.md`, Seção 10 e Seção 15, atualizadas. A técnica física do vínculo genérico de `LOG_AUDITORIA` foi resolvida separadamente — ver item B4.

Resolvida no início da Fase 4 (congelamento de B4):
- **B4 — Implementação técnica do vínculo genérico de auditoria**: referência polimórfica (`entidade_tipo`/`entidade_id`, e os pares equivalentes em `LOG_AUDITORIA.referencia_tipo`/`referencia_id` e `SUGESTÃO_IA.entidade_alvo_tipo`/`entidade_alvo_id`) congelada como mecanismo oficial — sem FK nativa do banco; integridade mitigada, não eliminada, pela validação na camada de aplicação que grava os registros de auditoria; mapeada em Hibernate/JPA como campos simples, sem `@Any`/`@ManyToAny` — decisão congelada em `decisions.md`, decisão #20; `arquitetura-tecnica.md` (Seção 10 e Seção 15), `arquitetura-fisica-banco.md` (Seções 6, 8, 9, 10), `modelo-logico.md` e `docs/modelagem-fisica/09-ia-auditoria.md` atualizados. A estratégia definitiva de indexação das colunas de referência genérica segue o critério objetivo de B3, já resolvida em nível arquitetural (`decisions.md`, decisão #37).

Resolvida no início da Fase 4 (congelamento de D7):
- **D7 — Vínculo direto `LANÇAMENTO_FINANCEIRO` ↔ `EMPRESA`**: premissa de negócio definida durante esta resolução — todo `LANÇAMENTO_FINANCEIRO` pertence obrigatoriamente a uma `EMPRESA` desde sua criação. `empresa_id` (FK, `NOT NULL`) acrescentado a `LANÇAMENTO_FINANCEIRO`, com preenchimento/validação (incluindo consistência com `VEÍCULO.empresa_id`) na camada de aplicação; `AÇÃO_PROPOSTA_IA` ganha `empresa_id` (FK, nullable) e o status "Aguardando Empresa", para propostas de IA sem Empresa ainda determinada — decisão congelada em `decisions.md`, decisão #21; `domain-model/09-lancamento-financeiro.md`, `domain-model/23-acao-proposta-ia.md`, `modelo-logico.md`, `docs/modelagem-fisica/02-lancamento-financeiro.md`, `docs/modelagem-fisica/09-ia-auditoria.md` e `arquitetura-tecnica.md` (Seção 11) atualizados.

Resolvida no início da Fase 4 (congelamento de A8):
- **A8 — Mecanismo da barreira reforçada para ações de IA de nível Alto**: reautenticação (senha) congelada como mecanismo oficial — no momento da confirmação de uma `AÇÃO_PROPOSTA_IA` de nível Alto, o usuário reinforma sua senha, verificada contra o hash já definido em T3 (Argon2), como controle adicional e independente da sessão/token JWT em uso; aplica-se exclusivamente à criação/confirmação de `LIQUIDAÇÃO_FINANCEIRA` e ações equivalentes (`AJUSTE_FINANCEIRO` já excluído pela Decisão 8). "Segundo aprovador" excluído da comparação técnica por reproduzir o cenário de usuário financeiro único já rejeitado em A3; "Confirmação simples reforçada" descartada por não oferecer verificação adicional de identidade — decisão congelada em `decisions.md`, decisão #22; `arquitetura-tecnica.md` (Seção 8 e Seção 15) atualizada. I5 (mesmo item, referenciado a partir da categoria IA) e I8 (campo para "segundo aprovador") removidos desta lista — I5 por ser o mesmo item de A8 sob outra categoria, I8 por depender de uma alternativa que não foi a escolhida.

Resolvida na Fase 4, por auditoria documental (congelamento de D1):
- **D1 — Existência de `EMPRESA.tipo`**: pendência reformulada ("quais valores `tipo` deve ter?" → "o atributo ainda pertence ao modelo?") e resolvida como remoção do campo — auditoria completa não encontrou nenhuma regra, decisão congelada, entidade ou mecanismo que consultasse ou dependesse de `tipo`, em nenhum momento da evolução do projeto; existência decorria só de herança do catálogo conceitual original, sem função confirmada — princípio 2 de modelagem aplicado. Decisão congelada em `decisions.md`, decisão #23; `domain-model/01-empresa.md`, `modelo-logico.md`, `modelagem-fisica/01-cadastros-basicos.md` e `database/02_tables/01_cadastros_basicos.sql` atualizados. `arquitetura-conceitual.md` permanece inalterado (nunca editado) — continua listando `tipo` no catálogo original, superado por esta decisão.

Resolvida na Fase 4, por perda de necessidade de negócio (congelamento de D2):
- **D2 — Identificação individual do sócio em "Retirada do Patrão"**: resolvida como não necessária — confirmado que existe apenas um patrão realizando retiradas; a classificação `Retirada do Patrão` (`MOVIMENTAÇÃO_BANCÁRIA`/`COMPRA_CARTÃO`) permanece exatamente como já implementada, sem diferenciação por sócio. Nenhuma estrutura (campo/entidade) chegou a ser criada — decisão é não criar nada. Decisão congelada em `decisions.md`, decisão #24. Nenhum documento de domínio, lógico, físico ou schema alterado.

Resolvida na Fase 4, por resposta de negócio (congelamento de D3):
- **D3 — Rateio pode ficar parcialmente pendente**: resolvido que sim — um Lançamento pode existir com `RATEIO_DESPESA` incompleto (soma menor que o valor do Lançamento) por tempo indeterminado, sem prazo para fechamento, confirmado pela operação real. Regra de soma exata (Decisão 10) passa a valer no fechamento do rateio, não a cada escrita. Nenhuma coluna/constraint nova — completude sempre calculada, nunca persistida (princípio 6). Decisão congelada em `decisions.md`, decisão #25; `domain-model/16-rateio-despesa.md`, `modelo-logico.md` e `modelagem-fisica/08-obras-veiculos-rateio.md` atualizados. D8 (edição retroativa de Rateio) permanece pendência distinta, não afetada.

Resolvida na Fase 4, por confirmação de necessidade de negócio (congelamento de D4):
- **D4 — Alocação operacional de Veículo a Obra sem despesa**: confirmada necessidade real (logística diária, base para sugestão automática de Obra e futura gestão de equipes). `VEÍCULO` ganha `obra_atual` (FK opcional para `OBRA`), independente da dimensão financeira já existente. Histórico de mudanças via `LOG_AUDITORIA` — nenhuma entidade dedicada de alocação criada (sem requisito confirmado de múltiplas alocações ou agendamento). Decisão congelada em `decisions.md`, decisão #26; `domain-model/07-veiculo.md`, `domain-model/03-obra.md`, `modelo-logico.md`, `modelagem-fisica/08-obras-veiculos-rateio.md` e schema físico atualizados.

Resolvida na Fase 4, por resposta de negócio (congelamento de D5):
- **D5 — Sincronização entre `COMPRA_CARTÃO` e `LANÇAMENTO_FINANCEIRO` gerado**: correção de `categoria`/`obra`/`veículo` em `COMPRA_CARTÃO` propaga automaticamente para Lançamentos já gerados, exceto quando já existe `RATEIO_DESPESA` vinculado (desacoplamento definitivo, correção passa a ser manual). Parcelas futuras já leem o valor vigente no momento do vencimento — mecanismo pré-existente, sem necessidade de propagação. Nenhuma alteração de schema — regra de aplicação. Decisão congelada em `decisions.md`, decisão #27; `domain-model/18-compra-cartao.md`, `domain-model/09-lancamento-financeiro.md`, `domain-model/21-parcela.md`, `domain-model/16-rateio-despesa.md` e `modelagem-fisica/06-cartao-credito.md` atualizados.

Resolvida na Fase 4, por resposta de negócio (congelamento de D6):
- **D6 — Vínculo Consórcio contemplado → Veículo, propagação aos Lançamentos de Parcela**: só Lançamentos gerados **após** a contemplação herdam automaticamente o `veículo` do Contrato Financeiro — Lançamentos já gerados antes permanecem sem propagação retroativa, por escolha de negócio (sem necessidade operacional confirmada). Diferente de D5, nenhum gatilho de desacoplamento aplicável — não há propagação para o passado em nenhuma circunstância. Nenhuma alteração de schema. Decisão congelada em `decisions.md`, decisão #28; `domain-model/20-contrato-financeiro.md`, `domain-model/21-parcela.md` e `domain-model/09-lancamento-financeiro.md` atualizados.

Resolvida na Fase 4, por resposta de negócio (congelamento de D8):
- **D8 — Edição de `RATEIO_DESPESA` após Aplicação de Liquidação já existente**: mantido o status quo — Rateio permanece livremente editável mesmo após liquidação, sem mecanismo equivalente a `AJUSTE_FINANCEIRO`. Correções de erro são feitas diretamente no registro. Rastreabilidade preservada só via `LOG_AUDITORIA` genérico, sem mecanismo dedicado. Nenhuma alteração de schema. Decisão congelada em `decisions.md`, decisão #29; `domain-model/16-rateio-despesa.md` atualizado.

Resolvida na Fase 4, por resposta de negócio (congelamento de D9):
- **D9 — Valores válidos de `OBRA.status`**: definidos como A executar / Em andamento / Pausada / Concluída, com transições A executar → Em andamento, Em andamento ⇄ Pausada, Em andamento → Concluída; valor inicial A executar. Schema físico ganha `CHECK`/`DEFAULT` (mesmo padrão de campos enumerados já existentes). Decisão congelada em `decisions.md`, decisão #30; `domain-model/03-obra.md`, `modelo-logico.md`, `modelagem-fisica/08-obras-veiculos-rateio.md` e schema físico atualizados.

Resolvida na Fase 4, por resposta de negócio (congelamento de D10):
- **D10 — Valores válidos de `VEÍCULO.tipo`**: definidos como Caminhão / Escavadeira / Pá carregadeira / Trator / Rolo compactador / Veículo leve / Terceiro / Outro. `Terceiro` separa custo de frota própria vs. equipamento alugado; `Outro` é categoria residual sem regra especial. Schema físico ganha `CHECK` (sem `DEFAULT` — nenhum valor inicial natural confirmado). Decisão congelada em `decisions.md`, decisão #31; `domain-model/07-veiculo.md`, `modelo-logico.md`, `modelagem-fisica/08-obras-veiculos-rateio.md` e schema físico atualizados.

Resolvida na Fase 4, por reformulação e remoção de atributo (congelamento de D11):
- **D11 — Existência de `PARCELA.status`**: pendência reformulada ("quais valores `status` deve ter?" → "o atributo ainda pertence ao modelo?") e resolvida como remoção do campo — não existe nas planilhas originais, nenhuma regra de negócio o utiliza, e a dimensão mais relevante ("gerou Lançamento ou não") já é 100% derivável de `lançamento_financeiro`, coluna já existente. Decisão congelada em `decisions.md`, decisão #32; `domain-model/21-parcela.md`, `modelo-logico.md`, `modelagem-fisica/06-cartao-credito.md` e schema físico atualizados.

Resolvida na Fase 4, por análise conceitual de precedentes (congelamento de D12):
- **D12 — Mutabilidade de `LIQUIDAÇÃO_FINANCEIRA`**: definida como imutável desde a criação — nenhum dos quatro campos pode ser alterado após o registro. Consistente com o texto literal do princípio 5 de modelagem (que cita "uma liquidação" como exemplo de fato histórico), com `APLICAÇÃO_DE_LIQUIDAÇÃO` (mesma família, já imutável) e com `MOVIMENTAÇÃO_BANCÁRIA` (campos factuais sem previsão de edição). Decisão trata exclusivamente da mutabilidade — não abre nem pressupõe pendência sobre mecanismo de correção. Nenhuma alteração de schema. Decisão congelada em `decisions.md`, decisão #33; `domain-model/10-liquidacao-financeira.md`, `modelo-logico.md` e `modelagem-fisica/03-liquidacao-financeira.md` atualizados.

Resolvida na Fase 4, por resposta de negócio ancorada no princípio 5 (congelamento de D13):
- **D13 — Mutabilidade e exclusão de `AJUSTE_FINANCEIRO`**: `tipo_ajuste`, `valor`, `data` e `observação` tornam-se imutáveis desde a criação, por regra confirmada — mesmo raciocínio de D12, ancorado no princípio 5 ("uma decisão já tomada"). Exclusão física já coberta pela regra geral do projeto (entidades de fato financeiro não sofrem `DELETE`, `arquitetura-fisica-banco.md` §7) — formalizada, sem regra nova. `usuário` fora do escopo, mutabilidade inalterada. M8 (Ajuste-de-Ajuste) não tocada. Nenhuma alteração de schema. Decisão congelada em `decisions.md`, decisão #34; `domain-model/15-ajuste-financeiro.md`, `modelo-logico.md`, `modelagem-fisica/05-ajuste-financeiro.md` e `arquitetura-fisica-banco.md` atualizados.

**Marco**: com D13 resolvida, a categoria Domínio (Seção 1) não tem mais nenhuma pendência aberta.

Resolvida na Fase 4, em nível arquitetural (congelamento de A6):
- **A6 — Desenho arquitetural do módulo de consulta compartilhado (`application/consultas-financeiras`)**: definida responsabilidade, consumidores fechados (Balanço, Obra, Frota, IA), quatro categorias de consulta (custo agregado por dimensão; resultado financeiro derivado; saldo/posição em aberto; efeito líquido de correções) e contrato arquitetural — sem fixar métodos concretos nem fórmulas internas, que permanecem para quando cada funcionalidade for especificada. Ambiguidades de fórmula (sinal do Ajuste, exclusão de Cancelado, terminologia de status) permanecem documentadas em `plano-implementacao-sql.md`, deliberadamente não elevadas a pendência formal. Decisão congelada em `decisions.md`, decisão #35; `arquitetura-tecnica.md` atualizada. B2 tem seu pré-requisito satisfeito, mas continua aberta (falta caso real).

Resolvida na Fase 4, por registro documental (congelamento de A7):
- **A7 — Nota de reconciliação textual: "auditoria desde o dia 1" vs. "usuário não-bloqueante"**: registrada formalmente a explicação já decorrente do desenho existente — `LOG_AUDITORIA` sempre pôde existir desde o início graças ao "Usuário mínimo", sem depender do modelo completo de permissões; hoje a tensão tem só valor histórico, já que a pendência 5 foi encerrada por A2 (decisão #16). Decisão congelada em `decisions.md`, decisão #36; `domain-model/02-usuario.md` e `domain-model/24-log-auditoria.md` atualizados.

**Marco**: com A7 resolvida, a categoria Arquitetura (Seção 2) também não tem mais nenhuma pendência aberta.

Resolvida na Fase 4, em nível arquitetural (congelamento de B3):
- **B3 — Estratégia de índice**: `PK`/`FK`/`UNIQUE` permanecem parte do schema inicial (já implementado). Índices adicionais entram no schema inicial só quando uma consulta ou regra de negócio já documentada demonstrar necessidade objetiva (critério aplicado durante a implementação de cada módulo) — sem lista de colunas congelada por esta decisão. Qualquer outro índice só é criado após medição real de desempenho. `obra_id`/`veiculo_id`/`data_competência`/`vencimento` permanecem como exemplos do critério, não obrigação. Decisão congelada em `decisions.md`, decisão #37; `arquitetura-fisica-banco.md` §8 atualizada.

Resolvida na Fase 4, em nível arquitetural (congelamento de T4):
- **T4 — Estratégia de hospedagem/infraestrutura**: implantação inicial prioriza plataforma PaaS gerenciada (categoria, não provedor específico), reduzindo carga operacional; escolha do provedor permanece decisão operacional, sem impacto na arquitetura. VPS e provedores de maior porte (AWS/Azure) continuam compatíveis, mas não são estratégia inicial — migração só quando houver necessidade real de escala/disponibilidade/integrações. Decisão congelada em `decisions.md`, decisão #38; `arquitetura-tecnica.md` §5.6 e Seção 15 atualizadas.

Satisfeita documentalmente, sem decisão nova (M1):
- **M1 — Vocabulário arquitetural duplo (Clean Architecture + Porta/Adaptador)**: já respondida por completo pela decisão #13 (A1), que declara Clean Architecture e Hexagonal/Ports & Adapters como **a mesma alternativa arquitetural**, não vocabulários concorrentes com fronteira própria — "Ports & Adapters" é só ênfase nos pontos que o domínio já trata como fronteira controlada (ferramentas de consulta da IA, importação de extrato bancário, futuro provedor de IA/Open Finance). Nenhuma decisão nova criada — nota documental cruzando para `decisions.md`, decisão #13, inserida em `arquitetura-tecnica.md`.
