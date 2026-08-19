package br.com.joaocerem.hvieira_financeiro.domain.contabancaria;

import br.com.joaocerem.hvieira_financeiro.domain.empresa.Empresa;
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
 * CONTA_BANCÁRIA — cadastro simples (`arquitetura-tecnica.md` Seção 4). Ver `docs/domain-model/08-conta-bancaria.md`.
 * Sem campo de saldo (explicitamente fora do modelo — sempre calculado a partir de Movimentação Bancária).
 *
 * `empresa` não tem setter: o documento de domínio marca a reatribuição de Empresa após a criação como
 * "não definido... inferência: improvável" — não exponho um caminho de atualização até essa decisão existir.
 */
@Entity
@Table(name = "contas_bancarias")
public class ContaBancaria {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @Column(name = "banco", nullable = false)
    private String banco;

    @Column(name = "apelido", nullable = false)
    private String apelido;

    protected ContaBancaria() {
        // exigido pelo JPA
    }

    public ContaBancaria(Empresa empresa, String banco, String apelido) {
        this.empresa = empresa;
        this.banco = banco;
        this.apelido = apelido;
    }

    public UUID getId() {
        return id;
    }

    public Empresa getEmpresa() {
        return empresa;
    }

    public String getBanco() {
        return banco;
    }

    public void setBanco(String banco) {
        this.banco = banco;
    }

    public String getApelido() {
        return apelido;
    }

    public void setApelido(String apelido) {
        this.apelido = apelido;
    }
}
