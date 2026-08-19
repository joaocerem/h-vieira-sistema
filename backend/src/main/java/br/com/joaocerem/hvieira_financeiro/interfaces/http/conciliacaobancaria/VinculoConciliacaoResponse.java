package br.com.joaocerem.hvieira_financeiro.interfaces.http.conciliacaobancaria;

import java.util.UUID;

public record VinculoConciliacaoResponse(
        UUID id,
        UUID movimentacaoBancariaId,
        UUID liquidacaoFinanceiraId,
        String estadoConciliacao
) {
}
