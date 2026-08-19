package br.com.joaocerem.hvieira_financeiro.interfaces.http.fatura;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public record PagarFaturaRequest(
        @NotNull(message = "contaBancariaId é obrigatório") UUID contaBancariaId,
        @NotNull(message = "dataEfetiva é obrigatória") LocalDate dataEfetiva
) {
}
