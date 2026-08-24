package com.duelith.domain.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.Arrays;

/**
 * Convierte el enum RolUsuario al formato en minusculas usado en la columna
 * usuarios.rol ('jugador', 'admin') y viceversa.
 */
@Converter(autoApply = true)
public class RolUsuarioConverter implements AttributeConverter<RolUsuario, String> {

    @Override
    public String convertToDatabaseColumn(RolUsuario atributo) {
        return atributo == null ? null : atributo.name().toLowerCase();
    }

    @Override
    public RolUsuario convertToEntityAttribute(String valorDb) {
        if (valorDb == null) {
            return null;
        }
        return Arrays.stream(RolUsuario.values())
                .filter(r -> r.name().equalsIgnoreCase(valorDb))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Rol de usuario desconocido en BD: " + valorDb));
    }
}
