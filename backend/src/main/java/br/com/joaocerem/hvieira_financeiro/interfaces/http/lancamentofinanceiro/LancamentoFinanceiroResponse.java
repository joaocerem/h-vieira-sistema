package br.com.joaocerem.hvieira_financeiro.interfaces.http.lancamentofinanceiro;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record LancamentoFinanceiroResponse(
        UUID id,
        String tipo,
        UUID empresaId,
        UUID categoriaId,
        UUID fornecedorId,
        UUID clienteId,
        UUID obraId,
        UUID veiculoId,
        BigDecimal valor,
        LocalDate dataCompetencia,
        LocalDate vencimento,
        String situacaoAdministrativa,
        String origem,
        String statusFinanceiro,
        String descricao,
        String documento
) {
}
