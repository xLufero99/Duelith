package com.duelith.application.dto.response;

import com.duelith.domain.model.EstadoTorneo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * Detalle de un torneo: datos generales + equipos inscritos.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TorneoDetalleResponse {

    private Long id;
    private String nombre;
    private String juego;
    private String descripcion;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private Integer limiteEquipos;
    private EstadoTorneo estado;
    private String premio;
    private Long creadoPorId;
    private String creadoPorNombre;
    private long equiposInscritos;
    private OffsetDateTime creadoEn;
    private List<EquipoBasicoResponse> equiposInscritosDetalle;
}
