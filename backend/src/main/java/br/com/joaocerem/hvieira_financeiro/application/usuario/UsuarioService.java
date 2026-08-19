package br.com.joaocerem.hvieira_financeiro.application.usuario;

import br.com.joaocerem.hvieira_financeiro.common.exception.ResourceNotFoundException;
import br.com.joaocerem.hvieira_financeiro.domain.usuario.Usuario;
import br.com.joaocerem.hvieira_financeiro.domain.usuario.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Casos de uso de Usuário — cadastro mínimo estrutural (ver `docs/domain-model/02-usuario.md`).
 *
 * `identificadorDeAcesso` não é editável por esta camada: o documento de domínio marca a mutabilidade
 * desse campo como "indefinida... trocar pode ter implicações de segurança não avaliadas" — não
 * exponho um caminho de atualização até essa decisão existir (evita inventar regra de negócio).
 *
 * Sem exclusão: `docs/domain-model/02-usuario.md` Seção 4 diz explicitamente que exclusão física
 * provavelmente comprometeria a rastreabilidade de `LOG_AUDITORIA` — não implementado.
 */
@Service
@Transactional
public class UsuarioService {

    private final UsuarioRepository repository;

    public UsuarioService(UsuarioRepository repository) {
        this.repository = repository;
    }

    public Usuario criar(String nome, String identificadorDeAcesso, String situacaoDeAcesso) {
        return repository.save(new Usuario(nome, identificadorDeAcesso, situacaoDeAcesso));
    }

    public Usuario atualizar(UUID id, String nome, String situacaoDeAcesso) {
        Usuario usuario = buscarPorId(id);
        usuario.setNome(nome);
        usuario.setSituacaoDeAcesso(situacaoDeAcesso);
        return repository.save(usuario);
    }

    @Transactional(readOnly = true)
    public Usuario buscarPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + id));
    }

    @Transactional(readOnly = true)
    public List<Usuario> listarTodos() {
        return repository.findAll();
    }
}
