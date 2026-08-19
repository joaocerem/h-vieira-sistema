package br.com.joaocerem.hvieira_financeiro.interfaces.http.contabancaria;

import jakarta.validation.constraints.NotBlank;

/**
 * Sem `empresaId` — ver justificativa em {@link br.com.joaocerem.hvieira_financeiro.domain.contabancaria.ContaBancaria}.
 */
public record AtualizarContaBancariaRequest(
        @NotBlank(message = "banco é obrigatório") String banco,
        @NotBlank(message = "apelido é obrigatório") String apelido
) {
}
