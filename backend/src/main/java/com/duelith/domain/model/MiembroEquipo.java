package com.duelith.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

/**
 * Entidad que mapea la tabla miembros_equipo de Supabase.
 * Registro unico por par (equipo, usuario).
 */
@Entity
@Table(name = "miembros_equipo", uniqueConstraints = {
        @UniqueConstraint(name = "uk_miembro_equipo_usuario", columnNames = {"equipo_id", "usuario_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MiembroEquipo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipo_id", nullable = false)
    private Equipo equipo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    /** CAPITAN | JUGADOR | SUPLENTE (suplente = solicitud pendiente de aprobar). */
    @Column(nullable = false, length = 20)
    private RolEquipo rol;

    @Column(name = "fecha_ingreso")
    private OffsetDateTime fechaIngreso;
}
