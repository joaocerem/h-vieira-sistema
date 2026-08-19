package br.com.joaocerem.hvieira_financeiro.interfaces.http.conciliacaobancaria;

import br.com.joaocerem.hvieira_financeiro.domain.conciliacaobancaria.VinculoConciliacao;

public final class VinculoConciliacaoMapper {

    private VinculoConciliacaoMapper() {
    }

    public static VinculoConciliacaoResponse toResponse(VinculoConciliacao vinculo) {
        return new VinculoConciliacaoResponse(
                vinculo.getId(),
                vinculo.getMovimentacaoBancaria().getId(),
                vinculo.getLiquidacaoFinanceira() != null ? vinculo.getLiquidacaoFinanceira().getId() : null,
                vinculo.getEstadoConciliacao()
        );
    }
}
