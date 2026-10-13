package br.com.joaocerem.hvieira_financeiro.interfaces.http.conciliacaobancaria;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;
import java.util.UUID;

/**
 * `lancamentoFinanceiroIds` (Sprint 3 — rodada de evolução operacional) — substitui
 * `liquidacaoFinanceiraId`; um Vínculo pode cobrir um ou mais Lançamentos de uma vez
 * (ex. pagamento de fatura de cartão cobrindo várias Parcelas).
 */
public record VincularManualmenteRequest(
        @NotEmpty(message = "lancamentoFinanceiroIds é obrigatório") List<UUID> lancamentoFinanceiroIds
) {
}
