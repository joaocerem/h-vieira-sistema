package br.com.joaocerem.hvieira_financeiro.domain.aplicacaodeliquidacao;

import br.com.joaocerem.hvieira_financeiro.domain.lancamentofinanceiro.LancamentoFinanceiro;
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
 * APLICAÇÃO_DE_LIQUIDAÇÃO — materialização do N:N entre Lançamento e Liquidação. Ver
 * `docs/domain-model/11-aplicacao-de-liquidacao.md`.
 *
 * Imutável desde a criação (Seção 4 do documento de domínio) — sem setters. Nunca criada isoladamente
 * por digitação direta do usuário: nasce só como efeito colateral do registro de uma Liquidação (ver
 * {@link br.com.joaocerem.hvieira_financeiro.application.liquidacaofinanceira.LiquidacaoFinanceiraService})
 * — por isso esta entidade não tem Controller HTTP próprio de escrita.
 */
@Entity
@Table(name = "aplicacoes_de_liquidacao")
public class AplicacaoDeLiquidacao {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lancamento_financeiro_id", nullable = false)
    private LancamentoFinanceiro lancamentoFinanceiro;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "liquidacao_financeira_id", nullable = false)
    private LiquidacaoFinanceira liquidacaoFinanceira;

    @Column(name = "valor_aplicado", nullable = false)
    private BigDecimal valorAplicado;

    protected AplicacaoDeLiquidacao() {
        // exigido pelo JPA
    }

    public AplicacaoDeLiquidacao(LancamentoFinanceiro lancamentoFinanceiro, LiquidacaoFinanceira liquidacaoFinanceira, BigDecimal valorAplicado) {
        this.lancamentoFinanceiro = lancamentoFinanceiro;
        this.liquidacaoFinanceira = liquidacaoFinanceira;
        this.valorAplicado = valorAplicado;
    }

    public UUID getId() {
        return id;
    }

    public LancamentoFinanceiro getLancamentoFinanceiro() {
        return lancamentoFinanceiro;
    }

    public LiquidacaoFinanceira getLiquidacaoFinanceira() {
        return liquidacaoFinanceira;
    }

    public BigDecimal getValorAplicado() {
        return valorAplicado;
    }
}
