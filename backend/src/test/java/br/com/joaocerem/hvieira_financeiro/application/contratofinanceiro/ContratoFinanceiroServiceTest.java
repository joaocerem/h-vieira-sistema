package br.com.joaocerem.hvieira_financeiro.application.contratofinanceiro;

import br.com.joaocerem.hvieira_financeiro.application.contabancaria.ContaBancariaService;
import br.com.joaocerem.hvieira_financeiro.application.empresa.EmpresaService;
import br.com.joaocerem.hvieira_financeiro.application.fornecedor.FornecedorService;
import br.com.joaocerem.hvieira_financeiro.application.frota.VeiculoService;
import br.com.joaocerem.hvieira_financeiro.application.parcela.ParcelaService;
import br.com.joaocerem.hvieira_financeiro.common.exception.BusinessException;
import br.com.joaocerem.hvieira_financeiro.common.exception.ResourceNotFoundException;
import br.com.joaocerem.hvieira_financeiro.domain.contabancaria.ContaBancaria;
import br.com.joaocerem.hvieira_financeiro.domain.contratofinanceiro.ContratoFinanceiro;
import br.com.joaocerem.hvieira_financeiro.domain.contratofinanceiro.ContratoFinanceiroRepository;
import br.com.joaocerem.hvieira_financeiro.domain.empresa.Empresa;
import br.com.joaocerem.hvieira_financeiro.domain.fornecedor.Fornecedor;
import br.com.joaocerem.hvieira_financeiro.domain.frota.Veiculo;
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
class ContratoFinanceiroServiceTest {

    @Mock
    private ContratoFinanceiroRepository repository;
    @Mock
    private EmpresaService empresaService;
    @Mock
    private ContaBancariaService contaBancariaService;
    @Mock
    private FornecedorService fornecedorService;
    @Mock
    private VeiculoService veiculoService;
    @Mock
    private ParcelaService parcelaService;

    private ContratoFinanceiroService service;
    private Empresa empresa;
    private ContaBancaria contaBancaria;
    private Fornecedor fornecedor;

    private void iniciar() {
        service = new ContratoFinanceiroService(repository, empresaService, contaBancariaService, fornecedorService, veiculoService, parcelaService);
        empresa = new Empresa("H Vieira");
        contaBancaria = new ContaBancaria(empresa, "Banco do Brasil", "Conta Principal");
        fornecedor = new Fornecedor("Banco do Brasil S.A.");
    }

