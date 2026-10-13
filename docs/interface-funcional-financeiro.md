# INTERFACE FUNCIONAL — FINANCEIRO
## H. Vieira Terraplanagem — Passo 2 da revisão operacional

---

## 1. Objetivo do documento

Este documento é a **referência oficial do Passo 2**.

**PASSO 1** (`fluxos-operacionais-definitivos.md`) define **como a empresa trabalha** e as **regras operacionais**. Continua sendo a fonte das regras de negócio e **não é alterado por este documento**.

**PASSO 2** (este documento) define **como o usuário interage com o sistema** para executar esses fluxos.

### O que este documento NÃO define

- arquitetura;
- React;
- componentes;
- API;
- banco de dados;
- CSS final;
- identidade visual definitiva.

### O que este documento define

- telas;
- informações exibidas;
- ações disponíveis;
- comportamento das ações;
- modos de edição;
- fluxo entre telas;
- validações percebidas pelo usuário;
- decisões de praticidade/usabilidade.

### Regra de precedência

- Regra de negócio: vale o Passo 1.
- Forma de operar a tela: vale este documento.
- Quando este documento cita uma regra do Passo 1, apenas a **referencia**; não a redefine.
- Os protótipos foram criados para validar **funcionalidade**, não aparência (ver Seção 27).

---

## 2. Status atual do Passo 2

| Área | Status |
|---|---|
| **Contas a Pagar** | Interface funcional validada por protótipo e considerada **FECHADA**, exceto ajustes visuais/cosméticos que podem ocorrer na implementação final |
| **Contas a Receber** | Interface funcional validada por protótipo e considerada **FECHADA**, exceto ajustes visuais/cosméticos que podem ocorrer na implementação final |
| **Conciliação** | Ainda não modelada no Passo 2; próxima etapa de modelagem funcional |
| **Cartão** | Ainda não modelado no Passo 2 |
| **Medições** | Ainda não modeladas no Passo 2 |
| **Balanço** | Ainda não modelado no Passo 2 |

**O Passo 2 como um todo continua ABERTO.** Contas a Pagar e Contas a Receber têm direção funcional aprovada. Isso não significa frontend visual final, implementação real ou integração com backend concluídos.

---

# PARTE A — CONTAS A PAGAR

---

## 3. Objetivo da tela

Contas a Pagar é uma **AGENDA de obrigações financeiras futuras**.

Pergunta que a tela responde:

> "O que ainda está programado para pagar?"

- A tela principal mostra os lançamentos **ainda não conciliados**.
- Quando futuramente um pagamento for confirmado pela Conciliação Bancária, ele **deixa a lista principal** de Contas a Pagar.
- **Não existe ação manual** de "Pago", "Marcar como pago" ou "Confirmar pagamento". A Conciliação é a responsável por confirmar o realizado.
- **Não existe coluna "Situação"** apenas para mostrar "Pendente", porque todos os registros da lista principal já estão pendentes.

Regra de negócio de origem: Passo 1, Seção 3 (Contas a Pagar) e Seção 6 (Conciliação).

---

## 4. Contas a Pagar é separado de Contas a Receber

- **Contas a Pagar** e **Contas a Receber** são **telas distintas**.
- **Não usar** uma tabela única misturando entradas e saídas.
- **Não usar** abas internas "A Pagar / A Receber" dentro da mesma tela como solução principal.
- As duas telas poderão compartilhar padrão visual e navegação, mas os **fluxos são separados**.

---

## 5. Navegação financeira

Foi aprovada **conceitualmente** uma navegação simples entre as áreas.

Neste estágio:

> Contas a Pagar ↔ Contas a Receber

Quando a Conciliação for criada, a intenção é evoluir para algo semelhante a:

> Contas a Pagar · Contas a Receber · Conciliação

- A estrutura visual definitiva dessa navegação **ainda não foi decidida**.
- Fica registrada apenas a **necessidade funcional** de navegar facilmente entre as áreas.

---

## 6. Filtros

A tela possui filtros funcionais por:

- Empresa;
- Período/data;
- Obra;
- Fornecedor;
- Categoria.

Existe a ação **Limpar filtros**.

Decisões:

- Foi deliberadamente **evitada uma segunda barra de pesquisa geral** quando ela apenas duplicaria funções dos filtros.
- O **total exibido da lista acompanha os filtros aplicados** (ver Seção 26).
- Não há necessidade, nesta etapa, de gráficos, dashboard, cards grandes, quantidade de atrasados ou indicadores decorativos.

---

