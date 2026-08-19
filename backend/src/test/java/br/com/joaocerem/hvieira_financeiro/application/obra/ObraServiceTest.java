package br.com.joaocerem.hvieira_financeiro.application.obra;

import br.com.joaocerem.hvieira_financeiro.application.cliente.ClienteService;
import br.com.joaocerem.hvieira_financeiro.common.exception.BusinessException;
import br.com.joaocerem.hvieira_financeiro.common.exception.ResourceNotFoundException;
import br.com.joaocerem.hvieira_financeiro.domain.cliente.Cliente;
import br.com.joaocerem.hvieira_financeiro.domain.obra.Obra;
import br.com.joaocerem.hvieira_financeiro.domain.obra.ObraRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ObraServiceTest {

    @Mock
    private ObraRepository repository;
    @Mock
    private ClienteService clienteService;

    private ObraService service;
    private Cliente cliente;

    private void iniciar() {
        service = new ObraService(repository, clienteService);
        cliente = new Cliente("Construtora ABC");
    }

    private Obra novaObra(String status) {
        Obra obra = new Obra(cliente, "Obra Teste", new BigDecimal("500000.00"),
                LocalDate.now(), LocalDate.now().plusMonths(6), null);
        if (!"A executar".equals(status)) {
            obra.transicionarStatus(status);
        }
        return obra;
    }

    @Test
    void criarDeveNascerComStatusAExecutar() {
        iniciar();
        UUID clienteId = UUID.randomUUID();
        when(clienteService.buscarPorId(clienteId)).thenReturn(cliente);
        when(repository.save(any(Obra.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Obra obra = service.criar(clienteId, "Obra Teste", new BigDecimal("500000.00"),
                LocalDate.now(), LocalDate.now().plusMonths(6), null);

        assertThat(obra.getStatus()).isEqualTo("A executar");
    }

    @Test
    void buscarPorIdDeveLancarExcecaoQuandoNaoEncontrada() {
        iniciar();
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscarPorId(id)).isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void transicaoAExecutarParaEmAndamentoDeveSerAceita() {
        iniciar();
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.of(novaObra("A executar")));
        when(repository.save(any(Obra.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Obra obra = service.transicionarStatus(id, "Em andamento");

        assertThat(obra.getStatus()).isEqualTo("Em andamento");
    }

    @Test
    void transicaoAExecutarParaConcluidaDeveSerRejeitada() {
        iniciar();
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.of(novaObra("A executar")));

        assertThatThrownBy(() -> service.transicionarStatus(id, "Concluída"))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void transicaoEmAndamentoParaPausadaDeveSerAceita() {
        iniciar();
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.of(novaObra("Em andamento")));
        when(repository.save(any(Obra.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Obra obra = service.transicionarStatus(id, "Pausada");

        assertThat(obra.getStatus()).isEqualTo("Pausada");
    }

    @Test
    void transicaoDeConcluidaDeveSerSempreRejeitada() {
        iniciar();
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.of(novaObra("Concluída")));

        assertThatThrownBy(() -> service.transicionarStatus(id, "Em andamento"))
                .isInstanceOf(BusinessException.class);
    }
}
