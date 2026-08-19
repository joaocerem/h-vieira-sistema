package br.com.joaocerem.hvieira_financeiro.interfaces.http.ajustefinanceiro;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CriarAjusteFinanceiroRequest(
        @NotNull(message = "lancamentoOriginalId é obrigatório") UUID lancamentoOriginalId,
        @NotNull(message = "lancamentoAjusteId é obrigatório") UUID lancamentoAjusteId,
        @Pattern(regexp = "Estorno|Reembolso|Crédito|Ajuste", message = "tipoAjuste deve ser Estorno, Reembolso, Crédito ou Ajuste") String tipoAjuste,
        @NotNull(message = "valor é obrigatório") BigDecimal valor,
        @NotNull(message = "data é obrigatória") LocalDate data,
        @NotNull(message = "usuarioId é obrigatório") UUID usuarioId,
        String observacao
) {
}
