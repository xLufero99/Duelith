package com.duelith.infrastructure.persistence.repository;

import com.duelith.domain.model.EstadoTorneo;
import com.duelith.domain.model.Torneo;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TorneoJpaRepository extends JpaRepository<Torneo, Long> {

    List<Torneo> findByEstado(EstadoTorneo estado);

    List<Torneo> findByEstadoAndJuegoIgnoreCase(EstadoTorneo estado, String juego);

    List<Torneo> findByJuegoIgnoreCase(String juego);

    /**
     * Bloqueo pesimista sobre la fila del torneo para transiciones de estado
     * concurrentes (cerrar inscripciones / generar bracket).
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM Torneo t WHERE t.id = :id")
    Optional<Torneo> findByIdConBloqueo(@Param("id") Long id);

    List<Torneo> findByCreadoPorIdOrderByCreadoEnDesc(Long creadoPorId);
}
