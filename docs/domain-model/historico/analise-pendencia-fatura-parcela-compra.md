# Análise da Pendência Bloqueante nº 1 — Relação FATURA ↔ PARCELA ↔ COMPRA_CARTÃO
## Sistema Financeiro/Gerencial H Vieira Terraplanagem

**Origem**: pendência bloqueante nº 1 de `revisao-integridade-dominio.md`, Seção 2 e Seção 11.

**Escopo desta análise**: só esta pendência. Nada de banco de dados, SQL, ou implementação. Nenhum documento existente foi alterado. Nenhuma decisão foi tomada — só análise e recomendação, aguardando aprovação.

---

## 1. RECONSTRUÇÃO DO CICLO DE VIDA COMPLETO

Antes de comparar alternativas, é preciso entender o processo de negócio real por trás dessas três entidades — não só os nomes dos campos.

### Passo a passo, do zero

1. **A Compra acontece** (`COMPRA_CARTÃO` nasce). Ex.: dia 15/03, compra de R$1.200 em 3 parcelas.
2. **O parcelamento é calculado imediatamente**, no mesmo momento — não uma parcela de cada vez ao longo do tempo. `PARCELA` nº 1/3, 2/3 e 3/3 nascem todas no dia 15/03, cada uma já com seu `vencimento` futuro definido (ex.: 10/04, 10/05, 10/06, se o cartão vence todo dia 10).
3. **O Cartão fecha um ciclo periodicamente** (`dia_fechamento`), independente de quaisquer compras específicas. Esse fechamento é um evento próprio, recorrente, do Cartão — não de uma Compra.
4. **No fechamento de um ciclo, nasce uma `FATURA`** para aquele ciclo. Essa Fatura precisa reunir **todas as Parcelas cujo vencimento cai dentro daquele ciclo** — não as Compras inteiras. Uma Compra parcelada em 3x contribui com **uma parcela para cada uma de três Faturas diferentes**, em três meses diferentes.
5. **O sistema soma essas Parcelas** e produz `valor_total_calculado`.
6. **O usuário confirma o valor efetivamente cobrado** (`valor_cobrado`), que deveria bater com o calculado (mas pode divergir por razões externas — juros, encargos, atraso de importação).
7. **A Fatura é paga**: nasce uma `LIQUIDAÇÃO_FINANCEIRA` pelo `valor_cobrado`, que aplica (via `APLICAÇÃO_DE_LIQUIDAÇÃO`) só aos `LANÇAMENTO_FINANCEIRO` nascidos das Parcelas Terraplanagem daquele ciclo específico.
8. **Nenhuma dessas entidades é excluída depois** — Compra, Parcela e Fatura permanecem como histórico permanente, mesmo depois de pagas.

### Achado central desta reconstrução

**Uma Compra parcelada não pertence a uma única Fatura — ela se distribui por várias Faturas ao longo do tempo, uma parcela de cada vez.** Isso significa que **`COMPRA_CARTÃO` não deveria ter, em hipótese nenhuma, uma relação direta e única com `FATURA`** — essa relação só "parece" fazer sentido 1:1 para compras à vista (nº parcelas = 1), e está estruturalmente errada para qualquer compra parcelada em mais de uma vez, que é um caso real e explicitamente previsto pelo próprio campo `nº parcelas` do modelo.

Isso já é, por si, uma correção relevante em relação ao que eu havia registrado anteriormente: o documento `18-compra-cartao.md` (produzido antes desta análise) descreve "Compra Cartão → Fatura, N:1, direto" — essa descrição está **estruturalmente incorreta** para qualquer compra com mais de uma parcela. É uma inconsistência real com o próprio ciclo de vida do negócio, mais grave do que a simples "falta de padronização entre três documentos" registrada na revisão de integridade — é um erro conceitual de cardinalidade, não só de redação.

O diagrama original do conceitual (Seção 4, "Cadeia de cartão") já apontava na direção certa: `FATURA ──1:N──> (Parcelas do ciclo...)` — a Fatura se relaciona com **Parcelas**, não com Compras inteiras. Minha modelagem anterior se afastou dessa leitura ao introduzir uma relação direta Compra→Fatura.

