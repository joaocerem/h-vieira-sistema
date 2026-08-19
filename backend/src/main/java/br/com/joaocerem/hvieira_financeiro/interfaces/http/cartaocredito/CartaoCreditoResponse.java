package br.com.joaocerem.hvieira_financeiro.interfaces.http.cartaocredito;

import java.util.UUID;

public record CartaoCreditoResponse(
        UUID id,
        UUID contaBancariaId,
        String banco,
        String apelido,
        Integer diaFechamento,
        Integer diaVencimento
) {
}
