package com.duelith.infrastructure.ratelimit;

import com.duelith.infrastructure.config.DonacionProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate limiter simple en memoria "fijar ventana" para crear donaciones.
 * Limita la cantidad de intentos por IP dentro de una ventana de tiempo.
 * Para produccion multi-instancia se recomienda una solucion distribuida
 * (Redis), pero este enfoque cubre el requisito de seguridad basico.
 */
@Component
@RequiredArgsConstructor
public class RateLimiter {

    private final DonacionProperties donacionProperties;

    private static final class Ventana {
        final Instant inicio;
        int contador;

        Ventana(Instant inicio, int contador) {
            this.inicio = inicio;
            this.contador = contador;
        }
    }

    private final Map<String, Ventana> ventanas = new ConcurrentHashMap<>();

    /**
     * @return true si el cliente aun puede intentar; false si supero el limite.
     */
    public boolean permitir(String clave) {
        int max = donacionProperties.rateLimitMaxAttempts();
        Duration ventana = Duration.ofMinutes(donacionProperties.rateLimitWindowMinutes());
        Instant ahora = Instant.now();
        Ventana v = ventanas.compute(clave, (k, actual) -> {
            if (actual == null || ahora.isAfter(actual.inicio.plus(ventana))) {
                return new Ventana(ahora, 0);
            }
            return actual;
        });
        synchronized (v) {
            if (v.contador >= max) {
                return false;
            }
            v.contador++;
            return true;
        }
    }
}
