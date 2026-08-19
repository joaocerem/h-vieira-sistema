package br.com.joaocerem.hvieira_financeiro.interfaces.http.obra;

import br.com.joaocerem.hvieira_financeiro.domain.obra.Obra;

public final class ObraMapper {

    private ObraMapper() {
    }

    public static ObraResponse toResponse(Obra obra) {
        return new ObraResponse(
                obra.getId(),
                obra.getCliente().getId(),
                obra.getNome(),
                obra.getValorContratado(),
                obra.getDataInicio(),
                obra.getDataPrevistaTermino(),
                obra.getDataRealTermino(),
                obra.getStatus()
        );
    }
}
