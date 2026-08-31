package com.duelith.interfaces.controller;

import com.duelith.domain.service.DonacionServicePort;
import com.duelith.infrastructure.wompi.FirmaWebhookInvalidaException;
import com.duelith.infrastructure.wompi.WompiWebhookVerifier;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Endpoint publico al que Wompi notifica los eventos de transaccion.
 * Todo webhook DEBE verificar su firma con el events_secret antes de
 * procesarse. Es idempotente: los eventos duplicados se ignoran.
 */
@RestController
@RequestMapping("/api/webhook")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Webhooks", description = "Notificaciones asincronas de Wompi (firma verificada)")
public class WompiWebhookController {

    private final WompiWebhookVerifier webhookVerifier;
    private final DonacionServicePort donacionService;

    @PostMapping("/donations")
    @Operation(summary = "Webhook de donaciones", description = "Wompi notifica el resultado del pago. Verifica la firma X-Wompi-Signature y aplica idempotencia.")
    public ResponseEntity<Map<String, Object>> recibir(HttpServletRequest request) {
        try {
            String body = webhookVerifier.verificar(request);
            donacionService.procesarWebhook(body);
            return ResponseEntity.ok(Map.of("status", "ok"));
        } catch (FirmaWebhookInvalidaException ex) {
            log.warn("Webhook de Wompi rechazado por firma invalida");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("status", "error", "mensaje", "Firma invalida"));
        }
    }
}
