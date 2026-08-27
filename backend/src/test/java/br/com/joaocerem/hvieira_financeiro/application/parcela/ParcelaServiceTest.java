package br.com.joaocerem.hvieira_financeiro.application.parcela;

import br.com.joaocerem.hvieira_financeiro.application.categoria.CategoriaService;
import br.com.joaocerem.hvieira_financeiro.application.lancamentofinanceiro.LancamentoFinanceiroService;
import br.com.joaocerem.hvieira_financeiro.common.exception.BusinessException;
import br.com.joaocerem.hvieira_financeiro.common.exception.ResourceNotFoundException;
import br.com.joaocerem.hvieira_financeiro.domain.cartaocredito.CartaoCredito;
import br.com.joaocerem.hvieira_financeiro.domain.categoria.Categoria;
import br.com.joaocerem.hvieira_financeiro.domain.compracartao.CompraCartao;
import br.com.joaocerem.hvieira_financeiro.domain.contabancaria.ContaBancaria;
import br.com.joaocerem.hvieira_financeiro.domain.contratofinanceiro.ContratoFinanceiro;
import br.com.joaocerem.hvieira_financeiro.domain.empresa.Empresa;
import br.com.joaocerem.hvieira_financeiro.domain.fornecedor.Fornecedor;
import br.com.joaocerem.hvieira_financeiro.domain.frota.Veiculo;
import br.com.joaocerem.hvieira_financeiro.domain.lancamentofinanceiro.LancamentoFinanceiro;
import br.com.joaocerem.hvieira_financeiro.domain.obra.Obra;
import br.com.joaocerem.hvieira_financeiro.domain.parcela.Parcela;
import br.com.joaocerem.hvieira_financeiro.domain.parcela.ParcelaRepository;
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
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ParcelaServiceTest {

    @Mock
    private ParcelaRepository repository;
    @Mock
    private LancamentoFinanceiroService lancamentoFinanceiroService;
    @Mock
    private CategoriaService categoriaService;

    private ParcelaService service;

    private void iniciar() {
        service = new ParcelaService(repository, lancamentoFinanceiroService, categoriaService);
    }

    private CartaoCredito cartao(int diaFechamento, int diaVencimento) {
        Empresa empresa = new Empresa("H Vieira");
        ContaBancaria conta = new ContaBancaria(empresa, "Banco do Brasil", "Conta Principal");
        return new CartaoCredito(conta, "Nubank", "Cartão PJ", diaFechamento, diaVencimento);
    }

    private ContratoFinanceiro contratoFinanciamento() {
        Empresa empresa = new Empresa("H Vieira");
        ContaBancaria conta = new ContaBancaria(empresa, "Banco do Brasil", "Conta Principal");
        Fornecedor banco = new Fornecedor("Banco do Brasil S.A.");
        return new ContratoFinanceiro("Financiamento", empresa, conta, banco, new BigDecimal("300.00"), 3,
                LocalDate.of(2026, 2, 15), new BigDecimal("1.5"), null, null, null);
    }

    private ContratoFinanceiro contratoConsorcio(boolean contemplado, Veiculo veiculo) {
        Empresa empresa = new Empresa("H Vieira");
        ContaBancaria conta = new ContaBancaria(empresa, "Banco do Brasil", "Conta Principal");
        Fornecedor administradora = new Fornecedor("Consórcio Nacional");
        ContratoFinanceiro contrato = new ContratoFinanceiro("Consórcio", empresa, conta, administradora,
                new BigDecimal("300.00"), 3, LocalDate.of(2026, 2, 15), null, "Grupo 10 Cota 5", false, null);
        if (contemplado) {
            contrato.contemplar();
            contrato.setVeiculo(veiculo);
        }
        return contrato;
    }

    // --- Fórmula de divisão de valor (decisão #39) ---

    @Test
    void calcularDeveDividirCemReaisEmTresParcelasComUltimaAbsorvendoResiduo() {
        List<ParcelaCalculada> parcelas = ParcelaService.calcular(
                new BigDecimal("100.00"), 3, LocalDate.of(2026, 3, 10), 20, 5);

        assertThat(parcelas).hasSize(3);
        assertThat(parcelas.get(0).valor()).isEqualByComparingTo("33.33");
        assertThat(parcelas.get(1).valor()).isEqualByComparingTo("33.33");
        assertThat(parcelas.get(2).valor()).isEqualByComparingTo("33.34");
        BigDecimal soma = parcelas.stream().map(ParcelaCalculada::valor).reduce(BigDecimal.ZERO, BigDecimal::add);
        assertThat(soma).isEqualByComparingTo("100.00");
    }

    @Test
    void calcularComUmaParcelaDeveManterValorIntegral() {
        List<ParcelaCalculada> parcelas = ParcelaService.calcular(
                new BigDecimal("250.00"), 1, LocalDate.of(2026, 3, 10), 20, 5);

        assertThat(parcelas).hasSize(1);
        assertThat(parcelas.get(0).valor()).isEqualByComparingTo("250.00");
    }

    // --- Cálculo de vencimento (decisão #39) ---

    @Test
    void compraAntesDoFechamentoEntraNoCicloDoMesCorrente() {
        // dia 10, fechamento dia 20 -> ciclo de março -> 1ª parcela vence dia 5 de março
        List<ParcelaCalculada> parcelas = ParcelaService.calcular(
                new BigDecimal("100.00"), 1, LocalDate.of(2026, 3, 10), 20, 5);

        assertThat(parcelas.get(0).vencimento()).isEqualTo(LocalDate.of(2026, 3, 5));
    }

    @Test
    void compraAposFechamentoEntraNoCicloDoMesSeguinte() {
        // dia 25, fechamento dia 20 -> ciclo de abril -> 1ª parcela vence dia 5 de abril
        List<ParcelaCalculada> parcelas = ParcelaService.calcular(
                new BigDecimal("100.00"), 1, LocalDate.of(2026, 3, 25), 20, 5);

        assertThat(parcelas.get(0).vencimento()).isEqualTo(LocalDate.of(2026, 4, 5));
    }

    @Test
    void parcelasSeguintesVencemMensalmenteNoMesmoDia() {
        List<ParcelaCalculada> parcelas = ParcelaService.calcular(
                new BigDecimal("300.00"), 3, LocalDate.of(2026, 1, 10), 20, 15);

        assertThat(parcelas.get(0).vencimento()).isEqualTo(LocalDate.of(2026, 1, 15));
        assertThat(parcelas.get(1).vencimento()).isEqualTo(LocalDate.of(2026, 2, 15));
        assertThat(parcelas.get(2).vencimento()).isEqualTo(LocalDate.of(2026, 3, 15));
    }

    @Test
    void vencimentoDia31EmFevereiroDeveAjustarParaUltimoDiaDoMes() {
        List<ParcelaCalculada> parcelas = ParcelaService.calcular(
                new BigDecimal("200.00"), 2, LocalDate.of(2026, 1, 10), 20, 31);

        assertThat(parcelas.get(0).vencimento()).isEqualTo(LocalDate.of(2026, 1, 31));
        assertThat(parcelas.get(1).vencimento()).isEqualTo(LocalDate.of(2026, 2, 28));
    }

    // --- Cálculo de vencimento para Contrato Financeiro (decisão #40) ---

    @Test
    void calcularParaContratoDeveVencerNaDataInformadaEDepoisMensalmente() {
        List<ParcelaCalculada> parcelas = ParcelaService.calcularParaContrato(
                new BigDecimal("300.00"), 3, LocalDate.of(2026, 2, 15));

        assertThat(parcelas.get(0).vencimento()).isEqualTo(LocalDate.of(2026, 2, 15));
        assertThat(parcelas.get(1).vencimento()).isEqualTo(LocalDate.of(2026, 3, 15));
        assertThat(parcelas.get(2).vencimento()).isEqualTo(LocalDate.of(2026, 4, 15));
        assertThat(parcelas.get(0).valor()).isEqualByComparingTo("100.00");
    }

    @Test
    void calcularParaContratoComDiaInexistenteNoMesSeguinteDeveAjustar() {
        List<ParcelaCalculada> parcelas = ParcelaService.calcularParaContrato(
                new BigDecimal("200.00"), 2, LocalDate.of(2026, 1, 31));

        assertThat(parcelas.get(0).vencimento()).isEqualTo(LocalDate.of(2026, 1, 31));
        assertThat(parcelas.get(1).vencimento()).isEqualTo(LocalDate.of(2026, 2, 28));
    }

    // --- gerarParcelasParaCompra ---

    @Test
    void gerarParcelasParaCompraDevePersistirNParcelas() {
        iniciar();
        CartaoCredito cartao = cartao(20, 5);
        CompraCartao compra = new CompraCartao(cartao, new Fornecedor("Posto Ipiranga"), new BigDecimal("100.00"),
                LocalDate.of(2026, 3, 10), new Categoria("Combustível", "Despesa"), "Terraplanagem", null, null, 3);
        when(repository.save(any(Parcela.class))).thenAnswer(invocation -> invocation.getArgument(0));

        List<Parcela> parcelas = service.gerarParcelasParaCompra(compra);

        assertThat(parcelas).hasSize(3);
        assertThat(parcelas.get(0).getNumero()).isEqualTo(1);
        assertThat(parcelas.get(2).getNumero()).isEqualTo(3);
        assertThat(parcelas).allMatch(p -> p.getTotal() == 3);
    }

    // --- gerarParcelasParaContrato ---

    @Test
    void gerarParcelasParaContratoDevePersistirNParcelas() {
        iniciar();
        ContratoFinanceiro contrato = contratoFinanciamento();
        when(repository.save(any(Parcela.class))).thenAnswer(invocation -> invocation.getArgument(0));

        List<Parcela> parcelas = service.gerarParcelasParaContrato(contrato);

        assertThat(parcelas).hasSize(3);
        assertThat(parcelas.get(0).getContratoFinanceiro()).isSameAs(contrato);
        assertThat(parcelas).allMatch(p -> p.getTotal() == 3);
    }

    // --- gerarLancamento (Contrato Financeiro) ---

    @Test
    void gerarLancamentoParaFinanciamentoDeveUsarCategoriaAmortizacaoESemVeiculo() {
        iniciar();
        ContratoFinanceiro contrato = contratoFinanciamento();
        Parcela parcela = new Parcela("Contrato Financeiro", contrato, 1, 3, new BigDecimal("100.00"), LocalDate.of(2026, 2, 15));
        UUID parcelaId = UUID.randomUUID();
        ReflectionTestUtils.setField(parcela, "id", parcelaId);
        when(repository.findById(parcelaId)).thenReturn(Optional.of(parcela));
        when(repository.save(any(Parcela.class))).thenAnswer(invocation -> invocation.getArgument(0));
        Categoria categoriaAmortizacao = new Categoria("Amortização Empréstimo", "Despesa");
        when(categoriaService.buscarPorNome("Amortização Empréstimo")).thenReturn(categoriaAmortizacao);
        LancamentoFinanceiro lancamentoCriado = new LancamentoFinanceiro("Despesa", contrato.getEmpresa(),
                categoriaAmortizacao, contrato.getFornecedor(), null, null, null, new BigDecimal("100.00"),
                parcela.getVencimento(), parcela.getVencimento(), "Contrato Financeiro via Parcela", null, null);
        when(lancamentoFinanceiroService.criarGeradoPeloSistema(any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(lancamentoCriado);

        Parcela atualizada = service.gerarLancamento(parcelaId);

        assertThat(atualizada.getLancamentoFinanceiro()).isSameAs(lancamentoCriado);
    }

    @Test
    void gerarLancamentoParaConsorcioContempladoDeveHerdarVeiculo() {
        iniciar();
        Veiculo veiculo = new Veiculo(new Empresa("H Vieira"), "Caminhão 01", "Caminhão", null);
        UUID veiculoId = UUID.randomUUID();
        ReflectionTestUtils.setField(veiculo, "id", veiculoId);
        ContratoFinanceiro contrato = contratoConsorcio(true, veiculo);
        Parcela parcela = new Parcela("Contrato Financeiro", contrato, 3, 3, new BigDecimal("100.00"), LocalDate.of(2026, 4, 15));
        UUID parcelaId = UUID.randomUUID();
        ReflectionTestUtils.setField(parcela, "id", parcelaId);
        when(repository.findById(parcelaId)).thenReturn(Optional.of(parcela));
        when(repository.save(any(Parcela.class))).thenAnswer(invocation -> invocation.getArgument(0));
        Categoria categoriaConsorcios = new Categoria("Consórcios", "Despesa");
        when(categoriaService.buscarPorNome("Consórcios")).thenReturn(categoriaConsorcios);
        LancamentoFinanceiro lancamentoCriado = new LancamentoFinanceiro("Despesa", contrato.getEmpresa(),
                categoriaConsorcios, contrato.getFornecedor(), null, null, veiculoId, new BigDecimal("100.00"),
                parcela.getVencimento(), parcela.getVencimento(), "Contrato Financeiro via Parcela", null, null);
        when(lancamentoFinanceiroService.criarGeradoPeloSistema(any(), any(), any(), any(), any(),
                any(), org.mockito.ArgumentMatchers.eq(veiculoId), any(), any(), any(), any()))
                .thenReturn(lancamentoCriado);

        Parcela atualizada = service.gerarLancamento(parcelaId);

        assertThat(atualizada.getLancamentoFinanceiro().getVeiculoId()).isEqualTo(veiculoId);
    }

    @Test
    void gerarLancamentoParaConsorcioNaoContempladoNaoDeveHerdarVeiculo() {
        iniciar();
        ContratoFinanceiro contrato = contratoConsorcio(false, null);
        Parcela parcela = new Parcela("Contrato Financeiro", contrato, 1, 3, new BigDecimal("100.00"), LocalDate.of(2026, 2, 15));
        UUID parcelaId = UUID.randomUUID();
        ReflectionTestUtils.setField(parcela, "id", parcelaId);
        when(repository.findById(parcelaId)).thenReturn(Optional.of(parcela));
        when(repository.save(any(Parcela.class))).thenAnswer(invocation -> invocation.getArgument(0));
        Categoria categoriaConsorcios = new Categoria("Consórcios", "Despesa");
        when(categoriaService.buscarPorNome("Consórcios")).thenReturn(categoriaConsorcios);
        LancamentoFinanceiro lancamentoCriado = new LancamentoFinanceiro("Despesa", contrato.getEmpresa(),
                categoriaConsorcios, contrato.getFornecedor(), null, null, null, new BigDecimal("100.00"),
                parcela.getVencimento(), parcela.getVencimento(), "Contrato Financeiro via Parcela", null, null);
        when(lancamentoFinanceiroService.criarGeradoPeloSistema(any(), any(), any(), any(), any(),
                any(), org.mockito.ArgumentMatchers.isNull(), any(), any(), any(), any()))
                .thenReturn(lancamentoCriado);

        Parcela atualizada = service.gerarLancamento(parcelaId);

        assertThat(atualizada.getLancamentoFinanceiro().getVeiculoId()).isNull();
    }

    // --- gerarLancamento ---

    @Test
    void gerarLancamentoParaCompraTerraplanagemDeveCriarLancamento() {
        iniciar();
        CartaoCredito cartao = cartao(20, 5);
        CompraCartao compra = new CompraCartao(cartao, new Fornecedor("Posto Ipiranga"), new BigDecimal("100.00"),
                LocalDate.of(2026, 3, 10), new Categoria("Combustível", "Despesa"), "Terraplanagem", null, null, 1);
        Parcela parcela = new Parcela("Compra Cartão", compra, 1, 1, new BigDecimal("100.00"), LocalDate.of(2026, 3, 5));
        UUID parcelaId = UUID.randomUUID();
        ReflectionTestUtils.setField(parcela, "id", parcelaId);
        when(repository.findById(parcelaId)).thenReturn(Optional.of(parcela));
        when(repository.save(any(Parcela.class))).thenAnswer(invocation -> invocation.getArgument(0));
        LancamentoFinanceiro lancamentoCriado = new LancamentoFinanceiro("Despesa", new Empresa("H Vieira"),
                compra.getCategoria(), compra.getFornecedor(), null, null, null, new BigDecimal("100.00"),
                compra.getData(), parcela.getVencimento(), "Cartão via Parcela", null, null);
        when(lancamentoFinanceiroService.criarGeradoPeloSistema(any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(lancamentoCriado);

        Parcela atualizada = service.gerarLancamento(parcelaId);

        assertThat(atualizada.getLancamentoFinanceiro()).isSameAs(lancamentoCriado);
    }

    @Test
    void gerarLancamentoParaCompraNaoTerraplanagemDeveLancarExcecao() {
        iniciar();
        CartaoCredito cartao = cartao(20, 5);
        CompraCartao compra = new CompraCartao(cartao, new Fornecedor("Posto Ipiranga"), new BigDecimal("100.00"),
                LocalDate.of(2026, 3, 10), new Categoria("Combustível", "Despesa"), "Fora da Operação", null, null, 1);
        Parcela parcela = new Parcela("Compra Cartão", compra, 1, 1, new BigDecimal("100.00"), LocalDate.of(2026, 3, 5));
        UUID parcelaId = UUID.randomUUID();
        ReflectionTestUtils.setField(parcela, "id", parcelaId);
        when(repository.findById(parcelaId)).thenReturn(Optional.of(parcela));

        assertThatThrownBy(() -> service.gerarLancamento(parcelaId)).isInstanceOf(BusinessException.class);
    }

    @Test
    void gerarLancamentoDuasVezesDeveLancarExcecao() {
        iniciar();
        CartaoCredito cartao = cartao(20, 5);
        CompraCartao compra = new CompraCartao(cartao, new Fornecedor("Posto Ipiranga"), new BigDecimal("100.00"),
                LocalDate.of(2026, 3, 10), new Categoria("Combustível", "Despesa"), "Terraplanagem", null, null, 1);
        Parcela parcela = new Parcela("Compra Cartão", compra, 1, 1, new BigDecimal("100.00"), LocalDate.of(2026, 3, 5));
        LancamentoFinanceiro lancamentoExistente = new LancamentoFinanceiro("Despesa", new Empresa("H Vieira"),
                compra.getCategoria(), compra.getFornecedor(), null, null, null, new BigDecimal("100.00"),
                compra.getData(), parcela.getVencimento(), "Cartão via Parcela", null, null);
        parcela.vincularLancamento(lancamentoExistente);
        UUID parcelaId = UUID.randomUUID();
        ReflectionTestUtils.setField(parcela, "id", parcelaId);
        when(repository.findById(parcelaId)).thenReturn(Optional.of(parcela));

        assertThatThrownBy(() -> service.gerarLancamento(parcelaId)).isInstanceOf(BusinessException.class);
    }

    @Test
    void buscarPorIdDeveLancarExcecaoQuandoNaoEncontrada() {
        iniciar();
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscarPorId(id)).isInstanceOf(ResourceNotFoundException.class);
    }
}
