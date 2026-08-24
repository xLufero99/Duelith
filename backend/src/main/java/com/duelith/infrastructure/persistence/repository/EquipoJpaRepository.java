package com.duelith.infrastructure.persistence.repository;

import com.duelith.domain.model.Equipo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EquipoJpaRepository extends JpaRepository<Equipo, Long> {

    Optional<Equipo> findById(Long id);

    List<Equipo> findByCapitanId(Long capitanId);

    boolean existsByNombreIgnoreCase(String nombre);
}
