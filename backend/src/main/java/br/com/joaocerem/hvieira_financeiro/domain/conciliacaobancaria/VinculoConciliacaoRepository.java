package br.com.joaocerem.hvieira_financeiro.domain.conciliacaobancaria;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VinculoConciliacaoRepository extends JpaRepository<VinculoConciliacao, UUID> {

    Optional<VinculoConciliacao> findByMovimentacaoBancariaId(UUID movimentacaoBancariaId);

    List<VinculoConciliacao> findByEstadoConciliacao(String estadoConciliacao);

    /**
     * Um Lançamento já está ligado a algum Vínculo, em qualquer estado — usado para excluir
     * candidatos já em uso da sugestão automática e para impedir vinculação manual de um
     * Lançamento já comprometido com outro Vínculo (Sprint 3 — rodada de evolução operacional).
     */
    boolean existsByLancamentosFinanceiros_Id(UUID lancamentoFinanceiroId);

    /**
     * Vínculos `Confirmado` que referenciam um Lançamento específico — usado para revalidar a
     * compatibilidade depois que o Lançamento é editado ou cancelado
     * (`VinculoConciliacaoService#revalidarConciliacao`).
     */
    List<VinculoConciliacao> findByEstadoConciliacaoAndLancamentosFinanceiros_Id(
            String estadoConciliacao, UUID lancamentoFinanceiroId);

    /**
     * Usado por `ConsultasFinanceirasService` (decisão #19/#35) — "Balanço Realizado" a partir da
     * Sprint 3 (rodada de evolução operacional): soma de `valor` dos Lançamentos ligados a algum
     * Vínculo `Confirmado`, por `tipo` (substitui `AplicacaoDeLiquidacaoRepository#somarValorAplicadoPorTipo`
     * — não há mais fração parcial de cobertura, um Lançamento conciliado conta pelo valor cheio).
     * `empresaId` opcional — mesma ressalva de `LancamentoFinanceiroRepository#somarValorProjetadoPorTipo`.
     */
    @Query("select coalesce(sum(l.valor), 0) from VinculoConciliacao v join v.lancamentosFinanceiros l " +
            "where v.estadoConciliacao = 'Confirmado' and l.tipo = :tipo " +
            "and (:empresaId is null or l.empresa.id = :empresaId)")
    BigDecimal somarValorConciliadoPorTipo(@Param("tipo") String tipo, @Param("empresaId") UUID empresaId);
}
