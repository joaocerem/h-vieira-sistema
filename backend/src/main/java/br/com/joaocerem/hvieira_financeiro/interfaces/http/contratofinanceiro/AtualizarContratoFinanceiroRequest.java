package br.com.joaocerem.hvieira_financeiro.interfaces.http.contratofinanceiro;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/**
 * Sem `tipo`, `empresaId`, `contaBancariaId`, `valorContratado`, `numeroParcelas` e
 * `dataVencimentoPrimeiraParcela` — ver justificativa em
 * {@link br.com.joaocerem.hvieira_financeiro.domain.contratofinanceiro.ContratoFinanceiro}.
 * `veiculoId` só é aceito quando `tipo` = Consórcio e `contemplado` = true.
 */
public record AtualizarContratoFinanceiroRequest(
        @NotNull(message = "fornecedorId é obrigatório") UUID fornecedorId,
        UUID veiculoId
) {
}
