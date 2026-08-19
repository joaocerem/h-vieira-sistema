package br.com.joaocerem.hvieira_financeiro.application.contabancaria;

import br.com.joaocerem.hvieira_financeiro.application.empresa.EmpresaService;
import br.com.joaocerem.hvieira_financeiro.common.exception.ResourceNotFoundException;
import br.com.joaocerem.hvieira_financeiro.domain.contabancaria.ContaBancaria;
import br.com.joaocerem.hvieira_financeiro.domain.contabancaria.ContaBancariaRepository;
import br.com.joaocerem.hvieira_financeiro.domain.empresa.Empresa;
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
class ContaBancariaServiceTest {

    @Mock
    private ContaBancariaRepository repository;

    @Mock
    private EmpresaService empresaService;

    private ContaBancariaService service;

    @Test
    void criarDeveBuscarEmpresaEVincularNaContaBancaria() {
        service = new ContaBancariaService(repository, empresaService);
        UUID empresaId = UUID.randomUUID();
        Empresa empresa = new Empresa("H Vieira");
        when(empresaService.buscarPorId(empresaId)).thenReturn(empresa);
        when(repository.save(any(ContaBancaria.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ContaBancaria conta = service.criar(empresaId, "Banco do Brasil", "Conta Principal");

        assertThat(conta.getEmpresa()).isSameAs(empresa);
        assertThat(conta.getBanco()).isEqualTo("Banco do Brasil");
    }

    @Test
    void criarDevePropagarExcecaoQuandoEmpresaNaoExiste() {
        service = new ContaBancariaService(repository, empresaService);
        UUID empresaId = UUID.randomUUID();
        when(empresaService.buscarPorId(empresaId)).thenThrow(new ResourceNotFoundException("Empresa não encontrada: " + empresaId));

        assertThatThrownBy(() -> service.criar(empresaId, "Banco", "Apelido"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void buscarPorIdDeveLancarExcecaoQuandoNaoEncontrada() {
        service = new ContaBancariaService(repository, empresaService);
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscarPorId(id))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void atualizarDeveAlterarBancoEApelidoSemAlterarEmpresa() {
        service = new ContaBancariaService(repository, empresaService);
        UUID id = UUID.randomUUID();
        Empresa empresa = new Empresa("H Vieira");
        ContaBancaria existente = new ContaBancaria(empresa, "Banco Antigo", "Apelido Antigo");
        when(repository.findById(id)).thenReturn(Optional.of(existente));
        when(repository.save(any(ContaBancaria.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ContaBancaria atualizada = service.atualizar(id, "Banco Novo", "Apelido Novo");

        assertThat(atualizada.getBanco()).isEqualTo("Banco Novo");
        assertThat(atualizada.getApelido()).isEqualTo("Apelido Novo");
        assertThat(atualizada.getEmpresa()).isSameAs(empresa);
    }
}
