package br.com.joaocerem.hvieira_financeiro.interfaces.http.cartaocredito;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CriarCartaoCreditoRequest(
        @NotNull(message = "contaBancariaId é obrigatório") UUID contaBancariaId,
        @NotBlank(message = "banco é obrigatório") String banco,
        @NotBlank(message = "apelido é obrigatório") String apelido,
        @NotNull(message = "diaFechamento é obrigatório") Integer diaFechamento,
        @NotNull(message = "diaVencimento é obrigatório") Integer diaVencimento
) {
}
