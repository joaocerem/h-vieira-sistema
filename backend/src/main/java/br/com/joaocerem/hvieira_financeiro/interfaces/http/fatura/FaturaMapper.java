package br.com.joaocerem.hvieira_financeiro.interfaces.http.fatura;

import br.com.joaocerem.hvieira_financeiro.domain.fatura.Fatura;

public final class FaturaMapper {

    private FaturaMapper() {
    }

    public static FaturaResponse toResponse(Fatura fatura, boolean paga) {
        return new FaturaResponse(
                fatura.getId(),
                fatura.getCartao().getId(),
                fatura.getCiclo(),
                fatura.getValorTotalCalculado(),
                fatura.getValorCobrado(),
                paga
        );
    }
}
