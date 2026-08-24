package com.duelith.application.dto.response;

import com.duelith.domain.model.RolEquipo;
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
public class MiembroResponse {

    private Long usuarioId;
    private String nombreUsuario;
    private String gamertag;
    private RolEquipo rol;
    private OffsetDateTime fechaIngreso;
}
