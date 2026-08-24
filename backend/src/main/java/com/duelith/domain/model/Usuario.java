package com.duelith.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

/**
 * Entidad que mapea la tabla usuarios de Supabase.
 * El password nunca debe exponerse fuera del dominio.
 */
@Entity
@Table(name = "usuarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre_usuario", nullable = false, unique = true, length = 50)
    private String nombreUsuario;

    @Column(nullable = false, unique = true, length = 120)
    private String email;

    /** Hash BCrypt de la contrasena. Nunca devolver en respuestas HTTP. */
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(nullable = false, length = 20)
    private RolUsuario rol;

    @Column(length = 50)
    private String gamertag;

    @Column(name = "creado_en")
    private OffsetDateTime creadoEn;

    @Column(nullable = false)
    private Boolean activo;
}
