package com.duelith.security.service;

import com.duelith.domain.model.Usuario;
import com.duelith.domain.repository.UsuarioRepositoryPort;
import com.duelith.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Carga usuarios por nombre de usuario o email (el campo identificador
 * del login se resuelve aqui).
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepositoryPort usuarioRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String identificador) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.buscarPorNombreUsuarioOEmail(identificador)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Usuario no encontrado: " + identificador));
        return UserPrincipal.desdeUsuario(usuario);
    }
}
