package com.duelith.domain.repository;

import com.duelith.domain.model.EstadoTorneo;
import com.duelith.domain.model.Torneo;

import java.util.List;
import java.util.Optional;

/**
 * Puerto de persistencia para torneos.
 */
public interface TorneoRepositoryPort {

    Torneo guardar(Torneo torneo);

    Optional<Torneo> buscarPorId(Long id);

    /** Bloquea la fila del torneo (SELECT ... FOR UPDATE) para transiciones de estado seguras. */
    Optional<Torneo> buscarPorIdConBloqueo(Long id);

    List<Torneo> listarConFiltros(EstadoTorneo estado, String juego);
}
