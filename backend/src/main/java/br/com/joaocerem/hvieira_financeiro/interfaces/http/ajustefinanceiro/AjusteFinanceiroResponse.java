package br.com.joaocerem.hvieira_financeiro.interfaces.http.ajustefinanceiro;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record AjusteFinanceiroResponse(
        UUID id,
        UUID lancamentoOriginalId,
        UUID lancamentoAjusteId,
        String tipoAjuste,
        BigDecimal valor,
        LocalDate data,
        UUID usuarioId,
        String observacao
) {
}
