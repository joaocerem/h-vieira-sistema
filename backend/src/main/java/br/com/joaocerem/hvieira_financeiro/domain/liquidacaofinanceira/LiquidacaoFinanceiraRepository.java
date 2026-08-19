package br.com.joaocerem.hvieira_financeiro.domain.liquidacaofinanceira;

import org.springframework.data.jpa.repository.JpaRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface LiquidacaoFinanceiraRepository extends JpaRepository<LiquidacaoFinanceira, UUID> {

    /**
     * Candidatas a correspondência determinística por valor+data para uma Movimentação Bancária, usada
     * pela sugestão automática de Conciliação (`VinculoConciliacaoService`, T6 —
     * `docs/pendencias.md`). Restrita à mesma Conta Bancária: o conceitual não prevê correspondência
     * entre contas diferentes.
     */
    List<LiquidacaoFinanceira> findByContaBancariaIdAndValorAndDataEfetivaBetween(
            UUID contaBancariaId, BigDecimal valor, LocalDate dataEfetivaInicio, LocalDate dataEfetivaFim);
}
