# Manual dos agentes — H. Vieira ERP

Estas instruções orientam Codex, Claude Code e qualquer agente, inclusive sessões sem contexto anterior. “Raiz” significa o diretório que contém `.git`, `AGENTS.md`, `backend/` e `frontend/`.

## 1. Papel e princípios

Este é um sistema financeiro e operacional real da H. Vieira, com implementação significativa. Você está evoluindo um projeto existente: trabalhe incrementalmente e preserve decisões operacionais aprovadas.

- **Não adapte a empresa à arquitetura existente. A implementação deve refletir o fluxo operacional aprovado.**
- **Não refatore a arquitetura existente sem necessidade aprovada.** Preserve os padrões técnicos reais quando não contradisserem a regra aprovada.
- Investigue antes de editar; prefira simplicidade e a menor mudança suficiente.
- Verifique afirmações sobre o código. Não esconda dúvidas nem concorde automaticamente com premissas tecnicamente erradas; explique riscos reais.
- Não crie complexidade preventiva ou algo que “talvez seja útil depois”. Analise warnings antes de tratá-los como erros; ausência de teste não prova um bug.

## 2. Fontes de verdade e precedência

Comece pelo `README.md` para localizar os pontos de entrada. Consulte as fontes conforme o assunto:

| Assunto | Fonte |
|---|---|
| Regras de negócio e processos | `docs/fluxos-operacionais-definitivos.md` — **Passo 1**, fonte oficial atual |
| Interface funcional e operação pelo usuário | `docs/interface-funcional-financeiro.md` — **Passo 2** |
| Estado recente e contexto da implementação | `docs/handoff.md` (notas mais recentes); `docs/changelog.md` quando necessário |
| Decisões técnicas e históricas | `docs/decisions.md`, considerando substituições posteriores |
| Arquitetura | Documentos atuais em `docs/architecture/` e implementação real existente |
| Schema e evolução do banco | `backend/src/main/resources/db/migration/` — migrations Flyway |
| Pendências e planejamento | `docs/pendencias.md` e `docs/roadmap.md`, sujeitos à precedência acima |

- **Regra operacional/de negócio:** Passo 1 é a fonte oficial vigente e prevalece sobre qualquer código existente, documentação técnica, decisão, roadmap, pendência ou handoff conflitante sobre como a empresa deve operar, inclusive documentos recentes da Sprint 3. A data não basta para definir autoridade de negócio; a seção 16 do Passo 1 registra regras substituídas e divergências. Ele define processos, não arquitetura técnica.
- **Interface funcional:** Passo 2 prevalece sobre protótipos e interfaces anteriores, desde que não contradiga o Passo 1. Ele não define arquitetura nem aparência definitiva.
- **Questão técnica:** considere decisões mais recentes, notas de substituição e o padrão real do código vigente. Documentação **SUPERADA**, **LEGADO** ou **HISTÓRICO** não comanda nova implementação. Decisões, handoff, roadmap e pendências continuam úteis para técnica, histórico, estado e planejamento, sem contrariar regras operacionais do Passo 1.
- `database/` é **LEGADO**: leia seu README para contexto; não use seus SQLs para reconstruir o banco atual.
- Não escolha silenciosamente entre duas fontes atuais realmente conflitantes. **Pare a parte afetada e pergunte.**

## 3. Antes de modificar

1. Verifique `git status` e confirme a branch atual.
2. Entenda o escopo e registre quais alterações já existiam no working tree.
3. Leia os documentos diretamente relevantes, de forma proporcional à tarefa.
4. Localize a implementação e soluções equivalentes antes de propor nova estrutura.
5. Identifique impactos em outros módulos, dados derivados, cache e banco.
6. Antes de iniciar sprint/item do roadmap, pendências ou próximo passo do handoff, reconcilie o escopo com Passo 1 e Passo 2 quando a área estiver modelada. Esses planos podem anteceder a revisão operacional e não são fontes definitivas de regra de negócio.

Uma mudança pequena de texto não exige reler toda a documentação. Uma mudança em Conciliação exige consultar Passo 1, a parte modelada/inventariada do Passo 2, código atual, decisões relevantes e handoff recente.

