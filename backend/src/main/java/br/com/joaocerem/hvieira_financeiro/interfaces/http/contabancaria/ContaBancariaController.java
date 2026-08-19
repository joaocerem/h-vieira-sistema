package br.com.joaocerem.hvieira_financeiro.interfaces.http.contabancaria;

import br.com.joaocerem.hvieira_financeiro.application.contabancaria.ContaBancariaService;
import br.com.joaocerem.hvieira_financeiro.domain.contabancaria.ContaBancaria;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/contas-bancarias")
public class ContaBancariaController {

    private final ContaBancariaService service;

    public ContaBancariaController(ContaBancariaService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ContaBancariaResponse> criar(@Valid @RequestBody CriarContaBancariaRequest request) {
        ContaBancaria contaBancaria = service.criar(request.empresaId(), request.banco(), request.apelido());
        ContaBancariaResponse response = ContaBancariaMapper.toResponse(contaBancaria);
        return ResponseEntity.created(URI.create("/api/contas-bancarias/" + contaBancaria.getId())).body(response);
    }

    @GetMapping("/{id}")
    public ContaBancariaResponse buscarPorId(@PathVariable UUID id) {
        return ContaBancariaMapper.toResponse(service.buscarPorId(id));
    }

    @GetMapping
    public List<ContaBancariaResponse> listarTodas() {
        return service.listarTodas().stream().map(ContaBancariaMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public ContaBancariaResponse atualizar(@PathVariable UUID id, @Valid @RequestBody AtualizarContaBancariaRequest request) {
        return ContaBancariaMapper.toResponse(service.atualizar(id, request.banco(), request.apelido()));
    }
}
