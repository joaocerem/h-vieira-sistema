package br.com.joaocerem.hvieira_financeiro.domain.compracartao;

import br.com.joaocerem.hvieira_financeiro.domain.cartaocredito.CartaoCredito;
import br.com.joaocerem.hvieira_financeiro.domain.categoria.Categoria;
import br.com.joaocerem.hvieira_financeiro.domain.fornecedor.Fornecedor;
import br.com.joaocerem.hvieira_financeiro.domain.frota.Veiculo;
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
import java.time.LocalDate;
import java.util.UUID;

/**
 * COMPRA_CARTÃO — cada compra feita no cartão. Ver `docs/domain-model/18-compra-cartao.md`.
 *
 * `cartao`, `valor` e `numeroParcelas` não têm setter: o documento marca `cartão` como "não —
 * inferência, o vínculo... é um fato", e `nº parcelas` como "Não — inferência, o parcelamento é
 * definido no momento da compra". `valor` é tratado aqui, de forma conservadora, como imutável —
 * ambos determinam as Parcelas já geradas no momento da criação (Seção 3: "Sistema, ao calcular o
 * parcelamento"), e o documento não define nenhum mecanismo de recálculo caso `valor`/`numeroParcelas`
 * mudassem depois (mesmo padrão de referência estrutural ambígua já usado em módulos anteriores).
 *
 * `categoria`/`obra`/`veículo` mutáveis, com propagação condicional para Lançamentos já gerados
 * (D5, decisão #27) — ver {@link br.com.joaocerem.hvieira_financeiro.application.compracartao.CompraCartaoService}.
 */
@Entity
@Table(name = "compras_cartao")
public class CompraCartao {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cartao_id", nullable = false)
    private CartaoCredito cartao;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fornecedor_id", nullable = false)
    private Fornecedor fornecedor;

    @Column(name = "valor", nullable = false)
    private BigDecimal valor;

    @Column(name = "data", nullable = false)
    private LocalDate data;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @Column(name = "classificacao", nullable = false)
    private String classificacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "obra_id")
    private Obra obra;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "veiculo_id")
    private Veiculo veiculo;

    @Column(name = "numero_parcelas", nullable = false)
    private Integer numeroParcelas;

    protected CompraCartao() {
        // exigido pelo JPA
    }

    public CompraCartao(CartaoCredito cartao, Fornecedor fornecedor, BigDecimal valor, LocalDate data,
                         Categoria categoria, String classificacao, Obra obra, Veiculo veiculo, Integer numeroParcelas) {
        this.cartao = cartao;
        this.fornecedor = fornecedor;
        this.valor = valor;
        this.data = data;
        this.categoria = categoria;
        this.classificacao = classificacao;
        this.obra = obra;
        this.veiculo = veiculo;
        this.numeroParcelas = numeroParcelas;
    }

    public UUID getId() {
        return id;
    }

    public CartaoCredito getCartao() {
        return cartao;
    }

    public Fornecedor getFornecedor() {
        return fornecedor;
    }

    public void setFornecedor(Fornecedor fornecedor) {
        this.fornecedor = fornecedor;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public LocalDate getData() {
        return data;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }

    public Categoria getCategoria() {
        return categoria;
    }

    public void setCategoria(Categoria categoria) {
        this.categoria = categoria;
    }

    public String getClassificacao() {
        return classificacao;
    }

    public void setClassificacao(String classificacao) {
        this.classificacao = classificacao;
    }

    public Obra getObra() {
        return obra;
    }

    public void setObra(Obra obra) {
        this.obra = obra;
    }

    public Veiculo getVeiculo() {
        return veiculo;
    }

    public void setVeiculo(Veiculo veiculo) {
        this.veiculo = veiculo;
    }

    public Integer getNumeroParcelas() {
        return numeroParcelas;
    }
}
