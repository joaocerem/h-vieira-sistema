package br.com.joaocerem.hvieira_financeiro.application.balanco;

import br.com.joaocerem.hvieira_financeiro.application.consultasfinanceiras.ResultadoFinanceiro;

public record Balanco(ResultadoFinanceiro realizado, ResultadoFinanceiro projetado) {
}
