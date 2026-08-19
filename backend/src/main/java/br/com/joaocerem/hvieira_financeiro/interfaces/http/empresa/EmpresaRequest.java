package br.com.joaocerem.hvieira_financeiro.interfaces.http.empresa;

import jakarta.validation.constraints.NotBlank;

/**
 * Usado tanto para criação quanto para atualização — Empresa só tem um campo editável.
 */
public record EmpresaRequest(
        @NotBlank(message = "nome é obrigatório") String nome
) {
}
