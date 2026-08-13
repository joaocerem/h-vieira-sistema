# VEÍCULO

## 1. Visão geral

**Finalidade**: representar um bem da frota (conceitual, Seção 3).

**Responsabilidade**: ser a dimensão de custo de frota — independente e simultânea à dimensão de Obra — sobre a qual Lançamentos Financeiros, Compras de Cartão e Contratos Financeiros podem ser atribuídos.

**Quem cria**: cadastro manual.

**Quem altera**: cadastro manual.

**Quem consulta**: `LANÇAMENTO_FINANCEIRO`, `COMPRA_CARTÃO`, `CONTRATO_FINANCEIRO` (quando um Consórcio contemplado é vinculado a um Veículo — Seção 10 do conceitual), e o módulo de Frota/relatórios (para calcular custo por Veículo).

**Quem nunca deve alterar**: Financeiro, Conciliação, Cartão, Obras, Balanço, IA — nenhum desses escreve em Veículo. O conceitual (Seção 13) restringe a escrita de Veículo a "só cadastro de VEÍCULO", e trata o módulo Frota explicitamente como leitor, nunca escritor, de `LANÇAMENTO_FINANCEIRO`.

---

## 2. Campos

| Campo | Significado | Tipo conceitual | Obrigatório? | Valor padrão | Pode mudar depois de criado? | Quem pode alterar | Regra de validação | Observações |
|---|---|---|---|---|---|---|---|---|
| `nome/identificação` | Nome ou identificação do Veículo | Texto | Sim | Nenhum | Sim | Cadastro manual | Não vazio | O conceitual usa "nome/identificação" como um único campo composto — não especifica se é placa, apelido, ou outra forma |
| `tipo` | Classificação do Veículo (ex. categoria de máquina) | Lista de valores | Sim (campo principal listado no conceitual) | Nenhum | Sim | Cadastro manual | Não definida — valores possíveis não enumerados no conceitual | — |
| `empresa` | Empresa do grupo à qual o Veículo pertence | Referência para outra entidade (Empresa) | Sim | Nenhum | Não definido se pode ser reatribuído a outra Empresa depois de criado | Cadastro manual | Deve referenciar uma Empresa existente | — |

---

## 3. Relacionamentos

| Relacionamento | Cardinalidade | Significado | Quem controla | Regras | Restrições |
|---|---|---|---|---|---|
| Empresa → Veículo | 1:N | Cada Veículo pertence a exatamente uma Empresa | Cadastro manual | Veículo não existe sem Empresa | — |
| Veículo → Lançamento Financeiro | 1:N | Um Veículo pode ser referenciado por vários Lançamentos, via `veiculo_id` | Usuário, ao registrar o Lançamento | `veiculo_id` pode coexistir com `obra_id` no mesmo Lançamento, sem duplicar o valor (regra 18) | — |
| Veículo → Compra Cartão | 1:N | Um Veículo pode ser referenciado por várias Compras de Cartão | Usuário, ao registrar a Compra | — | — |
| Veículo → Contrato Financeiro | 1:N (opcional) | Um Consórcio contemplado pode ser vinculado a um Veículo | Usuário, ao registrar a contemplação | Só se aplica quando `CONTRATO_FINANCEIRO.tipo` = Consórcio e está contemplado | Antes formalizado só como texto livre nas planilhas antigas; o conceitual (Seção 10) formaliza como relacionamento real |

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

---

## 5. Classificação dos campos

| Categoria | Campos |
|---|---|
| Derivados | Nenhum |
| Calculados | Nenhum — "custo do Veículo" não é campo desta entidade; é resultado de consulta agregada sobre `LANÇAMENTO_FINANCEIRO` filtrada por `veiculo_id`, nunca armazenado |
| Persistidos | `nome/identificação`, `tipo`, `empresa` |
| Imutáveis | Nenhum |
| Auditáveis | `nome/identificação`, `tipo`, `empresa` |

---

## 6. Dependências com outras entidades

Depende de `EMPRESA` (obrigatório). É referenciado opcionalmente por `LANÇAMENTO_FINANCEIRO`, `COMPRA_CARTÃO` e, no caso de Consórcio contemplado, por `CONTRATO_FINANCEIRO`.

---

## 7. Checklist de decisões pendentes

**Esta entidade depende de alguma decisão ainda pendente? Não diretamente**, mas duas observações relacionadas merecem registro:

- A pendência 9 do conceitual ("Alocação de veículo a obra sem despesa ainda") é uma funcionalidade futura que, se implementada, adicionaria um relacionamento novo entre Veículo e Obra que hoje não existe — não modelado aqui por ainda não fazer parte do núcleo.
- Os valores válidos do campo `tipo` não estão enumerados no conceitual — mesma natureza da lacuna já registrada em `OBRA.status` (Seção 7 daquele documento), mas de impacto menor, pois `tipo` de Veículo não aparece hoje amarrado a nenhuma regra de negócio condicional.
