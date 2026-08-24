package com.duelith.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

/** Datos basicos de un equipo (para anidar en otras respuestas). */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EquipoBasicoResponse {

    private Long id;
    private String nombre;
    private String juegoPrincipal;
    private String capitanNombre;
    private OffsetDateTime creadoEn;
}
