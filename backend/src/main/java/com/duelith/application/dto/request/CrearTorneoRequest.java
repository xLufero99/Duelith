package com.duelith.application.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrearTorneoRequest {

    @NotBlank(message = "El nombre del torneo es obligatorio")
    @Size(min = 3, max = 100, message = "El nombre debe tener entre 3 y 100 caracteres")
    private String nombre;

    @NotBlank(message = "El juego es obligatorio")
    @Size(max = 60, message = "El juego no puede superar los 60 caracteres")
    private String juego;

    @Size(max = 2000, message = "La descripcion no puede superar los 2000 caracteres")
    private String descripcion;

    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDate fechaInicio;

    @NotNull(message = "La fecha de fin es obligatoria")
    private LocalDate fechaFin;

    /** Potencia de 2 recomendada (4, 8, 16, 32...) para un bracket limpio. */
    @NotNull(message = "El limite de equipos es obligatorio")
    @Min(value = 2, message = "El torneo necesita al menos 2 equipos")
    @Max(value = 64, message = "El limite maximo es 64 equipos")
    private Integer limiteEquipos;

    @Size(max = 255, message = "El premio no puede superar los 255 caracteres")
    private String premio;
}
