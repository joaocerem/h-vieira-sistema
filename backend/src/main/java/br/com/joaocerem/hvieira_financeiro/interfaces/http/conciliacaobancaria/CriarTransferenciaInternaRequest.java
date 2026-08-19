package br.com.joaocerem.hvieira_financeiro.interfaces.http.conciliacaobancaria;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CriarTransferenciaInternaRequest(
        @NotNull(message = "movimentacaoOrigemId é obrigatório") UUID movimentacaoOrigemId,
        @NotNull(message = "movimentacaoDestinoId é obrigatório") UUID movimentacaoDestinoId,
        @NotNull(message = "valor é obrigatório") BigDecimal valor,
        @NotNull(message = "data é obrigatória") LocalDate data
) {
}
