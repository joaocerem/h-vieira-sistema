package br.com.joaocerem.hvieira_financeiro.domain.usuario;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

/**
 * TODO (bloqueado por pendência 5 / T3, não uma falta técnica): quando o modelo de permissão completo
 * for refletido em `Usuario` (papel, escopo por Empresa, hash de senha), este repositório provavelmente
 * ganhará um método de busca por `identificadorDeAcesso` para autenticação. Não adicionado agora porque
 * a entidade ainda não tem esse campo com uso de autenticação definido.
 */
public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {
}
