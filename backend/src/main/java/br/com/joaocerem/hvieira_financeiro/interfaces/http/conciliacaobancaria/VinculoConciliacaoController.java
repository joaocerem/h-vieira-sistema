package br.com.joaocerem.hvieira_financeiro.interfaces.http.conciliacaobancaria;

import br.com.joaocerem.hvieira_financeiro.application.conciliacaobancaria.VinculoConciliacaoService;
import br.com.joaocerem.hvieira_financeiro.domain.conciliacaobancaria.VinculoConciliacao;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vinculos-conciliacao")
public class VinculoConciliacaoController {

    private final VinculoConciliacaoService service;

    public VinculoConciliacaoController(VinculoConciliacaoService service) {
        this.service = service;
    }

    @PostMapping("/sugestao-automatica")
    public VinculoConciliacaoService.ResultadoSugestaoAutomatica rodarSugestaoAutomatica() {
        return service.rodarSugestaoAutomatica();
    }

    @PostMapping("/{id}/confirmar")
    public VinculoConciliacaoResponse confirmar(@PathVariable UUID id) {
        return VinculoConciliacaoMapper.toResponse(service.confirmar(id));
    }

    @PostMapping("/{id}/divergente")
    public VinculoConciliacaoResponse marcarDivergente(@PathVariable UUID id) {
        return VinculoConciliacaoMapper.toResponse(service.marcarDivergente(id));
    }

    @PostMapping("/{id}/sem-correspondencia")
    public VinculoConciliacaoResponse marcarSemCorrespondencia(@PathVariable UUID id) {
        return VinculoConciliacaoMapper.toResponse(service.marcarSemCorrespondencia(id));
    }

    @PostMapping("/{id}/vincular")
    public VinculoConciliacaoResponse vincularManualmente(@PathVariable UUID id, @Valid @RequestBody VincularManualmenteRequest request) {
        return VinculoConciliacaoMapper.toResponse(service.vincularManualmente(id, request.liquidacaoFinanceiraId()));
    }

    @GetMapping("/{id}")
    public VinculoConciliacaoResponse buscarPorId(@PathVariable UUID id) {
        return VinculoConciliacaoMapper.toResponse(service.buscarPorId(id));
    }

    @GetMapping("/movimentacao/{movimentacaoBancariaId}")
    public VinculoConciliacaoResponse buscarPorMovimentacao(@PathVariable UUID movimentacaoBancariaId) {
        return VinculoConciliacaoMapper.toResponse(service.buscarPorMovimentacao(movimentacaoBancariaId));
    }

    @GetMapping
    public List<VinculoConciliacaoResponse> listar(@RequestParam(required = false) String estado) {
        List<VinculoConciliacao> vinculos = estado != null ? service.listarPorEstado(estado) : service.listarTodos();
        return vinculos.stream().map(VinculoConciliacaoMapper::toResponse).toList();
    }
}
