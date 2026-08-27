package br.com.joaocerem.hvieira_financeiro.application.compracartao;

import br.com.joaocerem.hvieira_financeiro.application.cartaocredito.CartaoCreditoService;
import br.com.joaocerem.hvieira_financeiro.application.categoria.CategoriaService;
import br.com.joaocerem.hvieira_financeiro.application.fornecedor.FornecedorService;
import br.com.joaocerem.hvieira_financeiro.application.frota.VeiculoService;
import br.com.joaocerem.hvieira_financeiro.application.lancamentofinanceiro.LancamentoFinanceiroService;
import br.com.joaocerem.hvieira_financeiro.application.obra.ObraService;
import br.com.joaocerem.hvieira_financeiro.application.parcela.ParcelaService;
import br.com.joaocerem.hvieira_financeiro.application.rateio.RateioDespesaService;
import br.com.joaocerem.hvieira_financeiro.common.exception.BusinessException;
import br.com.joaocerem.hvieira_financeiro.domain.cartaocredito.CartaoCredito;
import br.com.joaocerem.hvieira_financeiro.domain.categoria.Categoria;
import br.com.joaocerem.hvieira_financeiro.domain.compracartao.CompraCartao;
import br.com.joaocerem.hvieira_financeiro.domain.compracartao.CompraCartaoRepository;
import br.com.joaocerem.hvieira_financeiro.domain.contabancaria.ContaBancaria;
import br.com.joaocerem.hvieira_financeiro.domain.empresa.Empresa;
import br.com.joaocerem.hvieira_financeiro.domain.fornecedor.Fornecedor;
import br.com.joaocerem.hvieira_financeiro.domain.lancamentofinanceiro.LancamentoFinanceiro;
import br.com.joaocerem.hvieira_financeiro.domain.parcela.Parcela;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CompraCartaoServiceTest {

    @Mock
    private CompraCartaoRepository repository;
    @Mock
    private CartaoCreditoService cartaoCreditoService;
    @Mock
    private FornecedorService fornecedorService;
    @Mock
    private CategoriaService categoriaService;
    @Mock
    private ObraService obraService;
    @Mock
    private VeiculoService veiculoService;
    @Mock
    private ParcelaService parcelaService;
    @Mock
    private LancamentoFinanceiroService lancamentoFinanceiroService;
    @Mock
    private RateioDespesaService rateioDespesaService;

    private CompraCartaoService service;

    private void iniciar() {
        service = new CompraCartaoService(repository, cartaoCreditoService, fornecedorService, categoriaService,
                obraService, veiculoService, parcelaService, lancamentoFinanceiroService, rateioDespesaService);
    }

    private CartaoCredito cartao() {
        Empresa empresa = new Empresa("H Vieira");
        ContaBancaria conta = new ContaBancaria(empresa, "Banco do Brasil", "Conta Principal");
        return new CartaoCredito(conta, "Nubank", "Cartão PJ", 20, 5);
    }

    @Test
    void criarDeveSalvarCompraEGerarParcelas() {
        iniciar();
        UUID cartaoId = UUID.randomUUID();
        UUID fornecedorId = UUID.randomUUID();
        UUID categoriaId = UUID.randomUUID();
        CartaoCredito cartao = cartao();
        Fornecedor fornecedor = new Fornecedor("Posto Ipiranga");
        Categoria categoria = new Categoria("Combustível", "Despesa");
        when(cartaoCreditoService.buscarPorId(cartaoId)).thenReturn(cartao);
        when(fornecedorService.buscarPorId(fornecedorId)).thenReturn(fornecedor);
        when(categoriaService.buscarPorId(categoriaId)).thenReturn(categoria);
        when(repository.save(any(CompraCartao.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CompraCartao compra = service.criar(cartaoId, fornecedorId, new BigDecimal("300.00"), LocalDate.of(2026, 3, 10),
                categoriaId, "Terraplanagem", null, null, 3);

        assertThat(compra.getNumeroParcelas()).isEqualTo(3);
        verify(parcelaService).gerarParcelasParaCompra(compra);
    }

    @Test
    void criarComValorNegativoDeveLancarExcecao() {
        iniciar();
        assertThatThrownBy(() -> service.criar(UUID.randomUUID(), UUID.randomUUID(), new BigDecimal("-10.00"),
                LocalDate.now(), UUID.randomUUID(), null, null, null, 1))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void criarComClassificacaoInvalidaDeveLancarExcecao() {
        iniciar();
        assertThatThrownBy(() -> service.criar(UUID.randomUUID(), UUID.randomUUID(), new BigDecimal("10.00"),
                LocalDate.now(), UUID.randomUUID(), "Inválida", null, null, 1))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void criarComNumeroParcelasZeroDeveLancarExcecao() {
        iniciar();
        assertThatThrownBy(() -> service.criar(UUID.randomUUID(), UUID.randomUUID(), new BigDecimal("10.00"),
                LocalDate.now(), UUID.randomUUID(), null, null, null, 0))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void atualizarDevePropagarParaLancamentoSemRateioVinculado() {
        iniciar();
        UUID id = UUID.randomUUID();
        UUID fornecedorId = UUID.randomUUID();
        UUID categoriaId = UUID.randomUUID();
        CartaoCredito cartao = cartao();
        Categoria categoriaAntiga = new Categoria("Combustível", "Despesa");
        Categoria categoriaNova = new Categoria("Manutenção", "Despesa");
        ReflectionTestUtils.setField(categoriaNova, "id", categoriaId);
        Fornecedor fornecedor = new Fornecedor("Posto Ipiranga");
        CompraCartao compra = new CompraCartao(cartao, fornecedor, new BigDecimal("100.00"), LocalDate.of(2026, 3, 10),
                categoriaAntiga, "Terraplanagem", null, null, 1);
        ReflectionTestUtils.setField(compra, "id", id);

        LancamentoFinanceiro lancamento = new LancamentoFinanceiro("Despesa", cartao.getContaBancaria().getEmpresa(),
                categoriaAntiga, fornecedor, null, null, null, new BigDecimal("100.00"), LocalDate.of(2026, 3, 10),
                LocalDate.of(2026, 3, 5), "Cartão via Parcela", null, null);
        UUID lancamentoId = UUID.randomUUID();
        ReflectionTestUtils.setField(lancamento, "id", lancamentoId);
        Parcela parcela = new Parcela("Compra Cartão", compra, 1, 1, new BigDecimal("100.00"), LocalDate.of(2026, 3, 5));
        parcela.vincularLancamento(lancamento);

        when(repository.findById(id)).thenReturn(java.util.Optional.of(compra));
        when(repository.save(any(CompraCartao.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fornecedorService.buscarPorId(fornecedorId)).thenReturn(fornecedor);
        when(categoriaService.buscarPorId(categoriaId)).thenReturn(categoriaNova);
        when(parcelaService.listarPorCompraCartao(id)).thenReturn(List.of(parcela));
        when(rateioDespesaService.existeRateioParaLancamento(lancamentoId)).thenReturn(false);

        service.atualizar(id, fornecedorId, LocalDate.of(2026, 3, 10), categoriaId, "Terraplanagem", null, null);

        verify(lancamentoFinanceiroService).atualizar(eq(lancamentoId), any(), eq(categoriaId), any(), any(), any(), any(), any(), any(), any(), any(), any());
    }

    @Test
    void atualizarNaoDevePropagarParaLancamentoComRateioVinculado() {
        iniciar();
        UUID id = UUID.randomUUID();
        UUID fornecedorId = UUID.randomUUID();
        UUID categoriaId = UUID.randomUUID();
        CartaoCredito cartao = cartao();
        Categoria categoriaAntiga = new Categoria("Combustível", "Despesa");
        Fornecedor fornecedor = new Fornecedor("Posto Ipiranga");
        CompraCartao compra = new CompraCartao(cartao, fornecedor, new BigDecimal("100.00"), LocalDate.of(2026, 3, 10),
                categoriaAntiga, "Terraplanagem", null, null, 1);
        ReflectionTestUtils.setField(compra, "id", id);

        LancamentoFinanceiro lancamento = new LancamentoFinanceiro("Despesa", cartao.getContaBancaria().getEmpresa(),
                categoriaAntiga, fornecedor, null, null, null, new BigDecimal("100.00"), LocalDate.of(2026, 3, 10),
                LocalDate.of(2026, 3, 5), "Cartão via Parcela", null, null);
        UUID lancamentoId = UUID.randomUUID();
        ReflectionTestUtils.setField(lancamento, "id", lancamentoId);
        Parcela parcela = new Parcela("Compra Cartão", compra, 1, 1, new BigDecimal("100.00"), LocalDate.of(2026, 3, 5));
        parcela.vincularLancamento(lancamento);

        when(repository.findById(id)).thenReturn(java.util.Optional.of(compra));
        when(repository.save(any(CompraCartao.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fornecedorService.buscarPorId(fornecedorId)).thenReturn(fornecedor);
        when(categoriaService.buscarPorId(categoriaId)).thenReturn(new Categoria("Manutenção", "Despesa"));
        when(parcelaService.listarPorCompraCartao(id)).thenReturn(List.of(parcela));
        when(rateioDespesaService.existeRateioParaLancamento(lancamentoId)).thenReturn(true);

        service.atualizar(id, fornecedorId, LocalDate.of(2026, 3, 10), categoriaId, "Terraplanagem", null, null);

        verify(lancamentoFinanceiroService, never()).atualizar(any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any());
    }
}