---

## 2. QUEM POSSUI QUEM, E QUEM SÓ REFERENCIA

| Relação | Natureza |
|---|---|
| `CARTÃO_CRÉDITO` possui `COMPRA_CARTÃO` | Posse real — uma Compra nunca existe sem um Cartão, e nunca migra de Cartão |
| `COMPRA_CARTÃO` possui `PARCELA` | Posse real — as Parcelas de uma Compra nascem todas juntas, calculadas de uma vez a partir dela, e não têm sentido de negócio isolado |
| `CARTÃO_CRÉDITO` possui `FATURA` | Posse real — uma Fatura é sempre de um Cartão específico, um ciclo por vez |
| `FATURA` **agrupa** `PARCELA` (de várias Compras, possivelmente) | **Não é posse** — é agregação de leitura sobre um recorte temporal (o ciclo). A Fatura não "cria" as Parcelas, nem as Parcelas "pertencem" à Fatura da mesma forma que pertencem à Compra. A Fatura reúne Parcelas que já existiam antes dela, por outro motivo (a Compra) |
| `COMPRA_CARTÃO` ↔ `FATURA` | **Não deveria existir como relação direta** — é sempre transitiva, através de cada Parcela individual |

A distinção entre "possuir" e "agrupar" é o cerne desta análise: `COMPRA_CARTÃO` **possui** `PARCELA` (relação de composição, forte, permanente, definida no nascimento). `FATURA` **agrupa** `PARCELA` (relação de associação temporal, definida não no nascimento da Parcela, mas no momento em que o ciclo correspondente fecha).

---

## 3. RELACIONAMENTOS PERMANENTES VS. DERIVADOS

- **Permanente desde o nascimento**: `PARCELA.origem` (Compra Cartão ou Contrato Financeiro) — a Parcela nunca muda de "dono".
- **Permanente, mas definido num segundo momento (não no nascimento)**: a associação Parcela↔Fatura. A Parcela nasce no momento da Compra, com `vencimento` já definido — mas ela só passa a "pertencer" a uma Fatura específica quando o ciclo correspondente fecha, dias ou semanas depois.
- **Potencialmente derivável, mas com um risco real** (ver Seção 5): calcular "a que Fatura esta Parcela pertence" puramente a partir de `vencimento` + calendário do Cartão, sem nenhum registro do momento em que o ciclo realmente fechou, corre o risco de recalcular esse vínculo de forma diferente do que realmente aconteceu, se uma Compra for lançada tardiamente com data retroativa a um ciclo já fechado.

---

## 4. INFORMAÇÃO QUE PERTENCE A CADA ENTIDADE

| Entidade | O que só ela sabe |
|---|---|
| `COMPRA_CARTÃO` | Fornecedor, valor total da compra, data da compra, categoria, classificação, obra, veículo, quantidade de parcelas — a camada de decisão ("quem, o quê, por quê") |
| `PARCELA` | Qual fração específica, valor exato desta fração, vencimento próprio, status — a camada de cronograma de pagamento |
| `FATURA` | Qual Cartão, qual ciclo, total calculado do ciclo, total efetivamente cobrado — a camada de cobrança periódica |

Nenhuma dessas três deveria duplicar o que é responsabilidade da outra — e, verificando os três documentos já produzidos, nenhuma duplica hoje (a Fatura não guarda fornecedor/categoria/obra de cada compra, por exemplo). O único ponto realmente problemático é o **relacionamento** entre elas, não os campos de cada uma isoladamente.

---

## 5. DUPLICAÇÃO, DEPENDÊNCIA DESNECESSÁRIA, REDUNDÂNCIA, INCONSISTÊNCIA — busca explícita

- **Duplicação de informação**: nenhuma encontrada nos campos das três entidades em si. O risco de duplicação está no **relacionamento**, não no dado: se tanto `COMPRA_CARTÃO` quanto `PARCELA` guardassem, cada uma à sua maneira, uma referência à Fatura, isso seria duas fontes armazenando o mesmo fato (ver Alternativa C, Seção 7).
- **Dependência desnecessária**: a relação direta `COMPRA_CARTÃO → FATURA` (como eu havia modelado antes desta análise) é uma dependência desnecessária **e incorreta** — desnecessária porque é sempre alcançável transitivamente via Parcela; incorreta porque simplesmente não vale para compras parceladas.
- **Relacionamento redundante**: nenhum encontrado além do já citado.
- **Inconsistência com o conceitual original**: confirmada — o diagrama da Seção 4 do conceitual já desenhava `FATURA → Parcelas do ciclo`, e minha modelagem anterior (Compra→Fatura direto) se desviou disso.

