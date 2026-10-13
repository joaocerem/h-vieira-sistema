package br.com.joaocerem.hvieira_financeiro.application.conciliacaobancaria;

import br.com.joaocerem.hvieira_financeiro.common.exception.BusinessException;
import br.com.joaocerem.hvieira_financeiro.common.exception.ResourceNotFoundException;
import br.com.joaocerem.hvieira_financeiro.domain.conciliacaobancaria.MovimentacaoBancaria;
import br.com.joaocerem.hvieira_financeiro.domain.conciliacaobancaria.VinculoConciliacao;
import br.com.joaocerem.hvieira_financeiro.domain.conciliacaobancaria.VinculoConciliacaoRepository;
import br.com.joaocerem.hvieira_financeiro.domain.contabancaria.ContaBancaria;
import br.com.joaocerem.hvieira_financeiro.domain.empresa.Empresa;
import br.com.joaocerem.hvieira_financeiro.domain.lancamentofinanceiro.LancamentoFinanceiro;
import br.com.joaocerem.hvieira_financeiro.domain.lancamentofinanceiro.LancamentoFinanceiroRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VinculoConciliacaoServiceTest {

    @Mock
    private VinculoConciliacaoRepository repository;
    @Mock
    private LancamentoFinanceiroRepository lancamentoFinanceiroRepository;
    @Mock
    private ConciliacaoProperties conciliacaoProperties;

    private VinculoConciliacaoService service;
    private Empresa empresa;
    private ContaBancaria contaBancaria;

    private void iniciar() {
        service = new VinculoConciliacaoService(repository, lancamentoFinanceiroRepository, conciliacaoProperties);
        empresa = new Empresa("H Vieira");
        ReflectionTestUtils.setField(empresa, "id", UUID.randomUUID());
        contaBancaria = new ContaBancaria(empresa, "Banco do Brasil");
        ReflectionTestUtils.setField(contaBancaria, "id", UUID.randomUUID());
        lenient().when(conciliacaoProperties.getToleranciaDiasMatching()).thenReturn(3);
    }

    private MovimentacaoBancaria movimentacaoComId(BigDecimal valor, LocalDate data, String classificacao) {
        MovimentacaoBancaria movimentacao = new MovimentacaoBancaria(contaBancaria, data, "Extrato", valor);
        ReflectionTestUtils.setField(movimentacao, "id", UUID.randomUUID());
        if (classificacao != null) {
            movimentacao.reclassificar(classificacao);
        }
        return movimentacao;
    }

    private LancamentoFinanceiro lancamentoComId(String tipo, BigDecimal valor, LocalDate vencimento) {
        LancamentoFinanceiro lancamento = new LancamentoFinanceiro(tipo, empresa, null, null, null, null, null,
                valor, vencimento, vencimento, "Manual", null, null);
        ReflectionTestUtils.setField(lancamento, "id", UUID.randomUUID());
        return lancamento;
    }

    @Test
    void rodarSugestaoAutomaticaDeveSugerirQuandoEncontraUnicoCandidato() {
        iniciar();
        LocalDate data = LocalDate.of(2026, 3, 10);
        MovimentacaoBancaria movimentacao = movimentacaoComId(new BigDecimal("-250.00"), data, null);
        VinculoConciliacao vinculo = new VinculoConciliacao(movimentacao);
        LancamentoFinanceiro candidato = lancamentoComId("Despesa", new BigDecimal("250.00"), data);

        when(repository.findByEstadoConciliacao(VinculoConciliacao.NAO_VINCULADO)).thenReturn(List.of(vinculo));
        when(lancamentoFinanceiroRepository.buscarCandidatosParaConciliacao(any(), any(), any(), any(), any()))
                .thenReturn(List.of(candidato));
        when(repository.existsByLancamentosFinanceiros_Id(candidato.getId())).thenReturn(false);
        when(repository.save(any(VinculoConciliacao.class))).thenAnswer(invocation -> invocation.getArgument(0));

        VinculoConciliacaoService.ResultadoSugestaoAutomatica resultado = service.rodarSugestaoAutomatica();

        assertThat(resultado.sugeridos()).isEqualTo(1);
        assertThat(resultado.semCorrespondencia()).isEqualTo(0);
        assertThat(resultado.comMultiplosCandidatos()).isEqualTo(0);
        assertThat(vinculo.getEstadoConciliacao()).isEqualTo(VinculoConciliacao.SUGERIDO);
        assertThat(vinculo.getLancamentosFinanceiros()).containsExactly(candidato);
    }

    @Test
    void rodarSugestaoAutomaticaDeveMarcarSemCorrespondenciaQuandoNaoEncontraCandidato() {
        iniciar();
        MovimentacaoBancaria movimentacao = movimentacaoComId(new BigDecimal("-250.00"), LocalDate.now(), null);
        VinculoConciliacao vinculo = new VinculoConciliacao(movimentacao);

        when(repository.findByEstadoConciliacao(VinculoConciliacao.NAO_VINCULADO)).thenReturn(List.of(vinculo));
        when(lancamentoFinanceiroRepository.buscarCandidatosParaConciliacao(any(), any(), any(), any(), any()))
                .thenReturn(List.of());
        when(repository.save(any(VinculoConciliacao.class))).thenAnswer(invocation -> invocation.getArgument(0));

        VinculoConciliacaoService.ResultadoSugestaoAutomatica resultado = service.rodarSugestaoAutomatica();

        assertThat(resultado.semCorrespondencia()).isEqualTo(1);
        assertThat(vinculo.getEstadoConciliacao()).isEqualTo(VinculoConciliacao.SEM_CORRESPONDENCIA);
    }

    @Test
    void rodarSugestaoAutomaticaComDoisOuMaisCandidatosNaoDeveEscolherAutomaticamente() {
        iniciar();
        LocalDate data = LocalDate.of(2026, 3, 10);
        MovimentacaoBancaria movimentacao = movimentacaoComId(new BigDecimal("-250.00"), data, null);
        VinculoConciliacao vinculo = new VinculoConciliacao(movimentacao);
        LancamentoFinanceiro candidato1 = lancamentoComId("Despesa", new BigDecimal("250.00"), data);
        LancamentoFinanceiro candidato2 = lancamentoComId("Despesa", new BigDecimal("250.00"), data);

        when(repository.findByEstadoConciliacao(VinculoConciliacao.NAO_VINCULADO)).thenReturn(List.of(vinculo));
        when(lancamentoFinanceiroRepository.buscarCandidatosParaConciliacao(any(), any(), any(), any(), any()))
                .thenReturn(List.of(candidato1, candidato2));
        when(repository.existsByLancamentosFinanceiros_Id(any())).thenReturn(false);

        VinculoConciliacaoService.ResultadoSugestaoAutomatica resultado = service.rodarSugestaoAutomatica();

        assertThat(resultado.comMultiplosCandidatos()).isEqualTo(1);
        assertThat(vinculo.getEstadoConciliacao()).isEqualTo(VinculoConciliacao.NAO_VINCULADO);
    }

    @Test
    void rodarSugestaoAutomaticaDeveMarcarSemCorrespondenciaParaMovimentacaoDeTransferenciaInternaSemBuscarCandidato() {
        iniciar();
        MovimentacaoBancaria movimentacao = movimentacaoComId(new BigDecimal("-500.00"), LocalDate.now(), MovimentacaoBancaria.TRANSFERENCIA_INTERNA);
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
        MovimentacaoBancaria movimentacao = movimentacaoComId(new BigDecimal("-100.00"), LocalDate.now(), null);
        VinculoConciliacao vinculo = new VinculoConciliacao(movimentacao);
        when(repository.findById(id)).thenReturn(Optional.of(vinculo));

        assertThatThrownBy(() -> service.confirmar(id)).isInstanceOf(BusinessException.class);
    }

    @Test
    void confirmarComValoresDivergentesDeveLancarExcecao() {
        iniciar();
        UUID id = UUID.randomUUID();
        LocalDate data = LocalDate.of(2026, 3, 10);
        MovimentacaoBancaria movimentacao = movimentacaoComId(new BigDecimal("-100.00"), data, null);
        VinculoConciliacao vinculo = new VinculoConciliacao(movimentacao);
        vinculo.sugerirLancamentos(Set.of(lancamentoComId("Despesa", new BigDecimal("999.00"), data)));
        when(repository.findById(id)).thenReturn(Optional.of(vinculo));

        assertThatThrownBy(() -> service.confirmar(id)).isInstanceOf(BusinessException.class);
    }

    @Test
    void confirmarComValoresIguaisDeveConfirmar() {
        iniciar();
        UUID id = UUID.randomUUID();
        LocalDate data = LocalDate.of(2026, 3, 10);
        MovimentacaoBancaria movimentacao = movimentacaoComId(new BigDecimal("-100.00"), data, null);
        VinculoConciliacao vinculo = new VinculoConciliacao(movimentacao);
        vinculo.sugerirLancamentos(Set.of(lancamentoComId("Despesa", new BigDecimal("100.00"), data)));
        when(repository.findById(id)).thenReturn(Optional.of(vinculo));
        when(repository.save(any(VinculoConciliacao.class))).thenAnswer(invocation -> invocation.getArgument(0));

        VinculoConciliacao confirmado = service.confirmar(id);

        assertThat(confirmado.getEstadoConciliacao()).isEqualTo(VinculoConciliacao.CONFIRMADO);
    }

    @Test
    void marcarDivergenteSemLancamentoDeveLancarExcecao() {
        iniciar();
        UUID id = UUID.randomUUID();
        MovimentacaoBancaria movimentacao = movimentacaoComId(new BigDecimal("-100.00"), LocalDate.now(), null);
        VinculoConciliacao vinculo = new VinculoConciliacao(movimentacao);
        when(repository.findById(id)).thenReturn(Optional.of(vinculo));

        assertThatThrownBy(() -> service.marcarDivergente(id)).isInstanceOf(BusinessException.class);
    }

    @Test
    void vincularManualmenteComValoresIguaisDeveConfirmarDiretamente() {
        iniciar();
        UUID id = UUID.randomUUID();
        LocalDate data = LocalDate.of(2026, 3, 10);
        MovimentacaoBancaria movimentacao = movimentacaoComId(new BigDecimal("-100.00"), data, null);
        VinculoConciliacao vinculo = new VinculoConciliacao(movimentacao);
        LancamentoFinanceiro lancamento = lancamentoComId("Despesa", new BigDecimal("100.00"), data);
        when(repository.findById(id)).thenReturn(Optional.of(vinculo));
        when(repository.existsByLancamentosFinanceiros_Id(lancamento.getId())).thenReturn(false);
        when(lancamentoFinanceiroRepository.findById(lancamento.getId())).thenReturn(Optional.of(lancamento));
        when(repository.save(any(VinculoConciliacao.class))).thenAnswer(invocation -> invocation.getArgument(0));

        VinculoConciliacao vinculado = service.vincularManualmente(id, List.of(lancamento.getId()));

        assertThat(vinculado.getEstadoConciliacao()).isEqualTo(VinculoConciliacao.CONFIRMADO);
    }

    @Test
    void vincularManualmenteComVariosLancamentosDeveSomarOsValores() {
        iniciar();
        UUID id = UUID.randomUUID();
        LocalDate data = LocalDate.of(2026, 3, 10);
        MovimentacaoBancaria movimentacao = movimentacaoComId(new BigDecimal("-100.00"), data, null);
        VinculoConciliacao vinculo = new VinculoConciliacao(movimentacao);
        LancamentoFinanceiro lancamento1 = lancamentoComId("Despesa", new BigDecimal("60.00"), data);
        LancamentoFinanceiro lancamento2 = lancamentoComId("Despesa", new BigDecimal("40.00"), data);
        when(repository.findById(id)).thenReturn(Optional.of(vinculo));
        when(repository.existsByLancamentosFinanceiros_Id(any())).thenReturn(false);
        when(lancamentoFinanceiroRepository.findById(lancamento1.getId())).thenReturn(Optional.of(lancamento1));
        when(lancamentoFinanceiroRepository.findById(lancamento2.getId())).thenReturn(Optional.of(lancamento2));
        when(repository.save(any(VinculoConciliacao.class))).thenAnswer(invocation -> invocation.getArgument(0));

        VinculoConciliacao vinculado = service.vincularManualmente(id, List.of(lancamento1.getId(), lancamento2.getId()));

        assertThat(vinculado.getEstadoConciliacao()).isEqualTo(VinculoConciliacao.CONFIRMADO);
        assertThat(vinculado.getLancamentosFinanceiros()).containsExactlyInAnyOrder(lancamento1, lancamento2);
    }

    @Test
    void vincularManualmenteComValoresDiferentesDeveMarcarDivergente() {
        iniciar();
        UUID id = UUID.randomUUID();
        LocalDate data = LocalDate.of(2026, 3, 10);
        MovimentacaoBancaria movimentacao = movimentacaoComId(new BigDecimal("-100.00"), data, null);
        VinculoConciliacao vinculo = new VinculoConciliacao(movimentacao);
        LancamentoFinanceiro lancamento = lancamentoComId("Despesa", new BigDecimal("999.00"), data);
        when(repository.findById(id)).thenReturn(Optional.of(vinculo));
        when(repository.existsByLancamentosFinanceiros_Id(lancamento.getId())).thenReturn(false);
        when(lancamentoFinanceiroRepository.findById(lancamento.getId())).thenReturn(Optional.of(lancamento));
        when(repository.save(any(VinculoConciliacao.class))).thenAnswer(invocation -> invocation.getArgument(0));

        VinculoConciliacao vinculado = service.vincularManualmente(id, List.of(lancamento.getId()));

        assertThat(vinculado.getEstadoConciliacao()).isEqualTo(VinculoConciliacao.DIVERGENTE);
    }

    @Test
    void vincularManualmenteComLancamentoJaVinculadoDeveLancarExcecao() {
        iniciar();
        UUID id = UUID.randomUUID();
        UUID lancamentoId = UUID.randomUUID();
        MovimentacaoBancaria movimentacao = movimentacaoComId(new BigDecimal("-100.00"), LocalDate.now(), null);
        VinculoConciliacao vinculo = new VinculoConciliacao(movimentacao);
        when(repository.findById(id)).thenReturn(Optional.of(vinculo));
        when(repository.existsByLancamentosFinanceiros_Id(lancamentoId)).thenReturn(true);

        assertThatThrownBy(() -> service.vincularManualmente(id, List.of(lancamentoId))).isInstanceOf(BusinessException.class);
    }

    @Test
    void vincularManualmenteSemLancamentosDeveLancarExcecao() {
        iniciar();
        UUID id = UUID.randomUUID();
        MovimentacaoBancaria movimentacao = movimentacaoComId(new BigDecimal("-100.00"), LocalDate.now(), null);
        VinculoConciliacao vinculo = new VinculoConciliacao(movimentacao);
        when(repository.findById(id)).thenReturn(Optional.of(vinculo));

        assertThatThrownBy(() -> service.vincularManualmente(id, List.of())).isInstanceOf(BusinessException.class);
    }

    @Test
    void revalidarConciliacaoDeveManterConfirmadoQuandoAindaCompativel() {
        iniciar();
        LocalDate data = LocalDate.of(2026, 3, 10);
        MovimentacaoBancaria movimentacao = movimentacaoComId(new BigDecimal("-100.00"), data, null);
        VinculoConciliacao vinculo = new VinculoConciliacao(movimentacao);
        LancamentoFinanceiro lancamento = lancamentoComId("Despesa", new BigDecimal("100.00"), data);
        vinculo.confirmarDiretamenteComLancamentos(Set.of(lancamento));
        when(repository.findByEstadoConciliacaoAndLancamentosFinanceiros_Id(VinculoConciliacao.CONFIRMADO, lancamento.getId()))
                .thenReturn(List.of(vinculo));

        service.revalidarConciliacao(lancamento);

        assertThat(vinculo.getEstadoConciliacao()).isEqualTo(VinculoConciliacao.CONFIRMADO);
    }

    @Test
    void revalidarConciliacaoDeveMarcarDivergenteQuandoValorMudouAposEdicao() {
        iniciar();
        LocalDate data = LocalDate.of(2026, 3, 10);
        MovimentacaoBancaria movimentacao = movimentacaoComId(new BigDecimal("-100.00"), data, null);
        VinculoConciliacao vinculo = new VinculoConciliacao(movimentacao);
        LancamentoFinanceiro lancamento = lancamentoComId("Despesa", new BigDecimal("100.00"), data);
        vinculo.confirmarDiretamenteComLancamentos(Set.of(lancamento));
        when(repository.findByEstadoConciliacaoAndLancamentosFinanceiros_Id(VinculoConciliacao.CONFIRMADO, lancamento.getId()))
                .thenReturn(List.of(vinculo));
        when(repository.save(any(VinculoConciliacao.class))).thenAnswer(invocation -> invocation.getArgument(0));

        lancamento.setValor(new BigDecimal("150.00"));
        service.revalidarConciliacao(lancamento);

        assertThat(vinculo.getEstadoConciliacao()).isEqualTo(VinculoConciliacao.DIVERGENTE);
    }

    @Test
    void revalidarConciliacaoDeveMarcarDivergenteQuandoLancamentoForCancelado() {
        iniciar();
        LocalDate data = LocalDate.of(2026, 3, 10);
        MovimentacaoBancaria movimentacao = movimentacaoComId(new BigDecimal("-100.00"), data, null);
        VinculoConciliacao vinculo = new VinculoConciliacao(movimentacao);
        LancamentoFinanceiro lancamento = lancamentoComId("Despesa", new BigDecimal("100.00"), data);
        vinculo.confirmarDiretamenteComLancamentos(Set.of(lancamento));
        when(repository.findByEstadoConciliacaoAndLancamentosFinanceiros_Id(VinculoConciliacao.CONFIRMADO, lancamento.getId()))
                .thenReturn(List.of(vinculo));
        when(repository.save(any(VinculoConciliacao.class))).thenAnswer(invocation -> invocation.getArgument(0));

        lancamento.cancelar();
        service.revalidarConciliacao(lancamento);

        assertThat(vinculo.getEstadoConciliacao()).isEqualTo(VinculoConciliacao.DIVERGENTE);
    }

    @Test
    void estaConciliadoDeveSerVerdadeiroQuandoExisteVinculoConfirmado() {
        iniciar();
        UUID lancamentoId = UUID.randomUUID();
        when(repository.findByEstadoConciliacaoAndLancamentosFinanceiros_Id(VinculoConciliacao.CONFIRMADO, lancamentoId))
                .thenReturn(List.of(new VinculoConciliacao(movimentacaoComId(BigDecimal.TEN, LocalDate.now(), null))));

        assertThat(service.estaConciliado(lancamentoId)).isTrue();
    }

    @Test
    void estaConciliadoDeveSerFalsoQuandoNaoExisteVinculoConfirmado() {
        iniciar();
        UUID lancamentoId = UUID.randomUUID();
        when(repository.findByEstadoConciliacaoAndLancamentosFinanceiros_Id(VinculoConciliacao.CONFIRMADO, lancamentoId))
                .thenReturn(List.of());

        assertThat(service.estaConciliado(lancamentoId)).isFalse();
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
