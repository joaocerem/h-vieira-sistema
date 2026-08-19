package br.com.joaocerem.hvieira_financeiro.application.rateio;

import br.com.joaocerem.hvieira_financeiro.application.lancamentofinanceiro.LancamentoFinanceiroService;
import br.com.joaocerem.hvieira_financeiro.application.obra.ObraService;
import br.com.joaocerem.hvieira_financeiro.common.exception.BusinessException;
import br.com.joaocerem.hvieira_financeiro.common.exception.ResourceNotFoundException;
import br.com.joaocerem.hvieira_financeiro.common.validation.Validacoes;
import br.com.joaocerem.hvieira_financeiro.domain.lancamentofinanceiro.LancamentoFinanceiro;
import br.com.joaocerem.hvieira_financeiro.domain.obra.Obra;
import br.com.joaocerem.hvieira_financeiro.domain.rateio.RateioDespesa;
import br.com.joaocerem.hvieira_financeiro.domain.rateio.RateioDespesaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Casos de uso de Rateio de Despesa. Ver `docs/domain-model/16-rateio-despesa.md`.
 *
 * `lancamentoFinanceiroId` e `obraId` só são aceitos na criação — ver justificativa em
 * {@link RateioDespesa}. Rateio permanece livremente editável mesmo após Aplicação de Liquidação já
 * existente (D8, decisão #29) — nenhuma checagem contra `APLICAÇÃO_DE_LIQUIDAÇÃO` é feita aqui, de
 * propósito. Sem exclusão — Seção 4 do documento de domínio marca a exclusão como "questão distinta,
 * ainda em aberto".
 */
@Service
@Transactional
public class RateioDespesaService {

    private final RateioDespesaRepository repository;
    private final LancamentoFinanceiroService lancamentoFinanceiroService;
    private final ObraService obraService;

    public RateioDespesaService(RateioDespesaRepository repository,
                                 LancamentoFinanceiroService lancamentoFinanceiroService,
                                 ObraService obraService) {
        this.repository = repository;
        this.lancamentoFinanceiroService = lancamentoFinanceiroService;
        this.obraService = obraService;
    }

    public RateioDespesa criar(UUID lancamentoFinanceiroId, UUID obraId, BigDecimal valorRateado, String criterioInformado) {
        Validacoes.exigirValorMonetarioPositivo(valorRateado, "valorRateado");
        LancamentoFinanceiro lancamento = lancamentoFinanceiroService.buscarPorId(lancamentoFinanceiroId);
        if (lancamento.estaCancelado()) {
            throw new BusinessException("Lançamento está Cancelado — não pode receber Rateio de Despesa");
        }
        if (lancamento.getObraId() != null) {
            throw new BusinessException(
                    "Lançamento já tem obra atribuída diretamente (obraId preenchido) — mutuamente exclusivo com Rateio");
        }
        Obra obra = obraService.buscarPorId(obraId);

        BigDecimal somaAtual = repository.somarValorRateadoPorLancamento(lancamentoFinanceiroId);
        BigDecimal novaSoma = somaAtual.add(valorRateado);
        if (novaSoma.compareTo(lancamento.getValor()) > 0) {
            throw new BusinessException("a soma de valorRateado deste Lançamento ultrapassaria o valor do próprio Lançamento");
        }

        return repository.save(new RateioDespesa(lancamento, obra, valorRateado, criterioInformado));
    }

    public RateioDespesa atualizar(UUID id, BigDecimal valorRateado, String criterioInformado) {
        Validacoes.exigirValorMonetarioPositivo(valorRateado, "valorRateado");
        RateioDespesa rateio = buscarPorId(id);

        BigDecimal somaOutrosRateios = repository.somarValorRateadoPorLancamentoExcluindo(
                rateio.getLancamentoFinanceiro().getId(), id);
        BigDecimal novaSoma = somaOutrosRateios.add(valorRateado);
        if (novaSoma.compareTo(rateio.getLancamentoFinanceiro().getValor()) > 0) {
            throw new BusinessException("a soma de valorRateado deste Lançamento ultrapassaria o valor do próprio Lançamento");
        }

        rateio.setValorRateado(valorRateado);
        rateio.setCriterioInformado(criterioInformado);
        return repository.save(rateio);
    }

    @Transactional(readOnly = true)
    public RateioDespesa buscarPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rateio de Despesa não encontrado: " + id));
    }

    @Transactional(readOnly = true)
    public List<RateioDespesa> listarTodos() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public List<RateioDespesa> listarPorLancamento(UUID lancamentoFinanceiroId) {
        return repository.findByLancamentoFinanceiroId(lancamentoFinanceiroId);
    }

    /**
     * Usado pela propagação D5 (`CompraCartaoService`): a existência de qualquer Rateio para um
     * Lançamento desliga definitivamente a propagação automática de correções vindas da Compra de
     * Cartão de origem (decisão #27).
     */
    @Transactional(readOnly = true)
    public boolean existeRateioParaLancamento(UUID lancamentoFinanceiroId) {
        return !repository.findByLancamentoFinanceiroId(lancamentoFinanceiroId).isEmpty();
    }

}
