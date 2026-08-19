package br.com.joaocerem.hvieira_financeiro.interfaces.http.balanco;

import java.math.BigDecimal;

public record BalancoResponse(
        BigDecimal receitasRealizadas,
        BigDecimal despesasRealizadas,
        BigDecimal resultadoRealizado,
        BigDecimal receitasProjetadas,
        BigDecimal despesasProjetadas,
        BigDecimal resultadoProjetado
) {
}
