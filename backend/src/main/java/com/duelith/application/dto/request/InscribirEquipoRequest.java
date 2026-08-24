package com.duelith.application.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Inscripcion de un equipo en un torneo. Solo el capitan puede inscribir.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InscribirEquipoRequest {

    @NotNull(message = "Debes indicar el id del equipo a inscribir")
    private Long equipoId;
}
