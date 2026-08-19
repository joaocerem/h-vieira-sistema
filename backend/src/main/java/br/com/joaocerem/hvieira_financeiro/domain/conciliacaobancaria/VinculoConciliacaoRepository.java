package br.com.joaocerem.hvieira_financeiro.domain.conciliacaobancaria;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VinculoConciliacaoRepository extends JpaRepository<VinculoConciliacao, UUID> {

    Optional<VinculoConciliacao> findByMovimentacaoBancariaId(UUID movimentacaoBancariaId);

    List<VinculoConciliacao> findByEstadoConciliacao(String estadoConciliacao);

    boolean existsByLiquidacaoFinanceiraId(UUID liquidacaoFinanceiraId);
}
