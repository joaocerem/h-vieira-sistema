package br.com.joaocerem.hvieira_financeiro.application.ajustefinanceiro;

import br.com.joaocerem.hvieira_financeiro.application.lancamentofinanceiro.LancamentoFinanceiroService;
import br.com.joaocerem.hvieira_financeiro.application.usuario.UsuarioService;
import br.com.joaocerem.hvieira_financeiro.common.exception.BusinessException;
import br.com.joaocerem.hvieira_financeiro.common.exception.ResourceNotFoundException;
import br.com.joaocerem.hvieira_financeiro.domain.ajustefinanceiro.AjusteFinanceiro;
import br.com.joaocerem.hvieira_financeiro.domain.ajustefinanceiro.AjusteFinanceiroRepository;
import br.com.joaocerem.hvieira_financeiro.domain.categoria.Categoria;
import br.com.joaocerem.hvieira_financeiro.domain.empresa.Empresa;
import br.com.joaocerem.hvieira_financeiro.domain.fornecedor.Fornecedor;
import br.com.joaocerem.hvieira_financeiro.domain.lancamentofinanceiro.LancamentoFinanceiro;
import br.com.joaocerem.hvieira_financeiro.domain.usuario.Usuario;
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
class AjusteFinanceiroServiceTest {

    @Mock
    private AjusteFinanceiroRepository repository;
    @Mock
    private LancamentoFinanceiroService lancamentoFinanceiroService;
    @Mock
    private UsuarioService usuarioService;

    private AjusteFinanceiroService service;
    private Usuario usuario;

    private void iniciar() {
        service = new AjusteFinanceiroService(repository, lancamentoFinanceiroService, usuarioService);
        usuario = new Usuario("Fulano", "fulano@hvieira.com", "Ativo");
    }

    private LancamentoFinanceiro lancamentoComId(UUID id) {
        LancamentoFinanceiro lancamento = new LancamentoFinanceiro("Despesa", new Empresa("H Vieira"),
                new Categoria("Combustível", "Despesa"), new Fornecedor("Posto Ipiranga"), null, null, null,
                new BigDecimal("100.00"), LocalDate.now(), LocalDate.now().plusDays(30), "Manual", null, null);
        ReflectionTestUtils.setField(lancamento, "id", id);
        return lancamento;
    }

    @Test
    void criarComDadosValidosDeveSerAceito() {
        iniciar();
        UUID originalId = UUID.randomUUID();
        UUID ajusteId = UUID.randomUUID();
        UUID usuarioId = UUID.randomUUID();
        when(lancamentoFinanceiroService.buscarPorId(originalId)).thenReturn(lancamentoComId(originalId));
        when(lancamentoFinanceiroService.buscarPorId(ajusteId)).thenReturn(lancamentoComId(ajusteId));
        when(usuarioService.buscarPorId(usuarioId)).thenReturn(usuario);
        when(repository.save(any(AjusteFinanceiro.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AjusteFinanceiro ajuste = service.criar(originalId, ajusteId, "Estorno", new BigDecimal("50.00"),
                LocalDate.now(), usuarioId, "erro de digitação");

        assertThat(ajuste.getTipoAjuste()).isEqualTo("Estorno");
        assertThat(ajuste.getValor()).isEqualByComparingTo("50.00");
    }

    @Test
    void criarComMesmoLancamentoParaOriginalEAjusteDeveLancarExcecao() {
        iniciar();
        UUID id = UUID.randomUUID();

        assertThatThrownBy(() -> service.criar(id, id, "Estorno", new BigDecimal("50.00"),
                LocalDate.now(), UUID.randomUUID(), null))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void criarComTipoAjusteInvalidoDeveLancarExcecao() {
        iniciar();
        assertThatThrownBy(() -> service.criar(UUID.randomUUID(), UUID.randomUUID(), "Devolução",
                new BigDecimal("50.00"), LocalDate.now(), UUID.randomUUID(), null))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void criarComValorNegativoDeveLancarExcecao() {
        iniciar();
        assertThatThrownBy(() -> service.criar(UUID.randomUUID(), UUID.randomUUID(), "Estorno",
                new BigDecimal("-10.00"), LocalDate.now(), UUID.randomUUID(), null))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void criarComLancamentoOriginalCanceladoDeveLancarExcecao() {
        iniciar();
        UUID originalId = UUID.randomUUID();
        UUID ajusteId = UUID.randomUUID();
        LancamentoFinanceiro lancamentoOriginal = lancamentoComId(originalId);
        lancamentoOriginal.cancelar();
        when(lancamentoFinanceiroService.buscarPorId(originalId)).thenReturn(lancamentoOriginal);
        when(lancamentoFinanceiroService.buscarPorId(ajusteId)).thenReturn(lancamentoComId(ajusteId));

        assertThatThrownBy(() -> service.criar(originalId, ajusteId, "Estorno", new BigDecimal("50.00"),
                LocalDate.now(), UUID.randomUUID(), null))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void criarComLancamentoAjusteCanceladoDeveLancarExcecao() {
        iniciar();
        UUID originalId = UUID.randomUUID();
        UUID ajusteId = UUID.randomUUID();
        LancamentoFinanceiro lancamentoAjuste = lancamentoComId(ajusteId);
        lancamentoAjuste.cancelar();
        when(lancamentoFinanceiroService.buscarPorId(originalId)).thenReturn(lancamentoComId(originalId));
        when(lancamentoFinanceiroService.buscarPorId(ajusteId)).thenReturn(lancamentoAjuste);

        assertThatThrownBy(() -> service.criar(originalId, ajusteId, "Estorno", new BigDecimal("50.00"),
                LocalDate.now(), UUID.randomUUID(), null))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void buscarPorIdDeveLancarExcecaoQuandoNaoEncontrado() {
        iniciar();
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscarPorId(id)).isInstanceOf(ResourceNotFoundException.class);
    }
}
