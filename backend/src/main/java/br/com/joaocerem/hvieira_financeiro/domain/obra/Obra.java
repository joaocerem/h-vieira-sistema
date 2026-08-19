package br.com.joaocerem.hvieira_financeiro.domain.obra;

import br.com.joaocerem.hvieira_financeiro.domain.cliente.Cliente;
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
 * OBRA — núcleo com invariante (regra de transição de `status`). Ver `docs/domain-model/03-obra.md`.
 *
 * `cliente` não tem setter: o documento de domínio marca a reatribuição de Cliente após a criação como
 * "inferência: improvável, mas não confirmado" — mesmo padrão já usado para `ContaBancaria.empresa` e
 * `CartaoCredito.contaBancaria`.
 *
 * `status` não tem setter direto — só via {@link #transicionarStatus(String)}, que valida as transições
 * confirmadas (Seção 4 do documento de domínio; D9, decisão #30): A executar → Em andamento;
 * Em andamento ⇄ Pausada; Em andamento → Concluída. Nenhuma outra transição é confirmada.
 */
@Entity
@Table(name = "obras")
public class Obra {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @Column(name = "nome", nullable = false)
    private String nome;

    @Column(name = "valor_contratado", nullable = false)
    private BigDecimal valorContratado;

    @Column(name = "data_inicio", nullable = false)
    private LocalDate dataInicio;

    @Column(name = "data_prevista_termino", nullable = false)
    private LocalDate dataPrevistaTermino;

    @Column(name = "data_real_termino")
    private LocalDate dataRealTermino;

    @Column(name = "status", nullable = false)
    private String status;

    protected Obra() {
        // exigido pelo JPA
    }

    public Obra(Cliente cliente, String nome, BigDecimal valorContratado, LocalDate dataInicio,
                LocalDate dataPrevistaTermino, LocalDate dataRealTermino) {
        this.cliente = cliente;
        this.nome = nome;
        this.valorContratado = valorContratado;
        this.dataInicio = dataInicio;
        this.dataPrevistaTermino = dataPrevistaTermino;
        this.dataRealTermino = dataRealTermino;
        this.status = "A executar";
    }

    public UUID getId() {
        return id;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public BigDecimal getValorContratado() {
        return valorContratado;
    }

    public void setValorContratado(BigDecimal valorContratado) {
        this.valorContratado = valorContratado;
    }

    public LocalDate getDataInicio() {
        return dataInicio;
    }

    public void setDataInicio(LocalDate dataInicio) {
        this.dataInicio = dataInicio;
    }

    public LocalDate getDataPrevistaTermino() {
        return dataPrevistaTermino;
    }

    public void setDataPrevistaTermino(LocalDate dataPrevistaTermino) {
        this.dataPrevistaTermino = dataPrevistaTermino;
    }

    public LocalDate getDataRealTermino() {
        return dataRealTermino;
    }

    public void setDataRealTermino(LocalDate dataRealTermino) {
        this.dataRealTermino = dataRealTermino;
    }

    public String getStatus() {
        return status;
    }

    public void transicionarStatus(String novoStatus) {
        this.status = novoStatus;
    }
}
