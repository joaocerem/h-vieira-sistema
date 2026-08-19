package br.com.joaocerem.hvieira_financeiro.interfaces.http.cartaocredito;

import br.com.joaocerem.hvieira_financeiro.domain.cartaocredito.CartaoCredito;

public final class CartaoCreditoMapper {

    private CartaoCreditoMapper() {
    }

    public static CartaoCreditoResponse toResponse(CartaoCredito cartao) {
        return new CartaoCreditoResponse(
                cartao.getId(),
                cartao.getContaBancaria().getId(),
                cartao.getBanco(),
                cartao.getApelido(),
                cartao.getDiaFechamento(),
                cartao.getDiaVencimento()
        );
    }
}
