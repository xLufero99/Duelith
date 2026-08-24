package com.duelith.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Login con email o nombre de usuario en un solo campo.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequest {

    @NotBlank(message = "Debes indicar tu email o nombre de usuario")
    private String identificador;

    @NotBlank(message = "La contrasena es obligatoria")
    private String password;
}
