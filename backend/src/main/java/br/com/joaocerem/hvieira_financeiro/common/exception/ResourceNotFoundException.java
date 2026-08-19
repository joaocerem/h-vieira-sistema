package br.com.joaocerem.hvieira_financeiro.common.exception;

/**
 * Lançada quando um recurso buscado por identificador não existe.
 * Mapeada para HTTP 404 pelo {@link br.com.joaocerem.hvieira_financeiro.common.web.GlobalExceptionHandler}.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