## 7. Tabela principal

A tabela principal permite visualizar as informações relevantes da obrigação financeira.

**Informações aprovadas:**

- Vencimento;
- Empresa;
- Fornecedor;
- Descrição;
- Categoria;
- Obra;
- Veículo / resumo de rateio;
- Documento/NF;
- Parcela;
- Forma de pagamento;
- Valor.

**Diretrizes funcionais:**

- Valor precisa ficar claramente visível.
- Vencimento precisa ficar claramente visível.
- A tabela deve priorizar legibilidade.
- Abreviações intuitivas podem ser usadas para evitar largura excessiva.
- Pequenos ajustes de fonte, padding e largura são decisões de implementação, **não regra rígida**.
- Larguras específicas de coluna **não** são decisão definitiva.

---

## 8. Data programada que já passou

Quando a data programada já passou e a obrigação continua pendente:

- destacar visualmente de forma **discreta**;
- **não** transformar automaticamente em um status comercial chamado "Atrasado".

O usuário decide: **pagar**, **remarcar** ou **manter**. A tela apenas evidencia que a data programada passou.

Regra de negócio de origem: Passo 1, Seção 3 ("Data programada e remarcação") e Seção 14.

---

## 9. Lançamento rápido

Um novo lançamento pode ser criado **diretamente na tela de Contas a Pagar**.

**Não exigir:**

- abrir página separada;
- navegar para outro cadastro;
- abrir um fluxo longo.

**Campos do lançamento rápido:**

- Vencimento;
- Empresa;
- Fornecedor;
- Descrição;
- Categoria;
- Obra;
- Veículo;
- Documento/NF;
- Parcela;
- Forma de pagamento;
- Valor.

**Formas de pagamento usadas atualmente:** Boleto, PIX, Cheque.

**Campos que podem permanecer sem valor** quando não fizerem sentido: Documento/NF, Obra, Veículo e Parcela.

A interface **não precisa** exibir textos como "(opcional)" nesses campos. A ausência de valor já representa isso.

---

## 10. Ação LANÇAR

- O botão principal de criação chama-se **LANÇAR**, e não "Adicionar".
- A linguagem escolhida deve refletir a atividade financeira da empresa.

Ao lançar normalmente:

1. cria uma obrigação;
2. insere uma linha na Agenda;
3. limpa o formulário rápido.

---

## 11. Fornecedor e Categoria

Fornecedor e Categoria possuem **preenchimento rápido**.

Comportamento esperado:

1. o usuário começa digitando;
2. o sistema sugere registros existentes;
3. o usuário pode selecionar;
4. se não existir, pode criar/usar rapidamente o novo valor.

**Não exigir pré-cadastro** antes de lançar uma conta.

A solução visual definitiva do autocomplete **não** é regra deste documento.

Regra de negócio de origem: Passo 1, Seção 2 (princípio 4) e Seção 3.

---

## 12. Modo de edição

Decisão importante: a edição **não** funciona como "clicar aleatoriamente em uma célula e alterar imediatamente".

Existe uma ação explícita: **MODO DE EDIÇÃO**.

**Estado normal:** a tabela está em modo de consulta, sem ação de exclusão permanentemente exibida em cada linha.

**Ao ativar o MODO DE EDIÇÃO:**

- a grade passa a ser editável;
- o usuário pode alterar várias linhas;
- não precisa salvar uma por uma.
- cada linha passa a exibir uma ação de exclusão na extremidade esquerda, representável por uma lixeira; a aparência exata do ícone não é definitiva.

**Durante o modo aparecem:**

- **SALVAR ALTERAÇÕES** — confirma todas as edições e exclusões pendentes e encerra o modo de edição.
- **CANCELAR ALTERAÇÕES** — descarta todas as alterações feitas desde que o modo foi ativado, restaura o estado anterior, inclusive linhas marcadas para exclusão, e encerra o modo de edição.

Demais pontos:

- Os campos do lançamento permanecem editáveis conforme aplicável.
- **Não** é obrigatório existir botão de lápis individual em cada linha.

### 12.1 Excluir lançamento

A exclusão fica disponível de forma simples **somente dentro do Modo de Edição**, com confirmação antes de marcar a alteração como pendente.

O texto da interface continua sendo **Excluir lançamento**. Sua semântica é **CANCELAMENTO LÓGICO**: o lançamento deixa a Agenda principal de pendências, mas o registro financeiro permanece preservado no sistema. Não significa apagar fisicamente o registro do banco de dados; não deve ser implementado `DELETE` físico do lançamento financeiro para atender essa ação. É coerente com a regra do projeto de não apagar lançamentos financeiros (`project-rules.md`). Não é necessário expor o termo técnico como ação principal ao usuário; não se define aqui estrutura de banco, status, endpoint, DTO ou implementação específica.

