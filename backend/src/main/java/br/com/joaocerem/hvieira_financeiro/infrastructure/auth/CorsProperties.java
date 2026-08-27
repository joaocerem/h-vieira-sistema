package br.com.joaocerem.hvieira_financeiro.infrastructure.auth;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Origens autorizadas a consumir a API via CORS — parâmetro operacional configurável, nunca uma
 * constante fixa no código (mesmo critério já usado em `ConciliacaoProperties`, T6,
 * `docs/pendencias.md`).
 *
 * Necessário porque o Frontend (Vite, `localhost:5173` em desenvolvimento) roda em origem
 * diferente do backend (`localhost:8080`) — navegador algum permite XHR/fetch cross-origin sem
 * o servidor declarar isso explicitamente. `shared/api/client.ts` (Frontend) usa
 * `withCredentials: true` (decisão #48, cookie httpOnly) — CORS com credenciais exige lista
 * explícita de origens, nunca `*` (regra do próprio protocolo, não uma escolha deste projeto).
 * Valor padrão cobre o dev server local; produção substitui via `application.yaml`/variável de
 * ambiente quando o domínio real do Frontend existir (T14, decisão #43).
 */
@Component
@ConfigurationProperties(prefix = "hvieira.cors")
public class CorsProperties {

    private List<String> allowedOrigins = List.of("http://localhost:5173");

    public List<String> getAllowedOrigins() {
        return allowedOrigins;
    }

    public void setAllowedOrigins(List<String> allowedOrigins) {
        this.allowedOrigins = allowedOrigins;
    }
}
