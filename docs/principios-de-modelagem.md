# Princípios de Modelagem
## Sistema Financeiro/Gerencial H Vieira Terraplanagem

**Natureza deste documento**: normativo. Orienta toda evolução futura do modelo de domínio e da arquitetura técnica — qualquer decisão de modelagem nova deve ser avaliada contra os princípios abaixo antes de ser adotada. Não substitui `arquitetura-conceitual.md` (fonte oficial de regras de negócio) nem `project-rules.md` (regras do projeto) — é um terceiro documento, com escopo próprio: critérios permanentes de como o modelo deve ser desenhado, não o que ele deve fazer.

**Origem**: os sete princípios abaixo foram consolidados ao longo da etapa de resolução das pendências bloqueantes do modelo de domínio, aprovados explicitamente para se tornarem normativos.

---

## 1. Entidades só devem ser separadas quando houver diferença real de comportamento de negócio

Diferença de atributos, isoladamente, não justifica criar uma entidade nova. Duas variantes de um mesmo conceito que se comportam da mesma forma no sistema — mesmo fluxo, mesmas regras, mesmas dependências — permanecem uma única entidade, distinguida por um campo discriminador quando necessário.

*Origem*: decisão sobre manter `CONTRATO_FINANCEIRO` unificado (Financiamento/Consórcio), na etapa de resolução de pendências.

## 2. O modelo só representa conceitos que possuem significado de negócio claramente definido

Conceitos hipotéticos, previstos para um possível uso futuro sem definição concreta, não geram campos, entidades ou relacionamentos antecipadamente. Uma necessidade sem definição de negócio não deve ser estruturada "por garantia" — fica registrada como pendência até ganhar definição real.

*Origem*: decisão sobre manter `CATEGORIA` sem a dimensão hipotética de "sub-conta interna", na etapa de resolução de pendências.

## 3. Não criar estrutura nova quando a estrutura existente já resolve o problema

Antes de introduzir uma entidade, campo, ou mecanismo novo, verificar se algo já modelado já cobre a necessidade — mesmo que exija reconhecer/clarear a natureza de algo já existente, em vez de adicionar algo novo.

*Origem*: aplicado repetidamente durante a resolução de pendências — na confirmação da referência genérica única (em vez de tabelas dedicadas por entidade), no uso de `LOG_AUDITORIA.data/hora` como referência de processamento (em vez de um campo novo em `COMPRA_CARTÃO`), e na rejeição de um mecanismo dedicado de reconciliação de Fatura (em vez de aceitar que o vínculo já existente basta).

## 4. Preservar uma única fonte da verdade para cada informação

Todo fato relevante é registrado uma única vez; toda leitura, sob qualquer forma ou por qualquer módulo, deriva dessa mesma fonte. Nenhuma informação deve ter duas origens possíveis que possam divergir entre si.

*Origem*: princípio 1 do `arquitetura-conceitual.md` ("registrar o fato uma vez, analisar de várias formas"), reafirmado na separação entre `situação_administrativa`/`status_financeiro`, e na regra de que o saldo devedor de um Contrato Financeiro tem uma única fórmula válida.

## 5. Fatos históricos não são reescritos

Um registro que já representa um evento ocorrido — uma liquidação, um fechamento de ciclo, uma decisão já tomada — não é alterado retroativamente para refletir uma correção. Toda correção posterior nasce como um novo registro, formalmente vinculado ao original, que permanece intocado.

*Origem*: princípio 5 do `arquitetura-conceitual.md` ("nada desaparece"), reafirmado na regra de cancelamento de Lançamento (correção pós-liquidação sempre via `AJUSTE_FINANCEIRO`, nunca reescrevendo o original) e na regra de que os totais de uma Fatura fechada permanecem congelados mesmo diante de informação nova.

## 6. Indicadores derivados devem, sempre que possível, ser calculados em vez de persistidos

Um valor que pode ser obtido a partir de outros dados já registrados não deve, por padrão, ser armazenado como um número próprio e editável. Calcular em consulta é a regra; persistir um valor derivado é a exceção.

*Origem*: princípio 8 do `arquitetura-conceitual.md`, reafirmado na decisão de que `status_financeiro` do Lançamento é sempre calculado, nunca armazenado, e na decisão de que o saldo devedor de um Contrato Financeiro nunca usa `valor_contratado` como base de cálculo.

## 7. Toda exceção a esses princípios deve ser explicitamente justificada

Quando uma exceção a qualquer um dos princípios acima for necessária, ela não pode ser silenciosa — precisa estar documentada, no próprio local onde ocorre, com a razão específica que a justifica.

*Origem*: aplicado na decisão sobre `FATURA.valor_total_calculado`/`valor_cobrado` — uma exceção reconhecida e justificada ao princípio 6 (são valores persistidos, não recalculados), com a razão explícita de que representam um retrato histórico congelado, protegido pelo princípio 5.
