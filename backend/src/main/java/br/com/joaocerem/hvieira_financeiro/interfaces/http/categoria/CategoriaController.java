package br.com.joaocerem.hvieira_financeiro.interfaces.http.categoria;

import br.com.joaocerem.hvieira_financeiro.application.categoria.CategoriaService;
import br.com.joaocerem.hvieira_financeiro.domain.categoria.Categoria;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

    private final CategoriaService service;

    public CategoriaController(CategoriaService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<CategoriaResponse> criar(@Valid @RequestBody CategoriaRequest request) {
        Categoria categoria = service.criar(request.nome(), request.tipo());
        CategoriaResponse response = CategoriaMapper.toResponse(categoria);
        return ResponseEntity.created(URI.create("/api/categorias/" + categoria.getId())).body(response);
    }

    @GetMapping("/{id}")
    public CategoriaResponse buscarPorId(@PathVariable UUID id) {
        return CategoriaMapper.toResponse(service.buscarPorId(id));
    }

    @GetMapping
    public List<CategoriaResponse> listarTodas() {
        return service.listarTodas().stream().map(CategoriaMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public CategoriaResponse atualizar(@PathVariable UUID id, @Valid @RequestBody CategoriaRequest request) {
        return CategoriaMapper.toResponse(service.atualizar(id, request.nome(), request.tipo()));
    }
}
