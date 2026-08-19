package br.com.joaocerem.hvieira_financeiro.interfaces.http.cliente;

import br.com.joaocerem.hvieira_financeiro.domain.cliente.Cliente;

public final class ClienteMapper {

    private ClienteMapper() {
    }

    public static ClienteResponse toResponse(Cliente cliente) {
        return new ClienteResponse(cliente.getId(), cliente.getNome());
    }
}
