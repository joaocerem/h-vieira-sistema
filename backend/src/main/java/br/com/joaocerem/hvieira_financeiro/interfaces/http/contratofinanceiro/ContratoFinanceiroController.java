package br.com.joaocerem.hvieira_financeiro.interfaces.http.contratofinanceiro;

import br.com.joaocerem.hvieira_financeiro.application.contratofinanceiro.ContratoFinanceiroService;
import br.com.joaocerem.hvieira_financeiro.domain.contratofinanceiro.ContratoFinanceiro;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/contratos-financeiros")
public class ContratoFinanceiroController {

    private final ContratoFinanceiroService service;

    public ContratoFinanceiroController(ContratoFinanceiroService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ContratoFinanceiroResponse> criar(@Valid @RequestBody CriarContratoFinanceiroRequest request) {
        ContratoFinanceiro contrato = service.criar(
                request.tipo(), request.empresaId(), request.contaBancariaId(), request.fornecedorId(),
                request.valorContratado(), request.numeroParcelas(), request.dataVencimentoPrimeiraParcela(),
                request.taxa(), request.grupoCota(), request.contemplado(), request.veiculoId());
        ContratoFinanceiroResponse response = ContratoFinanceiroMapper.toResponse(contrato);
        return ResponseEntity.created(URI.create("/api/contratos-financeiros/" + contrato.getId())).body(response);
    }

    @GetMapping("/{id}")
    public ContratoFinanceiroResponse buscarPorId(@PathVariable UUID id) {
        return ContratoFinanceiroMapper.toResponse(service.buscarPorId(id));
    }

    @GetMapping
    public List<ContratoFinanceiroResponse> listarTodos() {
        return service.listarTodos().stream().map(ContratoFinanceiroMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public ContratoFinanceiroResponse atualizar(@PathVariable UUID id, @Valid @RequestBody AtualizarContratoFinanceiroRequest request) {
        ContratoFinanceiro contrato = service.atualizar(id, request.fornecedorId(), request.veiculoId());
        return ContratoFinanceiroMapper.toResponse(contrato);
    }

    @PostMapping("/{id}/contemplar")
    public ContratoFinanceiroResponse contemplar(@PathVariable UUID id) {
        return ContratoFinanceiroMapper.toResponse(service.contemplar(id));
    }
}
