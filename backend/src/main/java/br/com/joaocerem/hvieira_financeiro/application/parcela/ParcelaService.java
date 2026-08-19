package br.com.joaocerem.hvieira_financeiro.application.parcela;

import br.com.joaocerem.hvieira_financeiro.application.categoria.CategoriaService;
import br.com.joaocerem.hvieira_financeiro.application.lancamentofinanceiro.LancamentoFinanceiroService;
import br.com.joaocerem.hvieira_financeiro.common.exception.BusinessException;
import br.com.joaocerem.hvieira_financeiro.common.exception.ResourceNotFoundException;
import br.com.joaocerem.hvieira_financeiro.domain.cartaocredito.CartaoCredito;
import br.com.joaocerem.hvieira_financeiro.domain.categoria.Categoria;
import br.com.joaocerem.hvieira_financeiro.domain.compracartao.CompraCartao;
import br.com.joaocerem.hvieira_financeiro.domain.contratofinanceiro.ContratoFinanceiro;
import br.com.joaocerem.hvieira_financeiro.domain.fatura.Fatura;
import br.com.joaocerem.hvieira_financeiro.domain.frota.Veiculo;
import br.com.joaocerem.hvieira_financeiro.domain.lancamentofinanceiro.LancamentoFinanceiro;
import br.com.joaocerem.hvieira_financeiro.domain.obra.Obra;
import br.com.joaocerem.hvieira_financeiro.domain.parcela.Parcela;
import br.com.joaocerem.hvieira_financeiro.domain.parcela.ParcelaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Casos de uso de Parcela. Ver `docs/domain-model/21-parcela.md`.
 *
 * `gerarParcelasParaCompra` implementa a fórmula de divisão de valor e cálculo de vencimento definida
 * em `decisions.md`, decisão #39 (resposta de negócio, Fase 4).
 *
 * `gerarLancamento` implementa o gatilho "ao vencer" (Seção 1: "ser a ponte que gera um
 * LANÇAMENTO_FINANCEIRO no momento do vencimento") como uma ação explícita, não um agendador
 * automático — não existe infraestrutura de scheduling em nenhum outro ponto do projeto, e inventá-la
 * agora seria além do escopo desta tarefa (implementação de Entity/Repository/Service/DTO/Mapper/
 * Controller). O chamador (usuário, ou uma futura automação) decide quando invocar.
 */
@Service
@Transactional
public class ParcelaService {

    private static final String ORIGEM_COMPRA_CARTAO = "Compra Cartão";
    private static final String ORIGEM_CONTRATO_FINANCEIRO = "Contrato Financeiro";
    private static final String CLASSIFICACAO_TERRAPLANAGEM = "Terraplanagem";
    private static final String TIPO_CONSORCIO = "Consórcio";
    private static final String CATEGORIA_AMORTIZACAO_FINANCIAMENTO = "Amortização Empréstimo";
    private static final String CATEGORIA_CONSORCIOS = "Consórcios";

    private final ParcelaRepository repository;
    private final LancamentoFinanceiroService lancamentoFinanceiroService;
    private final CategoriaService categoriaService;

    public ParcelaService(ParcelaRepository repository, LancamentoFinanceiroService lancamentoFinanceiroService,
                           CategoriaService categoriaService) {
        this.repository = repository;
        this.lancamentoFinanceiroService = lancamentoFinanceiroService;
        this.categoriaService = categoriaService;
    }

    /**
     * Gera e persiste as N Parcelas de uma Compra Cartão recém-criada (N = `compra.numeroParcelas`).
     * Fórmula — decisão #39: as N-1 primeiras recebem `valor ÷ N` truncado na 2ª casa decimal; a
     * última recebe o valor residual. Vencimento: ciclo determinado por `data` da Compra vs.
     * `dia_fechamento` do Cartão; 1ª Parcela vence em `dia_vencimento` dentro do mês do ciclo; as
     * seguintes, um mês depois cada, sempre no dia `dia_vencimento`.
     */
    public List<Parcela> gerarParcelasParaCompra(CompraCartao compra) {
        CartaoCredito cartao = compra.getCartao();
        List<ParcelaCalculada> calculadas = calcular(
                compra.getValor(), compra.getNumeroParcelas(), compra.getData(),
                cartao.getDiaFechamento(), cartao.getDiaVencimento());

        List<Parcela> parcelas = new ArrayList<>();
        int total = compra.getNumeroParcelas();
        for (int i = 0; i < calculadas.size(); i++) {
            ParcelaCalculada calculada = calculadas.get(i);
            Parcela parcela = new Parcela(ORIGEM_COMPRA_CARTAO, compra, i + 1, total, calculada.valor(), calculada.vencimento());
            parcelas.add(repository.save(parcela));
        }
        return parcelas;
    }

    static List<ParcelaCalculada> calcular(BigDecimal valorTotal, int numeroParcelas, LocalDate dataCompra,
                                            int diaFechamento, int diaVencimento) {
        List<BigDecimal> valores = dividirValor(valorTotal, numeroParcelas);

        YearMonth cicloBase = dataCompra.getDayOfMonth() <= diaFechamento
                ? YearMonth.from(dataCompra)
                : YearMonth.from(dataCompra).plusMonths(1);

        List<ParcelaCalculada> resultado = new ArrayList<>();
        for (int i = 1; i <= numeroParcelas; i++) {
            YearMonth mes = cicloBase.plusMonths(i - 1L);
            int dia = Math.min(diaVencimento, mes.lengthOfMonth());
            resultado.add(new ParcelaCalculada(valores.get(i - 1), mes.atDay(dia)));
        }
        return resultado;
    }

    /**
     * Gera e persiste as N Parcelas de um Contrato Financeiro recém-criado (N =
     * `contrato.numeroParcelas`). Fórmula de divisão de valor — decisão #39/#40: idêntica à de Compra
     * Cartão. Vencimento — decisão #40: 1ª Parcela em `dataVencimentoPrimeiraParcela`; as seguintes,
     * mensalmente, no mesmo dia (ajustado para o último dia do mês quando não existir).
     */
    public List<Parcela> gerarParcelasParaContrato(ContratoFinanceiro contrato) {
        List<ParcelaCalculada> calculadas = calcularParaContrato(
                contrato.getValorContratado(), contrato.getNumeroParcelas(), contrato.getDataVencimentoPrimeiraParcela());

        List<Parcela> parcelas = new ArrayList<>();
        int total = contrato.getNumeroParcelas();
        for (int i = 0; i < calculadas.size(); i++) {
            ParcelaCalculada calculada = calculadas.get(i);
            Parcela parcela = new Parcela(ORIGEM_CONTRATO_FINANCEIRO, contrato, i + 1, total, calculada.valor(), calculada.vencimento());
            parcelas.add(repository.save(parcela));
        }
        return parcelas;
    }

    static List<ParcelaCalculada> calcularParaContrato(BigDecimal valorTotal, int numeroParcelas, LocalDate primeiraDataVencimento) {
        List<BigDecimal> valores = dividirValor(valorTotal, numeroParcelas);
        int diaVencimento = primeiraDataVencimento.getDayOfMonth();
        YearMonth mesBase = YearMonth.from(primeiraDataVencimento);

        List<ParcelaCalculada> resultado = new ArrayList<>();
        for (int i = 1; i <= numeroParcelas; i++) {
            YearMonth mes = mesBase.plusMonths(i - 1L);
            int dia = Math.min(diaVencimento, mes.lengthOfMonth());
            resultado.add(new ParcelaCalculada(valores.get(i - 1), mes.atDay(dia)));
        }
        return resultado;
    }

    /**
     * Divisão de valor (decisão #39): as N-1 primeiras recebem `valorTotal ÷ N` truncado na 2ª casa
     * decimal; a última recebe o valor residual — mesma fórmula reutilizada por Compra Cartão e
     * Contrato Financeiro (decisão #40).
     */
    private static List<BigDecimal> dividirValor(BigDecimal valorTotal, int numeroParcelas) {
        BigDecimal valorBase = valorTotal.divide(BigDecimal.valueOf(numeroParcelas), 2, RoundingMode.DOWN);
        BigDecimal somaBase = valorBase.multiply(BigDecimal.valueOf(numeroParcelas - 1));
        BigDecimal valorUltima = valorTotal.subtract(somaBase);

        List<BigDecimal> valores = new ArrayList<>();
        for (int i = 1; i <= numeroParcelas; i++) {
            valores.add(i < numeroParcelas ? valorBase : valorUltima);
        }
        return valores;
    }

    /**
     * Gera o Lançamento Financeiro correspondente ao vencimento desta Parcela — para `origem` =
     * "Compra Cartão", só quando `classificação` = "Terraplanagem"; para `origem` = "Contrato
     * Financeiro", sempre gera (Seção 4 do documento de domínio de Contrato Financeiro: "ao vencer,
     * sempre gera Lançamento").
     */
    public Parcela gerarLancamento(UUID parcelaId) {
        Parcela parcela = buscarPorId(parcelaId);
        if (parcela.getLancamentoFinanceiro() != null) {
            throw new BusinessException("Parcela já gerou Lançamento Financeiro");
        }
        if (ORIGEM_COMPRA_CARTAO.equals(parcela.getOrigem())) {
            return gerarLancamentoDeCompraCartao(parcela);
        }
        if (ORIGEM_CONTRATO_FINANCEIRO.equals(parcela.getOrigem())) {
            return gerarLancamentoDeContratoFinanceiro(parcela);
        }
        throw new BusinessException("geração de Lançamento para Parcela de origem '" + parcela.getOrigem() + "' não implementada nesta fase");
    }

    /**
     * `empresa` derivada pela cadeia Cartão→Conta Bancária→Empresa (mecanismo de D7, decisão #21).
     * `tipo` = "Despesa" — inferência estrutural: uma Compra de Cartão nunca origina Receita.
     */
    private Parcela gerarLancamentoDeCompraCartao(Parcela parcela) {
        CompraCartao compra = parcela.getCompraCartao();
        if (!CLASSIFICACAO_TERRAPLANAGEM.equals(compra.getClassificacao())) {
            throw new BusinessException(
                    "Parcela não gera Lançamento: a Compra de origem não está classificada como Terraplanagem");
        }

        Obra obra = compra.getObra();
        Veiculo veiculo = compra.getVeiculo();
        LancamentoFinanceiro lancamento = lancamentoFinanceiroService.criarGeradoPeloSistema(
                "Despesa",
                compra.getCartao().getContaBancaria().getEmpresa(),
                compra.getCategoria(),
                compra.getFornecedor(),
                null,
                obra != null ? obra.getId() : null,
                veiculo != null ? veiculo.getId() : null,
                parcela.getValor(),
                compra.getData(),
                parcela.getVencimento(),
                "Cartão via Parcela"
        );

        parcela.vincularLancamento(lancamento);
        return repository.save(parcela);
    }

    /**
     * `empresa`/`fornecedor` diretos do Contrato (decisão #40 — `fornecedor` substitui `instituição`).
     * `categoria` resolvida por nome ("Amortização Empréstimo"/"Consórcios", conforme `tipo`). `tipo`
     * do Lançamento = "Despesa" — inferência estrutural, mesma already usada em Cartão. `veículo`
     * herdado só se `tipo` = Consórcio e `contemplado` = Sim **no momento desta chamada** — isso, por
     * si só, já implementa a regra de "sem propagação retroativa" (D6, decisão #28): uma Parcela cujo
     * Lançamento já foi gerado antes da contemplação nunca é revisitada por este método.
     */
    private Parcela gerarLancamentoDeContratoFinanceiro(Parcela parcela) {
        ContratoFinanceiro contrato = parcela.getContratoFinanceiro();
        String nomeCategoria = TIPO_CONSORCIO.equals(contrato.getTipo()) ? CATEGORIA_CONSORCIOS : CATEGORIA_AMORTIZACAO_FINANCIAMENTO;
        Categoria categoria = categoriaService.buscarPorNome(nomeCategoria);

        boolean heredaVeiculo = TIPO_CONSORCIO.equals(contrato.getTipo()) && Boolean.TRUE.equals(contrato.getContemplado())
                && contrato.getVeiculo() != null;

        LancamentoFinanceiro lancamento = lancamentoFinanceiroService.criarGeradoPeloSistema(
                "Despesa",
                contrato.getEmpresa(),
                categoria,
                contrato.getFornecedor(),
                null,
                null,
                heredaVeiculo ? contrato.getVeiculo().getId() : null,
                parcela.getValor(),
                parcela.getVencimento(),
                parcela.getVencimento(),
                "Contrato Financeiro via Parcela"
        );

        parcela.vincularLancamento(lancamento);
        return repository.save(parcela);
    }

    @Transactional(readOnly = true)
    public Parcela buscarPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parcela não encontrada: " + id));
    }

    @Transactional(readOnly = true)
    public List<Parcela> listarTodas() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Parcela> listarPorCompraCartao(UUID compraCartaoId) {
        return repository.findByCompraCartaoId(compraCartaoId);
    }

    @Transactional(readOnly = true)
    public List<Parcela> listarPorContratoFinanceiro(UUID contratoFinanceiroId) {
        return repository.findByContratoFinanceiroId(contratoFinanceiroId);
    }

    @Transactional(readOnly = true)
    public List<Parcela> listarPorFatura(UUID faturaId) {
        return repository.findByFaturaId(faturaId);
    }

    /**
     * Usado por `FaturaService#fecharCiclo`: Parcelas de Compra Cartão de um Cartão, ainda sem Fatura
     * atribuída, com vencimento até o fim do ciclo informado — cobre tanto as do próprio ciclo quanto
     * as "atrasadas" de ciclos já encerrados sem Fatura ainda atribuída (regra do "próximo ciclo
     * aberto", `21-parcela.md`, Seção 3).
     */
    @Transactional(readOnly = true)
    public List<Parcela> listarElegiveisParaFechamento(UUID cartaoId, YearMonth ciclo) {
        return repository.buscarElegiveisParaFechamento(cartaoId, ciclo.atEndOfMonth());
    }

    /**
     * Atribuição de Fatura — vínculo permanente, atribuído uma única vez (`21-parcela.md`, Seção 2).
     */
    public void atribuirFatura(Parcela parcela, Fatura fatura) {
        if (parcela.getFatura() != null) {
            throw new BusinessException("Parcela já tem Fatura atribuída");
        }
        parcela.atribuirFatura(fatura);
        repository.save(parcela);
    }
}
