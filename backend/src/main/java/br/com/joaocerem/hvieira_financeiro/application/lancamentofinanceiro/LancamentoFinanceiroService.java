package br.com.joaocerem.hvieira_financeiro.application.lancamentofinanceiro;

import br.com.joaocerem.hvieira_financeiro.application.categoria.CategoriaService;
import br.com.joaocerem.hvieira_financeiro.application.cliente.ClienteService;
import br.com.joaocerem.hvieira_financeiro.application.empresa.EmpresaService;
import br.com.joaocerem.hvieira_financeiro.application.fornecedor.FornecedorService;
import br.com.joaocerem.hvieira_financeiro.application.frota.VeiculoService;
import br.com.joaocerem.hvieira_financeiro.application.obra.ObraService;
import br.com.joaocerem.hvieira_financeiro.common.exception.BusinessException;
import br.com.joaocerem.hvieira_financeiro.common.exception.ResourceNotFoundException;
import br.com.joaocerem.hvieira_financeiro.common.validation.Validacoes;
import br.com.joaocerem.hvieira_financeiro.domain.aplicacaodeliquidacao.AplicacaoDeLiquidacaoRepository;
import br.com.joaocerem.hvieira_financeiro.domain.categoria.Categoria;
import br.com.joaocerem.hvieira_financeiro.domain.cliente.Cliente;
import br.com.joaocerem.hvieira_financeiro.domain.empresa.Empresa;
import br.com.joaocerem.hvieira_financeiro.domain.fornecedor.Fornecedor;
import br.com.joaocerem.hvieira_financeiro.domain.frota.Veiculo;
import br.com.joaocerem.hvieira_financeiro.domain.lancamentofinanceiro.LancamentoFinanceiro;
import br.com.joaocerem.hvieira_financeiro.domain.lancamentofinanceiro.LancamentoFinanceiroRepository;
import br.com.joaocerem.hvieira_financeiro.domain.rateio.RateioDespesaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Casos de uso de Lançamento Financeiro. Ver `docs/domain-model/09-lancamento-financeiro.md`.
 *
 * `criar` (endpoint HTTP) só aceita `origem` = "Manual". `criarGeradoPeloSistema` é usado internamente
 * pelo módulo Cartão (`ParcelaService#gerarLancamento`) para o caminho "Cartão via Parcela" — o único
 * outro criador de Lançamento já implementado (Seção 1 do documento de domínio: "só o módulo Cartões
 * escreve aqui", consistente com `arquitetura-tecnica.md` Seção 3: "Só Financeiro e Cartões escrevem
 * em LANÇAMENTO_FINANCEIRO"). "Contrato Financeiro via Parcela" e "Ação de IA Confirmada" continuam
 * fora de escopo — módulos ainda não implementados.
 *
 * `obraId`/`veiculoId` são validados contra Obra/Veículo via `ObraService`/`VeiculoService` (mesmo
 * padrão de `CompraCartaoService`) — Obra/Frota já são módulos implementados, o TODO que dizia o
 * contrário estava desatualizado (auditoria final da Fase 4). `veiculoId`, quando informado, precisa
 * pertencer à mesma Empresa do Lançamento (`09-lancamento-financeiro.md`, Seção 3, linha `empresa`).
 * A exclusividade `obra` × Rateio (Seção 3: "Obra → Lançamento ... Mutuamente exclusivo com Rateio
 * Despesa para o mesmo Lançamento") já era checada de um lado (`RateioDespesaService#criar` recusa
 * Rateio se `obraId` já está preenchido); `atualizar` agora checa o lado inverso, recusando `obraId`
 * quando já existe Rateio vinculado. Usa `RateioDespesaRepository` diretamente (não
 * `RateioDespesaService`) para evitar dependência circular de construtor — `RateioDespesaService` já
 * depende deste service.
 */
@Service
@Transactional
public class LancamentoFinanceiroService {

    private static final String STATUS_ABERTO = "Aberto";
    private static final String STATUS_PARCIAL = "Parcialmente Pago-Recebido";
    private static final String STATUS_PAGO = "Pago-Recebido";

    private final LancamentoFinanceiroRepository repository;
    private final AplicacaoDeLiquidacaoRepository aplicacaoDeLiquidacaoRepository;
    private final RateioDespesaRepository rateioDespesaRepository;
    private final EmpresaService empresaService;
    private final CategoriaService categoriaService;
    private final FornecedorService fornecedorService;
    private final ClienteService clienteService;
    private final ObraService obraService;
    private final VeiculoService veiculoService;

    public LancamentoFinanceiroService(LancamentoFinanceiroRepository repository,
                                        AplicacaoDeLiquidacaoRepository aplicacaoDeLiquidacaoRepository,
                                        RateioDespesaRepository rateioDespesaRepository,
                                        EmpresaService empresaService,
                                        CategoriaService categoriaService,
                                        FornecedorService fornecedorService,
                                        ClienteService clienteService,
                                        ObraService obraService,
                                        VeiculoService veiculoService) {
        this.repository = repository;
        this.aplicacaoDeLiquidacaoRepository = aplicacaoDeLiquidacaoRepository;
        this.rateioDespesaRepository = rateioDespesaRepository;
        this.empresaService = empresaService;
        this.categoriaService = categoriaService;
        this.fornecedorService = fornecedorService;
        this.clienteService = clienteService;
        this.obraService = obraService;
        this.veiculoService = veiculoService;
    }

    public LancamentoFinanceiro criar(String tipo, UUID empresaId, UUID categoriaId, UUID fornecedorId,
                                       UUID clienteId, UUID obraId, UUID veiculoId, BigDecimal valor,
                                       LocalDate dataCompetencia, LocalDate vencimento,
                                       String descricao, String documento) {
        validarTipo(tipo);
        validarExclusividadeFornecedorCliente(tipo, fornecedorId, clienteId);
        Validacoes.exigirValorMonetarioPositivo(valor, "valor");

        Empresa empresa = empresaService.buscarPorId(empresaId);
        Categoria categoria = categoriaService.buscarPorId(categoriaId);
        Fornecedor fornecedor = fornecedorId != null ? fornecedorService.buscarPorId(fornecedorId) : null;
        Cliente cliente = clienteId != null ? clienteService.buscarPorId(clienteId) : null;
        resolverEValidarObraEVeiculo(empresa, obraId, veiculoId);

        LancamentoFinanceiro lancamento = new LancamentoFinanceiro(
                tipo, empresa, categoria, fornecedor, cliente, obraId, veiculoId, valor,
                dataCompetencia, vencimento, "Manual", descricao, documento);
        return repository.save(lancamento);
    }

    /**
     * Criação disparada pelo módulo Cartão (via Parcela), com `origem` explícita e entidades já
     * resolvidas pelo chamador (evita nova consulta a Empresa/Categoria/Fornecedor já carregados via
     * o grafo Cartão→ContaBancária→Empresa e Compra Cartão→Categoria/Fornecedor). Reaproveita as
     * mesmas validações de `criar`.
     */
    public LancamentoFinanceiro criarGeradoPeloSistema(String tipo, Empresa empresa, Categoria categoria,
                                                         Fornecedor fornecedor, Cliente cliente, UUID obraId,
                                                         UUID veiculoId, BigDecimal valor, LocalDate dataCompetencia,
                                                         LocalDate vencimento, String origem) {
        validarTipo(tipo);
        validarExclusividadeFornecedorCliente(tipo, fornecedor != null ? fornecedor.getId() : null, cliente != null ? cliente.getId() : null);
        Validacoes.exigirValorMonetarioPositivo(valor, "valor");
        resolverEValidarObraEVeiculo(empresa, obraId, veiculoId);

        // `descricao`/`documento` só existem no caminho manual por enquanto — este caminho
        // (Cartão via Parcela) não tem interface para preenchê-los.
        LancamentoFinanceiro lancamento = new LancamentoFinanceiro(
                tipo, empresa, categoria, fornecedor, cliente, obraId, veiculoId, valor, dataCompetencia, vencimento,
                origem, null, null);
        return repository.save(lancamento);
    }

    public LancamentoFinanceiro atualizar(UUID id, UUID empresaId, UUID categoriaId, UUID fornecedorId,
                                           UUID clienteId, UUID obraId, UUID veiculoId, BigDecimal valor,
                                           LocalDate dataCompetencia, LocalDate vencimento,
                                           String descricao, String documento) {
        LancamentoFinanceiro lancamento = buscarPorId(id);
        validarExclusividadeFornecedorCliente(lancamento.getTipo(), fornecedorId, clienteId);
        Validacoes.exigirValorMonetarioPositivo(valor, "valor");

        if (valor.compareTo(lancamento.getValor()) != 0) {
            BigDecimal somaAplicada = aplicacaoDeLiquidacaoRepository.somarValorAplicadoPorLancamento(id);
            if (somaAplicada.compareTo(BigDecimal.ZERO) > 0) {
                throw new BusinessException(
                        "valor não pode ser alterado: já existe Aplicação de Liquidação vinculada a este Lançamento (regra 23 — use Ajuste Financeiro)");
            }
        }

        Empresa empresa = empresaService.buscarPorId(empresaId);
        Categoria categoria = categoriaService.buscarPorId(categoriaId);
        Fornecedor fornecedor = fornecedorId != null ? fornecedorService.buscarPorId(fornecedorId) : null;
        Cliente cliente = clienteId != null ? clienteService.buscarPorId(clienteId) : null;
        resolverEValidarObraEVeiculo(empresa, obraId, veiculoId);
        if (obraId != null && !rateioDespesaRepository.findByLancamentoFinanceiroId(id).isEmpty()) {
            throw new BusinessException(
                    "Lançamento já tem Rateio de Despesa vinculado — mutuamente exclusivo com obraId direto "
                            + "(docs/domain-model/09-lancamento-financeiro.md, Seção 3)");
        }

        lancamento.setEmpresa(empresa);
        lancamento.setCategoria(categoria);
        lancamento.setFornecedor(fornecedor);
        lancamento.setCliente(cliente);
        lancamento.setObraId(obraId);
        lancamento.setVeiculoId(veiculoId);
        lancamento.setValor(valor);
        lancamento.setDataCompetencia(dataCompetencia);
        lancamento.setVencimento(vencimento);
        lancamento.setDescricao(descricao);
        lancamento.setDocumento(documento);
        return repository.save(lancamento);
    }

    public LancamentoFinanceiro cancelar(UUID id) {
        LancamentoFinanceiro lancamento = buscarPorId(id);
        BigDecimal somaAplicada = aplicacaoDeLiquidacaoRepository.somarValorAplicadoPorLancamento(id);
        if (somaAplicada.compareTo(BigDecimal.ZERO) != 0) {
            throw new BusinessException(
                    "Lançamento não pode ser cancelado: já existe Aplicação de Liquidação vinculada (soma deve ser exatamente zero)");
        }
        lancamento.cancelar();
        return repository.save(lancamento);
    }

    @Transactional(readOnly = true)
    public LancamentoFinanceiro buscarPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lançamento Financeiro não encontrado: " + id));
    }

    @Transactional(readOnly = true)
    public List<LancamentoFinanceiro> listarTodos() {
        return repository.findAll();
    }

    /**
     * `status_financeiro` — sempre calculado a partir da soma de `APLICAÇÃO_DE_LIQUIDAÇÃO.valor_aplicado`
     * vinculada, nunca persistido (Seção 2/5 do documento de domínio).
     */
    @Transactional(readOnly = true)
    public String calcularStatusFinanceiro(LancamentoFinanceiro lancamento) {
        BigDecimal somaAplicada = aplicacaoDeLiquidacaoRepository.somarValorAplicadoPorLancamento(lancamento.getId());
        if (somaAplicada.compareTo(BigDecimal.ZERO) == 0) {
            return STATUS_ABERTO;
        }
        if (somaAplicada.compareTo(lancamento.getValor()) >= 0) {
            return STATUS_PAGO;
        }
        return STATUS_PARCIAL;
    }

    private void validarTipo(String tipo) {
        if (!"Despesa".equals(tipo) && !"Receita".equals(tipo)) {
            throw new BusinessException("tipo deve ser 'Despesa' ou 'Receita'");
        }
    }

    /**
     * Resolve `obraId`/`veiculoId` pelos respectivos Services — mesmo padrão de `CompraCartaoService`
     * (`ResourceNotFoundException` se não existirem). Quando `veiculoId` é informado, exige que o
     * Veículo pertença à mesma Empresa do Lançamento (`09-lancamento-financeiro.md`, Seção 3, linha
     * `empresa`: "quando `veículo` estiver preenchido, deve corresponder a `veículo.empresa`").
     */
    private void resolverEValidarObraEVeiculo(Empresa empresa, UUID obraId, UUID veiculoId) {
        if (obraId != null) {
            obraService.buscarPorId(obraId);
        }
        if (veiculoId != null) {
            Veiculo veiculo = veiculoService.buscarPorId(veiculoId);
            if (!veiculo.getEmpresa().getId().equals(empresa.getId())) {
                throw new BusinessException(
                        "veiculoId informado pertence a uma Empresa diferente da Empresa do Lançamento");
            }
        }
    }

    private void validarExclusividadeFornecedorCliente(String tipo, UUID fornecedorId, UUID clienteId) {
        if ("Despesa".equals(tipo)) {
            if (fornecedorId == null || clienteId != null) {
                throw new BusinessException("Lançamento do tipo Despesa exige fornecedorId e não pode ter clienteId");
            }
        } else if ("Receita".equals(tipo)) {
            if (clienteId == null || fornecedorId != null) {
                throw new BusinessException("Lançamento do tipo Receita exige clienteId e não pode ter fornecedorId");
            }
        }
    }

}
