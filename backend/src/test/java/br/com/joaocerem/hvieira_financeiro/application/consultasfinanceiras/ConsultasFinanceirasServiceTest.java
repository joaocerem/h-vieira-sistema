package br.com.joaocerem.hvieira_financeiro.application.consultasfinanceiras;

import br.com.joaocerem.hvieira_financeiro.domain.conciliacaobancaria.VinculoConciliacaoRepository;
import br.com.joaocerem.hvieira_financeiro.domain.lancamentofinanceiro.LancamentoFinanceiroRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ConsultasFinanceirasServiceTest {

    @Mock
    private LancamentoFinanceiroRepository lancamentoFinanceiroRepository;
    @Mock
    private VinculoConciliacaoRepository vinculoConciliacaoRepository;

    private ConsultasFinanceirasService service;

    private void iniciar() {
        service = new ConsultasFinanceirasService(lancamentoFinanceiroRepository, vinculoConciliacaoRepository);
    }

    @Test
    void calcularRealizadoDeveSomarLancamentosConciliadosPorTipoESubtrairResultado() {
        iniciar();
        UUID empresaId = UUID.randomUUID();
        when(vinculoConciliacaoRepository.somarValorConciliadoPorTipo("Despesa", empresaId)).thenReturn(new BigDecimal("18000.00"));
        when(vinculoConciliacaoRepository.somarValorConciliadoPorTipo("Receita", empresaId)).thenReturn(new BigDecimal("30000.00"));

        ResultadoFinanceiro resultado = service.calcularRealizado(empresaId);

        assertThat(resultado.despesas()).isEqualByComparingTo("18000.00");
        assertThat(resultado.receitas()).isEqualByComparingTo("30000.00");
        assertThat(resultado.resultado()).isEqualByComparingTo("12000.00");
    }

    @Test
    void calcularProjetadoDeveSomarLancamentosPorTipoESubtrairResultado() {
        iniciar();
        UUID empresaId = UUID.randomUUID();
        when(lancamentoFinanceiroRepository.somarValorProjetadoPorTipo("Despesa", empresaId)).thenReturn(new BigDecimal("5000.00"));
        when(lancamentoFinanceiroRepository.somarValorProjetadoPorTipo("Receita", empresaId)).thenReturn(new BigDecimal("2000.00"));

        ResultadoFinanceiro resultado = service.calcularProjetado(empresaId);

        assertThat(resultado.despesas()).isEqualByComparingTo("5000.00");
        assertThat(resultado.receitas()).isEqualByComparingTo("2000.00");
        assertThat(resultado.resultado()).isEqualByComparingTo("-3000.00");
    }

    @Test
    void calcularRealizadoComEmpresaIdNuloDeveSomarTodasAsEmpresas() {
        iniciar();
        when(vinculoConciliacaoRepository.somarValorConciliadoPorTipo("Despesa", null)).thenReturn(BigDecimal.ZERO);
        when(vinculoConciliacaoRepository.somarValorConciliadoPorTipo("Receita", null)).thenReturn(new BigDecimal("100.00"));

        ResultadoFinanceiro resultado = service.calcularRealizado(null);

        assertThat(resultado.resultado()).isEqualByComparingTo("100.00");
    }
}
