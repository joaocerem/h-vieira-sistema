package br.com.joaocerem.hvieira_financeiro.domain.rateio;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface RateioDespesaRepository extends JpaRepository<RateioDespesa, UUID> {

    List<RateioDespesa> findByLancamentoFinanceiroId(UUID lancamentoFinanceiroId);

    @Query("select coalesce(sum(r.valorRateado), 0) from RateioDespesa r where r.lancamentoFinanceiro.id = :lancamentoId and r.id <> :excluirId")
    BigDecimal somarValorRateadoPorLancamentoExcluindo(@Param("lancamentoId") UUID lancamentoId, @Param("excluirId") UUID excluirId);

    @Query("select coalesce(sum(r.valorRateado), 0) from RateioDespesa r where r.lancamentoFinanceiro.id = :lancamentoId")
    BigDecimal somarValorRateadoPorLancamento(@Param("lancamentoId") UUID lancamentoId);
}
