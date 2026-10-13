package br.com.joaocerem.hvieira_financeiro.application.conciliacaobancaria;

import br.com.joaocerem.hvieira_financeiro.common.exception.BusinessException;
import br.com.joaocerem.hvieira_financeiro.common.exception.ResourceNotFoundException;
import br.com.joaocerem.hvieira_financeiro.domain.conciliacaobancaria.MovimentacaoBancaria;
import br.com.joaocerem.hvieira_financeiro.domain.conciliacaobancaria.VinculoConciliacao;
import br.com.joaocerem.hvieira_financeiro.domain.conciliacaobancaria.VinculoConciliacaoRepository;
import br.com.joaocerem.hvieira_financeiro.domain.lancamentofinanceiro.LancamentoFinanceiro;
import br.com.joaocerem.hvieira_financeiro.domain.lancamentofinanceiro.LancamentoFinanceiroRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Casos de uso de Vínculo Conciliação. Ver `docs/domain-model/14-vinculo-conciliacao.md`.
 *
 * A partir da Sprint 3 (rodada de evolução operacional), o Vínculo passa a referenciar
 * Lançamento Financeiro diretamente (N:N — `VinculoConciliacao#lancamentosFinanceiros`), não
 * mais Liquidação Financeira (removida). Critérios de compatibilidade, usados em três lugares
 * (sugestão automática, confirmação, e revalidação após edição/cancelamento de um Lançamento
 * já conciliado) — todos definidos explicitamente pelo usuário, sem interpretação:
 * <ul>
 *   <li>mesma Empresa (de todos os Lançamentos ligados, comparada à Empresa da Movimentação,
 *       via Conta Bancária);</li>
 *   <li>mesma natureza — Despesa ↔ saída (Movimentação com valor negativo), Receita ↔ entrada
 *       (valor positivo), convenção de sinal já documentada em {@link MovimentacaoBancaria};</li>
 *   <li>mesmo valor — soma do `valor` de todos os Lançamentos ligados ao Vínculo == valor
 *       absoluto da Movimentação (nunca comparação individual — o Vínculo pode cobrir vários
 *       Lançamentos de uma vez);</li>
 *   <li>vencimento — cada Lançamento ligado, individualmente, dentro da tolerância configurável
 *       (`ConciliacaoProperties`, T6) em relação à data da Movimentação.</li>
 * </ul>
 * Adicionalmente, todos os Lançamentos ligados precisam estar com `situacaoAdministrativa` =
 * "Ativo" — não é um dos 4 critérios ditados explicitamente pelo usuário, mas é consequência
 * direta da correção #2 da aprovação da Sprint 3 ("o cancelamento deve seguir exatamente a mesma
 * filosofia da edição... a regra depende exclusivamente da compatibilidade"): sem esta checagem,
 * cancelar um Lançamento já conciliado nunca produziria Divergência, contradizendo a regra.
 * A sugestão automática só propõe candidato único — nunca soma Lançamentos sozinha; cobertura
 * de vários Lançamentos por um só Vínculo só acontece pela vinculação manual, escolhida pelo
 * usuário (decisão explícita: "a implementação deve buscar a forma mais simples possível").
 */
@Service
@Transactional
public class VinculoConciliacaoService {

    private final VinculoConciliacaoRepository repository;
    private final LancamentoFinanceiroRepository lancamentoFinanceiroRepository;
    private final ConciliacaoProperties conciliacaoProperties;

    public VinculoConciliacaoService(VinculoConciliacaoRepository repository,
                                      LancamentoFinanceiroRepository lancamentoFinanceiroRepository,
                                      ConciliacaoProperties conciliacaoProperties) {
        this.repository = repository;
        this.lancamentoFinanceiroRepository = lancamentoFinanceiroRepository;
        this.conciliacaoProperties = conciliacaoProperties;
    }

