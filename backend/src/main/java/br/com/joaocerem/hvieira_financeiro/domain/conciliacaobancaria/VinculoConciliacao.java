package br.com.joaocerem.hvieira_financeiro.domain.conciliacaobancaria;

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

import java.util.UUID;

/**
 * VÍNCULO_CONCILIAÇÃO — estado da conferência entre uma Movimentação Bancária e uma Liquidação
 * Financeira. Ver `docs/domain-model/14-vinculo-conciliacao.md`.
 *
 * `movimentacaoBancaria` sem setter — imutável (a referência à Movimentação não muda, Seção 5 do
 * documento de domínio). `liquidacaoFinanceira`/`estadoConciliacao` evoluem juntos através dos métodos
 * de transição abaixo — nunca por setter solto, para preservar a coerência entre os dois campos que o
 * schema físico também impõe (`ck_vinculos_conciliacao_liquidacao_coerente_com_estado`).
 *
 * As regras de "quando cada transição é permitida" (ex. só confirmar um Vínculo Sugerido, divergência de
 * valor nunca confirmada automaticamente) ficam em `VinculoConciliacaoService` — a entidade só representa
 * o estado resultante, mesmo padrão já usado em `LancamentoFinanceiro`/`MovimentacaoBancaria`.
 */
@Entity
@Table(name = "vinculos_conciliacao")
public class VinculoConciliacao {

    public static final String NAO_VINCULADO = "Não Vinculado";
    public static final String SUGERIDO = "Sugerido";
    public static final String CONFIRMADO = "Confirmado";
    public static final String DIVERGENTE = "Divergente";
    public static final String SEM_CORRESPONDENCIA = "Sem Correspondência";

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "movimentacao_bancaria_id", nullable = false, unique = true)
    private MovimentacaoBancaria movimentacaoBancaria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "liquidacao_financeira_id")
    private LiquidacaoFinanceira liquidacaoFinanceira;

    @Column(name = "estado_conciliacao", nullable = false)
    private String estadoConciliacao;

    protected VinculoConciliacao() {
        // exigido pelo JPA
    }

    /**
     * Todo Vínculo nasce assim — "gerada automaticamente (regra determinística) para toda Movimentação
     * Bancária que existir" (Seção 4 do documento de domínio), sempre em `Não Vinculado`, sem Liquidação.
     */
    public VinculoConciliacao(MovimentacaoBancaria movimentacaoBancaria) {
        this.movimentacaoBancaria = movimentacaoBancaria;
        this.estadoConciliacao = NAO_VINCULADO;
    }

    public UUID getId() {
        return id;
    }

    public MovimentacaoBancaria getMovimentacaoBancaria() {
        return movimentacaoBancaria;
    }

    public LiquidacaoFinanceira getLiquidacaoFinanceira() {
        return liquidacaoFinanceira;
    }

    public String getEstadoConciliacao() {
        return estadoConciliacao;
    }

    /** Correspondência determinística encontrada pela sugestão automática — ainda pendente de revisão humana. */
    public void sugerir(LiquidacaoFinanceira liquidacao) {
        this.liquidacaoFinanceira = liquidacao;
        this.estadoConciliacao = SUGERIDO;
    }

    /** Correspondência aceita — valores batem, revisão concluída. */
    public void confirmar() {
        this.estadoConciliacao = CONFIRMADO;
    }

    /**
     * Correspondência aceita diretamente, sem passar por `Sugerido` — usada quando a certeza da
     * correspondência já é conhecida no momento da criação (Movimentação gerada a partir de uma
     * Liquidação, `MovimentacaoBancariaService#gerarAPartirDeLiquidacao`) ou por vínculo manual do
     * usuário com valores coincidentes (`VinculoConciliacaoService#vincularManualmente`).
     */
    public void confirmarDiretamente(LiquidacaoFinanceira liquidacao) {
        this.liquidacaoFinanceira = liquidacao;
        this.estadoConciliacao = CONFIRMADO;
    }

    /**
     * Divergência de valor — "nunca é conciliada automaticamente — sempre fica para revisão humana"
     * (Seção 2 do documento de domínio). A Liquidação permanece vinculada (é a candidata divergente),
     * só o estado muda.
     */
    public void marcarDivergente() {
        this.estadoConciliacao = DIVERGENTE;
    }

    /** Sugestão automática não encontrou nenhuma Liquidação candidata dentro da tolerância configurada. */
    public void marcarSemCorrespondencia() {
        this.liquidacaoFinanceira = null;
        this.estadoConciliacao = SEM_CORRESPONDENCIA;
    }
}
