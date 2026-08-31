package com.duelith.infrastructure.persistence.adapter;

import com.duelith.domain.model.Donacion;
import com.duelith.domain.model.EstadoDonacion;
import com.duelith.domain.repository.DonacionRepositoryPort;
import com.duelith.infrastructure.persistence.repository.DonacionJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class DonacionRepositoryAdapter implements DonacionRepositoryPort {

    private final DonacionJpaRepository jpa;

    @Override
    public Donacion guardar(Donacion donacion) {
        return jpa.save(donacion);
    }

    @Override
    public Optional<Donacion> buscarPorId(Long id) {
        return jpa.findById(id);
    }

    @Override
    public Optional<Donacion> buscarPorReferencia(String referencia) {
        return jpa.findByReference(referencia);
    }

    @Override
    public Optional<Donacion> buscarPorTransactionId(String transactionId) {
        return jpa.findByTransactionId(transactionId);
    }

    @Override
    public List<Donacion> buscarPorDonanteId(Long donanteId) {
        return jpa.findByDonanteId(donanteId);
    }

    @Override
    public List<Donacion> buscarPendientesAntesDe(OffsetDateTime limite) {
        return jpa.findByStatusAndCreadoEnBefore(EstadoDonacion.PENDING.name(), limite);
    }
}
