package br.com.joaocerem.hvieira_financeiro.domain.compracartao;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CompraCartaoRepository extends JpaRepository<CompraCartao, UUID> {
}
