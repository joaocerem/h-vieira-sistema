package br.com.joaocerem.hvieira_financeiro.interfaces.http.frota;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

/**
 * Sem `empresaId` — ver justificativa em {@link br.com.joaocerem.hvieira_financeiro.domain.frota.Veiculo}.
 * `obraAtualId` pode ser nulo (desalocação) — por isso não é `@NotNull`.
 */
public record AtualizarVeiculoRequest(
        @NotBlank(message = "nomeIdentificacao é obrigatório") String nomeIdentificacao,
        @NotBlank(message = "tipo é obrigatório") String tipo,
        UUID obraAtualId
) {
}
