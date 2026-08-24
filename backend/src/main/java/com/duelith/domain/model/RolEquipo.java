package com.duelith.domain.model;

/**
 * Roles dentro de un equipo.
 * En la base de datos se guardan en minusculas y sin acento:
 * 'capitan', 'jugador', 'suplente'.
 *
 * Convencion de flujo: al solicitar unirse, el miembro entra como SUPLENTE
 * (solicitud pendiente); el capitan la acepta y pasa a JUGADOR.
 */
public enum RolEquipo {
    CAPITAN,
    JUGADOR,
    SUPLENTE
}
