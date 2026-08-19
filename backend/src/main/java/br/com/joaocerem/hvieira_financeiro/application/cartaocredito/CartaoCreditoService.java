package br.com.joaocerem.hvieira_financeiro.application.cartaocredito;

import br.com.joaocerem.hvieira_financeiro.application.contabancaria.ContaBancariaService;
import br.com.joaocerem.hvieira_financeiro.common.exception.ResourceNotFoundException;
import br.com.joaocerem.hvieira_financeiro.domain.cartaocredito.CartaoCredito;
import br.com.joaocerem.hvieira_financeiro.domain.cartaocredito.CartaoCreditoRepository;
import br.com.joaocerem.hvieira_financeiro.domain.contabancaria.ContaBancaria;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Casos de uso de Cartão de Crédito. `contaBancariaId` só é aceito na criação — ver justificativa em
 * {@link CartaoCredito}. Sem exclusão — `docs/domain-model/17-cartao-credito.md` Seção 4 não define
 * regra de exclusão, e Compra Cartão/Fatura dependerão de Cartão via FK RESTRICT quando implementados.
 */
@Service
@Transactional
public class CartaoCreditoService {

    private final CartaoCreditoRepository repository;
    private final ContaBancariaService contaBancariaService;

    public CartaoCreditoService(CartaoCreditoRepository repository, ContaBancariaService contaBancariaService) {
        this.repository = repository;
        this.contaBancariaService = contaBancariaService;
    }

    public CartaoCredito criar(UUID contaBancariaId, String banco, String apelido, Integer diaFechamento, Integer diaVencimento) {
        ContaBancaria contaBancaria = contaBancariaService.buscarPorId(contaBancariaId);
        return repository.save(new CartaoCredito(contaBancaria, banco, apelido, diaFechamento, diaVencimento));
    }

    public CartaoCredito atualizar(UUID id, String banco, String apelido, Integer diaFechamento, Integer diaVencimento) {
        CartaoCredito cartao = buscarPorId(id);
        cartao.setBanco(banco);
        cartao.setApelido(apelido);
        cartao.setDiaFechamento(diaFechamento);
        cartao.setDiaVencimento(diaVencimento);
        return repository.save(cartao);
    }

    @Transactional(readOnly = true)
    public CartaoCredito buscarPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cartão de Crédito não encontrado: " + id));
    }

    @Transactional(readOnly = true)
    public List<CartaoCredito> listarTodos() {
        return repository.findAll();
    }
}
