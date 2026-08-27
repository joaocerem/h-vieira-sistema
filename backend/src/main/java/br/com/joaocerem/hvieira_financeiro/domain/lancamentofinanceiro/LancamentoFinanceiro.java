package br.com.joaocerem.hvieira_financeiro.domain.lancamentofinanceiro;

import br.com.joaocerem.hvieira_financeiro.domain.categoria.Categoria;
import br.com.joaocerem.hvieira_financeiro.domain.cliente.Cliente;
import br.com.joaocerem.hvieira_financeiro.domain.empresa.Empresa;
import br.com.joaocerem.hvieira_financeiro.domain.fornecedor.Fornecedor;
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
 * LANÇAMENTO_FINANCEIRO — núcleo com invariante (`arquitetura-tecnica.md` Seção 4). Entidade central
 * do sistema. Ver `docs/domain-model/09-lancamento-financeiro.md`.
 *
 * `obraId`/`veiculoId` são armazenados como UUID cru, sem associação JPA — mantido assim de propósito
 * (minimalidade de alteração; a FK física já garante integridade referencial). Existência e a regra de
 * exclusividade `obra` × `RATEIO_DESPESA` (Seção 3 do documento de domínio) são validadas em
 * `LancamentoFinanceiroService`, não aqui — achado da auditoria final da Fase 4: os módulos Obra/Frota
 * já existiam havia tempo quando esta nota ainda dizia o contrário; a lacuna foi fechada na camada de
 * aplicação, sem alterar o mapeamento desta entidade.
 *
 * `tipo` e `origem` não têm setter — imutáveis por inferência estrutural forte (Seção 2/5 do documento
 * de domínio). `origem` é sempre "Manual" nesta fase: os únicos outros valores possíveis (Cartão via
 * Parcela, Contrato Financeiro via Parcela, Ação de IA Confirmada) dependem de módulos não implementados
 * (Compra Cartão/Parcela, Contrato Financeiro/Parcela, Ação Proposta IA).
 *
 * `status_financeiro` não é campo desta entidade — é sempre calculado a partir de
 * `APLICAÇÃO_DE_LIQUIDAÇÃO` (ver {@link br.com.joaocerem.hvieira_financeiro.application.lancamentofinanceiro.LancamentoFinanceiroService}).
 */
@Entity
@Table(name = "lancamentos_financeiros")
public class LancamentoFinanceiro {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tipo", nullable = false)
    private String tipo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fornecedor_id")
    private Fornecedor fornecedor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    @Column(name = "obra_id")
    private UUID obraId;

    @Column(name = "veiculo_id")
    private UUID veiculoId;

    @Column(name = "valor", nullable = false)
    private BigDecimal valor;

    @Column(name = "data_competencia", nullable = false)
    private LocalDate dataCompetencia;

    @Column(name = "vencimento", nullable = false)
    private LocalDate vencimento;

    @Column(name = "situacao_administrativa", nullable = false)
    private String situacaoAdministrativa;

    @Column(name = "origem", nullable = false)
    private String origem;

    /**
     * Campos livres, opcionais — decisão de negócio: Lançamento passa a registrar descrição
     * (texto livre) e documento/NF (número do documento fiscal ou comprovante), sem regra de
     * negócio associada a eles além da própria existência.
     */
    @Column(name = "descricao")
    private String descricao;

    @Column(name = "documento")
    private String documento;

    protected LancamentoFinanceiro() {
        // exigido pelo JPA
    }

    public LancamentoFinanceiro(String tipo, Empresa empresa, Categoria categoria, Fornecedor fornecedor,
                                 Cliente cliente, UUID obraId, UUID veiculoId, BigDecimal valor,
                                 LocalDate dataCompetencia, LocalDate vencimento, String origem,
                                 String descricao, String documento) {
        this.tipo = tipo;
        this.empresa = empresa;
        this.categoria = categoria;
        this.fornecedor = fornecedor;
        this.cliente = cliente;
        this.obraId = obraId;
        this.veiculoId = veiculoId;
        this.valor = valor;
        this.dataCompetencia = dataCompetencia;
        this.vencimento = vencimento;
        this.situacaoAdministrativa = "Ativo";
        this.origem = origem;
        this.descricao = descricao;
        this.documento = documento;
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

    public void setEmpresa(Empresa empresa) {
        this.empresa = empresa;
    }

    public Categoria getCategoria() {
        return categoria;
    }

    public void setCategoria(Categoria categoria) {
        this.categoria = categoria;
    }

    public Fornecedor getFornecedor() {
        return fornecedor;
    }

    public void setFornecedor(Fornecedor fornecedor) {
        this.fornecedor = fornecedor;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public UUID getObraId() {
        return obraId;
    }

    public void setObraId(UUID obraId) {
        this.obraId = obraId;
    }

    public UUID getVeiculoId() {
        return veiculoId;
    }

    public void setVeiculoId(UUID veiculoId) {
        this.veiculoId = veiculoId;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public LocalDate getDataCompetencia() {
        return dataCompetencia;
    }

    public void setDataCompetencia(LocalDate dataCompetencia) {
        this.dataCompetencia = dataCompetencia;
    }

    public LocalDate getVencimento() {
        return vencimento;
    }

    public void setVencimento(LocalDate vencimento) {
        this.vencimento = vencimento;
    }

    public String getSituacaoAdministrativa() {
        return situacaoAdministrativa;
    }

    public void cancelar() {
        this.situacaoAdministrativa = "Cancelado";
    }

    /**
     * Usado por `LiquidacaoFinanceiraService`, `RateioDespesaService` e `AjusteFinanceiroService`
     * (achado A1 da auditoria arquitetural) — um Lançamento Cancelado significa que ele foi invalidado
     * antes de produzir qualquer efeito financeiro (`09-lancamento-financeiro.md`, Seção 4); nenhum
     * novo efeito (Aplicação de Liquidação, Rateio, Ajuste Financeiro) pode ser vinculado a ele depois.
     */
    public boolean estaCancelado() {
        return "Cancelado".equals(situacaoAdministrativa);
    }

    public String getOrigem() {
        return origem;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getDocumento() {
        return documento;
    }

    public void setDocumento(String documento) {
        this.documento = documento;
    }
}
