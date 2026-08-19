package br.com.joaocerem.hvieira_financeiro.application.contratofinanceiro;

import br.com.joaocerem.hvieira_financeiro.application.contabancaria.ContaBancariaService;
import br.com.joaocerem.hvieira_financeiro.application.empresa.EmpresaService;
import br.com.joaocerem.hvieira_financeiro.application.fornecedor.FornecedorService;
import br.com.joaocerem.hvieira_financeiro.application.frota.VeiculoService;
import br.com.joaocerem.hvieira_financeiro.application.parcela.ParcelaService;
import br.com.joaocerem.hvieira_financeiro.common.exception.BusinessException;
import br.com.joaocerem.hvieira_financeiro.common.exception.ResourceNotFoundException;
import br.com.joaocerem.hvieira_financeiro.domain.contabancaria.ContaBancaria;
import br.com.joaocerem.hvieira_financeiro.domain.contratofinanceiro.ContratoFinanceiro;
import br.com.joaocerem.hvieira_financeiro.domain.contratofinanceiro.ContratoFinanceiroRepository;
import br.com.joaocerem.hvieira_financeiro.domain.empresa.Empresa;
import br.com.joaocerem.hvieira_financeiro.domain.fornecedor.Fornecedor;
import br.com.joaocerem.hvieira_financeiro.domain.frota.Veiculo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Casos de uso de Contrato Financeiro. Ver `docs/domain-model/20-contrato-financeiro.md`.
 *
 * `tipo`, `empresa`, `contaBancaria`, `valorContratado`, `numeroParcelas` e
 * `dataVencimentoPrimeiraParcela` só são aceitos na criação — ver justificativa em
 * {@link ContratoFinanceiro}. Ao criar, as Parcelas são geradas automaticamente (decisão #40) via
 * {@link ParcelaService#gerarParcelasParaContrato}.
 *
 * `taxa`/`grupo-cota`/`contemplado`/`veículo` são mutuamente exclusivos por `tipo` — restrição de
 * negócio do domínio (Seção 4), não apenas validação de interface — replicada aqui além do `CHECK`
 * físico (`ck_contratos_financeiros_taxa_grupo_cota_exclusivo`), para dar erro claro antes do banco.
 */
@Service
@Transactional
public class ContratoFinanceiroService {

    private static final String TIPO_FINANCIAMENTO = "Financiamento";
    private static final String TIPO_CONSORCIO = "Consórcio";

    private final ContratoFinanceiroRepository repository;
    private final EmpresaService empresaService;
    private final ContaBancariaService contaBancariaService;
    private final FornecedorService fornecedorService;
    private final VeiculoService veiculoService;
    private final ParcelaService parcelaService;

    public ContratoFinanceiroService(ContratoFinanceiroRepository repository, EmpresaService empresaService,
                                      ContaBancariaService contaBancariaService, FornecedorService fornecedorService,
                                      VeiculoService veiculoService, ParcelaService parcelaService) {
        this.repository = repository;
        this.empresaService = empresaService;
        this.contaBancariaService = contaBancariaService;
        this.fornecedorService = fornecedorService;
        this.veiculoService = veiculoService;
        this.parcelaService = parcelaService;
    }

    public ContratoFinanceiro criar(String tipo, UUID empresaId, UUID contaBancariaId, UUID fornecedorId,
                                     BigDecimal valorContratado, Integer numeroParcelas, LocalDate dataVencimentoPrimeiraParcela,
                                     BigDecimal taxa, String grupoCota, Boolean contemplado, UUID veiculoId) {
        validarTipo(tipo);
        if (numeroParcelas == null || numeroParcelas <= 0) {
            throw new BusinessException("numeroParcelas deve ser um número inteiro positivo");
        }
        boolean contempladoFinal = validarCamposPorTipo(tipo, taxa, grupoCota, contemplado, veiculoId);

        Empresa empresa = empresaService.buscarPorId(empresaId);
        ContaBancaria contaBancaria = contaBancariaService.buscarPorId(contaBancariaId);
        Fornecedor fornecedor = fornecedorService.buscarPorId(fornecedorId);
        Veiculo veiculo = veiculoId != null ? veiculoService.buscarPorId(veiculoId) : null;

        Boolean contempladoPersistido = TIPO_CONSORCIO.equals(tipo) ? contempladoFinal : null;

        ContratoFinanceiro contrato = repository.save(new ContratoFinanceiro(
                tipo, empresa, contaBancaria, fornecedor, valorContratado, numeroParcelas, dataVencimentoPrimeiraParcela,
                taxa, grupoCota, contempladoPersistido, veiculo));
        parcelaService.gerarParcelasParaContrato(contrato);
        return contrato;
    }

    public ContratoFinanceiro atualizar(UUID id, UUID fornecedorId, UUID veiculoId) {
        ContratoFinanceiro contrato = buscarPorId(id);
        Fornecedor fornecedor = fornecedorService.buscarPorId(fornecedorId);

        if (veiculoId != null) {
            boolean podeReceberVeiculo = TIPO_CONSORCIO.equals(contrato.getTipo()) && Boolean.TRUE.equals(contrato.getContemplado());
            if (!podeReceberVeiculo) {
                throw new BusinessException("veiculoId só é válido quando tipo = Consórcio e contemplado = true");
            }
        }
        Veiculo veiculo = veiculoId != null ? veiculoService.buscarPorId(veiculoId) : null;

        contrato.setFornecedor(fornecedor);
        contrato.setVeiculo(veiculo);
        return repository.save(contrato);
    }

    /**
     * Contemplação do Consórcio — `contemplado` só transiciona Não → Sim (Seção 4 do documento de
     * domínio). A partir daqui, Parcelas cujo Lançamento ainda não foi gerado herdam `veículo`
     * automaticamente ao vencer (D6, decisão #28) — sem tocar Lançamentos já gerados antes.
     */
    public ContratoFinanceiro contemplar(UUID id) {
        ContratoFinanceiro contrato = buscarPorId(id);
        if (!TIPO_CONSORCIO.equals(contrato.getTipo())) {
            throw new BusinessException("apenas Contratos do tipo Consórcio podem ser contemplados");
        }
        if (Boolean.TRUE.equals(contrato.getContemplado())) {
            throw new BusinessException("Contrato já está contemplado");
        }
        contrato.contemplar();
        return repository.save(contrato);
    }

    @Transactional(readOnly = true)
    public ContratoFinanceiro buscarPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contrato Financeiro não encontrado: " + id));
    }

    @Transactional(readOnly = true)
    public List<ContratoFinanceiro> listarTodos() {
        return repository.findAll();
    }

    private void validarTipo(String tipo) {
        if (!TIPO_FINANCIAMENTO.equals(tipo) && !TIPO_CONSORCIO.equals(tipo)) {
            throw new BusinessException("tipo deve ser 'Financiamento' ou 'Consórcio'");
        }
    }

    /**
     * @return `contemplado` efetivo a persistir (só relevante quando `tipo` = Consórcio; `false`
     * quando não informado — "um Consórcio nasce não contemplado", `20-contrato-financeiro.md` Seção 2).
     */
    private boolean validarCamposPorTipo(String tipo, BigDecimal taxa, String grupoCota, Boolean contemplado, UUID veiculoId) {
        if (TIPO_FINANCIAMENTO.equals(tipo)) {
            if (taxa == null) {
                throw new BusinessException("taxa é obrigatória quando tipo = Financiamento");
            }
            if (grupoCota != null || contemplado != null || veiculoId != null) {
                throw new BusinessException("grupoCota, contemplado e veiculoId não se aplicam quando tipo = Financiamento");
            }
            return false;
        }
        // Consórcio
        if (taxa != null) {
            throw new BusinessException("taxa não se aplica quando tipo = Consórcio");
        }
        if (grupoCota == null || grupoCota.isBlank()) {
            throw new BusinessException("grupoCota é obrigatório quando tipo = Consórcio");
        }
        boolean contempladoFinal = contemplado != null && contemplado;
        if (veiculoId != null && !contempladoFinal) {
            throw new BusinessException("veiculoId só é válido quando contemplado = true");
        }
        return contempladoFinal;
    }
}
