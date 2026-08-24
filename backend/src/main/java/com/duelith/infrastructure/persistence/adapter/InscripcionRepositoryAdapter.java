package com.duelith.infrastructure.persistence.adapter;

import com.duelith.domain.model.Inscripcion;
import com.duelith.domain.repository.InscripcionRepositoryPort;
import com.duelith.infrastructure.persistence.repository.InscripcionJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class InscripcionRepositoryAdapter implements InscripcionRepositoryPort {

    private final InscripcionJpaRepository jpa;

    @Override
    public Inscripcion guardar(Inscripcion inscripcion) {
        return jpa.save(inscripcion);
    }

    @Override
    public Optional<Inscripcion> buscarPorTorneoYEquipo(Long torneoId, Long equipoId) {
        return jpa.findByTorneoIdAndEquipoId(torneoId, equipoId);
    }

    @Override
    public List<Inscripcion> buscarPorTorneoId(Long torneoId) {
        return jpa.findByTorneoIdOrderByFechaInscripcionAsc(torneoId);
    }

    @Override
    public List<Inscripcion> buscarConfirmadasPorTorneoId(Long torneoId) {
        return jpa.findByTorneoIdAndConfirmadoTrueOrderByFechaInscripcionAsc(torneoId);
    }

    @Override
    public long contarPorTorneoId(Long torneoId) {
        return jpa.countByTorneoId(torneoId);
    }
}
