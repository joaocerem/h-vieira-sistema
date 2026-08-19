package br.com.joaocerem.hvieira_financeiro.domain.parcela;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ParcelaRepository extends JpaRepository<Parcela, UUID> {

    List<Parcela> findByCompraCartaoId(UUID compraCartaoId);

    List<Parcela> findByContratoFinanceiroId(UUID contratoFinanceiroId);

    List<Parcela> findByFaturaId(UUID faturaId);

    /**
     * Parcelas de Compra Cartão de um Cartão, ainda sem Fatura atribuída, com vencimento até o fim do
     * mês informado (inclusive) — usadas no fechamento de um ciclo (`FaturaService#fecharCiclo`).
     * Cobre tanto as Parcelas do próprio ciclo quanto as "atrasadas" de ciclos já encerrados sem
     * Fatura ainda atribuída (regra do "próximo ciclo aberto", `21-parcela.md`, Seção 3).
     */
    @Query("select p from Parcela p where p.compraCartao.cartao.id = :cartaoId and p.fatura is null " +
            "and p.vencimento <= :fimDoCiclo order by p.vencimento")
    List<Parcela> buscarElegiveisParaFechamento(@Param("cartaoId") UUID cartaoId, @Param("fimDoCiclo") LocalDate fimDoCiclo);
}
