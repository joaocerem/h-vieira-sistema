package br.com.joaocerem.hvieira_financeiro.application.conciliacaobancaria;

import br.com.joaocerem.hvieira_financeiro.common.exception.BusinessException;
import br.com.joaocerem.hvieira_financeiro.common.exception.ResourceNotFoundException;
import br.com.joaocerem.hvieira_financeiro.domain.conciliacaobancaria.MovimentacaoBancaria;
import br.com.joaocerem.hvieira_financeiro.domain.conciliacaobancaria.VinculoConciliacao;
import br.com.joaocerem.hvieira_financeiro.domain.conciliacaobancaria.VinculoConciliacaoRepository;
import br.com.joaocerem.hvieira_financeiro.domain.liquidacaofinanceira.LiquidacaoFinanceira;
import br.com.joaocerem.hvieira_financeiro.domain.liquidacaofinanceira.LiquidacaoFinanceiraRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Casos de uso de Vínculo Conciliação. Ver `docs/domain-model/14-vinculo-conciliacao.md`.
 *
 * Concentra as regras de transição de estado que a entidade deliberadamente não impõe (Seção 4 do
 * documento de domínio): confirmação exige Vínculo `Sugerido`; divergência de valor nunca é resolvida
 * automaticamente (Seção 2) — só marcada, para revisão humana.
 */
@Service
@Transactional
public class VinculoConciliacaoService {

    private final VinculoConciliacaoRepository repository;
    private final LiquidacaoFinanceiraRepository liquidacaoFinanceiraRepository;
    private final ConciliacaoProperties conciliacaoProperties;

    public VinculoConciliacaoService(VinculoConciliacaoRepository repository,
                                      LiquidacaoFinanceiraRepository liquidacaoFinanceiraRepository,
                                      ConciliacaoProperties conciliacaoProperties) {
        this.repository = repository;
        this.liquidacaoFinanceiraRepository = liquidacaoFinanceiraRepository;
        this.conciliacaoProperties = conciliacaoProperties;
    }

    /**
     * Sugestão determinística por valor+data (nunca confundida com Sugestão de IA — Seção 1 de
     * `13-transferencia-interna.md`, por analogia direta). Para cada Vínculo `Não Vinculado`:
     * - Movimentação já classificada como Transferência Interna nunca gera Lançamento/Liquidação
     *   (regra 5 do conceitual) — marcada `Sem Correspondência` direto, sem tentar matching.
     * - Caso contrário, busca Liquidação da mesma Conta Bancária, mesmo valor absoluto, dentro da
     *   tolerância de dias configurável (T6) e ainda não vinculada a outro Vínculo. Encontrada, vira
     *   `Sugerido`; senão, `Sem Correspondência`.
     */
    public ResultadoSugestaoAutomatica rodarSugestaoAutomatica() {
        List<VinculoConciliacao> pendentes = repository.findByEstadoConciliacao(VinculoConciliacao.NAO_VINCULADO);
        int sugeridos = 0;
        int semCorrespondencia = 0;

        for (VinculoConciliacao vinculo : pendentes) {
            MovimentacaoBancaria movimentacao = vinculo.getMovimentacaoBancaria();

            if (MovimentacaoBancaria.TRANSFERENCIA_INTERNA.equals(movimentacao.getClassificacao())) {
                vinculo.marcarSemCorrespondencia();
                repository.save(vinculo);
                semCorrespondencia++;
                continue;
            }

            LiquidacaoFinanceira candidata = buscarCandidata(movimentacao);
            if (candidata != null) {
                vinculo.sugerir(candidata);
                sugeridos++;
            } else {
                vinculo.marcarSemCorrespondencia();
                semCorrespondencia++;
            }
            repository.save(vinculo);
        }

        return new ResultadoSugestaoAutomatica(pendentes.size(), sugeridos, semCorrespondencia);
    }

    private LiquidacaoFinanceira buscarCandidata(MovimentacaoBancaria movimentacao) {
        int toleranciaDias = conciliacaoProperties.getToleranciaDiasMatching();
        List<LiquidacaoFinanceira> candidatas = liquidacaoFinanceiraRepository.findByContaBancariaIdAndValorAndDataEfetivaBetween(
                movimentacao.getContaBancaria().getId(),
                movimentacao.getValor().abs(),
                movimentacao.getData().minusDays(toleranciaDias),
                movimentacao.getData().plusDays(toleranciaDias));

        return candidatas.stream()
                .filter(liquidacao -> !repository.existsByLiquidacaoFinanceiraId(liquidacao.getId()))
                .findFirst()
                .orElse(null);
    }

    public VinculoConciliacao confirmar(UUID id) {
        VinculoConciliacao vinculo = buscarPorId(id);
        if (!VinculoConciliacao.SUGERIDO.equals(vinculo.getEstadoConciliacao())) {
            throw new BusinessException("só é possível confirmar um Vínculo em estado 'Sugerido' (atual: "
                    + vinculo.getEstadoConciliacao() + ")");
        }
        exigirValoresCompativeis(vinculo);
        vinculo.confirmar();
        return repository.save(vinculo);
    }

    public VinculoConciliacao marcarDivergente(UUID id) {
        VinculoConciliacao vinculo = buscarPorId(id);
        if (vinculo.getLiquidacaoFinanceira() == null) {
            throw new BusinessException("só é possível marcar Divergente um Vínculo que já tenha uma Liquidação candidata "
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
     * Vínculo manual pelo usuário — escolhe diretamente a Liquidação correspondente, sem depender da
     * sugestão automática. Valores coincidentes confirmam direto; divergentes ficam `Divergente` (mesma
     * regra de "nunca conciliar automaticamente uma divergência" — aqui a divergência já chega marcada
     * pelo próprio usuário, não fica pendurada em `Sugerido`).
     */
    public VinculoConciliacao vincularManualmente(UUID id, UUID liquidacaoFinanceiraId) {
        VinculoConciliacao vinculo = buscarPorId(id);
        if (VinculoConciliacao.CONFIRMADO.equals(vinculo.getEstadoConciliacao())) {
            throw new BusinessException("Vínculo já está Confirmado — não pode ser revinculado manualmente");
        }
        if (repository.existsByLiquidacaoFinanceiraId(liquidacaoFinanceiraId)) {
            throw new BusinessException("essa Liquidação Financeira já está vinculada a outro Vínculo Conciliação");
        }
        LiquidacaoFinanceira liquidacao = liquidacaoFinanceiraRepository.findById(liquidacaoFinanceiraId)
                .orElseThrow(() -> new ResourceNotFoundException("Liquidação Financeira não encontrada: " + liquidacaoFinanceiraId));

        boolean valoresCompativeis = liquidacao.getValor().compareTo(vinculo.getMovimentacaoBancaria().getValor().abs()) == 0;
        if (valoresCompativeis) {
            vinculo.confirmarDiretamente(liquidacao);
        } else {
            vinculo.sugerir(liquidacao);
            vinculo.marcarDivergente();
        }
        return repository.save(vinculo);
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

    private void exigirValoresCompativeis(VinculoConciliacao vinculo) {
        var valorMovimentacao = vinculo.getMovimentacaoBancaria().getValor().abs();
        var valorLiquidacao = vinculo.getLiquidacaoFinanceira().getValor();
        if (valorLiquidacao.compareTo(valorMovimentacao) != 0) {
            throw new BusinessException(
                    "valores divergentes entre Movimentação e Liquidação — use marcarDivergente em vez de confirmar");
        }
    }

    public record ResultadoSugestaoAutomatica(int processados, int sugeridos, int semCorrespondencia) {
    }
}
