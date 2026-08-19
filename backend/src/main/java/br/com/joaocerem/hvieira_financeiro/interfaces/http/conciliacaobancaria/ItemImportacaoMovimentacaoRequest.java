package br.com.joaocerem.hvieira_financeiro.interfaces.http.conciliacaobancaria;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ItemImportacaoMovimentacaoRequest(
        @NotNull(message = "data é obrigatória") LocalDate data,
        @NotBlank(message = "descricao é obrigatória") String descricao,
        @NotNull(message = "valor é obrigatório") BigDecimal valor
) {
}
