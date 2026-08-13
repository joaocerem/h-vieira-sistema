# Registro Oficial de Decisões
## Sistema Financeiro/Gerencial H Vieira Terraplanagem

**Natureza deste documento**: este é o registro oficial e definitivo de decisões do projeto — a partir desta consolidação (Etapa 7), é **a fonte corrente** para "qual foi a decisão sobre X", com a mesma autoridade normativa dos demais documentos fonte de verdade listados em `handoff.md`, Seção 4. As decisões abaixo estão **consolidadas e não devem ser reabertas ou reinterpretadas** — qualquer necessidade de revisão de uma decisão aqui registrada é, ela própria, uma nova decisão, que deve ser proposta, registrada e aprovada explicitamente, nunca presumida.

**Origem**: as 11 decisões da Seção A e as duas resoluções adicionais da Seção B foram consolidadas ao longo da etapa de resolução das pendências bloqueantes do modelo de domínio e da arquitetura técnica, e estão transcritas aqui exatamente como registradas em `handoff.md`, Seção 7 — sem reinterpretação, resumo ou alteração de sentido. Os 7 princípios de modelagem da Seção C são normativos desde `principios-de-modelagem.md` e estão referenciados aqui, não duplicados.

**Data de oficialização deste registro**: 2026-08-13 (Etapa 7 da consolidação documental).

---

## A. As 11 decisões consolidadas

1. **Status do Lançamento**: dividido em duas dimensões independentes, nunca fundidas — `situação_administrativa` (persistida, decisão humana sobre o ciclo de vida) e `status_financeiro` (sempre calculado a partir das Aplicações, nunca armazenado, sem exceção).
2. **Cancelamento**: `situação_administrativa` só pode virar "Cancelado" quando a soma de Aplicações de Liquidação vinculadas for exatamente zero. Qualquer correção de um Lançamento que já tenha Aplicações passa exclusivamente por `AJUSTE_FINANCEIRO`. Cancelamento e Ajuste são conceitos distintos que nunca produzem o mesmo resultado por caminhos diferentes.
3. **Vínculo genérico** (`LOG_AUDITORIA`, `SUGESTÃO_IA`, e o "registro gerado" por `AÇÃO_PROPOSTA_IA`): cada um permanece entidade única, com referência genérica **só no nível conceitual**. A lista de entidades referenciáveis é fechada e explícita — nunca uma referência totalmente livre; nova entidade auditável exige adição deliberada. Cada mecanismo mantém seu próprio escopo (Sugestão limitada a 2 tipos; Ação limitada às entidades oficialmente permitidas para IA; `AJUSTE_FINANCEIRO` continua com referências concretas, nunca genéricas). A referência genérica existe só para evitar duplicação estrutural — nunca flexibiliza regra de negócio. **Técnica de implementação (banco) continua em aberto** — ver `pendencias.md`, item B4.
4. **`CONTRATO_FINANCEIRO`**: permanece entidade única (Financiamento/Consórcio via `tipo`). Campos condicionais (`taxa`, `grupo-cota`, `contemplado`) são restrição de **negócio do domínio**, não validação de interface — o campo do outro tipo é conceitualmente inexistente, não apenas vazio. Princípio geral derivado: separar entidades só por diferença real de **comportamento**, nunca só de atributos.
5. **`CATEGORIA`**: permanece com `nome`/`tipo`, sem segunda dimensão de "sub-conta interna" — não há definição de negócio para esse conceito hoje. Reclassificada para o perfil arquitetural "cadastro simples" (consequência da mesma decisão, incorporada na Etapa 3).
6. **Fatura ↔ Parcela**: `PARCELA` referencia `FATURA` diretamente (nunca `COMPRA_CARTÃO` → `FATURA` direto — ver a correção registrada em `handoff.md`, Seção 9). Uma Fatura fechada continua aceitando vínculo de Parcelas descobertas depois, por importação — mas `valor_total_calculado`/`valor_cobrado` ficam **congelados** no momento do fechamento, nunca recalculados. Diferença entre o total congelado e a soma atual de Parcelas vinculadas é efeito esperado, não inconsistência. Nenhuma entidade nova de reconciliação foi criada.
7. **Atribuição de ciclo da Parcela**: ausência de vínculo com Fatura já representa "aguardando" — nenhum status novo criado; `status` da Parcela é dimensão independente de "tem Fatura". Regra de atribuição: cadastro **manual sem fonte externa autoritativa**, com data em ciclo já fechado → próximo ciclo aberto no momento do processamento (usa `LOG_AUDITORIA.data/hora`, sem campo novo em `COMPRA_CARTÃO`). Quando existe fonte externa autoritativa (importação) → vínculo direto com a Fatura real, mesmo já fechada — prevalece sempre sobre a regra do "próximo ciclo aberto".
8. **`AJUSTE_FINANCEIRO` é exclusivamente iniciativa humana**: a IA nunca pode formalizar uma proposta de criação de Ajuste via `AÇÃO_PROPOSTA_IA`, em nenhum nível de sensibilidade — regra arquitetural, não limitação de implementação. A IA **pode** informar, explicar e recomendar que o usuário avalie um Ajuste em linguagem natural; só não pode iniciar o fluxo formal.
9. **Saldo devedor de `CONTRATO_FINANCEIRO`**: sempre = soma das Parcelas ainda em aberto. `valor_contratado` **nunca** participa desse cálculo — a fórmula "contratado menos pago" é inválida para o modelo. `valor_contratado` continua útil para consulta/histórico. O modelo **não decompõe** Parcela em principal/juros/taxa de administração — cada Parcela é só o valor devido naquele vencimento.
10. **Tolerância de Rateio**: exclusivamente técnica (arredondamento da menor unidade monetária) — nunca uma política de negócio para permitir rateios aproximados. Qualquer diferença além do arredondamento é inválida.
11. **Tolerância de dias da conciliação**: reclassificada como **não-bloqueante**, permanece pendência (não afeta nenhuma entidade). Deve ser **configurável**, nunca uma constante fixa espalhada pelo sistema — resolvida só quando o mecanismo de sugestão automática de conciliação for projetado.

