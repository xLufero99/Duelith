package com.duelith.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.List;

/** Detalle de un equipo con su capitan y lista de miembros. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EquipoResponse {

    private Long id;
    private String nombre;
    private String juegoPrincipal;
    private Long capitanId;
    private String capitanNombre;
    private OffsetDateTime creadoEn;
    private Boolean activo;
    /** Miembros confirmados (rol distinto a SUPLENTE). */
    private List<MiembroResponse> miembros;
    /** Solicitudes pendientes (rol SUPLENTE), visibles para el capitan. */
    private List<MiembroResponse> solicitudesPendientes;
}
