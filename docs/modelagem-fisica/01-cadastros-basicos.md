# Modelagem Física — Módulo Cadastros Básicos
## Fase 3, Etapa 3.3

Aplica as convenções de `arquitetura-fisica-banco.md` às 5 entidades deste módulo: `EMPRESA`, `USUÁRIO`, `CLIENTE`, `FORNECEDOR`, `CATEGORIA`. Sem SQL. Categorias de tipo físico referenciam `arquitetura-fisica-banco.md`, Seção 5.

---

## `empresas` (EMPRESA)

| Coluna | Categoria de tipo | Obrigatória | Observação |
|---|---|---|---|
| `id` | Identificador | Sim | PK |
| `nome` | Texto curto | Sim | — |

- **PK**: `id` — `pk_empresas`
- **FK**: nenhuma (entidade raiz)
- **Constraints previstas**: `NOT NULL` em `nome`. Sem `UNIQUE` — o conceitual não define unicidade de nome entre Empresas.
- **Índices previstos**: nenhum além do implícito da PK — sem candidato de filtro/agregação frequente identificado.
- **Observações**: nenhuma coluna de saldo (correto — saldo não pertence a Empresa em nenhum nível). Coluna `tipo` removida (D1, `decisions.md`, decisão #23) — sem uso funcional identificado em nenhum ponto do projeto.

---

## `usuarios` (USUÁRIO)

| Coluna | Categoria de tipo | Obrigatória | Observação |
|---|---|---|---|
| `id` | Identificador | Sim | PK |
| `nome` | Texto curto | Sim | — |
| `identificador_de_acesso` | Texto curto | Sim | Unicidade **não** aplicada — inferência razoável, mas não confirmada pelo conceitual (`02-usuario.md`) |
| `situacao_de_acesso` | Enumerado/lista fechada | Não confirmado | Campo incluído por inferência estrutural mínima; não confirmado pelo conceitual |

- **PK**: `id` — `pk_usuarios`
- **FK**: nenhuma
- **Constraints previstas**: `NOT NULL` em `nome`, `identificador_de_acesso`. Sem `UNIQUE` em `identificador_de_acesso` (não confirmado — ver acima). Sem `CHECK`/`NOT NULL` em `situacao_de_acesso` — obrigatoriedade e valores não definidos.
- **Índices previstos**: nenhum previsto nesta etapa.
- **Observações**: deliberadamente sem senha, papel/perfil, escopo por Empresa ou nível de confirmação de IA (pendência A2/5, `02-usuario.md`) — tabela sujeita a revisão estrutural completa quando essa pendência for resolvida, não só a complemento.

---

## `clientes` (CLIENTE)

| Coluna | Categoria de tipo | Obrigatória | Observação |
|---|---|---|---|
| `id` | Identificador | Sim | PK |
| `nome` | Texto curto | Sim | Cadastro único (conceitual) |

- **PK**: `id` — `pk_clientes`
- **FK**: nenhuma
- **Constraints previstas**: `NOT NULL` em `nome`; `UNIQUE` em `nome` — `uq_clientes_nome` (conceitual declara explicitamente "cadastro único", já previsto em `arquitetura-fisica-banco.md` §6).
- **Índices previstos**: nenhum adicional — a `UNIQUE` já gera índice implícito, suficiente para busca por nome.
- **Observações**: nenhuma pendência associada (`04-cliente.md`, Seção 7).

---

## `fornecedores` (FORNECEDOR)

| Coluna | Categoria de tipo | Obrigatória | Observação |
|---|---|---|---|
| `id` | Identificador | Sim | PK |
| `nome` | Texto curto | Sim | Cadastro único (conceitual) |

- **PK**: `id` — `pk_fornecedores`
- **FK**: nenhuma
- **Constraints previstas**: `NOT NULL` em `nome`; `UNIQUE` em `nome` — `uq_fornecedores_nome` (mesma base do Cliente).
- **Índices previstos**: nenhum adicional — mesma razão do Cliente.
- **Observações**: nenhuma pendência associada (`05-fornecedor.md`, Seção 7).

---

## `categorias` (CATEGORIA)

| Coluna | Categoria de tipo | Obrigatória | Observação |
|---|---|---|---|
| `id` | Identificador | Sim | PK |
| `nome` | Texto curto | Sim | — |
| `tipo` | Enumerado/lista fechada | Sim | Valores não enumerados no conceitual |

- **PK**: `id` — `pk_categorias`
- **FK**: nenhuma
- **Constraints previstas**: `NOT NULL` em `nome`, `tipo`. Sem `UNIQUE` em `nome` — diferente de Cliente/Fornecedor, o conceitual não declara "cadastro único" para Categoria. Sem `CHECK` de `tipo` — valores não fechados.
- **Índices previstos**: nenhum além do implícito da PK.
- **Observações**: pendência 4 do conceitual (sub-conta interna) já **resolvida** (Decisão 5) — sem impacto físico adicional. Os valores de `tipo` em si permanecem sem enumeração fechada no conceitual (mesma natureza de lacuna do `tipo` de Empresa), sem CHECK previsto até essa definição existir.

---

*Nenhuma FK cruza as 5 tabelas deste módulo entre si — todas são cadastros-raiz. Serão referenciadas (nunca o inverso) pelos módulos seguintes (`empresas` por Conta Bancária/Veículo/Contrato Financeiro; `clientes` por Obra; `fornecedores`/`categorias` por Lançamento Financeiro/Compra Cartão; `usuarios` por Log Auditoria/Sugestão IA/Ação Proposta IA/Ajuste Financeiro).*
