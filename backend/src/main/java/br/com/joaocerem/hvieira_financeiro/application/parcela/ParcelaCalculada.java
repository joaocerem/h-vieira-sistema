package br.com.joaocerem.hvieira_financeiro.application.parcela;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Resultado do cálculo de uma Parcela (valor + vencimento), antes de persistida.
 * Ver `decisions.md`, decisão #39.
 */
record ParcelaCalculada(BigDecimal valor, LocalDate vencimento) {
}