---

## 6. NASCIMENTO E FIM DE CADA ENTIDADE

| Entidade | Nasce quando | Deixa de existir quando |
|---|---|---|
| `COMPRA_CARTÃO` | Digitação/importação da compra | Nunca (histórico permanente) |
| `PARCELA` | No mesmo momento da Compra (ou do Contrato Financeiro) — todas as N parcelas de uma vez | Nunca (histórico permanente, mesmo depois de gerar seu Lançamento) |
| `FATURA` | No fechamento periódico do ciclo do Cartão (`dia_fechamento`) — evento do Cartão, não de uma Compra específica | Nunca (histórico permanente, mesmo depois de paga) |

O ponto mais importante aqui: **`PARCELA` nasce antes de `FATURA`, sempre** (uma parcela com vencimento em maio já existe desde o dia da compra, mesmo que a Fatura de maio só "nasça" quando o ciclo de maio fechar). Isso implica que a associação Parcela→Fatura **não pode ser um campo preenchido no nascimento da Parcela** (a Fatura correspondente ainda nem existe nesse momento) — ela só pode ser preenchida depois, no momento em que a Fatura nasce e "reivindica" as Parcelas do seu ciclo.

---

## 7. ALTERNATIVAS DE MODELAGEM CONCEITUAL

### Alternativa A — Vínculo Parcela → Fatura armazenado explicitamente, atribuído no fechamento do ciclo; Compra Cartão sem relação direta com Fatura

Cada `PARCELA` ganha uma referência à `FATURA` à qual pertence — mas essa referência só é preenchida no momento em que o ciclo correspondente fecha (não no nascimento da Parcela). `COMPRA_CARTÃO` não tem nenhuma referência a `FATURA` — o caminho para saber a que Fatura uma Compra se relaciona é sempre através de suas Parcelas.

- **Vantagens**: fiel ao diagrama original do conceitual; modela corretamente que uma Compra parcelada contribui para várias Faturas; o vínculo é um fato histórico auditável do momento do fechamento, não um recálculo silencioso; `valor_total_calculado` fica diretamente rastreável (soma das Parcelas efetivamente vinculadas); suporta corretamente compras lançadas tardiamente sem alterar retroativamente uma Fatura já fechada.
- **Desvantagens**: exige um evento conceitual explícito de "fechamento de ciclo" que atribui Parcelas à Fatura correspondente — mais uma etapa de processo a existir e funcionar corretamente; entre o vencimento futuro de uma Parcela e o fechamento do ciclo correspondente, a Parcela existe num estado transitório "ainda sem Fatura atribuída", que precisa de uma leitura clara (não é um erro, é um estado esperado, mas precisa estar documentado); consultar "todas as Compras desta Fatura" exige sempre passar por Parcela, nunca é direto.
- **Impacto no restante do modelo**: nenhum fora do módulo Cartão — não toca Lançamento, Liquidação, Obra, Veículo, Auditoria.
- **Compatibilidade com regras já definidas**: alta — é a leitura mais literal do próprio diagrama do conceitual.
- **Compatibilidade com fonte única da verdade**: alta — nenhuma duplicação nova; um único lugar (a Parcela) sabe a que Fatura pertence.
- **Compatibilidade com o cenário da Fatura mista R$30.000**: total. A soma das Parcelas Terraplanagem vinculadas reproduz exatamente a matemática do exemplo (R$18.000 de Lançamentos gerados vs. R$30.000 total, diferença de R$12.000 explicável pela compra não-operacional). Também é a única alternativa que se sustentaria corretamente se o exemplo fosse estendido para incluir uma compra parcelada — cenário que o exemplo original não testa, mas que o campo `nº parcelas` do modelo garante que vai acontecer na prática.

