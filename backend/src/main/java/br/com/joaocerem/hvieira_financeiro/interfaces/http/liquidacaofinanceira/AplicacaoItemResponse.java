package br.com.joaocerem.hvieira_financeiro.interfaces.http.liquidacaofinanceira;

import java.math.BigDecimal;
import java.util.UUID;

public record AplicacaoItemResponse(UUID id, UUID lancamentoFinanceiroId, BigDecimal valorAplicado) {
}