    /**
     * Sugestão determinística por Empresa + natureza + valor exato + vencimento dentro da
     * tolerância (nunca confundida com Sugestão de IA — Seção 1 de `13-transferencia-interna.md`,
     * por analogia direta). Para cada Vínculo `Não Vinculado`:
     * <ul>
     *   <li>Movimentação já classificada como Transferência Interna nunca gera Lançamento
     *       (regra 5 do conceitual) — marcada `Sem Correspondência` direto, sem tentar matching;</li>
     *   <li>exatamente um candidato compatível — vira `Sugerido`;</li>
     *   <li>nenhum candidato — vira `Sem Correspondência`;</li>
     *   <li>dois ou mais candidatos igualmente compatíveis — o sistema não escolhe; o Vínculo
     *       permanece `Não Vinculado`, contabilizado à parte no resultado, para o usuário
     *       resolver manualmente (decisão explícita do usuário).</li>
     * </ul>
     */
    public ResultadoSugestaoAutomatica rodarSugestaoAutomatica() {
        List<VinculoConciliacao> pendentes = repository.findByEstadoConciliacao(VinculoConciliacao.NAO_VINCULADO);
        int sugeridos = 0;
        int semCorrespondencia = 0;
        int comMultiplosCandidatos = 0;

        for (VinculoConciliacao vinculo : pendentes) {
            MovimentacaoBancaria movimentacao = vinculo.getMovimentacaoBancaria();

            if (MovimentacaoBancaria.TRANSFERENCIA_INTERNA.equals(movimentacao.getClassificacao())) {
                vinculo.marcarSemCorrespondencia();
                repository.save(vinculo);
                semCorrespondencia++;
                continue;
            }

            List<LancamentoFinanceiro> candidatos = buscarCandidatos(movimentacao);
            if (candidatos.size() == 1) {
                vinculo.sugerirLancamentos(Set.copyOf(candidatos));
                repository.save(vinculo);
                sugeridos++;
            } else if (candidatos.isEmpty()) {
                vinculo.marcarSemCorrespondencia();
                repository.save(vinculo);
                semCorrespondencia++;
            } else {
                comMultiplosCandidatos++;
            }
        }

        return new ResultadoSugestaoAutomatica(pendentes.size(), sugeridos, semCorrespondencia, comMultiplosCandidatos);
    }

    private List<LancamentoFinanceiro> buscarCandidatos(MovimentacaoBancaria movimentacao) {
        String natureza = natureza(movimentacao.getValor());
        UUID empresaId = movimentacao.getContaBancaria().getEmpresa().getId();
        int toleranciaDias = conciliacaoProperties.getToleranciaDiasMatching();

        List<LancamentoFinanceiro> candidatos = lancamentoFinanceiroRepository.buscarCandidatosParaConciliacao(
                natureza, empresaId, movimentacao.getValor().abs(),
                movimentacao.getData().minusDays(toleranciaDias), movimentacao.getData().plusDays(toleranciaDias));

        return candidatos.stream()
                .filter(lancamento -> !repository.existsByLancamentosFinanceiros_Id(lancamento.getId()))
                .toList();
    }

    public VinculoConciliacao confirmar(UUID id) {
        VinculoConciliacao vinculo = buscarPorId(id);
        if (!VinculoConciliacao.SUGERIDO.equals(vinculo.getEstadoConciliacao())) {
            throw new BusinessException("só é possível confirmar um Vínculo em estado 'Sugerido' (atual: "
                    + vinculo.getEstadoConciliacao() + ")");
        }
        exigirCompativel(vinculo);
        vinculo.confirmar();
        return repository.save(vinculo);
    }

    public VinculoConciliacao marcarDivergente(UUID id) {
        VinculoConciliacao vinculo = buscarPorId(id);
        if (vinculo.getLancamentosFinanceiros().isEmpty()) {
            throw new BusinessException("só é possível marcar Divergente um Vínculo que já tenha ao menos um Lançamento candidato "
                    + "(estado atual: " + vinculo.getEstadoConciliacao() + ")");
        }
        vinculo.marcarDivergente();
        return repository.save(vinculo);
    }

