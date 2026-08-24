package com.duelith.application.dto.response;

import com.duelith.domain.model.EstadoPartido;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartidoResponse {

    private Long id;
    private Long torneoId;
    private Integer ronda;
    private Integer numeroPartido;
    private EquipoBasicoResponse equipo1;
    private EquipoBasicoResponse equipo2;
    private EquipoBasicoResponse ganador;
    /** Id del siguiente partido del bracket (avance automatico). */
    private Long siguientePartidoId;
    private EstadoPartido estado;
    private OffsetDateTime fechaHora;
    private String marcador;
    private String reportadoPorNombre;
}
