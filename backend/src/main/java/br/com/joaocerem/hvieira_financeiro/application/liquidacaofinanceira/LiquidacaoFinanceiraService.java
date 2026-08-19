package br.com.joaocerem.hvieira_financeiro.application.liquidacaofinanceira;

import br.com.joaocerem.hvieira_financeiro.application.conciliacaobancaria.MovimentacaoBancariaService;
import br.com.joaocerem.hvieira_financeiro.application.contabancaria.ContaBancariaService;
import br.com.joaocerem.hvieira_financeiro.application.lancamentofinanceiro.LancamentoFinanceiroService;
import br.com.joaocerem.hvieira_financeiro.common.exception.BusinessException;
import br.com.joaocerem.hvieira_financeiro.common.exception.ResourceNotFoundException;
import br.com.joaocerem.hvieira_financeiro.common.validation.Validacoes;
import br.com.joaocerem.hvieira_financeiro.domain.aplicacaodeliquidacao.AplicacaoDeLiquidacao;
import br.com.joaocerem.hvieira_financeiro.domain.aplicacaodeliquidacao.AplicacaoDeLiquidacaoRepository;
import br.com.joaocerem.hvieira_financeiro.domain.contabancaria.ContaBancaria;
import br.com.joaocerem.hvieira_financeiro.domain.lancamentofinanceiro.LancamentoFinanceiro;
import br.com.joaocerem.hvieira_financeiro.domain.liquidacaofinanceira.LiquidacaoFinanceira;
import br.com.joaocerem.hvieira_financeiro.domain.liquidacaofinanceira.LiquidacaoFinanceiraRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Casos de uso de Liquidação Financeira. Ver `docs/domain-model/10-liquidacao-financeira.md`.
 *
 * `criar` é o único caso de uso de escrita desta entidade — ela é imutável desde a criação (D12,
 * decisão #33), sem `atualizar`. A criação também gera as `APLICAÇÃO_DE_LIQUIDAÇÃO` correspondentes,
 * na mesma transação — não é um passo separado (`docs/domain-model/11-aplicacao-de-liquidacao.md`,
 * Seção 1: "nasce como consequência direta de... registrar uma Liquidação e indicar quais Lançamentos
 * ela cobre e em que valor"). Por isso `AplicacaoDeLiquidacao` não tem Controller HTTP próprio.
 *
 * Escopo desta fase: sem barreira de reautenticação de nível Alto (A8/decisão #22) — essa barreira é
 * exigida apenas quando a criação é proposta pela IA (`AÇÃO_PROPOSTA_IA`), módulo ainda não implementado.
 * Criação manual direta, como aqui, não está sujeita a essa barreira segundo o texto da decisão.
 *
 * Desde o módulo Conciliação Bancária: registrar uma Liquidação também gera, na mesma transação, a
 * Movimentação Bancária correspondente com Vínculo Conciliação já `Confirmado` — segundo caminho de
 * criação de Movimentação previsto em `docs/domain-model/12-movimentacao-bancaria.md`, Seção 1 ("gerada
 * automaticamente ao registrar uma Liquidação").
 */
@Service
@Transactional
public class LiquidacaoFinanceiraService {

    private final LiquidacaoFinanceiraRepository repository;
    private final AplicacaoDeLiquidacaoRepository aplicacaoDeLiquidacaoRepository;
    private final ContaBancariaService contaBancariaService;
    private final LancamentoFinanceiroService lancamentoFinanceiroService;
    private final MovimentacaoBancariaService movimentacaoBancariaService;

    public LiquidacaoFinanceiraService(LiquidacaoFinanceiraRepository repository,
                                        AplicacaoDeLiquidacaoRepository aplicacaoDeLiquidacaoRepository,
                                        ContaBancariaService contaBancariaService,
                                        LancamentoFinanceiroService lancamentoFinanceiroService,
                                        MovimentacaoBancariaService movimentacaoBancariaService) {
        this.repository = repository;
        this.aplicacaoDeLiquidacaoRepository = aplicacaoDeLiquidacaoRepository;
        this.contaBancariaService = contaBancariaService;
        this.lancamentoFinanceiroService = lancamentoFinanceiroService;
        this.movimentacaoBancariaService = movimentacaoBancariaService;
    }

    public LiquidacaoFinanceira criar(String tipo, LocalDate dataEfetiva, BigDecimal valor, UUID contaBancariaId,
                                       List<AplicacaoLancamento> aplicacoes) {
        validarTipo(tipo);
        Validacoes.exigirValorMonetarioPositivo(valor, "valor");
        if (aplicacoes == null || aplicacoes.isEmpty()) {
            throw new BusinessException("uma Liquidação deve cobrir ao menos um Lançamento (aplicacoes não pode ser vazio)");
        }

        ContaBancaria contaBancaria = contaBancariaService.buscarPorId(contaBancariaId);

        BigDecimal somaAplicacoesNestaLiquidacao = BigDecimal.ZERO;
        for (AplicacaoLancamento aplicacao : aplicacoes) {
            Validacoes.exigirValorMonetarioPositivo(aplicacao.valorAplicado(), "valorAplicado");
            somaAplicacoesNestaLiquidacao = somaAplicacoesNestaLiquidacao.add(aplicacao.valorAplicado());
        }
        if (somaAplicacoesNestaLiquidacao.compareTo(valor) > 0) {
            throw new BusinessException("a soma de valorAplicado das aplicações não deve ultrapassar o valor da Liquidação");
        }

        LiquidacaoFinanceira liquidacao = repository.save(new LiquidacaoFinanceira(tipo, dataEfetiva, valor, contaBancaria));
        movimentacaoBancariaService.gerarAPartirDeLiquidacao(liquidacao);

        for (AplicacaoLancamento aplicacao : aplicacoes) {
            LancamentoFinanceiro lancamento = lancamentoFinanceiroService.buscarPorId(aplicacao.lancamentoFinanceiroId());
            if (lancamento.estaCancelado()) {
                throw new BusinessException(
                        "Lançamento " + lancamento.getId() + " está Cancelado — não pode receber Aplicação de Liquidação");
            }
            BigDecimal somaJaAplicadaAoLancamento = aplicacaoDeLiquidacaoRepository.somarValorAplicadoPorLancamento(lancamento.getId());
            BigDecimal novaSoma = somaJaAplicadaAoLancamento.add(aplicacao.valorAplicado());
            if (novaSoma.compareTo(lancamento.getValor()) > 0) {
                throw new BusinessException(
                        "a soma de valorAplicado para o Lançamento " + lancamento.getId() + " ultrapassaria o valor do próprio Lançamento");
            }
            aplicacaoDeLiquidacaoRepository.save(new AplicacaoDeLiquidacao(lancamento, liquidacao, aplicacao.valorAplicado()));
        }

        return liquidacao;
    }

    @Transactional(readOnly = true)
    public LiquidacaoFinanceira buscarPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Liquidação Financeira não encontrada: " + id));
    }

    @Transactional(readOnly = true)
    public List<LiquidacaoFinanceira> listarTodas() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public List<AplicacaoDeLiquidacao> listarAplicacoes(UUID liquidacaoId) {
        return aplicacaoDeLiquidacaoRepository.findByLiquidacaoFinanceiraId(liquidacaoId);
    }

    private void validarTipo(String tipo) {
        if (!"Pagamento".equals(tipo) && !"Recebimento".equals(tipo)) {
            throw new BusinessException("tipo deve ser 'Pagamento' ou 'Recebimento'");
        }
    }

}
