package br.com.joaocerem.hvieira_financeiro.interfaces.http.lancamentofinanceiro;

import br.com.joaocerem.hvieira_financeiro.domain.lancamentofinanceiro.LancamentoFinanceiro;

public final class LancamentoFinanceiroMapper {

    private LancamentoFinanceiroMapper() {
    }

    public static LancamentoFinanceiroResponse toResponse(LancamentoFinanceiro lancamento, String statusFinanceiro) {
        return new LancamentoFinanceiroResponse(
                lancamento.getId(),
                lancamento.getTipo(),
                lancamento.getEmpresa().getId(),
                lancamento.getCategoria().getId(),
                lancamento.getFornecedor() != null ? lancamento.getFornecedor().getId() : null,
                lancamento.getCliente() != null ? lancamento.getCliente().getId() : null,
                lancamento.getObraId(),
                lancamento.getVeiculoId(),
                lancamento.getValor(),
                lancamento.getDataCompetencia(),
                lancamento.getVencimento(),
                lancamento.getSituacaoAdministrativa(),
                lancamento.getOrigem(),
                statusFinanceiro
        );
    }
}
