package com.duelith.domain.service;

import com.duelith.application.dto.request.ReportarResultadoRequest;
import com.duelith.application.dto.response.PartidoResponse;

import java.util.List;

/**
 * Puerto del dominio para partidos del bracket.
 */
public interface PartidoServicePort {

    List<PartidoResponse> misPartidos(Long usuarioId);

    PartidoResponse reportarResultado(Long usuarioId, Long partidoId, ReportarResultadoRequest request);

    List<PartidoResponse> listarPorTorneo(Long torneoId);
}