### Alternativa B — Vínculo inteiramente derivado, sem nada armazenado (Parcela pertence a uma Fatura apenas por cálculo de data, a qualquer momento)

Nenhuma referência armazenada em lugar nenhum. Sempre que for preciso saber "quais Parcelas formam esta Fatura", o sistema compara `PARCELA.vencimento` com o intervalo de datas do ciclo correspondente do Cartão, recalculando a cada consulta.

- **Vantagens**: nenhum campo/relacionamento adicional a manter; alinhado ao princípio 8 do conceitual ("nunca armazenar o que pode ser calculado") levado ao extremo — nem `valor_total_calculado` precisaria ser persistido; nenhum risco de vínculo desatualizado, porque não existe vínculo armazenado.
- **Desvantagens**: não se sustenta diante de uma compra lançada tardiamente com data dentro de um ciclo já fechado e pago — o recálculo por data mudaria retroativamente o conteúdo de uma Fatura já encerrada, contrariando o espírito de imutabilidade de eventos fechados que rege o resto do sistema (Liquidação como evento ocorrido, Movimentação como fato imutável do extrato); sem registro de "quais Parcelas foram de fato somadas" no momento do fechamento, `valor_total_calculado` perde rastreabilidade auditável; mais frágil a mudanças de `dia_fechamento`/`dia_vencimento` do Cartão ao longo do tempo, que poderiam alterar o resultado de um cálculo retroativo sobre ciclos antigos.
- **Impacto no restante do modelo**: nenhum fora do módulo Cartão.
- **Compatibilidade com regras já definidas**: parcial — atende ao princípio 8, mas conflita com o padrão de imutabilidade de fatos históricos já processados que aparece em `LIQUIDAÇÃO_FINANCEIRA` e `MOVIMENTAÇÃO_BANCÁRIA`.
- **Compatibilidade com fonte única da verdade**: alta em teoria (uma única fonte, a data), mas introduz um risco real de essa "verdade" mudar silenciosamente à medida que novos dados retroativos são inseridos — o que é, na prática, uma forma sutil de instabilidade da fonte única da verdade ao longo do tempo.
- **Compatibilidade com o cenário da Fatura mista R$30.000**: numericamente compatível no caso simples do exemplo (compras à vista, um único ciclo), mas não demonstra robustez para compras parceladas lançadas com atraso — cenário real que o campo `nº parcelas` do modelo prevê, mesmo que o exemplo do conceitual não o exercite.

### Alternativa C — Vínculo híbrido: Parcela armazena a Fatura (como na Alternativa A), e Compra Cartão também mantém uma relação direta com Fatura como atalho, para compras à vista

Tentativa de otimizar a consulta do caso mais comum (compra à vista, uma parcela só) sem abrir mão da correção para compras parceladas via Parcela.

- **Vantagens**: consulta direta e simples no caso de compra à vista (provavelmente o caso mais frequente).
- **Desvantagens**: para compra à vista, `COMPRA_CARTÃO.fatura` e a única `PARCELA.fatura` armazenariam exatamente o mesmo fato duas vezes — reintroduz, dentro do próprio módulo Cartão, o mesmo padrão de duplicação já identificado como achado 🔴 crítico em `revisao-integridade-dominio.md` para categoria/obra/veículo entre Compra e Lançamento; a regra "esse campo só é preenchido quando nº parcelas = 1" é uma condição adicional que, se não for respeitada à risca, cria divergência entre os dois lados; não resolve o problema-raiz, apenas o esconde atrás de um atalho de consulta que reintroduz risco.
- **Impacto no restante do modelo**: nenhum fora do módulo Cartão, mas cria uma nova via de inconsistência interna a esse módulo.
- **Compatibilidade com regras já definidas**: baixa — cria exatamente o tipo de duplicação que o restante do modelo evita com cuidado em todos os outros pontos (ex. Obra nunca é duplicada entre Lançamento e Rateio ao mesmo tempo — são estruturalmente mutuamente exclusivos, nunca as duas fontes coexistindo).
- **Compatibilidade com fonte única da verdade**: baixa — é exatamente o problema que a Alternativa A evita.
- **Compatibilidade com o cenário da Fatura mista R$30.000**: numericamente compatível, mas reintroduziria, de forma evitável, o mesmo padrão de risco já sinalizado como crítico em outro ponto do modelo.

