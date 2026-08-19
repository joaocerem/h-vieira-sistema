package br.com.joaocerem.hvieira_financeiro.application.conciliacaobancaria;

import br.com.joaocerem.hvieira_financeiro.common.exception.BusinessException;
import br.com.joaocerem.hvieira_financeiro.common.exception.ResourceNotFoundException;
import br.com.joaocerem.hvieira_financeiro.domain.conciliacaobancaria.MovimentacaoBancaria;
import br.com.joaocerem.hvieira_financeiro.domain.conciliacaobancaria.VinculoConciliacao;
import br.com.joaocerem.hvieira_financeiro.domain.conciliacaobancaria.VinculoConciliacaoRepository;
import br.com.joaocerem.hvieira_financeiro.domain.contabancaria.ContaBancaria;
import br.com.joaocerem.hvieira_financeiro.domain.empresa.Empresa;
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
class VinculoConciliacaoServiceTest {

    @Mock
    private VinculoConciliacaoRepository repository;
    @Mock
    private LiquidacaoFinanceiraRepository liquidacaoFinanceiraRepository;
    @Mock
    private ConciliacaoProperties conciliacaoProperties;

    private VinculoConciliacaoService service;
    private ContaBancaria contaBancaria;

    private void iniciar() {
        service = new VinculoConciliacaoService(repository, liquidacaoFinanceiraRepository, conciliacaoProperties);
        contaBancaria = new ContaBancaria(new Empresa("H Vieira"), "Banco do Brasil", "Conta Principal");
        ReflectionTestUtils.setField(contaBancaria, "id", UUID.randomUUID());
    }

    private MovimentacaoBancaria movimentacaoComId(BigDecimal valor, String classificacao) {
        MovimentacaoBancaria movimentacao = new MovimentacaoBancaria(contaBancaria, LocalDate.now(), "Extrato", valor);
        ReflectionTestUtils.setField(movimentacao, "id", UUID.randomUUID());
        if (classificacao != null) {
            movimentacao.reclassificar(classificacao);
        }
        return movimentacao;
    }

    private LiquidacaoFinanceira liquidacaoComId(BigDecimal valor) {
        LiquidacaoFinanceira liquidacao = new LiquidacaoFinanceira("Pagamento", LocalDate.now(), valor, contaBancaria);
        ReflectionTestUtils.setField(liquidacao, "id", UUID.randomUUID());
        return liquidacao;
    }

    @Test
    void rodarSugestaoAutomaticaDeveSugerirQuandoEncontraCandidataDentroDaTolerancia() {
        iniciar();
        MovimentacaoBancaria movimentacao = movimentacaoComId(new BigDecimal("-250.00"), null);
        VinculoConciliacao vinculo = new VinculoConciliacao(movimentacao);
        LiquidacaoFinanceira candidata = liquidacaoComId(new BigDecimal("250.00"));

        when(repository.findByEstadoConciliacao(VinculoConciliacao.NAO_VINCULADO)).thenReturn(List.of(vinculo));
        when(conciliacaoProperties.getToleranciaDiasMatching()).thenReturn(2);
        when(liquidacaoFinanceiraRepository.findByContaBancariaIdAndValorAndDataEfetivaBetween(
                any(), any(), any(), any())).thenReturn(List.of(candidata));
        when(repository.existsByLiquidacaoFinanceiraId(candidata.getId())).thenReturn(false);
        when(repository.save(any(VinculoConciliacao.class))).thenAnswer(invocation -> invocation.getArgument(0));

        VinculoConciliacaoService.ResultadoSugestaoAutomatica resultado = service.rodarSugestaoAutomatica();

        assertThat(resultado.sugeridos()).isEqualTo(1);
        assertThat(resultado.semCorrespondencia()).isEqualTo(0);
        assertThat(vinculo.getEstadoConciliacao()).isEqualTo(VinculoConciliacao.SUGERIDO);
        assertThat(vinculo.getLiquidacaoFinanceira()).isSameAs(candidata);
    }

