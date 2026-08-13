# CARTÃO_CRÉDITO

## 1. Visão geral

**Finalidade**: cartão de crédito da empresa (conceitual, Seção 3).

**Responsabilidade**: ser a referência que agrupa Compras de Cartão e Faturas, vinculado a uma Conta Bancária, mas como entidade própria — não se confunde com a Conta (coluna "Não representa" do catálogo).

**Quem cria**: cadastro manual.

**Quem altera**: cadastro manual.

**Quem consulta**: `COMPRA_CARTÃO`, `FATURA` (ambos referenciam o Cartão).

**Quem nunca deve alterar**: Financeiro, Conciliação, Obras, Frota, Balanço, IA — nenhum desses escreve na entidade Cartão em si.

---

## 2. Campos

| Campo | Significado | Tipo conceitual | Obrigatório? | Valor padrão | Pode mudar depois de criado? | Quem pode alterar | Regra de validação | Observações |
|---|---|---|---|---|---|---|---|---|
| `conta_bancária` | Conta Bancária à qual o Cartão está vinculado | Referência para outra entidade (Conta Bancária) | Sim | Nenhum | Não definido se pode ser reatribuído depois de criado — inferência: improvável | Cadastro manual | Deve referenciar uma Conta Bancária existente | O Cartão é vinculado a uma Conta, mas é entidade própria |
| `banco` | Instituição emissora | Texto | Sim | Nenhum | Sim (correção de cadastro) | Cadastro manual | Não vazio | — |
| `apelido` | Nome usado internamente para identificar o Cartão | Texto | Sim | Nenhum | Sim | Cadastro manual | Não vazio | — |
| `dia_fechamento` | Dia do mês em que o ciclo de fatura fecha | Número inteiro | Sim | Nenhum | Sim | Cadastro manual | Deve ser um dia válido do mês (1 a 31) — inferência de bom senso, não confirmada textualmente com essa faixa exata | — |
| `dia_vencimento` | Dia do mês em que a fatura vence | Número inteiro | Sim | Nenhum | Sim | Cadastro manual | Mesma observação de `dia_fechamento` | — |

---

## 3. Relacionamentos

| Relacionamento | Cardinalidade | Significado | Quem controla | Regras | Restrições |
|---|---|---|---|---|---|
| Conta Bancária → Cartão de Crédito | 1:N | Uma Conta pode ter vários Cartões vinculados | Cadastro manual | — | — |
| Cartão de Crédito → Compra Cartão | 1:N | Um Cartão tem várias Compras ao longo do tempo | Digitação manual, ou futura importação de fatura | — | — |
| Cartão de Crédito → Fatura | 1:N | Um Cartão gera uma Fatura por ciclo | Sistema calcula o total; usuário confirma o valor cobrado | — | — |

---

## 4. Regras da entidade

- **Campos mutuamente exclusivos**: nenhum identificado.
- **Campos obrigatórios por contexto**: nenhum além da obrigatoriedade geral.
- **Regras de criação**: cadastro manual.
- **Regras de alteração**: alteração manual; toda mudança deve ser auditada.
- **Regras de exclusão**: não definidas no conceitual.
- **Regras de auditoria**: toda alteração de campo deve ser registrada em `LOG_AUDITORIA`.
- **Regras de integridade**: `conta_bancária` deve referenciar uma Conta existente.
- **Regras de negócio**: nenhuma regra de comportamento financeiro específica além do que já rege `COMPRA_CARTÃO` e `FATURA` (ver documentos dessas entidades).

---

## 5. Classificação dos campos

| Categoria | Campos |
|---|---|
| Derivados | Nenhum |
| Calculados | Nenhum |
| Persistidos | `conta_bancária`, `banco`, `apelido`, `dia_fechamento`, `dia_vencimento` |
| Imutáveis | Nenhum confirmado |
| Auditáveis | Todos os campos |

---

## 6. Dependências com outras entidades

Depende de `CONTA_BANCÁRIA` (obrigatório). É referenciado por `COMPRA_CARTÃO` e `FATURA`.

---

## 7. Checklist de decisões pendentes

**Esta entidade depende de alguma decisão ainda pendente? Não.**

Nenhuma das 14 pendências do conceitual, nem decisões das etapas de arquitetura, afeta diretamente esta entidade.
