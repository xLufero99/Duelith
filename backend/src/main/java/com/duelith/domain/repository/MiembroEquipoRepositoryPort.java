package com.duelith.domain.repository;

import com.duelith.domain.model.MiembroEquipo;
import com.duelith.domain.model.RolEquipo;

import java.util.List;
import java.util.Optional;

/**
 * Puerto de persistencia para miembros de equipo.
 */
public interface MiembroEquipoRepositoryPort {

    MiembroEquipo guardar(MiembroEquipo miembro);

    void eliminar(MiembroEquipo miembro);

    Optional<MiembroEquipo> buscarPorEquipoYUsuario(Long equipoId, Long usuarioId);

    List<MiembroEquipo> buscarPorEquipoId(Long equipoId);

    List<MiembroEquipo> buscarPorUsuarioId(Long usuarioId);

    long contarMiembrosConfirmados(Long equipoId);

    boolean existeMiembroConRol(Long equipoId, Long usuarioId, RolEquipo rol);
}
