package br.com.joaocerem.hvieira_financeiro.domain.categoria;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoriaRepository extends JpaRepository<Categoria, UUID> {

    Optional<Categoria> findByNome(String nome);

    /**
     * Ordenação alfabética (decisão de negócio: lista de Categorias sempre em ordem alfabética,
     * não a ordem de cadastro) — usada por {@code CategoriaService#listarTodas}.
     */
    List<Categoria> findAllByOrderByNomeAsc();
}
