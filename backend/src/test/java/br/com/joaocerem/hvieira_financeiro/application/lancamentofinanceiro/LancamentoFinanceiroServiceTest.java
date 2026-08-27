package br.com.joaocerem.hvieira_financeiro.application.lancamentofinanceiro;

import br.com.joaocerem.hvieira_financeiro.application.categoria.CategoriaService;
import br.com.joaocerem.hvieira_financeiro.application.cliente.ClienteService;
import br.com.joaocerem.hvieira_financeiro.application.empresa.EmpresaService;
import br.com.joaocerem.hvieira_financeiro.application.fornecedor.FornecedorService;
import br.com.joaocerem.hvieira_financeiro.application.frota.VeiculoService;
import br.com.joaocerem.hvieira_financeiro.application.obra.ObraService;
import br.com.joaocerem.hvieira_financeiro.common.exception.BusinessException;
import br.com.joaocerem.hvieira_financeiro.common.exception.ResourceNotFoundException;
import br.com.joaocerem.hvieira_financeiro.domain.aplicacaodeliquidacao.AplicacaoDeLiquidacaoRepository;
import br.com.joaocerem.hvieira_financeiro.domain.categoria.Categoria;
import br.com.joaocerem.hvieira_financeiro.domain.cliente.Cliente;
import br.com.joaocerem.hvieira_financeiro.domain.empresa.Empresa;
import br.com.joaocerem.hvieira_financeiro.domain.fornecedor.Fornecedor;
import br.com.joaocerem.hvieira_financeiro.domain.frota.Veiculo;
import br.com.joaocerem.hvieira_financeiro.domain.lancamentofinanceiro.LancamentoFinanceiro;
import br.com.joaocerem.hvieira_financeiro.domain.lancamentofinanceiro.LancamentoFinanceiroRepository;
import br.com.joaocerem.hvieira_financeiro.domain.obra.Obra;
import br.com.joaocerem.hvieira_financeiro.domain.rateio.RateioDespesaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LancamentoFinanceiroServiceTest {

    @Mock
    private LancamentoFinanceiroRepository repository;
    @Mock
    private AplicacaoDeLiquidacaoRepository aplicacaoDeLiquidacaoRepository;
    @Mock
    private RateioDespesaRepository rateioDespesaRepository;
    @Mock
    private EmpresaService empresaService;
    @Mock
    private CategoriaService categoriaService;
    @Mock
    private FornecedorService fornecedorService;
    @Mock
    private ClienteService clienteService;
    @Mock
    private ObraService obraService;
    @Mock
    private VeiculoService veiculoService;

    private LancamentoFinanceiroService service;

    private Empresa empresa;
    private Categoria categoria;
    private Fornecedor fornecedor;
    private Cliente cliente;

    private void iniciar() {
        service = new LancamentoFinanceiroService(repository, aplicacaoDeLiquidacaoRepository, rateioDespesaRepository,
                empresaService, categoriaService, fornecedorService, clienteService, obraService, veiculoService);
        empresa = new Empresa("H Vieira");
        categoria = new Categoria("Combustível", "Despesa");
        fornecedor = new Fornecedor("Posto Ipiranga");
        cliente = new Cliente("Construtora ABC");
        // criarGeradoPeloSistema recebe as entidades diretamente (não IDs) — precisa de id não-nulo
        // para a validação de exclusividade fornecedor/cliente (que compara por getId()).
        ReflectionTestUtils.setField(empresa, "id", UUID.randomUUID());
        ReflectionTestUtils.setField(fornecedor, "id", UUID.randomUUID());
        ReflectionTestUtils.setField(cliente, "id", UUID.randomUUID());
    }

    @Test
    void criarDespesaComFornecedorDeveSerAceita() {
        iniciar();
        UUID empresaId = UUID.randomUUID();
        UUID categoriaId = UUID.randomUUID();
        UUID fornecedorId = UUID.randomUUID();
        when(repository.save(any(LancamentoFinanceiro.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(empresaService.buscarPorId(empresaId)).thenReturn(empresa);
        when(categoriaService.buscarPorId(categoriaId)).thenReturn(categoria);
        when(fornecedorService.buscarPorId(fornecedorId)).thenReturn(fornecedor);

        LancamentoFinanceiro lancamento = service.criar("Despesa", empresaId, categoriaId, fornecedorId, null,
                null, null, new BigDecimal("100.00"), LocalDate.now(), LocalDate.now().plusDays(30), null, null);

        assertThat(lancamento.getTipo()).isEqualTo("Despesa");
        assertThat(lancamento.getFornecedor()).isSameAs(fornecedor);
        assertThat(lancamento.getCliente()).isNull();
        assertThat(lancamento.getOrigem()).isEqualTo("Manual");
        assertThat(lancamento.getSituacaoAdministrativa()).isEqualTo("Ativo");
    }

    @Test
    void criarDespesaSemFornecedorDeveLancarExcecao() {
        iniciar();
        assertThatThrownBy(() -> service.criar("Despesa", UUID.randomUUID(), UUID.randomUUID(), null, null,
                null, null, new BigDecimal("100.00"), LocalDate.now(), LocalDate.now().plusDays(30), null, null))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void criarDespesaComClienteEFornecedorDeveLancarExcecao() {
        iniciar();
        assertThatThrownBy(() -> service.criar("Despesa", UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                null, null, new BigDecimal("100.00"), LocalDate.now(), LocalDate.now().plusDays(30), null, null))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void criarComTipoInvalidoDeveLancarExcecao() {
        iniciar();
        assertThatThrownBy(() -> service.criar("Outro", UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), null,
                null, null, new BigDecimal("100.00"), LocalDate.now(), LocalDate.now().plusDays(30), null, null))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void criarComValorNegativoDeveLancarExcecao() {
        iniciar();
        assertThatThrownBy(() -> service.criar("Despesa", UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), null,
                null, null, new BigDecimal("-1.00"), LocalDate.now(), LocalDate.now().plusDays(30), null, null))
                .isInstanceOf(BusinessException.class);
    }

    // --- criarGeradoPeloSistema (achado M3 da auditoria arquitetural) ---

    @Test
    void criarGeradoPeloSistemaComDespesaEFornecedorDeveSerAceito() {
        iniciar();
        when(repository.save(any(LancamentoFinanceiro.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LancamentoFinanceiro lancamento = service.criarGeradoPeloSistema("Despesa", empresa, categoria, fornecedor, null,
                null, null, new BigDecimal("100.00"), LocalDate.now(), LocalDate.now().plusDays(30), "Cartão via Parcela");

        assertThat(lancamento.getTipo()).isEqualTo("Despesa");
        assertThat(lancamento.getEmpresa()).isSameAs(empresa);
        assertThat(lancamento.getCategoria()).isSameAs(categoria);
        assertThat(lancamento.getFornecedor()).isSameAs(fornecedor);
        assertThat(lancamento.getOrigem()).isEqualTo("Cartão via Parcela");
        assertThat(lancamento.getSituacaoAdministrativa()).isEqualTo("Ativo");
    }

    @Test
    void criarGeradoPeloSistemaComReceitaEClienteDeveSerAceito() {
        iniciar();
        when(repository.save(any(LancamentoFinanceiro.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LancamentoFinanceiro lancamento = service.criarGeradoPeloSistema("Receita", empresa, categoria, null, cliente,
                null, null, new BigDecimal("100.00"), LocalDate.now(), LocalDate.now().plusDays(30), "Contrato Financeiro via Parcela");

        assertThat(lancamento.getTipo()).isEqualTo("Receita");
        assertThat(lancamento.getCliente()).isSameAs(cliente);
        assertThat(lancamento.getFornecedor()).isNull();
        assertThat(lancamento.getOrigem()).isEqualTo("Contrato Financeiro via Parcela");
    }

    @Test
    void criarGeradoPeloSistemaComTipoInvalidoDeveLancarExcecao() {
        iniciar();
        assertThatThrownBy(() -> service.criarGeradoPeloSistema("Outro", empresa, categoria, fornecedor, null,
                null, null, new BigDecimal("100.00"), LocalDate.now(), LocalDate.now().plusDays(30), "Cartão via Parcela"))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void criarGeradoPeloSistemaComDespesaSemFornecedorDeveLancarExcecao() {
        iniciar();
        assertThatThrownBy(() -> service.criarGeradoPeloSistema("Despesa", empresa, categoria, null, null,
                null, null, new BigDecimal("100.00"), LocalDate.now(), LocalDate.now().plusDays(30), "Cartão via Parcela"))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void criarGeradoPeloSistemaComDespesaEClienteDeveLancarExcecao() {
        iniciar();
        assertThatThrownBy(() -> service.criarGeradoPeloSistema("Despesa", empresa, categoria, fornecedor, cliente,
                null, null, new BigDecimal("100.00"), LocalDate.now(), LocalDate.now().plusDays(30), "Cartão via Parcela"))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void criarGeradoPeloSistemaComValorNegativoDeveLancarExcecao() {
        iniciar();
        assertThatThrownBy(() -> service.criarGeradoPeloSistema("Despesa", empresa, categoria, fornecedor, null,
                null, null, new BigDecimal("-1.00"), LocalDate.now(), LocalDate.now().plusDays(30), "Cartão via Parcela"))
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
    void atualizarValorDeveSerBloqueadoQuandoExisteAplicacaoVinculada() {
        iniciar();
        UUID id = UUID.randomUUID();
        UUID empresaId = UUID.randomUUID();
        UUID categoriaId = UUID.randomUUID();
        UUID fornecedorId = UUID.randomUUID();
        LancamentoFinanceiro existente = new LancamentoFinanceiro("Despesa", empresa, categoria, fornecedor, null,
                null, null, new BigDecimal("100.00"), LocalDate.now(), LocalDate.now().plusDays(30), "Manual", null, null);
        when(repository.findById(id)).thenReturn(Optional.of(existente));
        when(aplicacaoDeLiquidacaoRepository.somarValorAplicadoPorLancamento(id)).thenReturn(new BigDecimal("50.00"));

        assertThatThrownBy(() -> service.atualizar(id, empresaId, categoriaId, fornecedorId, null, null, null,
                new BigDecimal("200.00"), LocalDate.now(), LocalDate.now().plusDays(30), null, null))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void atualizarValorDevePermitidoQuandoNaoExisteAplicacaoVinculada() {
        iniciar();
        UUID id = UUID.randomUUID();
        UUID empresaId = UUID.randomUUID();
        UUID categoriaId = UUID.randomUUID();
        UUID fornecedorId = UUID.randomUUID();
        LancamentoFinanceiro existente = new LancamentoFinanceiro("Despesa", empresa, categoria, fornecedor, null,
                null, null, new BigDecimal("100.00"), LocalDate.now(), LocalDate.now().plusDays(30), "Manual", null, null);
        when(repository.findById(id)).thenReturn(Optional.of(existente));
        when(repository.save(any(LancamentoFinanceiro.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(aplicacaoDeLiquidacaoRepository.somarValorAplicadoPorLancamento(id)).thenReturn(BigDecimal.ZERO);
        when(empresaService.buscarPorId(empresaId)).thenReturn(empresa);
        when(categoriaService.buscarPorId(categoriaId)).thenReturn(categoria);
        when(fornecedorService.buscarPorId(fornecedorId)).thenReturn(fornecedor);

        LancamentoFinanceiro atualizado = service.atualizar(id, empresaId, categoriaId, fornecedorId, null, null, null,
                new BigDecimal("200.00"), LocalDate.now(), LocalDate.now().plusDays(30), null, null);

        assertThat(atualizado.getValor()).isEqualByComparingTo("200.00");
    }

    @Test
    void cancelarDeveSerBloqueadoQuandoSomaAplicadaDiferenteDeZero() {
        iniciar();
        UUID id = UUID.randomUUID();
        LancamentoFinanceiro existente = new LancamentoFinanceiro("Despesa", empresa, categoria, fornecedor, null,
                null, null, new BigDecimal("100.00"), LocalDate.now(), LocalDate.now().plusDays(30), "Manual", null, null);
        when(repository.findById(id)).thenReturn(Optional.of(existente));
        when(aplicacaoDeLiquidacaoRepository.somarValorAplicadoPorLancamento(id)).thenReturn(new BigDecimal("10.00"));

        assertThatThrownBy(() -> service.cancelar(id)).isInstanceOf(BusinessException.class);
    }

    @Test
    void cancelarDevePermitidoQuandoSomaAplicadaZero() {
        iniciar();
        UUID id = UUID.randomUUID();
        LancamentoFinanceiro existente = new LancamentoFinanceiro("Despesa", empresa, categoria, fornecedor, null,
                null, null, new BigDecimal("100.00"), LocalDate.now(), LocalDate.now().plusDays(30), "Manual", null, null);
        when(repository.findById(id)).thenReturn(Optional.of(existente));
        when(repository.save(any(LancamentoFinanceiro.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(aplicacaoDeLiquidacaoRepository.somarValorAplicadoPorLancamento(id)).thenReturn(BigDecimal.ZERO);

        LancamentoFinanceiro cancelado = service.cancelar(id);

        assertThat(cancelado.getSituacaoAdministrativa()).isEqualTo("Cancelado");
    }

    @Test
    void calcularStatusFinanceiroDeveRefletirSomaDasAplicacoes() {
        iniciar();
        LancamentoFinanceiro lancamento = new LancamentoFinanceiro("Despesa", empresa, categoria, fornecedor, null,
                null, null, new BigDecimal("100.00"), LocalDate.now(), LocalDate.now().plusDays(30), "Manual", null, null);
        lenient().when(aplicacaoDeLiquidacaoRepository.somarValorAplicadoPorLancamento(any())).thenReturn(BigDecimal.ZERO);
        assertThat(service.calcularStatusFinanceiro(lancamento)).isEqualTo("Aberto");

        when(aplicacaoDeLiquidacaoRepository.somarValorAplicadoPorLancamento(any())).thenReturn(new BigDecimal("40.00"));
        assertThat(service.calcularStatusFinanceiro(lancamento)).isEqualTo("Parcialmente Pago-Recebido");

        when(aplicacaoDeLiquidacaoRepository.somarValorAplicadoPorLancamento(any())).thenReturn(new BigDecimal("100.00"));
        assertThat(service.calcularStatusFinanceiro(lancamento)).isEqualTo("Pago-Recebido");
    }

    // --- obraId/veiculoId (achado da auditoria final da Fase 4: existência e exclusividade obra × Rateio) ---

    @Test
    void criarComObraInexistenteDevePropagarExcecao() {
        iniciar();
        UUID empresaId = UUID.randomUUID();
        UUID categoriaId = UUID.randomUUID();
        UUID fornecedorId = UUID.randomUUID();
        UUID obraId = UUID.randomUUID();
        when(empresaService.buscarPorId(empresaId)).thenReturn(empresa);
        when(categoriaService.buscarPorId(categoriaId)).thenReturn(categoria);
        when(fornecedorService.buscarPorId(fornecedorId)).thenReturn(fornecedor);
        when(obraService.buscarPorId(obraId)).thenThrow(new ResourceNotFoundException("Obra não encontrada: " + obraId));

        assertThatThrownBy(() -> service.criar("Despesa", empresaId, categoriaId, fornecedorId, null,
                obraId, null, new BigDecimal("100.00"), LocalDate.now(), LocalDate.now().plusDays(30), null, null))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void criarComVeiculoDeEmpresaDiferenteDeveLancarExcecao() {
        iniciar();
        UUID empresaId = UUID.randomUUID();
        UUID categoriaId = UUID.randomUUID();
        UUID fornecedorId = UUID.randomUUID();
        UUID veiculoId = UUID.randomUUID();
        Empresa outraEmpresa = new Empresa("Helierti");
        ReflectionTestUtils.setField(outraEmpresa, "id", UUID.randomUUID());
        Veiculo veiculo = new Veiculo(outraEmpresa, "Caminhão 01", "Caminhão", null);
        when(empresaService.buscarPorId(empresaId)).thenReturn(empresa);
        when(categoriaService.buscarPorId(categoriaId)).thenReturn(categoria);
        when(fornecedorService.buscarPorId(fornecedorId)).thenReturn(fornecedor);
        when(veiculoService.buscarPorId(veiculoId)).thenReturn(veiculo);

        assertThatThrownBy(() -> service.criar("Despesa", empresaId, categoriaId, fornecedorId, null,
                null, veiculoId, new BigDecimal("100.00"), LocalDate.now(), LocalDate.now().plusDays(30), null, null))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void criarComVeiculoDaMesmaEmpresaDeveSerAceito() {
        iniciar();
        UUID empresaId = UUID.randomUUID();
        UUID categoriaId = UUID.randomUUID();
        UUID fornecedorId = UUID.randomUUID();
        UUID veiculoId = UUID.randomUUID();
        Veiculo veiculo = new Veiculo(empresa, "Caminhão 01", "Caminhão", null);
        when(empresaService.buscarPorId(empresaId)).thenReturn(empresa);
        when(categoriaService.buscarPorId(categoriaId)).thenReturn(categoria);
        when(fornecedorService.buscarPorId(fornecedorId)).thenReturn(fornecedor);
        when(veiculoService.buscarPorId(veiculoId)).thenReturn(veiculo);
        when(repository.save(any(LancamentoFinanceiro.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LancamentoFinanceiro lancamento = service.criar("Despesa", empresaId, categoriaId, fornecedorId, null,
                null, veiculoId, new BigDecimal("100.00"), LocalDate.now(), LocalDate.now().plusDays(30), null, null);

        assertThat(lancamento.getVeiculoId()).isEqualTo(veiculoId);
    }

    @Test
    void atualizarComObraQuandoJaExisteRateioVinculadoDeveLancarExcecao() {
        iniciar();
        UUID id = UUID.randomUUID();
        UUID empresaId = UUID.randomUUID();
        UUID categoriaId = UUID.randomUUID();
        UUID fornecedorId = UUID.randomUUID();
        UUID obraId = UUID.randomUUID();
        LancamentoFinanceiro existente = new LancamentoFinanceiro("Despesa", empresa, categoria, fornecedor, null,
                null, null, new BigDecimal("100.00"), LocalDate.now(), LocalDate.now().plusDays(30), "Manual", null, null);
        when(repository.findById(id)).thenReturn(Optional.of(existente));
        when(empresaService.buscarPorId(empresaId)).thenReturn(empresa);
        when(categoriaService.buscarPorId(categoriaId)).thenReturn(categoria);
        when(fornecedorService.buscarPorId(fornecedorId)).thenReturn(fornecedor);
        when(obraService.buscarPorId(obraId)).thenReturn(new Obra(cliente, "Duplicação BR-101", new BigDecimal("500000.00"),
                LocalDate.now(), LocalDate.now().plusMonths(6), null));
        when(rateioDespesaRepository.findByLancamentoFinanceiroId(id)).thenReturn(
                List.of(new br.com.joaocerem.hvieira_financeiro.domain.rateio.RateioDespesa(existente,
                        new Obra(cliente, "Outra Obra", new BigDecimal("1.00"), LocalDate.now(), LocalDate.now(), null),
                        new BigDecimal("50.00"), null)));

        assertThatThrownBy(() -> service.atualizar(id, empresaId, categoriaId, fornecedorId, null, obraId, null,
                new BigDecimal("100.00"), LocalDate.now(), LocalDate.now().plusDays(30), null, null))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void atualizarSemObraNuncaConsultaRateioDespesaRepository() {
        iniciar();
        UUID id = UUID.randomUUID();
        UUID empresaId = UUID.randomUUID();
        UUID categoriaId = UUID.randomUUID();
        UUID fornecedorId = UUID.randomUUID();
        LancamentoFinanceiro existente = new LancamentoFinanceiro("Despesa", empresa, categoria, fornecedor, null,
                null, null, new BigDecimal("100.00"), LocalDate.now(), LocalDate.now().plusDays(30), "Manual", null, null);
        when(repository.findById(id)).thenReturn(Optional.of(existente));
        when(repository.save(any(LancamentoFinanceiro.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(empresaService.buscarPorId(empresaId)).thenReturn(empresa);
        when(categoriaService.buscarPorId(categoriaId)).thenReturn(categoria);
        when(fornecedorService.buscarPorId(fornecedorId)).thenReturn(fornecedor);

        LancamentoFinanceiro atualizado = service.atualizar(id, empresaId, categoriaId, fornecedorId, null, null, null,
                new BigDecimal("100.00"), LocalDate.now(), LocalDate.now().plusDays(30), null, null);

        assertThat(atualizado.getObraId()).isNull();
        verify(rateioDespesaRepository, never()).findByLancamentoFinanceiroId(any());
    }
}
