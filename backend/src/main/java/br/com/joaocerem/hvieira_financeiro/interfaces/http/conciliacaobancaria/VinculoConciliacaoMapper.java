package br.com.joaocerem.hvieira_financeiro.interfaces.http.conciliacaobancaria;

import br.com.joaocerem.hvieira_financeiro.domain.conciliacaobancaria.VinculoConciliacao;
import br.com.joaocerem.hvieira_financeiro.domain.lancamentofinanceiro.LancamentoFinanceiro;

public final class VinculoConciliacaoMapper {

    private VinculoConciliacaoMapper() {
    }

    public static VinculoConciliacaoResponse toResponse(VinculoConciliacao vinculo) {
        return new VinculoConciliacaoResponse(
                vinculo.getId(),
                vinculo.getMovimentacaoBancaria().getId(),
                vinculo.getLancamentosFinanceiros().stream().map(LancamentoFinanceiro::getId).toList(),
                vinculo.getEstadoConciliacao()
        );
    }
}
