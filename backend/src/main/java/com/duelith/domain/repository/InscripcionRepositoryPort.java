package com.duelith.domain.repository;

import com.duelith.domain.model.Inscripcion;

import java.util.List;
import java.util.Optional;

/**
 * Puerto de persistencia para inscripciones.
 */
public interface InscripcionRepositoryPort {

    Inscripcion guardar(Inscripcion inscripcion);

    Optional<Inscripcion> buscarPorTorneoYEquipo(Long torneoId, Long equipoId);

    List<Inscripcion> buscarPorTorneoId(Long torneoId);

    List<Inscripcion> buscarConfirmadasPorTorneoId(Long torneoId);

    long contarPorTorneoId(Long torneoId);
}
