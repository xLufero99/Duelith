package com.duelith.application.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistroRequest {

    @NotBlank(message = "El nombre de usuario es obligatorio")
    @Size(min = 3, max = 50, message = "El nombre de usuario debe tener entre 3 y 50 caracteres")
    @Pattern(regexp = "^[a-zA-Z0-9_.-]+$", message = "El nombre de usuario solo puede contener letras, numeros, puntos, guiones y guion bajo")
    private String nombreUsuario;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email no tiene un formato valido")
    @Size(max = 120, message = "El email no puede superar los 120 caracteres")
    private String email;

    @NotBlank(message = "La contrasena es obligatoria")
    @Size(min = 8, max = 72, message = "La contrasena debe tener entre 8 y 72 caracteres")
    private String password;

    @Size(max = 50, message = "El gamertag no puede superar los 50 caracteres")
    private String gamertag;
}
