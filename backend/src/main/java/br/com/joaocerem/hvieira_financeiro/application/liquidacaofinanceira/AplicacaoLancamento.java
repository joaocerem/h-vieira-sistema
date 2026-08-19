package br.com.joaocerem.hvieira_financeiro.application.liquidacaofinanceira;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Comando interno: um par (Lançamento, valor aplicado) informado ao registrar uma Liquidação.
 * Não é a entidade `AplicacaoDeLiquidacao` — é o dado de entrada a partir do qual o Service cria as
 * entidades reais, uma por par (ver `docs/domain-model/11-aplicacao-de-liquidacao.md`, Seção 1: "não
 * é um campo de digitação livre do usuário").
 */
public record AplicacaoLancamento(UUID lancamentoFinanceiroId, BigDecimal valorAplicado) {
}
