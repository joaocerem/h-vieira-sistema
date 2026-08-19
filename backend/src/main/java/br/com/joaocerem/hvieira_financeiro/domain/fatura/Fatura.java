package br.com.joaocerem.hvieira_financeiro.domain.fatura;

import br.com.joaocerem.hvieira_financeiro.domain.cartaocredito.CartaoCredito;
import br.com.joaocerem.hvieira_financeiro.domain.liquidacaofinanceira.LiquidacaoFinanceira;
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
import java.util.UUID;

/**
 * FATURA — agrupador de cobrança de um ciclo do cartão. Ver `docs/domain-model/19-fatura.md`.
 *
 * Só existe a partir do fechamento do ciclo — sua própria criação já representa o fechamento
 * (`cartao`, `ciclo`, `valorTotalCalculado`, `valorCobrado` congelados desde então, Seção 2/4 do
 * documento de domínio). Por isso, sem setter para nenhum desses quatro campos.
 *
 * `liquidacaoFinanceira` é o único campo preenchido depois da criação — no momento do pagamento da
 * Fatura (Seção 3: "Fatura → Liquidação Financeira"). Ver
 * {@link br.com.joaocerem.hvieira_financeiro.application.fatura.FaturaService#pagar}.
 */
@Entity
@Table(name = "faturas")
public class Fatura {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cartao_id", nullable = false)
    private CartaoCredito cartao;

    @Column(name = "ciclo", nullable = false)
    private String ciclo;

    @Column(name = "valor_total_calculado", nullable = false)
    private BigDecimal valorTotalCalculado;

    @Column(name = "valor_cobrado", nullable = false)
    private BigDecimal valorCobrado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "liquidacao_financeira_id")
    private LiquidacaoFinanceira liquidacaoFinanceira;

    protected Fatura() {
        // exigido pelo JPA
    }

    public Fatura(CartaoCredito cartao, String ciclo, BigDecimal valorTotalCalculado, BigDecimal valorCobrado) {
        this.cartao = cartao;
        this.ciclo = ciclo;
        this.valorTotalCalculado = valorTotalCalculado;
        this.valorCobrado = valorCobrado;
    }

    public UUID getId() {
        return id;
    }

    public CartaoCredito getCartao() {
        return cartao;
    }

    public String getCiclo() {
        return ciclo;
    }

    public BigDecimal getValorTotalCalculado() {
        return valorTotalCalculado;
    }

    public BigDecimal getValorCobrado() {
        return valorCobrado;
    }

    public LiquidacaoFinanceira getLiquidacaoFinanceira() {
        return liquidacaoFinanceira;
    }

    public void marcarComoPaga(LiquidacaoFinanceira liquidacaoFinanceira) {
        this.liquidacaoFinanceira = liquidacaoFinanceira;
    }
}
