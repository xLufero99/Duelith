package com.duelith.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Limites y reglas de la donacion. Todo se valida SIEMPRE en el backend,
 * nunca se confia en los valores enviados por el frontend.
 */
@ConfigurationProperties(prefix = "donaciones")
public record DonacionProperties(
        long minAmount,
        long maxAmount,
        int rateLimitMaxAttempts,
        long rateLimitWindowMinutes) {
}
