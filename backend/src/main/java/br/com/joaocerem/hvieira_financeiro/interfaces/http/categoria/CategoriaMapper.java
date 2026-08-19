package br.com.joaocerem.hvieira_financeiro.interfaces.http.categoria;

import br.com.joaocerem.hvieira_financeiro.domain.categoria.Categoria;

public final class CategoriaMapper {

    private CategoriaMapper() {
    }

    public static CategoriaResponse toResponse(Categoria categoria) {
        return new CategoriaResponse(categoria.getId(), categoria.getNome(), categoria.getTipo());
    }
}
