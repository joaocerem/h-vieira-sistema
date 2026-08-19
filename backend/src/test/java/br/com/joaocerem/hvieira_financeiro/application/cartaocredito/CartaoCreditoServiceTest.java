package br.com.joaocerem.hvieira_financeiro.application.cartaocredito;

import br.com.joaocerem.hvieira_financeiro.application.contabancaria.ContaBancariaService;
import br.com.joaocerem.hvieira_financeiro.common.exception.ResourceNotFoundException;
import br.com.joaocerem.hvieira_financeiro.domain.cartaocredito.CartaoCredito;
import br.com.joaocerem.hvieira_financeiro.domain.cartaocredito.CartaoCreditoRepository;
import br.com.joaocerem.hvieira_financeiro.domain.contabancaria.ContaBancaria;
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
class CartaoCreditoServiceTest {

    @Mock
    private CartaoCreditoRepository repository;

    @Mock
    private ContaBancariaService contaBancariaService;

    private CartaoCreditoService service;

    @Test
    void criarDeveBuscarContaBancariaEVincularNoCartao() {
        service = new CartaoCreditoService(repository, contaBancariaService);
        UUID contaBancariaId = UUID.randomUUID();
        ContaBancaria conta = new ContaBancaria(new Empresa("H Vieira"), "Banco do Brasil", "Conta Principal");
        when(contaBancariaService.buscarPorId(contaBancariaId)).thenReturn(conta);
        when(repository.save(any(CartaoCredito.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CartaoCredito cartao = service.criar(contaBancariaId, "Nubank", "Cartão PJ", 10, 20);

        assertThat(cartao.getContaBancaria()).isSameAs(conta);
        assertThat(cartao.getDiaFechamento()).isEqualTo(10);
        assertThat(cartao.getDiaVencimento()).isEqualTo(20);
    }

    @Test
    void criarDevePropagarExcecaoQuandoContaBancariaNaoExiste() {
        service = new CartaoCreditoService(repository, contaBancariaService);
        UUID contaBancariaId = UUID.randomUUID();
        when(contaBancariaService.buscarPorId(contaBancariaId))
                .thenThrow(new ResourceNotFoundException("Conta Bancária não encontrada: " + contaBancariaId));

        assertThatThrownBy(() -> service.criar(contaBancariaId, "Nubank", "Cartão PJ", 10, 20))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void buscarPorIdDeveLancarExcecaoQuandoNaoEncontrado() {
        service = new CartaoCreditoService(repository, contaBancariaService);
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscarPorId(id))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void atualizarDeveAlterarCamposEditaveisSemAlterarContaBancaria() {
        service = new CartaoCreditoService(repository, contaBancariaService);
        UUID id = UUID.randomUUID();
        ContaBancaria conta = new ContaBancaria(new Empresa("H Vieira"), "Banco do Brasil", "Conta Principal");
        CartaoCredito existente = new CartaoCredito(conta, "Banco Antigo", "Apelido Antigo", 5, 15);
        when(repository.findById(id)).thenReturn(Optional.of(existente));
        when(repository.save(any(CartaoCredito.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CartaoCredito atualizado = service.atualizar(id, "Banco Novo", "Apelido Novo", 12, 22);

        assertThat(atualizado.getBanco()).isEqualTo("Banco Novo");
        assertThat(atualizado.getDiaFechamento()).isEqualTo(12);
        assertThat(atualizado.getDiaVencimento()).isEqualTo(22);
        assertThat(atualizado.getContaBancaria()).isSameAs(conta);
    }
}
