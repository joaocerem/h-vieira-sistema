package br.com.joaocerem.hvieira_financeiro.interfaces.http.cliente;

import java.util.UUID;

public record ClienteResponse(UUID id, String nome) {
}
