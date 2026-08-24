package com.duelith.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioResponse {

    private Long id;
    private String nombreUsuario;
    private String email;
    private String gamertag;
    private String rol;
    private OffsetDateTime creadoEn;
    private Boolean activo;
}
