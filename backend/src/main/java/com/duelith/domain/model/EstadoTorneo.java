package com.duelith.domain.model;

/**
 * Estados del ciclo de vida de un torneo.
 * Se persisten con el mismo nombre del enum (@Enumerated STRING).
 */
public enum EstadoTorneo {
    EN_REGISTRO,
    INSCRIPCIONES_CERRADAS,
    EN_CURSO,
    FINALIZADO,
    CANCELADO
}
