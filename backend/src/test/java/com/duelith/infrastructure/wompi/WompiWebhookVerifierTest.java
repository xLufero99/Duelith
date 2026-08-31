package com.duelith.infrastructure.wompi;

import com.duelith.infrastructure.config.WompiProperties;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Pruebas de verificacion de firma de webhooks de Wompi (events_secret).
 * Se calcula SHA256(timestamp + rawBody + events_secret).
 */
class WompiWebhookVerifierTest {

    private final WompiProperties properties = new WompiProperties(
            "https://sandbox.wompi.co/v1", "pub", "pri", "it",
            "ev_secret_abc", "COP", "http://exito", "http://fallo", "http://pendiente");

    private final WompiWebhookVerifier verifier = new WompiWebhookVerifier(properties);

    private final String body = "{\"event\":\"transaction.updated\"}";
    private final String timestamp = "1625000000";

    private MockHttpServletRequest requestConFirma(String firma) {
        MockHttpServletRequest req = new MockHttpServletRequest();
        req.setContent(body.getBytes(StandardCharsets.UTF_8));
        req.addHeader("X-Wompi-Signature", firma);
        req.addHeader("X-Wompi-Timestamp", timestamp);
        return req;
    }

    @Test
    @DisplayName("Acepta un webhook con firma correcta y devuelve el body")
    void aceptaFirmaValida() {
        String firma = sha256(timestamp + body + "ev_secret_abc");
        String devuelto = verifier.verificar(requestConFirma(firma));
        assertThat(devuelto).isEqualTo(body);
    }

    @Test
    @DisplayName("Rechaza un webhook con firma incorrecta")
    void rechazaFirmaInvalida() {
        MockHttpServletRequest req = requestConFirma("firma-manipulada");
        assertThatThrownBy(() -> verifier.verificar(req))
                .isInstanceOf(FirmaWebhookInvalidaException.class);
    }

    @Test
    @DisplayName("Rechaza un webhook sin headers de firma")
    void rechazaSinHeaders() {
        MockHttpServletRequest req = new MockHttpServletRequest();
        req.setContent(body.getBytes(StandardCharsets.UTF_8));
        assertThatThrownBy(() -> verifier.verificar(req))
                .isInstanceOf(FirmaWebhookInvalidaException.class);
    }

    @Test
    @DisplayName("La firma depende del events_secret: otro secreto no valida")
    void rechazaConOtroSecreto() {
        // Firma generada con un secreto distinto al configurado.
        String firma = sha256(timestamp + body + "OTRO_SECRETO");
        assertThatThrownBy(() -> verifier.verificar(requestConFirma(firma)))
                .isInstanceOf(FirmaWebhookInvalidaException.class);
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
