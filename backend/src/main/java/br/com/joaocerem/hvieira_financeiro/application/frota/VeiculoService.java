package br.com.joaocerem.hvieira_financeiro.application.frota;

import br.com.joaocerem.hvieira_financeiro.application.empresa.EmpresaService;
import br.com.joaocerem.hvieira_financeiro.application.obra.ObraService;
import br.com.joaocerem.hvieira_financeiro.common.exception.BusinessException;
import br.com.joaocerem.hvieira_financeiro.common.exception.ResourceNotFoundException;
import br.com.joaocerem.hvieira_financeiro.domain.empresa.Empresa;
import br.com.joaocerem.hvieira_financeiro.domain.frota.Veiculo;
import br.com.joaocerem.hvieira_financeiro.domain.frota.VeiculoRepository;
import br.com.joaocerem.hvieira_financeiro.domain.obra.Obra;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Casos de uso de Veículo. Ver `docs/domain-model/07-veiculo.md`.
 *
 * `empresa` só é aceita na criação — ver justificativa em {@link Veiculo}. `tipo` validado contra a
 * lista fechada de 8 valores (D10, decisão #31 — já refletida no `CHECK` físico `ck_veiculos_tipo`).
 * Sem exclusão — Seção 4 do documento de domínio não define regra de exclusão.
 */
@Service
@Transactional
public class VeiculoService {

    private static final Set<String> TIPOS_VALIDOS = Set.of(
            "Caminhão", "Escavadeira", "Pá carregadeira", "Trator", "Rolo compactador",
            "Veículo leve", "Terceiro", "Outro");

    private final VeiculoRepository repository;
    private final EmpresaService empresaService;
    private final ObraService obraService;

    public VeiculoService(VeiculoRepository repository, EmpresaService empresaService, ObraService obraService) {
        this.repository = repository;
        this.empresaService = empresaService;
        this.obraService = obraService;
    }

    public Veiculo criar(UUID empresaId, String nomeIdentificacao, String tipo, UUID obraAtualId) {
        validarTipo(tipo);
        Empresa empresa = empresaService.buscarPorId(empresaId);
        Obra obraAtual = obraAtualId != null ? obraService.buscarPorId(obraAtualId) : null;
        return repository.save(new Veiculo(empresa, nomeIdentificacao, tipo, obraAtual));
    }

    public Veiculo atualizar(UUID id, String nomeIdentificacao, String tipo, UUID obraAtualId) {
        validarTipo(tipo);
        Veiculo veiculo = buscarPorId(id);
        Obra obraAtual = obraAtualId != null ? obraService.buscarPorId(obraAtualId) : null;
        veiculo.setNomeIdentificacao(nomeIdentificacao);
        veiculo.setTipo(tipo);
        veiculo.setObraAtual(obraAtual);
        return repository.save(veiculo);
    }

    @Transactional(readOnly = true)
    public Veiculo buscarPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Veículo não encontrado: " + id));
    }

    @Transactional(readOnly = true)
    public List<Veiculo> listarTodos() {
        return repository.findAll();
    }

    private void validarTipo(String tipo) {
        if (!TIPOS_VALIDOS.contains(tipo)) {
            throw new BusinessException("tipo inválido: deve ser um dos valores previstos (D10)");
        }
    }
}
