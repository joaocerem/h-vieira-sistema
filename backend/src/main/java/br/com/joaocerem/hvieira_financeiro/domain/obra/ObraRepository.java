package br.com.joaocerem.hvieira_financeiro.domain.obra;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ObraRepository extends JpaRepository<Obra, UUID> {
}
