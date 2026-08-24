package com.duelith.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/** Todos los partidos de una misma ronda. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RondaResponse {

    private Integer numeroRonda;
    private List<PartidoResponse> partidos;
}
