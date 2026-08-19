package br.com.joaocerem.hvieira_financeiro.interfaces.http.conciliacaobancaria;

import br.com.joaocerem.hvieira_financeiro.domain.conciliacaobancaria.MovimentacaoBancaria;

public final class MovimentacaoBancariaMapper {

    private MovimentacaoBancariaMapper() {
    }

    public static MovimentacaoBancariaResponse toResponse(MovimentacaoBancaria movimentacao) {
        return new MovimentacaoBancariaResponse(
                movimentacao.getId(),
                movimentacao.getContaBancaria().getId(),
                movimentacao.getData(),
                movimentacao.getDescricao(),
                movimentacao.getValor(),
                movimentacao.getClassificacao()
        );
    }
}
