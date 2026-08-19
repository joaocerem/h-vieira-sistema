package br.com.joaocerem.hvieira_financeiro.interfaces.http.frota;

import br.com.joaocerem.hvieira_financeiro.application.frota.VeiculoService;
import br.com.joaocerem.hvieira_financeiro.domain.frota.Veiculo;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/veiculos")
public class VeiculoController {

    private final VeiculoService service;

    public VeiculoController(VeiculoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<VeiculoResponse> criar(@Valid @RequestBody CriarVeiculoRequest request) {
        Veiculo veiculo = service.criar(request.empresaId(), request.nomeIdentificacao(), request.tipo(), request.obraAtualId());
        VeiculoResponse response = VeiculoMapper.toResponse(veiculo);
        return ResponseEntity.created(URI.create("/api/veiculos/" + veiculo.getId())).body(response);
    }

    @GetMapping("/{id}")
    public VeiculoResponse buscarPorId(@PathVariable UUID id) {
        return VeiculoMapper.toResponse(service.buscarPorId(id));
    }

    @GetMapping
    public List<VeiculoResponse> listarTodos() {
        return service.listarTodos().stream().map(VeiculoMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public VeiculoResponse atualizar(@PathVariable UUID id, @Valid @RequestBody AtualizarVeiculoRequest request) {
        Veiculo veiculo = service.atualizar(id, request.nomeIdentificacao(), request.tipo(), request.obraAtualId());
        return VeiculoMapper.toResponse(veiculo);
    }
}
