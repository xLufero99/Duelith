package com.duelith.interfaces.handler;

import com.duelith.application.dto.response.ErrorResponse;
import com.duelith.application.exceptions.AccesoDenegadoException;
import com.duelith.application.exceptions.ConflictoException;
import com.duelith.application.exceptions.CredencialesInvalidasException;
import com.duelith.application.exceptions.RateLimitExcedidoException;
import com.duelith.application.exceptions.RecursoNoEncontradoException;
import com.duelith.application.exceptions.ReglaNegocioException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Manejo centralizado de errores con formato uniforme (ErrorResponse).
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(RateLimitExcedidoException.class)
    public ResponseEntity<ErrorResponse> manejarRateLimit(RateLimitExcedidoException ex,
                                                          HttpServletRequest request) {
        return construir(HttpStatus.TOO_MANY_REQUESTS, ex.getMessage(), request, null);
    }

    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<ErrorResponse> manejarNoEncontrado(RecursoNoEncontradoException ex,
                                                             HttpServletRequest request) {
        return construir(HttpStatus.NOT_FOUND, ex.getMessage(), request, null);
    }

    @ExceptionHandler(ReglaNegocioException.class)
    public ResponseEntity<ErrorResponse> manejarReglaNegocio(ReglaNegocioException ex,
                                                             HttpServletRequest request) {
        return construir(HttpStatus.BAD_REQUEST, ex.getMessage(), request, null);
    }

    @ExceptionHandler(ConflictoException.class)
    public ResponseEntity<ErrorResponse> manejarConflicto(ConflictoException ex,
                                                          HttpServletRequest request) {
        return construir(HttpStatus.CONFLICT, ex.getMessage(), request, null);
    }

    @ExceptionHandler({CredencialesInvalidasException.class, BadCredentialsException.class})
    public ResponseEntity<ErrorResponse> manejarCredenciales(Exception ex, HttpServletRequest request) {
        return construir(HttpStatus.UNAUTHORIZED, "Credenciales invalidas", request, null);
    }

    @ExceptionHandler(AccesoDenegadoException.class)
    public ResponseEntity<ErrorResponse> manejarAccesoDenegado(AccesoDenegadoException ex,
                                                               HttpServletRequest request) {
        return construir(HttpStatus.FORBIDDEN, ex.getMessage(), request, null);
    }

    /** Denegaciones de @PreAuthorize/@IsCreator (AuthorizationDeniedException incluida) -> 403. */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> manejarAccesoDenegadoSpring(AccessDeniedException ex,
                                                                     HttpServletRequest request) {
        log.warn("Acceso denegado a {} {}: {}", request.getMethod(), request.getRequestURI(),
                ex.getMessage());
        return construir(HttpStatus.FORBIDDEN, "No tienes permisos para esta operacion", request, null);
    }

    /** Errores de @Valid en DTOs: se agrupan por campo. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> manejarValidacion(MethodArgumentNotValidException ex,
                                                           HttpServletRequest request) {
        Map<String, String> errores = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(error -> errores.putIfAbsent(error.getField(), error.getDefaultMessage()));
        return construir(HttpStatus.BAD_REQUEST, "Hay campos invalidos en la peticion", request, errores);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> manejarIntegridad(DataIntegrityViolationException ex,
                                                           HttpServletRequest request) {
        log.warn("Violacion de integridad de datos: {}", ex.getMostSpecificCause().getMessage());
        return construir(HttpStatus.CONFLICT, "La operacion viola una restriccion de datos",
                request, null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> manejarGenerico(Exception ex, HttpServletRequest request) {
        log.error("Error interno no controlado", ex);
        return construir(HttpStatus.INTERNAL_SERVER_ERROR,
                "Error interno del servidor. Intenta mas tarde.", request, null);
    }

    private ResponseEntity<ErrorResponse> construir(HttpStatus status, String mensaje,
                                                    HttpServletRequest request,
                                                    Map<String, String> errores) {
        ErrorResponse body = ErrorResponse.builder()
                .timestamp(OffsetDateTime.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .mensaje(mensaje)
                .errores(errores)
                .path(request.getRequestURI())
                .build();
        return ResponseEntity.status(status).body(body);
    }
}
