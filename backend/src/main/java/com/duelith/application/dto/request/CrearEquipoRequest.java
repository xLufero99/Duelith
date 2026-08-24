package com.duelith.application.dto.request;

import jakarta.validation.constraints.NotBlank;
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
public class CrearEquipoRequest {

    @NotBlank(message = "El nombre del equipo es obligatorio")
    @Size(min = 3, max = 60, message = "El nombre del equipo debe tener entre 3 y 60 caracteres")
    private String nombre;

    @NotBlank(message = "El juego principal es obligatorio")
    @Size(max = 60, message = "El juego principal no puede superar los 60 caracteres")
    private String juegoPrincipal;
}
