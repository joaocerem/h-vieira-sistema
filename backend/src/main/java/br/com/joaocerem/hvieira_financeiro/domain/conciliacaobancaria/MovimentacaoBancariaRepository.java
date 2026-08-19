package br.com.joaocerem.hvieira_financeiro.domain.conciliacaobancaria;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MovimentacaoBancariaRepository extends JpaRepository<MovimentacaoBancaria, UUID> {

    List<MovimentacaoBancaria> findByContaBancariaId(UUID contaBancariaId);
}
