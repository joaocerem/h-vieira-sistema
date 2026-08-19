package br.com.joaocerem.hvieira_financeiro.domain.contratofinanceiro;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ContratoFinanceiroRepository extends JpaRepository<ContratoFinanceiro, UUID> {
}
