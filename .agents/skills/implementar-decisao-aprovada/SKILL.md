---
name: implementar-decisao-aprovada
description: >-
  Transforme decisão funcional, Issue ou especificação já aprovada e com comportamento
  definido em implementação verificável no H. Vieira ERP. Use para pedidos como
  implementar uma decisão aprovada, aplicar um fluxo validado ou executar mudança
  técnica de escopo decidido. Não use para edição trivial, definição de negócio,
  brainstorming, interface ainda não aprovada, prototipação ou revisão independente.
---

# Implementar decisão aprovada

Leia e siga o [AGENTS.md da raiz](../../../AGENTS.md). Esta skill organiza o procedimento de implementação; hierarquia das fontes, Git, banco, segurança, escopo e padrões técnicos continuam regidos pelo manual. Os demais caminhos citados nas fontes do projeto são relativos à raiz do repositório.

“Decisão aprovada” define **o que deve acontecer**. Cabe investigar **como implementar**, escolhendo a solução mais simples e coerente com o código existente, dentro do escopo e sem mudar o comportamento aprovado. Uma escolha técnica que altere negócio exige decisão humana.

## Procedimento

### 1. Confirmar a aprovação e a aceitação

- Identifique a decisão/tarefa autorizada, suas fontes pertinentes e os critérios de aceitação verificáveis. A decisão pode estar explícita na instrução direta do usuário nesta tarefa, em Issue indicada na tarefa, no Passo 1, no Passo 2 ou em outra especificação aprovada explicitamente indicada; aplique a hierarquia do AGENTS.md.
- Se o usuário aprovou explicitamente o comportamento ainda não registrado no Passo 1/Passo 2, não recuse apenas pela ausência documental: implemente somente o aprovado, sem conflito com regra vigente de maior autoridade. Não atualize esses documentos por conta própria; informe no relatório que a documentação oficial correspondente pode precisar de atualização/aprovação humana.
- Se a nova instrução contradizer regra vigente do Passo 1/Passo 2 sem substituir explicitamente a decisão anterior, **pare e peça confirmação**.
- Separe o decidido do que permanece aberto. Não considere uma Issue suficientemente definida apenas por existir ou por pedir implementação.
- **Se faltar regra necessária ou houver conflito vigente não resolvido, pare a parte dependente e pergunte.** Não complete lacunas por “bom senso”, padrão de mercado ou código antigo.

### 2. Investigar o fluxo existente

Localize código, chamadas e testes relacionados; entenda o comportamento atual e os padrões reutilizáveis. Conforme o caso, examine API, schema/migrations, frontend, query keys/cache e módulos consumidores antes de criar solução. Evite estrutura paralela quando houver padrão adequado.

### 3. Mapear a diferença

Relacione **estado atual → decisão aprovada → alterações necessárias**. Identifique arquivos prováveis, comportamento a mudar, comportamento a preservar e riscos de regressão. Para tarefa pequena, faça um mapa breve; para mudança estrutural, apresente explicitamente os impactos e critérios que a entrega deve satisfazer.

Se o mapa revelar algo que exige autorização adicional conforme o AGENTS.md — mudança de negócio, alteração arquitetural relevante, troca/adição de dependência, expansão do escopo ou mudança no Passo 1/Passo 2 — **pare antes de implementar essa parte e peça autorização**. Impactos técnicos normais e necessários dentro do escopo já autorizado não exigem interromper a tarefa: prossiga e registre os impactos relevantes no relatório final.

### 4. Planejar proporcionalmente

Defina a sequência mínima de implementação e validação. Não transforme tarefa simples em cerimônia nem crie arquivos de planejamento sem necessidade/autorização. Se a análise exigir mudança de negócio não aprovada ou outra autorização prevista no AGENTS.md, pare a parte afetada e pergunte antes de executar.

### 5. Implementar o escopo

Evolua incrementalmente no padrão existente. Não inclua refatoração adjacente, melhorias futuras ou outras pendências. Uma correção mínima indispensável para a entrega funcionar deve ser identificada e relatada, sem dispensar aprovação quando exigida pelo AGENTS.md.

### 6. Tratar schema, quando aplicável

Aplique as regras de banco do AGENTS.md: identifique a última migration e use nova migration Flyway, sem editar uma aplicada. Antes de iniciar Flyway, confirme qual banco será atingido. Se não houver mudança de schema, não crie migration.

### 7. Validar os critérios

Escolha verificações proporcionais ao impacto: comportamento e casos relevantes, testes existentes afetados, novos testes necessários e typecheck/build/suítes pertinentes. Para schema, inclua a integração real prevista no AGENTS.md.

Associe cada critério relevante à evidência obtida. Só declare sucesso de comandos realmente executados nesta tarefa; informe falhas, verificações não executadas e seus motivos. Não substitua validação atual por resultados históricos.

### 8. Auto-revisar

Revise o diff e o Git: arquivos inesperados, mudanças fora do escopo, regras inventadas, critérios não atendidos e regressões evidentes. Avalie documentação pertinente conforme o AGENTS.md; não atualize fontes aprovadas para justificar uma divergência do código. Resolva os problemas dentro do escopo ou declare claramente o impedimento; não apresente entrega incompleta como pronta.

### 9. Entregar para revisão independente

Torne rastreável a relação **critério aprovado → mudança implementada → evidência de validação**. No relatório, inclua conforme aplicável:

- comportamento entregue e arquivos principais;
- critérios atendidos e pendentes, com evidências;
- escolhas técnicas relevantes;
- comandos realmente executados, resultados e limitações;
- problemas fora do escopo e dúvidas restantes;
- documentação atualizada ou não e estado do Git relevante.

Use relatório proporcional, sem seções vazias. Preparar para revisão não significa delegar automaticamente, criar PR ou publicar a entrega.

## Limite de autorização

Ativar esta skill **não autoriza automaticamente** mudar negócio, modificar Passo 1/Passo 2, alterar arquitetura, trocar biblioteca, resolver pendências fora do escopo, trocar branch, fazer commit/push, criar PR, apagar dados ou recriar banco. Essas ações dependem da autorização específica da tarefa e das regras do AGENTS.md.
