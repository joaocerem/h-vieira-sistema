package br.com.joaocerem.hvieira_financeiro.interfaces.http.parcela;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ParcelaResponse(
        UUID id,
        String origem,
        UUID compraCartaoId,
        UUID contratoFinanceiroId,
        Integer numero,
        Integer total,
        BigDecimal valor,
        LocalDate vencimento,
        UUID faturaId,
        UUID lancamentoFinanceiroId
) {
}
