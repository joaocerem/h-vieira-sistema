package br.com.joaocerem.hvieira_financeiro.infrastructure.auth;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

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
 */
@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }
}
