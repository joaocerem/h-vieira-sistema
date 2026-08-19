package br.com.joaocerem.hvieira_financeiro.interfaces.http.obra;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ObraResponse(
        UUID id,
        UUID clienteId,
        String nome,
        BigDecimal valorContratado,
        LocalDate dataInicio,
        LocalDate dataPrevistaTermino,
        LocalDate dataRealTermino,
        String status
) {
}
