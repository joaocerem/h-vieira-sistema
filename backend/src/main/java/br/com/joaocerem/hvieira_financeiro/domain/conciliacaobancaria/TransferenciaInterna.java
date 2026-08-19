package br.com.joaocerem.hvieira_financeiro.domain.conciliacaobancaria;

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
 * TRANSFERÊNCIA_INTERNA — vincula duas Movimentações Bancárias que são, juntas, uma transferência entre
 * contas próprias do grupo. Ver `docs/domain-model/13-transferencia-interna.md`.
 *
 * Sem setters: "Regras de alteração: não definidas" no documento de domínio (Seção 4) — tratada com a
 * mesma cautela já aplicada a `LiquidacaoFinanceira`/`AplicacaoDeLiquidacao` (princípio 2: não expor um
 * caminho de edição que não tem confirmação de negócio).
 */
@Entity
@Table(name = "transferencias_internas")
public class TransferenciaInterna {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "movimentacao_origem_id", nullable = false)
    private MovimentacaoBancaria movimentacaoOrigem;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "movimentacao_destino_id", nullable = false)
    private MovimentacaoBancaria movimentacaoDestino;

    @Column(name = "valor", nullable = false)
    private BigDecimal valor;

    @Column(name = "data", nullable = false)
    private LocalDate data;

    protected TransferenciaInterna() {
        // exigido pelo JPA
    }

    public TransferenciaInterna(MovimentacaoBancaria movimentacaoOrigem, MovimentacaoBancaria movimentacaoDestino,
                                 BigDecimal valor, LocalDate data) {
        this.movimentacaoOrigem = movimentacaoOrigem;
        this.movimentacaoDestino = movimentacaoDestino;
        this.valor = valor;
        this.data = data;
    }

    public UUID getId() {
        return id;
    }

    public MovimentacaoBancaria getMovimentacaoOrigem() {
        return movimentacaoOrigem;
    }

    public MovimentacaoBancaria getMovimentacaoDestino() {
        return movimentacaoDestino;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public LocalDate getData() {
        return data;
    }
}
