package com.duelith.domain.repository;

import com.duelith.domain.model.EstadoPartido;
import com.duelith.domain.model.Partido;

import java.util.List;
import java.util.Optional;

/**
 * Puerto de persistencia para partidos del bracket.
 */
public interface PartidoRepositoryPort {

    List<Partido> guardarTodos(List<Partido> partidos);

    Partido guardar(Partido partido);

    Optional<Partido> buscarPorId(Long id);

    /**
     * Busca el partido bloqueando su fila (SELECT ... FOR UPDATE).
     * Evita dobles reportes concurrentes del mismo resultado.
     */
    Optional<Partido> buscarPorIdConBloqueo(Long id);

    /** Partidos de un torneo ordenados por ronda y numero. */
    List<Partido> buscarPorTorneoId(Long torneoId);

    /** Proximos partidos pendientes/en juego donde participa alguno de los equipos indicados. */
    List<Partido> buscarProximosPorEquipos(List<Long> equipoIds, List<EstadoPartido> estados);
}
