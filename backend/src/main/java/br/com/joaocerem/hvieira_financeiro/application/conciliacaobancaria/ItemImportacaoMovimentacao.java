package br.com.joaocerem.hvieira_financeiro.application.conciliacaobancaria;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Um item de um lote de importação de extrato bancário. Ver {@code MovimentacaoBancariaService#importar}.
 */
public record ItemImportacaoMovimentacao(LocalDate data, String descricao, BigDecimal valor) {
}
