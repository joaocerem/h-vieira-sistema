package br.com.joaocerem.hvieira_financeiro.interfaces.http.contabancaria;

import java.util.UUID;

public record ContaBancariaResponse(UUID id, UUID empresaId, String banco, String apelido) {
}
