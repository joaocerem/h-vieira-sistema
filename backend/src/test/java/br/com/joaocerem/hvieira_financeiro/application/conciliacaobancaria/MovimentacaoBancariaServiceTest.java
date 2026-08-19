package br.com.joaocerem.hvieira_financeiro.application.conciliacaobancaria;

import br.com.joaocerem.hvieira_financeiro.application.contabancaria.ContaBancariaService;
import br.com.joaocerem.hvieira_financeiro.common.exception.BusinessException;
import br.com.joaocerem.hvieira_financeiro.common.exception.ResourceNotFoundException;
import br.com.joaocerem.hvieira_financeiro.domain.conciliacaobancaria.MovimentacaoBancaria;
import br.com.joaocerem.hvieira_financeiro.domain.conciliacaobancaria.MovimentacaoBancariaRepository;
import br.com.joaocerem.hvieira_financeiro.domain.conciliacaobancaria.VinculoConciliacao;
import br.com.joaocerem.hvieira_financeiro.domain.conciliacaobancaria.VinculoConciliacaoRepository;
import br.com.joaocerem.hvieira_financeiro.domain.contabancaria.ContaBancaria;
import br.com.joaocerem.hvieira_financeiro.domain.empresa.Empresa;
import br.com.joaocerem.hvieira_financeiro.domain.liquidacaofinanceira.LiquidacaoFinanceira;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
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
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MovimentacaoBancariaServiceTest {

    @Mock
    private MovimentacaoBancariaRepository repository;
    @Mock
    private VinculoConciliacaoRepository vinculoConciliacaoRepository;
    @Mock
    private ContaBancariaService contaBancariaService;

    private MovimentacaoBancariaService service;
    private ContaBancaria contaBancaria;

    private void iniciar() {
        service = new MovimentacaoBancariaService(repository, vinculoConciliacaoRepository, contaBancariaService);
        contaBancaria = new ContaBancaria(new Empresa("H Vieira"), "Banco do Brasil", "Conta Principal");
    }

    @Test
    void importarDeveCriarMovimentacaoEVinculoNaoVinculado() {
        iniciar();
        UUID contaBancariaId = UUID.randomUUID();
        when(contaBancariaService.buscarPorId(contaBancariaId)).thenReturn(contaBancaria);
        when(repository.save(any(MovimentacaoBancaria.class))).thenAnswer(invocation -> invocation.getArgument(0));

        List<MovimentacaoBancaria> importadas = service.importar(contaBancariaId, List.of(
                new ItemImportacaoMovimentacao(LocalDate.now(), "Pix recebido", new BigDecimal("150.00"))));

        assertThat(importadas).hasSize(1);
        assertThat(importadas.get(0).getClassificacao()).isEqualTo(MovimentacaoBancaria.NAO_CLASSIFICADA);

        ArgumentCaptor<VinculoConciliacao> vinculoCaptor = ArgumentCaptor.forClass(VinculoConciliacao.class);
        verify(vinculoConciliacaoRepository).save(vinculoCaptor.capture());
        assertThat(vinculoCaptor.getValue().getEstadoConciliacao()).isEqualTo(VinculoConciliacao.NAO_VINCULADO);
        assertThat(vinculoCaptor.getValue().getLiquidacaoFinanceira()).isNull();
    }

    @Test
    void importarComListaVaziaDeveLancarExcecao() {
        iniciar();
        assertThatThrownBy(() -> service.importar(UUID.randomUUID(), List.of()))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void importarComItemSemDescricaoDeveLancarExcecao() {
        iniciar();
        UUID contaBancariaId = UUID.randomUUID();
        when(contaBancariaService.buscarPorId(contaBancariaId)).thenReturn(contaBancaria);

        assertThatThrownBy(() -> service.importar(contaBancariaId, List.of(
                new ItemImportacaoMovimentacao(LocalDate.now(), "  ", new BigDecimal("10.00")))))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void gerarAPartirDeLiquidacaoDePagamentoDeveGerarValorNegativoEVinculoConfirmado() {
        iniciar();
        LiquidacaoFinanceira liquidacao = new LiquidacaoFinanceira("Pagamento", LocalDate.now(), new BigDecimal("300.00"), contaBancaria);
        ReflectionTestUtils.setField(liquidacao, "id", UUID.randomUUID());
        when(repository.save(any(MovimentacaoBancaria.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MovimentacaoBancaria movimentacao = service.gerarAPartirDeLiquidacao(liquidacao);

        assertThat(movimentacao.getValor()).isEqualByComparingTo(new BigDecimal("-300.00"));

        ArgumentCaptor<VinculoConciliacao> vinculoCaptor = ArgumentCaptor.forClass(VinculoConciliacao.class);
        verify(vinculoConciliacaoRepository).save(vinculoCaptor.capture());
        assertThat(vinculoCaptor.getValue().getEstadoConciliacao()).isEqualTo(VinculoConciliacao.CONFIRMADO);
        assertThat(vinculoCaptor.getValue().getLiquidacaoFinanceira()).isSameAs(liquidacao);
    }

    @Test
    void gerarAPartirDeLiquidacaoDeRecebimentoDeveGerarValorPositivo() {
        iniciar();
        LiquidacaoFinanceira liquidacao = new LiquidacaoFinanceira("Recebimento", LocalDate.now(), new BigDecimal("500.00"), contaBancaria);
        when(repository.save(any(MovimentacaoBancaria.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MovimentacaoBancaria movimentacao = service.gerarAPartirDeLiquidacao(liquidacao);

        assertThat(movimentacao.getValor()).isEqualByComparingTo(new BigDecimal("500.00"));
    }

    @Test
    void reclassificarDeveAlterarClassificacao() {
        iniciar();
        UUID id = UUID.randomUUID();
        MovimentacaoBancaria movimentacao = new MovimentacaoBancaria(contaBancaria, LocalDate.now(), "Combustível", new BigDecimal("-80.00"));
        when(repository.findById(id)).thenReturn(Optional.of(movimentacao));
        when(repository.save(any(MovimentacaoBancaria.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MovimentacaoBancaria reclassificada = service.reclassificar(id, "Terraplanagem");

        assertThat(reclassificada.getClassificacao()).isEqualTo("Terraplanagem");
    }

    @Test
    void reclassificarComValorInvalidoDeveLancarExcecao() {
        iniciar();
        assertThatThrownBy(() -> service.reclassificar(UUID.randomUUID(), "Qualquer Coisa"))
                .isInstanceOf(BusinessException.class);
        verify(repository, never()).findById(any());
    }

    @Test
    void reclassificarParaTransferenciaInternaDiretamenteDeveLancarExcecao() {
        iniciar();
        assertThatThrownBy(() -> service.reclassificar(UUID.randomUUID(), MovimentacaoBancaria.TRANSFERENCIA_INTERNA))
                .isInstanceOf(BusinessException.class);
        verify(repository, never()).findById(any());
    }

    @Test
    void buscarPorIdDeveLancarExcecaoQuandoNaoEncontrada() {
        iniciar();
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscarPorId(id)).isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void listarPorContaDeveDelegarAoRepositorio() {
        iniciar();
        UUID contaBancariaId = UUID.randomUUID();
        service.listarPorConta(contaBancariaId);
        verify(repository, times(1)).findByContaBancariaId(contaBancariaId);
    }
}
