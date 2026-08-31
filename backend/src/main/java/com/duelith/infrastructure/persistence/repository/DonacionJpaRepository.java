package com.duelith.infrastructure.persistence.repository;

import com.duelith.domain.model.Donacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface DonacionJpaRepository extends JpaRepository<Donacion, Long> {

    Optional<Donacion> findByReference(String reference);

    Optional<Donacion> findByTransactionId(String transactionId);

    List<Donacion> findByDonanteId(Long donanteId);

    List<Donacion> findByStatusAndCreadoEnBefore(String status, OffsetDateTime limite);
}
