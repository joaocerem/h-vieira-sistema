package br.com.joaocerem.hvieira_financeiro.interfaces.http.compracartao;

import br.com.joaocerem.hvieira_financeiro.domain.compracartao.CompraCartao;

public final class CompraCartaoMapper {

    private CompraCartaoMapper() {
    }

    public static CompraCartaoResponse toResponse(CompraCartao compra) {
        return new CompraCartaoResponse(
                compra.getId(),
                compra.getCartao().getId(),
                compra.getFornecedor().getId(),
                compra.getValor(),
                compra.getData(),
                compra.getCategoria().getId(),
                compra.getClassificacao(),
                compra.getObra() != null ? compra.getObra().getId() : null,
                compra.getVeiculo() != null ? compra.getVeiculo().getId() : null,
                compra.getNumeroParcelas()
        );
    }
}
