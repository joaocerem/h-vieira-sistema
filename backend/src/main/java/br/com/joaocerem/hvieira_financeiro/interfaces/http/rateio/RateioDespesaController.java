package br.com.joaocerem.hvieira_financeiro.interfaces.http.rateio;

import br.com.joaocerem.hvieira_financeiro.application.rateio.RateioDespesaService;
import br.com.joaocerem.hvieira_financeiro.domain.rateio.RateioDespesa;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rateios-despesa")
public class RateioDespesaController {

    private final RateioDespesaService service;

    public RateioDespesaController(RateioDespesaService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<RateioDespesaResponse> criar(@Valid @RequestBody CriarRateioDespesaRequest request) {
        RateioDespesa rateio = service.criar(
                request.lancamentoFinanceiroId(), request.obraId(), request.valorRateado(), request.criterioInformado());
        RateioDespesaResponse response = RateioDespesaMapper.toResponse(rateio);
        return ResponseEntity.created(URI.create("/api/rateios-despesa/" + rateio.getId())).body(response);
    }

    @GetMapping("/{id}")
    public RateioDespesaResponse buscarPorId(@PathVariable UUID id) {
        return RateioDespesaMapper.toResponse(service.buscarPorId(id));
    }

    @GetMapping
    public List<RateioDespesaResponse> listarTodos(@RequestParam(required = false) UUID lancamentoFinanceiroId) {
        List<RateioDespesa> rateios = lancamentoFinanceiroId != null
                ? service.listarPorLancamento(lancamentoFinanceiroId)
                : service.listarTodos();
        return rateios.stream().map(RateioDespesaMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public RateioDespesaResponse atualizar(@PathVariable UUID id, @Valid @RequestBody AtualizarRateioDespesaRequest request) {
        RateioDespesa rateio = service.atualizar(id, request.valorRateado(), request.criterioInformado());
        return RateioDespesaMapper.toResponse(rateio);
    }
}
