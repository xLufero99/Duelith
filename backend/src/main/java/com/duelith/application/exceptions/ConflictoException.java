package com.duelith.application.exceptions;

/** Conflicto de estado/concurrencia -> HTTP 409. */
public class ConflictoException extends RuntimeException {

    public ConflictoException(String mensaje) {
        super(mensaje);
    }
}