    private void stubReferencias(UUID empresaId, UUID contaBancariaId, UUID fornecedorId) {
        when(empresaService.buscarPorId(empresaId)).thenReturn(empresa);
        when(contaBancariaService.buscarPorId(contaBancariaId)).thenReturn(contaBancaria);
        when(fornecedorService.buscarPorId(fornecedorId)).thenReturn(fornecedor);
        when(repository.save(any(ContratoFinanceiro.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void criarFinanciamentoValidoDeveSerAceitoEGerarParcelas() {
        iniciar();
        UUID empresaId = UUID.randomUUID();
        UUID contaBancariaId = UUID.randomUUID();
        UUID fornecedorId = UUID.randomUUID();
        stubReferencias(empresaId, contaBancariaId, fornecedorId);

        ContratoFinanceiro contrato = service.criar("Financiamento", empresaId, contaBancariaId, fornecedorId,
                new BigDecimal("300.00"), 3, LocalDate.of(2026, 2, 15), new BigDecimal("1.5"), null, null, null);

        assertThat(contrato.getTaxa()).isEqualByComparingTo("1.5");
        assertThat(contrato.getContemplado()).isNull();
        org.mockito.Mockito.verify(parcelaService).gerarParcelasParaContrato(contrato);
    }

    @Test
    void criarFinanciamentoSemTaxaDeveLancarExcecao() {
        iniciar();
        assertThatThrownBy(() -> service.criar("Financiamento", UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                new BigDecimal("300.00"), 3, LocalDate.of(2026, 2, 15), null, null, null, null))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void criarFinanciamentoComGrupoCotaDeveLancarExcecao() {
        iniciar();
        assertThatThrownBy(() -> service.criar("Financiamento", UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                new BigDecimal("300.00"), 3, LocalDate.of(2026, 2, 15), new BigDecimal("1.5"), "Grupo 10", null, null))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void criarConsorcioValidoDeveSerAceito() {
        iniciar();
        UUID empresaId = UUID.randomUUID();
        UUID contaBancariaId = UUID.randomUUID();
        UUID fornecedorId = UUID.randomUUID();
        stubReferencias(empresaId, contaBancariaId, fornecedorId);

        ContratoFinanceiro contrato = service.criar("Consórcio", empresaId, contaBancariaId, fornecedorId,
                new BigDecimal("300.00"), 3, LocalDate.of(2026, 2, 15), null, "Grupo 10 Cota 5", null, null);

        assertThat(contrato.getGrupoCota()).isEqualTo("Grupo 10 Cota 5");
        assertThat(contrato.getContemplado()).isFalse();
    }

    @Test
    void criarConsorcioSemGrupoCotaDeveLancarExcecao() {
        iniciar();
        assertThatThrownBy(() -> service.criar("Consórcio", UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                new BigDecimal("300.00"), 3, LocalDate.of(2026, 2, 15), null, null, null, null))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void criarConsorcioComTaxaDeveLancarExcecao() {
        iniciar();
        assertThatThrownBy(() -> service.criar("Consórcio", UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                new BigDecimal("300.00"), 3, LocalDate.of(2026, 2, 15), new BigDecimal("1.0"), "Grupo 10", null, null))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void criarConsorcioComVeiculoSemContempladoDeveLancarExcecao() {
        iniciar();
        assertThatThrownBy(() -> service.criar("Consórcio", UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                new BigDecimal("300.00"), 3, LocalDate.of(2026, 2, 15), null, "Grupo 10", false, UUID.randomUUID()))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void criarConsorcioComVeiculoEContempladoDeveSerAceito() {
        iniciar();
        UUID empresaId = UUID.randomUUID();
        UUID contaBancariaId = UUID.randomUUID();
        UUID fornecedorId = UUID.randomUUID();
        UUID veiculoId = UUID.randomUUID();
        stubReferencias(empresaId, contaBancariaId, fornecedorId);
        Veiculo veiculo = new Veiculo(empresa, "Caminhão 01", "Caminhão", null);
        when(veiculoService.buscarPorId(veiculoId)).thenReturn(veiculo);

        ContratoFinanceiro contrato = service.criar("Consórcio", empresaId, contaBancariaId, fornecedorId,
                new BigDecimal("300.00"), 3, LocalDate.of(2026, 2, 15), null, "Grupo 10", true, veiculoId);

        assertThat(contrato.getVeiculo()).isSameAs(veiculo);
        assertThat(contrato.getContemplado()).isTrue();
    }

    @Test
    void criarComTipoInvalidoDeveLancarExcecao() {
        iniciar();
        assertThatThrownBy(() -> service.criar("Outro", UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                new BigDecimal("300.00"), 3, LocalDate.of(2026, 2, 15), null, null, null, null))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void criarComNumeroParcelasZeroDeveLancarExcecao() {
        iniciar();
        assertThatThrownBy(() -> service.criar("Financiamento", UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                new BigDecimal("300.00"), 0, LocalDate.of(2026, 2, 15), new BigDecimal("1.0"), null, null, null))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void atualizarVeiculoEmConsorcioNaoContempladoDeveLancarExcecao() {
        iniciar();
        UUID id = UUID.randomUUID();
        ContratoFinanceiro contrato = new ContratoFinanceiro("Consórcio", empresa, contaBancaria, fornecedor,
                new BigDecimal("300.00"), 3, LocalDate.of(2026, 2, 15), null, "Grupo 10", false, null);
        ReflectionTestUtils.setField(contrato, "id", id);
        when(repository.findById(id)).thenReturn(Optional.of(contrato));
        when(fornecedorService.buscarPorId(any())).thenReturn(fornecedor);

        assertThatThrownBy(() -> service.atualizar(id, UUID.randomUUID(), UUID.randomUUID()))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void contemplarConsorcioNaoContempladoDeveSerAceito() {
        iniciar();
        UUID id = UUID.randomUUID();
        ContratoFinanceiro contrato = new ContratoFinanceiro("Consórcio", empresa, contaBancaria, fornecedor,
                new BigDecimal("300.00"), 3, LocalDate.of(2026, 2, 15), null, "Grupo 10", false, null);
        ReflectionTestUtils.setField(contrato, "id", id);
        when(repository.findById(id)).thenReturn(Optional.of(contrato));
        when(repository.save(any(ContratoFinanceiro.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ContratoFinanceiro contemplado = service.contemplar(id);

        assertThat(contemplado.getContemplado()).isTrue();
    }

    @Test
    void contemplarJaContempladoDeveLancarExcecao() {
        iniciar();
        UUID id = UUID.randomUUID();
        ContratoFinanceiro contrato = new ContratoFinanceiro("Consórcio", empresa, contaBancaria, fornecedor,
                new BigDecimal("300.00"), 3, LocalDate.of(2026, 2, 15), null, "Grupo 10", true, null);
        ReflectionTestUtils.setField(contrato, "id", id);
        when(repository.findById(id)).thenReturn(Optional.of(contrato));

        assertThatThrownBy(() -> service.contemplar(id)).isInstanceOf(BusinessException.class);
    }

    @Test
    void contemplarFinanciamentoDeveLancarExcecao() {
        iniciar();
        UUID id = UUID.randomUUID();
        ContratoFinanceiro contrato = new ContratoFinanceiro("Financiamento", empresa, contaBancaria, fornecedor,
                new BigDecimal("300.00"), 3, LocalDate.of(2026, 2, 15), new BigDecimal("1.0"), null, null, null);
        ReflectionTestUtils.setField(contrato, "id", id);
        when(repository.findById(id)).thenReturn(Optional.of(contrato));

        assertThatThrownBy(() -> service.contemplar(id)).isInstanceOf(BusinessException.class);
    }

    @Test
    void buscarPorIdDeveLancarExcecaoQuandoNaoEncontrado() {
        iniciar();
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscarPorId(id)).isInstanceOf(ResourceNotFoundException.class);
    }
}
