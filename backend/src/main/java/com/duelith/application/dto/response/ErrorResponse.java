package com.duelith.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.Map;

/** Formato uniforme de errores de la API. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorResponse {

    private OffsetDateTime timestamp;
    private int status;
    private String error;
    private String mensaje;
    /** Errores de validacion campo -> mensaje (puede ser null). */
    private Map<String, String> errores;
    private String path;
}
