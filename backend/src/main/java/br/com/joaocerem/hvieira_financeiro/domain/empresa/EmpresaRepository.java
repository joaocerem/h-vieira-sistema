package br.com.joaocerem.hvieira_financeiro.domain.empresa;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

/**
 * Porta de persistência de Empresa (perfil "cadastro simples" — repositório direto, sem
 * interface de porta separada da implementação Spring Data JPA; ver `arquitetura-tecnica.md` Seção 4).
 */
public interface EmpresaRepository extends JpaRepository<Empresa, UUID> {
}
