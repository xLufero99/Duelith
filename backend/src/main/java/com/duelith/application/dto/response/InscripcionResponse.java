package com.duelith.application.dto.response;

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
public class InscripcionResponse {

    private Long id;
    private Long torneoId;
    private EquipoBasicoResponse equipo;
    private OffsetDateTime fechaInscripcion;
    private Boolean confirmado;
}
