package br.com.joaocerem.hvieira_financeiro.application.cliente;

import br.com.joaocerem.hvieira_financeiro.common.exception.ResourceNotFoundException;
import br.com.joaocerem.hvieira_financeiro.domain.cliente.Cliente;
import br.com.joaocerem.hvieira_financeiro.domain.cliente.ClienteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Casos de uso de Cliente. Unicidade de `nome` garantida pela constraint `uq_clientes_nome`
 * (violação vira 409 via {@link br.com.joaocerem.hvieira_financeiro.common.web.GlobalExceptionHandler}).
 * Sem exclusão — `docs/domain-model/04-cliente.md` Seção 4 não define regra de exclusão.
 */
@Service
@Transactional
public class ClienteService {

    private final ClienteRepository repository;

    public ClienteService(ClienteRepository repository) {
        this.repository = repository;
    }

    public Cliente criar(String nome) {
        return repository.save(new Cliente(nome));
    }

    public Cliente atualizar(UUID id, String nome) {
        Cliente cliente = buscarPorId(id);
        cliente.setNome(nome);
        return repository.save(cliente);
    }

    @Transactional(readOnly = true)
    public Cliente buscarPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado: " + id));
    }

    @Transactional(readOnly = true)
    public List<Cliente> listarTodos() {
        return repository.findAll();
    }
}
