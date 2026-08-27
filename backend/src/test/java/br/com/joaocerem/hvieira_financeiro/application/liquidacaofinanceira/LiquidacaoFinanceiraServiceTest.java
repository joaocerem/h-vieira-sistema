package br.com.joaocerem.hvieira_financeiro.application.liquidacaofinanceira;

import br.com.joaocerem.hvieira_financeiro.application.conciliacaobancaria.MovimentacaoBancariaService;
import br.com.joaocerem.hvieira_financeiro.application.contabancaria.ContaBancariaService;
import br.com.joaocerem.hvieira_financeiro.application.lancamentofinanceiro.LancamentoFinanceiroService;
import br.com.joaocerem.hvieira_financeiro.common.exception.BusinessException;
import br.com.joaocerem.hvieira_financeiro.common.exception.ResourceNotFoundException;
import br.com.joaocerem.hvieira_financeiro.domain.aplicacaodeliquidacao.AplicacaoDeLiquidacao;
import br.com.joaocerem.hvieira_financeiro.domain.aplicacaodeliquidacao.AplicacaoDeLiquidacaoRepository;
import br.com.joaocerem.hvieira_financeiro.domain.categoria.Categoria;
import br.com.joaocerem.hvieira_financeiro.domain.contabancaria.ContaBancaria;
import br.com.joaocerem.hvieira_financeiro.domain.empresa.Empresa;
import br.com.joaocerem.hvieira_financeiro.domain.fornecedor.Fornecedor;
import br.com.joaocerem.hvieira_financeiro.domain.lancamentofinanceiro.LancamentoFinanceiro;
import br.com.joaocerem.hvieira_financeiro.domain.liquidacaofinanceira.LiquidacaoFinanceira;
import br.com.joaocerem.hvieira_financeiro.domain.liquidacaofinanceira.LiquidacaoFinanceiraRepository;
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
class LiquidacaoFinanceiraServiceTest {

    @Mock
    private LiquidacaoFinanceiraRepository repository;
    @Mock
    private AplicacaoDeLiquidacaoRepository aplicacaoDeLiquidacaoRepository;
    @Mock
    private ContaBancariaService contaBancariaService;
    @Mock
    private LancamentoFinanceiroService lancamentoFinanceiroService;
    @Mock
    private MovimentacaoBancariaService movimentacaoBancariaService;

    private LiquidacaoFinanceiraService service;
    private ContaBancaria contaBancaria;

    private void iniciar() {
        service = new LiquidacaoFinanceiraService(repository, aplicacaoDeLiquidacaoRepository, contaBancariaService,
                lancamentoFinanceiroService, movimentacaoBancariaService);
        contaBancaria = new ContaBancaria(new Empresa("H Vieira"), "Banco do Brasil", "Conta Principal");
    }

    private LancamentoFinanceiro lancamentoComId(UUID id, BigDecimal valor) {
        LancamentoFinanceiro lancamento = new LancamentoFinanceiro("Despesa", new Empresa("H Vieira"),
                new Categoria("Combustível", "Despesa"), new Fornecedor("Posto Ipiranga"), null, null, null,
                valor, LocalDate.now(), LocalDate.now().plusDays(30), "Manual", null, null);
        ReflectionTestUtils.setField(lancamento, "id", id);
        return lancamento;
    }

    @Test
    void criarComUmaAplicacaoValidaDeveSerAceita() {
        iniciar();
        UUID contaBancariaId = UUID.randomUUID();
        UUID lancamentoId = UUID.randomUUID();
        when(repository.save(any(LiquidacaoFinanceira.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(aplicacaoDeLiquidacaoRepository.save(any(AplicacaoDeLiquidacao.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(contaBancariaService.buscarPorId(contaBancariaId)).thenReturn(contaBancaria);
        when(lancamentoFinanceiroService.buscarPorId(lancamentoId)).thenReturn(lancamentoComId(lancamentoId, new BigDecimal("100.00")));
        when(aplicacaoDeLiquidacaoRepository.somarValorAplicadoPorLancamento(lancamentoId)).thenReturn(BigDecimal.ZERO);

        LiquidacaoFinanceira liquidacao = service.criar("Pagamento", LocalDate.now(), new BigDecimal("100.00"), contaBancariaId,
                List.of(new AplicacaoLancamento(lancamentoId, new BigDecimal("100.00"))));

        assertThat(liquidacao.getTipo()).isEqualTo("Pagamento");
        assertThat(liquidacao.getContaBancaria()).isSameAs(contaBancaria);
    }

    @Test
    void criarComTipoInvalidoDeveLancarExcecao() {
        iniciar();
        assertThatThrownBy(() -> service.criar("Outro", LocalDate.now(), new BigDecimal("100.00"), UUID.randomUUID(),
                List.of(new AplicacaoLancamento(UUID.randomUUID(), new BigDecimal("100.00")))))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void criarSemAplicacoesDeveLancarExcecao() {
        iniciar();
        assertThatThrownBy(() -> service.criar("Pagamento", LocalDate.now(), new BigDecimal("100.00"), UUID.randomUUID(), List.of()))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void criarComSomaDeAplicacoesMaiorQueValorDaLiquidacaoDeveLancarExcecao() {
        iniciar();
        UUID contaBancariaId = UUID.randomUUID();
        when(contaBancariaService.buscarPorId(contaBancariaId)).thenReturn(contaBancaria);

        assertThatThrownBy(() -> service.criar("Pagamento", LocalDate.now(), new BigDecimal("50.00"), contaBancariaId,
                List.of(new AplicacaoLancamento(UUID.randomUUID(), new BigDecimal("100.00")))))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void criarComAplicacaoQueUltrapassaValorDoLancamentoDeveLancarExcecao() {
        iniciar();
        UUID contaBancariaId = UUID.randomUUID();
        UUID lancamentoId = UUID.randomUUID();
        when(contaBancariaService.buscarPorId(contaBancariaId)).thenReturn(contaBancaria);
        when(lancamentoFinanceiroService.buscarPorId(lancamentoId)).thenReturn(lancamentoComId(lancamentoId, new BigDecimal("100.00")));
        when(aplicacaoDeLiquidacaoRepository.somarValorAplicadoPorLancamento(lancamentoId)).thenReturn(new BigDecimal("80.00"));

        assertThatThrownBy(() -> service.criar("Pagamento", LocalDate.now(), new BigDecimal("50.00"), contaBancariaId,
                List.of(new AplicacaoLancamento(lancamentoId, new BigDecimal("50.00")))))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void criarComLancamentoCanceladoDeveLancarExcecao() {
        iniciar();
        UUID contaBancariaId = UUID.randomUUID();
        UUID lancamentoId = UUID.randomUUID();
        when(contaBancariaService.buscarPorId(contaBancariaId)).thenReturn(contaBancaria);
        LancamentoFinanceiro lancamentoCancelado = lancamentoComId(lancamentoId, new BigDecimal("100.00"));
        lancamentoCancelado.cancelar();
        when(lancamentoFinanceiroService.buscarPorId(lancamentoId)).thenReturn(lancamentoCancelado);

        assertThatThrownBy(() -> service.criar("Pagamento", LocalDate.now(), new BigDecimal("100.00"), contaBancariaId,
                List.of(new AplicacaoLancamento(lancamentoId, new BigDecimal("100.00")))))
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