- Para um lançamento comum, **Excluir lançamento** cancela logicamente somente aquele lançamento, retirando-o da Agenda ativa e preservando seu registro, sem afetar outros lançamentos.
- Para uma parcela de série finita, como `24/48`, a mesma ação cancela logicamente somente aquela parcela independente; não cancela as demais nem encerra a série inteira.
- Série finita não é recorrência: não oferece **Excluir recorrência** nem uma ação de cancelar todas as parcelas restantes. Esta última exigiria decisão separada.
- Não estão previstos nesta etapa histórico de exclusão ou lixeira de recuperação.

### 12.2 Excluir recorrência

Quando a linha pertence a uma **recorrência sem fim definido**, a ação oferece duas opções distintas:

- **Excluir lançamento** — cancela logicamente somente a ocorrência selecionada, que deixa a Agenda ativa, com registro preservado; as demais continuam normalmente e a recorrência continua ativa.
- **Excluir recorrência** — encerra a recorrência **a partir da ocorrência selecionada**, com confirmação clara do alcance da ação.

**Excluir recorrência** significa encerramento do futuro, sem apagar o histórico:

- a ocorrência selecionada é cancelada logicamente, com registro preservado;
- ocorrências futuras ainda pendentes daquela recorrência são canceladas logicamente ou deixam de ser geradas, conforme a estratégia técnica futura;
- ocorrências anteriores permanecem preservadas;
- itens já realizados anteriormente nunca são apagados por essa ação;
- a recorrência não gera novas obrigações depois desse ponto.

Nenhum histórico anterior deve ser apagado fisicamente. A representação técnica do encerramento no backend não é definida nesta etapa.

### 12.3 Exclusão na sessão de edição

Tanto **Excluir lançamento** quanto **Excluir recorrência** são alterações pendentes da mesma sessão de edição. A confirmação da ação não substitui **SALVAR ALTERAÇÕES**: somente ao salvar a sessão o cancelamento lógico e o encerramento pendentes são efetivados. Antes de salvar, **CANCELAR ALTERAÇÕES** restaura o estado existente quando o modo foi ativado, inclusive linhas marcadas para exclusão, e desfaz exclusões e encerramentos ainda não salvos. A implementação técnica desse comportamento não é definida aqui. Itens originados de outros fluxos têm a pendência específica da Seção 31.

---

## 13. Remarcação

Remarcar um pagamento é simplesmente **editar o seu vencimento**.

**Não criar:**

- fluxo específico de reagendamento;
- histórico obrigatório da data anterior;
- status especial.

No Modo de edição: altera a data e salva.

Regra de negócio de origem: Passo 1, Seção 3 ("Data programada e remarcação").

---

## 14. Rateio gerencial — acesso na criação

A regra de negócio do Rateio está em `fluxos-operacionais-definitivos.md` (Seção 18). Aqui se registra **apenas a interface aprovada**.

- O Rateio pertence ao **lançamento como um todo**.
- Ele **não** pertence especificamente ao campo Veículo.
- Por isso foi **rejeitada** a ideia de colocar a ação de rateio junto apenas ao campo Veículo.

Na criação, junto à ação LANÇAR existe uma ação secundária minimalista **+**:

> [ LANÇAR ] [ + ]

- **LANÇAR** → lançamento simples.
- **+** → lançar **com rateio**.

O símbolo + poderá ter tooltip equivalente a "Lançar com rateio". A aparência final do botão pode mudar na implementação definitiva. O importante é que o rateio seja uma ação do **lançamento inteiro**.

---

## 15. Rateio — comportamento da interface

Ao iniciar um lançamento com rateio:

- usar os dados gerais digitados como base;
- abrir a interface de distribuição;
- permitir múltiplas partes.

**Cada parte permite:**

- Valor;
- Categoria;
- Obra;
- Veículo;
- Descrição complementar.

Veículo pode ficar sem valor. Obra pode ficar sem valor quando não fizer sentido.

O rateio precisa representar **100% do lançamento**. A interface mostra claramente:

- **Valor total**;
- **Total rateado**;
- **Restante**.

O rateio só é considerado completo quando **Total rateado = Valor total**.

Regras de negócio de origem: Passo 1, Seções 18.2 a 18.4.

---

