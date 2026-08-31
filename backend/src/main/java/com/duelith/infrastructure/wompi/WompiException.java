package com.duelith.infrastructure.wompi;

/** Error de integracion con la pasarela Wompi (comunicacion o rechazo). */
public class WompiException extends RuntimeException {

    public WompiException(String message) {
        super(message);
    }

    public WompiException(String message, Throwable cause) {
        super(message, cause);
    }
}
