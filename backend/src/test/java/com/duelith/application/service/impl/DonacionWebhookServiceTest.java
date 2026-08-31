package com.duelith.application.service.impl;

import com.duelith.application.mapper.DonacionMapper;
import com.duelith.domain.model.Donacion;
import com.duelith.domain.model.EstadoDonacion;
import com.duelith.domain.repository.DonacionRepositoryPort;
import com.duelith.domain.repository.UsuarioRepositoryPort;
import com.duelith.infrastructure.config.DonacionProperties;
import com.duelith.infrastructure.config.WompiProperties;
import com.duelith.infrastructure.wompi.WompiClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Pruebas de idempotencia y procesamiento de webhooks: no se sobreescriben
 * estados finales con webhooks duplicados.
 */
@ExtendWith(MockitoExtension.class)
class DonacionWebhookServiceTest {

    @Mock
    private DonacionRepositoryPort donacionRepository;
    @Mock
    private UsuarioRepositoryPort usuarioRepository;
    @Mock
    private DonacionMapper donacionMapper;
    @Mock
    private WompiClient wompiClient;
    @Mock
    private WompiSignatureService wompiSignatureService;

    private final DonacionProperties donacionProperties =
            new DonacionProperties(1000L, 10_000_000L, 5, 60L);

    private final WompiProperties wompiProperties = new WompiProperties(
            "https://sandbox.wompi.co/v1", "pub", "pri", "it", "ev",
            "COP", "http://exito", "http://fallo", "http://pendiente");

    private DonacionServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new DonacionServiceImpl(
                donacionRepository, usuarioRepository, donacionMapper,
                wompiClient, wompiSignatureService,
                donacionProperties, wompiProperties, new ObjectMapper());
    }

    private String webhookApprovado(String txnId, String reference) {
        return "{"
                + "\"event\":\"transaction.updated\","
                + "\"data\":{\"transaction\":{"
                + "\"id\":\"" + txnId + "\","
                + "\"status\":\"APPROVED\","
                + "\"reference\":\"" + reference + "\","
                + "\"amount_in_cents\":2500000"
                + "}}"
                + "}";
    }

    private Donacion donacionPendiente(String reference) {
        return Donacion.builder()
                .id(1L)
                .reference(reference)
                .amount(BigDecimal.valueOf(25000))
                .email("a@a.com")
                .status(EstadoDonacion.PENDING)
                .creadoEn(OffsetDateTime.now())
                .build();
    }

    private Donacion donacionAprovada(String reference) {
        Donacion d = donacionPendiente(reference);
        d.setStatus(EstadoDonacion.APPROVED);
        return d;
    }

    @Test
    @DisplayName("Webhook valido aprueba una donacion PENDING")
    void apruebaDonacionPendiente() {
        String ref = "DON-x";
        when(donacionRepository.buscarPorReferencia(ref))
                .thenReturn(Optional.of(donacionPendiente(ref)));

        boolean procesado = service.procesarWebhook(webhookApprovado("tx-1", ref));

        assertThat(procesado).isTrue();
        ArgumentCaptor<Donacion> captor = ArgumentCaptor.forClass(Donacion.class);
        verify(donacionRepository).guardar(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(EstadoDonacion.APPROVED);
        assertThat(captor.getValue().getWebhookProcesadoEn()).isNotNull();
    }

    @Test
    @DisplayName("Webhook duplicado no sobreescribe un estado APPROVED")
    void noSobreescribeEstadoFinal() {
        String ref = "DON-y";
        when(donacionRepository.buscarPorReferencia(ref))
                .thenReturn(Optional.of(donacionAprovada(ref)));

        boolean procesado = service.procesarWebhook(webhookApprovado("tx-1", ref));

        assertThat(procesado).isFalse();
        verify(donacionRepository, never()).guardar(any());
    }

    @Test
    @DisplayName("Webhook de transaccion desconocida se ignora sin error")
    void ignoraTransaccionDesconocida() {
        when(donacionRepository.buscarPorTransactionId(anyString()))
                .thenReturn(Optional.empty());
        when(donacionRepository.buscarPorReferencia(anyString()))
                .thenReturn(Optional.empty());

        boolean procesado = service.procesarWebhook(webhookApprovado("tx-desconocida", "ref-desconocida"));

        assertThat(procesado).isFalse();
        verify(donacionRepository, never()).guardar(any());
    }
}
