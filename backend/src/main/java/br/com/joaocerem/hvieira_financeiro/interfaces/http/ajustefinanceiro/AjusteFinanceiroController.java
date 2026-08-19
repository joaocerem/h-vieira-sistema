package br.com.joaocerem.hvieira_financeiro.interfaces.http.ajustefinanceiro;

import br.com.joaocerem.hvieira_financeiro.application.ajustefinanceiro.AjusteFinanceiroService;
import br.com.joaocerem.hvieira_financeiro.domain.ajustefinanceiro.AjusteFinanceiro;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/ajustes-financeiros")
public class AjusteFinanceiroController {

    private final AjusteFinanceiroService service;

    public AjusteFinanceiroController(AjusteFinanceiroService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<AjusteFinanceiroResponse> criar(@Valid @RequestBody CriarAjusteFinanceiroRequest request) {
        AjusteFinanceiro ajuste = service.criar(
                request.lancamentoOriginalId(), request.lancamentoAjusteId(), request.tipoAjuste(),
                request.valor(), request.data(), request.usuarioId(), request.observacao());
        AjusteFinanceiroResponse response = AjusteFinanceiroMapper.toResponse(ajuste);
        return ResponseEntity.created(URI.create("/api/ajustes-financeiros/" + ajuste.getId())).body(response);
    }

    @GetMapping("/{id}")
    public AjusteFinanceiroResponse buscarPorId(@PathVariable UUID id) {
        return AjusteFinanceiroMapper.toResponse(service.buscarPorId(id));
    }

    @GetMapping
    public List<AjusteFinanceiroResponse> listarTodos(@RequestParam(required = false) UUID lancamentoOriginalId) {
        List<AjusteFinanceiro> ajustes = lancamentoOriginalId != null
                ? service.listarPorLancamentoOriginal(lancamentoOriginalId)
                : service.listarTodos();
        return ajustes.stream().map(AjusteFinanceiroMapper::toResponse).toList();
    }
}
