package com.duelith.application.dto.request;

import com.duelith.domain.model.MetodoPagoDonacion;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Datos del frontend para crear una donacion.
 * El backend vuelve a validar TODO (monto, email, ids de Wompi): nunca
 * se confia en la validacion del cliente.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrearDonacionRequest {

    /** Monto en pesos COP (EL BACKEND valida rango min/max). */
    @NotNull(message = "El monto es obligatorio")
    @Min(value = 1, message = "El monto debe ser mayor a cero")
    private Long amount;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "Formato de email invalido")
    private String email;

    /** Nombre completo del donante (Wompi lo exige en customer_data.full_name). */
    @NotBlank(message = "El nombre completo es obligatorio")
    @Size(min = 2, max = 120, message = "El nombre completo debe tener entre 2 y 120 caracteres")
    private String fullName;

    @NotNull(message = "El metodo de pago es obligatorio")
    private MetodoPagoDonacion paymentMethod;

    @NotBlank(message = "El sessionId de Wompi es obligatorio")
    private String sessionId;

    @NotBlank(message = "El deviceId de Wompi es obligatorio")
    private String deviceId;
}
