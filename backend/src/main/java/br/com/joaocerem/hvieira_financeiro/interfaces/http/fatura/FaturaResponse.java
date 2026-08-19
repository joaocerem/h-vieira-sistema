package br.com.joaocerem.hvieira_financeiro.interfaces.http.fatura;

import java.math.BigDecimal;
import java.util.UUID;

public record FaturaResponse(
        UUID id,
        UUID cartaoId,
        String ciclo,
        BigDecimal valorTotalCalculado,
        BigDecimal valorCobrado,
        UUID liquidacaoFinanceiraId
) {
}