    public VinculoConciliacao marcarSemCorrespondencia(UUID id) {
        VinculoConciliacao vinculo = buscarPorId(id);
        if (!VinculoConciliacao.NAO_VINCULADO.equals(vinculo.getEstadoConciliacao())) {
            throw new BusinessException("só é possível marcar 'Sem Correspondência' um Vínculo em estado 'Não Vinculado' (atual: "
                    + vinculo.getEstadoConciliacao() + ")");
        }
        vinculo.marcarSemCorrespondencia();
        return repository.save(vinculo);
    }

    /**
     * Vínculo manual pelo usuário — escolhe diretamente um ou mais Lançamentos correspondentes,
     * sem depender da sugestão automática (Sprint 3 — capacidade de cobrir vários Lançamentos
     * com uma única Movimentação, ex. pagamento de fatura de cartão, preservada aqui, nunca na
     * sugestão automática). Compatível (Empresa + natureza + soma do valor + vencimento de cada
     * um dentro da tolerância) confirma direto; senão fica `Divergente` (mesma regra de "nunca
     * conciliar automaticamente uma divergência" — aqui a divergência já chega marcada pelo
     * próprio usuário, não fica pendurada em `Sugerido`).
     */
    public VinculoConciliacao vincularManualmente(UUID id, List<UUID> lancamentoFinanceiroIds) {
        VinculoConciliacao vinculo = buscarPorId(id);
        if (VinculoConciliacao.CONFIRMADO.equals(vinculo.getEstadoConciliacao())) {
            throw new BusinessException("Vínculo já está Confirmado — não pode ser revinculado manualmente");
        }
        if (lancamentoFinanceiroIds == null || lancamentoFinanceiroIds.isEmpty()) {
            throw new BusinessException("informe ao menos um lancamentoFinanceiroId");
        }

        Set<LancamentoFinanceiro> lancamentos = new LinkedHashSet<>();
        for (UUID lancamentoId : lancamentoFinanceiroIds) {
            if (repository.existsByLancamentosFinanceiros_Id(lancamentoId)
                    && !vinculo.getLancamentosFinanceiros().stream().anyMatch(l -> l.getId().equals(lancamentoId))) {
                throw new BusinessException("Lançamento " + lancamentoId + " já está vinculado a outro Vínculo Conciliação");
            }
            LancamentoFinanceiro lancamento = lancamentoFinanceiroRepository.findById(lancamentoId)
                    .orElseThrow(() -> new ResourceNotFoundException("Lançamento Financeiro não encontrado: " + lancamentoId));
            lancamentos.add(lancamento);
        }

        if (saoCompativeis(vinculo.getMovimentacaoBancaria(), lancamentos)) {
            vinculo.confirmarDiretamenteComLancamentos(lancamentos);
        } else {
            vinculo.sugerirLancamentos(lancamentos);
            vinculo.marcarDivergente();
        }
        return repository.save(vinculo);
    }

    /**
     * Revalida a compatibilidade de qualquer Vínculo `Confirmado` que referencie este Lançamento
     * — chamada depois de editar (`LancamentoFinanceiroService#atualizar`) ou cancelar
     * (`#cancelar`) um Lançamento (decisão explícita do usuário: a regra depende só do resultado
     * da comparação, nunca de qual ação — edição ou cancelamento — foi realizada). Continua
     * compatível: nada muda. Deixa de ser compatível: o Vínculo vira `Divergente`
     * automaticamente — nunca desfeito silenciosamente, sempre para revisão humana.
     */
    public void revalidarConciliacao(LancamentoFinanceiro lancamento) {
        List<VinculoConciliacao> vinculosConfirmados = repository.findByEstadoConciliacaoAndLancamentosFinanceiros_Id(
                VinculoConciliacao.CONFIRMADO, lancamento.getId());

        for (VinculoConciliacao vinculo : vinculosConfirmados) {
            if (!saoCompativeis(vinculo.getMovimentacaoBancaria(), vinculo.getLancamentosFinanceiros())) {
                vinculo.marcarDivergente();
                repository.save(vinculo);
            }
        }
    }

