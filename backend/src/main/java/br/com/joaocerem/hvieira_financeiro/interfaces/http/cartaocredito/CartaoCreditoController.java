package br.com.joaocerem.hvieira_financeiro.interfaces.http.cartaocredito;

import br.com.joaocerem.hvieira_financeiro.application.cartaocredito.CartaoCreditoService;
import br.com.joaocerem.hvieira_financeiro.domain.cartaocredito.CartaoCredito;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/cartoes-credito")
public class CartaoCreditoController {

    private final CartaoCreditoService service;

    public CartaoCreditoController(CartaoCreditoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<CartaoCreditoResponse> criar(@Valid @RequestBody CriarCartaoCreditoRequest request) {
        CartaoCredito cartao = service.criar(
                request.contaBancariaId(), request.banco(), request.apelido(), request.diaFechamento(), request.diaVencimento());
        CartaoCreditoResponse response = CartaoCreditoMapper.toResponse(cartao);
        return ResponseEntity.created(URI.create("/api/cartoes-credito/" + cartao.getId())).body(response);
    }

    @GetMapping("/{id}")
    public CartaoCreditoResponse buscarPorId(@PathVariable UUID id) {
        return CartaoCreditoMapper.toResponse(service.buscarPorId(id));
    }

    @GetMapping
    public List<CartaoCreditoResponse> listarTodos() {
        return service.listarTodos().stream().map(CartaoCreditoMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public CartaoCreditoResponse atualizar(@PathVariable UUID id, @Valid @RequestBody AtualizarCartaoCreditoRequest request) {
        return CartaoCreditoMapper.toResponse(
                service.atualizar(id, request.banco(), request.apelido(), request.diaFechamento(), request.diaVencimento()));
    }
}
