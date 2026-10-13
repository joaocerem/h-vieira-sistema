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
| **Contas a Receber** | Em prototipação/validação neste momento |
| **Conciliação** | Ainda não modelada no Passo 2 |
| **Cartão** | Ainda não modelado no Passo 2 |
| **Medições** | Ainda não modeladas no Passo 2 |
| **Balanço** | Ainda não modelado no Passo 2 |

**O Passo 2 como um todo NÃO está fechado.** Apenas Contas a Pagar tem direção funcional aprovada.

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

**Estado normal:** a tabela está em modo de consulta.

**Ao ativar o MODO DE EDIÇÃO:**

- a grade passa a ser editável;
- o usuário pode alterar várias linhas;
- não precisa salvar uma por uma.

**Durante o modo aparecem:**

- **SALVAR ALTERAÇÕES** — mantém todas as alterações e encerra o modo de edição.
- **CANCELAR ALTERAÇÕES** — descarta todas as alterações feitas desde que o modo foi ativado, restaura o estado anterior e encerra o modo de edição.

Demais pontos:

- Os campos do lançamento permanecem editáveis conforme aplicável.
- **Não** é obrigatório existir botão de lápis individual em cada linha.

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

**Em prototipação e validação.**

---

# PARTE C — PRÓXIMA ETAPA

---

## 30. Próxima etapa prevista — Conciliação Bancária

> **Esta seção é somente um INVENTÁRIO.** Não há desenho de interface, escolha de colunas, proposta de botões nem wireframe. Ela reúne, a partir de `fluxos-operacionais-definitivos.md`, as regras **já confirmadas** que a interface da Conciliação precisará respeitar quando for modelada, depois que Contas a Receber for validada. Nada aqui é decisão nova.

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
- forma de **encerrar uma recorrência** (apenas o comportamento esperado está registrado na Seção 23);
- forma de registrar a parte própria e a parte financiada num pagamento de bem (Passo 1, Seção 15);
- regras de **alerta/validação visual** do rateio inconsistente (apenas o princípio está registrado nas Seções 15 e 18).

Esses pontos seguem em aberto no Passo 2.

---

## 32. Histórico deste documento

| Versão | Descrição |
|---|---|
| 1 | Criação. Registra Contas a Pagar como interface funcional validada; Contas a Receber em prototipação; Conciliação apenas como inventário de requisitos do Passo 1. |
