package br.com.joaocerem.hvieira_financeiro.interfaces.http.ajustefinanceiro;

import br.com.joaocerem.hvieira_financeiro.domain.ajustefinanceiro.AjusteFinanceiro;

public final class AjusteFinanceiroMapper {

    private AjusteFinanceiroMapper() {
    }

    public static AjusteFinanceiroResponse toResponse(AjusteFinanceiro ajuste) {
        return new AjusteFinanceiroResponse(
                ajuste.getId(),
                ajuste.getLancamentoOriginal().getId(),
                ajuste.getLancamentoAjuste().getId(),
                ajuste.getTipoAjuste(),
                ajuste.getValor(),
                ajuste.getData(),
                ajuste.getUsuario().getId(),
                ajuste.getObservacao()
        );
    }
}
