package br.com.joaocerem.hvieira_financeiro.interfaces.http.conciliacaobancaria;

import jakarta.validation.constraints.NotBlank;

public record ReclassificarMovimentacaoRequest(@NotBlank(message = "classificacao é obrigatória") String classificacao) {
}
