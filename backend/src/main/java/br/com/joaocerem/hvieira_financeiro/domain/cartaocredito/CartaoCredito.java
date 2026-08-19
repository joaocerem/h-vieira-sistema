package br.com.joaocerem.hvieira_financeiro.domain.cartaocredito;

import br.com.joaocerem.hvieira_financeiro.domain.contabancaria.ContaBancaria;
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
 * CARTÃO_CRÉDITO — cadastro simples. Ver `docs/domain-model/17-cartao-credito.md`.
 *
 * `contaBancaria` não tem setter — mesma justificativa de {@link ContaBancaria#getEmpresa()}
 * (reatribuição pós-criação marcada como "inferência: improvável" no documento de domínio).
 *
 * `diaFechamento`/`diaVencimento` são inteiros sem validação de faixa (1-31): o documento de domínio
 * marca essa faixa explicitamente como "inferência de bom senso, não confirmada textualmente" — e o
 * schema físico (`docs/modelagem-fisica/11-cartao-credito.md`) deliberadamente não tem CHECK por esse
 * motivo. Não adiciono validação de faixa aqui pela mesma razão (evita inventar regra de negócio).
 */
@Entity
@Table(name = "cartoes_credito")
public class CartaoCredito {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "conta_bancaria_id", nullable = false)
    private ContaBancaria contaBancaria;

    @Column(name = "banco", nullable = false)
    private String banco;

    @Column(name = "apelido", nullable = false)
    private String apelido;

    @Column(name = "dia_fechamento", nullable = false)
    private Integer diaFechamento;

    @Column(name = "dia_vencimento", nullable = false)
    private Integer diaVencimento;

    protected CartaoCredito() {
        // exigido pelo JPA
    }

    public CartaoCredito(ContaBancaria contaBancaria, String banco, String apelido, Integer diaFechamento, Integer diaVencimento) {
        this.contaBancaria = contaBancaria;
        this.banco = banco;
        this.apelido = apelido;
        this.diaFechamento = diaFechamento;
        this.diaVencimento = diaVencimento;
    }

    public UUID getId() {
        return id;
    }

    public ContaBancaria getContaBancaria() {
        return contaBancaria;
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

    public Integer getDiaFechamento() {
        return diaFechamento;
    }

    public void setDiaFechamento(Integer diaFechamento) {
        this.diaFechamento = diaFechamento;
    }

    public Integer getDiaVencimento() {
        return diaVencimento;
    }

    public void setDiaVencimento(Integer diaVencimento) {
        this.diaVencimento = diaVencimento;
    }
}
