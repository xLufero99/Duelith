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

    /** ADMIN o el ORGANIZADOR creador. Reemplazo completo de los datos editables. */
    TorneoResponse actualizar(Long usuarioId, Long torneoId, CrearTorneoRequest request);

    /** ADMIN o el ORGANIZADOR creador. Solo si no hay inscripciones ni partidos. */
    void eliminar(Long usuarioId, Long torneoId);

    List<TorneoResponse> listar(com.duelith.domain.model.EstadoTorneo estado, String juego);

    TorneoDetalleResponse obtenerDetalle(Long torneoId);

    /** Torneos creados por un organizador (para GET /mis-torneos). */
    List<TorneoResponse> listarPorCreador(Long creadorId);

    /** Usado por @IsCreator: true si el torneo fue creado por ese username. */
    boolean esCreador(Long torneoId, String username);

    void inscribirEquipo(Long usuarioId, Long torneoId, InscribirEquipoRequest request);

    void cerrarInscripciones(Long adminId, Long torneoId);

    BracketResponse generarBracket(Long adminId, Long torneoId);

    BracketResponse obtenerBracket(Long torneoId);
}
