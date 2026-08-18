# VEÍCULO

## 1. Visão geral

**Finalidade**: representar um bem da frota (conceitual, Seção 3).

**Responsabilidade**: ser a dimensão de custo de frota — independente e simultânea à dimensão de Obra — sobre a qual Lançamentos Financeiros, Compras de Cartão e Contratos Financeiros podem ser atribuídos. Também representa, via `obra_atual`, o fato **operacional** de qual Obra o veículo está atualmente alocado — logística, independente da existência de qualquer despesa (D4, `decisions.md` decisão #26).

**Quem cria**: cadastro manual.

**Quem altera**: cadastro manual.

**Quem consulta**: `LANÇAMENTO_FINANCEIRO`, `COMPRA_CARTÃO`, `CONTRATO_FINANCEIRO` (quando um Consórcio contemplado é vinculado a um Veículo — Seção 10 do conceitual), `OBRA` (via `obra_atual`), e o módulo de Frota/relatórios (para calcular custo por Veículo e, futuramente, logística de alocação).

**Quem nunca deve alterar**: Financeiro, Conciliação, Cartão, Obras, Balanço, IA — nenhum desses escreve em Veículo. O conceitual (Seção 13) restringe a escrita de Veículo a "só cadastro de VEÍCULO", e trata o módulo Frota explicitamente como leitor, nunca escritor, de `LANÇAMENTO_FINANCEIRO`.

---

## 2. Campos

| Campo | Significado | Tipo conceitual | Obrigatório? | Valor padrão | Pode mudar depois de criado? | Quem pode alterar | Regra de validação | Observações |
|---|---|---|---|---|---|---|---|---|
| `nome/identificação` | Nome ou identificação do Veículo | Texto | Sim | Nenhum | Sim | Cadastro manual | Não vazio | O conceitual usa "nome/identificação" como um único campo composto — não especifica se é placa, apelido, ou outra forma |
| `tipo` | Classificação do Veículo (categoria de máquina/equipamento) | Lista de valores (Caminhão / Escavadeira / Pá carregadeira / Trator / Rolo compactador / Veículo leve / Terceiro / Outro) | Sim (campo principal listado no conceitual) | Nenhum — sem valor inicial natural confirmado | Sim | Cadastro manual | Um dos oito valores — D10, `decisions.md` decisão #31 | `Terceiro` identifica máquina/veículo locado, separando custo de frota própria de equipamento alugado; `Outro` é categoria residual, sem regra especial de uso |
| `empresa` | Empresa do grupo à qual o Veículo pertence | Referência para outra entidade (Empresa) | Sim | Nenhum | Não definido se pode ser reatribuído a outra Empresa depois de criado | Cadastro manual | Deve referenciar uma Empresa existente | — |
| `obra_atual` | Obra à qual o Veículo está atualmente alocado — fato operacional, independente de despesa | Referência para outra entidade (Obra), nullável | Não (nulo = sem alocação corrente) | Nenhum (vazio) | Sim, a qualquer momento, sem limite de trocas | Usuário (cadastro/gestão manual) | Quando preenchido, deve referenciar uma Obra existente | Independente da dimensão financeira (`LANÇAMENTO_FINANCEIRO.veiculo_id`/`obra_id`, regra 18). Histórico de mudanças disponível via `LOG_AUDITORIA` — nenhuma entidade de histórico dedicada (D4, `decisions.md` decisão #26) |

---

## 3. Relacionamentos

| Relacionamento | Cardinalidade | Significado | Quem controla | Regras | Restrições |
|---|---|---|---|---|---|
| Empresa → Veículo | 1:N | Cada Veículo pertence a exatamente uma Empresa | Cadastro manual | Veículo não existe sem Empresa | — |
| Veículo → Lançamento Financeiro | 1:N | Um Veículo pode ser referenciado por vários Lançamentos, via `veiculo_id` | Usuário, ao registrar o Lançamento | `veiculo_id` pode coexistir com `obra_id` no mesmo Lançamento, sem duplicar o valor (regra 18) | — |
| Veículo → Compra Cartão | 1:N | Um Veículo pode ser referenciado por várias Compras de Cartão | Usuário, ao registrar a Compra | — | — |
| Veículo → Contrato Financeiro | 1:N (opcional) | Um Consórcio contemplado pode ser vinculado a um Veículo | Usuário, ao registrar a contemplação | Só se aplica quando `CONTRATO_FINANCEIRO.tipo` = Consórcio e está contemplado | Antes formalizado só como texto livre nas planilhas antigas; o conceitual (Seção 10) formaliza como relacionamento real |
| Veículo → Obra (alocação atual) | N:1 (opcional) | Um Veículo está, no máximo, alocado a uma Obra por vez (`obra_atual`) — fato operacional de onde está trabalhando | Usuário, manual | Inteiramente independente da dimensão financeira Veículo/Obra em Lançamento (regra 18) — não gera nem depende de nenhum Lançamento | Nulo = veículo sem alocação corrente. Uma Obra pode ter vários Veículos alocados simultaneamente (D4, `decisions.md` decisão #26) |

---

## 4. Regras da entidade

- **Campos mutuamente exclusivos**: não aplicável dentro da própria entidade.
- **Campos obrigatórios por contexto**: não aplicável.
- **Regras de criação**: cadastro manual.
- **Regras de alteração**: alteração manual; toda mudança deve ser auditada.
- **Regras de exclusão**: não definidas no conceitual.
- **Regras de auditoria**: toda alteração de campo deve ser registrada em `LOG_AUDITORIA`.
- **Regras de integridade**: `LANÇAMENTO_FINANCEIRO.veiculo_id`, `COMPRA_CARTÃO.veiculo_id` e `CONTRATO_FINANCEIRO` (quando vinculado), ao referenciarem um Veículo, devem apontar para um registro existente.
- **Regras de negócio**:
  - Veículo é uma dimensão independente de Obra — os dois podem coexistir no mesmo Lançamento sem duplicação de valor (regra 18; Seção 8 do conceitual).
  - Uma despesa de frota é o mesmo `LANÇAMENTO_FINANCEIRO` de qualquer outra, apenas com `veiculo_id` identificado (regra 17) — não existe uma entidade "Despesa de Frota" separada.
  - Custo de máquina por hora é funcionalidade futura, fora do núcleo (regra 19) — não modelada aqui.
  - `obra_atual` representa alocação operacional corrente, sem relação com a dimensão financeira acima — um Veículo pode estar alocado a uma Obra via `obra_atual` e, no mesmo período, ter Lançamentos com `obra_id` diferente ou nenhum (D4, `decisions.md` decisão #26).

---

## 5. Classificação dos campos

| Categoria | Campos |
|---|---|
| Derivados | Nenhum |
| Calculados | Nenhum — "custo do Veículo" não é campo desta entidade; é resultado de consulta agregada sobre `LANÇAMENTO_FINANCEIRO` filtrada por `veiculo_id`, nunca armazenado |
| Persistidos | `nome/identificação`, `tipo`, `empresa`, `obra_atual` |
| Imutáveis | Nenhum |
| Auditáveis | `nome/identificação`, `tipo`, `empresa`, `obra_atual` |

---

## 6. Dependências com outras entidades

Depende de `EMPRESA` (obrigatório) e, opcionalmente, de `OBRA` (alocação atual — D4, `decisions.md` decisão #26). É referenciado opcionalmente por `LANÇAMENTO_FINANCEIRO`, `COMPRA_CARTÃO` e, no caso de Consórcio contemplado, por `CONTRATO_FINANCEIRO`.

---

## 7. Checklist de decisões pendentes

**Esta entidade depende de alguma decisão ainda pendente? Não — ambas resolvidas.**

- ~~Pendência 9 do conceitual ("Alocação de veículo a obra sem despesa ainda")~~ — **Resolvida (D4).** Necessidade de negócio confirmada (logística diária, base para funcionalidades futuras). `obra_atual` (FK opcional para Obra) adicionado — ver Seção 2 e Seção 3. `decisions.md`, decisão #26.
- ~~Os valores válidos do campo `tipo` não estavam enumerados no conceitual~~ — **Resolvida (D10).** Oito valores confirmados: Caminhão / Escavadeira / Pá carregadeira / Trator / Rolo compactador / Veículo leve / Terceiro / Outro — ver Seção 2; `decisions.md`, decisão #31.
