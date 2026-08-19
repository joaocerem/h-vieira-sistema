package br.com.joaocerem.hvieira_financeiro.interfaces.http.fatura;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record FecharCicloFaturaRequest(
        @NotNull(message = "cartaoId é obrigatório") UUID cartaoId,
        @NotBlank(message = "ciclo é obrigatório (formato AAAA-MM)") String ciclo,
        @NotNull(message = "valorCobrado é obrigatório") BigDecimal valorCobrado
) {
}
