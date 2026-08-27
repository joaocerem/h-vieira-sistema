# Changelog

## 2026-08-25 (2)

### Adicionado — Sprint 2: Fluxo completo de Lançamentos (rodada de evolução operacional)

- **Mudança de estratégia** (decisão do usuário, após validar a Fase 1 na prática): a divisão original em 8 fases pequenas e tecnicamente isoladas dificultava testar um processo operacional do início ao fim. A partir daqui, a divisão passa a ser por **fluxo operacional completo**, não por semelhança técnica — "Fase N" vira "Sprint N". Plano revisado completo em `pendencias.md`, Seção 9; status por sprint em `roadmap.md`.
- **Autocomplete + cadastro rápido**: novo `shared/components/form/AutocompleteField.tsx` — busca por texto sobre as opções já carregadas (sem endpoint de busca novo, filtragem 100% client-side), navegação por teclado (setas/Enter/Escape), e uma opção "+ Criar '...'" quando o texto digitado não corresponde a nada existente, que cadastra o registro e o seleciona na hora. Substitui `SelectField` para `fornecedorId`/`categoriaId` em `LancamentoForm.tsx`. Cliente permanece `SelectField` — decisão explícita do usuário, volume baixo, autocomplete não traz ganho operacional. Segundo uso de `Controller` (react-hook-form) no projeto, depois de `CurrencyInput`.
- Cadastro rápido de Categoria herda automaticamente o `tipo` (Despesa/Receita) já selecionado no Lançamento, sem perguntar de novo ao usuário — `tipo` é obrigatório no backend (`CategoriaRequest`, `@NotBlank`). Dois hooks novos em `shared/hooks/` (não em `features/fornecedor|categoria/hooks/` — `shared/` nunca importa de `features/*`, mesmo padrão de `useFornecedorOptions`/`useCategoriaOptions`): `useCriarFornecedorRapido.ts`, `useCriarCategoriaRapida.ts`.
- **Achado real, descoberto em teste manual no navegador** (nunca apareceu nos testes automatizados — jsdom não reproduz o cenário): o `DismissableLayer` do Radix `Popover` considera "de fora" qualquer clique que não esteja dentro de `Popover.Content`. Como o campo de busca vive dentro de `Popover.Anchor` (usado só para posicionamento, não é o `Trigger` que o Radix reconhece como "de dentro"), o próprio clique que dava foco ao campo já contava como uma interação "de fora", fechando o painel no mesmo instante em que abria — só reproduzível com `document.hasFocus()` verdadeiro (ambiente headless do navegador de preview não tem foco real de janela por padrão, daí a necessidade de trazer a aba para primeiro plano para reproduzir). Corrigido desligando esse mecanismo redundante do Radix (`onPointerDownOutside`/`onFocusOutside`), já que o componente tem seu próprio fechamento por `onBlur`. Detalhe em `arquitetura-tecnica-frontend.md`, Seção 5.
- Erro de cadastro rápido (ex. nome duplicado) não tem tratamento próprio — já aparece no toast global (`QueryProvider`/`MutationCache`, decisão #46), confirmado em teste manual (backend derrubado no meio do teste, toast "Não foi possível conectar ao servidor" apareceu automaticamente, sem código extra).
- 9 novos testes de `AutocompleteField.test.tsx` + 3 novos em `LancamentoForm.test.tsx` (cadastro rápido de Fornecedor, Categoria com tipo Despesa, Categoria com tipo Receita) — frontend 143/143 no total. Backend sem alteração nesta sprint.
- Documentação atualizada: `architecture/arquitetura-tecnica-frontend.md` (Seção 5), `pendencias.md` (Seção 9 — mudança de estratégia, regra definitiva de Faturamento Direto × Contas a Pagar/Receber, esclarecida nesta sessão antes de iniciar a Sprint 4), `roadmap.md`, `frontend/src/features/README.md`.
- **Próximo passo**: Sprint 3 (Fluxo Financeiro — remoção de Liquidação/Ajuste Financeiro, nova filosofia de Contas a Pagar/Receber, Conta Bancária/Cartão sem apelido) — não iniciada nesta sessão.

## 2026-08-25

### Adicionado — Rodada de evolução operacional, Fase 1 (máscara de moeda + Categoria ordenada + Lançamento descrição/documento)

- Nova rodada de evolução baseada em feedback de uso operacional real da empresa — 14 decisões de negócio que **substituem** a modelagem anterior sempre que houver conflito (remoção futura de Liquidação Financeira e Ajuste Financeiro, Conciliação via OFX, Medição de Obra, Faturamento Direto incorporado ao Lançamento, entre outras). Aprovada após auditoria e múltiplas rodadas de refinamento — plano completo em `pendencias.md`, Seção 9; ordem de implementação em `roadmap.md`. Esta entrada cobre só a **Fase 1** das 8 aprovadas.
- **Máscara de moeda universal**: novo componente compartilhado `shared/components/form/CurrencyInput.tsx` — entrada por dígitos (como caixa eletrônico), formatado em tempo real via `Intl.NumberFormat('pt-BR')`. Primeiro uso de `Controller` (react-hook-form) no projeto — campo monetário controlado não é compatível com `register()` puro. Aplicado a todo campo de valor monetário em Real ainda vivo: `LancamentoForm` (`valor`), `CompraCartaoForm` (`valor`), `FaturaFecharCicloForm` (`valorCobrado`), `ContratoFinanceiroForm` (`valorContratado` — não `taxa`, que é percentual, fora do escopo da máscara), `TransferenciaInternaForm` (`valor`) e `ImportarMovimentacoesForm` (`valor`, com `allowNegative` — sinal significativo, saída/entrada). `LiquidacaoForm`/`AjusteFinanceiroForm` deliberadamente fora do escopo — ambos removidos nas Fases 4/5 desta mesma rodada. Todo campo convertido de `z.coerce.number()` para `z.number()` direto (o componente nunca produz `NaN`), eliminando a necessidade de `z.input`/`z.output` nesses schemas.
- Achado real durante a construção do componente: como é controlado, o React restaura o valor do `<input>` para o último valor conhecido logo após cada `onChange`, mesmo sem re-render disparado pelo próprio componente — um `-` digitado sozinho (antes de qualquer dígito, com `allowNegative`) era perdido. Corrigido com um estado local (`pendingNegative`) só para lembrar o sinal enquanto não há dígito nenhum ainda; coberto por teste (`CurrencyInput.test.tsx`, 6 casos).
- **Categoria — ordenação alfabética**: `CategoriaRepository#findAllByOrderByNomeAsc` (nova), usada por `CategoriaService#listarTodas` — decisão de negócio: lista sempre em ordem alfabética por `nome`, não a ordem de cadastro.
- **Lançamento Financeiro ganha `descricao`/`documento`**: dois campos de texto livre, opcionais, sem regra de negócio associada além da própria existência — migração `V16`, entidade, `CategoriaService`/`LancamentoFinanceiroService` (`criar`/`atualizar`), DTOs (`CriarLancamentoFinanceiroRequest`/`AtualizarLancamentoFinanceiroRequest`/`LancamentoFinanceiroResponse`), `LancamentoFinanceiroMapper`, `LancamentoFinanceiroController`. `descricao` exibida também na tabela de listagem do Frontend (`LancamentoTable`); `documento` só no formulário (evita sobrecarregar a tabela).
- `criarGeradoPeloSistema` (caminho Cartão via Parcela) manteve a assinatura — sem interface para preencher `descricao`/`documento` nesse caminho ainda, passa `null`/`null` internamente. `CompraCartaoService#propagarParaLancamentosJaGerados` (propagação D5) atualizado para reenviar `descricao`/`documento` já existentes do Lançamento, sem apagá-los.
- Backend: 160/160 testes passando (159 + 1 novo, `CategoriaServiceTest`). Frontend: 131/131 testes passando (124 + 7 novos — 6 de `CurrencyInput`, 1 de `descricao`/`documento` em `LancamentoForm`); build e lint limpos.
- Documentação atualizada: `domain-model/06-categoria.md`, `domain-model/09-lancamento-financeiro.md`, `modelagem-fisica/02-lancamento-financeiro.md`, `architecture/arquitetura-tecnica-frontend.md` (Seção 5, novo padrão `CurrencyInput`/`Controller`), `pendencias.md` (Seção 9, nova — registro do plano completo de 8 fases), `roadmap.md`.
- **Próximo passo**: Fase 2 (componente de autocomplete + cadastro rápido para Fornecedor/Categoria em Lançamento) — não iniciada nesta sessão, aguardando confirmação explícita do usuário para avançar.

## 2026-08-24

### Corrigido (7) — CORS bloqueando o Frontend

- Bug real, encontrado ao rodar backend e Frontend simultaneamente pela primeira vez (todas as sessões anteriores validavam o Frontend sozinho, com o backend desligado — só `ERR_CONNECTION_REFUSED`, nunca uma resposta real do backend a ser bloqueada pelo navegador): `infrastructure/auth/SecurityConfig.java` só tinha `csrf().disable()` e `authorizeHttpRequests(...).permitAll()`, sem nenhuma `CorsConfigurationSource`. `permitAll()` resolve autorização (Spring Security deixa a requisição passar), mas CORS é um mecanismo independente, decidido pelo navegador antes mesmo de a requisição chegar ao Controller — sem CORS configurado, toda chamada cross-origin do Frontend (Vite, `http://localhost:5173`) para o backend (`http://localhost:8080`) era bloqueada com "ausência de `Access-Control-Allow-Origin`", mesmo com o endpoint respondendo normalmente para uma chamada same-origin (`curl`, Postman, ou o próprio Swagger).
- Corrigido: nova classe `CorsProperties` (`hvieira.cors.allowed-origins`, `application.yaml`, mesmo padrão de `ConciliacaoProperties`/T6 — parâmetro operacional configurável, nunca uma constante fixa no código) e `SecurityConfig` ganhou `.cors(cors -> cors.configurationSource(...))` com um bean `CorsConfigurationSource` (`allowedOrigins` de `CorsProperties`, `allowCredentials(true)` — obrigatório para o cookie httpOnly de T11/decisão #48, o que por regra do protocolo CORS exige origens explícitas, nunca `*`).
- Validado por teste de integração novo (`SecurityConfigCorsTest`, `MockMvc`, sem depender de subir um Tomcat real): preflight `OPTIONS` e requisição `GET` reais a partir de `http://localhost:5173` recebem os cabeçalhos CORS corretos e a query executa normalmente; requisição de uma origem não autorizada é recusada com 403. Backend: 159/159 testes passando (156 + 3 novos).
- Achado colateral de infraestrutura de teste: no Spring Boot 4, `@AutoConfigureMockMvc` foi extraída para um módulo próprio (`spring-boot-starter-webmvc-test`, pacote `org.springframework.boot.webmvc.test.autoconfigure`) — `spring-boot-starter-test` sozinho não traz mais MockMvc (mesma classe de gotcha já registrada no `pom.xml` para o Flyway). Nova dependência de teste adicionada, com o comentário explicando o porquê.
- Nenhuma alteração no Frontend — `shared/api/client.ts` já usava `withCredentials: true` desde o bootstrap (decisão #48), correto desde o início; o bug era exclusivamente do backend.

## 2026-08-21 (3)

### Adicionado — Ajuste Financeiro

- `features/ajuste-financeiro/` (`/ajustes-financeiros`): só `criar`, espelhando o único caso de uso de escrita real de `AjusteFinanceiroController` — sem `atualizar`/`excluir` (Ajuste Financeiro é imutável desde a criação, D13, `decisions.md` decisão #34). O Lançamento de ajuste (`lancamentoAjusteId`) precisa já existir — criado separadamente via `features/lancamento-financeiro/` (origem "Manual") — este formulário só formaliza o vínculo entre dois Lançamentos já existentes, nunca cria um novo.
- Formulário reusa `useLancamentoOptions` (já existente) para as duas seleções (Lançamento original/de ajuste) — Lançamentos Cancelados excluídos das opções (UX; o backend também recusa); origem e destino mutuamente exclusivas, checado manualmente no `onSubmit` (mesmo padrão de `TransferenciaInternaForm.tsx`).
- Novo hook de referência compartilhado `useUsuarioOptions.ts` (`usuarioId` obrigatório na criação — sem sessão autenticada ainda, S1, o usuário escolhe explicitamente quem está registrando); `sharedQueryKeys` ganha `usuarios`; `features/usuario/hooks/queryKeys.ts` refatorado para reusar a chave compartilhada (mesmo padrão de Categoria/Fornecedor/Cliente/Liquidação/Cartão de Crédito/Compra Cartão/Parcela/Contrato Financeiro).
- Filtro por Lançamento original sincronizado com a URL (`?lancamentoOriginalId=`, único filtro real de `GET /api/ajustes-financeiros`) — `features/lancamento-financeiro/` ganhou o link "Ajustes" na tabela, apontando para esse filtro (reuso real da tela já existente, sem duplicar).
- Item de menu "Ajustes" adicionado ao grupo Financeiro do `AppShell`.
- 8 novos testes (124/124 no total).

## 2026-08-21 (2)

### Adicionado — Balanço

- `features/balanco/` (`/balanco`): só leitura/agregação, espelhando o único endpoint real de `BalancoController` (`GET /api/balanco?empresaId=`) — sem `criar`/`atualizar`/`excluir`, sem entidade própria. "Realizado" (fração de Lançamento já coberta por Aplicação de Liquidação) e "Projetado" (Lançamentos Aberto + Parcial + Pago, exceto Cancelado), seis valores (Receitas/Despesas/Resultado × Realizado/Projetado).
- Primeira tela genuinamente "dashboard" do Frontend — `shared/components/ui/card` (shadcn/ui, cadastrado desde o bootstrap da Fase 5, nunca consumido por nenhuma feature até aqui) usado pela primeira vez. `ResultadoCard.tsx` extraído por reuso real (seis instâncias na mesma página).
- Filtro opcional por Empresa (`useEmpresaOptions`, já existente — reuso direto, nenhum hook novo).
- Item de menu "Balanço" adicionado ao grupo Financeiro do `AppShell`.
- 5 novos testes (116/116 no total).

## 2026-08-21

### Adicionado — Financiamentos e Consórcios

- `features/financiamento-consorcio/` (`/contratos-financeiros`): CRUD completo seguindo `ContratoFinanceiroController` — `tipo`, `empresaId`, `contaBancariaId`, `valorContratado`, `numeroParcelas` e `dataVencimentoPrimeiraParcela` exigidos só no modo criar (imutáveis depois, `AtualizarContratoFinanceiroRequest` não os tem); `taxa` (Financiamento) × `grupoCota`/`contemplado`/`veiculoId` (Consórcio) mutuamente exclusivos por `tipo`, checados manualmente no `onSubmit` (não `.superRefine()`) — mesmo achado de Zod 4 já documentado. Ao criar, o backend gera automaticamente as Parcelas do parcelamento (decisão #40).
- Ação dedicada `contemplar` (`POST /api/contratos-financeiros/{id}/contemplar`, transição Não→Sim, exclusiva de `tipo` = Consórcio) — botão na página de edição, mesmo espírito de `ObraStatusActions.tsx` (transição via ação própria, não pelo formulário de edição comum). Formulário remontado (`key`) quando `contemplado` muda, para refletir o campo Veículo sem lógica extra de `form.reset()`.
- `features/parcela/` estendida para o segundo filtro real do backend (`GET /api/parcelas?contratoFinanceiroId=`, mutuamente exclusivo com `?compraCartaoId=`) — `ParcelaListPage` ganha um segundo seletor; `ParcelaTable` resolve a origem "Contrato Financeiro" (antes só "Compra Cartão" era resolvida); coluna "Fatura" agora mostra "—" para Parcelas de Contrato (nunca se relacionam com Fatura, correção de exibição). Reuso direto de uma feature já existente, sem duplicar a listagem.
- Novo hook de referência compartilhado `useContratoFinanceiroOptions.ts`; `sharedQueryKeys` ganha `contratosFinanceiros`.
- Item de menu "Financiamentos e Consórcios" adicionado ao grupo "Cartão de Crédito" do `AppShell`.
- 15 novos testes (111/111 no total).

## 2026-08-20 (2)

### Adicionado — Cartão de Crédito (fluxo financeiro)

- `features/compra-cartao/` (`/compras-cartao`): CRUD completo seguindo `CompraCartaoController` — `cartaoId`, `valor` e `numeroParcelas` exigidos só no modo criar (imutáveis depois, `AtualizarCompraCartaoRequest` não os tem, mesmo padrão de `CartaoCreditoForm`); `classificacao` com os 5 valores completos (sem restrição, diferente da reclassificação de Movimentação Bancária); ao criar, o backend gera automaticamente as Parcelas do parcelamento (decisão #39). Link "Ver parcelas" por linha, para `/parcelas?compraCartaoId=<id>`.
- `features/fatura/` (`/faturas`): sem `criar`/`atualizar` genéricos — só `fecharCiclo` (`/faturas/fechar-ciclo`, campo `ciclo` via `<input type="month">`, formato `AAAA-MM` nativo) e `pagar` (`/faturas/:id/pagar`, contaBancariaId + dataEfetiva). `FaturaDetailPage` (`/faturas/:id`) cruza a lista completa de Parcelas (`useParcelaOptions`) por `faturaId` no cliente — o backend não expõe esse filtro em `GET /api/parcelas` (só `compraCartaoId`/`contratoFinanceiroId`).
- `features/parcela/` (`/parcelas`): sem `criar` — Parcela é sempre gerada pelo sistema (`ParcelaController` não tem `POST` de criação). Só leitura + ação `gerar-lancamento` (gatilho manual do "vencimento" — sem agendador automático em nenhum ponto do projeto). Filtro por Compra Cartão sincronizado com a URL (`?compraCartaoId=`, `useSearchParams`).
- Novos hooks de referência compartilhados: `useCartaoCreditoOptions.ts`, `useCompraCartaoOptions.ts`, `useParcelaOptions.ts`. `sharedQueryKeys` ganha `cartoesCredito`, `comprasCartao`, `parcelas`; `features/cartao-credito/hooks/queryKeys.ts` refatorado para reusar a chave compartilhada (mesmo padrão de Categoria/Fornecedor/Cliente/Liquidação).
- Item de menu "Cartão de Crédito" (Compras Cartão, Faturas, Parcelas) adicionado ao `AppShell`.
- 37 novos testes (100/100 no total).

### Corrigido (6)

- Achado de integração real, não um bug: `FaturaService#pagar` (backend) cria uma Liquidação Financeira ao pagar uma Fatura — que, em cascata, gera automaticamente uma Movimentação Bancária + Vínculo `Confirmado` (mesma cadeia já corrigida em `useCriarLiquidacao` na sessão anterior, mas disparada aqui por um ponto de entrada diferente). `usePagarFatura` invalida as quatro listas afetadas (Liquidação, Movimentação, Vínculo, e Lançamentos — cujo `statusFinanceiro` é recalculado).

## 2026-08-20

### Adicionado — Conciliação Bancária

- `features/conciliacao-bancaria/`: implementa exatamente os endpoints reais do backend (`interfaces/http/conciliacaobancaria/`) para as três entidades do módulo:
  - **Movimentação Bancária**: sem `criar`/`atualizar` livre — só `importar` (lote de extrato, array dinâmico via `useFieldArray`, mesmo padrão de `aplicacoes` em `LiquidacaoForm`) e `reclassificar` (único campo mutável, select inline na própria lista). `'Transferência Interna'` nunca é oferecida como destino de reclassificação — só atribuída via criação de Transferência Interna (`MovimentacaoBancariaService#reclassificar` recusa essa atribuição por esse caminho).
  - **Transferência Interna**: criação manual (seleção de Movimentação de origem/destino, valor, data — validação de "diferentes" checada no cliente e no backend) + listagem, sem edição ("Regras de alteração: não definidas" no domínio).
  - **Vínculo Conciliação**: **sem tela própria** — relação 1:1 obrigatória com Movimentação, gerada automaticamente no backend; exibida e operada na mesma tabela de Movimentação (`VinculoConciliacaoActions.tsx`, botões calculados a partir das mesmas guardas de `VinculoConciliacaoService` — confirmar só quando Sugerido, marcar divergente só com Liquidação candidata, marcar sem correspondência só quando Não Vinculado, vincular manualmente sempre exceto quando já Confirmado — mesmo espírito de `ObraStatusActions`) e uma ação de sugestão automática (`rodarSugestaoAutomatica`, T6 já resolvida no backend como parâmetro configurável).
- `shared/hooks/useLiquidacaoOptions.ts` — novo hook de referência cross-feature (escolher a qual Liquidação uma Movimentação corresponde ao vincular manualmente), mesmo padrão de `useLancamentoOptions`; `sharedQueryKeys` ganha `liquidacoesFinanceiras`, `movimentacoesBancarias`, `vinculosConciliacao`; `features/liquidacao-financeira/hooks/queryKeys.ts` refatorado para reusar a chave compartilhada (mesmo padrão de Categoria/Fornecedor/Cliente).
- Rota `/conciliacao-bancaria` (+ `/importar`, `/transferencias`, `/transferencias/nova`); item "Conciliação Bancária" adicionado ao menu Financeiro do `AppShell`.
- 20 novos testes (83/83 no total).

### Corrigido (5)

- Achado de integração real, não um bug: `LiquidacaoFinanceiraService#criar` (backend) gera automaticamente uma Movimentação Bancária (já com Vínculo Conciliação `Confirmado`, mesma transação) ao registrar uma Liquidação — `useCriarLiquidacao` (Frontend) não invalidava as listas de Movimentação/Vínculo, então a nova Movimentação só apareceria na tela de Conciliação Bancária após um refresh manual. Corrigido invalidando `sharedQueryKeys.movimentacoesBancarias`/`vinculosConciliacao` no `onSuccess` de `useCriarLiquidacao`, mesmo padrão já usado para `lancamentosFinanceiros` (que essa mesma mutação já invalidava, por `statusFinanceiro` calculado mudar).

## 2026-08-19 (2)

### Adicionado

- `pendencias.md` ganha T7-T14 (Seção 5 — Tecnologia): oito decisões técnicas do Frontend levantadas como consequência direta de T2 (roteamento, testes, cliente HTTP/contrato de erro, gerenciamento de estado, autenticação no cliente, UI/estilo, estrutura de pastas, hospedagem) — nenhuma decidida ainda, registradas para resolução uma a uma antes da arquitetura técnica completa do Frontend

### Decidido

- **T2 — Framework de frontend** congelado: **React + Vite + TypeScript**, aplicação frontend desacoplada, consumindo exclusivamente a API REST do backend — Next.js e qualquer framework full-stack equivalente descartados (sem necessidade de SSR/SEO; tensionaria com a fronteira backend/frontend já estabelecida) — decisão registrada em `decisions.md`, decisão #42. Documentos atualizados: `arquitetura-tecnica.md` (Seção 5.2 e Seção 15), `pendencias.md` (T2 movida para resolvida), `decisions.md` (decisão #42), `roadmap.md` (Fase 5)
- **T14 — Hospedagem do Frontend** congelada: mesma plataforma PaaS gerenciada já definida para o backend (T4, decisão #38) — sem infraestrutura separada; plataforma dedicada a estáticos descartada por ausência de necessidade real — decisão registrada em `decisions.md`, decisão #43. Documentos atualizados: `arquitetura-tecnica.md` (Seção 5.6), `pendencias.md` (T14 movida para resolvida), `decisions.md` (decisão #43), `roadmap.md` (Fase 5)
- **T7 — Roteamento e navegação do Frontend** congelada: React Router — TanStack Router descartado por ausência de necessidade demonstrada de tipagem de rota estrita — decisão registrada em `decisions.md`, decisão #44. Documentos atualizados: `pendencias.md` (T7 movida para resolvida), `decisions.md` (decisão #44), `roadmap.md` (Fase 5)
- **T8 — Testes do Frontend** congelada: Vitest + React Testing Library, sem Jest — E2E (Cypress/Playwright) deliberadamente fora do escopo, avaliação futura — decisão registrada em `decisions.md`, decisão #45. Documentos atualizados: `pendencias.md` (T8 movida para resolvida), `decisions.md` (decisão #45), `roadmap.md` (Fase 5)
- **T9 — Cliente HTTP e contrato de erro do Frontend** congelada: axios, camada compartilhada única `src/api/client` (configuração, interceptores, tradução do contrato `ApiError`, ponto futuro de injeção de token) — telas nunca tratam HTTP diretamente — decisão registrada em `decisions.md`, decisão #46. Documentos atualizados: `pendencias.md` (T9 movida para resolvida), `decisions.md` (decisão #46), `roadmap.md` (Fase 5)
- **T10 — Gerenciamento de estado e cache de dados do servidor** congelada: TanStack Query (estado de servidor) + Context API (estado de UI local) — sem Redux; Zustand registrado como evolução possível, não decisão antecipada — decisão registrada em `decisions.md`, decisão #47. Documentos atualizados: `pendencias.md` (T10 movida para resolvida), `decisions.md` (decisão #47), `roadmap.md` (Fase 5)
- **T11 — Autenticação no cliente (Frontend)** congelada: cookie httpOnly — Frontend nunca acessa o token diretamente; `localStorage`/`sessionStorage`/token em memória descartados; impõe requisito à implementação futura de S1 (backend deve emitir `Set-Cookie` httpOnly/Secure/SameSite), sem reabrir T3 (decisão #14) — decisão registrada em `decisions.md`, decisão #48. Documentos atualizados: `pendencias.md` (T11 movida para resolvida; S1 ganha requisito adicional), `freeze-fase-4.md` (item S1), `decisions.md` (decisão #48), `roadmap.md` (Fase 5)
- **T12 — UI e estilo (biblioteca de componentes/design system)** congelada: Tailwind CSS + shadcn/ui — MUI, Ant Design e Chakra UI descartados; biblioteca de DataGrid deliberadamente fora de escopo, adiada até necessidade real concreta — decisão registrada em `decisions.md`, decisão #49. Documentos atualizados: `pendencias.md` (T12 movida para resolvida), `decisions.md` (decisão #49), `roadmap.md` (Fase 5)
- **T13 — Estrutura de pastas e padrão arquitetural do Frontend** congelada: organização por feature/módulo de domínio (`app/`, `features/`, `shared/`, `routes/`), espelhando os módulos do backend — sem Clean Architecture completa nem organização por camada técnica global — decisão registrada em `decisions.md`, decisão #50. Documentos atualizados: `pendencias.md` (T13 movida para resolvida; marco registrado — todas as decisões constituintes do Frontend encerradas), `decisions.md` (decisão #50), `roadmap.md` (Fase 5)

### Adicionado (2)

- `docs/architecture/arquitetura-tecnica-frontend.md` — arquitetura técnica completa do Frontend, sintetizando as decisões #42 e #44-#50: estrutura de pastas, roteamento, comunicação com API, gerenciamento de estado, autenticação/autorização no cliente, UI/tema, testes, mapeamento de módulos (features → módulos do backend), ordem recomendada de implementação e dependências de S1-S5. Documentos atualizados: `arquitetura-tecnica.md` (Seção 5.2, referência cruzada), `README.md`, `handoff.md` (nova Seção 15)

### Adicionado (7) — Obra e Frota

- `features/obra/`: CRUD completo + ação dedicada de transição de status (`POST .../status`, D9 — A executar → Em andamento ⇄ Pausada → Concluída), botões calculados a partir do mesmo mapa de transições do backend (`ObraStatusActions.tsx`).
- `features/frota/`: CRUD completo (rota `/veiculos`), `tipo` com lista fechada de 8 valores (D10, `z.enum`, não texto livre), alocação opcional a uma Obra atual (`obraAtualId`).
- `shared/hooks/useObraOptions.ts`, `useVeiculoOptions.ts` — referência cross-feature, mesmo padrão já estabelecido.
- `features/lancamento-financeiro/` atualizada: seleção opcional de Obra e de Veículo no formulário — Veículo filtrado pela Empresa selecionada (client-side, espelhando a validação real do backend em `LancamentoFinanceiroService`).
- 16 novos testes (63/63 no total).

### Adicionado (6) — cadeia financeira central

- `features/lancamento-financeiro/`: CRUD completo (listar, criar, editar) + ação de cancelamento (`POST .../cancelar`), tipo Despesa/Receita com Fornecedor/Cliente condicionalmente exigidos (checado manualmente no `onSubmit`, não via `.superRefine()` — ver achado abaixo), badges de situação administrativa e status financeiro (calculado pelo backend, nunca pelo Frontend).
- `features/liquidacao-financeira/`: só criação e detalhe — sem edição, Liquidação é imutável desde a criação (D12, `decisions.md` decisão #33); formulário com array dinâmico (`useFieldArray`) de Lançamentos cobertos e valor aplicado a cada um. **Sem `features/aplicacao-liquidacao/`** — confirmado que essa entidade não tem `Controller` HTTP próprio no backend (`AplicacaoDeLiquidacao` só existe embutida na criação de Liquidação).
- `shared/hooks/useCategoriaOptions.ts`, `useFornecedorOptions.ts`, `useClienteOptions.ts`, `useLancamentoOptions.ts` — referência cross-feature, mesmo padrão de `useEmpresaOptions`/`useContaBancariaOptions`; `features/categoria|fornecedor|cliente/hooks/queryKeys.ts` refatorados para reusar `shared/queryKeys.ts`.
- `shared/lib/formatters.ts` (`formatDate`, `formatCurrency`) — extraído por reuso real e simultâneo entre Lançamento e Liquidação.
- `shared/components/ui/badge.tsx` (shadcn/ui) — status financeiro/situação administrativa do Lançamento.
- 11 novos testes (47/47 no total).

### Corrigido (4)

- Achado (Zod 4 + `.superRefine()`): confirmado, num segundo caso independente do achado anterior (Cartão de Crédito), que `.superRefine()` não roda quando outro campo do mesmo objeto tem erro `invalid_type` — em `LancamentoForm`/`LiquidacaoForm`, campos monetários passaram a usar `z.coerce.number()` (nunca `valueAsNumber: true`) desde o início, e exigências condicionais (Fornecedor×Cliente) são checadas manualmente no `onSubmit`, nunca via `.superRefine()`. Documentado em `arquitetura-tecnica-frontend.md`, Seção 5, como padrão a seguir no restante do Frontend.

### Adicionado (5) — Cadastros Base completos

- `features/categoria/`, `fornecedor/`, `cliente/`, `conta-bancaria/`, `cartao-credito/` (só o cadastro) e `usuario/` (nível básico) implementados — CRUD, validação (react-hook-form + zod), tratamento de erro via `shared/api`, 36 testes (Vitest + RTL) passando. Rotas e `AppShell` atualizados.
- `shared/components/crud/NomeUnicoForm.tsx`/`NomeUnicoTable.tsx` — extraídos após confirmar reuso real idêntico entre Empresa, Fornecedor e Cliente; `features/empresa/` refatorada para consumi-los, eliminando a triplicação.
- `shared/hooks/useEmpresaOptions.ts`, `useContaBancariaOptions.ts` e `shared/queryKeys.ts` — leitura de referência cross-feature (Conta Bancária seleciona Empresa; Cartão de Crédito seleciona Conta Bancária), com cache do TanStack Query compartilhado com a feature "dona" da lista, sem requisição duplicada.

### Corrigido (3)

- Bug real em `ContaBancariaForm`/`CartaoCreditoForm`/`UsuarioForm`: `.superRefine()` do Zod 4 não roda de forma confiável quando o objeto já tem outro campo com erro de tipo (`invalid_type`) — a exigência condicional de `empresaId`/`contaBancariaId`/`identificadorDeAcesso` (obrigatórios só no modo "criar") ficava silenciosamente ausente quando outro campo (ex. `diaFechamento`/`diaVencimento` vazios, convertidos para `NaN`) também estava inválido. Corrigido trocando para exigência condicional no shape do campo (ternário), sem `.superRefine()`, com o tipo do formulário sempre derivado via `z.infer` (nunca escrito à mão). Validado com teste de regressão e confirmação manual no browser.

### Adicionado (3) — implementação

- `frontend/`: projeto React + Vite + TypeScript criado, com Tailwind CSS, shadcn/ui, React Router, TanStack Query e cliente axios (`shared/api/client`, tratando o contrato `ApiError` do backend) configurados; estrutura de pastas de T13 (`app/`, `features/`, `shared/`, `routes/`) criada; infraestrutura compartilhada implementada — providers (`QueryProvider`, `ThemeProvider`), layout base (`AppShell`), tema, loading global (`GlobalLoadingIndicator`), toasts de erro (sonner). Vitest + RTL configurados, 1 teste de fumaça passando. Autenticação e qualquer mecanismo relacionado a S1-S5 deliberadamente não implementados (decisão #41). Documentos atualizados: `roadmap.md` (Fase 5), `handoff.md` (nova Seção 16), `frontend/README.md` (novo)

### Adicionado (4) — módulo Empresa

- `features/empresa/`: primeira feature funcional da Fase 5 — CRUD completo (listar, criar, editar), `react-hook-form` + `zod` para validação, `EmpresaTable` (tabela HTML, decisão #49), rotas `/empresas`, `/empresas/nova`, `/empresas/:id/editar`. 13 testes (Vitest + RTL). `shared/api/errors.ts` ganhou `parseFieldErrors` (extrai `{campo, mensagem}` do formato verboso `FieldError.toString()` do backend). Documentos atualizados: `arquitetura-tecnica-frontend.md` (Seção 5 e Seção 11 — ordem de implementação revisada), `roadmap.md` (Fase 5), `handoff.md` (nova Seção 17)

### Corrigido (2)

- `frontend/.env` local criado (ausente até então, só `.env.example` existia) — sem ele, `axios` chamava a própria origem do Vite dev server em vez do backend, recebendo o `index.html` (fallback de SPA, status 200) como resposta; `EmpresaListPage` endurecida para só renderizar a tabela quando a resposta é de fato um array (`Array.isArray`)

### Decidido (2)

- Ordem de implementação da Fase 5 revisada (`arquitetura-tecnica-frontend.md`, Seção 11) — login/`AuthProvider` movidos para o momento em que S1-S5 começarem a ser implementados no backend, confirmado por auditoria que não há dependência técnica real que os exija antes. Mudança de ordem, nenhuma decisão de `decisions.md` reaberta ou alterada

## 2026-08-19

### Adicionado

- Fase 4 (Backend) implementada: 24 módulos de domínio em Clean Architecture (`domain`, `application`, `interfaces/http`, `infrastructure`), incorporando as decisões #12 a #40 já registradas em `decisions.md`
- Módulo de consulta compartilhado (`application/consultasfinanceiras`) implementado, conforme desenho arquitetural da decisão #35 (A6)
- `docs/freeze-fase-4.md` — marco formal de encerramento da Fase 4 e autorização de início da Fase 5

### Decidido

- **Escopo do encerramento da Fase 4** congelado: implementação de T3 (autenticação), A2 (RBAC + escopo por Empresa), A4 (checagem de permissão), A5 (auditoria automática) e A8 (reautenticação de IA) adiada deliberadamente para a Fase 5 — as cinco decisões técnicas permanecem congeladas, sem reabertura; só o momento de implementação muda — decisão registrada em `decisions.md`, decisão #41. Documentos atualizados: `decisions.md` (decisão #41), `pendencias.md` (nova Seção 7 — Segurança, itens S1-S5), `freeze-fase-4.md` (novo), `roadmap.md` (Fase 4 e Fase 5), `handoff.md` (Seção 1, Seção 2 e nova Seção 14)

### Corrigido

- Estado do projeto em `handoff.md` (Seção 1 e Seção 2) atualizado — ainda descrevia "Backend e Frontend: código ainda não iniciado", desatualizado desde a implementação da Fase 4
- `roadmap.md`, Fase 4, marcada como concluída — checkbox permanecia aberto apesar da implementação já concluída

## 2026-08-13

### Adicionado

- Estrutura inicial do projeto
- Documentação da arquitetura conceitual
- Documentação da arquitetura técnica
- Criação das pastas do projeto
- Definição das regras do projeto
- Princípios de modelagem do domínio (7 princípios normativos)
- Incorporação das 11 decisões consolidadas ao modelo de domínio (24 entidades)
- Consolidação da arquitetura técnica num único documento corrente (fusão com a arbitragem técnica)
- Lista mestra de pendências do projeto (`pendencias.md`)
- Reorganização dos documentos de processo superados em pastas `historico/` (`architecture/` e `domain-model/`)

### Corrigido

- Relação `Compra Cartão → Fatura` em `18-compra-cartao.md`, corrigida para refletir o vínculo indireto via Parcela

## 2026-08-14

### Adicionado

- Modelagem física do banco de dados concluída: modelo lógico (`modelo-logico.md`), convenções físicas globais (`arquitetura-fisica-banco.md`) e modelagem por entidade (`docs/modelagem-fisica/01-cadastros-basicos.md` a `09-ia-auditoria.md`)
- Scripts SQL de criação de tabelas (`database/02_tables/`)
- Constraints do schema físico (`database/03_constraints.sql`)
- Índices do schema físico (`database/04_indexes.sql`)
- Plano de implementação SQL (`plano-implementacao-sql.md`), definindo a ordem de criação das tabelas e registrando formalmente os itens adiados/descartados

### Adiado / Descartado

- `05_views.sql` adiado por completo — bloqueios de ambiguidade de domínio em 5 das 6 views candidatas (ver `plano-implementacao-sql.md`)
- `06_functions.sql` descartado — nenhuma function especificada em nenhum documento do projeto; a lógica correspondente permanece na camada de aplicação, por decisão arquitetural já congelada
- `07_triggers.sql` adiado por completo — bloqueios de mecanismo de implementação não escolhido e de regras de negócio ainda pendentes (16 triggers candidatas, ver `plano-implementacao-sql.md`)

### Corrigido

- Pendência **A5** (mecanismo técnico de auditoria automática) acrescentada à tabela "Pendências que permanecem abertas" de `plano-implementacao-sql.md`, deixando explícito que bloqueia exclusivamente `07_triggers.sql`
- Estado do projeto em `handoff.md` (Seção 1, Seção 2, Seção 4, Seção 6, Seção 12) atualizado para refletir a conclusão da Fase 3, que ainda estava descrita como não iniciada

### Decidido

- **T1 — Linguagem/framework de backend** congelada: Java 21 LTS + Spring Boot, com Maven como gerenciador de dependências e Hibernate/JPA como ORM principal — decisão registrada em `decisions.md`, decisão #12. Documentos atualizados: `arquitetura-tecnica.md` (Seção 5.1 e Seção 15), `pendencias.md` (T1 movida para resolvida; B2 atualizada), `decisions.md` (nova Seção E, decisão #12), `handoff.md` (Seção 1 e Seção 2), `roadmap.md` (Fase 4)
- **A1 — Estilo de arquitetura de software** congelada: Clean Architecture, com o vocabulário de Ports & Adapters (Hexagonal) tratado como a mesma alternativa arquitetural (diferença só de vocabulário/ênfase) — decisão registrada em `decisions.md`, decisão #13; a estrutura de pastas de `arquitetura-tecnica.md`, Seção 6, passa de recomendação a padrão oficial do backend. Documentos atualizados: `arquitetura-tecnica.md` (Seção 4 e Seção 15), `pendencias.md` (A1 movida para resolvida), `decisions.md` (decisão #13), `handoff.md` (Seção 1 e Seção 2), `roadmap.md` (Fase 4)
- **T3 — Estratégia de autenticação** congelada: autenticação própria, com Spring Security e JWT como mecanismo, hash de senha com Argon2 (preferencial; bcrypt só como alternativa documentada), sem provedor externo — decisão registrada em `decisions.md`, decisão #14. Documentos atualizados: `arquitetura-tecnica.md` (Seção 5.5 e Seção 15), `pendencias.md` (T3 movida para resolvida), `decisions.md` (decisão #14), `handoff.md` (Seção 1 e Seção 2), `roadmap.md` (Fase 4)
- **A4 — Mecanismo técnico dos dois pontos de checagem de permissão** congelada: composição de Spring Security Method Security (ponto por ação, no bean de aplicação) e Hibernate/JPA Filters via `@FilterDef`/`@Filter` (ponto por escopo de Empresa) — decisão registrada em `decisions.md`, decisão #15. Documentos atualizados: `arquitetura-tecnica.md` (Seção 11), `pendencias.md` (A4 movida para resolvida), `decisions.md` (decisão #15), `handoff.md` (Seção 1 e Seção 2), `roadmap.md` (Fase 4)
- **A2 — Modelo de permissões de usuário** congelada: RBAC + escopo por Empresa — decisão registrada em `decisions.md`, decisão #16. Documentos atualizados: `arquitetura-tecnica.md` (Seção 11 e Seção 15), `pendencias.md` (A2 movida para resolvida), `decisions.md` (decisão #16), `handoff.md` (Seção 1 e Seção 2), `roadmap.md` (Fase 4)
- **A3 — Cruzamento entre papel de usuário e níveis de confirmação da IA** congelada: Papel → nível máximo — decisão registrada em `decisions.md`, decisão #17. Documentos atualizados: `arquitetura-tecnica.md` (Seção 11 e Seção 15), `pendencias.md` (A3 movida para resolvida), `decisions.md` (decisão #17), `handoff.md` (Seção 1 e Seção 2), `roadmap.md` (Fase 4)
- **A5 — Mecanismo técnico de auditoria automática** congelada: aspecto customizado (Spring AOP, `@Around`), interceptando cada caso de uso de escrita, capturando o estado do registro antes e depois da operação e gravando em `LOG_AUDITORIA` na mesma transação da escrita de negócio, com o contexto de negócio completo exigido por `LOG_AUDITORIA` como parâmetro obrigatório de entrada — decisão registrada em `decisions.md`, decisão #18. Documentos atualizados: `arquitetura-tecnica.md` (Seção 10 e Seção 15), `pendencias.md` (A5 movida para resolvida), `decisions.md` (decisão #18), `handoff.md` (Seção 1 e Seção 2), `roadmap.md` (Fase 4)
- **Mecanismo do módulo de consulta compartilhado (`application/consultas-financeiras`)** congelado: serviço de aplicação (Application Service/Facade), com componentes Spring (`@Service`) sobre repositórios Spring Data JPA (Hibernate/JPA) — **decisão técnica independente, registrada sem código de pendência associado** (`decisions.md`, Seção D) — decisão registrada em `decisions.md`, decisão #19. Não resolve nenhuma pendência: o catálogo fechado de consultas/funções que o módulo expõe permanece pendência aberta, sem alteração — `pendencias.md`, item A6. Documentos atualizados: `arquitetura-tecnica.md` (Seção 6), `decisions.md` (decisão #19), `handoff.md` (Seção 1 e Seção 2), `roadmap.md` (Fase 4). `pendencias.md` **não foi alterado**.
- **B4 — Implementação técnica do vínculo genérico de auditoria** congelada: referência polimórfica (`entidade_tipo`/`entidade_id`, e os pares equivalentes em `LOG_AUDITORIA.referencia_tipo`/`referencia_id` e `SUGESTÃO_IA.entidade_alvo_tipo`/`entidade_alvo_id`), sem FK nativa do banco — integridade referencial mitigada, não eliminada, pela validação na camada de aplicação que grava os registros de auditoria; mapeada em Hibernate/JPA como campos simples, sem `@Any`/`@ManyToAny` — decisão registrada em `decisions.md`, decisão #20. A estratégia definitiva de indexação das colunas de referência genérica permanece subordinada a B3, ainda aberta. Documentos atualizados: `decisions.md` (decisão #20), `pendencias.md` (B4 movida para resolvida), `arquitetura-tecnica.md` (Seção 10 e Seção 15), `arquitetura-fisica-banco.md` (Seções 6, 8, 9, 10), `modelo-logico.md`, `docs/modelagem-fisica/09-ia-auditoria.md`, `plano-implementacao-sql.md`, `handoff.md` (Seção 1 e Seção 2), `roadmap.md` (Fase 4).
- **D7 — Vínculo direto `LANÇAMENTO_FINANCEIRO` ↔ `EMPRESA`** congelada: parte da definição de negócio, decidida durante esta resolução, de que todo `LANÇAMENTO_FINANCEIRO` pertence obrigatoriamente a uma `EMPRESA` desde sua criação. `empresa_id` (FK, `NOT NULL`) acrescentado a `LANÇAMENTO_FINANCEIRO`, com preenchimento/validação (incluindo consistência com `VEÍCULO.empresa_id`) na camada de aplicação, não trigger; `AÇÃO_PROPOSTA_IA` ganha `empresa_id` (FK, nullable) e o status "Aguardando Empresa", resolvendo a dependência circular com a permissão por escopo de Empresa identificada no Achado 5 da auditoria sistêmica — decisão registrada em `decisions.md`, decisão #21. Documentos atualizados: `decisions.md` (decisão #21), `pendencias.md` (D7 movida para resolvida), `domain-model/09-lancamento-financeiro.md`, `domain-model/23-acao-proposta-ia.md`, `modelo-logico.md`, `docs/modelagem-fisica/02-lancamento-financeiro.md`, `docs/modelagem-fisica/09-ia-auditoria.md`, `arquitetura-tecnica.md` (Seção 11), `handoff.md` (Seção 1 e Seção 2), `roadmap.md` (Fase 4). Schema físico já implementado também atualizado — primeira decisão a alterar SQL já construído: `database/02_tables/02_lancamentos_financeiros.sql` (coluna `empresa_id UUID NOT NULL`), `database/02_tables/09_ia_auditoria.sql` (coluna `empresa_id UUID` em `acoes_propostas_ia`, mais `CHECK` condicional com `status`), `database/03_constraints.sql` (FKs `fk_lancamentos_financeiros_empresa` e `fk_acoes_propostas_ia_empresa`), `database/04_indexes.sql` (dois novos índices de FK).