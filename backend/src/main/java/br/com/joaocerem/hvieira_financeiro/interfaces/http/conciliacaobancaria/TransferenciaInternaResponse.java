package br.com.joaocerem.hvieira_financeiro.interfaces.http.conciliacaobancaria;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record TransferenciaInternaResponse(
        UUID id,
        UUID movimentacaoOrigemId,
        UUID movimentacaoDestinoId,
        BigDecimal valor,
        LocalDate data
) {
}
