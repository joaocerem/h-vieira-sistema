package br.com.joaocerem.hvieira_financeiro.interfaces.http.contratofinanceiro;

import br.com.joaocerem.hvieira_financeiro.domain.contratofinanceiro.ContratoFinanceiro;

public final class ContratoFinanceiroMapper {

    private ContratoFinanceiroMapper() {
    }

    public static ContratoFinanceiroResponse toResponse(ContratoFinanceiro contrato) {
        return new ContratoFinanceiroResponse(
                contrato.getId(),
                contrato.getTipo(),
                contrato.getEmpresa().getId(),
                contrato.getContaBancaria().getId(),
                contrato.getFornecedor().getId(),
                contrato.getValorContratado(),
                contrato.getNumeroParcelas(),
                contrato.getDataVencimentoPrimeiraParcela(),
                contrato.getTaxa(),
                contrato.getGrupoCota(),
                contrato.getContemplado(),
                contrato.getVeiculo() != null ? contrato.getVeiculo().getId() : null
        );
    }
}
