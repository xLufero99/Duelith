package com.duelith.domain.repository;

import com.duelith.domain.model.Donacion;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

/** Puerto de persistencia para donaciones. */
public interface DonacionRepositoryPort {

    Donacion guardar(Donacion donacion);

    Optional<Donacion> buscarPorId(Long id);

    Optional<Donacion> buscarPorReferencia(String referencia);

    Optional<Donacion> buscarPorTransactionId(String transactionId);

    List<Donacion> buscarPorDonanteId(Long donanteId);

    /** Donaciones PENDING pendientes de vencimiento, para marcarlas EXPIRED. */
    List<Donacion> buscarPendientesAntesDe(OffsetDateTime limite);
}
