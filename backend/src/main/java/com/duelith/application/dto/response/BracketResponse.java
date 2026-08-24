package com.duelith.application.dto.response;

import com.duelith.domain.model.EstadoTorneo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/** Bracket completo de eliminacion directa agrupado por rondas. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BracketResponse {

    private Long torneoId;
    private String nombreTorneo;
    private EstadoTorneo estadoTorneo;
    private Integer totalRondas;
    private List<RondaResponse> rondas;
}
