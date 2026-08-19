package br.com.joaocerem.hvieira_financeiro.domain.conciliacaobancaria;

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
 * MOVIMENTAÇÃO_BANCÁRIA — fato puro do extrato bancário. Ver `docs/domain-model/12-movimentacao-bancaria.md`.
 *
 * Campos factuais (`contaBancaria`, `data`, `descricao`, `valor`) sem setter — "fatos do extrato", sem
 * previsão de edição no conceitual (Seção 1/5 do documento de domínio). `classificacao` é o único campo
 * regularmente alterável, por Usuário ou por Sugestão de IA confirmada (IA fora do escopo desta fase).
 *
 * `valor` guarda o sinal do extrato (entrada positiva / saída negativa) — convenção técnica de
 * representação que o conceitual deixa deliberadamente fora de escopo (Seção 2 do documento de domínio).
 *
 * Sem `criar` livre por usuário: só nasce por importação de extrato ou geração automática ao registrar
 * uma Liquidação Financeira — ver `MovimentacaoBancariaService`.
 */
@Entity
@Table(name = "movimentacoes_bancarias")
public class MovimentacaoBancaria {

    public static final String NAO_CLASSIFICADA = "Não Classificada";
    public static final String TRANSFERENCIA_INTERNA = "Transferência Interna";

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "conta_bancaria_id", nullable = false)
    private ContaBancaria contaBancaria;

    @Column(name = "data", nullable = false)
    private LocalDate data;

    @Column(name = "descricao", nullable = false)
    private String descricao;

    @Column(name = "valor", nullable = false)
    private BigDecimal valor;

    @Column(name = "classificacao", nullable = false)
    private String classificacao;

    protected MovimentacaoBancaria() {
        // exigido pelo JPA
    }

    public MovimentacaoBancaria(ContaBancaria contaBancaria, LocalDate data, String descricao, BigDecimal valor) {
        this.contaBancaria = contaBancaria;
        this.data = data;
        this.descricao = descricao;
        this.valor = valor;
        this.classificacao = NAO_CLASSIFICADA;
    }

    public UUID getId() {
        return id;
    }

    public ContaBancaria getContaBancaria() {
        return contaBancaria;
    }

    public LocalDate getData() {
        return data;
    }

    public String getDescricao() {
        return descricao;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public String getClassificacao() {
        return classificacao;
    }

    /**
     * Único campo regularmente alterável (Seção 1 do documento de domínio). A restrição de que
     * `Transferência Interna` só pode ser atribuída via `TransferenciaInternaService` (nunca por esta
     * via genérica) é aplicada em `MovimentacaoBancariaService`, não aqui — a entidade só representa o
     * estado, não a regra de quem pode chegar a ele.
     */
    public void reclassificar(String novaClassificacao) {
        this.classificacao = novaClassificacao;
    }
}
