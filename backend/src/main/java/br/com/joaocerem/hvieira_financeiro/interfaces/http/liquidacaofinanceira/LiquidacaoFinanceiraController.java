package br.com.joaocerem.hvieira_financeiro.interfaces.http.liquidacaofinanceira;

import br.com.joaocerem.hvieira_financeiro.application.liquidacaofinanceira.AplicacaoLancamento;
import br.com.joaocerem.hvieira_financeiro.application.liquidacaofinanceira.LiquidacaoFinanceiraService;
import br.com.joaocerem.hvieira_financeiro.domain.liquidacaofinanceira.LiquidacaoFinanceira;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/liquidacoes-financeiras")
public class LiquidacaoFinanceiraController {

    private final LiquidacaoFinanceiraService service;

    public LiquidacaoFinanceiraController(LiquidacaoFinanceiraService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<LiquidacaoFinanceiraResponse> criar(@Valid @RequestBody CriarLiquidacaoFinanceiraRequest request) {
        List<AplicacaoLancamento> aplicacoes = request.aplicacoes().stream()
                .map(item -> new AplicacaoLancamento(item.lancamentoFinanceiroId(), item.valorAplicado()))
                .toList();
        LiquidacaoFinanceira liquidacao = service.criar(
                request.tipo(), request.dataEfetiva(), request.valor(), request.contaBancariaId(), aplicacoes);
        LiquidacaoFinanceiraResponse response = toResponse(liquidacao);
        return ResponseEntity.created(URI.create("/api/liquidacoes-financeiras/" + liquidacao.getId())).body(response);
    }

    @GetMapping("/{id}")
    public LiquidacaoFinanceiraResponse buscarPorId(@PathVariable UUID id) {
        return toResponse(service.buscarPorId(id));
    }

    @GetMapping
    public List<LiquidacaoFinanceiraResponse> listarTodas() {
        return service.listarTodas().stream().map(this::toResponse).toList();
    }

    private LiquidacaoFinanceiraResponse toResponse(LiquidacaoFinanceira liquidacao) {
        return LiquidacaoFinanceiraMapper.toResponse(liquidacao, service.listarAplicacoes(liquidacao.getId()));
    }
}
