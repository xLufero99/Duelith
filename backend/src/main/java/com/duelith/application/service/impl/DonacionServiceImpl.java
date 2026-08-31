package com.duelith.application.service.impl;

import com.duelith.application.dto.request.CrearDonacionRequest;
import com.duelith.application.dto.response.DonacionResponse;
import com.duelith.application.dto.response.DonacionResultadoResponse;
import com.duelith.application.exceptions.RecursoNoEncontradoException;
import com.duelith.application.exceptions.ReglaNegocioException;
import com.duelith.application.mapper.DonacionMapper;
import com.duelith.domain.model.Donacion;
import com.duelith.domain.model.EstadoDonacion;
import com.duelith.domain.model.Usuario;
import com.duelith.domain.repository.DonacionRepositoryPort;
import com.duelith.domain.repository.UsuarioRepositoryPort;
import com.duelith.domain.service.DonacionServicePort;
import com.duelith.infrastructure.config.DonacionProperties;
import com.duelith.infrastructure.config.WompiProperties;
import com.duelith.infrastructure.wompi.WompiClient;
import com.duelith.infrastructure.wompi.WompiDtos;
import com.duelith.infrastructure.wompi.WompiException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Gestion de donaciones: validacion estricta de montos (nunca confiar en el
 * frontend), generacion de referencia unica, firma de integridad y creacion
 * de la transaccion en Wompi (metodo de pago gestionado por el widget).
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class DonacionServiceImpl implements DonacionServicePort {

    private final DonacionRepositoryPort donacionRepository;
    private final UsuarioRepositoryPort usuarioRepository;
    private final DonacionMapper donacionMapper;
    private final WompiClient wompiClient;
    private final WompiSignatureService wompiSignatureService;
    private final DonacionProperties donacionProperties;
    private final WompiProperties wompiProperties;
    private final ObjectMapper objectMapper;

    @Override
    public DonacionResultadoResponse crear(Long usuarioId, CrearDonacionRequest request) {
        // Validacion del monto SIEMPRE en backend.
        long min = donacionProperties.minAmount();
        long max = donacionProperties.maxAmount();
        if (request.getAmount() < min) {
            throw new ReglaNegocioException("La donacion minima es de $" + min + " COP");
        }
        if (request.getAmount() > max) {
            throw new ReglaNegocioException("La donacion maxima es de $" + max + " COP");
        }

        // Referencia unica y no predecible (evita colisiones y manipulacion).
        String referencia = "DON-" + UUID.randomUUID();

        Usuario donante = null;
        if (usuarioId != null) {
            donante = usuarioRepository.buscarPorId(usuarioId)
                    .orElseThrow(() -> RecursoNoEncontradoException.de("Usuario", usuarioId));
        }

        OffsetDateTime ahora = OffsetDateTime.now();
        Donacion donacion = Donacion.builder()
                .donante(donante)
                .reference(referencia)
                .amount(BigDecimal.valueOf(request.getAmount()))
                .email(request.getEmail())
                .paymentMethod(request.getPaymentMethod())
                .status(EstadoDonacion.PENDING)
                .sessionId(request.getSessionId())
                .deviceId(request.getDeviceId())
                .creadoEn(ahora)
                .actualizadoEn(ahora)
                .build();
        donacionRepository.guardar(donacion);

        try {
            WompiDtos.ResultadoTransaccion resultado = wompiClient.crearTransaccion(
                    construirRequest(donacion));

            donacion.setTransactionId(resultado.getId());
            donacion.setRedirectUrl(resultado.getRedirectUrl());
            if (resultado.getStatus() != null) {
                donacion.setStatus(mapearEstado(resultado.getStatus()));
            }
            donacion.setActualizadoEn(OffsetDateTime.now());
            donacion.setWompiResponse("id=" + resultado.getId() + ",status=" + resultado.getStatus());
            donacionRepository.guardar(donacion);

            log.info("Donacion creada: reference={}, transactionId={}", referencia, resultado.getId());

            return DonacionResultadoResponse.builder()
                    .success(true)
                    .redirectUrl(resultado.getRedirectUrl())
                    .reference(referencia)
                    .build();
        } catch (WompiException ex) {
            donacion.setStatus(EstadoDonacion.ERROR);
            donacion.setActualizadoEn(OffsetDateTime.now());
            donacionRepository.guardar(donacion);
            throw ex;
        }
    }

    /** Construye el request de Wompi con la firma de integridad obligatoria. */
    private WompiDtos.CrearTransaccionRequest construirRequest(Donacion donacion) {
        long amountInCents = donacion.getAmount().longValue() * 100;
        String currency = wompiProperties.currency();
        String firma = wompiSignatureService.firmarIntegridad(
                donacion.getReference(), amountInCents, currency);

        return WompiDtos.CrearTransaccionRequest.builder()
                .amountInCents(amountInCents)
                .currency(currency)
                .customerEmail(donacion.getEmail())
                .reference(donacion.getReference())
                .sessionId(donacion.getSessionId())
                .customerData(Map.of("device_id", donacion.getDeviceId()))
                .signatureIntegrity(firma)
                .redirectUrls(Map.of(
                        "success", wompiProperties.successUrl(),
                        "failure", wompiProperties.failureUrl(),
                        "pending", wompiProperties.pendingUrl()))
                .build();
    }

    private EstadoDonacion mapearEstado(String wompiStatus) {
        if (wompiStatus == null) {
            return EstadoDonacion.PENDING;
        }
        String s = wompiStatus.toUpperCase();
        return switch (s) {
            case "APPROVED", "APPROVED_PARTIAL" -> EstadoDonacion.APPROVED;
            case "DECLINED", "VOIDED", "ERROR" -> EstadoDonacion.REJECTED;
            case "EXPIRED" -> EstadoDonacion.EXPIRED;
            default -> EstadoDonacion.PENDING;
        };
    }

    @Override
    @Transactional(readOnly = true)
    public DonacionResponse obtenerPorReferencia(String referencia) {
        Donacion donacion = donacionRepository.buscarPorReferencia(referencia)
                .orElseThrow(() -> RecursoNoEncontradoException.de("Donacion", referencia));
        return donacionMapper.toResponse(donacion);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DonacionResponse> misDonaciones(Long usuarioId) {
        return donacionRepository.buscarPorDonanteId(usuarioId).stream()
                .map(donacionMapper::toResponse)
                .toList();
    }

    @Override
    public boolean procesarWebhook(String body) {
        try {
            JsonNode raiz = objectMapper.readTree(body);
            JsonNode info = raiz.path("data").path("transaction");
            String eventType = raiz.path("event").asText("");
            String transactionId = info.path("id").asText(null);
            String status = info.path("status").asText(null);
            String reference = info.path("reference").asText(null);

            if (transactionId == null && reference == null) {
                log.warn("Webhook de Wompi sin id ni referencia de transaccion; se ignora");
                return false;
            }

            Donacion donacion = null;
            if (transactionId != null) {
                donacion = donacionRepository.buscarPorTransactionId(transactionId).orElse(null);
            }
            if (donacion == null && reference != null) {
                donacion = donacionRepository.buscarPorReferencia(reference).orElse(null);
            }

            if (donacion == null) {
                // Webhook de una transaccion que no conocemos (no se debe marcar como error;
                // responde 200 para que Wompi no reintente indefinidamente).
                log.warn("Webhook de Wompi para transaccion desconocida: {}, {}", eventType, transactionId);
                return false;
            }

            // IDEMPOTENCIA: no sobreescribir estados finales.
            if (esEstadoFinal(donacion.getStatus())) {
                log.info("Webhook duplicado ignorado para reference={} (estado actual {})",
                        donacion.getReference(), donacion.getStatus());
                return false;
            }

            // Registrar evento de auditoria.
            String eventosPrevios = donacion.getWompiEvents();
            String nuevoEvento = eventosPrevios == null || eventosPrevios.isBlank()
                    ? body
                    : eventosPrevios + "\n---\n" + body;
            donacion.setWompiEvents(nuevoEvento);

            if (donacion.getTransactionId() == null && transactionId != null) {
                donacion.setTransactionId(transactionId);
            }

            if (status != null) {
                donacion.setStatus(mapearEstado(status));
            }
            donacion.setWebhookProcesadoEn(OffsetDateTime.now());
            donacion.setActualizadoEn(OffsetDateTime.now());
            donacionRepository.guardar(donacion);

            log.info("Donacion actualizada por webhook: reference={}, event={}, status={}",
                    donacion.getReference(), eventType, status);
            return true;
        } catch (Exception ex) {
            // El webhook ya fue verificado; un error de parseo no debe romper el 200,
            // Wompi reintentaria. Se loggea y se responde OK para no bloquear.
            log.error("Error procesando webhook de Wompi (body verificado pero ilegible): {}", ex.getMessage());
            return false;
        }
    }

    private boolean esEstadoFinal(EstadoDonacion estado) {
        return estado == EstadoDonacion.APPROVED
                || estado == EstadoDonacion.REJECTED
                || estado == EstadoDonacion.EXPIRED;
    }
}
