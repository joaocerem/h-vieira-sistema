package br.com.joaocerem.hvieira_financeiro.interfaces.http.conciliacaobancaria;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record ImportarMovimentacoesRequest(
        @NotNull(message = "contaBancariaId é obrigatório") UUID contaBancariaId,
        @NotEmpty(message = "itens deve ter ao menos um item") @Valid List<ItemImportacaoMovimentacaoRequest> itens
) {
}
