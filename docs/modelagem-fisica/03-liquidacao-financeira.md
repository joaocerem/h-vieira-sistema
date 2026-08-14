# Modelagem Física — `LIQUIDAÇÃO_FINANCEIRA`
## Fase 3, Etapa 3.3.3

Tabela: `liquidacoes_financeiras`. Categorias de tipo físico referenciam `arquitetura-fisica-banco.md`, Seção 5. Sem SQL.

**Validação prévia**: realizada antes deste documento (ver mensagem anterior). Achado bloqueante único: **D12** (mutabilidade da entidade ainda não decidida) — tratado exclusivamente na Seção "Observações" abaixo, sem propor mecanismo provisório. O restante da tabela não depende de nenhuma pendência aberta.

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

- **Mutabilidade — D12, aberta.** Se uma Liquidação Financeira já registrada pode ser alterada, ou apenas estornada/substituída por uma nova, **não está decidido**. Nenhuma estratégia física de imutabilidade (trigger de bloqueio, revogação de privilégio de `UPDATE`, ou qualquer outra) é escolhida nesta etapa, nem provisoriamente. Nenhuma coluna desta tabela é classificada como imutável por inferência — essa classificação só será feita quando D12 for resolvida. Este item permanece registrado como pendência aberta, a ser incorporado a este documento quando decidido.
- **Transação atômica** (requisito já registrado em `arquitetura-tecnica.md` §5.3, não decisão nova desta etapa): registrar uma Liquidação e suas Aplicações de Liquidação deve ser tudo-ou-nada — implementação de camada de aplicação, sem impacto na estrutura de colunas/constraints desta tabela.
- É o ponto da cadeia central em que a Conta Bancária é escolhida — nunca antes (regra 11 do conceitual); refletido pela obrigatoriedade de `conta_bancaria_id`.

---

*Nenhuma outra entidade foi modelada nesta etapa.*
