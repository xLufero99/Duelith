package com.duelith.infrastructure.persistence.repository;

import com.duelith.domain.model.EstadoPartido;
import com.duelith.domain.model.Partido;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface PartidoJpaRepository extends JpaRepository<Partido, Long> {

    List<Partido> findByTorneoIdOrderByRondaAscNumeroPartidoAsc(Long torneoId);

    /**
     * SELECT ... FOR UPDATE sobre el partido. Se usa al reportar resultados
     * para que dos capitanes no puedan reportar el mismo partido a la vez.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Partido p WHERE p.id = :id")
    Optional<Partido> findByIdConBloqueo(@Param("id") Long id);

    /**
     * Proximos partidos (pendientes o en juego) donde participa alguno de los equipos,
     * en torneos que aun estan en curso.
     */
    @Query("""
            SELECT p FROM Partido p
            WHERE p.estado IN :estados
              AND p.torneo.estado = 'EN_CURSO'
              AND (p.equipo1.id IN :equipoIds OR p.equipo2.id IN :equipoIds)
            ORDER BY p.ronda ASC, p.numeroPartido ASC
            """)
    List<Partido> findProximosPorEquipos(@Param("equipoIds") Collection<Long> equipoIds,
                                         @Param("estados") Collection<EstadoPartido> estados);
}
