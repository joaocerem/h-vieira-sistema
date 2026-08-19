package br.com.joaocerem.hvieira_financeiro.interfaces.http.rateio;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/**
 * Sem `lancamentoFinanceiroId`/`obraId` — ver justificativa em
 * {@link br.com.joaocerem.hvieira_financeiro.domain.rateio.RateioDespesa}.
 */
public record AtualizarRateioDespesaRequest(
        @NotNull(message = "valorRateado é obrigatório") BigDecimal valorRateado,
        String criterioInformado
) {
}
