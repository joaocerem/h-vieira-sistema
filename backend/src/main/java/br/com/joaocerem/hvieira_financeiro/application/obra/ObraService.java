package br.com.joaocerem.hvieira_financeiro.application.obra;

import br.com.joaocerem.hvieira_financeiro.application.cliente.ClienteService;
import br.com.joaocerem.hvieira_financeiro.common.exception.BusinessException;
import br.com.joaocerem.hvieira_financeiro.common.exception.ResourceNotFoundException;
import br.com.joaocerem.hvieira_financeiro.domain.cliente.Cliente;
import br.com.joaocerem.hvieira_financeiro.domain.obra.Obra;
import br.com.joaocerem.hvieira_financeiro.domain.obra.ObraRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Casos de uso de Obra. Ver `docs/domain-model/03-obra.md`.
 *
 * `cliente` só é aceito na criação — ver justificativa em {@link Obra}. `status` só muda via
 * {@link #transicionarStatus(UUID, String)}, que valida as transições confirmadas (Seção 4).
 * Sem exclusão — Seção 4 não define regra de exclusão, e Lançamento/Rateio podem depender de Obra.
 */
@Service
@Transactional
public class ObraService {

    private static final Map<String, Set<String>> TRANSICOES_VALIDAS = Map.of(
            "A executar", Set.of("Em andamento"),
            "Em andamento", Set.of("Pausada", "Concluída"),
            "Pausada", Set.of("Em andamento"),
            "Concluída", Set.of()
    );

    private final ObraRepository repository;
    private final ClienteService clienteService;

    public ObraService(ObraRepository repository, ClienteService clienteService) {
        this.repository = repository;
        this.clienteService = clienteService;
    }

    public Obra criar(UUID clienteId, String nome, BigDecimal valorContratado, LocalDate dataInicio,
                       LocalDate dataPrevistaTermino, LocalDate dataRealTermino) {
        Cliente cliente = clienteService.buscarPorId(clienteId);
        return repository.save(new Obra(cliente, nome, valorContratado, dataInicio, dataPrevistaTermino, dataRealTermino));
    }

    public Obra atualizar(UUID id, String nome, BigDecimal valorContratado, LocalDate dataInicio,
                           LocalDate dataPrevistaTermino, LocalDate dataRealTermino) {
        Obra obra = buscarPorId(id);
        obra.setNome(nome);
        obra.setValorContratado(valorContratado);
        obra.setDataInicio(dataInicio);
        obra.setDataPrevistaTermino(dataPrevistaTermino);
        obra.setDataRealTermino(dataRealTermino);
        return repository.save(obra);
    }

    public Obra transicionarStatus(UUID id, String novoStatus) {
        Obra obra = buscarPorId(id);
        Set<String> permitidas = TRANSICOES_VALIDAS.get(obra.getStatus());
        if (permitidas == null || !permitidas.contains(novoStatus)) {
            throw new BusinessException(
                    "transição de status inválida: '" + obra.getStatus() + "' → '" + novoStatus + "'");
        }
        obra.transicionarStatus(novoStatus);
        return repository.save(obra);
    }

    @Transactional(readOnly = true)
    public Obra buscarPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Obra não encontrada: " + id));
    }

    @Transactional(readOnly = true)
    public List<Obra> listarTodas() {
        return repository.findAll();
    }
}
