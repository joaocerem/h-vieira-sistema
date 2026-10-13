package br.com.joaocerem.hvieira_financeiro.domain.conciliacaobancaria;

import br.com.joaocerem.hvieira_financeiro.domain.lancamentofinanceiro.LancamentoFinanceiro;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

/**
 * VÍNCULO_CONCILIAÇÃO — estado da conferência entre uma Movimentação Bancária e o(s) Lançamento(s)
 * Financeiro(s) que ela corresponde. Ver `docs/domain-model/14-vinculo-conciliacao.md`.
 *
 * `movimentacaoBancaria` sem setter — imutável (a referência à Movimentação não muda, Seção 5 do
 * documento de domínio). `lancamentosFinanceiros`/`estadoConciliacao` evoluem juntos através dos
 * métodos de transição abaixo — nunca por setter solto, para preservar a coerência entre os dois
 * campos.
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

    /**
     * N:N direto com Lançamento Financeiro (decisão de negócio, Sprint 3 — rodada de evolução
     * operacional) — uma única Movimentação Bancária pode cobrir vários Lançamentos ao mesmo tempo
     * (pagamento de fatura de cartão cobrindo várias Parcelas, vários títulos pagos num único
     * débito, etc.). Mapeado como `@ManyToMany` simples — a tabela de junção
     * (`vinculos_conciliacao_lancamentos`) é só detalhe de persistência, sem entidade de domínio
     * própria representando-a (decisão explícita do usuário: não recriar a complexidade de
     * `APLICAÇÃO_DE_LIQUIDAÇÃO` com outro nome). Sem coluna de valor por par — não existe cobertura
     * parcial.
     */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "vinculos_conciliacao_lancamentos",
            joinColumns = @JoinColumn(name = "vinculo_conciliacao_id"),
            inverseJoinColumns = @JoinColumn(name = "lancamento_financeiro_id"))
    private Set<LancamentoFinanceiro> lancamentosFinanceiros = new HashSet<>();

    @Column(name = "estado_conciliacao", nullable = false)
    private String estadoConciliacao;

    protected VinculoConciliacao() {
        // exigido pelo JPA
    }

    /**
     * Todo Vínculo nasce assim — "gerada automaticamente (regra determinística) para toda Movimentação
     * Bancária que existir" (Seção 4 do documento de domínio), sempre em `Não Vinculado`, sem Lançamento.
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

    public Set<LancamentoFinanceiro> getLancamentosFinanceiros() {
        return lancamentosFinanceiros;
    }

    /**
     * Substitui por completo o conjunto de Lançamentos ligados a este Vínculo — usado pela
     * sugestão automática (um só candidato) e pela vinculação manual (um ou mais Lançamentos
     * escolhidos pelo usuário). Não altera `estadoConciliacao` sozinho — quem chama também
     * chama uma das transições de estado abaixo, na mesma operação.
     */
    public void definirLancamentosFinanceiros(Set<LancamentoFinanceiro> lancamentos) {
        this.lancamentosFinanceiros.clear();
        this.lancamentosFinanceiros.addAll(lancamentos);
    }

    public String getEstadoConciliacao() {
        return estadoConciliacao;
    }

    /**
     * Correspondência determinística encontrada pela sugestão automática — ainda pendente de
     * revisão humana. A sugestão automática só propõe candidato único (nunca soma vários
     * Lançamentos sozinha) — por isso `lancamentos` normalmente tem exatamente um elemento aqui,
     * mesmo o método aceitando um conjunto.
     */
    public void sugerirLancamentos(Set<LancamentoFinanceiro> lancamentos) {
        definirLancamentosFinanceiros(lancamentos);
        this.estadoConciliacao = SUGERIDO;
    }

    /** Correspondência aceita — valores batem, revisão concluída. */
    public void confirmar() {
        this.estadoConciliacao = CONFIRMADO;
    }

    /**
     * Correspondência aceita diretamente, sem passar por `Sugerido` — usada pela vinculação
     * manual do usuário, com um ou mais Lançamentos escolhidos de uma vez, quando os valores já
     * batem (`VinculoConciliacaoService#vincularManualmente`).
     */
    public void confirmarDiretamenteComLancamentos(Set<LancamentoFinanceiro> lancamentos) {
        definirLancamentosFinanceiros(lancamentos);
        this.estadoConciliacao = CONFIRMADO;
    }

    /**
     * Divergência — "nunca é conciliada automaticamente — sempre fica para revisão humana"
     * (Seção 2 do documento de domínio). O(s) Lançamento(s) permanecem ligados (são os
     * candidatos divergentes), só o estado muda.
     */
    public void marcarDivergente() {
        this.estadoConciliacao = DIVERGENTE;
    }

    /** Sugestão automática não encontrou nenhum Lançamento candidato dentro da tolerância configurada. */
    public void marcarSemCorrespondencia() {
        this.lancamentosFinanceiros.clear();
        this.estadoConciliacao = SEM_CORRESPONDENCIA;
    }
}
