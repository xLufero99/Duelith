package com.duelith.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Respuesta de registro/login: token JWT + datos del usuario.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;
    @Builder.Default
    private String tokenType = "Bearer";
    /** Segundos de validez del token. */
    private long expiresIn;
    private UsuarioResponse usuario;
}