---

## B. Resoluções adicionais, fora da numeração 1-11

Registradas em `handoff.md`, Seção 7, junto com as 11 decisões acima, durante a Etapa 3 (consolidação da arquitetura técnica):

- Confirmação de que o módulo Financeiro cria `LIQUIDAÇÃO_FINANCEIRA` ao fechar uma Fatura (arbitragem técnica, Divergência 6).
- Correção de posicionamento da IA na estrutura de pastas (arbitragem técnica, Divergência 5).

---

## C. Os 7 princípios de modelagem

Normativos desde `principios-de-modelagem.md` — este registro **não duplica** o conteúdo de cada princípio (justificativa, origem, exemplos), apenas indexa os títulos oficiais para referência cruzada. Consultar o documento original para o texto completo de cada um.

1. Entidades só devem ser separadas quando houver diferença real de comportamento de negócio
2. O modelo só representa conceitos que possuem significado de negócio claramente definido
3. Não criar estrutura nova quando a estrutura existente já resolve o problema
4. Preservar uma única fonte da verdade para cada informação
5. Fatos históricos não são reescritos
6. Indicadores derivados devem, sempre que possível, ser calculados em vez de persistidos
7. Toda exceção a esses princípios deve ser explicitamente justificada

Ver `principios-de-modelagem.md` para o texto normativo completo de cada princípio, incluindo a origem específica que o motivou.

---

## D. Regras de uso deste documento

- **Não reabrir** nenhuma das 11 decisões da Seção A, nem as duas resoluções da Seção B, sem aprovação explícita de uma nova decisão que as substitua — reabertura nunca é silenciosa.
- **Pendências não são decisões.** O que ainda está em aberto está exclusivamente em `pendencias.md` — este documento nunca deve ser usado para inferir que algo pendente foi decidido.
- Qualquer decisão nova, a partir de agora, deve ser adicionada a este documento como um novo item numerado, com a mesma formalidade (registro explícito, sem reinterpretar decisões existentes), preservando o histórico das decisões 1-11 e B intactas.
