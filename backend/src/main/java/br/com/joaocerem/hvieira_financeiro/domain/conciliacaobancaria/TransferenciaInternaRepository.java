package br.com.joaocerem.hvieira_financeiro.domain.conciliacaobancaria;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface TransferenciaInternaRepository extends JpaRepository<TransferenciaInterna, UUID> {

    /**
     * Usada por `TransferenciaInternaService#criar` — cada Movimentação Bancária pode ser um dos dois
     * lados de, no máximo, uma Transferência Interna (`12-movimentacao-bancaria.md`, Seção 3: "1:1
     * opcional"). A `UNIQUE` por coluna (schema físico) não cobre sozinha o cruzamento entre origem e
     * destino — checagem multi-tabela, então em camada de aplicação (`arquitetura-fisica-banco.md` §6).
     */
    @Query("select case when count(t) > 0 then true else false end from TransferenciaInterna t " +
            "where t.movimentacaoOrigem.id in (:idA, :idB) or t.movimentacaoDestino.id in (:idA, :idB)")
    boolean existeTransferenciaEnvolvendoAlgumaDas(@Param("idA") UUID idA, @Param("idB") UUID idB);
}
