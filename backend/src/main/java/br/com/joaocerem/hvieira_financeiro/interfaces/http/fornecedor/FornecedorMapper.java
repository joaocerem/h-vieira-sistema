package br.com.joaocerem.hvieira_financeiro.interfaces.http.fornecedor;

import br.com.joaocerem.hvieira_financeiro.domain.fornecedor.Fornecedor;

public final class FornecedorMapper {

    private FornecedorMapper() {
    }

    public static FornecedorResponse toResponse(Fornecedor fornecedor) {
        return new FornecedorResponse(fornecedor.getId(), fornecedor.getNome());
    }
}