## 16. Ações do rateio

Aprovadas conceitualmente:

- **+ Adicionar parte**
- **Remover parte**
- **Dividir igualmente**

**DIVIDIR IGUALMENTE** é apenas uma facilidade de preenchimento:

- só acontece quando o usuário solicita;
- não define regra gerencial;
- os valores continuam editáveis depois.

O usuário pode preferir informar manualmente o valor de cada parte.

---

## 17. Representação do rateio na tabela

- Um lançamento rateado continua sendo **UMA linha** na Agenda.
- **Não** mostrar cada parte como lançamento separado.
- Na tabela principal existe um **resumo compacto**.

Exemplos aceitáveis (a forma textual final **não** é definitiva):

- "Rateado · 3 partes"
- "3 partes · 2 veículos"

O importante é que:

- o usuário identifique rapidamente que existe rateio;
- consiga reabrir o rateio;
- não seja induzido a acreditar que apenas um veículo/categoria representa o lançamento.

Regra de negócio de origem: Passo 1, Seção 18.5 ("Na Agenda/Contas a Pagar, o compromisso continua único").

---

## 18. Alteração de lançamento rateado

Se o **valor total** de um lançamento rateado for alterado:

- o sistema **não redistribui automaticamente**;
- o usuário ajusta manualmente as partes;
- o rateio precisa voltar a fechar 100%.

A forma de alerta/validação visual pode ser refinada durante a implementação.

**Não criar automações que inventem a distribuição.**

Regra de negócio de origem: Passo 1, Seção 18.7.

---

## 19. Parcela manual

O campo **Parcela** pode ser usado simplesmente como texto/contexto. Exemplos: `1/3`, `2/3`, `3/3`.

O usuário pode preencher manualmente **sem ativar nenhuma geração automática**.

---

## 20. Parcelas em série

Ao lado de Parcela existe uma ação minimalista **+**, com o conceito **Parcelas / recorrência**.

Serve para os casos em que o usuário quer **gerar vários lançamentos de uma vez**.

**Exemplo:**

| Campo | Valor |
|---|---|
| Parcela atual | 24 |
| Parcela final | 48 |
| Primeiro vencimento | 14/10/2026 |
| Periodicidade | Mensal |
| Valor | R$ 18.500 |

O sistema gera `24/48`, `25/48`, … `48/48`.

- A **parcela atual é incluída**.
- **Não é necessário cadastrar as parcelas anteriores.**
- Isso atende principalmente a **migração de contratos/financiamentos já em andamento**.

Regra de negócio de origem: Passo 1, Seções 5.3 e 5.5.

---

## 21. Parcelas geradas são independentes

Depois da geração, **cada parcela é um lançamento independente**.

O usuário pode alterar individualmente: data, valor, categoria, obra, veículo, rateio e demais dados.

- Alterar uma parcela **não altera automaticamente as demais**.
- A geração em série é apenas uma **facilidade de criação inicial**.

Regra de negócio de origem: Passo 1, Seções 5.2 e 5.3.

---

## 22. Pré-visualização da série

Antes de gerar muitas parcelas, a interface fornece uma **conferência simples**.

Exemplo:

> 25 lançamentos serão criados.
> Primeiro: 24/48 — 14/10/2026
> Último: 48/48 — 14/10/2028
> Valor padrão: R$ 18.500

- Pode também informar o **total previsto da série**.
- **Não** é necessário listar todas as parcelas antes da confirmação.

---

## 23. Recorrência sem fim definido

A mesma área de **Parcelas / Recorrência** permite configurar obrigações recorrentes **sem parcela final**. Exemplo: aluguel de imóvel.

**Campos conceituais:**

- primeiro vencimento;
- periodicidade;
- valor padrão.

Comportamento:

- A recorrência continua **até o usuário encerrá-la**.
- Ao encerrar: **não gera novas obrigações**; os lançamentos anteriores **permanecem**.
- O protótipo atual pode simular um número limitado de ocorrências. **Esse limite NÃO é regra do sistema real.**
- A estratégia técnica de geração futura fica para implementação posterior.

O acesso funcional aprovado para encerrar a recorrência é **Excluir recorrência** no Modo de Edição, a partir da ocorrência selecionada (Seções 12.2 e 12.3).

Regra de negócio de origem: Passo 1, Seção 5.4.

---

## 24. Periodicidade

No protótipo foram consideradas inicialmente: **Mensal** e **Anual**.

Isso é registrado como **necessidade mínima já identificada**, e **não** como lista definitiva.

---

