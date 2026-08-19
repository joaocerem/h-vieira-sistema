package br.com.joaocerem.hvieira_financeiro.domain.parcela;

import br.com.joaocerem.hvieira_financeiro.domain.compracartao.CompraCartao;
import br.com.joaocerem.hvieira_financeiro.domain.contratofinanceiro.ContratoFinanceiro;
import br.com.joaocerem.hvieira_financeiro.domain.fatura.Fatura;
import br.com.joaocerem.hvieira_financeiro.domain.lancamentofinanceiro.LancamentoFinanceiro;
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
 * PARCELA — fração de um parcelamento, reutilizada por Compra de Cartão e Contrato Financeiro. Ver
 * `docs/domain-model/21-parcela.md`.
 *
 * `compraCartao` e `contratoFinanceiro` são mutuamente exclusivos, conforme `origem` — exatamente um
 * dos dois construtores é usado por vez, mantendo o outro `null` (mesma regra de exclusividade já
 * aplicada em `LANÇAMENTO_FINANCEIRO.fornecedor`/`cliente`).
 *
 * Todos os campos são gerados/atribuídos exclusivamente pelo sistema (Seção 2/4 do documento de
 * domínio: "Sistema" em toda coluna "Quem pode alterar") — sem nenhum endpoint de escrita direta
 * exposto ao usuário além dos dois gatilhos explícitos: atribuição de Fatura (no fechamento do ciclo,
 * só aplicável quando `origem` = Compra Cartão) e geração do Lançamento (ao vencer) — ambos, por
 * permanência documentada ("o vínculo é permanente"), só podem ser definidos uma vez.
 */
@Entity
@Table(name = "parcelas")
public class Parcela {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "origem", nullable = false)
    private String origem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "compra_cartao_id")
    private CompraCartao compraCartao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contrato_financeiro_id")
    private ContratoFinanceiro contratoFinanceiro;

    @Column(name = "numero", nullable = false)
    private Integer numero;

    @Column(name = "total", nullable = false)
    private Integer total;

    @Column(name = "valor", nullable = false)
    private BigDecimal valor;

    @Column(name = "vencimento", nullable = false)
    private LocalDate vencimento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fatura_id")
    private Fatura fatura;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lancamento_financeiro_id")
    private LancamentoFinanceiro lancamentoFinanceiro;

    protected Parcela() {
        // exigido pelo JPA
    }

    public Parcela(String origem, CompraCartao compraCartao, Integer numero, Integer total,
                    BigDecimal valor, LocalDate vencimento) {
        this.origem = origem;
        this.compraCartao = compraCartao;
        this.numero = numero;
        this.total = total;
        this.valor = valor;
        this.vencimento = vencimento;
    }

    public Parcela(String origem, ContratoFinanceiro contratoFinanceiro, Integer numero, Integer total,
                    BigDecimal valor, LocalDate vencimento) {
        this.origem = origem;
        this.contratoFinanceiro = contratoFinanceiro;
        this.numero = numero;
        this.total = total;
        this.valor = valor;
        this.vencimento = vencimento;
    }

    public UUID getId() {
        return id;
    }

    public String getOrigem() {
        return origem;
    }

    public CompraCartao getCompraCartao() {
        return compraCartao;
    }

    public ContratoFinanceiro getContratoFinanceiro() {
        return contratoFinanceiro;
    }

    public Integer getNumero() {
        return numero;
    }

    public Integer getTotal() {
        return total;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public LocalDate getVencimento() {
        return vencimento;
    }

    public Fatura getFatura() {
        return fatura;
    }

    public void atribuirFatura(Fatura fatura) {
        this.fatura = fatura;
    }

    public LancamentoFinanceiro getLancamentoFinanceiro() {
        return lancamentoFinanceiro;
    }

    public void vincularLancamento(LancamentoFinanceiro lancamentoFinanceiro) {
        this.lancamentoFinanceiro = lancamentoFinanceiro;
    }
}
