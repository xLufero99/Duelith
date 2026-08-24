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
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

/**
 * Entidad que mapea la tabla equipos de Supabase.
 */
@Entity
@Table(name = "equipos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Equipo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 60)
    private String nombre;

    /** Capitan actual del equipo. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "capitan_id", nullable = false)
    private Usuario capitan;

    @Column(name = "juego_principal", length = 60)
    private String juegoPrincipal;

    @Column(name = "creado_en")
    private OffsetDateTime creadoEn;

    @Column(nullable = false)
    private Boolean activo;
}
