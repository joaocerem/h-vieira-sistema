package br.com.joaocerem.hvieira_financeiro.application.categoria;

import br.com.joaocerem.hvieira_financeiro.common.exception.ResourceNotFoundException;
import br.com.joaocerem.hvieira_financeiro.domain.categoria.Categoria;
import br.com.joaocerem.hvieira_financeiro.domain.categoria.CategoriaRepository;
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
class CategoriaServiceTest {

    @Mock
    private CategoriaRepository repository;

    private CategoriaService service;

    @Test
    void criarDeveSalvarCategoriaComNomeETipo() {
        service = new CategoriaService(repository);
        when(repository.save(any(Categoria.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Categoria categoria = service.criar("Combustível", "Despesa");

        assertThat(categoria.getNome()).isEqualTo("Combustível");
        assertThat(categoria.getTipo()).isEqualTo("Despesa");
    }

    @Test
    void buscarPorIdDeveLancarExcecaoQuandoNaoEncontrada() {
        service = new CategoriaService(repository);
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscarPorId(id))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void atualizarDeveAlterarNomeETipo() {
        service = new CategoriaService(repository);
        UUID id = UUID.randomUUID();
        Categoria existente = new Categoria("Nome Antigo", "Tipo Antigo");
        when(repository.findById(id)).thenReturn(Optional.of(existente));
        when(repository.save(any(Categoria.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Categoria atualizada = service.atualizar(id, "Manutenção", "Despesa");

        assertThat(atualizada.getNome()).isEqualTo("Manutenção");
        assertThat(atualizada.getTipo()).isEqualTo("Despesa");
    }
}
