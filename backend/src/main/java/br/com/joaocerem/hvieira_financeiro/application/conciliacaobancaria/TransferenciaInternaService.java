package br.com.joaocerem.hvieira_financeiro.application.conciliacaobancaria;

import br.com.joaocerem.hvieira_financeiro.common.exception.BusinessException;
import br.com.joaocerem.hvieira_financeiro.common.exception.ResourceNotFoundException;
import br.com.joaocerem.hvieira_financeiro.common.validation.Validacoes;
import br.com.joaocerem.hvieira_financeiro.domain.conciliacaobancaria.MovimentacaoBancaria;
import br.com.joaocerem.hvieira_financeiro.domain.conciliacaobancaria.MovimentacaoBancariaRepository;
import br.com.joaocerem.hvieira_financeiro.domain.conciliacaobancaria.TransferenciaInterna;
import br.com.joaocerem.hvieira_financeiro.domain.conciliacaobancaria.TransferenciaInternaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Casos de uso de Transferência Interna. Ver `docs/domain-model/13-transferencia-interna.md`.
 *
 * Escopo desta fase: só criação manual pelo usuário (`criar`), sem a sugestão determinística automática
 * por valor+data — o mecanismo de sugestão em si nasce em `VinculoConciliacaoService#rodarSugestaoAutomatica`,
 * que já cobre o matching Movimentação↔Liquidação; a sugestão equivalente Movimentação↔Movimentação para
 * Transferência é uma extensão do mesmo mecanismo, não um requisito confirmado explicitamente para esta
 * primeira entrega do módulo — sem lacuna de regra de negócio, só de conveniência (usuário sempre pode
 * criar manualmente com as duas Movimentações já identificadas).
 */
@Service
@Transactional
public class TransferenciaInternaService {

    private final TransferenciaInternaRepository repository;
    private final MovimentacaoBancariaRepository movimentacaoBancariaRepository;

    public TransferenciaInternaService(TransferenciaInternaRepository repository,
                                        MovimentacaoBancariaRepository movimentacaoBancariaRepository) {
        this.repository = repository;
        this.movimentacaoBancariaRepository = movimentacaoBancariaRepository;
    }

    public TransferenciaInterna criar(UUID movimentacaoOrigemId, UUID movimentacaoDestinoId, BigDecimal valor, LocalDate data) {
        if (movimentacaoOrigemId != null && movimentacaoOrigemId.equals(movimentacaoDestinoId)) {
            throw new BusinessException("movimentacaoOrigemId e movimentacaoDestinoId não podem ser a mesma Movimentação");
        }
        Validacoes.exigirValorMonetarioPositivo(valor, "valor");

        MovimentacaoBancaria origem = buscarMovimentacao(movimentacaoOrigemId);
        MovimentacaoBancaria destino = buscarMovimentacao(movimentacaoDestinoId);

        if (repository.existeTransferenciaEnvolvendoAlgumaDas(movimentacaoOrigemId, movimentacaoDestinoId)) {
            throw new BusinessException("uma das Movimentações informadas já participa de outra Transferência Interna");
        }

        TransferenciaInterna transferencia = repository.save(new TransferenciaInterna(origem, destino, valor, data));

        origem.reclassificar(MovimentacaoBancaria.TRANSFERENCIA_INTERNA);
        destino.reclassificar(MovimentacaoBancaria.TRANSFERENCIA_INTERNA);
        movimentacaoBancariaRepository.save(origem);
        movimentacaoBancariaRepository.save(destino);

        return transferencia;
    }

    @Transactional(readOnly = true)
    public TransferenciaInterna buscarPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transferência Interna não encontrada: " + id));
    }

    @Transactional(readOnly = true)
    public List<TransferenciaInterna> listarTodas() {
        return repository.findAll();
    }

    private MovimentacaoBancaria buscarMovimentacao(UUID id) {
        return movimentacaoBancariaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movimentação Bancária não encontrada: " + id));
    }
}
