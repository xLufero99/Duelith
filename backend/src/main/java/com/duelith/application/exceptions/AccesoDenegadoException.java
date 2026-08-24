package com.duelith.application.exceptions;

/** Operacion no permitida para el usuario actual -> HTTP 403. */
public class AccesoDenegadoException extends RuntimeException {

    public AccesoDenegadoException(String mensaje) {
        super(mensaje);
    }
}
