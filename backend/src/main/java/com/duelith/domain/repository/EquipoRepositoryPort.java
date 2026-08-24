package com.duelith.domain.repository;

import com.duelith.domain.model.Equipo;

import java.util.List;
import java.util.Optional;

/**
 * Puerto de persistencia para equipos.
 */
public interface EquipoRepositoryPort {

    Equipo guardar(Equipo equipo);

    Optional<Equipo> buscarPorId(Long id);

    List<Equipo> buscarPorCapitanId(Long capitanId);

    boolean existeNombre(String nombre);
}
