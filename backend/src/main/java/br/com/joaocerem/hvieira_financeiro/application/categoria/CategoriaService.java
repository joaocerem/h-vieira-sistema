package br.com.joaocerem.hvieira_financeiro.application.categoria;

import br.com.joaocerem.hvieira_financeiro.common.exception.ResourceNotFoundException;
import br.com.joaocerem.hvieira_financeiro.domain.categoria.Categoria;
import br.com.joaocerem.hvieira_financeiro.domain.categoria.CategoriaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Casos de uso de Categoria. Sem exclusão — `docs/domain-model/06-categoria.md` Seção 4 não define
 * regra de exclusão, e `LANÇAMENTO_FINANCEIRO`/`COMPRA_CARTÃO` referenciam Categoria via FK RESTRICT.
 */
@Service
@Transactional
public class CategoriaService {

    private final CategoriaRepository repository;

    public CategoriaService(CategoriaRepository repository) {
        this.repository = repository;
    }

    public Categoria criar(String nome, String tipo) {
        return repository.save(new Categoria(nome, tipo));
    }

    public Categoria atualizar(UUID id, String nome, String tipo) {
        Categoria categoria = buscarPorId(id);
        categoria.setNome(nome);
        categoria.setTipo(tipo);
        return repository.save(categoria);
    }

    @Transactional(readOnly = true)
    public Categoria buscarPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada: " + id));
    }

    /**
     * Ordem alfabética (decisão de negócio) — não a ordem de cadastro (`findAll()` puro, como
     * antes). `CategoriaRepository#findAllByOrderByNomeAsc`.
     */
    @Transactional(readOnly = true)
    public List<Categoria> listarTodas() {
        return repository.findAllByOrderByNomeAsc();
    }

    /**
     * Usado por `ParcelaService#gerarLancamento` (caminho Contrato Financeiro) para resolver a
     * categoria "Amortização Empréstimo"/"Consórcios" pelo nome (`docs/domain-model/20-contrato-financeiro.md`,
     * Seção 4) — exige que a Categoria já esteja cadastrada com esse nome exato; não a cria
     * automaticamente (cadastro de Categoria continua sendo sempre manual).
     */
    @Transactional(readOnly = true)
    public Categoria buscarPorNome(String nome) {
        return repository.findByNome(nome)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Categoria '" + nome + "' não encontrada — cadastre-a manualmente antes de gerar Lançamentos de Contrato Financeiro"));
    }
}
