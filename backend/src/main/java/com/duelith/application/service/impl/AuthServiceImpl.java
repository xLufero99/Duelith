package com.duelith.application.service.impl;

import com.duelith.application.dto.request.ActualizarPerfilRequest;
import com.duelith.application.dto.request.LoginRequest;
import com.duelith.application.dto.request.RegistroRequest;
import com.duelith.application.dto.response.AuthResponse;
import com.duelith.application.dto.response.UsuarioResponse;
import com.duelith.application.exceptions.ConflictoException;
import com.duelith.application.exceptions.CredencialesInvalidasException;
import com.duelith.application.exceptions.RecursoNoEncontradoException;
import com.duelith.application.exceptions.ReglaNegocioException;
import com.duelith.application.mapper.UsuarioMapper;
import com.duelith.domain.model.RolUsuario;
import com.duelith.domain.model.Usuario;
import com.duelith.domain.repository.UsuarioRepositoryPort;
import com.duelith.domain.service.AuthServicePort;
import com.duelith.security.UserPrincipal;
import com.duelith.security.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

/**
 * Registro, login y perfil. Las contrasenas se guardan con BCrypt.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthServicePort {

    private final UsuarioRepositoryPort usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UsuarioMapper usuarioMapper;

    @Override
    @Transactional
    public AuthResponse registrar(RegistroRequest request) {
        // Unicidad de username y email (case-insensitive)
        if (usuarioRepository.existePorNombreUsuario(request.getNombreUsuario())) {
            throw new ConflictoException("El nombre de usuario ya esta en uso");
        }
        if (usuarioRepository.existePorEmail(request.getEmail())) {
            throw new ConflictoException("El email ya esta registrado");
        }

        Usuario nuevo = Usuario.builder()
                .nombreUsuario(request.getNombreUsuario())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .rol(RolUsuario.JUGADOR)
                .gamertag(request.getGamertag())
                .creadoEn(OffsetDateTime.now())
                .activo(true)
                .build();
        Usuario guardado = usuarioRepository.guardar(nuevo);
        log.info("Usuario registrado: {} (id={})", guardado.getNombreUsuario(), guardado.getId());

        // Auto-login tras el registro
        UserPrincipal principal = UserPrincipal.desdeUsuario(guardado);
        Authentication auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        return construirAuthResponse(auth, guardado);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        try {
            // CustomUserDetailsService resuelve el identificador como username o email.
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getIdentificador(), request.getPassword()));
            UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
            Usuario usuario = usuarioRepository.buscarPorId(principal.getId())
                    .orElseThrow(() -> RecursoNoEncontradoException.de("Usuario", principal.getId()));
            log.info("Login exitoso: {}", principal.getUsername());
            return construirAuthResponse(auth, usuario);
        } catch (BadCredentialsException | DisabledException e) {
            throw new CredencialesInvalidasException("Credenciales invalidas o cuenta inactiva");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponse obtenerPerfil(Long usuarioId) {
        Usuario usuario = usuarioRepository.buscarPorId(usuarioId)
                .orElseThrow(() -> RecursoNoEncontradoException.de("Usuario", usuarioId));
        return usuarioMapper.toResponse(usuario);
    }

    @Override
    @Transactional
    public UsuarioResponse actualizarPerfil(Long usuarioId, ActualizarPerfilRequest request) {
        Usuario usuario = usuarioRepository.buscarPorId(usuarioId)
                .orElseThrow(() -> RecursoNoEncontradoException.de("Usuario", usuarioId));

        if (request.getNombreUsuario() != null
                && !request.getNombreUsuario().equalsIgnoreCase(usuario.getNombreUsuario())) {
            if (usuarioRepository.existePorNombreUsuario(request.getNombreUsuario())) {
                throw new ConflictoException("El nombre de usuario ya esta en uso");
            }
            usuario.setNombreUsuario(request.getNombreUsuario());
        }
        if (request.getEmail() != null && !request.getEmail().equalsIgnoreCase(usuario.getEmail())) {
            if (usuarioRepository.existePorEmail(request.getEmail())) {
                throw new ConflictoException("El email ya esta registrado");
            }
            usuario.setEmail(request.getEmail());
        }
        if (request.getGamertag() != null) {
            usuario.setGamertag(request.getGamertag());
        }

        return usuarioMapper.toResponse(usuarioRepository.guardar(usuario));
    }

    @Override
    @Transactional
    public UsuarioResponse convertirOrganizador(Long usuarioId) {
        Usuario usuario = usuarioRepository.buscarPorId(usuarioId)
                .orElseThrow(() -> RecursoNoEncontradoException.de("Usuario", usuarioId));

        if (usuario.getRol() == RolUsuario.ORGANIZADOR) {
            throw new ReglaNegocioException("Ya eres un organizador");
        }
        // No se degrada a un ADMIN: ya puede gestionar torneos.
        if (usuario.getRol() == RolUsuario.ADMIN) {
            throw new ReglaNegocioException("Los administradores ya pueden gestionar torneos");
        }

        usuario.setRol(RolUsuario.ORGANIZADOR);
        Usuario actualizado = usuarioRepository.guardar(usuario);
        log.info("Usuario promovido a ORGANIZADOR: {} (id={})", actualizado.getNombreUsuario(), actualizado.getId());
        return usuarioMapper.toResponse(actualizado);
    }

    private AuthResponse construirAuthResponse(Authentication auth, Usuario usuario) {
        String token = jwtTokenProvider.generarToken(auth);
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getExpiracionSegundos())
                .usuario(usuarioMapper.toResponse(usuario))
                .build();
    }
}
