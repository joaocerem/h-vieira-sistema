package br.com.joaocerem.hvieira_financeiro.application.cliente;

import br.com.joaocerem.hvieira_financeiro.common.exception.ResourceNotFoundException;
import br.com.joaocerem.hvieira_financeiro.domain.cliente.Cliente;
import br.com.joaocerem.hvieira_financeiro.domain.cliente.ClienteRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ClienteServiceTest {

    @Mock
    private ClienteRepository repository;

    private ClienteService service;

    @Test
    void criarDeveSalvarClienteComNomeInformado() {
        service = new ClienteService(repository);
        when(repository.save(any(Cliente.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Cliente cliente = service.criar("Construtora ABC");

        assertThat(cliente.getNome()).isEqualTo("Construtora ABC");
    }

    @Test
    void buscarPorIdDeveLancarExcecaoQuandoNaoEncontrado() {
        service = new ClienteService(repository);
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscarPorId(id))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void atualizarDeveAlterarNomeDoClienteExistente() {
        service = new ClienteService(repository);
        UUID id = UUID.randomUUID();
        Cliente existente = new Cliente("Nome Antigo");
        when(repository.findById(id)).thenReturn(Optional.of(existente));
        when(repository.save(any(Cliente.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Cliente atualizado = service.atualizar(id, "Nome Novo");

        assertThat(atualizado.getNome()).isEqualTo("Nome Novo");
    }
}
