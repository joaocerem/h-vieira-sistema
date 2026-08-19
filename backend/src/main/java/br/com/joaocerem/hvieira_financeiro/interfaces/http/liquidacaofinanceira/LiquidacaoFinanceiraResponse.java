package br.com.joaocerem.hvieira_financeiro.interfaces.http.liquidacaofinanceira;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record LiquidacaoFinanceiraResponse(
        UUID id,
        String tipo,
        LocalDate dataEfetiva,
        BigDecimal valor,
        UUID contaBancariaId,
        List<AplicacaoItemResponse> aplicacoes
) {
}
