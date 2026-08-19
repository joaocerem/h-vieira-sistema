package br.com.joaocerem.hvieira_financeiro.interfaces.http.cliente;

import br.com.joaocerem.hvieira_financeiro.application.cliente.ClienteService;
import br.com.joaocerem.hvieira_financeiro.domain.cliente.Cliente;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final ClienteService service;

    public ClienteController(ClienteService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ClienteResponse> criar(@Valid @RequestBody ClienteRequest request) {
        Cliente cliente = service.criar(request.nome());
        ClienteResponse response = ClienteMapper.toResponse(cliente);
        return ResponseEntity.created(URI.create("/api/clientes/" + cliente.getId())).body(response);
    }

    @GetMapping("/{id}")
    public ClienteResponse buscarPorId(@PathVariable UUID id) {
        return ClienteMapper.toResponse(service.buscarPorId(id));
    }

    @GetMapping
    public List<ClienteResponse> listarTodos() {
        return service.listarTodos().stream().map(ClienteMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public ClienteResponse atualizar(@PathVariable UUID id, @Valid @RequestBody ClienteRequest request) {
        return ClienteMapper.toResponse(service.atualizar(id, request.nome()));
    }
}
