package br.com.joaocerem.hvieira_financeiro.common.validation;

import br.com.joaocerem.hvieira_financeiro.common.exception.BusinessException;

import java.math.BigDecimal;

/**
 * Validações de negócio reaproveitadas por múltiplos Services (achado M2 da auditoria arquitetural).
 * Sem alteração de regra — mesma lógica que já existia duplicada em `LancamentoFinanceiroService`,
 * `LiquidacaoFinanceiraService`, `CompraCartaoService`, `RateioDespesaService`,
 * `AjusteFinanceiroService` e `FaturaService`, extraída para um único lugar.
 */
public final class Validacoes {

    private Validacoes() {
    }

    /**
     * @param nomeCampo nome do campo, usado na mensagem de erro (ex. "valor", "valorAplicado",
     *                  "valorRateado", "valorCobrado") — preserva as mensagens já existentes em cada
     *                  Service, campo a campo.
     */
    public static void exigirValorMonetarioPositivo(BigDecimal valor, String nomeCampo) {
        if (valor == null || valor.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(nomeCampo + " deve ser um valor monetário positivo");
        }
    }
}