    /** Verdadeiro quando existe um Vínculo `Confirmado` referenciando este Lançamento. */
    @Transactional(readOnly = true)
    public boolean estaConciliado(UUID lancamentoFinanceiroId) {
        return !repository.findByEstadoConciliacaoAndLancamentosFinanceiros_Id(
                VinculoConciliacao.CONFIRMADO, lancamentoFinanceiroId).isEmpty();
    }

    @Transactional(readOnly = true)
    public VinculoConciliacao buscarPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vínculo Conciliação não encontrado: " + id));
    }

    @Transactional(readOnly = true)
    public VinculoConciliacao buscarPorMovimentacao(UUID movimentacaoBancariaId) {
        return repository.findByMovimentacaoBancariaId(movimentacaoBancariaId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Vínculo Conciliação não encontrado para a Movimentação Bancária: " + movimentacaoBancariaId));
    }

    @Transactional(readOnly = true)
    public List<VinculoConciliacao> listarTodos() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public List<VinculoConciliacao> listarPorEstado(String estadoConciliacao) {
        return repository.findByEstadoConciliacao(estadoConciliacao);
    }

    private void exigirCompativel(VinculoConciliacao vinculo) {
        if (!saoCompativeis(vinculo.getMovimentacaoBancaria(), vinculo.getLancamentosFinanceiros())) {
            throw new BusinessException(
                    "Lançamento(s) não compatíveis com a Movimentação — use marcarDivergente em vez de confirmar");
        }
    }

    /**
     * Único ponto de verdade dos 4 critérios de compatibilidade — usado por `confirmar`,
     * `vincularManualmente` e `revalidarConciliacao` (Sprint 3, decisão explícita do usuário).
     */
    private boolean saoCompativeis(MovimentacaoBancaria movimentacao, Set<LancamentoFinanceiro> lancamentos) {
        if (lancamentos.isEmpty()) {
            return false;
        }

        UUID empresaDaMovimentacaoId = movimentacao.getContaBancaria().getEmpresa().getId();
        String naturezaEsperada = natureza(movimentacao.getValor());
        int toleranciaDias = conciliacaoProperties.getToleranciaDiasMatching();

        boolean todosAtivos = lancamentos.stream()
                .allMatch(l -> "Ativo".equals(l.getSituacaoAdministrativa()));
        boolean mesmaEmpresa = lancamentos.stream()
                .allMatch(l -> l.getEmpresa().getId().equals(empresaDaMovimentacaoId));
        boolean mesmaNatureza = lancamentos.stream()
                .allMatch(l -> naturezaEsperada.equals(l.getTipo()));
        boolean vencimentoDentroDaTolerancia = lancamentos.stream()
                .allMatch(l -> Math.abs(ChronoUnit.DAYS.between(l.getVencimento(), movimentacao.getData())) <= toleranciaDias);

        BigDecimal somaLancamentos = lancamentos.stream()
                .map(LancamentoFinanceiro::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        boolean mesmoValor = somaLancamentos.compareTo(movimentacao.getValor().abs()) == 0;

        return todosAtivos && mesmaEmpresa && mesmaNatureza && mesmoValor && vencimentoDentroDaTolerancia;
    }

    /** Convenção de sinal já documentada em {@link MovimentacaoBancaria}: Despesa = saída (negativo), Receita = entrada (positivo). */
    private String natureza(BigDecimal valorMovimentacao) {
        return valorMovimentacao.signum() < 0 ? "Despesa" : "Receita";
    }

    public record ResultadoSugestaoAutomatica(int processados, int sugeridos, int semCorrespondencia, int comMultiplosCandidatos) {
    }
}
