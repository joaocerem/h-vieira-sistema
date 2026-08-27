package br.com.joaocerem.hvieira_financeiro.interfaces.http.lancamentofinanceiro;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CriarLancamentoFinanceiroRequest(
        @Pattern(regexp = "Despesa|Receita", message = "tipo deve ser 'Despesa' ou 'Receita'") String tipo,
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
