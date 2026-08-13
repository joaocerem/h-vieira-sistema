# CATEGORIA

## 1. Visão geral

**Finalidade**: representar a natureza do gasto/receita (ex.: Combustível, Manutenção) — conceitual, Seção 3.

**Responsabilidade**: fornecer a dimensão de classificação da natureza econômica de um Lançamento Financeiro ou Compra de Cartão. **É uma dimensão independente de `classificação`** (a dimensão que diz se o dinheiro é Terraplanagem, Fora da Operação, Transferência Interna, Retirada do Patrão ou Não Classificada, vivendo em `MOVIMENTAÇÃO_BANCÁRIA`/`COMPRA_CARTÃO`) — as duas nunca devem ser confundidas ou inferidas uma da outra (regra 29 do conceitual).

**Quem cria**: cadastro manual.

**Quem altera**: cadastro manual.

**Quem consulta**: `LANÇAMENTO_FINANCEIRO`, `COMPRA_CARTÃO` (ambos referenciam uma Categoria).

**Quem nunca deve alterar**: Conciliação, Obras, Frota, Balanço — não escrevem em Categoria. A **IA pode sugerir** uma Categoria para um Lançamento ou Movimentação (via `SUGESTÃO_IA`), mas nunca cria ou altera o cadastro da própria entidade Categoria, e nunca infere `classificação` a partir de `categoria` ou vice-versa (regra 29).

---

## 2. Campos

| Campo | Significado | Tipo conceitual | Obrigatório? | Valor padrão | Pode mudar depois de criado? | Quem pode alterar | Regra de validação | Observações |
|---|---|---|---|---|---|---|---|---|
| `nome` | Nome da categoria (ex.: "Combustível", "Manutenção") | Texto | Sim | Nenhum | Sim (correção de cadastro) | Cadastro manual | Não vazio | — |
| `tipo` | Contexto de aplicação da categoria | Lista de valores | Sim (campo principal listado no conceitual) | Nenhum | Indefinido | Cadastro manual | Não definida | Os valores possíveis não são enumerados explicitamente no conceitual. A finalidade textual ("natureza do gasto/receita") sugere que `tipo` possa distinguir categorias aplicáveis a Despesa vs. Receita — **isso é inferência, não confirmação textual literal** |

---

## 3. Relacionamentos

| Relacionamento | Cardinalidade | Significado | Quem controla | Regras | Restrições |
|---|---|---|---|---|---|
| Categoria → Lançamento Financeiro | 1:N | Uma Categoria pode ser usada por vários Lançamentos | Usuário, ao registrar o Lançamento (ou IA, via `SUGESTÃO_IA` confirmada) | — | — |
| Categoria → Compra Cartão | 1:N | Uma Categoria pode ser usada por várias Compras de Cartão | Usuário, ao registrar a Compra | — | — |

---

## 4. Regras da entidade

- **Campos mutuamente exclusivos**: não aplicável dentro da própria entidade — mas `categoria` e `classificação` são dimensões mutuamente independentes em qualquer entidade que as possua simultaneamente (regra 29), o que é a regra mais importante ligada a esta entidade.
- **Campos obrigatórios por contexto**: não aplicável.
- **Regras de criação**: cadastro manual.
- **Regras de alteração**: alteração manual; toda mudança deve ser auditada.
- **Regras de exclusão**: não definidas no conceitual.
- **Regras de auditoria**: toda alteração de campo deve ser registrada em `LOG_AUDITORIA`.
- **Regras de integridade**: `LANÇAMENTO_FINANCEIRO.categoria_id` e `COMPRA_CARTÃO.categoria_id` devem referenciar uma Categoria existente.
- **Regras de negócio**:
  - Regra 29 do conceitual: a IA nunca funde `categoria` e `classificação` numa única suposição — se ambas as mudanças forem necessárias, são duas sugestões distintas (podem ser agrupadas só visualmente via `grupo_sugestão_id` de `SUGESTÃO_IA`).
  - Não há detalhamento de subtipos dentro de Categoria (diferente de `classificação`, cuja regra 4 do conceitual explicitamente nega subtipos de "fora da operação") — decisão definitiva, não apenas ausência temporária (ver Seção 7).

---

## 5. Classificação dos campos

| Categoria | Campos |
|---|---|
| Derivados | Nenhum |
| Calculados | Nenhum |
| Persistidos | `nome`, `tipo` |
| Imutáveis | Nenhum |
| Auditáveis | `nome`, `tipo` |

---

## 6. Dependências com outras entidades

`LANÇAMENTO_FINANCEIRO` e `COMPRA_CARTÃO` dependem de `CATEGORIA` (ambos a referenciam, presumivelmente como campo obrigatório, já que consta como "campo principal" nas duas entidades no catálogo do conceitual).

---

## 7. Checklist de decisões pendentes

**Esta entidade depende de alguma decisão ainda pendente? Não — resolvida.**

A pendência 4 do conceitual ("Separar Categoria em 'natureza do gasto' × 'sub-conta interna'") foi decidida: `CATEGORIA` **permanece exatamente como está**, com `nome` e `tipo`, sem qualquer dimensão adicional de "sub-conta interna". Os motivos registrados na decisão: não existe, hoje, nenhuma definição de negócio para o que seria uma "sub-conta interna"; não existe nenhuma regra, relatório, consulta ou comportamento do sistema que dependa dessa separação; e criar estrutura para um conceito ainda indefinido violaria o princípio de que o modelo conceitual só representa conceitos com significado de negócio claramente definido (`principios-de-modelagem.md`, princípio 2). Se no futuro surgir uma necessidade concreta (ex. integração com plano de contas contábil), essa evolução deve ser tratada como uma nova decisão de modelagem, não como continuação desta pendência.

**Consequência sobre a classificação de proporcionalidade da entidade**: `arbitragem-tecnica-final.md` (Divergência 1) havia mantido `CATEGORIA` deliberadamente no perfil "núcleo com invariante" (não simplificável) justamente por causa desta pendência estar em aberto. Com ela agora resolvida como "sem mudança", essa justificativa deixa de se aplicar — `CATEGORIA` passa a ser, na prática, uma candidata legítima ao perfil "cadastro simples", junto com Empresa/Cliente/Fornecedor. Este documento não decide essa reclassificação por si só (é uma decisão de arquitetura técnica, não de modelo de dados) — só registra a consequência.
