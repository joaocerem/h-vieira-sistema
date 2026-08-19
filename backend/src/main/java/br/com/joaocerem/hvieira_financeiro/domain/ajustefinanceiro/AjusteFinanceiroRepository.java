package br.com.joaocerem.hvieira_financeiro.domain.ajustefinanceiro;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AjusteFinanceiroRepository extends JpaRepository<AjusteFinanceiro, UUID> {

    List<AjusteFinanceiro> findByLancamentoOriginalId(UUID lancamentoOriginalId);
}
