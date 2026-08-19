package br.com.joaocerem.hvieira_financeiro.domain.rateio;

import br.com.joaocerem.hvieira_financeiro.domain.lancamentofinanceiro.LancamentoFinanceiro;
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

import java.math.BigDecimal;
import java.util.UUID;

/**
 * RATEIO_DESPESA — divisão manual de uma Despesa entre várias Obras. Ver
 * `docs/domain-model/16-rateio-despesa.md`.
 *
 * `lancamentoFinanceiro` e `obra` não têm setter: o documento marca o vínculo com o Lançamento como
 * "não deveria mudar (inferência)", e a mutabilidade de `obra` como "não definido" — tratados aqui,
 * de forma conservadora, como imutáveis após a criação (mesmo padrão já usado para referências
 * estruturais ambíguas em módulos anteriores). `valorRateado` e `criterioInformado` são livremente
 * editáveis, inclusive após Aplicação de Liquidação já existente (D3/D8, decisões #25/#29).
 */
@Entity
@Table(name = "rateios_despesa")
public class RateioDespesa {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lancamento_financeiro_id", nullable = false)
    private LancamentoFinanceiro lancamentoFinanceiro;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "obra_id", nullable = false)
    private Obra obra;

    @Column(name = "valor_rateado", nullable = false)
    private BigDecimal valorRateado;

    @Column(name = "criterio_informado")
    private String criterioInformado;

    protected RateioDespesa() {
        // exigido pelo JPA
    }

    public RateioDespesa(LancamentoFinanceiro lancamentoFinanceiro, Obra obra, BigDecimal valorRateado, String criterioInformado) {
        this.lancamentoFinanceiro = lancamentoFinanceiro;
        this.obra = obra;
        this.valorRateado = valorRateado;
        this.criterioInformado = criterioInformado;
    }

    public UUID getId() {
        return id;
    }

    public LancamentoFinanceiro getLancamentoFinanceiro() {
        return lancamentoFinanceiro;
    }

    public Obra getObra() {
        return obra;
    }

    public BigDecimal getValorRateado() {
        return valorRateado;
    }

    public void setValorRateado(BigDecimal valorRateado) {
        this.valorRateado = valorRateado;
    }

    public String getCriterioInformado() {
        return criterioInformado;
    }

    public void setCriterioInformado(String criterioInformado) {
        this.criterioInformado = criterioInformado;
    }
}
