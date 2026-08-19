package br.com.joaocerem.hvieira_financeiro.interfaces.http.balanco;

import br.com.joaocerem.hvieira_financeiro.application.balanco.Balanco;

public final class BalancoMapper {

    private BalancoMapper() {
    }

    public static BalancoResponse toResponse(Balanco balanco) {
        return new BalancoResponse(
                balanco.realizado().receitas(),
                balanco.realizado().despesas(),
                balanco.realizado().resultado(),
                balanco.projetado().receitas(),
                balanco.projetado().despesas(),
                balanco.projetado().resultado()
        );
    }
}
