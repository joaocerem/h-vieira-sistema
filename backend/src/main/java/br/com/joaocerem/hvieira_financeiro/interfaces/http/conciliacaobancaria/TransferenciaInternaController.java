package br.com.joaocerem.hvieira_financeiro.interfaces.http.conciliacaobancaria;

import br.com.joaocerem.hvieira_financeiro.application.conciliacaobancaria.TransferenciaInternaService;
import br.com.joaocerem.hvieira_financeiro.domain.conciliacaobancaria.TransferenciaInterna;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/transferencias-internas")
public class TransferenciaInternaController {

    private final TransferenciaInternaService service;

    public TransferenciaInternaController(TransferenciaInternaService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<TransferenciaInternaResponse> criar(@Valid @RequestBody CriarTransferenciaInternaRequest request) {
        TransferenciaInterna transferencia = service.criar(
                request.movimentacaoOrigemId(), request.movimentacaoDestinoId(), request.valor(), request.data());
        TransferenciaInternaResponse response = TransferenciaInternaMapper.toResponse(transferencia);
        return ResponseEntity.created(URI.create("/api/transferencias-internas/" + transferencia.getId())).body(response);
    }

    @GetMapping("/{id}")
    public TransferenciaInternaResponse buscarPorId(@PathVariable UUID id) {
        return TransferenciaInternaMapper.toResponse(service.buscarPorId(id));
    }

    @GetMapping
    public List<TransferenciaInternaResponse> listarTodas() {
        return service.listarTodas().stream().map(TransferenciaInternaMapper::toResponse).toList();
    }
}
