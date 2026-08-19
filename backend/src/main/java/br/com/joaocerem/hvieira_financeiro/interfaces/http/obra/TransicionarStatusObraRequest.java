package br.com.joaocerem.hvieira_financeiro.interfaces.http.obra;

import jakarta.validation.constraints.Pattern;

public record TransicionarStatusObraRequest(
        @Pattern(regexp = "A executar|Em andamento|Pausada|Concluída", message = "status inválido") String novoStatus
) {
}
