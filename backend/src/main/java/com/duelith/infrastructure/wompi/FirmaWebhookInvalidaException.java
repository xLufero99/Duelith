package com.duelith.infrastructure.wompi;

/** Firma del webhook de Wompi invalida o ausente: rechazar sin procesar. */
public class FirmaWebhookInvalidaException extends RuntimeException {

    public FirmaWebhookInvalidaException(String message) {
        super(message);
    }
}
