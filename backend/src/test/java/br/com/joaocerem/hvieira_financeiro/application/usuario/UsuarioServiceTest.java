package br.com.joaocerem.hvieira_financeiro.application.usuario;

import br.com.joaocerem.hvieira_financeiro.common.exception.ResourceNotFoundException;
import br.com.joaocerem.hvieira_financeiro.domain.usuario.Usuario;
import br.com.joaocerem.hvieira_financeiro.domain.usuario.UsuarioRepository;
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
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository repository;

    private UsuarioService service;

    @Test
    void criarDeveSalvarUsuarioComCamposInformados() {
        service = new UsuarioService(repository);
        when(repository.save(any(Usuario.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Usuario usuario = service.criar("Fulano", "fulano@hvieira.com", "Ativo");

        assertThat(usuario.getNome()).isEqualTo("Fulano");
        assertThat(usuario.getIdentificadorDeAcesso()).isEqualTo("fulano@hvieira.com");
        assertThat(usuario.getSituacaoDeAcesso()).isEqualTo("Ativo");
    }

    @Test
    void buscarPorIdDeveLancarExcecaoQuandoNaoEncontrado() {
        service = new UsuarioService(repository);
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscarPorId(id))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void atualizarNaoDeveAlterarIdentificadorDeAcesso() {
        service = new UsuarioService(repository);
        UUID id = UUID.randomUUID();
        Usuario existente = new Usuario("Nome Antigo", "id-acesso-original", "Ativo");
        when(repository.findById(id)).thenReturn(Optional.of(existente));
        when(repository.save(any(Usuario.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Usuario atualizado = service.atualizar(id, "Nome Novo", "Inativo");

        assertThat(atualizado.getNome()).isEqualTo("Nome Novo");
        assertThat(atualizado.getSituacaoDeAcesso()).isEqualTo("Inativo");
        assertThat(atualizado.getIdentificadorDeAcesso()).isEqualTo("id-acesso-original");
    }
}
