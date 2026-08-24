package com.duelith.domain.model;

/**
 * Estados de un partido del bracket.
 * WALKOVER: partido resuelto porque un equipo no se presento o paso por "bye".
 */
public enum EstadoPartido {
    PENDIENTE,
    EN_JUEGO,
    FINALIZADO,
    WALKOVER
}
