package br.com.joaocerem.hvieira_financeiro.application.consultasfinanceiras;

import br.com.joaocerem.hvieira_financeiro.domain.aplicacaodeliquidacao.AplicacaoDeLiquidacaoRepository;
import br.com.joaocerem.hvieira_financeiro.domain.lancamentofinanceiro.LancamentoFinanceiroRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * `application/consultas-financeiras` — módulo de consulta compartilhado (decisão #19: mecanismo
 * Application Service/Facade; decisão #35/A6: desenho arquitetural — responsabilidade, consumidores
 * fechados, categorias de consulta). Ver `arquitetura-tecnica.md`, Seção 6.
 *
 * Consumidores fechados (A6): Balanço, Obra, Frota, ferramentas de consulta da IA — nenhum outro,
 * nenhum reimplementa a lógica separadamente. Esta é a primeira categoria efetivamente implementada
 * (a base de "Balanço Realizado/Projetado", `arquitetura-conceitual.md` regra 8) — as demais
 * categorias (custo por Obra/Veículo, saldo devedor de Contrato, "Lucro por Obra" com Ajustes) ficam
 * para quando cada consumidor for implementado, sem antecipar fórmulas ainda não confirmadas (A6
 * deixa isso explicitamente fora de escopo).
 *
 * `empresaId` é um parâmetro explícito e opcional em cada método — substituto pragmático do escopo
 * automático por Empresa via Hibernate/JPA Filters (A4), que depende de autenticação ainda não
 * implementada. TODO: remover o parâmetro explícito (ou torná-lo interno) quando A4 existir.
 */
@Service
@Transactional(readOnly = true)
public class ConsultasFinanceirasService {

    private static final String TIPO_DESPESA = "Despesa";
    private static final String TIPO_RECEITA = "Receita";

    private final LancamentoFinanceiroRepository lancamentoFinanceiroRepository;
    private final AplicacaoDeLiquidacaoRepository aplicacaoDeLiquidacaoRepository;

    public ConsultasFinanceirasService(LancamentoFinanceiroRepository lancamentoFinanceiroRepository,
                                        AplicacaoDeLiquidacaoRepository aplicacaoDeLiquidacaoRepository) {
        this.lancamentoFinanceiroRepository = lancamentoFinanceiroRepository;
        this.aplicacaoDeLiquidacaoRepository = aplicacaoDeLiquidacaoRepository;
    }

    /**
     * "Realizado" (`arquitetura-conceitual.md`, regra 8): soma da fração já coberta por
     * `APLICAÇÃO_DE_LIQUIDAÇÃO`, por Despesa/Receita.
     */
    public ResultadoFinanceiro calcularRealizado(UUID empresaId) {
        BigDecimal despesas = aplicacaoDeLiquidacaoRepository.somarValorAplicadoPorTipo(TIPO_DESPESA, empresaId);
        BigDecimal receitas = aplicacaoDeLiquidacaoRepository.somarValorAplicadoPorTipo(TIPO_RECEITA, empresaId);
        return new ResultadoFinanceiro(receitas, despesas, receitas.subtract(despesas));
    }

    /**
     * "Projetado" (`arquitetura-conceitual.md`, regra 8): soma de `LANÇAMENTO_FINANCEIRO` por
     * completo (Aberto + Parcial + Pago, exceto Cancelado), por Despesa/Receita.
     */
    public ResultadoFinanceiro calcularProjetado(UUID empresaId) {
        BigDecimal despesas = lancamentoFinanceiroRepository.somarValorProjetadoPorTipo(TIPO_DESPESA, empresaId);
        BigDecimal receitas = lancamentoFinanceiroRepository.somarValorProjetadoPorTipo(TIPO_RECEITA, empresaId);
        return new ResultadoFinanceiro(receitas, despesas, receitas.subtract(despesas));
    }
}
