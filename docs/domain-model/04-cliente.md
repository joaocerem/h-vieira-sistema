# CLIENTE

## 1. Visão geral

**Finalidade**: cadastro único de cada cliente da terraplanagem (conceitual, Seção 3).

**Responsabilidade**: identificar, de forma não duplicada, cada pessoa/empresa para quem a H Vieira (ou outra unidade do grupo) executa Obras.

**Quem cria**: cadastro manual — o conceitual admite explicitamente que o cadastro possa nascer "ao digitar pela 1ª vez" (mesmo padrão descrito para Fornecedor), ou seja, pode ser criado no fluxo de cadastro de uma Obra, não só por uma tela de cadastro dedicada.

**Quem altera**: cadastro manual.

**Quem consulta**: `OBRA` (toda Obra referencia um Cliente).

**Quem nunca deve alterar**: Financeiro, Conciliação, Cartão, Obras (além do próprio cadastro), Frota, Balanço, IA — nenhum desses escreve em Cliente segundo a tabela de responsabilidades do conceitual (Seção 13); só cadastro manual altera.

---

## 2. Campos

| Campo | Significado | Tipo conceitual | Obrigatório? | Valor padrão | Pode mudar depois de criado? | Quem pode alterar | Regra de validação | Observações |
|---|---|---|---|---|---|---|---|---|
| `nome` | Nome do cliente | Texto | Sim | Nenhum | Sim (correção de cadastro) | Cadastro manual | Não vazio; **cadastro único** — o próprio conceitual descreve a finalidade da entidade como "cadastro único de cada cliente", o que implica não duplicar o mesmo cliente em dois registros | É o único campo principal listado no conceitual para esta entidade |

---

## 3. Relacionamentos

| Relacionamento | Cardinalidade | Significado | Quem controla | Regras | Restrições |
|---|---|---|---|---|---|
| Cliente → Obra | 1:N | Um Cliente pode ter várias Obras ao longo do tempo; cada Obra pertence a exatamente um Cliente | Cadastro manual da Obra | Obra não existe sem Cliente | — |

---

## 4. Regras da entidade

- **Campos mutuamente exclusivos**: não aplicável (entidade de campo único).
- **Campos obrigatórios por contexto**: não aplicável.
- **Regras de criação**: cadastro manual; pode nascer no ato de cadastrar uma Obra, se o Cliente ainda não existir (mesmo padrão do Fornecedor, por analogia textual do conceitual).
- **Regras de alteração**: alteração manual; toda mudança de `nome` deve ser auditada.
- **Regras de exclusão**: não definidas no conceitual. Um Cliente com Obras vinculadas não deveria, presumivelmente, ser excluído sem tratamento das Obras associadas — observação, não regra confirmada.
- **Regras de auditoria**: toda alteração de `nome` deve ser registrada em `LOG_AUDITORIA`.
- **Regras de integridade**: `OBRA.cliente` deve sempre referenciar um Cliente existente.
- **Regras de negócio**: Cliente é conceitualmente distinto de Fornecedor mesmo que, na prática, a mesma pessoa/empresa possa ocupar os dois papéis em contextos diferentes — o conceitual não define regra de unificação entre os dois cadastros (o cenário R da Matriz de Validação trata de fornecedor em múltiplos contextos de despesa, não de uma pessoa ser Cliente e Fornecedor ao mesmo tempo — este último caso não é abordado).

---

## 5. Classificação dos campos

| Categoria | Campos |
|---|---|
| Derivados | Nenhum |
| Calculados | Nenhum |
| Persistidos | `nome` |
| Imutáveis | Nenhum |
| Auditáveis | `nome` |

---

## 6. Dependências com outras entidades

`OBRA` depende de `CLIENTE` (toda Obra tem exatamente um Cliente).

---

## 7. Checklist de decisões pendentes

**Esta entidade depende de alguma decisão ainda pendente? Não.**

Nenhuma das 14 pendências do conceitual, nem nenhuma decisão registrada na arquitetura técnica, na auditoria ou na arbitragem, afeta diretamente a entidade Cliente. É uma das entidades mais simples e mais estáveis do modelo.
