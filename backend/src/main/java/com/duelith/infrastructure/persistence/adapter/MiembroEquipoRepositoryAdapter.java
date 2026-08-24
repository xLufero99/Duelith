package com.duelith.infrastructure.persistence.adapter;

import com.duelith.domain.model.MiembroEquipo;
import com.duelith.domain.model.RolEquipo;
import com.duelith.domain.repository.MiembroEquipoRepositoryPort;
import com.duelith.infrastructure.persistence.repository.MiembroEquipoJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class MiembroEquipoRepositoryAdapter implements MiembroEquipoRepositoryPort {

    private final MiembroEquipoJpaRepository jpa;

    @Override
    public MiembroEquipo guardar(MiembroEquipo miembro) {
        return jpa.save(miembro);
    }

    @Override
    public void eliminar(MiembroEquipo miembro) {
        jpa.delete(miembro);
    }

    @Override
    public Optional<MiembroEquipo> buscarPorEquipoYUsuario(Long equipoId, Long usuarioId) {
        return jpa.findByEquipoIdAndUsuarioId(equipoId, usuarioId);
    }

    @Override
    public List<MiembroEquipo> buscarPorEquipoId(Long equipoId) {
        return jpa.findByEquipoId(equipoId);
    }

    @Override
    public List<MiembroEquipo> buscarPorUsuarioId(Long usuarioId) {
        return jpa.findByUsuarioId(usuarioId);
    }

    @Override
    public long contarMiembrosConfirmados(Long equipoId) {
        // SUPLENTE = solicitud pendiente, no cuenta como miembro activo.
        return jpa.countByEquipoIdAndRolNot(equipoId, RolEquipo.SUPLENTE);
    }

    @Override
    public boolean existeMiembroConRol(Long equipoId, Long usuarioId, RolEquipo rol) {
        return jpa.existsByEquipoIdAndUsuarioIdAndRol(equipoId, usuarioId, rol);
    }
}
