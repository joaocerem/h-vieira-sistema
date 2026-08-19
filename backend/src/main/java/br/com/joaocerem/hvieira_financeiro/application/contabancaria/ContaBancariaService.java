package br.com.joaocerem.hvieira_financeiro.application.contabancaria;

import br.com.joaocerem.hvieira_financeiro.application.empresa.EmpresaService;
import br.com.joaocerem.hvieira_financeiro.common.exception.ResourceNotFoundException;
import br.com.joaocerem.hvieira_financeiro.domain.contabancaria.ContaBancaria;
import br.com.joaocerem.hvieira_financeiro.domain.contabancaria.ContaBancariaRepository;
import br.com.joaocerem.hvieira_financeiro.domain.empresa.Empresa;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Casos de uso de Conta Bancária. `empresaId` só é aceito na criação — ver justificativa em
 * {@link ContaBancaria}. Sem exclusão — `docs/domain-model/08-conta-bancaria.md` Seção 4 aponta que
 * Movimentação Bancária/Cartão/Liquidação dependem de Conta Bancária via FK RESTRICT.
 */
@Service
@Transactional
public class ContaBancariaService {

    private final ContaBancariaRepository repository;
    private final EmpresaService empresaService;

    public ContaBancariaService(ContaBancariaRepository repository, EmpresaService empresaService) {
        this.repository = repository;
        this.empresaService = empresaService;
    }

    public ContaBancaria criar(UUID empresaId, String banco, String apelido) {
        Empresa empresa = empresaService.buscarPorId(empresaId);
        return repository.save(new ContaBancaria(empresa, banco, apelido));
    }

    public ContaBancaria atualizar(UUID id, String banco, String apelido) {
        ContaBancaria contaBancaria = buscarPorId(id);
        contaBancaria.setBanco(banco);
        contaBancaria.setApelido(apelido);
        return repository.save(contaBancaria);
    }

    @Transactional(readOnly = true)
    public ContaBancaria buscarPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Conta Bancária não encontrada: " + id));
    }

    @Transactional(readOnly = true)
    public List<ContaBancaria> listarTodas() {
        return repository.findAll();
    }
}