## 25. Diferença entre Parcela, Recorrência e Rateio

A interface mantém esses três conceitos **distintos**, sem misturar os fluxos.

| Conceito | O que é | Exemplo |
|---|---|---|
| **Parcela** | Vários pagamentos independentes | 1/3, 2/3, 3/3 |
| **Recorrência** | Pagamentos periódicos sem final previamente conhecido | Aluguel de imóvel |
| **Rateio** | Um único pagamento dividido gerencialmente entre diferentes classificações | NF de oficina dividida entre veículos |

Regra de negócio de origem: Passo 1, Seções 5.2 e 18.6.

---

## 26. Total listado

A tela pode apresentar **Total listado**.

Esse valor:

- soma os lançamentos visíveis;
- respeita os filtros.

Não precisa de dashboard para isso.

---

## 27. Decisões visuais que NÃO são definitivas

Os detalhes abaixo, presentes no protótipo, **não são contrato visual definitivo**:

- cor azul;
- fonte;
- bordas;
- tamanho dos botões;
- modal específico;
- ícone +;
- larguras exatas;
- sombras;
- espaçamento exato;
- aparência dos selects.

O protótipo foi criado para validar **FUNCIONALIDADE**. O frontend final será refinado posteriormente.

---

## 28. Contas a Pagar — status no Passo 2

> **CONTAS A PAGAR — INTERFACE FUNCIONAL VALIDADA.**

**Significa que foram testados:**

- fluxo principal;
- lançamento;
- edição;
- cancelamento de edição;
- exclusão de lançamento e encerramento futuro de recorrência no Modo de Edição, conforme ajuste aprovado nas Seções 12.1–12.3;
- rateio;
- parcelas/recorrência;
- filtros.

**NÃO significa:**

- frontend visual final;
- implementação real concluída;
- integração com backend concluída.

Significa apenas que, funcionalmente, existe uma **direção aprovada**.

---

# PARTE B — CONTAS A RECEBER

---

## 29. CONTAS A RECEBER

### 29.1 Objetivo da tela

Contas a Receber é a **AGENDA de recebimentos futuros/esperados**. Pergunta principal:

> "O que ainda está programado para receber?"

- Mostra recebimentos ainda esperados/não confirmados.
- Valor e data previstos permanecem editáveis enquanto forem projeção.
- A confirmação do realizado vem futuramente pela **Conciliação Bancária**.
- Não existe botão manual **Recebido**, **Marcar como recebido** ou equivalente.
- Depois de confirmado pela Conciliação, o recebimento deixa a lista principal de pendências da agenda.

Regra de negócio de origem: Passo 1, Seções 4 e 6.

### 29.2 Separação e navegação

Contas a Pagar e Contas a Receber continuam sendo **telas distintas** (Seções 4 e 5). Não há tabela única de entradas e saídas nem aba interna principal misturando as agendas.

Podem compartilhar padrão visual e navegação. A navegação conceitual é **Contas a Pagar ↔ Contas a Receber** e, futuramente, **Contas a Pagar · Contas a Receber · Conciliação**. A estrutura visual definitiva continua aberta.

### 29.3 Campos funcionais

Campos aprovados para lançamento e visualização:

- Data prevista;
- Empresa;
- Cliente;
- Descrição;
- Categoria;
- Obra;
- Documento/NF;
- Valor.

Não copiar recursos de Contas a Pagar por simetria. Os limites desta etapa estão na Seção 29.11.

### 29.4 Lançamento rápido

O recebimento esperado pode ser lançado **diretamente na própria tela**, sem página separada, fluxo longo ou navegação para outro módulo.

A ação principal é **LANÇAR**. Ao lançar normalmente:

1. cria o recebimento esperado;
2. insere na Agenda de Contas a Receber;
3. limpa o formulário rápido.

### 29.5 Cliente e Categoria

- **Cliente:** a base atual é pequena; seleção simples é suficiente. Não é necessário copiar automaticamente o autocomplete rápido de Fornecedor.
- **Categoria:** deve ser selecionável de forma prática; reutilizar padrões existentes do sistema quando fizer sentido. O componente/interação específica não é requisito funcional aprovado nesta etapa: não se exige autocomplete específico, criação rápida ou comportamento idêntico ao Pagar, nem se proíbe reaproveitamento técnico futuro.

Detalhes específicos dos componentes não são regras deste documento.

### 29.6 Filtros e Total listado

Filtros aprovados: **Empresa**, **Período/data**, **Cliente**, **Categoria** e **Obra**, com ação **Limpar filtros**.

