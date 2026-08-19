package br.com.joaocerem.hvieira_financeiro.application.frota;

import br.com.joaocerem.hvieira_financeiro.application.empresa.EmpresaService;
import br.com.joaocerem.hvieira_financeiro.application.obra.ObraService;
import br.com.joaocerem.hvieira_financeiro.common.exception.BusinessException;
import br.com.joaocerem.hvieira_financeiro.common.exception.ResourceNotFoundException;
import br.com.joaocerem.hvieira_financeiro.domain.empresa.Empresa;
import br.com.joaocerem.hvieira_financeiro.domain.frota.Veiculo;
import br.com.joaocerem.hvieira_financeiro.domain.frota.VeiculoRepository;
import br.com.joaocerem.hvieira_financeiro.domain.obra.Obra;
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
class VeiculoServiceTest {

    @Mock
    private VeiculoRepository repository;
    @Mock
    private EmpresaService empresaService;
    @Mock
    private ObraService obraService;

    private VeiculoService service;
    private Empresa empresa;

    private void iniciar() {
        service = new VeiculoService(repository, empresaService, obraService);
        empresa = new Empresa("H Vieira");
    }

    @Test
    void criarComTipoValidoSemObraDeveSerAceito() {
        iniciar();
        UUID empresaId = UUID.randomUUID();
        when(empresaService.buscarPorId(empresaId)).thenReturn(empresa);
        when(repository.save(any(Veiculo.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Veiculo veiculo = service.criar(empresaId, "Caminhão 01", "Caminhão", null);

        assertThat(veiculo.getTipo()).isEqualTo("Caminhão");
        assertThat(veiculo.getObraAtual()).isNull();
    }

    @Test
    void criarComTipoInvalidoDeveLancarExcecao() {
        iniciar();
        assertThatThrownBy(() -> service.criar(UUID.randomUUID(), "Caminhão 01", "Trator de Esteira", null))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void buscarPorIdDeveLancarExcecaoQuandoNaoEncontrado() {
        iniciar();
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscarPorId(id)).isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void atualizarDevePermitirDesalocarObraAtual() {
        iniciar();
        UUID id = UUID.randomUUID();
        Obra obraAtual = new Obra(null, "Obra X", null, null, null, null);
        Veiculo existente = new Veiculo(empresa, "Caminhão 01", "Caminhão", obraAtual);
        when(repository.findById(id)).thenReturn(Optional.of(existente));
        when(repository.save(any(Veiculo.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Veiculo atualizado = service.atualizar(id, "Caminhão 01", "Caminhão", null);

        assertThat(atualizado.getObraAtual()).isNull();
    }
}