    @Test
    void rodarSugestaoAutomaticaDeveMarcarSemCorrespondenciaQuandoNaoEncontraCandidata() {
        iniciar();
        MovimentacaoBancaria movimentacao = movimentacaoComId(new BigDecimal("-250.00"), null);
        VinculoConciliacao vinculo = new VinculoConciliacao(movimentacao);

        when(repository.findByEstadoConciliacao(VinculoConciliacao.NAO_VINCULADO)).thenReturn(List.of(vinculo));
        when(conciliacaoProperties.getToleranciaDiasMatching()).thenReturn(2);
        when(liquidacaoFinanceiraRepository.findByContaBancariaIdAndValorAndDataEfetivaBetween(
                any(), any(), any(), any())).thenReturn(List.of());
        when(repository.save(any(VinculoConciliacao.class))).thenAnswer(invocation -> invocation.getArgument(0));

        VinculoConciliacaoService.ResultadoSugestaoAutomatica resultado = service.rodarSugestaoAutomatica();

        assertThat(resultado.semCorrespondencia()).isEqualTo(1);
        assertThat(vinculo.getEstadoConciliacao()).isEqualTo(VinculoConciliacao.SEM_CORRESPONDENCIA);
    }

    @Test
    void rodarSugestaoAutomaticaDeveMarcarSemCorrespondenciaParaMovimentacaoDeTransferenciaInternaSemBuscarCandidata() {
        iniciar();
        MovimentacaoBancaria movimentacao = movimentacaoComId(new BigDecimal("-500.00"), MovimentacaoBancaria.TRANSFERENCIA_INTERNA);
        VinculoConciliacao vinculo = new VinculoConciliacao(movimentacao);

        when(repository.findByEstadoConciliacao(VinculoConciliacao.NAO_VINCULADO)).thenReturn(List.of(vinculo));
        when(repository.save(any(VinculoConciliacao.class))).thenAnswer(invocation -> invocation.getArgument(0));

        service.rodarSugestaoAutomatica();

        assertThat(vinculo.getEstadoConciliacao()).isEqualTo(VinculoConciliacao.SEM_CORRESPONDENCIA);
    }

    @Test
    void confirmarQuandoNaoEstaSugeridoDeveLancarExcecao() {
        iniciar();
        UUID id = UUID.randomUUID();
        MovimentacaoBancaria movimentacao = movimentacaoComId(new BigDecimal("-100.00"), null);
        VinculoConciliacao vinculo = new VinculoConciliacao(movimentacao);
        when(repository.findById(id)).thenReturn(Optional.of(vinculo));

        assertThatThrownBy(() -> service.confirmar(id)).isInstanceOf(BusinessException.class);
    }

    @Test
    void confirmarComValoresDivergentesDeveLancarExcecao() {
        iniciar();
        UUID id = UUID.randomUUID();
        MovimentacaoBancaria movimentacao = movimentacaoComId(new BigDecimal("-100.00"), null);
        VinculoConciliacao vinculo = new VinculoConciliacao(movimentacao);
        vinculo.sugerir(liquidacaoComId(new BigDecimal("999.00")));
        when(repository.findById(id)).thenReturn(Optional.of(vinculo));

        assertThatThrownBy(() -> service.confirmar(id)).isInstanceOf(BusinessException.class);
    }

    @Test
    void confirmarComValoresIguaisDeveConfirmar() {
        iniciar();
        UUID id = UUID.randomUUID();
        MovimentacaoBancaria movimentacao = movimentacaoComId(new BigDecimal("-100.00"), null);
        VinculoConciliacao vinculo = new VinculoConciliacao(movimentacao);
        vinculo.sugerir(liquidacaoComId(new BigDecimal("100.00")));
        when(repository.findById(id)).thenReturn(Optional.of(vinculo));
        when(repository.save(any(VinculoConciliacao.class))).thenAnswer(invocation -> invocation.getArgument(0));

        VinculoConciliacao confirmado = service.confirmar(id);

        assertThat(confirmado.getEstadoConciliacao()).isEqualTo(VinculoConciliacao.CONFIRMADO);
    }

