package br.com.joaocerem.hvieira_financeiro.domain.cartaocredito;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CartaoCreditoRepository extends JpaRepository<CartaoCredito, UUID> {
}
