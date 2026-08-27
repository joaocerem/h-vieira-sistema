package br.com.joaocerem.hvieira_financeiro.interfaces.http.lancamentofinanceiro;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Sem `tipo` — imutável (ver {@link br.com.joaocerem.hvieira_financeiro.domain.lancamentofinanceiro.LancamentoFinanceiro}).
 */
public record AtualizarLancamentoFinanceiroRequest(
        @NotNull(message = "empresaId é obrigatório") UUID empresaId,
        @NotNull(message = "categoriaId é obrigatório") UUID categoriaId,
        UUID fornecedorId,
        UUID clienteId,
        UUID obraId,
        UUID veiculoId,
        @NotNull(message = "valor é obrigatório") BigDecimal valor,
        @NotNull(message = "dataCompetencia é obrigatória") LocalDate dataCompetencia,
        @NotNull(message = "vencimento é obrigatório") LocalDate vencimento,
        String descricao,
        String documento
) {
}
