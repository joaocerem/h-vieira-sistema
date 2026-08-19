package br.com.joaocerem.hvieira_financeiro.application.rateio;

import br.com.joaocerem.hvieira_financeiro.application.lancamentofinanceiro.LancamentoFinanceiroService;
import br.com.joaocerem.hvieira_financeiro.application.obra.ObraService;
import br.com.joaocerem.hvieira_financeiro.common.exception.BusinessException;
import br.com.joaocerem.hvieira_financeiro.common.exception.ResourceNotFoundException;
import br.com.joaocerem.hvieira_financeiro.domain.categoria.Categoria;
import br.com.joaocerem.hvieira_financeiro.domain.cliente.Cliente;
import br.com.joaocerem.hvieira_financeiro.domain.empresa.Empresa;
import br.com.joaocerem.hvieira_financeiro.domain.fornecedor.Fornecedor;
import br.com.joaocerem.hvieira_financeiro.domain.lancamentofinanceiro.LancamentoFinanceiro;
import br.com.joaocerem.hvieira_financeiro.domain.obra.Obra;
import br.com.joaocerem.hvieira_financeiro.domain.rateio.RateioDespesa;
import br.com.joaocerem.hvieira_financeiro.domain.rateio.RateioDespesaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RateioDespesaServiceTest {

    @Mock
    private RateioDespesaRepository repository;
    @Mock
    private LancamentoFinanceiroService lancamentoFinanceiroService;
    @Mock
    private ObraService obraService;

    private RateioDespesaService service;
    private Obra obra;

    private void iniciar() {
        service = new RateioDespesaService(repository, lancamentoFinanceiroService, obraService);
        obra = new Obra(new Cliente("Construtora ABC"), "Obra X", new BigDecimal("500000.00"),
                LocalDate.now(), LocalDate.now().plusMonths(6), null);
    }

    private LancamentoFinanceiro lancamentoComId(UUID id, BigDecimal valor, UUID obraId) {
        LancamentoFinanceiro lancamento = new LancamentoFinanceiro("Despesa", new Empresa("H Vieira"),
                new Categoria("Combustível", "Despesa"), new Fornecedor("Posto Ipiranga"), null, obraId, null,
                valor, LocalDate.now(), LocalDate.now().plusDays(30), "Manual");
        ReflectionTestUtils.setField(lancamento, "id", id);
        return lancamento;
    }

    @Test
    void criarComLancamentoSemObraDiretaDeveSerAceito() {
        iniciar();
        UUID lancamentoId = UUID.randomUUID();
        UUID obraId = UUID.randomUUID();
        LancamentoFinanceiro lancamento = lancamentoComId(lancamentoId, new BigDecimal("100.00"), null);
        when(lancamentoFinanceiroService.buscarPorId(lancamentoId)).thenReturn(lancamento);
        when(obraService.buscarPorId(obraId)).thenReturn(obra);
        when(repository.somarValorRateadoPorLancamento(lancamentoId)).thenReturn(BigDecimal.ZERO);
        when(repository.save(any(RateioDespesa.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RateioDespesa rateio = service.criar(lancamentoId, obraId, new BigDecimal("60.00"), "50/50");

        assertThat(rateio.getValorRateado()).isEqualByComparingTo("60.00");
    }

    @Test
    void criarComLancamentoComObraDiretaDeveLancarExcecao() {
        iniciar();
        UUID lancamentoId = UUID.randomUUID();
        LancamentoFinanceiro lancamento = lancamentoComId(lancamentoId, new BigDecimal("100.00"), UUID.randomUUID());
        when(lancamentoFinanceiroService.buscarPorId(lancamentoId)).thenReturn(lancamento);

        assertThatThrownBy(() -> service.criar(lancamentoId, UUID.randomUUID(), new BigDecimal("60.00"), null))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void criarComSomaUltrapassandoValorDoLancamentoDeveLancarExcecao() {
        iniciar();
        UUID lancamentoId = UUID.randomUUID();
        UUID obraId = UUID.randomUUID();
        LancamentoFinanceiro lancamento = lancamentoComId(lancamentoId, new BigDecimal("100.00"), null);
        when(lancamentoFinanceiroService.buscarPorId(lancamentoId)).thenReturn(lancamento);
        when(obraService.buscarPorId(obraId)).thenReturn(obra);
        when(repository.somarValorRateadoPorLancamento(lancamentoId)).thenReturn(new BigDecimal("80.00"));

        assertThatThrownBy(() -> service.criar(lancamentoId, obraId, new BigDecimal("30.00"), null))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void criarComLancamentoCanceladoDeveLancarExcecao() {
        iniciar();
        UUID lancamentoId = UUID.randomUUID();
        LancamentoFinanceiro lancamento = lancamentoComId(lancamentoId, new BigDecimal("100.00"), null);
        lancamento.cancelar();
        when(lancamentoFinanceiroService.buscarPorId(lancamentoId)).thenReturn(lancamento);

        assertThatThrownBy(() -> service.criar(lancamentoId, UUID.randomUUID(), new BigDecimal("60.00"), null))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void criarComValorNegativoDeveLancarExcecao() {
        iniciar();
        assertThatThrownBy(() -> service.criar(UUID.randomUUID(), UUID.randomUUID(), new BigDecimal("-1.00"), null))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void buscarPorIdDeveLancarExcecaoQuandoNaoEncontrado() {
        iniciar();
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscarPorId(id)).isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void atualizarComSomaOutrosRateiosUltrapassandoValorDeveLancarExcecao() {
        iniciar();
        UUID id = UUID.randomUUID();
        UUID lancamentoId = UUID.randomUUID();
        LancamentoFinanceiro lancamento = lancamentoComId(lancamentoId, new BigDecimal("100.00"), null);
        RateioDespesa existente = new RateioDespesa(lancamento, obra, new BigDecimal("20.00"), null);
        when(repository.findById(id)).thenReturn(Optional.of(existente));
        when(repository.somarValorRateadoPorLancamentoExcluindo(lancamentoId, id)).thenReturn(new BigDecimal("70.00"));

        assertThatThrownBy(() -> service.atualizar(id, new BigDecimal("40.00"), null))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void atualizarDentroDoLimiteDeveSerAceito() {
        iniciar();
        UUID id = UUID.randomUUID();
        UUID lancamentoId = UUID.randomUUID();
        LancamentoFinanceiro lancamento = lancamentoComId(lancamentoId, new BigDecimal("100.00"), null);
        RateioDespesa existente = new RateioDespesa(lancamento, obra, new BigDecimal("20.00"), null);
        when(repository.findById(id)).thenReturn(Optional.of(existente));
        when(repository.somarValorRateadoPorLancamentoExcluindo(lancamentoId, id)).thenReturn(new BigDecimal("30.00"));
        when(repository.save(any(RateioDespesa.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RateioDespesa atualizado = service.atualizar(id, new BigDecimal("50.00"), "novo critério");

        assertThat(atualizado.getValorRateado()).isEqualByComparingTo("50.00");
        assertThat(atualizado.getCriterioInformado()).isEqualTo("novo critério");
    }
}
