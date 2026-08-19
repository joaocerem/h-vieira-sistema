package br.com.joaocerem.hvieira_financeiro.application.consultasfinanceiras;

import java.math.BigDecimal;

/**
 * Receita, Despesa e Resultado (Receita − Despesa) — forma comum a "Realizado" e "Projetado".
 */
public record ResultadoFinanceiro(BigDecimal receitas, BigDecimal despesas, BigDecimal resultado) {
}
