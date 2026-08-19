package br.com.joaocerem.hvieira_financeiro.domain.contratofinanceiro;

import br.com.joaocerem.hvieira_financeiro.domain.contabancaria.ContaBancaria;
import br.com.joaocerem.hvieira_financeiro.domain.empresa.Empresa;
import br.com.joaocerem.hvieira_financeiro.domain.fornecedor.Fornecedor;
import br.com.joaocerem.hvieira_financeiro.domain.frota.Veiculo;
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
 * CONTRATO_FINANCEIRO — Financiamento ou Consórcio (entidade única, `tipo` diferencia). Ver
 * `docs/domain-model/20-contrato-financeiro.md`.
 *
 * `tipo`, `empresa`, `contaBancaria`, `valorContratado`, `numeroParcelas` e
 * `dataVencimentoPrimeiraParcela` não têm setter: `tipo` é imutável por inferência estrutural;
 * `empresa`/`contaBancaria` têm mutabilidade "não definida" (mesmo padrão conservador já usado em
 * módulos anteriores); `valorContratado`/`numeroParcelas`/`dataVencimentoPrimeiraParcela` determinam
 * as Parcelas já geradas na criação (decisão #40) — mesmo padrão de `CompraCartao.valor`/`numeroParcelas`.
 *
 * `fornecedor` (decisão #40, substitui `instituição`) é mutável ("correção de cadastro", mesma
 * semântica do campo que substitui). `taxa`/`grupoCota` sem setter — mutabilidade "não definida" no
 * documento de domínio, tratada aqui, de forma conservadora, como imutável (determinam a natureza do
 * Contrato junto com `tipo`). `contemplado` só muda via {@link #contemplar()}; `veículo` é mutável.
 */
@Entity
@Table(name = "contratos_financeiros")
public class ContratoFinanceiro {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tipo", nullable = false)
    private String tipo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "conta_bancaria_id", nullable = false)
    private ContaBancaria contaBancaria;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fornecedor_id", nullable = false)
    private Fornecedor fornecedor;

    @Column(name = "valor_contratado", nullable = false)
    private BigDecimal valorContratado;

    @Column(name = "numero_parcelas", nullable = false)
    private Integer numeroParcelas;

    @Column(name = "data_vencimento_primeira_parcela", nullable = false)
    private LocalDate dataVencimentoPrimeiraParcela;

    @Column(name = "taxa")
    private BigDecimal taxa;

    @Column(name = "grupo_cota")
    private String grupoCota;

    @Column(name = "contemplado")
    private Boolean contemplado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "veiculo_id")
    private Veiculo veiculo;

    protected ContratoFinanceiro() {
        // exigido pelo JPA
    }

    public ContratoFinanceiro(String tipo, Empresa empresa, ContaBancaria contaBancaria, Fornecedor fornecedor,
                               BigDecimal valorContratado, Integer numeroParcelas, LocalDate dataVencimentoPrimeiraParcela,
                               BigDecimal taxa, String grupoCota, Boolean contemplado, Veiculo veiculo) {
        this.tipo = tipo;
        this.empresa = empresa;
        this.contaBancaria = contaBancaria;
        this.fornecedor = fornecedor;
        this.valorContratado = valorContratado;
        this.numeroParcelas = numeroParcelas;
        this.dataVencimentoPrimeiraParcela = dataVencimentoPrimeiraParcela;
        this.taxa = taxa;
        this.grupoCota = grupoCota;
        this.contemplado = contemplado;
        this.veiculo = veiculo;
    }

    public UUID getId() {
        return id;
    }

    public String getTipo() {
        return tipo;
    }

    public Empresa getEmpresa() {
        return empresa;
    }

    public ContaBancaria getContaBancaria() {
        return contaBancaria;
    }

    public Fornecedor getFornecedor() {
        return fornecedor;
    }

    public void setFornecedor(Fornecedor fornecedor) {
        this.fornecedor = fornecedor;
    }

    public BigDecimal getValorContratado() {
        return valorContratado;
    }

    public Integer getNumeroParcelas() {
        return numeroParcelas;
    }

    public LocalDate getDataVencimentoPrimeiraParcela() {
        return dataVencimentoPrimeiraParcela;
    }

    public BigDecimal getTaxa() {
        return taxa;
    }

    public String getGrupoCota() {
        return grupoCota;
    }

    public Boolean getContemplado() {
        return contemplado;
    }

    public void contemplar() {
        this.contemplado = true;
    }

    public Veiculo getVeiculo() {
        return veiculo;
    }

    public void setVeiculo(Veiculo veiculo) {
        this.veiculo = veiculo;
    }
}
