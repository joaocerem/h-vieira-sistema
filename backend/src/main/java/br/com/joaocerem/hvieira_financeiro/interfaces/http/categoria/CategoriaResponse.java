package br.com.joaocerem.hvieira_financeiro.interfaces.http.categoria;

import java.util.UUID;

public record CategoriaResponse(UUID id, String nome, String tipo) {
}
