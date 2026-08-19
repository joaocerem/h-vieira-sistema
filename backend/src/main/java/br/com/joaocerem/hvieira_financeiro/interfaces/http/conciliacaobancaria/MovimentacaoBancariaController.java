package br.com.joaocerem.hvieira_financeiro.interfaces.http.conciliacaobancaria;

import br.com.joaocerem.hvieira_financeiro.application.conciliacaobancaria.ItemImportacaoMovimentacao;
import br.com.joaocerem.hvieira_financeiro.application.conciliacaobancaria.MovimentacaoBancariaService;
import br.com.joaocerem.hvieira_financeiro.domain.conciliacaobancaria.MovimentacaoBancaria;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/movimentacoes-bancarias")
public class MovimentacaoBancariaController {

    private final MovimentacaoBancariaService service;

    public MovimentacaoBancariaController(MovimentacaoBancariaService service) {
        this.service = service;
    }

    @PostMapping("/importar")
    public List<MovimentacaoBancariaResponse> importar(@Valid @RequestBody ImportarMovimentacoesRequest request) {
        List<ItemImportacaoMovimentacao> itens = request.itens().stream()
                .map(item -> new ItemImportacaoMovimentacao(item.data(), item.descricao(), item.valor()))
                .toList();
        return service.importar(request.contaBancariaId(), itens).stream()
                .map(MovimentacaoBancariaMapper::toResponse)
                .toList();
    }

    @PatchMapping("/{id}/classificacao")
    public MovimentacaoBancariaResponse reclassificar(@PathVariable UUID id, @Valid @RequestBody ReclassificarMovimentacaoRequest request) {
        return MovimentacaoBancariaMapper.toResponse(service.reclassificar(id, request.classificacao()));
    }

    @GetMapping("/{id}")
    public MovimentacaoBancariaResponse buscarPorId(@PathVariable UUID id) {
        return MovimentacaoBancariaMapper.toResponse(service.buscarPorId(id));
    }

    @GetMapping
    public List<MovimentacaoBancariaResponse> listar(@RequestParam(required = false) UUID contaBancariaId) {
        List<MovimentacaoBancaria> movimentacoes = contaBancariaId != null
                ? service.listarPorConta(contaBancariaId)
                : service.listarTodas();
        return movimentacoes.stream().map(MovimentacaoBancariaMapper::toResponse).toList();
    }
}
