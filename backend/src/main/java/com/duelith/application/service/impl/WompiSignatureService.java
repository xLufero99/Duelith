package com.duelith.application.service.impl;

import com.duelith.infrastructure.config.WompiProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

/**
 * Genera la firma de integridad exigida por Wompi para crear transacciones.
 *
 * Firma: SHA256(reference + amount_in_cents + currency + integrity_key)
 * Concatenacion DIRECTA, sin separadores.
 * amount_in_cents es un entero sin decimales (ej: 2500000 para $25,000.00).
 */
@Service
@RequiredArgsConstructor
public class WompiSignatureService {

    private final WompiProperties wompiProperties;

    public String firmarIntegridad(String reference, long amountInCents, String currency) {
        String payload = reference + amountInCents + currency + wompiProperties.integrityKey();
        return sha256Hex(payload);
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
}
