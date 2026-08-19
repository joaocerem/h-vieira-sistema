package br.com.joaocerem.hvieira_financeiro.interfaces.http.rateio;

import java.math.BigDecimal;
import java.util.UUID;

public record RateioDespesaResponse(
        UUID id,
        UUID lancamentoFinanceiroId,
        UUID obraId,
        BigDecimal valorRateado,
        String criterioInformado
) {
}
