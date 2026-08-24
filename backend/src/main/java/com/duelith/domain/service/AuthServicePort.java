package com.duelith.domain.service;

import com.duelith.application.dto.request.ActualizarPerfilRequest;
import com.duelith.application.dto.request.LoginRequest;
import com.duelith.application.dto.request.RegistroRequest;
import com.duelith.application.dto.response.AuthResponse;
import com.duelith.application.dto.response.UsuarioResponse;

/**
 * Puerto del dominio para autenticacion y perfil de usuario.
 */
public interface AuthServicePort {

    AuthResponse registrar(RegistroRequest request);

    AuthResponse login(LoginRequest request);

    UsuarioResponse obtenerPerfil(Long usuarioId);

    UsuarioResponse actualizarPerfil(Long usuarioId, ActualizarPerfilRequest request);

    /** Promueve al usuario autenticado al rol ORGANIZADOR. */
    UsuarioResponse convertirOrganizador(Long usuarioId);
}
