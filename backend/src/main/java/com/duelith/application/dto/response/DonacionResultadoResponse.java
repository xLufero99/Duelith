package com.duelith.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Respuesta tras crear una donacion: el frontend redirige al usuario
 * a redirectUrl (widget de Wompi) para completar el pago.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DonacionResultadoResponse {

    private boolean success;
    private String redirectUrl;
    private String reference;
    private String message;
}
