package br.com.joaocerem.hvieira_financeiro.application.fornecedor;

import br.com.joaocerem.hvieira_financeiro.common.exception.ResourceNotFoundException;
import br.com.joaocerem.hvieira_financeiro.domain.fornecedor.Fornecedor;
import br.com.joaocerem.hvieira_financeiro.domain.fornecedor.FornecedorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Casos de uso de Fornecedor. Unicidade de `nome` garantida pela constraint `uq_fornecedores_nome`
 * (violação vira 409 via {@link br.com.joaocerem.hvieira_financeiro.common.web.GlobalExceptionHandler}).
 * Sem exclusão — `docs/domain-model/05-fornecedor.md` Seção 4 não define regra de exclusão.
 */
@Service
@Transactional
public class FornecedorService {

    private final FornecedorRepository repository;

    public FornecedorService(FornecedorRepository repository) {
        this.repository = repository;
    }

    public Fornecedor criar(String nome) {
        return repository.save(new Fornecedor(nome));
    }

    public Fornecedor atualizar(UUID id, String nome) {
        Fornecedor fornecedor = buscarPorId(id);
        fornecedor.setNome(nome);
        return repository.save(fornecedor);
    }

    @Transactional(readOnly = true)
    public Fornecedor buscarPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fornecedor não encontrado: " + id));
    }

    @Transactional(readOnly = true)
    public List<Fornecedor> listarTodos() {
        return repository.findAll();
    }
}
