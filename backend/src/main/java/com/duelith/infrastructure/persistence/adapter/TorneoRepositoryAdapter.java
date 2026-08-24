package com.duelith.infrastructure.persistence.adapter;

import com.duelith.domain.model.EstadoTorneo;
import com.duelith.domain.model.Torneo;
import com.duelith.domain.repository.TorneoRepositoryPort;
import com.duelith.infrastructure.persistence.repository.TorneoJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class TorneoRepositoryAdapter implements TorneoRepositoryPort {

    private final TorneoJpaRepository jpa;

    @Override
    public Torneo guardar(Torneo torneo) {
        return jpa.save(torneo);
    }

    @Override
    public Optional<Torneo> buscarPorId(Long id) {
        return jpa.findById(id);
    }

    @Override
    public Optional<Torneo> buscarPorIdConBloqueo(Long id) {
        return jpa.findByIdConBloqueo(id);
    }

    @Override
    public List<Torneo> listarConFiltros(EstadoTorneo estado, String juego) {
        if (estado != null && StringUtils.hasText(juego)) {
            return jpa.findByEstadoAndJuegoIgnoreCase(estado, juego.trim());
        }
        if (estado != null) {
            return jpa.findByEstado(estado);
        }
        if (StringUtils.hasText(juego)) {
            return jpa.findByJuegoIgnoreCase(juego.trim());
        }
        return jpa.findAll();
    }
}
