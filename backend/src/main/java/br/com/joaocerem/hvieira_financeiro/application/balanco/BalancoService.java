package br.com.joaocerem.hvieira_financeiro.application.balanco;

import br.com.joaocerem.hvieira_financeiro.application.consultasfinanceiras.ConsultasFinanceirasService;
import br.com.joaocerem.hvieira_financeiro.application.consultasfinanceiras.ResultadoFinanceiro;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Balanço Realizado e Projetado. Ver `arquitetura-conceitual.md`, regra 8 (Seção 2) e Seção 14 do
 * exemplo composto. Sem entidade própria (`arquitetura-tecnica.md`, Seção 2: "— (sem entidade
 * própria)") — camada de leitura/agregação, consumidora de `ConsultasFinanceirasService` (decisão
 * #19/#35), nunca lê `MOVIMENTAÇÃO_BANCÁRIA` diretamente (regra 8: "Nenhum desses três lê os outros
 * diretamente").
 *
 * Fora de escopo desta implementação, por decisão explícita (#35/A6): "Lucro por Obra" e qualquer
 * composição envolvendo `AJUSTE_FINANCEIRO` — a fórmula (sinal do Ajuste) é explicitamente deixada
 * em aberto pela própria decisão #35, resolvida quando essa funcionalidade específica for
 * especificada.
 */
@Service
@Transactional(readOnly = true)
public class BalancoService {

    private final ConsultasFinanceirasService consultasFinanceirasService;

    public BalancoService(ConsultasFinanceirasService consultasFinanceirasService) {
        this.consultasFinanceirasService = consultasFinanceirasService;
    }

    public Balanco calcular(UUID empresaId) {
        ResultadoFinanceiro realizado = consultasFinanceirasService.calcularRealizado(empresaId);
        ResultadoFinanceiro projetado = consultasFinanceirasService.calcularProjetado(empresaId);
        return new Balanco(realizado, projetado);
    }
}
