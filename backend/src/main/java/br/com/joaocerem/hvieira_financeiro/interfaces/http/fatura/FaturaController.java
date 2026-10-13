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
 *
 * A partir da Sprint 3 (rodada de evolução operacional): sem endpoint `pagar` — não existe mais
 * ação "Pagar Fatura"; a única confirmação válida é a conciliação bancária (decisão explícita do
 * usuário).
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
        FaturaResponse response = FaturaMapper.toResponse(fatura, service.calcularPaga(fatura));
        return ResponseEntity.created(URI.create("/api/faturas/" + fatura.getId())).body(response);
    }

    @GetMapping("/{id}")
    public FaturaResponse buscarPorId(@PathVariable UUID id) {
        Fatura fatura = service.buscarPorId(id);
        return FaturaMapper.toResponse(fatura, service.calcularPaga(fatura));
    }

    @GetMapping
    public List<FaturaResponse> listarTodas() {
        return service.listarTodas().stream()
                .map(fatura -> FaturaMapper.toResponse(fatura, service.calcularPaga(fatura)))
                .toList();
    }
}
