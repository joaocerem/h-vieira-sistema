package br.com.joaocerem.hvieira_financeiro.interfaces.http.usuario;

import br.com.joaocerem.hvieira_financeiro.application.usuario.UsuarioService;
import br.com.joaocerem.hvieira_financeiro.domain.usuario.Usuario;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<UsuarioResponse> criar(@Valid @RequestBody CriarUsuarioRequest request) {
        Usuario usuario = service.criar(request.nome(), request.identificadorDeAcesso(), request.situacaoDeAcesso());
        UsuarioResponse response = UsuarioMapper.toResponse(usuario);
        return ResponseEntity.created(URI.create("/api/usuarios/" + usuario.getId())).body(response);
    }

    @GetMapping("/{id}")
    public UsuarioResponse buscarPorId(@PathVariable UUID id) {
        return UsuarioMapper.toResponse(service.buscarPorId(id));
    }

    @GetMapping
    public List<UsuarioResponse> listarTodos() {
        return service.listarTodos().stream().map(UsuarioMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public UsuarioResponse atualizar(@PathVariable UUID id, @Valid @RequestBody AtualizarUsuarioRequest request) {
        return UsuarioMapper.toResponse(service.atualizar(id, request.nome(), request.situacaoDeAcesso()));
    }
}
