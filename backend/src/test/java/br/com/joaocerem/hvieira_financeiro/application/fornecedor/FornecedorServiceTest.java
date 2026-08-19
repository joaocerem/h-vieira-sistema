package br.com.joaocerem.hvieira_financeiro.application.fornecedor;

import br.com.joaocerem.hvieira_financeiro.common.exception.ResourceNotFoundException;
import br.com.joaocerem.hvieira_financeiro.domain.fornecedor.Fornecedor;
import br.com.joaocerem.hvieira_financeiro.domain.fornecedor.FornecedorRepository;
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
class FornecedorServiceTest {

    @Mock
    private FornecedorRepository repository;

    private FornecedorService service;

    @Test
    void criarDeveSalvarFornecedorComNomeInformado() {
        service = new FornecedorService(repository);
        when(repository.save(any(Fornecedor.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Fornecedor fornecedor = service.criar("Posto Ipiranga");

        assertThat(fornecedor.getNome()).isEqualTo("Posto Ipiranga");
    }

    @Test
    void buscarPorIdDeveLancarExcecaoQuandoNaoEncontrado() {
        service = new FornecedorService(repository);
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscarPorId(id))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void atualizarDeveAlterarNomeDoFornecedorExistente() {
        service = new FornecedorService(repository);
        UUID id = UUID.randomUUID();
        Fornecedor existente = new Fornecedor("Nome Antigo");
        when(repository.findById(id)).thenReturn(Optional.of(existente));
        when(repository.save(any(Fornecedor.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Fornecedor atualizado = service.atualizar(id, "Nome Novo");

        assertThat(atualizado.getNome()).isEqualTo("Nome Novo");
    }
}
