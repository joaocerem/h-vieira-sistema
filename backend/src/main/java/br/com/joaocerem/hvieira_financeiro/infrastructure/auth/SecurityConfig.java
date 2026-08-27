package br.com.joaocerem.hvieira_financeiro.infrastructure.auth;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Configuração provisória de segurança.
 *
 * TODO (bloqueado por T3/A4, ambos já congelados mas ainda não implementados): esta classe deve ser
 * substituída pela cadeia real de autenticação (Spring Security + JWT, hash Argon2 — decisão #14) e
 * pelos dois pontos de checagem de permissão (Method Security + Hibernate/JPA Filters — decisão #15)
 * assim que o módulo de Usuário ganhar credenciais e o modelo de permissão (papel + escopo por Empresa,
 * decisão #16) for implementado. Até lá, todos os endpoints ficam abertos para permitir o
 * desenvolvimento incremental dos módulos de cadastro.
 *
 * **Dependência adicional registrada na rodada de estabilização arquitetural**: a implementação de A5
 * (aspecto de auditoria automática, `LOG_AUDITORIA`, decisão #18) também está bloqueada por esta
 * lacuna — `LOG_AUDITORIA.usuario_id` é `NOT NULL` sempre que a origem do log é humana, e não há como
 * o Aspect saber "quem" está autenticado sem uma cadeia real de autenticação. A decisão #18 permanece
 * congelada e inalterada; nenhum mecanismo provisório (cabeçalho HTTP, parâmetro explícito, usuário
 * placeholder) foi introduzido para contorná-la — a implementação de A5 fica adiada até esta classe
 * ser substituída pela cadeia real de T3/A4.
 *
 * **CORS**: `permitAll()` (Spring Security) autoriza a requisição no nível de autorização, mas não
 * resolve CORS — são mecanismos independentes; sem uma `CorsConfigurationSource` explícita, o
 * navegador bloqueia toda chamada cross-origin do Frontend (Vite, `localhost:5173`) antes mesmo de
 * ela chegar ao Controller. Origens permitidas vêm de `CorsProperties`
 * (`hvieira.cors.allowed-origins`), nunca uma constante fixa aqui.
 */
@Configuration
public class SecurityConfig {

    private final CorsProperties corsProperties;

    public SecurityConfig(CorsProperties corsProperties) {
        this.corsProperties = corsProperties;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }

    /**
     * `allowCredentials(true)` é obrigatório para o cookie httpOnly de sessão (T11, decisão #48,
     * `shared/api/client.ts` usa `withCredentials: true`) — e, por regra do protocolo CORS, exige
     * origens explícitas (`setAllowedOrigins`), nunca `setAllowedOriginPatterns("*")`/`"*"` junto de
     * credenciais.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(corsProperties.getAllowedOrigins());
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