    @Test
    void marcarDivergenteSemLiquidacaoDeveLancarExcecao() {
        iniciar();
        UUID id = UUID.randomUUID();
        MovimentacaoBancaria movimentacao = movimentacaoComId(new BigDecimal("-100.00"), null);
        VinculoConciliacao vinculo = new VinculoConciliacao(movimentacao);
        when(repository.findById(id)).thenReturn(Optional.of(vinculo));

        assertThatThrownBy(() -> service.marcarDivergente(id)).isInstanceOf(BusinessException.class);
    }

    @Test
    void vincularManualmenteComValoresIguaisDeveConfirmarDiretamente() {
        iniciar();
        UUID id = UUID.randomUUID();
        MovimentacaoBancaria movimentacao = movimentacaoComId(new BigDecimal("-100.00"), null);
        VinculoConciliacao vinculo = new VinculoConciliacao(movimentacao);
        LiquidacaoFinanceira liquidacao = liquidacaoComId(new BigDecimal("100.00"));
        when(repository.findById(id)).thenReturn(Optional.of(vinculo));
        when(repository.existsByLiquidacaoFinanceiraId(liquidacao.getId())).thenReturn(false);
        when(liquidacaoFinanceiraRepository.findById(liquidacao.getId())).thenReturn(Optional.of(liquidacao));
        when(repository.save(any(VinculoConciliacao.class))).thenAnswer(invocation -> invocation.getArgument(0));

        VinculoConciliacao vinculado = service.vincularManualmente(id, liquidacao.getId());

        assertThat(vinculado.getEstadoConciliacao()).isEqualTo(VinculoConciliacao.CONFIRMADO);
    }

    @Test
    void vincularManualmenteComValoresDiferentesDeveMarcarDivergente() {
        iniciar();
        UUID id = UUID.randomUUID();
        MovimentacaoBancaria movimentacao = movimentacaoComId(new BigDecimal("-100.00"), null);
        VinculoConciliacao vinculo = new VinculoConciliacao(movimentacao);
        LiquidacaoFinanceira liquidacao = liquidacaoComId(new BigDecimal("999.00"));
        when(repository.findById(id)).thenReturn(Optional.of(vinculo));
        when(repository.existsByLiquidacaoFinanceiraId(liquidacao.getId())).thenReturn(false);
        when(liquidacaoFinanceiraRepository.findById(liquidacao.getId())).thenReturn(Optional.of(liquidacao));
        when(repository.save(any(VinculoConciliacao.class))).thenAnswer(invocation -> invocation.getArgument(0));

        VinculoConciliacao vinculado = service.vincularManualmente(id, liquidacao.getId());

        assertThat(vinculado.getEstadoConciliacao()).isEqualTo(VinculoConciliacao.DIVERGENTE);
    }

    @Test
    void vincularManualmenteComLiquidacaoJaVinculadaDeveLancarExcecao() {
        iniciar();
        UUID id = UUID.randomUUID();
        UUID liquidacaoId = UUID.randomUUID();
        MovimentacaoBancaria movimentacao = movimentacaoComId(new BigDecimal("-100.00"), null);
        VinculoConciliacao vinculo = new VinculoConciliacao(movimentacao);
        when(repository.findById(id)).thenReturn(Optional.of(vinculo));
        when(repository.existsByLiquidacaoFinanceiraId(liquidacaoId)).thenReturn(true);

        assertThatThrownBy(() -> service.vincularManualmente(id, liquidacaoId)).isInstanceOf(BusinessException.class);
    }

    @Test
    void buscarPorIdDeveLancarExcecaoQuandoNaoEncontrado() {
        iniciar();
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscarPorId(id)).isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void buscarPorMovimentacaoDeveLancarExcecaoQuandoNaoEncontrado() {
        iniciar();
        UUID movimentacaoId = UUID.randomUUID();
        when(repository.findByMovimentacaoBancariaId(movimentacaoId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscarPorMovimentacao(movimentacaoId)).isInstanceOf(ResourceNotFoundException.class);
    }
}
