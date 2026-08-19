package br.com.joaocerem.hvieira_financeiro.domain.lancamentofinanceiro;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.UUID;

public interface LancamentoFinanceiroRepository extends JpaRepository<LancamentoFinanceiro, UUID> {

    /**
     * Usado por `ConsultasFinanceirasService` (decisão #19/#35) — "Balanço Projetado": soma de
     * `valor` por `tipo`, de todos os Lançamentos não Cancelados (`arquitetura-conceitual.md`, regra
     * 8/Seção 2). `empresaId` opcional — filtro explícito enquanto A4 (Hibernate/JPA Filters por
     * Empresa) não estiver implementado (depende de autenticação, ainda não construída).
     */
    @Query("select coalesce(sum(l.valor), 0) from LancamentoFinanceiro l " +
            "where l.tipo = :tipo and l.situacaoAdministrativa <> 'Cancelado' " +
            "and (:empresaId is null or l.empresa.id = :empresaId)")
    BigDecimal somarValorProjetadoPorTipo(@Param("tipo") String tipo, @Param("empresaId") UUID empresaId);
}
