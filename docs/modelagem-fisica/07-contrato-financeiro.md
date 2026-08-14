# Modelagem Física — `CONTRATO_FINANCEIRO`
## Fase 3, Etapa 3.3.7

Tabela: `contratos_financeiros`. Categorias de tipo físico referenciam `arquitetura-fisica-banco.md`, Seção 5. Sem SQL.

**Validação prévia**: sem bloqueio (ver mensagem anterior) — entidade sem pendência de domínio associada (`20-contrato-financeiro.md`, Seção 7: "Não — resolvida", Decisão 4).

**Finalidade**: Financiamento ou Consórcio — mesma estrutura, campo `tipo` diferencia (entidade única, Decisão 4).

---

## Colunas

| Coluna | Categoria de tipo | Obrigatória | FK / Observação |
|---|---|---|---|
| `id` | Identificador | Sim | PK |
| `tipo` | Enumerado — fechado (Financiamento / Consórcio) | Sim | Imutável (inferência) |
| `empresa_id` | Identificador (FK) | Sim | → `empresas.id` |
| `conta_bancaria_id` | Identificador (FK) | Sim | → `contas_bancarias.id` |
| `instituicao` | Texto curto | Sim | — |
| `valor_contratado` | Monetário (`NUMERIC`) | Sim | Nunca usado no cálculo de saldo devedor (Decisão 9) |
| `taxa` | Percentual (`NUMERIC`) | Condicional | Só quando `tipo` = Financiamento; conceitualmente inexistente para Consórcio |
| `grupo_cota` | Texto curto | Condicional | Só quando `tipo` = Consórcio |
| `contemplado` | Booleano | Condicional | Só quando `tipo` = Consórcio; nasce `Não` |
| `veiculo_id` | Identificador (FK) | Não | → `veiculos.id` — só válido quando `tipo` = Consórcio e `contemplado` = Sim |

---

## PK
`id` — `pk_contratos_financeiros`

## FKs
- `fk_contratos_financeiros_empresa` (`empresa_id` → `empresas.id`), `ON DELETE RESTRICT`.
- `fk_contratos_financeiros_conta_bancaria` (`conta_bancaria_id` → `contas_bancarias.id`), `ON DELETE RESTRICT`.
- `fk_contratos_financeiros_veiculo` (`veiculo_id` → `veiculos.id`), `ON DELETE RESTRICT`.

## NOT NULL
`id`, `tipo`, `empresa_id`, `conta_bancaria_id`, `instituicao`, `valor_contratado`. `taxa`/`grupo_cota`/`contemplado`/`veiculo_id` nuláveis a nível de coluna — obrigatoriedade condicional resolvida via `CHECK`.

## UNIQUE
Nenhuma — o conceitual não declara cadastro único para Contrato Financeiro.

## CHECK
- `ck_contratos_financeiros_tipo` — `tipo` ∈ {Financiamento, Consórcio}.
- `ck_contratos_financeiros_taxa_grupo_cota_exclusivo` — exatamente um grupo de campos preenchido conforme `tipo`: `tipo`=Financiamento ⇒ `taxa` preenchida, `grupo_cota` e `contemplado` nulos; `tipo`=Consórcio ⇒ `taxa` nula, `grupo_cota` e `contemplado` preenchidos. Regra de negócio já fechada e objetiva (Seção 4, `20-contrato-financeiro.md`), elegível a `CHECK` por `arquitetura-fisica-banco.md` §6.
- `ck_contratos_financeiros_veiculo_apenas_consorcio_contemplado` — `veiculo_id` só pode ser não nulo quando `tipo` = Consórcio e `contemplado` = Sim (regra de integridade explícita, Seção 4).

**Sem `CHECK` de positividade em `valor_contratado`**: o conceitual diz apenas "deve ser um valor monetário válido", sem o qualificador "positivo" usado nos demais campos `valor` da cadeia financeira — nenhum `CHECK` é adicionado, para não inferir além do texto.

## DEFAULT
- `contemplado` = `false` (Não) — aplica-se ao contexto de Consórcio (`tipo`=Consórcio); inferência já registrada no domínio ("um Consórcio nasce não contemplado", `20-contrato-financeiro.md` Seção 2).

## Índices previstos
Um por FK (`empresa_id`, `conta_bancaria_id`, `veiculo_id`) — política padrão, `arquitetura-fisica-banco.md` §8.

## Observações
- **Saldo devedor não é campo desta tabela.** Sempre a soma das Parcelas ainda em aberto vinculadas a este Contrato (via `parcelas.contrato_financeiro_id`) — nunca `valor_contratado` menos pago (Decisão 9). Fora do escopo de `CHECK` (multi-tabela, multi-linha, camada de aplicação — `arquitetura-fisica-banco.md` §6); resolvido por consulta/view, nunca persistido.
- **D6, aberta e não-bloqueante para o schema**: se o `veiculo_id` de um Consórcio contemplado deveria propagar automaticamente para o `LANÇAMENTO_FINANCEIRO` gerado quando uma Parcela vence não está definido. Não afeta a estrutura de colunas desta tabela — é regra de geração de Lançamento na camada de aplicação, a resolver antes do relatório de custo de Frota (Fase 4).
- `tipo` imutável por inferência estrutural — mecanismo exato de bloqueio no schema não escolhido nesta etapa, mesma reserva já usada nas tabelas anteriores.
- Criação do Contrato e do parcelamento completo (Parcelas) deve ser atômica — requisito de camada de aplicação, mesmo padrão já usado para Compra Cartão e Liquidação+Aplicações.
- Cada Parcela deste Contrato, ao vencer, sempre gera um `LANÇAMENTO_FINANCEIRO` (categoria "Amortização Empréstimo"/"Consórcios") — já modelado do lado de `parcelas` (`06-cartao-credito.md`); nenhuma constraint nova necessária aqui.

---

*Nenhuma outra entidade foi modelada nesta etapa.*
