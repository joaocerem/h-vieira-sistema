package br.com.joaocerem.hvieira_financeiro.domain.usuario;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

/**
 * USUÁRIO — modelo mínimo estrutural (ver `docs/domain-model/02-usuario.md`).
 *
 * Deliberadamente sem credenciais de autenticação (senha/hash), papel/perfil ou escopo por Empresa —
 * o documento de domínio exclui esses campos explicitamente, remetendo-os à pendência 5 (resolvida
 * arquiteturalmente por A2, decisão #16, mas ainda não refletida numa revisão completa desta entidade)
 * e ao mecanismo de autenticação (T3, decisão #14). Ver TODO em {@link UsuarioRepository}.
 */
@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "nome", nullable = false)
    private String nome;

    @Column(name = "identificador_de_acesso", nullable = false)
    private String identificadorDeAcesso;

    @Column(name = "situacao_de_acesso")
    private String situacaoDeAcesso;

    protected Usuario() {
        // exigido pelo JPA
    }

    public Usuario(String nome, String identificadorDeAcesso, String situacaoDeAcesso) {
        this.nome = nome;
        this.identificadorDeAcesso = identificadorDeAcesso;
        this.situacaoDeAcesso = situacaoDeAcesso;
    }

    public UUID getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getIdentificadorDeAcesso() {
        return identificadorDeAcesso;
    }

    public String getSituacaoDeAcesso() {
        return situacaoDeAcesso;
    }

    public void setSituacaoDeAcesso(String situacaoDeAcesso) {
        this.situacaoDeAcesso = situacaoDeAcesso;
    }
}