O **Total listado** acompanha os filtros aplicados e soma os lançamentos visíveis. Não adicionar busca geral redundante, dashboard, cards grandes, indicadores decorativos ou gráficos nesta etapa.

### 29.7 Tabela e data prevista passada

A tabela principal apresenta os campos da Seção 29.3, com **Valor** e **Data prevista** claramente visíveis. Deve ser compacta e legível; ajustes cosméticos ficam para a implementação final.

Não é necessária uma coluna **Status = Pendente**, pois os itens da agenda já são pendências.

Se a Data prevista já passou e o recebimento continua pendente, a tela **destaca discretamente que a previsão passou**, sem criar automaticamente o status comercial **Atrasado**. O usuário pode corrigir/remarcar a Data prevista durante a edição.

### 29.8 Modo de Edição

No estado normal, a tabela é de consulta. Ao ativar **MODO DE EDIÇÃO**, a grade passa a ser editável e várias linhas podem ser alteradas na mesma sessão.

- **SALVAR ALTERAÇÕES** confirma as edições e exclusões pendentes e encerra o modo.
- **CANCELAR ALTERAÇÕES** restaura o estado existente quando o modo foi ativado, inclusive linhas marcadas para exclusão, e encerra o modo.

### 29.9 Exclusão de lançamento

A ação de exclusão por linha aparece **somente no Modo de Edição**, na extremidade esquerda, representável por uma lixeira. A aparência exata do ícone não é definitiva.

- A única opção atualmente aprovada é **Excluir lançamento**, com a mesma semântica de **cancelamento lógico** da Seção 12.1: somente aquele recebimento esperado deixa a Agenda ativa e seu registro permanece preservado no sistema, sem remoção física.
- Deve haver confirmação; o recebimento é marcado para exclusão como alteração pendente. Somente **SALVAR ALTERAÇÕES** efetiva o cancelamento lógico.
- **CANCELAR ALTERAÇÕES** desfaz a exclusão ainda não salva e restaura a linha.
- Não inventar exclusão fora do Modo de Edição, histórico de exclusão ou lixeira de recuperação.

**Recorrência não está aprovada em Contas a Receber nesta etapa.** Não oferecer **Excluir recorrência** nem adicionar recorrência para reutilizar o comportamento de Pagar. Uma aprovação futura poderá estender o fluxo.

Para recebimentos originados de Medição ou de outros fluxos, o efeito da ação continua pendente, conforme a Seção 31; não aplicar automaticamente o comportamento do lançamento manual.

### 29.10 Origem em Medição e outras entradas esperadas

Para recebimento originado de **Medição**, a Agenda representa o **valor líquido esperado no banco**, conforme o Passo 1, Seções 4 e 9.2:

| Composição conceitual | Valor |
|---|---|
| Valor total da Medição | R$ 100.000 |
| Faturamento direto | R$ 20.000 |
| Retenções | R$ 5.000 |
| Recebimento esperado no banco / Agenda | **R$ 75.000** |

A Agenda mostra R$ 75.000, sem perder a composição completa da Medição no Balanço gerencial. Essa composição pertence ao fluxo de Medição/Balanço; esta documentação não implementa nem modela a interface de Medição.

Também pode haver recebimentos sem origem em Medição, quando forem entradas reais esperadas compatíveis com o Passo 1. Entrada de caixa não implica Receita gerencial: **transferência interna**, **liberação de financiamento** e **contemplação/carta de crédito** não se tornam Receita por aparecerem no caixa. Referências: Passo 1, Seções 4, 5.6 e 7.

### 29.11 Fora da interface aprovada atualmente

Não fazem parte desta etapa: **Veículo**, **Forma de pagamento**, **Parcela**, **geração de série**, **recorrência**, **rateio**, **botão manual de recebido**, **status Atrasado**, **dashboard** e **busca geral redundante**. Isso delimita a aprovação atual; não proíbe decisões futuras.

### 29.12 Contas a Receber — status no Passo 2

> **CONTAS A RECEBER — INTERFACE FUNCIONAL VALIDADA.**

Foram validados funcionalmente: fluxo principal, lançamento rápido, campos, filtros, Modo de Edição, cancelamento de edição, exclusão de lançamento, destaque de data prevista passada, Total listado e separação em relação a Contas a Pagar.

Isso **NÃO significa** frontend visual final, implementação real concluída ou integração com backend concluída. O protótipo validou fluxo, campos, ações, edição, filtros e praticidade de uso; a direção funcional está aprovada.

