package com.duelith.domain.service;

import com.duelith.application.dto.request.CrearTorneoRequest;
import com.duelith.application.dto.request.InscribirEquipoRequest;
import com.duelith.application.dto.response.BracketResponse;
import com.duelith.application.dto.response.TorneoDetalleResponse;
import com.duelith.application.dto.response.TorneoResponse;

import java.util.List;

/**
 * Puerto del dominio para la gestion de torneos y brackets.
 */
public interface TorneoServicePort {

    TorneoResponse crear(Long adminId, CrearTorneoRequest request);

    List<TorneoResponse> listar(com.duelith.domain.model.EstadoTorneo estado, String juego);

    TorneoDetalleResponse obtenerDetalle(Long torneoId);

    void inscribirEquipo(Long usuarioId, Long torneoId, InscribirEquipoRequest request);

    void cerrarInscripciones(Long adminId, Long torneoId);

    BracketResponse generarBracket(Long adminId, Long torneoId);

    BracketResponse obtenerBracket(Long torneoId);
}
