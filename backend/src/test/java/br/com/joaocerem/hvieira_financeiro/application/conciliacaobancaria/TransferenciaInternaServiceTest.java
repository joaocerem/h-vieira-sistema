package br.com.joaocerem.hvieira_financeiro.application.conciliacaobancaria;

import br.com.joaocerem.hvieira_financeiro.common.exception.BusinessException;
import br.com.joaocerem.hvieira_financeiro.common.exception.ResourceNotFoundException;
import br.com.joaocerem.hvieira_financeiro.domain.conciliacaobancaria.MovimentacaoBancaria;
import br.com.joaocerem.hvieira_financeiro.domain.conciliacaobancaria.MovimentacaoBancariaRepository;
import br.com.joaocerem.hvieira_financeiro.domain.conciliacaobancaria.TransferenciaInterna;
import br.com.joaocerem.hvieira_financeiro.domain.conciliacaobancaria.TransferenciaInternaRepository;
import br.com.joaocerem.hvieira_financeiro.domain.contabancaria.ContaBancaria;
import br.com.joaocerem.hvieira_financeiro.domain.empresa.Empresa;
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
class TransferenciaInternaServiceTest {

    @Mock
    private TransferenciaInternaRepository repository;
    @Mock
    private MovimentacaoBancariaRepository movimentacaoBancariaRepository;

    private TransferenciaInternaService service;
    private ContaBancaria contaBancaria;

    private void iniciar() {
        service = new TransferenciaInternaService(repository, movimentacaoBancariaRepository);
        contaBancaria = new ContaBancaria(new Empresa("H Vieira"), "Banco do Brasil", "Conta Principal");
    }

    private MovimentacaoBancaria movimentacaoComId(UUID id, BigDecimal valor) {
        MovimentacaoBancaria movimentacao = new MovimentacaoBancaria(contaBancaria, LocalDate.now(), "Transferência", valor);
        ReflectionTestUtils.setField(movimentacao, "id", id);
        return movimentacao;
    }

    @Test
    void criarComMovimentacoesValidasDeveReclassificarAmbasComoTransferenciaInterna() {
        iniciar();
        UUID origemId = UUID.randomUUID();
        UUID destinoId = UUID.randomUUID();
        MovimentacaoBancaria origem = movimentacaoComId(origemId, new BigDecimal("-1000.00"));
        MovimentacaoBancaria destino = movimentacaoComId(destinoId, new BigDecimal("1000.00"));
        when(movimentacaoBancariaRepository.findById(origemId)).thenReturn(Optional.of(origem));
        when(movimentacaoBancariaRepository.findById(destinoId)).thenReturn(Optional.of(destino));
        when(repository.existeTransferenciaEnvolvendoAlgumaDas(origemId, destinoId)).thenReturn(false);
        when(repository.save(any(TransferenciaInterna.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(movimentacaoBancariaRepository.save(any(MovimentacaoBancaria.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TransferenciaInterna transferencia = service.criar(origemId, destinoId, new BigDecimal("1000.00"), LocalDate.now());

        assertThat(transferencia.getMovimentacaoOrigem()).isSameAs(origem);
        assertThat(transferencia.getMovimentacaoDestino()).isSameAs(destino);
        assertThat(origem.getClassificacao()).isEqualTo(MovimentacaoBancaria.TRANSFERENCIA_INTERNA);
        assertThat(destino.getClassificacao()).isEqualTo(MovimentacaoBancaria.TRANSFERENCIA_INTERNA);
    }

    @Test
    void criarComMesmaMovimentacaoOrigemEDestinoDeveLancarExcecao() {
        iniciar();
        UUID id = UUID.randomUUID();
        assertThatThrownBy(() -> service.criar(id, id, new BigDecimal("100.00"), LocalDate.now()))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void criarComValorNaoPositivoDeveLancarExcecao() {
        iniciar();
        assertThatThrownBy(() -> service.criar(UUID.randomUUID(), UUID.randomUUID(), BigDecimal.ZERO, LocalDate.now()))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void criarQuandoMovimentacaoJaParticipaDeOutraTransferenciaDeveLancarExcecao() {
        iniciar();
        UUID origemId = UUID.randomUUID();
        UUID destinoId = UUID.randomUUID();
        when(movimentacaoBancariaRepository.findById(origemId)).thenReturn(Optional.of(movimentacaoComId(origemId, new BigDecimal("-100.00"))));
        when(movimentacaoBancariaRepository.findById(destinoId)).thenReturn(Optional.of(movimentacaoComId(destinoId, new BigDecimal("100.00"))));
        when(repository.existeTransferenciaEnvolvendoAlgumaDas(origemId, destinoId)).thenReturn(true);

        assertThatThrownBy(() -> service.criar(origemId, destinoId, new BigDecimal("100.00"), LocalDate.now()))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void criarComMovimentacaoOrigemInexistenteDeveLancarExcecao() {
        iniciar();
        UUID origemId = UUID.randomUUID();
        UUID destinoId = UUID.randomUUID();
        when(movimentacaoBancariaRepository.findById(origemId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.criar(origemId, destinoId, new BigDecimal("100.00"), LocalDate.now()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void buscarPorIdDeveLancarExcecaoQuandoNaoEncontrada() {
        iniciar();
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscarPorId(id)).isInstanceOf(ResourceNotFoundException.class);
    }
}