## 4. Regra ausente e autorização

**Nunca invente regra de negócio.** Se faltar definição vigente de regra financeira, comportamento operacional, exceção, automatismo, cálculo, classificação ou fluxo do usuário, pare a parte dependente e pergunte.

Não use “padrão de mercado”, prática contábil genérica ou código antigo para substituir uma decisão gerencial da empresa.

Antes de implementar uma área, diferencie:

- **A — Regra aprovada e código alinhado:** preserve o comportamento.
- **B — Regra aprovada e código antigo:** evolua para a regra aprovada quando essa mudança fizer parte da tarefa autorizada.
- **C — Regra ainda não definida/modelada:** não antecipe implementação.

Consultar uma regra nova não autoriza corrigir todas as divergências existentes.

## 5. Conciliação, estruturas removidas e protótipos

A Conciliação Bancária atual ainda contém regras anteriores e **não está totalmente alinhada ao Passo 1**. Não use seu comportamento como regra definitiva nem a corrija incidentalmente em outra tarefa. A nova Conciliação deve primeiro ter sua interface funcional aprovada no Passo 2; reimplemente-a somente na tarefa específica, usando Passos 1 e 2 aprovados. **Revise/remova este aviso temporário quando a interface estiver aprovada, a implementação alinhada ao Passo 1 e a entrega registrada na documentação vigente.**

Não recrie, sem nova decisão aprovada, `LiquidacaoFinanceira`, `AplicacaoDeLiquidacao`, `AjusteFinanceiro` ou o antigo fluxo manual de “pagar fatura”. Confira a superação de documentos que ainda os mencionem em `docs/decisions.md` e no handoff.

Protótipos validam fluxo, conteúdo, ações e usabilidade; não provam implementação concluída nem integração. Preserve a lógica funcional aprovada, sem copiar automaticamente cores, dimensões, CSS, disposição exata ou detalhes cosméticos como contrato visual definitivo.

## 6. Padrões técnicos a preservar

Antes de assumir API ou padrão de framework/biblioteca, confira as versões reais em `backend/pom.xml` e `frontend/package.json`; não aplique exemplos de versões antigas por hábito. O frontend usa `react-router`: não presuma `react-router-dom`. Preserve a configuração específica de Flyway do Spring Boot 4 já existente no POM.

### Backend

- Java 21, Spring Boot, Maven, PostgreSQL e Flyway.
- Organização existente: `domain`, `application`, `interfaces/http`, `infrastructure`, `common`.
- Controllers pequenos; services concentrando operações e validações; injeção por construtor; transações e leituras `readOnly` conforme o padrão existente.
- Requests/responses separados das entidades; mappers explícitos; Bean Validation e tratamento de erro centralizado.
- Repositories Spring Data, UUID e `BigDecimal` para dinheiro; testes seguindo os padrões existentes.
- Preserve a implementação real: a inspiração de Clean Architecture não autoriza impor uma arquitetura ideal diferente. Entidades JPA e repositories já existentes não justificam criar nova camada de persistência por preferência.

### Frontend

- React, TypeScript e Vite; organização `app`, `features`, `shared`, `routes`.
- Features com `api`, `hooks`, `components`, `pages` e tipos quando aplicável; rotas centralizadas.
- TanStack Query para estado de servidor; query keys conforme o padrão atual, compartilhando a chave das listas usadas por vários módulos.
- React Hook Form + Zod; cliente axios compartilhado; componentes e testes existentes como referência.
- Reuse componentes de formulário, moeda e autocomplete. Verifique solução equivalente antes de criar padrão ou componente genérico; não importe diretamente de outra feature quando o recurso pertence a `shared`.
- Invalide os dados derivados e caches de todos os módulos afetados por uma mutação, conforme o comportamento real do backend.

## 7. Banco e migrations

