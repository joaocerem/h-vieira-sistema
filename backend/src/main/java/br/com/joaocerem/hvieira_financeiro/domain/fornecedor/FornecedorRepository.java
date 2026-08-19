package br.com.joaocerem.hvieira_financeiro.domain.fornecedor;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface FornecedorRepository extends JpaRepository<Fornecedor, UUID> {
}
