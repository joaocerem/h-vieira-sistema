package br.com.joaocerem.hvieira_financeiro.interfaces.http.conciliacaobancaria;

import br.com.joaocerem.hvieira_financeiro.domain.conciliacaobancaria.TransferenciaInterna;

public final class TransferenciaInternaMapper {

    private TransferenciaInternaMapper() {
    }

    public static TransferenciaInternaResponse toResponse(TransferenciaInterna transferencia) {
        return new TransferenciaInternaResponse(
                transferencia.getId(),
                transferencia.getMovimentacaoOrigem().getId(),
                transferencia.getMovimentacaoDestino().getId(),
                transferencia.getValor(),
                transferencia.getData()
        );
    }
}
