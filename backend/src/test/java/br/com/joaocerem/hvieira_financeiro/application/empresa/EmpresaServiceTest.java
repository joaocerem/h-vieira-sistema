package br.com.joaocerem.hvieira_financeiro.application.empresa;

import br.com.joaocerem.hvieira_financeiro.common.exception.ResourceNotFoundException;
import br.com.joaocerem.hvieira_financeiro.domain.empresa.Empresa;
import br.com.joaocerem.hvieira_financeiro.domain.empresa.EmpresaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmpresaServiceTest {

    @Mock
    private EmpresaRepository repository;

    private EmpresaService service;

    @Test
    void criarDeveSalvarEmpresaComNomeInformado() {
        service = new EmpresaService(repository);
        when(repository.save(any(Empresa.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Empresa empresa = service.criar("H Vieira");

        assertThat(empresa.getNome()).isEqualTo("H Vieira");
        verify(repository).save(any(Empresa.class));
    }

    @Test
    void buscarPorIdDeveLancarExcecaoQuandoNaoEncontrada() {
        service = new EmpresaService(repository);
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscarPorId(id))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void atualizarDeveAlterarNomeDaEmpresaExistente() {
        service = new EmpresaService(repository);
        UUID id = UUID.randomUUID();
        Empresa existente = new Empresa("Nome Antigo");
        when(repository.findById(id)).thenReturn(Optional.of(existente));
        when(repository.save(any(Empresa.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Empresa atualizada = service.atualizar(id, "Nome Novo");

        assertThat(atualizada.getNome()).isEqualTo("Nome Novo");
    }

    @Test
    void listarTodasDeveDelegarParaRepositorio() {
        service = new EmpresaService(repository);
        when(repository.findAll()).thenReturn(List.of(new Empresa("H Vieira")));

        List<Empresa> empresas = service.listarTodas();

        assertThat(empresas).hasSize(1);
    }
}
