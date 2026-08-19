package br.com.joaocerem.hvieira_financeiro.interfaces.http.contabancaria;

import br.com.joaocerem.hvieira_financeiro.domain.contabancaria.ContaBancaria;

public final class ContaBancariaMapper {

    private ContaBancariaMapper() {
    }

    public static ContaBancariaResponse toResponse(ContaBancaria contaBancaria) {
        return new ContaBancariaResponse(
                contaBancaria.getId(),
                contaBancaria.getEmpresa().getId(),
                contaBancaria.getBanco(),
                contaBancaria.getApelido()
        );
    }
}
