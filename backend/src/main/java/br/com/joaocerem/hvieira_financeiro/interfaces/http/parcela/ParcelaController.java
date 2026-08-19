package br.com.joaocerem.hvieira_financeiro.interfaces.http.parcela;

import br.com.joaocerem.hvieira_financeiro.application.parcela.ParcelaService;
import br.com.joaocerem.hvieira_financeiro.domain.parcela.Parcela;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Sem `POST` de criação direta — Parcela é sempre gerada pelo sistema (`docs/domain-model/21-parcela.md`,
 * Seção 1: "Sistema, ao calcular o parcelamento"), nunca por digitação do usuário.
 */
@RestController
@RequestMapping("/api/parcelas")
public class ParcelaController {

    private final ParcelaService service;

    public ParcelaController(ParcelaService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public ParcelaResponse buscarPorId(@PathVariable UUID id) {
        return ParcelaMapper.toResponse(service.buscarPorId(id));
    }

    @GetMapping
    public List<ParcelaResponse> listarTodas(@RequestParam(required = false) UUID compraCartaoId,
                                              @RequestParam(required = false) UUID contratoFinanceiroId) {
        List<Parcela> parcelas;
        if (compraCartaoId != null) {
            parcelas = service.listarPorCompraCartao(compraCartaoId);
        } else if (contratoFinanceiroId != null) {
            parcelas = service.listarPorContratoFinanceiro(contratoFinanceiroId);
        } else {
            parcelas = service.listarTodas();
        }
        return parcelas.stream().map(ParcelaMapper::toResponse).toList();
    }

    @PostMapping("/{id}/gerar-lancamento")
    public ParcelaResponse gerarLancamento(@PathVariable UUID id) {
        return ParcelaMapper.toResponse(service.gerarLancamento(id));
    }
}
