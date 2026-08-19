package br.com.joaocerem.hvieira_financeiro.application.conciliacaobancaria;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Parâmetro operacional configurável — tolerância de dias no matching automático de conciliação entre
 * Movimentação Bancária e Liquidação Financeira.
 *
 * Resolve T6 (`docs/pendencias.md`, Seção 5): "parâmetro operacional dependente do comportamento real
 * dos bancos usados pela empresa; deve ser configurável, nunca uma constante fixa espalhada pelo
 * sistema". Por isso vem de `application.yaml` (`hvieira.conciliacao.tolerancia-dias-matching`), nunca
 * embutida como literal em `VinculoConciliacaoService`. Valor padrão conservador quando omitido.
 */
@Component
@ConfigurationProperties(prefix = "hvieira.conciliacao")
public class ConciliacaoProperties {

    private int toleranciaDiasMatching = 2;

    public int getToleranciaDiasMatching() {
        return toleranciaDiasMatching;
    }

    public void setToleranciaDiasMatching(int toleranciaDiasMatching) {
        this.toleranciaDiasMatching = toleranciaDiasMatching;
    }
}
