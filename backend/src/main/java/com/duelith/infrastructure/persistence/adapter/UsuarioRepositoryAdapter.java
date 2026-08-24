package com.duelith.infrastructure.persistence.adapter;

import com.duelith.domain.model.Usuario;
import com.duelith.domain.repository.UsuarioRepositoryPort;
import com.duelith.infrastructure.persistence.repository.UsuarioJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class UsuarioRepositoryAdapter implements UsuarioRepositoryPort {

    private final UsuarioJpaRepository jpa;

    @Override
    public Usuario guardar(Usuario usuario) {
        return jpa.save(usuario);
    }

    @Override
    public Optional<Usuario> buscarPorId(Long id) {
        return jpa.findById(id);
    }

    @Override
    public Optional<Usuario> buscarPorNombreUsuarioOEmail(String identificador) {
        return jpa.findByNombreUsuarioIgnoreCaseOrEmailIgnoreCase(identificador, identificador);
    }

    @Override
    public boolean existePorNombreUsuario(String nombreUsuario) {
        return jpa.existsByNombreUsuarioIgnoreCase(nombreUsuario);
    }

    @Override
    public boolean existePorEmail(String email) {
        return jpa.existsByEmailIgnoreCase(email);
    }
}
