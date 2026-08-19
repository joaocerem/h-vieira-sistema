package br.com.joaocerem.hvieira_financeiro.interfaces.http.liquidacaofinanceira;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record AplicacaoItemRequest(
        @NotNull(message = "lancamentoFinanceiroId é obrigatório") UUID lancamentoFinanceiroId,
        @NotNull(message = "valorAplicado é obrigatório") BigDecimal valorAplicado
) {
}
