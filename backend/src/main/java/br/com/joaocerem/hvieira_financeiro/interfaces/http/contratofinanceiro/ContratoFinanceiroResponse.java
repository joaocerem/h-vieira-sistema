package br.com.joaocerem.hvieira_financeiro.interfaces.http.contratofinanceiro;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ContratoFinanceiroResponse(
        UUID id,
        String tipo,
        UUID empresaId,
        UUID contaBancariaId,
        UUID fornecedorId,
        BigDecimal valorContratado,
        Integer numeroParcelas,
        LocalDate dataVencimentoPrimeiraParcela,
        BigDecimal taxa,
        String grupoCota,
        Boolean contemplado,
        UUID veiculoId
) {
}
