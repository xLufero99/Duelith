package com.duelith.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuracion de la pasarela Wompi (llaves y endpoints).
 * La public key se expone al frontend; la private/integrity/events
 * SOLO se usan en el backend.
 */
@ConfigurationProperties(prefix = "wompi")
public record WompiProperties(
        String apiUrl,
        String publicKey,
        String privateKey,
        String integrityKey,
        String eventsSecret,
        String currency,
        String successUrl,
        String failureUrl,
        String pendingUrl) {
}
