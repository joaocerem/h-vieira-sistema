package br.com.joaocerem.hvieira_financeiro.interfaces.http.usuario;

import java.util.UUID;

public record UsuarioResponse(UUID id, String nome, String identificadorDeAcesso, String situacaoDeAcesso) {
}
