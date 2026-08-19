package br.com.joaocerem.hvieira_financeiro.domain.aplicacaodeliquidacao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface AplicacaoDeLiquidacaoRepository extends JpaRepository<AplicacaoDeLiquidacao, UUID> {

    List<AplicacaoDeLiquidacao> findByLancamentoFinanceiroId(UUID lancamentoFinanceiroId);

    List<AplicacaoDeLiquidacao> findByLiquidacaoFinanceiraId(UUID liquidacaoFinanceiraId);

    @Query("select coalesce(sum(a.valorAplicado), 0) from AplicacaoDeLiquidacao a where a.lancamentoFinanceiro.id = :lancamentoId")
    BigDecimal somarValorAplicadoPorLancamento(@Param("lancamentoId") UUID lancamentoId);

    @Query("select coalesce(sum(a.valorAplicado), 0) from AplicacaoDeLiquidacao a where a.liquidacaoFinanceira.id = :liquidacaoId")
    BigDecimal somarValorAplicadoPorLiquidacao(@Param("liquidacaoId") UUID liquidacaoId);

    /**
     * Usado por `ConsultasFinanceirasService` (decisão #19/#35) — "Balanço Realizado": soma de
     * `valor_aplicado` por `tipo` do Lançamento coberto (`arquitetura-conceitual.md`, regra 8/Seção 2).
     * `empresaId` opcional — mesma ressalva de `LancamentoFinanceiroRepository#somarValorProjetadoPorTipo`.
     */
    @Query("select coalesce(sum(a.valorAplicado), 0) from AplicacaoDeLiquidacao a " +
            "where a.lancamentoFinanceiro.tipo = :tipo " +
            "and (:empresaId is null or a.lancamentoFinanceiro.empresa.id = :empresaId)")
    BigDecimal somarValorAplicadoPorTipo(@Param("tipo") String tipo, @Param("empresaId") UUID empresaId);
}
