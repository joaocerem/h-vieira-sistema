package br.com.joaocerem.hvieira_financeiro.interfaces.http.conciliacaobancaria;

import java.util.List;
import java.util.UUID;

/**
 * `lancamentosFinanceirosIds` (Sprint 3 — rodada de evolução operacional) — substitui
 * `liquidacaoFinanceiraId`; N:N direto com Lançamento Financeiro.
 */
public record VinculoConciliacaoResponse(
        UUID id,
        UUID movimentacaoBancariaId,
        List<UUID> lancamentosFinanceirosIds,
        String estadoConciliacao
) {
}
