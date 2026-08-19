package br.com.joaocerem.hvieira_financeiro.application.fatura;

import br.com.joaocerem.hvieira_financeiro.application.cartaocredito.CartaoCreditoService;
import br.com.joaocerem.hvieira_financeiro.application.liquidacaofinanceira.AplicacaoLancamento;
import br.com.joaocerem.hvieira_financeiro.application.liquidacaofinanceira.LiquidacaoFinanceiraService;
import br.com.joaocerem.hvieira_financeiro.application.parcela.ParcelaService;
import br.com.joaocerem.hvieira_financeiro.common.exception.BusinessException;
import br.com.joaocerem.hvieira_financeiro.common.exception.ResourceNotFoundException;
import br.com.joaocerem.hvieira_financeiro.common.validation.Validacoes;
import br.com.joaocerem.hvieira_financeiro.domain.cartaocredito.CartaoCredito;
import br.com.joaocerem.hvieira_financeiro.domain.fatura.Fatura;
import br.com.joaocerem.hvieira_financeiro.domain.fatura.FaturaRepository;
import br.com.joaocerem.hvieira_financeiro.domain.liquidacaofinanceira.LiquidacaoFinanceira;
import br.com.joaocerem.hvieira_financeiro.domain.parcela.Parcela;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Casos de uso de Fatura. Ver `docs/domain-model/19-fatura.md`.
 *
 * `fecharCiclo` é o único caso de uso de criação — a existência da Fatura já representa o fechamento
 * do ciclo; `valor_total_calculado`/`valor_cobrado` ficam congelados desde então (sem `atualizar`).
 * `pagar` implementa o relacionamento Fatura→Liquidação (Seção 3): cria a Liquidação pelo valor
 * cobrado, com Aplicações cobrindo integralmente cada Lançamento já gerado pelas Parcelas do ciclo —
 * mesmo caso de uso do módulo Financeiro já implementado (arbitragem técnica, Divergência 6),
 * reaproveitado aqui, não duplicado.
 */
@Service
@Transactional
public class FaturaService {

    private final FaturaRepository repository;
    private final CartaoCreditoService cartaoCreditoService;
    private final ParcelaService parcelaService;
    private final LiquidacaoFinanceiraService liquidacaoFinanceiraService;

    public FaturaService(FaturaRepository repository, CartaoCreditoService cartaoCreditoService,
                          ParcelaService parcelaService, LiquidacaoFinanceiraService liquidacaoFinanceiraService) {
        this.repository = repository;
        this.cartaoCreditoService = cartaoCreditoService;
        this.parcelaService = parcelaService;
        this.liquidacaoFinanceiraService = liquidacaoFinanceiraService;
    }

    /**
     * Fecha o ciclo `ciclo` (formato `AAAA-MM`) do Cartão, calculando `valorTotalCalculado` a partir
     * das Parcelas elegíveis (decisão #39) e congelando `valorCobrado` informado pelo usuário.
     */
    public Fatura fecharCiclo(UUID cartaoId, String ciclo, BigDecimal valorCobrado) {
        Validacoes.exigirValorMonetarioPositivo(valorCobrado, "valorCobrado");
        YearMonth cicloMes = parseCiclo(ciclo);
        CartaoCredito cartao = cartaoCreditoService.buscarPorId(cartaoId);

        if (repository.findByCartaoIdAndCiclo(cartaoId, ciclo).isPresent()) {
            throw new BusinessException("já existe Fatura fechada para este Cartão e ciclo");
        }

        List<Parcela> parcelasElegiveis = parcelaService.listarElegiveisParaFechamento(cartaoId, cicloMes);
        BigDecimal valorTotalCalculado = parcelasElegiveis.stream()
                .map(Parcela::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Fatura fatura = repository.save(new Fatura(cartao, ciclo, valorTotalCalculado, valorCobrado));

        for (Parcela parcela : parcelasElegiveis) {
            parcelaService.atribuirFatura(parcela, fatura);
        }

        return fatura;
    }

    /**
     * Paga a Fatura: cria a Liquidação (tipo Pagamento, valor = `valorCobrado`), com Aplicações
     * cobrindo integralmente cada Lançamento já gerado pelas Parcelas desta Fatura (Parcelas sem
     * Lançamento gerado — compras não classificadas Terraplanagem, ou ainda não processadas — não
     * entram; a diferença resultante corresponde exatamente às compras não-operacionais, Seção 4).
     */
    public Fatura pagar(UUID faturaId, UUID contaBancariaId, LocalDate dataEfetiva) {
        Fatura fatura = buscarPorId(faturaId);
        if (fatura.getLiquidacaoFinanceira() != null) {
            throw new BusinessException("Fatura já paga");
        }

        List<Parcela> parcelas = parcelaService.listarPorFatura(faturaId);
        List<AplicacaoLancamento> aplicacoes = new ArrayList<>();
        for (Parcela parcela : parcelas) {
            if (parcela.getLancamentoFinanceiro() != null) {
                aplicacoes.add(new AplicacaoLancamento(parcela.getLancamentoFinanceiro().getId(), parcela.getValor()));
            }
        }
        if (aplicacoes.isEmpty()) {
            throw new BusinessException("Fatura não tem nenhum Lançamento gerado para aplicar — nenhuma compra Terraplanagem processada neste ciclo");
        }

        LiquidacaoFinanceira liquidacao = liquidacaoFinanceiraService.criar(
                "Pagamento", dataEfetiva, fatura.getValorCobrado(), contaBancariaId, aplicacoes);

        fatura.marcarComoPaga(liquidacao);
        return repository.save(fatura);
    }

    @Transactional(readOnly = true)
    public Fatura buscarPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fatura não encontrada: " + id));
    }

    @Transactional(readOnly = true)
    public List<Fatura> listarTodas() {
        return repository.findAll();
    }

    private YearMonth parseCiclo(String ciclo) {
        try {
            return YearMonth.parse(ciclo);
        } catch (Exception e) {
            throw new BusinessException("ciclo deve estar no formato AAAA-MM");
        }
    }

}
