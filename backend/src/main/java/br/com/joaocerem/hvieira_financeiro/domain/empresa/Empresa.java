package br.com.joaocerem.hvieira_financeiro.domain.empresa;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

/**
 * EMPRESA — cadastro-raiz (perfil "cadastro simples", `arquitetura-tecnica.md` Seção 4).
 * Ver `docs/domain-model/01-empresa.md`. Sem regra de negócio própria além da obrigatoriedade de `nome`.
 */
@Entity
@Table(name = "empresas")
public class Empresa {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "nome", nullable = false)
    private String nome;

    protected Empresa() {
        // exigido pelo JPA
    }

    public Empresa(String nome) {
        this.nome = nome;
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
}
