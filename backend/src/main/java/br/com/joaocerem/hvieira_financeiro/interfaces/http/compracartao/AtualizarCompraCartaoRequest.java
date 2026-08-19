package br.com.joaocerem.hvieira_financeiro.interfaces.http.compracartao;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Sem `cartaoId`, `valor` e `numeroParcelas` — ver justificativa em
 * {@link br.com.joaocerem.hvieira_financeiro.domain.compracartao.CompraCartao}.
 */
public record AtualizarCompraCartaoRequest(
        @NotNull(message = "fornecedorId é obrigatório") UUID fornecedorId,
        @NotNull(message = "data é obrigatória") LocalDate data,
        @NotNull(message = "categoriaId é obrigatório") UUID categoriaId,
        String classificacao,
        UUID obraId,
        UUID veiculoId
) {
}
