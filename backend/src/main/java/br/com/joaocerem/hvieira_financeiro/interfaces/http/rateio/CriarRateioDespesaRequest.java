package br.com.joaocerem.hvieira_financeiro.interfaces.http.rateio;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record CriarRateioDespesaRequest(
        @NotNull(message = "lancamentoFinanceiroId é obrigatório") UUID lancamentoFinanceiroId,
        @NotNull(message = "obraId é obrigatório") UUID obraId,
        @NotNull(message = "valorRateado é obrigatório") BigDecimal valorRateado,
        String criterioInformado
) {
}
