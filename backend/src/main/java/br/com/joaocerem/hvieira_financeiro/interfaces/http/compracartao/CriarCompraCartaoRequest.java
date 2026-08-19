package br.com.joaocerem.hvieira_financeiro.interfaces.http.compracartao;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CriarCompraCartaoRequest(
        @NotNull(message = "cartaoId é obrigatório") UUID cartaoId,
        @NotNull(message = "fornecedorId é obrigatório") UUID fornecedorId,
        @NotNull(message = "valor é obrigatório") BigDecimal valor,
        @NotNull(message = "data é obrigatória") LocalDate data,
        @NotNull(message = "categoriaId é obrigatório") UUID categoriaId,
        String classificacao,
        UUID obraId,
        UUID veiculoId,
        Integer numeroParcelas
) {
}
