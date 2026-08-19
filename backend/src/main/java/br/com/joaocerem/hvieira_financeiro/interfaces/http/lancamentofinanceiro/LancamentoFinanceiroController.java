package br.com.joaocerem.hvieira_financeiro.interfaces.http.lancamentofinanceiro;

import br.com.joaocerem.hvieira_financeiro.application.lancamentofinanceiro.LancamentoFinanceiroService;
import br.com.joaocerem.hvieira_financeiro.domain.lancamentofinanceiro.LancamentoFinanceiro;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/lancamentos-financeiros")
public class LancamentoFinanceiroController {

    private final LancamentoFinanceiroService service;

    public LancamentoFinanceiroController(LancamentoFinanceiroService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<LancamentoFinanceiroResponse> criar(@Valid @RequestBody CriarLancamentoFinanceiroRequest request) {
        LancamentoFinanceiro lancamento = service.criar(
                request.tipo(), request.empresaId(), request.categoriaId(), request.fornecedorId(), request.clienteId(),
                request.obraId(), request.veiculoId(), request.valor(), request.dataCompetencia(), request.vencimento());
        LancamentoFinanceiroResponse response = toResponse(lancamento);
        return ResponseEntity.created(URI.create("/api/lancamentos-financeiros/" + lancamento.getId())).body(response);
    }

    @GetMapping("/{id}")
    public LancamentoFinanceiroResponse buscarPorId(@PathVariable UUID id) {
        return toResponse(service.buscarPorId(id));
    }

    @GetMapping
    public List<LancamentoFinanceiroResponse> listarTodos() {
        return service.listarTodos().stream().map(this::toResponse).toList();
    }

    @PutMapping("/{id}")
    public LancamentoFinanceiroResponse atualizar(@PathVariable UUID id, @Valid @RequestBody AtualizarLancamentoFinanceiroRequest request) {
        LancamentoFinanceiro lancamento = service.atualizar(
                id, request.empresaId(), request.categoriaId(), request.fornecedorId(), request.clienteId(),
                request.obraId(), request.veiculoId(), request.valor(), request.dataCompetencia(), request.vencimento());
        return toResponse(lancamento);
    }

    @PostMapping("/{id}/cancelar")
    public LancamentoFinanceiroResponse cancelar(@PathVariable UUID id) {
        return toResponse(service.cancelar(id));
    }

    private LancamentoFinanceiroResponse toResponse(LancamentoFinanceiro lancamento) {
        String statusFinanceiro = service.calcularStatusFinanceiro(lancamento);
        return LancamentoFinanceiroMapper.toResponse(lancamento, statusFinanceiro);
    }
}
