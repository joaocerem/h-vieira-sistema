package br.com.joaocerem.hvieira_financeiro.interfaces.http.liquidacaofinanceira;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record CriarLiquidacaoFinanceiraRequest(
        @Pattern(regexp = "Pagamento|Recebimento", message = "tipo deve ser 'Pagamento' ou 'Recebimento'") String tipo,
        @NotNull(message = "dataEfetiva é obrigatória") LocalDate dataEfetiva,
        @NotNull(message = "valor é obrigatório") BigDecimal valor,
        @NotNull(message = "contaBancariaId é obrigatório") UUID contaBancariaId,
        @NotEmpty(message = "aplicacoes deve ter ao menos um item") @Valid List<AplicacaoItemRequest> aplicacoes
) {
}
