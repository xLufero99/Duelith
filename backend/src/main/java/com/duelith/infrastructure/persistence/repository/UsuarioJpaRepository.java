package com.duelith.infrastructure.persistence.repository;

import com.duelith.domain.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioJpaRepository extends JpaRepository<Usuario, Long> {

    /** Login con email o nombre de usuario, sin distinguir mayusculas. */
    Optional<Usuario> findByNombreUsuarioIgnoreCaseOrEmailIgnoreCase(String nombreUsuario, String email);

    boolean existsByNombreUsuarioIgnoreCase(String nombreUsuario);

    boolean existsByEmailIgnoreCase(String email);
}
