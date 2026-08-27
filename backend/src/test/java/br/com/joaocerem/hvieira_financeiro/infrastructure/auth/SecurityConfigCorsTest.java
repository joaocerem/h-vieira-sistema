package br.com.joaocerem.hvieira_financeiro.infrastructure.auth;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Cobre a correção de CORS registrada nesta sessão — sem esta configuração, o navegador bloqueia
 * toda chamada cross-origin do Frontend (Vite, `localhost:5173`) antes mesmo de chegar ao
 * Controller, mesmo com `permitAll()` do Spring Security (autorização e CORS são mecanismos
 * independentes). `webEnvironment` padrão (`MOCK`) — dispatcha via `DispatcherServlet` em
 * processo, sem subir um Tomcat real, então esses testes não dependem de bind de socket TCP.
 */
@SpringBootTest
@AutoConfigureMockMvc
class SecurityConfigCorsTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void preflightDaOrigemDoFrontendEhPermitido() throws Exception {
        mockMvc.perform(options("/api/empresas")
                        .header(HttpHeaders.ORIGIN, "http://localhost:5173")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:5173"))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true"));
    }

    @Test
    void requisicaoRealDaOrigemDoFrontendRecebeCabecalhosCors() throws Exception {
        mockMvc.perform(get("/api/empresas").header(HttpHeaders.ORIGIN, "http://localhost:5173"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:5173"))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true"));
    }

    @Test
    void requisicaoDeOrigemNaoAutorizadaEhRecusadaPeloCors() throws Exception {
        mockMvc.perform(get("/api/empresas").header(HttpHeaders.ORIGIN, "http://evil.example.com"))
                .andExpect(status().isForbidden());
    }
}
