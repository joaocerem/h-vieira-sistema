package br.com.joaocerem.hvieira_financeiro.interfaces.http.fornecedor;

import jakarta.validation.constraints.NotBlank;

public record FornecedorRequest(@NotBlank(message = "nome é obrigatório") String nome) {
}
