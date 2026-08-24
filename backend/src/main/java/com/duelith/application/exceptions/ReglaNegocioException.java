package com.duelith.application.exceptions;

/** Violacion de reglas de negocio -> HTTP 400. */
public class ReglaNegocioException extends RuntimeException {

    public ReglaNegocioException(String mensaje) {
        super(mensaje);
    }
}
