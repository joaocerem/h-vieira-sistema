package br.com.joaocerem.hvieira_financeiro.interfaces.http.contratofinanceiro;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CriarContratoFinanceiroRequest(
        @Pattern(regexp = "Financiamento|Consórcio", message = "tipo deve ser 'Financiamento' ou 'Consórcio'") String tipo,
        @NotNull(message = "empresaId é obrigatório") UUID empresaId,
        @NotNull(message = "contaBancariaId é obrigatório") UUID contaBancariaId,
        @NotNull(message = "fornecedorId é obrigatório") UUID fornecedorId,
        @NotNull(message = "valorContratado é obrigatório") BigDecimal valorContratado,
        @NotNull(message = "numeroParcelas é obrigatório") Integer numeroParcelas,
        @NotNull(message = "dataVencimentoPrimeiraParcela é obrigatória") LocalDate dataVencimentoPrimeiraParcela,
        BigDecimal taxa,
        String grupoCota,
        Boolean contemplado,
        UUID veiculoId
) {
}
