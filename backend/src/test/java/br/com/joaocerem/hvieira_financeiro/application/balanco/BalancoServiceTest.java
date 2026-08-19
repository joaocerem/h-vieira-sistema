package br.com.joaocerem.hvieira_financeiro.application.balanco;

import br.com.joaocerem.hvieira_financeiro.application.consultasfinanceiras.ConsultasFinanceirasService;
import br.com.joaocerem.hvieira_financeiro.application.consultasfinanceiras.ResultadoFinanceiro;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BalancoServiceTest {

    @Mock
    private ConsultasFinanceirasService consultasFinanceirasService;

    private BalancoService service;

    private void iniciar() {
        service = new BalancoService(consultasFinanceirasService);
    }

    @Test
    void calcularDeveComporRealizadoEProjetado() {
        iniciar();
        UUID empresaId = UUID.randomUUID();
        ResultadoFinanceiro realizado = new ResultadoFinanceiro(new BigDecimal("30000.00"), new BigDecimal("18000.00"), new BigDecimal("12000.00"));
        ResultadoFinanceiro projetado = new ResultadoFinanceiro(new BigDecimal("40000.00"), new BigDecimal("25000.00"), new BigDecimal("15000.00"));
        when(consultasFinanceirasService.calcularRealizado(empresaId)).thenReturn(realizado);
        when(consultasFinanceirasService.calcularProjetado(empresaId)).thenReturn(projetado);

        Balanco balanco = service.calcular(empresaId);

        assertThat(balanco.realizado()).isEqualTo(realizado);
        assertThat(balanco.projetado()).isEqualTo(projetado);
    }
}
