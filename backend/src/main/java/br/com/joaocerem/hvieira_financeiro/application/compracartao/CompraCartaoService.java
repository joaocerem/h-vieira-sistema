package br.com.joaocerem.hvieira_financeiro.application.compracartao;

import br.com.joaocerem.hvieira_financeiro.application.cartaocredito.CartaoCreditoService;
import br.com.joaocerem.hvieira_financeiro.application.categoria.CategoriaService;
import br.com.joaocerem.hvieira_financeiro.application.fornecedor.FornecedorService;
import br.com.joaocerem.hvieira_financeiro.application.frota.VeiculoService;
import br.com.joaocerem.hvieira_financeiro.application.lancamentofinanceiro.LancamentoFinanceiroService;
import br.com.joaocerem.hvieira_financeiro.application.obra.ObraService;
import br.com.joaocerem.hvieira_financeiro.application.parcela.ParcelaService;
import br.com.joaocerem.hvieira_financeiro.application.rateio.RateioDespesaService;
import br.com.joaocerem.hvieira_financeiro.common.exception.BusinessException;
import br.com.joaocerem.hvieira_financeiro.common.exception.ResourceNotFoundException;
import br.com.joaocerem.hvieira_financeiro.common.validation.Validacoes;
import br.com.joaocerem.hvieira_financeiro.domain.cartaocredito.CartaoCredito;
import br.com.joaocerem.hvieira_financeiro.domain.categoria.Categoria;
import br.com.joaocerem.hvieira_financeiro.domain.compracartao.CompraCartao;
import br.com.joaocerem.hvieira_financeiro.domain.compracartao.CompraCartaoRepository;
import br.com.joaocerem.hvieira_financeiro.domain.fornecedor.Fornecedor;
import br.com.joaocerem.hvieira_financeiro.domain.frota.Veiculo;
import br.com.joaocerem.hvieira_financeiro.domain.lancamentofinanceiro.LancamentoFinanceiro;
import br.com.joaocerem.hvieira_financeiro.domain.obra.Obra;
import br.com.joaocerem.hvieira_financeiro.domain.parcela.Parcela;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Casos de uso de Compra Cartão. Ver `docs/domain-model/18-compra-cartao.md`.
 *
 * `cartao`, `valor` e `numeroParcelas` só são aceitos na criação — ver justificativa em
 * {@link CompraCartao}. Ao criar, as Parcelas são geradas automaticamente (Seção 3: "Sistema, ao
 * calcular o parcelamento") via {@link ParcelaService#gerarParcelasParaCompra}.
 *
 * `atualizar` implementa a propagação D5 (decisão #27): correção de `categoria`/`obra`/`veículo`
 * propaga automaticamente para Lançamentos já gerados por Parcelas desta Compra, exceto os que já têm
 * `RATEIO_DESPESA` vinculado (desacoplamento definitivo).
 */
@Service
@Transactional
public class CompraCartaoService {

    private static final Set<String> CLASSIFICACOES_VALIDAS = Set.of(
            "Terraplanagem", "Fora da Operação", "Transferência Interna", "Retirada do Patrão", "Não Classificada");
    private static final String CLASSIFICACAO_PADRAO = "Não Classificada";

    private final CompraCartaoRepository repository;
    private final CartaoCreditoService cartaoCreditoService;
    private final FornecedorService fornecedorService;
    private final CategoriaService categoriaService;
    private final ObraService obraService;
    private final VeiculoService veiculoService;
    private final ParcelaService parcelaService;
    private final LancamentoFinanceiroService lancamentoFinanceiroService;
    private final RateioDespesaService rateioDespesaService;

    public CompraCartaoService(CompraCartaoRepository repository, CartaoCreditoService cartaoCreditoService,
                                FornecedorService fornecedorService, CategoriaService categoriaService,
                                ObraService obraService, VeiculoService veiculoService, ParcelaService parcelaService,
                                LancamentoFinanceiroService lancamentoFinanceiroService, RateioDespesaService rateioDespesaService) {
        this.repository = repository;
        this.cartaoCreditoService = cartaoCreditoService;
        this.fornecedorService = fornecedorService;
        this.categoriaService = categoriaService;
        this.obraService = obraService;
        this.veiculoService = veiculoService;
        this.parcelaService = parcelaService;
        this.lancamentoFinanceiroService = lancamentoFinanceiroService;
        this.rateioDespesaService = rateioDespesaService;
    }

    public CompraCartao criar(UUID cartaoId, UUID fornecedorId, BigDecimal valor, LocalDate data, UUID categoriaId,
                               String classificacao, UUID obraId, UUID veiculoId, Integer numeroParcelas) {
        Validacoes.exigirValorMonetarioPositivo(valor, "valor");
        String classificacaoFinal = classificacao != null ? classificacao : CLASSIFICACAO_PADRAO;
        validarClassificacao(classificacaoFinal);
        int numeroParcelasFinal = numeroParcelas != null ? numeroParcelas : 1;
        if (numeroParcelasFinal <= 0) {
            throw new BusinessException("numeroParcelas deve ser um número inteiro positivo");
        }

        CartaoCredito cartao = cartaoCreditoService.buscarPorId(cartaoId);
        Fornecedor fornecedor = fornecedorService.buscarPorId(fornecedorId);
        Categoria categoria = categoriaService.buscarPorId(categoriaId);
        Obra obra = obraId != null ? obraService.buscarPorId(obraId) : null;
        Veiculo veiculo = veiculoId != null ? veiculoService.buscarPorId(veiculoId) : null;

        CompraCartao compra = repository.save(new CompraCartao(
                cartao, fornecedor, valor, data, categoria, classificacaoFinal, obra, veiculo, numeroParcelasFinal));
        parcelaService.gerarParcelasParaCompra(compra);
        return compra;
    }

    public CompraCartao atualizar(UUID id, UUID fornecedorId, LocalDate data, UUID categoriaId, String classificacao,
                                   UUID obraId, UUID veiculoId) {
        String classificacaoFinal = classificacao != null ? classificacao : CLASSIFICACAO_PADRAO;
        validarClassificacao(classificacaoFinal);

        CompraCartao compra = buscarPorId(id);
        Fornecedor fornecedor = fornecedorService.buscarPorId(fornecedorId);
        Categoria categoria = categoriaService.buscarPorId(categoriaId);
        Obra obra = obraId != null ? obraService.buscarPorId(obraId) : null;
        Veiculo veiculo = veiculoId != null ? veiculoService.buscarPorId(veiculoId) : null;

        compra.setFornecedor(fornecedor);
        compra.setData(data);
        compra.setCategoria(categoria);
        compra.setClassificacao(classificacaoFinal);
        compra.setObra(obra);
        compra.setVeiculo(veiculo);
        compra = repository.save(compra);

        propagarParaLancamentosJaGerados(compra);
        return compra;
    }

    /**
     * Propagação D5 (decisão #27): só atinge Lançamentos sem Rateio vinculado.
     */
    private void propagarParaLancamentosJaGerados(CompraCartao compra) {
        List<Parcela> parcelas = parcelaService.listarPorCompraCartao(compra.getId());
        for (Parcela parcela : parcelas) {
            LancamentoFinanceiro lancamento = parcela.getLancamentoFinanceiro();
            if (lancamento == null) {
                continue;
            }
            if (rateioDespesaService.existeRateioParaLancamento(lancamento.getId())) {
                continue;
            }
            lancamentoFinanceiroService.atualizar(
                    lancamento.getId(),
                    lancamento.getEmpresa().getId(),
                    compra.getCategoria().getId(),
                    lancamento.getFornecedor() != null ? lancamento.getFornecedor().getId() : null,
                    lancamento.getCliente() != null ? lancamento.getCliente().getId() : null,
                    compra.getObra() != null ? compra.getObra().getId() : null,
                    compra.getVeiculo() != null ? compra.getVeiculo().getId() : null,
                    lancamento.getValor(),
                    lancamento.getDataCompetencia(),
                    lancamento.getVencimento());
        }
    }

    @Transactional(readOnly = true)
    public CompraCartao buscarPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Compra Cartão não encontrada: " + id));
    }

    @Transactional(readOnly = true)
    public List<CompraCartao> listarTodas() {
        return repository.findAll();
    }

    private void validarClassificacao(String classificacao) {
        if (!CLASSIFICACOES_VALIDAS.contains(classificacao)) {
            throw new BusinessException("classificacao inválida");
        }
    }
}
