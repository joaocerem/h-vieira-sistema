package br.com.joaocerem.hvieira_financeiro.interfaces.http.obra;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Sem `clienteId` (imutável — ver {@link br.com.joaocerem.hvieira_financeiro.domain.obra.Obra}) e sem
 * `status` (só via endpoint dedicado de transição).
 */
public record AtualizarObraRequest(
        @NotBlank(message = "nome é obrigatório") String nome,
        @NotNull(message = "valorContratado é obrigatório") BigDecimal valorContratado,
        @NotNull(message = "dataInicio é obrigatória") LocalDate dataInicio,
        @NotNull(message = "dataPrevistaTermino é obrigatória") LocalDate dataPrevistaTermino,
        LocalDate dataRealTermino
) {
}
