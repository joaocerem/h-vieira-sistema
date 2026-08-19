package br.com.joaocerem.hvieira_financeiro.interfaces.http.frota;

import java.util.UUID;

public record VeiculoResponse(UUID id, UUID empresaId, String nomeIdentificacao, String tipo, UUID obraAtualId) {
}
