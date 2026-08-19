package br.com.joaocerem.hvieira_financeiro.interfaces.http.empresa;

import br.com.joaocerem.hvieira_financeiro.application.empresa.EmpresaService;
import br.com.joaocerem.hvieira_financeiro.domain.empresa.Empresa;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/empresas")
public class EmpresaController {

    private final EmpresaService service;

    public EmpresaController(EmpresaService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<EmpresaResponse> criar(@Valid @RequestBody EmpresaRequest request) {
        Empresa empresa = service.criar(request.nome());
        EmpresaResponse response = EmpresaMapper.toResponse(empresa);
        return ResponseEntity.created(URI.create("/api/empresas/" + empresa.getId())).body(response);
    }

    @GetMapping("/{id}")
    public EmpresaResponse buscarPorId(@PathVariable UUID id) {
        return EmpresaMapper.toResponse(service.buscarPorId(id));
    }

    @GetMapping
    public List<EmpresaResponse> listarTodas() {
        return service.listarTodas().stream().map(EmpresaMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public EmpresaResponse atualizar(@PathVariable UUID id, @Valid @RequestBody EmpresaRequest request) {
        return EmpresaMapper.toResponse(service.atualizar(id, request.nome()));
    }
}
