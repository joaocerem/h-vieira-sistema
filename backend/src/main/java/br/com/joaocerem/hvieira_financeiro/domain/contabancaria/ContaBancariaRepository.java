package br.com.joaocerem.hvieira_financeiro.domain.contabancaria;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ContaBancariaRepository extends JpaRepository<ContaBancaria, UUID> {
}
