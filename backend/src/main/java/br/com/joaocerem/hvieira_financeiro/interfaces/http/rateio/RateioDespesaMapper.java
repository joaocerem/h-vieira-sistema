package br.com.joaocerem.hvieira_financeiro.interfaces.http.rateio;

import br.com.joaocerem.hvieira_financeiro.domain.rateio.RateioDespesa;

public final class RateioDespesaMapper {

    private RateioDespesaMapper() {
    }

    public static RateioDespesaResponse toResponse(RateioDespesa rateio) {
        return new RateioDespesaResponse(
                rateio.getId(),
                rateio.getLancamentoFinanceiro().getId(),
                rateio.getObra().getId(),
                rateio.getValorRateado(),
                rateio.getCriterioInformado()
        );
    }
}
