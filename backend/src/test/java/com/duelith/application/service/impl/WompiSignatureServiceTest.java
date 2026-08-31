package com.duelith.application.service.impl;

import com.duelith.infrastructure.config.WompiProperties;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Pruebas de generacion de signature:integrity.
 *
 * Wompi exige: SHA256(reference + amount_in_cents + currency + integrity_key)
 * Concatenacion directa SIN separadores; amount_in_cents entero sin decimales.
 */
class WompiSignatureServiceTest {

    private final WompiProperties properties = new WompiProperties(
            "https://sandbox.wompi.co/v1",
            "pub_test",
            "pri_test",
            "it_test_integrity",
            "ev_test_secret",
            "COP",
            "http://exito",
            "http://fallo",
            "http://pendiente");

    private final WompiSignatureService service = new WompiSignatureService(properties);

    @Test
    @DisplayName("Genera la firma usando SHA256(reference + amount + currency + integrityKey) sin separadores")
    void firmaCorrecta() {
        String referencia = "DON-abc123";
        long amountInCents = 2500000L; // $25,000.00 COP
        String currency = "COP";

        String firma = service.firmarIntegridad(referencia, amountInCents, currency);

        String esperado = sha256(referencia + amountInCents + currency + "it_test_integrity");
        assertThat(firma).isEqualTo(esperado);
        assertThat(firma).hasSize(64); // SHA-256 hex
    }

    @Test
    @DisplayName("La firma depende de amount_in_cents: montos distintos producen firmas distintas")
    void firmaDependeDelMonto() {
        String a = service.firmarIntegridad("DON-1", 100000L, "COP");
        String b = service.firmarIntegridad("DON-1", 200000L, "COP");
        assertThat(a).isNotEqualTo(b);
    }

    @Test
    @DisplayName("La firma depende de la referencia")
    void firmaDependeDeLaReferencia() {
        String a = service.firmarIntegridad("DON-A", 100000L, "COP");
        String b = service.firmarIntegridad("DON-B", 100000L, "COP");
        assertThat(a).isNotEqualTo(b);
    }

    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(input.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception ex) {
            throw new IllegalStateException(ex);
        }
    }
}
