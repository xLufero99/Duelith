package com.duelith.domain.model;

/**
 * Roles globales de usuario en la plataforma.
 * En la base de datos se guardan en minusculas ('jugador', 'capitan',
 * 'organizador', 'admin').
 *
 * Jerarquia:
 * - JUGADOR: rol por defecto al registrarse.
 * - CAPITAN: se asigna automaticamente al crear un equipo.
 * - ORGANIZADOR: puede crear y gestionar torneos.
 * - ADMIN: control total de la plataforma.
 */
public enum RolUsuario {
    JUGADOR,
    CAPITAN,
    ORGANIZADOR,
    ADMIN
}
