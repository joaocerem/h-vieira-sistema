package br.com.joaocerem.hvieira_financeiro.interfaces.http.compracartao;

import br.com.joaocerem.hvieira_financeiro.application.compracartao.CompraCartaoService;
import br.com.joaocerem.hvieira_financeiro.domain.compracartao.CompraCartao;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/compras-cartao")
public class CompraCartaoController {

    private final CompraCartaoService service;

    public CompraCartaoController(CompraCartaoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<CompraCartaoResponse> criar(@Valid @RequestBody CriarCompraCartaoRequest request) {
        CompraCartao compra = service.criar(
                request.cartaoId(), request.fornecedorId(), request.valor(), request.data(), request.categoriaId(),
                request.classificacao(), request.obraId(), request.veiculoId(), request.numeroParcelas());
        CompraCartaoResponse response = CompraCartaoMapper.toResponse(compra);
        return ResponseEntity.created(URI.create("/api/compras-cartao/" + compra.getId())).body(response);
    }

    @GetMapping("/{id}")
    public CompraCartaoResponse buscarPorId(@PathVariable UUID id) {
        return CompraCartaoMapper.toResponse(service.buscarPorId(id));
    }

    @GetMapping
    public List<CompraCartaoResponse> listarTodas() {
        return service.listarTodas().stream().map(CompraCartaoMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public CompraCartaoResponse atualizar(@PathVariable UUID id, @Valid @RequestBody AtualizarCompraCartaoRequest request) {
        CompraCartao compra = service.atualizar(
                id, request.fornecedorId(), request.data(), request.categoriaId(), request.classificacao(),
                request.obraId(), request.veiculoId());
        return CompraCartaoMapper.toResponse(compra);
    }
}
