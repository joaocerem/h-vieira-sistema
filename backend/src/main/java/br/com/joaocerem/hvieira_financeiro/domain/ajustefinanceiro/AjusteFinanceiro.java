package br.com.joaocerem.hvieira_financeiro.domain.ajustefinanceiro;

import br.com.joaocerem.hvieira_financeiro.domain.lancamentofinanceiro.LancamentoFinanceiro;
import br.com.joaocerem.hvieira_financeiro.domain.usuario.Usuario;
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
 * AJUSTE_FINANCEIRO — vínculo formal entre um Lançamento original e um Lançamento de estorno,
 * reembolso, crédito ou ajuste. Ver `docs/domain-model/15-ajuste-financeiro.md`.
 *
 * **Totalmente imutável desde a criação** (D13, decisão #34) — sem nenhum setter, mesmo padrão de
 * {@link br.com.joaocerem.hvieira_financeiro.domain.liquidacaofinanceira.LiquidacaoFinanceira}. Mesmo
 * `usuário`, formalmente fora do escopo de D13, já era "Não" mutável na tabela de campos do documento
 * de domínio (Seção 2) — por isso também sem setter aqui.
 *
 * Regra 23 (respeitada por design): este é o único mecanismo oficial de correção pós-liquidação —
 * nunca reutilizado para outros fins (ex. Rateio, que tem seu próprio mecanismo, D8/decisão #29).
 */
@Entity
@Table(name = "ajustes_financeiros")
public class AjusteFinanceiro {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lancamento_original_id", nullable = false)
    private LancamentoFinanceiro lancamentoOriginal;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lancamento_ajuste_id", nullable = false)
    private LancamentoFinanceiro lancamentoAjuste;

    @Column(name = "tipo_ajuste", nullable = false)
    private String tipoAjuste;

    @Column(name = "valor", nullable = false)
    private BigDecimal valor;

    @Column(name = "data", nullable = false)
    private LocalDate data;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "observacao")
    private String observacao;

    protected AjusteFinanceiro() {
        // exigido pelo JPA
    }

    public AjusteFinanceiro(LancamentoFinanceiro lancamentoOriginal, LancamentoFinanceiro lancamentoAjuste,
                             String tipoAjuste, BigDecimal valor, LocalDate data, Usuario usuario, String observacao) {
        this.lancamentoOriginal = lancamentoOriginal;
        this.lancamentoAjuste = lancamentoAjuste;
        this.tipoAjuste = tipoAjuste;
        this.valor = valor;
        this.data = data;
        this.usuario = usuario;
        this.observacao = observacao;
    }

    public UUID getId() {
        return id;
    }

    public LancamentoFinanceiro getLancamentoOriginal() {
        return lancamentoOriginal;
    }

    public LancamentoFinanceiro getLancamentoAjuste() {
        return lancamentoAjuste;
    }

    public String getTipoAjuste() {
        return tipoAjuste;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public LocalDate getData() {
        return data;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public String getObservacao() {
        return observacao;
    }
}