**PROTÓTIPO FUNCIONAL ≠ FRONTEND VISUAL FINAL.** Cores, CSS, fonte, tamanhos, larguras exatas, espaçamentos, posição pixel a pixel, estilo de botões e aparência específica de selects/modais não são contrato visual definitivo (Seção 27).

---

# PARTE C — PRÓXIMA ETAPA

---

## 30. Próxima etapa prevista — Conciliação Bancária

> **Esta seção é somente um INVENTÁRIO.** Não há desenho de interface, escolha de colunas, proposta de botões nem wireframe. Ela reúne, a partir de `fluxos-operacionais-definitivos.md`, as regras **já confirmadas** que a interface da Conciliação precisará respeitar quando for modelada. Contas a Pagar e Contas a Receber estão funcionalmente validadas; a próxima etapa é a **MODELAGEM DA INTERFACE FUNCIONAL DA CONCILIAÇÃO**. Nada neste inventário é decisão nova.

Referências entre parênteses indicam a seção do Passo 1.

### 30.1 Escopo da Conciliação
- Objetivo: ser um **extrato bancário enriquecido**, um dos principais fluxos diários (6).
- **Tudo que está no extrato aparece na Conciliação** e nenhuma movimentação é ignorada permanentemente; toda movimentação é classificada (6).
- Aparecer na Conciliação **não significa ser Receita ou Despesa** (6, 7).
- Tudo permanece editável (6).

### 30.2 Importação OFX
- OFX é a fonte oficial de movimentações no primeiro momento (6.1).
- Importação prevista cerca de **duas vezes por dia** (6.1).
- Deduplicação: o mesmo período pode aparecer em mais de uma importação; o sistema identifica o que já foi importado, não duplica e adiciona só o novo (6.1, 13.9).
- Estratégia técnica de detecção de duplicidade e validação com OFX reais: pendências técnicas, fora deste documento (6.1, 15).

### 30.3 Movimentações não programadas
- Pagamentos e recebimentos não programados aparecem como **Não conciliado**, apenas com os dados do banco (5.1, 6.2).
- São completados e corrigidos **na própria Conciliação**; o usuário não é obrigado a sair para cadastrar em outro lugar (5.1).
- A informação financeira passa a existir **a partir da Conciliação** (5.1).

### 30.4 Criação/complementação e edição rápida
- Criação e complementação diretamente pela Conciliação (5.1, 6.2).
- Edição rápida, próxima da experiência de planilha, inclusive em várias linhas — item deixado explicitamente para o Passo 2 (2, 15).

### 30.5 Estados
- Apenas dois estados visíveis: **Não conciliado** e **Conciliado** (6.3).
- Não expor estado "Divergente" salvo justificativa futura (6.3, 16).
- Se uma alteração posterior tornar um item conciliado incompatível com o movimento, ele **volta a Não conciliado** (6.3, 14).
- Vínculo feito errado deve poder ser **alterado ou desfeito com facilidade** (6.3, 14).

### 30.6 Sugestões de vínculo
- **Forte:** dados batem de forma muito confiável; o sistema pode sugerir fortemente (6.4).
- **Aproximada:** há sinais claros de relação, mas não exatidão; o sistema sugere candidatos (6.4).
- O sistema **nunca altera nada nem assume o vínculo sozinho** (2, 6.4).
- Sem candidato razoável: fica Não conciliado mostrando os dados do OFX (6.4).
- Vários candidatos igualmente compatíveis: o sistema não escolhe; o usuário decide (6.4).
- O valor procurado é o **valor de caixa esperado**: líquido a receber na Medição; valor da fatura no cartão (6.4).
- Valor real diferente do programado: o **banco prevalece**; o sistema sugere a correção e o usuário confirma (3, 4, 14).
- Apresentação das sugestões forte e aproximada: item deixado para o Passo 2 (15).

### 30.7 Empresa e conta bancária
- Empresa é só informação **auxiliar**, nunca bloqueio (6.5).
- Despesa de uma empresa pode ser paga pela conta de outra; o **movimento bancário real define a conta** (6.5, 14).

### 30.8 Um movimento para vários lançamentos
- O vínculo **não é obrigatoriamente 1 para 1**: um movimento pode corresponder a vários lançamentos ou Medições (6.6, 9.4).
- Isso **não é rateio**. Um lançamento rateado é conciliado pelo seu **valor total**; as partes do rateio nunca viram movimentos bancários separados (6.6, 18.5, 18.6).