- Identifique a última migration antes de criar outra; evolua por **nova migration Flyway**.
- Não edite migration já aplicada para representar nova mudança; não atualize SQL legado para simular o schema vigente.
- Mantenha Hibernate validando o schema conforme a configuração existente (`ddl-auto: validate`).
- **Banco dos testes, no estado atual:** não há perfil separado de banco para testes. Testes Spring que sobem o contexto usam o PostgreSQL de `backend/src/main/resources/application.yaml`, atualmente o banco local de desenvolvimento; Flyway pode aplicar migrations nele.
- Antes de executar aplicação, testes backend que subam o contexto Spring ou outro comando que possa aplicar Flyway, identifique conscientemente o banco e o efeito esperado. Não o presuma descartável; tenha cuidado especial com migrations novas.
- Nunca apague ou recrie banco sem autorização explícita.

## 8. Limites de escopo e documentação

Implemente apenas o pedido. Sem autorização, não inclua refatoração ampla, modernização, troca de biblioteca, renomeações em massa, arquitetura nova, melhorias adjacentes, pendências futuras ou segurança/auditoria/IA incidentalmente.

Registre problemas fora do escopo no relatório, sem corrigi-los automaticamente. A exceção é a correção mínima indispensável para a tarefa funcionar: relate-a explicitamente; ela não autoriza inventar regras ou alterar arquitetura sem aprovação.

Não atualize toda a documentação a cada microalteração. O implementador deve avaliar atualização de `docs/handoff.md` e `docs/changelog.md` ao concluir entrega relevante que altere o estado do projeto; atualize apenas os documentos pertinentes ao comportamento, arquitetura ou decisão afetados, respeitando o escopo autorizado. Em tarefa somente de revisão/auditoria, não edite esses registros nem outros arquivos sem solicitação explícita.

Nunca mude o Passo 1 para acompanhar código antigo: o código deve acompanhar a regra aprovada. Alterações de negócio exigem aprovação humana antes de modificar o Passo 1; mudanças de interface exigem aprovação antes de serem registradas como definitivas no Passo 2.

## 9. Validação proporcional

Execute os comandos pertinentes ao impacto; não exija todos para alterações triviais.

**Backend**, a partir da raiz:

```powershell
cd backend
.\mvnw.cmd test
# Quando apropriado:
.\mvnw.cmd package
```

**Frontend**, a partir da raiz:

```powershell
cd frontend
npx tsc -b
npm run test
npm run lint
npm run build
```

- Backend alterado: testes pertinentes; suíte completa quando o impacto for amplo.
- Frontend alterado: typecheck e testes pertinentes; suíte/build conforme o impacto.
- Migration/schema: valide backend e integração contra banco real de teste/local conscientemente identificado. Mocks não verificam constraints nem aplicação de migrations.
- **Só afirme que testes passaram se foram executados nesta tarefa.** Separe resultados atuais de registros históricos e explique validações não executadas.

## 10. Git e encerramento

A branch principal de desenvolvimento é `develop`. Não troque de branch automaticamente.

- Sem autorização explícita ou instrução específica da tarefa, não execute operações que descartem ou escondam alterações, reescrevam histórico, substituam trabalho do usuário ou publiquem mudanças. Exemplos, não lista exaustiva: `git restore`, `git clean`, `git stash`, `git reset`, checkout destrutivo, `git commit --amend`, `git rebase`, `git push --force`, merge, commit e push. Mesmo sem destruir dados, stash pode esconder trabalho preexistente.
- Nunca adicione ao Git senhas, tokens, API keys, segredos, credenciais ou `.env` local com valores sensíveis. Antes de commitar configuração nova, verifique se contém segredos.
- Nunca descarte alterações preexistentes do usuário; identifique-as antes de editar e não as misture com o trabalho novo sem informar.
- Confira o diff e o estado final do Git antes de encerrar.
- Relate, conforme aplicável: arquivos alterados, comportamento implementado, decisões relevantes, comandos realmente executados e resultados, limitações, problemas fora do escopo, dúvidas, documentação alterada e estado do Git.
- Use relatório curto para tarefa pequena e completo para alteração estrutural; não preencha seções vazias artificialmente.

## 11. Contexto que muda

Este manual contém regras de trabalho, não um snapshot do projeto. Para andamento dos módulos, validação das telas, sprint, resultados históricos e commits recentes, consulte `docs/handoff.md`, `docs/interface-funcional-financeiro.md`, `docs/changelog.md` e Git. Não transforme esses estados temporários em regras permanentes aqui.
