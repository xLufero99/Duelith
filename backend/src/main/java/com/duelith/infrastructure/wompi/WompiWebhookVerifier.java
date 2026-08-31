package com.duelith.infrastructure.wompi;

import com.duelith.infrastructure.config.WompiProperties;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

/**
 * Verifica la firma de los webhooks de Wompi usando el EVENTS_SECRET.
 *
 * Wompi envia los headers "X-Wompi-Signature" y "X-Wompi-Timestamp".
 * La firma se calcula como SHA256(timestamp + rawBody + events_secret).
 * Nunca se procesa un webhook cuya firma no coincida.
 */
@Component
@RequiredArgsConstructor
public class WompiWebhookVerifier {

    private static final String SIGNATURE_HEADER = "X-Wompi-Signature";
    private static final String TIMESTAMP_HEADER = "X-Wompi-Timestamp";

    private final WompiProperties wompiProperties;

    /**
     * Lee todo el body crudo del request (una sola vez), verifica la firma
     * y devuelve el body como String. Si la firma no es valida lanza
     * {@link FirmaWebhookInvalidaException}.
     */
    public String verificar(HttpServletRequest request) {
        String signature = request.getHeader(SIGNATURE_HEADER);
        String timestamp = request.getHeader(TIMESTAMP_HEADER);

        if (signature == null || signature.isBlank() || timestamp == null || timestamp.isBlank()) {
            throw new FirmaWebhookInvalidaException("Faltan headers de firma de Wompi");
        }

        String body = leerBody(request);

        String esperado = sha256Hex(timestamp + body + wompiProperties.eventsSecret());

        if (!constanteTiempoIguales(esperado, signature)) {
            throw new FirmaWebhookInvalidaException("Firma del webhook invalida");
        }

        return body;
    }

    private String leerBody(HttpServletRequest request) {
        try (BufferedReader reader = request.getReader()) {
            StringBuilder sb = new StringBuilder();
            char[] buffer = new char[8192];
            int leidos;
            while ((leidos = reader.read(buffer)) != -1) {
                sb.append(buffer, 0, leidos);
            }
            return sb.toString();
        } catch (Exception ex) {
            throw new FirmaWebhookInvalidaException("No se pudo leer el body del webhook");
        }
    }

    private String sha256Hex(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 no disponible", ex);
        }
    }

    /** Comparacion a tiempo constante para evitar ataques de timing. */
    private boolean constanteTiempoIguales(String a, String b) {
        byte[] ba = a.getBytes(StandardCharsets.UTF_8);
        byte[] bb = b.getBytes(StandardCharsets.UTF_8);
        if (ba.length != bb.length) {
            return false;
        }
        int result = 0;
        for (int i = 0; i < ba.length; i++) {
            result |= ba[i] ^ bb[i];
        }
        return result == 0;
    }
}
