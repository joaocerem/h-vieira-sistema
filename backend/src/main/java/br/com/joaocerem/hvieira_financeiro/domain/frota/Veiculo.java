package br.com.joaocerem.hvieira_financeiro.domain.frota;

import br.com.joaocerem.hvieira_financeiro.domain.empresa.Empresa;
import br.com.joaocerem.hvieira_financeiro.domain.obra.Obra;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.util.UUID;

/**
 * VEÍCULO — cadastro simples com uma referência operacional (`obraAtual`). Ver
 * `docs/domain-model/07-veiculo.md`.
 *
 * `empresa` não tem setter — mesmo padrão de `ContaBancaria.empresa` (reatribuição "não definida" no
 * documento de domínio). `obraAtual` tem setter: o documento confirma explicitamente que é editável "a
 * qualquer momento, sem limite de trocas" (D4, decisão #26) — inclusive para `null` (desalocação).
 */
@Entity
@Table(name = "veiculos")
public class Veiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @Column(name = "nome_identificacao", nullable = false)
    private String nomeIdentificacao;

    @Column(name = "tipo", nullable = false)
    private String tipo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "obra_atual_id")
    private Obra obraAtual;

    protected Veiculo() {
        // exigido pelo JPA
    }

    public Veiculo(Empresa empresa, String nomeIdentificacao, String tipo, Obra obraAtual) {
        this.empresa = empresa;
        this.nomeIdentificacao = nomeIdentificacao;
        this.tipo = tipo;
        this.obraAtual = obraAtual;
    }

    public UUID getId() {
        return id;
    }

    public Empresa getEmpresa() {
        return empresa;
    }

    public String getNomeIdentificacao() {
        return nomeIdentificacao;
    }

    public void setNomeIdentificacao(String nomeIdentificacao) {
        this.nomeIdentificacao = nomeIdentificacao;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public Obra getObraAtual() {
        return obraAtual;
    }

    public void setObraAtual(Obra obraAtual) {
        this.obraAtual = obraAtual;
    }
}
