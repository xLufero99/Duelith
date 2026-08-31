package com.duelith.application.exceptions;

/** Limite de intentos (rate limiting) excedido -> HTTP 429. */
public class RateLimitExcedidoException extends RuntimeException {

    public RateLimitExcedidoException(String mensaje) {
        super(mensaje);
    }
}
