package br.com.joaocerem.hvieira_financeiro.common.exception;

/**
 * Lançada quando uma regra de negócio (não uma violação de sintaxe/formato) impede a operação.
 * Mapeada para HTTP 422 pelo {@link br.com.joaocerem.hvieira_financeiro.common.web.GlobalExceptionHandler}.
 *
 * Base para exceções de regra de negócio dos módulos futuros (cadeia financeira, conciliação etc.).
 * Nenhum módulo implementado até aqui (cadastros simples) tem regra de negócio própria que a exija
 * — ver `arquitetura-tecnica.md`, Seção 4 (perfil "cadastro simples").
 */
public class BusinessException extends RuntimeException {

    public BusinessException(String message) {
        super(message);
    }
}
