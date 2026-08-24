package com.duelith.infrastructure.persistence.repository;

import com.duelith.domain.model.Inscripcion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InscripcionJpaRepository extends JpaRepository<Inscripcion, Long> {

    Optional<Inscripcion> findByTorneoIdAndEquipoId(Long torneoId, Long equipoId);

    List<Inscripcion> findByTorneoIdOrderByFechaInscripcionAsc(Long torneoId);

    List<Inscripcion> findByTorneoIdAndConfirmadoTrueOrderByFechaInscripcionAsc(Long torneoId);

    long countByTorneoId(Long torneoId);
}
