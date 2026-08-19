package br.com.joaocerem.hvieira_financeiro.interfaces.http.compracartao;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CompraCartaoResponse(
        UUID id,
        UUID cartaoId,
        UUID fornecedorId,
        BigDecimal valor,
        LocalDate data,
        UUID categoriaId,
        String classificacao,
        UUID obraId,
        UUID veiculoId,
        Integer numeroParcelas
) {
}
