package br.com.joaocerem.hvieira_financeiro.interfaces.http.usuario;

import br.com.joaocerem.hvieira_financeiro.domain.usuario.Usuario;

public final class UsuarioMapper {

    private UsuarioMapper() {
    }

    public static UsuarioResponse toResponse(Usuario usuario) {
        return new UsuarioResponse(usuario.getId(), usuario.getNome(), usuario.getIdentificadorDeAcesso(), usuario.getSituacaoDeAcesso());
    }
}
