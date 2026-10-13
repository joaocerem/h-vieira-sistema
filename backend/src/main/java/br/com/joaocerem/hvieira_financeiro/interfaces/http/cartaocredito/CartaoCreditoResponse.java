package br.com.joaocerem.hvieira_financeiro.interfaces.http.cartaocredito;

import java.util.UUID;

public record CartaoCreditoResponse(
        UUID id,
        UUID contaBancariaId,
        String banco,
        Integer diaFechamento,
        Integer diaVencimento
) {
}
