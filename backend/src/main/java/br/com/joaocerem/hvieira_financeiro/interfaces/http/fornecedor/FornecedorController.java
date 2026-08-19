package br.com.joaocerem.hvieira_financeiro.interfaces.http.fornecedor;

import br.com.joaocerem.hvieira_financeiro.application.fornecedor.FornecedorService;
import br.com.joaocerem.hvieira_financeiro.domain.fornecedor.Fornecedor;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/fornecedores")
public class FornecedorController {

    private final FornecedorService service;

    public FornecedorController(FornecedorService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<FornecedorResponse> criar(@Valid @RequestBody FornecedorRequest request) {
        Fornecedor fornecedor = service.criar(request.nome());
        FornecedorResponse response = FornecedorMapper.toResponse(fornecedor);
        return ResponseEntity.created(URI.create("/api/fornecedores/" + fornecedor.getId())).body(response);
    }

    @GetMapping("/{id}")
    public FornecedorResponse buscarPorId(@PathVariable UUID id) {
        return FornecedorMapper.toResponse(service.buscarPorId(id));
    }

    @GetMapping
    public List<FornecedorResponse> listarTodos() {
        return service.listarTodos().stream().map(FornecedorMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public FornecedorResponse atualizar(@PathVariable UUID id, @Valid @RequestBody FornecedorRequest request) {
        return FornecedorMapper.toResponse(service.atualizar(id, request.nome()));
    }
}
