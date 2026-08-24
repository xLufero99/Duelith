package com.duelith.application.exceptions;

/** Credenciales invalidas en login -> HTTP 401. */
public class CredencialesInvalidasException extends RuntimeException {

    public CredencialesInvalidasException(String mensaje) {
        super(mensaje);
    }
}
