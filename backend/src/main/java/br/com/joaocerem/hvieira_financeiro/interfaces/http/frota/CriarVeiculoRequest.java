package br.com.joaocerem.hvieira_financeiro.interfaces.http.frota;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CriarVeiculoRequest(
        @NotNull(message = "empresaId é obrigatório") UUID empresaId,
        @NotBlank(message = "nomeIdentificacao é obrigatório") String nomeIdentificacao,
        @NotBlank(message = "tipo é obrigatório") String tipo,
        UUID obraAtualId
) {
}
