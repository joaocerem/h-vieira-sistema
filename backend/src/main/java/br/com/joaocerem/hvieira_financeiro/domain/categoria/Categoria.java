package br.com.joaocerem.hvieira_financeiro.domain.categoria;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

/**
 * CATEGORIA — cadastro simples (`arquitetura-tecnica.md` Seção 4, reclassificada após Decisão 5).
 * Ver `docs/domain-model/06-categoria.md`. `tipo` é texto livre — sem enumeração fechada confirmada
 * no conceitual, portanto sem CHECK no banco e sem validação de valores permitidos aqui.
 */
@Entity
@Table(name = "categorias")
public class Categoria {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "nome", nullable = false)
    private String nome;

    @Column(name = "tipo", nullable = false)
    private String tipo;

    protected Categoria() {
        // exigido pelo JPA
    }

    public Categoria(String nome, String tipo) {
        this.nome = nome;
        this.tipo = tipo;
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

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }
}
