package br.com.joaocerem.hvieira_financeiro.interfaces.http.obra;

import br.com.joaocerem.hvieira_financeiro.application.obra.ObraService;
import br.com.joaocerem.hvieira_financeiro.domain.obra.Obra;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/obras")
public class ObraController {

    private final ObraService service;

    public ObraController(ObraService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ObraResponse> criar(@Valid @RequestBody CriarObraRequest request) {
        Obra obra = service.criar(request.clienteId(), request.nome(), request.valorContratado(),
                request.dataInicio(), request.dataPrevistaTermino(), request.dataRealTermino());
        ObraResponse response = ObraMapper.toResponse(obra);
        return ResponseEntity.created(URI.create("/api/obras/" + obra.getId())).body(response);
    }

    @GetMapping("/{id}")
    public ObraResponse buscarPorId(@PathVariable UUID id) {
        return ObraMapper.toResponse(service.buscarPorId(id));
    }

    @GetMapping
    public List<ObraResponse> listarTodas() {
        return service.listarTodas().stream().map(ObraMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public ObraResponse atualizar(@PathVariable UUID id, @Valid @RequestBody AtualizarObraRequest request) {
        Obra obra = service.atualizar(id, request.nome(), request.valorContratado(),
                request.dataInicio(), request.dataPrevistaTermino(), request.dataRealTermino());
        return ObraMapper.toResponse(obra);
    }

    @PostMapping("/{id}/status")
    public ObraResponse transicionarStatus(@PathVariable UUID id, @Valid @RequestBody TransicionarStatusObraRequest request) {
        return ObraMapper.toResponse(service.transicionarStatus(id, request.novoStatus()));
    }
}
