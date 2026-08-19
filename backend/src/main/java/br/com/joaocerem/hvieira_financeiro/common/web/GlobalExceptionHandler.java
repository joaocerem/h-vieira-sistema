package br.com.joaocerem.hvieira_financeiro.common.web;

import br.com.joaocerem.hvieira_financeiro.common.exception.BusinessException;
import br.com.joaocerem.hvieira_financeiro.common.exception.ResourceNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

/**
 * Tratamento centralizado de exceções da API — evita replicar try/catch em cada controller.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiError.of(HttpStatus.NOT_FOUND.value(), "Recurso não encontrado", ex.getMessage(), request.getRequestURI()));
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiError> handleBusiness(BusinessException ex, HttpServletRequest request) {
        // HttpStatus.UNPROCESSABLE_ENTITY foi descontinuado nesta versão do Spring — usa-se o código
        // numérico diretamente (422 continua sendo um status HTTP válido e estável).
        int status = 422;
        return ResponseEntity.status(status)
                .body(ApiError.of(status, "Regra de negócio violada", ex.getMessage(), request.getRequestURI()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        List<String> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::toString)
                .toList();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiError.of(HttpStatus.BAD_REQUEST.value(), "Dados inválidos", "Um ou mais campos são inválidos", request.getRequestURI(), fieldErrors));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> handleDataIntegrity(DataIntegrityViolationException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiError.of(HttpStatus.CONFLICT.value(), "Conflito de integridade", "A operação viola uma restrição do banco de dados", request.getRequestURI()));
    }

    /**
     * Catch-all (achado M4 da auditoria arquitetural) — qualquer exceção não mapeada pelos handlers
     * acima (ex. `NullPointerException`, erro de driver não classificado) antes escapava para a página
     * de erro padrão do Spring Boot, potencialmente expondo stack trace/detalhes internos. Mensagem
     * sempre genérica — nenhum detalhe de `ex` é exposto na resposta.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGenerica(Exception ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiError.of(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Erro interno", "Ocorreu um erro inesperado ao processar a requisição", request.getRequestURI()));
    }
}
