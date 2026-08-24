package com.duelith.application.dto.request;

import com.duelith.domain.model.RolEquipo;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Cuerpo opcional al aceptar un miembro. Si no llega, se asigna JUGADOR.
 * No se permite asignar CAPITAN por esta via: usar transferencia de capitania.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CambiarRolMiembroRequest {

    @NotNull(message = "Debes indicar el nuevo rol del miembro")
    private RolEquipo rol;
}
