package com.duelith.infrastructure.persistence.repository;

import com.duelith.domain.model.MiembroEquipo;
import com.duelith.domain.model.RolEquipo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MiembroEquipoJpaRepository extends JpaRepository<MiembroEquipo, Long> {

    Optional<MiembroEquipo> findByEquipoIdAndUsuarioId(Long equipoId, Long usuarioId);

    List<MiembroEquipo> findByEquipoId(Long equipoId);

    List<MiembroEquipo> findByUsuarioId(Long usuarioId);

    /** Miembros con rol distinto al indicado (ej: confirmados = no SUPLENTE). */
    long countByEquipoIdAndRolNot(Long equipoId, RolEquipo rol);

    boolean existsByEquipoIdAndUsuarioIdAndRol(Long equipoId, Long usuarioId, RolEquipo rol);
}
