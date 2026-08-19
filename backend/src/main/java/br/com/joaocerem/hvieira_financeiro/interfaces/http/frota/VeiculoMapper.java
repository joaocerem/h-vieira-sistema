package br.com.joaocerem.hvieira_financeiro.interfaces.http.frota;

import br.com.joaocerem.hvieira_financeiro.domain.frota.Veiculo;

public final class VeiculoMapper {

    private VeiculoMapper() {
    }

    public static VeiculoResponse toResponse(Veiculo veiculo) {
        return new VeiculoResponse(
                veiculo.getId(),
                veiculo.getEmpresa().getId(),
                veiculo.getNomeIdentificacao(),
                veiculo.getTipo(),
                veiculo.getObraAtual() != null ? veiculo.getObraAtual().getId() : null
        );
    }
}
