package com.duelith.infrastructure.persistence.adapter;

import com.duelith.domain.model.EstadoPartido;
import com.duelith.domain.model.Partido;
import com.duelith.domain.repository.PartidoRepositoryPort;
import com.duelith.infrastructure.persistence.repository.PartidoJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class PartidoRepositoryAdapter implements PartidoRepositoryPort {

    private final PartidoJpaRepository jpa;

    @Override
    public List<Partido> guardarTodos(List<Partido> partidos) {
        return jpa.saveAll(partidos);
    }

    @Override
    public Partido guardar(Partido partido) {
        return jpa.save(partido);
    }

    @Override
    public Optional<Partido> buscarPorId(Long id) {
        return jpa.findById(id);
    }

    @Override
    public Optional<Partido> buscarPorIdConBloqueo(Long id) {
        // SELECT ... FOR UPDATE: serializa reportes concurrentes del mismo partido.
        return jpa.findByIdConBloqueo(id);
    }

    @Override
    public List<Partido> buscarPorTorneoId(Long torneoId) {
        return jpa.findByTorneoIdOrderByRondaAscNumeroPartidoAsc(torneoId);
    }

    @Override
    public List<Partido> buscarProximosPorEquipos(List<Long> equipoIds, List<EstadoPartido> estados) {
        if (equipoIds == null || equipoIds.isEmpty()) {
            return List.of();
        }
        return jpa.findProximosPorEquipos(equipoIds, estados);
    }
}
