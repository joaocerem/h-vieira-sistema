package br.com.joaocerem.hvieira_financeiro.interfaces.http.liquidacaofinanceira;

import br.com.joaocerem.hvieira_financeiro.domain.aplicacaodeliquidacao.AplicacaoDeLiquidacao;
import br.com.joaocerem.hvieira_financeiro.domain.liquidacaofinanceira.LiquidacaoFinanceira;

import java.util.List;

public final class LiquidacaoFinanceiraMapper {

    private LiquidacaoFinanceiraMapper() {
    }

    public static LiquidacaoFinanceiraResponse toResponse(LiquidacaoFinanceira liquidacao, List<AplicacaoDeLiquidacao> aplicacoes) {
        List<AplicacaoItemResponse> itens = aplicacoes.stream()
                .map(a -> new AplicacaoItemResponse(a.getId(), a.getLancamentoFinanceiro().getId(), a.getValorAplicado()))
                .toList();
        return new LiquidacaoFinanceiraResponse(
                liquidacao.getId(),
                liquidacao.getTipo(),
                liquidacao.getDataEfetiva(),
                liquidacao.getValor(),
                liquidacao.getContaBancaria().getId(),
                itens
        );
    }
}