### 30.9 Transferências internas e movimentos fora do resultado
- Transferência entre contas próprias aparece nas duas contas e altera o saldo de cada uma; não é Receita nem Despesa (7).
- Liberação de financiamento e contemplação/carta de crédito movimentam caixa e não são Receita (5.6, 7).
- Gasto reembolsável e retirada de proprietário não são despesa operacional (7).
- A Conciliação deve mostrar esses movimentos sem classificá-los como Receita ou Despesa operacional normal (7).

### 30.10 Pagamento de fatura de cartão
- A Conciliação enxerga a fatura como **um único débito bancário** (8).
- A fatura é paga integralmente, num único pagamento (8).
- A fatura **nunca recebe rateio** e não é despesa; as compras individuais compõem o Balanço (8, 13.4, 18.1).
- A conciliação do débito confirma o pagamento e define o período gerencial das compras (6.7 "O que segue adiante", 8).

### 30.11 Recebimentos de Medição
- A Conciliação procura o **valor líquido a receber** (9.2).
- Confirmar o recebimento define o **período realizado** da Medição, e faturamento direto e imposto retido acompanham esse período (9.3).
- A Conciliação **não determina sozinha** o valor gerencial da receita de obra; a entrada bancária **não cria outra receita** (9.2, 9.3, 13.1).
- Faturamento direto e imposto retido **não** são conciliados individualmente (10, 11, 13).
- Um crédito pode confirmar várias Medições ao mesmo tempo (9.4).

### 30.12 Parcelas de financiamento e consórcio
- Parcelas entram na Agenda de Contas a Pagar e são conciliadas normalmente quando pagas (5.5).

### 30.13 Visão diária para o patrão
- Informação objetiva e rápida: o que foi pago no dia anterior; o que entrou; saldo das contas; o que está previsto para pagar no dia; principais movimentações (6.7).
- A forma dessa visão fica para o Passo 2 (6.7, 15).

### 30.14 Saldo das contas
- A Conciliação/visão diária deve permitir conhecer o saldo das contas (6.7); transferências internas alteram o saldo de cada conta (7).

### 30.15 Tudo que aparece no banco precisa aparecer
- Nenhuma movimentação bancária é ignorada; nem todo movimento bancário é Receita ou Despesa (2 princípio 8, 6, 7).
- O mesmo movimento importado mais de uma vez existe uma única vez (13.9).

### 30.16 Relação com Contas a Pagar (consequência do Passo 1, a confirmar na etapa da Conciliação)
- Contas a Pagar termina quando o pagamento está conciliado (3), e este documento define que o item conciliado deixa a lista principal (Seção 3).
- Como um item conciliado alterado de modo incompatível **volta a Não conciliado** (6.3), ele passaria a reaparecer na lista principal. A forma de consultar itens já conciliados não foi definida no Passo 2 e deve ser tratada junto com a Conciliação.

---

## 31. Fora do escopo validado nesta etapa

Para evitar leitura excessiva do status da Seção 28, fica registrado o que **não** consta do que foi validado em Contas a Pagar:

- apresentação da **fatura de cartão** na Agenda (Passo 1, Seção 15);
- cadastro de **financiamentos e consórcios** além da geração de parcelas em série (Passo 1, Seções 5.5 e 15);
- forma de registrar a parte própria e a parte financiada num pagamento de bem (Passo 1, Seção 15);
- regras de **alerta/validação visual** do rateio inconsistente (apenas o princípio está registrado nas Seções 15 e 18).

Esses pontos seguem em aberto no Passo 2.

**Pendência — exclusão/cancelamento de itens originados de outros fluxos:** o efeito da ação sobre itens criados automaticamente ou originados de outros fluxos ainda não foi definido. Exemplos: fatura de cartão em Contas a Pagar e recebimento originado de Medição em Contas a Receber. Não assumir que esses itens podem ser cancelados como lançamentos manuais. Essa decisão será tomada na modelagem funcional de **Cartão** e **Medições** no Passo 2; até lá, não antecipar comportamento.

---

## 32. Histórico deste documento

| Versão | Descrição |
|---|---|
| 1 | Criação. Registra Contas a Pagar como interface funcional validada; Contas a Receber em prototipação; Conciliação apenas como inventário de requisitos do Passo 1. |
| 2 | Consolidação de Contas a Receber como interface funcional validada e ajuste aprovado de exclusão no Modo de Edição das agendas. Encerramento futuro de recorrência em Pagar definido; Conciliação é a próxima modelagem. Passo 2 permanece aberto, sem implementação técnica nesta atualização. |
