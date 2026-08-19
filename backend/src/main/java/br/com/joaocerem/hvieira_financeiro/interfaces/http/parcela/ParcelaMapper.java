package br.com.joaocerem.hvieira_financeiro.interfaces.http.parcela;

import br.com.joaocerem.hvieira_financeiro.domain.parcela.Parcela;

public final class ParcelaMapper {

    private ParcelaMapper() {
    }

    public static ParcelaResponse toResponse(Parcela parcela) {
        return new ParcelaResponse(
                parcela.getId(),
                parcela.getOrigem(),
                parcela.getCompraCartao() != null ? parcela.getCompraCartao().getId() : null,
                parcela.getContratoFinanceiro() != null ? parcela.getContratoFinanceiro().getId() : null,
                parcela.getNumero(),
                parcela.getTotal(),
                parcela.getValor(),
                parcela.getVencimento(),
                parcela.getFatura() != null ? parcela.getFatura().getId() : null,
                parcela.getLancamentoFinanceiro() != null ? parcela.getLancamentoFinanceiro().getId() : null
        );
    }
}
