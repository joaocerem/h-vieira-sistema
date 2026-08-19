package br.com.joaocerem.hvieira_financeiro.interfaces.http.conciliacaobancaria;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record MovimentacaoBancariaResponse(
        UUID id,
        UUID contaBancariaId,
        LocalDate data,
        String descricao,
        BigDecimal valor,
        String classificacao
) {
}
