package br.com.joaocerem.hvieira_financeiro.domain.liquidacaofinanceira;

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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * LIQUIDAÇÃO_FINANCEIRA — núcleo com invariante, **totalmente imutável desde a criação** (D12,
 * decisão #33). Ver `docs/domain-model/10-liquidacao-financeira.md`. Por isso, sem nenhum setter —
 * diferente de todas as entidades anteriores, aqui nenhum campo é editável em nenhuma circunstância.
 */
@Entity
@Table(name = "liquidacoes_financeiras")
public class LiquidacaoFinanceira {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tipo", nullable = false)
    private String tipo;

    @Column(name = "data_efetiva", nullable = false)
    private LocalDate dataEfetiva;

    @Column(name = "valor", nullable = false)
    private BigDecimal valor;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "conta_bancaria_id", nullable = false)
    private ContaBancaria contaBancaria;

    protected LiquidacaoFinanceira() {
        // exigido pelo JPA
    }

    public LiquidacaoFinanceira(String tipo, LocalDate dataEfetiva, BigDecimal valor, ContaBancaria contaBancaria) {
        this.tipo = tipo;
        this.dataEfetiva = dataEfetiva;
        this.valor = valor;
        this.contaBancaria = contaBancaria;
    }

    public UUID getId() {
        return id;
    }

    public String getTipo() {
        return tipo;
    }

    public LocalDate getDataEfetiva() {
        return dataEfetiva;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public ContaBancaria getContaBancaria() {
        return contaBancaria;
    }
}
