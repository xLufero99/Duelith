package com.duelith.domain.repository;

import com.duelith.domain.model.Usuario;

import java.util.List;
import java.util.Optional;

/**
 * Puerto de persistencia para usuarios.
 */
public interface UsuarioRepositoryPort {

    Usuario guardar(Usuario usuario);

    Optional<Usuario> buscarPorId(Long id);

    /** Login: busca por nombre de usuario O email (sin distinguir mayusculas). */
    Optional<Usuario> buscarPorNombreUsuarioOEmail(String identificador);

    boolean existePorNombreUsuario(String nombreUsuario);

    boolean existePorEmail(String email);
}
