package br.com.joaocerem.hvieira_financeiro.interfaces.http.fatura;

import br.com.joaocerem.hvieira_financeiro.application.fatura.FaturaService;
import br.com.joaocerem.hvieira_financeiro.domain.fatura.Fatura;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

/**
 * Sem `POST` de criação direta genérica — a criação de Fatura é sempre o fechamento de um ciclo
 * (`POST /fechar-ciclo`), nunca digitação livre (`docs/domain-model/19-fatura.md`, Seção 1).
 */
@RestController
@RequestMapping("/api/faturas")
public class FaturaController {

    private final FaturaService service;

    public FaturaController(FaturaService service) {
        this.service = service;
    }

    @PostMapping("/fechar-ciclo")
    public ResponseEntity<FaturaResponse> fecharCiclo(@Valid @RequestBody FecharCicloFaturaRequest request) {
        Fatura fatura = service.fecharCiclo(request.cartaoId(), request.ciclo(), request.valorCobrado());
        FaturaResponse response = FaturaMapper.toResponse(fatura);
        return ResponseEntity.created(URI.create("/api/faturas/" + fatura.getId())).body(response);
    }

    @PostMapping("/{id}/pagar")
    public FaturaResponse pagar(@PathVariable UUID id, @Valid @RequestBody PagarFaturaRequest request) {
        Fatura fatura = service.pagar(id, request.contaBancariaId(), request.dataEfetiva());
        return FaturaMapper.toResponse(fatura);
    }

    @GetMapping("/{id}")
    public FaturaResponse buscarPorId(@PathVariable UUID id) {
        return FaturaMapper.toResponse(service.buscarPorId(id));
    }

    @GetMapping
    public List<FaturaResponse> listarTodas() {
        return service.listarTodas().stream().map(FaturaMapper::toResponse).toList();
    }
}
