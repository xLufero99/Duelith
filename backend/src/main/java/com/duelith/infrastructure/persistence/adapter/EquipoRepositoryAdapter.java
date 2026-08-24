package com.duelith.infrastructure.persistence.adapter;

import com.duelith.domain.model.Equipo;
import com.duelith.domain.repository.EquipoRepositoryPort;
import com.duelith.infrastructure.persistence.repository.EquipoJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class EquipoRepositoryAdapter implements EquipoRepositoryPort {

    private final EquipoJpaRepository jpa;

    @Override
    public Equipo guardar(Equipo equipo) {
        return jpa.save(equipo);
    }

    @Override
    public Optional<Equipo> buscarPorId(Long id) {
        return jpa.findById(id);
    }

    @Override
    public List<Equipo> buscarPorCapitanId(Long capitanId) {
        return jpa.findByCapitanId(capitanId);
    }

    @Override
    public boolean existeNombre(String nombre) {
        return jpa.existsByNombreIgnoreCase(nombre);
    }
}
