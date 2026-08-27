package br.com.joaocerem.hvieira_financeiro.application.fatura;

import br.com.joaocerem.hvieira_financeiro.application.cartaocredito.CartaoCreditoService;
import br.com.joaocerem.hvieira_financeiro.application.liquidacaofinanceira.LiquidacaoFinanceiraService;
import br.com.joaocerem.hvieira_financeiro.application.parcela.ParcelaService;
import br.com.joaocerem.hvieira_financeiro.common.exception.BusinessException;
import br.com.joaocerem.hvieira_financeiro.common.exception.ResourceNotFoundException;
import br.com.joaocerem.hvieira_financeiro.domain.cartaocredito.CartaoCredito;
import br.com.joaocerem.hvieira_financeiro.domain.categoria.Categoria;
import br.com.joaocerem.hvieira_financeiro.domain.compracartao.CompraCartao;
import br.com.joaocerem.hvieira_financeiro.domain.contabancaria.ContaBancaria;
import br.com.joaocerem.hvieira_financeiro.domain.empresa.Empresa;
import br.com.joaocerem.hvieira_financeiro.domain.fatura.Fatura;
import br.com.joaocerem.hvieira_financeiro.domain.fatura.FaturaRepository;
import br.com.joaocerem.hvieira_financeiro.domain.fornecedor.Fornecedor;
import br.com.joaocerem.hvieira_financeiro.domain.lancamentofinanceiro.LancamentoFinanceiro;
import br.com.joaocerem.hvieira_financeiro.domain.liquidacaofinanceira.LiquidacaoFinanceira;
import br.com.joaocerem.hvieira_financeiro.domain.parcela.Parcela;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FaturaServiceTest {

    @Mock
    private FaturaRepository repository;
    @Mock
    private CartaoCreditoService cartaoCreditoService;
    @Mock
    private ParcelaService parcelaService;
    @Mock
    private LiquidacaoFinanceiraService liquidacaoFinanceiraService;

    private FaturaService service;
    private CartaoCredito cartao;

    private void iniciar() {
        service = new FaturaService(repository, cartaoCreditoService, parcelaService, liquidacaoFinanceiraService);
        Empresa empresa = new Empresa("H Vieira");
        ContaBancaria conta = new ContaBancaria(empresa, "Banco do Brasil", "Conta Principal");
        cartao = new CartaoCredito(conta, "Nubank", "Cartão PJ", 20, 5);
    }

    private CompraCartao compra() {
        return new CompraCartao(cartao, new Fornecedor("Posto Ipiranga"), new BigDecimal("100.00"),
                LocalDate.of(2026, 3, 10), new Categoria("Combustível", "Despesa"), "Terraplanagem", null, null, 1);
    }

    @Test
    void fecharCicloDeveSomarParcelasElegiveisEAtribuirFatura() {
        iniciar();
        UUID cartaoId = UUID.randomUUID();
        Parcela parcela1 = new Parcela("Compra Cartão", compra(), 1, 1, new BigDecimal("50.00"), LocalDate.of(2026, 3, 5));
        Parcela parcela2 = new Parcela("Compra Cartão", compra(), 1, 1, new BigDecimal("30.00"), LocalDate.of(2026, 3, 5));
        when(cartaoCreditoService.buscarPorId(cartaoId)).thenReturn(cartao);
        when(repository.findByCartaoIdAndCiclo(cartaoId, "2026-03")).thenReturn(Optional.empty());
        when(parcelaService.listarElegiveisParaFechamento(cartaoId, YearMonth.of(2026, 3))).thenReturn(List.of(parcela1, parcela2));
        when(repository.save(any(Fatura.class))).thenAnswer(invocation -> invocation.getArgument(0));
        doNothing().when(parcelaService).atribuirFatura(any(Parcela.class), any(Fatura.class));

        Fatura fatura = service.fecharCiclo(cartaoId, "2026-03", new BigDecimal("80.00"));

        assertThat(fatura.getValorTotalCalculado()).isEqualByComparingTo("80.00");
        assertThat(fatura.getValorCobrado()).isEqualByComparingTo("80.00");
    }

    @Test
    void fecharCicloDuplicadoDeveLancarExcecao() {
        iniciar();
        UUID cartaoId = UUID.randomUUID();
        when(cartaoCreditoService.buscarPorId(cartaoId)).thenReturn(cartao);
        when(repository.findByCartaoIdAndCiclo(cartaoId, "2026-03")).thenReturn(Optional.of(new Fatura(cartao, "2026-03", BigDecimal.TEN, BigDecimal.TEN)));

        assertThatThrownBy(() -> service.fecharCiclo(cartaoId, "2026-03", new BigDecimal("10.00")))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void fecharCicloComFormatoInvalidoDeveLancarExcecao() {
        iniciar();
        assertThatThrownBy(() -> service.fecharCiclo(UUID.randomUUID(), "março/2026", new BigDecimal("10.00")))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void pagarDeveCriarLiquidacaoComAplicacoesDosLancamentosGerados() {
        iniciar();
        UUID faturaId = UUID.randomUUID();
        UUID contaBancariaId = UUID.randomUUID();
        Fatura fatura = new Fatura(cartao, "2026-03", new BigDecimal("18000.00"), new BigDecimal("30000.00"));
        ReflectionTestUtils.setField(fatura, "id", faturaId);

        CompraCartao compra = compra();
        LancamentoFinanceiro lancamento = new LancamentoFinanceiro("Despesa", cartao.getContaBancaria().getEmpresa(),
                compra.getCategoria(), compra.getFornecedor(), null, null, null, new BigDecimal("5000.00"),
                LocalDate.of(2026, 3, 10), LocalDate.of(2026, 3, 5), "Cartão via Parcela", null, null);
        Parcela parcelaComLancamento = new Parcela("Compra Cartão", compra, 1, 1, new BigDecimal("5000.00"), LocalDate.of(2026, 3, 5));
        parcelaComLancamento.vincularLancamento(lancamento);
        Parcela parcelaSemLancamento = new Parcela("Compra Cartão", compra, 1, 1, new BigDecimal("12000.00"), LocalDate.of(2026, 3, 5));

        when(repository.findById(faturaId)).thenReturn(Optional.of(fatura));
        when(parcelaService.listarPorFatura(faturaId)).thenReturn(List.of(parcelaComLancamento, parcelaSemLancamento));
        LiquidacaoFinanceira liquidacaoCriada = new LiquidacaoFinanceira("Pagamento", LocalDate.now(), new BigDecimal("30000.00"), cartao.getContaBancaria());
        when(liquidacaoFinanceiraService.criar(eq("Pagamento"), any(), eq(new BigDecimal("30000.00")), eq(contaBancariaId), any()))
                .thenReturn(liquidacaoCriada);
        when(repository.save(any(Fatura.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Fatura paga = service.pagar(faturaId, contaBancariaId, LocalDate.now());

        assertThat(paga.getLiquidacaoFinanceira()).isSameAs(liquidacaoCriada);
    }

    @Test
    void pagarSemNenhumLancamentoGeradoDeveLancarExcecao() {
        iniciar();
        UUID faturaId = UUID.randomUUID();
        Fatura fatura = new Fatura(cartao, "2026-03", new BigDecimal("0.00"), new BigDecimal("12000.00"));
        ReflectionTestUtils.setField(fatura, "id", faturaId);
        Parcela parcelaSemLancamento = new Parcela("Compra Cartão", compra(), 1, 1, new BigDecimal("12000.00"), LocalDate.of(2026, 3, 5));

        when(repository.findById(faturaId)).thenReturn(Optional.of(fatura));
        when(parcelaService.listarPorFatura(faturaId)).thenReturn(List.of(parcelaSemLancamento));

        assertThatThrownBy(() -> service.pagar(faturaId, UUID.randomUUID(), LocalDate.now()))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void pagarFaturaJaPagaDeveLancarExcecao() {
        iniciar();
        UUID faturaId = UUID.randomUUID();
        Fatura fatura = new Fatura(cartao, "2026-03", new BigDecimal("5000.00"), new BigDecimal("5000.00"));
        ReflectionTestUtils.setField(fatura, "id", faturaId);
        fatura.marcarComoPaga(new LiquidacaoFinanceira("Pagamento", LocalDate.now(), new BigDecimal("5000.00"), cartao.getContaBancaria()));
        when(repository.findById(faturaId)).thenReturn(Optional.of(fatura));

        assertThatThrownBy(() -> service.pagar(faturaId, UUID.randomUUID(), LocalDate.now()))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void buscarPorIdDeveLancarExcecaoQuandoNaoEncontrada() {
        iniciar();
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscarPorId(id)).isInstanceOf(ResourceNotFoundException.class);
    }
}
