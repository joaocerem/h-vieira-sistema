package br.com.joaocerem.hvieira_financeiro.application.empresa;

import br.com.joaocerem.hvieira_financeiro.common.exception.ResourceNotFoundException;
import br.com.joaocerem.hvieira_financeiro.domain.empresa.Empresa;
import br.com.joaocerem.hvieira_financeiro.domain.empresa.EmpresaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Casos de uso de Empresa. Perfil "cadastro simples" (`arquitetura-tecnica.md` Seção 4) — colapsados
 * num único Service, um método por operação (equivalente a "um caso de uso leve por operação").
 *
 * Sem exclusão: `docs/domain-model/01-empresa.md` Seção 4 não define regra de exclusão para Empresa
 * (observação explícita: presumir exclusão física livre seria arriscado, dado que Conta Bancária,
 * Veículo e Contrato Financeiro dependem de Empresa via FK RESTRICT). Não implementado até existir
 * decisão de negócio explícita sobre exclusão de cadastro-base.
 */
@Service
@Transactional
public class EmpresaService {

    private final EmpresaRepository repository;

    public EmpresaService(EmpresaRepository repository) {
        this.repository = repository;
    }

    public Empresa criar(String nome) {
        return repository.save(new Empresa(nome));
    }

    public Empresa atualizar(UUID id, String nome) {
        Empresa empresa = buscarPorId(id);
        empresa.setNome(nome);
        return repository.save(empresa);
    }

    @Transactional(readOnly = true)
    public Empresa buscarPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Empresa não encontrada: " + id));
    }

    @Transactional(readOnly = true)
    public List<Empresa> listarTodas() {
        return repository.findAll();
    }
}
