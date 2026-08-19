package br.com.joaocerem.hvieira_financeiro.interfaces.http.cliente;

import jakarta.validation.constraints.NotBlank;

public record ClienteRequest(@NotBlank(message = "nome é obrigatório") String nome) {
}
