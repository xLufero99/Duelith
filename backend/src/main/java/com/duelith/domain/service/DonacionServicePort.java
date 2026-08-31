package com.duelith.domain.service;

import com.duelith.application.dto.request.CrearDonacionRequest;
import com.duelith.application.dto.response.DonacionResponse;
import com.duelith.application.dto.response.DonacionResultadoResponse;

import java.util.List;

/** Puerto del dominio para la gestion de donaciones via Wompi. */
public interface DonacionServicePort {

    /**
     * Crea una donacion: valida el monto, genera referencia unica, crea la
     * transaccion en Wompi y devuelve la URL del widget.
     */
    DonacionResultadoResponse crear(Long usuarioId, CrearDonacionRequest request);

    DonacionResponse obtenerPorReferencia(String referencia);

    List<DonacionResponse> misDonaciones(Long usuarioId);

    /**
     * Procesa un webhook de Wompi ya verificado. Devuelve true si la donacion
     * fue actualizada y false si el evento era duplicado/ignorado por idempotencia.
     */
    boolean procesarWebhook(String body);
}