### Alternativa D — Fatura sem nenhum vínculo estrutural com Parcela ou Compra; `valor_total_calculado` e a cobertura da Liquidação tratados como processo externo/manual

Simplificação radical: Fatura vira um registro quase isolado, só para conferência de valor pago, sem tentar modelar formalmente sua composição interna.

- **Vantagens**: extremamente simples — nenhuma entidade de junção, nenhum evento de fechamento de ciclo a modelar.
- **Desvantagens**: quebra diretamente a Seção 7 do conceitual, que exige que a Liquidação da Fatura aplique, via Aplicação de Liquidação, exatamente aos Lançamentos nascidos de Parcelas Terraplanagem "daquele ciclo" — sem nenhuma noção estrutural de quais Parcelas pertencem ao ciclo, essa regra não é implementável com precisão; quebra diretamente o cenário obrigatório da fatura mista R$30.000, que depende exatamente dessa separação; contraria a granularidade e rastreabilidade que o restante do modelo persegue.
- **Impacto no restante do modelo**: aparentemente nenhum, mas só porque a funcionalidade correspondente deixaria de existir de forma confiável.
- **Compatibilidade com regras já definidas**: baixa — incompatível diretamente com a Seção 7 do conceitual.
- **Compatibilidade com fonte única da verdade**: não se aplica de forma útil — não há fonte nenhuma para o que deveria ser uma relação de negócio real.
- **Compatibilidade com o cenário da Fatura mista R$30.000**: **incompatível** — o exemplo não pode ser reproduzido de forma auditável sem algum vínculo estrutural entre Fatura e as Parcelas/Compras do ciclo.

**A Alternativa D é descartada já nesta análise** por falhar em dois critérios obrigatórios (compatibilidade com regra já fixada e com o cenário de aceitação) — está registrada aqui só para demonstrar que o espaço de soluções foi varrido por completo, não para ser considerada como opção real.

---

## 8. RECOMENDAÇÃO TÉCNICA

**Recomendo a Alternativa A**: vínculo `PARCELA → FATURA` armazenado explicitamente, atribuído no momento do fechamento do ciclo; `COMPRA_CARTÃO` sem nenhuma relação direta com `FATURA`.

**Por quê, resumidamente**:
1. É a leitura mais fiel ao próprio diagrama do conceitual (Seção 4), que já desenhava Fatura relacionada a Parcelas, não a Compras inteiras.
2. É a única alternativa que reflete corretamente o fato de que uma Compra parcelada se distribui por várias Faturas ao longo do tempo — um caso real, não hipotético, dado que `nº parcelas` é campo explícito do modelo.
3. Evita duplicação de informação (diferente da Alternativa C).
4. É compatível com o padrão de imutabilidade de eventos fechados que já rege o resto do sistema — Liquidação, Movimentação Bancária — tratando o fechamento de ciclo como um evento auditável, não um recálculo silencioso (diferente da Alternativa B).
5. Sustenta o cenário obrigatório da Fatura mista R$30.000 com a mesma robustez das demais, mas é a única que também se sustentaria se esse exemplo fosse estendido para incluir uma compra parcelada em vários meses.

**O que fica em aberto, mesmo dentro desta recomendação** (não decidido aqui, só sinalizado): a regra exata de como uma Parcela se comporta no intervalo entre seu nascimento e o fechamento do ciclo correspondente (o estado "ainda sem Fatura atribuída"), e a regra exata para uma Compra lançada com data retroativa a um ciclo já fechado (entra no próximo ciclo aberto? gera uma divergência sinalizada?) — ambas são extensões naturais desta pendência, não resolvidas por esta análise, e ficam como refinamento futuro caso a Alternativa A seja aprovada.

**Nada foi decidido de forma definitiva.** Aguardo sua aprovação antes de qualquer atualização dos documentos de modelo de domínio (`18-compra-cartao.md`, `19-fatura.md`, `21-parcela.md`) ou do relatório de revisão de integridade.
