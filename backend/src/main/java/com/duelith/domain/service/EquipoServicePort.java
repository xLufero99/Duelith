package com.duelith.domain.service;

import com.duelith.application.dto.request.CambiarRolMiembroRequest;
import com.duelith.application.dto.request.CrearEquipoRequest;
import com.duelith.application.dto.response.EquipoResponse;

/**
 * Puerto del dominio para la gestion de equipos.
 */
public interface EquipoServicePort {

    EquipoResponse crear(Long usuarioId, CrearEquipoRequest request);

    EquipoResponse obtenerPorId(Long equipoId);

    java.util.List<EquipoResponse> misEquipos(Long usuarioId);

    void solicitarUnirse(Long usuarioId, Long equipoId);

    /** El capitan acepta la solicitud (SUPLENTE -> rol indicado, por defecto JUGADOR). */
    EquipoResponse aceptarMiembro(Long capitanId, Long equipoId, Long usuarioId, CambiarRolMiembroRequest request);

    void expulsarMiembro(Long capitanId, Long equipoId, Long usuarioId);

    EquipoResponse transferirCapitania(Long capitanActualId, Long equipoId, Long nuevoCapitanId);

    void abandonar(Long usuarioId, Long equipoId);
}
