# Modelagem Física — `LIQUIDAÇÃO_FINANCEIRA`
## Fase 3, Etapa 3.3.3

Tabela: `liquidacoes_financeiras`. Categorias de tipo físico referenciam `arquitetura-fisica-banco.md`, Seção 5. Sem SQL.

**Validação prévia**: realizada antes deste documento (ver mensagem anterior). D12 (mutabilidade) resolvida — imutável desde a criação (`decisions.md` decisão #33), tratado na Seção "Observações" abaixo. Nenhuma pendência aberta afeta esta tabela.

---

## Colunas

| Coluna | Categoria de tipo | Obrigatória | FK / Observação |
|---|---|---|---|
| `id` | Identificador | Sim | PK |
| `tipo` | Enumerado — fechado (Pagamento / Recebimento) | Sim | — |
| `data_efetiva` | Data | Sim | — |
| `valor` | Monetário (`NUMERIC`) | Sim | — |
| `conta_bancaria_id` | Identificador (FK) | Sim | → `contas_bancarias.id` |

Nenhuma coluna para Movimentação Bancária, Vínculo Conciliação ou Fatura — esses relacionamentos são mediados pelas FKs das próprias tabelas dessas entidades (`VÍNCULO_CONCILIAÇÃO.liquidacao_financeira_id`; futura `FATURA.liquidacao_financeira_id`), nunca duplicados aqui.

---

## PK
`id` — `pk_liquidacoes_financeiras`

## FKs
- `fk_liquidacoes_financeiras_conta_bancaria` (`conta_bancaria_id` → `contas_bancarias.id`), `ON DELETE RESTRICT` — padrão de `arquitetura-fisica-banco.md` §7.

## NOT NULL
`id`, `tipo`, `data_efetiva`, `valor`, `conta_bancaria_id` — todos obrigatórios, sem exceção condicional.

## UNIQUE
Nenhuma — o conceitual não declara cadastro único para Liquidação Financeira.

## CHECK
- `ck_liquidacoes_financeiras_tipo` — `tipo` ∈ {Pagamento, Recebimento}.
- `ck_liquidacoes_financeiras_valor_positivo` — `valor` > 0.

**Fora do escopo de `CHECK`** (regra multi-tabela, camada de aplicação — `arquitetura-fisica-banco.md` §6): soma de `APLICAÇÃO_DE_LIQUIDAÇÃO.valor_aplicado` vinculada não deveria ultrapassar `valor` (inferência, `10-liquidacao-financeira.md` Seção 2 — nem sequer é regra confirmada, só inferida).

## DEFAULT
Nenhum — nenhum campo desta entidade tem valor padrão documentado.

## Índices previstos
- Índice de FK padrão em `conta_bancaria_id` (`arquitetura-fisica-banco.md` §8).
- Nenhum índice adicional é citado, nas fontes normativas desta etapa, especificamente para esta tabela.

## Observações

- **Imutável após criação — confirmado (D12, `decisions.md` decisão #33).** Nenhum dos quatro campos (`tipo`, `data_efetiva`, `valor`, `conta_bancaria_id`) pode ser alterado depois de registrado, em nenhuma circunstância — consistente com o princípio 5 de modelagem e com o mesmo tratamento já dado a `APLICAÇÃO_DE_LIQUIDAÇÃO` (`04-aplicacao-de-liquidacao.md`). Mecanismo exato de bloqueio no schema (trigger ou revogação de privilégio) não escolhido nesta etapa — mesma reserva já aplicada em `02-lancamento-financeiro.md` e `04-aplicacao-de-liquidacao.md`. A decisão trata exclusivamente da mutabilidade — nenhum mecanismo de correção para erros pós-registro é definido ou pressuposto aqui.
- **Transação atômica** (requisito já registrado em `arquitetura-tecnica.md` §5.3, não decisão nova desta etapa): registrar uma Liquidação e suas Aplicações de Liquidação deve ser tudo-ou-nada — implementação de camada de aplicação, sem impacto na estrutura de colunas/constraints desta tabela.
- É o ponto da cadeia central em que a Conta Bancária é escolhida — nunca antes (regra 11 do conceitual); refletido pela obrigatoriedade de `conta_bancaria_id`.

---

*Nenhuma outra entidade foi modelada nesta etapa.*
