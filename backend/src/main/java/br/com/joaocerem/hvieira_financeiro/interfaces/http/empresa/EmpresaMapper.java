package br.com.joaocerem.hvieira_financeiro.interfaces.http.empresa;

import br.com.joaocerem.hvieira_financeiro.domain.empresa.Empresa;

public final class EmpresaMapper {

    private EmpresaMapper() {
    }

    public static EmpresaResponse toResponse(Empresa empresa) {
        return new EmpresaResponse(empresa.getId(), empresa.getNome());
    }
}
