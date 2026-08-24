package com.duelith.application.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Reporte de resultado por parte de un capitan.
 *
 * ganadorId: id del equipo ganador (debe participar en el partido).
 * marcador: texto libre, ej "2-1".
 * walkover: true si el rival no se presento (estado WALKOVER en vez de FINALIZADO).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportarResultadoRequest {

    @NotNull(message = "Debes indicar el id del equipo ganador")
    private Long ganadorId;

    @Size(max = 30, message = "El marcador no puede superar los 30 caracteres")
    private String marcador;

    @Builder.Default
    private Boolean walkover = Boolean.FALSE;
}
