package com.duelith.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/** Entidad que mapea la tabla donaciones: pagos de apoyo via Wompi (Nequi/PSE). */
@Entity
@Table(name = "donaciones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Donacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Usuario autenticado que dona (opcional, permite donaciones anonimas). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donante_id")
    private Usuario donante;

    @Column(name = "transaction_id", length = 255)
    private String transactionId;

    @Column(nullable = false, unique = true, length = 60)
    private String reference;

    /** Monto en pesos colombianos (COP). Ej: 25000. */
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 255)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 20)
    private MetodoPagoDonacion paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoDonacion status;

    @Column(name = "session_id", length = 255)
    private String sessionId;

    @Column(name = "device_id", length = 255)
    private String deviceId;

    @Column(name = "wompi_response", columnDefinition = "TEXT")
    private String wompiResponse;

    @Column(name = "wompi_events", columnDefinition = "TEXT")
    private String wompiEvents;

    @Column(name = "redirect_url", columnDefinition = "TEXT")
    private String redirectUrl;

    @Column(name = "creado_en")
    private OffsetDateTime creadoEn;

    @Column(name = "actualizado_en")
    private OffsetDateTime actualizadoEn;

    @Column(name = "webhook_processed_at")
    private OffsetDateTime webhookProcesadoEn;
}
