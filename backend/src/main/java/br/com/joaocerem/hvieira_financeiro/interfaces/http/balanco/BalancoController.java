package br.com.joaocerem.hvieira_financeiro.interfaces.http.balanco;

import br.com.joaocerem.hvieira_financeiro.application.balanco.BalancoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * Sem escrita — Balanço é estritamente leitura/agregação sobre Lançamento Financeiro
 * (`arquitetura-tecnica.md`, Seção 3: "Balanço, Obras e Frota são estritamente leitura").
 * `empresaId` opcional — omitido, soma todas as Empresas (ver TODO em `ConsultasFinanceirasService`).
 */
@RestController
@RequestMapping("/api/balanco")
public class BalancoController {

    private final BalancoService service;

    public BalancoController(BalancoService service) {
        this.service = service;
    }

    @GetMapping
    public BalancoResponse calcular(@RequestParam(required = false) UUID empresaId) {
        return BalancoMapper.toResponse(service.calcular(empresaId));
    }
}
