package br.com.joaocerem.hvieira_financeiro.interfaces.http.fatura;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * `paga` (Sprint 3 — rodada de evolução operacional) — substitui `liquidacaoFinanceiraId`; nunca
 * persistido, sempre calculado em tempo de leitura por `FaturaService#calcularPaga`.
 */
public record FaturaResponse(
        UUID id,
        UUID cartaoId,
        String ciclo,
        BigDecimal valorTotalCalculado,
        BigDecimal valorCobrado,
        boolean paga
) {
}
