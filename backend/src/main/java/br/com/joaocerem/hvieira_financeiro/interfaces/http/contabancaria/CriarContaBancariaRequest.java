package br.com.joaocerem.hvieira_financeiro.interfaces.http.contabancaria;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CriarContaBancariaRequest(
        @NotNull(message = "empresaId é obrigatório") UUID empresaId,
        @NotBlank(message = "banco é obrigatório") String banco,
        @NotBlank(message = "apelido é obrigatório") String apelido
) {
}
