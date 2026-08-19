# Modelagem Física — `CONTRATO_FINANCEIRO`
## Fase 3, Etapa 3.3.7

Tabela: `contratos_financeiros`. Categorias de tipo físico referenciam `arquitetura-fisica-banco.md`, Seção 5. Sem SQL.

**Validação prévia**: sem bloqueio (ver mensagem anterior) — entidade sem pendência de domínio associada (`20-contrato-financeiro.md`, Seção 7: "Não — resolvida", Decisão 4).

**Finalidade**: Financiamento ou Consórcio — mesma estrutura, campo `tipo` diferencia (entidade única, Decisão 4).

**[Nota de atualização posterior — Fase 4, decisão #40]** Duas lacunas encontradas na implementação do backend (nenhum campo permitia calcular as Parcelas automaticamente; `instituicao` era texto livre, sem vínculo com `FORNECEDOR`) foram resolvidas por resposta de negócio: `instituicao` **removida**, substituída por `fornecedor_id` (FK, `NOT NULL`, → `fornecedores.id`); colunas `numero_parcelas` (`NOT NULL`) e `data_vencimento_primeira_parcela` (`NOT NULL`) **adicionadas**. Aplicado via migration Flyway `V14` — tabela sem registros no momento da alteração. As seções abaixo preservam o texto original da Fase 3 (histórico) com anotações pontuais marcando o que mudou; ver `decisions.md`, decisão #40, para a decisão completa.

---

## Colunas

| Coluna | Categoria de tipo | Obrigatória | FK / Observação |
|---|---|---|---|
| `id` | Identificador | Sim | PK |
| `tipo` | Enumerado — fechado (Financiamento / Consórcio) | Sim | Imutável (inferência) |
| `empresa_id` | Identificador (FK) | Sim | → `empresas.id` |
| `conta_bancaria_id` | Identificador (FK) | Sim | → `contas_bancarias.id` |
| ~~`instituicao`~~ | ~~Texto curto~~ | ~~Sim~~ | **[removida — decisão #40]** substituída por `fornecedor_id` abaixo |
| `fornecedor_id` | Identificador (FK) | Sim | **[nova — decisão #40]** → `fornecedores.id` |
| `valor_contratado` | Monetário (`NUMERIC`) | Sim | Nunca usado no cálculo de saldo devedor (Decisão 9). **[decisão #40]** também base da divisão entre Parcelas |
| `numero_parcelas` | Numérico inteiro | Sim | **[nova — decisão #40]** determina quantas Parcelas são geradas |
| `data_vencimento_primeira_parcela` | Data | Sim | **[nova — decisão #40]** vencimento da 1ª Parcela; seguintes mensalmente, mesmo dia |
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
- **[nova — decisão #40]** `fk_contratos_financeiros_fornecedor` (`fornecedor_id` → `fornecedores.id`), `ON DELETE RESTRICT`.

## NOT NULL
`id`, `tipo`, `empresa_id`, `conta_bancaria_id`, `fornecedor_id` (**decisão #40**, substitui `instituicao`), `valor_contratado`, `numero_parcelas` (**decisão #40**), `data_vencimento_primeira_parcela` (**decisão #40**). `taxa`/`grupo_cota`/`contemplado`/`veiculo_id` nuláveis a nível de coluna — obrigatoriedade condicional resolvida via `CHECK`.

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
Um por FK (`empresa_id`, `conta_bancaria_id`, `veiculo_id`, `fornecedor_id` — **decisão #40**) — política padrão, `arquitetura-fisica-banco.md` §8.

## Observações
- **Saldo devedor não é campo desta tabela.** Sempre a soma das Parcelas ainda em aberto vinculadas a este Contrato (via `parcelas.contrato_financeiro_id`) — nunca `valor_contratado` menos pago (Decisão 9). Fora do escopo de `CHECK` (multi-tabela, multi-linha, camada de aplicação — `arquitetura-fisica-banco.md` §6); resolvido por consulta/view, nunca persistido.
- **D6, resolvida (`decisions.md`, decisão #28).** `veiculo_id` de um Consórcio contemplado propaga automaticamente para o `LANÇAMENTO_FINANCEIRO` gerado, só para Parcelas que vencem após a contemplação — sem propagação retroativa para Lançamentos já gerados. Não afeta a estrutura de colunas desta tabela — regra de geração de Lançamento na camada de aplicação.
- `tipo` imutável por inferência estrutural — mecanismo exato de bloqueio no schema não escolhido nesta etapa, mesma reserva já usada nas tabelas anteriores.
- Criação do Contrato e do parcelamento completo (Parcelas) deve ser atômica — requisito de camada de aplicação, mesmo padrão já usado para Compra Cartão e Liquidação+Aplicações.
- Cada Parcela deste Contrato, ao vencer, sempre gera um `LANÇAMENTO_FINANCEIRO` (categoria "Amortização Empréstimo"/"Consórcios") — já modelado do lado de `parcelas` (`06-cartao-credito.md`); nenhuma constraint nova necessária aqui.

---

*Nenhuma outra entidade foi modelada nesta etapa.*
